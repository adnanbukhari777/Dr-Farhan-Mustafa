<?php
declare(strict_types=1);

namespace App\Models;

use PDO;

class AiKnowledgeModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getSettings(): array
    {
        $stmt = $this->db->query("SELECT * FROM ai_settings ORDER BY id ASC LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return [
                'is_enabled' => 1,
                'model_name' => 'gemini-3.7-flash',
                'temperature' => 0.20,
                'max_tokens' => 800,
                'system_prompt' => "You are Dr. Farhan Mustafa's Official AI Clinic Receptionist at HealthPro Medical Complex, Faisal Town, Lahore. Answer only from published clinic knowledge.",
                'emergency_alert_text' => "⚠️ MEDICAL EMERGENCY NOTICE: If you are experiencing acute chest pain, shortness of breath, or sudden severe symptoms, please call Rescue 1122 immediately or proceed to the nearest emergency department.",
                'rate_limit_per_10min' => 20,
                'retention_days' => 30,
                'consent_text' => "Dr. Farhan Mustafa's AI Clinic Assistant provides verified logistical and appointment information. It cannot provide medical diagnoses or prescription advice.",
                'disclaimer_text' => "Informational AI Receptionist • Grounded in Published Clinic Facts",
                'whatsapp_number' => '+92 328 0145670',
                'phone_number' => '0328 0145670'
            ];
        }
        return $row;
    }

    public function updateSettings(array $data): bool
    {
        $sql = "UPDATE ai_settings SET 
            is_enabled = :is_enabled,
            model_name = :model_name,
            temperature = :temperature,
            max_tokens = :max_tokens,
            system_prompt = :system_prompt,
            emergency_alert_text = :emergency_alert_text,
            rate_limit_per_10min = :rate_limit_per_10min,
            retention_days = :retention_days,
            consent_text = :consent_text,
            disclaimer_text = :disclaimer_text,
            whatsapp_number = :whatsapp_number,
            phone_number = :phone_number
            WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':is_enabled' => $data['is_enabled'] ?? 1,
            ':model_name' => $data['model_name'] ?? 'gemini-3.7-flash',
            ':temperature' => $data['temperature'] ?? 0.20,
            ':max_tokens' => $data['max_tokens'] ?? 800,
            ':system_prompt' => $data['system_prompt'] ?? '',
            ':emergency_alert_text' => $data['emergency_alert_text'] ?? '',
            ':rate_limit_per_10min' => $data['rate_limit_per_10min'] ?? 20,
            ':retention_days' => $data['retention_days'] ?? 30,
            ':consent_text' => $data['consent_text'] ?? '',
            ':disclaimer_text' => $data['disclaimer_text'] ?? '',
            ':whatsapp_number' => $data['whatsapp_number'] ?? '+92 328 0145670',
            ':phone_number' => $data['phone_number'] ?? '0328 0145670',
            ':id' => $data['id'] ?? 1
        ]);
    }

    public function getAllPublished(): array
    {
        $stmt = $this->db->prepare("SELECT * FROM ai_knowledge_items WHERE is_published = 1 AND is_verified = 1 ORDER BY sort_order ASC, id ASC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM ai_knowledge_items ORDER BY sort_order ASC, id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createItem(array $data): int
    {
        $stmt = $this->db->prepare("INSERT INTO ai_knowledge_items 
            (category, topic, question_en, question_urdu, question_roman, answer_content, keywords_json, is_published, is_verified, sort_order)
            VALUES (:cat, :topic, :q_en, :q_ur, :q_ro, :ans, :kw, :pub, :ver, :sort)");
        
        $stmt->execute([
            ':cat' => $data['category'] ?? 'faqs',
            ':topic' => $data['topic'] ?? '',
            ':q_en' => $data['question_en'] ?? '',
            ':q_ur' => $data['question_urdu'] ?? null,
            ':q_ro' => $data['question_roman'] ?? null,
            ':ans' => $data['answer_content'] ?? '',
            ':kw' => is_array($data['keywords'] ?? null) ? json_encode($data['keywords']) : ($data['keywords_json'] ?? '[]'),
            ':pub' => $data['is_published'] ?? 1,
            ':ver' => $data['is_verified'] ?? 1,
            ':sort' => $data['sort_order'] ?? 0
        ]);

        return (int)$this->db->lastInsertId();
    }

    public function updateItem(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("UPDATE ai_knowledge_items SET
            category = :cat,
            topic = :topic,
            question_en = :q_en,
            question_urdu = :q_ur,
            question_roman = :q_ro,
            answer_content = :ans,
            keywords_json = :kw,
            is_published = :pub,
            is_verified = :ver,
            sort_order = :sort
            WHERE id = :id");

        return $stmt->execute([
            ':cat' => $data['category'] ?? 'faqs',
            ':topic' => $data['topic'] ?? '',
            ':q_en' => $data['question_en'] ?? '',
            ':q_ur' => $data['question_urdu'] ?? null,
            ':q_ro' => $data['question_roman'] ?? null,
            ':ans' => $data['answer_content'] ?? '',
            ':kw' => is_array($data['keywords'] ?? null) ? json_encode($data['keywords']) : ($data['keywords_json'] ?? '[]'),
            ':pub' => $data['is_published'] ?? 1,
            ':ver' => $data['is_verified'] ?? 1,
            ':sort' => $data['sort_order'] ?? 0,
            ':id' => $id
        ]);
    }

    public function deleteItem(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM ai_knowledge_items WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
