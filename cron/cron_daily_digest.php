<?php
/**
 * Hostinger Cron Job: Daily Morning Clinic Schedule Digest
 * Run schedule: Daily at 8:00 AM PKT (0 3 * * * UTC)
 * 
 * Command: /usr/bin/php /home/u123456789/domains/healthpro.com.pk/php-app/cron/cron_daily_digest.php
 */

define('ROOT_PATH', dirname(__DIR__));
require_once ROOT_PATH . '/app/Config/Database.php';
require_once ROOT_PATH . '/app/Services/MailerService.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Fetch today's appointments
    $stmt = $db->prepare("
        SELECT * FROM appointments 
        WHERE preferred_date = CURDATE() 
        AND status IN ('new', 'confirmed', 'rescheduled')
        ORDER BY preferred_time_slot ASC
    ");
    $stmt->execute();
    $todayAppointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Read reception notification email from SMTP settings
    $notifyEmail = 'reception@healthpro.com.pk';
    $stmtSmtp = $db->query("SELECT staff_notification_email FROM smtp_settings LIMIT 1");
    if ($row = $stmtSmtp->fetch(PDO::FETCH_ASSOC)) {
        if (!empty($row['staff_notification_email'])) {
            $notifyEmail = $row['staff_notification_email'];
        }
    }

    $dateFormatted = date('d M Y');
    $count = count($todayAppointments);
    $subject = "Daily Clinic Schedule Digest - {$dateFormatted} ({$count} Patient Appointments)";
    
    $body = "Dr. Farhan Mustafa Clinic - Daily Consultation Schedule\n";
    $body .= "Date: {$dateFormatted}\n";
    $body .= "Total Scheduled Appointments: {$count}\n\n";
    $body .= "--------------------------------------------------------\n";

    if ($count === 0) {
        $body .= "No appointments scheduled for today.\n";
    } else {
        foreach ($todayAppointments as $idx => $app) {
            $num = $idx + 1;
            $body .= "{$num}. [{$app['preferred_time_slot']} PKT] {$app['patient_name']} ({$app['patient_phone']})\n";
            $body .= "   Format: {$app['appointment_type']} | Status: {$app['status']}\n";
            $body .= "   Reason: {$app['reason_category']}\n";
            $body .= "   Reference: {$app['reference_code']}\n\n";
        }
    }

    $body .= "--------------------------------------------------------\n";
    $body .= "HealthPro Medical Complex, Faisal Town, Lahore\n";
    $body .= "Reception Hotline: +92 328 0145670\n";

    $mailer = new MailerService();
    $sent = $mailer->send($notifyEmail, $subject, $body);

    echo "[" . date('Y-m-d H:i:s') . "] Daily digest processed for {$count} appointments. Email sent: " . ($sent ? 'Yes' : 'No') . "\n";

} catch (Exception $e) {
    echo "[" . date('Y-m-d H:i:s') . "] Error in cron_daily_digest: " . $e->getMessage() . "\n";
}
