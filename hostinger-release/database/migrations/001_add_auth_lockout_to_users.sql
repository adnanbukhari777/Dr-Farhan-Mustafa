-- ==============================================================================
-- Dr. Farhan Mustafa Clinic Portal - Database Migration 001
-- Migration: 001_add_auth_lockout_to_users.sql
-- Description: Add authentication lockout and security audit columns to `users` table.
-- Compatibility: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (Hostinger Shared Hosting)
-- Non-destructive: Detects existing columns before adding, preserves all data/roles.
-- ==============================================================================

SET NAMES utf8mb4;
SET @dbname = DATABASE();
SET @tablename = 'users';

-- 1. Add `failed_attempts` column (unsigned int, default 0) if not exists
SET @stmt = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'failed_attempts'
  ) > 0,
  'SELECT 1 AS `failed_attempts_already_exists`',
  'ALTER TABLE `users` ADD COLUMN `failed_attempts` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `status`'
));
PREPARE exec_sql FROM @stmt;
EXECUTE exec_sql;
DEALLOCATE PREPARE exec_sql;

-- 2. Add `lockout_until` column (datetime, nullable) if not exists
SET @stmt = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'lockout_until'
  ) > 0,
  'SELECT 1 AS `lockout_until_already_exists`',
  'ALTER TABLE `users` ADD COLUMN `lockout_until` DATETIME NULL AFTER `failed_attempts`'
));
PREPARE exec_sql FROM @stmt;
EXECUTE exec_sql;
DEALLOCATE PREPARE exec_sql;

-- 3. Add `last_login_at` column (datetime, nullable) if not exists
SET @stmt = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'last_login_at'
  ) > 0,
  'SELECT 1 AS `last_login_at_already_exists`',
  'ALTER TABLE `users` ADD COLUMN `last_login_at` DATETIME NULL AFTER `lockout_until`'
));
PREPARE exec_sql FROM @stmt;
EXECUTE exec_sql;
DEALLOCATE PREPARE exec_sql;

-- 4. Copy existing `last_login` values into `last_login_at` if available
SET @stmt = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = 'last_login'
  ) > 0,
  'UPDATE `users` SET `last_login_at` = `last_login` WHERE `last_login_at` IS NULL AND `last_login` IS NOT NULL',
  'SELECT 1 AS `no_legacy_last_login_column`'
));
PREPARE exec_sql FROM @stmt;
EXECUTE exec_sql;
DEALLOCATE PREPARE exec_sql;
