# Hostinger Production Deployment & Setup Guide
**Dr. Farhan Mustafa Clinic Portal & AI Receptionist**

This guide provides complete, step-by-step instructions for deploying Dr. Farhan Mustafa's clinical web application and backend on **Hostinger Web Hosting (cPanel / hPanel)** with PHP 8.2+, MySQL 8.0, SSL, protected `.env` configuration, and automated Cron Jobs.

---

## 1. Prerequisites on Hostinger
* **Hostinger Hosting Plan**: Premium Web Hosting, Business Web Hosting, or Cloud Startup.
* **Domain Name**: Pointing to Hostinger nameservers (e.g., `healthpro.com.pk` or `drfarhanmustafa.com`).
* **PHP Version**: **PHP 8.2** or **PHP 8.3** (hPanel -> Advanced -> PHP Configuration).
* **Required PHP Extensions**: `pdo_mysql`, `openssl`, `mbstring`, `curl`, `json`, `filter`.

---

## 2. Database Provisioning & Installation

### Step A: Create MySQL Database in Hostinger hPanel
1. Log into **Hostinger hPanel**.
2. Navigate to **Databases → MySQL Databases**.
3. Under **Create a New MySQL Database and Database User**:
   - **Database Name**: e.g., `u123456789_drfarhan`
   - **Username**: e.g., `u123456789_admin`
   - **Password**: Generate a strong 16+ character password and save it securely.
4. Click **Create**. Note down your Database Name, User, and Password.

### Step B: Import Database Tables & Seed Data
1. In hPanel, under **Databases**, click **Enter phpMyAdmin** next to your new database.
2. Select your database from the left sidebar.
3. Click the **Import** tab:
   - Choose file: `/php-app/database/schema.sql` and click **Import**.
   - Choose file: `/php-app/database/seed.sql` and click **Import**.
4. All 7 tables (`appointments`, `ai_knowledge`, `ai_settings`, `ai_sessions`, `ai_safety_logs`, `smtp_settings`, `users`) will be initialized with doctor credentials, clinic rules, and audit logs.

---

## 3. Environment Configuration (`.env`)

> **Security Mandate**: Never commit real database passwords or SMTP secrets to public repositories or client-side code.

### Step-by-Step `.env` Setup:
1. In Hostinger **File Manager**, locate the application directory.
2. Copy `.env.example` to a new file named `.env`.
3. Open `.env` and fill in your actual production values:

```env
# Optional Gemini AI API Key (Server-Side Only for AI Receptionist)
GEMINI_API_KEY=""

# Application URL
APP_URL="https://healthpro.com.pk"

# MySQL Database Configuration (From Step 2)
DB_HOST=localhost
DB_NAME=u123456789_drfarhan
DB_USER=u123456789_admin
DB_PASS=YourStrongHostingerDbPasswordHere

# SMTP Mail Dispatch Configuration
# Set SMTP_ENABLED=true once you have created your Hostinger email mailbox.
# If SMTP_ENABLED=false, patient bookings continue to save in MySQL seamlessly.
SMTP_ENABLED=false
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_ENCRYPTION=ssl
SMTP_USER=appointments@healthpro.com.pk
SMTP_PASS=YourEmailMailboxPasswordHere
SMTP_FROM_EMAIL=appointments@healthpro.com.pk
SMTP_FROM_NAME="Dr. Farhan Mustafa"
```

---

## 4. Email Mailbox Creation (Hostinger Titan / Webmail)

1. In Hostinger hPanel, navigate to **Emails → Email Accounts**.
2. Select your domain (`healthpro.com.pk`).
3. Click **Add Email Account**:
   - Email: `appointments@healthpro.com.pk` (or `reception@healthpro.com.pk`)
   - Set a secure password.
4. Once created, update your `.env` file:
   - Set `SMTP_ENABLED=true`
   - Update `SMTP_USER` and `SMTP_PASS` with your mailbox credentials.
5. In the **Admin Portal (`/admin` -> Appointments -> SMTP Settings)**, test the email handshake with the **Send Test Notification** button.

> **Offline/Disabled Fallback**: If you do not yet have an email mailbox, leave `SMTP_ENABLED=false`. The booking system will save all appointment records and intake forms directly to MySQL without errors.

---

## 5. File Upload & Directory Permissions

1. Open **Hostinger File Manager** and navigate to `public_html/`.
2. Upload the built static frontend files into `public_html/` (or deploy the PHP backend from `/php-app`).
3. Verify permissions:
   - Directories: `755`
   - Files: `644`
   - `.htaccess`: `644`
   - `.env`: `600` or `644` (The included `.htaccess` blocks any browser access to `*.env` files).

---

## 6. Hostinger Automated Cron Jobs

In Hostinger hPanel, go to **Advanced → Cron Jobs** and add the following 3 cron tasks:

| Task | Frequency | Crontab Expression | Command to Execute |
| :--- | :--- | :--- | :--- |
| **Appointment Reminders** | Every 30 mins | `*/30 * * * *` | `/usr/bin/php /home/u123456789/domains/healthpro.com.pk/php-app/cron/cron_reminders.php` |
| **AI Safety Log Retention Purge** | Daily at midnight | `0 0 * * *` | `/usr/bin/php /home/u123456789/domains/healthpro.com.pk/php-app/cron/cron_purge_logs.php` |
| **Daily Clinic Morning Digest** | Daily at 8:00 AM PKT | `0 3 * * *` (UTC) | `/usr/bin/php /home/u123456789/domains/healthpro.com.pk/php-app/cron/cron_daily_digest.php` |

*(Replace `/home/u123456789/domains/healthpro.com.pk` with your actual hosting home path shown in hPanel).*

---

## 7. SSL Certificate & Security Verification

1. In hPanel, navigate to **Security → SSL** and verify the **Free Let's Encrypt SSL Certificate** is active.
2. Ensure **Force HTTPS** is enabled.
3. Verify HTTP security headers:
   - `Strict-Transport-Security: max-age=31536000`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 8. Verification & Launch Checklist

- [ ] Web application loads with secure SSL lock (`https://healthpro.com.pk`).
- [ ] Patient appointment bookings generate a unique reference code (`DFM-2026-XXXX`) with status "New".
- [ ] Database contains the new appointment record in `appointments` table.
- [ ] Admin Portal (`/admin`) shows the appointment in the queue and alerts if SMTP is unconfigured.
- [ ] WhatsApp direct link (`https://wa.me/923280145670`) connects to clinic reception.
- [ ] Emergency keyword detector triggers Rescue 1122 guidance instantly.
