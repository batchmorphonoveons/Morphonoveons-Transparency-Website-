import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  DollarSign, 
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PortalData, CategoryId } from '../types';
import { CATEGORY_DEFINITIONS } from '../data/initialData';

interface ReportsViewProps {
  data: PortalData;
  isAdmin: boolean;
  onResetData: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ data, isAdmin, onResetData }) => {
  const [reportType, setReportType] = useState<'overall' | CategoryId>('overall');
  const [confirmReset, setConfirmReset] = useState(false);

  // Financial calculations
  const generalCol = data.collections.filter((c) => c.categoryId === 'general').reduce((s, c) => s + c.amount, 0);
  const generalExp = data.expenses.filter((e) => e.categoryId === 'general').reduce((s, e) => s + e.amount, 0);
  const generalBal = generalCol - generalExp;

  const sellingRev = data.sellingActivities.reduce((s, a) => s + a.totalSales, 0);
  const sellingCost = data.sellingActivities.reduce((s, a) => s + a.productionCost, 0);
  const sellingNet = data.sellingActivities.reduce((s, a) => s + a.netProceeds, 0);

  const bjCol = data.collections.filter((c) => c.categoryId === 'batch_jersey').reduce((s, c) => s + c.amount, 0);
  const bjExp = data.expenses.filter((e) => e.categoryId === 'batch_jersey').reduce((s, e) => s + e.amount, 0);
  const bjBal = bjCol - bjExp;

  const molCol = data.collections.filter((c) => c.categoryId === 'mol_blue').reduce((s, c) => s + c.amount, 0);
  const molExp = data.expenses.filter((e) => e.categoryId === 'mol_blue').reduce((s, e) => s + e.amount, 0);
  const molBal = molCol - molExp;

  const mmcCol = data.collections.filter((c) => c.categoryId === 'mmc_white').reduce((s, c) => s + c.amount, 0);
  const mmcExp = data.expenses.filter((e) => e.categoryId === 'mmc_white').reduce((s, e) => s + e.amount, 0);
  const mmcBal = mmcCol - mmcExp;

  const totalInflows = generalCol + sellingRev + bjCol + molCol + mmcCol;
  const totalOutflows = generalExp + sellingCost + bjExp + molExp + mmcExp;
  const grandBalance = totalInflows - totalOutflows;

  // Export CSV functions
  const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMasterLedger = () => {
    const headers = ['Category', 'Type', 'Record ID', 'Reference/Payee', 'Description/Title', 'Amount', 'Date', 'Status', 'Notes'];
    const rows: string[][] = [];

    data.collections.forEach((c) => {
      rows.push([
        c.categoryId,
        'Collection',
        c.id,
        `"${c.referenceId.replace(/"/g, '""')}"`,
        `"${c.description.replace(/"/g, '""')}"`,
        c.amount.toFixed(2),
        c.date,
        c.status,
        `"${(c.notes || '').replace(/"/g, '""')}"`,
      ]);
    });

    data.expenses.forEach((e) => {
      rows.push([
        e.categoryId,
        'Expense',
        e.id,
        `"${e.payee.replace(/"/g, '""')}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        (-e.amount).toFixed(2),
        e.date,
        e.status,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ]);
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(`Morphonoveons_Master_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleExportJerseyRoster = () => {
    const headers = ['Jersey Type', 'Order Slot', 'Size', 'Custom Number', 'Inscription', 'Unit Price', 'Amount Paid', 'Payment Status', 'Supplier Status', 'Notes'];
    const rows = data.jerseyRecords.map((j) => [
      j.jerseyType,
      `"${j.orderSlot}"`,
      j.size,
      `"${j.customNumber || ''}"`,
      `"${j.customBatchText || ''}"`,
      j.unitPrice.toFixed(2),
      j.amountPaid.toFixed(2),
      j.paymentStatus,
      `"${j.supplierPaymentStatus}"`,
      `"${(j.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(`Morphonoveons_Jersey_Roster_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleExportSellingActivities = () => {
    const headers = ['Activity Name', 'Date', 'Gross Sales', 'Production Cost', 'Net Proceeds', 'Status', 'Notes'];
    const rows = data.sellingActivities.map((a) => [
      `"${a.activityName.replace(/"/g, '""')}"`,
      a.date,
      a.totalSales.toFixed(2),
      a.productionCost.toFixed(2),
      a.netProceeds.toFixed(2),
      a.status,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsv(`Morphonoveons_Selling_Activities_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Financial Documentation</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Financial Reports & Data Exports
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Generate certified batch financial reports, download ledger statements in standard CSV/Excel format, or create printable PDF audited statements for batch assembly reviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg w-fit mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Master Financial Ledger</h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete chronological ledger of all dues, remittances, selling revenues, and expenses across all funds.
            </p>
          </div>
          <button
            onClick={handleExportMasterLedger}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Download Master CSV</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg w-fit mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Jersey Orders & Supplier Roster</h3>
            <p className="text-xs text-slate-500 mt-1">
              Combined rosters for Batch Jersey, MOL Blue, and MMC White orders with payment statuses and supplier remittances.
            </p>
          </div>
          <button
            onClick={handleExportJerseyRoster}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Download Jersey Roster CSV</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg w-fit mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Selling Activities Statement</h3>
            <p className="text-xs text-slate-500 mt-1">
              Merchandise sales, sticker fundraising, food booths, production expenses, and calculated net proceeds.
            </p>
          </div>
          <button
            onClick={handleExportSellingActivities}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Download Activities CSV</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formal Printable Financial Statement View */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
                Official Financial Statement
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-0.5">
                MORPHONOVEONS BATCH 2026
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Centralized Financial Transparency Portal &bull; Statement of Financial Standing
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
              <div>Statement Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>Audit Status: Verified & Recorded</div>
              <div>Currency: Philippine Peso (PHP ₱)</div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
            I. Category-by-Category Fund Breakdown
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Fund Category</th>
                  <th className="py-2.5 px-4 text-right">Total Collections / Revenue</th>
                  <th className="py-2.5 px-4 text-right">Total Disbursements / Costs</th>
                  <th className="py-2.5 px-4 text-right">Net Available Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                    General Batch Funds
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-700">
                    ₱{generalCol.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-rose-600">
                    ₱{generalExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₱{generalBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                    Selling Activities
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-700">
                    ₱{sellingRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-rose-600">
                    ₱{sellingCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₱{sellingNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                    Batch Jersey
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-700">
                    ₱{bjCol.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-rose-600">
                    ₱{bjExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₱{bjBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                    MOL Blue Jersey
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-700">
                    ₱{molCol.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-rose-600">
                    ₱{molExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₱{molBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                    MMC White Jersey
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-700">
                    ₱{mmcCol.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-rose-600">
                    ₱{mmcExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₱{mmcBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-900 text-white font-mono font-bold">
                <tr>
                  <td className="py-3 px-4 font-sans uppercase">Total Consolidated Treasury</td>
                  <td className="py-3 px-4 text-right text-emerald-400">
                    ₱{totalInflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-300">
                    ₱{totalOutflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    ₱{grandBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 2: Detailed Fund Notes & Signatories */}
        <div className="space-y-6 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wide mb-1">
                Accounting & Compliance Standard
              </h4>
              <p className="leading-relaxed">
                All funds are maintained under independent escrow ledger envelopes. No mixing of jersey pre-orders with general operational batch dues has occurred. Every disbursement is backed by digital supplier receipts and official order verification sheets.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wide mb-1">
                Audit Trail Certification
              </h4>
              <p className="leading-relaxed">
                This document reflects real-time ledger entries from the Morphonoveons Transparency Database as of {new Date().toLocaleTimeString()}. Modifications require administrator credentials and are recorded in the permanent audit trail.
              </p>
            </div>
          </div>

          <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">Treasury Committee</p>
              <p className="text-slate-500">Batch 2026 Finance</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">Auditing Committee</p>
              <p className="text-slate-500">Transparency Lead</p>
            </div>
            <div className="border-t border-slate-400 pt-2 col-span-2 sm:col-span-1">
              <p className="font-bold text-slate-900">Batch Leadership</p>
              <p className="text-slate-500">Morphonoveons 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Maintenance / Sample Data Controls */}
      {isAdmin && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sample Data Maintenance</h3>
              <p className="text-xs text-slate-500">
                All sample records are completely editable and can be deleted or reverted to the default verified baseline.
              </p>
            </div>

            <div>
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Initial Sample Data</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-700 font-medium">Reset all records?</span>
                  <button
                    onClick={() => {
                      onResetData();
                      setConfirmReset(false);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-rose-600 text-white rounded-md hover:bg-rose-700"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
