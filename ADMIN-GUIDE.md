# Admin Operational Guide
**Dr. Farhan Mustafa Medical Practice — Clinic Portal & Management CMS**

This guide provides front desk coordinators, clinic receptionists, and doctors with step-by-step instructions for operating the daily practice workflow.

---

## 1. Accessing the Admin Portal

1. Access the portal by navigating to the `/admin` route or clicking **Admin Portal** in the navigation overlay.
2. Log in using your authorized clinic credentials.
3. User Roles:
   - **Super Admin**: Full access to all modules, SMTP settings, user management, and security purge tools.
   - **Doctor (Dr. Farhan Mustafa)**: View patient clinical intake forms, review patient history, add internal clinical notes, manage blocked academic/surgery slots.
   - **Receptionist / Front Desk**: Confirm new appointment requests, reschedule or cancel bookings upon patient call, record patient check-ins at Faisal Town desk, manage daily breaks.
   - **Content Editor**: Update health blog posts, educational patient resources, and clinic announcements.

---

## 2. Daily Appointment & Intake Workflow

### A. Reviewing "New" Booking Requests
- Online patient submissions arrive with initial status **`New`**.
- Review slot availability for the selected evening (6:00 PM – 9:00 PM PKT).
- Contact the patient via **WhatsApp (+92 328 0145670)** or phone to confirm attendance.
- Transition status from **`New`** to **`Confirmed`**. An automated confirmation email/message will dispatch.

### B. Patient Arrival & Reception Check-in
- When the patient arrives at HealthPro Medical Complex, search for their reference code (e.g. `DFM-2026-1082`).
- Transition status to **`Checked In`**.
- Record front desk vitals (BP, pulse, random glucose, temperature) directly into the appointment's **Internal Staff Notes**.

### C. Post-Consultation Completion
- Once Dr. Farhan Mustafa completes the diagnostic evaluation and prescription, transition status to **`Completed`**.
- Record follow-up recommendations (e.g., "Review in 4 weeks with lipid profile").

### D. Rescheduling & Cancellations
- Rescheduling can be executed by reception in 1 click, automatically freeing up the previous time slot for other patients and preventing double-booking.

---

## 3. Managing Clinic Schedule, Breaks & Holidays

### Setting Clinic Holidays
- Navigate to **Schedule & Availability → Holidays**.
- Add national holidays (e.g., Pakistan Independence Day Aug 14, Quaid-e-Azam Day Dec 25) or unexpected clinic closures.
- The online booking calendar will automatically grey out closed dates and display an emergency hospital advisory.

### Adding Temporary Blocked Slots
- If Dr. Farhan has academic fellowship examinations, hospital grand rounds, or emergency rounds:
  - Add a **Blocked Time Range** (e.g. 2026-08-25 from 18:00 to 19:00).
  - Slots within that window become unavailable on the live slot generator with the displayed reason.

---

## 4. AI Clinic Receptionist Management

### A. Managing Published Grounding Knowledge
- Navigate to **AI Receptionist → Knowledge Base**.
- Every FAQ question contains versions in **English**, **اردو (Urdu)**, and **Roman Urdu**.
- To update clinic policy (e.g., timing change, fee adjustment), edit the corresponding topic and ensure **Published** is toggled ON.
- The AI uses this data as its strict grounding boundary.

### B. Monitoring Safety Logs & Emergency Triggers
- Navigate to **AI Receptionist → Safety & Transcripts**.
- Review flagged conversations:
  - **`emergency_symptoms`**: Patient mentioned acute symptoms (chest pain, shortness of breath, stroke symptoms). The AI automatically presented Rescue 1122 and emergency hospital instructions.
  - **`medical_diagnosis_attempt`**: Patient requested drug dosages, report interpretations, or prescriptions. The AI refused medical advice and offered appointment booking.
- Audit transcripts to ensure high customer service quality.
- Use **Purge Audit Logs** to delete conversation logs older than the clinic's data retention policy.

---

## 5. Contact Inquiries & Feedback Moderation
- Navigate to **Contact Messages** to review patient inquiries submitted through the contact form.
- Mark inquiries as **Read** or **Replied** once handled by reception.
