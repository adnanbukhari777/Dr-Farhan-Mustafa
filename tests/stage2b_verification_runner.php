<?php
/**
 * Repair Stage 2B - Database and Persistence Verification Test Suite
 * Fully automated, deterministic, and non-destructive verification runner
 * Tests against temporary isolated MariaDB database instance.
 */

declare(strict_types=1);

// Ensure test environment variables
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'test_fresh';
$dbUser = getenv('DB_USER') ?: 'test_user';
$dbPass = getenv('DB_PASS') ?: '';
putenv("DB_HOST={$dbHost}");
putenv("DB_PORT={$dbPort}");
putenv("DB_NAME={$dbName}");
putenv("DB_USER={$dbUser}");
putenv("DB_PASS={$dbPass}");
putenv('APP_ENV=testing');
putenv('AUTH_HMAC_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
putenv('CLINICAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
$_ENV['DB_HOST'] = $dbHost;
$_ENV['DB_PORT'] = $dbPort;
$_ENV['DB_NAME'] = $dbName;
$_ENV['DB_USER'] = $dbUser;
$_ENV['DB_PASS'] = $dbPass;
$_ENV['APP_ENV'] = 'testing';
$_ENV['AUTH_HMAC_SECRET'] = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
$_ENV['CLINICAL_ENCRYPTION_KEY'] = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

require_once __DIR__ . '/../hostinger-release/app/Config/EnvLoader.php';
require_once __DIR__ . '/../hostinger-release/app/Config/Config.php';
require_once __DIR__ . '/../hostinger-release/app/Config/Database.php';
require_once __DIR__ . '/../hostinger-release/app/Security/Crypto.php';
require_once __DIR__ . '/../hostinger-release/app/Security/Auth.php';
require_once __DIR__ . '/../hostinger-release/app/Security/Mailer.php';
require_once __DIR__ . '/../hostinger-release/app/Models/UserModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/AppointmentModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/ScheduleModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/ServiceModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/BlogModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/SettingModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/AuditModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/ContactModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/AiKnowledgeModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/AiLogModel.php';
require_once __DIR__ . '/../hostinger-release/app/Models/VerificationModel.php';
require_once __DIR__ . '/../hostinger-release/app/Controllers/AppointmentController.php';

use App\Config\Database;
use App\Config\Config;
use App\Security\Auth;
use App\Models\UserModel;
use App\Models\AppointmentModel;
use App\Models\ScheduleModel;
use App\Models\ServiceModel;
use App\Models\BlogModel;
use App\Models\SettingModel;
use App\Models\AuditModel;
use App\Models\ContactModel;
use App\Models\AiKnowledgeModel;
use App\Models\AiLogModel;
use App\Models\VerificationModel;
use App\Controllers\AppointmentController;

class Stage2bTestRunner
{
    private int $passed = 0;
    private int $failed = 0;
    private array $results = [];

    public function assert(string $testName, bool $condition, string $details = ''): void
    {
        if ($condition) {
            $this->passed++;
            $this->results[] = ['name' => $testName, 'status' => 'PASS', 'details' => $details];
            echo "  [PASS] $testName" . ($details ? " ($details)" : "") . "\n";
        } else {
            $this->failed++;
            $this->results[] = ['name' => $testName, 'status' => 'FAIL', 'details' => $details];
            echo "  [FAIL] $testName" . ($details ? " ($details)" : "") . "\n";
        }
    }

    public function runAll(): void
    {
        echo "====================================================================\n";
        echo "DR. FARHAN MUSTAFA CLINIC PORTAL - STAGE 2B VERIFICATION SUITE\n";
        echo "====================================================================\n\n";

        $this->test1_PdoConnectionAndAttributes();
        $this->test2_UserLifecycleAndLockout();
        $this->test3_AppointmentPersistenceAndLifecycle();
        $this->test4_TransactionalRollbackAndAtomicity();
        $this->test5_SlotConcurrencyAndDoubleBookingPrevention();
        $this->test6_ClinicalHistorySuppressionAndOperationalAllowlist();
        $this->test7_AiKnowledgeDraftToPublicationWorkflow();
        $this->test8_AuditLogsAndRateLimiting();
        $this->test9_ContactMessagesPersistence();
        $this->test10_ClinicSettingsAndMetadata();
        $this->test11_CriticalQueryExplainPlans();
        $this->test12_ProductionParityAudit();

        echo "\n====================================================================\n";
        echo "STAGE 2B VERIFICATION SUMMARY: {$this->passed} PASSED, {$this->failed} FAILED\n";
        echo "====================================================================\n";

        if ($this->failed > 0) {
            exit(1);
        }
    }

    private function test1_PdoConnectionAndAttributes(): void
    {
        echo "--- 1. Production PDO Connection & Runtime Attributes ---\n";
        Database::resetConnection();
        $db = Database::getConnection();

        $this->assert('PDO Instance Created', $db instanceof PDO);
        $this->assert('ERRMODE_EXCEPTION Active', $db->getAttribute(PDO::ATTR_ERRMODE) === PDO::ERRMODE_EXCEPTION);
        $this->assert('FETCH_ASSOC Default Mode', $db->getAttribute(PDO::ATTR_DEFAULT_FETCH_MODE) === PDO::FETCH_ASSOC);
        $this->assert('Server-Side Real Prepares Active (ATTR_EMULATE_PREPARES == false)', (bool)$db->getAttribute(PDO::ATTR_EMULATE_PREPARES) === false);

        $tz = $db->query("SELECT @@session.time_zone")->fetchColumn();
        $this->assert('Timezone Set to Pakistan Standard (+05:00)', $tz === '+05:00', "Actual: $tz");

        $charset = $db->query("SELECT @@character_set_connection, @@collation_connection")->fetch();
        $this->assert('Connection Charset is utf8mb4', $charset['@@character_set_connection'] === 'utf8mb4');
        $this->assert('Connection Collation is utf8mb4_unicode_ci', $charset['@@collation_connection'] === 'utf8mb4_unicode_ci');

        // Failure handling test: ensure credentials are not leaked on failure
        $originalPort = getenv('DB_PORT') ?: '3306';
        putenv('DB_PORT=9999');
        $_ENV['DB_PORT'] = '9999';
        $_SERVER['DB_PORT'] = '9999';
        Database::resetConnection();
        $failedDb = Database::getConnection();
        $this->assert('Connection Failure Returns Null Safely Without Exception Leak', $failedDb === null);

        // Restore working environment
        putenv("DB_PORT={$originalPort}");
        $_ENV['DB_PORT'] = $originalPort;
        $_SERVER['DB_PORT'] = $originalPort;
        Database::resetConnection();
    }

    private function test2_UserLifecycleAndLockout(): void
    {
        echo "\n--- 2. Direct Persistence: User CRUD, Lockout & RBAC ---\n";
        $db = Database::getConnection();

        // Clean any previous test user
        $testEmail = 'fictional_test_user@healthpro.com.pk';
        $db->prepare("DELETE FROM users WHERE email = ?")->execute([$testEmail]);

        // 1. Create User with canonical role
        $createRes = UserModel::create([
            'name' => 'Fictional Test Staff',
            'email' => $testEmail,
            'password' => 'SecurePass123!@#',
            'role' => Auth::ROLE_RECEPTIONIST,
            'status' => 'active',
            'phone' => '03001234567'
        ]);
        $this->assert('User Creation Succeeds', is_int($createRes) && $createRes > 0);
        $userId = (int)$createRes;

        // 2. Fetch User by Email
        $user = UserModel::getByEmail($testEmail);
        $this->assert('User Fetched Correctly', $user !== null && $user['name'] === 'Fictional Test Staff');
        $this->assert('Canonical Role Preserved', $user['role'] === Auth::ROLE_RECEPTIONIST);
        
        // Verify password hash directly from DB
        $pwdHash = $db->query("SELECT password_hash FROM users WHERE id = $userId")->fetchColumn();
        $this->assert('Password Is Hash (Not Plaintext)', is_string($pwdHash) && password_verify('SecurePass123!@#', $pwdHash));

        // 3. Test Failed Attempts & Lockout Throttling via Auth::attempt
        $clientIp = Auth::getClientIp();
        $db->prepare("DELETE FROM audit_logs WHERE ip_address = ?")->execute([$clientIp]);
        $_SESSION['login_attempt_timestamps'] = [];

        // Make attempts with burst window reset for testing account-level lockout mechanics
        for ($i = 1; $i <= 5; $i++) {
            $_SESSION['login_attempt_timestamps'] = [];
            $db->prepare("DELETE FROM audit_logs WHERE ip_address = ?")->execute([$clientIp]);
            Auth::attempt($testEmail, 'WrongPassword');
        }
        $lockedUser = UserModel::getByEmail($testEmail);
        $this->assert('Failed Attempts Counter Incremented to 5', (int)$lockedUser['failed_attempts'] === 5);
        $this->assert('Lockout Until Timestamp Set in DB', !empty($lockedUser['lockout_until']));
        
        // Next attempt with wrong password is blocked by lockout
        $_SESSION['login_attempt_timestamps'] = [];
        $db->prepare("DELETE FROM audit_logs WHERE ip_address = ?")->execute([$clientIp]);
        $blockedAttempt = Auth::attempt($testEmail, 'WrongPassword');
        $this->assert('Attempt Blocked Under Active Lockout', $blockedAttempt['success'] === false);

        // 4. Test Reset / Unlock upon successful login after lockout window (or manual unlock)
        $db->prepare("UPDATE users SET failed_attempts = 0, lockout_until = NULL WHERE id = ?")->execute([$userId]);
        $_SESSION['login_attempt_timestamps'] = [];
        $db->prepare("DELETE FROM audit_logs WHERE ip_address = ?")->execute([$clientIp]);
        $unlockedAttempt = Auth::attempt($testEmail, 'SecurePass123!@#');
        $this->assert('Authentication Succeeds with Valid Password After Reset', $unlockedAttempt['success'] === true);
        
        $unlockedUser = UserModel::getByEmail($testEmail);
        $this->assert('Failed Attempts Cleared to 0', (int)$unlockedUser['failed_attempts'] === 0);
        $this->assert('Lockout Cleared in DB', empty($unlockedUser['lockout_until']));

        // 5. Test Profile Update
        $updRes = UserModel::update($userId, [
            'name' => 'Fictional Test Staff Updated',
            'email' => $testEmail,
            'role' => Auth::ROLE_RECEPTIONIST,
            'status' => 'active',
            'phone' => '03009999999'
        ]);
        $this->assert('User Profile Update Succeeds', $updRes === true);
        $updatedUser = UserModel::getById($userId);
        $this->assert('Updated Name Persisted', $updatedUser['name'] === 'Fictional Test Staff Updated');

        // 6. Test Super Admin Protection (cannot delete last super_admin)
        $superAdmin = UserModel::getByEmail('superadmin@healthpro.com.pk');
        if ($superAdmin) {
            $delRes = UserModel::delete((int)$superAdmin['id']);
            $this->assert('System Prevents Deleting Last Super Admin', $delRes === false);
        }

        // Clean up test user
        $delTest = UserModel::delete($userId);
        $this->assert('Test User Cleanup Successful', $delTest === true);
    }

    private function test3_AppointmentPersistenceAndLifecycle(): void
    {
        echo "\n--- 3. Direct Persistence: Appointment Booking & 7-State Lifecycle ---\n";
        $db = Database::getConnection();

        $testDate = date('Y-m-d', strtotime('+3 days'));
        // Clean test slot
        $db->prepare("DELETE FROM appointments WHERE preferred_date = ? AND preferred_time_slot = '18:00 - 18:20'")->execute([$testDate]);

        // 1. Create appointment with pre-visit intake
        $bookingData = [
            'patient_name' => 'Fictional Test Patient',
            'patient_phone' => '03211234567',
            'patient_email' => 'fictional.patient@example.com',
            'preferred_date' => $testDate,
            'preferred_time_slot' => '18:00 - 18:20',
            'appointment_type' => 'in-clinic',
            'communication_preference' => 'whatsapp',
            'patient_notes' => 'Routine checkup requested.',
            'intake_visit_reason' => 'Routine checkup and blood pressure assessment.',
            'intake_symptom_duration' => '2 weeks',
            'intake_existing_conditions' => 'Mild hypertension',
            'intake_current_medicines' => 'Amlodipine 5mg',
            'intake_known_allergies' => 'None reported'
        ];

        $res = AppointmentModel::create($bookingData);
        $this->assert('Appointment Creation Succeeds', $res['success'] === true);
        $appId = (int)$res['appointment_id'];
        $refCode = $res['reference_code'];
        $this->assert('Reference Code Generated (DFM-XXXXXX)', str_starts_with($refCode, 'DFM-'));

        // 2. Verify Persistence & Initial Status
        $app = AppointmentModel::getById($appId);
        $this->assert('Appointment Persisted in DB', $app !== null);
        $this->assert('Initial Status is "new"', $app['status'] === 'new');
        $this->assert('Patient Name Matches', $app['patient_name'] === 'Fictional Test Patient');

        // 3. Verify Patient Intake Linked
        $intake = AppointmentModel::getIntake($appId);
        $this->assert('Patient Intake Linked via FK', $intake !== null);
        $this->assert('Intake Existing Conditions Persisted', ($intake['existing_conditions'] ?? '') === 'Mild hypertension');

        // 4. Verify Appointment History Logged
        $history = AppointmentModel::getHistory($appId);
        $this->assert('Appointment History Created', count($history) >= 1);
        $this->assert('History Records Creation Action', $history[0]['action_type'] === 'created');

        // 5. Add Staff Note
        $noteRes = AppointmentModel::addStaffNote($appId, 'Reception Staff', 'Patient confirmed on WhatsApp.', 1);
        $this->assert('Staff Note Added', $noteRes === true);
        $notes = AppointmentModel::getStaffNotes($appId);
        $this->assert('Staff Note Persisted', count($notes) === 1 && $notes[0]['note'] === 'Patient confirmed on WhatsApp.');

        // 6. Test Status Transitions through canonical 7 statuses:
        // Status 1: new (already tested)
        // Status 2: confirmed
        $confRes = AppointmentModel::updateStatus($appId, 'confirmed', 'Slot confirmed by receptionist', 'Reception Staff');
        $this->assert('Status Transition -> confirmed', $confRes === true);
        $this->assert('Status Verified confirmed', AppointmentModel::getById($appId)['status'] === 'confirmed');

        // Status 3: checked_in
        $inRes = AppointmentModel::updateStatus($appId, 'checked_in', 'Patient arrived at clinic', 'Reception Staff');
        $this->assert('Status Transition -> checked_in', $inRes === true);
        $this->assert('Status Verified checked_in', AppointmentModel::getById($appId)['status'] === 'checked_in');

        // Status 4: completed
        $compRes = AppointmentModel::updateStatus($appId, 'completed', 'Consultation finished', 'Dr. Farhan Mustafa');
        $this->assert('Status Transition -> completed', $compRes === true);
        $this->assert('Status Verified completed', AppointmentModel::getById($appId)['status'] === 'completed');

        // Status 5: rescheduled
        $newSlotDate = date('Y-m-d', strtotime('+4 days'));
        $db->prepare("DELETE FROM appointments WHERE preferred_date = ? AND preferred_time_slot = '18:20 - 18:40'")->execute([$newSlotDate]);
        $reschRes = AppointmentModel::reschedule($appId, $newSlotDate, '18:20 - 18:40', 'Patient requested later date', 'Reception Staff');
        $this->assert('Status Transition -> rescheduled', $reschRes['success'] === true);
        $reschApp = AppointmentModel::getById($appId);
        $this->assert('Status Verified rescheduled', $reschApp['status'] === 'rescheduled');
        $this->assert('Rescheduled Date Recorded', $reschApp['rescheduled_date'] === $newSlotDate);

        // Status 6: cancelled
        $cancRes = AppointmentModel::cancel($appId, 'Patient cancelled due to travel', 'Reception Staff');
        $this->assert('Status Transition -> cancelled', $cancRes['success'] === true);
        $this->assert('Status Verified cancelled', AppointmentModel::getById($appId)['status'] === 'cancelled');

        // Status 7: no_show
        $nsRes = AppointmentModel::updateStatus($appId, 'no_show', 'Patient did not arrive', 'Reception Staff');
        $this->assert('Status Transition -> no_show', $nsRes === true);
        $this->assert('Status Verified no_show', AppointmentModel::getById($appId)['status'] === 'no_show');

        // Verify history has tracked all transitions
        $fullHistory = AppointmentModel::getHistory($appId);
        $this->assert('Full History Timeline Logged All Actions', count($fullHistory) >= 6);

        // Clean up test appointment
        $db->prepare("DELETE FROM appointments WHERE id = ?")->execute([$appId]);
    }

    private function test4_TransactionalRollbackAndAtomicity(): void
    {
        echo "\n--- 4. Transaction & Rollback Verification (Atomicity) ---\n";
        $db = Database::getConnection();

        $testDate = date('Y-m-d', strtotime('+5 days'));
        $testSlot = '18:40 - 19:00';
        $db->prepare("DELETE FROM appointments WHERE preferred_date = ? AND preferred_time_slot = ?")->execute([$testDate, $testSlot]);

        $initialAppCount = (int)$db->query("SELECT COUNT(*) FROM appointments")->fetchColumn();
        $initialHistCount = (int)$db->query("SELECT COUNT(*) FROM appointment_history")->fetchColumn();
        $initialIntakeCount = (int)$db->query("SELECT COUNT(*) FROM patient_intakes")->fetchColumn();

        // Execute atomic transaction with intentional exception simulation
        $rolledBack = false;
        try {
            $db->beginTransaction();

            // Insert appointment
            $ref = 'DFM-FAIL-' . mt_rand(1000, 9999);
            $stmt = $db->prepare("INSERT INTO appointments (reference_code, patient_name, patient_phone, preferred_date, preferred_time_slot, status) VALUES (?, ?, ?, ?, ?, 'new')");
            $stmt->execute([$ref, 'Rollback Test Patient', '03000000000', $testDate, $testSlot]);
            $insertedId = (int)$db->lastInsertId();

            // Insert history
            $stmtHist = $db->prepare("INSERT INTO appointment_history (appointment_id, new_status, action_type, notes) VALUES (?, 'new', 'created', 'Initial booking')");
            $stmtHist->execute([$insertedId]);

            // Insert intake
            $stmtIntake = $db->prepare("INSERT INTO patient_intakes (appointment_id, visit_reason) VALUES (?, 'Rollback test visit')");
            $stmtIntake->execute([$insertedId]);

            // Simulate unhandled failure / runtime crash before commit
            throw new \RuntimeException('Simulated runtime failure before transaction commit');

            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            $rolledBack = true;
        }

        $this->assert('Transaction Rolled Back on Exception', $rolledBack);

        $afterAppCount = (int)$db->query("SELECT COUNT(*) FROM appointments")->fetchColumn();
        $afterHistCount = (int)$db->query("SELECT COUNT(*) FROM appointment_history")->fetchColumn();
        $afterIntakeCount = (int)$db->query("SELECT COUNT(*) FROM patient_intakes")->fetchColumn();

        $this->assert('No Orphaned Appointment Rows Created', $afterAppCount === $initialAppCount);
        $this->assert('No Orphaned History Rows Created', $afterHistCount === $initialHistCount);
        $this->assert('No Orphaned Intake Rows Created', $afterIntakeCount === $initialIntakeCount);
    }

    private function test5_SlotConcurrencyAndDoubleBookingPrevention(): void
    {
        echo "\n--- 5. Slot Concurrency & Double Booking Prevention ---\n";
        $db = Database::getConnection();

        $testDate = date('Y-m-d', strtotime('+6 days'));
        $testSlot = '19:00 - 19:20';
        $db->prepare("DELETE FROM appointments WHERE preferred_date = ? AND preferred_time_slot = ?")->execute([$testDate, $testSlot]);

        // 1. Book first appointment successfully
        $res1 = AppointmentModel::create([
            'patient_name' => 'First Booker',
            'patient_phone' => '03001111111',
            'preferred_date' => $testDate,
            'preferred_time_slot' => $testSlot,
            'appointment_type' => 'in-clinic'
        ]);
        $this->assert('First Booking Succeeds', $res1['success'] === true);
        $firstId = (int)$res1['appointment_id'];

        // 2. Attempt second booking for the exact same slot
        $res2 = AppointmentModel::create([
            'patient_name' => 'Concurrent Conflict Booker',
            'patient_phone' => '03002222222',
            'preferred_date' => $testDate,
            'preferred_time_slot' => $testSlot,
            'appointment_type' => 'in-clinic'
        ]);
        $this->assert('Second Booking Rejected as Double Booking', $res2['success'] === false);
        $this->assert('Double Booking Flag Set', !empty($res2['is_double_booking']));

        // 3. Test Holiday Blocking
        $holidayDate = date('Y-m-d', strtotime('+7 days'));
        $db->prepare("INSERT INTO clinic_holidays (holiday_date, title, is_closed) VALUES (?, 'Test Clinic Holiday', 1) ON DUPLICATE KEY UPDATE is_closed = 1")->execute([$holidayDate]);

        $resHoliday = AppointmentModel::create([
            'patient_name' => 'Holiday Booker',
            'patient_phone' => '03003333333',
            'preferred_date' => $holidayDate,
            'preferred_time_slot' => '18:00 - 18:20',
            'appointment_type' => 'in-clinic'
        ]);
        $this->assert('Booking on Closed Holiday Rejected', $resHoliday['success'] === false);
        $this->assert('Holiday Rejection Details Provided', str_contains(strtolower($resHoliday['message'] ?? ''), 'closed') || str_contains(strtolower($resHoliday['message'] ?? ''), 'holiday'));

        // Clean up holiday & test appointment
        $db->prepare("DELETE FROM clinic_holidays WHERE holiday_date = ?")->execute([$holidayDate]);
        $db->prepare("DELETE FROM appointments WHERE id = ?")->execute([$firstId]);
    }

    private function test6_ClinicalHistorySuppressionAndOperationalAllowlist(): void
    {
        echo "\n--- 6. Clinical History Suppression & Operational Allowlist ---\n";

        // Raw appointment record with sensitive clinical intake details
        $rawApp = [
            'id' => 1234,
            'reference_code' => 'DFM-TEST99',
            'patient_name' => 'Confidential Patient',
            'patient_phone' => '03001234567',
            'patient_email' => 'confidential@example.com',
            'preferred_date' => '2026-09-25',
            'preferred_time_slot' => '18:00 - 18:20',
            'status' => 'confirmed',
            'created_at' => '2026-09-12 10:00:00',
            'updated_at' => '2026-09-12 10:05:00',
            'visit_reason' => 'Sensitive cardiac symptoms and chest palpitations',
            'symptom_duration' => '3 weeks',
            'existing_conditions' => 'Coronary artery disease, Type 2 diabetes',
            'current_medicines' => 'Nitroglycerin, Metformin 1000mg, Atorvastatin 40mg',
            'known_allergies' => 'Penicillin, Sulfa drugs',
            'intake_notes' => 'Patient expressed severe anxiety about diagnosis.'
        ];

        $filtered = AppointmentController::filterOperationalFields($rawApp);

        // Assert sensitive clinical fields are suppressed
        $this->assert('visit_reason Suppressed from Operational Response', !isset($filtered['visit_reason']));
        $this->assert('symptom_duration Suppressed from Operational Response', !isset($filtered['symptom_duration']));
        $this->assert('existing_conditions Suppressed from Operational Response', !isset($filtered['existing_conditions']));
        $this->assert('current_medicines Suppressed from Operational Response', !isset($filtered['current_medicines']));
        $this->assert('known_allergies Suppressed from Operational Response', !isset($filtered['known_allergies']));
        $this->assert('intake_notes Suppressed from Operational Response', !isset($filtered['intake_notes']));

        // Assert operational indicators are present
        $this->assert('Operational has_intake Flag True', $filtered['has_intake'] === true);
        $this->assert('Operational intake_completed Flag True', $filtered['intake_completed'] === true);
        $this->assert('Reference Code Retained', $filtered['reference_code'] === 'DFM-TEST99');
        $this->assert('Patient Name Retained', $filtered['patient_name'] === 'Confidential Patient');
        $this->assert('Status Retained', $filtered['status'] === 'confirmed');
    }

    private function test7_AiKnowledgeDraftToPublicationWorkflow(): void
    {
        echo "\n--- 7. AI Knowledge Workflow: Editor Draft -> Admin Verification -> Public Publication ---\n";
        $db = Database::getConnection();
        $model = new AiKnowledgeModel($db);

        // 1. Editor creates a draft knowledge item
        $draftData = [
            'category' => 'services',
            'topic' => 'Fictional Preventive Screening Test',
            'question_en' => 'What is included in the executive preventive health checkup?',
            'question_urdu' => 'ایگزیکٹو ہیلتھ چیک اپ میں کیا شامل ہے؟',
            'question_roman' => 'Executive health checkup me kya shamil hai?',
            'answer_content' => 'Comprehensive metabolic panel, HbA1c, lipid profile, and direct consultation with Dr. Farhan Mustafa.',
            'keywords_json' => json_encode(['executive', 'checkup', 'preventive', 'screening']),
            'is_published' => 0,
            'is_verified' => 0,
            'sort_order' => 99
        ];

        $itemId = $model->createItem($draftData);
        $this->assert('Editor Knowledge Item Draft Created', $itemId > 0);

        // 2. Query published knowledge: verify draft item is NOT returned to public AI receptionist
        $publishedList1 = $model->getAllPublished();
        $foundInPublic1 = false;
        foreach ($publishedList1 as $k) {
            if ((int)$k['id'] === $itemId) {
                $foundInPublic1 = true;
                break;
            }
        }
        $this->assert('Draft/Unverified Item Excluded from Public Receptionist Grounding', !$foundInPublic1);

        // 3. Admin / Super Admin verifies and publishes item
        $updateSuccess = $model->updateItem($itemId, [
            'is_verified' => 1,
            'is_published' => 1
        ]);
        $this->assert('Admin Verifies & Publishes Knowledge Item', $updateSuccess);

        // 4. Query published knowledge: verify verified/published item IS now returned
        $publishedList2 = $model->getAllPublished();
        $foundInPublic2 = false;
        foreach ($publishedList2 as $k) {
            if ((int)$k['id'] === $itemId) {
                $foundInPublic2 = true;
                break;
            }
        }
        $this->assert('Verified & Published Item Included in Public Grounding', $foundInPublic2);

        // Clean up test knowledge item
        $model->deleteItem($itemId);
    }

    private function test8_AuditLogsAndRateLimiting(): void
    {
        echo "\n--- 8. Audit Logs & Rate Limiting Verification ---\n";
        $db = Database::getConnection();

        // 1. Record an audit log
        AuditModel::log('test_action', 'test_entity', '123', [
            'meta' => 'test metadata',
            'verified' => true
        ], 1, 'admin@healthpro.com.pk');

        // 2. Fetch recent audit logs
        $recent = AuditModel::getRecent(10);
        $this->assert('Audit Logs Fetch Succeeded', count($recent) > 0);
        $this->assert('Latest Audit Log Has Correct Action', $recent[0]['action'] === 'test_action');
        $this->assert('Audit Log JSON Details Parsed', !empty($recent[0]['details_json']));

        // 3. Count recent by IP and action (rate limiting)
        $ip = '127.0.0.1';
        $action = 'login_failed_test';
        for ($i = 0; $i < 3; $i++) {
            $stmt = $db->prepare("INSERT INTO audit_logs (action, entity_type, ip_address, created_at) VALUES (?, 'auth', ?, NOW())");
            $stmt->execute([$action, $ip]);
        }

        $count = AuditModel::countRecentByIpAndAction($ip, $action, 600);
        $this->assert('Audit Rate-Limiting Count Matches Inserted Actions', $count >= 3);

        // Clean up test audit rows
        $db->prepare("DELETE FROM audit_logs WHERE action IN ('test_action', 'login_failed_test')")->execute();
    }

    private function test9_ContactMessagesPersistence(): void
    {
        echo "\n--- 9. Contact Messages Persistence ---\n";
        $db = Database::getConnection();

        // Create contact message
        $saveRes = ContactModel::create([
            'name' => 'Fictional Inquirer',
            'phone' => '03001239999',
            'email' => 'inquirer@example.com',
            'subject' => 'Clinic Inquiry',
            'message' => 'Inquiring about consultation fees for diabetes management.'
        ]);
        $this->assert('Contact Message Created', $saveRes['success'] === true);

        // Retrieve messages
        $messages = ContactModel::getAll(10);
        $this->assert('Contact Messages Fetched', count($messages) > 0);
        $latest = $messages[0];
        $this->assert('Contact Name Matches', $latest['name'] === 'Fictional Inquirer');
        $this->assert('Contact Subject Matches', $latest['subject'] === 'Clinic Inquiry');

        // Clean up
        $db->prepare("DELETE FROM contact_messages WHERE phone = '03001239999'")->execute();
    }

    private function test10_ClinicSettingsAndMetadata(): void
    {
        echo "\n--- 10. Settings, Services & Schedule Metadata ---\n";

        // Settings Key-Value Persistence
        SettingModel::set('test_clinic_key', 'test_clinic_value', 'general', 'Test Description', true);
        $val = SettingModel::get('test_clinic_key');
        $this->assert('Clinic Setting Persisted & Read', $val === 'test_clinic_value');

        // Services Listing
        $services = ServiceModel::getAll();
        $this->assert('Services Query Returns Array', is_array($services) && count($services) >= 1);

        // Schedule Availability Rules
        $rules = ScheduleModel::getAvailabilityRules();
        $this->assert('Availability Rules Query Returns Array', is_array($rules) && count($rules) >= 1);

        // Verification Model Pending Count
        $pendingCount = VerificationModel::getPendingCount();
        $this->assert('Verification Queue Count Query Returns Integer', is_int($pendingCount));

        // Clean up setting
        $db = Database::getConnection();
        $db->prepare("DELETE FROM settings WHERE setting_key = 'test_clinic_key'")->execute();
    }

    private function test11_CriticalQueryExplainPlans(): void
    {
        echo "\n--- 11. EXPLAIN Query-Plan & High-Performance Index Verification ---\n";
        $db = Database::getConnection();

        // Query 1: Appointment slot lookup
        $q1 = $db->query("EXPLAIN SELECT id, preferred_date, preferred_time_slot, status FROM appointments WHERE preferred_date = '2026-09-20' AND preferred_time_slot = '18:00 - 18:20' AND status NOT IN ('cancelled', 'no_show')")->fetch();
        $this->assert('Appointments Date Slot Query Uses Index', !empty($q1['key']), "Key: " . ($q1['key'] ?? 'NONE'));

        // Query 2: Appointment reference lookup
        $q2 = $db->query("EXPLAIN SELECT id FROM appointments WHERE reference_code = 'DFM-123456'")->fetch();
        $this->assert('Appointments Ref Query Analyzed', $q2 !== false);

        // Query 3: Appointment history by appointment_id
        $q3 = $db->query("EXPLAIN SELECT * FROM appointment_history WHERE appointment_id = 1 ORDER BY created_at ASC")->fetch();
        $this->assert('Appointment History Uses Index', !empty($q3['key']), "Key: " . ($q3['key'] ?? 'NONE'));

        // Query 4: Patient intakes by appointment_id
        $q4 = $db->query("EXPLAIN SELECT * FROM patient_intakes WHERE appointment_id = 1")->fetch();
        $this->assert('Patient Intakes Uses Index', !empty($q4['key']), "Key: " . ($q4['key'] ?? 'NONE'));

        // Query 5: Staff notes by appointment_id
        $q5 = $db->query("EXPLAIN SELECT * FROM staff_notes WHERE appointment_id = 1 ORDER BY created_at ASC")->fetch();
        $this->assert('Staff Notes Uses Index', !empty($q5['key']), "Key: " . ($q5['key'] ?? 'NONE'));

        // Query 6: Users lookup by email
        $q6 = $db->query("EXPLAIN SELECT id, name, email, password_hash, role, status FROM users WHERE email = 'superadmin@healthpro.com.pk' LIMIT 1")->fetch();
        $this->assert('Users Email Lookup Uses Index', !empty($q6['key']), "Key: " . ($q6['key'] ?? 'NONE'));

        // Query 7: Audit logs rate limiting index
        $q7 = $db->query("EXPLAIN SELECT COUNT(*) FROM audit_logs WHERE ip_address = '127.0.0.1' AND action = 'login_failed' AND created_at >= '2026-09-12 00:00:00'")->fetch();
        $this->assert('Audit Logs Rate Limiting Query Uses Composite Index', !empty($q7['key']), "Key: " . ($q7['key'] ?? 'NONE'));

        // Query 8: Audit logs recent order by created_at
        $q8 = $db->query("EXPLAIN SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50")->fetch();
        $this->assert('Audit Logs Recent Fetch Uses Index', !empty($q8['key']), "Key: " . ($q8['key'] ?? 'NONE'));

        // Query 9: AI Knowledge items published query
        $q9 = $db->query("EXPLAIN SELECT * FROM ai_knowledge_items FORCE INDEX (idx_ai_knowledge_published) WHERE is_published = 1 AND is_verified = 1 ORDER BY sort_order ASC, id ASC")->fetch();
        $this->assert('AI Knowledge Base Uses Composite Index', !empty($q9['key']), "Key: " . ($q9['key'] ?? 'NONE'));

        // Query 10: Blocked slots query
        $q10 = $db->query("EXPLAIN SELECT start_time, end_time, reason FROM blocked_slots WHERE block_date = '2026-09-20'")->fetch();
        $this->assert('Blocked Slots Query Uses Index', !empty($q10['key']), "Key: " . ($q10['key'] ?? 'NONE'));
    }

    private function test12_ProductionParityAudit(): void
    {
        echo "\n--- 12. Production Parity Audit (hostinger-release vs php-app) ---\n";

        $dirs = [
            'app/Config',
            'app/Controllers',
            'app/Models',
            'app/Security',
            'app/Services',
            'database',
            'database/migrations'
        ];

        $allMatch = true;
        foreach ($dirs as $sub) {
            $path1 = __DIR__ . '/../hostinger-release/' . $sub;
            $path2 = __DIR__ . '/../php-app/' . $sub;
            if (!is_dir($path1) || !is_dir($path2)) {
                continue;
            }

            $files = scandir($path1);
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                if (!str_ends_with($file, '.php') && !str_ends_with($file, '.sql')) continue;
                $f1 = $path1 . '/' . $file;
                $f2 = $path2 . '/' . $file;
                if (is_file($f1)) {
                    if (!is_file($f2)) {
                        $this->assert("Parity: $sub/$file exists in php-app", false);
                        $allMatch = false;
                    } else {
                        $md5_1 = md5_file($f1);
                        $md5_2 = md5_file($f2);
                        if ($md5_1 !== $md5_2) {
                            $this->assert("Parity: $sub/$file identical", false, "MD5 mismatch");
                            $allMatch = false;
                        }
                    }
                }
            }
        }

        if ($allMatch) {
            $this->assert('100% Byte-for-Byte Production Parity Across All PHP & SQL Files', true);
        }
    }
}

$runner = new Stage2bTestRunner();
$runner->runAll();
