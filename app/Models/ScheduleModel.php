<?php
/**
 * Clinical Schedules, Availability Rules & Slot Generator Model (Phase 3)
 * Timezone: Asia/Karachi (PKT, UTC+5)
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use App\Config\Config;
use PDO;

class ScheduleModel
{
    /**
     * Get all active appointment types
     */
    public static function getAppointmentTypes(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT * FROM appointment_types WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get availability rules by day of week
     */
    public static function getAvailabilityRules(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT * FROM availability_rules WHERE is_active = 1 ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get clinic breaks
     */
    public static function getClinicBreaks(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT * FROM clinic_breaks WHERE is_active = 1");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get clinic holidays
     */
    public static function getClinicHolidays(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT * FROM clinic_holidays WHERE is_closed = 1 AND holiday_date >= CURDATE() ORDER BY holiday_date ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get blocked slots
     */
    public static function getBlockedSlots(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT * FROM blocked_slots WHERE block_date >= CURDATE() ORDER BY block_date ASC, start_time ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Calculate and generate dynamic available time slots for a given date in Asia/Karachi timezone
     */
    public static function getAvailableSlots(string $date, string $consultationType = 'in-clinic'): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        // Validate date format (YYYY-MM-DD)
        $timestamp = strtotime($date);
        if (!$timestamp) {
            return ['status' => 'error', 'message' => 'Invalid date format.'];
        }

        $dayOfWeek = date('l', $timestamp); // Monday, Tuesday, etc.

        // 1. Check if the date is a holiday
        $holStmt = $db->prepare("SELECT title, description FROM clinic_holidays WHERE holiday_date = :hdate AND is_closed = 1 LIMIT 1");
        $holStmt->execute([':hdate' => $date]);
        $holiday = $holStmt->fetch(PDO::FETCH_ASSOC);
        if ($holiday) {
            return [
                'status' => 'closed',
                'is_holiday' => true,
                'reason' => $holiday['title'],
                'description' => $holiday['description'],
                'slots' => []
            ];
        }

        // 2. Check availability rules for this day of week
        $ruleStmt = $db->prepare("
            SELECT * FROM availability_rules 
            WHERE day_of_week = :day 
            AND is_active = 1 
            AND (consultation_type = :ctype OR consultation_type = 'both')
            LIMIT 1
        ");
        $ruleStmt->execute([':day' => $dayOfWeek, ':ctype' => $consultationType]);
        $rule = $ruleStmt->fetch(PDO::FETCH_ASSOC);

        if (!$rule) {
            return [
                'status' => 'closed',
                'reason' => "No clinic consultation schedule configured for {$dayOfWeek}.",
                'slots' => []
            ];
        }

        $startTimeStr = $rule['start_time']; // e.g. "18:00:00"
        $endTimeStr = $rule['end_time'];     // e.g. "21:00:00"
        $slotDuration = (int)$rule['slot_duration_minutes']; // e.g. 20
        if ($slotDuration < 10) $slotDuration = 20;

        // 3. Fetch breaks for this day (or 'All')
        $breaksStmt = $db->prepare("
            SELECT start_time, end_time, break_name FROM clinic_breaks 
            WHERE is_active = 1 
            AND (day_of_week = :day OR day_of_week = 'All')
        ");
        $breaksStmt->execute([':day' => $dayOfWeek]);
        $breaks = $breaksStmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Fetch blocked slots for this specific date
        $blockStmt = $db->prepare("
            SELECT start_time, end_time, reason FROM blocked_slots 
            WHERE block_date = :bdate
        ");
        $blockStmt->execute([':bdate' => $date]);
        $blockedSlots = $blockStmt->fetchAll(PDO::FETCH_ASSOC);

        // 5. Fetch existing active bookings for this date
        $bookedStmt = $db->prepare("
            SELECT preferred_time_slot, COUNT(*) as count 
            FROM appointments 
            WHERE preferred_date = :pdate 
            AND status NOT IN ('cancelled', 'no_show')
            GROUP BY preferred_time_slot
        ");
        $bookedStmt->execute([':pdate' => $date]);
        $bookedRows = $bookedStmt->fetchAll(PDO::FETCH_ASSOC);
        $bookedSlots = [];
        foreach ($bookedRows as $row) {
            $bookedSlots[$row['preferred_time_slot']] = (int)$row['count'];
        }

        // 6. Generate time slots
        $slots = [];
        $current = strtotime("{$date} {$startTimeStr}");
        $end = strtotime("{$date} {$endTimeStr}");
        $maxPerSlot = (int)$rule['max_patients_per_slot'];

        while ($current + ($slotDuration * 60) <= $end) {
            $slotTime = date('H:i', $current);
            $slotEnd = date('H:i', $current + ($slotDuration * 60));
            $slotDisplay = date('g:i A', $current) . ' - ' . date('g:i A', $current + ($slotDuration * 60));

            // Check if slot overlaps with any clinic break
            $isInBreak = false;
            $breakReason = '';
            foreach ($breaks as $b) {
                $bStart = substr($b['start_time'], 0, 5);
                $bEnd = substr($b['end_time'], 0, 5);
                if ($slotTime >= $bStart && $slotTime < $bEnd) {
                    $isInBreak = true;
                    $breakReason = $b['break_name'];
                    break;
                }
            }

            // Check if slot overlaps with any blocked slot
            $isBlocked = false;
            $blockedReason = '';
            foreach ($blockedSlots as $blk) {
                $blkStart = substr($blk['start_time'], 0, 5);
                $blkEnd = substr($blk['end_time'], 0, 5);
                if ($slotTime >= $blkStart && $slotTime < $blkEnd) {
                    $isBlocked = true;
                    $blockedReason = $blk['reason'];
                    break;
                }
            }

            $currentBookings = $bookedSlots[$slotTime] ?? 0;
            $isBooked = $currentBookings >= $maxPerSlot;

            $status = 'available';
            $unavailableReason = null;

            if ($isInBreak) {
                $status = 'break';
                $unavailableReason = $breakReason;
            } elseif ($isBlocked) {
                $status = 'blocked';
                $unavailableReason = $blockedReason;
            } elseif ($isBooked) {
                $status = 'booked';
                $unavailableReason = 'Slot already reserved';
            }

            $slots[] = [
                'time' => $slotTime,
                'end_time' => $slotEnd,
                'display' => $slotDisplay,
                'status' => $status,
                'is_available' => ($status === 'available'),
                'reason' => $unavailableReason,
                'current_bookings' => $currentBookings,
                'max_capacity' => $maxPerSlot
            ];

            $current += ($slotDuration * 60);
        }

        return [
            'status' => 'open',
            'date' => $date,
            'day_of_week' => $dayOfWeek,
            'timezone' => Config::TIMEZONE,
            'slot_duration_minutes' => $slotDuration,
            'slots' => $slots
        ];
    }

    /**
     * Add a blocked slot
     */
    public static function addBlockedSlot(string $date, string $startTime, string $endTime, string $reason): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $stmt = $db->prepare("
            INSERT INTO blocked_slots (block_date, start_time, end_time, reason)
            VALUES (:bdate, :start, :end, :reason)
        ");
        return $stmt->execute([
            ':bdate' => $date,
            ':start' => $startTime,
            ':end' => $endTime,
            ':reason' => $reason
        ]);
    }

    /**
     * Get a blocked slot by ID
     */
    public static function getBlockedSlotById(int $id): ?array
    {
        $db = Database::getConnection();
        if (!$db) return null;

        $stmt = $db->prepare("SELECT * FROM blocked_slots WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Delete a blocked slot
     */
    public static function deleteBlockedSlot(int $id): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $stmt = $db->prepare("DELETE FROM blocked_slots WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Add a holiday
     */
    public static function addHoliday(string $date, string $title, ?string $description = null): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $stmt = $db->prepare("
            INSERT INTO clinic_holidays (holiday_date, title, description, is_closed)
            VALUES (:hdate, :title, :desc, 1)
            ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), is_closed = 1
        ");
        return $stmt->execute([
            ':hdate' => $date,
            ':title' => $title,
            ':desc' => $description
        ]);
    }
}
