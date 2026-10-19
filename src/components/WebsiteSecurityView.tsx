import React, { useState } from 'react';
import {
  Globe,
  Lock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { WebsiteAuditResult } from '../types/security';

export const WebsiteSecurityView: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://internal.bank.corp');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<WebsiteAuditResult | null>({
    url: 'https://internal.bank.corp',
    scanTime: new Date().toISOString(),
    serverBanner: 'nginx/1.24.0 (Ubuntu)',
    httpStatus: 200,
    overallScore: 82,
    grade: 'B',
    httpsConfig: {
      enabled: true,
      tlsVersion: 'TLS 1.3 / AES-256-GCM',
      certIssuer: "Let's Encrypt Authority R3",
      certValidUntil: '2026-12-31',
      daysRemaining: 73,
      hstsEnabled: true,
      hstsPreload: false,
      hstsMaxAge: 31536000
    },
    headers: [
      {
        name: 'Strict-Transport-Security (HSTS)',
        value: 'max-age=31536000; includeSubDomains',
        status: 'good',
        importance: 'critical',
        description: 'Forces modern browsers to communicate strictly over encrypted HTTPS connections.',
        recommendation: 'HSTS is active. Consider adding preload flag for Chrome preload list.'
      },
      {
        name: 'Content-Security-Policy (CSP)',
        value: null,
        status: 'missing',
        importance: 'critical',
        description: 'Restricts script and resource loading origins, preventing Cross-Site Scripting (XSS).',
        recommendation: "Add: Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';"
      },
      {
        name: 'X-Frame-Options',
        value: 'SAMEORIGIN',
        status: 'good',
        importance: 'critical',
        description: 'Prevents the site from being framed inside an iframe, neutralizing Clickjacking.',
        recommendation: 'Configured properly as SAMEORIGIN.'
      },
      {
        name: 'X-Content-Type-Options',
        value: 'nosniff',
        status: 'good',
        importance: 'recommended',
        description: 'Instructs browser not to MIME-sniff the declared content type.',
        recommendation: 'Configured properly as nosniff.'
      },
      {
        name: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
        status: 'good',
        importance: 'recommended',
        description: 'Controls referrer information leaked on outbound links.',
        recommendation: 'Configured to strict-origin-when-cross-origin.'
      },
      {
        name: 'Permissions-Policy',
        value: null,
        status: 'missing',
        importance: 'optional',
        description: 'Controls browser features such as microphone, geolocation, and camera.',
        recommendation: 'Add: Permissions-Policy: camera=(), microphone=(), geolocation=()'
      }
    ],
    cookies: [
      {
        name: '__Host-session',
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
        issues: []
      },
      {
        name: 'remember_token',
        secure: true,
        httpOnly: false,
        sameSite: 'Lax',
        issues: ['Missing HttpOnly flag (accessible to client scripts via document.cookie)']
      }
    ],
    vulnerabilities: [
      {
        title: 'Missing Content Security Policy (CSP)',
        severity: 'High',
        description: 'The HTTP response contains no Content-Security-Policy header. Any injected client scripts will execute with full origin privileges.',
        remediation: "Deploy strict CSP policy headers at the reverse proxy or web application firewall."
      },
      {
        title: 'Server Version Banner Disclosure',
        severity: 'Low',
        description: 'Server banner reveals "nginx/1.24.0 (Ubuntu)", allowing attackers to profile backend OS and software stack.',
        remediation: 'Configure "server_tokens off;" inside /etc/nginx/nginx.conf.'
      }
    ]
  });

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setIsAuditing(true);
    try {
      const res = await fetch('/api/scan/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl })
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Globe className="h-5 w-5 text-emerald-400" />
          <span>Website Security & TLS Header Inspector</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Non-destructive security header auditing, SSL/TLS certificate lifecycle inspection, and cookie flag compliance.
        </p>
      </div>

      {/* Target URL Search / Audit Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <form onSubmit={handleRunAudit} className="space-y-3">
          <label className="block text-xs font-medium text-slate-300">
            Target Website or Web Application Endpoint
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com or localhost:3000"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAuditing}
              className={`flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                isAuditing
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-lg shadow-emerald-950 whitespace-nowrap'
              }`}
            >
              {isAuditing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>Auditing Security Headers...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Analyze Website Security</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span>Test Presets:</span>
            <button
              type="button"
              onClick={() => setTargetUrl('https://internal.bank.corp')}
              className="hover:text-emerald-400 font-mono transition-colors"
            >
              internal.bank.corp
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setTargetUrl('https://github.com')}
              className="hover:text-emerald-400 font-mono transition-colors"
            >
              github.com
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setTargetUrl('https://google.com')}
              className="hover:text-emerald-400 font-mono transition-colors"
            >
              google.com
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setTargetUrl('http://127.0.0.1:3000')}
              className="hover:text-emerald-400 font-mono transition-colors"
            >
              localhost:3000
            </button>
          </div>
        </form>
      </div>

      {/* Audit Result Display */}
      {auditResult && (
        <div className="space-y-6">
          {/* Top Score & TLS Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Security Grade Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                  Security Grade
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-4xl font-extrabold font-mono ${
                    auditResult.grade.startsWith('A')
                      ? 'text-emerald-400'
                      : auditResult.grade === 'B'
                      ? 'text-cyan-400'
                      : auditResult.grade === 'C'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {auditResult.grade}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ({auditResult.overallScore} / 100)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  HTTP Status: <span className="font-mono text-slate-300">{auditResult.httpStatus}</span>
                </div>
              </div>

              <div className="w-14 h-14 rounded-full border-2 border-slate-700 flex items-center justify-center bg-slate-950 font-mono text-xs text-slate-400">
                {auditResult.overallScore}%
              </div>
            </div>

            {/* TLS & HTTPS Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="uppercase font-mono tracking-wider">Transport Layer Security</span>
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-xs font-semibold text-slate-200 font-mono">
                {auditResult.httpsConfig.tlsVersion}
              </div>
              <div className="text-[11px] text-slate-400">
                Issuer: <span className="text-slate-300">{auditResult.httpsConfig.certIssuer}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between font-mono">
                <span>Expires: {auditResult.httpsConfig.certValidUntil}</span>
                <span className="text-emerald-400 font-bold">{auditResult.httpsConfig.daysRemaining} days left</span>
              </div>
            </div>

            {/* Server Banner & Exposure */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="uppercase font-mono tracking-wider">Server Signature</span>
                <Info className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-xs font-mono text-slate-200">
                {auditResult.serverBanner}
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                {auditResult.serverBanner?.includes('/')
                  ? 'Software version is broadcasted publicly in Server headers.'
                  : 'Server headers properly anonymized.'}
              </div>
            </div>
          </div>

          {/* Security Headers Inspection Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                HTTP Security Headers Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation of modern browser protection headers against OWASP secure headers guideline
              </p>
            </div>

            <div className="space-y-3">
              {auditResult.headers.map((h) => (
                <div
                  key={h.name}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {h.status === 'good' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <span className="text-xs font-mono font-bold text-slate-200">{h.name}</span>
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                        h.importance === 'critical'
                          ? 'border-rose-500/30 text-rose-300'
                          : 'border-slate-700 text-slate-400'
                      }`}>
                        {h.importance}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        h.status === 'good'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {h.status === 'good' ? 'CONFIGURED' : 'MISSING / INADEQUATE'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {h.description}
                  </p>

                  <div className="rounded bg-slate-900 border border-slate-800 p-2 font-mono text-[11px] text-slate-300">
                    <span className="text-slate-500">Value: </span>
                    <span className={h.value ? 'text-emerald-300' : 'text-slate-500 italic'}>
                      {h.value || 'None returned by origin'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400">Remediation: </span>
                    <span className="font-mono text-slate-300">{h.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cookies Security Settings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Cookie Attributes & Flag Hardening
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation of Secure, HttpOnly, and SameSite protection flags
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Cookie Name</th>
                    <th className="py-2.5 px-3 text-center">Secure Flag</th>
                    <th className="py-2.5 px-3 text-center">HttpOnly Flag</th>
                    <th className="py-2.5 px-3 text-center">SameSite</th>
                    <th className="py-2.5 px-3">Security Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditResult.cookies.map((c) => (
                    <tr key={c.name} className="hover:bg-slate-800/20">
                      <td className="py-3 px-3 font-semibold text-slate-200">{c.name}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          c.secure ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {c.secure ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          c.httpOnly ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {c.httpOnly ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300">
                        {c.sameSite}
                      </td>
                      <td className="py-3 px-3 font-sans text-xs">
                        {c.issues.length === 0 ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Compliant
                          </span>
                        ) : (
                          <span className="text-amber-300">
                            {c.issues.join(', ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
