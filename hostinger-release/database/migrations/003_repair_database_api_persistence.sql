-- ==============================================================================
-- Dr. Farhan Mustafa Clinic Portal - Database Migration 003
-- Migration: 003_repair_database_api_persistence.sql
-- Description: Repair database schema, ensure all required persistence tables,
--              columns, constraints and high-performance indexes exist.
-- Compatibility: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (Hostinger Shared Hosting)
-- Non-destructive: Detects existing tables, columns and indexes before adding.
--                  Preserves all records, user IDs, roles, password hashes, and Super Administrator access.
--                  Contains NO DROP, DELETE, or TRUNCATE statements.
-- ==============================================================================

SET NAMES utf8mb4;
SET @dbname = DATABASE();

-- ------------------------------------------------------------------------------
-- 1. Ensure `users` columns exist and are consistent
-- ------------------------------------------------------------------------------
SET @tablename = 'users';

-- failed_attempts
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'failed_attempts') > 0,
  'SELECT 1 AS `failed_attempts_exists`',
  'ALTER TABLE `users` ADD COLUMN `failed_attempts` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `status`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- lockout_until
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'lockout_until') > 0,
  'SELECT 1 AS `lockout_until_exists`',
  'ALTER TABLE `users` ADD COLUMN `lockout_until` DATETIME NULL AFTER `failed_attempts`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- last_login_at
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'last_login_at') > 0,
  'SELECT 1 AS `last_login_at_exists`',
  'ALTER TABLE `users` ADD COLUMN `last_login_at` DATETIME NULL AFTER `lockout_until`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- last_login (legacy alias compatibility)
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'last_login') > 0,
  'SELECT 1 AS `last_login_exists`',
  'ALTER TABLE `users` ADD COLUMN `last_login` DATETIME NULL AFTER `last_login_at`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- ------------------------------------------------------------------------------
-- 2. Ensure `doctor_profile` column parity
-- ------------------------------------------------------------------------------
SET @tablename = 'doctor_profile';

-- profile_image_url
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'profile_image_url') > 0,
  'SELECT 1 AS `profile_image_url_exists`',
  'ALTER TABLE `doctor_profile` ADD COLUMN `profile_image_url` VARCHAR(500) NULL AFTER `title`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- photo_url (sync with profile_image_url if present)
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'photo_url') > 0,
  'SELECT 1 AS `photo_url_exists`',
  'ALTER TABLE `doctor_profile` ADD COLUMN `photo_url` VARCHAR(500) NULL AFTER `profile_image_url`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- ------------------------------------------------------------------------------
-- 3. Ensure `credentials` column parity
-- ------------------------------------------------------------------------------
SET @tablename = 'credentials';

-- verification_url
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'verification_url') > 0,
  'SELECT 1 AS `verification_url_exists`',
  'ALTER TABLE `credentials` ADD COLUMN `verification_url` VARCHAR(500) NULL AFTER `verification_code`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- created_at
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'created_at') > 0,
  'SELECT 1 AS `credentials_created_at_exists`',
  'ALTER TABLE `credentials` ADD COLUMN `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- ------------------------------------------------------------------------------
-- 4. Ensure `services` column parity
-- ------------------------------------------------------------------------------
SET @tablename = 'services';

-- icon_name
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'icon_name') > 0,
  'SELECT 1 AS `services_icon_name_exists`',
  'ALTER TABLE `services` ADD COLUMN `icon_name` VARCHAR(100) NULL DEFAULT "Stethoscope" AFTER `slug`'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- ------------------------------------------------------------------------------
-- 5. Performance & Concurrency Indexes (Appointment Lifecycle, Rate-Limiting, Queue)
-- ------------------------------------------------------------------------------

-- Appointments: idx_appointments_date_slot
SET @tablename = 'appointments';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_appointments_date_slot') > 0,
  'SELECT 1 AS `idx_appointments_date_slot_exists`',
  'ALTER TABLE `appointments` ADD INDEX `idx_appointments_date_slot` (`preferred_date`, `preferred_time_slot`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Appointments: idx_appointments_status
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_appointments_status') > 0,
  'SELECT 1 AS `idx_appointments_status_exists`',
  'ALTER TABLE `appointments` ADD INDEX `idx_appointments_status` (`status`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Appointments: idx_appointments_ref
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_appointments_ref') > 0,
  'SELECT 1 AS `idx_appointments_ref_exists`',
  'ALTER TABLE `appointments` ADD INDEX `idx_appointments_ref` (`reference_code`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Appointment History: idx_history_appointment_id
SET @tablename = 'appointment_history';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_history_appointment_id') > 0,
  'SELECT 1 AS `idx_history_appointment_id_exists`',
  'ALTER TABLE `appointment_history` ADD INDEX `idx_history_appointment_id` (`appointment_id`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Patient Intakes: idx_intakes_appointment_id
SET @tablename = 'patient_intakes';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_intakes_appointment_id') > 0,
  'SELECT 1 AS `idx_intakes_appointment_id_exists`',
  'ALTER TABLE `patient_intakes` ADD INDEX `idx_intakes_appointment_id` (`appointment_id`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Staff Notes: idx_staff_notes_appointment_id
SET @tablename = 'staff_notes';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_staff_notes_appointment_id') > 0,
  'SELECT 1 AS `idx_staff_notes_appointment_id_exists`',
  'ALTER TABLE `staff_notes` ADD INDEX `idx_staff_notes_appointment_id` (`appointment_id`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Facts Verification Queue: idx_verification_status
SET @tablename = 'facts_verification_queue';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_verification_status') > 0,
  'SELECT 1 AS `idx_verification_status_exists`',
  'ALTER TABLE `facts_verification_queue` ADD INDEX `idx_verification_status` (`status`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- AI Knowledge Items: idx_ai_knowledge_published
SET @tablename = 'ai_knowledge_items';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_ai_knowledge_published') > 0,
  'SELECT 1 AS `idx_ai_knowledge_published_exists`',
  'ALTER TABLE `ai_knowledge_items` ADD INDEX `idx_ai_knowledge_published` (`is_published`, `is_verified`, `sort_order`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Blocked Slots: idx_blocked_slots_date
SET @tablename = 'blocked_slots';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_blocked_slots_date') > 0,
  'SELECT 1 AS `idx_blocked_slots_date_exists`',
  'ALTER TABLE `blocked_slots` ADD INDEX `idx_blocked_slots_date` (`block_date`, `start_time`, `end_time`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Clinic Holidays: idx_holidays_date
SET @tablename = 'clinic_holidays';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_holidays_date') > 0,
  'SELECT 1 AS `idx_holidays_date_exists`',
  'ALTER TABLE `clinic_holidays` ADD INDEX `idx_holidays_date` (`holiday_date`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Audit Logs: idx_audit_logs_rate_limiting
SET @tablename = 'audit_logs';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_audit_logs_rate_limiting') > 0,
  'SELECT 1 AS `idx_audit_logs_rate_limiting_exists`',
  'ALTER TABLE `audit_logs` ADD INDEX `idx_audit_logs_rate_limiting` (`action`, `ip_address`, `created_at`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- Audit Logs: idx_audit_logs_created_at
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND INDEX_NAME = 'idx_audit_logs_created_at') > 0,
  'SELECT 1 AS `idx_audit_logs_created_at_exists`',
  'ALTER TABLE `audit_logs` ADD INDEX `idx_audit_logs_created_at` (`created_at`)'
));
PREPARE exec_sql FROM @stmt; EXECUTE exec_sql; DEALLOCATE PREPARE exec_sql;

-- ------------------------------------------------------------------------------
-- 6. Ensure optional CMS compatibility tables exist (CREATE IF NOT EXISTS)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `pages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `header_title` VARCHAR(255) NULL,
  `header_subtitle` VARCHAR(500) NULL,
  `content_html` MEDIUMTEXT NULL,
  `meta_title` VARCHAR(255) NULL,
  `meta_description` TEXT NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  `sort_order` INT NOT NULL DEFAULT 0,
  `updated_by` INT UNSIGNED NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pages_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `homepage_sections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(100) NOT NULL UNIQUE,
  `section_name` VARCHAR(191) NOT NULL,
  `heading` VARCHAR(255) NULL,
  `subheading` VARCHAR(500) NULL,
  `body_content` MEDIUMTEXT NULL,
  `cta_label` VARCHAR(100) NULL,
  `cta_link` VARCHAR(255) NULL,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `footer_sections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `column_title` VARCHAR(191) NOT NULL,
  `column_type` VARCHAR(50) NOT NULL DEFAULT 'custom',
  `content_json` JSON NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `navigation_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `label` VARCHAR(100) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `parent_id` INT UNSIGNED NULL,
  `menu_location` VARCHAR(50) NOT NULL DEFAULT 'primary',
  `open_in_new_tab` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
