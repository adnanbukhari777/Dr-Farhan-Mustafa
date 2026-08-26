<?php
/**
 * Contact & Inquiries Controller
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Models\ContactModel;

class ContactController
{
    public function handle(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            $res = ContactModel::create($input);
            if (!$res['success']) {
                http_response_code(400);
            }
            echo json_encode($res);
            return;
        }

        if ($method === 'GET') {
            $messages = ContactModel::getAll();
            echo json_encode(['success' => true, 'messages' => $messages]);
            return;
        }

        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
}
