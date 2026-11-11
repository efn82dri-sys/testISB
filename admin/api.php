<?php
/* API پنل ادمین ISB: ورود، خواندن و ذخیرهٔ فایل‌های data/*.json، آپلود عکس و نسخه‌های پشتیبان.
   فقط فایل‌های فهرست‌شده در admin/schemas.json قابل ویرایش هستند. */
declare(strict_types=1);

$ROOT   = dirname(__DIR__);
$DATA   = $ROOT . '/data';
$BACKUP = $DATA . '/_backup';
$STATE  = __DIR__ . '/_state';
$MAX_JSON = 2 * 1024 * 1024;
$MAX_IMG  = 8 * 1024 * 1024;
$KEEP     = 20;

session_name('isb_admin');
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict',
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
]);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out(array $a, int $code = 200): void {
    http_response_code($code);
    echo json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(string $m, int $code = 400): void { out(['ok' => false, 'error' => $m], $code); }
function body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}
function load_config(): ?array {
    $f = __DIR__ . '/config.php';
    if (!is_file($f)) return null;
    $c = require $f;
    return (is_array($c) && !empty($c['password_hash'])) ? $c : null;
}
function allowed_files(): array {
    $s = json_decode((string)file_get_contents(__DIR__ . '/schemas.json'), true);
    $f = ['images'];
    foreach (($s['collections'] ?? []) as $c) { $f[] = (string)$c['file']; }
    return array_values(array_unique($f));
}
function check_file($f): string {
    $f = (string)$f;
    if (!preg_match('/^[a-z0-9_-]{1,40}$/', $f) || !in_array($f, allowed_files(), true)) fail('این فایل قابل ویرایش نیست', 403);
    return $f;
}
function need_login(): void { if (empty($_SESSION['ok'])) fail('ابتدا وارد شوید', 401); }
function need_post(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('روش درخواست نادرست است', 405);
    $h = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf']) || !is_string($h) || !hash_equals($_SESSION['csrf'], $h)) fail('نشست منقضی شده است؛ صفحه را رفرش کنید', 403);
}
function write_atomic(string $path, string $content): void {
    $tmp = $path . '.tmp' . bin2hex(random_bytes(3));
    if (file_put_contents($tmp, $content, LOCK_EX) === false) fail('نوشتن فایل ممکن نبود؛ مجوز پوشهٔ data را بررسی کنید', 500);
    if (!rename($tmp, $path)) { @unlink($tmp); fail('ذخیرهٔ فایل ممکن نبود', 500); }
}
function make_backup(string $file): void {
    global $DATA, $BACKUP, $KEEP;
    $src = "$DATA/$file.json";
    if (!is_file($src)) return;
    if (!is_dir($BACKUP)) @mkdir($BACKUP, 0755, true);
    $t = time();
    do { $dst = "$BACKUP/$file-" . date('Ymd-His', $t) . '.json'; $t++; } while (file_exists($dst));   /* هرگز نسخهٔ قبلی را بازنویسی نمی‌کند */
    copy($src, $dst);
    $all = glob("$BACKUP/$file-*.json") ?: [];
    rsort($all);
    foreach (array_slice($all, $KEEP) as $old) { @unlink($old); }
}

$action = (string)($_GET['action'] ?? '');
$cfg = load_config();

/* ---------- وضعیت ---------- */
if ($action === 'status') {
    if (!empty($_SESSION['ok']) && empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    out(['ok' => true, 'configured' => $cfg !== null, 'loggedIn' => !empty($_SESSION['ok']), 'csrf' => $_SESSION['csrf'] ?? null]);
}

/* ---------- ورود با محدودیت تعداد تلاش ---------- */
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('روش درخواست نادرست است', 405);
    if ($cfg === null) fail('رمز هنوز تنظیم نشده است', 409);
    if (!is_dir($STATE)) @mkdir($STATE, 0755, true);
    $ap = $STATE . '/attempts.json';
    $all = is_file($ap) ? (json_decode((string)file_get_contents($ap), true) ?: []) : [];
    $k = hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? '?'));
    $now = time();
    $recent = array_values(array_filter($all[$k] ?? [], function ($t) use ($now) { return $t > $now - 900; }));
    if (count($recent) >= 5) fail('تعداد تلاش‌های ناموفق زیاد بود؛ ۱۵ دقیقه بعد دوباره امتحان کنید', 429);
    $in = body();
    $pw = (string)($in['password'] ?? '');
    if ($pw !== '' && password_verify($pw, $cfg['password_hash'])) {
        unset($all[$k]);
        file_put_contents($ap, json_encode($all), LOCK_EX);
        session_regenerate_id(true);
        $_SESSION['ok'] = true;
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
        out(['ok' => true, 'csrf' => $_SESSION['csrf']]);
    }
    $recent[] = $now;
    $all[$k] = $recent;
    file_put_contents($ap, json_encode($all), LOCK_EX);
    usleep(400000);
    fail('رمز نادرست است', 401);
}

if ($action === 'logout') { need_post(); $_SESSION = []; session_destroy(); out(['ok' => true]); }

/* ---------- از اینجا به بعد ورود لازم است ---------- */
need_login();

if ($action === 'load') {
    $f = check_file($_GET['file'] ?? '');
    $p = "$DATA/$f.json";
    if (!is_file($p)) out(['ok' => true, 'json' => ($f === 'images' ? '[]' : '[]')]);
    out(['ok' => true, 'json' => (string)file_get_contents($p)]);
}

if ($action === 'save') {
    need_post();
    $in = body();
    $f = check_file($in['file'] ?? '');
    $json = $in['json'] ?? null;
    if (!is_string($json) || $json === '' || strlen($json) > $MAX_JSON) fail('داده نامعتبر یا بسیار بزرگ است');
    $d = json_decode($json, true);
    if ($d === null && trim($json) !== 'null') fail('ساختار JSON نامعتبر است');
    if (!is_array($d)) fail('ساختار داده باید فهرست یا شیء باشد');
    make_backup($f);
    write_atomic("$DATA/$f.json", $json . "\n");
    out(['ok' => true]);
}

if ($action === 'backups') {
    $f = check_file($_GET['file'] ?? '');
    $all = glob("$BACKUP/$f-*.json") ?: [];
    rsort($all);
    $list = [];
    foreach ($all as $p) { $list[] = ['name' => basename($p), 'time' => filemtime($p), 'size' => filesize($p)]; }
    out(['ok' => true, 'backups' => $list]);
}

if ($action === 'restore') {
    need_post();
    $in = body();
    $f = check_file($in['file'] ?? '');
    $name = (string)($in['name'] ?? '');
    if (!preg_match('/^' . preg_quote($f, '/') . '-\d{8}-\d{6}\.json$/', $name)) fail('نام نسخه نامعتبر است');
    $src = "$BACKUP/$name";
    if (!is_file($src)) fail('این نسخه پیدا نشد', 404);
    $content = (string)file_get_contents($src);   /* اول محتوا خوانده می‌شود، بعد پشتیبان تازه ساخته می‌شود */
    make_backup($f);
    write_atomic("$DATA/$f.json", $content);
    out(['ok' => true]);
}

if ($action === 'upload') {
    need_post();
    if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) fail('آپلود ناموفق بود (حجم فایل یا تنظیمات هاست را بررسی کنید)');
    $fl = $_FILES['image'];
    if ($fl['size'] > $MAX_IMG) fail('حجم عکس نباید بیشتر از ۸ مگابایت باشد');
    $info = @getimagesize($fl['tmp_name']);
    if (!$info) fail('این فایل عکس معتبر نیست');
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
    if (!isset($types[$info[2]])) fail('فقط عکس JPG، PNG یا WEBP قابل قبول است');
    if ($info[0] > 8000 || $info[1] > 8000) fail('ابعاد عکس بیش از حد بزرگ است (حداکثر ۸۰۰۰ پیکسل)');
    $sub = date('Y') . '/' . date('m');
    $dir = "$ROOT/assets/images/uploads/$sub";
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) fail('ساخت پوشهٔ آپلود ممکن نبود', 500);
    $name = bin2hex(random_bytes(8)) . '.' . $types[$info[2]];
    if (!move_uploaded_file($fl['tmp_name'], "$dir/$name")) fail('ذخیرهٔ عکس ممکن نبود', 500);
    $rel = "/uploads/$sub/$name";
    $ip = "$DATA/images.json";
    $fh = fopen($ip, 'c+');
    if ($fh && flock($fh, LOCK_EX)) {
        $cur = json_decode((string)stream_get_contents($fh), true);
        if (!is_array($cur)) $cur = [];
        $cur[] = $rel;
        ftruncate($fh, 0); rewind($fh);
        fwrite($fh, json_encode(array_values($cur), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n");
        fflush($fh); flock($fh, LOCK_UN);
    }
    if ($fh) fclose($fh);
    out(['ok' => true, 'path' => $rel, 'width' => $info[0], 'height' => $info[1]]);
}

fail('درخواست ناشناخته', 404);
