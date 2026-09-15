<?php
/**
 * Dr. Farhan Mustafa Clinic Portal - Authentication Controller
 * Handles RESTful API and session endpoints for Admin CMS login, logout,
 * session status verification, and CSRF token provisioning.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Security\Auth;
use App\Security\Csrf;
use App\Models\AuditModel;

class AuthController
{
    /**
     * Send standard JSON response and terminate execution
     */
    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * GET /api/auth/csrf
     * Returns a fresh or active CSRF token for secure state-changing requests
     */
    public function csrf(): void
    {
        $this->jsonResponse([
            'success' => true,
            'csrf_token' => Csrf::getToken(),
        ]);
    }

    /**
     * POST /api/auth/login
     * Canonical authentication endpoint accepting JSON payload or form-encoded POST
     */
    public function login(): void
    {
        // Parse request payload (support application/json and application/x-www-form-urlencoded)
        $rawInput = file_get_contents('php://input');
        $jsonInput = !empty($rawInput) ? json_decode($rawInput, true) : null;

        $email = $jsonInput['email'] ?? $_POST['email'] ?? '';
        $password = $jsonInput['password'] ?? $_POST['password'] ?? '';
        $token = $jsonInput['csrf_token'] ?? $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        // CSRF Token Validation
        if (!Csrf::validateToken($token)) {
            $this->jsonResponse([
                'success' => false,
                'error' => 'invalid_csrf',
                'message' => 'Security token invalid or expired. Please refresh the page and try again.',
            ], 403);
        }

        // Input Validation
        if (empty(trim((string)$email)) || empty((string)$password)) {
            $this->jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Email address and password are required.',
            ], 422);
        }

        // Execute authentication attempt via Auth engine
        $result = Auth::attempt((string)$email, (string)$password);

        if ($result['success']) {
            $this->jsonResponse([
                'success' => true,
                'message' => 'Authenticated successfully.',
                'user' => $result['user'],
                'csrf_token' => Csrf::getToken(),
            ], 200);
        }

        // Map authentication error to accurate HTTP status code
        // Account lockout, deactivation, and invalid credentials all return 401 generic response
        $statusCode = 401;
        $errorCode = $result['error'] ?? 'invalid_credentials';

        if ($errorCode === 'rate_limited') {
            $statusCode = 429; // Request/network throttle applicable to both known & unknown
        } elseif ($errorCode === 'database_error') {
            $statusCode = 500; // Internal Server Error
        }

        $this->jsonResponse([
            'success' => false,
            'error' => $errorCode,
            'message' => $result['message'] ?? 'Authentication failed.',
        ], $statusCode);
    }

    /**
     * GET /api/auth/session
     * Checks current session validity and returns authenticated user details
     */
    public function session(): void
    {
        if (Auth::check()) {
            $user = Auth::user();
            $role = $user['role'] ?? '';
            $permissions = Auth::ROLE_PERMISSIONS[$role] ?? [];
            $this->jsonResponse([
                'authenticated' => true,
                'user' => $user,
                'permissions' => $permissions,
                'csrf_token' => Csrf::getToken(),
            ], 200);
        }

        $this->jsonResponse([
            'authenticated' => false,
            'user' => null,
            'permissions' => [],
            'csrf_token' => Csrf::getToken(),
        ], 401);
    }

    /**
     * POST /api/auth/logout
     * Revokes active session, destroys cookies, and returns clean state
     * Requires POST method, active session, and valid session-bound CSRF token
     */
    public function logout(): void
    {
        // 1. Enforce POST method only
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'success' => false,
                'error' => 'method_not_allowed',
                'message' => 'Method not allowed. POST required.',
            ], 405);
        }

        // 2. Require active session
        if (!Auth::check()) {
            $this->jsonResponse([
                'success' => false,
                'error' => 'unauthenticated',
                'message' => 'No active session found.',
            ], 401);
        }

        // 3. Require valid session-bound CSRF token
        $rawInput = file_get_contents('php://input');
        $jsonInput = !empty($rawInput) ? json_decode($rawInput, true) : null;
        $token = $jsonInput['csrf_token'] ?? $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

        if (!Csrf::validateToken($token)) {
            $this->jsonResponse([
                'success' => false,
                'error' => 'invalid_csrf',
                'message' => 'Security token invalid or expired.',
            ], 403);
        }

        // 4. Perform complete logout & session revocation
        Auth::logout();

        // 5. Return success and omit csrf_token from logout response
        $this->jsonResponse([
            'success' => true,
            'message' => 'Signed out successfully.',
        ], 200);
    }

    /**
     * Legacy HTML Form Login Handler (for server-rendered admin fallback)
     */
    public static function handleLogin(): void
    {
        $error = null;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (!Csrf::validateToken($token)) {
                $error = 'Security session expired. Please refresh and try again.';
            } else {
                $email = $_POST['email'] ?? '';
                $password = $_POST['password'] ?? '';

                $result = Auth::attempt((string)$email, (string)$password);

                if ($result['success']) {
                    header('Location: index.php?route=admin');
                    exit;
                } else {
                    $error = $result['message'];
                }
            }
        }

        $viewsPath = defined('APP_ROOT') ? APP_ROOT . '/app/Views/admin/login.php' : __DIR__ . '/../Views/admin/login.php';
        if (file_exists($viewsPath)) {
            require_once $viewsPath;
        } else {
            echo "Admin Login Form";
        }
    }

    /**
     * Legacy HTML Form Logout Handler
     */
    public static function handleLogout(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
            if (Csrf::validateToken($token)) {
                Auth::logout();
            }
        }
        header('Location: index.php?route=login');
        exit;
    }
}
