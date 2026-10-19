import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: { authorizerName: string; organization: string }) => void;
  targetScope: string;
}

export const AuthorizationModal: React.FC<AuthorizationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetScope
}) => {
  const [authorizerName, setAuthorizerName] = useState('Chief Information Security Officer');
  const [organization, setOrganization] = useState('Enterprise Security Operations');
  const [agreedScope, setAgreedScope] = useState(false);
  const [agreedEthicalRules, setAgreedEthicalRules] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedScope || !agreedEthicalRules) return;
    onConfirm({ authorizerName, organization });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Ethical Authorization Scope Verification
              </h3>
              <p className="text-xs text-slate-400">
                Mandatory compliance validation under Computer Fraud & Abuse Act / ISO 27001
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3.5 flex gap-3 text-xs text-amber-200/90 leading-relaxed">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <strong className="text-amber-300 font-semibold">Strict Ethical Boundary:</strong> Scanning or probing computer networks without prior explicit written authorization is illegal. AegisSec operates exclusively for defensive assessments on verified assets.
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Scope to be Assessed
              </label>
              <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-emerald-400">
                {targetScope || '192.168.1.0/24 (Authorized VLAN)'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Authorizer / System Owner
                </label>
                <input
                  type="text"
                  value={authorizerName}
                  onChange={(e) => setAuthorizerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Jane Doe (CISO)"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Organization / Client Name
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. CyberSec Defense Labs"
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreedScope}
                  onChange={(e) => setAgreedScope(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                />
                <span>
                  I confirm that the specified target IP/subnet is within my organization's permitted scope or I have obtained signed authorization for this assessment.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreedEthicalRules}
                  onChange={(e) => setAgreedEthicalRules(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                />
                <span>
                  I agree that this scan is non-destructive, will not perform denial-of-service or exploitation, and will log my identity to the audit trail.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!agreedScope || !agreedEthicalRules}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                agreedScope && agreedEthicalRules
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Authorization & Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
