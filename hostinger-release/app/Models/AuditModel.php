<?php
/**
 * Audit Logging Model for Security & Compliance
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use App\Security\Auth;
use PDO;

class AuditModel
{
    public static function log(string $action, string $entityType, ?string $entityId = null, ?array $details = null): void
    {
        $db = Database::getConnection();
        if (!$db) return;

        $user = Auth::user();
        $userId = $user['id'] ?? null;
        $userEmail = $user['email'] ?? 'guest';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 250);
        $detailsJson = $details ? json_encode($details) : null;

        try {
            $stmt = $db->prepare("
                INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details_json, ip_address, user_agent)
                VALUES (:uid, :email, :action, :type, :eid, :details, :ip, :ua)
            ");
            $stmt->execute([
                ':uid' => $userId,
                ':email' => $userEmail,
                ':action' => $action,
                ':type' => $entityType,
                ':eid' => (string)$entityId,
                ':details' => $detailsJson,
                ':ip' => $ip,
                ':ua' => $userAgent
            ]);
        } catch (\Exception $e) {
            // Fail silently on audit log to not interrupt primary workflows
            error_log("Audit log failed: " . $e->getMessage());
        }
    }

    public static function getRecent(int $limit = 50): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->prepare("SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT :limit");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function countRecentByIpAndAction(string $ip, string $action, int $seconds): int
    {
        $db = Database::getConnection();
        if (!$db) return 0;

        try {
            $stmt = $db->prepare("
                SELECT COUNT(*) as count 
                FROM audit_logs 
                WHERE ip_address = :ip 
                  AND action = :action 
                  AND created_at >= DATE_SUB(NOW(), INTERVAL :sec SECOND)
            ");
            $stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
            $stmt->bindValue(':action', $action, PDO::PARAM_STR);
            $stmt->bindValue(':sec', $seconds, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)($row['count'] ?? 0);
        } catch (\Exception $e) {
            return 0;
        }
    }
}
