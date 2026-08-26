<?php
/**
 * System User Management Model
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class UserModel
{
    public static function getAll(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT id, name, email, role, status, phone, last_login_at, created_at FROM users ORDER BY id ASC");
        return $stmt->fetchAll();
    }

    public static function create(array $data): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare("
            INSERT INTO users (name, email, password_hash, role, status, phone)
            VALUES (:name, :email, :hash, :role, :status, :phone)
        ");

        return $stmt->execute([
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':hash' => $hash,
            ':role' => $data['role'] ?? 'receptionist',
            ':status' => $data['status'] ?? 'active',
            ':phone' => $data['phone'] ?? null
        ]);
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $sql = "UPDATE users SET name = :name, email = :email, role = :role, status = :status, phone = :phone";
        $params = [
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':role' => $data['role'],
            ':status' => $data['status'],
            ':phone' => $data['phone'] ?? null,
            ':id' => $id
        ];

        if (!empty($data['password'])) {
            $sql .= ", password_hash = :hash";
            $params[':hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $sql .= " WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    }
}
