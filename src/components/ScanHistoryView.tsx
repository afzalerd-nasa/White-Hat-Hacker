import React, { useState } from 'react';
import { History, Search, Download, Radio, CheckCircle, RotateCcw } from 'lucide-react';
import { ScanResult } from '../types/security';
import { exportHostsToCsv } from '../utils/exportHelpers';

interface ScanHistoryViewProps {
  scans: ScanResult[];
  onRerunScan: (target: string) => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  scans,
  onRerunScan
}) => {
  const [search, setSearch] = useState('');

  const filtered = scans.filter(
    (s) =>
      s.target.toLowerCase().includes(search.toLowerCase()) ||
      s.operator.toLowerCase().includes(search.toLowerCase()) ||
      s.scanType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-400" />
            <span>Authorized Scan History & Execution Audit Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all executed reconnaissance jobs, target parameters, operators, and discovered assets.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search target, operator..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Target Scope</th>
                <th className="py-2.5 px-3">Scan Type</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
                <th className="py-2.5 px-3 text-center">Hosts Found</th>
                <th className="py-2.5 px-3 text-center">Open Ports</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-3 text-slate-300">
                    {new Date(scan.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    {scan.target}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {scan.scanType}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-sans">
                    {scan.operator}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-300">
                    {scan.durationMs}ms
                  </td>
                  <td className="py-3 px-3 text-center tabular-nums text-slate-200">
                    {scan.hostsDiscovered.length}
                  </td>
                  <td className="py-3 px-3 text-center tabular-nums text-cyan-400">
                    {scan.openPortsCount}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2 font-sans">
                      <button
                        onClick={() => exportHostsToCsv(scan.hostsDiscovered, `scan_${scan.target.replace(/[^a-z0-9]/gi, '_')}.csv`)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                        title="Export CSV"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRerunScan(scan.target)}
                        className="px-2 py-1 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Re-run</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
