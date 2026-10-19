import { jsPDF } from 'jspdf';
import { NetworkHost, VulnerabilityRecord, WebsiteAuditResult, SecurityReport } from '../types/security';

export function exportHostsToCsv(hosts: NetworkHost[], filename = 'aegis_network_scan_results.csv') {
  const headers = ['IP Address', 'Hostname', 'MAC Address', 'Vendor', 'Status', 'Latency (ms)', 'Open Ports', 'Critical Vulns', 'High Vulns'];
  const rows = hosts.map(h => [
    h.ip,
    h.hostname,
    h.mac,
    `"${h.vendor}"`,
    h.status,
    h.latencyMs,
    `"${h.openPorts.map(p => `${p.port}/${p.service}`).join(', ')}"`,
    h.vulnerabilityCount.critical,
    h.vulnerabilityCount.high
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportVulnerabilitiesToCsv(vulns: VulnerabilityRecord[], filename = 'aegis_vulnerability_assessment.csv') {
  const headers = ['CVE ID', 'Title', 'Severity', 'CVSS Score', 'Host IP', 'Hostname', 'Port', 'Component', 'Status', 'Remediation'];
  const rows = vulns.map(v => [
    v.cveId,
    `"${v.title.replace(/"/g, '""')}"`,
    v.severity,
    v.cvssScore,
    v.hostIp,
    v.hostname,
    v.port || 'N/A',
    `"${v.affectedComponent}"`,
    v.status,
    `"${v.remediation.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportReportToPdf(report: SecurityReport, findings: VulnerabilityRecord[]) {
  const doc = new jsPDF();
  let y = 20;

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('AEGIS // DEFENSIVE SECURITY AUDIT', 14, 16);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official White Hat Penetration Test & Security Assessment Report`, 14, 24);
  doc.text(`Generated: ${new Date(report.generatedAt).toUTCString()} | Authorizer: CISO / Security Officer`, 14, 30);

  y = 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(report.title, 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Target Scope: ${report.targetScope}`, 14, y);
  y += 6;
  doc.text(`Report Type: ${report.type} | Operator: ${report.generatedBy}`, 14, y);
  y += 6;
  doc.text(`Compliance Score: ${report.summary.complianceScore}% | Assets Audited: ${report.summary.totalAssets}`, 14, y);

  y += 12;
  // Metrics overview table
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 18, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 18, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`CRITICAL: ${report.summary.criticalFindings}`, 20, y + 11);
  doc.setTextColor(234, 88, 12);
  doc.text(`HIGH: ${report.summary.highFindings}`, 65, y + 11);
  doc.setTextColor(202, 138, 4);
  doc.text(`MEDIUM: ${report.summary.mediumFindings}`, 110, y + 11);
  doc.setTextColor(37, 99, 235);
  doc.text(`LOW: ${report.summary.lowFindings}`, 155, y + 11);

  y += 28;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Findings & Remediation Advisory', 14, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const sampleFindings = findings.slice(0, 5);
  sampleFindings.forEach((f, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. [${f.cveId}] ${f.title} (${f.severity} - CVSS ${f.cvssScore})`, 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Target: ${f.hostIp} (${f.hostname}) · Component: ${f.affectedComponent}`, 18, y);
    y += 5;
    const splitRemediation = doc.splitTextToSize(`Action: ${f.remediation}`, 174);
    doc.text(splitRemediation, 18, y);
    y += splitRemediation.length * 4.5 + 4;
  });

  // Footer notice
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential - For authorized internal security compliance use only.', 14, 285);

  doc.save(`${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
