<?php
/**
 * CSRF Protection Engine
 * Generates and validates cryptographically secure tokens.
 */

declare(strict_types=1);

namespace App\Security;

class Csrf
{
    private const TOKEN_KEY = '_csrf_token';
    private const TOKEN_TIME_KEY = '_csrf_token_time';
    private const TOKEN_EXPIRY = 7200; // 2 hours

    /**
     * Start session safely if not already active
     */
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
     * Generate or return existing CSRF token
     */
    public static function getToken(): string
    {
        self::initSession();

        if (
            empty($_SESSION[self::TOKEN_KEY]) ||
            empty($_SESSION[self::TOKEN_TIME_KEY]) ||
            (time() - $_SESSION[self::TOKEN_TIME_KEY]) > self::TOKEN_EXPIRY
        ) {
            $_SESSION[self::TOKEN_KEY] = bin2hex(random_bytes(32));
            $_SESSION[self::TOKEN_TIME_KEY] = time();
        }

        return $_SESSION[self::TOKEN_KEY];
    }

    /**
     * Validate an incoming CSRF token
     */
    public static function validateToken(?string $token): bool
    {
        self::initSession();

        if (empty($token) || empty($_SESSION[self::TOKEN_KEY])) {
            return false;
        }

        if ((time() - ($_SESSION[self::TOKEN_TIME_KEY] ?? 0)) > self::TOKEN_EXPIRY) {
            return false;
        }

        return hash_equals($_SESSION[self::TOKEN_KEY], $token);
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
