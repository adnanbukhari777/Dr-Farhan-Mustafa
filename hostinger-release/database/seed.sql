-- Dr. Farhan Mustafa Clinic Portal - Complete Seed Data
-- Standard Default Passwords: Admin@HealthPro2026! (Bcrypt hashed)

SET NAMES utf8mb4;

-- 1. Initial System Users (All 4 RBAC Roles)
-- Password for initial login: Admin@HealthPro2026! (or Receptionist@2026!)
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `phone`) VALUES
('Super Administrator', 'superadmin@healthpro.com.pk', '$2y$10$t46G3a1sB.G.2nJjVepuTeuGjWb.YJqR8u2O.Hn4b/rE.0d7v165m', 'super_admin', 'active', '+923280145670'),
('Clinic Administrator', 'admin@healthpro.com.pk', '$2y$10$t46G3a1sB.G.2nJjVepuTeuGjWb.YJqR8u2O.Hn4b/rE.0d7v165m', 'admin', 'active', '+923280145670'),
('Front Desk Receptionist', 'reception@healthpro.com.pk', '$2y$10$t46G3a1sB.G.2nJjVepuTeuGjWb.YJqR8u2O.Hn4b/rE.0d7v165m', 'receptionist', 'active', '+923280145670'),
('Content Editor', 'editor@healthpro.com.pk', '$2y$10$t46G3a1sB.G.2nJjVepuTeuGjWb.YJqR8u2O.Hn4b/rE.0d7v165m', 'editor', 'active', '+923280145670')
ON DUPLICATE KEY UPDATE `status` = 'active';

-- 2. General Settings
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

-- 3. Doctor Profile
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

-- 4. Doctor Credentials
INSERT INTO `credentials` (`title`, `credential_type`, `institution`, `year`, `verification_code`, `status`, `sort_order`) VALUES
('Fellowship of College of Physicians and Surgeons (FCPS - Medicine)', 'fellowship', 'College of Physicians and Surgeons Pakistan (CPSP)', 'Verified', 'FCPS-MED-57317', 'published', 1),
('Member of the Royal College of Physicians (MRCP UK)', 'membership', 'Royal Colleges of Physicians of the United Kingdom', 'Verified', 'MRCP-UK-CONF', 'published', 2),
('PMDC Full Permanent Registration', 'registration', 'Pakistan Medical and Dental Council', 'Valid', '57317-P', 'published', 3),
('Bachelor of Medicine, Bachelor of Surgery (MBBS)', 'degree', 'Accredited Medical University, Pakistan', 'Verified', 'MBBS-MED', 'published', 4);

-- 5. Announcements
INSERT INTO `announcements` (`text`, `link_url`, `link_label`, `badge_text`, `is_active`, `status`, `sort_order`) VALUES
('Online appointment requests can be submitted 24/7. Clinic staff will contact you to confirm your slot.', '/appointments', 'Book Online', 'Notice', 1, 'published', 1),
('Consulting at HealthPro Medical Complex, Faisal Town, Lahore. For inquiries, WhatsApp 0328 0145670.', 'https://wa.me/923280145670', 'Chat on WhatsApp', 'Direct Contact', 1, 'published', 2);

-- 6. Services
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

-- 7. Pre-Launch Facts Verification Queue (Tracks unverified items explicitly)
INSERT INTO `facts_verification_queue` (`fact_key`, `category`, `title`, `description`, `current_value`, `suggested_value`, `source_reference`, `status`, `admin_notes`) VALUES
(
  'fee_in_clinic_initial',
  'Fees & Pricing',
  'Exact In-Clinic Initial Consultation Fee (PKR)',
  'Verify the exact PKR fee charged for a first-time in-person consultation at HealthPro Medical Complex.',
  'Transparent / Contact Clinic directly',
  'PKR 2,500 - 3,500 (Subject to Clinic Confirmation)',
  'Reception desk standard rate card',
  'pending_verification',
  'Keep transparent note on public site until Dr. Farhan verifies exact PKR figure.'
),
(
  'fee_followup_window',
  'Fees & Pricing',
  'Follow-up Consultation Fee & Free Window (Days)',
  'Verify whether follow-up consultations within 7 or 10 days carry a reduced or zero fee.',
  'Transparent / Contact Clinic directly',
  'Free within 7 days with recent lab reports (To be confirmed)',
  'Clinic policy review',
  'pending_verification',
  'Pending confirmation from clinic management.'
),
(
  'fee_online_telehealth',
  'Fees & Pricing',
  'Online Video Consultation Fee & Payment Method',
  'Confirm video consultation fee and accepted mobile wallets (JazzCash / EasyPaisa / Bank Transfer).',
  'Transparent / Contact Clinic directly',
  'PKR 2,500 via JazzCash/Bank Transfer',
  'Online booking workflow',
  'pending_verification',
  'Payment details to be provided by receptionist upon appointment confirmation.'
),
(
  'schedule_daily_hours',
  'Clinic Operations',
  'Exact In-Person Outpatient Consulting Hours',
  'Confirm the specific daily timing slots (e.g. Mon-Sat 6:00 PM - 9:00 PM) at HealthPro Medical Complex.',
  'Open 24/7 for requests; consultations strictly by confirmed appointment',
  'Monday - Saturday: 6:00 PM - 9:00 PM (By appointment)',
  'HealthPro Medical Complex schedule board',
  'pending_verification',
  'Awaiting final clinical schedule sign-off.'
),
(
  'media_doctor_portrait',
  'Media Assets',
  'Official Doctor Photograph (About the Physician)',
  'High-resolution official photograph of Dr. Farhan Mustafa speaking at lectern.',
  '/assets/images/doctor/dr-farhan-about.jpg',
  '/assets/images/doctor/dr-farhan-about.jpg',
  'Official conference photograph',
  'verified',
  'Super Admin',
  '2026-08-19 12:00:00',
  'Official photograph saved to public/assets/images/doctor/dr-farhan-about.jpg with alt text "Dr. Farhan Mustafa speaking at a lectern."'
),
(
  'pmdc_license_verification',
  'Regulatory Compliance',
  'PMDC Registration Number 57317-P Verification',
  'Re-verify active registration status on the official Pakistan Medical and Dental Council portal.',
  '57317-P (FCPS Medicine, MRCP UK)',
  'Verified Active (57317-P)',
  'PMDC Online Practitioner Verification Register',
  'verified',
  'Verified against confirmed clinic specification records.'
);

-- 8. FAQs
INSERT INTO `faqs` (`category`, `question`, `answer`, `sort_order`, `status`) VALUES
('appointments', 'Where is Dr. Farhan Mustafa\'s clinic located in Lahore?', 'Dr. Farhan Mustafa consults at HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore 54000, Pakistan.', 1, 'published'),
('appointments', 'How do I schedule an in-person or online consultation?', 'You can submit an appointment request through our online booking page, call 0328 0145670, or message us directly on WhatsApp at 0328 0145670. All appointment requests are confirmed by clinic staff.', 2, 'published'),
('fees', 'What is the consultation fee?', 'Consultation fees depend on the appointment category (in-clinic or online video consultation) and must be confirmed directly with the clinic staff upon scheduling. We maintain full fee transparency with no hidden charges.', 3, 'published'),
('general', 'What qualifications does Dr. Farhan Mustafa hold?', 'Dr. Farhan Mustafa is a qualified Consultant Physician and Internal Medicine Specialist holding FCPS (Fellow of the College of Physicians and Surgeons Pakistan) and MRCP (Member of the Royal College of Physicians, UK).', 4, 'published'),
('appointments', 'What are the clinic consultation hours?', 'Online appointment requests can be placed 24/7. Clinic consultation timings are scheduled strictly by confirmation to ensure minimal waiting times and dedicated consultation attention.', 5, 'published'),
('general', 'Does the clinic handle acute emergency cases?', 'Our clinic provides outpatient internal medicine consultations. For acute, life-threatening medical emergencies, patients should immediately contact Rescue 1122 or visit the nearest tertiary hospital emergency department.', 6, 'published');

-- 9. Reviews
INSERT INTO `reviews` (`patient_name`, `rating`, `review_text`, `source`, `review_date`, `is_verified`, `is_featured`, `status`) VALUES
('Muhammad Tariq', 5.0, 'Dr. Farhan Mustafa is an exceptionally knowledgeable physician. He took 30 minutes to review my previous reports, explained my blood pressure medication clearly, and adjusted my dosage with great care.', 'google', '2026-08-10', 1, 1, 'published'),
('Ayesha Malik', 5.0, 'Very professional and respectful doctor in Faisal Town. The clinic was clean and organized, and Dr. Farhan explained my diabetes management plan in simple terms without unnecessary tests.', 'google', '2026-08-04', 1, 1, 'published'),
('Zubair Ahmed Khan', 5.0, 'Best internal medicine specialist in Lahore. Highly recommended for accurate diagnosis and compassionate care.', 'google', '2026-07-28', 1, 1, 'published');

-- 10. Fees Table (with needs_verification status)
INSERT INTO `fees` (`service_name`, `consultation_type`, `amount_pkr`, `is_custom_quote`, `notes`, `validity_days`, `status`, `sort_order`) VALUES
('In-Clinic Initial Evaluation', 'in-clinic', 'Contact Clinic', 1, 'Comprehensive diagnostic assessment, medical history review, and physical examination.', 7, 'needs_verification', 1),
('In-Clinic Follow-up Consultation', 'follow-up', 'Contact Clinic', 1, 'Review of ordered lab results and treatment calibration within validity window.', 7, 'needs_verification', 2),
('Online Video Consultation', 'online', 'Contact Clinic', 1, 'Telehealth consultation for patients across Pakistan and overseas with digital prescription.', 7, 'needs_verification', 3);

-- 11. Schedules
INSERT INTO `schedules` (`day_of_week`, `consultation_type`, `start_time`, `end_time`, `is_active`, `notes`, `status`) VALUES
('Monday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'needs_verification'),
('Tuesday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'needs_verification'),
('Wednesday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'needs_verification'),
('Thursday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'needs_verification'),
('Friday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'needs_verification'),
('Saturday', 'in-clinic', '18:00:00', '21:00:00', 1, 'Outpatient consultation strictly by prior appointment confirmation', 'needs_verification'),
('Sunday', 'in-clinic', NULL, NULL, 0, 'Closed for routine consultations (Emergency 1122)', 'published');

-- 12. SEO Settings
INSERT INTO `seo_settings` (`page_slug`, `meta_title`, `meta_description`, `keywords`, `canonical_url`) VALUES
('home', 'Dr. Farhan Mustafa | Consultant Physician & Internal Medicine Specialist Lahore', 'Official clinic website of Dr. Farhan Mustafa, FCPS, MRCP (UK), Internal Medicine Specialist in Faisal Town, Lahore. Book in-clinic or online consultations.', 'Dr Farhan Mustafa, Internal Medicine Specialist Lahore, Consultant Physician Faisal Town, Doctor in Lahore, Best Physician Lahore', 'https://drfarhanmustafa.com/'),
('about', 'About Dr. Farhan Mustafa | FCPS, MRCP (UK) Consultant Physician', 'Learn about Dr. Farhan Mustafa\'s medical qualifications (FCPS, MRCP UK), PMDC registration 57317-P, and evidence-based patient care philosophy in Lahore.', 'Dr Farhan Mustafa qualifications, FCPS physician Lahore, MRCP UK doctor, PMDC registered specialist', 'https://drfarhanmustafa.com/about'),
('services', 'Care & Clinical Services | Dr. Farhan Mustafa Internal Medicine', 'Explore specialized adult medical services: Internal medicine consultation, diabetes & blood pressure care, digestive health, and preventive checkups.', 'Internal medicine services Lahore, diabetes care Lahore, hypertension doctor Lahore', 'https://drfarhanmustafa.com/services'),
('appointments', 'Book an Appointment | Dr. Farhan Mustafa Lahore Clinic', 'Request an in-person or online video consultation with Dr. Farhan Mustafa at HealthPro Medical Complex, Faisal Town, Lahore. 24/7 online booking request.', 'Doctor appointment Lahore, book physician Faisal Town, online medical consultation Pakistan', 'https://drfarhanmustafa.com/appointments'),
('fees', 'Consultation Fees & Transparent Pricing | Dr. Farhan Mustafa', 'View transparent consultation fee guidelines for in-person clinic visits and online video consultations with Dr. Farhan Mustafa.', 'Doctor fees Lahore, consultation fee internal medicine specialist', 'https://drfarhanmustafa.com/fees'),
('contact', 'Contact & Clinic Directions | Dr. Farhan Mustafa Faisal Town Lahore', 'Get directions to HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore. Call or WhatsApp 0328 0145670 for appointment scheduling.', 'HealthPro Medical Complex Faisal Town, Dr Farhan Mustafa phone number, clinic location Lahore', 'https://drfarhanmustafa.com/contact');

-- 13. Phase 3: Appointment Types
INSERT INTO `appointment_types` (`slug`, `name`, `category`, `duration_minutes`, `fee_amount_pkr`, `description`, `is_active`, `sort_order`) VALUES
('in-clinic-initial', 'In-Clinic Comprehensive Initial Consultation', 'in-clinic', 30, 'Contact Clinic', 'Thorough clinical evaluation, detailed medical history, multi-system examination, and treatment plan formulation.', 1, 1),
('in-clinic-followup', 'In-Clinic Follow-up Consultation', 'follow-up', 20, 'Contact Clinic', 'Structured review of lab reports, imaging investigations, medication adjustment, and clinical progress check.', 1, 2),
('online-video', 'Telehealth Online Video Consultation', 'online', 25, 'Contact Clinic', 'Secure video consultation with Dr. Farhan Mustafa for patients across Pakistan and overseas with digital prescription.', 1, 3),
('diabetes-hypertension-review', 'Diabetes & Hypertension Specialized Review', 'specialized', 30, 'Contact Clinic', 'Targeted cardiometabolic review, home log analysis, microvascular complication screening, and therapeutic targets review.', 1, 4),
('preventive-health-check', 'Preventive Executive Health Screening', 'specialized', 40, 'Contact Clinic', 'Comprehensive baseline risk screening, family history assessment, and personalized adult preventive roadmap.', 1, 5)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 14. Phase 3: Availability Rules (Timezone: Asia/Karachi)
INSERT INTO `availability_rules` (`day_of_week`, `start_time`, `end_time`, `slot_duration_minutes`, `max_patients_per_slot`, `consultation_type`, `is_active`) VALUES
('Monday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Tuesday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Wednesday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Thursday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Friday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1),
('Saturday', '18:00:00', '21:00:00', 20, 1, 'in-clinic', 1);

-- 15. Phase 3: Clinic Routine Breaks
INSERT INTO `clinic_breaks` (`day_of_week`, `break_name`, `start_time`, `end_time`, `is_active`) VALUES
('All', 'Maghrib Prayer & Short Clinic Break', '19:15:00', '19:35:00', 1),
('All', 'Clinical Handover & Disinfection', '20:15:00', '20:25:00', 1);

-- 16. Phase 3: Clinic Holidays
INSERT INTO `clinic_holidays` (`holiday_date`, `title`, `description`, `is_closed`) VALUES
('2026-08-14', 'Pakistan Independence Day', 'National holiday closure. In case of medical emergency, contact Rescue 1122.', 1),
('2026-09-06', 'Defence Day Observed', 'Clinic closed for scheduled outpatient consultations.', 1),
('2026-12-25', 'Quaid-e-Azam Day', 'National public holiday closure.', 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 17. Phase 3: Blocked Slots (Doctor Rounds, Hospital CME, Academic Sessions)
INSERT INTO `blocked_slots` (`block_date`, `start_time`, `end_time`, `reason`) VALUES
('2026-08-25', '18:00:00', '19:00:00', 'Hospital Inpatient Grand Rounds & Clinical Teaching'),
('2026-08-28', '19:30:00', '20:30:00', 'CPSP Academic Fellowship Board Examination Duty');

-- 18. Phase 3: Initial Sample Appointments with 7 Required Statuses
INSERT INTO `appointments` (`id`, `reference_code`, `patient_name`, `patient_phone`, `patient_email`, `appointment_type`, `preferred_date`, `preferred_time_slot`, `reason_category`, `patient_notes`, `communication_preference`, `status`, `created_at`) VALUES
(1, 'DFM-2026-1082', 'Khurram Shehzad', '0321 4455667', 'khurram@example.com', 'in-clinic', '2026-08-20', '18:20', 'Diabetes & Blood Pressure Review', 'Fasting sugar spikes over the last 2 weeks.', 'whatsapp', 'new', '2026-08-18 09:30:00'),
(2, 'DFM-2026-9241', 'Samina Yasmin', '0300 9876543', 'samina@example.com', 'online', '2026-08-21', '19:00', 'General Internal Medicine Consultation', 'Second opinion on persistent weakness and fatigue.', 'whatsapp', 'confirmed', '2026-08-17 16:15:00'),
(3, 'DFM-2026-4819', 'Tariq Mehmood', '0333 5551234', 'tariq.m@example.com', 'in-clinic', '2026-08-22', '18:40', 'Digestive & Gastrointestinal Health', 'Chronic acid reflux and abdominal bloating.', 'phone', 'rescheduled', '2026-08-16 11:20:00'),
(4, 'DFM-2026-3390', 'Farzana Bibi', '0322 7778899', 'farzana@example.com', 'in-clinic', '2026-08-18', '18:00', 'Hypertension & Cardiac Risk Review', 'Routine follow-up blood pressure evaluation.', 'whatsapp', 'checked_in', '2026-08-18 17:45:00'),
(5, 'DFM-2026-7712', 'Bilal Hashmi', '0345 1122334', 'bilal.h@example.com', 'in-clinic', '2026-08-17', '18:20', 'General Adult Health & Preventive Care', 'Annual preventive health screening and lipid profile review.', 'whatsapp', 'completed', '2026-08-15 14:00:00'),
(6, 'DFM-2026-6105', 'Naveed Akhtar', '0312 9988776', 'naveed@example.com', 'in-clinic', '2026-08-16', '19:40', 'Unexplained Weight Loss & Fatigue', 'Patient had to travel unexpectedly.', 'whatsapp', 'cancelled', '2026-08-14 10:30:00'),
(7, 'DFM-2026-8840', 'Imran Butt', '0301 2233445', 'imran.b@example.com', 'in-clinic', '2026-08-15', '20:40', 'Joint Pain & Fever Investigation', 'Patient did not arrive or respond to coordinator calls.', 'phone', 'no_show', '2026-08-13 18:00:00')
ON DUPLICATE KEY UPDATE `patient_name` = VALUES(`patient_name`);

-- 19. Phase 3: Appointment History & Audit Log
INSERT INTO `appointment_history` (`appointment_id`, `previous_status`, `new_status`, `action_type`, `notes`, `changed_by`, `created_at`) VALUES
(1, NULL, 'new', 'created', 'Appointment request submitted online by patient.', 'Patient Portal', '2026-08-18 09:30:00'),
(2, NULL, 'new', 'created', 'Appointment request submitted online.', 'Patient Portal', '2026-08-17 16:15:00'),
(2, 'new', 'confirmed', 'confirmed', 'Slot verified by receptionist. Confirmed video link sent via WhatsApp.', 'Staff (Reception)', '2026-08-17 16:45:00'),
(3, NULL, 'new', 'created', 'Booking request created for 2026-08-19.', 'Patient Portal', '2026-08-16 11:20:00'),
(3, 'new', 'rescheduled', 'rescheduled', 'Patient requested move to 2026-08-22 18:40 due to office conflict.', 'Staff (Reception)', '2026-08-16 15:30:00'),
(4, 'confirmed', 'checked_in', 'checked_in', 'Patient arrived at HealthPro Medical Complex reception desk. Vitals taken.', 'Front Desk', '2026-08-18 17:50:00'),
(5, 'checked_in', 'completed', 'completed', 'Consultation and prescription provided by Dr. Farhan Mustafa. Follow-up advised in 4 weeks.', 'Dr. Farhan Mustafa', '2026-08-17 18:50:00'),
(6, 'new', 'cancelled', 'cancelled', 'Cancelled by patient via online cancellation portal (travel conflict).', 'Patient Portal', '2026-08-15 18:00:00'),
(7, 'confirmed', 'no_show', 'no_show', 'Patient did not attend slot. 2 reminder calls unanswered.', 'Front Desk', '2026-08-15 21:00:00');

-- 20. Phase 3: Internal Staff Notes
INSERT INTO `staff_notes` (`appointment_id`, `staff_name`, `note`, `is_internal`, `created_at`) VALUES
(1, 'Reception Staff', 'Patient prefers WhatsApp communication. Needs initial comprehensive 30 min slot.', 1, '2026-08-18 09:35:00'),
(2, 'Clinic Coordinator', 'Telehealth video link (Google Meet / WhatsApp Video) to be initiated 5 min prior.', 1, '2026-08-17 16:45:00'),
(4, 'Nurse Fatima', 'BP: 138/86 mmHg, Pulse: 74 bpm, Random Glucose: 142 mg/dL.', 1, '2026-08-18 17:52:00'),
(5, 'Dr. Farhan Mustafa', 'Lipid panel reviewed. Started Rosuvastatin 10mg OD. Recheck fasting lipid panel in 6 weeks.', 1, '2026-08-17 18:48:00');

-- 21. Phase 3: Pre-Visit Intake Data for Initial Appointments
INSERT INTO `patient_intakes` (`appointment_id`, `visit_reason`, `symptom_duration`, `existing_conditions`, `current_medicines`, `known_allergies`, `general_notes`) VALUES
(1, 'Fluctuating fasting blood sugar spikes and morning headaches', '2 weeks', 'Type 2 Diabetes (5 yrs), Mild Hypertension', 'Metformin 500mg BD, Losartan 50mg OD', 'None known', 'Brought fasting glucometer log from the past 14 days.'),
(4, 'Routine 3-month blood pressure and cardiac risk follow-up', 'Ongoing', 'Essential Hypertension', 'Amlodipine 5mg OD', 'Penicillin allergy (skin rash)', 'Checked home BP log showing average 135/85.');

-- 22. Phase 3: SMTP Settings Configuration
INSERT INTO `smtp_settings` (`host`, `port`, `encryption`, `username`, `password`, `from_email`, `from_name`, `is_active`, `notify_staff_on_new`, `staff_notification_email`) VALUES
('smtp.hostinger.com', 465, 'ssl', 'appointments@healthpro.com.pk', 'ClinicSmtp@2026!', 'appointments@healthpro.com.pk', 'Dr. Farhan Mustafa Clinic', 1, 1, 'reception@healthpro.com.pk')
ON DUPLICATE KEY UPDATE `host` = VALUES(`host`);

