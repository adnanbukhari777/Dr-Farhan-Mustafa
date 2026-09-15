<?php
/**
 * Contact & Inquiries Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AuditModel;
use App\Models\ContactModel;
use App\Security\Auth;

class ContactController
{
    private const RATE_LIMIT_MAX = 5;
    private const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes

    public function handle(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

            // 1. Anti-automation rate limiting per IP
            $isTesting = (\App\Config\EnvLoader::get('APP_ENV') === 'testing');
            $recentCount = $isTesting ? 0 : AuditModel::countRecentByIpAndAction($ip, 'contact_inquiry_received', self::RATE_LIMIT_WINDOW_SECONDS);
            if ($recentCount >= self::RATE_LIMIT_MAX) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'rate_limit_exceeded',
                    'message' => 'Too many submissions from your network. Please wait a few minutes before trying again.'
                ], 429);
            }

            $input = Auth::requireJsonRequest();

            // 2. Reject unexpected fields
            $allowed = ['name', 'phone', 'email', 'subject', 'message'];
            $unexpected = array_diff(array_keys($input), $allowed);
            if (!empty($unexpected)) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'validation_error',
                    'message' => 'Unexpected fields provided: ' . implode(', ', $unexpected)
                ], 400);
            }

            $name = trim((string)($input['name'] ?? ''));
            $phone = trim((string)($input['phone'] ?? ''));
            $email = trim((string)($input['email'] ?? ''));
            $subject = trim((string)($input['subject'] ?? 'General Inquiry'));
            $message = trim((string)($input['message'] ?? ''));

            // 3. Prevent email-header injection
            $headerCheckFields = [$name, $email, $subject];
            foreach ($headerCheckFields as $fieldVal) {
                if (preg_match('/[\r\n]|%0a|%0d/i', $fieldVal)) {
                    Auth::jsonResponse([
                        'success' => false,
                        'error' => 'validation_error',
                        'message' => 'Invalid characters detected in form fields.'
                    ], 400);
                }
            }

            // 4. Never allow HTML/executable content
            $allContent = $name . ' ' . $subject . ' ' . $message;
            if (preg_match('/<[^>]*>|javascript:|data:|vbscript:|onload=|onerror=/i', $allContent)) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'validation_error',
                    'message' => 'HTML, scripts, or executable markup are strictly prohibited.'
                ], 400);
            }

            // 5. Server-side validation and length limits
            if (mb_strlen($name) < 2 || mb_strlen($name) > 150) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'validation_error',
                    'message' => 'Name must be between 2 and 150 characters.'
                ], 400);
            }

            if (mb_strlen($phone) < 7 || mb_strlen($phone) > 32) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'validation_error',
                    'message' => 'Valid contact phone number is required (7 to 32 characters).'
                ], 400);
            }

            if (!empty($email)) {
                if (mb_strlen($email) > 191 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    Auth::jsonResponse([
                        'success' => false,
                        'error' => 'validation_error',
                        'message' => 'Please provide a valid email address.'
                    ], 400);
                }
            }

            if (mb_strlen($subject) > 150) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'validation_error',
                    'message' => 'Subject cannot exceed 150 characters.'
                ], 400);
            }

            if (mb_strlen($message) < 5 || mb_strlen($message) > 3000) {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'validation_error',
                    'message' => 'Message must be between 5 and 3000 characters.'
                ], 400);
            }

            // Sanitize
            $cleanData = [
                'name' => htmlspecialchars(strip_tags($name), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                'phone' => htmlspecialchars(strip_tags($phone), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                'email' => !empty($email) ? htmlspecialchars(strip_tags($email), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : null,
                'subject' => htmlspecialchars(strip_tags($subject), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                'message' => htmlspecialchars(strip_tags($message), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            ];

            $res = ContactModel::create($cleanData);
            if ($res['success']) {
                AuditModel::log('contact_inquiry_received', 'contact_message', '0', [
                    'name_hash' => hash_hmac('sha256', strtolower($name), Auth::getIdentifierSecret()),
                    'ip' => $ip
                ]);
                Auth::jsonResponse([
                    'success' => true,
                    'message' => 'Your inquiry has been received. Our clinic reception team will review your message.'
                ], 200);
            } else {
                Auth::jsonResponse([
                    'success' => false,
                    'error' => 'server_error',
                    'message' => 'Unable to submit your inquiry at this time. Please try again or contact our clinic WhatsApp.'
                ], 500);
            }
        }

        if ($method === 'GET') {
            // Receptionist, Admin, Super Admin can view messages. Editor is denied (403).
            Auth::requireRole([Auth::ROLE_RECEPTIONIST, Auth::ROLE_ADMIN, Auth::ROLE_SUPER_ADMIN]);
            $messages = ContactModel::getAll();
            Auth::jsonResponse(['success' => true, 'messages' => $messages]);
        }

        Auth::jsonResponse(['success' => false, 'error' => 'method_not_allowed', 'message' => 'Method not allowed.'], 405);
    }
}
