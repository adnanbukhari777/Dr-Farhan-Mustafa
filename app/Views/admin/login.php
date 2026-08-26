<?php
use App\Security\Csrf;
use App\Config\Config;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal Login | Dr. Farhan Mustafa Clinic</title>
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
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .login-card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            max-width: 420px;
            width: 100%;
            padding: 32px;
        }
        .logo-badge {
            background: rgba(32,151,162,0.1);
            color: var(--primary);
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 9999px;
            display: inline-block;
            margin-bottom: 12px;
        }
        h1 {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 6px 0;
        }
        p {
            font-size: 13px;
            color: #6b7280;
            margin: 0 0 24px 0;
        }
        .form-group {
            margin-bottom: 16px;
        }
        label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
        }
        input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus {
            border-color: var(--primary);
        }
        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 13px;
            margin-bottom: 16px;
            border: 1px solid #fecaca;
        }
        .btn-submit {
            background: var(--primary);
            color: #fff;
            border: none;
            width: 100%;
            padding: 12px;
            font-weight: 600;
            font-size: 14px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn-submit:hover {
            background: var(--aqua);
        }
        .role-hint {
            margin-top: 24px;
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            font-size: 11px;
            color: #6b7280;
            line-height: 1.5;
            border: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>

<div class="login-card">
    <span class="logo-badge">Clinic CMS Portal</span>
    <h1>Admin Authentication</h1>
    <p>Sign in with your role-authorized credentials.</p>

    <?php if (!empty($error)): ?>
        <div class="alert-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" action="index.php?route=login">
        <?= Csrf::inputField() ?>
        
        <div class="form-group">
            <label for="email">Staff Email Address</label>
            <input type="email" id="email" name="email" required placeholder="admin@healthpro.com.pk" autofocus>
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="••••••••••••">
        </div>

        <button type="submit" class="btn-submit">Sign In to Dashboard</button>
    </form>

    <div class="role-hint">
        <strong>Roles:</strong> Super Admin, Admin, Receptionist, Content Editor.<br>
        <strong>Default Password:</strong> <code>Admin@HealthPro2026!</code>
    </div>
</div>

</body>
</html>
