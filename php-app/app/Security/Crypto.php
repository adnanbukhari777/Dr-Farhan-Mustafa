<?php
/**
 * Application Cryptographic Services
 * Provides authenticated symmetric encryption (AES-256-GCM) for sensitive clinical intake data at rest.
 * Features:
 * - Deterministic authenticated encryption with random 96-bit IV and 128-bit MAC tag.
 * - Key derivation via SHA-256 from environment CLINICAL_ENCRYPTION_KEY / AUTH_HMAC_SECRET.
 * - Versioned envelope prefix ('enc:v1:') for safe migration and forward compatibility.
 * - Graceful legacy handling: unencrypted plaintext is returned safely without failure.
 */

declare(strict_types=1);

namespace App\Security;

use App\Config\EnvLoader;
use RuntimeException;

class Crypto
{
    private const CIPHER = 'aes-256-gcm';
    private const PREFIX = 'enc:v1:';
    private const IV_BYTES = 12; // 96-bit IV recommended for GCM
    private const TAG_BYTES = 16; // 128-bit authentication tag

    /**
     * Derive a 32-byte binary key from the environment configuration.
     */
    private static function getKey(): string
    {
        $rawSecret = (string)(EnvLoader::get('CLINICAL_ENCRYPTION_KEY') ?: EnvLoader::get('AUTH_HMAC_SECRET') ?: EnvLoader::get('APP_KEY'));
        if (empty($rawSecret)) {
            $isDev = (EnvLoader::get('APP_ENV', 'production') !== 'production');
            if ($isDev) {
                $rawSecret = 'drfarhan_clinic_aes256gcm_clinical_key_2026_x9z4';
            } else {
                throw new RuntimeException('CLINICAL_ENCRYPTION_KEY must be configured in environment.');
            }
        }

        return hash('sha256', $rawSecret, true);
    }

    /**
     * Encrypt a sensitive plaintext string at rest using AES-256-GCM.
     * Returns an envelope string: "enc:v1:<base64(iv . tag . ciphertext)>".
     */
    public static function encrypt(?string $plaintext): ?string
    {
        if ($plaintext === null || $plaintext === '') {
            return $plaintext;
        }

        // Avoid re-encrypting already encrypted payloads
        if (str_starts_with($plaintext, self::PREFIX)) {
            return $plaintext;
        }

        $key = self::getKey();
        $iv = random_bytes(self::IV_BYTES);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            self::TAG_BYTES
        );

        if ($ciphertext === false) {
            throw new RuntimeException('Clinical encryption failed: ' . openssl_error_string());
        }

        $payload = $iv . $tag . $ciphertext;
        return self::PREFIX . base64_encode($payload);
    }

    /**
     * Decrypt a sensitive ciphertext envelope string using AES-256-GCM.
     * If the payload is unencrypted (legacy data), returns the string as-is.
     */
    public static function decrypt(?string $payload): ?string
    {
        if ($payload === null || $payload === '') {
            return $payload;
        }

        // Return legacy unencrypted strings as-is
        if (!str_starts_with($payload, self::PREFIX)) {
            return $payload;
        }

        $encoded = substr($payload, strlen(self::PREFIX));
        $raw = base64_decode($encoded, true);
        if ($raw === false || strlen($raw) < (self::IV_BYTES + self::TAG_BYTES)) {
            return '[Decryption Error: Corrupt Payload]';
        }

        $iv = substr($raw, 0, self::IV_BYTES);
        $tag = substr($raw, self::IV_BYTES, self::TAG_BYTES);
        $ciphertext = substr($raw, self::IV_BYTES + self::TAG_BYTES);

        $key = self::getKey();
        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            return '[Decryption Error: Authentication Tag Mismatch]';
        }

        return $plaintext;
    }

    /**
     * Check if a given string has the encrypted envelope format.
     */
    public static function isEncrypted(?string $value): bool
    {
        return $value !== null && str_starts_with($value, self::PREFIX);
    }
}
