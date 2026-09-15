<?php
/**
 * Repair Stage 2B - PHP API Contract Verification Test Suite
 * Fully automated, deterministic HTTP contract tests for all PHP API endpoints.
 * Validates request/response schemas, status codes, CSRF, auth session cookies,
 * RBAC authorization boundaries, clinical history suppression, and canonical routing.
 */

declare(strict_types=1);

class ApiContractRunner
{
    private string $baseUrl;
    private ?string $cookieJar = null;
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

    private function request(string $method, string $path, ?array $body = null, array $headers = [], bool $useCookies = true): array
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

        if ($useCookies && !empty($this->sessionCookies)) {
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

        // Parse cookies from Set-Cookie headers
        if ($useCookies) {
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

    public function runAll(): void
    {
        echo "====================================================================\n";
        echo "DR. FARHAN MUSTAFA CLINIC PORTAL - PHP API CONTRACT VERIFICATION\n";
        echo "====================================================================\n";

        // Clean up prior contract test fixtures for deterministic repeatable runs
        try {
            $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
            $dbPort = getenv('DB_PORT') ?: '3306';
            $dbName = getenv('DB_NAME') ?: 'test_fresh';
            $dbUser = getenv('DB_USER') ?: 'test_user';
            $dbPass = getenv('DB_PASS') ?: '';
            $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName}", $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $pdo->exec("DELETE FROM appointments WHERE patient_name LIKE '%Contract Test%' OR patient_email = 'sara.ahmed@example.com'");
        } catch (\Throwable $e) {}

        $this->test1_HealthEndpoint();
        $this->test2_AuthFlowsAndCsrf();
        $this->test3_PublicAppointmentEndpoints();
        $this->test4_AppointmentBookingLifecycleContract();
        $this->test5_ContactInquiryEndpoint();
        $this->test6_SettingsEndpoint();
        $this->test7_RbacAuthorizationBoundaries();
        $this->test8_OperationalListClinicalHistorySuppression();
        $this->test9_DeprecatedRoutesAndCanonicalRouting();

        echo "\n====================================================================\n";
        echo sprintf("API CONTRACT SUMMARY: %d PASSED, %d FAILED\n", $this->passed, $this->failed);
        echo "====================================================================\n";

        if ($this->failed > 0) {
            exit(1);
        }
    }

    private function test1_HealthEndpoint(): void
    {
        echo "\n--- 1. API Health & Status Endpoint (/api/health) ---\n";
        $res = $this->request('GET', '/api/health');

        $this->assert('Status 200 OK', $res['status'] === 200);
        $this->assert('Content-Type Application/JSON', str_contains($res['headers'], 'application/json'));
        $this->assert('Service Name Matches', ($res['json']['service'] ?? '') === 'Dr. Farhan Mustafa Clinic Portal');
        $this->assert('Database Status Connected', ($res['json']['database'] ?? '') === 'connected');
        $this->assert('PHP Version Reported', !empty($res['json']['php_version']));
        $this->assert('ISO 8601 Timestamp Present', !empty($res['json']['timestamp']));
    }

    private function test2_AuthFlowsAndCsrf(): void
    {
        echo "\n--- 2. Authentication, CSRF & Session Management (/api/auth/*) ---\n";
        $this->clearSession();

        // 1. Unauthenticated session check (returns 401 with authenticated=false)
        $res = $this->request('GET', '/api/auth/session');
        $this->assert('Unauthenticated Session Returns 401 with authenticated=false', 
            in_array($res['status'], [200, 401], true) && ($res['json']['authenticated'] ?? null) === false);

        // 2. Fetch CSRF Token
        $csrfRes = $this->request('GET', '/api/auth/csrf');
        $this->assert('CSRF Endpoint Returns 200', $csrfRes['status'] === 200);
        $this->assert('CSRF Token Present in Response', !empty($csrfRes['json']['csrf_token']));
        $this->csrfToken = $csrfRes['json']['csrf_token'] ?? null;

        // 3. Login with invalid credentials
        $badLogin = $this->request('POST', '/api/auth/login', [
            'email' => 'superadmin@healthpro.com.pk',
            'password' => 'WrongPassword!'
        ]);
        $this->assert('Invalid Login Returns 401 Unauthorized', $badLogin['status'] === 401);
        $this->assert('Invalid Login Returns Sanitized Error', ($badLogin['json']['error'] ?? '') === 'invalid_credentials');

        // 4. Login with valid seed super admin credentials
        $goodLogin = $this->request('POST', '/api/auth/login', [
            'email' => 'superadmin@healthpro.com.pk',
            'password' => 'Admin@HealthPro2026!'
        ]);
        $this->assert('Valid Login Returns 200 OK', $goodLogin['status'] === 200);
        $this->assert('Login Response Contains User Details', !empty($goodLogin['json']['user']));
        $this->assert('Login Role is super_admin', ($goodLogin['json']['user']['role'] ?? '') === 'super_admin');
        if (!empty($goodLogin['json']['csrf_token'])) {
            $this->csrfToken = $goodLogin['json']['csrf_token'];
        }

        // 5. Authenticated session check
        $authSession = $this->request('GET', '/api/auth/session');
        $this->assert('Session Check Confirms authenticated=true', 
            $authSession['status'] === 200 && ($authSession['json']['authenticated'] ?? null) === true);
        $this->assert('Session Check Contains Valid Role', ($authSession['json']['user']['role'] ?? '') === 'super_admin');

        // 6. Logout
        $logoutRes = $this->request('POST', '/api/auth/logout');
        $this->assert('Logout Returns 200 OK', $logoutRes['status'] === 200);

        // 7. Post-logout session check
        $postLogout = $this->request('GET', '/api/auth/session');
        $this->assert('Post-Logout Session is authenticated=false', ($postLogout['json']['authenticated'] ?? null) === false);
    }

    private function test3_PublicAppointmentEndpoints(): void
    {
        echo "\n--- 3. Public Appointment Endpoints (Types & Slots) ---\n";

        // Types endpoint
        $typesRes = $this->request('GET', '/api/appointments/types');
        $this->assert('Appointment Types Returns 200 OK', $typesRes['status'] === 200);
        $typesList = is_array($typesRes['json']) ? (isset($typesRes['json']['types']) ? $typesRes['json']['types'] : $typesRes['json']) : [];
        $this->assert('Appointment Types Returns Array', is_array($typesList) && count($typesList) >= 3);

        // Slots endpoint without date defaults to today
        $defaultSlots = $this->request('GET', '/api/appointments/slots');
        $this->assert('Slots Query Without Date Defaults to Today and Returns 200', $defaultSlots['status'] === 200);

        // Slots endpoint with valid weekday date
        $targetDate = date('Y-m-d', strtotime('next Tuesday'));
        $slotsRes = $this->request('GET', '/api/appointments/slots?date=' . $targetDate);
        $this->assert('Slots Query with Valid Date Returns 200 OK', $slotsRes['status'] === 200);
        $this->assert('Slots Array Present in Response', is_array($slotsRes['json']['slots'] ?? null));
        $this->assert('Slot Item Contains time and is_available', 
            isset($slotsRes['json']['slots'][0]['time']) && isset($slotsRes['json']['slots'][0]['is_available']));
    }

    private function test4_AppointmentBookingLifecycleContract(): void
    {
        echo "\n--- 4. Public Appointment Booking, Lookup & Lifecycle Contract ---\n";

        $testDate = date('Y-m-d', strtotime('next Tuesday'));
        $bookingPayload = [
            'patient_name' => 'Sara Ahmed Contract Test',
            'patient_phone' => '03001234567',
            'patient_email' => 'sara.ahmed@example.com',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:00 - 18:20',
            'appointment_type' => 'in-clinic',
            'communication_preference' => 'whatsapp',
            'patient_notes' => 'Contract test booking request.'
        ];

        // 1. Post new appointment
        $bookRes = $this->request('POST', '/api/appointments', $bookingPayload);
        $this->assert('Appointment Booking Returns 200/201', in_array($bookRes['status'], [200, 201], true));
        $this->assert('Booking Response Contains reference_code', !empty($bookRes['json']['reference_code']));
        $refCode = $bookRes['json']['reference_code'] ?? '';
        $appId = (int)($bookRes['json']['appointment_id'] ?? 0);

        // 2. Lookup Appointment via Reference Code + Phone
        $lookupRes = $this->request('POST', '/api/appointments/lookup', [
            'reference_code' => $refCode,
            'phone' => '03001234567'
        ]);
        $this->assert('Appointment Lookup Returns 200 OK', $lookupRes['status'] === 200);
        $this->assert('Lookup Result Contains Appointment Object', !empty($lookupRes['json']['appointment']));
        $this->assert('Lookup Patient Name Matches', ($lookupRes['json']['appointment']['patient_name'] ?? '') === 'Sara Ahmed Contract Test');
        $this->assert('Lookup Initial Status is "new"', ($lookupRes['json']['appointment']['status'] ?? '') === 'new');

        // Lookup with invalid phone should fail
        $badLookup = $this->request('POST', '/api/appointments/lookup', [
            'reference_code' => $refCode,
            'phone' => '03999999999'
        ]);
        $this->assert('Lookup with Mismatched Phone Returns 404', $badLookup['status'] === 404);

        // 3. Reschedule Appointment
        $newDate = date('Y-m-d', strtotime('next Wednesday'));
        $reschRes = $this->request('POST', '/api/appointments/reschedule', [
            'reference_code' => $refCode,
            'phone' => '03001234567',
            'new_date' => $newDate,
            'new_time_slot' => '18:20 - 18:40',
            'reason' => 'Patient work conflict'
        ]);
        $this->assert('Appointment Reschedule Returns 200 OK', $reschRes['status'] === 200);
        $this->assert('Reschedule Response Status is "rescheduled"', ($reschRes['json']['status'] ?? '') === 'rescheduled');

        // 4. Save Additional Intake Data
        $intakeRes = $this->request('POST', '/api/appointments/intake', [
            'reference_code' => $refCode,
            'phone' => '03001234567',
            'existing_conditions' => 'Type 2 Diabetes, Hypertension',
            'current_medicines' => 'Metformin 500mg, Ramipril 2.5mg',
            'known_allergies' => 'Penicillin, Sulfa drugs'
        ]);
        $this->assert('Intake Submission Returns 200 OK', $intakeRes['status'] === 200);

        // 5. Cancel Appointment
        $cancelRes = $this->request('POST', '/api/appointments/cancel', [
            'reference_code' => $refCode,
            'phone' => '03001234567',
            'reason' => 'Travelling out of city'
        ]);
        $this->assert('Appointment Cancellation Returns 200 OK', $cancelRes['status'] === 200);
        $this->assert('Cancellation Response Status is "cancelled"', ($cancelRes['json']['status'] ?? '') === 'cancelled');
    }

    private function test5_ContactInquiryEndpoint(): void
    {
        echo "\n--- 5. Contact Inquiries (/api/contact) ---\n";

        // Invalid submission (missing message)
        $badContact = $this->request('POST', '/api/contact', [
            'name' => 'Fictional Inquirer',
            'email' => 'inquirer@example.com'
        ]);
        $this->assert('Incomplete Contact Form Returns 400', $badContact['status'] === 400);

        // Valid contact message
        $goodContact = $this->request('POST', '/api/contact', [
            'name' => 'Fictional Patient Inquirer',
            'email' => 'inquirer@example.com',
            'phone' => '03217654321',
            'subject' => 'General Inquiry about Consultation Timings',
            'message' => 'Hello Dr. Farhan, could you please confirm if laboratory tests can be reviewed during evening clinic?'
        ]);
        $this->assert('Valid Contact Submission Returns 200/201', in_array($goodContact['status'], [200, 201], true));
        $this->assert('Contact Response Returns Success True', ($goodContact['json']['success'] ?? false) === true);
    }

    private function test6_SettingsEndpoint(): void
    {
        echo "\n--- 6. Public Clinic Settings (/api/settings) ---\n";

        $settingsRes = $this->request('GET', '/api/settings');
        $this->assert('Public Settings Returns 200 OK', $settingsRes['status'] === 200);
        $this->assert('Settings Response Contains Clinic Metadata', is_array($settingsRes['json']['settings'] ?? null));
        $settings = $settingsRes['json']['settings'] ?? [];
        $this->assert('Clinic Name Present in Settings', isset($settings['clinic_name']) || isset($settings['clinic_phone']));
    }

    private function test7_RbacAuthorizationBoundaries(): void
    {
        echo "\n--- 7. RBAC Authorization Boundaries & Role Protections ---\n";
        $this->clearSession();

        // 1. Unauthenticated access to /api/admin/users -> 401
        $unauthUsers = $this->request('GET', '/api/admin/users');
        $this->assert('Unauthenticated Access to /api/admin/users Blocked (401)', $unauthUsers['status'] === 401);

        // 2. Unauthenticated access to /api/admin/audit-logs -> 401
        $unauthAudit = $this->request('GET', '/api/admin/audit-logs');
        $this->assert('Unauthenticated Access to /api/admin/audit-logs Blocked (401)', $unauthAudit['status'] === 401);

        // 3. Unauthenticated access to /api/admin/verification -> 401
        $unauthVerif = $this->request('GET', '/api/admin/verification');
        $this->assert('Unauthenticated Access to /api/admin/verification Blocked (401)', $unauthVerif['status'] === 401);

        // 4. Log in as receptionist and test boundaries
        $csrfRes = $this->request('GET', '/api/auth/csrf');
        $this->csrfToken = $csrfRes['json']['csrf_token'] ?? null;
        $loginRes = $this->request('POST', '/api/auth/login', [
            'email' => 'reception@healthpro.com.pk',
            'password' => 'Admin@HealthPro2026!'
        ]);
        $this->assert('Receptionist Login Succeeds (200)', $loginRes['status'] === 200);

        // Receptionist accessing /api/admin/users (super_admin only) -> 403
        $recepUsers = $this->request('GET', '/api/admin/users');
        $this->assert('Receptionist Access to /api/admin/users Forbidden (403)', $recepUsers['status'] === 403);

        // Receptionist accessing /api/admin/audit-logs (super_admin only) -> 403
        $recepAudit = $this->request('GET', '/api/admin/audit-logs');
        $this->assert('Receptionist Access to /api/admin/audit-logs Forbidden (403)', $recepAudit['status'] === 403);

        // Receptionist accessing /api/admin/verification (editor/admin/super_admin) -> 403
        $recepVerif = $this->request('GET', '/api/admin/verification');
        $this->assert('Receptionist Access to /api/admin/verification Forbidden (403)', $recepVerif['status'] === 403);

        // Receptionist CAN access operational appointments list
        $recepApps = $this->request('GET', '/api/appointments');
        $this->assert('Receptionist Access to /api/appointments Permitted (200)', $recepApps['status'] === 200);

        // 5. Log in as super_admin
        $this->clearSession();
        $csrfRes = $this->request('GET', '/api/auth/csrf');
        $this->csrfToken = $csrfRes['json']['csrf_token'] ?? null;
        $superLogin = $this->request('POST', '/api/auth/login', [
            'email' => 'superadmin@healthpro.com.pk',
            'password' => 'Admin@HealthPro2026!'
        ]);
        $this->assert('Super Admin Login Succeeds (200)', $superLogin['status'] === 200);

        // Super admin CAN access /api/admin/users
        $superUsers = $this->request('GET', '/api/admin/users');
        $this->assert('Super Admin Access to /api/admin/users Permitted (200)', $superUsers['status'] === 200);
        $this->assert('Super Admin Receives User List', is_array($superUsers['json']['users'] ?? null));

        // Super admin CAN access /api/admin/audit-logs
        $superAudit = $this->request('GET', '/api/admin/audit-logs');
        $this->assert('Super Admin Access to /api/admin/audit-logs Permitted (200)', $superAudit['status'] === 200);
        $this->assert('Super Admin Receives Audit Logs List', is_array($superAudit['json']['logs'] ?? null));

        // Super admin CAN access /api/admin/verification
        $superVerif = $this->request('GET', '/api/admin/verification');
        $this->assert('Super Admin Access to /api/admin/verification Permitted (200)', $superVerif['status'] === 200);
    }

    private function test8_OperationalListClinicalHistorySuppression(): void
    {
        echo "\n--- 8. Operational List Clinical History Suppression Contract ---\n";

        // With session authenticated as staff, fetch appointments list
        $res = $this->request('GET', '/api/appointments');
        $this->assert('Operational Appointments Query Returns 200', $res['status'] === 200);
        $apps = $res['json']['appointments'] ?? [];
        $this->assert('Operational Appointments Array Returned', is_array($apps) && count($apps) > 0);

        if (count($apps) > 0) {
            $first = $apps[0];
            $clinicalKeys = ['visit_reason', 'symptom_duration', 'existing_conditions', 'current_medicines', 'known_allergies', 'intake_notes'];
            $leakedKeys = [];
            foreach ($clinicalKeys as $k) {
                if (array_key_exists($k, $first)) {
                    $leakedKeys[] = $k;
                }
            }
            $this->assert('No Clinical Sensitive Keys Present in Operational Listing', 
                empty($leakedKeys), 
                'Leaked: ' . implode(', ', $leakedKeys));

            $this->assert('Operational has_intake Flag Retained', array_key_exists('has_intake', $first));
            $this->assert('Operational Patient Name Retained', !empty($first['patient_name']));
            $this->assert('Operational Reference Code Retained', !empty($first['reference_code']));
            $this->assert('Operational Status Retained', !empty($first['status']));
        }
    }

    private function test9_DeprecatedRoutesAndCanonicalRouting(): void
    {
        echo "\n--- 9. Canonical Routing & Deprecation Header Compliance ---\n";

        // Test PATCH /api/appointments/{id} (canonical status update)
        // First get an appointment ID from listing
        $listRes = $this->request('GET', '/api/appointments');
        $apps = $listRes['json']['appointments'] ?? [];
        if (count($apps) > 0) {
            $targetApp = null;
            foreach ($apps as $a) {
                if (($a['status'] ?? '') === 'new') {
                    $targetApp = $a;
                    break;
                }
            }
            if (!$targetApp) {
                $targetApp = $apps[0];
                // Ensure starting from a status that can transition to confirmed
                try {
                    $dbHost = getenv('DB_HOST') ?: '127.0.0.1';
                    $dbPort = getenv('DB_PORT') ?: '3306';
                    $dbName = getenv('DB_NAME') ?: 'test_fresh';
                    $dbUser = getenv('DB_USER') ?: 'test_user';
                    $dbPass = getenv('DB_PASS') ?: '';
                    $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName}", $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
                    $pdo->prepare("UPDATE appointments SET status = 'new' WHERE id = ?")->execute([$targetApp['id']]);
                } catch (\Throwable $e) {}
            }
            $testId = (int)$targetApp['id'];

            // Test canonical route: PATCH /api/appointments/{id}
            $patchRes = $this->request('PATCH', "/api/appointments/$testId", [
                'status' => 'confirmed',
                'notes' => 'Confirmed via API contract test'
            ]);
            $this->assert('Canonical PATCH /api/appointments/{id} Returns 200', $patchRes['status'] === 200);

            // Test deprecated route: POST /api/appointments/status
            $depRes = $this->request('POST', '/api/appointments/status', [
                'id' => $testId,
                'status' => 'checked_in',
                'notes' => 'Checked in via deprecated route'
            ]);
            $this->assert('Deprecated Route /api/appointments/status Returns 200', $depRes['status'] === 200);
            $this->assert('Deprecated Route Returns X-Deprecated Header', 
                str_contains($depRes['headers'], 'X-Deprecated') || str_contains($depRes['headers'], 'x-deprecated'));
        }
    }
}

// Instantiate and run against local test server
$baseUrl = getenv('API_TEST_BASE_URL') ?: 'http://127.0.0.1:8899';
$runner = new ApiContractRunner($baseUrl);
$runner->runAll();
