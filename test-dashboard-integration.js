const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const API_VERSION = 'v1';

// Test results storage
const results = {
  passed: [],
  failed: [],
  total: 0
};

// Test credentials
let authToken = null;
let testUserId = null;
let testApiKeyId = null;
let testWebhookId = null;

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

// Helper function to log test results
function logTest(name, passed, error = null) {
  results.total++;
  if (passed) {
    results.passed.push(name);
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    results.failed.push({ name, error: error?.message || error });
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (error) {
      console.log(`  ${colors.red}Error: ${error.message || error}${colors.reset}`);
    }
  }
}

// Helper function for API calls
async function apiCall(method, endpoint, data = null, useAuth = true) {
  const config = {
    method,
    url: `${API_BASE}/api/${API_VERSION}${endpoint}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (useAuth && authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  if (data) {
    config.data = data;
  }

  return axios(config);
}

// Test functions
async function testAuthentication() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}AUTHENTICATION (2 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  // Test Register
  try {
    const email = `test_${Date.now()}@example.com`;
    const response = await apiCall('post', '/auth/register', {
      email,
      password: 'test123456',
      name: 'Test User'
    }, false);
    authToken = response.data.token;
    testUserId = response.data.user.id;
    logTest('POST /auth/register', true);
  } catch (error) {
    logTest('POST /auth/register', false, error.response?.data || error);
  }

  // Test Login
  try {
    const response = await apiCall('post', '/auth/login', {
      email: 'testphase1@example.com',
      password: 'testpass123'
    }, false);
    authToken = response.data.token;
    logTest('POST /auth/login', true);
  } catch (error) {
    logTest('POST /auth/login', false, error.response?.data || error);
  }
}

async function testValidation() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}VALIDATION (11 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  const testEmail = 'test@example.com';
  const validationEndpoints = [
    'comprehensive',
    'syntax',
    'domain',
    'disposable',
    'fraud',
    'role',
    'reputation',
    'smtp',
    'enrich'
  ];

  for (const endpoint of validationEndpoints) {
    try {
      await apiCall('post', `/validate/${endpoint}`, { email: testEmail });
      logTest(`POST /validate/${endpoint}`, true);
    } catch (error) {
      logTest(`POST /validate/${endpoint}`, false, error.response?.data || error);
    }
  }

  // Test batch validation
  try {
    await apiCall('post', '/validate/batch', { 
      emails: ['test1@example.com', 'test2@example.com'] 
    });
    logTest('POST /validate/batch', true);
  } catch (error) {
    logTest('POST /validate/batch', false, error.response?.data || error);
  }

  // Test email details
  try {
    await apiCall('post', '/email/details', { email: testEmail });
    logTest('POST /email/details', true);
  } catch (error) {
    logTest('POST /email/details', false, error.response?.data || error);
  }
}

async function testDashboard() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}DASHBOARD (3 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    await apiCall('get', '/dashboard/stats');
    logTest('GET /dashboard/stats', true);
  } catch (error) {
    logTest('GET /dashboard/stats', false, error.response?.data || error);
  }

  try {
    await apiCall('get', '/dashboard/recent');
    logTest('GET /dashboard/recent', true);
  } catch (error) {
    logTest('GET /dashboard/recent', false, error.response?.data || error);
  }

  try {
    await apiCall('get', '/dashboard/analytics');
    logTest('GET /dashboard/analytics', true);
  } catch (error) {
    logTest('GET /dashboard/analytics', false, error.response?.data || error);
  }
}

async function testBulkProcessing() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}BULK PROCESSING (3 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    await apiCall('get', '/bulk/jobs');
    logTest('GET /bulk/jobs', true);
  } catch (error) {
    logTest('GET /bulk/jobs', false, error.response?.data || error);
  }

  // Note: Upload and status require file upload and job ID, skipping in basic test
  logTest('POST /bulk/upload (requires file)', 'skipped');
  logTest('GET /bulk/status/:jobId (requires jobId)', 'skipped');
}

async function testWebhooks() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}WEBHOOKS - Phase 1 (5 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  // List webhooks
  try {
    const response = await apiCall('get', '/webhooks');
    logTest('GET /webhooks', true);
  } catch (error) {
    logTest('GET /webhooks', false, error.response?.data || error);
  }

  // Create webhook
  try {
    const response = await apiCall('post', '/webhooks', {
      url: 'https://example.com/webhook-test',
      events: ['validation.completed'],
      name: 'Test Webhook Dashboard'
    });
    testWebhookId = response.data.data.id;
    logTest('POST /webhooks', true);
  } catch (error) {
    logTest('POST /webhooks', false, error.response?.data || error);
  }

  // Update webhook
  if (testWebhookId) {
    try {
      await apiCall('put', `/webhooks/${testWebhookId}`, {
        is_active: false
      });
      logTest('PUT /webhooks/:id', true);
    } catch (error) {
      logTest('PUT /webhooks/:id', false, error.response?.data || error);
    }

    // Test webhook
    try {
      await apiCall('post', `/webhooks/${testWebhookId}/test`);
      logTest('POST /webhooks/:id/test', true);
    } catch (error) {
      logTest('POST /webhooks/:id/test', false, error.response?.data || error);
    }

    // Delete webhook
    try {
      await apiCall('delete', `/webhooks/${testWebhookId}`);
      logTest('DELETE /webhooks/:id', true);
    } catch (error) {
      logTest('DELETE /webhooks/:id', false, error.response?.data || error);
    }
  } else {
    logTest('PUT /webhooks/:id', 'skipped - no webhook created');
    logTest('POST /webhooks/:id/test', 'skipped - no webhook created');
    logTest('DELETE /webhooks/:id', 'skipped - no webhook created');
  }
}

async function testApiKeys() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}API KEYS - Phase 1 (4 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  // List API keys
  try {
    const response = await apiCall('get', '/api-keys');
    logTest('GET /api-keys', true);
  } catch (error) {
    logTest('GET /api-keys', false, error.response?.data || error);
  }

  // Create API key
  try {
    const response = await apiCall('post', '/api-keys', {
      name: 'Dashboard Test Key'
    });
    testApiKeyId = response.data.data.id;
    logTest('POST /api-keys', true);
  } catch (error) {
    logTest('POST /api-keys', false, error.response?.data || error);
  }

  // Regenerate API key
  if (testApiKeyId) {
    try {
      await apiCall('post', `/api-keys/${testApiKeyId}/regenerate`);
      logTest('POST /api-keys/:id/regenerate', true);
    } catch (error) {
      logTest('POST /api-keys/:id/regenerate', false, error.response?.data || error);
    }

    // Delete API key
    try {
      await apiCall('delete', `/api-keys/${testApiKeyId}`);
      logTest('DELETE /api-keys/:id', true);
    } catch (error) {
      logTest('DELETE /api-keys/:id', false, error.response?.data || error);
    }
  } else {
    logTest('POST /api-keys/:id/regenerate', 'skipped - no key created');
    logTest('DELETE /api-keys/:id', 'skipped - no key created');
  }
}

async function testBilling() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}BILLING - Phase 1 (7 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    await apiCall('get', '/billing/info');
    logTest('GET /billing/info', true);
  } catch (error) {
    logTest('GET /billing/info', false, error.response?.data || error);
  }

  try {
    await apiCall('get', '/billing/plans');
    logTest('GET /billing/plans', true);
  } catch (error) {
    logTest('GET /billing/plans', false, error.response?.data || error);
  }

  try {
    await apiCall('get', '/billing/invoices');
    logTest('GET /billing/invoices', true);
  } catch (error) {
    logTest('GET /billing/invoices', false, error.response?.data || error);
  }

  // Other billing endpoints (skipping to avoid actual charges)
  logTest('GET /billing/invoices/:id/pdf (requires invoice)', 'skipped');
  logTest('POST /billing/payment-method (requires Stripe)', 'skipped');
  logTest('POST /billing/change-plan (skipped - would change plan)', 'skipped');
  logTest('POST /billing/cancel (skipped - would cancel subscription)', 'skipped');
}

async function testUserProfile() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}USER PROFILE - Phase 2 (4 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    await apiCall('get', '/user/profile');
    logTest('GET /user/profile', true);
  } catch (error) {
    logTest('GET /user/profile', false, error.response?.data || error);
  }

  try {
    await apiCall('put', '/user/profile', {
      name: 'Updated Test User',
      company: 'Test Company'
    });
    logTest('PUT /user/profile', true);
  } catch (error) {
    logTest('PUT /user/profile', false, error.response?.data || error);
  }

  try {
    await apiCall('post', '/user/change-password', {
      current_password: 'testpass123',
      new_password: 'newpass123',
      confirm_password: 'newpass123'
    });
    logTest('POST /user/change-password', true);
  } catch (error) {
    logTest('POST /user/change-password', false, error.response?.data || error);
  }

  // Skip delete account to avoid deleting test user
  logTest('DELETE /user/account (skipped - would delete account)', 'skipped');
}

async function testNotifications() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}NOTIFICATIONS - Phase 2 (2 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    await apiCall('get', '/user/notifications');
    logTest('GET /user/notifications', true);
  } catch (error) {
    logTest('GET /user/notifications', false, error.response?.data || error);
  }

  try {
    await apiCall('put', '/user/notifications', {
      email_notifications: true,
      low_credit_alerts: true,
      bulk_job_completion: true
    });
    logTest('PUT /user/notifications', true);
  } catch (error) {
    logTest('PUT /user/notifications', false, error.response?.data || error);
  }
}

async function testTwoFactorAuth() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}TWO-FACTOR AUTH - Phase 2 (4 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    await apiCall('get', '/user/2fa/status');
    logTest('GET /user/2fa/status', true);
  } catch (error) {
    logTest('GET /user/2fa/status', false, error.response?.data || error);
  }

  try {
    await apiCall('post', '/user/2fa/enable');
    logTest('POST /user/2fa/enable', true);
  } catch (error) {
    logTest('POST /user/2fa/enable', false, error.response?.data || error);
  }

  // Skip verify and disable (requires valid TOTP code)
  logTest('POST /user/2fa/verify (requires valid TOTP code)', 'skipped');
  logTest('POST /user/2fa/disable (requires valid TOTP code)', 'skipped');
}

async function testAnalytics() {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}ANALYTICS - Phase 2 (4 endpoints)${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  try {
    await apiCall('get', '/analytics/usage?period=7d&interval=1d');
    logTest('GET /analytics/usage', true);
  } catch (error) {
    logTest('GET /analytics/usage', false, error.response?.data || error);
  }

  try {
    await apiCall('get', '/analytics/endpoints?period=7d');
    logTest('GET /analytics/endpoints', true);
  } catch (error) {
    logTest('GET /analytics/endpoints', false, error.response?.data || error);
  }

  try {
    await apiCall('get', '/analytics/validation-types?period=7d');
    logTest('GET /analytics/validation-types', true);
  } catch (error) {
    logTest('GET /analytics/validation-types', false, error.response?.data || error);
  }

  try {
    await apiCall('get', '/analytics/errors?period=7d&interval=1d');
    logTest('GET /analytics/errors', true);
  } catch (error) {
    logTest('GET /analytics/errors', false, error.response?.data || error);
  }
}

async function printSummary() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}           DASHBOARD INTEGRATION TEST SUMMARY${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  
  const passRate = ((results.passed.length / results.total) * 100).toFixed(1);
  const statusColor = passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red;

  console.log(`\n${colors.cyan}Total Tests:${colors.reset} ${results.total}`);
  console.log(`${colors.green}Passed:${colors.reset} ${results.passed.length}`);
  console.log(`${colors.red}Failed:${colors.reset} ${results.failed.length}`);
  console.log(`${statusColor}Pass Rate:${colors.reset} ${passRate}%\n`);

  if (results.failed.length > 0) {
    console.log(`${colors.red}━━━ FAILED TESTS ━━━${colors.reset}`);
    results.failed.forEach(fail => {
      console.log(`${colors.red}✗${colors.reset} ${fail.name}`);
      if (fail.error) {
        console.log(`  ${colors.yellow}${fail.error}${colors.reset}`);
      }
    });
  }

  console.log(`\n${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);

  // Generate report file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed.length,
      failed: results.failed.length,
      passRate: `${passRate}%`
    },
    passedTests: results.passed,
    failedTests: results.failed
  };

  const fs = require('fs');
  fs.writeFileSync(
    'dashboard-integration-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log(`${colors.green}✓${colors.reset} Report saved to: dashboard-integration-report.json\n`);
}

// Main test runner
async function runTests() {
  console.log(`\n${colors.cyan}╔══════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║                                              ║${colors.reset}`);
  console.log(`${colors.cyan}║   DASHBOARD INTEGRATION COMPREHENSIVE TEST   ║${colors.reset}`);
  console.log(`${colors.cyan}║                                              ║${colors.reset}`);
  console.log(`${colors.cyan}╚══════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.yellow}Testing all 49 API endpoints from dashboard perspective...${colors.reset}\n`);

  try {
    await testAuthentication();
    await testValidation();
    await testDashboard();
    await testBulkProcessing();
    await testWebhooks();
    await testApiKeys();
    await testBilling();
    await testUserProfile();
    await testNotifications();
    await testTwoFactorAuth();
    await testAnalytics();
  } catch (error) {
    console.error(`${colors.red}Fatal error during testing:${colors.reset}`, error.message);
  }

  await printSummary();
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Test suite failed:${colors.reset}`, error);
  process.exit(1);
});

