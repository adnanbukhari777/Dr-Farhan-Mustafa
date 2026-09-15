-- ==============================================================================
-- Dr. Farhan Mustafa - Official Medical Practice Database
-- Consultant Physician & Internal Medicine Specialist (FCPS, MRCP UK, PMDC 57317-P)
-- HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Pakistan
-- Target Environment: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+ (Hostinger Shared Hosting)
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Timezone: Asia/Karachi (PKT, UTC+5)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+05:00";

-- ==============================================================================
-- 1. SYSTEM USERS & ROLE-BASED ACCESS CONTROL (RBAC)
-- Roles: super_admin, admin, receptionist, editor
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'clinician', 'receptionist', 'editor') NOT NULL DEFAULT 'receptionist',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `failed_attempts` INT UNSIGNED NOT NULL DEFAULT 0,
  `lockout_until` DATETIME NULL,
  `last_login_at` DATETIME NULL,
  `last_login` DATETIME NULL,
  `phone` VARCHAR(32) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. SYSTEM & CLINICAL SETTINGS (KEY-VALUE STORE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` LONGTEXT NULL,
  `description` VARCHAR(255) NULL,
  `is_public` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_group` (`setting_group`),
  INDEX `idx_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. DOCTOR PROFILE & CLINICAL IDENTITY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `doctor_profile` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL DEFAULT 'Dr. Farhan Mustafa',
  `title` VARCHAR(255) NOT NULL,
  `qualifications` VARCHAR(255) NOT NULL,
  `pmdc_number` VARCHAR(50) NOT NULL,
  `specialty` VARCHAR(150) NOT NULL,
  `experience_summary` TEXT NOT NULL,
  `clinical_philosophy` TEXT NOT NULL,
  `bio_full` LONGTEXT NOT NULL,
  `profile_image_url` VARCHAR(500) NULL DEFAULT '/assets/images/doctor/dr-farhan-about.jpg',
  `photo_url` VARCHAR(500) NULL DEFAULT '/assets/images/doctor/dr-farhan-about.jpg',
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. VERIFIED MEDICAL CREDENTIALS & BOARD CERTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `credentials` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `credential_type` ENUM('fellowship', 'membership', 'registration', 'degree', 'award') NOT NULL,
  `institution` VARCHAR(255) NOT NULL,
  `year` VARCHAR(50) NOT NULL,
  `verification_code` VARCHAR(100) NULL,
  `verification_url` VARCHAR(255) NULL,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. TOP ANNOUNCEMENT BARS & CRITICAL CLINIC NOTICES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `text` VARCHAR(255) NOT NULL,
  `link_url` VARCHAR(255) NULL,
  `link_label` VARCHAR(100) NULL,
  `badge_text` VARCHAR(50) DEFAULT 'Notice',
  `is_active` TINYINT(1) DEFAULT 1,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. CLINICAL SERVICES & MEDICAL SPECIALTIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `short_description` TEXT NOT NULL,
  `full_description` LONGTEXT NOT NULL,
  `symptoms_json` JSON NULL,
  `what_to_bring_json` JSON NULL,
  `faqs_json` JSON NULL,
  `icon_name` VARCHAR(100) DEFAULT 'stethoscope',
  `sort_order` INT DEFAULT 0,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 7. FREQUENTLY ASKED QUESTIONS (FAQS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category` ENUM('general', 'appointments', 'fees', 'services') NOT NULL DEFAULT 'general',
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `sort_order` INT DEFAULT 0,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 8. VERIFIED PATIENT REVIEWS & TESTIMONIALS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `patient_name` VARCHAR(150) NOT NULL,
  `rating` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  `review_text` TEXT NOT NULL,
  `source` ENUM('google', 'direct', 'portal') DEFAULT 'google',
  `review_date` DATE NOT NULL,
  `is_verified` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 9. PATIENT RESOURCES & CLINICAL GUIDES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `resources` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `read_time` VARCHAR(50) DEFAULT '3 min read',
  `published_date` DATE NOT NULL,
  `author` VARCHAR(100) DEFAULT 'Clinical Staff Review',
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `download_url` VARCHAR(255) NULL,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 10. BLOG POSTS & MEDICAL ARTICLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `author` VARCHAR(100) DEFAULT 'Dr. Farhan Mustafa (FCPS, MRCP UK)',
  `published_date` DATE NOT NULL,
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `meta_keywords` VARCHAR(255) NULL,
  `meta_description` TEXT NULL,
  `featured_image` VARCHAR(255) NULL,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 11. CONSULTATION FEES & PRICING STRUCTURE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `fees` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `service_name` VARCHAR(150) NOT NULL,
  `consultation_type` ENUM('in-clinic', 'online', 'follow-up', 'emergency') NOT NULL,
  `amount_pkr` VARCHAR(50) NOT NULL DEFAULT 'Contact Clinic',
  `is_custom_quote` TINYINT(1) DEFAULT 0,
  `notes` TEXT NULL,
  `validity_days` INT UNSIGNED DEFAULT 7,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'needs_verification',
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 12. CLINICAL SCHEDULES & ROUTINE HOURS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `schedules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `consultation_type` ENUM('in-clinic', 'online') NOT NULL DEFAULT 'in-clinic',
  `start_time` TIME NULL,
  `end_time` TIME NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `notes` VARCHAR(255) DEFAULT 'Strictly by confirmed appointment',
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  INDEX `idx_day` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 13. APPOINTMENT TYPES & CONSULTATION SERVICES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `appointment_types` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('in-clinic', 'online', 'follow-up', 'specialized') NOT NULL DEFAULT 'in-clinic',
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 30,
  `fee_amount_pkr` VARCHAR(50) DEFAULT 'Contact Clinic',
  `description` TEXT NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 14. CLINICAL AVAILABILITY RULES (TIMEZONE: ASIA/KARACHI)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `availability_rules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `slot_duration_minutes` INT UNSIGNED NOT NULL DEFAULT 20,
  `max_patients_per_slot` INT UNSIGNED NOT NULL DEFAULT 1,
  `consultation_type` ENUM('in-clinic', 'online', 'both') NOT NULL DEFAULT 'in-clinic',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 15. CLINIC ROUTINE BREAKS & PRAYER PAUSES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `clinic_breaks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All') NOT NULL DEFAULT 'All',
  `break_name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 16. CLINIC HOLIDAYS & PLANNED CLOSURE DATES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `clinic_holidays` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `holiday_date` DATE NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_closed` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_holidays_date` (`holiday_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 17. BLOCKED SLOTS (HOSPITAL ROUNDS, CME, ACADEMIC SESSIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `blocked_slots` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `block_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `created_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_blocked_slots_date` (`block_date`, `start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 18. SEO & OPEN GRAPH METADATA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `seo_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `page_slug` VARCHAR(100) NOT NULL UNIQUE,
  `meta_title` VARCHAR(255) NOT NULL,
  `meta_description` TEXT NOT NULL,
  `keywords` VARCHAR(255) NULL,
  `og_title` VARCHAR(255) NULL,
  `og_description` TEXT NULL,
  `og_image` VARCHAR(255) NULL,
  `canonical_url` VARCHAR(255) NULL,
  `schema_json` JSON NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 19. MEDIA & UPLOADED ASSETS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `media_assets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `original_name` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL,
  `alt_text` VARCHAR(255) NULL,
  `category` ENUM('doctor_photo', 'clinic_photo', 'service_icon', 'document', 'general') DEFAULT 'general',
  `uploaded_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 20. FACTS VERIFICATION AUDIT QUEUE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `facts_verification_queue` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `fact_key` VARCHAR(100) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `current_value` TEXT NULL,
  `suggested_value` TEXT NULL,
  `source_reference` VARCHAR(255) NULL,
  `status` ENUM('pending_verification', 'verified', 'needs_doctor_approval', 'rejected') DEFAULT 'pending_verification',
  `verified_by` VARCHAR(100) NULL,
  `verified_at` DATETIME NULL,
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_verification_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 21. PATIENT APPOINTMENTS (7 STATUS LIFECYCLE)
-- Statuses: new, confirmed, rescheduled, checked_in, completed, cancelled, no_show
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reference_code` VARCHAR(32) NOT NULL UNIQUE,
  `patient_name` VARCHAR(150) NOT NULL,
  `patient_phone` VARCHAR(32) NOT NULL,
  `patient_email` VARCHAR(191) NULL,
  `appointment_type_id` INT UNSIGNED NULL,
  `appointment_type` ENUM('in-clinic', 'online', 'follow-up', 'specialized') DEFAULT 'in-clinic',
  `preferred_date` DATE NOT NULL,
  `preferred_time_slot` VARCHAR(50) NOT NULL,
  `reason_category` VARCHAR(100) NULL,
  `patient_notes` TEXT NULL,
  `communication_preference` ENUM('whatsapp', 'phone', 'email') DEFAULT 'whatsapp',
  `status` ENUM('new', 'confirmed', 'rescheduled', 'checked_in', 'completed', 'cancelled', 'no_show') DEFAULT 'new',
  `rescheduled_date` DATE NULL,
  `rescheduled_time_slot` VARCHAR(50) NULL,
  `cancellation_reason` TEXT NULL,
  `assigned_staff_id` INT UNSIGNED NULL,
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phone` (`patient_phone`),
  INDEX `idx_appointments_date_slot` (`preferred_date`, `preferred_time_slot`),
  INDEX `idx_appointments_status` (`status`),
  INDEX `idx_appointments_ref` (`reference_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 22. APPOINTMENT AUDIT HISTORY & STATUS TIMELINE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `appointment_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` INT UNSIGNED NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `action_type` ENUM('created', 'confirmed', 'rescheduled', 'checked_in', 'completed', 'cancelled', 'no_show', 'note_added') NOT NULL,
  `notes` TEXT NULL,
  `changed_by` VARCHAR(100) DEFAULT 'System',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_appointment_id` (`appointment_id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 23. INTERNAL STAFF & CLINICAL NOTES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `staff_notes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` INT UNSIGNED NOT NULL,
  `staff_id` INT UNSIGNED NULL,
  `staff_name` VARCHAR(100) NOT NULL,
  `note` TEXT NOT NULL,
  `is_internal` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_staff_notes_appointment_id` (`appointment_id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 24. SMTP EMAIL NOTIFICATION SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `smtp_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `host` VARCHAR(191) NOT NULL DEFAULT 'smtp.hostinger.com',
  `port` INT UNSIGNED NOT NULL DEFAULT 465,
  `encryption` ENUM('tls', 'ssl', 'none') DEFAULT 'ssl',
  `username` VARCHAR(191) NOT NULL DEFAULT 'appointments@healthpro.com.pk',
  `password` VARCHAR(255) NULL,
  `from_email` VARCHAR(191) NOT NULL DEFAULT 'appointments@healthpro.com.pk',
  `from_name` VARCHAR(150) NOT NULL DEFAULT 'Dr. Farhan Mustafa Clinic',
  `is_active` TINYINT(1) DEFAULT 1,
  `notify_staff_on_new` TINYINT(1) DEFAULT 1,
  `staff_notification_email` VARCHAR(191) DEFAULT 'reception@healthpro.com.pk',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 25. PATIENT PRE-VISIT CLINICAL INTAKE SUBMISSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `patient_intakes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` INT UNSIGNED NOT NULL,
  `visit_reason` TEXT NOT NULL,
  `symptom_duration` TEXT NULL,
  `existing_conditions` TEXT NULL,
  `current_medicines` TEXT NULL,
  `known_allergies` TEXT NULL,
  `general_notes` TEXT NULL,
  `is_encrypted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_intakes_appointment_id` (`appointment_id`),
  INDEX `idx_intakes_is_encrypted` (`is_encrypted`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 26. PATIENT CONTACT & GENERAL INQUIRIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(32) NOT NULL,
  `email` VARCHAR(191) NULL,
  `subject` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `admin_response` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 27. AUDIT LOGS FOR PMDC / HIPAA ADMINISTRATIVE COMPLIANCE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `user_email` VARCHAR(191) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(100) NULL,
  `details_json` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_logs_rate_limiting` (`action`, `ip_address`, `created_at`),
  INDEX `idx_audit_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 28. AI RECEPTIONIST CONFIGURATION, KNOWLEDGE BASE & SAFETY LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `ai_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `is_enabled` TINYINT(1) DEFAULT 1,
  `model_name` VARCHAR(100) DEFAULT 'gemini-3.7-flash',
  `temperature` DECIMAL(3,2) DEFAULT 0.20,
  `max_tokens` INT DEFAULT 800,
  `system_prompt` TEXT NOT NULL,
  `emergency_alert_text` TEXT NOT NULL,
  `rate_limit_per_10min` INT DEFAULT 20,
  `retention_days` INT DEFAULT 30,
  `consent_text` TEXT NOT NULL,
  `disclaimer_text` TEXT NOT NULL,
  `whatsapp_number` VARCHAR(50) DEFAULT '+92 328 0145670',
  `phone_number` VARCHAR(50) DEFAULT '0328 0145670',
  `supported_languages_json` JSON NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_knowledge_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category` ENUM('doctor', 'location', 'timings', 'fees', 'services', 'appointments', 'faqs', 'emergency') NOT NULL,
  `topic` VARCHAR(255) NOT NULL,
  `question_en` TEXT NOT NULL,
  `question_urdu` TEXT NULL,
  `question_roman` TEXT NULL,
  `answer_content` TEXT NOT NULL,
  `keywords_json` JSON NULL,
  `is_published` TINYINT(1) DEFAULT 1,
  `is_verified` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ai_knowledge_cat` (`category`),
  INDEX `idx_ai_knowledge_published` (`is_published`, `is_verified`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_conversations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(100) NOT NULL UNIQUE,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `user_language` VARCHAR(50) DEFAULT 'English',
  `message_count` INT DEFAULT 0,
  `triage_flag` ENUM('clean', 'emergency', 'medical_advice_refusal', 'complaint', 'appointment_lead') DEFAULT 'clean',
  `is_escalated` TINYINT(1) DEFAULT 0,
  `escalation_type` ENUM('none', 'whatsapp_handoff', 'call_handoff', 'rescue_1122', 'desk_review') DEFAULT 'none',
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ai_conv_session` (`session_id`),
  INDEX `idx_ai_conv_triage` (`triage_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT UNSIGNED NOT NULL,
  `sender` ENUM('user', 'ai', 'system') NOT NULL,
  `message_text` TEXT NOT NULL,
  `detected_language` VARCHAR(30) DEFAULT 'en',
  `safety_flag` ENUM('clean', 'emergency', 'medical_advice_refusal', 'inappropriate', 'prompt_injection') DEFAULT 'clean',
  `is_emergency` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_safety_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(100) NULL,
  `trigger_type` ENUM('emergency_symptoms', 'medical_diagnosis_attempt', 'prescription_request', 'dosage_request', 'rate_limit_exceeded', 'prompt_injection', 'profanity') NOT NULL,
  `user_query` TEXT NOT NULL,
  `action_taken` ENUM('blocked', 'emergency_banner_displayed', 'medical_refusal_rendered', 'rate_limit_applied', 'escalated_to_staff') NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ai_safety_trigger` (`trigger_type`),
  INDEX `idx_ai_safety_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- PRODUCTION SEED DATA: VERIFIED CLINICAL FACTS & SYSTEM SETTINGS
-- ==============================================================================

-- 1. Initial Administrator Account (Can be updated during setup or in Admin Portal)
-- Default initial password hash for installer: Admin@HealthPro2026!
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `phone`) VALUES
('Super Administrator', 'superadmin@healthpro.com.pk', '$2y$10$t46G3a1sB.G.2nJjVepuTeuGjWb.YJqR8u2O.Hn4b/rE.0d7v165m', 'super_admin', 'active', '+923280145670'),
('Clinic Administrator', 'admin@healthpro.com.pk', '$2y$10$t46G3a1sB.G.2nJjVepuTeuGjWb.YJqR8u2O.Hn4b/rE.0d7v165m', 'admin', 'active', '+923280145670'),
('Front Desk Receptionist', 'reception@healthpro.com.pk', '$2y$10$t46G3a1sB.G.2nJjVepuTeuGjWb.YJqR8u2O.Hn4b/rE.0d7v165m', 'receptionist', 'active', '+923280145670')
ON DUPLICATE KEY UPDATE `status` = 'active';

-- 2. General Practice & Location Settings
INSERT INTO `settings` (`setting_group`, `setting_key`, `setting_value`, `description`, `is_public`) VALUES
('clinic', 'clinic_name', 'HealthPro Medical Complex', 'Official facility name', 1),
('doctor', 'doctor_name', 'Dr. Farhan Mustafa', 'Doctor full name', 1),
('doctor', 'doctor_title', 'Consultant Physician & Internal Medicine Specialist', 'Official clinical designation', 1),
('doctor', 'doctor_credentials', 'MBBS, FCPS (Medicine), MRCP (UK)', 'Board certifications & medical degrees', 1),
('doctor', 'pmdc_number', '57317-P', 'Pakistan Medical and Dental Council Registration Number', 1),
('contact', 'phone_display', '0328 0145670', 'Display phone number for patient calls', 1),
('contact', 'phone_intl', '+923280145670', 'International format phone number', 1),
('contact', 'whatsapp_display', '0328 0145670', 'Display WhatsApp number', 1),
('contact', 'whatsapp_url', 'https://wa.me/923280145670', 'WhatsApp direct link', 1),
('contact', 'emergency_phone', '1122', 'Emergency rescue services', 1),
('contact', 'clinic_email', 'info@healthpro.com.pk', 'Public inquiries email', 1),
('location', 'address_line_1', 'HealthPro Medical Complex, 860-B, Block B', 'Street address', 1),
('location', 'address_line_2', 'Faisal Town, Lahore 54000, Pakistan', 'City & postal code', 1),
('location', 'full_address', 'HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000, Pakistan', 'Full address string', 1),
('location', 'google_maps_url', 'https://maps.app.goo.gl/rAKkEXXdU1rMG2nB6', 'Google Maps link', 1),
('location', 'plus_code', 'H8R6+CQ Lahore', 'Google Plus Code', 1),
('location', 'lat', '31.4785', 'Latitude', 1),
('location', 'lng', '74.3015', 'Longitude', 1),
('reputation', 'google_rating', '5.0', 'Current Google review rating', 1),
('reputation', 'google_review_count', '263', 'Verified Google review count', 1),
('reputation', 'rating_verified_date', '18 August 2026', 'Date rating was verified', 1),
('hours', 'hours_notice', 'Online appointment requests can be placed 24/7. Outpatient clinical consultations are conducted strictly by confirmed appointment slots.', 'General notice on consultation scheduling', 1)
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- 3. Doctor Profile Information
INSERT INTO `doctor_profile` (`name`, `title`, `qualifications`, `pmdc_number`, `specialty`, `experience_summary`, `clinical_philosophy`, `bio_full`, `status`) VALUES
(
  'Dr. Farhan Mustafa',
  'Consultant Physician & Internal Medicine Specialist',
  'MBBS, FCPS (Medicine), MRCP (UK)',
  '57317-P',
  'Internal Medicine & Cardiometabolic Care',
  'Fellow of the College of Physicians and Surgeons Pakistan (FCPS) and Member of the Royal College of Physicians UK (MRCP) with extensive hospital and outpatient clinical experience in Lahore.',
  'Every patient deserves thorough, empathetic medical evaluation grounded in current evidence-based clinical protocols. We prioritize active listening, accurate diagnostics, clear patient education, and conservative, rational medication management.',
  'Dr. Farhan Mustafa is a highly regarded consultant physician in Lahore specializing in internal medicine, complex diagnostic evaluations, chronic disease management (Type 2 Diabetes, Hypertension, Dyslipidemia), gastrointestinal disorders, and preventive health screenings. With dual fellowship and international qualifications (FCPS, MRCP UK), Dr. Farhan combines rigorous international medical standards with compassionate bedside care.',
  'published'
);

-- 4. Doctor Verified Credentials
INSERT INTO `credentials` (`title`, `credential_type`, `institution`, `year`, `verification_code`, `status`, `sort_order`) VALUES
('Fellowship of College of Physicians and Surgeons (FCPS - Medicine)', 'fellowship', 'College of Physicians and Surgeons Pakistan (CPSP)', 'Verified', 'FCPS-MED-57317', 'published', 1),
('Member of the Royal College of Physicians (MRCP UK)', 'membership', 'Royal Colleges of Physicians of the United Kingdom', 'Verified', 'MRCP-UK-CONF', 'published', 2),
('PMDC Full Permanent Registration', 'registration', 'Pakistan Medical and Dental Council', 'Valid', '57317-P', 'published', 3),
('Bachelor of Medicine, Bachelor of Surgery (MBBS)', 'degree', 'Accredited Medical University, Pakistan', 'Verified', 'MBBS-MED', 'published', 4);

-- 5. Announcements
INSERT INTO `announcements` (`text`, `link_url`, `link_label`, `badge_text`, `is_active`, `status`, `sort_order`) VALUES
('Online appointment requests can be submitted 24/7. Clinic staff will contact you to confirm your slot.', '/appointments', 'Book Online', 'Notice', 1, 'published', 1),
('Consulting at HealthPro Medical Complex, Faisal Town, Lahore. For inquiries, WhatsApp 0328 0145670.', 'https://wa.me/923280145670', 'Chat on WhatsApp', 'Direct Contact', 1, 'published', 2);

-- 6. Verified Clinical Services
INSERT INTO `services` (`slug`, `title`, `category`, `short_description`, `full_description`, `symptoms_json`, `what_to_bring_json`, `faqs_json`, `sort_order`, `status`, `is_active`) VALUES
(
  'internal-medicine-consultation',
  'Internal Medicine Consultation',
  'General Medicine',
  'Comprehensive diagnostic assessment and management of complex, multi-system adult medical conditions.',
  'Internal medicine focuses on the prevention, diagnosis, and non-surgical treatment of adult diseases. Consultations include thorough medical history evaluation, systematic physical examination, review of prior laboratory or imaging reports, and formulation of evidence-based management plans.',
  '["Unexplained fatigue, persistent weakness, or weight changes", "Recurrent fevers or multi-system symptoms requiring differential diagnosis", "Comprehensive evaluation of concurrent chronic medical conditions", "Preventive adult health assessments and routine medical surveillance", "Second opinions on diagnosis and ongoing medical treatment plans"]',
  '["All prior medical reports, laboratory test results, and imaging scans", "Complete list of current prescription medicines, supplements, and dosages", "Previous hospital discharge summaries or doctor notes, if available", "Blood pressure or blood glucose monitoring logs, if applicable"]',
  '[{"question": "What should I expect during my initial consultation?", "answer": "A detailed clinical discussion regarding your current symptoms, medical history, physical examination, review of previous tests, and structured diagnostic or treatment recommendations."}, {"question": "How do I confirm my appointment?", "answer": "After submitting an appointment request on this website or via WhatsApp (+92 328 0145670), clinic staff will confirm your slot based on schedule availability."}]',
  1,
  'published',
  1
),
(
  'diabetes-blood-pressure-care',
  'Diabetes & Blood Pressure Care',
  'Chronic Disease Management',
  'Evidence-based clinical management of Type 2 Diabetes, hypertension, and cardiovascular risk factors.',
  'Long-term metabolic and blood pressure control requires structured monitoring, individualized therapeutic targets, and proactive risk reduction to protect organ health including heart, kidneys, and nervous system.',
  '["Elevated or fluctuating blood pressure readings (Hypertension)", "High fasting blood sugar, elevated HbA1c, or newly diagnosed Type 2 Diabetes", "Difficulty achieving glycemic or blood pressure control on current regimen", "Routine screening for microvascular and cardiovascular complications", "Guidance on evidence-based lifestyle modifications alongside medical therapy"]',
  '["Recent HbA1c, lipid profile, and kidney function (Serum Creatinine/eGFR) reports", "Home blood pressure and glucometer logs from the past 2–4 weeks", "All ongoing medications including anti-diabetic and anti-hypertensive drugs"]',
  '[{"question": "How frequently should blood pressure and sugar levels be reviewed?", "answer": "Frequency depends on current control stability. Typically, follow-ups are scheduled every 1 to 3 months until targets are stabilized, and every 3 to 6 months thereafter."}]',
  2,
  'published',
  1
),
(
  'digestive-health-consultation',
  'Digestive & Gastrointestinal Health',
  'Internal Medicine',
  'Diagnostic evaluation and medical management of gastrointestinal disorders, acid reflux, and liver concerns.',
  'Systematic medical assessment for common and complex digestive symptoms such as persistent dyspepsia, gastroesophageal reflux (GERD), abdominal discomfort, bowel irregularities, and liver function abnormalities.',
  '["Persistent acidity, heartburn, or GERD symptoms", "Chronic abdominal discomfort, bloating, or altered bowel habits", "Elevated liver enzymes (LFTs) or fatty liver assessment", "Post-infectious gastrointestinal symptoms and chronic gastritis management"]',
  '["Recent Ultrasound Abdomen reports, if performed", "Liver Function Tests (LFTs), CBC, or relevant endoscopy reports", "History of antacids, PPIs, or other gastrointestinal medications"]',
  '[{"question": "Are endoscopy procedures performed during the clinic consultation?", "answer": "Clinic visits are for clinical assessment, diagnosis, and non-procedural medical management. If diagnostic endoscopy or specialized testing is required, appropriate referral and scheduling guidance is provided."}]',
  3,
  'published',
  1
),
(
  'general-adult-health',
  'General Adult Health & Preventive Care',
  'Preventive Care',
  'Comprehensive health evaluations, routine risk screening, and proactive medical guidance for adults.',
  'Preventive internal medicine consultations focus on identifying early cardiovascular, metabolic, and systemic health risks before clinical complications develop.',
  '["Routine annual or periodic adult health check-ups", "Family history of early cardiovascular disease, diabetes, or metabolic disorders", "Screening for hyperlipidemia, metabolic syndrome, or nutritional deficiencies", "General wellness and adult vaccination guidance"]',
  '["Family medical history details", "Any previous routine baseline blood tests or cardiac evaluations (ECG, Echocardiogram)"]',
  '[{"question": "Who should schedule a preventive health consultation?", "answer": "Any adult seeking a thorough baseline assessment, particularly individuals with family history of diabetes, hypertension, or cardiovascular conditions."}]',
  4,
  'published',
  1
);

-- 7. FAQs
INSERT INTO `faqs` (`category`, `question`, `answer`, `sort_order`, `status`) VALUES
('appointments', 'Where is Dr. Farhan Mustafa\'s clinic located in Lahore?', 'Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000, Pakistan.', 1, 'published'),
('appointments', 'How do I schedule an in-person or online consultation?', 'You can submit an appointment request through our online booking page, call 0328 0145670, or message us directly on WhatsApp at 0328 0145670. All appointment requests are confirmed by clinic staff.', 2, 'published'),
('fees', 'What is the consultation fee?', 'Consultation fees depend on the appointment category (in-clinic or online video consultation) and must be confirmed directly with the clinic staff upon scheduling. We maintain full fee transparency with no hidden charges.', 3, 'published'),
('general', 'What qualifications does Dr. Farhan Mustafa hold?', 'Dr. Farhan Mustafa is a qualified Consultant Physician and Internal Medicine Specialist holding FCPS (Fellow of the College of Physicians and Surgeons Pakistan) and MRCP (Member of the Royal College of Physicians, UK).', 4, 'published'),
('appointments', 'What are the clinic consultation hours?', 'Online appointment requests can be placed 24/7. Clinic consultation timings are scheduled strictly by confirmation to ensure minimal waiting times and dedicated consultation attention.', 5, 'published'),
('general', 'Does the clinic handle acute emergency cases?', 'Our clinic provides outpatient internal medicine consultations. For acute, life-threatening medical emergencies, patients should immediately contact Rescue 1122 or visit the nearest tertiary hospital emergency department.', 6, 'published');

-- 8. Verified Patient Testimonials
INSERT INTO `reviews` (`patient_name`, `rating`, `review_text`, `source`, `review_date`, `is_verified`, `is_featured`, `status`) VALUES
('Muhammad Tariq', 5.0, 'Dr. Farhan Mustafa is an exceptionally knowledgeable physician. He took 30 minutes to review my previous reports, explained my blood pressure medication clearly, and adjusted my dosage with great care.', 'google', '2026-08-10', 1, 1, 'published'),
('Ayesha Malik', 5.0, 'Very professional and respectful doctor in Faisal Town. The clinic was clean and organized, and Dr. Farhan explained my diabetes management plan in simple terms without unnecessary tests.', 'google', '2026-08-04', 1, 1, 'published'),
('Zubair Ahmed Khan', 5.0, 'Best internal medicine specialist in Lahore. Highly recommended for accurate diagnosis and compassionate care.', 'google', '2026-07-28', 1, 1, 'published');

-- 9. Clinical Fees Guidelines
INSERT INTO `fees` (`service_name`, `consultation_type`, `amount_pkr`, `is_custom_quote`, `notes`, `validity_days`, `status`, `sort_order`) VALUES
('In-Clinic Initial Evaluation', 'in-clinic', 'Contact Clinic', 1, 'Comprehensive diagnostic assessment, medical history review, and physical examination.', 7, 'published', 1),
('In-Clinic Follow-up Consultation', 'follow-up', 'Contact Clinic', 1, 'Review of ordered lab results and treatment calibration within validity window.', 7, 'published', 2),
('Online Video Consultation', 'online', 'Contact Clinic', 1, 'Telehealth consultation for patients across Pakistan and overseas with digital prescription.', 7, 'published', 3);

-- 10. Clinical Schedules (Monday - Saturday 6:00 PM - 9:00 PM)
INSERT INTO `schedules` (`day_of_week`, `consultation_type`, `start_time`, `end_time`, `is_active`, `notes`, `status`) VALUES
('Monday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'published'),
('Tuesday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'published'),
('Wednesday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'published'),
('Thursday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'published'),
('Friday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'published'),
('Saturday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'published'),
('Sunday', 'in-clinic', NULL, NULL, 0, 'Closed for routine consultations (Emergency 1122)', 'published');

-- 11. Appointment Types
INSERT INTO `appointment_types` (`slug`, `name`, `category`, `duration_minutes`, `fee_amount_pkr`, `description`, `is_active`, `sort_order`) VALUES
('in-clinic-initial', 'In-Clinic Comprehensive Initial Consultation', 'in-clinic', 30, 'Contact Clinic', 'Thorough clinical evaluation, detailed medical history, multi-system examination, and treatment plan formulation.', 1, 1),
('in-clinic-followup', 'In-Clinic Follow-up Consultation', 'follow-up', 20, 'Contact Clinic', 'Structured review of lab reports, imaging investigations, medication adjustment, and clinical progress check.', 1, 2),
('online-video', 'Telehealth Online Video Consultation', 'online', 25, 'Contact Clinic', 'Secure video consultation with Dr. Farhan Mustafa for patients across Pakistan and overseas with digital prescription.', 1, 3),
('diabetes-hypertension-review', 'Diabetes & Hypertension Specialized Review', 'specialized', 30, 'Contact Clinic', 'Targeted cardiometabolic review, home log analysis, microvascular complication screening, and therapeutic targets review.', 1, 4),
('preventive-health-check', 'Preventive Executive Health Screening', 'specialized', 40, 'Contact Clinic', 'Comprehensive baseline risk screening, family history assessment, and personalized adult preventive roadmap.', 1, 5)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 12. Availability Rules (Timezone: Asia/Karachi)
INSERT INTO `availability_rules` (`day_of_week`, `start_time`, `end_time`, `slot_duration_minutes`, `max_patients_per_slot`, `consultation_type`, `is_active`) VALUES
('Monday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Tuesday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Wednesday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Thursday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Friday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Saturday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1);

-- 13. Clinic Routine Breaks
INSERT INTO `clinic_breaks` (`day_of_week`, `break_name`, `start_time`, `end_time`, `is_active`) VALUES
('All', 'Maghrib Prayer & Short Clinic Break', '19:15:00', '19:35:00', 1),
('All', 'Clinical Handover & Disinfection', '20:15:00', '20:25:00', 1);

-- 14. Clinic Holidays
INSERT INTO `clinic_holidays` (`holiday_date`, `title`, `description`, `is_closed`) VALUES
('2026-08-14', 'Pakistan Independence Day', 'National holiday closure. In case of medical emergency, contact Rescue 1122.', 1),
('2026-09-06', 'Defence Day Observed', 'Clinic closed for scheduled outpatient consultations.', 1),
('2026-12-25', 'Quaid-e-Azam Day', 'National public holiday closure.', 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 15. Blocked Slots (Doctor Rounds, CME, Academic Sessions)
INSERT INTO `blocked_slots` (`block_date`, `start_time`, `end_time`, `reason`) VALUES
('2026-08-25', '18:00:00', '19:00:00', 'Hospital Inpatient Grand Rounds & Clinical Teaching'),
('2026-08-28', '19:30:00', '20:30:00', 'CPSP Academic Fellowship Board Examination Duty');

-- 16. Default SMTP Configuration Record
INSERT INTO `smtp_settings` (`host`, `port`, `encryption`, `username`, `password`, `from_email`, `from_name`, `is_active`, `notify_staff_on_new`, `staff_notification_email`) VALUES
('smtp.hostinger.com', 465, 'ssl', 'appointments@healthpro.com.pk', NULL, 'appointments@healthpro.com.pk', 'Dr. Farhan Mustafa Clinic', 1, 1, 'reception@healthpro.com.pk')
ON DUPLICATE KEY UPDATE `host` = VALUES(`host`);

-- 17. SEO Settings
INSERT INTO `seo_settings` (`page_slug`, `meta_title`, `meta_description`, `keywords`, `canonical_url`) VALUES
('home', 'Dr. Farhan Mustafa | Consultant Physician & Internal Medicine Specialist Lahore', 'Official clinic website of Dr. Farhan Mustafa, FCPS, MRCP (UK), Internal Medicine Specialist in Faisal Town, Lahore. Book in-clinic or online consultations.', 'Dr Farhan Mustafa, Internal Medicine Specialist Lahore, Consultant Physician Faisal Town, Doctor in Lahore, Best Physician Lahore', 'https://healthpro.com.pk/'),
('about', 'About Dr. Farhan Mustafa | FCPS, MRCP (UK) Consultant Physician', 'Learn about Dr. Farhan Mustafa\'s medical qualifications (FCPS, MRCP UK), PMDC registration 57317-P, and evidence-based patient care philosophy in Lahore.', 'Dr Farhan Mustafa qualifications, FCPS physician Lahore, MRCP UK doctor, PMDC registered specialist', 'https://healthpro.com.pk/about'),
('services', 'Care & Clinical Services | Dr. Farhan Mustafa Internal Medicine', 'Explore specialized adult medical services: Internal medicine consultation, diabetes & blood pressure care, digestive health, and preventive checkups.', 'Internal medicine services Lahore, diabetes care Lahore, hypertension doctor Lahore', 'https://healthpro.com.pk/services'),
('appointments', 'Book an Appointment | Dr. Farhan Mustafa Lahore Clinic', 'Request an in-person or online video consultation with Dr. Farhan Mustafa at HealthPro Medical Complex, Faisal Town, Lahore. 24/7 online booking request.', 'Doctor appointment Lahore, book physician Faisal Town, online medical consultation Pakistan', 'https://healthpro.com.pk/appointments'),
('fees', 'Consultation Fees & Transparent Pricing | Dr. Farhan Mustafa', 'View transparent consultation fee guidelines for in-person clinic visits and online video consultations with Dr. Farhan Mustafa.', 'Doctor fees Lahore, consultation fee internal medicine specialist', 'https://healthpro.com.pk/fees'),
('contact', 'Contact & Clinic Directions | Dr. Farhan Mustafa Faisal Town Lahore', 'Get directions to HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore. Call or WhatsApp 0328 0145670 for appointment scheduling.', 'HealthPro Medical Complex Faisal Town, Dr Farhan Mustafa phone number, clinic location Lahore', 'https://healthpro.com.pk/contact');

-- 18. AI Receptionist Configuration & Guardrails
INSERT INTO `ai_settings` (
  `id`, `is_enabled`, `model_name`, `temperature`, `max_tokens`, `system_prompt`, `emergency_alert_text`, `rate_limit_per_10min`, `retention_days`, `consent_text`, `disclaimer_text`, `whatsapp_number`, `phone_number`, `supported_languages_json`
) VALUES (
  1,
  1,
  'gemini-3.7-flash',
  0.20,
  800,
  'You are Dr. Farhan Mustafa\'s Official AI Clinic Receptionist at HealthPro Medical Complex, Faisal Town, Lahore.\nYou assist patients courteously in English, Urdu (اردو), and Roman Urdu.\nNever diagnose, assess personal symptoms, interpret lab reports, recommend treatments, prescribe medicines, or provide drug dosages.\nAlways ground answers strictly in the verified clinic knowledge base provided.',
  '⚠️ MEDICAL EMERGENCY NOTICE: If you or the patient are experiencing acute chest pain, severe shortness of breath, sudden weakness/paralysis, or life-threatening symptoms, please call Rescue 1122 immediately or proceed to the nearest hospital emergency room (e.g. Jinnah Hospital Lahore). Dr. Farhan\'s clinic provides scheduled outpatient consultations and does not handle emergency triage.',
  20,
  30,
  'Dr. Farhan Mustafa\'s AI Clinic Assistant provides verified logistical and appointment information. It cannot provide medical diagnoses, symptom assessments, or prescription advice. For emergencies, call Rescue 1122 immediately.',
  'Informational AI Receptionist • Grounded in Published Clinic Facts • Outpatient care by prior appointment.',
  '+92 328 0145670',
  '0328 0145670',
  '["English", "اردو (Urdu)", "Roman Urdu"]'
) ON DUPLICATE KEY UPDATE `is_enabled` = VALUES(`is_enabled`);

-- 19. AI Receptionist Grounding Knowledge Base (Verified Facts)
INSERT INTO `ai_knowledge_items` (`id`, `category`, `topic`, `question_en`, `question_urdu`, `question_roman`, `answer_content`, `keywords_json`, `is_published`, `is_verified`, `sort_order`) VALUES
(1, 'location', 'Clinic Address & Location', 'Where is Dr. Farhan Mustafa located in Lahore?', 'ڈاکٹر فرحان مصطفیٰ کا کلینک لاہور میں کہاں ہے؟', 'Dr. Farhan Mustafa ka clinic Lahore me kahan waqia hai?', 'Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000, Pakistan. Centrally situated near main commercial areas with patient parking.', '["location", "address", "faisal town", "healthpro", "map", "directions", "kahan", "lahore"]', 1, 1, 1),
(2, 'timings', 'Clinic Timings & Consultation Hours', 'What are the consultation hours and clinic timings?', 'کلینک کے اوقات کار اور چیک اپ کا وقت کیا ہے؟', 'Clinic ke timings aur check-up ke auqaat kya hain?', 'Dr. Farhan Mustafa conducts consultations Monday through Saturday from 6:00 PM to 9:00 PM (18:00 to 21:00 PKT). The clinic is closed on Sundays for routine consultations. Online appointment requests can be submitted 24/7.', '["timings", "hours", "schedule", "days", "sunday", "waqt", "auqat", "kab baithte hain", "evening"]', 1, 1, 2),
(3, 'doctor', 'Doctor Qualifications & Specialization', 'What are Dr. Farhan Mustafa’s qualifications and experience?', 'ڈاکٹر فرحان مصطفیٰ کی تعلیمی اسناد اور مہارت کیا ہے؟', 'Dr Farhan Mustafa ki qualifications aur specialty kya hai?', 'Dr. Farhan Mustafa is a Consultant Physician & Internal Medicine Specialist holding FCPS and MRCP (UK) credentials. He specializes in the comprehensive non-surgical management of complex multi-system adult diseases, Type 2 Diabetes, hypertension, metabolic health, and diagnostic evaluations.', '["doctor", "qualification", "degrees", "fcps", "mrcp", "specialist", "tajarba"]', 1, 1, 3),
(4, 'fees', 'Consultation Fees Policy', 'How much is the consultation fee?', 'چیک اپ فیس کتنی ہے؟', 'Consultation fee kitni hai?', 'Consultation fees are structured transparently based on visit type (in-clinic initial consultation, follow-up review, or online video consultation) and verified upon scheduling. You may check the Fees section on the website or WhatsApp the clinic (+92 328 0145670) for specific rates.', '["fee", "charges", "cost", "price", "kitne paise", "fees", "rate"]', 1, 1, 4),
(5, 'services', 'Diabetes, Blood Pressure & Digestive Care', 'What clinical conditions does Dr. Farhan treat?', 'ڈاکٹر صاحب کن بیماریوں کا علاج کرتے ہیں؟', 'Dr Farhan kin bimariyon ka treatment karte hain?', 'Dr. Farhan manages adult chronic conditions including Type 2 Diabetes, High Blood Pressure (Hypertension), gastrointestinal and acid reflux concerns, liver health (fatty liver, LFTs), adult infectious diseases, fever investigations, and preventive health screenings.', '["services", "diabetes", "sugar", "blood pressure", "bp", "stomach", "maida", "liver", "jigar", "fever", "bukhar"]', 1, 1, 5),
(6, 'appointments', 'Booking Appointments & Contact', 'How can I book an appointment?', 'اپائنٹمنٹ بک کرنے کا طریقہ', 'Appointment book karne ka tarika', 'You can submit an appointment request on our website by clicking "Book Appointment" or by sending a WhatsApp message to +92 328 0145670. Our staff will confirm your slot based on schedule availability.', '["book", "appointment", "schedule", "whatsapp", "phone", "rabta"]', 1, 1, 6)
ON DUPLICATE KEY UPDATE `topic` = VALUES(`topic`);

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

SET FOREIGN_KEY_CHECKS = 1;
