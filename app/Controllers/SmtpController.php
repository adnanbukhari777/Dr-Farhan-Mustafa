<?php
/**
 * SMTP Configuration & Email Testing Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Security\Mailer;

class SmtpController
{
    public function getSettings(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        $settings = Mailer::getSmtpSettings();
        // Mask password for security
        if (!empty($settings['password'])) {
            $settings['password'] = '••••••••';
        }
        echo json_encode(['success' => true, 'smtp' => $settings]);
    }

    public function saveSettings(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        
        $saved = Mailer::updateSmtpSettings($input);
        if ($saved) {
            echo json_encode(['success' => true, 'message' => 'SMTP settings saved successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save SMTP settings.']);
        }
    }

    public function testEmail(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $recipient = $input['recipient_email'] ?? $input['email'] ?? 'reception@healthpro.com.pk';

        $fakeAppointment = [
            'patient_name' => 'System Test Patient',
            'patient_email' => $recipient,
            'reference_code' => 'DFM-TEST-' . mt_rand(1000, 9999),
            'preferred_date' => date('Y-m-d'),
            'preferred_time_slot' => '18:00:00',
            'appointment_type' => 'in-clinic'
        ];

        $res = Mailer::sendAppointmentNotification('confirmed', $fakeAppointment);
        echo json_encode($res);
    }
}
