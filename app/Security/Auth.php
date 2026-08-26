<?php
/**
 * Admin Authentication & RBAC Authorization
 * Roles: super_admin, admin, receptionist, editor
 */

declare(strict_types=1);

namespace App\Security;

use App\Config\Database;
use PDO;

class Auth
{
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_RECEPTIONIST = 'receptionist';
    public const ROLE_EDITOR = 'editor';

    private const MAX_FAILED_ATTEMPTS = 5;
    private const LOCKOUT_MINUTES = 15;

    private static function initSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start([
                'cookie_httponly' => true,
                'cookie_samesite' => 'Lax',
                'use_strict_mode' => true,
            ]);
        }
    }

    /**
     * Authenticate user by email and password with brute force throttling
     */
    public static function attempt(string $email, string $password): array
    {
        self::initSession();
        $db = Database::getConnection();

        if (!$db) {
            return ['success' => false, 'message' => 'Database connection failed.'];
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => trim($email)]);
        $user = $stmt->fetch();

        if (!$user) {
            return ['success' => false, 'message' => 'Invalid email or password credentials.'];
        }

        // Check if account is locked
        if (!empty($user['lockout_until']) && strtotime($user['lockout_until']) > time()) {
            $minutes = ceil((strtotime($user['lockout_until']) - time()) / 60);
            return ['success' => false, 'message' => "Account is temporarily locked due to multiple failed attempts. Try again in {$minutes} minutes."];
        }

        if ($user['status'] !== 'active') {
            return ['success' => false, 'message' => 'This account has been deactivated. Please contact the administrator.'];
        }

        // Verify Bcrypt password
        if (password_verify($password, $user['password_hash'])) {
            // Password rehash check if cost upgraded
            if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $updateHashStmt = $db->prepare("UPDATE users SET password_hash = :hash WHERE id = :id");
                $updateHashStmt->execute([':hash' => $newHash, ':id' => $user['id']]);
            }

            // Reset failed attempts & set last login
            $resetStmt = $db->prepare("UPDATE users SET failed_attempts = 0, lockout_until = NULL, last_login_at = NOW() WHERE id = :id");
            $resetStmt->execute([':id' => $user['id']]);

            // Regenerate session ID to prevent fixation attacks
            session_regenerate_id(true);

            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['logged_in_at'] = time();

            return ['success' => true, 'user' => $user];
        }

        // Increment failed attempts
        $failed = ((int)$user['failed_attempts']) + 1;
        $lockout = null;
        if ($failed >= self::MAX_FAILED_ATTEMPTS) {
            $lockout = date('Y-m-d H:i:s', time() + (self::LOCKOUT_MINUTES * 60));
        }

        $failStmt = $db->prepare("UPDATE users SET failed_attempts = :failed, lockout_until = :lockout WHERE id = :id");
        $failStmt->execute([
            ':failed' => $failed,
            ':lockout' => $lockout,
            ':id' => $user['id']
        ]);

        if ($lockout) {
            return ['success' => false, 'message' => "Account locked due to 5 consecutive failed attempts. Please wait " . self::LOCKOUT_MINUTES . " minutes."];
        }

        $remaining = self::MAX_FAILED_ATTEMPTS - $failed;
        return ['success' => false, 'message' => "Invalid email or password. ({$remaining} attempts remaining before temporary lockout)."];
    }

    /**
     * Check if current session is authenticated
     */
    public static function check(): bool
    {
        self::initSession();
        return !empty($_SESSION['user_id']) && !empty($_SESSION['user_role']);
    }

    /**
     * Get currently authenticated user data
     */
    public static function user(): ?array
    {
        self::initSession();
        if (!self::check()) {
            return null;
        }

        return [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'role' => $_SESSION['user_role'],
        ];
    }

    /**
     * Check if user has one of the required roles
     */
    public static function hasRole(array|string $roles): bool
    {
        $user = self::user();
        if (!$user) {
            return false;
        }

        $allowed = is_array($roles) ? $roles : [$roles];
        
        // Super Admin has all privileges
        if ($user['role'] === self::ROLE_SUPER_ADMIN) {
            return true;
        }

        return in_array($user['role'], $allowed, true);
    }

    /**
     * Module capability checker
     */
    public static function can(string $action, string $module): bool
    {
        $user = self::user();
        if (!$user) {
            return false;
        }

        $role = $user['role'];

        if ($role === self::ROLE_SUPER_ADMIN) {
            return true;
        }

        if ($role === self::ROLE_ADMIN) {
            // Admins can manage all content, appointments, settings, and users
            return true;
        }

        if ($role === self::ROLE_RECEPTIONIST) {
            // Receptionists can manage appointments, intake forms, contacts, fees & view schedules
            $allowedModules = ['appointments', 'intakes', 'messages', 'fees', 'schedules', 'faqs'];
            return in_array($module, $allowedModules, true);
        }

        if ($role === self::ROLE_EDITOR) {
            // Editors can edit pages, blog, resources, services, faqs, announcements, reviews
            $allowedModules = ['pages', 'homepage', 'services', 'credentials', 'media', 'announcements', 'faqs', 'reviews', 'resources', 'blog', 'seo', 'verification'];
            return in_array($module, $allowedModules, true);
        }

        return false;
    }

    /**
     * Logout and destroy session
     */
    public static function logout(): void
    {
        self::initSession();
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }
}
