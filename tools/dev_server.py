#!/usr/bin/env python3
"""سرور محلی برای تست سایت و پنل ادمین (بدون نیاز به PHP).

اجرا (از داخل پوشهٔ site):
    python tools/dev_server.py

بعد در مرورگر:
    http://localhost:8000/          ← سایت
    http://localhost:8000/admin/    ← پنل ادمین (رمز پیش‌فرض: admin12345)

این فقط برای تست روی کامپیوتر خودتان است. روی هاست واقعی، admin/api.php (PHP) همین کار را می‌کند و این فایل لازم نیست.
تغییراتی که در پنل ذخیره کنید واقعاً در data/*.json نوشته می‌شود.
"""
import argparse, json, os, re, secrets, shutil, sys, time, threading, glob
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ap = argparse.ArgumentParser()
ap.add_argument('--port', type=int, default=8000)
ap.add_argument('--root', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap.add_argument('--password', default=os.environ.get('ISB_ADMIN_PASSWORD', 'admin12345'))
ARGS = ap.parse_args()
ROOT = os.path.abspath(ARGS.root)
DATA = os.path.join(ROOT, 'data'); BACKUP = os.path.join(DATA, '_backup')
MAX_JSON, MAX_IMG, KEEP = 2 * 1024 * 1024, 8 * 1024 * 1024, 20
SESSIONS = {}          # توکن نشست ← {'csrf': ...}
ATTEMPTS = {}          # آی‌پی ← زمان تلاش‌های ناموفق
LOCK = threading.Lock()


def allowed_files():
    s = json.load(open(os.path.join(ROOT, 'admin', 'schemas.json'), encoding='utf-8'))
    return {'images'} | {c['file'] for c in s['collections']}


def make_backup(f):
    src = os.path.join(DATA, f + '.json')
    if not os.path.isfile(src): return
    os.makedirs(BACKUP, exist_ok=True)
    t = time.time()
    while True:   # هرگز نسخهٔ قبلی را بازنویسی نمی‌کند
        dst = os.path.join(BACKUP, f'{f}-{time.strftime("%Y%m%d-%H%M%S", time.localtime(t))}.json'); t += 1
        if not os.path.exists(dst): break
    shutil.copy(src, dst)
    for old in sorted(glob.glob(os.path.join(BACKUP, f + '-*.json')), reverse=True)[KEEP:]:
        os.remove(old)


def write_atomic(path, text):
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8', newline='\n') as fh: fh.write(text)
    os.replace(tmp, path)


def parse_multipart(ctype, raw):
    m = re.search(r'boundary=([^;]+)', ctype)
    if not m: return {}
    b = ('--' + m.group(1).strip('"')).encode()
    out = {}
    for part in raw.split(b)[1:-1]:
        head, _, content = part.lstrip(b'\r\n').partition(b'\r\n\r\n')
        content = content[:-2] if content.endswith(b'\r\n') else content
        nm = re.search(rb'name="([^"]+)"', head); fn = re.search(rb'filename="([^"]*)"', head)
        if nm: out[nm.group(1).decode()] = (fn.group(1).decode() if fn else None, content)
    return out


def sniff(buf):
    if buf[:3] == b'\xff\xd8\xff': return 'jpg'
    if buf[:8] == b'\x89PNG\r\n\x1a\n': return 'png'
    if buf[:4] == b'RIFF' and buf[8:12] == b'WEBP': return 'webp'
    return None


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def log_message(self, *a): pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()

    def j(self, d, code=200):
        b = json.dumps(d, ensure_ascii=False).encode()
        self.send_response(code); self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

    def fail(self, m, code=400): self.j({'ok': False, 'error': m}, code)

    def sess(self):
        c = self.headers.get('Cookie', ''); m = re.search(r'isb_admin=([a-f0-9]+)', c)
        return SESSIONS.get(m.group(1)) if m else None

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == '/admin/api.php': return self.api(u, 'GET')
        if u.path.startswith(('/data/_backup', '/admin/_state')) or u.path.endswith('/admin/config.php'):
            return self.send_error(403)
        if u.path == '/admin/setup.php':
            return self.j({'ok': False, 'error': 'در سرور محلی نیازی به setup.php نیست؛ رمز پیش‌فرض ' + ARGS.password})
        return super().do_GET()

    def do_POST(self):
        u = urlparse(self.path)
        if u.path == '/admin/api.php': return self.api(u, 'POST')
        self.send_error(404)

    def api(self, u, method):
        q = parse_qs(u.query); a = (q.get('action') or [''])[0]
        raw = b''
        if method == 'POST':
            n = int(self.headers.get('Content-Length') or 0); raw = self.rfile.read(n) if n else b''
        ctype = self.headers.get('Content-Type', '')
        body = {}
        if raw and 'json' in ctype:
            try: body = json.loads(raw)
            except Exception: body = {}
        s = self.sess()
        if a == 'status':
            return self.j({'ok': True, 'configured': True, 'loggedIn': bool(s), 'csrf': s['csrf'] if s else None})
        if a == 'login':
            if method != 'POST': return self.fail('روش درخواست نادرست است', 405)
            ip = self.client_address[0]; now = time.time()
            rec = [t for t in ATTEMPTS.get(ip, []) if t > now - 900]
            if len(rec) >= 5: return self.fail('تعداد تلاش‌های ناموفق زیاد بود؛ ۱۵ دقیقه بعد دوباره امتحان کنید', 429)
            if body.get('password') and secrets.compare_digest(str(body['password']), ARGS.password):
                ATTEMPTS.pop(ip, None); tok = secrets.token_hex(16); csrf = secrets.token_hex(16)
                SESSIONS[tok] = {'csrf': csrf}
                b = json.dumps({'ok': True, 'csrf': csrf}).encode()
                self.send_response(200); self.send_header('Content-Type', 'application/json')
                self.send_header('Set-Cookie', f'isb_admin={tok}; Path=/; HttpOnly; SameSite=Strict')
                self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b); return
            rec.append(now); ATTEMPTS[ip] = rec; time.sleep(.4)
            return self.fail('رمز نادرست است', 401)
        if a == 'logout':
            if s and self.headers.get('X-CSRF-Token') == s['csrf']:
                for k, v in list(SESSIONS.items()):
                    if v is s: del SESSIONS[k]
            return self.j({'ok': True})
        if not s: return self.fail('ابتدا وارد شوید', 401)
        def need_post():
            if method != 'POST': self.fail('روش درخواست نادرست است', 405); return False
            if self.headers.get('X-CSRF-Token') != s['csrf']: self.fail('نشست منقضی شده است؛ صفحه را رفرش کنید', 403); return False
            return True
        def chk(f):
            f = str(f or '')
            if not re.fullmatch(r'[a-z0-9_-]{1,40}', f) or f not in allowed_files(): self.fail('این فایل قابل ویرایش نیست', 403); return None
            return f
        if a == 'load':
            f = chk((q.get('file') or [''])[0])
            if not f: return
            p = os.path.join(DATA, f + '.json')
            return self.j({'ok': True, 'json': open(p, encoding='utf-8').read() if os.path.isfile(p) else '[]'})
        if a == 'save':
            if not need_post(): return
            f = chk(body.get('file'))
            if not f: return
            js = body.get('json')
            if not isinstance(js, str) or not js or len(js) > MAX_JSON: return self.fail('داده نامعتبر یا بسیار بزرگ است')
            try: d = json.loads(js)
            except Exception: return self.fail('ساختار JSON نامعتبر است')
            if not isinstance(d, (list, dict)): return self.fail('ساختار داده باید فهرست یا شیء باشد')
            with LOCK:
                make_backup(f); write_atomic(os.path.join(DATA, f + '.json'), js + '\n')
            return self.j({'ok': True})
        if a == 'backups':
            f = chk((q.get('file') or [''])[0])
            if not f: return
            L = sorted(glob.glob(os.path.join(BACKUP, f + '-*.json')), reverse=True)
            return self.j({'ok': True, 'backups': [{'name': os.path.basename(p), 'time': int(os.path.getmtime(p)), 'size': os.path.getsize(p)} for p in L]})
        if a == 'restore':
            if not need_post(): return
            f = chk(body.get('file'))
            if not f: return
            name = str(body.get('name') or '')
            if not re.fullmatch(re.escape(f) + r'-\d{8}-\d{6}\.json', name): return self.fail('نام نسخه نامعتبر است')
            src = os.path.join(BACKUP, name)
            if not os.path.isfile(src): return self.fail('این نسخه پیدا نشد', 404)
            content = open(src, encoding='utf-8').read()   # اول محتوا خوانده می‌شود، بعد پشتیبان تازه ساخته می‌شود
            with LOCK:
                make_backup(f); write_atomic(os.path.join(DATA, f + '.json'), content)
            return self.j({'ok': True})
        if a == 'upload':
            if not need_post(): return
            parts = parse_multipart(ctype, raw); im = parts.get('image')
            if not im or not im[1]: return self.fail('آپلود ناموفق بود')
            buf = im[1]
            if len(buf) > MAX_IMG: return self.fail('حجم عکس نباید بیشتر از ۸ مگابایت باشد')
            ext = sniff(buf)
            if not ext: return self.fail('فقط عکس JPG، PNG یا WEBP قابل قبول است')
            sub = time.strftime('%Y/%m'); d = os.path.join(ROOT, 'assets', 'images', 'uploads', *sub.split('/'))
            os.makedirs(d, exist_ok=True); name = secrets.token_hex(8) + '.' + ext
            open(os.path.join(d, name), 'wb').write(buf); rel = f'/uploads/{sub}/{name}'
            with LOCK:
                ip = os.path.join(DATA, 'images.json'); cur = json.load(open(ip, encoding='utf-8')) if os.path.isfile(ip) else []
                cur.append(rel); write_atomic(ip, json.dumps(cur, ensure_ascii=False, indent=2) + '\n')
            return self.j({'ok': True, 'path': rel})
        return self.fail('درخواست ناشناخته', 404)


if __name__ == '__main__':
    srv = ThreadingHTTPServer(('127.0.0.1', ARGS.port), H)
    print(f'سایت:  http://localhost:{ARGS.port}/\nادمین: http://localhost:{ARGS.port}/admin/   (رمز: {ARGS.password})\nبرای توقف: Ctrl+C')
    try: srv.serve_forever()
    except KeyboardInterrupt: pass
