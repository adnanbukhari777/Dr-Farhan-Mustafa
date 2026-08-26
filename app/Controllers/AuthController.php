<?php
/**
 * Admin Authentication & Session Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Security\Auth;
use App\Security\Csrf;
use App\Models\AuditModel;

class AuthController
{
    public static function handleLogin(): void
    {
        $error = null;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $token = $_POST['csrf_token'] ?? '';
            if (!Csrf::validateToken($token)) {
                $error = 'Security session expired. Please refresh and try again.';
            } else {
                $email = $_POST['email'] ?? '';
                $password = $_POST['password'] ?? '';

                $result = Auth::attempt($email, $password);

                if ($result['success']) {
                    AuditModel::log('user_login', 'auth', (string)$result['user']['id'], ['email' => $email]);
                    header('Location: index.php?route=admin');
                    exit;
                } else {
                    $error = $result['message'];
                    AuditModel::log('failed_login_attempt', 'auth', null, ['email' => $email]);
                }
            }
        }

        require_once APP_ROOT . '/app/Views/admin/login.php';
    }

    public static function handleLogout(): void
    {
        AuditModel::log('user_logout', 'auth');
        Auth::logout();
        header('Location: index.php?route=login');
        exit;
    }
}
