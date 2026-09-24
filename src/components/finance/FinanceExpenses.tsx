import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, CashDrawerShift, PaymentMethod } from '../../types';
import {
  Wallet,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Download,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const FinanceExpenses: React.FC = () => {
  const {
    expenses,
    addExpense,
    orders,
    cashDrawerShift,
    performCashDrop,
    reconcileShiftClose,
    currentUser,
    hasPermission,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'cash_drawer'>('overview');
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [cashDropModalOpen, setCashDropModalOpen] = useState(false);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);

  // Add Expense form
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('Liquor & Stock');
  const [expenseAmount, setExpenseAmount] = useState<number>(15000);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expensePayMethod, setExpensePayMethod] = useState<PaymentMethod>('mpesa');
  const [expenseVendor, setExpenseVendor] = useState('');

  // Cash drop form
  const [dropAmount, setDropAmount] = useState<number>(50000);

  // Shift reconcile form
  const [actualCashCount, setActualCashCount] = useState<number>(
    cashDrawerShift.openingCashFloat + cashDrawerShift.cashSalesAdded - cashDrawerShift.cashDroppedToSafe
  );

  // Financial calculations
  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = totalRevenue - totalExpenseAmount;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((netOperatingProfit / totalRevenue) * 100) : 0;

  // Breakdown by payment method
  const mpesaRevenue = orders
    .filter((o) => o.status === 'completed' && o.paymentMethod === 'mpesa')
    .reduce((sum, o) => sum + o.total, 0);

  const cashRevenue = orders
    .filter((o) => o.status === 'completed' && o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  const cardRevenue = orders
    .filter((o) => o.status === 'completed' && o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.total, 0);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc.trim() || expenseAmount <= 0) return;

    addExpense({
      category: expenseCategory,
      amount: expenseAmount,
      description: expenseDesc,
      paidTo: expenseVendor || 'Cash Vendor',
      paymentMethod: expensePayMethod,
      receiptRef: `EXP-${Date.now().toString().slice(-5)}`,
      approvedBy: currentUser.name,
      status: 'approved',
    });

    setExpenseModalOpen(false);
    setExpenseDesc('');
    setExpenseVendor('');
  };

  const handleCashDropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dropAmount <= 0) return;
    performCashDrop(dropAmount);
    setCashDropModalOpen(false);
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reconcileShiftClose(actualCashCount);
    setReconcileModalOpen(false);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Transaction No', 'Department', 'Total (KES)', 'Payment Method', 'Cashier'],
      ...orders.map((o) => [
        o.createdAt,
        o.txnNumber,
        o.department,
        o.total,
        o.paymentMethod,
        o.cashierName,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hospitality_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Exported CSV financial ledger successfully', 'success');
  };

  const expectedCashInDrawer =
    cashDrawerShift.openingCashFloat +
    cashDrawerShift.cashSalesAdded -
    cashDrawerShift.cashDroppedToSafe;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Financial Accounting, Expenses & Cash Drawer
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Live Audited P&L
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cash drawer shift balancing, safe drops, expense approvals, payment tender breakdown, and exportable financial ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          {(hasPermission('access_financials') || hasPermission('access_finances')) && (
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Invoiced Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            KES {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
            Across Bar, Hotel, Butchery & Restaurant
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Operational Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            KES {totalExpenseAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {expenses.length} approved expense vouchers
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Operating Profit</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            KES {netOperatingProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-0.5 font-semibold">
            {profitMarginPercent}% Net Operating Margin
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Cash Drawer Balance</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            KES {expectedCashInDrawer.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Float + Cash In - Drops to Safe
          </div>
        </div>
      </div>

      {/* Cash Drawer Shift Management Terminal */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-400" />
              Active Shift Cash Drawer Terminal
            </h3>
            <p className="text-xs text-slate-400">
              Shift: {cashDrawerShift.shiftName} • Cashier: {cashDrawerShift.cashierName} • Started: {cashDrawerShift.startTime}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setCashDropModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-semibold cursor-pointer"
            >
              Drop Cash to Vault Safe
            </button>
            <button
              onClick={() => setReconcileModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
            >
              Reconcile & Close Shift
            </button>
          </div>
        </div>

        {/* Drawer Math Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Opening Cash Float:</span>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              KES {cashDrawerShift.openingCashFloat.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">+ Cash Sales Received:</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              KES {cashDrawerShift.cashSalesAdded.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">- Dropped to Vault Safe:</span>
            <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
              KES {cashDrawerShift.cashDroppedToSafe.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40">
            <span className="text-blue-300 font-semibold">= Expected in Till Now:</span>
            <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
              KES {expectedCashInDrawer.toLocaleString()}
            </div>
          </div>
        </div>

        {cashDrawerShift.actualClosingCount !== undefined && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Shift Reconciliation Audit:</span>
              <div className="font-mono text-white font-bold">
                Counted KES {cashDrawerShift.actualClosingCount.toLocaleString()} vs Expected KES {expectedCashInDrawer.toLocaleString()}
              </div>
            </div>
            <div
              className={`font-mono font-bold text-sm ${
                (cashDrawerShift.variance || 0) === 0
                  ? 'text-emerald-400'
                  : (cashDrawerShift.variance || 0) > 0
                  ? 'text-cyan-400'
                  : 'text-rose-400'
              }`}
            >
              Variance: {(cashDrawerShift.variance || 0) >= 0 ? '+' : ''}
              KES {(cashDrawerShift.variance || 0).toLocaleString()} (
              {(cashDrawerShift.variance || 0) === 0 ? 'Balanced' : (cashDrawerShift.variance || 0) > 0 ? 'Surplus' : 'Shortage'}
              )
            </div>
          </div>
        )}
      </div>

      {/* Expenses Ledger Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            Approved Expense Vouchers & Pay-outs
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {expenses.length} Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Date / Ref</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Beneficiary / Vendor</th>
                <th className="p-3.5">Payment Tender</th>
                <th className="p-3.5">Amount (KES)</th>
                <th className="p-3.5">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-white">{exp.date}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{exp.receiptRef}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-200 font-medium">{exp.description}</td>
                  <td className="p-3.5 text-slate-300">{exp.paidTo}</td>
                  <td className="p-3.5 capitalize font-mono text-slate-400">{exp.paymentMethod}</td>
                  <td className="p-3.5 font-mono font-bold text-rose-400">
                    KES {exp.amount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-slate-400">{exp.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleExpenseSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Record Business Expense Voucher
              </h3>
              <button
                type="button"
                onClick={() => setExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Expense Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Liquor & Stock">Liquor & Stock</option>
                    <option value="Meat & Butchery Supply">Meat & Butchery Supply</option>
                    <option value="Staff Salaries & Wages">Staff Wages</option>
                    <option value="DJ & Entertainment">DJ & Entertainment</option>
                    <option value="Diesel & Generator">Diesel & Generator</option>
                    <option value="Security & Bouncers">Security & Bouncers</option>
                    <option value="Licenses & Permits">Licenses & Permits</option>
                    <option value="Utilities & Electricity">Utilities & Water</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px]">Payment Source</label>
                  <select
                    value={expensePayMethod}
                    onChange={(e) => setExpensePayMethod(e.target.value as any)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="mpesa">Company M-Pesa</option>
                    <option value="cash">Petty Cash / Till</option>
                    <option value="bank_transfer">Bank Wire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Amount (KES)</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-400 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Beneficiary / Supplier Name</label>
                <input
                  type="text"
                  value={expenseVendor}
                  onChange={(e) => setExpenseVendor(e.target.value)}
                  placeholder="e.g. Kenya Power, Total Energies, DJ Kalonje"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Purpose / Detailed Description</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g. 150 Liters Low Sulfur Diesel for backup generator"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExpenseModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Authorize & Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cash Drop Modal */}
      {cashDropModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCashDropSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                Drop Cash into Manager's Vault Safe
              </h3>
              <button
                type="button"
                onClick={() => setCashDropModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-400 text-[11px]">
                Reduces cash held at the till counter for security. Safe drops require two staff witness signatures.
              </p>
              <div>
                <label className="text-slate-400 text-[10px]">Drop Amount (KES)</label>
                <input
                  type="number"
                  required
                  value={dropAmount}
                  onChange={(e) => setDropAmount(Number(e.target.value))}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCashDropModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Confirm Safe Drop
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reconcile Close Modal */}
      {reconcileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleReconcileSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                Physical Count Shift Reconciliation
              </h3>
              <button
                type="button"
                onClick={() => setReconcileModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Calculated Expected Cash:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    KES {expectedCashInDrawer.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Actual Physical Cash Counted (KES)</label>
                <input
                  type="number"
                  required
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(Number(e.target.value))}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold text-xs"
                />
              </div>

              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-400">Variance:</span>
                <span
                  className={`font-mono font-bold ${
                    actualCashCount - expectedCashInDrawer === 0
                      ? 'text-emerald-400'
                      : actualCashCount - expectedCashInDrawer > 0
                      ? 'text-cyan-400'
                      : 'text-rose-400'
                  }`}
                >
                  KES {(actualCashCount - expectedCashInDrawer).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReconcileModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Submit & Close Shift
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
