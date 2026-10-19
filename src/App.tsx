/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NetworkScannerView } from './components/NetworkScannerView';
import { VulnerabilityAssessmentView } from './components/VulnerabilityAssessmentView';
import { WebsiteSecurityView } from './components/WebsiteSecurityView';
import { PasswordSecurityView } from './components/PasswordSecurityView';
import { NetworkMonitoringView } from './components/NetworkMonitoringView';
import { SecurityReportsView } from './components/SecurityReportsView';
import { PracticeLabView } from './components/PracticeLabView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { UserManagementView } from './components/UserManagementView';
import { SettingsView } from './components/SettingsView';
import { AuthorizationModal } from './components/AuthorizationModal';
import {
  VulnerabilityRecord,
  MonitoringDevice,
  SecurityAlert,
  ScanResult,
  SecurityReport,
  ScanTargetConfig
} from './types/security';

const INITIAL_VULNS: VulnerabilityRecord[] = [
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
    description: 'Internal file descriptors leaked during container startup allow processes within the container to write to the host filesystem.',
    impact: 'Attackers inside a container can break isolation and gain full root control on the container host node.',
    remediation: 'Upgrade runc to version 1.1.12+ and containerd to v1.6.28 / v1.7.13.',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2024-21626',
    cwe: 'CWE-403: Exposure of File Descriptor'
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
    description: 'Targeted backdoor in liblzma intercepts sshd authentication routines, granting unauthorized remote code execution.',
    impact: 'Remote unauthenticated execution with root privileges.',
    remediation: 'Downgrade to xz 5.4.6 or install distribution vendor backport patches immediately.',
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
    description: 'Man-in-the-middle attackers can manipulate sequence numbers during SSH handshake extension negotiation.',
    impact: 'Disables extension negotiation messages and downgrades connection security.',
    remediation: 'Enforce strict key exchange ("strict KEX") in sshd_config and disable chacha20-poly1305 and *-cbc ciphers.',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2023-48795',
    cwe: 'CWE-354: Integrity Check Validation'
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
    description: 'Default args4j command parser allows reading arbitrary files on the Jenkins controller via @ parameter syntax.',
    impact: 'Unauthenticated attackers can extract cryptographic secrets, encryption keys, and credentials from disk.',
    remediation: 'Upgrade Jenkins to version 2.442 or 2.426.3 LTS. Disable CLI access if upgrade is pending.',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2024-23897',
    cwe: 'CWE-22: Path Traversal'
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
    description: 'Improper privilege evaluation in PostgreSQL session parameters allowed non-admin roles to escalate.',
    impact: 'Unauthorized access to restricted database schemas.',
    remediation: 'Apply minor version update (e.g. 14.9+ or 15.4+) and audit pg_roles grants.',
    patchLink: 'https://nvd.nist.gov/vuln/detail/CVE-2023-38606',
    cwe: 'CWE-269: Privilege Management'
  }
];

const INITIAL_DEVICES: MonitoringDevice[] = [
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
];

const INITIAL_ALERTS: SecurityAlert[] = [
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
];

const INITIAL_REPORTS: SecurityReport[] = [
  {
    id: 'rep-01',
    title: 'Q4 Enterprise DMZ Penetration Test & Audit',
    type: 'Technical Vulnerability Audit',
    generatedAt: '2026-10-15T14:30:00Z',
    generatedBy: 'Captain Alex Vance',
    targetScope: '192.168.1.0/24 (VLAN 10 DMZ)',
    summary: {
      totalAssets: 14,
      criticalFindings: 2,
      highFindings: 1,
      mediumFindings: 2,
      lowFindings: 4,
      complianceScore: 84
    },
    keyFindings: [
      'runc container escape (CVE-2024-21626) identified on k8s worker node',
      'OpenSSH Terrapin weakness identified on perimeter edge firewall',
      'Missing Content-Security-Policy on internal banking portal'
    ],
    status: 'Ready'
  },
  {
    id: 'rep-02',
    title: 'Annual ISO/IEC 27001 Technical Security Assessment',
    type: 'Compliance Audit',
    generatedAt: '2026-09-28T10:00:00Z',
    generatedBy: 'Sarah Connor (Security Auditor)',
    targetScope: 'Enterprise Corporate Subnets',
    summary: {
      totalAssets: 48,
      criticalFindings: 0,
      highFindings: 2,
      mediumFindings: 5,
      lowFindings: 8,
      complianceScore: 92
    },
    keyFindings: [
      'Multi-factor authentication (MFA) verified across 95% of active directory personnel',
      'Encrypted transport enforced on 100% of external web gateways'
    ],
    status: 'Archived'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scopeVerified, setScopeVerified] = useState(true);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityRecord[]>(INITIAL_VULNS);
  const [devices, setDevices] = useState<MonitoringDevice[]>(INITIAL_DEVICES);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_ALERTS);
  const [reports, setReports] = useState<SecurityReport[]>(INITIAL_REPORTS);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([
    {
      id: 'scan-init-01',
      timestamp: '2026-10-19T07:15:00Z',
      target: '192.168.1.0/24',
      scanType: 'Standard Scan (Ports 1-1024)',
      durationMs: 1420,
      hostsDiscovered: [
        {
          id: 'host-01',
          ip: '192.168.1.1',
          mac: '00:1A:2B:3C:4D:01',
          hostname: 'gw-edge-router.corp',
          vendor: 'Cisco Systems',
          status: 'online',
          osGuess: 'Linux 5.15 / Cisco IOS XE',
          latencyMs: 14,
          openPorts: [
            { port: 22, protocol: 'tcp', service: 'ssh', version: 'OpenSSH 8.9p1', state: 'open', risk: 'low', cveMatches: ['CVE-2023-48795'] },
            { port: 80, protocol: 'tcp', service: 'http', version: 'nginx/1.22.1', state: 'open', risk: 'medium' },
            { port: 443, protocol: 'tcp', service: 'https', version: 'nginx/1.22.1 (TLS 1.3)', state: 'open', risk: 'safe' }
          ],
          lastScanned: '2026-10-19T07:15:00Z',
          vulnerabilityCount: { critical: 0, high: 0, medium: 1, low: 2 }
        },
        {
          id: 'host-02',
          ip: '192.168.1.15',
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
          lastScanned: '2026-10-19T07:15:00Z',
          vulnerabilityCount: { critical: 0, high: 1, medium: 0, low: 1 }
        },
        {
          id: 'host-03',
          ip: '192.168.1.45',
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
          lastScanned: '2026-10-19T07:15:00Z',
          vulnerabilityCount: { critical: 1, high: 0, medium: 1, low: 0 }
        },
        {
          id: 'host-04',
          ip: '192.168.1.80',
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
          lastScanned: '2026-10-19T07:15:00Z',
          vulnerabilityCount: { critical: 0, high: 1, medium: 1, low: 0 }
        },
        {
          id: 'host-05',
          ip: '192.168.1.90',
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
          lastScanned: '2026-10-19T07:15:00Z',
          vulnerabilityCount: { critical: 0, high: 0, medium: 1, low: 1 }
        }
      ],
      totalPortsScanned: 1024,
      openPortsCount: 13,
      operator: 'Captain Alex Vance',
      status: 'completed'
    }
  ]);

  // Load backend data if available
  useEffect(() => {
    fetch('/api/vulnerabilities')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setVulnerabilities(data);
      })
      .catch(() => {});

    fetch('/api/monitoring/devices')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDevices(data);
      })
      .catch(() => {});

    fetch('/api/monitoring/alerts')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAlerts(data);
      })
      .catch(() => {});
  }, []);

  const handleExecuteScan = async (config: ScanTargetConfig): Promise<ScanResult> => {
    const res = await fetch('/api/scan/network', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const result: ScanResult = await res.json();
    setRecentScans((prev) => [result, ...prev]);
    return result;
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleRefreshDevices = () => {
    fetch('/api/monitoring/devices')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDevices(data);
      })
      .catch(() => {});
  };

  const handleAddReport = (report: SecurityReport) => {
    setReports((prev) => [report, ...prev]);
  };

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openScopeModal={() => setShowScopeModal(true)}
        scopeVerified={scopeVerified}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alertCount={unacknowledgedCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              vulnerabilities={vulnerabilities}
              devices={devices}
              alerts={alerts}
              recentScans={recentScans}
              onNavigate={setActiveTab}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onTriggerScan={() => {
                setActiveTab('network-scanner');
              }}
            />
          )}

          {activeTab === 'network-scanner' && (
            <NetworkScannerView
              onExecuteScan={handleExecuteScan}
              recentScans={recentScans}
              scopeVerified={scopeVerified}
              openScopeModal={() => setShowScopeModal(true)}
            />
          )}

          {activeTab === 'vulnerabilities' && (
            <VulnerabilityAssessmentView
              vulnerabilities={vulnerabilities}
            />
          )}

          {activeTab === 'website-security' && (
            <WebsiteSecurityView />
          )}

          {activeTab === 'password-security' && (
            <PasswordSecurityView />
          )}

          {activeTab === 'network-monitoring' && (
            <NetworkMonitoringView
              devices={devices}
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onRefreshDevices={handleRefreshDevices}
            />
          )}

          {activeTab === 'security-reports' && (
            <SecurityReportsView
              reports={reports}
              vulnerabilities={vulnerabilities}
              onAddReport={handleAddReport}
            />
          )}

          {activeTab === 'practice-lab' && (
            <PracticeLabView />
          )}

          {activeTab === 'scan-history' && (
            <ScanHistoryView
              scans={recentScans}
              onRerunScan={(tgt) => {
                setActiveTab('network-scanner');
              }}
            />
          )}

          {activeTab === 'user-management' && (
            <UserManagementView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Scope Verification Modal */}
      <AuthorizationModal
        isOpen={showScopeModal}
        onClose={() => setShowScopeModal(false)}
        onConfirm={() => setScopeVerified(true)}
        targetScope="192.168.1.0/24 (VLAN 10 DMZ & Internal Assets)"
      />
    </div>
  );
}
