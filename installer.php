<?php
/**
 * Dr. Farhan Mustafa Clinic Portal - 1-Click Database Installer & Setup Wizard (PHP 8.1+)
 * Designed for Hostinger Shared Hosting (hPanel / cPanel)
 */

declare(strict_types=1);

define('APP_ROOT', __DIR__);

// Check if installation is locked
$lockFile = APP_ROOT . '/installed.lock';
if (file_exists($lockFile)) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Installation Locked | Dr. Farhan Mustafa Clinic Portal</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Montserrat', sans-serif; background: #FAFAFA; color: #0A0A0A; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .card { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; max-width: 580px; width: 100%; padding: 32px; text-align: center; }
            .badge { background: rgba(32, 151, 162, 0.1); color: #2097A2; padding: 6px 16px; border-radius: 9999px; font-size: 13px; font-weight: 600; display: inline-block; margin-bottom: 16px; }
            h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px 0; color: #111827; }
            p { color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
            .btn { display: inline-block; background: #2097A2; color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; }
            .btn:hover { background: #187781; }
        </style>
    </head>
    <body>
        <div class="card">
            <span class="badge">Security Lock Active</span>
            <h1>Installation Already Completed</h1>
            <p>The clinic database and system are already installed and locked for security. To re-run the setup, delete <code>installed.lock</code> from your server root.</p>
            <a href="index.php" class="btn">Go to Clinic Portal</a>
        </div>
    </body>
    </html>
    <?php
    exit;
}

$step = $_GET['step'] ?? 'welcome';
$error = '';
$message = '';

// Load existing config if available
$dbHost = 'localhost';
$dbName = '';
$dbUser = '';
$dbPass = '';
$adminEmail = 'superadmin@healthpro.com.pk';
$adminPass = 'Admin@HealthPro2026!';

// Check for .env
$envFile = APP_ROOT . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (str_starts_with($line, '#') || empty($line)) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $k = trim($parts[0]);
            $v = trim($parts[1], " \t\n\r\0\x0B\"'");
            if ($k === 'DB_HOST') $dbHost = $v;
            if ($k === 'DB_NAME') $dbName = $v;
            if ($k === 'DB_USER') $dbUser = $v;
            if ($k === 'DB_PASS') $dbPass = $v;
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $step === 'install') {
    $dbHost = trim($_POST['db_host'] ?? 'localhost');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = trim($_POST['db_pass'] ?? '');
    $adminEmail = trim($_POST['admin_email'] ?? 'superadmin@healthpro.com.pk');
    $adminPass = trim($_POST['admin_pass'] ?? '');
    $apiKey = trim($_POST['gemini_api_key'] ?? '');

    if (empty($dbName) || empty($dbUser)) {
        $error = 'Database Name and Database User are required.';
    } elseif (empty($adminEmail) || empty($adminPass)) {
        $error = 'Admin Email and Admin Password are required.';
    } else {
        try {
            // Test connection
            $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);

            // Read database.sql
            $sqlFile = APP_ROOT . '/database.sql';
            if (!file_exists($sqlFile)) {
                $sqlFile = APP_ROOT . '/database/schema.sql';
            }

            if (!file_exists($sqlFile)) {
                throw new Exception('database.sql file not found.');
            }

            $sqlContent = file_get_contents($sqlFile);
            $pdo->exec($sqlContent);

            // Create / update the super admin user with secure bcrypt hash
            $hash = password_hash($adminPass, PASSWORD_BCRYPT);
            $userStmt = $pdo->prepare("
                INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `phone`) 
                VALUES ('Super Administrator', :email, :pass, 'super_admin', 'active', '+923280145670')
                ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `status` = 'active'
            ");
            $userStmt->execute([
                ':email' => $adminEmail,
                ':pass' => $hash
            ]);

            // Save .env file
            $envContent = "# Hostinger Database Credentials\n"
                        . "APP_ENV=production\n"
                        . "APP_TIMEZONE=Asia/Karachi\n"
                        . "DB_HOST={$dbHost}\n"
                        . "DB_PORT=3306\n"
                        . "DB_NAME={$dbName}\n"
                        . "DB_USER={$dbUser}\n"
                        . "DB_PASS={$dbPass}\n"
                        . "DB_CHARSET=utf8mb4\n"
                        . "GEMINI_API_KEY={$apiKey}\n"
                        . "GEMINI_MODEL=gemini-3.7-flash\n"
                        . "SMTP_HOST=smtp.hostinger.com\n"
                        . "SMTP_PORT=465\n"
                        . "SMTP_ENCRYPTION=ssl\n"
                        . "SMTP_USERNAME=appointments@healthpro.com.pk\n"
                        . "SMTP_FROM_EMAIL=appointments@healthpro.com.pk\n"
                        . "SMTP_FROM_NAME=\"Dr. Farhan Mustafa Clinic\"\n";
            file_put_contents($envFile, $envContent);

            // Create lock file
            file_put_contents($lockFile, "Installed successfully on " . date('Y-m-d H:i:s T') . "\nAdmin: {$adminEmail}\n");

            $step = 'complete';
            $message = 'Clinic Database, 28 tables, clinical seeds, and Super Admin account installed successfully!';
        } catch (Exception $e) {
            $error = 'Installation failed: ' . htmlspecialchars($e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup Wizard | Dr. Farhan Mustafa Clinic Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #2097A2; --dark: #0A0A0A; --bg: #FAFAFA; --border: #E5E7EB; }
        body { font-family: 'Montserrat', sans-serif; background-color: var(--bg); color: var(--dark); margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .install-card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid var(--border); max-width: 640px; width: 100%; padding: 36px; }
        .badge { background: rgba(32, 151, 162, 0.1); color: var(--primary); padding: 5px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 12px; }
        h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px 0; color: #111827; }
        p { color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; }
        .form-group { margin-bottom: 18px; }
        label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #374151; }
        input[type="text"], input[type="password"], input[type="email"] { width: 100%; box-sizing: border-box; padding: 10px 14px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; font-family: inherit; }
        input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(32, 151, 162, 0.15); }
        .btn { background: var(--primary); color: #fff; padding: 12px 24px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; font-size: 14px; display: inline-block; text-decoration: none; }
        .btn:hover { background: #187781; }
        .alert-error { background: #FEF2F2; color: #991B1B; border: 1px solid #FCA5A5; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
        .alert-success { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .section-title { font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin: 24px 0 12px 0; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
    </style>
</head>
<body>
    <div class="install-card">
        <span class="badge">Hostinger Production Wizard</span>
        <h1>Dr. Farhan Mustafa Clinic Portal</h1>
        
        <?php if ($error): ?>
            <div class="alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <?php if ($step === 'complete'): ?>
            <div class="alert-success"><?= htmlspecialchars($message) ?></div>
            <p>Your clinic portal is now live and fully initialized on Hostinger with all 28 tables, clinical services, appointment management, and AI receptionist capabilities.</p>
            <div style="display:flex; gap:12px; margin-top:24px;">
                <a href="index.php" class="btn" style="flex:1; text-align:center;">Visit Website</a>
                <a href="index.php#/admin" class="btn" style="flex:1; text-align:center; background:#111827;">Admin Portal</a>
            </div>
        <?php else: ?>
            <p>Enter your Hostinger MySQL database details to initialize the database and create your Super Administrator account.</p>
            
            <form method="POST" action="installer.php?step=install">
                <div class="section-title">1. MySQL Database (Hostinger hPanel)</div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Database Host</label>
                        <input type="text" name="db_host" value="<?= htmlspecialchars($dbHost) ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Database Name</label>
                        <input type="text" name="db_name" value="<?= htmlspecialchars($dbName) ?>" placeholder="e.g. u123_drfarhan" required>
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Database Username</label>
                        <input type="text" name="db_user" value="<?= htmlspecialchars($dbUser) ?>" placeholder="e.g. u123_admin" required>
                    </div>
                    <div class="form-group">
                        <label>Database Password</label>
                        <input type="password" name="db_pass" value="<?= htmlspecialchars($dbPass) ?>" placeholder="••••••••">
                    </div>
                </div>

                <div class="section-title">2. Super Administrator Account</div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Admin Email</label>
                        <input type="email" name="admin_email" value="<?= htmlspecialchars($adminEmail) ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Admin Password</label>
                        <input type="password" name="admin_pass" value="<?= htmlspecialchars($adminPass) ?>" required>
                    </div>
                </div>

                <div class="section-title">3. AI Receptionist (Optional)</div>
                <div class="form-group">
                    <label>Gemini API Key</label>
                    <input type="password" name="gemini_api_key" placeholder="AIzaSy...">
                </div>

                <button type="submit" class="btn" style="width: 100%; margin-top: 12px;">Run 1-Click Database Setup</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
