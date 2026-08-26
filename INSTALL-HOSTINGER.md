# Hostinger Production Deployment Guide
## Dr. Farhan Mustafa Clinic Portal (PHP 8.1+ / MySQL / Apache)

**Consultant Physician & Internal Medicine Specialist**  
*MBBS, FCPS (Medicine), MRCP (UK) — PMDC Reg: 57317-P*  
*HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore, Pakistan*

---

## 1. Overview & Architecture

This deployment package is engineered specifically for **Hostinger Shared Hosting (hPanel & cPanel)** running on Apache, PHP 8.1+, and MySQL / MariaDB.

### Key Architecture Highlights:
- **Pure PHP / MySQL / HTML / CSS / JS**: No Node.js server, no Vite dev server, no npm processes required on the live server.
- **Zero-Configuration Routing**: `.htaccess` handles SPA client-side routing, API dispatching, HTTPS forcing, security headers, and asset caching.
- **28 Relational MySQL Tables**: Double-booking prevention, 7-status appointment lifecycle, smart pre-visit intake, internal staff notes, and audit history.
- **Gemini AI Receptionist**: Multi-lingual medical triage & practice inquiry handling (English, Urdu, Roman Urdu).
- **Hostinger Business Email / SMTP Integration**: Instant patient and reception email notifications via SSL port 465 or TLS port 587.
- **1-Click Web Installer**: Automatic database table creation, seed loading, and Super Admin account generation.

---

## 2. Server Requirements & Environment Settings

Ensure your Hostinger hosting account meets the following minimum specifications (standard on all Hostinger Premium, Business, and Cloud plans):

| Component | Minimum Version | Recommended |
| :--- | :--- | :--- |
| **PHP Version** | `8.1` | `8.2` or `8.3` |
| **PHP Extensions** | `pdo_mysql`, `json`, `mbstring`, `curl`, `openssl` | Enabled by default on Hostinger |
| **Database** | MySQL `5.7+` or MariaDB `10.3+` | MariaDB `10.6+` / MySQL `8.0` |
| **Web Server** | Apache / LiteSpeed | `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires` |
| **SSL Certificate** | Let's Encrypt (Free 1-click in Hostinger hPanel) | Active & Enforced |

### Default Production Environment Keys (`.env.example`):
```env
APP_ENV=production
APP_DEBUG=false
APP_TIMEZONE=Asia/Karachi

DB_HOST=localhost
DB_PORT=3306
DB_NAME=CHANGE_AFTER_HOSTINGER_DB_CREATION
DB_USER=CHANGE_AFTER_HOSTINGER_DB_CREATION
DB_PASS=CHANGE_AFTER_HOSTINGER_DB_CREATION
DB_CHARSET=utf8mb4

SMTP_ENABLED=false
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_ENCRYPTION=ssl
SMTP_USER=CHANGE_AFTER_HOSTINGER_EMAIL_CREATION
SMTP_PASS=CHANGE_AFTER_HOSTINGER_EMAIL_CREATION
SMTP_FROM_EMAIL=CHANGE_AFTER_HOSTINGER_EMAIL_CREATION
SMTP_FROM_NAME=Dr. Farhan Mustafa

STAFF_NOTIFICATION_ENABLED=false

AI_ENABLED=false
GEMINI_MODEL=gemini-3.7-flash

GOOGLE_MAPS_API_KEY=NOT_CONFIGURED
GOOGLE_PLACES_API_KEY=NOT_CONFIGURED

CLINIC_PHONE=+92 328 0145670
CLINIC_PHONE_INTL=+923280145670
CLINIC_WHATSAPP=923280145670
CLINIC_LOCATION=HealthPro Medical Complex, Faisal Town, Lahore, Pakistan
```

---

## 3. Quick-Start Deployment (3 Steps)

### Step 1: Upload Files
Extract `hostinger-release.zip` or upload the contents of the `hostinger-release/` directory directly into your Hostinger **`public_html/`** folder.

### Step 2: Create MySQL Database
1. Log in to **Hostinger hPanel**.
2. Navigate to **Databases** → **MySQL Databases**.
3. Create a new database (e.g., `u123456789_drfarhan`) and a user with a strong password.

### Step 3: Run Setup Wizard
Open your browser and navigate to:
```text
https://yourdomain.com/installer.php
```
Enter your MySQL database credentials, create your **Super Admin** password, and click **Run 1-Click Database Setup**.

Your clinic portal is now live!

---

## 4. Detailed Step-by-Step Hostinger Guide

### Step 4.1: File Structure Verification
Ensure your `public_html/` directory has the following structure:

```text
public_html/
├── index.php                 (Main front controller & API router)
├── .htaccess                 (Apache security rules & routing)
├── index.html                (SPA entry shell)
├── installer.php             (Setup wizard - auto-locked after setup)
├── database.sql              (Production SQL schema & clinical seeds)
├── .env.example              (Template environment config)
├── .env                      (Generated during setup)
├── robots.txt                (Search engine directives)
├── sitemap.xml               (Sitemap for Google indexing)
├── admin/
│   └── index.php             (Admin portal redirection)
├── api/
│   └── index.php             (Direct API dispatcher)
├── assets/
│   ├── index-*.js            (Production React application bundle)
│   ├── index-*.css           (Compiled Tailwind CSS stylesheet)
│   ├── images/               (Doctor photo, article covers, UI icons)
│   └── videos/               (Hero background video: MP4 & WebM)
├── app/                      (Protected backend classes & logic)
│   ├── .htaccess             (Deny all direct browser access)
│   ├── Config/               (Database & environment loaders)
│   ├── Controllers/          (API endpoints: Appointments, AI, Auth, Contact, SMTP)
│   ├── Models/               (Data access: Appointments, Knowledge, Users, Logs)
│   ├── Security/             (Mailer, CSRF tokens, input sanitizers)
│   └── Services/             (Gemini API integration & email dispatch)
├── database/
│   ├── .htaccess             (Protected)
│   ├── schema.sql
│   └── seed.sql
├── uploads/                  (Patient documents / clinic assets)
│   └── .htaccess             (PHP execution disabled for security)
├── logs/                     (Audit and error logs)
│   └── .htaccess             (Protected)
└── cron/                     (Automated scheduled tasks)
    ├── cron_daily_digest.php
    ├── cron_purge_logs.php
    └── cron_reminders.php
```

---

### Step 4.2: Alternative Manual Database Setup (phpMyAdmin)
If you prefer importing the SQL schema manually without using `installer.php`:

1. In Hostinger hPanel, go to **Databases** → **phpMyAdmin** → click **Enter phpMyAdmin**.
2. Select your database from the left sidebar.
3. Click the **Import** tab at the top.
4. Choose `database.sql` from your computer and click **Go**.
5. Copy `.env.example` to `.env` and fill in your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=u123456789_drfarhan
   DB_USER=u123456789_farhan_user
   DB_PASS=YourStrongPassword123!
   ```

---

### Step 4.3: Configuring Hostinger Business Email & SMTP
To send automated confirmation and reminder emails to patients and reception:

1. In Hostinger hPanel, navigate to **Emails** → **Email Accounts**.
2. Create an email account: `appointments@yourdomain.com` (or `info@yourdomain.com`).
3. Note your Hostinger SMTP credentials:
   - **SMTP Host**: `smtp.hostinger.com`
   - **SMTP Port**: `465` (SSL) or `587` (TLS)
   - **SMTP Username**: `appointments@yourdomain.com`
   - **SMTP Password**: Your email password
4. Update your `.env` file:
   ```env
   SMTP_ENABLED=true
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_ENCRYPTION=ssl
   SMTP_USER=appointments@yourdomain.com
   SMTP_PASS=YourEmailPassword
   SMTP_FROM_EMAIL=appointments@yourdomain.com
   SMTP_FROM_NAME="Dr. Farhan Mustafa"
   ```
5. Or log into the **Admin Portal** → **SMTP Settings** to test and verify instant email delivery.

---

### Step 4.4: Configuring Google Gemini AI Receptionist
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add your key to `.env`:
   ```env
   AI_ENABLED=true
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   GEMINI_MODEL=gemini-3.7-flash
   ```
3. Test the AI receptionist widget on your live homepage.

---

### Step 4.5: Setting Up Hostinger Automated Cron Jobs
To enable automatic appointment reminders, daily patient digests, and log maintenance:

1. In Hostinger hPanel, search for **Cron Jobs** in the top search bar.
2. Under **Manage Cron Jobs**, add the following 3 cron tasks:

#### Task 1: Appointment Email Reminders (Runs every morning at 08:00 PKT)
- **Type**: PHP
- **Command**: `/usr/bin/php /home/u123456789/domains/yourdomain.com/public_html/cron/cron_reminders.php`
- **Schedule**: `0 8 * * *` (Daily at 08:00 AM)

#### Task 2: Daily Reception Digest (Runs every evening at 17:00 PKT)
- **Type**: PHP
- **Command**: `/usr/bin/php /home/u123456789/domains/yourdomain.com/public_html/cron/cron_daily_digest.php`
- **Schedule**: `0 17 * * *` (Daily at 05:00 PM)

#### Task 3: Audit & AI Log Maintenance (Runs weekly on Sunday at midnight)
- **Type**: PHP
- **Command**: `/usr/bin/php /home/u123456789/domains/yourdomain.com/public_html/cron/cron_purge_logs.php`
- **Schedule**: `0 0 * * 0` (Weekly on Sunday)

*(Note: Replace `/home/u123456789/domains/yourdomain.com/public_html/` with your exact Hostinger home directory path shown in hPanel).*

---

## 5. Administration & Role-Based Access Control

### Default Administrator Credentials:
- **Admin Portal URL**: `https://yourdomain.com/#/admin`
- **Default Super Admin Email**: `superadmin@healthpro.com.pk`
- **Default Initial Password**: Set during `installer.php` setup (or `Admin@HealthPro2026!`)

> **SECURITY NOTICE**: Immediately after first login, go to the Admin Profile tab and update your password.

---

## 6. Security Hardening Checklist

- [x] **HTTPS Redirection**: Automatic 301 redirection to `https://` configured in `.htaccess`.
- [x] **Protected File Extensions**: Direct browser requests to `.env`, `.sql`, `.log`, `.ini`, and `.md` are rejected with HTTP 403 Forbidden.
- [x] **Uploads Folder Protection**: PHP script execution is disabled inside `uploads/`.
- [x] **Private Backend Directory**: Direct requests to `app/`, `database/`, and `logs/` are blocked via local `.htaccess` files.
- [x] **CSRF & SQL Injection Protection**: All database queries use PDO parameterized prepared statements; CSRF validation on all admin actions.
- [x] **Double-Booking Prevention**: High-concurrency row locking (`FOR UPDATE`) in MySQL transactions.
- [x] **Setup Wizard Auto-Lock**: `installer.php` is permanently locked once `installed.lock` is created.

---

## 7. Troubleshooting & FAQs

### Q: Why do I see a 404 error when refreshing inner pages (e.g. `/services` or `/appointments`)?
**Fix**: Ensure `mod_rewrite` is enabled on your server and that `.htaccess` is present in `public_html/`. Hostinger enables `mod_rewrite` by default on all accounts.

### Q: How do I change the clinic consultation hours or doctor schedule?
**Fix**: Log in to the Admin Portal (`/#/admin`) → **Schedule & Timings** tab. You can update consultation days, hours, slot intervals, prayer breaks, and blocked dates in real-time.

### Q: How do I test if emails are sending?
**Fix**: Log in to the Admin Portal (`/#/admin`) → **SMTP Configuration** → Click **Send Test Email**.

### Q: Where do patient pre-visit intake submissions go?
**Fix**: When a patient completes the smart pre-visit intake form, their medical history, current medications, and allergies are securely stored in the `patient_intakes` table and displayed directly in the Admin Appointment Details drawer.

---

*Dr. Farhan Mustafa Clinic Portal — Engineered for Excellence, Clinical Reliability, and Speed.*
