import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Explicit user constraint: Only password "Morbulutong2026". No email, no name, no password hint.
    if (password === 'Morbulutong2026') {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
        onLoginSuccess();
        onClose();
      }, 600);
    } else {
      setError('Incorrect administrator passcode. Please re-enter.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="admin-login-title" className="text-base font-semibold text-slate-900">
                Administrator Access
              </h2>
              <p className="text-xs text-slate-500">Authentication required for modifying records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Authentication successful. Unlocking administrator controls...</span>
            </div>
          )}

          <div>
            <label htmlFor="admin-passcode" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Passcode
            </label>
            <div className="relative">
              <input
                id="admin-passcode"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode"
                autoFocus
                required
                className="w-full pl-3.5 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none p-1"
                aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate Administrator</span>
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400">
            Morphonoveons Batch 2026 Financial Governance
          </div>
        </form>
      </div>
    </div>
  );
};
