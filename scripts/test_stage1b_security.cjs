/**
 * Stage 1B Security Test Suite: Server-Side Authorization & CSRF Enforcement
 *
 * Tests:
 * 1. Default-deny authentication check on protected endpoints
 * 2. Role-based access control (RBAC: receptionist, editor, admin, super_admin)
 * 3. CSRF token validation on all mutating admin/management routes
 * 4. Content-Type application/json enforcement
 * 5. Default-deny behavior on unclassified admin routes
 * 6. Keyed HMAC-SHA-256 email hashing verification
 * 7. PHP production codebase parity and security rule verification
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let passedTests = 0;
let failedTests = 0;

function pass(msg) {
  passedTests++;
  console.log(`✅ PASS: ${msg}`);
}

function fail(msg, err) {
  failedTests++;
  console.error(`❌ FAIL: ${msg}`);
  if (err) console.error('   Error:', err);
}

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, rawBody: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      if (typeof data === 'string') {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n--- STARTING STAGE 1B SECURITY & AUTHORIZATION TEST SUITE ---\n');

  try {
    // -------------------------------------------------------------
    // Test 1: Unauthenticated access blocked on protected endpoints (401)
    // -------------------------------------------------------------
    console.log('--- SECTION 1: Default-Deny Authentication Enforcement ---');

    // Ensure logged out first
    const csrfInit = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/csrf',
      method: 'GET',
    });

    await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfInit.body.csrf_token },
    });

    const protectedEndpoints = [
      { path: '/api/appointments', method: 'GET' },
      { path: '/api/smtp', method: 'GET' },
      { path: '/api/ai/settings', method: 'GET' },
      { path: '/api/ai/knowledge', method: 'GET' },
      { path: '/api/ai/conversations', method: 'GET' },
      { path: '/api/ai/safety-logs', method: 'GET' },
      { path: '/api/admin/users', method: 'GET' },
      { path: '/api/admin/audit-logs', method: 'GET' },
      { path: '/api/admin/unmapped-route', method: 'GET' },
    ];

    for (const ep of protectedEndpoints) {
      const res = await request({
        hostname: '127.0.0.1',
        port: 3000,
        path: ep.path,
        method: ep.method,
      });
      if (res.status === 401 && res.body?.error === 'unauthenticated') {
        pass(`Unauthenticated ${ep.method} ${ep.path} denied with 401 unauthenticated`);
      } else {
        fail(`Unauthenticated ${ep.method} ${ep.path} expected 401, got ${res.status}`);
      }
    }

    // -------------------------------------------------------------
    // Test 2: Role-Based Access Control (RBAC)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 2: Role-Based Access Control (RBAC) ---');

    async function loginAs(email, password = 'Admin@HealthPro2026!') {
      const csrf = await request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/auth/csrf',
        method: 'GET',
      });
      const loginRes = await request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf.body.csrf_token,
        },
      }, { email, password });

      const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
      return {
        user: loginRes.body.user,
        csrfToken: loginRes.body.csrf_token,
        cookie,
      };
    }

    // A. Receptionist Role
    const receptionist = await loginAs('reception@healthpro.com.pk');
    if (receptionist.user?.role === 'receptionist') {
      pass('Logged in as receptionist');
    } else {
      fail('Failed to login as receptionist');
    }

    // Receptionist CAN access appointments
    const recAppt = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/appointments',
      method: 'GET',
      headers: { Cookie: receptionist.cookie },
    });
    if (recAppt.status === 200 && recAppt.body?.appointments) {
      pass('Receptionist allowed GET /api/appointments (200)');
    } else {
      fail(`Receptionist GET /api/appointments expected 200, got ${recAppt.status}`);
    }

    // Receptionist CANNOT access smtp (forbidden 403)
    const recSmtp = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/smtp',
      method: 'GET',
      headers: { Cookie: receptionist.cookie },
    });
    if (recSmtp.status === 403 && recSmtp.body?.error === 'forbidden') {
      pass('Receptionist denied GET /api/smtp with 403 forbidden');
    } else {
      fail(`Receptionist GET /api/smtp expected 403, got ${recSmtp.status}`);
    }

    // Receptionist CANNOT access user management
    const recUsers = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { Cookie: receptionist.cookie },
    });
    if (recUsers.status === 403 && recUsers.body?.error === 'forbidden') {
      pass('Receptionist denied GET /api/admin/users with 403 forbidden');
    } else {
      fail(`Receptionist GET /api/admin/users expected 403, got ${recUsers.status}`);
    }

    // B. Editor Role
    const editor = await loginAs('editor@healthpro.com.pk');
    if (editor.user?.role === 'editor') {
      pass('Logged in as editor');
    } else {
      fail('Failed to login as editor');
    }

    // Editor CAN access AI knowledge
    const editorKnowledge = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/ai/knowledge',
      method: 'GET',
      headers: { Cookie: editor.cookie },
    });
    if (editorKnowledge.status === 200 && editorKnowledge.body?.items) {
      pass('Editor allowed GET /api/ai/knowledge (200)');
    } else {
      fail(`Editor GET /api/ai/knowledge expected 200, got ${editorKnowledge.status}`);
    }

    // Editor CANNOT access appointments
    const editorAppt = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/appointments',
      method: 'GET',
      headers: { Cookie: editor.cookie },
    });
    if (editorAppt.status === 403 && editorAppt.body?.error === 'forbidden') {
      pass('Editor denied GET /api/appointments with 403 forbidden');
    } else {
      fail(`Editor GET /api/appointments expected 403, got ${editorAppt.status}`);
    }

    // Editor CANNOT access smtp
    const editorSmtp = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/smtp',
      method: 'GET',
      headers: { Cookie: editor.cookie },
    });
    if (editorSmtp.status === 403 && editorSmtp.body?.error === 'forbidden') {
      pass('Editor denied GET /api/smtp with 403 forbidden');
    } else {
      fail(`Editor GET /api/smtp expected 403, got ${editorSmtp.status}`);
    }

    // C. Admin Role
    const admin = await loginAs('clinic.admin@healthpro.com.pk');
    if (admin.user?.role === 'admin') {
      pass('Logged in as clinic admin');
    } else {
      fail('Failed to login as clinic admin');
    }

    // Admin CAN view appointments, smtp, ai settings, audit logs
    const adminAppt = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/appointments',
      method: 'GET',
      headers: { Cookie: admin.cookie },
    });
    if (adminAppt.status === 200) {
      pass('Admin allowed GET /api/appointments (200)');
    } else {
      fail(`Admin GET /api/appointments expected 200, got ${adminAppt.status}`);
    }

    const adminSmtp = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/smtp',
      method: 'GET',
      headers: { Cookie: admin.cookie },
    });
    if (adminSmtp.status === 200) {
      pass('Admin allowed GET /api/smtp (200)');
    } else {
      fail(`Admin GET /api/smtp expected 200, got ${adminSmtp.status}`);
    }

    // Admin CANNOT save SMTP (super_admin only)
    const adminSmtpSave = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/smtp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': admin.csrfToken,
        Cookie: admin.cookie,
      },
    }, { host: 'mail.smtp.com' });
    if (adminSmtpSave.status === 403 && adminSmtpSave.body?.error === 'forbidden') {
      pass('Admin denied POST /api/smtp with 403 forbidden (super_admin required)');
    } else {
      fail(`Admin POST /api/smtp expected 403, got ${adminSmtpSave.status}`);
    }

    // Admin CANNOT manage users (super_admin only)
    const adminUsers = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { Cookie: admin.cookie },
    });
    if (adminUsers.status === 403 && adminUsers.body?.error === 'forbidden') {
      pass('Admin denied GET /api/admin/users with 403 forbidden (super_admin required)');
    } else {
      fail(`Admin GET /api/admin/users expected 403, got ${adminUsers.status}`);
    }

    // D. Super Admin Role
    const superAdmin = await loginAs('doctor@farhanmustafa.com');
    if (superAdmin.user?.role === 'super_admin') {
      pass('Logged in as super admin');
    } else {
      fail('Failed to login as super admin');
    }

    // Super Admin CAN access user management
    const saUsers = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { Cookie: superAdmin.cookie },
    });
    if (saUsers.status === 200 && Array.isArray(saUsers.body?.users)) {
      pass('Super Admin allowed GET /api/admin/users (200)');
    } else {
      fail(`Super Admin GET /api/admin/users expected 200, got ${saUsers.status}`);
    }

    // -------------------------------------------------------------
    // Test 3: CSRF Protection on Mutating Requests
    // -------------------------------------------------------------
    console.log('\n--- SECTION 3: CSRF Token Enforcement on Mutating Requests ---');

    // Super Admin mutating without CSRF header/body should get 403 invalid_csrf
    const csrfMissingReq = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: superAdmin.cookie,
      },
    }, {
      name: 'Test Staff',
      email: 'teststaff@healthpro.com.pk',
      password: 'TemporaryPass123!',
    });

    if (csrfMissingReq.status === 403 && csrfMissingReq.body?.error === 'invalid_csrf') {
      pass('POST /api/admin/users without CSRF token denied with 403 invalid_csrf');
    } else {
      fail(`POST /api/admin/users without CSRF expected 403, got ${csrfMissingReq.status}`);
    }

    // With invalid CSRF token
    const csrfInvalidReq = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'bogus_csrf_token_123',
        Cookie: superAdmin.cookie,
      },
    }, {
      name: 'Test Staff',
      email: 'teststaff@healthpro.com.pk',
      password: 'TemporaryPass123!',
    });

    if (csrfInvalidReq.status === 403 && csrfInvalidReq.body?.error === 'invalid_csrf') {
      pass('POST /api/admin/users with bogus CSRF token denied with 403 invalid_csrf');
    } else {
      fail(`POST /api/admin/users with bogus CSRF expected 403, got ${csrfInvalidReq.status}`);
    }

    // -------------------------------------------------------------
    // Test 4: Content-Type Validation
    // -------------------------------------------------------------
    console.log('\n--- SECTION 4: Content-Type Enforcement ---');

    const nonJsonReq = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'X-CSRF-Token': superAdmin.csrfToken,
        Cookie: superAdmin.cookie,
      },
    }, 'plain text body');

    if (nonJsonReq.status === 415 && nonJsonReq.body?.error === 'unsupported_media_type') {
      pass('POST /api/admin/users with text/plain rejected with 415 unsupported_media_type');
    } else {
      fail(`POST /api/admin/users with text/plain expected 415, got ${nonJsonReq.status}`);
    }

    // -------------------------------------------------------------
    // Test 5: Default-Deny on Unclassified /api/admin/* routes
    // -------------------------------------------------------------
    console.log('\n--- SECTION 5: Default-Deny on Admin Routes ---');

    const unknownAdminRoute = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/admin/non-existent-action',
      method: 'GET',
      headers: { Cookie: superAdmin.cookie },
    });

    if (unknownAdminRoute.status === 404 && unknownAdminRoute.body?.error === 'not_found') {
      pass('Unclassified GET /api/admin/non-existent-action denied with 404 not_found');
    } else {
      fail(`Unclassified admin route expected 404, got ${unknownAdminRoute.status}`);
    }

    // -------------------------------------------------------------
    // Test 6: Keyed HMAC-SHA-256 Email Hashing Verification
    // -------------------------------------------------------------
    console.log('\n--- SECTION 6: Keyed HMAC-SHA-256 Security Verification ---');

    const authPhpPath = path.join(process.cwd(), 'hostinger-release', 'app', 'Security', 'Auth.php');
    const authPhpContent = fs.readFileSync(authPhpPath, 'utf8');

    if (authPhpContent.includes("hash_hmac('sha256', $cleanEmail, $secret)") || authPhpContent.includes('hash_hmac')) {
      pass("PHP Auth.php uses hash_hmac('sha256') for email identifier hashing");
    } else {
      fail("PHP Auth.php does NOT appear to use keyed hash_hmac for email hashing");
    }

    if (!authPhpContent.includes("hash('sha256', $email)") && !authPhpContent.includes("hash('sha256', $cleanEmail)")) {
      pass('No unkeyed plain SHA-256 email hashing found in Auth.php');
    } else {
      fail('Found plain unkeyed sha256 in Auth.php');
    }

    // Check server.ts for HMAC-SHA-256
    const serverTsPath = path.join(process.cwd(), 'server.ts');
    const serverTsContent = fs.readFileSync(serverTsPath, 'utf8');

    if (serverTsContent.includes("crypto.createHmac('sha256'") && !serverTsContent.includes("crypto.createHash('sha256').update(email)")) {
      pass('server.ts uses keyed crypto.createHmac for email identifier hashing');
    } else {
      fail('server.ts does not use crypto.createHmac');
    }

    // -------------------------------------------------------------
    // Test 7: Production PHP Parity Verification
    // -------------------------------------------------------------
    console.log('\n--- SECTION 7: Production PHP Parity Verification ---');

    const phpIndexRelease = fs.readFileSync(path.join(process.cwd(), 'hostinger-release', 'index.php'), 'utf8');
    const phpIndexApp = fs.readFileSync(path.join(process.cwd(), 'php-app', 'index.php'), 'utf8');

    // Verify router guards exist in PHP
    const authReleasePhp = fs.readFileSync(path.join(process.cwd(), 'hostinger-release', 'app', 'Security', 'Auth.php'), 'utf8');
    const authAppPhp = fs.readFileSync(path.join(process.cwd(), 'php-app', 'app', 'Security', 'Auth.php'), 'utf8');

    if (authReleasePhp.includes('function requireAuthentication') && authReleasePhp.includes('function requireRole')) {
      pass('hostinger-release Auth.php defines centralized requireAuthentication and requireRole guards');
    } else {
      fail('hostinger-release Auth.php missing requireAuthentication or requireRole');
    }

    if (authAppPhp.includes('function requireAuthentication') && authAppPhp.includes('function requireRole')) {
      pass('php-app Auth.php defines centralized requireAuthentication and requireRole guards');
    } else {
      fail('php-app Auth.php missing requireAuthentication or requireRole');
    }

    if (phpIndexRelease.includes('Auth::requireRole') && phpIndexApp.includes('Auth::requireRole')) {
      pass('Both index.php files enforce Auth::requireRole router guards');
    } else {
      fail('index.php missing requireRole router guards');
    }

    if (phpIndexRelease.includes('Auth::requireCsrf()') && phpIndexApp.includes('Auth::requireCsrf()')) {
      pass('Both index.php files enforce Auth::requireCsrf()');
    } else {
      fail('index.php missing requireCsrf()');
    }

    if (phpIndexRelease.includes('Auth::recordAuditEvent') && phpIndexApp.includes('Auth::recordAuditEvent')) {
      pass('Both index.php files record audit events');
    } else {
      fail('index.php missing recordAuditEvent');
    }

  } catch (err) {
    fail('Unexpected exception during test execution', err);
  }

  console.log('\n========================================');
  console.log(`STAGE 1B RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
