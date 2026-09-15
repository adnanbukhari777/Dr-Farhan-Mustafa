<?php
/**
 * Contact & Inquiries Model
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class ContactModel
{
    public static function create(array $data): array
    {
        $db = Database::getConnection();
        if (!$db) return ['success' => false, 'message' => 'Database connection failed.'];

        $name = trim($data['name'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $email = trim($data['email'] ?? '');
        $subject = trim($data['subject'] ?? 'General Inquiry');
        $message = trim($data['message'] ?? '');

        if (empty($name) || empty($phone) || empty($message)) {
            return ['success' => false, 'message' => 'Name, phone number, and message are required.'];
        }

        $stmt = $db->prepare("
            INSERT INTO contact_messages (name, phone, email, subject, message, is_read, created_at)
            VALUES (:name, :phone, :email, :subject, :message, 0, NOW())
        ");

        $executed = $stmt->execute([
            ':name' => $name,
            ':phone' => $phone,
            ':email' => $email,
            ':subject' => $subject,
            ':message' => $message,
        ]);

        if ($executed) {
            return ['success' => true, 'message' => 'Your message has been received. Our clinic team will reach out to you shortly.'];
        }

        return ['success' => false, 'message' => 'Failed to save message.'];
    }

    public static function getAll(int $limit = 50): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->prepare("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT :lim");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
