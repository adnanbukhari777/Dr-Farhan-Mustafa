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

        $stmt = $db->query("SELECT id, name, email, role, status, phone, failed_attempts, lockout_until, last_login_at, created_at FROM users ORDER BY id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById(int $id): ?array
    {
        $db = Database::getConnection();
        if (!$db || $id <= 0) return null;

        $stmt = $db->prepare("SELECT id, name, email, role, status, phone, failed_attempts, lockout_until, last_login_at, created_at FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function getByEmail(string $email): ?array
    {
        $db = Database::getConnection();
        if (!$db) return null;

        $stmt = $db->prepare("SELECT id, name, email, role, status, phone, failed_attempts, lockout_until, last_login_at, created_at FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => strtolower(trim($email))]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function create(array $data): int|false
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $allowedRoles = ['super_admin', 'admin', 'receptionist', 'editor'];
        $role = in_array($data['role'] ?? '', $allowedRoles, true) ? $data['role'] : 'receptionist';
        $status = in_array($data['status'] ?? '', ['active', 'inactive', 'suspended'], true) ? $data['status'] : 'active';

        $hash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare("
            INSERT INTO users (name, email, password_hash, role, status, phone)
            VALUES (:name, :email, :hash, :role, :status, :phone)
        ");

        $ok = $stmt->execute([
            ':name' => trim((string)$data['name']),
            ':email' => strtolower(trim((string)$data['email'])),
            ':hash' => $hash,
            ':role' => $role,
            ':status' => $status,
            ':phone' => $data['phone'] ?? null
        ]);

        return $ok ? (int)$db->lastInsertId() : false;
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::getConnection();
        if (!$db || $id <= 0) return false;

        $existing = self::getById($id);
        if (!$existing) return false;

        $allowedRoles = ['super_admin', 'admin', 'receptionist', 'editor'];
        $role = in_array($data['role'] ?? '', $allowedRoles, true) ? $data['role'] : $existing['role'];
        $status = in_array($data['status'] ?? '', ['active', 'inactive', 'suspended'], true) ? $data['status'] : $existing['status'];

        $sql = "UPDATE users SET name = :name, email = :email, role = :role, status = :status, phone = :phone";
        $params = [
            ':name' => trim((string)($data['name'] ?? $existing['name'])),
            ':email' => strtolower(trim((string)($data['email'] ?? $existing['email']))),
            ':role' => $role,
            ':status' => $status,
            ':phone' => $data['phone'] ?? $existing['phone'] ?? null,
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

    public static function delete(int $id): bool
    {
        $db = Database::getConnection();
        if (!$db || $id <= 0) return false;

        // Prevent deleting the last super_admin
        $stmt = $db->prepare("SELECT role FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $target = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($target && $target['role'] === 'super_admin') {
            $count = (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'super_admin'")->fetchColumn();
            if ($count <= 1) {
                return false;
            }
        }

        $del = $db->prepare("DELETE FROM users WHERE id = :id");
        return $del->execute([':id' => $id]);
    }
}
