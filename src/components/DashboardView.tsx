import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Server,
  Activity,
  Bug,
  Globe,
  Radio,
  ArrowUpRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { VulnerabilityRecord, MonitoringDevice, SecurityAlert, ScanResult } from '../types/security';

interface DashboardViewProps {
  vulnerabilities: VulnerabilityRecord[];
  devices: MonitoringDevice[];
  alerts: SecurityAlert[];
  recentScans: ScanResult[];
  onNavigate: (tab: string) => void;
  onAcknowledgeAlert: (id: string) => void;
  onTriggerScan: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vulnerabilities,
  devices,
  alerts,
  recentScans,
  onNavigate,
  onAcknowledgeAlert,
  onTriggerScan
}) => {
  const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'Medium').length;
  const lowCount = vulnerabilities.filter(v => v.severity === 'Low').length;

  const onlineDevices = devices.filter(d => d.status === 'operational').length;
  const degradedDevices = devices.filter(d => d.status === 'degraded').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <span>Cybersecurity Defense & Operations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time defensive surveillance, authorized penetration testing metrics, asset vulnerability mapping, and security posture auditing.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('security-reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            Security Reports
          </button>
          <button
            onClick={onTriggerScan}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-emerald-950"
          >
            <Radio className="h-3.5 w-3.5" />
            Launch Authorized Scan
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Risk Index */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Security Posture Rating</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              B+
            </span>
            <span className="text-xs text-slate-400 font-mono">
              78 / 100 Score
            </span>
          </div>
          <div className="text-[11px] text-slate-500 leading-tight">
            ISO 27001 & CIS benchmark target met for 82% of assets.
          </div>
        </div>

        {/* Card 2: Vulnerabilities */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Detected Vulnerabilities</span>
            <Bug className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100 tabular-nums">
              {vulnerabilities.length}
            </span>
            <span className="text-xs text-rose-400 font-mono">
              {criticalCount} Critical · {highCount} High
            </span>
          </div>
          <div className="text-[11px] text-slate-500 leading-tight">
            2 require immediate kernel/daemon patching.
          </div>
        </div>

        {/* Card 3: Monitored Devices */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monitored Assets</span>
            <Server className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100 tabular-nums">
              {devices.length}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              {onlineDevices} Operational
            </span>
            {degradedDevices > 0 && (
              <span className="text-xs text-amber-400 font-mono">
                · {degradedDevices} Degraded
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 leading-tight">
            Average ping latency 14.1ms across authorized subnet.
          </div>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Security Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
              {unacknowledgedAlerts.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Unacknowledged
            </span>
          </div>
          <div className="text-[11px] text-slate-500 leading-tight">
            Latest: Abnormal TCP SYN sweep from internal host.
          </div>
        </div>
      </div>

      {/* Main Grid: Vulnerability Severity Distribution + Real-time Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Vulnerability Summary & Assets Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Severity Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Vulnerability Severity Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Common Vulnerability Scoring System (CVSS v3.1) breakdown
                </p>
              </div>
              <button
                onClick={() => onNavigate('vulnerabilities')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>View All Findings</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Severity Meter Bar */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(criticalCount / (vulnerabilities.length || 1)) * 100}%` }}
                className="bg-rose-500 h-full"
                title={`Critical: ${criticalCount}`}
              />
              <div
                style={{ width: `${(highCount / (vulnerabilities.length || 1)) * 100}%` }}
                className="bg-orange-500 h-full"
                title={`High: ${highCount}`}
              />
              <div
                style={{ width: `${(mediumCount / (vulnerabilities.length || 1)) * 100}%` }}
                className="bg-amber-500 h-full"
                title={`Medium: ${mediumCount}`}
              />
              <div
                style={{ width: `${(lowCount / (vulnerabilities.length || 1)) * 100}%` }}
                className="bg-blue-500 h-full"
                title={`Low: ${lowCount}`}
              />
            </div>

            {/* Legend with tabular counts */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
              <div className="border border-slate-800 rounded-lg p-2 bg-slate-950/40">
                <div className="text-[10px] text-rose-400 uppercase font-semibold">Critical</div>
                <div className="text-lg font-bold text-rose-400 tabular-nums">{criticalCount}</div>
                <div className="text-[10px] text-slate-500">CVSS 9.0-10.0</div>
              </div>
              <div className="border border-slate-800 rounded-lg p-2 bg-slate-950/40">
                <div className="text-[10px] text-orange-400 uppercase font-semibold">High</div>
                <div className="text-lg font-bold text-orange-400 tabular-nums">{highCount}</div>
                <div className="text-[10px] text-slate-500">CVSS 7.0-8.9</div>
              </div>
              <div className="border border-slate-800 rounded-lg p-2 bg-slate-950/40">
                <div className="text-[10px] text-amber-400 uppercase font-semibold">Medium</div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">{mediumCount}</div>
                <div className="text-[10px] text-slate-500">CVSS 4.0-6.9</div>
              </div>
              <div className="border border-slate-800 rounded-lg p-2 bg-slate-950/40">
                <div className="text-[10px] text-blue-400 uppercase font-semibold">Low</div>
                <div className="text-lg font-bold text-blue-400 tabular-nums">{lowCount}</div>
                <div className="text-[10px] text-slate-500">CVSS 0.1-3.9</div>
              </div>
            </div>

            {/* Top Critical Findings Preview */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-slate-400">
                Priority Remediation Queue
              </div>
              {vulnerabilities.slice(0, 3).map((vuln) => (
                <div
                  key={vuln.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{vuln.cveId}</span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs font-semibold text-slate-200">{vuln.title}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Host: <span className="font-mono text-slate-300">{vuln.hostIp}</span> ({vuln.hostname}) · Component: <span className="text-slate-300">{vuln.affectedComponent}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                      vuln.severity === 'Critical'
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                        : vuln.severity === 'High'
                        ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                        : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    }`}>
                      {vuln.severity} · {vuln.cvssScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Active Infrastructure Telemetry */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Authorized Monitored Topology
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subnet 192.168.1.0/24 node status and health check latencies
                </p>
              </div>
              <button
                onClick={() => onNavigate('network-monitoring')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Telemetry</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{device.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      device.status === 'operational'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {device.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{device.ip}</span>
                    <span className="tabular-nums">{device.currentLatency}ms</span>
                    <span className="tabular-nums text-emerald-400">{device.uptimePercent}% up</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
                    {device.services.map(s => (
                      <span key={s.name} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded">
                        {s.name}:{s.port}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Security Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Real-time Alerts Stream */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Security Alerts Stream
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated IDS & anomaly detection
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {alerts.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 space-y-2 transition-colors ${
                    alert.acknowledged
                      ? 'border-slate-800 bg-slate-950/30 opacity-70'
                      : alert.severity === 'Critical'
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : alert.severity === 'High'
                      ? 'border-orange-500/40 bg-orange-500/5'
                      : 'border-amber-500/40 bg-amber-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-200">
                      {alert.title}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0">
                      {alert.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="font-mono text-slate-500 tabular-nums">
                      {alert.timestamp.split(' ')[1] || alert.timestamp}
                    </span>
                    {alert.acknowledged ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                        <CheckCircle className="h-3 w-3" /> Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Module Shortcuts */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Operational Tools
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onNavigate('website-security')}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">Web Security Inspector</div>
                    <div className="text-[10px] text-slate-500">Test HTTPS, TLS, CSP & HSTS headers</div>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigate('practice-lab')}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">Ethical Practice Lab</div>
                    <div className="text-[10px] text-slate-500">Interactive terminal & security challenges</div>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
