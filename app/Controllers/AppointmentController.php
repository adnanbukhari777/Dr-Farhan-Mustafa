<?php
/**
 * Appointment API Controller (Phase 3)
 * Full transaction endpoints, availability calculator, patient lookup,
 * pre-visit form intake, and admin status lifecycle management.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AppointmentModel;
use App\Models\ScheduleModel;
use App\Security\Mailer;
use App\Security\Auth;
use App\Config\Config;

class AppointmentController
{
    /**
     * Strictly deny any access to appointment endpoints for editor role accounts
     */
    public static function denyEditor(): void
    {
        Auth::initSession();
        $user = Auth::user();
        if ($user && ($user['role'] ?? '') === Auth::ROLE_EDITOR) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'forbidden',
                'message' => 'Forbidden: Editor role is not authorized to access appointment records or logistics.'
            ], 403);
        }
    }

    /**
     * Handle public booking request
     */
    public function book(): void
    {
        self::denyEditor();
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        $result = AppointmentModel::create($input);

        if ($result['success']) {
            // Trigger email notification
            $appointment = AppointmentModel::getById($result['appointment_id']);
            if ($appointment) {
                Mailer::sendAppointmentNotification('new_request', $appointment);
            }
            http_response_code(201);
        } else {
            http_response_code(!empty($result['is_double_booking']) ? 409 : 400);
        }

        echo json_encode($result);
    }

    /**
     * Get available slots for a given date
     */
    public function getSlots(): void
    {
        self::denyEditor();
        header('Content-Type: application/json');

        $date = $_GET['date'] ?? date('Y-m-d');
        $type = $_GET['type'] ?? 'in-clinic';

        $slots = ScheduleModel::getAvailableSlots($date, $type);
        echo json_encode($slots);
    }

    /**
     * Protected Patient Appointment Lookup
     * Requires both Reference Code and registered Phone Number.
     * Returns strictly operational fields to prevent PHI exposure.
     */
    public function lookup(): void
    {
        self::denyEditor();
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $ref = trim((string)($input['reference_code'] ?? $input['referenceCode'] ?? ''));
        $phone = trim((string)($input['patient_phone'] ?? $input['phone'] ?? ''));

        if (empty($ref) || empty($phone)) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Both Reference Code and Phone Number are required.'
            ], 400);
        }

        $appointment = AppointmentModel::lookup($ref, $phone);

        if (!$appointment) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'not_found',
                'message' => 'No appointment found matching this Reference Code and Phone Number.'
            ], 404);
        }

        $operationalData = self::filterOperationalFields($appointment);
        echo json_encode([
            'success' => true,
            'appointment' => $operationalData,
            'data' => $operationalData
        ]);
    }

    /**
     * Patient Reschedule Request
     * Authenticates via Reference Code + Phone (or authorized staff session)
     */
    public function reschedule(): void
    {
        self::denyEditor();
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $ref = trim((string)($input['reference_code'] ?? $input['referenceCode'] ?? ''));
        $phone = trim((string)($input['patient_phone'] ?? $input['phone'] ?? ''));
        $newDate = trim((string)($input['new_date'] ?? $input['newDate'] ?? ''));
        $newSlot = trim((string)($input['new_time_slot'] ?? $input['newTimeSlot'] ?? ''));
        $reason = trim((string)($input['reason'] ?? 'Patient requested rescheduling'));

        $user = Auth::user();
        $id = (int)($input['appointment_id'] ?? $input['id'] ?? 0);

        if (!$user) {
            // Patient public request: Reference Code + Phone is mandatory
            if (empty($ref) || empty($phone)) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'authentication_required',
                    'message' => 'Reference Code and Phone Number are required to verify patient identity.'
                ], 401);
            }
            $matched = AppointmentModel::lookup($ref, $phone);
            if (!$matched) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'not_found',
                    'message' => 'No appointment found matching this Reference Code and Phone Number.'
                ], 404);
            }
            $id = (int)$matched['id'];
            $changedBy = 'Patient';
        } else {
            $changedBy = $user['name'];
            if (!$id && (!empty($ref) && !empty($phone))) {
                $matched = AppointmentModel::lookup($ref, $phone);
                if ($matched) $id = (int)$matched['id'];
            }
        }

        if (!$id || empty($newDate) || empty($newSlot)) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Valid appointment ID (or Reference Code + Phone), new date, and new time slot are required.'
            ], 400);
        }

        $current = AppointmentModel::getById($id);
        if (!$current) {
            Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Appointment record not found.'], 404);
        }
        if ($current['status'] === Config::STATUS_CANCELLED) {
            Auth::jsonResponse(['success' => false, 'error' => 'invalid_state', 'message' => 'Cancelled appointments cannot be rescheduled.'], 400);
        }

        $result = AppointmentModel::reschedule($id, $newDate, $newSlot, $reason, $changedBy);

        if ($result['success']) {
            $appointment = AppointmentModel::getById($id);
            if ($appointment) {
                Mailer::sendAppointmentNotification('rescheduled', $appointment);
            }
        } else {
            http_response_code(409);
        }

        echo json_encode($result);
    }

    /**
     * Patient Cancellation Request
     * Authenticates via Reference Code + Phone (or authorized staff session)
     */
    public function cancel(): void
    {
        self::denyEditor();
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $ref = trim((string)($input['reference_code'] ?? $input['referenceCode'] ?? ''));
        $phone = trim((string)($input['patient_phone'] ?? $input['phone'] ?? ''));
        $reason = trim((string)($input['reason'] ?? 'Cancelled by patient'));

        $user = Auth::user();
        $id = (int)($input['appointment_id'] ?? $input['id'] ?? 0);

        if (!$user) {
            // Patient public request: Reference Code + Phone is mandatory
            if (empty($ref) || empty($phone)) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'authentication_required',
                    'message' => 'Reference Code and Phone Number are required to verify patient identity.'
                ], 401);
            }
            $matched = AppointmentModel::lookup($ref, $phone);
            if (!$matched) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'not_found',
                    'message' => 'No appointment found matching this Reference Code and Phone Number.'
                ], 404);
            }
            $id = (int)$matched['id'];
            $changedBy = 'Patient';
        } else {
            $changedBy = $user['name'];
            if (!$id && (!empty($ref) && !empty($phone))) {
                $matched = AppointmentModel::lookup($ref, $phone);
                if ($matched) $id = (int)$matched['id'];
            }
        }

        if (!$id || empty($reason)) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Appointment identifier and cancellation reason are required.'
            ], 400);
        }

        $current = AppointmentModel::getById($id);
        if (!$current) {
            Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Appointment record not found.'], 404);
        }
        if ($current['status'] === Config::STATUS_CANCELLED) {
            Auth::jsonResponse(['success' => false, 'error' => 'already_cancelled', 'message' => 'Appointment is already cancelled.'], 400);
        }
        if ($current['status'] === Config::STATUS_COMPLETED) {
            Auth::jsonResponse(['success' => false, 'error' => 'invalid_state', 'message' => 'Completed appointments cannot be cancelled.'], 400);
        }

        $result = AppointmentModel::cancel($id, $reason, $changedBy);

        if ($result['success']) {
            $appointment = AppointmentModel::getById($id);
            if ($appointment) {
                Mailer::sendAppointmentNotification('cancelled', $appointment);
            }
        } else {
            http_response_code(400);
        }

        echo json_encode($result);
    }

    /**
     * Save Pre-Visit Clinical Intake Form
     * Requires authentication via Reference Code + Phone.
     * Encrypts clinical fields at rest using AES-256-GCM.
     * Returns strictly operational confirmation without narrative disclosure.
     * Rejects submission for cancelled or completed appointments and prevents overwriting.
     */
    public function saveIntake(): void
    {
        self::denyEditor();
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $ref = trim((string)($input['reference_code'] ?? $input['referenceCode'] ?? ''));
        $phone = trim((string)($input['patient_phone'] ?? $input['phone'] ?? ''));

        if (empty($ref) || empty($phone)) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'authentication_required',
                'message' => 'Reference Code and Phone Number are required to submit pre-visit clinical intake.'
            ], 401);
        }

        $matched = AppointmentModel::lookup($ref, $phone);
        if (!$matched) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'not_found',
                'message' => 'No appointment found matching this Reference Code and Phone Number.'
            ], 404);
        }

        $appointmentId = (int)$matched['id'];

        // Enforce lifecycle constraint: reject intake for cancelled, completed, or no-show
        $forbiddenStatuses = [Config::STATUS_CANCELLED, Config::STATUS_COMPLETED, Config::STATUS_NO_SHOW];
        if (in_array($matched['status'], $forbiddenStatuses, true)) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'invalid_state',
                'message' => "Clinical intake cannot be submitted for an appointment in '{$matched['status']}' status."
            ], 400);
        }

        // Reject duplicate intake submission (prevent silent overwriting)
        $existingIntake = AppointmentModel::getIntake($appointmentId, false);
        if ($existingIntake) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'already_submitted',
                'message' => 'Pre-visit clinical intake has already been submitted for this appointment and cannot be overwritten.'
            ], 409);
        }

        // Sanitize clinical inputs: strip HTML tags
        $stripHtml = static fn($v) => ($v !== null) ? trim(strip_tags((string)$v)) : '';

        $intakeData = [
            'visit_reason' => $stripHtml($input['visit_reason'] ?? $input['visitReason'] ?? 'Routine pre-visit consultation'),
            'symptom_duration' => $stripHtml($input['symptom_duration'] ?? $input['symptomDuration'] ?? ''),
            'existing_conditions' => $stripHtml($input['existing_conditions'] ?? $input['existingConditions'] ?? ''),
            'current_medicines' => $stripHtml($input['current_medicines'] ?? $input['currentMedicines'] ?? ''),
            'known_allergies' => $stripHtml($input['known_allergies'] ?? $input['knownAllergies'] ?? ''),
            'general_notes' => $stripHtml($input['general_notes'] ?? $input['intakeNotes'] ?? $input['intake_notes'] ?? ''),
        ];

        $saved = AppointmentModel::saveIntake($appointmentId, $intakeData);

        if ($saved) {
            Auth::jsonResponse([
                'success' => true,
                'message' => 'Smart Pre-Visit Intake Form submitted successfully.',
                'appointment' => [
                    'id' => $appointmentId,
                    'reference_code' => $matched['reference_code'],
                    'has_intake' => true,
                    'intake_completed' => true,
                    'intake_submitted_at' => date('Y-m-d H:i:s'),
                ]
            ]);
        } else {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'save_failed',
                'message' => 'Unable to save pre-visit intake data.'
            ], 500);
        }
    }

    /**
     * Sanitizes appointment data to ensure zero disclosure of sensitive clinical
     * intake or pre-visit medical history to any non-clinical staff roles.
     * All current roles (super_admin, admin, receptionist, editor) are operational only.
     * Returns operational appointment fields and intake completion status boolean/string.
     */
    public static function filterOperationalFields(array $app): array
    {
        $hasIntake = !empty($app['has_intake']) || !empty($app['intake_submitted_at']) || !empty($app['visit_reason']) || !empty($app['existing_conditions']);
        $intakeSubmittedAt = $app['intake_submitted_at'] ?? ($hasIntake ? ($app['updated_at'] ?? $app['created_at'] ?? null) : null);

        $filtered = [
            'id' => (int)($app['id'] ?? 0),
            'reference_code' => (string)($app['reference_code'] ?? ''),
            'patient_name' => (string)($app['patient_name'] ?? ''),
            'patient_phone' => (string)($app['patient_phone'] ?? ''),
            'patient_email' => !empty($app['patient_email']) ? (string)$app['patient_email'] : null,
            'appointment_type' => (string)($app['appointment_type'] ?? 'in-clinic'),
            'preferred_date' => (string)($app['preferred_date'] ?? ''),
            'preferred_time_slot' => (string)($app['preferred_time_slot'] ?? ''),
            'status' => (string)($app['status'] ?? 'pending'),
            'created_at' => $app['created_at'] ?? null,
            'updated_at' => $app['updated_at'] ?? null,
            'has_intake' => (bool)$hasIntake,
            'intake_completed' => (bool)$hasIntake,
            'intake_submitted_at' => $intakeSubmittedAt,
        ];

        if (isset($app['history']) && is_array($app['history'])) {
            $filtered['history'] = $app['history'];
        }
        if (isset($app['staff_notes']) && is_array($app['staff_notes'])) {
            $filtered['staff_notes'] = $app['staff_notes'];
        }
        if (isset($app['admin_notes'])) {
            $filtered['admin_notes'] = $app['admin_notes'];
        }
        if (isset($app['rescheduled_date'])) {
            $filtered['rescheduled_date'] = $app['rescheduled_date'];
        }
        if (isset($app['rescheduled_time_slot'])) {
            $filtered['rescheduled_time_slot'] = $app['rescheduled_time_slot'];
        }

        return $filtered;
    }

    /**
     * Authenticated: List all appointments
     * Allowed Roles: receptionist, admin, super_admin, clinician. Editor is denied (403).
     */
    public function list(): void
    {
        $user = Auth::requireRole([
            Auth::ROLE_RECEPTIONIST, 
            Auth::ROLE_ADMIN, 
            Auth::ROLE_SUPER_ADMIN,
            Auth::ROLE_CLINICIAN
        ]);

        $status = (string)($_GET['status'] ?? 'all');
        $limit = min(500, max(1, (int)($_GET['limit'] ?? 100)));

        $appointments = AppointmentModel::getAll($status, $limit);

        // Enforce strict operational field allowlisting across all operational listings.
        // Full clinical history is accessed exclusively via the dedicated /clinical endpoint by clinicians.
        $sanitizedAppointments = array_map([self::class, 'filterOperationalFields'], $appointments);

        Auth::jsonResponse([
            'success' => true,
            'appointments' => $sanitizedAppointments
        ]);
    }

    /**
     * Authenticated: Get single appointment (operational view)
     * Allowed Roles: receptionist, admin, super_admin, clinician. Editor is denied (403).
     */
    public function get(int $id): void
    {
        $user = Auth::requireRole([
            Auth::ROLE_RECEPTIONIST,
            Auth::ROLE_ADMIN,
            Auth::ROLE_SUPER_ADMIN,
            Auth::ROLE_CLINICIAN,
        ]);

        $app = AppointmentModel::getById($id);
        if (!$app) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'not_found',
                'message' => 'Appointment record not found.'
            ], 404);
        }

        Auth::jsonResponse([
            'success' => true,
            'appointment' => self::filterOperationalFields($app)
        ]);
    }

    /**
     * Clinician Role ONLY: Access full decrypted sensitive clinical intake data.
     * Strictly restricted to ROLE_CLINICIAN.
     * super_admin, admin, receptionist, and editor receive 403 Forbidden.
     * Records security audit event without logging sensitive PHI.
     */
    public function getClinicalIntake(int $id): void
    {
        $user = Auth::requireClinician();

        $app = AppointmentModel::getById($id);
        if (!$app) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'not_found',
                'message' => 'Appointment record not found.'
            ], 404);
        }

        $intake = AppointmentModel::getIntake($id, true);

        // Security audit logging for clinical record access (Strictly NO PHI logged)
        Auth::recordAuditEvent('clinical_intake_viewed', 'appointment', (string)$id, [
            'clinician_id' => $user['id'],
            'has_intake' => (bool)$intake,
        ]);

        $clinicalData = [
            'id' => (int)$app['id'],
            'reference_code' => (string)$app['reference_code'],
            'patient_name' => (string)$app['patient_name'],
            'patient_phone' => (string)$app['patient_phone'],
            'patient_email' => $app['patient_email'] ?? null,
            'appointment_type' => (string)$app['appointment_type'],
            'preferred_date' => (string)$app['preferred_date'],
            'preferred_time_slot' => (string)$app['preferred_time_slot'],
            'status' => (string)$app['status'],
            'reason_category' => $app['reason_category'] ?? null,
            'communication_preference' => $app['communication_preference'] ?? null,
            'patient_notes' => $app['patient_notes'] ?? null,
            'admin_notes' => $app['admin_notes'] ?? null,
            'created_at' => $app['created_at'] ?? null,
            'updated_at' => $app['updated_at'] ?? null,
            'intake' => $intake ? [
                'id' => (int)$intake['id'],
                'appointment_id' => (int)$intake['appointment_id'],
                'visit_reason' => $intake['visit_reason'] ?? null,
                'symptom_duration' => $intake['symptom_duration'] ?? null,
                'existing_conditions' => $intake['existing_conditions'] ?? null,
                'current_medicines' => $intake['current_medicines'] ?? null,
                'known_allergies' => $intake['known_allergies'] ?? null,
                'intake_notes' => $intake['general_notes'] ?? null,
                'is_encrypted' => (bool)($intake['is_encrypted'] ?? false),
                'created_at' => $intake['created_at'] ?? null,
            ] : null,
            'visit_reason' => $intake['visit_reason'] ?? null,
            'symptom_duration' => $intake['symptom_duration'] ?? null,
            'existing_conditions' => $intake['existing_conditions'] ?? null,
            'current_medicines' => $intake['current_medicines'] ?? null,
            'known_allergies' => $intake['known_allergies'] ?? null,
            'intake_notes' => $intake['general_notes'] ?? null,
            'has_intake' => (bool)$intake,
            'intake_completed' => (bool)$intake,
            'intake_submitted_at' => $intake['created_at'] ?? null,
            'history' => $app['history'] ?? [],
            'staff_notes' => $app['staff_notes'] ?? []
        ];

        Auth::jsonResponse([
            'success' => true,
            'appointment' => $clinicalData
        ]);
    }

    /**
     * Admin: Update Appointment Status
     * Allowed Roles: receptionist, admin, super_admin, clinician. Editor is denied (403).
     * Requires CSRF token.
     */
    public function updateStatus(?int $routeId = null): void
    {
        $user = Auth::requireRole([
            Auth::ROLE_RECEPTIONIST, 
            Auth::ROLE_ADMIN, 
            Auth::ROLE_SUPER_ADMIN,
            Auth::ROLE_CLINICIAN
        ]);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $writableFields = ['status', 'notes', 'appointment_id', 'id'];
        $filtered = array_intersect_key($input, array_flip($writableFields));

        // Check for conflicting path ID vs body ID (canonical route enforcement)
        $bodyId = isset($filtered['appointment_id']) ? (int)$filtered['appointment_id'] : (isset($filtered['id']) ? (int)$filtered['id'] : null);
        if ($routeId !== null && $bodyId !== null && $bodyId !== $routeId) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Path appointment ID conflicts with body appointment ID.'
            ], 400);
        }

        $id = $routeId !== null ? $routeId : ($bodyId ?? 0);
        $newStatus = (string)($filtered['status'] ?? '');
        $notes = !empty($filtered['notes']) ? (string)$filtered['notes'] : null;
        $changedBy = $user['name'] . ' (' . ucfirst(str_replace('_', ' ', $user['role'])) . ')';

        if (!$id || !isset(Config::ALL_STATUSES[$newStatus])) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Invalid appointment ID or status.'
            ], 400);
        }

        // Exact record-level authorization and existence verification
        // Single-clinic scope: all appointments belong to Dr. Farhan Mustafa clinic practice.
        $existing = AppointmentModel::getById($id);
        if (!$existing) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'not_found',
                'message' => 'Appointment record not found.'
            ], 404);
        }

        $updated = AppointmentModel::updateStatus($id, $newStatus, $notes, $changedBy);

        if ($updated) {
            Auth::recordAuditEvent('appointment_status_updated', 'appointment', (string)$id, [
                'new_status' => $newStatus,
                'notes' => $notes
            ]);
            $appointment = AppointmentModel::getById($id);
            if ($appointment && in_array($newStatus, ['confirmed', 'rescheduled', 'cancelled'])) {
                Mailer::sendAppointmentNotification($newStatus, $appointment);
            }
            Auth::jsonResponse([
                'success' => true,
                'message' => "Appointment status updated to {$newStatus}.",
                'appointment' => $appointment ? self::filterOperationalFields($appointment) : null
            ]);
        } else {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'update_failed',
                'message' => 'Failed to update appointment status.'
            ], 500);
        }
    }

    /**
     * Admin: Add Internal Staff Note
     * Allowed Roles: receptionist, admin, super_admin, clinician. Editor is denied (403).
     * Requires CSRF token.
     */
    public function addNote(?int $routeId = null): void
    {
        $user = Auth::requireRole([
            Auth::ROLE_RECEPTIONIST, 
            Auth::ROLE_ADMIN, 
            Auth::ROLE_SUPER_ADMIN,
            Auth::ROLE_CLINICIAN
        ]);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $writableFields = ['note', 'appointment_id', 'id'];
        $filtered = array_intersect_key($input, array_flip($writableFields));

        // Check for conflicting path ID vs body ID (canonical route enforcement)
        $bodyId = isset($filtered['appointment_id']) ? (int)$filtered['appointment_id'] : (isset($filtered['id']) ? (int)$filtered['id'] : null);
        if ($routeId !== null && $bodyId !== null && $bodyId !== $routeId) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Path appointment ID conflicts with body appointment ID.'
            ], 400);
        }

        $id = $routeId !== null ? $routeId : ($bodyId ?? 0);
        $staffName = $user['name'];
        $note = trim((string)($filtered['note'] ?? ''));

        if (!$id || empty($note)) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Appointment ID and note text are required.'
            ], 400);
        }

        // Exact record-level authorization and existence verification
        // Single-clinic scope: all appointments belong to Dr. Farhan Mustafa clinic practice.
        $existing = AppointmentModel::getById($id);
        if (!$existing) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'not_found',
                'message' => 'Appointment record not found.'
            ], 404);
        }

        $saved = AppointmentModel::addStaffNote($id, $staffName, $note);

        if ($saved) {
            Auth::recordAuditEvent('appointment_note_added', 'appointment', (string)$id, [
                'staff_name' => $staffName
            ]);
            Auth::jsonResponse([
                'success' => true,
                'staff_notes' => AppointmentModel::getStaffNotes($id)
            ]);
        } else {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'save_failed',
                'message' => 'Failed to save staff note.'
            ], 500);
        }
    }

    /**
     * Manage Blocked Slots (Add)
     * Allowed Roles: admin, super_admin. Receptionist and Editor denied (403).
     * Requires CSRF token.
     */
    public function addBlockedSlot(): void
    {
        Auth::requireRole([Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $allowed = ['date', 'block_date', 'start_time', 'end_time', 'reason'];
        $filtered = array_intersect_key($input, array_flip($allowed));

        $date = (string)($filtered['date'] ?? $filtered['block_date'] ?? '');
        $startTime = (string)($filtered['start_time'] ?? '');
        $endTime = (string)($filtered['end_time'] ?? '');
        $reason = (string)($filtered['reason'] ?? 'Blocked by clinic administration');

        if (empty($date) || empty($startTime) || empty($endTime)) {
            Auth::jsonResponse([
                'success' => false,
                'error' => 'validation_error',
                'message' => 'Date, start time, and end time are required.'
            ], 400);
        }

        $ok = ScheduleModel::addBlockedSlot($date, $startTime, $endTime, $reason);
        if ($ok) {
            Auth::recordAuditEvent('schedule_blocked_slot_added', 'schedule', null, ['date' => $date, 'reason' => $reason]);
            Auth::jsonResponse(['success' => true, 'message' => 'Blocked slot added successfully.']);
        } else {
            Auth::jsonResponse(['success' => false, 'error' => 'save_failed', 'message' => 'Failed to add blocked slot.'], 500);
        }
    }

    /**
     * Manage Blocked Slots (Delete)
     * Allowed Roles: admin, super_admin.
     * Requires CSRF token.
     */
    public function deleteBlockedSlot(int $id): void
    {
        Auth::requireRole([Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);
        Auth::requireCsrf();

        if ($id <= 0) {
            Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Invalid slot ID.'], 400);
        }

        // Exact record-level authorization and existence verification
        $existing = ScheduleModel::getBlockedSlotById($id);
        if (!$existing) {
            Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Blocked slot not found.'], 404);
        }

        $ok = ScheduleModel::deleteBlockedSlot($id);
        if ($ok) {
            Auth::recordAuditEvent('schedule_blocked_slot_deleted', 'schedule', (string)$id);
            Auth::jsonResponse(['success' => true, 'message' => 'Blocked slot removed successfully.']);
        } else {
            Auth::jsonResponse(['success' => false, 'error' => 'delete_failed', 'message' => 'Failed to delete blocked slot.'], 500);
        }
    }

    /**
     * Manage Clinic Holidays (Add)
     * Allowed Roles: admin, super_admin.
     * Requires CSRF token.
     */
    public function addHoliday(): void
    {
        Auth::requireRole([Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $allowed = ['holiday_date', 'date', 'title', 'description'];
        $filtered = array_intersect_key($input, array_flip($allowed));

        $date = (string)($filtered['holiday_date'] ?? $filtered['date'] ?? '');
        $title = (string)($filtered['title'] ?? 'Clinic Closed');
        $desc = !empty($filtered['description']) ? (string)$filtered['description'] : null;

        if (empty($date) || empty($title)) {
            Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Date and title are required.'], 400);
        }

        $ok = ScheduleModel::addHoliday($date, $title, $desc);
        if ($ok) {
            Auth::recordAuditEvent('schedule_holiday_added', 'schedule', null, ['date' => $date, 'title' => $title]);
            Auth::jsonResponse(['success' => true, 'message' => 'Clinic holiday added successfully.']);
        } else {
            Auth::jsonResponse(['success' => false, 'error' => 'save_failed', 'message' => 'Failed to add holiday.'], 500);
        }
    }

    /**
     * Export appointments in operational format (CSV or JSON).
     * Allowed Roles: receptionist, admin, super_admin, clinician. Editor is denied (403).
     * Strictly operational fields only. Clinical intake narrative content is never exported.
     */
    public function export(): void
    {
        $user = Auth::requireRole([
            Auth::ROLE_RECEPTIONIST,
            Auth::ROLE_ADMIN,
            Auth::ROLE_SUPER_ADMIN,
            Auth::ROLE_CLINICIAN
        ]);

        $status = (string)($_GET['status'] ?? 'all');
        $format = strtolower((string)($_GET['format'] ?? 'json'));

        $appointments = AppointmentModel::getAll($status, 1000);
        $operationalList = array_map([self::class, 'filterOperationalFields'], $appointments);

        Auth::recordAuditEvent('appointments_exported', 'appointment', null, [
            'format' => $format,
            'count' => count($operationalList),
            'status_filter' => $status
        ]);

        if ($format === 'csv') {
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename=appointments_' . date('Ymd_His') . '.csv');
            $out = fopen('php://output', 'w');
            fputcsv($out, [
                'ID', 'Reference Code', 'Patient Name', 'Phone', 'Email',
                'Type', 'Date', 'Time Slot', 'Status', 'Has Intake', 'Created At'
            ]);
            foreach ($operationalList as $row) {
                fputcsv($out, [
                    $row['id'],
                    $row['reference_code'],
                    $row['patient_name'],
                    $row['patient_phone'],
                    $row['patient_email'] ?? '',
                    $row['appointment_type'],
                    $row['preferred_date'],
                    $row['preferred_time_slot'],
                    $row['status'],
                    $row['has_intake'] ? 'Yes' : 'No',
                    $row['created_at'] ?? ''
                ]);
            }
            fclose($out);
            exit;
        }

        Auth::jsonResponse([
            'success' => true,
            'count' => count($operationalList),
            'appointments' => $operationalList
        ]);
    }

    /**
     * Printable Appointment Slip (operational view by default)
     * Allowed Roles: receptionist, admin, super_admin, clinician. Editor is denied (403).
     */
    public function printAppointment(int $id): void
    {
        $user = Auth::requireRole([
            Auth::ROLE_RECEPTIONIST,
            Auth::ROLE_ADMIN,
            Auth::ROLE_SUPER_ADMIN,
            Auth::ROLE_CLINICIAN
        ]);

        $app = AppointmentModel::getById($id);
        if (!$app) {
            Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Appointment record not found.'], 404);
        }

        // Only clinician role gets intake narratives in print format if specifically requested
        $isClinician = ($user['role'] === Auth::ROLE_CLINICIAN);
        $data = self::filterOperationalFields($app);

        if ($isClinician && !empty($_GET['include_clinical'])) {
            $intake = AppointmentModel::getIntake($id, true);
            if ($intake) {
                $data['clinical_intake'] = $intake;
            }
            Auth::recordAuditEvent('appointment_printed_with_clinical', 'appointment', (string)$id);
        } else {
            Auth::recordAuditEvent('appointment_printed_operational', 'appointment', (string)$id);
        }

        Auth::jsonResponse([
            'success' => true,
            'appointment' => $data
        ]);
    }

    /**
     * Get Appointment Audit History
     * Allowed Roles: receptionist, admin, super_admin, clinician. Editor is denied (403).
     */
    public function getHistory(int $id): void
    {
        $user = Auth::requireRole([
            Auth::ROLE_RECEPTIONIST,
            Auth::ROLE_ADMIN,
            Auth::ROLE_SUPER_ADMIN,
            Auth::ROLE_CLINICIAN
        ]);

        $existing = AppointmentModel::getById($id);
        if (!$existing) {
            Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Appointment record not found.'], 404);
        }

        $history = AppointmentModel::getHistory($id);
        Auth::jsonResponse([
            'success' => true,
            'appointment_id' => $id,
            'history' => $history
        ]);
    }

    /**
     * Mark Pre-Visit Clinical Intake as Reviewed
     * Restricted strictly to Treating Clinician (ROLE_CLINICIAN).
     * super_admin, admin, receptionist, and editor receive 403 Forbidden.
     * Requires CSRF token.
     */
    public function reviewClinicalIntake(int $id): void
    {
        $user = Auth::requireClinician();
        Auth::requireCsrf();

        $app = AppointmentModel::getById($id);
        if (!$app) {
            Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Appointment record not found.'], 404);
        }

        $intake = AppointmentModel::getIntake($id, false);
        if (!$intake) {
            Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'No clinical intake found for this appointment.'], 404);
        }

        $reviewed = AppointmentModel::markIntakeReviewed($id, $user['name'], (int)$user['id']);

        if ($reviewed) {
            Auth::recordAuditEvent('clinical_intake_reviewed', 'appointment', (string)$id, [
                'clinician_id' => $user['id'],
                'clinician_name' => $user['name']
            ]);

            Auth::jsonResponse([
                'success' => true,
                'message' => 'Clinical intake marked as reviewed.',
                'reviewed_at' => date('Y-m-d H:i:s'),
                'reviewed_by' => $user['name']
            ]);
        } else {
            Auth::jsonResponse(['success' => false, 'error' => 'save_failed', 'message' => 'Failed to mark intake as reviewed.'], 500);
        }
    }

    /**
     * Get all appointment types
     */
    public function getTypes(): void
    {
        header('Content-Type: application/json');
        echo json_encode(ScheduleModel::getAppointmentTypes());
    }

    /**
     * Get availability configuration rules, breaks, holidays, blocked slots
     */
    public function getRules(): void
    {
        header('Content-Type: application/json');
        echo json_encode([
            'rules' => ScheduleModel::getAvailabilityRules(),
            'breaks' => ScheduleModel::getClinicBreaks(),
            'holidays' => ScheduleModel::getClinicHolidays(),
            'blocked_slots' => ScheduleModel::getBlockedSlots(),
            'timezone' => Config::TIMEZONE,
            'timezone_label' => Config::TIMEZONE_LABEL
        ]);
    }
}
