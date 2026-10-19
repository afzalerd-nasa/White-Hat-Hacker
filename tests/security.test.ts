import { evaluatePassword } from '../src/utils/passwordEntropy';

async function runTests() {
  console.log('[AegisSec Test Suite] Starting automated verification...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Test 1: Weak Password Evaluation
  const weakResult = await evaluatePassword('password123');
  assert(weakResult.strengthLabel === 'Very Weak' || weakResult.strengthLabel === 'Weak', 'Weak password flagged appropriately');
  assert(weakResult.checks.find(c => c.label.includes('dictionary'))?.passed === false, 'Dictionary word identified in weak password');

  // Test 2: Strong Passphrase Evaluation
  const strongResult = await evaluatePassword('correct-horse-battery-staple-2026!');
  assert(strongResult.score >= 80, 'Strong passphrase achieves high security score');
  assert(strongResult.entropyBits >= 60, 'Information entropy exceeds 60 bits');
  assert(strongResult.sha256Hash.length === 64, 'SHA-256 digest is 64 hex characters');

  // Test 3: Length verification
  assert(strongResult.checks.find(c => c.label.includes('Minimum 12 characters'))?.passed === true, 'NIST 12+ char requirement verified');

  console.log(`\n[AegisSec Test Suite] Completed: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests();
