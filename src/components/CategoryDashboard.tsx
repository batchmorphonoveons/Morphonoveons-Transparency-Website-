import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Lock, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  DollarSign,
  Shirt,
  ShoppingBag
} from 'lucide-react';
import { 
  PortalData, 
  CategoryId, 
  CollectionItem, 
  ExpenseItem, 
  SellingActivityItem, 
  JerseyRecordItem 
} from '../types';
import { CATEGORY_DEFINITIONS } from '../data/initialData';
import { ModalMode } from './RecordModal';

interface CategoryDashboardProps {
  categoryId: CategoryId;
  data: PortalData;
  isAdmin: boolean;
  onOpenModal: (mode: ModalMode) => void;
  onViewDocument: (doc: {
    data?: string;
    name?: string;
    title: string;
    referenceId: string;
    amount?: number;
    date?: string;
    categoryName?: string;
  }) => void;
  onOpenLogin: () => void;
}

export const CategoryDashboard: React.FC<CategoryDashboardProps> = ({
  categoryId,
  data,
  isAdmin,
  onOpenModal,
  onViewDocument,
  onOpenLogin,
}) => {
  const currentCategory = CATEGORY_DEFINITIONS.find((c) => c.id === categoryId)!;
  const isJerseyCategory = ['batch_jersey', 'mol_blue', 'mmc_white'].includes(categoryId);
  const isSellingCategory = categoryId === 'selling';

  // Sub tab state
  const [subTab, setSubTab] = useState<'roster' | 'collections' | 'expenses' | 'selling_activities'>(
    isJerseyCategory ? 'roster' : isSellingCategory ? 'selling_activities' : 'collections'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter category data
  const categoryCollections = data.collections.filter((c) => c.categoryId === categoryId);
  const categoryExpenses = data.expenses.filter((e) => e.categoryId === categoryId);
  const categoryJerseys = data.jerseyRecords.filter((j) => j.jerseyType === categoryId);
  const sellingActivities = data.sellingActivities;

  // Compute metrics
  const totalCollections = isSellingCategory
    ? sellingActivities.reduce((sum, a) => sum + a.totalSales, 0)
    : categoryCollections.reduce((sum, c) => sum + c.amount, 0);

  const totalExpenses = isSellingCategory
    ? sellingActivities.reduce((sum, a) => sum + a.productionCost, 0)
    : categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

  const balance = isSellingCategory
    ? sellingActivities.reduce((sum, a) => sum + a.netProceeds, 0)
    : totalCollections - totalExpenses;

  return (
    <div className="space-y-6 pb-12">
      {/* Category Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span className="font-mono text-slate-700">{currentCategory.code}</span>
              <span aria-hidden="true">&bull;</span>
              <span>Individual Category Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {currentCategory.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentCategory.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isAdmin ? (
              <>
                {isJerseyCategory && (
                  <button
                    onClick={() =>
                      onOpenModal({
                        type: 'add_jersey',
                        jerseyType: categoryId as 'batch_jersey' | 'mol_blue' | 'mmc_white',
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Order Slot</span>
                  </button>
                )}

                {isSellingCategory && (
                  <button
                    onClick={() => onOpenModal({ type: 'add_selling' })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Selling Activity</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenModal({ type: 'add_collection', categoryId })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Collection</span>
                </button>

                <button
                  onClick={() => onOpenModal({ type: 'add_expense', categoryId })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login to Edit Records</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Summary Cards for This Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs text-slate-500 font-medium">
              {isSellingCategory ? 'Total Gross Sales' : 'Total Category Collections'}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              ₱{totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs text-slate-500 font-medium">
              {isSellingCategory ? 'Total Production Costs' : 'Total Category Disbursements'}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
              ₱{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 text-white rounded-lg">
            <span className="text-xs text-slate-300 font-medium">
              {isSellingCategory ? 'Total Net Proceeds' : 'Available Fund Balance'}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {isJerseyCategory && (
            <button
              onClick={() => setSubTab('roster')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                subTab === 'roster'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order Roster ({categoryJerseys.length})
            </button>
          )}

          {isSellingCategory && (
            <button
              onClick={() => setSubTab('selling_activities')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                subTab === 'selling_activities'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selling Activities ({sellingActivities.length})
            </button>
          )}

          <button
            onClick={() => setSubTab('collections')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'collections'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Collections ({categoryCollections.length})
          </button>

          <button
            onClick={() => setSubTab('expenses')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subTab === 'expenses'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses & Supplier ({categoryExpenses.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this category..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* SUB-TAB CONTENT 1: JERSEY ORDER ROSTER */}
      {isJerseyCategory && subTab === 'roster' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {currentCategory.name} &bull; Official Order Roster
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Individual Order Slots &bull; No imaginary names
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Order Slot</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Custom No.</th>
                  <th className="py-3 px-4">Inscription</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4">Member Status</th>
                  <th className="py-3 px-4">Supplier Status</th>
                  <th className="py-3 px-4 text-center">Document</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryJerseys
                  .filter((j) => {
                    const q = searchQuery.toLowerCase();
                    const matchesSearch =
                      !q ||
                      j.orderSlot.toLowerCase().includes(q) ||
                      (j.customNumber && j.customNumber.toLowerCase().includes(q)) ||
                      (j.customBatchText && j.customBatchText.toLowerCase().includes(q));
                    const matchesStatus =
                      statusFilter === 'All' || j.paymentStatus.toLowerCase() === statusFilter.toLowerCase();
                    return matchesSearch && matchesStatus;
                  })
                  .map((jersey) => (
                    <tr key={jersey.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {jersey.orderSlot}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {jersey.size}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">
                        {jersey.customNumber || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {jersey.customBatchText || '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums whitespace-nowrap">
                        ₱{jersey.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right tabular-nums whitespace-nowrap">
                        ₱{jersey.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            jersey.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : jersey.paymentStatus === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {jersey.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                            jersey.supplierPaymentStatus === 'Paid to Supplier'
                              ? 'bg-blue-50 text-blue-700'
                              : jersey.supplierPaymentStatus === 'Downpayment Paid'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {jersey.supplierPaymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {jersey.documentData ? (
                          <button
                            onClick={() =>
                              onViewDocument({
                                data: jersey.documentData,
                                name: jersey.documentName,
                                title: `${jersey.orderSlot} Order Proof`,
                                referenceId: jersey.orderSlot,
                                amount: jersey.amountPaid,
                                categoryName: currentCategory.name,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Proof</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenModal({ type: 'edit_jersey', item: jersey })}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors mr-1"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 2: SELLING ACTIVITIES */}
      {isSellingCategory && subTab === 'selling_activities' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Morphonoveons Merchandise & Fundraising Selling Activities
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Net proceeds strictly allocated to batch treasury
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Activity / Merch Name</th>
                  <th className="py-3 px-4 text-right">Gross Sales</th>
                  <th className="py-3 px-4 text-right">Production Cost</th>
                  <th className="py-3 px-4 text-right">Net Proceeds</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-center">Statement</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellingActivities
                  .filter((a) => {
                    const q = searchQuery.toLowerCase();
                    const matchesSearch =
                      !q || a.activityName.toLowerCase().includes(q) || (a.notes && a.notes.toLowerCase().includes(q));
                    const matchesStatus =
                      statusFilter === 'All' || a.status.toLowerCase() === statusFilter.toLowerCase();
                    return matchesSearch && matchesStatus;
                  })
                  .map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {act.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {act.activityName}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-emerald-700 tabular-nums whitespace-nowrap">
                        ₱{act.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-rose-600 tabular-nums whitespace-nowrap">
                        ₱{act.productionCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 tabular-nums whitespace-nowrap bg-emerald-50/50">
                        ₱{act.netProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            act.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : act.status === 'Ongoing'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={act.notes}>
                        {act.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {act.documentData ? (
                          <button
                            onClick={() =>
                              onViewDocument({
                                data: act.documentData,
                                name: act.documentName,
                                title: `${act.activityName} Statement`,
                                referenceId: act.id,
                                amount: act.netProceeds,
                                date: act.date,
                                categoryName: 'Selling Activities',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Statement</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenModal({ type: 'edit_selling', item: act })}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Activity"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 3: COLLECTIONS LIST */}
      {subTab === 'collections' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {currentCategory.name} &bull; Recorded Collections & Inflows
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Direct Deposits & Member Remittances
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Reference / Contributor</th>
                  <th className="py-3 px-4">Particulars</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-center">Official Receipt</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryCollections
                  .filter((c) => {
                    const q = searchQuery.toLowerCase();
                    const matchesSearch =
                      !q ||
                      c.id.toLowerCase().includes(q) ||
                      c.referenceId.toLowerCase().includes(q) ||
                      c.description.toLowerCase().includes(q);
                    const matchesStatus =
                      statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();
                    return matchesSearch && matchesStatus;
                  })
                  .map((col) => (
                    <tr key={col.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {col.date}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {col.id}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {col.referenceId}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {col.description}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-emerald-700 tabular-nums whitespace-nowrap">
                        ₱{col.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            col.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : col.status === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {col.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[180px] truncate" title={col.notes}>
                        {col.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {col.documentData ? (
                          <button
                            onClick={() =>
                              onViewDocument({
                                data: col.documentData,
                                name: col.documentName,
                                title: col.description,
                                referenceId: col.referenceId,
                                amount: col.amount,
                                date: col.date,
                                categoryName: currentCategory.name,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenModal({ type: 'edit_collection', item: col })}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Collection"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB CONTENT 4: EXPENSES & SUPPLIER PAYMENTS */}
      {subTab === 'expenses' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {currentCategory.name} &bull; Recorded Disbursements & Supplier Invoices
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Official Batch Disbursements
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Payee / Supplier</th>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4 text-right">Disbursed Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-center">Invoice Proof</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryExpenses
                  .filter((e) => {
                    const q = searchQuery.toLowerCase();
                    const matchesSearch =
                      !q ||
                      e.id.toLowerCase().includes(q) ||
                      e.payee.toLowerCase().includes(q) ||
                      e.title.toLowerCase().includes(q);
                    const matchesStatus =
                      statusFilter === 'All' || e.status.toLowerCase() === statusFilter.toLowerCase();
                    return matchesSearch && matchesStatus;
                  })
                  .map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {exp.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {exp.payee}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {exp.title}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-rose-600 tabular-nums whitespace-nowrap">
                        ₱{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            exp.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : exp.status === 'Paid'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[180px] truncate" title={exp.notes}>
                        {exp.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {exp.documentData ? (
                          <button
                            onClick={() =>
                              onViewDocument({
                                data: exp.documentData,
                                name: exp.documentName,
                                title: exp.title,
                                referenceId: exp.payee,
                                amount: exp.amount,
                                date: exp.date,
                                categoryName: currentCategory.name,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenModal({ type: 'edit_expense', item: exp })}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Expense"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
