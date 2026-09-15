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
require_once APP_ROOT . '/app/Security/Crypto.php';
require_once APP_ROOT . '/app/Security/Auth.php';
require_once APP_ROOT . '/app/Security/Csrf.php';
require_once APP_ROOT . '/app/Security/Mailer.php';
require_once APP_ROOT . '/app/Security/Validator.php';

// Load Models
require_once APP_ROOT . '/app/Models/AuditModel.php';
require_once APP_ROOT . '/app/Models/UserModel.php';
require_once APP_ROOT . '/app/Models/SettingModel.php';
require_once APP_ROOT . '/app/Models/ServiceModel.php';
require_once APP_ROOT . '/app/Models/ScheduleModel.php';
require_once APP_ROOT . '/app/Models/AppointmentModel.php';
require_once APP_ROOT . '/app/Models/ContactModel.php';
require_once APP_ROOT . '/app/Models/AiKnowledgeModel.php';
require_once APP_ROOT . '/app/Models/AiLogModel.php';
require_once APP_ROOT . '/app/Models/VerificationModel.php';

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
if ($basePath === '/api' || str_ends_with($basePath, '/api')) {
    $basePath = substr($basePath, 0, -4);
}
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
        \App\Controllers\AppointmentController::denyEditor();
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
        } elseif ($route === '/api/appointments/export' && $method === 'GET') {
            $appCtrl->export();
            exit;
        } elseif ($route === '/api/appointments' && $method === 'POST') {
            $appCtrl->book();
            exit;
        } elseif ($route === '/api/appointments' && $method === 'GET') {
            $appCtrl->list();
            exit;
        } elseif (preg_match('#^/api/appointments/(\d+)/clinical/review$#', $route, $matches)) {
            if ($method === 'POST') {
                $appCtrl->reviewClinicalIntake((int)$matches[1]);
                exit;
            }
        } elseif (preg_match('#^/api/appointments/(\d+)/clinical$#', $route, $matches)) {
            if ($method === 'GET') {
                $appCtrl->getClinicalIntake((int)$matches[1]);
                exit;
            }
        } elseif (preg_match('#^/api/appointments/(\d+)/history$#', $route, $matches)) {
            if ($method === 'GET') {
                $appCtrl->getHistory((int)$matches[1]);
                exit;
            }
        } elseif (preg_match('#^/api/appointments/(\d+)/print$#', $route, $matches)) {
            if ($method === 'GET') {
                $appCtrl->printAppointment((int)$matches[1]);
                exit;
            }
        } elseif (preg_match('#^/api/appointments/(\d+)/notes$#', $route, $matches)) {
            if ($method === 'POST') {
                $appCtrl->addNote((int)$matches[1]);
                exit;
            }
        } elseif ($route === '/api/appointments/notes' && $method === 'POST') {
            header('X-Deprecated: Route /api/appointments/notes is deprecated. Use POST /api/appointments/{id}/notes instead.');
            $appCtrl->addNote();
            exit;
        } elseif (preg_match('#^/api/appointments/(\d+)$#', $route, $matches)) {
            if ($method === 'GET') {
                $appCtrl->get((int)$matches[1]);
                exit;
            } elseif ($method === 'PATCH' || $method === 'POST') {
                $appCtrl->updateStatus((int)$matches[1]);
                exit;
            }
        } elseif ($route === '/api/appointments/status' && ($method === 'PATCH' || $method === 'POST')) {
            header('X-Deprecated: Route /api/appointments/status is deprecated. Use PATCH /api/appointments/{id} instead.');
            $appCtrl->updateStatus();
            exit;
        }
    }

    // Schedule Rules & Management
    if (str_starts_with($route, '/api/schedules')) {
        $appCtrl = new \App\Controllers\AppointmentController();
        if ($route === '/api/schedules/rules' && $method === 'GET') {
            $appCtrl->getRules();
            exit;
        } elseif ($route === '/api/schedules/blocked-slots' && $method === 'POST') {
            $appCtrl->addBlockedSlot();
            exit;
        } elseif (preg_match('#^/api/schedules/blocked-slots/(\d+)$#', $route, $matches) && $method === 'DELETE') {
            $appCtrl->deleteBlockedSlot((int)$matches[1]);
            exit;
        } elseif ($route === '/api/schedules/holidays' && $method === 'POST') {
            $appCtrl->addHoliday();
            exit;
        }
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

    // System Settings & CMS Content
    if ($route === '/api/settings' || $route === '/api/admin/settings') {
        if ($method === 'GET') {
            $settings = \App\Models\SettingModel::getAll();
            \App\Security\Auth::jsonResponse(['success' => true, 'settings' => $settings]);
        } elseif ($method === 'POST' || $method === 'PUT') {
            \App\Security\Auth::requireRole([\App\Security\Auth::ROLE_EDITOR, \App\Security\Auth::ROLE_ADMIN, \App\Security\Auth::ROLE_SUPER_ADMIN]);
            \App\Security\Auth::requireCsrf();
            $input = \App\Security\Auth::requireJsonRequest();
            $key = (string)($input['key'] ?? '');
            $val = (string)($input['value'] ?? '');
            $group = (string)($input['group'] ?? 'general');
            if (empty($key)) {
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Setting key is required.'], 400);
            }
            $saved = \App\Models\SettingModel::set($key, $val, $group);
            if ($saved) {
                \App\Security\Auth::recordAuditEvent('setting_updated', 'setting', $key, ['group' => $group]);
                \App\Security\Auth::jsonResponse(['success' => true, 'message' => 'Setting saved successfully.']);
            }
            \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'save_failed', 'message' => 'Failed to save setting.'], 500);
        }
    }

    // User Management (Super Admin only)
    if (str_starts_with($route, '/api/admin/users')) {
        \App\Security\Auth::requireRole(\App\Security\Auth::ROLE_SUPER_ADMIN);

        if ($route === '/api/admin/users' && $method === 'GET') {
            $users = \App\Models\UserModel::getAll();
            \App\Security\Auth::jsonResponse(['success' => true, 'users' => $users]);
        } elseif ($route === '/api/admin/users' && $method === 'POST') {
            \App\Security\Auth::requireCsrf();
            $input = \App\Security\Auth::requireJsonRequest();
            $allowed = ['name', 'email', 'password', 'role', 'status', 'phone'];
            $filtered = array_intersect_key($input, array_flip($allowed));

            if (empty($filtered['name']) || empty($filtered['email']) || empty($filtered['password'])) {
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Name, email, and password are required.'], 400);
            }

            $email = strtolower(trim((string)$filtered['email']));
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Invalid email address.'], 400);
            }

            // Check duplicate email
            $existing = \App\Models\UserModel::getByEmail($email);
            if ($existing) {
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'conflict', 'message' => 'A user with this email address already exists.'], 409);
            }

            $createdId = \App\Models\UserModel::create($filtered);
            if ($createdId) {
                \App\Security\Auth::recordAuditEvent('user_created', 'user', (string)$createdId, ['email' => $email, 'role' => $filtered['role'] ?? 'receptionist']);
                $newUser = \App\Models\UserModel::getById($createdId);
                \App\Security\Auth::jsonResponse(['success' => true, 'message' => 'User created successfully.', 'user' => $newUser], 201);
            }
            \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'creation_failed', 'message' => 'Failed to create user.'], 500);
        } elseif (preg_match('#^/api/admin/users/(\d+)$#', $route, $matches)) {
            $userId = (int)$matches[1];
            $existing = \App\Models\UserModel::getById($userId);
            if (!$existing) {
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'User record not found.'], 404);
            }

            if ($method === 'PUT' || $method === 'PATCH') {
                \App\Security\Auth::requireCsrf();
                $input = \App\Security\Auth::requireJsonRequest();
                $allowed = ['name', 'email', 'password', 'role', 'status', 'phone'];
                $filtered = array_intersect_key($input, array_flip($allowed));

                if (isset($filtered['email'])) {
                    $newEmail = strtolower(trim((string)$filtered['email']));
                    if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
                        \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Invalid email address.'], 400);
                    }
                    if ($newEmail !== strtolower($existing['email'])) {
                        $duplicate = \App\Models\UserModel::getByEmail($newEmail);
                        if ($duplicate && (int)$duplicate['id'] !== $userId) {
                            \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'conflict', 'message' => 'A user with this email address already exists.'], 409);
                        }
                    }
                }

                $updated = \App\Models\UserModel::update($userId, $filtered);
                if ($updated) {
                    \App\Security\Auth::recordAuditEvent('user_updated', 'user', (string)$userId, ['role' => $filtered['role'] ?? null]);
                    $refreshed = \App\Models\UserModel::getById($userId);
                    \App\Security\Auth::jsonResponse(['success' => true, 'message' => 'User updated successfully.', 'user' => $refreshed]);
                }
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'update_failed', 'message' => 'Failed to update user.'], 500);
            } elseif ($method === 'DELETE') {
                \App\Security\Auth::requireCsrf();
                $currentUser = \App\Security\Auth::user();
                if ($currentUser && (int)$currentUser['id'] === $userId) {
                    \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'forbidden', 'message' => 'Cannot delete your own account.'], 403);
                }
                $deleted = \App\Models\UserModel::delete($userId);
                if ($deleted) {
                    \App\Security\Auth::recordAuditEvent('user_deleted', 'user', (string)$userId);
                    \App\Security\Auth::jsonResponse(['success' => true, 'message' => 'User deleted successfully.']);
                }
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'delete_failed', 'message' => 'Failed to delete user or cannot delete last super admin.'], 400);
            }
        }
    }

    // Verification Queue (Facts Verification)
    if (str_starts_with($route, '/api/admin/verification')) {
        $user = \App\Security\Auth::requireRole([\App\Security\Auth::ROLE_EDITOR, \App\Security\Auth::ROLE_ADMIN, \App\Security\Auth::ROLE_SUPER_ADMIN]);

        if ($route === '/api/admin/verification' && $method === 'GET') {
            $items = \App\Models\VerificationModel::getAll();
            $pendingCount = \App\Models\VerificationModel::getPendingCount();
            \App\Security\Auth::jsonResponse([
                'success' => true,
                'items' => $items,
                'pending_count' => $pendingCount
            ]);
        } elseif (preg_match('#^/api/admin/verification/(\d+)$#', $route, $matches)) {
            $itemId = (int)$matches[1];
            $existing = \App\Models\VerificationModel::getById($itemId);
            if (!$existing) {
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Verification item not found.'], 404);
            }

            if ($method === 'PATCH' || $method === 'POST') {
                \App\Security\Auth::requireCsrf();
                $input = \App\Security\Auth::requireJsonRequest();
                $allowed = ['status', 'suggested_value', 'admin_notes'];
                $filtered = array_intersect_key($input, array_flip($allowed));

                $status = (string)($filtered['status'] ?? $existing['status']);
                $validStatuses = ['pending_verification', 'needs_doctor_approval', 'verified', 'rejected'];
                if (!in_array($status, $validStatuses, true)) {
                    \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'validation_error', 'message' => 'Invalid verification status.'], 400);
                }

                $suggestedValue = isset($filtered['suggested_value']) ? (string)$filtered['suggested_value'] : null;
                $adminNotes = isset($filtered['admin_notes']) ? (string)$filtered['admin_notes'] : null;
                $verifiedBy = $user['name'] . ' (' . ucfirst(str_replace('_', ' ', $user['role'])) . ')';

                $ok = \App\Models\VerificationModel::updateStatus($itemId, $status, $suggestedValue, $adminNotes, $verifiedBy);
                if ($ok) {
                    \App\Security\Auth::recordAuditEvent('verification_queue_updated', 'verification', (string)$itemId, [
                        'status' => $status,
                        'verified_by' => $verifiedBy
                    ]);
                    $refreshed = \App\Models\VerificationModel::getById($itemId);
                    \App\Security\Auth::jsonResponse(['success' => true, 'message' => 'Verification item updated successfully.', 'item' => $refreshed]);
                }
                \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'update_failed', 'message' => 'Failed to update verification item.'], 500);
            }
        }
    }

    // Audit Logs (Super Admin only)
    if ($route === '/api/admin/audit-logs' && $method === 'GET') {
        \App\Security\Auth::requireRole(\App\Security\Auth::ROLE_SUPER_ADMIN);
        $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
        $logs = \App\Models\AuditModel::getRecent($limit);
        // Mask any sensitive keys if present in details
        $sanitized = array_map(function($log) {
            if (!empty($log['details_json'])) {
                $decoded = json_decode($log['details_json'], true);
                if (is_array($decoded)) {
                    foreach (['password', 'secret', 'token', 'key'] as $k) {
                        if (isset($decoded[$k])) $decoded[$k] = '••••••••';
                    }
                    $log['details_json'] = json_encode($decoded);
                }
            }
            return $log;
        }, $logs);
        \App\Security\Auth::jsonResponse(['success' => true, 'logs' => $sanitized]);
    }

    // Default-deny behavior for any unclassified or unmatched /api/admin/* routes
    if (str_starts_with($route, '/api/admin/')) {
        \App\Security\Auth::requireRole([\App\Security\Auth::ROLE_ADMIN, \App\Security\Auth::ROLE_SUPER_ADMIN]);
        \App\Security\Auth::jsonResponse(['success' => false, 'error' => 'not_found', 'message' => 'Admin route not found.'], 404);
    }

    // Admin Auth API Endpoints (Stage 1A)
    if (strpos($route, '/api/auth/') === 0) {
        $authCtrl = new \App\Controllers\AuthController();
        if ($route === '/api/auth/csrf' && $method === 'GET') {
            $authCtrl->csrf();
            exit;
        } elseif ($route === '/api/auth/login' && $method === 'POST') {
            $authCtrl->login();
            exit;
        } elseif ($route === '/api/auth/session' && $method === 'GET') {
            $authCtrl->session();
            exit;
        } elseif ($route === '/api/auth/logout') {
            $authCtrl->logout();
            exit;
        }
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
