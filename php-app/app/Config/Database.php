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
            $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
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
}
