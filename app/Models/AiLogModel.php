<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

class AiLogModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findOrCreateSession(string $sessionId, ?string $ip = null, ?string $userAgent = null, string $lang = 'English'): int
    {
        $stmt = $this->db->prepare("SELECT id FROM ai_conversations WHERE session_id = :sid LIMIT 1");
        $stmt->execute([':sid' => $sessionId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            return (int)$row['id'];
        }

        $ins = $this->db->prepare("INSERT INTO ai_conversations (session_id, ip_address, user_agent, user_language, message_count) 
            VALUES (:sid, :ip, :ua, :lang, 0)");
        $ins->execute([
            ':sid' => $sessionId,
            ':ip' => $ip,
            ':ua' => $userAgent,
            ':lang' => $lang
        ]);

        return (int)$this->db->lastInsertId();
    }

    public function logMessage(int $conversationId, string $sender, string $text, string $lang = 'en', string $safetyFlag = 'clean', bool $isEmergency = false): int
    {
        $stmt = $this->db->prepare("INSERT INTO ai_messages (conversation_id, sender, message_text, detected_language, safety_flag, is_emergency)
            VALUES (:cid, :sender, :text, :lang, :sflag, :emerg)");
        $stmt->execute([
            ':cid' => $conversationId,
            ':sender' => $sender,
            ':text' => $text,
            ':lang' => $lang,
            ':sflag' => $safetyFlag,
            ':emerg' => $isEmergency ? 1 : 0
        ]);

        // Increment message count
        $up = $this->db->prepare("UPDATE ai_conversations SET 
            message_count = message_count + 1,
            triage_flag = CASE WHEN :emerg = 1 THEN 'emergency' WHEN :sflag = 'medical_advice_refusal' THEN 'medical_advice_refusal' ELSE triage_flag END,
            is_escalated = CASE WHEN :emerg = 1 THEN 1 ELSE is_escalated END,
            escalation_type = CASE WHEN :emerg = 1 THEN 'rescue_1122' ELSE escalation_type END,
            last_activity_at = CURRENT_TIMESTAMP
            WHERE id = :cid");
        $up->execute([
            ':emerg' => $isEmergency ? 1 : 0,
            ':sflag' => $safetyFlag,
            ':cid' => $conversationId
        ]);

        return (int)$this->db->lastInsertId();
    }

    public function logSafetyTrigger(string $triggerType, string $userQuery, string $actionTaken, ?string $sessionId = null, ?string $ip = null): int
    {
        $stmt = $this->db->prepare("INSERT INTO ai_safety_logs (session_id, trigger_type, user_query, action_taken, ip_address)
            VALUES (:sid, :type, :query, :action, :ip)");
        $stmt->execute([
            ':sid' => $sessionId,
            ':type' => $triggerType,
            ':query' => $userQuery,
            ':action' => $actionTaken,
            ':ip' => $ip
        ]);

        return (int)$this->db->lastInsertId();
    }

    public function getConversations(int $limit = 50): array
    {
        $stmt = $this->db->prepare("SELECT c.*, 
            (SELECT message_text FROM ai_messages WHERE conversation_id = c.id ORDER BY id DESC LIMIT 1) as last_message
            FROM ai_conversations c 
            ORDER BY c.last_activity_at DESC 
            LIMIT :lim");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getConversationMessages(int $conversationId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM ai_messages WHERE conversation_id = :cid ORDER BY id ASC");
        $stmt->execute([':cid' => $conversationId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSafetyLogs(int $limit = 100): array
    {
        $stmt = $this->db->prepare("SELECT * FROM ai_safety_logs ORDER BY created_at DESC LIMIT :lim");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function purgeOldLogs(int $retentionDays = 30): int
    {
        $stmt = $this->db->prepare("DELETE FROM ai_conversations WHERE last_activity_at < DATE_SUB(NOW(), INTERVAL :days DAY)");
        $stmt->execute([':days' => $retentionDays]);
        
        $stmt2 = $this->db->prepare("DELETE FROM ai_safety_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY)");
        $stmt2->execute([':days' => $retentionDays]);
        
        return $stmt->rowCount();
    }
}
