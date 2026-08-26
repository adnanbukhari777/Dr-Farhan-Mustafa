<?php
/**
 * Hostinger Cron Job: AI Safety Logs Retention & Purge
 * Run schedule: Daily at midnight (0 0 * * *)
 * 
 * Command: /usr/bin/php /home/u123456789/domains/healthpro.com.pk/php-app/cron/cron_purge_logs.php
 */

define('ROOT_PATH', dirname(__DIR__));
require_once ROOT_PATH . '/app/Config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Read retention days setting from ai_settings table (default 90 days)
    $retentionDays = 90;
    $stmt = $db->query("SELECT setting_value FROM ai_settings WHERE setting_key = 'retention_days'");
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $retentionDays = max(7, intval($row['setting_value']));
    }

    // Purge AI safety logs older than retention period
    $purgeStmt = $db->prepare("
        DELETE FROM ai_safety_logs 
        WHERE created_at < NOW() - INTERVAL :days DAY
    ");
    $purgeStmt->bindValue(':days', $retentionDays, PDO::PARAM_INT);
    $purgeStmt->execute();
    $deletedLogs = $purgeStmt->rowCount();

    // Purge orphaned AI conversation messages
    $purgeMsg = $db->prepare("
        DELETE FROM ai_messages 
        WHERE created_at < NOW() - INTERVAL :days DAY
    ");
    $purgeMsg->bindValue(':days', $retentionDays, PDO::PARAM_INT);
    $purgeMsg->execute();
    $deletedMsgs = $purgeMsg->rowCount();

    echo "[" . date('Y-m-d H:i:s') . "] Retention purge complete (Retention: {$retentionDays} days). Purged {$deletedLogs} safety logs and {$deletedMsgs} AI messages.\n";

} catch (Exception $e) {
    echo "[" . date('Y-m-d H:i:s') . "] Error in cron_purge_logs: " . $e->getMessage() . "\n";
}
