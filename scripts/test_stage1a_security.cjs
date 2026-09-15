/**
 * Stage 1A Security Hardening Regression Test Suite
 * Validates authentication integrity, enumeration defenses, rate limiting, and session security.
 */

const http = require('http');

const BASE_URL = 'http://127.0.0.1:3000';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING STAGE 1A SECURITY REGRESSION SUITE ---\n');
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${extra}`);
      failed++;
    }
  }

  try {
    // 1. Fetch CSRF token
    const csrfRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/csrf',
      method: 'GET',
    });
    assert('CSRF token provisioning', csrfRes.statusCode === 200 && csrfRes.body && csrfRes.body.csrf_token);
    const csrfToken = csrfRes.body.csrf_token;

    // 2. Known email with incorrect password
    const knownFailRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
    }, {
      email: 'doctor@farhanmustafa.com',
      password: 'IncorrectPassword999!',
    });
    assert(
      'Known email with incorrect password returns 401',
      knownFailRes.statusCode === 401
    );
    assert(
      'Known email failure returns generic invalid_credentials error',
      knownFailRes.body.error === 'invalid_credentials' &&
      knownFailRes.body.message === 'Invalid email or password credentials.'
    );

    // 3. Unknown email
    const unknownFailRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
    }, {
      email: 'completely_unknown_user_12345@fakedomain.org',
      password: 'SomePassword123!',
    });
    assert(
      'Unknown email returns 401',
      unknownFailRes.statusCode === 401
    );
    assert(
      'Unknown email returns generic invalid_credentials error',
      unknownFailRes.body.error === 'invalid_credentials' &&
      unknownFailRes.body.message === 'Invalid email or password credentials.'
    );

    // 4. Parity between known and unknown failure responses (Prevents Account Enumeration)
    assert(
      'Identical HTTP status and response payload between known and unknown account failures',
      knownFailRes.statusCode === unknownFailRes.statusCode &&
      knownFailRes.body.error === unknownFailRes.body.error &&
      knownFailRes.body.message === unknownFailRes.body.message
    );

    // 5. Account lockout response does not leak existence
    // Exhaust failed attempts for a test account to trigger internal lockout
    for (let i = 0; i < 5; i++) {
      await request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      }, {
        email: 'lockout.test@healthpro.com.pk',
        password: `WrongPassAttempt${i}!`,
      });
    }

    // Now attempt login on the now locked account
    const lockedRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
    }, {
      email: 'lockout.test@healthpro.com.pk',
      password: 'AnyPasswordAttempt!',
    });

    assert(
      'Internally locked account returns generic 401 invalid_credentials without leaking lockout status',
      lockedRes.statusCode === 401 &&
      lockedRes.body.error === 'invalid_credentials' &&
      !lockedRes.body.error.includes('locked') &&
      !lockedRes.body.message.includes('minute')
    );

    // 6. Logout without active session returns 401
    const unauthLogout = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
    }, {});
    assert(
      'Logout without active session returns 401 unauthenticated',
      unauthLogout.statusCode === 401 && unauthLogout.body.error === 'unauthenticated'
    );

    // 7. Logout with non-POST method returns 405 Method Not Allowed
    const getLogout = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/logout',
      method: 'GET',
    });
    assert(
      'Logout via GET returns 405 Method Not Allowed',
      getLogout.statusCode === 405 && getLogout.body.error === 'method_not_allowed'
    );

    // 8. Log in successfully with valid admin credentials
    const validLogin = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
    }, {
      email: 'admin@healthpro.com.pk',
      password: 'Admin@HealthPro2026!',
    });
    assert(
      'Successful login succeeds with 200 and rotates CSRF token',
      validLogin.statusCode === 200 && validLogin.body.success === true && !!validLogin.body.csrf_token
    );
    const activeCsrfToken = validLogin.body?.csrf_token || csrfToken;

    // 9. Logout with active session but invalid CSRF token returns 403
    const badCsrfLogout = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'fraudulent_csrf_token_xyz',
      },
    }, {});
    assert(
      'Logout with invalid CSRF token returns 403 invalid_csrf',
      badCsrfLogout.statusCode === 403 && badCsrfLogout.body.error === 'invalid_csrf'
    );

    // 10. Valid logout with active session and valid CSRF token
    const validLogout = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': activeCsrfToken,
      },
    }, {
      csrf_token: activeCsrfToken,
    });
    assert(
      'Valid logout returns 200 and omits csrf_token from response',
      validLogout.statusCode === 200 &&
      validLogout.body.success === true &&
      validLogout.body.csrf_token === undefined
    );

    // 11. Verify session is destroyed after logout
    const postLogoutSession = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/auth/session',
      method: 'GET',
    });
    assert(
      'Session is destroyed following logout (GET /api/auth/session returns 401)',
      postLogoutSession.statusCode === 401 && postLogoutSession.body.authenticated === false
    );

    // 12. Security configuration static analysis for PHP implementation
    const fs = require('fs');
    const authPhpContent = fs.readFileSync('hostinger-release/app/Security/Auth.php', 'utf8');
    const authCtrlPhpContent = fs.readFileSync('hostinger-release/app/Controllers/AuthController.php', 'utf8');
    const csrfPhpContent = fs.readFileSync('hostinger-release/app/Security/Csrf.php', 'utf8');

    assert(
      'PHP session.use_strict_mode configured to 1',
      authPhpContent.includes("ini_set('session.use_strict_mode', '1')")
    );
    assert(
      'PHP session.use_only_cookies configured to 1',
      authPhpContent.includes("ini_set('session.use_only_cookies', '1')")
    );
    assert(
      'PHP session.use_trans_sid configured to 0',
      authPhpContent.includes("ini_set('session.use_trans_sid', '0')")
    );
    assert(
      'PHP session cookies configured with HttpOnly and SameSite=Lax',
      authPhpContent.includes("'httponly' => true") &&
      authPhpContent.includes("'samesite' => 'Lax'")
    );
    assert(
      'URL-supplied session IDs stripped before session_start()',
      authPhpContent.includes("unset($_GET[$sessionName])") &&
      authPhpContent.includes("unset($_POST[$sessionName])")
    );
    assert(
      'Client IP resolution uses REMOTE_ADDR by default with filter_var validation',
      authPhpContent.includes("public static function getClientIp(): string") &&
      authPhpContent.includes("filter_var($remoteAddr, FILTER_VALIDATE_IP)") &&
      authPhpContent.includes("getenv('TRUSTED_PROXIES')")
    );
    assert(
      'PHP Logout enforces POST method, active session check, and CSRF token validation',
      authCtrlPhpContent.includes("if ($_SERVER['REQUEST_METHOD'] !== 'POST')") &&
      authCtrlPhpContent.includes("if (!Auth::check())") &&
      authCtrlPhpContent.includes("if (!Csrf::validateToken($token))")
    );
    assert(
      'PHP Logout invalidates CSRF token and empties session',
      authPhpContent.includes("Csrf::invalidateToken()") &&
      authPhpContent.includes("$_SESSION = [];") &&
      csrfPhpContent.includes("public static function invalidateToken(): void")
    );
    assert(
      'PHP Logout response omits csrf_token',
      !authCtrlPhpContent.includes("'csrf_token' => Csrf::getToken(),\n        ], 200);\n    }")
    );
    assert(
      'Database migration 002 exists for audit_logs composite rate limiting indexes',
      fs.existsSync('hostinger-release/database/migrations/002_add_audit_logs_rate_limiting_indexes.sql') &&
      fs.existsSync('php-app/database/migrations/002_add_audit_logs_rate_limiting_indexes.sql')
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`STAGE 1A RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
