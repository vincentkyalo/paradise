import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DepartmentKey, PaymentMethod } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wine,
  Sparkles,
  BedDouble,
  Beef,
  UtensilsCrossed,
  Receipt,
  CreditCard,
  Smartphone,
  Users,
  AlertTriangle,
  Award,
  Wallet,
  Target,
  Filter,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Download,
  CheckCircle2
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const {
    orders,
    expenses,
    rooms,
    products,
    customers,
    tables,
    drawerShift,
    users,
    setCurrentView
  } = useApp();

  // Filter States
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStaff, setSelectedStaff] = useState<string>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [activeChartTab, setActiveChartTab] = useState<'sales_trend' | 'department' | 'payments' | 'expenses'>('sales_trend');

  // Daily target configuration
  const dailyTarget = 250000; // KES 250,000

  // Filtered orders computation
  const completedOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status !== 'completed') return false;
      if (selectedDept !== 'ALL' && o.department !== selectedDept) return false;
      if (selectedStaff !== 'ALL' && o.cashierId !== selectedStaff && o.waiterId !== selectedStaff) return false;
      if (selectedPaymentMethod !== 'ALL' && o.paymentMethod !== selectedPaymentMethod) return false;
      return true;
    });
  }, [orders, selectedDept, selectedStaff, selectedPaymentMethod]);

  // Aggregate metrics
  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);

  const clubSales = completedOrders
    .filter((o) => o.department === 'BAR_CLUB' && (o.orderType === 'club_table' || o.items.some((i) => i.category === 'Spirits' || i.category === 'Wines')))
    .reduce((sum, o) => sum + o.total, 0);

  const barSales = completedOrders
    .filter((o) => o.department === 'BAR_CLUB' && o.orderType !== 'club_table')
    .reduce((sum, o) => sum + o.total, 0);

  const restaurantSales = completedOrders
    .filter((o) => o.department === 'RESTAURANT' || o.items.some((i) => i.department === 'RESTAURANT'))
    .reduce((sum, o) => sum + o.total, 0);

  const hotelSales = completedOrders
    .filter((o) => o.department === 'HOTEL_ROOMS')
    .reduce((sum, o) => sum + o.total, 0) +
    rooms.reduce((sum, r) => sum + r.paidAmount, 0);

  const butcherySales = completedOrders
    .filter((o) => o.department === 'BUTCHERY' || o.items.some((i) => i.department === 'BUTCHERY'))
    .reduce((sum, o) => sum + o.total, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netRevenue = totalSales + hotelSales - totalExpenses;

  // Payment Breakdown
  const cashSales = completedOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  const cardSales = completedOrders
    .filter((o) => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.total, 0);

  const mpesaSales = completedOrders
    .filter((o) => o.paymentMethod === 'mpesa' || o.paymentMethod === 'mobile_money')
    .reduce((sum, o) => sum + o.total, 0);

  const creditSales = completedOrders
    .filter((o) => o.paymentMethod === 'credit_account')
    .reduce((sum, o) => sum + o.total, 0);

  // Operational metrics
  const uniqueCustomers = new Set(completedOrders.map((o) => o.customerId || o.customerName || o.id)).size;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const pendingCheckoutRooms = rooms.filter((r) => r.status === 'checkout_pending').length;
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockLevel);

  // Best selling products
  const productSalesMap = useMemo(() => {
    const map: Record<string, { name: string; category: string; count: number; revenue: number }> = {};
    for (const order of completedOrders) {
      for (const item of order.items) {
        if (!map[item.name]) {
          map[item.name] = { name: item.name, category: item.category, count: 0, revenue: 0 };
        }
        map[item.name].count += item.quantity;
        map[item.name].revenue += item.unitPrice * item.quantity;
      }
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [completedOrders]);

  // Top performing staff
  const staffPerformance = useMemo(() => {
    const map: Record<string, { name: string; role: string; ordersCount: number; totalSold: number }> = {};
    for (const order of completedOrders) {
      const staffKey = order.waiterName || order.cashierName || 'Staff';
      if (!map[staffKey]) {
        map[staffKey] = { name: staffKey, role: order.waiterName ? 'Waiter' : 'Cashier', ordersCount: 0, totalSold: 0 };
      }
      map[staffKey].ordersCount += 1;
      map[staffKey].totalSold += order.total;
    }
    return Object.values(map).sort((a, b) => b.totalSold - a.totalSold).slice(0, 4);
  }, [completedOrders]);

  const targetProgressPercent = Math.min(100, Math.round((totalSales / dailyTarget) * 100));

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner: Filter Controls & Executive Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-tight">Executive Performance Hub</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidated cross-department hospitality ledger, room folios, bar registers, butchery metrics & profit trends.
          </p>
        </div>

        {/* Global Multi-Dimension Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
            {(['today', 'yesterday', 'week', 'month'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                  timeFilter === t
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Departments</option>
            <option value="BAR_CLUB">Bar & Club</option>
            <option value="HOTEL_ROOMS">Hotel & Rooms</option>
            <option value="BUTCHERY">Butchery Counter</option>
            <option value="RESTAURANT">Restaurant & Kitchen</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="mpesa">M-Pesa</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="credit_account">Credit Tab</option>
            <option value="room_folio">Room Folio</option>
          </select>
        </div>
      </div>

      {/* Target vs Actual Progress Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Daily Sales Target Pace
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-extrabold text-white font-mono">
                  KES {totalSales.toLocaleString()}
                </span>
                <span className="text-sm text-slate-400">
                  of KES {dailyTarget.toLocaleString()} Target
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {targetProgressPercent}%
              </span>
              <p className="text-xs text-slate-400">Target Achieved</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${targetProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-2">
              <span>KES 0 (Shift Start)</span>
              <span>Pacing: +14.2% vs yesterday this hour</span>
              <span>KES {dailyTarget.toLocaleString()} Goal</span>
            </div>
          </div>
        </div>

        {/* Current Cash Drawer Till Shift Quick Card */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                Current Cash Till
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Shift #1
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-white font-mono">
                KES {drawerShift.expectedClosing.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Opening Float: KES {drawerShift.openingBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Cashier: {drawerShift.cashierName}</span>
            <button
              onClick={() => setCurrentView('finance')}
              className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              Drawer Details →
            </button>
          </div>
        </div>
      </div>

      {/* Revenue by Department Grid (The 5 Pillars) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          Departmental Revenue Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Club Sales */}
          <div
            onClick={() => setCurrentView('club')}
            className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 hover:border-purple-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-purple-300 font-medium">Club & VIP Lounge</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                KES {clubSales.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">VIP Booths, Cover & Bottles</div>
            </div>
          </div>

          {/* Bar Sales */}
          <div
            onClick={() => setCurrentView('pos')}
            className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 hover:border-amber-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Wine className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-amber-300 font-medium">Main Bar Tills</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                KES {barSales.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Beers, Cocktails, Spirits</div>
            </div>
          </div>

          {/* Hotel & Rooms Revenue */}
          <div
            onClick={() => setCurrentView('hotel')}
            className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40 hover:border-blue-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <BedDouble className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-blue-300 font-medium">Hotel & Rooms</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                KES {hotelSales.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Suites & Folios</div>
            </div>
          </div>

          {/* Butchery Counter Sales */}
          <div
            onClick={() => setCurrentView('butchery')}
            className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 hover:border-rose-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Beef className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition" />
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-rose-300 font-medium">Butchery Counter</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                KES {butcherySales.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Meat Cuts & Raw Takeaway</div>
            </div>
          </div>

          {/* Restaurant Sales */}
          <div
            onClick={() => setCurrentView('restaurant_kds')}
            className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 hover:border-emerald-500/50 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-emerald-300 font-medium">Restaurant & Kitchen</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">
                KES {restaurantSales.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Platters, Choma & Sides</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial P&L & Payment Channels Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Expenses */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-rose-400 font-medium">Total Expenses</div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            KES {totalExpenses.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">6 Vouchers Approved</div>
        </div>

        {/* Net Revenue */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-emerald-400 font-medium">Net Operating Revenue</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            KES {netRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Sales minus Expenses</div>
        </div>

        {/* Cash Sales */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Cash Sales
          </div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            KES {cashSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Tendered at tills</div>
        </div>

        {/* Card Sales */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Card Payments
          </div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            KES {cardSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Visa / Mastercard</div>
        </div>

        {/* Mobile Money / M-Pesa */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> Mobile / M-Pesa
          </div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            KES {mpesaSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Till & Paybill Direct</div>
        </div>

        {/* Credit / Tabs Sales */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <Receipt className="w-3 h-3" /> Credit & Tabs
          </div>
          <div className="text-lg font-bold text-white font-mono mt-0.5">
            KES {creditSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">VIP Tabs pending</div>
        </div>
      </div>

      {/* Main Charts & Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Charts Section (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Performance Analytics & Trend Visualizer
              </h3>
              <p className="text-xs text-slate-400">
                Visualize revenue velocity, payment channel distribution, and departmental contribution.
              </p>
            </div>

            {/* Chart Tab Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveChartTab('sales_trend')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeChartTab === 'sales_trend' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hourly Curve
              </button>
              <button
                onClick={() => setActiveChartTab('department')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeChartTab === 'department' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Departments
              </button>
              <button
                onClick={() => setActiveChartTab('payments')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeChartTab === 'payments' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Payment Share
              </button>
              <button
                onClick={() => setActiveChartTab('expenses')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeChartTab === 'expenses' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Profit vs Expense
              </button>
            </div>
          </div>

          {/* Render Active Chart View */}
          <div className="h-64 flex flex-col justify-end pt-4">
            {activeChartTab === 'sales_trend' && (
              <div className="w-full h-full flex flex-col justify-between">
                {/* Simulated SVG Wave Trend */}
                <div className="relative flex-1 flex items-end">
                  <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,110 C50,100 80,95 120,70 C160,50 200,85 250,40 C300,10 350,60 400,20 C450,-5 480,15 500,5 L500,120 L0,120 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M0,110 C50,100 80,95 120,70 C160,50 200,85 250,40 C300,10 350,60 400,20 C450,-5 480,15 500,5"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>08:00 AM</span>
                  <span>10:00 AM</span>
                  <span>12:00 PM (Lunch)</span>
                  <span>02:00 PM</span>
                  <span>04:00 PM</span>
                  <span>06:00 PM (Happy Hour)</span>
                  <span>08:00 PM</span>
                  <span>10:00 PM (Club Peak)</span>
                  <span>12:00 AM</span>
                </div>
              </div>
            )}

            {activeChartTab === 'department' && (
              <div className="space-y-3">
                {[
                  { label: 'Bar & Club Lounge', amount: clubSales + barSales, color: 'bg-purple-500', max: 80000 },
                  { label: 'Hotel & Rooms', amount: hotelSales, color: 'bg-blue-500', max: 80000 },
                  { label: 'Butchery & Fresh Meat', amount: butcherySales, color: 'bg-rose-500', max: 80000 },
                  { label: 'Restaurant & Kitchen', amount: restaurantSales, color: 'bg-emerald-500', max: 80000 },
                ].map((dep) => {
                  const pct = Math.min(100, Math.round((dep.amount / 80000) * 100));
                  return (
                    <div key={dep.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{dep.label}</span>
                        <span className="text-white font-mono font-bold">KES {dep.amount.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full ${dep.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeChartTab === 'payments' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                {[
                  { method: 'M-Pesa / Mobile', amount: mpesaSales, color: 'border-emerald-500 text-emerald-400 bg-emerald-950/20' },
                  { method: 'Card (Visa/MC)', amount: cardSales, color: 'border-indigo-500 text-indigo-400 bg-indigo-950/20' },
                  { method: 'Cash Drawer', amount: cashSales, color: 'border-cyan-500 text-cyan-400 bg-cyan-950/20' },
                  { method: 'VIP Credit Tab', amount: creditSales, color: 'border-amber-500 text-amber-400 bg-amber-950/20' },
                ].map((p) => (
                  <div key={p.method} className={`p-4 rounded-xl border ${p.color} text-center`}>
                    <div className="text-xs font-semibold">{p.method}</div>
                    <div className="text-base font-bold font-mono mt-1">KES {p.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {totalSales > 0 ? Math.round((p.amount / totalSales) * 100) : 0}% of Total
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeChartTab === 'expenses' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400">Gross Sales Inflow</span>
                    <div className="text-base font-bold text-emerald-400 font-mono">KES {totalSales.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Operating Outflow</span>
                    <div className="text-base font-bold text-rose-400 font-mono">- KES {totalExpenses.toLocaleString()}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Net Retained Profit</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    KES {netRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Operational Status & Occupancy Card (1 Column) */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-blue-400" />
              Accommodations & Occupancy
            </h3>
            <button
              onClick={() => setCurrentView('hotel')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              Room Matrix →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40">
              <div className="text-xl font-black text-blue-400 font-mono">{occupiedRooms}</div>
              <div className="text-[11px] text-slate-400">Occupied</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
              <div className="text-xl font-black text-emerald-400 font-mono">{availableRooms}</div>
              <div className="text-[11px] text-slate-400">Available</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
              <div className="text-xl font-black text-amber-400 font-mono">{pendingCheckoutRooms}</div>
              <div className="text-[11px] text-slate-400">Checkouts</div>
            </div>
          </div>

          {/* Quick Room Snapshot List */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-300">Live Checked-In VIP Guests</div>
            {rooms
              .filter((r) => r.status === 'occupied' && r.currentGuest)
              .map((room) => (
                <div
                  key={room.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">Room {room.number}</span>
                    <span className="text-slate-400 ml-1.5 font-normal truncate">
                      {room.currentGuest?.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 font-bold">
                      KES {room.paidAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Operational Highlights: Low Stock Alert + Top Selling Products + Star Staff */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low Stock Warning Box */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Inventory Reorder Warnings
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {lowStockProducts.length} Needs Attention
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Items at or below safety stock threshold requiring cellar restock.
            </p>

            <div className="mt-4 space-y-2">
              {lowStockProducts.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.category}</div>
                  </div>
                  <div className="text-right ml-3">
                    <span className="font-mono font-bold text-rose-400">
                      {p.stock} {p.unit}s left
                    </span>
                    <div className="text-[10px] text-slate-500">Min: {p.minStockLevel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentView('inventory')}
            className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            Manage Cellar & Purchase Orders →
          </button>
        </div>

        {/* Best Selling Products */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Best-Selling Items
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">By Gross Value</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Top revenue drivers across bar, grill & kitchen.</p>

          <div className="mt-4 space-y-2">
            {productSalesMap.map((item, idx) => (
              <div
                key={item.name}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <div className="font-medium text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.count} units sold</div>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-amber-400 ml-2">
                  KES {item.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Staff Leaderboard */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Top Staff Performance
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Shift Tally</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Individual sales volume and ticket turn rates.</p>

          <div className="mt-4 space-y-2">
            {staffPerformance.map((staff, idx) => (
              <div
                key={staff.name}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-medium text-white">{staff.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {staff.role} • {staff.ordersCount} tickets
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-emerald-400">
                  KES {staff.totalSold.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
