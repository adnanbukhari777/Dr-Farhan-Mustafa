<?php
/**
 * Settings & Configuration Model
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class SettingModel
{
    public static function getAll(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT setting_key, setting_value, setting_group, description, is_public FROM settings");
        $results = $stmt->fetchAll();

        $settings = [];
        foreach ($results as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        return $settings;
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $db = Database::getConnection();
        if (!$db) return $default;

        $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = :key LIMIT 1");
        $stmt->execute([':key' => $key]);
        $row = $stmt->fetch();
        return $row ? (string)$row['setting_value'] : $default;
    }

    public static function set(string $key, ?string $value, string $group = 'general', ?string $desc = null): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $stmt = $db->prepare("
            INSERT INTO settings (setting_key, setting_value, setting_group, description)
            VALUES (:key, :val, :group, :desc)
            ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                setting_group = VALUES(setting_group),
                description = COALESCE(VALUES(description), description)
        ");

        return $stmt->execute([
            ':key' => $key,
            ':val' => $value,
            ':group' => $group,
            ':desc' => $desc
        ]);
    }
}
