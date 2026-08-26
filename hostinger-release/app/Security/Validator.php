<?php
/**
 * Data Sanitization & Input Validation Helper
 */

declare(strict_types=1);

namespace App\Security;

class Validator
{
    public static function sanitizeString(?string $value): string
    {
        if ($value === null) return '';
        return trim(strip_tags($value));
    }

    public static function sanitizeHtml(?string $value): string
    {
        if ($value === null) return '';
        // Allow safe formatting tags for CMS rich text
        return trim(strip_tags($value, '<p><br><strong><em><b><i><u><ul><ol><li><h3><h4><h5><blockquote><a>'));
    }

    public static function isValidEmail(?string $email): bool
    {
        if (empty($email)) return false;
        return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public static function isValidPhone(?string $phone): bool
    {
        if (empty($phone)) return false;
        // Supports Pakistani and international phone formats
        $clean = preg_replace('/[\s\-\(\)\+]/', '', $phone);
        return strlen($clean) >= 10 && strlen($clean) <= 15 && ctype_digit($clean);
    }

    public static function slugify(string $text): string
    {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        return empty($text) ? 'item-' . time() : $text;
    }
}
