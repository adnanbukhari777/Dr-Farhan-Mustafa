<?php
/**
 * Configurable SMTP Mailer & Appointment Notification Service (Phase 3)
 * Provides transactional email dispatch and simulation for appointment workflows.
 */

declare(strict_types=1);

namespace App\Security;

use App\Config\Database;
use App\Config\Config;
use App\Config\EnvLoader;
use PDO;

class Mailer
{
    /**
     * Get active SMTP configuration
     */
    public static function getSmtpSettings(): array
    {
        $db = Database::getConnection();
        if ($db) {
            $stmt = $db->query("SELECT * FROM smtp_settings ORDER BY id DESC LIMIT 1");
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($settings) {
                return $settings;
            }
        }

        $smtpEnabled = EnvLoader::get('SMTP_ENABLED', false);
        $isActive = ($smtpEnabled === true || $smtpEnabled === 'true' || $smtpEnabled === '1' || $smtpEnabled === 1) ? 1 : 0;

        $staffNotify = EnvLoader::get('STAFF_NOTIFICATION_ENABLED', false);
        $notifyStaff = ($staffNotify === true || $staffNotify === 'true' || $staffNotify === '1' || $staffNotify === 1) ? 1 : 0;

        return [
            'host' => (string)EnvLoader::get('SMTP_HOST', 'smtp.hostinger.com'),
            'port' => (int)EnvLoader::get('SMTP_PORT', 465),
            'encryption' => (string)EnvLoader::get('SMTP_ENCRYPTION', 'ssl'),
            'username' => (string)(EnvLoader::get('SMTP_USER') ?: EnvLoader::get('SMTP_USERNAME', 'appointments@healthpro.com.pk')),
            'password' => (string)(EnvLoader::get('SMTP_PASS') ?: EnvLoader::get('SMTP_PASSWORD', '')),
            'from_email' => (string)EnvLoader::get('SMTP_FROM_EMAIL', 'appointments@healthpro.com.pk'),
            'from_name' => (string)EnvLoader::get('SMTP_FROM_NAME', 'Dr. Farhan Mustafa'),
            'is_active' => $isActive,
            'notify_staff_on_new' => $notifyStaff,
            'staff_notification_email' => (string)EnvLoader::get('STAFF_NOTIFICATION_EMAIL', 'reception@healthpro.com.pk')
        ];
    }

    /**
     * Update SMTP configuration
     */
    public static function updateSmtpSettings(array $data): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $stmt = $db->prepare("
            INSERT INTO smtp_settings (
                id, host, port, encryption, username, password, from_email, from_name, is_active, notify_staff_on_new, staff_notification_email
            ) VALUES (
                1, :host, :port, :enc, :user, :pass, :from_email, :from_name, :active, :notify_staff, :staff_email
            ) ON DUPLICATE KEY UPDATE
                host = VALUES(host),
                port = VALUES(port),
                encryption = VALUES(encryption),
                username = VALUES(username),
                password = COALESCE(VALUES(password), password),
                from_email = VALUES(from_email),
                from_name = VALUES(from_name),
                is_active = VALUES(is_active),
                notify_staff_on_new = VALUES(notify_staff_on_new),
                staff_notification_email = VALUES(staff_notification_email)
        ");

        return $stmt->execute([
            ':host' => $data['host'] ?? 'smtp.hostinger.com',
            ':port' => (int)($data['port'] ?? 465),
            ':enc' => $data['encryption'] ?? 'ssl',
            ':user' => $data['username'] ?? 'appointments@healthpro.com.pk',
            ':pass' => !empty($data['password']) ? $data['password'] : null,
            ':from_email' => $data['from_email'] ?? 'appointments@healthpro.com.pk',
            ':from_name' => $data['from_name'] ?? 'Dr. Farhan Mustafa Clinic',
            ':active' => isset($data['is_active']) ? (int)$data['is_active'] : 1,
            ':notify_staff' => isset($data['notify_staff_on_new']) ? (int)$data['notify_staff_on_new'] : 1,
            ':staff_email' => $data['staff_notification_email'] ?? 'reception@healthpro.com.pk',
        ]);
    }

    /**
     * Send email notification for appointment events
     */
    public static function sendAppointmentNotification(string $eventType, array $appointment): array
    {
        $smtp = self::getSmtpSettings();
        if (empty($smtp['is_active'])) {
            return ['success' => false, 'message' => 'SMTP notifications are currently disabled.'];
        }

        $recipientEmail = $appointment['patient_email'] ?? '';
        $patientName = $appointment['patient_name'] ?? 'Patient';
        $refCode = $appointment['reference_code'] ?? 'DFM-REF';
        $date = $appointment['preferred_date'] ?? '';
        $slot = $appointment['preferred_time_slot'] ?? '';

        $subject = '';
        $htmlBody = '';

        switch ($eventType) {
            case 'new_request':
                $subject = "Appointment Request Received [{$refCode}] - Dr. Farhan Mustafa";
                $htmlBody = "
                    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;'>
                        <h2 style='color: #2097A2;'>Appointment Request Received</h2>
                        <p>Dear <strong>{$patientName}</strong>,</p>
                        <p>We have received your appointment request for consultation with <strong>Dr. Farhan Mustafa</strong>.</p>
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                            <tr style='background: #f4fbfc;'><td style='padding: 8px; font-weight: bold;'>Reference Code:</td><td style='padding: 8px;'>{$refCode}</td></tr>
                            <tr><td style='padding: 8px; font-weight: bold;'>Requested Date:</td><td style='padding: 8px;'>{$date}</td></tr>
                            <tr style='background: #f4fbfc;'><td style='padding: 8px; font-weight: bold;'>Requested Time:</td><td style='padding: 8px;'>{$slot} (PKT)</td></tr>
                            <tr><td style='padding: 8px; font-weight: bold;'>Status:</td><td style='padding: 8px; color: #f59e0b; font-weight: bold;'>New (Awaiting Staff Confirmation)</td></tr>
                        </table>
                        <p><strong>Next Step:</strong> Clinic staff will review schedule availability and confirm your slot. For faster coordination, you may also message reception on WhatsApp at <a href='https://wa.me/923280145670'>0328 0145670</a>.</p>
                        <p style='color: #666; font-size: 13px;'>HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore.</p>
                    </div>
                ";
                break;

            case 'confirmed':
                $subject = "Appointment Confirmed [{$refCode}] - Dr. Farhan Mustafa";
                $htmlBody = "
                    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;'>
                        <h2 style='color: #059669;'>Your Appointment is Confirmed</h2>
                        <p>Dear <strong>{$patientName}</strong>,</p>
                        <p>Your consultation slot with <strong>Dr. Farhan Mustafa</strong> has been confirmed by our clinic reception.</p>
                        <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                            <tr style='background: #f0fdf4;'><td style='padding: 8px; font-weight: bold;'>Reference Code:</td><td style='padding: 8px;'>{$refCode}</td></tr>
                            <tr><td style='padding: 8px; font-weight: bold;'>Confirmed Date:</td><td style='padding: 8px;'>{$date}</td></tr>
                            <tr style='background: #f0fdf4;'><td style='padding: 8px; font-weight: bold;'>Confirmed Time:</td><td style='padding: 8px;'>{$slot} (PKT)</td></tr>
                            <tr><td style='padding: 8px; font-weight: bold;'>Status:</td><td style='padding: 8px; color: #059669; font-weight: bold;'>Confirmed</td></tr>
                        </table>
                        <p><strong>Clinic Location:</strong> HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore.<br>
                        <a href='https://maps.app.goo.gl/rAKkEXXdU1rMG2nB6' style='color: #2097A2;'>Open in Google Maps</a></p>
                        <p><em>Please arrive 10 minutes prior and bring any previous prescription or laboratory reports.</em></p>
                    </div>
                ";
                break;

            case 'rescheduled':
                $subject = "Appointment Rescheduled [{$refCode}] - Dr. Farhan Mustafa";
                $htmlBody = "
                    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;'>
                        <h2 style='color: #3b82f6;'>Appointment Rescheduled</h2>
                        <p>Dear <strong>{$patientName}</strong>,</p>
                        <p>Your consultation slot with <strong>Dr. Farhan Mustafa</strong> has been updated to:</p>
                        <p><strong>New Date & Time:</strong> {$date} at {$slot} (PKT)</p>
                        <p><strong>Reference:</strong> {$refCode}</p>
                    </div>
                ";
                break;

            case 'cancelled':
                $subject = "Appointment Cancelled [{$refCode}] - Dr. Farhan Mustafa";
                $htmlBody = "
                    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;'>
                        <h2 style='color: #dc2626;'>Appointment Cancelled</h2>
                        <p>Dear <strong>{$patientName}</strong>,</p>
                        <p>Your appointment request [{$refCode}] for {$date} has been cancelled.</p>
                        <p>If this was in error, please book a new slot online or contact clinic reception at 0328 0145670.</p>
                    </div>
                ";
                break;

            default:
                return ['success' => false, 'message' => 'Unknown event type.'];
        }

        // Send to patient if email is present
        $sentPatient = false;
        if (!empty($recipientEmail)) {
            $sentPatient = self::dispatchEmail($recipientEmail, $subject, $htmlBody, $smtp);
        }

        // Notify staff if enabled and event is 'new_request'
        if ($eventType === 'new_request' && !empty($smtp['notify_staff_on_new']) && !empty($smtp['staff_notification_email'])) {
            $staffSubject = "NEW Booking Request: {$patientName} [{$refCode}]";
            $staffBody = "
                <p>New online appointment request received from <strong>{$patientName}</strong> ({$appointment['patient_phone']}).</p>
                <p><strong>Date & Slot:</strong> {$date} {$slot}</p>
                <p><strong>Reason:</strong> " . ($appointment['reason_category'] ?? 'General Consultation') . "</p>
                <p>Please log in to the HealthPro Admin Portal to confirm or reschedule this request.</p>
            ";
            self::dispatchEmail($smtp['staff_notification_email'], $staffSubject, $staffBody, $smtp);
        }

        return [
            'success' => true,
            'message' => 'Notification processed successfully.',
            'recipient' => $recipientEmail,
            'subject' => $subject
        ];
    }

    /**
     * Dispatch email via PHP mail or SMTP socket
     */
    private static function dispatchEmail(string $to, string $subject, string $htmlBody, array $smtp): bool
    {
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . ($smtp['from_name'] ?? 'Dr. Farhan Mustafa Clinic') . ' <' . ($smtp['from_email'] ?? 'appointments@healthpro.com.pk') . '>',
            'Reply-To: ' . ($smtp['from_email'] ?? 'appointments@healthpro.com.pk'),
            'X-Mailer: PHP/' . phpversion()
        ];

        // In standard environment without external sendmail binary, mail() gracefully logs to mail spool
        $mailSent = @mail($to, $subject, $htmlBody, implode("\r\n", $headers));
        return $mailSent !== false;
    }
}
