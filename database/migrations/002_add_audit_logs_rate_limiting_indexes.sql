-- ==============================================================================
-- Dr. Farhan Mustafa Clinic Portal - Database Migration 002
-- Migration: 002_add_audit_logs_rate_limiting_indexes.sql
-- Description: Add composite and timestamp indexes on `audit_logs` for rolling-window rate-limiting queries.
-- Compatibility: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (Hostinger Shared Hosting)
-- Non-destructive: Detects existing indexes before creating, preserves all table data.
-- ==============================================================================

SET NAMES utf8mb4;
SET @dbname = DATABASE();
SET @tablename = 'audit_logs';

-- 1. Add composite index `idx_audit_logs_rate_limiting` (ip_address, created_at, action) if not exists
SET @stmt = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND INDEX_NAME = 'idx_audit_logs_rate_limiting'
  ) > 0,
  'SELECT 1 AS `idx_audit_logs_rate_limiting_already_exists`',
  'ALTER TABLE `audit_logs` ADD INDEX `idx_audit_logs_rate_limiting` (`ip_address`, `created_at`, `action`)'
));
PREPARE exec_sql FROM @stmt;
EXECUTE exec_sql;
DEALLOCATE PREPARE exec_sql;

-- 2. Add standalone index `idx_audit_logs_created_at` (created_at) if not exists
SET @stmt = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND INDEX_NAME = 'idx_audit_logs_created_at'
  ) > 0,
  'SELECT 1 AS `idx_audit_logs_created_at_already_exists`',
  'ALTER TABLE `audit_logs` ADD INDEX `idx_audit_logs_created_at` (`created_at`)'
));
PREPARE exec_sql FROM @stmt;
EXECUTE exec_sql;
DEALLOCATE PREPARE exec_sql;
