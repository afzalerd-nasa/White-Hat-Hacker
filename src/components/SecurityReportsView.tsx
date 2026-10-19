import React, { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  Plus,
  Calendar,
  CheckCircle,
  Shield,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { SecurityReport, VulnerabilityRecord } from '../types/security';
import { exportReportToPdf, exportVulnerabilitiesToCsv } from '../utils/exportHelpers';

interface SecurityReportsViewProps {
  reports: SecurityReport[];
  vulnerabilities: VulnerabilityRecord[];
  onAddReport: (report: SecurityReport) => void;
}

export const SecurityReportsView: React.FC<SecurityReportsViewProps> = ({
  reports,
  vulnerabilities,
  onAddReport
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('Q4 Internal Enterprise Penetration Test & Audit');
  const [newType, setNewType] = useState<SecurityReport['type']>('Technical Vulnerability Audit');
  const [newScope, setNewScope] = useState('192.168.1.0/24 (DMZ & Internal Core)');

  const filteredReports = reports.filter(
    (r) => selectedType === 'all' || r.type === selectedType
  );

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const criticals = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highs = vulnerabilities.filter(v => v.severity === 'High').length;
    const mediums = vulnerabilities.filter(v => v.severity === 'Medium').length;
    const lows = vulnerabilities.filter(v => v.severity === 'Low').length;

    const newRep: SecurityReport = {
      id: `rep-${Date.now()}`,
      title: newTitle,
      type: newType,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Captain Alex Vance (Lead Pentester)',
      targetScope: newScope,
      summary: {
        totalAssets: 14,
        criticalFindings: criticals,
        highFindings: highs,
        mediumFindings: mediums,
        lowFindings: lows,
        complianceScore: 84
      },
      keyFindings: [
        'runc container escape vulnerability on k8s-worker-node-02',
        'OpenSSH Terrapin prefix truncation weakness on edge firewall',
        'Missing Content-Security-Policy on internal banking portal'
      ],
      status: 'Ready'
    };

    onAddReport(newRep);
    setShowGenerateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span>Defensive Security Reports & Audit Trails</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal penetration test deliverables, executive compliance summaries, and remediation advisories.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-emerald-950"
        >
          <Plus className="h-4 w-4" />
          Compile New Audit Report
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'Executive Summary', 'Technical Vulnerability Audit', 'Compliance Audit'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedType === type
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {type === 'all' ? 'All Deliverables' : type}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">{report.title}</span>
                  <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {report.type}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Target Scope: <span className="font-mono text-slate-300">{report.targetScope}</span> · Compiled by {report.generatedBy}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportReportToPdf(report, vulnerabilities)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
                <button
                  onClick={() => exportVulnerabilitiesToCsv(vulnerabilities, `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
                  CSV
                </button>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-800/80">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Assets Assessed</span>
                <span className="font-bold text-slate-200 tabular-nums">{report.summary.totalAssets}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-rose-400 text-[10px] block font-semibold">Critical</span>
                <span className="font-bold text-rose-400 tabular-nums">{report.summary.criticalFindings}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-orange-400 text-[10px] block font-semibold">High</span>
                <span className="font-bold text-orange-400 tabular-nums">{report.summary.highFindings}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-amber-400 text-[10px] block font-semibold">Medium</span>
                <span className="font-bold text-amber-400 tabular-nums">{report.summary.mediumFindings}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-emerald-400 text-[10px] block font-semibold">Compliance</span>
                <span className="font-bold text-emerald-400 tabular-nums">{report.summary.complianceScore}%</span>
              </div>
            </div>

            {/* Key Findings Highlights */}
            <div className="space-y-1.5 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
                Key Findings Summary
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {report.keyFindings.map((finding, idx) => (
                  <li key={idx} className="leading-relaxed">{finding}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              <span>Compile Executive Security Report</span>
            </h3>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Report Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Technical Vulnerability Audit">Technical Vulnerability Audit</option>
                  <option value="Executive Summary">Executive Summary (Board / C-Level)</option>
                  <option value="Compliance Audit">Compliance Audit (ISO 27001 / SOC 2)</option>
                  <option value="Network Topology">Network Topology & Service Map</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Authorized Scope Coverage
                </label>
                <input
                  type="text"
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  Generate Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
