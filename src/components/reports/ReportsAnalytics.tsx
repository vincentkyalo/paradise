import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLogEntry, DepartmentKey } from '../../types';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Clock,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { orders, expenses, auditLogs, rooms, currentUser, showToast } = useApp();

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  // Revenue totals
  const totalSales = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const barSales = orders
    .filter((o) => o.department === 'BAR_CLUB' && o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const butcherySales = orders
    .filter((o) => o.department === 'BUTCHERY' && o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const hotelSales = orders
    .filter((o) => o.department === 'HOTEL_ROOMS' && o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const restaurantSales = orders
    .filter((o) => o.department === 'RESTAURANT' && o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const filteredAudit = auditLogs.filter((log) => {
    if (auditFilter === 'ALL') return true;
    return log.action.toLowerCase().includes(auditFilter.toLowerCase());
  });

  const handleExportAudit = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Action', 'Target Entity', 'Details', 'IP'],
      ...auditLogs.map((a) => [
        a.timestamp,
        a.userName,
        a.userRole || a.role,
        a.action,
        a.targetEntity || a.module,
        `"${a.details}"`,
        a.ipAddress || '192.168.1.100',
      ]),
    ]
      .map((r) => r.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hospitality_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Exported official audit trail CSV', 'success');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Reports, Enterprise Analytics & Immutable Audit Log
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              Auditor Compliance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Departmental cross-performance, hourly sales heat distribution, void logs, and immutable user activity logs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['today', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition cursor-pointer ${
                  dateRange === r
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAudit}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Department Breakdown Bar Graph Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Revenue Comparison */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Department Sales Distribution
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Total: KES {totalSales.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Bar & VIP Club', value: barSales, color: 'bg-purple-500', text: 'text-purple-400' },
              { label: 'Hotel Accommodations', value: hotelSales, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Butchery & Nyama Choma', value: butcherySales, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'Restaurant & Kitchen', value: restaurantSales, color: 'bg-emerald-500', text: 'text-emerald-400' },
            ].map((dept) => {
              const pct = totalSales > 0 ? Math.round((dept.value / totalSales) * 100) : 0;
              return (
                <div key={dept.label} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300">{dept.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${dept.text}`}>
                        KES {dept.value.toLocaleString()}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${dept.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Club Hourly Sales Distribution Heat Map */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Peak Traffic & Hourly Sales Heatmap
            </h3>
            <span className="text-[10px] text-slate-400">Peak hours: 22:00 - 02:00</span>
          </div>

          <div className="grid grid-cols-6 gap-2 pt-2">
            {[
              { hour: '14:00', val: 15, amt: '25k' },
              { hour: '16:00', val: 30, amt: '52k' },
              { hour: '18:00', val: 55, amt: '110k' },
              { hour: '20:00', val: 80, amt: '195k' },
              { hour: '22:00', val: 100, amt: '340k' },
              { hour: '00:00', val: 95, amt: '290k' },
            ].map((slot) => (
              <div
                key={slot.hour}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-between"
              >
                <span className="text-[10px] font-mono text-slate-400">{slot.hour}</span>
                <div className="my-2">
                  <div
                    className="w-full bg-amber-500 rounded mx-auto"
                    style={{ height: `${slot.val * 0.45}px` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-400">{slot.amt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immutable System Audit Log */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Enterprise System Audit Trail
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Every sensitive transaction, discount, void, stock intake, and shift reconciliation is permanently recorded.
            </p>
          </div>

          {/* Audit Filter */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-xs"
            >
              <option value="ALL">All Actions</option>
              <option value="ORDER">Orders & Bills</option>
              <option value="ROOM">Hotel Check-In/Out</option>
              <option value="STOCK">Stock Adjustments</option>
              <option value="CASH">Cash Drops & Shifts</option>
              <option value="VOID">Voids & Refunds</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Audit Details & Parameters</th>
                <th className="p-3.5">Workstation IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAudit.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-bold text-white">{log.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.userRole || log.role}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 font-mono whitespace-nowrap">
                    {log.targetEntity}
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-md">{log.details}</td>
                  <td className="p-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
