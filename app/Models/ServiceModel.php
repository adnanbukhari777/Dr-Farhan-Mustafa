<?php
/**
 * Clinical Services Model (with Draft, Published, Needs Verification states)
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class ServiceModel
{
    public static function getPublished(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("
            SELECT * FROM services 
            WHERE status = 'published' AND is_active = 1 
            ORDER BY sort_order ASC, id ASC
        ");
        $services = $stmt->fetchAll();

        foreach ($services as &$service) {
            $service['symptoms'] = !empty($service['symptoms_json']) ? json_decode($service['symptoms_json'], true) : [];
            $service['what_to_bring'] = !empty($service['what_to_bring_json']) ? json_decode($service['what_to_bring_json'], true) : [];
            $service['faqs'] = !empty($service['faqs_json']) ? json_decode($service['faqs_json'], true) : [];
        }
        return $services;
    }

    public static function findBySlug(string $slug): ?array
    {
        $db = Database::getConnection();
        if (!$db) return null;

        $stmt = $db->prepare("SELECT * FROM services WHERE slug = :slug LIMIT 1");
        $stmt->execute([':slug' => $slug]);
        $service = $stmt->fetch();

        if ($service) {
            $service['symptoms'] = !empty($service['symptoms_json']) ? json_decode($service['symptoms_json'], true) : [];
            $service['what_to_bring'] = !empty($service['what_to_bring_json']) ? json_decode($service['what_to_bring_json'], true) : [];
            $service['faqs'] = !empty($service['faqs_json']) ? json_decode($service['faqs_json'], true) : [];
        }
        return $service ?: null;
    }

    public static function getAllAdmin(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT * FROM services ORDER BY sort_order ASC, id ASC");
        return $stmt->fetchAll();
    }

    public static function save(array $data, ?int $id = null): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        $symptomsJson = is_array($data['symptoms'] ?? null) ? json_encode($data['symptoms']) : ($data['symptoms_json'] ?? null);
        $whatToBringJson = is_array($data['what_to_bring'] ?? null) ? json_encode($data['what_to_bring']) : ($data['what_to_bring_json'] ?? null);
        $faqsJson = is_array($data['faqs'] ?? null) ? json_encode($data['faqs']) : ($data['faqs_json'] ?? null);

        if ($id) {
            $stmt = $db->prepare("
                UPDATE services SET
                    slug = :slug,
                    title = :title,
                    category = :category,
                    short_description = :short_desc,
                    full_description = :full_desc,
                    symptoms_json = :symptoms,
                    what_to_bring_json = :what_to_bring,
                    faqs_json = :faqs,
                    sort_order = :sort_order,
                    status = :status,
                    is_active = :is_active
                WHERE id = :id
            ");
            return $stmt->execute([
                ':slug' => $data['slug'],
                ':title' => $data['title'],
                ':category' => $data['category'],
                ':short_desc' => $data['short_description'],
                ':full_desc' => $data['full_description'],
                ':symptoms' => $symptomsJson,
                ':what_to_bring' => $whatToBringJson,
                ':faqs' => $faqsJson,
                ':sort_order' => (int)($data['sort_order'] ?? 0),
                ':status' => $data['status'] ?? 'published',
                ':is_active' => (int)($data['is_active'] ?? 1),
                ':id' => $id
            ]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO services 
                (slug, title, category, short_description, full_description, symptoms_json, what_to_bring_json, faqs_json, sort_order, status, is_active)
                VALUES 
                (:slug, :title, :category, :short_desc, :full_desc, :symptoms, :what_to_bring, :faqs, :sort_order, :status, :is_active)
            ");
            return $stmt->execute([
                ':slug' => $data['slug'],
                ':title' => $data['title'],
                ':category' => $data['category'],
                ':short_desc' => $data['short_description'],
                ':full_desc' => $data['full_description'],
                ':symptoms' => $symptomsJson,
                ':what_to_bring' => $whatToBringJson,
                ':faqs' => $faqsJson,
                ':sort_order' => (int)($data['sort_order'] ?? 0),
                ':status' => $data['status'] ?? 'published',
                ':is_active' => (int)($data['is_active'] ?? 1)
            ]);
        }
    }
}
