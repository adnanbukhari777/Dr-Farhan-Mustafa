<?php
/**
 * Appointments & Patient Bookings Model (Phase 3)
 * Full transaction safety, double-booking prevention, 7 statuses,
 * audit history trail, staff notes, and smart pre-visit intake support.
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use App\Config\Config;
use App\Security\Crypto;
use PDO;

class AppointmentModel
{
    public const CANONICAL_STATUSES = [
        Config::STATUS_NEW,
        Config::STATUS_CONFIRMED,
        Config::STATUS_RESCHEDULED,
        Config::STATUS_CHECKED_IN,
        Config::STATUS_COMPLETED,
        Config::STATUS_CANCELLED,
        Config::STATUS_NO_SHOW,
    ];

    public const VALID_TRANSITIONS = [
        Config::STATUS_NEW => [
            Config::STATUS_CONFIRMED,
            Config::STATUS_RESCHEDULED,
            Config::STATUS_CHECKED_IN,
            Config::STATUS_CANCELLED,
            Config::STATUS_NO_SHOW,
        ],
        Config::STATUS_CONFIRMED => [
            Config::STATUS_CHECKED_IN,
            Config::STATUS_RESCHEDULED,
            Config::STATUS_CANCELLED,
            Config::STATUS_NO_SHOW,
            Config::STATUS_COMPLETED,
        ],
        Config::STATUS_RESCHEDULED => [
            Config::STATUS_CONFIRMED,
            Config::STATUS_CHECKED_IN,
            Config::STATUS_RESCHEDULED,
            Config::STATUS_CANCELLED,
            Config::STATUS_NO_SHOW,
            Config::STATUS_COMPLETED,
        ],
        Config::STATUS_CHECKED_IN => [
            Config::STATUS_COMPLETED,
            Config::STATUS_RESCHEDULED,
            Config::STATUS_CANCELLED,
            Config::STATUS_NO_SHOW,
        ],
        Config::STATUS_COMPLETED => [
            Config::STATUS_RESCHEDULED,
            Config::STATUS_CANCELLED,
            Config::STATUS_NO_SHOW,
        ],
        Config::STATUS_CANCELLED => [
            Config::STATUS_RESCHEDULED,
            Config::STATUS_NO_SHOW,
        ],
        Config::STATUS_NO_SHOW => [
            Config::STATUS_RESCHEDULED,
            Config::STATUS_CANCELLED,
        ],
    ];

    /**
     * Validate whether a status transition is permitted under the 7-state lifecycle
     */
    public static function isValidStatusTransition(string $currentStatus, string $newStatus): bool
    {
        if (!in_array($newStatus, self::CANONICAL_STATUSES, true)) {
            return false;
        }
        if ($currentStatus === $newStatus) {
            return true;
        }
        $allowed = self::VALID_TRANSITIONS[$currentStatus] ?? [];
        return in_array($newStatus, $allowed, true);
    }

    /**
     * Create a new appointment booking with transaction-safe double booking check
     */
    public static function create(array $data): array
    {
        $db = Database::getConnection();
        if (!$db) {
            return ['success' => false, 'message' => 'Database connection unavailable.'];
        }

        // Required fields check
        if (empty($data['patient_name']) || empty($data['patient_phone']) || empty($data['preferred_date']) || empty($data['preferred_time_slot'])) {
            return ['success' => false, 'message' => 'Please provide patient name, phone, date, and preferred time slot.'];
        }

        $date = trim($data['preferred_date']);
        $slot = trim($data['preferred_time_slot']);

        try {
            $db->beginTransaction();

            // 1. Check for Holiday
            $holStmt = $db->prepare("SELECT title FROM clinic_holidays WHERE holiday_date = :hdate AND is_closed = 1 LIMIT 1");
            $holStmt->execute([':hdate' => $date]);
            $holiday = $holStmt->fetch();
            if ($holiday) {
                $db->rollBack();
                return [
                    'success' => false,
                    'message' => "The clinic is closed on {$date} for {$holiday['title']}. Please select an alternate date."
                ];
            }

            // 2. Check for Blocked Slot
            $slotParts = explode('-', $slot);
            $slotStart = trim($slotParts[0]);
            $slotStartTime = date('H:i:s', strtotime($slotStart) ?: strtotime($slot));

            $blockStmt = $db->prepare("
                SELECT reason FROM blocked_slots 
                WHERE block_date = :bdate 
                AND :slot_start >= start_time AND :slot_end < end_time 
                LIMIT 1
            ");
            $blockStmt->execute([
                ':bdate' => $date, 
                ':slot_start' => $slotStartTime,
                ':slot_end' => $slotStartTime
            ]);
            $blocked = $blockStmt->fetch();
            if ($blocked) {
                $db->rollBack();
                return [
                    'success' => false,
                    'message' => "This time slot on {$date} is reserved for doctor rounds/CME: {$blocked['reason']}. Please pick another time."
                ];
            }

            // 3. Prevent Double Booking via Row Lock (FOR UPDATE)
            $checkStmt = $db->prepare("
                SELECT COUNT(*) as booked_count 
                FROM appointments 
                WHERE preferred_date = :pdate 
                AND preferred_time_slot = :tslot 
                AND status NOT IN ('cancelled', 'no_show')
                FOR UPDATE
            ");
            $checkStmt->execute([':pdate' => $date, ':tslot' => $slot]);
            $bookedCount = (int)$checkStmt->fetchColumn();

            if ($bookedCount >= 1) {
                $db->rollBack();
                return [
                    'success' => false,
                    'is_double_booking' => true,
                    'message' => "The slot {$slot} on {$date} has already been reserved. Please select another available time slot."
                ];
            }

            // 4. Generate Unique Reference Code (DFM-2026-XXXX)
            $randNum = mt_rand(1000, 9999);
            $referenceCode = 'DFM-2026-' . $randNum;

            // Ensure reference uniqueness
            $refCheck = $db->prepare("SELECT id FROM appointments WHERE reference_code = :ref LIMIT 1");
            $refCheck->execute([':ref' => $referenceCode]);
            if ($refCheck->fetch()) {
                $referenceCode = 'DFM-2026-' . mt_rand(10000, 99999);
            }

            // 5. Insert Appointment (Initial Status: 'new')
            $stmt = $db->prepare("
                INSERT INTO appointments (
                    reference_code, patient_name, patient_phone, patient_email, 
                    appointment_type, preferred_date, preferred_time_slot, 
                    reason_category, patient_notes, communication_preference, status
                ) VALUES (
                    :ref, :name, :phone, :email, 
                    :type, :pdate, :tslot, 
                    :reason, :notes, :comm, 'new'
                )
            ");

            $stmt->execute([
                ':ref' => $referenceCode,
                ':name' => $data['patient_name'],
                ':phone' => $data['patient_phone'],
                ':email' => $data['patient_email'] ?? null,
                ':type' => $data['appointment_type'] ?? 'in-clinic',
                ':pdate' => $date,
                ':tslot' => $slot,
                ':reason' => $data['reason_category'] ?? 'General Consultation',
                ':notes' => $data['patient_notes'] ?? null,
                ':comm' => $data['communication_preference'] ?? 'whatsapp',
            ]);

            $appointmentId = (int)$db->lastInsertId();

            // 6. Record Initial Status in History Log
            $histStmt = $db->prepare("
                INSERT INTO appointment_history (
                    appointment_id, previous_status, new_status, action_type, notes, changed_by
                ) VALUES (
                    :app_id, NULL, 'new', 'created', 'Appointment request submitted online by patient.', 'Patient Portal'
                )
            ");
            $histStmt->execute([':app_id' => $appointmentId]);

            // 7. Insert Intake Record if provided during booking (Encrypted at Rest with AES-256-GCM)
            $visitReason = $data['visit_reason'] ?? ($data['intake_visit_reason'] ?? null);
            $duration = $data['symptom_duration'] ?? ($data['intake_symptom_duration'] ?? null);
            $conditions = $data['existing_conditions'] ?? ($data['intake_existing_conditions'] ?? null);
            $meds = $data['current_medicines'] ?? ($data['intake_current_medicines'] ?? null);
            $allergies = $data['known_allergies'] ?? ($data['intake_known_allergies'] ?? null);
            $gNotes = $data['general_notes'] ?? ($data['intake_general_notes'] ?? ($data['intake_notes'] ?? null));

            if ($visitReason || $meds || $conditions || $allergies || $duration || $gNotes) {
                $intakeStmt = $db->prepare("
                    INSERT INTO patient_intakes (
                        appointment_id, visit_reason, symptom_duration, 
                        existing_conditions, current_medicines, known_allergies, general_notes, is_encrypted
                    ) VALUES (
                        :app_id, :v_reason, :duration, 
                        :conditions, :meds, :allergies, :g_notes, 1
                    )
                ");

                $intakeStmt->execute([
                    ':app_id' => $appointmentId,
                    ':v_reason' => Crypto::encrypt($visitReason ?? ($data['reason_category'] ?? 'General Consultation')),
                    ':duration' => Crypto::encrypt($duration),
                    ':conditions' => Crypto::encrypt($conditions),
                    ':meds' => Crypto::encrypt($meds),
                    ':allergies' => Crypto::encrypt($allergies),
                    ':g_notes' => Crypto::encrypt($gNotes),
                ]);
            }

            $db->commit();

            return [
                'success' => true,
                'appointment_id' => $appointmentId,
                'reference_code' => $referenceCode,
                'status' => 'new',
                'preferred_date' => $date,
                'preferred_time_slot' => $slot,
                'message' => 'Appointment request submitted with status "New". Our clinic coordinator will review slot availability and confirm your consultation.'
            ];
        } catch (\Exception $e) {
            $db->rollBack();
            error_log("Appointment booking error: " . $e->getMessage());
            return ['success' => false, 'message' => 'Unable to submit appointment. Error: ' . $e->getMessage()];
        }
    }

    /**
     * Get all appointments with optional filter
     */
    public static function getAll(string $statusFilter = 'all', int $limit = 100): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $sql = "SELECT a.*, 
                       pi.visit_reason, pi.symptom_duration, pi.existing_conditions, 
                       pi.current_medicines, pi.known_allergies, pi.general_notes as intake_notes,
                       pi.is_encrypted as intake_is_encrypted,
                       (CASE WHEN pi.id IS NOT NULL THEN 1 ELSE 0 END) as has_intake,
                       pi.created_at as intake_submitted_at
                FROM appointments a
                LEFT JOIN patient_intakes pi ON a.id = pi.appointment_id";

        $params = [];
        if ($statusFilter !== 'all') {
            $sql .= " WHERE a.status = :status";
            $params[':status'] = $statusFilter;
        }

        $sql .= " ORDER BY a.created_at DESC LIMIT " . (int)$limit;

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Attach history, staff notes, and transparently decrypt clinical fields
        foreach ($appointments as &$app) {
            $app['visit_reason'] = Crypto::decrypt($app['visit_reason'] ?? null);
            $app['symptom_duration'] = Crypto::decrypt($app['symptom_duration'] ?? null);
            $app['existing_conditions'] = Crypto::decrypt($app['existing_conditions'] ?? null);
            $app['current_medicines'] = Crypto::decrypt($app['current_medicines'] ?? null);
            $app['known_allergies'] = Crypto::decrypt($app['known_allergies'] ?? null);
            $app['intake_notes'] = Crypto::decrypt($app['intake_notes'] ?? null);
            $app['history'] = self::getHistory((int)$app['id']);
            $app['staff_notes'] = self::getStaffNotes((int)$app['id']);
        }

        return $appointments;
    }

    /**
     * Get single appointment by ID
     */
    public static function getById(int $id): ?array
    {
        $db = Database::getConnection();
        if (!$db) return null;

        $stmt = $db->prepare("
            SELECT a.*, 
                   pi.visit_reason, pi.symptom_duration, pi.existing_conditions, 
                   pi.current_medicines, pi.known_allergies, pi.general_notes as intake_notes,
                   pi.is_encrypted as intake_is_encrypted,
                   (CASE WHEN pi.id IS NOT NULL THEN 1 ELSE 0 END) as has_intake,
                   pi.created_at as intake_submitted_at
            FROM appointments a
            LEFT JOIN patient_intakes pi ON a.id = pi.appointment_id
            WHERE a.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $id]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$app) return null;

        $app['visit_reason'] = Crypto::decrypt($app['visit_reason'] ?? null);
        $app['symptom_duration'] = Crypto::decrypt($app['symptom_duration'] ?? null);
        $app['existing_conditions'] = Crypto::decrypt($app['existing_conditions'] ?? null);
        $app['current_medicines'] = Crypto::decrypt($app['current_medicines'] ?? null);
        $app['known_allergies'] = Crypto::decrypt($app['known_allergies'] ?? null);
        $app['intake_notes'] = Crypto::decrypt($app['intake_notes'] ?? null);
        $app['history'] = self::getHistory($id);
        $app['staff_notes'] = self::getStaffNotes($id);
        return $app;
    }

    /**
     * Lookup appointment by Reference Code and matching Phone number (Protected Lookup)
     */
    public static function lookup(string $referenceCode, string $phone): ?array
    {
        $db = Database::getConnection();
        if (!$db) return null;

        $cleanRef = strtoupper(trim($referenceCode));
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        $stmt = $db->prepare("
            SELECT a.*, 
                   pi.visit_reason, pi.symptom_duration, pi.existing_conditions, 
                   pi.current_medicines, pi.known_allergies, pi.general_notes as intake_notes,
                   pi.is_encrypted as intake_is_encrypted,
                   (CASE WHEN pi.id IS NOT NULL THEN 1 ELSE 0 END) as has_intake,
                   pi.created_at as intake_submitted_at
            FROM appointments a
            LEFT JOIN patient_intakes pi ON a.id = pi.appointment_id
            WHERE UPPER(a.reference_code) = :ref
            LIMIT 1
        ");
        $stmt->execute([':ref' => $cleanRef]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$app) return null;

        // Verify phone matches (last 7 digits match to handle formatting differences)
        $dbPhoneClean = preg_replace('/[^0-9]/', '', $app['patient_phone']);
        if (substr($dbPhoneClean, -7) !== substr($cleanPhone, -7)) {
            return null;
        }

        $app['visit_reason'] = Crypto::decrypt($app['visit_reason'] ?? null);
        $app['symptom_duration'] = Crypto::decrypt($app['symptom_duration'] ?? null);
        $app['existing_conditions'] = Crypto::decrypt($app['existing_conditions'] ?? null);
        $app['current_medicines'] = Crypto::decrypt($app['current_medicines'] ?? null);
        $app['known_allergies'] = Crypto::decrypt($app['known_allergies'] ?? null);
        $app['intake_notes'] = Crypto::decrypt($app['intake_notes'] ?? null);
        $app['history'] = self::getHistory((int)$app['id']);
        return $app;
    }

    /**
     * Update appointment status with audit history tracking and 7-state validation
     */
    public static function updateStatus(int $id, string $newStatus, ?string $notes = null, string $changedBy = 'Staff'): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $current = self::getById($id);
        if (!$current) return false;

        $prevStatus = $current['status'];

        if (!self::isValidStatusTransition($prevStatus, $newStatus)) {
            error_log("Invalid appointment status transition from {$prevStatus} to {$newStatus} for ID {$id}");
            return false;
        }

        try {
            $db->beginTransaction();

            $stmt = $db->prepare("
                UPDATE appointments SET 
                    status = :status, 
                    admin_notes = COALESCE(:notes, admin_notes),
                    updated_at = NOW() 
                WHERE id = :id
            ");

            $stmt->execute([
                ':status' => $newStatus,
                ':notes' => $notes,
                ':id' => $id
            ]);

            // Add history entry
            $histStmt = $db->prepare("
                INSERT INTO appointment_history (
                    appointment_id, previous_status, new_status, action_type, notes, changed_by
                ) VALUES (
                    :app_id, :prev_status, :new_status, :action, :hist_notes, :changed_by
                )
            ");

            $action = match ($newStatus) {
                'confirmed' => 'confirmed',
                'rescheduled' => 'rescheduled',
                'checked_in' => 'checked_in',
                'completed' => 'completed',
                'cancelled' => 'cancelled',
                'no_show' => 'no_show',
                default => 'note_added'
            };

            $histStmt->execute([
                ':app_id' => $id,
                ':prev_status' => $prevStatus,
                ':new_status' => $newStatus,
                ':action' => $action,
                ':hist_notes' => $notes ?? "Status updated from {$prevStatus} to {$newStatus}.",
                ':changed_by' => $changedBy
            ]);

            $db->commit();
            return true;
        } catch (\Exception $e) {
            $db->rollBack();
            error_log("Update status error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Reschedule appointment to a new date and time slot
     */
    public static function reschedule(int $id, string $newDate, string $newSlot, string $reason, string $changedBy = 'Patient'): array
    {
        $db = Database::getConnection();
        if (!$db) return ['success' => false, 'message' => 'Database error.'];

        try {
            $db->beginTransaction();

            // Check double booking for the target slot
            $checkStmt = $db->prepare("
                SELECT COUNT(*) FROM appointments 
                WHERE preferred_date = :pdate 
                AND preferred_time_slot = :tslot 
                AND id != :current_id
                AND status NOT IN ('cancelled', 'no_show')
                FOR UPDATE
            ");
            $checkStmt->execute([
                ':pdate' => $newDate,
                ':tslot' => $newSlot,
                ':current_id' => $id
            ]);
            if ((int)$checkStmt->fetchColumn() >= 1) {
                $db->rollBack();
                return ['success' => false, 'message' => "The slot {$newSlot} on {$newDate} is already booked. Please choose another slot."];
            }

            $current = self::getById($id);
            $oldSlotStr = "{$current['preferred_date']} ({$current['preferred_time_slot']})";

            $stmt = $db->prepare("
                UPDATE appointments SET 
                    preferred_date = :new_date,
                    preferred_time_slot = :new_slot,
                    rescheduled_date = :resch_date,
                    rescheduled_time_slot = :resch_slot,
                    status = 'rescheduled',
                    admin_notes = CONCAT(COALESCE(admin_notes, ''), '\n[Rescheduled]: ', :reason),
                    updated_at = NOW()
                WHERE id = :id
            ");
            $stmt->execute([
                ':new_date' => $newDate,
                ':new_slot' => $newSlot,
                ':resch_date' => $newDate,
                ':resch_slot' => $newSlot,
                ':reason' => $reason,
                ':id' => $id
            ]);

            // Add history
            $histStmt = $db->prepare("
                INSERT INTO appointment_history (
                    appointment_id, previous_status, new_status, action_type, notes, changed_by
                ) VALUES (
                    :app_id, :prev_status, 'rescheduled', 'rescheduled', :notes, :changed_by
                )
            ");
            $histStmt->execute([
                ':app_id' => $id,
                ':prev_status' => $current['status'],
                ':notes' => "Rescheduled from {$oldSlotStr} to {$newDate} {$newSlot}. Reason: {$reason}",
                ':changed_by' => $changedBy
            ]);

            $db->commit();
            return ['success' => true, 'status' => 'rescheduled', 'message' => "Appointment successfully rescheduled to {$newDate} at {$newSlot}."];
        } catch (\Exception $e) {
            $db->rollBack();
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Cancel an appointment with mandatory cancellation reason
     */
    public static function cancel(int $id, string $reason, string $changedBy = 'Patient'): array
    {
        $db = Database::getConnection();
        if (!$db) return ['success' => false, 'message' => 'Database error.'];

        try {
            $db->beginTransaction();

            $current = self::getById($id);
            if (!$current) {
                $db->rollBack();
                return ['success' => false, 'message' => 'Appointment not found.'];
            }

            $stmt = $db->prepare("
                UPDATE appointments SET 
                    status = 'cancelled',
                    cancellation_reason = :reason,
                    updated_at = NOW()
                WHERE id = :id
            ");
            $stmt->execute([':reason' => $reason, ':id' => $id]);

            // Add history
            $histStmt = $db->prepare("
                INSERT INTO appointment_history (
                    appointment_id, previous_status, new_status, action_type, notes, changed_by
                ) VALUES (
                    :app_id, :prev_status, 'cancelled', 'cancelled', :notes, :changed_by
                )
            ");
            $histStmt->execute([
                ':app_id' => $id,
                ':prev_status' => $current['status'],
                ':notes' => "Cancelled by {$changedBy}. Reason: {$reason}",
                ':changed_by' => $changedBy
            ]);

            $db->commit();
            return ['success' => true, 'status' => 'cancelled', 'message' => 'Appointment request has been cancelled.'];
        } catch (\Exception $e) {
            $db->rollBack();
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Add an internal staff note to an appointment
     */
    public static function addStaffNote(int $appointmentId, string $staffName, string $note, int $staffId = 0): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $stmt = $db->prepare("
            INSERT INTO staff_notes (appointment_id, staff_id, staff_name, note, is_internal)
            VALUES (:app_id, :staff_id, :staff_name, :note, 1)
        ");

        return $stmt->execute([
            ':app_id' => $appointmentId,
            ':staff_id' => $staffId,
            ':staff_name' => $staffName,
            ':note' => $note
        ]);
    }

    /**
     * Get patient clinical intake record for an appointment
     * Decrypts AES-256-GCM encrypted fields when $decrypt is true.
     */
    public static function getIntake(int $appointmentId, bool $decrypt = true): ?array
    {
        $db = Database::getConnection();
        if (!$db || $appointmentId <= 0) return null;

        $stmt = $db->prepare("SELECT * FROM patient_intakes WHERE appointment_id = :app_id LIMIT 1");
        $stmt->execute([':app_id' => $appointmentId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return null;

        if ($decrypt) {
            $row['visit_reason'] = Crypto::decrypt($row['visit_reason']);
            $row['symptom_duration'] = Crypto::decrypt($row['symptom_duration']);
            $row['existing_conditions'] = Crypto::decrypt($row['existing_conditions']);
            $row['current_medicines'] = Crypto::decrypt($row['current_medicines']);
            $row['known_allergies'] = Crypto::decrypt($row['known_allergies']);
            $row['general_notes'] = Crypto::decrypt($row['general_notes']);
        }

        return $row;
    }

    /**
     * Save / update pre-visit clinical intake data with AES-256-GCM encryption at rest
     */
    public static function saveIntake(int $appointmentId, array $intakeData): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $checkStmt = $db->prepare("SELECT id FROM patient_intakes WHERE appointment_id = :app_id LIMIT 1");
        $checkStmt->execute([':app_id' => $appointmentId]);
        $existingId = $checkStmt->fetchColumn();

        $vReason = Crypto::encrypt($intakeData['visit_reason'] ?? 'Routine consultation');
        $duration = Crypto::encrypt($intakeData['symptom_duration'] ?? null);
        $conditions = Crypto::encrypt($intakeData['existing_conditions'] ?? null);
        $meds = Crypto::encrypt($intakeData['current_medicines'] ?? null);
        $allergies = Crypto::encrypt($intakeData['known_allergies'] ?? null);
        $gNotes = Crypto::encrypt($intakeData['general_notes'] ?? ($intakeData['intake_notes'] ?? null));

        if ($existingId) {
            $stmt = $db->prepare("
                UPDATE patient_intakes SET
                    visit_reason = :v_reason,
                    symptom_duration = :duration,
                    existing_conditions = :conditions,
                    current_medicines = :meds,
                    known_allergies = :allergies,
                    general_notes = :g_notes,
                    is_encrypted = 1
                WHERE appointment_id = :app_id
            ");
        } else {
            $stmt = $db->prepare("
                INSERT INTO patient_intakes (
                    appointment_id, visit_reason, symptom_duration, 
                    existing_conditions, current_medicines, known_allergies, general_notes, is_encrypted
                ) VALUES (
                    :app_id, :v_reason, :duration, 
                    :conditions, :meds, :allergies, :g_notes, 1
                )
            ");
        }

        return $stmt->execute([
            ':app_id' => $appointmentId,
            ':v_reason' => $vReason,
            ':duration' => $duration,
            ':conditions' => $conditions,
            ':meds' => $meds,
            ':allergies' => $allergies,
            ':g_notes' => $gNotes,
        ]);
    }

    /**
     * One-time migration helper to encrypt all legacy unencrypted patient intakes
     */
    public static function encryptExistingPlaintextIntakes(): int
    {
        $db = Database::getConnection();
        if (!$db) return 0;

        $stmt = $db->query("SELECT id, visit_reason, symptom_duration, existing_conditions, current_medicines, known_allergies, general_notes FROM patient_intakes WHERE is_encrypted = 0 OR is_encrypted IS NULL");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $count = 0;

        $upStmt = $db->prepare("
            UPDATE patient_intakes SET
                visit_reason = :v_reason,
                symptom_duration = :duration,
                existing_conditions = :conditions,
                current_medicines = :meds,
                known_allergies = :allergies,
                general_notes = :g_notes,
                is_encrypted = 1
            WHERE id = :id
        ");

        foreach ($rows as $row) {
            $upStmt->execute([
                ':id' => $row['id'],
                ':v_reason' => Crypto::encrypt($row['visit_reason']),
                ':duration' => Crypto::encrypt($row['symptom_duration']),
                ':conditions' => Crypto::encrypt($row['existing_conditions']),
                ':meds' => Crypto::encrypt($row['current_medicines']),
                ':allergies' => Crypto::encrypt($row['known_allergies']),
                ':g_notes' => Crypto::encrypt($row['general_notes']),
            ]);
            $count++;
        }

        return $count;
    }

    /**
     * Get history records for an appointment
     */
    public static function getHistory(int $appointmentId): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->prepare("
            SELECT * FROM appointment_history 
            WHERE appointment_id = :app_id 
            ORDER BY created_at ASC
        ");
        $stmt->execute([':app_id' => $appointmentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get internal staff notes for an appointment
     */
    public static function getStaffNotes(int $appointmentId): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->prepare("
            SELECT * FROM staff_notes 
            WHERE appointment_id = :app_id 
            ORDER BY created_at DESC
        ");
        $stmt->execute([':app_id' => $appointmentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Mark clinical intake as reviewed by treating clinician
     */
    public static function markIntakeReviewed(int $appointmentId, string $clinicianName, int $clinicianId): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        try {
            $db->beginTransaction();

            $stmt = $db->prepare("
                UPDATE patient_intakes SET
                    reviewed_at = NOW(),
                    reviewed_by = :clinician_name
                WHERE appointment_id = :app_id
            ");
            $stmt->execute([
                ':clinician_name' => $clinicianName,
                ':app_id' => $appointmentId
            ]);

            // Add history entry for audit trail
            $histStmt = $db->prepare("
                INSERT INTO appointment_history (
                    appointment_id, previous_status, new_status, action_type, notes, changed_by
                ) VALUES (
                    :app_id, NULL, 'reviewed', 'note_added', :notes, :changed_by
                )
            ");
            $histStmt->execute([
                ':app_id' => $appointmentId,
                ':notes' => "Pre-visit clinical intake reviewed by {$clinicianName}.",
                ':changed_by' => $clinicianName
            ]);

            $db->commit();
            return true;
        } catch (\Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            error_log("Error marking intake reviewed: " . $e->getMessage());
            return false;
        }
    }
}

