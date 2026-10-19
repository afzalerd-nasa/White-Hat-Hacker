import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Bug,
  Globe,
  KeyRound,
  Activity,
  FileText,
  TerminalSquare,
  History,
  Users,
  Settings,
  Shield,
  Server
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  alertCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'network-scanner', label: 'Network Scanner', icon: Radio },
    { id: 'vulnerabilities', label: 'Vulnerability Assessment', icon: Bug },
    { id: 'website-security', label: 'Website Security', icon: Globe },
    { id: 'password-security', label: 'Password Security', icon: KeyRound },
    { id: 'network-monitoring', label: 'Network Monitoring', icon: Activity, badge: alertCount },
    { id: 'security-reports', label: 'Security Reports', icon: FileText },
    { id: 'practice-lab', label: 'Practice Lab', icon: TerminalSquare, highlight: true },
    { id: 'scan-history', label: 'Scan History', icon: History },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between h-[calc(100vh-53px)] sticky top-[53px]">
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
          Security Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
              {Boolean(item.highlight && !isActive) && (
                <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Lab
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Defensive Security Status card */}
      <div className="p-3 border-t border-slate-900">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Shield className="h-3.5 w-3.5 text-emerald-400" /> Defensive Agent
            </span>
            <span className="font-mono text-[11px] text-emerald-400">SOC-Ready</span>
          </div>
          <div className="text-[11px] text-slate-500 leading-tight">
            Target Scopes: RFC 1918 Private & Authorized Ranges
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <Server className="h-3 w-3 text-slate-500" />
            <span className="font-mono">192.168.1.0/24</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
