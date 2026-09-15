<?php
/**
 * Database Connection Handler (PDO MySQL)
 * Production-ready prepared statement support.
 */

declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): ?PDO
    {
        if (self::$instance === null) {
            $config = Config::getDbConfig();
            $socket = $config['socket'] ?? '';
            if (!empty($socket)) {
                $dsn = "mysql:unix_socket={$socket};dbname={$config['database']};charset={$config['charset']}";
            } else {
                $port = $config['port'] ?? 3306;
                $dsn = "mysql:host={$config['host']};port={$port};dbname={$config['database']};charset={$config['charset']}";
            }
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci, time_zone = '+05:00'",
            ];

            try {
                self::$instance = new PDO($dsn, $config['username'], $config['password'], $options);
            } catch (PDOException $e) {
                // In production, log rather than expose credentials
                error_log("Database connection error: " . $e->getMessage());
                return null;
            }
        }

        return self::$instance;
    }

    /**
     * Reset the cached PDO instance (useful for testing or reconnecting)
     */
    public static function resetConnection(): void
    {
        self::$instance = null;
    }
}
