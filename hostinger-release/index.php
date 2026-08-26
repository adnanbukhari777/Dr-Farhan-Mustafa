<?php
/**
 * Dr. Farhan Mustafa - Official Medical Practice Portal (Hostinger Production)
 * Unified Front Controller, API Router & SPA Host (PHP 8.1+)
 */

declare(strict_types=1);

// Define Base Paths
define('APP_ROOT', __DIR__);

// Load Environment & Configuration
require_once APP_ROOT . '/app/Config/EnvLoader.php';
require_once APP_ROOT . '/app/Config/Config.php';
require_once APP_ROOT . '/app/Config/Database.php';

// Load Security Helpers
require_once APP_ROOT . '/app/Security/Auth.php';
require_once APP_ROOT . '/app/Security/Csrf.php';
require_once APP_ROOT . '/app/Security/Mailer.php';
require_once APP_ROOT . '/app/Security/Validator.php';

// Load Models
require_once APP_ROOT . '/app/Models/UserModel.php';
require_once APP_ROOT . '/app/Models/SettingModel.php';
require_once APP_ROOT . '/app/Models/ServiceModel.php';
require_once APP_ROOT . '/app/Models/ScheduleModel.php';
require_once APP_ROOT . '/app/Models/AppointmentModel.php';
require_once APP_ROOT . '/app/Models/ContactModel.php';
require_once APP_ROOT . '/app/Models/AiKnowledgeModel.php';
require_once APP_ROOT . '/app/Models/AiLogModel.php';

// Load Services & Controllers
require_once APP_ROOT . '/app/Services/GeminiService.php';
require_once APP_ROOT . '/app/Controllers/AuthController.php';
require_once APP_ROOT . '/app/Controllers/AppointmentController.php';
require_once APP_ROOT . '/app/Controllers/ContactController.php';
require_once APP_ROOT . '/app/Controllers/SmtpController.php';
require_once APP_ROOT . '/app/Controllers/AiController.php';

// Parse Request URI
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '/index.php';
$basePath = rtrim(dirname($scriptName), '/');
$route = '/' . trim(str_replace($basePath, '', $requestUri), '/');

// Normalize empty or index.php route
if ($route === '/index.php' || $route === '') {
    $route = '/';
}

// -----------------------------------------------------------------------------
// 1. API ROUTING ENGINE (/api/*)
// -----------------------------------------------------------------------------
if (str_starts_with($route, '/api/')) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    $method = $_SERVER['REQUEST_METHOD'];

    // Health Check Endpoint
    if ($route === '/api/health') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'status' => 'healthy',
            'timestamp' => date('c'),
            'service' => 'Dr. Farhan Mustafa Clinic Portal',
            'php_version' => PHP_VERSION,
            'database' => \App\Config\Database::getConnection() !== null ? 'connected' : 'disconnected'
        ]);
        exit;
    }

    // AI Receptionist Endpoints
    if (str_starts_with($route, '/api/ai') || $route === '/api/receptionist') {
        $db = \App\Config\Database::getConnection();
        $aiCtrl = new \App\Controllers\AiController($db);

        if ($route === '/api/ai/chat' || $route === '/api/receptionist') {
            if ($method === 'POST') {
                $aiCtrl->chat();
                exit;
            }
        } elseif ($route === '/api/ai/settings') {
            if ($method === 'POST') {
                $aiCtrl->updateSettings();
            } else {
                $aiCtrl->getSettings();
            }
            exit;
        } elseif ($route === '/api/ai/knowledge') {
            if ($method === 'POST') {
                $aiCtrl->saveKnowledge();
            } else {
                $aiCtrl->getKnowledge();
            }
            exit;
        } elseif (preg_match('#^/api/ai/knowledge/(\d+)$#', $route, $matches)) {
            if ($method === 'DELETE') {
                $aiCtrl->deleteKnowledge((int)$matches[1]);
                exit;
            }
        } elseif ($route === '/api/ai/conversations') {
            $aiCtrl->getConversations();
            exit;
        } elseif ($route === '/api/ai/safety-logs') {
            $aiCtrl->getSafetyLogs();
            exit;
        } elseif ($route === '/api/ai/purge') {
            if ($method === 'POST') {
                $aiCtrl->purgeLogs();
                exit;
            }
        }
    }

    // Appointment Booking Endpoints
    if (str_starts_with($route, '/api/appointments')) {
        $appCtrl = new \App\Controllers\AppointmentController();

        if ($route === '/api/appointments/slots' && $method === 'GET') {
            $appCtrl->getSlots();
            exit;
        } elseif ($route === '/api/appointments/lookup' && $method === 'POST') {
            $appCtrl->lookup();
            exit;
        } elseif ($route === '/api/appointments/reschedule' && $method === 'POST') {
            $appCtrl->reschedule();
            exit;
        } elseif ($route === '/api/appointments/cancel' && $method === 'POST') {
            $appCtrl->cancel();
            exit;
        } elseif ($route === '/api/appointments/intake' && $method === 'POST') {
            $appCtrl->saveIntake();
            exit;
        } elseif ($route === '/api/appointments/types' && $method === 'GET') {
            $appCtrl->getTypes();
            exit;
        } elseif ($route === '/api/appointments' && $method === 'POST') {
            $appCtrl->book();
            exit;
        } elseif ($route === '/api/appointments' && $method === 'GET') {
            $appCtrl->list();
            exit;
        } elseif (preg_match('#^/api/appointments/(\d+)/notes$#', $route, $matches)) {
            if ($method === 'POST') {
                $appCtrl->addNote();
                exit;
            }
        } elseif (preg_match('#^/api/appointments/(\d+)$#', $route, $matches)) {
            if ($method === 'PATCH' || $method === 'POST') {
                $appCtrl->updateStatus();
                exit;
            }
        }
    }

    // Schedule Rules
    if ($route === '/api/schedules/rules' && $method === 'GET') {
        $appCtrl = new \App\Controllers\AppointmentController();
        $appCtrl->getRules();
        exit;
    }

    // SMTP Settings & Test
    if (str_starts_with($route, '/api/smtp') || $route === '/api/admin/smtp/test') {
        $smtpCtrl = new \App\Controllers\SmtpController();
        if ($route === '/api/smtp/test' || $route === '/api/admin/smtp/test') {
            $smtpCtrl->testEmail();
            exit;
        } elseif ($method === 'POST') {
            $smtpCtrl->saveSettings();
            exit;
        } else {
            $smtpCtrl->getSettings();
            exit;
        }
    }

    // Contact Inquiries
    if ($route === '/api/contact') {
        $contactCtrl = new \App\Controllers\ContactController();
        $contactCtrl->handle();
        exit;
    }

    // Admin Auth
    if ($route === '/api/auth/login' && $method === 'POST') {
        $authCtrl = new \App\Controllers\AuthController();
        $authCtrl->login();
        exit;
    }

    // 404 for unmatched API routes
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'API endpoint not found', 'route' => $route]);
    exit;
}

// -----------------------------------------------------------------------------
// 2. PRODUCTION SPA FRONTEND DELIVERY
// -----------------------------------------------------------------------------
// Read index.html or output complete optimized HTML shell
$distHtmlPath = APP_ROOT . '/index.html';
if (file_exists($distHtmlPath)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($distHtmlPath);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dr. Farhan Mustafa | Consultant Physician &amp; Internal Medicine Specialist Lahore</title>
    <meta name="description" content="Official website of Dr. Farhan Mustafa (FCPS, MRCP UK). Consultant Physician and Internal Medicine Specialist at HealthPro Medical Complex, Faisal Town, Lahore. Expert management for Diabetes, Hypertension, and adult illnesses." />
    <meta name="keywords" content="Dr Farhan Mustafa, Consultant Physician Lahore, Internal Medicine Specialist, Diabetes Doctor Faisal Town, MBBS FCPS MRCP" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://healthpro.com.pk/" />

    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Dr. Farhan Mustafa | Consultant Physician Lahore" />
    <meta property="og:description" content="Official website of Dr. Farhan Mustafa (FCPS, MRCP UK). Consultant Physician &amp; Internal Medicine Specialist at HealthPro Medical Complex, Faisal Town, Lahore." />
    <meta property="og:image" content="/assets/images/doctor/dr-farhan-about.jpg" />
    <meta property="og:url" content="https://healthpro.com.pk/" />

    <!-- Favicon & Fonts -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🩺</text></svg>" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet" />

    <!-- Compiled Production Stylesheet & Scripts -->
    <?php
    $cssFile = glob(APP_ROOT . '/assets/index-*.css');
    if (!empty($cssFile)) {
        $cssName = basename($cssFile[0]);
        echo '<link rel="stylesheet" href="/assets/' . htmlspecialchars($cssName) . '" />' . "\n";
    }
    ?>
</head>
<body class="bg-[#FAFAFA] text-[#0A0A0A] font-sans antialiased selection:bg-[#2097A2] selection:text-white">
    <div id="root"></div>

    <?php
    $jsFile = glob(APP_ROOT . '/assets/index-*.js');
    if (!empty($jsFile)) {
        $jsName = basename($jsFile[0]);
        echo '<script type="module" src="/assets/' . htmlspecialchars($jsName) . '"></script>' . "\n";
    }
    ?>
</body>
</html>
