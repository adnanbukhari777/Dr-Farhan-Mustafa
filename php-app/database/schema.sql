-- Dr. Farhan Mustafa Clinic Portal - Complete Production Database Schema
-- MySQL 8.0+ / MariaDB 10.5+ UTF8MB4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. System Settings & Global Config
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
  `setting_key` VARCHAR(64) NOT NULL UNIQUE,
  `setting_value` LONGTEXT NULL,
  `description` VARCHAR(255) NULL,
  `is_public` TINYINT(1) DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users & Roles (Super Admin, Admin, Receptionist, Content Editor)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'receptionist', 'editor') NOT NULL DEFAULT 'receptionist',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `phone` VARCHAR(32) NULL,
  `last_login_at` DATETIME NULL,
  `failed_attempts` INT UNSIGNED DEFAULT 0,
  `lockout_until` DATETIME NULL,
  `password_reset_token` VARCHAR(100) NULL,
  `password_reset_expires` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Dynamic Pages & Sections
CREATE TABLE IF NOT EXISTS `pages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(191) NOT NULL,
  `header_title` VARCHAR(255) NULL,
  `header_subtitle` TEXT NULL,
  `content_html` LONGTEXT NULL,
  `status` ENUM('draft', 'published', 'needs_verification') NOT NULL DEFAULT 'published',
  `meta_title` VARCHAR(255) NULL,
  `meta_description` TEXT NULL,
  `sort_order` INT DEFAULT 0,
  `updated_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Homepage Sections Config
CREATE TABLE IF NOT EXISTS `homepage_sections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(64) NOT NULL UNIQUE,
  `section_name` VARCHAR(100) NOT NULL,
  `heading` VARCHAR(255) NOT NULL,
  `subheading` TEXT NULL,
  `body_content` LONGTEXT NULL,
  `cta_label` VARCHAR(100) NULL,
  `cta_link` VARCHAR(255) NULL,
  `is_visible` TINYINT(1) DEFAULT 1,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `sort_order` INT DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Navigation Menu Items
CREATE TABLE IF NOT EXISTS `navigation_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `label` VARCHAR(100) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `menu_location` ENUM('primary', 'footer', 'mobile', 'top_bar') DEFAULT 'primary',
  `parent_id` INT UNSIGNED NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `open_in_new_tab` TINYINT(1) DEFAULT 0,
  INDEX `idx_location` (`menu_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Footer Columns & Widgets
CREATE TABLE IF NOT EXISTS `footer_sections` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `column_title` VARCHAR(100) NOT NULL,
  `column_type` ENUM('links', 'text', 'contact', 'hours') DEFAULT 'links',
  `content_json` JSON NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Doctor Profile & Philosophy
CREATE TABLE IF NOT EXISTS `doctor_profile` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `qualifications` VARCHAR(255) NOT NULL,
  `pmdc_number` VARCHAR(50) NOT NULL,
  `specialty` VARCHAR(150) NOT NULL,
  `experience_summary` TEXT NOT NULL,
  `clinical_philosophy` TEXT NOT NULL,
  `bio_full` LONGTEXT NOT NULL,
  `photo_url` VARCHAR(255) NULL,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Doctor Credentials & Accreditations
CREATE TABLE IF NOT EXISTS `credentials` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `credential_type` ENUM('degree', 'fellowship', 'membership', 'registration', 'award') NOT NULL,
  `institution` VARCHAR(255) NOT NULL,
  `year` VARCHAR(50) NULL,
  `verification_code` VARCHAR(100) NULL,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Clinical Services
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(191) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `short_description` TEXT NOT NULL,
  `full_description` LONGTEXT NOT NULL,
  `symptoms_json` JSON NULL,
  `what_to_bring_json` JSON NULL,
  `faqs_json` JSON NULL,
  `sort_order` INT DEFAULT 0,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Announcements & Alert Bars
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `text` TEXT NOT NULL,
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

-- 11. Frequently Asked Questions (FAQs)
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category` ENUM('general', 'appointments', 'fees', 'services') NOT NULL DEFAULT 'general',
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `sort_order` INT DEFAULT 0,
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Reviews & Patient Testimonials
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

-- 13. Patient Resources & Guides
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

-- 14. Blog Posts & Medical Articles
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

-- 15. Consultation Fees & Pricing Structure
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

-- 16. Schedules & Clinical Hours
CREATE TABLE IF NOT EXISTS `schedules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `consultation_type` ENUM('in-clinic', 'online') NOT NULL DEFAULT 'in-clinic',
  `start_time` TIME NULL,
  `end_time` TIME NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `notes` VARCHAR(255) DEFAULT 'Strictly by confirmed appointment',
  `status` ENUM('draft', 'published', 'needs_verification') DEFAULT 'needs_verification',
  INDEX `idx_day` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16A. Appointment Types & Consultation Services
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

-- 16B. Clinical Availability Rules (Timezone: Asia/Karachi)
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

-- 16C. Clinic Breaks & Routine Pauses
CREATE TABLE IF NOT EXISTS `clinic_breaks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All') NOT NULL DEFAULT 'All',
  `break_name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16D. Clinic Holidays & Closure Dates
CREATE TABLE IF NOT EXISTS `clinic_holidays` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `holiday_date` DATE NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) NULL,
  `is_closed` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16E. Blocked Slots (Doctor Rounds, CME, Academic Sessions)
CREATE TABLE IF NOT EXISTS `blocked_slots` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `block_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `created_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_block_date` (`block_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. SEO & Open Graph Metadata
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

-- 18. Media & Uploaded Assets
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

-- 19. Pre-Launch Facts Verification Queue
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
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Patient Appointments
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
  INDEX `idx_date_slot` (`preferred_date`, `preferred_time_slot`),
  INDEX `idx_status` (`status`),
  INDEX `idx_ref` (`reference_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20A. Appointment Status History & Audit Trail (Timezone: Asia/Karachi)
CREATE TABLE IF NOT EXISTS `appointment_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` INT UNSIGNED NOT NULL,
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `action_type` ENUM('created', 'confirmed', 'rescheduled', 'checked_in', 'completed', 'cancelled', 'no_show', 'note_added') NOT NULL,
  `notes` TEXT NULL,
  `changed_by` VARCHAR(100) DEFAULT 'System',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_app_history` (`appointment_id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20B. Internal Staff Notes
CREATE TABLE IF NOT EXISTS `staff_notes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` INT UNSIGNED NOT NULL,
  `staff_id` INT UNSIGNED NULL,
  `staff_name` VARCHAR(100) NOT NULL,
  `note` TEXT NOT NULL,
  `is_internal` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_app_staff_notes` (`appointment_id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20C. Configurable SMTP Email Notification Settings
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

-- 21. Patient Intake Submissions
CREATE TABLE IF NOT EXISTS `patient_intakes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` INT UNSIGNED NOT NULL,
  `visit_reason` TEXT NOT NULL,
  `symptom_duration` VARCHAR(100) NULL,
  `existing_conditions` TEXT NULL,
  `current_medicines` TEXT NULL,
  `known_allergies` TEXT NULL,
  `general_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Contact & Inquiries Messages
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

-- 23. Audit Log for Compliance & HIPAA/PMDC Data Trail
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
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- PHASE 4: AI RECEPTIONIST, KNOWLEDGE BASE & SAFETY AUDITING
-- ==============================================================================

-- 24. AI Receptionist Configuration & Model Guardrails
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

-- 25. Verified Clinic Grounding Facts (Approved by Dr. Farhan Mustafa)
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
  INDEX `idx_ai_knowledge_pub` (`is_published`, `is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. AI Conversation Sessions
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

-- 27. AI Individual Messages
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

-- 28. AI Safety & Clinical Red-Flag Audit Logs
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

SET FOREIGN_KEY_CHECKS = 1;
