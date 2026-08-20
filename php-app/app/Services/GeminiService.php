<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\AiKnowledgeModel;
use App\Models\AiLogModel;

/**
 * Service to manage Gemini API communication, grounding in verified clinic facts,
 * negative guardrails (no medical diagnoses/dosages), and emergency triage.
 */
class GeminiService
{
    private string $apiKey;
    private string $modelName;
    private float $temperature;
    private int $maxTokens;
    private string $apiUrl;

    public function __construct(?string $apiKey = null, string $modelName = 'gemini-3.7-flash')
    {
        // 1. API key loaded securely from server environment variable
        $this->apiKey = $apiKey ?? (string)($_ENV['GEMINI_API_KEY'] ?? getenv('GEMINI_API_KEY') ?: '');
        $this->modelName = $modelName;
        $this->temperature = 0.2;
        $this->maxTokens = 800;
        $this->apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$this->modelName}:generateContent";
    }

    /**
     * Emergency symptom detection in English, Urdu, and Roman Urdu.
     */
    public function detectEmergency(string $query): bool
    {
        $lower = mb_strtolower($query, 'UTF-8');
        $redFlags = [
            'chest pain', 'heart attack', 'cardiac arrest', 'severe shortness of breath', 'cannot breathe',
            'unconscious', 'passed out', 'stroke', 'paralysis', 'facial droop', 'sudden weakness',
            'severe bleeding', 'poisoning', 'suicide', 'anaphylaxis', 'choking', 'convulsions',
            // Urdu Script
            'سینے میں درد', 'دل کا دورہ', 'سانس رک رہی', 'بے ہوش', 'فالج', 'شدید خون', 'زہر',
            // Roman Urdu
            'sine me dard', 'seene me dard', 'dil ka dora', 'dil me dard', 'sans band', 'sans lene me takleef',
            'behosh', 'hosh nahi', 'falij', 'khoon beh raha', 'zehar'
        ];

        foreach ($redFlags as $flag) {
            if (mb_strpos($lower, $flag) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Detection of medical diagnosis, prescription, or dosage requests.
     */
    public function detectMedicalPrescriptionRequest(string $query): bool
    {
        $lower = mb_strtolower($query, 'UTF-8');
        $patterns = [
            'what medicine should i take', 'prescribe', 'which drug', 'dosage for', 'how many mg',
            'suggest medicine', 'medicine for my', 'dawa bata', 'konsi goli', 'kitni mg', 'dosage batao',
            'interpret my report', 'diagnose my', 'hba1c result means', 'sugar 300 hai konsi medicine',
            'kitni goli khani hai'
        ];

        foreach ($patterns as $pat) {
            if (mb_strpos($lower, $pat) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate response via Gemini API or fallback grounding engine.
     */
    public function generateReply(string $userMessage, array $conversationHistory, array $publishedKnowledge, array $settings): array
    {
        $userQuery = trim($userMessage);

        // 1. Emergency Check
        if ($this->detectEmergency($userQuery)) {
            return [
                'reply' => $settings['emergency_alert_text'] ?? "⚠️ EMERGENCY NOTICE: If you are experiencing acute chest pain, shortness of breath, or sudden severe symptoms, please call Rescue 1122 immediately or go to the nearest emergency department.",
                'isEmergency' => true,
                'triageFlag' => 'emergency',
                'safetyFlag' => 'emergency',
                'quickActions' => [
                    ['label' => 'Call Rescue 1122', 'actionType' => 'tel', 'payload' => 'tel:1122'],
                    ['label' => 'WhatsApp Clinic', 'actionType' => 'whatsapp', 'payload' => 'https://wa.me/923280145670']
                ]
            ];
        }

        // 2. Prescription / Diagnosis Refusal Check
        if ($this->detectMedicalPrescriptionRequest($userQuery)) {
            return [
                'reply' => "As an AI Clinic Receptionist, I cannot assess clinical symptoms, interpret laboratory reports, prescribe medications, or advise on drug dosages. Dr. Farhan Mustafa provides individual evaluations during scheduled consultations at HealthPro Medical Complex. Would you like to schedule an in-clinic or video consultation?",
                'isEmergency' => false,
                'triageFlag' => 'medical_advice_refusal',
                'safetyFlag' => 'medical_advice_refusal',
                'quickActions' => [
                    ['label' => 'Book Appointment', 'actionType' => 'book_modal', 'payload' => '/appointments'],
                    ['label' => 'WhatsApp Reception', 'actionType' => 'whatsapp', 'payload' => 'https://wa.me/923280145670']
                ]
            ];
        }

        // 3. Assemble Grounding Facts
        $knowledgeText = "";
        foreach ($publishedKnowledge as $k) {
            $topic = $k['topic'] ?? '';
            $qEn = $k['question_en'] ?? '';
            $qUr = $k['question_urdu'] ?? '';
            $qRo = $k['question_roman'] ?? '';
            $ans = $k['answer_content'] ?? '';
            $knowledgeText .= "[TOPIC: {$topic}]\nQ: {$qEn} | {$qUr} | {$qRo}\nA: {$ans}\n\n";
        }

        $systemPrompt = ($settings['system_prompt'] ?? '') . "\n\nOFFICIAL CLINIC FACTS & GROUNDING KNOWLEDGE:\n" . $knowledgeText . "\n" .
            "STRICT RULES:\n" .
            "1. Answer ONLY from the clinic knowledge above. Never guess or invent details.\n" .
            "2. Comprehend and respond seamlessly in English, Urdu (اردو), or Roman Urdu based on user prompt.\n" .
            "3. Mention Dr. Farhan Mustafa consults at HealthPro Medical Complex, Faisal Town, Lahore, Monday to Saturday 6:00 PM - 9:00 PM PKT.\n" .
            "4. NEVER recommend drug dosages or prescribe medications.";

        $replyText = "";

        // If Gemini API Key exists, call Google Gemini REST endpoint
        if (!empty($this->apiKey)) {
            $replyText = $this->callGeminiApi($userQuery, $conversationHistory, $systemPrompt);
        }

        // Fallback to Knowledge Base Matcher if API is empty or returned blank
        if (empty($replyText)) {
            $replyText = $this->fallbackKnowledgeMatch($userQuery, $publishedKnowledge);
        }

        // Post-Generation Safety Validation Check
        if (preg_match('/\b\d+\s*(mg|ml|mcg|tablets?|capsules?|goli)\b/i', $replyText) && stripos($replyText, 'cannot prescribe') === false) {
            $replyText = "As an AI Clinic Receptionist, I cannot prescribe medicines or recommend drug dosages. For clinical advice and treatment plans, please book a consultation with Dr. Farhan Mustafa at HealthPro Medical Complex.";
        }

        // Build Contextual Quick Actions
        $quickActions = $this->buildQuickActions($userQuery, $replyText);

        return [
            'reply' => $replyText,
            'isEmergency' => false,
            'triageFlag' => 'clean',
            'safetyFlag' => 'clean',
            'quickActions' => $quickActions
        ];
    }

    private function callGeminiApi(string $query, array $history, string $systemInstruction): string
    {
        $url = $this->apiUrl . "?key=" . urlencode($this->apiKey);

        $contents = [];
        // Include last 4 turns
        $recentHistory = array_slice($history, -4);
        foreach ($recentHistory as $msg) {
            $role = ($msg['sender'] === 'user') ? 'user' : 'model';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => (string)($msg['text'] ?? '')]]
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $query]]
        ];

        $payload = [
            'contents' => $contents,
            'systemInstruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            'generationConfig' => [
                'temperature' => $this->temperature,
                'maxOutputTokens' => $this->maxTokens,
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $data = json_decode($response, true);
            return $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        }

        return '';
    }

    private function fallbackKnowledgeMatch(string $query, array $knowledge): string
    {
        $lower = mb_strtolower($query, 'UTF-8');
        foreach ($knowledge as $item) {
            $keywords = is_array($item['keywords_json'] ?? null) ? $item['keywords_json'] : json_decode($item['keywords_json'] ?? '[]', true) ?: [];
            foreach ($keywords as $kw) {
                if (stripos($lower, (string)$kw) !== false) {
                    return $item['answer_content'];
                }
            }
            if (stripos($lower, $item['topic']) !== false) {
                return $item['answer_content'];
            }
        }

        return "Dr. Farhan Mustafa is a Consultant Physician (FCPS, MRCP UK) consulting at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Monday to Saturday 6:00 PM - 9:00 PM (18:00 to 21:00 PKT). You can schedule an appointment online or contact our front desk on WhatsApp (+92 328 0145670).";
    }

    private function buildQuickActions(string $query, string $reply): array
    {
        $actions = [];
        $combined = mb_strtolower($query . ' ' . $reply, 'UTF-8');

        if (strpos($combined, 'appointment') !== false || strpos($combined, 'book') !== false || strpos($combined, 'milna') !== false) {
            $actions[] = ['label' => 'Book Appointment', 'actionType' => 'book_modal', 'payload' => '/appointments'];
        }
        if (strpos($combined, 'location') !== false || strpos($combined, 'faisal town') !== false || strpos($combined, 'address') !== false || strpos($combined, 'kahan') !== false) {
            $actions[] = ['label' => 'View Clinic Map', 'actionType' => 'navigate', 'payload' => '/contact'];
        }
        if (strpos($combined, 'fee') !== false || strpos($combined, 'charges') !== false || strpos($combined, 'price') !== false) {
            $actions[] = ['label' => 'Consultation Fees', 'actionType' => 'navigate', 'payload' => '/fees'];
        }

        $actions[] = ['label' => 'WhatsApp (+92 328 0145670)', 'actionType' => 'whatsapp', 'payload' => 'https://wa.me/923280145670'];
        return array_slice($actions, 0, 3);
    }
}
