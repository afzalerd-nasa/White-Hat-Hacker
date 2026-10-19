import React from 'react';
import { ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openScopeModal: () => void;
  scopeVerified: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openScopeModal,
  scopeVerified
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors flex items-center gap-2"
        >
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span>AEGIS // SEC</span>
        </a>
        <span className="hidden sm:inline-block text-xs font-mono text-slate-500 border-l border-slate-800 pl-3">
          Ethical Defensive Suite
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line text links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-200 ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('network-scanner')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-200 ${
            activeTab === 'network-scanner' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Network Scanner
        </button>
        <button
          onClick={() => setActiveTab('vulnerabilities')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-200 ${
            activeTab === 'vulnerabilities' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Vulnerability Audit
        </button>
        <button
          onClick={() => setActiveTab('website-security')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-200 ${
            activeTab === 'website-security' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Web Audit
        </button>
        <button
          onClick={() => setActiveTab('practice-lab')}
          className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-200 ${
            activeTab === 'practice-lab' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Practice Lab
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={openScopeModal}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 border ${
            scopeVerified
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          {scopeVerified ? 'Scope Verified: 192.168.1.0/24' : 'Verify Authorized Scope'}
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-300">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
            AV
          </div>
          <span className="hidden md:inline-block font-mono text-slate-400">Capt. Vance</span>
        </div>
      </div>
    </header>
  );
};
