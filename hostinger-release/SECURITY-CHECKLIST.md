# Security & Privacy Audit Checklist
**Dr. Farhan Mustafa Medical Practice — Production System Hardening**

This checklist documents the security controls, data privacy guardrails, and hardening measures implemented across the application.

---

## 1. API Key & Credential Isolation
- [x] **No Client-Side Secret Leakage**: The Google Gemini API key and SMTP passwords are never transmitted to or bundled inside client JavaScript.
- [x] **Environment Variable Protection**: All secrets are stored exclusively in `.env` outside the public web root.
- [x] **Git & VCS Isolation**: `.gitignore` strictly excludes `.env`, `*.log`, and temporary database dumps.
- [x] **Graceful Fallbacks**: If the Gemini API key is missing or invalid, the backend automatically switches to a deterministic, keyword-matched rule engine without crashing.

---

## 2. Web Application Security & Headers
- [x] **Content-Security-Policy (CSP)**: Configured to permit only trusted resources (Google Fonts, Google Maps embeds).
- [x] **HTTP Strict Transport Security (HSTS)**: Configured with `max-age=31536000; includeSubDomains; preload`.
- [x] **Clickjacking Mitigation**: `X-Frame-Options: SAMEORIGIN` enabled on all endpoints.
- [x] **MIME-Type Sniffing Protection**: `X-Content-Type-Options: nosniff` enabled.
- [x] **Referrer Policy**: `strict-origin-when-cross-origin` enforced.
- [x] **Directory Browsing Disabled**: `Options -Indexes` in `.htaccess` blocks public file listing.
- [x] **Sensitive File Denial**: `.htaccess` denies access to `.env`, `.sql`, `.ini`, `.log`, and `.sh` files.

---

## 3. Medical AI Safety Guardrails
- [x] **Zero Prescription / Diagnosis Policy**: Strict prompt engineering and regex safety layers reject requests for prescription drug names, dosage numbers (e.g. `500mg`), and lab interpretations.
- [x] **Emergency Interception**: Hardcoded high-priority detection for acute conditions (chest pain, stroke, acute breathlessness, poisoning) immediately displays the **Rescue 1122** calling prompt.
- [x] **Strict Knowledge Grounding**: AI is constrained to answer solely from published, clinic-approved facts stored in MySQL.
- [x] **Rate Limiting**: Rate limiter caps requests to 20 messages per 10 minutes per IP/session to prevent abuse and API exhaustion.

---

## 4. Patient Data Privacy & Confidentiality
- [x] **Protected Appointment Lookup**: Lookup requires both the unique **Reference Code** (e.g. `DFM-2026-1082`) and matching registered mobile digits.
- [x] **Pre-Visit Form Protection**: Clinical intake is guarded by reference code verification to prevent unauthorized submissions.
- [x] **Data Retention & Purge Tooling**: Built-in cron jobs and an Admin one-click purge tool allow deleting conversation logs and safety audits based on clinic data retention policies (e.g. 30/90 days).
- [x] **Audit Trails**: Every status change, reschedule, and cancellation records the timestamp, acting user/portal, and reason.

---

## 5. Input Validation & SQL Injection Defense
- [x] **Prepared Statements**: All database operations in PHP PDO and Node use parameterized queries to eliminate SQL injection vectors.
- [x] **HTML/XSS Sanitization**: User inputs are escaped before rendering.
- [x] **CSRF Protection**: State-changing POST/PATCH requests require proper JSON payload headers and session validation.
