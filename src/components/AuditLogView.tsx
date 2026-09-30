import React, { useState } from 'react';
import { ShieldCheck, Search, Download, Clock, History, Filter } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.recordChanged.toLowerCase().includes(q) ||
      log.previousInfo.toLowerCase().includes(q) ||
      log.updatedInfo.toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === 'All' || log.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Category', 'Record Changed', 'Previous Information', 'Updated Information', 'Administrator'];
    const rows = filteredLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.category.replace(/"/g, '""')}"`,
      `"${log.recordChanged.replace(/"/g, '""')}"`,
      `"${log.previousInfo.replace(/"/g, '""')}"`,
      `"${log.updatedInfo.replace(/"/g, '""')}"`,
      `"${log.admin.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Morphonoveons_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>Immutable Transparency Trail</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Administrative Edit History & Audit Log
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every financial modification, record update, addition, or deletion made by administrators is automatically recorded with exact timestamps, previous states, and updated values to prevent unauthorized changes and guarantee total accountability.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, record, or details..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {filteredLogs.length} Logged Action{filteredLogs.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Action Performed</th>
                <th className="py-3 px-4">Fund Category</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">Previous State</th>
                <th className="py-3 px-4">Updated State</th>
                <th className="py-3 px-4">Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{log.action}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 whitespace-nowrap">
                      {log.category}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {log.recordChanged}
                    </td>
                    <td className="py-3 px-4 text-rose-700 bg-rose-50/40 max-w-[200px] truncate" title={log.previousInfo}>
                      {log.previousInfo}
                    </td>
                    <td className="py-3 px-4 text-emerald-800 bg-emerald-50/40 font-bold max-w-[220px] truncate" title={log.updatedInfo}>
                      {log.updatedInfo}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{log.admin}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-sans">
                    No audit records found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
