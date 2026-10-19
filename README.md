# AegisSec – Ethical Cybersecurity & PenTesting Suite

> **Role & Objective:** Professional white-hat cybersecurity platform for authorized penetration testing, vulnerability assessment, web security auditing, network monitoring, and defensive security learning labs.

---

## 1. Ethical Boundary & Safe Harbor Policy

AegisSec is designed exclusively for **authorized administrative audits, defensive security engineering, compliance validation (ISO 27001 / SOC 2 / PCI-DSS), and educational learning**.

- **Explicit Scope Authorization:** Scanning requires verification of scope agreement and system owner declaration.
- **Safe Probes:** All network and website checks use non-destructive, benign TCP socket probes and standard HTTP header requests.
- **Zero Exploit Execution:** No ransomware, remote exploit delivery, phishing credential collection, or denial-of-service tools are included.
- **In-Memory Credential Analysis:** Password entropy and policy auditing run 100% locally in browser memory without sending data to servers.

---

## 2. Platform Architecture

```
aegis-sec/
├── server.ts                  # Express full-stack backend & Vite middleware
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main application controller & state orchestrator
│   ├── types/
│   │   └── security.ts       # Domain TypeScript definitions (Hosts, CVEs, Audits)
│   ├── utils/
│   │   ├── exportHelpers.ts  # CSV and PDF report generation (jsPDF)
│   │   └── passwordEntropy.ts# Local cryptographic entropy calculator
│   └── components/
│       ├── Navbar.tsx        # Top Bar Contract header
│       ├── Sidebar.tsx       # 11-module security navigation
│       ├── AuthorizationModal.tsx # Legal authorization confirmation modal
│       ├── DashboardView.tsx # Executive posture & risk dashboard
│       ├── NetworkScannerView.tsx # Authorized TCP port & service detector
│       ├── VulnerabilityAssessmentView.tsx # CVE correlation & Gemini AI advisor
│       ├── WebsiteSecurityView.tsx # HTTP/HTTPS TLS & header inspector
│       ├── PasswordSecurityView.tsx # Password policy & entropy auditor
│       ├── NetworkMonitoringView.tsx # Live ping, uptime & node telemetry
│       ├── SecurityReportsView.tsx # PDF / CSV report compiler
│       ├── PracticeLabView.tsx # Interactive ethical hacking lab & shell
│       ├── ScanHistoryView.tsx # Execution audit log
│       ├── UserManagementView.tsx # RBAC permission matrix
│       └── SettingsView.tsx  # Scope whitelist & rate limiting
├── Dockerfile                # Multi-stage production container image
├── docker-compose.yml        # Orchestration configuration
└── package.json
```

---

## 3. Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Optional: **Gemini API Key** (`GEMINI_API_KEY`) for AI remediation recommendations.

### Setup on Linux & macOS

```bash
# 1. Clone repository
git clone <repository_url> aegis-sec
cd aegis-sec

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and supply GEMINI_API_KEY if desired

# 4. Start full-stack development server (Port 3000)
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Setup on Windows (PowerShell)

```powershell
# 1. Clone repository
git clone <repository_url> aegis-sec
cd aegis-sec

# 2. Install dependencies
npm install

# 3. Configure environment variables
Copy-Item .env.example .env
# Edit .env with your favorite editor

# 4. Start development server
npm run dev
```

---

## 4. Docker Deployment

### Run with Docker Compose

```bash
# Build and start container in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f
```

The application will be served on `http://localhost:3000`.

---

## 5. Core Operational Modules

1. **Cybersecurity Dashboard**: High-density security scorecards, CVSS v3.1 severity breakdown, monitored device counts, and unacknowledged alert streams.
2. **Network Scanner**: Safe TCP port scanning, service version banner grabbing (`-sV`), and CVE matching across permitted CIDR ranges. Export results to CSV.
3. **Vulnerability Assessment**: Searchable CVE catalog with CVSS scores, remediation instructions, and **Gemini 2.5 Flash AI Remediation Advisor** generating custom bash hardening scripts and verification commands.
4. **Website Security Checker**: Real-time non-destructive HTTP/HTTPS inspection analyzing TLS configurations, certificate expiration, HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and cookie security flags.
5. **Password Security Module**: Client-side information entropy calculation ($L \times \log_2 R$), GPU brute-force crack-time projection, NIST SP 800-63B policy compliance check, live SHA-256 digest, and education on Argon2id, bcrypt, salting, and FIDO2 MFA.
6. **Network Monitoring**: Continuous ping latency tracking, historical sparklines, uptime percentages, and service daemon heartbeat monitoring.
7. **Security Reports**: Formal downloadable penetration test reports compiled to PDF with executive summaries, metrics, and remediation advisories.
8. **Practice Lab**: Interactive cybersecurity academy with guided challenges, live interactive Linux web terminal emulator, and instant knowledge quizzes.
9. **Scan History**: Full immutable audit trail recording operator identity, target parameters, duration, and findings.
10. **User Management**: Role-Based Access Control (RBAC) permission matrix enforcing least privilege for Admins, Lead Pentesters, Auditors, and Analysts.
11. **Settings**: Configurable scope whitelist (RFC 1918 subnets), socket concurrency throttles, timeout limits, and SIEM webhook integration.
