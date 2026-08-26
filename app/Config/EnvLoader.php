<?php
/**
 * Protected Environment Variable Loader
 * Safely loads key-value pairs from .env without exposing secrets.
 */

declare(strict_types=1);

namespace App\Config;

class EnvLoader
{
    private static bool $loaded = false;

    /**
     * Load .env file safely into $_ENV and putenv
     */
    public static function load(string $path = ''): void
    {
        if (self::$loaded) {
            return;
        }

        if (empty($path)) {
            $path = dirname(__DIR__, 2) . '/.env';
        }

        if (!file_exists($path) || !is_readable($path)) {
            // Graceful fallback: do not crash if .env is missing
            self::$loaded = true;
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            self::$loaded = true;
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            // Skip comments and empty lines
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            // Split by first equals sign
            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) {
                continue;
            }

            $key = trim($parts[0]);
            $val = trim($parts[1]);

            // Strip surrounding quotes
            if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                $val = substr($val, 1, -1);
            }

            if (!empty($key)) {
                if (!array_key_exists($key, $_ENV)) {
                    $_ENV[$key] = $val;
                }
                if (!array_key_exists($key, $_SERVER)) {
                    $_SERVER[$key] = $val;
                }
                putenv("{$key}={$val}");
            }
        }

        self::$loaded = true;
    }

    /**
     * Safely retrieve an environment variable
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        self::load();
        $val = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        if ($val === false || $val === null || $val === '') {
            return $default;
        }

        // Parse booleans
        $lower = strtolower((string)$val);
        if ($lower === 'true' || $lower === '(true)') return true;
        if ($lower === 'false' || $lower === '(false)') return false;

        return $val;
    }

    /**
     * Check if a feature or credential is configured (not placeholder or empty)
     */
    public static function isConfigured(string $key): bool
    {
        $val = self::get($key);
        if (empty($val) || !is_string($val)) {
            return false;
        }
        // Check for common placeholders
        if (str_starts_with($val, 'CHANGE_AFTER_') || 
            str_starts_with($val, 'MY_') || 
            $val === 'your_password_here') {
            return false;
        }
        return true;
    }
}
