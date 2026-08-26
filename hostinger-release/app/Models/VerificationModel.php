<?php
/**
 * Facts Verification Queue Model
 * Ensures zero unverified claims go live without explicit doctor/clinic approval.
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class VerificationModel
{
    public static function getAll(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT * FROM facts_verification_queue ORDER BY FIELD(status, 'pending_verification', 'needs_doctor_approval', 'verified', 'rejected'), id ASC");
        return $stmt->fetchAll();
    }

    public static function getPendingCount(): int
    {
        $db = Database::getConnection();
        if (!$db) return 0;

        $stmt = $db->query("SELECT COUNT(*) as count FROM facts_verification_queue WHERE status IN ('pending_verification', 'needs_doctor_approval')");
        $res = $stmt->fetch();
        return (int)($res['count'] ?? 0);
    }

    public static function updateStatus(int $id, string $status, ?string $suggestedValue, ?string $adminNotes, string $verifiedBy): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $stmt = $db->prepare("
            UPDATE facts_verification_queue SET
                status = :status,
                suggested_value = COALESCE(:sugg, suggested_value),
                admin_notes = :notes,
                verified_by = :verifier,
                verified_at = IF(:status = 'verified', NOW(), verified_at),
                updated_at = NOW()
            WHERE id = :id
        ");

        return $stmt->execute([
            ':status' => $status,
            ':sugg' => $suggestedValue,
            ':notes' => $adminNotes,
            ':verifier' => $verifiedBy,
            ':id' => $id
        ]);
    }
}
