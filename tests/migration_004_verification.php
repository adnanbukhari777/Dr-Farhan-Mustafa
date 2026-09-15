<?php
/**
 * Stage 3B - Migration 004 Verification Suite
 * Verifies schema migration against:
 * 1. Fresh Database (direct schema.sql)
 * 2. Legacy Database (simulating pre-004 state, migrating with 004_add_clinician_role_and_workflow.sql, verifying zero data loss)
 * 3. Partially Migrated / Idempotent Execution (re-running 004 on already migrated DBs)
 */

declare(strict_types=1);

$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = (int)(getenv('DB_PORT') ?: 3306);
$dbUser = getenv('DB_USER') ?: 'test_user';
$dbPass = getenv('DB_PASS') ?: '';

$pdo = new PDO("mysql:host={$dbHost};port={$dbPort}", $dbUser, $dbPass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$passed = 0;
$failed = 0;

function assertTest(string $name, bool $condition, string $details = ''): void {
    global $passed, $failed;
    if ($condition) {
        $passed++;
        echo "  [PASS] $name\n";
    } else {
        $failed++;
        echo "  [FAIL] $name" . ($details ? " ($details)" : '') . "\n";
    }
}

echo "====================================================================\n";
echo "STAGE 3B - MIGRATION 004 COMPREHENSIVE VERIFICATION\n";
echo "====================================================================\n\n";

// ====================================================================
// TEST 1: Fresh Database Initialization
// ====================================================================
echo "--- 1. Fresh Database Initialization (schema.sql) ---\n";
$pdo->exec("DROP DATABASE IF EXISTS test_fresh");
$pdo->exec("CREATE DATABASE test_fresh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE test_fresh");

$schemaSql = file_get_contents(__DIR__ . '/../php-app/database/schema.sql');
// Split and execute SQL statements safely
$pdo->exec($schemaSql);

// Verify users table enum in test_fresh
$stmt = $pdo->query("SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'test_fresh' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'");
$roleType = (string)$stmt->fetchColumn();
assertTest('Fresh DB: users.role ENUM includes clinician', str_contains($roleType, "'clinician'"));

// Verify patient_intakes columns
$stmt = $pdo->query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'test_fresh' AND TABLE_NAME = 'patient_intakes'");
$intakeCols = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
assertTest('Fresh DB: patient_intakes has is_encrypted', isset($intakeCols['is_encrypted']));
assertTest('Fresh DB: patient_intakes has reviewed_at', isset($intakeCols['reviewed_at']));
assertTest('Fresh DB: patient_intakes has reviewed_by', isset($intakeCols['reviewed_by']));
assertTest('Fresh DB: symptom_duration is TEXT', ($intakeCols['symptom_duration'] ?? '') === 'text');

// Verify appointments status enum
$stmt = $pdo->query("SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'test_fresh' AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'status'");
$statusType = (string)$stmt->fetchColumn();
$expectedStatuses = ['new', 'confirmed', 'rescheduled', 'checked_in', 'completed', 'cancelled', 'no_show'];
$allStatusesCovered = true;
foreach ($expectedStatuses as $st) {
    if (!str_contains($statusType, "'$st'")) {
        $allStatusesCovered = false;
        break;
    }
}
assertTest('Fresh DB: appointments.status includes all 7 canonical states', $allStatusesCovered);

// Verify seeded users for all 5 roles
$stmt = $pdo->query("SELECT email, role, status FROM users WHERE role IN ('super_admin', 'admin', 'receptionist', 'editor', 'clinician')");
$seeded = $stmt->fetchAll();
$rolesPresent = array_column($seeded, 'role');
assertTest('Fresh DB: super_admin seeded', in_array('super_admin', $rolesPresent, true));
assertTest('Fresh DB: admin seeded', in_array('admin', $rolesPresent, true));
assertTest('Fresh DB: receptionist seeded', in_array('receptionist', $rolesPresent, true));
assertTest('Fresh DB: editor seeded', in_array('editor', $rolesPresent, true));
assertTest('Fresh DB: clinician seeded', in_array('clinician', $rolesPresent, true));


// ====================================================================
// TEST 2: Legacy Database Migration (Pre-004 to Post-004)
// ====================================================================
echo "\n--- 2. Legacy Database Migration & Zero Data Loss ---\n";
$pdo->exec("DROP DATABASE IF EXISTS test_legacy");
$pdo->exec("CREATE DATABASE test_legacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE test_legacy");

// Build a pre-004 legacy schema
$pdo->exec("
    CREATE TABLE users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'receptionist', 'editor') NOT NULL DEFAULT 'receptionist',
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        phone VARCHAR(20) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE appointments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        reference_code VARCHAR(16) NOT NULL UNIQUE,
        patient_name VARCHAR(100) NOT NULL,
        patient_phone VARCHAR(20) NOT NULL,
        patient_email VARCHAR(150) NULL,
        appointment_type VARCHAR(50) NOT NULL DEFAULT 'in-clinic',
        preferred_date DATE NOT NULL,
        preferred_time_slot VARCHAR(50) NOT NULL,
        status ENUM('new', 'confirmed', 'rescheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE patient_intakes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT UNSIGNED NOT NULL,
        visit_reason VARCHAR(255) NOT NULL,
        symptom_duration VARCHAR(100) NULL,
        existing_conditions VARCHAR(255) NULL,
        current_medicines VARCHAR(255) NULL,
        known_allergies VARCHAR(255) NULL,
        general_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// Insert legacy test records
$pdo->exec("
    INSERT INTO users (name, email, password_hash, role) VALUES 
    ('Legacy Super', 'superadmin@healthpro.com.pk', 'hash1', 'super_admin'),
    ('Legacy Staff', 'reception@healthpro.com.pk', 'hash2', 'receptionist');

    INSERT INTO appointments (reference_code, patient_name, patient_phone, preferred_date, preferred_time_slot, status) VALUES
    ('LEGACY-001', 'Old Patient 1', '03001112223', '2026-08-01', '18:00 - 18:20', 'confirmed');

    INSERT INTO patient_intakes (appointment_id, visit_reason, symptom_duration, existing_conditions) VALUES
    (1, 'Legacy hypertension complaint', '1 year', 'Hypertension');
");

// Apply Migration 004
$migrationSql = file_get_contents(__DIR__ . '/../php-app/database/migrations/004_add_clinician_role_and_workflow.sql');
$pdo->exec($migrationSql);

// Verify data preserved
$stmt = $pdo->query("SELECT * FROM appointments WHERE reference_code = 'LEGACY-001'");
$legacyApp = $stmt->fetch();
assertTest('Legacy DB: Existing appointment record preserved', !empty($legacyApp) && $legacyApp['patient_name'] === 'Old Patient 1');

$stmt = $pdo->query("SELECT * FROM patient_intakes WHERE appointment_id = 1");
$legacyIntake = $stmt->fetch();
assertTest('Legacy DB: Existing patient intake record preserved', !empty($legacyIntake) && $legacyIntake['visit_reason'] === 'Legacy hypertension complaint');
assertTest('Legacy DB: Existing intake default is_encrypted = 0', (int)$legacyIntake['is_encrypted'] === 0);
assertTest('Legacy DB: reviewed_at column created and NULL for legacy intake', array_key_exists('reviewed_at', $legacyIntake) && $legacyIntake['reviewed_at'] === null);

// Verify upgraded enum in legacy DB
$stmt = $pdo->query("SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'test_legacy' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'");
$roleType = (string)$stmt->fetchColumn();
assertTest('Legacy DB: users.role upgraded to include clinician', str_contains($roleType, "'clinician'"));

// Verify clinician user seeded by migration 004
$stmt = $pdo->query("SELECT * FROM users WHERE email = 'clinician@healthpro.com.pk'");
$clinUser = $stmt->fetch();
assertTest('Legacy DB: Default clinician account seeded', !empty($clinUser) && $clinUser['role'] === 'clinician');


// ====================================================================
// TEST 3: Idempotent Execution (Partially Migrated / Double Run)
// ====================================================================
echo "\n--- 3. Idempotent Re-execution (Double Run Safety) ---\n";
try {
    // Re-run migration 004 on test_legacy (second time)
    $pdo->exec($migrationSql);
    assertTest('Idempotent: Re-running Migration 004 on migrated DB succeeds without error', true);
} catch (Exception $e) {
    assertTest('Idempotent: Re-running Migration 004 on migrated DB succeeds without error', false, $e->getMessage());
}

try {
    // Re-run migration 004 on test_fresh (already fresh schema)
    $pdo->exec("USE test_fresh");
    $pdo->exec($migrationSql);
    assertTest('Idempotent: Running Migration 004 on fresh DB succeeds without error', true);
} catch (Exception $e) {
    assertTest('Idempotent: Running Migration 004 on fresh DB succeeds without error', false, $e->getMessage());
}

echo "\n====================================================================\n";
echo "MIGRATION 004 VERIFICATION: $passed PASSED, $failed FAILED\n";
echo "====================================================================\n";

if ($failed > 0) {
    exit(1);
}
