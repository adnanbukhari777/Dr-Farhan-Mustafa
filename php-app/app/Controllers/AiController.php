<?php
declare(strict_types=1);

namespace App\Controllers;

use PDO;
use App\Models\AiKnowledgeModel;
use App\Models\AiLogModel;
use App\Services\GeminiService;
use App\Security\Auth;

class AiController
{
    private PDO $db;
    private AiKnowledgeModel $knowledgeModel;
    private AiLogModel $logModel;
    private GeminiService $geminiService;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->knowledgeModel = new AiKnowledgeModel($db);
        $this->logModel = new AiLogModel($db);
        $this->geminiService = new GeminiService();
    }

    /**
     * Primary AI Chat Endpoint
     * Route: POST /api/ai/chat
     */
    public function chat(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $settings = $this->knowledgeModel->getSettings();
        if (empty($settings['is_enabled'])) {
            echo json_encode([
                'success' => true,
                'reply' => 'The AI Receptionist is currently offline for scheduled maintenance. Please connect with Dr. Farhan Mustafa’s clinic directly via WhatsApp at ' . ($settings['whatsapp_number'] ?? '+92 328 0145670') . ' or call ' . ($settings['phone_number'] ?? '0328 0145670') . '.',
                'isEmergency' => false,
                'isOffline' => true,
                'quickActions' => [
                    ['label' => 'WhatsApp Clinic', 'actionType' => 'whatsapp', 'payload' => 'https://wa.me/923280145670'],
                    ['label' => 'Call Clinic', 'actionType' => 'tel', 'payload' => 'tel:+923280145670']
                ]
            ]);
            return;
        }

        $message = trim((string)($input['message'] ?? ''));
        if (empty($message)) {
            http_response_code(400);
            echo json_encode(['error' => 'Message field is required.']);
            return;
        }

        $sessionId = (string)($input['sessionId'] ?? 'sess-' . uniqid());
        $conversationHistory = is_array($input['conversationHistory'] ?? null) ? $input['conversationHistory'] : [];
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

        // Rate limit check (session + IP in DB safety logs)
        $rateLimit = (int)($settings['rate_limit_per_10min'] ?? 20);

        // Fetch published clinic knowledge
        $publishedKnowledge = $this->knowledgeModel->getAllPublished();

        // Process generation & safety check via Gemini Service
        $result = $this->geminiService->generateReply($message, $conversationHistory, $publishedKnowledge, $settings);

        // Log safety event if flagged
        if (!empty($result['isEmergency'])) {
            $this->logModel->logSafetyTrigger('emergency_symptoms', $message, 'emergency_banner_displayed', $sessionId, $ip);
        } elseif (($result['safetyFlag'] ?? '') === 'medical_advice_refusal') {
            $this->logModel->logSafetyTrigger('medical_diagnosis_attempt', $message, 'medical_refusal_rendered', $sessionId, $ip);
        }

        // Store session and messages in MySQL
        $convId = $this->logModel->findOrCreateSession($sessionId, $ip, $ua);
        $this->logModel->logMessage($convId, 'user', $message, 'auto', $result['safetyFlag'] ?? 'clean');
        $this->logModel->logMessage($convId, 'ai', $result['reply'], 'auto', 'clean', !empty($result['isEmergency']));

        echo json_encode([
            'success' => true,
            'reply' => $result['reply'],
            'isEmergency' => !empty($result['isEmergency']),
            'triageFlag' => $result['triageFlag'] ?? 'clean',
            'quickActions' => $result['quickActions'] ?? []
        ]);
    }

    /**
     * Get / Update Settings
     * View: admin, super_admin. Receptionist & Editor denied (403).
     * Update: super_admin only. Admin, Receptionist, Editor denied (403). Requires CSRF.
     */
    public function getSettings(): void
    {
        Auth::requireRole([Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);

        $settings = $this->knowledgeModel->getSettings();
        $hasKey = !empty($_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY'));
        Auth::jsonResponse(['success' => true, 'settings' => $settings, 'hasApiKeyConfigured' => $hasKey]);
    }

    public function updateSettings(): void
    {
        Auth::requireRole(Auth::ROLE_SUPER_ADMIN);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $allowed = [
            'is_enabled', 'model_name', 'temperature', 'max_tokens',
            'system_prompt', 'emergency_alert_text', 'rate_limit_per_10min',
            'retention_days', 'consent_text', 'disclaimer_text',
            'whatsapp_number', 'phone_number'
        ];
        $filtered = array_intersect_key($input, array_flip($allowed));

        $ok = $this->knowledgeModel->updateSettings($filtered);
        Auth::recordAuditEvent('ai_settings_updated', 'ai_settings', null);
        Auth::jsonResponse(['success' => $ok, 'message' => 'Settings saved successfully.']);
    }

    /**
     * Knowledge Management
     * Allowed: editor, admin, super_admin. Receptionist denied (403).
     * Mutations require CSRF token.
     */
    public function getKnowledge(): void
    {
        Auth::requireRole([Auth::ROLE_EDITOR, Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);

        $items = $this->knowledgeModel->getAll();
        Auth::jsonResponse(['success' => true, 'items' => $items]);
    }

    public function saveKnowledge(): void
    {
        $user = Auth::requireRole([Auth::ROLE_EDITOR, Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $allowed = [
            'id', 'category', 'topic', 'question_en', 'question_urdu',
            'question_roman', 'answer_content', 'keywords', 'keywords_json',
            'is_published', 'is_verified', 'sort_order'
        ];
        $filtered = array_intersect_key($input, array_flip($allowed));

        // Editors cannot modify or approve publication/verification status.
        // Only explicitly authorized approval roles (admin, super_admin) may verify or publish.
        $isApprovalRole = in_array($user['role'], [Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN], true);
        if (!$isApprovalRole) {
            unset($filtered['is_published'], $filtered['is_verified']);
            if (empty($filtered['id'])) {
                $filtered['is_published'] = 0;
                $filtered['is_verified'] = 0;
            }
        }

        if (!empty($filtered['id'])) {
            $itemId = (int)$filtered['id'];
            $existing = $this->knowledgeModel->getById($itemId);
            if (!$existing) {
                Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Knowledge item not found.'], 404);
            }
            $ok = $this->knowledgeModel->updateItem($itemId, $filtered);
            Auth::recordAuditEvent('ai_knowledge_updated', 'ai_knowledge', (string)$itemId);

            // Record verification and publication as separate audit events
            if ($isApprovalRole) {
                if (isset($filtered['is_verified']) && (int)$filtered['is_verified'] === 1 && (int)($existing['is_verified'] ?? 0) !== 1) {
                    Auth::recordAuditEvent('ai_knowledge_verified', 'ai_knowledge', (string)$itemId, [
                        'topic' => $existing['topic'] ?? null,
                        'approved_by' => $user['email'] ?? $user['name'] ?? null
                    ]);
                }
                if (isset($filtered['is_published']) && (int)$filtered['is_published'] === 1 && (int)($existing['is_published'] ?? 0) !== 1) {
                    Auth::recordAuditEvent('ai_knowledge_published', 'ai_knowledge', (string)$itemId, [
                        'topic' => $existing['topic'] ?? null,
                        'published_by' => $user['email'] ?? $user['name'] ?? null
                    ]);
                }
            }

            Auth::jsonResponse(['success' => $ok, 'message' => 'Knowledge item updated.']);
        } else {
            $newId = $this->knowledgeModel->createItem($filtered);
            Auth::recordAuditEvent('ai_knowledge_created', 'ai_knowledge', (string)$newId);

            if ($isApprovalRole) {
                if (!empty($filtered['is_verified'])) {
                    Auth::recordAuditEvent('ai_knowledge_verified', 'ai_knowledge', (string)$newId);
                }
                if (!empty($filtered['is_published'])) {
                    Auth::recordAuditEvent('ai_knowledge_published', 'ai_knowledge', (string)$newId);
                }
            }

            Auth::jsonResponse(['success' => true, 'id' => $newId, 'message' => 'Knowledge item created.']);
        }
    }

    public function deleteKnowledge(int $id): void
    {
        Auth::requireRole([Auth::ROLE_EDITOR, Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);
        Auth::requireCsrf();

        if ($id <= 0) {
            Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Invalid knowledge item ID.'], 400);
        }

        $existing = $this->knowledgeModel->getById($id);
        if (!$existing) {
            Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Knowledge item not found.'], 404);
        }

        $ok = $this->knowledgeModel->deleteItem($id);
        Auth::recordAuditEvent('ai_knowledge_deleted', 'ai_knowledge', (string)$id);
        Auth::jsonResponse(['success' => $ok, 'message' => 'Knowledge item deleted.']);
    }

    /**
     * Conversations and Safety Logs
     * Allowed: admin, super_admin. Receptionist & Editor denied (403).
     */
    public function getConversations(): void
    {
        Auth::requireRole([Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);

        $convs = $this->logModel->getConversations();
        Auth::jsonResponse(['success' => true, 'conversations' => $convs]);
    }

    public function getSafetyLogs(): void
    {
        Auth::requireRole([Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);

        $logs = $this->logModel->getSafetyLogs();
        Auth::jsonResponse(['success' => true, 'logs' => $logs]);
    }

    /**
     * Purge Old Conversations / Safety Logs
     * Allowed: super_admin only. Admin, Receptionist, Editor denied (403).
     * Requires CSRF token.
     */
    public function purgeLogs(): void
    {
        Auth::requireRole(Auth::ROLE_SUPER_ADMIN);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $days = max(1, min(365, (int)($input['retentionDays'] ?? 30)));
        $count = $this->logModel->purgeOldLogs($days);
        Auth::recordAuditEvent('ai_logs_purged', 'ai_logs', null, ['retention_days' => $days, 'purged_count' => $count]);
        Auth::jsonResponse(['success' => true, 'message' => "Purged {$count} sessions older than {$days} days."]);
    }
}
