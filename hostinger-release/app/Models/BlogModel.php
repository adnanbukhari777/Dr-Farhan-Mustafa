<?php
/**
 * CMS Blog & Medical Articles Model
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class BlogModel
{
    public static function getPublished(): array
    {
        $db = Database::getConnection();
        if (!$db) return [];

        $stmt = $db->query("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_date DESC");
        return $stmt->fetchAll();
    }

    public static function findBySlug(string $slug): ?array
    {
        $db = Database::getConnection();
        if (!$db) return null;

        $stmt = $db->prepare("SELECT * FROM blog_posts WHERE slug = :slug LIMIT 1");
        $stmt->execute([':slug' => $slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function save(array $data, ?int $id = null): bool
    {
        $db = Database::getConnection();
        if (!$db) return false;

        if ($id) {
            $stmt = $db->prepare("
                UPDATE blog_posts SET
                    slug = :slug,
                    title = :title,
                    category = :category,
                    summary = :summary,
                    content = :content,
                    author = :author,
                    published_date = :pub_date,
                    status = :status
                WHERE id = :id
            ");
            return $stmt->execute([
                ':slug' => $data['slug'],
                ':title' => $data['title'],
                ':category' => $data['category'],
                ':summary' => $data['summary'],
                ':content' => $data['content'],
                ':author' => $data['author'] ?? 'Dr. Farhan Mustafa',
                ':pub_date' => $data['published_date'] ?? date('Y-m-d'),
                ':status' => $data['status'] ?? 'published',
                ':id' => $id
            ]);
        } else {
            $stmt = $db->prepare("
                INSERT INTO blog_posts (slug, title, category, summary, content, author, published_date, status)
                VALUES (:slug, :title, :category, :summary, :content, :author, :pub_date, :status)
            ");
            return $stmt->execute([
                ':slug' => $data['slug'],
                ':title' => $data['title'],
                ':category' => $data['category'],
                ':summary' => $data['summary'],
                ':content' => $data['content'],
                ':author' => $data['author'] ?? 'Dr. Farhan Mustafa',
                ':pub_date' => $data['published_date'] ?? date('Y-m-d'),
                ':status' => $data['status'] ?? 'published'
            ]);
        }
    }
}
