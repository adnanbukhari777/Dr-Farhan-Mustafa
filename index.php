<?php
/**
 * Hostinger Git-deployment entry point.
 *
 * The repository root contains the development source. Hostinger deploys that
 * root to public_html, while the production-ready PHP application lives in
 * hostinger-release/. Keep this thin adapter so the live server always uses
 * the compiled PHP release rather than attempting to load Vite source files.
 */

declare(strict_types=1);

require __DIR__ . '/hostinger-release/index.php';
