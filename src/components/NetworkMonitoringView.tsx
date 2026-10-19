import React, { useState } from 'react';
import {
  Activity,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Wifi,
  HardDrive,
  Cpu,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { MonitoringDevice, SecurityAlert } from '../types/security';

interface NetworkMonitoringViewProps {
  devices: MonitoringDevice[];
  alerts: SecurityAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onRefreshDevices: () => void;
}

export const NetworkMonitoringView: React.FC<NetworkMonitoringViewProps> = ({
  devices,
  alerts,
  onAcknowledgeAlert,
  onRefreshDevices
}) => {
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [deviceList, setDeviceList] = useState<MonitoringDevice[]>(devices);
  const [selectedDevice, setSelectedDevice] = useState<MonitoringDevice | null>(devices[0] || null);

  const handlePingDevice = (deviceId: string) => {
    setPingingId(deviceId);
    setTimeout(() => {
      setDeviceList((prev) =>
        prev.map((d) => {
          if (d.id === deviceId) {
            const jitter = (Math.random() * 2 - 1).toFixed(1);
            const newLatency = Math.max(1.2, parseFloat((d.currentLatency + parseFloat(jitter)).toFixed(1)));
            const updatedHistory = [
              ...d.latencyHistory.slice(1),
              { timestamp: new Date().toLocaleTimeString().slice(0, 5), latency: newLatency }
            ];
            const updated = {
              ...d,
              currentLatency: newLatency,
              latencyHistory: updatedHistory
            };
            if (selectedDevice?.id === deviceId) {
              setSelectedDevice(updated);
            }
            return updated;
          }
          return d;
        })
      );
      setPingingId(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span>Network Monitoring & Availability Sentinel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time latency tracking, service heartbeat detection, and anomaly alerts across authorized assets.
          </p>
        </div>

        <button
          onClick={onRefreshDevices}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
          Poll All Targets
        </button>
      </div>

      {/* Network Traffic & Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Aggregated Throughput</span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xl font-bold text-slate-100 tabular-nums">482.4</span>
            <span className="text-xs text-slate-500">Mbps</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-0.5 text-emerald-400"><ArrowDown className="h-3 w-3" /> 312 Mbps In</span>
            <span className="flex items-center gap-0.5 text-cyan-400"><ArrowUp className="h-3 w-3" /> 170 Mbps Out</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Mean Subnet Latency</span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xl font-bold text-emerald-400 tabular-nums">14.1</span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
          <div className="text-[10px] text-slate-500">Nominal round-trip time (RTT)</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Overall Service Uptime</span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xl font-bold text-slate-100 tabular-nums">99.86%</span>
          </div>
          <div className="text-[10px] text-slate-500">SLA Target 99.5% satisfied</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] text-slate-400 uppercase font-mono">Active IDS Alerts</span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xl font-bold text-amber-400 tabular-nums">{alerts.length}</span>
            <span className="text-xs text-slate-400">Events</span>
          </div>
          <div className="text-[10px] text-slate-500">0 critical breaches recorded</div>
        </div>
      </div>

      {/* Main Grid: Device Telemetry & Active Sparklines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monitored Assets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                Monitored Nodes & Services
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Subnet: 192.168.1.0/24
              </span>
            </div>

            <div className="space-y-3">
              {deviceList.map((device) => {
                const isSelected = selectedDevice?.id === device.id;
                const isPinging = pingingId === device.id;

                return (
                  <div
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`rounded-lg border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/50 bg-slate-900/90 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          device.status === 'operational'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          <Server className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{device.name}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                              device.status === 'operational'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {device.status}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-slate-400 mt-0.5">
                            {device.ip} · {device.type.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block uppercase">Latency</span>
                          <span className="tabular-nums text-emerald-400 font-bold">{device.currentLatency}ms</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block uppercase">Uptime</span>
                          <span className="tabular-nums text-slate-300">{device.uptimePercent}%</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePingDevice(device.id);
                          }}
                          disabled={isPinging}
                          className="px-2.5 py-1 text-[11px] font-sans font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded transition-colors whitespace-nowrap"
                        >
                          {isPinging ? 'Pinging...' : 'Ping Now'}
                        </button>
                      </div>
                    </div>

                    {/* Services Strip */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-500 text-[10px] font-mono">Active Daemons:</span>
                      {device.services.map((svc) => (
                        <span
                          key={svc.name}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px] flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{svc.name} ({svc.port})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Node Deep Dive & Sparkline Trend */}
        <div className="space-y-4">
          {selectedDevice ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Node Telemetry Detail
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedDevice.name} ({selectedDevice.ip})
                </p>
              </div>

              {/* Latency History Graph representation */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 uppercase font-mono">
                  Recent Latency Timeline (ms)
                </span>
                <div className="h-28 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-end justify-between gap-2">
                  {selectedDevice.latencyHistory.map((point, idx) => {
                    const heightPercent = Math.min(100, Math.max(15, (point.latency / 50) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <span className="text-[9px] font-mono text-slate-500 tabular-nums">
                          {point.latency}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-emerald-500/40 hover:bg-emerald-400 rounded-t transition-all"
                          title={`${point.timestamp}: ${point.latency}ms`}
                        />
                        <span className="text-[9px] font-mono text-slate-600">
                          {point.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Hardware Profile:</span>
                  <span className="font-mono text-slate-200">Intel Xeon E5 / 32GB RAM</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Default Gateway:</span>
                  <span className="font-mono text-slate-200">192.168.1.1</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">DNS Resolver:</span>
                  <span className="font-mono text-slate-200">192.168.1.53, 1.1.1.1</span>
                </div>
              </div>

              {selectedDevice.lastAlert && (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-950/20 text-xs text-amber-200 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Recent Telemetry Advisory</span>
                  </div>
                  <p>{selectedDevice.lastAlert}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
