import React, { useState } from 'react';
import { Settings, Shield, Sliders, Bell, Lock, CheckCircle2, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [allowedSubnets, setAllowedSubnets] = useState('192.168.1.0/24\n10.10.10.0/24\n127.0.0.1/32\nlocalhost');
  const [maxConcurrency, setMaxConcurrency] = useState(50);
  const [socketTimeoutMs, setSocketTimeoutMs] = useState(1200);
  const [complianceFramework, setComplianceFramework] = useState('NIST SP 800-115');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/DEFENSE/SECOPS/ALERT');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-400" />
            <span>Platform Configuration & Scope Constraints</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global target whitelists, rate limiting parameters, compliance benchmarks, and webhook integrations.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings successfully committed!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Scope Boundaries */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Authorized Target Whitelist (CIDR / Hosts)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Scanning requests against targets not strictly matching these subnets will be rejected by the backend policy guardrail.
          </p>

          <div>
            <textarea
              rows={4}
              value={allowedSubnets}
              onChange={(e) => setAllowedSubnets(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              One CIDR block or hostname per line. Only RFC 1918 private subnets and pre-approved domains are permitted.
            </span>
          </div>
        </div>

        {/* Scan Rate Limiting */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Rate Limiting & Socket Concurrency Controls
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Max Parallel TCP Probes: <span className="font-mono text-emerald-400 font-bold">{maxConcurrency}</span>
              </label>
              <input
                type="range"
                min={5}
                max={200}
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Prevents network congestion and avoids tripping fragile IoT hardware.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Socket Timeout (ms): <span className="font-mono text-emerald-400 font-bold">{socketTimeoutMs} ms</span>
              </label>
              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={socketTimeoutMs}
                onChange={(e) => setSocketTimeoutMs(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Lower values speed up scans; higher values are required for high-latency VPN links.
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Benchmark Presets */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Audit Compliance Baseline
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Active Benchmark Profile
              </label>
              <select
                value={complianceFramework}
                onChange={(e) => setComplianceFramework(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="NIST SP 800-115">NIST SP 800-115 (Information Security Testing & Assessment)</option>
                <option value="CIS Controls v8">CIS Critical Security Controls v8</option>
                <option value="ISO/IEC 27001">ISO/IEC 27001:2022 Technical Controls</option>
                <option value="PCI-DSS v4.0">PCI-DSS v4.0 Requirement 11 (Vulnerability Scanning)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                SIEM / SOC Webhook Integration
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-950 transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings & Policy Constraints</span>
          </button>
        </div>
      </form>
    </div>
  );
};
