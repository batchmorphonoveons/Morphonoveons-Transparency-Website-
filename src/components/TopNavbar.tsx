import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, LogIn, LogOut, Radio, Menu, X } from 'lucide-react';
import { CategoryId } from '../types';

export type ActiveTab = 'overview' | CategoryId | 'audit_log' | 'reports';

interface TopNavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  lastUpdated: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  onOpenLogin,
  onLogout,
  lastUpdated,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'general', label: 'General Funds' },
    { id: 'selling', label: 'Selling Activities' },
    { id: 'batch_jersey', label: 'Batch Jersey' },
    { id: 'mol_blue', label: 'MOL Blue' },
    { id: 'mmc_white', label: 'MMC White' },
    { id: 'audit_log', label: 'Audit Trail' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onTabChange('overview')}
            className="text-left group flex flex-col justify-center"
          >
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Morphonoveons 2026
            </span>
            <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500">
              Transparency Portal
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Auth Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time sync indicator */}
            <div 
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600"
              title={`Live updates active. Last synced: ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Just now'}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">Live Sync</span>
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Mode</span>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Logout Administrator"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
                  <span>Batch Member (View-Only)</span>
                </div>
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
              </div>
            )}

            {/* Mobile hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 py-3 space-y-1">
            <div className="grid grid-cols-2 gap-1 pb-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-left text-xs font-medium rounded-lg ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Status: {isAdmin ? 'Administrator' : 'Batch Member (View-Only)'}</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <Radio className="w-3 h-3 animate-pulse" /> Live Updated
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
