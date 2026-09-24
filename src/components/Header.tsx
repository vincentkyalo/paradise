import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_DEFINITIONS } from '../data/mockData';
import { RoleKey } from '../types';
import {
  Shield,
  Clock,
  DollarSign,
  AlertTriangle,
  Camera,
  BedDouble,
  Store,
  ChevronDown,
  UserCheck,
  Bell,
  Search,
  Sparkles,
  Wine,
  Scale
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    products,
    rooms,
    cctvCameras,
    drawerShift,
    setCurrentView,
    orders,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Compute live quick stats
  const lowStockCount = products.filter((p) => p.stock <= p.minStockLevel).length;
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'occupied').length;
  const totalRoomsCount = rooms.length;
  const occupancyPercent = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);
  const motionAlertCount = cctvCameras.filter((c) => c.motionAlert).length;
  const todayTotalSales = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const roleInfo = ROLE_DEFINITIONS[currentUser.role];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Hospitality Business Management CRM
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Enterprise v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bar & Club • Hotel • Butchery • Restaurant • Security CCTV
            </p>
          </div>
        </div>

        {/* Live Quick Counters */}
        <div className="hidden xl:flex items-center gap-3 text-xs">
          {/* Today's Sales */}
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 cursor-pointer hover:border-amber-500/50 transition-colors"
            title="Today's Total Sales"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Today's Revenue:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              KES {todayTotalSales.toLocaleString()}
            </span>
          </div>

          {/* Hotel Occupancy */}
          <div
            onClick={() => setCurrentView('hotel')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 cursor-pointer hover:border-blue-500/50 transition-colors"
            title="Hotel Occupancy"
          >
            <BedDouble className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Occupancy:</span>
            <span className="font-semibold text-blue-400 font-mono">
              {occupancyPercent}% ({occupiedRoomsCount}/{totalRoomsCount})
            </span>
          </div>

          {/* Cash Drawer Shift Balance */}
          <div
            onClick={() => setCurrentView('finance')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 cursor-pointer hover:border-cyan-500/50 transition-colors"
            title="Current Cash Drawer Expected Closing"
          >
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Till Cash:</span>
            <span className="font-semibold text-cyan-400 font-mono">
              KES {drawerShift.expectedClosing.toLocaleString()}
            </span>
          </div>

          {/* Low Stock Alert */}
          {lowStockCount > 0 && (
            <div
              onClick={() => setCurrentView('inventory')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-400 cursor-pointer hover:bg-rose-900/40 transition-colors animate-pulse"
              title="Low stock items need reorder"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-semibold">{lowStockCount} Low Stock</span>
            </div>
          )}

          {/* Motion Alerts */}
          {motionAlertCount > 0 && (
            <div
              onClick={() => setCurrentView('cctv')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-500/50 text-amber-300 cursor-pointer hover:bg-amber-900/40 transition-colors"
              title="Surveillance Motion Detected"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{motionAlertCount} Cam Alert</span>
            </div>
          )}
        </div>

        {/* Right Actions & Multi-Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Fast Navigation Shortcut buttons */}
          <button
            onClick={() => setCurrentView('pos')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Wine className="w-3.5 h-3.5" />
            <span>Fast POS</span>
          </button>

          <button
            onClick={() => setCurrentView('butchery')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-rose-400" />
            <span>Butchery Scale</span>
          </button>

          {/* Quick 14-Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer text-left"
              title="Switch user role to test access permissions"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
              />
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {roleInfo.department}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-2 text-slate-200"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    Role-Based Access Control Switcher
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Switch between all 14 hospitality roles to test individual permissions and department views.
                  </p>
                </div>

                <div className="py-1 divide-y divide-slate-800/50">
                  {users.map((u) => {
                    const rDef = ROLE_DEFINITIONS[u.role];
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => switchUser(u.id)}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition text-left cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/30'
                            : 'hover:bg-slate-800/70'
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">
                              {u.name}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${rDef.color}`}>
                              {rDef.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                            <span>{rDef.department}</span>
                            <span className="text-[10px] text-slate-500 font-mono">PIN: {u.pin}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-800 text-center">
                  <button
                    onClick={() => setCurrentView('users')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    Configure Role Permissions Matrix →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
