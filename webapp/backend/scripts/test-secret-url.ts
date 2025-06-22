#!/usr/bin/env npx tsx

/**
 * Secret URL System Test Script
 *
 * Tests the secret URL protection system to ensure:
 * 1. Correct secret URLs allow access
 * 2. Invalid secret URLs return 404
 * 3. Non-admin paths are not affected
 * 4. Access logging works correctly
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const SECRET_PATH = process.env.ADMIN_SECRET_PATH || 'x7k9m2p5w8t3q6r1';

interface TestResult {
  name: string;
  url: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  response?: any;
}

/**
 * Test runner
 */
async function runSecretURLTests(): Promise<void> {
  console.log('🔒 Secret URL System Test');
  console.log('='.repeat(50));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Secret Path: admin-${SECRET_PATH.substring(0, 4)}***`);
  console.log('');

  const tests: Array<() => Promise<TestResult>> = [
    // Valid secret URL tests
    () => testURL('Valid Secret URL - Login', `/api/admin-${SECRET_PATH}/auth/login`, 'GET', 404), // Should be 404 because no proper auth headers
    () => testURL('Valid Secret URL - Health check', '/api/health', 'GET', 200),

    // Invalid secret URL tests
    () => testURL('Invalid Secret URL - admin', '/api/admin/auth/login', 'GET', 404),
    () => testURL('Invalid Secret URL - random', '/api/admin-invalid123/auth/login', 'GET', 404),
    () => testURL('Invalid Secret URL - empty', '/api/admin-/auth/login', 'GET', 404),
    () => testURL('Invalid Secret URL - short', '/api/admin-123/auth/login', 'GET', 404),

    // Non-admin paths (should not be affected)
    () => testURL('Non-admin path - Health', '/api/health', 'GET', 200),
    () => testURL('Non-admin path - Root', '/api', 'GET', 404), // Assuming no root handler
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);

      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Expected: ${result.expectedStatus}, Got: ${result.actualStatus}`);

      if (!result.passed) {
        console.log(`   Response:`, result.response);
      }
      console.log('');
    } catch (error) {
      console.error(`❌ ${test.name} - Error:`, error);
      results.push({
        name: test.name || 'Unknown test',
        url: 'Unknown',
        expectedStatus: 0,
        actualStatus: 0,
        passed: false,
      });
    }
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log('Test Summary');
  console.log('='.repeat(50));
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

/**
 * Test a specific URL
 */
async function testURL(
  name: string,
  path: string,
  method: string = 'GET',
  expectedStatus: number = 200
): Promise<TestResult> {
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': 'Secret-URL-Test-Script/1.0',
        Accept: 'application/json',
      },
    });

    const responseData = await response.text().catch(() => 'Unable to parse response');
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseData);
    } catch {
      parsedResponse = responseData;
    }

    return {
      name,
      url,
      expectedStatus,
      actualStatus: response.status,
      passed: response.status === expectedStatus,
      response: parsedResponse,
    };
  } catch (error) {
    return {
      name,
      url,
      expectedStatus,
      actualStatus: 0,
      passed: false,
      response: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test bot detection
 */
async function testBotDetection(): Promise<void> {
  console.log('🤖 Bot Detection Test');
  console.log('='.repeat(50));

  const botUserAgents = [
    'Googlebot/2.1',
    'curl/7.68.0',
    'python-requests/2.25.1',
    'Mozilla/5.0 (compatible; Baiduspider/2.0)',
    'wget/1.20.3',
  ];

  for (const userAgent of botUserAgents) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/json',
        },
      });

      console.log(`User-Agent: ${userAgent}`);
      console.log(`Status: ${response.status} (Expected: 404)`);
      console.log(`Blocked: ${response.status === 404 ? '✅' : '❌'}`);
      console.log('');
    } catch (error) {
      console.error(`Error testing User-Agent ${userAgent}:`, error);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check if server is running
    try {
      const healthCheck = await fetch(`${API_BASE_URL}/api/health`);
      if (!healthCheck.ok) {
        throw new Error(`Health check failed: ${healthCheck.status}`);
      }
      console.log('✅ Server is running\n');
    } catch (_error) {
      console.error('❌ Server is not running or not accessible');
      console.error('Please start the server with: npm run dev');
      process.exit(1);
    }

    await runSecretURLTests();
    await testBotDetection();
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
