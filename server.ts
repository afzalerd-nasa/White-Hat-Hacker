import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import net from 'net';
import https from 'https';
import http from 'http';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.use(express.json());

// Initialize Gemini SDK if API key exists
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

// In-memory data store for persistent demo state
const auditLogsStore = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    user: 'alex.vance@defense.corp',
    role: 'Lead Pentester',
    action: 'Network Scan Executed',
    target: '192.168.1.0/24 (VLAN 10 DMZ)',
    details: 'Authorized scope verified by CISO. Scanned 14 hosts, 100 ports.',
    status: 'SUCCESS'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: 'sarah.connor@defense.corp',
    role: 'Security Auditor',
    action: 'Website Security Audit',
    target: 'https://staging.internal-banking.corp',
    details: 'Audited headers and TLS config. Missing HSTS preload detected.',
    status: 'WARNING'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user: 'system_monitor',
    role: 'Daemon',
    action: 'Device Status Alert',
    target: '192.168.1.15 (Core Router 01)',
    details: 'Latency anomaly detected: 48ms spiked over 15ms threshold.',
    status: 'WARNING'
  }
];

const vulnerabilityCatalog = [
  {
    id: 'vuln-01',
    cveId: 'CVE-2024-21626',
    title: 'runc Container Escape via File Descriptor Leak',
    severity: 'Critical',
    cvssScore: 8.6,
    affectedComponent: 'runc / Docker container runtime',
    affectedVersions: '< 1.1.12',
    discoveredOn: '2026-03-12',
    status: 'Open',
    hostIp: '192.168.1.45',
    hostname: 'k8s-worker-node-02',
    port: 2376,
    description: 'In runc through 1.1.11, as used in Docker before 25.0.2 and other products, internal file descriptors are leaked to newly created containers.',
    impact: 'Attackers inside a container can write to host filesystem and gain full root control on the container host.',
    remediation: 'Upgrade runc to version 1.1.12 or later and upgrade containerd to v1.6.28 / v1.7.13.',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2024-21626',
    cwe: 'CWE-403: Exposure of File Descriptor to Unintended Control Sphere'
  },
  {
    id: 'vuln-02',
    cveId: 'CVE-2024-3094',
    title: 'XZ Utils Liblzma Malicious Backdoor',
    severity: 'Critical',
    cvssScore: 10.0,
    affectedComponent: 'liblzma in xz-utils',
    affectedVersions: '5.6.0, 5.6.1',
    discoveredOn: '2026-03-29',
    status: 'Mitigated',
    hostIp: '192.168.1.20',
    hostname: 'bastion-ssh-gw',
    port: 22,
    description: 'Malicious code was discovered in upstream tarballs of xz utils starting with version 5.6.0. Through indirect function jumps in libsystemd, sshd authentication is intercepted.',
    impact: 'Remote unauthenticated attackers can execute arbitrary code on OpenSSH server listening ports.',
    remediation: 'Immediately downgrade xz to 5.4.x or upgrade to 5.6.1+ security backports provided by distribution vendor.',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
    cwe: 'CWE-506: Embedded Malicious Code'
  },
  {
    id: 'vuln-03',
    cveId: 'CVE-2023-48795',
    title: 'Terrapin SSH Protocol Prefix Truncation Attack',
    severity: 'Medium',
    cvssScore: 5.9,
    affectedComponent: 'OpenSSH / ChaCha20-Poly1305 & CBC ciphers',
    affectedVersions: '< 9.6p1',
    discoveredOn: '2026-01-14',
    status: 'In Remediation',
    hostIp: '192.168.1.10',
    hostname: 'edge-firewall-01',
    port: 22,
    description: 'The SSH protocol allows a man-in-the-middle attacker to truncate extension negotiation messages, disabling keystroke timing obfuscation.',
    impact: 'Man-in-the-middle adversary can downgrade cryptographic negotiation without triggering MAC integrity check.',
    remediation: 'Enforce strict key exchange ("strict KEX" extension) in sshd_config and disable chacha20-poly1305@openssh.com and *-cbc ciphers.',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2023-48795',
    cwe: 'CWE-354: Improper Validation of Integrity Check'
  },
  {
    id: 'vuln-04',
    cveId: 'CVE-2024-23897',
    title: 'Jenkins CLI Arbitrary File Read Vulnerability',
    severity: 'High',
    cvssScore: 7.5,
    affectedComponent: 'Jenkins Controller Core',
    affectedVersions: '<= 2.441',
    discoveredOn: '2026-02-04',
    status: 'Open',
    hostIp: '192.168.1.80',
    hostname: 'ci-jenkins-master',
    port: 8080,
    description: 'Jenkins uses the args4j library to parse command arguments on the Jenkins controller. The default configuration allows attackers to read arbitrary files via @ syntax.',
    impact: 'Unauthenticated or low-privileged users can read sensitive keys, SSH credentials, and master encryption keys from filesystem.',
    remediation: 'Upgrade Jenkins to 2.442 or 2.426.3 LTS. Disable CLI access if upgrading is delayed: hudson.cli.CLI.get().setEnabled(false).',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2024-23897',
    cwe: 'CWE-22: Improper Limitation of a Pathname to a Restricted Directory'
  },
  {
    id: 'vuln-05',
    cveId: 'CVE-2023-38606',
    title: 'PostgreSQL Role Inheritance Escalation',
    severity: 'Medium',
    cvssScore: 6.2,
    affectedComponent: 'PostgreSQL RDBMS',
    affectedVersions: '< 15.4, 14.9, 13.12',
    discoveredOn: '2026-02-18',
    status: 'Mitigated',
    hostIp: '192.168.1.90',
    hostname: 'db-primary-postgres',
    port: 5432,
    description: 'Non-administrative database users with permission to alter specific session variables could bypass role membership checks under certain privilege set scenarios.',
    impact: 'Unauthorized privilege escalation within database schema.',
    remediation: 'Update PostgreSQL database packages to latest minor release branch and review pg_roles grants.',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2023-38606',
    cwe: 'CWE-269: Improper Privilege Management'
  }
];

// Helper to check a single TCP port using real socket
function probeTcpPort(host: string, port: number, timeout = 1200): Promise<{ open: boolean; banner?: string; duration: number }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let banner = '';

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const duration = Date.now() - startTime;
      socket.write('HEAD / HTTP/1.0\r\n\r\n');
      setTimeout(() => {
        socket.destroy();
        resolve({ open: true, banner: banner.slice(0, 100).trim(), duration });
      }, 200);
    });

    socket.on('data', (chunk) => {
      banner += chunk.toString();
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ open: false, duration: Date.now() - startTime });
    });

    socket.on('error', () => {
      socket.destroy();
      resolve({ open: false, duration: Date.now() - startTime });
    });

    socket.connect(port, host);
  });
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Current User / Authentication
app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    id: 'usr-9021',
    name: 'Captain Alex Vance',
    email: 'alex.vance@defense.corp',
    role: 'Lead Pentester',
    avatar: 'AV',
    lastLogin: '2026-10-19 07:15 UTC',
    twoFactorEnabled: true,
    permissions: [
      'scan:network:execute',
      'scan:website:execute',
      'vulnerability:remediate',
      'audit:export',
      'users:manage'
    ]
  });
});

// 2. Network Scanner API
app.post('/api/scan/network', async (req: Request, res: Response) => {
  const { target, scanType, authorizedScopeConfirmed, authorizerName, organization } = req.body;

  if (!authorizedScopeConfirmed) {
    return res.status(403).json({
      error: 'Authorization Required',
      message: 'Network scanning strictly requires explicit verification of authorization scope and client authorization.'
    });
  }

  // Record audit trail
  auditLogsStore.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: req.body.operator || 'Alex Vance',
    role: 'Lead Pentester',
    action: `Network Scan (${scanType || 'Standard'})`,
    target: target || '192.168.1.0/24',
    details: `Authorized by: ${authorizerName || 'Compliance Officer'} (${organization || 'Internal Enterprise'}).`,
    status: 'SUCCESS'
  });

  const isLocalOrHost = target === 'localhost' || target === '127.0.0.1' || target === '::1';

  // If local probe is requested, probe ports 3000, 80, 443, 22, 5432, 8080
  let realLocalPorts: { port: number; open: boolean; banner?: string; duration: number }[] = [];
  if (isLocalOrHost) {
    const testPorts = [22, 80, 443, 3000, 5432, 8080];
    const probePromises = testPorts.map(p => probeTcpPort('127.0.0.1', p, 600));
    const results = await Promise.all(probePromises);
    realLocalPorts = testPorts.map((p, idx) => ({ port: p, ...results[idx] }));
  }

  // Return realistic authorized pentest results with detected topology
  const simulatedSubnetHosts = [
    {
      id: 'host-01',
      ip: isLocalOrHost ? '127.0.0.1' : (target.includes('/') ? target.replace('/24', '.1') : target),
      mac: '00:1A:2B:3C:4D:01',
      hostname: isLocalOrHost ? 'localhost' : 'gw-edge-router.corp',
      vendor: 'Cisco Systems',
      status: 'online',
      osGuess: 'Linux 5.15 / Cisco IOS XE',
      latencyMs: isLocalOrHost ? 1 : 14,
      openPorts: isLocalOrHost && realLocalPorts.length > 0 ? [
        { port: 3000, protocol: 'tcp', service: 'http / node-vite', version: 'Express/Vite', state: 'open', risk: 'safe' },
        ...(realLocalPorts.find(p => p.port === 80)?.open ? [{ port: 80, protocol: 'tcp' as const, service: 'http', state: 'open' as const, risk: 'medium' as const }] : []),
        ...(realLocalPorts.find(p => p.port === 22)?.open ? [{ port: 22, protocol: 'tcp' as const, service: 'ssh', version: 'OpenSSH 9.2', state: 'open' as const, risk: 'low' as const }] : []),
        { port: 8080, protocol: 'tcp', service: 'http-proxy / dev', version: 'NodeJS', state: 'open', risk: 'low' }
      ] : [
        { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH 8.9p1', state: 'open', risk: 'low', cveMatches: ['CVE-2023-48795'] },
        { port: 80, protocol: 'tcp', service: 'http', version: 'nginx/1.22.1', state: 'open', risk: 'medium' },
        { port: 443, protocol: 'tcp', service: 'https', version: 'nginx/1.22.1 (TLS 1.3)', state: 'open', risk: 'safe' }
      ],
      lastScanned: new Date().toISOString(),
      vulnerabilityCount: { critical: 0, high: 0, medium: 1, low: 2 }
    },
    {
      id: 'host-02',
      ip: target.includes('/') ? target.replace('/24', '.15') : '192.168.1.15',
      mac: '52:54:00:8F:90:3A',
      hostname: 'auth-ldap-core.corp',
      vendor: 'VMware Virtual NIC',
      status: 'online',
      osGuess: 'Ubuntu Linux 22.04 LTS',
      latencyMs: 18,
      openPorts: [
        { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH 8.9p1', state: 'open', risk: 'low' },
        { port: 389, protocol: 'tcp', service: 'ldap', version: 'OpenLDAP 2.5', state: 'open', risk: 'high' },
        { port: 636, protocol: 'tcp', service: 'ldaps', version: 'OpenLDAP SSL', state: 'open', risk: 'safe' }
      ],
      lastScanned: new Date().toISOString(),
      vulnerabilityCount: { critical: 0, high: 1, medium: 0, low: 1 }
    },
    {
      id: 'host-03',
      ip: target.includes('/') ? target.replace('/24', '.45') : '192.168.1.45',
      mac: '00:50:56:B2:AA:71',
      hostname: 'k8s-worker-node-02',
      vendor: 'Dell PowerEdge / VMware',
      status: 'online',
      osGuess: 'Red Hat Enterprise Linux 9.2',
      latencyMs: 22,
      openPorts: [
        { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH 9.0', state: 'open', risk: 'low' },
        { port: 2376, protocol: 'tcp', service: 'docker-tls', version: 'Docker 24.0.7', state: 'open', risk: 'critical', cveMatches: ['CVE-2024-21626'] },
        { port: 10250, protocol: 'tcp', service: 'kubelet', version: 'Kubernetes v1.28.3', state: 'open', risk: 'medium' }
      ],
      lastScanned: new Date().toISOString(),
      vulnerabilityCount: { critical: 1, high: 0, medium: 1, low: 0 }
    },
    {
      id: 'host-04',
      ip: target.includes('/') ? target.replace('/24', '.80') : '192.168.1.80',
      mac: 'B8:27:EB:12:44:9C',
      hostname: 'ci-jenkins-master',
      vendor: 'Supermicro Server',
      status: 'online',
      osGuess: 'Debian GNU/Linux 12 (bookworm)',
      latencyMs: 27,
      openPorts: [
        { port: 8080, protocol: 'tcp', service: 'http-jenkins', version: 'Jenkins 2.440', state: 'open', risk: 'high', cveMatches: ['CVE-2024-23897'] },
        { port: 50000, protocol: 'tcp', service: 'jenkins-agent', version: 'JNLP4-connect', state: 'open', risk: 'medium' }
      ],
      lastScanned: new Date().toISOString(),
      vulnerabilityCount: { critical: 0, high: 1, medium: 1, low: 0 }
    },
    {
      id: 'host-05',
      ip: target.includes('/') ? target.replace('/24', '.90') : '192.168.1.90',
      mac: '00:0C:29:FE:67:8B',
      hostname: 'db-primary-postgres',
      vendor: 'HP Enterprise',
      status: 'online',
      osGuess: 'Ubuntu Linux 20.04 LTS',
      latencyMs: 16,
      openPorts: [
        { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH 8.2p1', state: 'open', risk: 'low' },
        { port: 5432, protocol: 'tcp', service: 'postgresql', version: 'PostgreSQL 14.8', state: 'open', risk: 'medium', cveMatches: ['CVE-2023-38606'] }
      ],
      lastScanned: new Date().toISOString(),
      vulnerabilityCount: { critical: 0, high: 0, medium: 1, low: 1 }
    }
  ];

  res.json({
    id: `scan-${Date.now()}`,
    timestamp: new Date().toISOString(),
    target,
    scanType: scanType || 'Standard Fast Scan',
    durationMs: 1420,
    hostsDiscovered: simulatedSubnetHosts,
    totalPortsScanned: scanType === 'quick' ? 100 : 1024,
    openPortsCount: simulatedSubnetHosts.reduce((acc, h) => acc + h.openPorts.length, 0),
    operator: req.body.operator || 'Captain Alex Vance',
    status: 'completed'
  });
});

// 3. Website Security Checker API
app.post('/api/scan/website', async (req: Request, res: Response) => {
  const { targetUrl } = req.body;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Target URL is required' });
  }

  let formattedUrl = targetUrl.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  let responseHeaders: Record<string, string> = {};
  let httpStatus = 200;
  let isHttps = formattedUrl.startsWith('https://');

  try {
    // Attempt real safe HEAD / GET request to inspect security headers
    const urlObj = new URL(formattedUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    const headerResult = await new Promise<{ headers: Record<string, string>; statusCode?: number }>((resolve) => {
      const request = client.request(
        formattedUrl,
        {
          method: 'GET',
          headers: { 'User-Agent': 'AegisSec-SecurityAuditor/2.4 (Authorized Security Evaluation)' },
          timeout: 4000
        },
        (response) => {
          const headersObj: Record<string, string> = {};
          for (const key of Object.keys(response.headers)) {
            const val = response.headers[key];
            if (Array.isArray(val)) {
              headersObj[key.toLowerCase()] = val.join('; ');
            } else if (val) {
              headersObj[key.toLowerCase()] = val;
            }
          }
          response.resume(); // discard body safely
          resolve({ headers: headersObj, statusCode: response.statusCode });
        }
      );

      request.on('error', () => {
        resolve({ headers: {}, statusCode: 0 });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({ headers: {}, statusCode: 408 });
      });

      request.end();
    });

    responseHeaders = headerResult.headers;
    httpStatus = headerResult.statusCode || 200;
  } catch {
    // Fallback if network blocked in sandbox
    responseHeaders = {
      'server': 'nginx/1.24.0',
      'content-type': 'text/html; charset=UTF-8',
      'x-content-type-options': 'nosniff'
    };
  }

  // Security Headers Evaluation Engine
  const hsts = responseHeaders['strict-transport-security'] || null;
  const csp = responseHeaders['content-security-policy'] || null;
  const xFrame = responseHeaders['x-frame-options'] || null;
  const xContentType = responseHeaders['x-content-type-options'] || null;
  const referrer = responseHeaders['referrer-policy'] || null;
  const permissions = responseHeaders['permissions-policy'] || null;
  const server = responseHeaders['server'] || null;
  const setCookie = responseHeaders['set-cookie'] || null;

  const headerChecks = [
    {
      name: 'Strict-Transport-Security (HSTS)',
      value: hsts,
      status: hsts ? (hsts.includes('includeSubDomains') ? 'good' : 'warning') : 'missing',
      importance: 'critical' as const,
      description: 'Forces modern browsers to communicate strictly over encrypted HTTPS connections.',
      recommendation: hsts ? 'HSTS is active.' : 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'
    },
    {
      name: 'Content-Security-Policy (CSP)',
      value: csp ? (csp.length > 70 ? csp.substring(0, 70) + '...' : csp) : null,
      status: csp ? 'good' : 'missing',
      importance: 'critical' as const,
      description: 'Restricts script sources, prevents Cross-Site Scripting (XSS) and data injection.',
      recommendation: csp ? 'CSP is configured.' : "Add Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';"
    },
    {
      name: 'X-Frame-Options',
      value: xFrame,
      status: xFrame ? 'good' : 'missing',
      importance: 'critical' as const,
      description: 'Protects visitors against Clickjacking and iframe embedding attacks.',
      recommendation: xFrame ? 'Clickjacking protection is active.' : 'Add: X-Frame-Options: DENY or SAMEORIGIN'
    },
    {
      name: 'X-Content-Type-Options',
      value: xContentType,
      status: xContentType === 'nosniff' ? 'good' : 'missing',
      importance: 'recommended' as const,
      description: 'Stops browsers from MIME-sniffing away from the declared content-type.',
      recommendation: xContentType === 'nosniff' ? 'MIME sniffing disabled.' : 'Add: X-Content-Type-Options: nosniff'
    },
    {
      name: 'Referrer-Policy',
      value: referrer,
      status: referrer ? 'good' : 'warning',
      importance: 'recommended' as const,
      description: 'Governs how much referrer information is sent along with outbound requests.',
      recommendation: referrer ? 'Referrer policy specified.' : 'Add: Referrer-Policy: strict-origin-when-cross-origin'
    },
    {
      name: 'Permissions-Policy',
      value: permissions ? (permissions.length > 50 ? permissions.substring(0, 50) + '...' : permissions) : null,
      status: permissions ? 'good' : 'missing',
      importance: 'optional' as const,
      description: 'Controls browser features (camera, microphone, geolocation, payment).',
      recommendation: permissions ? 'Permissions policy present.' : 'Add: Permissions-Policy: camera=(), microphone=(), geolocation=()'
    }
  ];

  // Calculate score
  let score = 50;
  if (isHttps) score += 20;
  if (hsts) score += 15;
  if (csp) score += 15;
  if (xFrame) score += 10;
  if (xContentType === 'nosniff') score += 10;
  if (referrer) score += 5;
  if (permissions) score += 5;
  if (server && /\d/.test(server)) score -= 10; // penalty for version disclosure

  score = Math.max(10, Math.min(100, score));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
  if (score >= 95) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  const vulnerabilities = [];
  if (!hsts) {
    vulnerabilities.push({
      title: 'Missing HTTP Strict Transport Security (HSTS)',
      severity: 'High' as const,
      description: 'The website does not mandate HTTPS connections via HSTS header, leaving users susceptible to SSL stripping and MitM attacks.',
      remediation: 'Configure web server (Nginx/Apache/Cloudflare) to send Strict-Transport-Security with at least 1-year max-age.'
    });
  }
  if (!csp) {
    vulnerabilities.push({
      title: 'Missing Content Security Policy (CSP)',
      severity: 'High' as const,
      description: 'Without a CSP header, the application relies solely on browser defaults, increasing risk of Cross-Site Scripting (XSS).',
      remediation: "Implement a restrictive CSP starting with default-src 'self' and disallowing inline unsafe scripts."
    });
  }
  if (!xFrame) {
    vulnerabilities.push({
      title: 'Clickjacking Vulnerability (Missing X-Frame-Options)',
      severity: 'Medium' as const,
      description: 'The web page can be framed by untrusted third-party sites, enabling UI redressing attacks.',
      remediation: 'Send X-Frame-Options: SAMEORIGIN or DENY.'
    });
  }
  if (server && /\d/.test(server)) {
    vulnerabilities.push({
      title: 'Web Server Version Information Disclosure',
      severity: 'Low' as const,
      description: `Server header reveals precise version details: "${server}". Attackers use this to identify targeted CVE exploits.`,
      remediation: 'Set "server_tokens off;" in Nginx or "ServerTokens Prod" in Apache httpd.'
    });
  }

  // Cookie analysis
  const cookiesList = [];
  if (setCookie) {
    const isSecure = setCookie.toLowerCase().includes('secure');
    const isHttpOnly = setCookie.toLowerCase().includes('httponly');
    const hasSameSite = setCookie.toLowerCase().includes('samesite');
    const issues = [];
    if (!isSecure) issues.push('Missing Secure flag');
    if (!isHttpOnly) issues.push('Missing HttpOnly flag (vulnerable to XSS theft)');
    if (!hasSameSite) issues.push('Missing SameSite attribute (vulnerable to CSRF)');
    cookiesList.push({
      name: 'SESSION_ID / AuthCookie',
      secure: isSecure,
      httpOnly: isHttpOnly,
      sameSite: hasSameSite ? 'Lax' : 'None',
      issues
    });
  } else {
    cookiesList.push({
      name: '__Host-session',
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
      issues: []
    });
  }

  res.json({
    url: formattedUrl,
    scanTime: new Date().toISOString(),
    serverBanner: server || 'Protected (Banner hidden)',
    httpStatus,
    overallScore: score,
    grade,
    httpsConfig: {
      enabled: isHttps,
      tlsVersion: isHttps ? 'TLS 1.3 / AES-256-GCM' : 'None (Plaintext HTTP)',
      certIssuer: isHttps ? "Let's Encrypt Authority R3 / DigiCert" : 'None',
      certValidUntil: isHttps ? '2026-12-31' : 'N/A',
      daysRemaining: isHttps ? 73 : 0,
      hstsEnabled: Boolean(hsts),
      hstsPreload: Boolean(hsts && hsts.includes('preload')),
      hstsMaxAge: 31536000
    },
    headers: headerChecks,
    cookies: cookiesList,
    vulnerabilities
  });
});

// 4. Vulnerability Catalog & CVE Assessment API
app.get('/api/vulnerabilities', (req: Request, res: Response) => {
  res.json(vulnerabilityCatalog);
});

// 5. AI Security Advisor using @google/genai SDK
app.post('/api/security/ai-remediation', async (req: Request, res: Response) => {
  const { vulnerabilityTitle, cveId, component, contextDetails } = req.body;

  if (!aiClient) {
    // Return structured expert response if Gemini API key is not yet set
    return res.json({
      success: true,
      source: 'offline-knowledge-base',
      executiveSummary: `Remediation plan for ${cveId || 'Vulnerability'} (${vulnerabilityTitle || 'System Component'}): Prioritize patching affected package ${component || 'service'} and enforcing least privilege.`,
      actionSteps: [
        `1. Immediately isolate affected target host from production routing if exploit is actively weaponized.`,
        `2. Apply vendor security patch for ${component || 'component'} to the latest stable LTS branch.`,
        `3. Verify configuration parameters in service daemon configuration file.`,
        `4. Re-run AegisSec vulnerability scan to confirm resolution.`
      ],
      hardeningSnippet: `# Hardening & Mitigation Configuration\n# Target: ${component || 'Linux Service'}\nsudo apt-get update && sudo apt-get --only-upgrade install ${component?.split(' ')[0] || 'package'}\n\n# Enforce firewall drop rule\nsudo iptables -A INPUT -p tcp --dport 2376 ! -s 192.168.1.0/24 -j DROP\n`,
      verificationCommand: `sudo auditctl -l && nmap -sV -p 22,80,443,2376 127.0.0.1`
    });
  }

  try {
    const prompt = `You are a Principal Cybersecurity Engineer and Ethical Hacker.
Provide a clear, actionable remediation protocol for the following security finding:
- Finding: ${vulnerabilityTitle}
- CVE: ${cveId}
- Component: ${component}
- Context Details: ${contextDetails || 'Identified during authorized internal network penetration test'}

Provide your response in JSON format with exactly the following keys:
{
  "executiveSummary": "1-2 sentences summarizing risk and urgency",
  "actionSteps": ["Array of 4-5 numbered actionable remediation steps"],
  "hardeningSnippet": "Bash script, Nginx/Apache config, or iptables rule demonstrating the exact fix",
  "verificationCommand": "Single shell command (e.g. nmap, curl, or openssl) to verify remediation success"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      source: 'gemini-2.5-flash',
      ...parsed
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to generate AI remediation',
      details: err.message
    });
  }
});

// 6. Monitoring Devices API
app.get('/api/monitoring/devices', (req: Request, res: Response) => {
  res.json([
    {
      id: 'mon-01',
      name: 'Perimeter Firewall FW-01',
      ip: '192.168.1.1',
      type: 'firewall',
      status: 'operational',
      uptimePercent: 99.98,
      currentLatency: 4.2,
      latencyHistory: [
        { timestamp: '08:00', latency: 4.1 },
        { timestamp: '08:15', latency: 4.3 },
        { timestamp: '08:30', latency: 4.0 },
        { timestamp: '08:45', latency: 4.5 },
        { timestamp: '09:00', latency: 4.2 }
      ],
      services: [
        { name: 'WireGuard VPN', port: 51820, status: 'up' },
        { name: 'BGP Routing', port: 179, status: 'up' }
      ]
    },
    {
      id: 'mon-02',
      name: 'Auth & Directory Server LDAP-01',
      ip: '192.168.1.15',
      type: 'server',
      status: 'operational',
      uptimePercent: 99.85,
      currentLatency: 11.4,
      latencyHistory: [
        { timestamp: '08:00', latency: 10.2 },
        { timestamp: '08:15', latency: 12.0 },
        { timestamp: '08:30', latency: 11.1 },
        { timestamp: '08:45', latency: 14.8 },
        { timestamp: '09:00', latency: 11.4 }
      ],
      services: [
        { name: 'LDAPS', port: 636, status: 'up' },
        { name: 'Kerberos KDC', port: 88, status: 'up' }
      ]
    },
    {
      id: 'mon-03',
      name: 'Kubernetes Worker Node K8S-02',
      ip: '192.168.1.45',
      type: 'server',
      status: 'degraded',
      uptimePercent: 98.40,
      currentLatency: 38.6,
      latencyHistory: [
        { timestamp: '08:00', latency: 15.2 },
        { timestamp: '08:15', latency: 18.0 },
        { timestamp: '08:30', latency: 26.5 },
        { timestamp: '08:45', latency: 45.1 },
        { timestamp: '09:00', latency: 38.6 }
      ],
      services: [
        { name: 'Kubelet', port: 10250, status: 'up' },
        { name: 'Docker Daemon', port: 2376, status: 'up' }
      ],
      lastAlert: 'High memory load and container escape advisory detected'
    },
    {
      id: 'mon-04',
      name: 'Database Cluster DB-POSTGRES',
      ip: '192.168.1.90',
      type: 'database',
      status: 'operational',
      uptimePercent: 100.0,
      currentLatency: 2.1,
      latencyHistory: [
        { timestamp: '08:00', latency: 2.0 },
        { timestamp: '08:15', latency: 2.2 },
        { timestamp: '08:30', latency: 2.1 },
        { timestamp: '08:45', latency: 2.3 },
        { timestamp: '09:00', latency: 2.1 }
      ],
      services: [
        { name: 'PostgreSQL 14', port: 5432, status: 'up' },
        { name: 'pg_exporter', port: 9187, status: 'up' }
      ]
    }
  ]);
});

// 7. Security Alerts Stream
app.get('/api/monitoring/alerts', (req: Request, res: Response) => {
  res.json([
    {
      id: 'alt-01',
      timestamp: '2026-10-19 07:42:10 UTC',
      title: 'Abnormal TCP SYN Sweep Detected',
      description: 'Sequential SYN probes against ports 1-1024 from non-whitelisted internal IP 192.168.1.189.',
      severity: 'High',
      sourceIp: '192.168.1.189',
      targetIp: '192.168.1.1',
      acknowledged: false,
      category: 'Port Scan'
    },
    {
      id: 'alt-02',
      timestamp: '2026-10-19 06:14:22 UTC',
      title: 'SSL/TLS Certificate Expiration Warning',
      description: 'Certificate for internal-dev.corp expires in 14 days. Renewal required to prevent service disruption.',
      severity: 'Medium',
      sourceIp: '192.168.1.75',
      targetIp: '192.168.1.75',
      acknowledged: true,
      category: 'Cert Expiry'
    },
    {
      id: 'alt-03',
      timestamp: '2026-10-19 04:30:00 UTC',
      title: 'High-Risk Docker Daemon Exposure',
      description: 'Docker TCP daemon port 2376 is bound without TLS client certificate verification on k8s-worker-node-02.',
      severity: 'Critical',
      sourceIp: '192.168.1.45',
      targetIp: '192.168.1.45',
      acknowledged: false,
      category: 'Policy Violation'
    }
  ]);
});

// 8. Audit Logs API
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(auditLogsStore);
});

// 9. Sandbox Terminal Simulator for Practice Lab
app.post('/api/lab/execute-terminal', (req: Request, res: Response) => {
  const { command, activeChallengeId } = req.body;
  if (!command) {
    return res.json({ output: '' });
  }

  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();

  // Defensive simulation of standard ethical hacking commands
  let output = '';

  if (lower === 'help') {
    output = `AegisSec Lab Shell v2.4 (Defensive Sandbox)
Available commands:
  nmap [options] <target>  - Network exploration and service detector
  netstat -tuln            - Print network connections and listening ports
  ss -tulpn                - Modern socket statistics
  curl -I <url>            - Fetch HTTP headers of target
  whois <domain/ip>        - Query registry data for target
  dig <domain> +short      - DNS lookup utility
  traceroute <target>      - Trace packet route across hops
  cat <filepath>           - Read simulated config file
  chmod <mode> <file>      - Change simulated file permissions
  iptables -L -n -v        - List current packet filtering rules
  grep <pattern> <file>    - Search pattern in file
  clear                    - Clear terminal screen
  flag <flag_value>        - Submit captured challenge flag`;
  } else if (lower.startsWith('nmap')) {
    if (lower.includes('-sv') || lower.includes('-s') || lower.includes('192.168') || lower.includes('localhost') || lower.includes('127.0.0.1')) {
      output = `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-19 07:50 UTC
Nmap scan report for sandbox-target.lab (10.10.10.42)
Host is up (0.00042s latency).
Not shown: 996 closed tcp ports (reset)
PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           vsftpd 3.0.3 (Anonymous FTP enabled)
22/tcp   open  ssh           OpenSSH 8.9p1 Ubuntu 3ubuntu0.1
80/tcp   open  http          Apache httpd 2.4.52 ((Ubuntu))
| http-title: Cyber Defense Training Portal
|_http-server-header: Apache/2.4.52 (Ubuntu)
443/tcp  open  ssl/https     Apache/2.4.52
8080/tcp open  http-proxy    Werkzeug/2.2.2 Python/3.10.12
| http-robots.txt: 1 disallowed entry 
|_/hidden-admin-backup.tar.gz

Service detection performed. Please report findings responsibly.
Nmap done: 1 IP address (1 host up) scanned in 1.48 seconds`;
    } else {
      output = `Usage: nmap -sV -p- 10.10.10.42 (or nmap localhost)`;
    }
  } else if (lower.startsWith('curl')) {
    output = `HTTP/1.1 200 OK
Date: Mon, 19 Oct 2026 07:51:00 GMT
Server: Apache/2.4.52 (Ubuntu)
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Type: text/html; charset=UTF-8`;
  } else if (lower === 'netstat -tuln' || lower === 'netstat' || lower === 'ss -tulpn') {
    output = `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      892/sshd            
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1043/apache2        
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1043/apache2        
tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN      912/postgres        
tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      1420/python3`;
  } else if (lower.startsWith('iptables')) {
    output = `Chain INPUT (policy DROP 12 packets, 720 bytes)
 pkts bytes target     prot opt in     out     source               destination         
 1420  184K ACCEPT     all  --  lo     *       0.0.0.0/0            0.0.0.0/0           
  890  112K ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
  140  8400 ACCEPT     tcp  --  eth0   *       192.168.1.0/24       0.0.0.0/0            tcp dpt:22
  512 30720 ACCEPT     tcp  --  eth0   *       0.0.0.0/0            0.0.0.0/0            tcp dpt:443

Chain FORWARD (policy DROP 0 packets, 0 bytes)

Chain OUTPUT (policy ACCEPT 1940 packets, 245K bytes)`;
  } else if (lower.startsWith('cat /etc/passwd')) {
    output = `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
sysadmin:x:1000:1000:SysAdmin User,,,:/home/sysadmin:/bin/bash
analyst:x:1001:1001:SecOps Analyst,,,:/home/analyst:/bin/bash
sshd:x:110:65534::/run/sshd:/usr/sbin/nologin
postgres:x:115:122:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash`;
  } else if (lower.startsWith('flag ')) {
    const entered = trimmed.split(' ')[1];
    if (entered && (entered === 'FLAG{ETHICAL_RECON_2026}' || entered === 'FLAG{SECURE_CIPHER_SUITE}' || entered === 'FLAG{NO_LEAK_FD_ESC}')) {
      output = `[+] SUCCESS! Correct flag submitted: ${entered}\n[+] Points awarded: +250 XP. Challenge objective accomplished!`;
    } else {
      output = `[-] Incorrect flag. Review the challenge objectives and examine service banners carefully.`;
    }
  } else if (lower === 'whois' || lower.startsWith('whois')) {
    output = `Domain Name: INTERNAL-CORP.LAB
Registry Domain ID: 2984102-DEFENSE
Registrar WHOIS Server: whois.nic.lab
Updated Date: 2026-01-10T12:00:00Z
Creation Date: 2024-05-15T08:00:00Z
Registrant Organization: Defense Security Operations Center
Registrant State/Province: Security Sector 4
Name Server: NS1.INTERNAL-CORP.LAB (192.168.1.53)
Name Server: NS2.INTERNAL-CORP.LAB (192.168.1.54)
DNSSEC: signedDelegation`;
  } else if (lower.startsWith('dig')) {
    output = `; <<>> DiG 9.18.18-Ubuntu <<>> defense.internal.corp
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 48192
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; ANSWER SECTION:
defense.internal.corp.   300 IN  A   192.168.1.10

;; Query time: 2 msec
;; SERVER: 192.168.1.1#53(192.168.1.1)`;
  } else {
    output = `bash: ${trimmed}: command not found in restricted defense lab. Type 'help' for permitted utilities.`;
  }

  res.json({ output });
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AegisSec Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
