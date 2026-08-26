<?php
/**
 * SMTP Mailer Service with Graceful Offline/Disabled Fallback
 * Ensures appointments continue working in MySQL even when SMTP is unconfigured or disabled.
 */

declare(strict_types=1);

namespace App\Services;

use App\Config\EnvLoader;

class MailerService
{
    private bool $enabled;
    private string $host;
    private int $port;
    private string $encryption;
    private string $username;
    private string $password;
    private string $fromEmail;
    private string $fromName;

    public function __construct()
    {
        $this->enabled = (bool)EnvLoader::get('SMTP_ENABLED', false);
        $this->host = (string)EnvLoader::get('SMTP_HOST', 'smtp.hostinger.com');
        $this->port = (int)EnvLoader::get('SMTP_PORT', 465);
        $this->encryption = (string)EnvLoader::get('SMTP_ENCRYPTION', 'ssl');
        $this->username = (string)EnvLoader::get('SMTP_USER', '');
        $this->password = (string)EnvLoader::get('SMTP_PASS', '');
        $this->fromEmail = (string)EnvLoader::get('SMTP_FROM_EMAIL', 'appointments@healthpro.com.pk');
        $this->fromName = (string)EnvLoader::get('SMTP_FROM_NAME', 'Dr. Farhan Mustafa');
    }

    /**
     * Check if SMTP is enabled and has valid non-placeholder credentials
     */
    public function isConfigured(): bool
    {
        if (!$this->enabled) {
            return false;
        }

        if (empty($this->username) || 
            str_starts_with($this->username, 'CHANGE_AFTER_') || 
            empty($this->password) || 
            str_starts_with($this->password, 'CHANGE_AFTER_') ||
            empty($this->fromEmail) ||
            str_starts_with($this->fromEmail, 'CHANGE_AFTER_')) {
            return false;
        }

        return true;
    }

    /**
     * Get safe status for Admin Portal (NEVER exposes password)
     */
    public function getStatus(): array
    {
        return [
            'enabled' => $this->enabled,
            'configured' => $this->isConfigured(),
            'host' => $this->host,
            'port' => $this->port,
            'encryption' => $this->encryption,
            'fromEmail' => $this->isConfigured() ? $this->fromEmail : 'Not configured (Placeholder in .env)',
            'fromName' => $this->fromName,
            'warning' => !$this->isConfigured() 
                ? 'Email notifications are currently disabled or unconfigured. Patient bookings and status updates will continue to save in MySQL, but automated emails will not dispatch until SMTP credentials are configured.'
                : null
        ];
    }

    /**
     * Send email with graceful failure prevention
     * @return bool True if sent or skipped safely; does NOT throw exceptions
     */
    public function send(string $to, string $subject, string $body, bool $isHtml = false): bool
    {
        // If SMTP is disabled or unconfigured, log and return true/false without blocking booking
        if (!$this->isConfigured()) {
            error_log("[MailerService] Email dispatch skipped (SMTP is disabled or placeholder): To: {$to} | Subject: {$subject}");
            return false;
        }

        try {
            $headers = [];
            $headers[] = "From: {$this->fromName} <{$this->fromEmail}>";
            $headers[] = "Reply-To: {$this->fromEmail}";
            $headers[] = "X-Mailer: PHP/" . phpversion();
            $headers[] = "MIME-Version: 1.0";
            $headers[] = $isHtml ? "Content-Type: text/html; charset=UTF-8" : "Content-Type: text/plain; charset=UTF-8";

            $success = @mail($to, $subject, $body, implode("\r\n", $headers));
            return (bool)$success;
        } catch (\Throwable $e) {
            // Never crash the booking process
            error_log("[MailerService] Mail dispatch error (non-fatal): " . $e->getMessage());
            return false;
        }
    }
}
