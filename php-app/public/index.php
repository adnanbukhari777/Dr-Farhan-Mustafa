<?php
/**
 * Dr. Farhan Mustafa - Official Clinic Website
 * Front Controller & Routing Engine (PHP 8.1+)
 */

declare(strict_types=1);

// Prevent direct script execution issues
define('APP_ROOT', dirname(__DIR__));

// Load configuration
require_once APP_ROOT . '/app/Config/Config.php';
require_once APP_ROOT . '/app/Config/Database.php';

// Autoload / Model & Controller dependencies
require_once APP_ROOT . '/app/Models/AiKnowledgeModel.php';
require_once APP_ROOT . '/app/Models/AiLogModel.php';
require_once APP_ROOT . '/app/Services/GeminiService.php';
require_once APP_ROOT . '/app/Controllers/AiController.php';

// Simple URL Dispatcher
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
$route = '/' . trim(str_replace($basePath, '', $requestUri), '/');

// Handle API Routes
if (strpos($route, '/api/ai') === 0 || $route === '/api/receptionist') {
    $db = \App\Config\Database::getConnection();
    $aiCtrl = new \App\Controllers\AiController($db);
    $method = $_SERVER['REQUEST_METHOD'];

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

// Handle empty route as home
if ($route === '/' || $route === '') {
    $route = '/home';
}

// Router mapping
$routes = [
    '/home' => 'home.php',
    '/about' => 'about.php',
    '/services' => 'services.php',
    '/service-detail' => 'service-detail.php',
    '/appointments' => 'appointments.php',
    '/fees' => 'fees.php',
    '/patient-forms' => 'patient-forms.php',
    '/resources' => 'resources.php',
    '/reviews' => 'reviews.php',
    '/blog' => 'blog.php',
    '/contact' => 'contact.php',
    '/privacy' => 'privacy.php',
    '/terms' => 'terms.php',
    '/disclaimer' => 'disclaimer.php',
];

// Clean slug-based matching or 404
$viewFile = $routes[$route] ?? null;

if (!$viewFile) {
    http_response_code(404);
    $pageTitle = "Page Not Found | Dr. Farhan Mustafa";
    require_once APP_ROOT . '/app/Views/layouts/header.php';
    echo '<div class="container py-5 text-center"><h1>404 - Page Not Found</h1><p>The requested page does not exist.</p><a href="' . $basePath . '/home" class="btn btn-primary">Return to Home</a></div>';
    require_once APP_ROOT . '/app/Views/layouts/footer.php';
    exit;
}

// Load Page View
require_once APP_ROOT . '/app/Views/pages/' . $viewFile;
