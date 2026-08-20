<?php
/**
 * Dr. Farhan Mustafa Clinic Portal - One-Click Database Installer (PHP 8.1+)
 * Automatically sets up MySQL tables, schema migrations, and initial seed data.
 */

declare(strict_types=1);

define('APP_ROOT', dirname(__DIR__));
require_once APP_ROOT . '/app/Config/Config.php';
require_once APP_ROOT . '/app/Config/Database.php';

use App\Config\Config;
use App\Config\Database;

$step = $_GET['step'] ?? 'welcome';
$message = '';
$error = '';
$isInstalled = false;

// Check connection
$db = Database::getConnection();

if ($step === 'run' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$db) {
        $error = "Unable to connect to the database. Please check your DB credentials in Config.php or .env.";
    } else {
        try {
            // Read schema and seed files
            $schemaSql = file_get_contents(APP_ROOT . '/database/schema.sql');
            $seedSql = file_get_contents(APP_ROOT . '/database/seed.sql');

            // Execute schema
            $db->exec($schemaSql);

            // Execute seed
            $db->exec($seedSql);

            $message = "Database schema and initial seed data installed successfully!";
            $isInstalled = true;
            $step = 'complete';
        } catch (\PDOException $e) {
            $error = "Installation failed: " . htmlspecialchars($e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Setup & Installation | Dr. Farhan Mustafa Clinic Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2097A2;
            --aqua: #27BAC8;
            --dark: #0A0A0A;
            --bg: #FAFAFA;
        }
        body {
            font-family: 'Montserrat', sans-serif;
            background-color: var(--bg);
            color: var(--dark);
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .install-card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border: 1px solid #e5e7eb;
            max-width: 640px;
            width: 100%;
            padding: 32px;
        }
        .badge {
            background: rgba(32, 151, 162, 0.1);
            color: var(--primary);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 12px;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #111827;
        }
        p {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        .alert {
            padding: 14px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        .alert-success {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        .info-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            font-size: 13px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dashed #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .btn {
            display: inline-block;
            background: var(--primary);
            color: #ffffff;
            font-weight: 600;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            width: 100%;
            text-align: center;
            box-sizing: border-box;
            transition: background 0.2s ease;
        }
        .btn:hover {
            background: var(--aqua);
        }
        .btn-outline {
            background: transparent;
            color: var(--primary);
            border: 1px solid var(--primary);
            margin-top: 12px;
        }
    </style>
</head>
<body>

<div class="install-card">
    <span class="badge">Phase 2 MySQL Database Installer</span>
    <h1>Dr. Farhan Mustafa Clinic Portal</h1>
    <p>Setup and verify the complete database tables, CMS modules, facts verification queue, and default RBAC accounts.</p>

    <?php if ($error): ?>
        <div class="alert alert-error"><?= $error ?></div>
    <?php endif; ?>

    <?php if ($message): ?>
        <div class="alert alert-success"><?= $message ?></div>
    <?php endif; ?>

    <div class="info-box">
        <div class="info-row">
            <strong>Target Database:</strong>
            <span><?= htmlspecialchars(Config::getDbConfig()['database']) ?></span>
        </div>
        <div class="info-row">
            <strong>Host:</strong>
            <span><?= htmlspecialchars(Config::getDbConfig()['host']) ?></span>
        </div>
        <div class="info-row">
            <strong>Connection Status:</strong>
            <span><?= $db ? '<span style="color:#166534; font-weight:600;">✓ Connected</span>' : '<span style="color:#dc2626; font-weight:600;">✗ Disconnected</span>' ?></span>
        </div>
        <div class="info-row">
            <strong>PHP Version:</strong>
            <span><?= PHP_VERSION ?></span>
        </div>
        <div class="info-row">
            <strong>Default Super Admin:</strong>
            <span>superadmin@healthpro.com.pk</span>
        </div>
        <div class="info-row">
            <strong>Default Password:</strong>
            <span>Admin@HealthPro2026!</span>
        </div>
    </div>

    <?php if ($step === 'complete'): ?>
        <a href="index.php?route=admin" class="btn">Proceed to Admin CMS Panel</a>
        <a href="index.php" class="btn btn-outline">Go to Public Website</a>
    <?php else: ?>
        <form method="POST" action="installer.php?step=run">
            <button type="submit" class="btn" <?= !$db ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : '' ?>>
                Run 1-Click Database Setup & Migrations
            </button>
        </form>
    <?php endif; ?>
</div>

</body>
</html>
