<?php
/**
 * Dr. Farhan Mustafa Clinic Portal - CSRF Protection Engine
 * Generates, rotates, and validates cryptographically secure tokens.
 */

declare(strict_types=1);

namespace App\Security;

class Csrf
{
    private const TOKEN_KEY = '_csrf_token';
    private const TOKEN_TIME_KEY = '_csrf_token_time';
    private const TOKEN_EXPIRY = 7200; // 2 hours

    /**
     * Start secure session uniformly via Auth::initSession()
     */
    private static function initSession(): void
    {
        Auth::initSession();
    }

    /**
     * Generate or return existing CSRF token
     */
    public static function getToken(): string
    {
        self::initSession();

        if (
            empty($_SESSION[self::TOKEN_KEY]) ||
            empty($_SESSION[self::TOKEN_TIME_KEY]) ||
            (time() - (int)$_SESSION[self::TOKEN_TIME_KEY]) > self::TOKEN_EXPIRY
        ) {
            $_SESSION[self::TOKEN_KEY] = bin2hex(random_bytes(32));
            $_SESSION[self::TOKEN_TIME_KEY] = time();
        }

        return (string)$_SESSION[self::TOKEN_KEY];
    }

    /**
     * Validate an incoming CSRF token (from argument, X-CSRF-Token header, or POST)
     */
    public static function validateToken(?string $token = null): bool
    {
        self::initSession();

        if (empty($token)) {
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
        }

        if (empty($token) || empty($_SESSION[self::TOKEN_KEY])) {
            return false;
        }

        if ((time() - (int)($_SESSION[self::TOKEN_TIME_KEY] ?? 0)) > self::TOKEN_EXPIRY) {
            return false;
        }

        return hash_equals((string)$_SESSION[self::TOKEN_KEY], (string)$token);
    }

    /**
     * Invalidate current session-bound CSRF token during logout
     */
    public static function invalidateToken(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            unset($_SESSION[self::TOKEN_KEY], $_SESSION[self::TOKEN_TIME_KEY]);
        }
    }

    /**
     * Output a hidden HTML input field containing the CSRF token
     */
    public static function inputField(): string
    {
        $token = htmlspecialchars(self::getToken(), ENT_QUOTES, 'UTF-8');
        return '<input type="hidden" name="csrf_token" value="' . $token . '">';
    }
}
