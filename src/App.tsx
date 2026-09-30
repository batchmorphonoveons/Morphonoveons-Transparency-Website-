import React, { useState, useEffect } from 'react';
import { portalStorage } from './services/storageService';
import { PortalData, CategoryId } from './types';
import { TopNavbar, ActiveTab } from './components/TopNavbar';
import { MainSummaryDashboard } from './components/MainSummaryDashboard';
import { CategoryDashboard } from './components/CategoryDashboard';
import { AuditLogView } from './components/AuditLogView';
import { ReportsView } from './components/ReportsView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { RecordModal, ModalMode } from './components/RecordModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';

export default function App() {
  const [data, setData] = useState<PortalData>(portalStorage.getData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('morphonoveons_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [recordModalMode, setRecordModalMode] = useState<ModalMode | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    data?: string;
    name?: string;
    title: string;
    referenceId: string;
    amount?: number;
    date?: string;
    categoryName?: string;
  } | null>(null);

  // Subscribe to real-time updates from portalStorage
  useEffect(() => {
    const unsubscribe = portalStorage.subscribe((updatedData) => {
      setData({ ...updatedData });
    });
    return unsubscribe;
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem('morphonoveons_admin_auth', 'true');
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem('morphonoveons_admin_auth');
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        lastUpdated={data.lastUpdated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <MainSummaryDashboard
            data={data}
            onNavigateTab={setActiveTab}
            isAdmin={isAdmin}
            onViewDocument={(doc) => setPreviewDoc(doc)}
            onOpenAddModal={(catId) => {
              if (isAdmin) {
                if (catId === 'selling') {
                  setRecordModalMode({ type: 'add_selling' });
                } else if (['batch_jersey', 'mol_blue', 'mmc_white'].includes(catId)) {
                  setRecordModalMode({
                    type: 'add_jersey',
                    jerseyType: catId as 'batch_jersey' | 'mol_blue' | 'mmc_white',
                  });
                } else {
                  setRecordModalMode({ type: 'add_collection', categoryId: catId });
                }
              } else {
                setLoginModalOpen(true);
              }
            }}
          />
        )}

        {(activeTab === 'general' ||
          activeTab === 'selling' ||
          activeTab === 'batch_jersey' ||
          activeTab === 'mol_blue' ||
          activeTab === 'mmc_white') && (
          <CategoryDashboard
            categoryId={activeTab as CategoryId}
            data={data}
            isAdmin={isAdmin}
            onOpenModal={(mode) => setRecordModalMode(mode)}
            onViewDocument={(doc) => setPreviewDoc(doc)}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        )}

        {activeTab === 'audit_log' && <AuditLogView logs={data.auditLogs} />}

        {activeTab === 'reports' && (
          <ReportsView
            data={data}
            isAdmin={isAdmin}
            onResetData={() => portalStorage.resetToDefault()}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Morphonoveons Batch 2026</span>
            <span aria-hidden="true">&bull;</span>
            <span>Financial Transparency Portal</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Real-time Multi-ledger System</span>
            <span aria-hidden="true">&bull;</span>
            <span>View & Audited Records</span>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal (password: Morbulutong2026, no email, no name, no hint) */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Unified Record Add / Edit Modal */}
      <RecordModal
        mode={recordModalMode}
        onClose={() => setRecordModalMode(null)}
        onSaveCollection={(colData, prev) => {
          if (prev) {
            portalStorage.updateCollection({ ...prev, ...colData }, prev);
          } else {
            portalStorage.addCollection(colData);
          }
        }}
        onDeleteCollection={(id) => portalStorage.deleteCollection(id)}
        onSaveExpense={(expData, prev) => {
          if (prev) {
            portalStorage.updateExpense({ ...prev, ...expData }, prev);
          } else {
            portalStorage.addExpense(expData);
          }
        }}
        onDeleteExpense={(id) => portalStorage.deleteExpense(id)}
        onSaveSelling={(sellData, prev) => {
          if (prev) {
            portalStorage.updateSellingActivity({ ...prev, ...sellData }, prev);
          } else {
            portalStorage.addSellingActivity(sellData);
          }
        }}
        onDeleteSelling={(id) => portalStorage.deleteSellingActivity(id)}
        onSaveJersey={(jerData, prev) => {
          if (prev) {
            portalStorage.updateJerseyRecord({ ...prev, ...jerData }, prev);
          } else {
            portalStorage.addJerseyRecord(jerData);
          }
        }}
        onDeleteJersey={(id) => portalStorage.deleteJerseyRecord(id)}
      />

      {/* Supporting Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          documentData={previewDoc.data}
          documentName={previewDoc.name}
          title={previewDoc.title}
          referenceId={previewDoc.referenceId}
          amount={previewDoc.amount}
          date={previewDoc.date}
          categoryName={previewDoc.categoryName}
        />
      )}
    </div>
  );
}
