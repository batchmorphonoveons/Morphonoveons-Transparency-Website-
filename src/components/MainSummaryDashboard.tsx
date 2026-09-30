import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  Shirt, 
  ShoppingBag, 
  Search, 
  Eye, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { PortalData, CategoryId } from '../types';
import { CATEGORY_DEFINITIONS } from '../data/initialData';
import { ActiveTab } from './TopNavbar';

interface MainSummaryDashboardProps {
  data: PortalData;
  onNavigateTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
  onViewDocument: (doc: {
    data?: string;
    name?: string;
    title: string;
    referenceId: string;
    amount?: number;
    date?: string;
    categoryName?: string;
  }) => void;
  onOpenAddModal: (catId: CategoryId) => void;
}

export const MainSummaryDashboard: React.FC<MainSummaryDashboardProps> = ({
  data,
  onNavigateTab,
  isAdmin,
  onViewDocument,
  onOpenAddModal,
}) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partially Paid' | 'Unpaid' | 'Pending'>('All');

  // Compute metrics per category
  // 1. General Funds
  const generalCollections = data.collections
    .filter((c) => c.categoryId === 'general')
    .reduce((sum, c) => sum + c.amount, 0);
  const generalExpenses = data.expenses
    .filter((e) => e.categoryId === 'general')
    .reduce((sum, e) => sum + e.amount, 0);
  const generalBalance = generalCollections - generalExpenses;

  // 2. Selling Activities
  const sellingRevenue = data.sellingActivities.reduce((sum, a) => sum + a.totalSales, 0);
  const sellingCosts = data.sellingActivities.reduce((sum, a) => sum + a.productionCost, 0);
  const sellingNetProceeds = data.sellingActivities.reduce((sum, a) => sum + a.netProceeds, 0);

  // 3. Batch Jersey
  const batchJerseyCollections = data.collections
    .filter((c) => c.categoryId === 'batch_jersey')
    .reduce((sum, c) => sum + c.amount, 0);
  const batchJerseyExpenses = data.expenses
    .filter((e) => e.categoryId === 'batch_jersey')
    .reduce((sum, e) => sum + e.amount, 0);
  const batchJerseyBalance = batchJerseyCollections - batchJerseyExpenses;

  // 4. MOL Blue Jersey
  const molBlueCollections = data.collections
    .filter((c) => c.categoryId === 'mol_blue')
    .reduce((sum, c) => sum + c.amount, 0);
  const molBlueExpenses = data.expenses
    .filter((e) => e.categoryId === 'mol_blue')
    .reduce((sum, e) => sum + e.amount, 0);
  const molBlueBalance = molBlueCollections - molBlueExpenses;

  // 5. MMC White Jersey
  const mmcWhiteCollections = data.collections
    .filter((c) => c.categoryId === 'mmc_white')
    .reduce((sum, c) => sum + c.amount, 0);
  const mmcWhiteExpenses = data.expenses
    .filter((e) => e.categoryId === 'mmc_white')
    .reduce((sum, e) => sum + e.amount, 0);
  const mmcWhiteBalance = mmcWhiteCollections - mmcWhiteExpenses;

  // Overall Totals
  const totalCollectionsAll =
    generalCollections + sellingRevenue + batchJerseyCollections + molBlueCollections + mmcWhiteCollections;
  const totalExpensesAll =
    generalExpenses + sellingCosts + batchJerseyExpenses + molBlueExpenses + mmcWhiteExpenses;
  const totalAvailableBalance = totalCollectionsAll - totalExpensesAll;

  // Category card configurations strictly separate
  const categoryCards = [
    {
      id: 'general' as const,
      title: 'General Batch Funds',
      code: 'GBF',
      collections: generalCollections,
      expenses: generalExpenses,
      balance: generalBalance,
      icon: Wallet,
      accent: 'emerald',
      description: 'Operations, event reservations & dues',
    },
    {
      id: 'selling' as const,
      title: 'Selling Activities',
      code: 'SAF',
      collections: sellingRevenue,
      expenses: sellingCosts,
      balance: sellingNetProceeds,
      icon: ShoppingBag,
      accent: 'amber',
      description: 'Stickers, merchandise & food sales',
    },
    {
      id: 'batch_jersey' as const,
      title: 'Batch Jersey',
      code: 'BJF',
      collections: batchJerseyCollections,
      expenses: batchJerseyExpenses,
      balance: batchJerseyBalance,
      icon: Shirt,
      accent: 'indigo',
      description: 'Official 2026 Batch sports jerseys',
    },
    {
      id: 'mol_blue' as const,
      title: 'MOL Blue Jersey',
      code: 'MBJ',
      collections: molBlueCollections,
      expenses: molBlueExpenses,
      balance: molBlueBalance,
      icon: Shirt,
      accent: 'sky',
      description: 'Maritime MOL blue edition jersey',
    },
    {
      id: 'mmc_white' as const,
      title: 'MMC White Jersey',
      code: 'MWJ',
      collections: mmcWhiteCollections,
      expenses: mmcWhiteExpenses,
      balance: mmcWhiteBalance,
      icon: Shirt,
      accent: 'slate',
      description: 'Commemorative MMC white edition jersey',
    },
  ];

  // Combined searchable transactions
  const combinedRecentTransactions = [
    ...data.collections.map((c) => ({
      id: c.id,
      type: 'Collection' as const,
      category: c.categoryId,
      categoryName: CATEGORY_DEFINITIONS.find((x) => x.id === c.categoryId)?.name || c.categoryId,
      reference: c.referenceId,
      description: c.description,
      amount: c.amount,
      date: c.date,
      status: c.status,
      documentName: c.documentName,
      documentData: c.documentData,
    })),
    ...data.expenses.map((e) => ({
      id: e.id,
      type: 'Expense' as const,
      category: e.categoryId,
      categoryName: CATEGORY_DEFINITIONS.find((x) => x.id === e.categoryId)?.name || e.categoryId,
      reference: e.payee,
      description: e.title,
      amount: -e.amount,
      date: e.date,
      status: e.status,
      documentName: e.documentName,
      documentData: e.documentData,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((tx) => {
      const q = globalSearch.toLowerCase();
      const matchesSearch =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        tx.reference.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.categoryName.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' || tx.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / About Portal Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Morphonoveons Batch 2026</span>
              <span aria-hidden="true">&bull;</span>
              <span>Financial Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Batch 2026 Transparency Portal
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              A centralized, real-time platform created to provide accessible and organized information regarding all batch-related financial activities. Dedicated to promoting absolute transparency, accountability, and proper financial stewardship among all batch members.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col items-stretch gap-2.5 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Admin Authorization Active</span>
              </div>
            ) : (
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                <span>View-Only Access Granted</span>
              </div>
            )}
            <button
              onClick={() => onNavigateTab('reports')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Audit Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Overall Financial Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Overall Treasury Standing</h2>
          <span className="text-xs text-slate-500 font-mono">
            {data.collections.length + data.expenses.length} Total Verified Ledger Entries
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Collections & Inflows */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Total Collections & Inflows</span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 tabular-nums">
              ₱{totalCollectionsAll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Combined collections from dues, jerseys & selling revenues
            </p>
          </div>

          {/* Total Expenses & Disbursements */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Total Batch Expenses</span>
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 tabular-nums">
              ₱{totalExpensesAll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Venue deposits, manufacturing, materials & suppliers
            </p>
          </div>

          {/* Total Available Balance */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
              <span>Total Available Balance</span>
              <div className="p-1.5 bg-slate-800 text-blue-400 rounded-md">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              ₱{totalAvailableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Net unencumbered cash balance across all batch fund reserves
            </p>
          </div>
        </div>
      </section>

      {/* Category Dashboards Grid - Funds Not Mixed */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Category Fund Ledgers</h2>
            <p className="text-xs text-slate-500">
              Each fund is tracked separately so monies are strictly segregated and not mixed
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">5 Distinct Fund Envelopes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col justify-between transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 text-slate-800 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {card.title}
                        </h3>
                        <span className="text-[11px] font-mono font-medium text-slate-400 uppercase">
                          {card.code}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab(card.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title={`Open ${card.title} Dashboard`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-1">{card.description}</p>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        {card.id === 'selling' ? 'Gross Revenue:' : 'Collections:'}
                      </span>
                      <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                        ₱{card.collections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        {card.id === 'selling' ? 'Production Cost:' : 'Expenses / Supplier:'}
                      </span>
                      <span className="font-mono font-semibold text-rose-600 tabular-nums">
                        ₱{card.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-600">Fund Balance:</span>
                    <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      ₱{card.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateTab(card.id)}
                      className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                    >
                      Open Dashboard
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onOpenAddModal(card.id)}
                        className="py-1.5 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Add Entry"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Real-time Comprehensive Transaction Ledger */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Transactions & Records</h2>
            <p className="text-xs text-slate-500">
              Live search and filter across all collections, disbursements, and activities
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search ref, desc, id..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
              {(['All', 'Paid', 'Partially Paid', 'Unpaid', 'Pending'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    statusFilter === s
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Reference / Contributor</th>
                <th className="py-3 px-4">Particulars</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Supporting Doc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedRecentTransactions.length > 0 ? (
                combinedRecentTransactions.map((tx) => (
                  <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          tx.type === 'Collection' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {tx.categoryName}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {tx.reference}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-[220px] truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right tabular-nums whitespace-nowrap">
                      <span className={tx.amount >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {tx.amount >= 0 ? '+' : ''}₱
                        {Math.abs(tx.amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                          tx.status === 'Paid' || tx.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {tx.documentData ? (
                        <button
                          onClick={() =>
                            onViewDocument({
                              data: tx.documentData,
                              name: tx.documentName,
                              title: tx.description,
                              referenceId: tx.reference,
                              amount: Math.abs(tx.amount),
                              date: tx.date,
                              categoryName: tx.categoryName,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No transactions match the selected filters or search keyword.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
