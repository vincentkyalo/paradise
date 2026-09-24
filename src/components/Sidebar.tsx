import React from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import {
  LayoutDashboard,
  Wine,
  Sparkles,
  BedDouble,
  Beef,
  UtensilsCrossed,
  Boxes,
  Cctv,
  Users,
  ReceiptText,
  ShieldAlert,
  KeyRound,
  UserCheck,
  BarChart3,
  Settings,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  key: NavigationTab;
  label: string;
  department: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    canAccessView,
    tables,
    rooms,
    cctvCameras,
    products,
    incidents,
    orders
  } = useApp();

  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const motionAlerts = cctvCameras.filter((c) => c.motionAlert).length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStockLevel).length;
  const unresolvedIncidents = incidents.filter((i) => i.status === 'investigating').length;

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Executive Dashboard',
      department: 'Overview & Analytics',
      icon: LayoutDashboard,
    },
    {
      key: 'pos',
      label: 'Bar & Club POS',
      department: 'Point of Sale',
      icon: Wine,
      badge: `${orders.filter((o) => o.department === 'BAR_CLUB').length} Sales`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      key: 'club',
      label: 'Club & Floor Map',
      department: 'VIP, Tables & Events',
      icon: Sparkles,
      badge: `${occupiedTables} Active`,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      key: 'hotel',
      label: 'Hotel & Rooms',
      department: 'Rooms & Folios',
      icon: BedDouble,
      badge: `${occupiedRooms} Occ`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      key: 'butchery',
      label: 'Butchery Counter',
      department: 'Meat & Choma Grill',
      icon: Beef,
      badge: 'Live Scale',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      key: 'restaurant_kds',
      label: 'Restaurant & KDS',
      department: 'Kitchen Display System',
      icon: UtensilsCrossed,
    },
    {
      key: 'inventory',
      label: 'Inventory & Cellar',
      department: 'Stock & Transfers',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
    {
      key: 'cctv',
      label: 'CCTV Surveillance',
      department: '8 Live Feeds Matrix',
      icon: Cctv,
      badge: motionAlerts > 0 ? `${motionAlerts} Alert` : '8 Live',
      badgeColor: motionAlerts > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      key: 'crm',
      label: 'Customer CRM & Tabs',
      department: 'VIP Tiers & Loyalty',
      icon: Users,
    },
    {
      key: 'finance',
      label: 'Financials & Drawer',
      department: 'Expenses & X/Z Reports',
      icon: ReceiptText,
    },
    {
      key: 'employees',
      label: 'Staff & Commissions',
      department: 'Roster & Performance',
      icon: UserCheck,
    },
    {
      key: 'security',
      label: 'Security & Door Log',
      department: 'Live Headcount & Patrol',
      icon: ShieldAlert,
      badge: unresolvedIncidents > 0 ? `${unresolvedIncidents} New` : undefined,
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    },
    {
      key: 'reports',
      label: 'Reports & Analytics',
      department: 'Audit Trail & P&L',
      icon: BarChart3,
    },
    {
      key: 'settings',
      label: 'Settings & RBAC',
      department: '14 Role Permissions',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-61px)]">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Management Modules
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const hasAccess = canAccessView(item.key);
            const isActive = currentView === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-sm shadow-amber-500/5'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                } ${!hasAccess ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs truncate font-medium">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.department}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">System Core</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Online 99.9%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Database Sync</span>
            <span className="text-slate-300 font-mono">Local State OK</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Audit Logging</span>
            <span className="text-amber-400 font-medium">Strict Immutable</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
