import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Hash,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { evaluatePassword } from '../utils/passwordEntropy';
import { PasswordAuditResult } from '../types/security';

export const PasswordSecurityView: React.FC = () => {
  const [passwordInput, setPasswordInput] = useState('Tr0ub4dor&39@Defense');
  const [showPassword, setShowPassword] = useState(false);
  const [audit, setAudit] = useState<PasswordAuditResult | null>(null);
  const [activeEducationTab, setActiveEducationTab] = useState<'hashing' | 'salting' | 'mfa'>('hashing');

  useEffect(() => {
    evaluatePassword(passwordInput).then((res) => setAudit(res));
  }, [passwordInput]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-emerald-400" />
          <span>Password Security, Entropy & Policy Auditor</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Client-side cryptographic entropy analysis, NIST SP 800-63B policy verification, and modern authentication architecture.
        </p>
      </div>

      {/* Zero Leakage Ethical Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-start gap-3 text-xs text-emerald-200/90 leading-relaxed">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
        <div>
          <strong className="text-emerald-300 font-semibold">100% In-Memory Evaluation:</strong> This utility evaluates entropy and policy rules entirely within your local browser sandbox using the Web Cryptography API (`crypto.subtle`). Passwords are never sent over the network, logged, or stored.
        </div>
      </div>

      {/* Main Evaluator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Password input & Entropy metrics */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Test Credential or Passphrase String
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Type password to evaluate entropy..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Quick Generator Presets */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span>Sample Passphrases:</span>
              <button
                type="button"
                onClick={() => setPasswordInput('correct-horse-battery-staple-2026!')}
                className="hover:text-emerald-400 font-mono transition-colors"
              >
                Passphrase (XKCD)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setPasswordInput('admin123')}
                className="hover:text-rose-400 font-mono transition-colors"
              >
                Weak ("admin123")
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setPasswordInput('K9#mQ$8vL!2zXwP@7')}
                className="hover:text-emerald-400 font-mono transition-colors"
              >
                Complex Generated
              </button>
            </div>

            {/* Entropy & Crack-Time Scoreboard */}
            {audit && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Strength Rating</span>
                  <div className={`text-base font-bold font-mono ${
                    audit.strengthLabel === 'Very Strong'
                      ? 'text-emerald-400'
                      : audit.strengthLabel === 'Strong'
                      ? 'text-cyan-400'
                      : audit.strengthLabel === 'Moderate'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {audit.strengthLabel} ({audit.score}/100)
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div
                      style={{ width: `${audit.score}%` }}
                      className={`h-full ${
                        audit.score >= 75 ? 'bg-emerald-500' : audit.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Information Entropy</span>
                  <div className="text-base font-bold font-mono text-slate-100 tabular-nums">
                    {audit.entropyBits} bits
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Formula: $L \times \log_2(R)$
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500">GPU Cluster Crack Time</span>
                  <div className="text-xs font-bold font-mono text-emerald-400">
                    {audit.estimatedCrackTime}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    At $10^{10}$ hashes/sec
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Policy Compliance Checklist */}
          {audit && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  NIST SP 800-63B & CIS Password Benchmark
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated compliance check against modern credential safety standards
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {audit.checks.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-800 bg-slate-950/40 text-xs"
                  >
                    {c.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-slate-200">{c.label}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SHA-256 Digest Demonstration */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-emerald-400" />
                    Live SHA-256 One-Way Digest
                  </span>
                  <span className="text-[10px] text-slate-500">256-bit Hex Representation</span>
                </div>
                <div className="font-mono text-xs text-emerald-300 break-all bg-slate-900 p-2 rounded border border-slate-800 select-all">
                  {audit.sha256Hash}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Cryptographic hash functions are deterministic and irreversible; notice how modifying one character produces a totally divergent hash (avalanche effect).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Educational Architecture & Best Practices */}
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Authentication Architecture
            </h3>

            {/* Segmented Tab Controls */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveEducationTab('hashing')}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  activeEducationTab === 'hashing'
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Key Derivation
              </button>
              <button
                onClick={() => setActiveEducationTab('salting')}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  activeEducationTab === 'salting'
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Salts & Peppers
              </button>
              <button
                onClick={() => setActiveEducationTab('mfa')}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  activeEducationTab === 'mfa'
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MFA / FIDO2
              </button>
            </div>

            {/* Content for Tabs */}
            {activeEducationTab === 'hashing' && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="font-semibold text-emerald-400">
                  Why Fast Hashes (MD5, SHA-1, SHA-256) Fail for Passwords:
                </div>
                <p>
                  Modern GPUs can calculate billions of SHA-256 hashes per second. Therefore, passwords must be stored using <strong>Memory-Hard Key Derivation Functions (KDFs)</strong>.
                </p>
                <div className="space-y-1.5 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-emerald-400 font-bold">Argon2id (Winner PHC):</span> Memory-hard, immune to GPU & ASIC cracking. Recommended by OWASP.
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-cyan-400 font-bold">bcrypt (Eksblowfish):</span> Work factor cost parameter allows scaling calculation time over time.
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 font-bold">PBKDF2-HMAC-SHA512:</span> NIST compliance standard (min 600,000 iterations).
                  </div>
                </div>
              </div>
            )}

            {activeEducationTab === 'salting' && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="font-semibold text-emerald-400">
                  Cryptographic Salts vs. Secret Peppers:
                </div>
                <p>
                  A <strong>Salt</strong> is a unique, cryptographically random string (min 16 bytes) generated per user and stored in plaintext alongside the hash. It renders precomputed Rainbow Tables completely useless.
                </p>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                  <div>Salt = CSPRNG_Bytes(16)</div>
                  <div>Hash = Argon2id(Password + Salt, t=3, m=64MB)</div>
                  <div className="text-emerald-300 font-sans text-xs pt-1">
                    Pepper = Secret key kept in Hardware Security Module (HSM).
                  </div>
                </div>
              </div>
            )}

            {activeEducationTab === 'mfa' && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="font-semibold text-emerald-400">
                  Multi-Factor Authentication (MFA) Tiering:
                </div>
                <p>
                  Even high-entropy passwords can be phished. Multi-factor authentication adds an orthogonal layer of verification.
                </p>
                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-emerald-400">FIDO2 / WebAuthn (Passkeys):</div>
                    <div className="text-slate-400">Cryptographically bound to origin domain; completely immune to phishing proxies.</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <div className="font-semibold text-cyan-400">TOTP (RFC 6238 Authenticator):</div>
                    <div className="text-slate-400">HMAC-SHA1 over 30-second UNIX epoch window; highly secure without cellular SMS risks.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
