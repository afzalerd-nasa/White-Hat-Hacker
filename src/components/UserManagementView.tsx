import React, { useState } from 'react';
import { Users, UserPlus, Shield, Check, X, Mail, Key } from 'lucide-react';
import { UserProfile, UserRole } from '../types/security';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Capt. Alex Vance',
    email: 'alex.vance@defense.corp',
    role: 'Lead Pentester',
    avatar: 'AV',
    lastLogin: '2026-10-19 07:15 UTC',
    twoFactorEnabled: true
  },
  {
    id: 'usr-2',
    name: 'Sarah Connor',
    email: 'sarah.connor@defense.corp',
    role: 'Security Auditor',
    avatar: 'SC',
    lastLogin: '2026-10-18 19:42 UTC',
    twoFactorEnabled: true
  },
  {
    id: 'usr-3',
    name: 'Marcus Holloway',
    email: 'marcus.h@defense.corp',
    role: 'Admin',
    avatar: 'MH',
    lastLogin: '2026-10-19 06:00 UTC',
    twoFactorEnabled: true
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@defense.corp',
    role: 'SecOps Analyst',
    avatar: 'ER',
    lastLogin: '2026-10-17 14:10 UTC',
    twoFactorEnabled: false
  }
];

const PERMISSIONS = [
  { name: 'Authorized Network Scanning', key: 'scan_network', roles: ['Admin', 'Lead Pentester'] },
  { name: 'Website Security Probing', key: 'scan_web', roles: ['Admin', 'Lead Pentester', 'Security Auditor'] },
  { name: 'Vulnerability Remediation AI', key: 'vuln_ai', roles: ['Admin', 'Lead Pentester', 'SecOps Analyst'] },
  { name: 'Export Formal Audit Reports', key: 'export_reports', roles: ['Admin', 'Lead Pentester', 'Security Auditor'] },
  { name: 'Manage Target Scope Whitelist', key: 'manage_scope', roles: ['Admin'] },
  { name: 'Team Member & RBAC Management', key: 'manage_users', roles: ['Admin'] }
];

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('SecOps Analyst');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const initials = inviteName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      avatar: initials || 'US',
      lastLogin: 'Never (Invited)',
      twoFactorEnabled: true
    };

    setUsers((prev) => [...prev, newUser]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <span>Identity & Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enforce least-privilege security clearance for pentesters, auditors, and SOC analysts.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-emerald-950"
        >
          <UserPlus className="h-4 w-4" />
          Provision Security Operator
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Authorized Security Personnel
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Operator Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Security Clearance / Role</th>
                <th className="py-2.5 px-3 text-center">2FA Hardware Token</th>
                <th className="py-2.5 px-3">Last Active (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                        {user.avatar}
                      </div>
                      <span className="font-semibold text-slate-200">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-xs">
                    {user.email}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                      user.role === 'Admin'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        : user.role === 'Lead Pentester'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : user.role === 'Security Auditor'
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-xs">
                    {user.twoFactorEnabled ? (
                      <span className="text-emerald-400 font-bold">ENFORCED (FIDO2)</span>
                    ) : (
                      <span className="text-amber-400">PENDING</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    {user.lastLogin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Least-Privilege RBAC Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic access gates mapped against operator security clearances
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Security Capability</th>
                <th className="py-2.5 px-3 text-center">Admin</th>
                <th className="py-2.5 px-3 text-center">Lead Pentester</th>
                <th className="py-2.5 px-3 text-center">Security Auditor</th>
                <th className="py-2.5 px-3 text-center">SecOps Analyst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {PERMISSIONS.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-800/20">
                  <td className="py-3 px-3 font-sans text-xs text-slate-200 font-medium">
                    {perm.name}
                  </td>
                  {['Admin', 'Lead Pentester', 'Security Auditor', 'SecOps Analyst'].map((r) => {
                    const hasPerm = perm.roles.includes(r);
                    return (
                      <td key={r} className="py-3 px-3 text-center">
                        {hasPerm ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 text-slate-600">
                            <X className="h-3 w-3" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-400" />
              <span>Provision Security Operator</span>
            </h3>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name & Rank
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Liam Zhang"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enterprise Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="liam.z@defense.corp"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned Security Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Lead Pentester">Lead Pentester</option>
                  <option value="Security Auditor">Security Auditor</option>
                  <option value="SecOps Analyst">SecOps Analyst</option>
                  <option value="Admin">Administrator (Full Scope)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  Send Provisioning Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
