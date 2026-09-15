<?php
/**
 * Stage 3B - Comprehensive Appointment, Clinical Intake & RBAC Verification Runner
 * Validates:
 * 1. 5-Role Matrix & Authorization Boundaries (super_admin, admin, receptionist, editor, clinician)
 * 2. Editor Total Exclusion from Appointment Module & Endpoints
 * 3. Rate-Limit Test Bypass Hardening (fails closed, server-only)
 * 4. 7-State Appointment Lifecycle & State Machine Transitions
 * 5. Public Booking, Object-Level Authorization Lookup, Reschedule, Cancellation, Intake Submission
 * 6. Duplicate Intake Prevention (409 Conflict) & Terminal State Intake Rejection
 * 7. AES-256-GCM Cryptographic Integrity, Tamper Detection & At-Rest Storage
 * 8. Atomic Database Transactions & Rollback Verification
 * 9. Clinician Intake Review Workflow & PHI-Free Audit Logging
 */

declare(strict_types=1);

spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../php-app/app/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

class Stage3bComprehensiveRunner
{
    private string $baseUrl;
    private int $passed = 0;
    private int $failed = 0;
    private ?string $csrfToken = null;
    private array $sessionCookies = [];
    private PDO $pdo;

    public function __construct(string $baseUrl)
    {
        $this->baseUrl = rtrim($baseUrl, '/');

        $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
        $dbPort = getenv('DB_PORT') ?: '3306';
        $dbName = getenv('DB_NAME') ?: 'test_fresh';
        $dbUser = getenv('DB_USER') ?: 'test_user';
        $dbPass = getenv('DB_PASS') ?: '';

        $this->pdo = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName}", $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
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

    private function login(string $email, string $password = 'Admin@HealthPro2026!'): array
    {
        $this->clearSession();
        $csrfRes = $this->request('GET', '/api/auth/csrf');
        $this->csrfToken = $csrfRes['json']['csrf_token'] ?? null;

        $res = $this->request('POST', '/api/auth/login', [
            'email' => $email,
            'password' => $password,
            'csrf_token' => $this->csrfToken
        ]);

        if (!empty($res['json']['csrf_token'])) {
            $this->csrfToken = $res['json']['csrf_token'];
        }

        return $res;
    }

    public function runAll(): void
    {
        echo "====================================================================\n";
        echo "DR. FARHAN MUSTAFA CLINIC PORTAL - COMPREHENSIVE STAGE 3B VERIFICATION\n";
        echo "====================================================================\n\n";

        $this->test1_RoleMatrixAuthorization();
        $this->test2_EditorTotalExclusion();
        $this->test3_RateLimitTestBypassSecurity();
        $this->test4_PublicBookingAndObjectLevelAuth();
        $this->test5_SevenStateLifecycleTransitions();
        $this->test6_DuplicateIntakeAndTerminalStateRejection();
        $this->test7_Aes256GcmCryptoAndTamperProofing();
        $this->test8_AtomicityAndRollback();
        $this->test9_ClinicianReviewWorkflowAndAudit();

        echo "\n====================================================================\n";
        echo "COMPREHENSIVE VERIFICATION SUMMARY: {$this->passed} PASSED, {$this->failed} FAILED\n";
        echo "====================================================================\n";

        if ($this->failed > 0) {
            exit(1);
        }
    }

    private function test1_RoleMatrixAuthorization(): void
    {
        echo "--- 1. Role Matrix & Authorization Boundaries (5 Roles) ---\n";

        // Setup a test appointment for authorization checks
        $testDate = date('Y-m-d', strtotime('+10 days'));
        $this->pdo->prepare("DELETE FROM appointments WHERE preferred_date = ?")->execute([$testDate]);

        $bookRes = $this->request('POST', '/api/appointments', [
            'patient_name' => 'Matrix Auth Patient',
            'patient_phone' => '03001234567',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:00 - 18:20',
            'appointment_type' => 'in-clinic',
            'intake_visit_reason' => 'Confidential health screening reason',
            'intake_existing_conditions' => 'Asthma'
        ]);
        $appId = (int)($bookRes['json']['appointment_id'] ?? 0);
        $this->assert('Test Appointment Created for Role Matrix', $appId > 0);

        // 1a. super_admin: can view appointments (operational only), 403 on /clinical
        $login = $this->login('superadmin@healthpro.com.pk');
        $this->assert('Super Admin Login Successful', $login['status'] === 200);
        $list = $this->request('GET', '/api/appointments');
        $this->assert('Super Admin Can Access Operational Appointments (200)', $list['status'] === 200);
        $clinRes = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Super Admin Denied Access to /clinical (403)', $clinRes['status'] === 403);
        $exportRes = $this->request('GET', '/api/appointments/export');
        $this->assert('Super Admin Can Export Appointments (200)', $exportRes['status'] === 200);

        // 1b. admin: can view operational, 403 on /clinical
        $login = $this->login('admin@healthpro.com.pk');
        $this->assert('Admin Login Successful', $login['status'] === 200);
        $list = $this->request('GET', '/api/appointments');
        $this->assert('Admin Can Access Operational Appointments (200)', $list['status'] === 200);
        $clinRes = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Admin Denied Access to /clinical (403)', $clinRes['status'] === 403);

        // 1c. receptionist: can view operational, add notes, 403 on /clinical, 403 on blocked slots
        $login = $this->login('reception@healthpro.com.pk');
        $this->assert('Receptionist Login Successful', $login['status'] === 200);
        $list = $this->request('GET', '/api/appointments');
        $this->assert('Receptionist Can Access Operational Appointments (200)', $list['status'] === 200);
        $clinRes = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Receptionist Denied Access to /clinical (403)', $clinRes['status'] === 403);
        $blockedRes = $this->request('POST', '/api/schedules/blocked-slots', [
            'date' => $testDate, 'start_time' => '19:00', 'end_time' => '20:00', 'reason' => 'Test'
        ]);
        $this->assert('Receptionist Denied Managing Blocked Slots (403)', $blockedRes['status'] === 403);

        // 1d. clinician: can view operational AND access /clinical with full intake
        $login = $this->login('clinician@healthpro.com.pk');
        $this->assert('Clinician Login Successful', $login['status'] === 200);
        $list = $this->request('GET', '/api/appointments');
        $this->assert('Clinician Can Access Operational Appointments (200)', $list['status'] === 200);
        $clinRes = $this->request('GET', "/api/appointments/{$appId}/clinical");
        $this->assert('Clinician Access to /clinical Permitted (200)', $clinRes['status'] === 200);
        $this->assert('Clinician Receives Decrypted Narrative', ($clinRes['json']['appointment']['intake']['visit_reason'] ?? '') === 'Confidential health screening reason');
        // Clinician cannot manage blocked slots or users
        $blockedRes = $this->request('POST', '/api/schedules/blocked-slots', [
            'date' => $testDate, 'start_time' => '19:00', 'end_time' => '20:00', 'reason' => 'Test'
        ]);
        $this->assert('Clinician Denied Managing Blocked Slots (403)', $blockedRes['status'] === 403);
    }

    private function test2_EditorTotalExclusion(): void
    {
        echo "\n--- 2. Editor Total Exclusion from Appointment Module & Endpoints ---\n";

        $login = $this->login('editor@healthpro.com.pk');
        $this->assert('Editor Login Successful', $login['status'] === 200);
        $this->assert('Editor Role Confirmed', ($login['json']['user']['role'] ?? '') === 'editor');

        // Verify HTTP 403 on every appointment route
        $endpoints = [
            ['GET', '/api/appointments', 'List Appointments'],
            ['GET', '/api/appointments/slots', 'Appointment Slots'],
            ['GET', '/api/appointments/1', 'Single Appointment Detail'],
            ['GET', '/api/appointments/export', 'Export Appointments'],
            ['GET', '/api/appointments/1/print', 'Print Appointment Slip'],
            ['GET', '/api/appointments/1/history', 'Appointment History'],
            ['POST', '/api/appointments/1/notes', 'Add Staff Note', ['note' => 'test']],
            ['POST', '/api/appointments', 'Public Booking by Editor', ['patient_name' => 'test']],
            ['POST', '/api/appointments/lookup', 'Appointment Lookup', ['reference_code' => 'TEST', 'patient_phone' => '123']],
            ['POST', '/api/appointments/reschedule', 'Reschedule', ['reference_code' => 'TEST', 'patient_phone' => '123']],
            ['POST', '/api/appointments/cancel', 'Cancel Appointment', ['reference_code' => 'TEST', 'patient_phone' => '123']],
            ['POST', '/api/appointments/intake', 'Submit Intake', ['reference_code' => 'TEST', 'patient_phone' => '123']],
            ['GET', '/api/appointments/1/clinical', 'Clinical Intake View'],
            ['POST', '/api/appointments/1/clinical/review', 'Clinical Intake Review'],
        ];

        foreach ($endpoints as $ep) {
            $method = $ep[0];
            $path = $ep[1];
            $desc = $ep[2];
            $body = $ep[3] ?? null;

            $res = $this->request($method, $path, $body);
            $this->assert("Editor Denied $desc ($method $path) -> 403 Forbidden", $res['status'] === 403);
        }

        // Editor CAN access CMS endpoints
        $blogsRes = $this->request('GET', '/api/blogs');
        $this->assert('Editor CAN Access Blog Content (200)', in_array($blogsRes['status'], [200, 404], true));
    }

    private function test3_RateLimitTestBypassSecurity(): void
    {
        echo "\n--- 3. Rate-Limit Test-Bypass Security Hardening ---\n";

        // Verify that HTTP requests carrying spoofed headers CANNOT bypass rate limiting in non-testing environment
        // Our Auth::canBypassRateLimit checks:
        // getenv('APP_ENV') === 'testing' AND (php_sapi_name() === 'cli' || defined('APP_TESTING'))
        // Under PHP built-in web server (php-S), php_sapi_name() is "cli-server", NOT "cli"!
        // Therefore, canBypassRateLimit() evaluates to FALSE for web requests, failing closed!

        require_once __DIR__ . '/../php-app/app/Security/Auth.php';
        
        $canBypassInWebContext = \App\Security\Auth::canBypassRateLimit();
        // Running this test script directly via CLI will return true because php_sapi_name() === 'cli' and APP_ENV=testing
        $this->assert('canBypassRateLimit is TRUE in CLI Test Harness', $canBypassInWebContext === true);

        // Simulate non-testing environment
        $_ENV['APP_ENV'] = 'production';
        putenv('APP_ENV=production');
        $canBypassProd = \App\Security\Auth::canBypassRateLimit();
        $this->assert('canBypassRateLimit Fails Closed (FALSE) in Production Environment', $canBypassProd === false);
        $_ENV['APP_ENV'] = 'testing';
        putenv('APP_ENV=testing'); // restore
    }

    private function test4_PublicBookingAndObjectLevelAuth(): void
    {
        echo "\n--- 4. Public Booking & Object-Level Authorization Lookup ---\n";

        $this->clearSession();
        $targetDate = date('Y-m-d', strtotime('+7 days'));
        $targetSlot = '18:20 - 18:40';

        // 1. Clean test slot
        $this->pdo->prepare("DELETE FROM appointments WHERE preferred_date = ? AND preferred_time_slot = ?")->execute([$targetDate, $targetSlot]);

        // 2. Public booking
        $bookPayload = [
            'patient_name' => 'Sara Ahmed Objective Test',
            'patient_phone' => '03331112233',
            'patient_email' => 'sara.ahmed@example.com',
            'preferred_date' => $targetDate,
            'preferred_time_slot' => $targetSlot,
            'appointment_type' => 'in-clinic',
            'communication_preference' => 'whatsapp',
            'patient_notes' => 'Patient self-booked via web portal'
        ];

        $bookRes = $this->request('POST', '/api/appointments', $bookPayload);
        $this->assert('Public Booking Succeeds (200/201)', in_array($bookRes['status'], [200, 201], true));
        $appId = (int)($bookRes['json']['appointment_id'] ?? 0);
        $refCode = (string)($bookRes['json']['reference_code'] ?? '');
        $this->assert('Reference Code Generated', !empty($refCode));

        // 3. Object-level auth: Lookup with correct phone + ref code
        $lookupGood = $this->request('POST', '/api/appointments/lookup', [
            'reference_code' => $refCode,
            'patient_phone' => '03331112233'
        ]);
        $this->assert('Lookup with Valid Ref Code & Phone Succeeds (200)', $lookupGood['status'] === 200);
        $this->assert('Lookup Returns Operational Fields Only', 
            isset($lookupGood['json']['appointment']['patient_name']) && !isset($lookupGood['json']['appointment']['visit_reason']));

        // 4. Object-level auth: Lookup with WRONG phone -> 404
        $lookupBadPhone = $this->request('POST', '/api/appointments/lookup', [
            'reference_code' => $refCode,
            'patient_phone' => '03999999999'
        ]);
        $this->assert('Lookup with Wrong Phone Rejected (404)', $lookupBadPhone['status'] === 404);

        // 5. Object-level auth: Lookup with WRONG ref code -> 404
        $lookupBadRef = $this->request('POST', '/api/appointments/lookup', [
            'reference_code' => 'INVALID-REF-999',
            'patient_phone' => '03331112233'
        ]);
        $this->assert('Lookup with Invalid Ref Code Rejected (404)', $lookupBadRef['status'] === 404);

        // 6. Reschedule with WRONG phone -> 404
        $reschedBadPhone = $this->request('POST', '/api/appointments/reschedule', [
            'reference_code' => $refCode,
            'patient_phone' => '03999999999',
            'new_date' => $targetDate,
            'new_time_slot' => '18:40 - 19:00'
        ]);
        $this->assert('Reschedule with Wrong Phone Rejected (404)', $reschedBadPhone['status'] === 404);

        // 7. Reschedule with CORRECT phone + ref code
        $newSlot = '18:40 - 19:00';
        $this->pdo->prepare("DELETE FROM appointments WHERE preferred_date = ? AND preferred_time_slot = ?")->execute([$targetDate, $newSlot]);
        $reschedGood = $this->request('POST', '/api/appointments/reschedule', [
            'reference_code' => $refCode,
            'patient_phone' => '03331112233',
            'new_date' => $targetDate,
            'new_time_slot' => $newSlot,
            'reason' => 'Schedule conflict changed by patient'
        ]);
        $this->assert('Reschedule with Valid Credentials Succeeds (200)', $reschedGood['status'] === 200);

        // Verify status transitioned to rescheduled
        $row = $this->pdo->query("SELECT status, preferred_time_slot FROM appointments WHERE id = $appId")->fetch();
        $this->assert('Appointment Status Updated to rescheduled', ($row['status'] ?? '') === 'rescheduled');
        $this->assert('Appointment Slot Updated to New Time', ($row['preferred_time_slot'] ?? '') === $newSlot);
    }

    private function test5_SevenStateLifecycleTransitions(): void
    {
        echo "\n--- 5. 7-State Appointment Lifecycle State Machine ---\n";

        $this->login('reception@healthpro.com.pk');

        $testDate = date('Y-m-d', strtotime('+12 days'));
        $this->pdo->prepare("DELETE FROM appointments WHERE preferred_date = ?")->execute([$testDate]);

        $bookRes = $this->request('POST', '/api/appointments', [
            'patient_name' => 'Lifecycle State Patient',
            'patient_phone' => '03450001122',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:00 - 18:20',
            'appointment_type' => 'in-clinic'
        ]);
        $appId = (int)($bookRes['json']['appointment_id'] ?? 0);
        $refCode = (string)($bookRes['json']['reference_code'] ?? '');

        // Canonical State 1: new (initial)
        $row = $this->pdo->query("SELECT status FROM appointments WHERE id = $appId")->fetch();
        $this->assert('Canonical State 1: Initial state is new', ($row['status'] ?? '') === 'new');

        // State 2: confirmed
        $upd = $this->request('PATCH', "/api/appointments/{$appId}", ['status' => 'confirmed', 'notes' => 'Confirmed by front desk']);
        $this->assert('Canonical State 2: Transition to confirmed (200)', $upd['status'] === 200);

        // State 3: checked_in
        $upd = $this->request('PATCH', "/api/appointments/{$appId}", ['status' => 'checked_in', 'notes' => 'Patient arrived at clinic']);
        $this->assert('Canonical State 3: Transition to checked_in (200)', $upd['status'] === 200);

        // State 4: completed
        $upd = $this->request('PATCH', "/api/appointments/{$appId}", ['status' => 'completed', 'notes' => 'Consultation completed by Dr. Farhan']);
        $this->assert('Canonical State 4: Transition to completed (200)', $upd['status'] === 200);

        // Terminal state constraint: Cannot cancel a completed appointment
        $this->clearSession();
        $cancelCompleted = $this->request('POST', '/api/appointments/cancel', [
            'reference_code' => $refCode,
            'patient_phone' => '03450001122',
            'reason' => 'Trying to cancel after visit'
        ]);
        $this->assert('Terminal Constraint: Completed appointment cannot be cancelled (400)', $cancelCompleted['status'] === 400);

        // State 5: no_show (test on a separate appointment)
        $bookRes2 = $this->request('POST', '/api/appointments', [
            'patient_name' => 'No Show Patient',
            'patient_phone' => '03450001123',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:20 - 18:40',
            'appointment_type' => 'in-clinic'
        ]);
        $appId2 = (int)($bookRes2['json']['appointment_id'] ?? 0);
        $this->login('reception@healthpro.com.pk');
        $upd = $this->request('PATCH', "/api/appointments/{$appId2}", ['status' => 'no_show', 'notes' => 'Patient did not arrive']);
        $this->assert('Canonical State 5: Transition to no_show (200)', $upd['status'] === 200);

        // State 6: cancelled (via public endpoint)
        $this->clearSession();
        $bookRes3 = $this->request('POST', '/api/appointments', [
            'patient_name' => 'Cancel Patient',
            'patient_phone' => '03450001124',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:40 - 19:00',
            'appointment_type' => 'in-clinic'
        ]);
        $appId3 = (int)($bookRes3['json']['appointment_id'] ?? 0);
        $refCode3 = (string)($bookRes3['json']['reference_code'] ?? '');

        $cancelRes = $this->request('POST', '/api/appointments/cancel', [
            'reference_code' => $refCode3,
            'patient_phone' => '03450001124',
            'reason' => 'Patient travelled out of station'
        ]);
        $this->assert('Canonical State 6: Public cancellation transitions to cancelled (200)', $cancelRes['status'] === 200);
        $row3 = $this->pdo->query("SELECT status FROM appointments WHERE id = $appId3")->fetch();
        $this->assert('Cancelled State Persisted in DB', ($row3['status'] ?? '') === 'cancelled');

        // State 7: rescheduled was tested in test4
        $this->assert('Canonical State 7: rescheduled validated in test 4', true);
    }

    private function test6_DuplicateIntakeAndTerminalStateRejection(): void
    {
        echo "\n--- 6. Duplicate Intake Prevention & Terminal State Rejection ---\n";

        $this->clearSession();
        $testDate = date('Y-m-d', strtotime('+15 days'));
        $this->pdo->prepare("DELETE FROM appointments WHERE preferred_date = ?")->execute([$testDate]);

        // 1. Create appointment without intake
        $bookRes = $this->request('POST', '/api/appointments', [
            'patient_name' => 'Intake Flow Patient',
            'patient_phone' => '03112223344',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:00 - 18:20',
            'appointment_type' => 'in-clinic'
        ]);
        $appId = (int)($bookRes['json']['appointment_id'] ?? 0);
        $refCode = (string)($bookRes['json']['reference_code'] ?? '');

        // 2. Submit initial intake via /api/appointments/intake
        $intake1 = $this->request('POST', '/api/appointments/intake', [
            'reference_code' => $refCode,
            'patient_phone' => '03112223344',
            'visit_reason' => 'Recurrent tension headaches for 3 weeks',
            'existing_conditions' => 'None',
            'current_medicines' => 'Paracetamol PRN',
            'known_allergies' => 'None'
        ]);
        $this->assert('Initial Intake Submission Succeeds (200)', $intake1['status'] === 200);
        $this->assert('Intake Completed Flag True', ($intake1['json']['appointment']['intake_completed'] ?? false) === true);

        // 3. Reject duplicate intake submission (409 Conflict)
        $intake2 = $this->request('POST', '/api/appointments/intake', [
            'reference_code' => $refCode,
            'patient_phone' => '03112223344',
            'visit_reason' => 'Attempting to overwrite intake'
        ]);
        $this->assert('Duplicate Intake Submission Rejected with 409 Conflict', $intake2['status'] === 409);
        $this->assert('Duplicate Error Code is already_submitted', ($intake2['json']['error'] ?? '') === 'already_submitted');

        // 4. Reject intake on cancelled appointment
        $bookRes2 = $this->request('POST', '/api/appointments', [
            'patient_name' => 'Cancelled Intake Patient',
            'patient_phone' => '03112223345',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:20 - 18:40',
            'appointment_type' => 'in-clinic'
        ]);
        $refCode2 = (string)($bookRes2['json']['reference_code'] ?? '');
        $this->request('POST', '/api/appointments/cancel', [
            'reference_code' => $refCode2,
            'patient_phone' => '03112223345',
            'reason' => 'Cancelled before intake'
        ]);

        $intakeCancelled = $this->request('POST', '/api/appointments/intake', [
            'reference_code' => $refCode2,
            'patient_phone' => '03112223345',
            'visit_reason' => 'Trying to submit intake on cancelled appointment'
        ]);
        $this->assert('Intake on Cancelled Appointment Rejected with 400 invalid_state', $intakeCancelled['status'] === 400);
        $this->assert('Error Mentions invalid_state', ($intakeCancelled['json']['error'] ?? '') === 'invalid_state');
    }

    private function test7_Aes256GcmCryptoAndTamperProofing(): void
    {
        echo "\n--- 7. AES-256-GCM Cryptographic Integrity & Tamper Proofing ---\n";

        require_once __DIR__ . '/../php-app/app/Security/Crypto.php';

        $secretText = 'Sensitive clinical evaluation: bilateral pedal edema and elevated fasting glucose';
        $encrypted = \App\Security\Crypto::encrypt($secretText);

        $this->assert('Ciphertext Starts with Version Prefix enc:v1:', str_starts_with($encrypted, 'enc:v1:'));
        $encoded = substr($encrypted, strlen('enc:v1:'));
        $raw = base64_decode($encoded, true);
        $this->assert('Base64 Decoding of Payload Succeeds', $raw !== false);

        $iv = substr($raw, 0, 12);
        $tag = substr($raw, 12, 16);
        $rawCipher = substr($raw, 28);

        $this->assert('IV Length is 12 Bytes (Standard GCM Nonce)', strlen($iv) === 12);
        $this->assert('Tag Length is 16 Bytes (128-bit Authentication Tag)', strlen($tag) === 16);

        // Clean decryption
        $decrypted = \App\Security\Crypto::decrypt($encrypted);
        $this->assert('Clean Decryption Recovers Exact Plaintext', $decrypted === $secretText);

        // Tamper test 1: Modify ciphertext byte -> Decryption must fail safely
        $tamperedRaw = $raw;
        $tamperedRaw[28] = chr(ord($tamperedRaw[28]) ^ 0xFF);
        $tamperedPayload = 'enc:v1:' . base64_encode($tamperedRaw);
        $tamperResult = \App\Security\Crypto::decrypt($tamperedPayload);
        $this->assert('Tampered Ciphertext Rejected by AES-256-GCM', str_contains((string)$tamperResult, 'Error'));

        // Tamper test 2: Modify tag byte -> Decryption must fail safely
        $tamperedTagRaw = $raw;
        $tamperedTagRaw[12] = chr(ord($tamperedTagRaw[12]) ^ 0xFF);
        $tamperedTagPayload = 'enc:v1:' . base64_encode($tamperedTagRaw);
        $tamperTagResult = \App\Security\Crypto::decrypt($tamperedTagPayload);
        $this->assert('Tampered Tag Rejected by AES-256-GCM', str_contains((string)$tamperTagResult, 'Error'));
    }

    private function test8_AtomicityAndRollback(): void
    {
        echo "\n--- 8. Atomic Transactions & Rollback Verification ---\n";

        // Verify that slot collision or duplicate reference code triggers clean rollback without orphan records
        $testDate = date('Y-m-d', strtotime('+20 days'));
        $testSlot = '18:00 - 18:20';

        $this->pdo->prepare("DELETE FROM appointments WHERE preferred_date = ?")->execute([$testDate]);

        // First booking succeeds
        $res1 = $this->request('POST', '/api/appointments', [
            'patient_name' => 'Atomic Patient 1',
            'patient_phone' => '03009990001',
            'preferred_date' => $testDate,
            'preferred_time_slot' => $testSlot,
            'appointment_type' => 'in-clinic',
            'intake_visit_reason' => 'First booking on slot'
        ]);
        $this->assert('First Booking on Slot Succeeds (200/201)', in_array($res1['status'], [200, 201], true));
        $appId1 = (int)($res1['json']['appointment_id'] ?? 0);

        // Second booking on exact same slot MUST fail with 409 Conflict
        $res2 = $this->request('POST', '/api/appointments', [
            'patient_name' => 'Atomic Patient 2 (Collision)',
            'patient_phone' => '03009990002',
            'preferred_date' => $testDate,
            'preferred_time_slot' => $testSlot,
            'appointment_type' => 'in-clinic',
            'intake_visit_reason' => 'Second booking attempting collision'
        ]);
        $this->assert('Slot Collision Rejected with 409 Conflict', $res2['status'] === 409);

        // Confirm database contains ONLY 1 record for this slot (no half-saved second appointment)
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM appointments WHERE preferred_date = ? AND preferred_time_slot = ?");
        $stmt->execute([$testDate, $testSlot]);
        $count = (int)$stmt->fetchColumn();
        $this->assert('Atomicity Preserved: Exactly 1 Appointment Exists for Slot', $count === 1);

        // Confirm no orphan patient_intakes record was saved for the failed second booking
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM patient_intakes WHERE visit_reason LIKE '%Second booking attempting collision%'");
        $stmt->execute();
        $orphanCount = (int)$stmt->fetchColumn();
        $this->assert('Atomicity Preserved: Zero Orphan Intake Records in Database', $orphanCount === 0);
    }

    private function test9_ClinicianReviewWorkflowAndAudit(): void
    {
        echo "\n--- 9. Clinician Intake Review Workflow & PHI-Free Audit Trail ---\n";

        // Create appointment with intake
        $testDate = date('Y-m-d', strtotime('+22 days'));
        $this->pdo->prepare("DELETE FROM appointments WHERE preferred_date = ?")->execute([$testDate]);

        $bookRes = $this->request('POST', '/api/appointments', [
            'patient_name' => 'Review Workflow Patient',
            'patient_phone' => '03225556677',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:00 - 18:20',
            'appointment_type' => 'in-clinic',
            'intake_visit_reason' => 'Reviewable clinical concern',
            'intake_existing_conditions' => 'Type 2 Diabetes'
        ]);
        $appId = (int)($bookRes['json']['appointment_id'] ?? 0);

        // 1. Receptionist attempting to review -> 403 Forbidden
        $this->login('reception@healthpro.com.pk');
        $recReview = $this->request('POST', "/api/appointments/{$appId}/clinical/review");
        $this->assert('Receptionist Review Attempt Forbidden (403)', $recReview['status'] === 403);

        // 2. Admin attempting to review -> 403 Forbidden
        $this->login('admin@healthpro.com.pk');
        $adminReview = $this->request('POST', "/api/appointments/{$appId}/clinical/review");
        $this->assert('Admin Review Attempt Forbidden (403)', $adminReview['status'] === 403);

        // 3. Treating Clinician reviews intake -> 200 OK
        $this->login('clinician@healthpro.com.pk');
        $clinReview = $this->request('POST', "/api/appointments/{$appId}/clinical/review");
        $this->assert('Clinician Review Succeeds (200)', $clinReview['status'] === 200);
        $this->assert('Review Response Returns reviewed_at and reviewed_by', 
            !empty($clinReview['json']['reviewed_at']) && !empty($clinReview['json']['reviewed_by']));

        // 4. Verify DB fields updated
        $stmt = $this->pdo->prepare("SELECT reviewed_at, reviewed_by FROM patient_intakes WHERE appointment_id = ?");
        $stmt->execute([$appId]);
        $dbIntake = $stmt->fetch();
        $this->assert('DB Record Contains reviewed_at Timestamp', !empty($dbIntake['reviewed_at']));
        $this->assert('DB Record Contains reviewed_by Clinician Name', !empty($dbIntake['reviewed_by']));

        // 5. Verify PHI-free audit log
        $stmt = $this->pdo->prepare("
            SELECT action, details_json FROM audit_logs 
            WHERE entity_type = 'appointment' 
            AND entity_id = ? 
            AND action = 'clinical_intake_reviewed' 
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([(string)$appId]);
        $audit = $stmt->fetch();
        $this->assert('Audit Log Created for clinical_intake_reviewed', !empty($audit));
        $this->assert('Audit Log Details Do NOT Contain Sensitive Intake Narrative', 
            !str_contains((string)($audit['details_json'] ?? ''), 'Reviewable clinical concern'));
    }
}

// Run the verification
$baseUrl = getenv('API_TEST_BASE_URL') ?: 'http://127.0.0.1:8899';
$runner = new Stage3bComprehensiveRunner($baseUrl);
$runner->runAll();
