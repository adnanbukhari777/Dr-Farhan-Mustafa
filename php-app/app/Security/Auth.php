<?php
/**
 * Dr. Farhan Mustafa Clinic Portal - Authentication & RBAC Engine
 * Handles secure session initialization, timing-safe credential verification,
 * brute-force account lockout throttling, and role-based access control.
 *
 * Roles: super_admin, admin, receptionist, editor
 */

declare(strict_types=1);

namespace App\Security;

use App\Config\Database;
use App\Config\EnvLoader;
use App\Models\AuditModel;
use PDO;

class Auth
{
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_CLINICIAN = 'clinician';
    public const ROLE_RECEPTIONIST = 'receptionist';
    public const ROLE_EDITOR = 'editor';

    public const ROLE_PERMISSIONS = [
        self::ROLE_SUPER_ADMIN => ['*'],
        self::ROLE_ADMIN => [
            'appointments.view',
            'appointments.manage',
            'schedules.view',
            'schedules.manage',
            'cms.manage',
            'ai.view_settings',
            'ai.view_logs',
            'ai.manage_knowledge',
            'smtp.view',
            'contact.view',
        ],
        self::ROLE_CLINICIAN => [
            'appointments.view',
            'appointments.manage',
            'appointments.clinical_intake_view',
            'appointments.clinical_manage',
            'schedules.view',
            'ai.manage_knowledge',
        ],
        self::ROLE_RECEPTIONIST => [
            'appointments.view',
            'appointments.manage',
            'schedules.view',
            'contact.view',
        ],
        self::ROLE_EDITOR => [
            'cms.manage',
            'ai.manage_knowledge',
        ],
    ];

    public const MAX_FAILED_ATTEMPTS = 5;
    public const LOCKOUT_MINUTES = 15;
    public const IP_BURST_LIMIT_PER_MINUTE = 5;     // Maximum rapid login submissions per minute
    public const IP_FAILED_LIMIT_PER_15MIN = 15;    // Maximum failed attempts from same network / 15 mins
    public const IDLE_TIMEOUT_SECONDS = 7200;      // 2 hours idle expiration
    public const ABSOLUTE_TIMEOUT_SECONDS = 43200;  // 12 hours absolute session expiration

    /**
     * Get server HMAC secret for identifier hashing
     */
    public static function getIdentifierSecret(): string
    {
        $secret = (string)(EnvLoader::get('AUTH_HMAC_SECRET') ?: EnvLoader::get('APP_KEY'));
        if (empty($secret)) {
            $isDev = (EnvLoader::get('APP_ENV', 'production') !== 'production');
            if ($isDev) {
                $secret = 'drfarhan_clinic_portal_hmac_secret_2026_k9x2';
            } else {
                throw new \RuntimeException('AUTH_HMAC_SECRET must be configured in environment.');
            }
        }
        return $secret;
    }

    /**
     * Keyed HMAC-SHA-256 for email-derived identifiers using server-only secret.
     * Never expose secret or raw identifier to frontend.
     */
    public static function hashEmail(string $email): string
    {
        $secret = self::getIdentifierSecret();
        $cleanEmail = strtolower(trim($email));
        return hash_hmac('sha256', $cleanEmail, $secret);
    }

    /**
     * Start secure PHP session with hardened cookie flags and timeout enforcement
     */
    public static function initSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            if (!headers_sent()) {
                $isHttps = (
                    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
                    (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) ||
                    (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
                );

                // Harden session configuration before start
                ini_set('session.use_strict_mode', '1');
                ini_set('session.use_only_cookies', '1');
                ini_set('session.use_trans_sid', '0');
                ini_set('session.cookie_httponly', '1');
                ini_set('session.cookie_samesite', 'Lax');
                if ($isHttps) {
                    ini_set('session.cookie_secure', '1');
                }

                // Reject session IDs passed through GET or POST query parameters
                $sessionName = session_name();
                if (isset($_GET[$sessionName])) {
                    unset($_GET[$sessionName]);
                }
                if (isset($_POST[$sessionName])) {
                    unset($_POST[$sessionName]);
                }

                session_set_cookie_params([
                    'lifetime' => 0, // Session cookie persists until browser closed
                    'path' => '/',
                    'domain' => '',
                    'secure' => $isHttps,
                    'httponly' => true,
                    'samesite' => 'Lax',
                ]);

                session_start();
            } else {
                @session_start();
            }
        }

        // Validate session expiration if user is authenticated
        if (!empty($_SESSION['user_id'])) {
            $now = time();

            // 1. Idle session timeout check (2 hours)
            if (isset($_SESSION['last_activity']) && ($now - (int)$_SESSION['last_activity']) > self::IDLE_TIMEOUT_SECONDS) {
                self::logout();
                return;
            }

            // 2. Absolute session timeout check (12 hours)
            if (isset($_SESSION['logged_in_at']) && ($now - (int)$_SESSION['logged_in_at']) > self::ABSOLUTE_TIMEOUT_SECONDS) {
                self::logout();
                return;
            }

            // Update last activity timestamp
            $_SESSION['last_activity'] = $now;
        }
    }

    /**
     * Authenticate user credentials with brute-force lockout and timing attack protection
     */
    public static function attempt(string $email, string $password): array
    {
        self::initSession();

        // 1. Rapid burst submission rate check in session
        $burstCheck = self::checkBurstRateLimit();
        if (!$burstCheck['allowed']) {
            return [
                'success' => false,
                'error' => $burstCheck['error'],
                'message' => $burstCheck['message']
            ];
        }

        $db = Database::getConnection();

        if (!$db) {
            return [
                'success' => false,
                'error' => 'database_error',
                'message' => 'Service temporarily unavailable. Please try again later.'
            ];
        }

        // 2. Request-level network throttling via audit logs
        $dbRateCheck = self::checkDbRateLimit($db);
        if (!$dbRateCheck['allowed']) {
            return [
                'success' => false,
                'error' => $dbRateCheck['error'],
                'message' => $dbRateCheck['message']
            ];
        }

        $cleanEmail = strtolower(trim($email));

        if (empty($cleanEmail) || empty($password)) {
            return [
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Email and password are required.'
            ];
        }

        // Fetch user by email
        $stmt = $db->prepare("SELECT id, name, email, password_hash, role, status, failed_attempts, lockout_until FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $cleanEmail]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Mitigation against timing attacks for non-existent users
        if (!$user) {
            self::recordFailedAttempt();
            password_verify($password, '$2y$10$e0MYzXyjpJS7Pd0RVvPGcehkBfg7.C.s5l5aPzK60RzZf1gU4Uv8O');
            $clientIp = self::getClientIp();
            AuditModel::log('failed_login_unknown_email', 'auth', null, [
                'email_hash' => self::hashEmail($cleanEmail),
                'ip' => $clientIp
            ]);
            return [
                'success' => false,
                'error' => 'invalid_credentials',
                'message' => 'Invalid email or password credentials.'
            ];
        }

        // Check if account is currently locked out
        if (!empty($user['lockout_until'])) {
            $lockoutTimestamp = strtotime((string)$user['lockout_until']);
            if ($lockoutTimestamp > time()) {
                $remainingMinutes = (int)ceil(($lockoutTimestamp - time()) / 60);
                $clientIp = self::getClientIp();
                AuditModel::log('login_blocked_lockout', 'auth', (string)$user['id'], [
                    'email_hash' => self::hashEmail((string)$user['email']),
                    'remaining_minutes' => $remainingMinutes,
                    'ip' => $clientIp
                ]);
                self::recordFailedAttempt();
                password_verify($password, '$2y$10$e0MYzXyjpJS7Pd0RVvPGcehkBfg7.C.s5l5aPzK60RzZf1gU4Uv8O');
                return [
                    'success' => false,
                    'error' => 'invalid_credentials',
                    'message' => 'Invalid email or password credentials.'
                ];
            } else {
                // Lockout expired: reset lockout atomically
                $unlockStmt = $db->prepare("UPDATE users SET failed_attempts = 0, lockout_until = NULL WHERE id = :id");
                $unlockStmt->execute([':id' => $user['id']]);
                $user['failed_attempts'] = 0;
                $user['lockout_until'] = null;
            }
        }

        // Check if account status is active
        if (($user['status'] ?? '') !== 'active') {
            $clientIp = self::getClientIp();
            AuditModel::log('login_blocked_deactivated', 'auth', (string)$user['id'], [
                'email_hash' => self::hashEmail((string)$user['email']),
                'status' => $user['status'],
                'ip' => $clientIp
            ]);
            self::recordFailedAttempt();
            password_verify($password, '$2y$10$e0MYzXyjpJS7Pd0RVvPGcehkBfg7.C.s5l5aPzK60RzZf1gU4Uv8O');
            return [
                'success' => false,
                'error' => 'invalid_credentials',
                'message' => 'Invalid email or password credentials.'
            ];
        }

        // Verify password hash
        if (password_verify($password, (string)$user['password_hash'])) {
            // Upgrade password hash if algorithmic cost changed
            if (password_needs_rehash((string)$user['password_hash'], PASSWORD_DEFAULT)) {
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $updateHashStmt = $db->prepare("UPDATE users SET password_hash = :hash WHERE id = :id");
                $updateHashStmt->execute([':hash' => $newHash, ':id' => $user['id']]);
            }

            // Reset failed attempts & update last login timestamps
            $resetStmt = $db->prepare("
                UPDATE users 
                SET failed_attempts = 0, 
                    lockout_until = NULL, 
                    last_login_at = NOW(), 
                    last_login = NOW() 
                WHERE id = :id
            ");
            $resetStmt->execute([':id' => $user['id']]);

            // Regenerate session ID to prevent session fixation
            if (session_status() === PHP_SESSION_ACTIVE && !headers_sent()) {
                session_regenerate_id(true);
            }
            self::clearFailedAttempts();

            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['user_name'] = (string)$user['name'];
            $_SESSION['user_email'] = (string)$user['email'];
            $_SESSION['user_role'] = (string)$user['role'];
            $_SESSION['logged_in_at'] = time();
            $_SESSION['last_activity'] = time();

            AuditModel::log('user_login_success', 'auth', (string)$user['id'], [
                'email_hash' => self::hashEmail((string)$user['email']),
                'role' => $user['role'],
                'ip' => self::getClientIp()
            ]);

            return [
                'success' => true,
                'message' => 'Authenticated successfully.',
                'user' => [
                    'id' => (int)$user['id'],
                    'name' => (string)$user['name'],
                    'email' => (string)$user['email'],
                    'role' => (string)$user['role'],
                    'status' => (string)$user['status'],
                ]
            ];
        }

        // On password mismatch: increment failed attempts atomically
        self::recordFailedAttempt();
        $clientIp = self::getClientIp();
        $emailHash = self::hashEmail((string)$user['email']);

        // Atomic update in database preventing race conditions under concurrency
        $failStmt = $db->prepare("
            UPDATE users 
            SET failed_attempts = failed_attempts + 1,
                lockout_until = CASE 
                    WHEN failed_attempts >= :max_attempts 
                    THEN DATE_ADD(NOW(), INTERVAL :lockout_minutes MINUTE) 
                    ELSE lockout_until 
                END 
            WHERE id = :id
        ");
        $failStmt->execute([
            ':max_attempts' => self::MAX_FAILED_ATTEMPTS,
            ':lockout_minutes' => self::LOCKOUT_MINUTES,
            ':id' => $user['id']
        ]);

        // Query updated attempts count for internal logging
        $checkStmt = $db->prepare("SELECT failed_attempts FROM users WHERE id = :id LIMIT 1");
        $checkStmt->execute([':id' => $user['id']]);
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $newFailed = (int)($row['failed_attempts'] ?? 0);

        if ($newFailed >= self::MAX_FAILED_ATTEMPTS) {
            AuditModel::log('account_lockout_triggered', 'auth', (string)$user['id'], [
                'email_hash' => $emailHash,
                'failed_attempts' => $newFailed,
                'lockout_minutes' => self::LOCKOUT_MINUTES,
                'ip' => $clientIp
            ]);
        } else {
            AuditModel::log('failed_login_invalid_password', 'auth', (string)$user['id'], [
                'email_hash' => $emailHash,
                'failed_attempts' => $newFailed,
                'ip' => $clientIp
            ]);
        }

        // Return generic public response without leaking account state
        return [
            'success' => false,
            'error' => 'invalid_credentials',
            'message' => 'Invalid email or password credentials.'
        ];
    }

    /**
     * Check if the current session is valid and authenticated
     */
    public static function check(): bool
    {
        self::initSession();
        return !empty($_SESSION['user_id']) && !empty($_SESSION['user_role']);
    }

    /**
     * Return currently authenticated user data, or null
     */
    public static function user(): ?array
    {
        self::initSession();
        if (!self::check()) {
            return null;
        }

        return [
            'id' => (int)$_SESSION['user_id'],
            'name' => (string)$_SESSION['user_name'],
            'email' => (string)$_SESSION['user_email'],
            'role' => (string)$_SESSION['user_role'],
        ];
    }

    /**
     * Check if authenticated user matches one of the specified roles
     */
    public static function hasRole(array|string $roles): bool
    {
        $user = self::user();
        if (!$user) {
            return false;
        }

        $allowed = is_array($roles) ? $roles : [$roles];

        // Super Admin has universal authorization across all modules
        if ($user['role'] === self::ROLE_SUPER_ADMIN) {
            return true;
        }

        return in_array($user['role'], $allowed, true);
    }

    /**
     * RBAC module capability checker
     */
    public static function can(string $action, string $module): bool
    {
        $user = self::user();
        if (!$user) {
            return false;
        }

        $role = $user['role'];

        if ($role === self::ROLE_SUPER_ADMIN || $role === self::ROLE_ADMIN) {
            return true;
        }

        if ($role === self::ROLE_CLINICIAN) {
            $allowedModules = ['appointments', 'intakes', 'clinical', 'schedules', 'ai_knowledge'];
            return in_array($module, $allowedModules, true);
        }

        if ($role === self::ROLE_RECEPTIONIST) {
            $allowedModules = ['appointments', 'intakes', 'messages', 'fees', 'schedules', 'faqs', 'facts', 'ai_conversations', 'ai_knowledge'];
            return in_array($module, $allowedModules, true);
        }

        if ($role === self::ROLE_EDITOR) {
            $allowedModules = ['pages', 'homepage', 'services', 'credentials', 'media', 'announcements', 'faqs', 'reviews', 'resources', 'blog', 'seo', 'verification', 'facts', 'ai_knowledge'];
            return in_array($module, $allowedModules, true);
        }

        return false;
    }

    /**
     * Send standard JSON response and terminate execution
     */
    public static function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Centralized Authentication Guard:
     * Enforces active valid session. Returns authenticated user array or terminates with 401.
     */
    public static function requireAuthentication(): array
    {
        self::initSession();
        $sessionUser = self::user();
        if (!$sessionUser) {
            self::recordAuditEvent('authorization_unauthenticated', 'auth', null, [
                'uri' => $_SERVER['REQUEST_URI'] ?? '',
                'method' => $_SERVER['REQUEST_METHOD'] ?? '',
            ]);
            self::jsonResponse([
                'success' => false,
                'error' => 'unauthenticated',
                'message' => 'Authentication required to access this resource.'
            ], 401);
        }

        // Verify that database user remains active and retains a valid role
        $db = Database::getConnection();
        if ($db) {
            $stmt = $db->prepare("SELECT id, name, email, role, status FROM users WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $sessionUser['id']]);
            $dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$dbUser || $dbUser['status'] !== 'active') {
                self::logout();
                self::recordAuditEvent('authorization_user_inactive_or_deleted', 'auth', (string)$sessionUser['id'], [
                    'reason' => !$dbUser ? 'user_deleted' : 'user_inactive',
                    'uri' => $_SERVER['REQUEST_URI'] ?? '',
                ]);
                self::jsonResponse([
                    'success' => false,
                    'error' => 'unauthenticated',
                    'message' => 'Account is no longer active or does not exist. Please log in again.'
                ], 401);
            }

            // Check that canonical role is supported
            $canonicalRoles = [self::ROLE_SUPER_ADMIN, self::ROLE_ADMIN, self::ROLE_CLINICIAN, self::ROLE_RECEPTIONIST, self::ROLE_EDITOR];
            if (!in_array($dbUser['role'], $canonicalRoles, true)) {
                self::logout();
                self::jsonResponse([
                    'success' => false,
                    'error' => 'forbidden',
                    'message' => 'Unknown or unsupported user role.'
                ], 403);
            }

            // Keep session role, name, email in sync with live database record
            $_SESSION['user_role'] = (string)$dbUser['role'];
            $_SESSION['user_name'] = (string)$dbUser['name'];
            $_SESSION['user_email'] = (string)$dbUser['email'];

            return [
                'id' => (int)$dbUser['id'],
                'name' => (string)$dbUser['name'],
                'email' => (string)$dbUser['email'],
                'role' => (string)$dbUser['role'],
                'status' => (string)$dbUser['status'],
            ];
        }

        return $sessionUser;
    }

    /**
     * Centralized Role Guard:
     * Enforces user has at least one of the allowed roles. Super Admin is allowed by default unless allowSuperAdmin is false.
     * Returns authenticated user array or terminates with 403.
     */
    public static function requireRole(array|string $roles, bool $allowSuperAdmin = true): array
    {
        $user = self::requireAuthentication();
        $allowed = is_array($roles) ? $roles : [$roles];

        if (($allowSuperAdmin && $user['role'] === self::ROLE_SUPER_ADMIN) || in_array($user['role'], $allowed, true)) {
            return $user;
        }

        self::recordAuditEvent('authorization_forbidden_role', 'auth', (string)$user['id'], [
            'user_role' => $user['role'],
            'required_roles' => $allowed,
            'uri' => $_SERVER['REQUEST_URI'] ?? '',
            'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        ]);

        self::jsonResponse([
            'success' => false,
            'error' => 'forbidden',
            'message' => 'Access denied. You do not have the required role to perform this action.'
        ], 403);
    }

    /**
     * Strict Clinician Guard:
     * Enforces that the current authenticated user has exclusively the 'clinician' role.
     * All non-clinicians (including super_admin, admin, receptionist, editor) receive 403 Forbidden.
     */
    public static function requireClinician(): array
    {
        $user = self::requireAuthentication();
        if ($user['role'] === self::ROLE_CLINICIAN) {
            return $user;
        }

        self::recordAuditEvent('authorization_forbidden_clinician_only', 'auth', (string)$user['id'], [
            'user_role' => $user['role'],
            'required_role' => self::ROLE_CLINICIAN,
            'uri' => $_SERVER['REQUEST_URI'] ?? '',
            'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        ]);

        self::jsonResponse([
            'success' => false,
            'error' => 'forbidden',
            'message' => 'Access denied. Access to full sensitive clinical intake records is strictly restricted to the treating clinician role only.'
        ], 403);
    }

    /**
     * Centralized Permission Guard:
     * Enforces specific permission based on the role matrix. Default-deny.
     * Returns authenticated user array or terminates with 403.
     */
    public static function requirePermission(string $permission): array
    {
        $user = self::requireAuthentication();
        $role = $user['role'];

        if ($role === self::ROLE_SUPER_ADMIN) {
            return $user;
        }

        $grantedPermissions = self::ROLE_PERMISSIONS[$role] ?? [];
        if (in_array('*', $grantedPermissions, true) || in_array($permission, $grantedPermissions, true)) {
            return $user;
        }

        self::recordAuditEvent('authorization_forbidden_permission', 'auth', (string)$user['id'], [
            'user_role' => $role,
            'required_permission' => $permission,
            'uri' => $_SERVER['REQUEST_URI'] ?? '',
            'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        ]);

        self::jsonResponse([
            'success' => false,
            'error' => 'forbidden',
            'message' => 'Access denied. Insufficient permissions for requested action.'
        ], 403);
    }

    /**
     * Centralized CSRF Guard:
     * Enforces valid CSRF token on ALL state-changing requests (POST, PUT, PATCH, DELETE).
     * Returns true or terminates with 403.
     */
    public static function requireCsrf(): void
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return;
        }

        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? null;
        if (empty($token)) {
            $raw = file_get_contents('php://input');
            if (!empty($raw)) {
                $json = json_decode($raw, true);
                if (is_array($json) && !empty($json['csrf_token'])) {
                    $token = (string)$json['csrf_token'];
                }
            }
        }

        if (!Csrf::validateToken($token)) {
            $user = self::user();
            self::recordAuditEvent('csrf_validation_failed', 'csrf', $user ? (string)$user['id'] : null, [
                'uri' => $_SERVER['REQUEST_URI'] ?? '',
                'method' => $method,
            ]);

            self::jsonResponse([
                'success' => false,
                'error' => 'invalid_csrf',
                'message' => 'Security token invalid or expired. Please refresh the page and try again.'
            ], 403);
        }
    }

    /**
     * Centralized JSON Request Validator:
     * Validates request body is valid JSON for POST/PUT/PATCH requests.
     */
    public static function requireJsonRequest(): array
    {
        $raw = file_get_contents('php://input');
        if (empty(trim((string)$raw))) {
            return [];
        }

        $decoded = json_decode($raw, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
            self::jsonResponse([
                'success' => false,
                'error' => 'invalid_json',
                'message' => 'Invalid or malformed JSON payload.'
            ], 400);
        }

        return $decoded;
    }

    /**
     * Centralized Audit Logger
     */
    public static function recordAuditEvent(string $action, string $entityType, ?string $entityId = null, ?array $details = null): void
    {
        $user = self::user();
        $safeDetails = $details ?? [];
        if ($user) {
            $safeDetails['actor_id'] = $user['id'];
            $safeDetails['actor_role'] = $user['role'];
            $safeDetails['actor_email_hash'] = self::hashEmail($user['email']);
        }
        $safeDetails['ip'] = self::getClientIp();
        try {
            AuditModel::log($action, $entityType, $entityId, $safeDetails);
        } catch (\Throwable $e) {
            error_log("Audit log failed: " . $e->getMessage());
        }
    }

    /**
     * Complete session destruction & cookie revocation during logout
     */
    public static function logout(): void
    {
        self::initSession();

        if (!empty($_SESSION['user_id'])) {
            AuditModel::log('user_logout', 'auth', (string)$_SESSION['user_id'], [
                'email_hash' => !empty($_SESSION['user_email']) ? self::hashEmail((string)$_SESSION['user_email']) : null,
                'ip' => self::getClientIp()
            ]);
        }

        Csrf::invalidateToken();

        $_SESSION = [];

        if (ini_get("session.use_cookies")) {
            $isHttps = (
                (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
                (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) ||
                (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
            );
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                [
                    'expires' => time() - 86400,
                    'path' => $params['path'] ?: '/',
                    'domain' => $params['domain'] ?: '',
                    'secure' => $isHttps,
                    'httponly' => true,
                    'samesite' => 'Lax'
                ]
            );
        }

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
    }

    /**
     * Determine if rate limiting can be safely bypassed for server-side integration tests.
     * Strictly server-side only, fails closed in production, cannot be triggered via HTTP inputs.
     */
    public static function canBypassRateLimit(): bool
    {
        $env = EnvLoader::get('APP_ENV', 'production');
        if ($env !== 'testing') {
            return false;
        }

        // Strictly server-side only: verify CLI runtime or internal testing constant
        $isCli = (php_sapi_name() === 'cli');
        $isTestConstant = (defined('APP_TESTING') && APP_TESTING === true);

        return ($isCli || $isTestConstant);
    }

    /**
     * Check rapid burst submissions in the current session
     */
    public static function checkBurstRateLimit(): array
    {
        if (self::canBypassRateLimit()) {
            return ['allowed' => true];
        }

        self::initSession();
        $now = time();

        if (!isset($_SESSION['login_attempt_timestamps']) || !is_array($_SESSION['login_attempt_timestamps'])) {
            $_SESSION['login_attempt_timestamps'] = [];
        }

        $_SESSION['login_attempt_timestamps'] = array_values(array_filter(
            $_SESSION['login_attempt_timestamps'],
            static fn($t) => ($now - (int)$t) < 60
        ));

        if (count($_SESSION['login_attempt_timestamps']) >= self::IP_BURST_LIMIT_PER_MINUTE) {
            return [
                'allowed' => false,
                'error' => 'rate_limited',
                'message' => 'Too many login attempts in a short period. Please wait 60 seconds before trying again.'
            ];
        }

        return ['allowed' => true];
    }

    /**
     * Check network-level request rate limiting via database audit logs
     */
    public static function checkDbRateLimit(PDO $db): array
    {
        if (self::canBypassRateLimit()) {
            return ['allowed' => true];
        }

        $ip = self::getClientIp();
        try {
            $stmt = $db->prepare("
                SELECT 
                    COUNT(*) AS total_fails,
                    SUM(CASE WHEN created_at >= (NOW() - INTERVAL 60 SECOND) THEN 1 ELSE 0 END) AS burst_fails
                FROM audit_logs
                WHERE ip_address = :ip
                  AND action IN ('failed_login_unknown_email', 'failed_login_invalid_password', 'login_blocked_lockout', 'rate_limit_exceeded')
                  AND created_at >= (NOW() - INTERVAL 15 MINUTE)
            ");
            $stmt->execute([':ip' => $ip]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $burst = (int)($row['burst_fails'] ?? 0);
                $total = (int)($row['total_fails'] ?? 0);

                if ($burst >= self::IP_BURST_LIMIT_PER_MINUTE) {
                    AuditModel::log('rate_limit_exceeded', 'auth', null, ['ip' => $ip, 'type' => 'rapid_burst']);
                    return [
                        'allowed' => false,
                        'error' => 'rate_limited',
                        'message' => 'Too many rapid login attempts detected. Please wait 60 seconds before trying again.'
                    ];
                }

                if ($total >= self::IP_FAILED_LIMIT_PER_15MIN) {
                    AuditModel::log('rate_limit_exceeded', 'auth', null, ['ip' => $ip, 'type' => 'network_aggregate']);
                    return [
                        'allowed' => false,
                        'error' => 'rate_limited',
                        'message' => 'Too many failed login attempts from this network. Please wait 15 minutes before trying again.'
                    ];
                }
            }
        } catch (\Throwable $e) {
            error_log("DB Rate Limit query check error: " . $e->getMessage());
        }

        return ['allowed' => true];
    }

    /**
     * Resolve and validate the client IP address securely.
     * Uses REMOTE_ADDR by default. Forwarded headers are only inspected if the immediate
     * connection originated from an explicitly configured trusted reverse proxy.
     */
    public static function getClientIp(): string
    {
        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

        if (!filter_var($remoteAddr, FILTER_VALIDATE_IP)) {
            $remoteAddr = '127.0.0.1';
        }

        // Check if trusted reverse proxy IP list is configured in environment
        $trustedProxiesRaw = getenv('TRUSTED_PROXIES') ?: ($_ENV['TRUSTED_PROXIES'] ?? '');

        if (!empty($trustedProxiesRaw)) {
            $trustedProxies = array_filter(array_map('trim', explode(',', (string)$trustedProxiesRaw)));

            if (in_array($remoteAddr, $trustedProxies, true)) {
                // Connection came from a trusted proxy: safely inspect X-Forwarded-For
                $forwardedFor = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
                if (!empty($forwardedFor)) {
                    $ips = array_map('trim', explode(',', $forwardedFor));
                    foreach ($ips as $ip) {
                        if (filter_var($ip, FILTER_VALIDATE_IP)) {
                            if (!in_array($ip, $trustedProxies, true)) {
                                return $ip;
                            }
                        }
                    }
                }
            }
        }

        // Untrusted direct client or missing trusted proxy config: ALWAYS return validated REMOTE_ADDR
        return $remoteAddr;
    }

    /**
     * Record a failed login attempt timestamp
     */
    public static function recordFailedAttempt(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            self::initSession();
        }
        if (!isset($_SESSION['login_attempt_timestamps']) || !is_array($_SESSION['login_attempt_timestamps'])) {
            $_SESSION['login_attempt_timestamps'] = [];
        }
        $_SESSION['login_attempt_timestamps'][] = time();
    }

    /**
     * Clear recorded attempt timestamps upon successful authentication
     */
    public static function clearFailedAttempts(): void
    {
        if (isset($_SESSION['login_attempt_timestamps'])) {
            unset($_SESSION['login_attempt_timestamps']);
        }
    }
}
