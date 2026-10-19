import React, { useState } from 'react';
import {
  Radio,
  Download,
  ShieldAlert,
  Server,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { NetworkHost, ScanTargetConfig, ScanResult, OpenPort } from '../types/security';
import { exportHostsToCsv } from '../utils/exportHelpers';

interface NetworkScannerViewProps {
  onExecuteScan: (config: ScanTargetConfig) => Promise<ScanResult>;
  recentScans: ScanResult[];
  scopeVerified: boolean;
  openScopeModal: () => void;
}

export const NetworkScannerView: React.FC<NetworkScannerViewProps> = ({
  onExecuteScan,
  recentScans,
  scopeVerified,
  openScopeModal
}) => {
  const [target, setTarget] = useState('192.168.1.0/24');
  const [scanType, setScanType] = useState<'quick' | 'standard' | 'full' | 'custom'>('standard');
  const [customPorts, setCustomPorts] = useState('21,22,80,443,3000,3306,5432,8080');
  const [serviceDetection, setServiceDetection] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(
    recentScans.length > 0 ? recentScans[0] : null
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedHost, setSelectedHost] = useState<NetworkHost | null>(null);

  const handleStartScan = async () => {
    if (!scopeVerified) {
      openScopeModal();
      return;
    }

    setIsScanning(true);
    try {
      const result = await onExecuteScan({
        target,
        scanType,
        ports: scanType === 'custom' ? customPorts : undefined,
        timeout: 1500,
        serviceDetection,
        authorizedScopeConfirmed: true,
        organization: 'Enterprise Security Operations',
        authorizerName: 'CISO / Security Director'
      });
      setCurrentResult(result);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const hosts = currentResult?.hostsDiscovered || [];
  const filteredHosts = hosts.filter(
    (h) =>
      h.ip.includes(searchFilter) ||
      h.hostname.toLowerCase().includes(searchFilter.toLowerCase()) ||
      h.vendor.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-400" />
            <span>Authorized Network Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Safe TCP port discovery, service fingerprinting, and asset enumeration across permitted CIDR ranges.
          </p>
        </div>

        {hosts.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportHostsToCsv(hosts)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Target Setup Configuration Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Scan Target Configuration
            </h3>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-emerald-400">
              Authorized Mode
            </span>
          </div>

          {!scopeVerified && (
            <button
              onClick={openScopeModal}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md transition-colors"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Scope Authorization Required
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Target Subnet, IP Address, or Hostname
            </label>
            <div className="relative">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 192.168.1.0/24 or 127.0.0.1 or localhost"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
              />
              <div className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-500">
                CIDR / IPv4 / Host
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Quick Presets:</span>
              <button
                type="button"
                onClick={() => setTarget('192.168.1.0/24')}
                className="hover:text-emerald-400 font-mono transition-colors"
              >
                192.168.1.0/24
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setTarget('127.0.0.1')}
                className="hover:text-emerald-400 font-mono transition-colors"
              >
                127.0.0.1 (Localhost Probe)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setTarget('10.0.0.0/24')}
                className="hover:text-emerald-400 font-mono transition-colors"
              >
                10.0.0.0/24 (DMZ)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Scan Profile & Port Scope
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value as any)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="quick">Quick Probe (Top 100 Well-Known Ports)</option>
              <option value="standard">Standard Scan (Ports 1-1024)</option>
              <option value="full">Comprehensive Scan (Common Registered Ports)</option>
              <option value="custom">Custom Port Range</option>
            </select>
            {scanType === 'custom' && (
              <input
                type="text"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                placeholder="21,22,80,443,8080"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={serviceDetection}
              onChange={(e) => setServiceDetection(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
            <span>Perform banner grabbing & service version detection (-sV)</span>
          </label>

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
              isScanning
                ? 'bg-slate-800 text-slate-400 cursor-wait'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-lg shadow-emerald-950'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Scanning Authorized Network...</span>
              </>
            ) : (
              <>
                <Radio className="h-4 w-4" />
                <span>Execute Port & Service Discovery</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Scanning Progress Bar */}
      {isScanning && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
            <span>SYN stealth packet delivery to {target}</span>
            <span className="tabular-nums">Probing TCP Handshakes...</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-pulse w-3/4 rounded-full" />
          </div>
        </div>
      )}

      {/* Discovered Hosts Table */}
      {currentResult && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Discovered Network Topology ({filteredHosts.length} Hosts)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target: <span className="font-mono text-slate-400">{currentResult.target}</span> · Scanned at {new Date(currentResult.timestamp).toLocaleTimeString()} in {currentResult.durationMs}ms
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by IP, hostname, vendor..."
                  className="rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none w-60"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Host / IP</th>
                  <th className="py-2.5 px-3">MAC & Hardware</th>
                  <th className="py-2.5 px-3">OS / Platform</th>
                  <th className="py-2.5 px-3 text-right">Latency</th>
                  <th className="py-2.5 px-3">Open Ports & Services</th>
                  <th className="py-2.5 px-3 text-center">Vulns</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredHosts.map((host) => {
                  const hasCrit = host.vulnerabilityCount.critical > 0;
                  const hasHigh = host.vulnerabilityCount.high > 0;

                  return (
                    <tr
                      key={host.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{host.ip}</div>
                        <div className="text-[11px] text-slate-400 font-sans">{host.hostname}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div className="text-[11px] text-slate-400">{host.mac}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{host.vendor}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans text-xs">
                        {host.osGuess || 'Linux / Unix Core'}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-300">
                        {host.latencyMs}ms
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {host.openPorts.map((p) => (
                            <span
                              key={p.port}
                              className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                p.risk === 'critical'
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                  : p.risk === 'high'
                                  ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                                  : p.risk === 'medium'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                              title={`${p.service} ${p.version || ''}`}
                            >
                              {p.port}/{p.service}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {hasCrit ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {host.vulnerabilityCount.critical} Crit
                          </span>
                        ) : hasHigh ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            {host.vulnerabilityCount.high} High
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Nominal</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedHost(host)}
                          className="px-2.5 py-1 text-[11px] font-medium font-sans text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Host Details Drawer / Modal */}
      {selectedHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100 font-mono">
                    {selectedHost.ip} ({selectedHost.hostname})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vendor: {selectedHost.vendor} · MAC: {selectedHost.mac}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHost(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
                  Open TCP Ports & Service Fingerprints
                </h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Port</th>
                        <th className="py-2 px-3">Protocol</th>
                        <th className="py-2 px-3">Service Name</th>
                        <th className="py-2 px-3">Banner / Version</th>
                        <th className="py-2 px-3">Risk Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedHost.openPorts.map((port) => (
                        <tr key={port.port} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-bold text-emerald-400">{port.port}</td>
                          <td className="py-2.5 px-3 uppercase text-slate-400">{port.protocol}</td>
                          <td className="py-2.5 px-3 text-slate-200">{port.service}</td>
                          <td className="py-2.5 px-3 text-slate-300">{port.version || 'Banner obscured'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                              port.risk === 'critical'
                                ? 'bg-rose-500/20 text-rose-300'
                                : port.risk === 'high'
                                ? 'bg-orange-500/20 text-orange-300'
                                : port.risk === 'medium'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {port.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedHost.openPorts.some((p) => p.cveMatches && p.cveMatches.length > 0) && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Known CVE Associations on Discovered Services</span>
                  </div>
                  <p className="text-xs text-rose-200/80">
                    Services running on this host match signature definitions in our vulnerability database.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                    {selectedHost.openPorts.flatMap(p => p.cveMatches || []).map(cve => (
                      <span key={cve} className="px-2 py-1 rounded bg-rose-900/50 text-rose-200 border border-rose-700/50">
                        {cve}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950">
              <button
                onClick={() => setSelectedHost(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
