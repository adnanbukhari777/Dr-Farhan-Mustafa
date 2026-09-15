<?php
/**
 * SMTP Configuration & Email Testing Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Security\Mailer;
use App\Security\Auth;

class SmtpController
{
    /**
     * View SMTP Settings
     * Allowed Roles: admin, super_admin. Receptionist & Editor denied (403).
     */
    public function getSettings(): void
    {
        Auth::requireRole([Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);

        $settings = Mailer::getSmtpSettings();
        // Mask password for security
        if (!empty($settings['password'])) {
            $settings['password'] = '••••••••';
        }
        Auth::jsonResponse(['success' => true, 'smtp' => $settings]);
    }

    /**
     * Update SMTP Settings
     * Allowed Roles: super_admin only. Admin, Receptionist, Editor denied (403).
     * Requires CSRF token.
     */
    public function saveSettings(): void
    {
        Auth::requireRole(Auth::ROLE_SUPER_ADMIN);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $allowed = ['host', 'port', 'encryption', 'username', 'password', 'from_email', 'from_name'];
        $filtered = array_intersect_key($input, array_flip($allowed));
        
        $saved = Mailer::updateSmtpSettings($filtered);
        if ($saved) {
            Auth::recordAuditEvent('smtp_settings_updated', 'smtp', null, [
                'smtp_host' => $filtered['host'] ?? '',
                'smtp_port' => $filtered['port'] ?? ''
            ]);
            Auth::jsonResponse(['success' => true, 'message' => 'SMTP settings saved successfully.']);
        } else {
            Auth::jsonResponse(['success' => false, 'error' => 'save_failed', 'message' => 'Failed to save SMTP settings.'], 500);
        }
    }

    /**
     * Send Test Dispatch Email
     * Allowed Roles: super_admin only. Admin, Receptionist, Editor denied (403).
     * Requires CSRF token.
     */
    public function testEmail(): void
    {
        Auth::requireRole(Auth::ROLE_SUPER_ADMIN);
        Auth::requireCsrf();

        $input = Auth::requireJsonRequest();
        $allowed = ['recipient_email', 'email'];
        $filtered = array_intersect_key($input, array_flip($allowed));

        $recipient = trim((string)($filtered['recipient_email'] ?? $filtered['email'] ?? 'reception@healthpro.com.pk'));
        if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Invalid recipient email address.'], 400);
        }

        $fakeAppointment = [
            'patient_name' => 'System Test Patient',
            'patient_email' => $recipient,
            'reference_code' => 'DFM-TEST-' . mt_rand(1000, 9999),
            'preferred_date' => date('Y-m-d'),
            'preferred_time_slot' => '18:00:00',
            'appointment_type' => 'in-clinic'
        ];

        $res = Mailer::sendAppointmentNotification('confirmed', $fakeAppointment);
        Auth::recordAuditEvent('smtp_test_email_dispatched', 'smtp', null, [
            'recipient' => $recipient,
            'success' => $res['success'] ?? false
        ]);
        Auth::jsonResponse($res);
    }
}
