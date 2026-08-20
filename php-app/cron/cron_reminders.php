<?php
/**
 * Hostinger Cron Job: Appointment Reminders Dispatcher
 * Run schedule: Every 30 minutes (star/30 * * * *)
 * 
 * Command: /usr/bin/php /home/u123456789/domains/healthpro.com.pk/php-app/cron/cron_reminders.php
 */

define('ROOT_PATH', dirname(__DIR__));
require_once ROOT_PATH . '/app/Config/Database.php';
require_once ROOT_PATH . '/app/Services/MailerService.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Find confirmed appointments within next 24 hours that haven't received reminder
    $stmt = $db->prepare("
        SELECT * FROM appointments 
        WHERE status = 'confirmed' 
        AND preferred_date = CURDATE() + INTERVAL 1 DAY
        AND is_reminder_sent = 0
    ");
    $stmt->execute();
    $upcomingAppointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $mailer = new MailerService();
    $sentCount = 0;

    foreach ($upcomingAppointments as $app) {
        if (!empty($app['patient_email'])) {
            $subject = "Reminder: Tomorrow's Consultation with Dr. Farhan Mustafa";
            $message = "Dear {$app['patient_name']},\n\n"
                     . "This is a reminder for your scheduled consultation with Dr. Farhan Mustafa tomorrow at {$app['preferred_time_slot']} (PKT).\n\n"
                     . "Reference: {$app['reference_code']}\n"
                     . "Location: HealthPro Medical Complex, 860-B, Block B, Faisal Town, Lahore\n"
                     . "Reception WhatsApp: +92 328 0145670\n\n"
                     . "If you need to reschedule, please notify clinic reception at your earliest convenience.";

            $sent = $mailer->send($app['patient_email'], $subject, $message);
            if ($sent) {
                $upd = $db->prepare("UPDATE appointments SET is_reminder_sent = 1 WHERE id = :id");
                $upd->execute([':id' => $app['id']]);
                $sentCount++;
            }
        }
    }

    echo "[" . date('Y-m-d H:i:s') . "] Processed " . count($upcomingAppointments) . " reminders. Sent: {$sentCount}\n";

} catch (Exception $e) {
    echo "[" . date('Y-m-d H:i:s') . "] Error in cron_reminders: " . $e->getMessage() . "\n";
}
