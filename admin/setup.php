<?php
/* تنظیم اولیهٔ رمز ادمین. فقط یک بار کار می‌کند: وقتی admin/config.php ساخته شد، این صفحه قفل می‌شود.
   بعد از آپلود سایت روی هاست، همان لحظه این صفحه را باز کنید و رمز را بگذارید. */
declare(strict_types=1);
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
$cfgFile = __DIR__ . '/config.php';
$msg = ''; $done = false;
if (is_file($cfgFile)) {
    http_response_code(403);
    $locked = true;
} else {
    $locked = false;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $p1 = (string)($_POST['p1'] ?? ''); $p2 = (string)($_POST['p2'] ?? '');
        if ((function_exists('mb_strlen') ? mb_strlen($p1) : strlen($p1)) < 10) $msg = 'رمز باید حداقل ۱۰ نویسه باشد.';
        elseif ($p1 !== $p2) $msg = 'دو رمز یکسان نیستند.';
        else {
            $code = "<?php\nreturn " . var_export(['password_hash' => password_hash($p1, PASSWORD_DEFAULT)], true) . ";\n";
            if (file_put_contents($cfgFile, $code, LOCK_EX) === false) $msg = 'ذخیرهٔ رمز ممکن نبود؛ مجوز نوشتن پوشهٔ admin را بررسی کنید.';
            else { @chmod($cfgFile, 0640); $done = true; }
        }
    }
}
?><!DOCTYPE html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>تنظیم رمز ادمین</title>
<style>body{font-family:Tahoma,sans-serif;background:#071d45;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}
.b{background:#0c2a75;border:1px solid #2f5fd0;border-radius:16px;padding:28px;max-width:420px;width:100%;line-height:2}
input{width:100%;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid #4a6bd6;background:#071d45;color:#fff;margin:4px 0 12px;font-size:16px}
button{width:100%;padding:12px;border:0;border-radius:10px;background:#f4c65e;color:#111;font-weight:700;font-size:16px;cursor:pointer}
.e{color:#ff9b9b}.o{color:#7dffb0}a{color:#7edcff}</style></head><body><div class="b">
<?php if ($locked): ?>
<b>رمز قبلاً تنظیم شده است.</b><br>برای تغییر رمز، فایل admin/config.php را از هاست حذف کنید و دوباره این صفحه را باز کنید.
<?php elseif ($done): ?>
<b class="o">رمز ذخیره شد.</b><br><a href="index.html">ورود به پنل ادمین</a>
<?php else: ?>
<b>تنظیم رمز پنل ادمین</b>
<?php if ($msg): ?><div class="e"><?= htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
<form method="post"><label>رمز (حداقل ۱۰ نویسه)</label><input type="password" name="p1" autocomplete="new-password" required>
<label>تکرار رمز</label><input type="password" name="p2" autocomplete="new-password" required><button>ذخیره رمز</button></form>
<?php endif; ?>
</div></body></html>
