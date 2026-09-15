-- ==============================================================================
-- Dr. Farhan Mustafa Clinic Portal - Database Migration 004
-- Migration: 004_add_clinician_role_and_workflow.sql
-- Description: Add dedicated 'clinician' role for clinical intake access isolation,
--              support encrypted clinical fields at rest, and establish canonical
--              7-state appointment workflow lifecycle.
-- Compatibility: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (Hostinger Shared Hosting)
-- Non-destructive: Preserves all existing records, roles, hashes, and configurations.
-- ==============================================================================

SET NAMES utf8mb4;
SET @dbname = DATABASE();

-- ------------------------------------------------------------------------------
-- 1. Upgrade `users.role` ENUM to include 'clinician'
-- ------------------------------------------------------------------------------
ALTER TABLE `users` 
  MODIFY COLUMN `role` ENUM('super_admin', 'admin', 'clinician', 'receptionist', 'editor') NOT NULL DEFAULT 'receptionist';

-- ------------------------------------------------------------------------------
-- 2. Seed Default Treating Clinician Account (if not exists)
-- ------------------------------------------------------------------------------
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `phone`)
VALUES (
  'Dr. Farhan Mustafa (Clinician)',
  'clinician@healthpro.com.pk',
  '$2y$10$aPIcde6ey4No03ewhrHumOzcxzl8vxWUd4weSlvSBFuWxw5zOFgNe', -- Admin@HealthPro2026!
  'clinician',
  'active',
  '+923280145670'
)
ON DUPLICATE KEY UPDATE 
  `role` = 'clinician',
  `status` = 'active',
  `password_hash` = VALUES(`password_hash`);

INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `phone`)
VALUES (
  'Content & AI Editor',
  'editor@healthpro.com.pk',
  '$2y$10$aPIcde6ey4No03ewhrHumOzcxzl8vxWUd4weSlvSBFuWxw5zOFgNe', -- Admin@HealthPro2026!
  'editor',
  'active',
  '+923280145670'
)
ON DUPLICATE KEY UPDATE 
  `role` = 'editor',
  `status` = 'active',
  `password_hash` = VALUES(`password_hash`);

-- ------------------------------------------------------------------------------
-- 3. Enhance `patient_intakes` table for encrypted clinical data at rest
-- ------------------------------------------------------------------------------
-- Change symptom_duration from VARCHAR to TEXT to accommodate encrypted ciphertext envelope
ALTER TABLE `patient_intakes` 
  MODIFY COLUMN `symptom_duration` TEXT NULL;

-- Add `is_encrypted` flag to track AES-256-GCM encryption status
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'patient_intakes' AND COLUMN_NAME = 'is_encrypted') > 0,
  'SELECT 1 AS `is_encrypted_already_exists`',
  'ALTER TABLE `patient_intakes` ADD COLUMN `is_encrypted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `general_notes`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Add `reviewed_at` and `reviewed_by` columns for clinician review tracking
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'patient_intakes' AND COLUMN_NAME = 'reviewed_at') > 0,
  'SELECT 1 AS `reviewed_at_already_exists`',
  'ALTER TABLE `patient_intakes` ADD COLUMN `reviewed_at` DATETIME NULL AFTER `is_encrypted`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'patient_intakes' AND COLUMN_NAME = 'reviewed_by') > 0,
  'SELECT 1 AS `reviewed_by_already_exists`',
  'ALTER TABLE `patient_intakes` ADD COLUMN `reviewed_by` VARCHAR(100) NULL AFTER `reviewed_at`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Ensure all clinical text columns have sufficient width for ciphertext envelopes
ALTER TABLE `patient_intakes`
  MODIFY COLUMN `visit_reason` TEXT NULL,
  MODIFY COLUMN `existing_conditions` TEXT NULL,
  MODIFY COLUMN `current_medicines` TEXT NULL,
  MODIFY COLUMN `known_allergies` TEXT NULL,
  MODIFY COLUMN `general_notes` TEXT NULL;

-- ------------------------------------------------------------------------------
-- 4. Ensure appointments status ENUM covers all 7 canonical states
-- ------------------------------------------------------------------------------
ALTER TABLE `appointments`
  MODIFY COLUMN `status` ENUM('new', 'confirmed', 'rescheduled', 'checked_in', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'new';

-- ------------------------------------------------------------------------------
-- 5. Add index on `patient_intakes.is_encrypted` for fast migration queries
-- ------------------------------------------------------------------------------
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'patient_intakes' AND INDEX_NAME = 'idx_intakes_is_encrypted') > 0,
  'SELECT 1 AS `idx_intakes_is_encrypted_exists`',
  'ALTER TABLE `patient_intakes` ADD INDEX `idx_intakes_is_encrypted` (`is_encrypted`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

SELECT 'Migration 004 completed successfully: Clinician role, encryption fields, and 7-state lifecycle active.' AS `migration_result`;
