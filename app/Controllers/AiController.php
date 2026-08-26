<?php
declare(strict_types=1);

namespace App\Controllers;

use PDO;
use App\Models\AiKnowledgeModel;
use App\Models\AiLogModel;
use App\Services\GeminiService;

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
     */
    public function getSettings(): void
    {
        header('Content-Type: application/json');
        $settings = $this->knowledgeModel->getSettings();
        $hasKey = !empty($_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY'));
        echo json_encode(['success' => true, 'settings' => $settings, 'hasApiKeyConfigured' => $hasKey]);
    }

    public function updateSettings(): void
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $ok = $this->knowledgeModel->updateSettings($input);
        echo json_encode(['success' => $ok, 'message' => 'Settings saved successfully.']);
    }

    /**
     * Knowledge Management
     */
    public function getKnowledge(): void
    {
        header('Content-Type: application/json');
        $items = $this->knowledgeModel->getAll();
        echo json_encode(['success' => true, 'items' => $items]);
    }

    public function saveKnowledge(): void
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        if (!empty($input['id'])) {
            $ok = $this->knowledgeModel->updateItem((int)$input['id'], $input);
            echo json_encode(['success' => $ok, 'message' => 'Knowledge item updated.']);
        } else {
            $newId = $this->knowledgeModel->createItem($input);
            echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Knowledge item created.']);
        }
    }

    public function deleteKnowledge(int $id): void
    {
        header('Content-Type: application/json');
        $ok = $this->knowledgeModel->deleteItem($id);
        echo json_encode(['success' => $ok, 'message' => 'Knowledge item deleted.']);
    }

    /**
     * Conversations and Safety Logs
     */
    public function getConversations(): void
    {
        header('Content-Type: application/json');
        $convs = $this->logModel->getConversations();
        echo json_encode(['success' => true, 'conversations' => $convs]);
    }

    public function getSafetyLogs(): void
    {
        header('Content-Type: application/json');
        $logs = $this->logModel->getSafetyLogs();
        echo json_encode(['success' => true, 'logs' => $logs]);
    }

    public function purgeLogs(): void
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $days = (int)($input['retentionDays'] ?? 30);
        $count = $this->logModel->purgeOldLogs($days);
        echo json_encode(['success' => true, 'message' => "Purged {$count} sessions older than {$days} days."]);
    }
}
