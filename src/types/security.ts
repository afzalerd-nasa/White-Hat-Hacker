export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type UserRole = 'Admin' | 'Lead Pentester' | 'Security Auditor' | 'SecOps Analyst';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface NetworkHost {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  status: 'online' | 'offline' | 'unresponsive';
  osGuess?: string;
  latencyMs: number;
  openPorts: OpenPort[];
  lastScanned: string;
  vulnerabilityCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface OpenPort {
  port: number;
  protocol: 'tcp' | 'udp';
  service: string;
  version?: string;
  state: 'open' | 'filtered' | 'closed';
  risk: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  cveMatches?: string[];
}

export interface ScanTargetConfig {
  target: string;
  scanType: 'quick' | 'standard' | 'full' | 'custom';
  ports?: string;
  timeout: number;
  serviceDetection: boolean;
  authorizedScopeConfirmed: boolean;
  organization: string;
  authorizerName: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  target: string;
  scanType: string;
  durationMs: number;
  hostsDiscovered: NetworkHost[];
  totalPortsScanned: number;
  openPortsCount: number;
  operator: string;
  status: 'completed' | 'in-progress' | 'failed' | 'aborted';
}

export interface VulnerabilityRecord {
  id: string;
  cveId: string;
  title: string;
  severity: SeverityLevel;
  cvssScore: number;
  affectedComponent: string;
  affectedVersions: string;
  discoveredOn: string;
  status: 'Open' | 'In Remediation' | 'Mitigated' | 'False Positive';
  hostIp: string;
  hostname: string;
  port?: number;
  description: string;
  impact: string;
  remediation: string;
  patchLink?: string;
  cwe?: string;
}

export interface WebsiteAuditResult {
  url: string;
  scanTime: string;
  ipAddress?: string;
  serverBanner?: string;
  httpStatus: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  httpsConfig: {
    enabled: boolean;
    tlsVersion?: string;
    certIssuer?: string;
    certValidUntil?: string;
    daysRemaining?: number;
    hstsEnabled: boolean;
    hstsPreload?: boolean;
    hstsMaxAge?: number;
  };
  headers: {
    name: string;
    value: string | null;
    status: 'good' | 'warning' | 'missing';
    importance: 'critical' | 'recommended' | 'optional';
    description: string;
    recommendation: string;
  }[];
  cookies: {
    name: string;
    secure: boolean;
    httpOnly: boolean;
    sameSite: string;
    issues: string[];
  }[];
  vulnerabilities: {
    title: string;
    severity: SeverityLevel;
    description: string;
    remediation: string;
  }[];
}

export interface PasswordAuditResult {
  score: number; // 0 - 100
  entropyBits: number;
  estimatedCrackTime: string;
  strengthLabel: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  checks: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
  sha256Hash: string;
  suggestions: string[];
}

export interface MonitoringDevice {
  id: string;
  name: string;
  ip: string;
  type: 'server' | 'router' | 'switch' | 'firewall' | 'database' | 'workstation';
  status: 'operational' | 'degraded' | 'down';
  uptimePercent: number;
  latencyHistory: { timestamp: string; latency: number }[];
  currentLatency: number;
  services: { name: string; port: number; status: 'up' | 'down' }[];
  lastAlert?: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  sourceIp: string;
  targetIp: string;
  acknowledged: boolean;
  category: 'Port Scan' | 'Brute Force Attempt' | 'Outdated Service' | 'Cert Expiry' | 'Policy Violation';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  details: string;
  status: 'SUCCESS' | 'DENIED' | 'WARNING';
}

export interface SecurityReport {
  id: string;
  title: string;
  type: 'Executive Summary' | 'Technical Vulnerability Audit' | 'Network Topology' | 'Compliance Audit';
  generatedAt: string;
  generatedBy: string;
  targetScope: string;
  summary: {
    totalAssets: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
    complianceScore: number;
  };
  keyFindings: string[];
  status: 'Archived' | 'Ready';
}

export interface PracticeLabChallenge {
  id: string;
  title: string;
  category: 'Reconnaissance' | 'Network Analysis' | 'Linux Defense' | 'Web Security' | 'Cryptography';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  scenario: string;
  objectives: string[];
  hints: string[];
  simulatedEnvironment: {
    hostname: string;
    openServices: string[];
    hiddenFlag: string;
  };
  quizQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  completed?: boolean;
}
