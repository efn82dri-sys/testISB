#!/usr/bin/env python3
"""اعتبارسنج داده‌های سایت ISB.

اجرا (از داخل پوشهٔ site):
    python validate.py

اگر همه‌چیز درست باشد پیام OK می‌دهد و با کد 0 خارج می‌شود؛ در غیر این صورت فهرست خطاها را چاپ می‌کند و با کد 1 خارج می‌شود.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
errors, warnings = [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def load(name):
    path = os.path.join(ROOT, 'data', name)
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        err(f'{name}: فایل پیدا نشد')
    except json.JSONDecodeError as e:
        err(f'{name}: JSON خراب است (خط {e.lineno}، ستون {e.colno}): {e.msg}')
    return None


def walk(node, path=''):
    """همهٔ مقدارهای یک ساختار تو در تو را با مسیرشان برمی‌گرداند."""
    if isinstance(node, dict):
        for k, v in node.items():
            yield from walk(v, f'{path}.{k}' if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk(v, f'{path}[{i}]')
    else:
        yield path, node


def same_shape(a, b, path=''):
    """ساختار (کلیدها و طول فهرست‌ها) دو داده باید یکی باشد."""
    if type(a) != type(b):
        err(f'fa.json و en.json هم‌ساختار نیستند در {path or "ریشه"}')
        return
    if isinstance(a, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a:
                err(f'fa.json: کلید «{path}.{k}» وجود ندارد (در en.json هست)')
            elif k not in b:
                err(f'en.json: کلید «{path}.{k}» وجود ندارد (در fa.json هست)')
            else:
                same_shape(a[k], b[k], f'{path}.{k}' if path else k)
    elif isinstance(a, list):
        if len(a) != len(b):
            err(f'تعداد آیتم‌ها در «{path}» فرق می‌کند (fa={len(a)}، en={len(b)})')
        for i, (x, y) in enumerate(zip(a, b)):
            same_shape(x, y, f'{path}[{i}]')


def need_pair(obj, where):
    """یک جفت دوزبانه {"fa": ..., "en": ...} را بررسی می‌کند."""
    if not isinstance(obj, dict) or 'fa' not in obj or 'en' not in obj:
        err(f'{where}: باید {{"fa": ..., "en": ...}} باشد')
        return
    for lg in ('fa', 'en'):
        if obj[lg] in ('', None, []):
            err(f'{where}.{lg}: خالی است')


def image_exists(rel, where):
    if not rel:
        return
    p = os.path.join(ROOT, 'assets', 'images', rel.lstrip('/'))
    if not os.path.isfile(p):
        err(f'{where}: تصویر پیدا نشد → assets/images{rel}')


# ---------- بارگذاری ----------
fa = load('fa.json'); en = load('en.json')
projects = load('projects.json'); services = load('services.json'); team = load('team.json')
chapters = load('chapters.json'); town = load('town.json'); guide = load('guide.json'); images = load('images.json'); clips = load('clips.json'); creds = load('credentials.json'); sarv = load('sarv.json'); contact = load('contact.json'); schemas = None
try:
    schemas = json.load(open(os.path.join(ROOT, 'admin', 'schemas.json'), encoding='utf-8'))
except Exception as e:
    err(f'admin/schemas.json: {e}')

# ---------- fa / en ----------
if fa is not None and en is not None:
    same_shape(fa, en)
    for p, v in walk(fa):
        if isinstance(v, str) and not v.strip():
            warn(f'fa.json: «{p}» خالی است')
    for p, v in walk(en):
        if isinstance(v, str) and not v.strip():
            warn(f'en.json: «{p}» خالی است')

# ---------- پروژه‌ها ----------
if projects is not None:
    slugs = set()
    for i, p in enumerate(projects):
        w = f'projects.json[{i}]'
        for k in ('id', 'slug', 'title', 'location', 'year', 'typology', 'categories', 'status', 'description', 'coverImage'):
            if k not in p:
                err(f'{w}: کلید «{k}» وجود ندارد')
        if p.get('slug') in slugs:
            err(f'{w}: slug تکراری است → {p.get("slug")}')
        slugs.add(p.get('slug'))
        for k in ('title', 'location', 'typology', 'description'):
            if k in p:
                need_pair(p[k], f'{w}.{k}')
        if p.get('status') not in ('completed', 'competition', 'ongoing'):
            warn(f'{w}: status عجیب است → {p.get("status")} (مقدارهای معمول: completed / competition / ongoing)')
        for k in ('categories',):
            if not isinstance(p.get(k), list) or not p.get(k):
                err(f'{w}: categories باید فهرست غیرخالی باشد')
        image_exists(p.get('coverImage'), f'{w}.coverImage')
        for j, im in enumerate(p.get('images') or []):
            image_exists(im if isinstance(im, str) else im.get('src') or im.get('url'), f'{w}.images[{j}]')

# ---------- خدمات و آموزش ----------
if services is not None:
    ids = set()
    for i, s in enumerate(services.get('services', [])):
        w = f'services.json services[{i}]'
        if s.get('id') in ids:
            err(f'{w}: id تکراری است → {s.get("id")}')
        ids.add(s.get('id'))
        need_pair(s.get('title'), f'{w}.title'); need_pair(s.get('description'), f'{w}.description')
    ST = {x.get('id') for x in services.get('stages', [])}; GR = {x.get('id') for x in services.get('groups', [])}
    for x in services.get('stages', []) + services.get('groups', []):
        need_pair(x.get('name'), f'services.json stage/group {x.get("id")}.name')
    ICONS = {'Leaf', 'Activity', 'BarChart3', 'Sun', 'Layers', 'Search', 'Zap', 'Wind', 'Cpu', 'Thermometer', 'Droplets', 'Award', 'Volume2'}
    for i, s in enumerate(services.get('services', [])):
        w = f'services.json services[{i}]'
        if s.get('group') not in GR:
            err(f'{w}: گروه «{s.get("group")}» در groups تعریف نشده')
        if not s.get('stages') or any(x not in ST for x in s.get('stages', [])):
            err(f'{w}.stages: باید فهرستی غیرخالی از مرحله‌های تعریف‌شده باشد')
        if s.get('icon') not in ICONS:
            warn(f'{w}.icon: آیکن «{s.get("icon")}» ناشناخته است (آیکن پیش‌فرض نمایش داده می‌شود)')
    if len(ids) != 13:
        warn(f'services.json: تعداد خدمات {len(ids)} است (متن سایت «۱۳ محور» می‌گوید)')
    for i, e in enumerate(services.get('educationalPrograms', [])):
        if 'id' not in e:
            err(f'services.json educationalPrograms[{i}]: id ندارد')

# ---------- تیم ----------
if team is not None:
    for i, m in enumerate(team.get('teamMembers', [])):
        w = f'team.json teamMembers[{i}]'
        need_pair(m.get('name'), f'{w}.name'); need_pair(m.get('role'), f'{w}.role')
        image_exists(m.get('photo'), f'{w}.photo')
        if not m.get('photo') and not m.get('initials'):
            err(f'{w}: نه photo دارد نه initials')
    dep_ids = {d.get('id') for d in team.get('departments', [])}
    for d in team.get('departments', []):
        need_pair(d.get('name'), f'team.json departments[{d.get("id")}].name')
    for i, m in enumerate(team.get('teamMembers', [])):
        if m.get('department') and m['department'] not in dep_ids:
            err(f'team.json teamMembers[{i}]: دپارتمان «{m["department"]}» در departments تعریف نشده')
        if m.get('level') not in (None, 'leader', 'member'):
            err(f'team.json teamMembers[{i}].level: باید leader یا member باشد')
    for i, o in enumerate(team.get('partnerOffices', [])):
        need_pair(o, f'team.json partnerOffices[{i}]')

# ---------- فصل‌های مسیر پایداری ----------
if chapters is not None:
    if len(chapters) != 6:
        err(f'chapters.json: باید دقیقاً ۶ فصل باشد (الان {len(chapters)}). سایت روی ۶ ایستگاه تنظیم شده است.')
    for i, c in enumerate(chapters):
        w = f'chapters.json[{i}]'
        for k in ('name', 'headline', 'description'):
            need_pair(c.get(k), f'{w}.{k}')
        ch = c.get('chips', {})
        if len(ch.get('fa', [])) != len(ch.get('en', [])) or not ch.get('fa'):
            err(f'{w}.chips: تعداد برچسب‌های فارسی و انگلیسی باید برابر و غیرصفر باشد')
        m = c.get('metric', {})
        for k in ('value', 'decimals', 'suffix', 'label'):
            if k not in m:
                err(f'{w}.metric: کلید «{k}» وجود ندارد')
        if 'label' in m:
            need_pair(m['label'], f'{w}.metric.label')
        if not isinstance(m.get('value'), (int, float)):
            err(f'{w}.metric.value: باید عدد باشد')
        for j, s in enumerate(c.get('specs', [])):
            need_pair(s.get('label'), f'{w}.specs[{j}].label'); need_pair(s.get('value'), f'{w}.specs[{j}].value')

# ---------- شهرک ----------
if town is not None:
    secs = town.get('sections', [])
    if len(secs) != 7:
        err(f'town.json: باید ۷ بخش (sections) باشد (الان {len(secs)})')
    for i, s in enumerate(secs):
        w = f'town.json sections[{i}]'
        need_pair(s.get('name'), f'{w}.name')
        for k in ('cameraCenter', 'labelOffset'):
            v = s.get(k)
            if not (isinstance(v, list) and len(v) == 2 and all(isinstance(x, (int, float)) for x in v)):
                err(f'{w}.{k}: باید دو عدد باشد مثل [0, -34]')
    hl = town.get('sustainabilityHighlights', [])
    if len(hl) != 5 or any(len(g) != 3 for g in hl):
        err('town.json sustainabilityHighlights: باید ۵ گروه و در هر گروه ۳ ردیف باشد')
    for i, g in enumerate(hl):
        for j, h in enumerate(g):
            need_pair({k: h.get(k) for k in ('fa', 'en')}, f'town.json sustainabilityHighlights[{i}][{j}]')

# ---------- دستیار ----------
if guide is not None:
    g = guide.get('guide', {})
    for lg in ('fa', 'en'):
        x = g.get(lg)
        if not x:
            err(f'guide.json: بخش guide.{lg} وجود ندارد'); continue
        for k, n in (('headings', 8), ('tips', 8), ('shortTips', 8)):
            if len(x.get(k, [])) != n:
                err(f'guide.json guide.{lg}.{k}: باید {n} مورد باشد (الان {len(x.get(k, []))})')
        for k in ('startButton', 'ticketButton', 'laterButton', 'closeButton', 'tapWords'):
            if k not in x:
                err(f'guide.json guide.{lg}: کلید «{k}» وجود ندارد')
        if len(x.get('tapWords', [])) != 2:
            err(f'guide.json guide.{lg}.tapWords: باید دو مورد باشد (لمسی، ماوس)')
        for i, t in enumerate(x.get('tips', []) + x.get('shortTips', [])):
            if '{tap}' not in t and i not in (0, 7, 8, 15):
                warn(f'guide.json guide.{lg}: متن شمارهٔ {i} علامت {{tap}} ندارد')
    if g.get('fa') and g.get('en'):
        for k in ('tips', 'shortTips', 'headings'):
            if len(g['fa'].get(k, [])) != len(g['en'].get(k, [])):
                err(f'guide.json: تعداد {k} در fa و en فرق می‌کند')
    t = guide.get('assistantTexts', {})
    if set(t.get('fa', {})) != set(t.get('en', {})):
        err('guide.json assistantTexts: کلیدهای fa و en یکی نیستند: ' + str(sorted(set(t.get('fa', {})) ^ set(t.get('en', {})))))
    if len(guide.get('hudLabels', [])) != 7:
        err('guide.json hudLabels: باید ۷ مورد باشد')

# ---------- فهرست تصاویر ----------
if images is not None:
    for p in images:
        image_exists(p, 'images.json')
    disk = set()
    base = os.path.join(ROOT, 'assets', 'images')
    for d, _, fs in os.walk(base):
        for f in fs:
            rel = '/' + os.path.relpath(os.path.join(d, f), base).replace(os.sep, '/')
            if rel.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')) and not rel.startswith(('/mascot-',)):
                disk.add(rel)
    for rel in sorted(disk - set(images)):
        warn(f'assets/images{rel} روی دیسک هست ولی در images.json نیست (سایت آن را نمی‌بیند)')

# ---------- کلیپ‌های همایش (پنل ادمین) ----------
if clips is not None:
    if not isinstance(clips, list):
        err('clips.json: باید یک فهرست باشد')
    else:
        cids = set()
        for i, c in enumerate(clips):
            w = f'clips.json[{i}]'
            need_pair(c.get('title'), f'{w}.title')
            if 'aparat.com' not in str(c.get('aparatUrl', '')):
                err(f'{w}.aparatUrl: لینک باید از aparat.com باشد')
            if c.get('orientation') not in ('landscape', 'portrait'):
                err(f'{w}.orientation: باید landscape یا portrait باشد')
            if c.get('id') in cids:
                err(f'{w}: id تکراری است → {c.get("id")}')
            cids.add(c.get('id'))
            image_exists(c.get('poster'), f'{w}.poster')

# ---------- گواهینامه‌ها و نظرها ----------
if creds is not None:
    for i, c in enumerate(creds.get('certificates', [])):
        w = f'credentials.json certificates[{i}]'
        need_pair(c.get('title'), f'{w}.title'); need_pair(c.get('issuer'), f'{w}.issuer')
        if not c.get('image'):
            err(f'{w}: تصویر گواهی ندارد')
        image_exists(c.get('image'), f'{w}.image')
    for i, t in enumerate(creds.get('testimonials', [])):
        w = f'credentials.json testimonials[{i}]'
        need_pair(t.get('name'), f'{w}.name'); need_pair(t.get('text'), f'{w}.text')
        if t.get('rating') not in (1, 2, 3, 4, 5):
            err(f'{w}.rating: باید عدد ۱ تا ۵ باشد')

# ---------- سرو سبز ----------
if sarv is not None:
    tot = sum(c.get('weight', 0) for c in sarv.get('categories', []))
    if tot != 100:
        warn(f'sarv.json: جمع وزن‌ها {tot} است، نه ۱۰۰. وزن‌های رسمی جدول سرو سبز را بررسی کنید (امتیاز برآوردی به نسبت جمع وزن‌ها حساب می‌شود).')
    for c in sarv.get('categories', []):
        need_pair(c.get('name'), f'sarv.json categories[{c.get("id")}].name')
    if not sarv.get('levels'):
        err('sarv.json: levels (آستانهٔ سطح‌ها) وجود ندارد')

# ---------- تماس ----------
if contact is not None:
    aids = {a.get('id') for a in contact.get('accounts', [])}
    for i, a in enumerate(contact.get('accounts', [])):
        w = f'contact.json accounts[{i}]'
        need_pair(a.get('role'), f'{w}.role')
        if 'instagram.com' not in str(a.get('url', '')):
            err(f'{w}.url: لینک باید از instagram.com باشد')
    for i, p in enumerate(contact.get('posts', [])):
        w = f'contact.json posts[{i}]'
        if p.get('account') not in aids:
            err(f'{w}: پیج «{p.get("account")}» در accounts تعریف نشده')
        need_pair(p.get('caption'), f'{w}.caption'); image_exists(p.get('image'), f'{w}.image')
    for i, p in enumerate(contact.get('phones', [])):
        if not re.fullmatch(r'0\d{10}', str(p.get('number', ''))):
            warn(f'contact.json phones[{i}].number: شماره باید ۱۱ رقم لاتین با صفر ابتدایی باشد (مثلاً 09123456789)')

# ---------- تنظیمات پنل ادمین ----------
if schemas is not None:
    for col in schemas.get('collections', []):
        if not os.path.isfile(os.path.join(ROOT, 'data', col['file'] + '.json')):
            err(f'admin/schemas.json: فایل data/{col["file"]}.json برای «{col["id"]}» وجود ندارد')
        for f in col.get('fields', []):
            if f.get('type') not in ('id', 'text', 'url', 'number', 'textarea', 'bilingual', 'tags', 'checks', 'select', 'image', 'checkbox'):
                err(f'admin/schemas.json: نوع فیلد نامعتبر «{f.get("type")}» در {col["id"]}')

# ---------- فایل‌های اصلی ----------
for rel in ['index.html', 'css/fonts.css', 'css/tokens.css', 'css/base.css', 'css/layout.css', 'css/team.css', 'css/services.css', 'css/projects.css', 'css/about.css', 'css/lab.css', 'css/contact.css', 'css/mascot.css',
            'admin/index.html', 'admin/admin.js', 'admin/admin.css', 'admin/api.php', 'admin/setup.php', 'admin/schemas.json', 'tools/dev_server.py',
            'js/main.js', 'js/i18n.js', 'js/lab.js', 'js/ui.js', 'js/scene.js', 'js/camera.js', 'js/mascot.js', 'js/guide.js',
            'assets/fonts/kalameh-300.woff', 'assets/fonts/kalameh-400.woff', 'assets/fonts/kalameh-700.woff', 'assets/fonts/kalameh-900.woff',
            'assets/images/mascot-body.webp', 'assets/images/mascot-head.webp']:
    if not os.path.isfile(os.path.join(ROOT, rel)):
        err(f'فایل ضروری پیدا نشد: {rel}')
try:
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    if 'three@0.150.1' not in html:
        err('index.html: نسخهٔ three.js باید 0.150.1 بماند')
    if 'gc.zgo.at/count.js' not in html:
        err('index.html: اسکریپت GoatCounter پیدا نشد')
    if 'YOUR_CODE' in html:
        warn('index.html: هنوز YOUR_CODE در GoatCounter جایگزین نشده (برای آمار بازدید باید کد خودت را بگذاری)')
except FileNotFoundError:
    pass

# ---------- گزارش ----------
for w in warnings:
    print('هشدار:', w)
for e in errors:
    print('خطا:  ', e)
if errors:
    print(f'\n✗ {len(errors)} خطا، {len(warnings)} هشدار')
    sys.exit(1)
print(f'✓ OK — همه‌چیز درست است ({len(warnings)} هشدار)')
