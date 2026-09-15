<?php
/**
 * Repair Stage 3 - Clinical Intake & Clinician RBAC Verification Test Suite
 * Deterministic test runner verifying:
 * 1. AES-256-GCM encryption of sensitive clinical intake data in database.
 * 2. Strict Clinician-Only RBAC for sensitive clinical intake retrieval (/api/appointments/{id}/clinical).
 * 3. HTTP 403 Forbidden enforcement against Receptionist, Admin, Super Admin, and Editor.
 * 4. Operational field allowlisting (zero PHI leakage in standard appointment endpoints).
 * 5. PHI-free security audit logging for clinical record access.
 */

declare(strict_types=1);

class Stage3ClinicalIntakeRunner
{
    private string $baseUrl;
    private int $passed = 0;
    private int $failed = 0;
    private ?string $csrfToken = null;
    private array $sessionCookies = [];

    public function __construct(string $baseUrl)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    private function assert(string $testName, bool $condition, string $details = ''): void
    {
        if ($condition) {
            $this->passed++;
            echo "  [PASS] $testName\n";
        } else {
            $this->failed++;
            echo "  [FAIL] $testName" . ($details ? " ($details)" : '') . "\n";
        }
    }

    private function request(string $method, string $path, ?array $body = null, array $headers = []): array
    {
        $url = $this->baseUrl . $path;
        $reqHeaders = [];

        if ($body !== null) {
            $content = json_encode($body);
            $reqHeaders[] = 'Content-Type: application/json';
            $reqHeaders[] = 'Content-Length: ' . strlen($content);
        } else {
            $content = null;
        }

        if ($this->csrfToken) {
            $reqHeaders[] = 'X-CSRF-Token: ' . $this->csrfToken;
        }

        if (!empty($this->sessionCookies)) {
            $cookieList = [];
            foreach ($this->sessionCookies as $k => $v) {
                $cookieList[] = "$k=$v";
            }
            $reqHeaders[] = 'Cookie: ' . implode('; ', $cookieList);
        }

        foreach ($headers as $k => $v) {
            $reqHeaders[] = "$k: $v";
        }

        $opts = [
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", $reqHeaders),
                'content' => $content,
                'ignore_errors' => true,
                'timeout' => 10,
            ]
        ];

        $context = stream_context_create($opts);
        $rawBody = @file_get_contents($url, false, $context);
        $responseHeaders = $http_response_header ?? [];

        $status = 0;
        $headerStr = implode("\r\n", $responseHeaders);
        if (!empty($responseHeaders[0]) && preg_match('#HTTP/\S+\s+(\d+)#', $responseHeaders[0], $m)) {
            $status = (int)$m[1];
        }

        foreach ($responseHeaders as $hdr) {
            if (stripos($hdr, 'Set-Cookie:') === 0) {
                $cookiePart = trim(substr($hdr, 11));
                $segments = explode(';', $cookiePart);
                if (!empty($segments[0])) {
                    $parts = explode('=', trim($segments[0]), 2);
                    if (count($parts) === 2 && $parts[0] !== '') {
                        $this->sessionCookies[$parts[0]] = $parts[1];
                    }
                }
            }
        }

        $decoded = is_string($rawBody) ? json_decode($rawBody, true) : null;

        return [
            'status' => $status,
            'headers' => $headerStr,
            'raw_body' => (string)$rawBody,
            'json' => is_array($decoded) ? $decoded : null
        ];
    }

    private function clearSession(): void
    {
        $this->sessionCookies = [];
        $this->csrfToken = null;
    }

    private function login(string $email, string $password): array
    {
        $this->clearSession();
        $csrfRes = $this->request('GET', '/api/auth/csrf');
        $this->csrfToken = $csrfRes['json']['csrf_token'] ?? null;

        return $this->request('POST', '/api/auth/login', [
            'email' => $email,
            'password' => $password,
            'csrf_token' => $this->csrfToken
        ]);
    }

    public function runAll(): void
    {
        echo "====================================================================\n";
        echo "DR. FARHAN MUSTAFA CLINIC PORTAL - STAGE 3 CLINICAL INTAKE VERIFICATION\n";
        echo "====================================================================\n\n";

        // 1. Create a fresh test appointment with sensitive clinical intake
        echo "--- 1. Appointment Booking with Pre-Visit Clinical Intake ---\n";
        $secretSymptom = 'Uncontrolled hyperglycemia with morning migraines and fatigue';
        $secretConditions = 'Type 2 Diabetes Mellitus, Mild Nephropathy';
        $secretMeds = 'Metformin 1000mg BID, Glimepiride 2mg QD';
        $secretAllergies = 'Severe anaphylaxis to Penicillin and Cephalosporins';
        $secretNotes = 'Patient reports skipping evening doses when working night shifts';

        $bookPayload = [
            'patient_name' => 'Tariq Mahmood Clinical Test',
            'patient_phone' => '03219876543',
            'patient_email' => 'tariq.mahmood@example.com',
            'preferred_date' => date('Y-m-d', strtotime('+3 days')),
            'preferred_time_slot' => '19:00 - 19:20',
            'appointment_type' => 'in-clinic',
            'communication_preference' => 'whatsapp',
            'reason_category' => 'Diabetes Follow-up',
            'intake_visit_reason' => $secretSymptom,
            'intake_symptom_duration' => '6 months',
            'intake_existing_conditions' => $secretConditions,
            'intake_current_medicines' => $secretMeds,
            'intake_known_allergies' => $secretAllergies,
            'intake_notes' => $secretNotes,
        ];

        $bookRes = $this->request('POST', '/api/appointments', $bookPayload);
        $this->assert('Appointment with Clinical Intake Created', in_array($bookRes['status'], [200, 201], true));
        $this->assert('Booking Response Contains Appointment ID', !empty($bookRes['json']['appointment_id']));
        $appId = (int)($bookRes['json']['appointment_id'] ?? 0);
        $refCode = (string)($bookRes['json']['reference_code'] ?? '');

        // 2. Direct Database Inspection for At-Rest AES-256-GCM Encryption
        echo "\n--- 2. Database At-Rest Encryption Verification (AES-256-GCM) ---\n";
        $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
        $dbPort = getenv('DB_PORT') ?: '3306';
        $dbName = getenv('DB_NAME') ?: 'test_fresh';
        $dbUser = getenv('DB_USER') ?: 'test_user';
        $dbPass = getenv('DB_PASS') ?: '';

        $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName}", $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $intakeStmt = $pdo->prepare("SELECT * FROM patient_intakes WHERE appointment_id = ? LIMIT 1");
        $intakeStmt->execute([$appId]);
        $rawIntake = $intakeStmt->fetch();

        $this->assert('Patient Intake Row Exists in Database', !empty($rawIntake));
        $this->assert('is_encrypted Flag is Set to 1', (int)($rawIntake['is_encrypted'] ?? 0) === 1);
        $this->assert('visit_reason is Stored as Ciphertext (Not Plaintext)', 
            !empty($rawIntake['visit_reason']) && !str_contains($rawIntake['visit_reason'], $secretSymptom));
        $this->assert('existing_conditions is Stored as Ciphertext (Not Plaintext)', 
            !empty($rawIntake['existing_conditions']) && !str_contains($rawIntake['existing_conditions'], $secretConditions));
        $this->assert('current_medicines is Stored as Ciphertext (Not Plaintext)', 
            !empty($rawIntake['current_medicines']) && !str_contains($rawIntake['current_medicines'], $secretMeds));
        $this->assert('known_allergies is Stored as Ciphertext (Not Plaintext)', 
            !empty($rawIntake['known_allergies']) && !str_contains($rawIntake['known_allergies'], $secretAllergies));
        $this->assert('general_notes is Stored as Ciphertext (Not Plaintext)', 
            !empty($rawIntake['general_notes']) && !str_contains($rawIntake['general_notes'], $secretNotes));

        // 3. Operational Field Suppression in Standard Endpoints
        echo "\n--- 3. Operational View Clinical History Suppression ---\n";
        // Login as receptionist
        $recLogin = $this->login('reception@healthpro.com.pk', 'Admin@HealthPro2026!');
        $this->assert('Receptionist Login Successful', $recLogin['status'] === 200);

        // List appointments
        $recList = $this->request('GET', '/api/appointments');
        $this->assert('Receptionist Can View Operational Appointments List', $recList['status'] === 200);
        $foundInList = null;
        foreach ($recList['json']['appointments'] ?? [] as $a) {
            if ((int)$a['id'] === $appId) {
                $foundInList = $a;
                break;
            }
        }
        $this->assert('Created Appointment Present in Operational List', !empty($foundInList));
        $this->assert('Operational List Suppresses visit_reason', !isset($foundInList['visit_reason']));
        $this->assert('Operational List Suppresses symptom_duration', !isset($foundInList['symptom_duration']));
        $this->assert('Operational List Suppresses existing_conditions', !isset($foundInList['existing_conditions']));
        $this->assert('Operational List Suppresses current_medicines', !isset($foundInList['current_medicines']));
        $this->assert('Operational List Suppresses known_allergies', !isset($foundInList['known_allergies']));
        $this->assert('Operational List Suppresses intake_notes', !isset($foundInList['intake_notes']));
        $this->assert('Operational List Retains has_intake Flag True', ($foundInList['has_intake'] ?? false) === true);

        // Single appointment operational endpoint
        $singleOp = $this->request('GET', "/api/appointments/{$appId}");
        $this->assert('Receptionist Can View Single Appointment Operational View', $singleOp['status'] === 200);
        $singleData = $singleOp['json']['appointment'] ?? [];
        $this->assert('Single Operational Endpoint Suppresses visit_reason', !isset($singleData['visit_reason']));
        $this->assert('Single Operational Endpoint Suppresses existing_conditions', !isset($singleData['existing_conditions']));
        $this->assert('Single Operational Endpoint Retains has_intake Flag True', ($singleData['has_intake'] ?? false) === true);

        // 4. Strict Clinician RBAC Enforcement on /api/appointments/{id}/clinical
        echo "\n--- 4. Role-Based Access Control on /api/appointments/{id}/clinical ---\n";
        
        // 4a. Unauthenticated Request
        $this->clearSession();
        $unauthRes = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Unauthenticated Access to /clinical Blocked (401)', $unauthRes['status'] === 401);

        // 4b. Receptionist Request
        $this->login('reception@healthpro.com.pk', 'Admin@HealthPro2026!');
        $recClinical = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Receptionist Access to /clinical Forbidden (403)', $recClinical['status'] === 403);
        $this->assert('Receptionist Error Message Explains Clinician-Only Restriction', 
            str_contains(strtolower($recClinical['json']['message'] ?? ''), 'clinician'));

        // 4c. Editor Request
        $this->login('editor@healthpro.com.pk', 'Admin@HealthPro2026!');
        $editorClinical = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Editor Access to /clinical Forbidden (403)', $editorClinical['status'] === 403);

        // 4d. Admin Request
        $this->login('admin@healthpro.com.pk', 'Admin@HealthPro2026!');
        $adminClinical = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Clinic Admin Access to /clinical Forbidden (403)', $adminClinical['status'] === 403);

        // 4e. Super Admin Request (Even super_admin cannot bypass clinical role constraint)
        $this->login('superadmin@healthpro.com.pk', 'Admin@HealthPro2026!');
        $superClinical = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Super Administrator Access to /clinical Forbidden (403)', $superClinical['status'] === 403);

        // 4f. Clinician Request (The treating clinician)
        echo "\n--- 5. Authorized Clinician Intake Retrieval & Decryption ---\n";
        $clinicianLogin = $this->login('clinician@healthpro.com.pk', 'Admin@HealthPro2026!');
        $this->assert('Clinician Login Successful', $clinicianLogin['status'] === 200);
        $this->assert('Clinician Role Confirmed as clinician', ($clinicianLogin['json']['user']['role'] ?? '') === 'clinician');

        $clinRes = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Clinician Access to /clinical Permitted (200 OK)', $clinRes['status'] === 200);
        $clinApp = $clinRes['json']['appointment'] ?? [];
        $intakeObj = $clinApp['intake'] ?? [];

        $this->assert('Clinician Receives Decrypted visit_reason', 
            ($intakeObj['visit_reason'] ?? $clinApp['visit_reason'] ?? '') === $secretSymptom);
        $this->assert('Clinician Receives Decrypted existing_conditions', 
            ($intakeObj['existing_conditions'] ?? $clinApp['existing_conditions'] ?? '') === $secretConditions);
        $this->assert('Clinician Receives Decrypted current_medicines', 
            ($intakeObj['current_medicines'] ?? $clinApp['current_medicines'] ?? '') === $secretMeds);
        $this->assert('Clinician Receives Decrypted known_allergies', 
            ($intakeObj['known_allergies'] ?? $clinApp['known_allergies'] ?? '') === $secretAllergies);
        $this->assert('Clinician Receives Decrypted intake_notes', 
            ($intakeObj['intake_notes'] ?? $clinApp['intake_notes'] ?? '') === $secretNotes);

        // 6. Security Audit Trail Verification (Zero PHI in Logs)
        echo "\n--- 6. Security Audit Trail Verification (Zero PHI in Logs) ---\n";
        $auditStmt = $pdo->prepare("
            SELECT * FROM audit_logs 
            WHERE entity_type = 'appointment' 
            AND entity_id = :id 
            AND action = 'clinical_intake_viewed'
            ORDER BY id DESC LIMIT 1
        ");
        $auditStmt->execute([':id' => (string)$appId]);
        $log = $auditStmt->fetch();

        $this->assert('Audit Log Recorded for clinical_intake_viewed', !empty($log));
        $detailsJson = (string)($log['details'] ?? '');
        $this->assert('Audit Log Does NOT Contain Plaintext Symptom / Visit Reason', !str_contains($detailsJson, $secretSymptom));
        $this->assert('Audit Log Does NOT Contain Plaintext Conditions', !str_contains($detailsJson, $secretConditions));
        $this->assert('Audit Log Does NOT Contain Plaintext Medicines', !str_contains($detailsJson, $secretMeds));
        $this->assert('Audit Log Does NOT Contain Plaintext Allergies', !str_contains($detailsJson, $secretAllergies));

        // 7. Cleanup
        try {
            $pdo->prepare("DELETE FROM appointments WHERE id = ?")->execute([$appId]);
            $pdo->prepare("DELETE FROM patient_intakes WHERE appointment_id = ?")->execute([$appId]);
            $pdo->prepare("DELETE FROM appointment_history WHERE appointment_id = ?")->execute([$appId]);
        } catch (\Throwable $e) {}

        echo "\n====================================================================\n";
        echo "STAGE 3 VERIFICATION SUMMARY: {$this->passed} PASSED, {$this->failed} FAILED\n";
        echo "====================================================================\n";

        if ($this->failed > 0) {
            exit(1);
        }
    }
}

// Instantiate and execute
$baseUrl = getenv('API_TEST_BASE_URL') ?: 'http://127.0.0.1:8899';
$runner = new Stage3ClinicalIntakeRunner($baseUrl);
$runner->runAll();
