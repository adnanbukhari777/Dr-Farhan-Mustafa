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
     * Handle public booking request
     */
    public function book(): void
    {
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
        header('Content-Type: application/json');

        $date = $_GET['date'] ?? date('Y-m-d');
        $type = $_GET['type'] ?? 'in-clinic';

        $slots = ScheduleModel::getAvailableSlots($date, $type);
        echo json_encode($slots);
    }

    /**
     * Protected Patient Appointment Lookup
     */
    public function lookup(): void
    {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $ref = $input['reference_code'] ?? '';
        $phone = $input['patient_phone'] ?? '';

        if (empty($ref) || empty($phone)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Both Reference Code and Phone Number are required.']);
            return;
        }

        $appointment = AppointmentModel::lookup($ref, $phone);

        if (!$appointment) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'No appointment found matching this Reference Code and Phone Number.']);
            return;
        }

        echo json_encode(['success' => true, 'appointment' => $appointment]);
    }

    /**
     * Patient Reschedule Request
     */
    public function reschedule(): void
    {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($input['appointment_id'] ?? 0);
        $newDate = $input['new_date'] ?? '';
        $newSlot = $input['new_time_slot'] ?? '';
        $reason = $input['reason'] ?? 'Patient requested rescheduling';

        if (!$id || empty($newDate) || empty($newSlot)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Appointment ID, new date, and new time slot are required.']);
            return;
        }

        $result = AppointmentModel::reschedule($id, $newDate, $newSlot, $reason, 'Patient');

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
     */
    public function cancel(): void
    {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($input['appointment_id'] ?? 0);
        $reason = $input['reason'] ?? 'Cancelled by patient';

        if (!$id || empty($reason)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Appointment ID and cancellation reason are required.']);
            return;
        }

        $result = AppointmentModel::cancel($id, $reason, 'Patient');

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
     */
    public function saveIntake(): void
    {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $appointmentId = (int)($input['appointment_id'] ?? 0);

        if (!$appointmentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Valid appointment ID is required.']);
            return;
        }

        $saved = AppointmentModel::saveIntake($appointmentId, $input);

        if ($saved) {
            // Also log to history
            $hist = AppointmentModel::getHistory($appointmentId);
            $app = AppointmentModel::getById($appointmentId);
            echo json_encode(['success' => true, 'message' => 'Smart Pre-Visit Intake Form submitted successfully.', 'appointment' => $app]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Unable to save pre-visit intake data.']);
        }
    }

    /**
     * Admin: Update Appointment Status
     */
    public function updateStatus(): void
    {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($input['appointment_id'] ?? 0);
        $newStatus = $input['status'] ?? '';
        $notes = $input['notes'] ?? null;
        $changedBy = $input['changed_by'] ?? 'Staff Reception';

        if (!$id || !isset(Config::ALL_STATUSES[$newStatus])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid appointment ID or status.']);
            return;
        }

        $updated = AppointmentModel::updateStatus($id, $newStatus, $notes, $changedBy);

        if ($updated) {
            $appointment = AppointmentModel::getById($id);
            if ($appointment && in_array($newStatus, ['confirmed', 'rescheduled', 'cancelled'])) {
                Mailer::sendAppointmentNotification($newStatus, $appointment);
            }
            echo json_encode(['success' => true, 'message' => "Appointment status updated to {$newStatus}.", 'appointment' => $appointment]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update appointment status.']);
        }
    }

    /**
     * Admin: Add Internal Staff Note
     */
    public function addNote(): void
    {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = (int)($input['appointment_id'] ?? 0);
        $staffName = $input['staff_name'] ?? 'Front Desk Staff';
        $note = $input['note'] ?? '';

        if (!$id || empty($note)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Appointment ID and note text are required.']);
            return;
        }

        $saved = AppointmentModel::addStaffNote($id, $staffName, $note);

        if ($saved) {
            echo json_encode(['success' => true, 'staff_notes' => AppointmentModel::getStaffNotes($id)]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save staff note.']);
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
