<?php
/**
 * Application Configuration & Clinic Constants
 * Strict single source of truth for Dr. Farhan Mustafa's clinic details.
 */

declare(strict_types=1);

namespace App\Config;

require_once __DIR__ . '/EnvLoader.php';

// Ensure Pakistan Standard Time (PKT, UTC+5) is the application-wide timezone
date_default_timezone_set('Asia/Karachi');

class Config
{
    // Application Timezone
    public const TIMEZONE = 'Asia/Karachi';
    public const TIMEZONE_LABEL = 'PKT (Pakistan Standard Time, UTC+5)';

    // Clinic Master Information (Confirmed Data Only)
    public const DOCTOR_NAME = 'Dr. Farhan Mustafa';
    public const DOCTOR_TITLE = 'Consultant Physician & Internal Medicine Specialist';
    public const DOCTOR_CREDENTIALS = 'MBBS, FCPS (Medicine), MRCP (UK)';
    public const PMDC_NUMBER = '57317-P';

    public const CLINIC_NAME = 'HealthPro Medical Complex';
    public const ADDRESS_LINE_1 = '860-B, Block B';
    public const ADDRESS_LINE_2 = 'Faisal Town, Lahore 54000, Pakistan';
    public const FULL_ADDRESS = '860-B, Block B, Faisal Town, Lahore 54000, Pakistan';
    public const PLUS_CODE = 'H8R6+CQ Lahore';
    public const GOOGLE_PLACE_ID = 'ChIJM61e7jMHKz4RF1eM07x6_3s';
    public const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/rAKkEXXdU1rMG2nB6';

    public const PHONE_DISPLAY = '0328 0145670';
    public const PHONE_INTL = '+923280145670';
    public const WHATSAPP_DISPLAY = '0328 0145670';
    public const WHATSAPP_URL = 'https://wa.me/923280145670';

    public const GOOGLE_RATING = 5.0;
    public const GOOGLE_REVIEW_COUNT = 263;
    public const RATING_VERIFIED_DATE = '18 August 2026';

    public const EMERGENCY_NUMBER = '1122';

    // 7 Required Appointment Statuses
    public const STATUS_NEW = 'new';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_RESCHEDULED = 'rescheduled';
    public const STATUS_CHECKED_IN = 'checked_in';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_NO_SHOW = 'no_show';

    public const ALL_STATUSES = [
        self::STATUS_NEW => 'New',
        self::STATUS_CONFIRMED => 'Confirmed',
        self::STATUS_RESCHEDULED => 'Rescheduled',
        self::STATUS_CHECKED_IN => 'Checked In',
        self::STATUS_COMPLETED => 'Completed',
        self::STATUS_CANCELLED => 'Cancelled',
        self::STATUS_NO_SHOW => 'No Show',
    ];

    // Primary Brand Colors
    public const COLOR_PRIMARY = '#2097A2';
    public const COLOR_AQUA = '#27BAC8';
    public const COLOR_LIGHT_AQUA = '#A4E0E5';
    public const COLOR_BLACK = '#0A0A0A';
    public const COLOR_BG_LIGHT = '#FAFAFA';

    /**
     * Helper to get database connection credentials
     */
    public static function getDbConfig(): array
    {
        return [
            'host' => EnvLoader::get('DB_HOST', 'localhost'),
            'port' => (int)EnvLoader::get('DB_PORT', 3306),
            'database' => EnvLoader::get('DB_NAME', 'drfarhan_clinic'),
            'username' => EnvLoader::get('DB_USER', 'root'),
            'password' => EnvLoader::get('DB_PASS', ''),
            'socket' => EnvLoader::get('DB_SOCKET', ''),
            'charset' => 'utf8mb4'
        ];
    }
}

