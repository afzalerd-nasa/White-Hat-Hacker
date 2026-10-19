import { PasswordAuditResult } from '../types/security';

const COMMON_PASSWORDS = [
  'password', 'password123', 'admin', 'admin123', '123456', '12345678', 'qwerty',
  'welcome', 'letmein', 'monkey', 'dragon', 'football', 'master', 'root', 'default'
];

export async function evaluatePassword(pwd: string): Promise<PasswordAuditResult> {
  if (!pwd) {
    return {
      score: 0,
      entropyBits: 0,
      estimatedCrackTime: 'Instant (Empty)',
      strengthLabel: 'Very Weak',
      checks: [
        { label: 'Minimum 12 characters (NIST SP 800-63B)', passed: false, detail: 'Current length: 0' },
        { label: 'Uppercase letters (A-Z)', passed: false, detail: 'None detected' },
        { label: 'Lowercase letters (a-z)', passed: false, detail: 'None detected' },
        { label: 'Numbers (0-9)', passed: false, detail: 'None detected' },
        { label: 'Special symbols (!@#$%^&*)', passed: false, detail: 'None detected' },
        { label: 'Not in known breach / dictionary list', passed: true, detail: 'Compliant' }
      ],
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      suggestions: ['Enter a passphrase of at least 12-16 characters combining words and symbols.']
    };
  }

  const length = pwd.length;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigits = /[0-9]/.test(pwd);
  const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);
  const isCommon = COMMON_PASSWORDS.includes(pwd.toLowerCase());
  const hasSequential = /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|pqs)/i.test(pwd);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigits) poolSize += 10;
  if (hasSymbols) poolSize += 33;

  // Entropy calculation: E = L * log2(R)
  const entropyBits = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;

  // Offline GPU attack rate: 10^10 hashes per second
  const combinations = Math.pow(poolSize, length);
  const seconds = combinations / 10000000000;

  let estimatedCrackTime = 'Instant (< 1 second)';
  if (isCommon) {
    estimatedCrackTime = 'Instant (Found in top dictionary attacks)';
  } else if (seconds < 1) {
    estimatedCrackTime = 'Instant (< 1 second)';
  } else if (seconds < 60) {
    estimatedCrackTime = `${Math.round(seconds)} seconds`;
  } else if (seconds < 3600) {
    estimatedCrackTime = `${Math.round(seconds / 60)} minutes`;
  } else if (seconds < 86400) {
    estimatedCrackTime = `${Math.round(seconds / 3600)} hours`;
  } else if (seconds < 31536000) {
    estimatedCrackTime = `${Math.round(seconds / 86400)} days`;
  } else if (seconds < 31536000 * 100) {
    estimatedCrackTime = `${Math.round(seconds / 31536000)} years`;
  } else if (seconds < 31536000 * 1000000) {
    estimatedCrackTime = `${Math.round(seconds / (31536000 * 1000))} Thousand Years`;
  } else {
    estimatedCrackTime = `Over ${Math.round(seconds / (31536000 * 1000000))} Million Years`;
  }

  // Calculate score 0 - 100
  let score = 0;
  if (length >= 8) score += 15;
  if (length >= 12) score += 20;
  if (length >= 16) score += 15;
  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasDigits) score += 15;
  if (hasSymbols) score += 15;
  if (isCommon) score = Math.min(10, score - 50);
  if (hasSequential) score = Math.max(5, score - 15);

  score = Math.min(100, Math.max(5, score));

  let strengthLabel: PasswordAuditResult['strengthLabel'] = 'Weak';
  if (score >= 90) strengthLabel = 'Very Strong';
  else if (score >= 75) strengthLabel = 'Strong';
  else if (score >= 50) strengthLabel = 'Moderate';
  else if (score >= 30) strengthLabel = 'Weak';
  else strengthLabel = 'Very Weak';

  const checks = [
    {
      label: 'Minimum 12 characters (NIST SP 800-63B)',
      passed: length >= 12,
      detail: `Current: ${length} characters`
    },
    {
      label: 'Uppercase letters (A-Z)',
      passed: hasUpper,
      detail: hasUpper ? 'Present' : 'Add at least one capital letter'
    },
    {
      label: 'Lowercase letters (a-z)',
      passed: hasLower,
      detail: hasLower ? 'Present' : 'Add at least one lowercase letter'
    },
    {
      label: 'Numbers (0-9)',
      passed: hasDigits,
      detail: hasDigits ? 'Present' : 'Include numeric digits'
    },
    {
      label: 'Special symbols (!@#$%^&*)',
      passed: hasSymbols,
      detail: hasSymbols ? 'Present' : 'Include punctuation or symbols'
    },
    {
      label: 'Not in known dictionary / breach lists',
      passed: !isCommon,
      detail: isCommon ? 'Flagged as common trivial password' : 'Passed dictionary check'
    }
  ];

  const suggestions: string[] = [];
  if (length < 12) suggestions.push('Increase length to 14+ characters to resist GPU brute-force attacks.');
  if (!hasSymbols) suggestions.push('Add non-alphanumeric characters (e.g. #, $, &, %).');
  if (hasSequential) suggestions.push('Eliminate sequential character sequences (e.g. 123, abc).');
  if (isCommon) suggestions.push('This password appears in leaked credential databases. Never use dictionary terms.');
  if (suggestions.length === 0) suggestions.push('Excellent cryptographic strength. Meets enterprise PAM policy.');

  // Live SHA-256 hash using native browser crypto
  let sha256Hash = '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    sha256Hash = 'sha256-calculation-unavailable';
  }

  return {
    score,
    entropyBits,
    estimatedCrackTime,
    strengthLabel,
    checks,
    sha256Hash,
    suggestions
  };
}
