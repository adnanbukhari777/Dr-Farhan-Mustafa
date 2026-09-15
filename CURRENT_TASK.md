# Current Task

## Task summary

- Task title: Repair Stage 3, Appointment and Clinical Intake Workflow
- Requested on: 2026-09-13
- Status: In progress
- Objective: Introduce dedicated clinician role with exclusive access to sensitive clinical intake information, enforce 7-state appointment transition matrix, implement migration 004 with AES-256-GCM encryption at rest, update React and PHP admin portals, and ensure 100% production parity.

## Problem and evidence

- Current behavior: Only 4 roles exist ('super_admin', 'admin', 'receptionist', 'editor'). Receptionist and admin roles currently do not have dedicated clinical demarcation where ONLY the treating clinician can decrypt sensitive intake data. 
- Expected behavior:
  1. Add dedicated `clinician` role to users table and RBAC system.
  2. Enforce 7 appointment statuses: `new`, `confirmed`, `checked_in`, `completed`, `rescheduled`, `cancelled`, `no_show`.
  3. Strict transition matrix enforced both in PHP models and Node.js server.ts.
  4. Migration `004_add_clinician_role_and_workflow.sql` created in migrations directories.
  5. Sensitive patient intake fields (`visit_reason`, `symptom_duration`, `existing_conditions`, `current_medicines`, `known_allergies`, `intake_notes`) encrypted at rest with AES-256-GCM using `CLINICAL_ENCRYPTION_KEY` with fail-closed key management.
  6. Clinical details accessible ONLY to `clinician` role; other roles receive operational metadata (`has_intake`, `intake_completed`) only.
  7. Clinician interface added in React AdminPortal and PHP admin views.
  8. Safe audit logging with zero PHI leakage.
  9. 100% parity between `php-app`, `hostinger-release`, and Node.js/React stack.

## Scope

- Included:
  - Database migrations (`database/migrations/004_add_clinician_role_and_workflow.sql`, `hostinger-release/database/migrations/004_add_clinician_role_and_workflow.sql`, `database/schema.sql`, `hostinger-release/database.sql`, `hostinger-release/database/schema.sql`, `hostinger-release/database/seed.sql`)
  - PHP Backend Core & Models (`php-app/app/Models/User.php`, `php-app/app/Models/Appointment.php`, `php-app/app/Models/PatientIntake.php`, `php-app/app/Controllers/AdminController.php`, `php-app/app/Controllers/AppointmentController.php`, `php-app/app/Core/Auth.php`, `php-app/app/Core/Crypto.php`)
  - Hostinger Release mirrors (`hostinger-release/app/*`)
  - Node.js & React Frontend (`server.ts`, `src/types/index.ts`, `src/components/admin/AdminPortal.tsx`, `src/components/admin/AppointmentsModule.tsx`, `src/components/admin/UsersModule.tsx`)
  - Tests: `tests/stage3_workflow_verification.php` and contract tests
- Excluded: Unrelated public marketing pages or external styling
- Suspected files:
  1. `php-app/app/Models/Appointment.php`
  2. `php-app/app/Models/PatientIntake.php`
  3. `php-app/app/Controllers/AdminController.php`
  4. `server.ts`
  5. `src/components/admin/AppointmentsModule.tsx`

## Requirements

1. Add `clinician` role across DB enum, user models, and frontend role lists.
2. Centralize 7-state appointment transition matrix.
3. AES-256-GCM encryption at rest for sensitive clinical intake fields with fail-closed key check.
4. Clinician-only clinical record viewer in Admin CMS with safe audit event logging.
5. Byte-for-byte parity across `php-app` and `hostinger-release`.
6. Full test verification suite for Stage 3.

## Acceptance criteria

- [ ] Dedicated `clinician` role supported in database, PHP, Node.js, and React.
- [ ] 7 appointment statuses strictly enforced via transition matrix.
- [ ] Migration 004 created and executable.
- [ ] AES-256-GCM clinical intake encryption working with fail-closed key management.
- [ ] Clinician portal interface renders clinical intake data for clinician, redacted for receptionist/admin.
- [ ] Safe audit logging records clinical intake access without logging plaintext PHI.
- [ ] Stage 3 verification test suite passes 100%.
- [ ] 100% parity maintained between `php-app` and `hostinger-release`.

## Verification method

1. Run `php tests/stage3_workflow_verification.php`
2. Run `php tests/stage2b_verification_runner.php` and `php tests/stage2b_api_contract_runner.php` for regression prevention.
3. Verify diff between `php-app` and `hostinger-release` is zero.
4. Verify `npm run build` / `compile_applet` succeeds.
