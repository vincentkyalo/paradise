import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, DepartmentKey } from '../../types';
import {
  Users,
  Award,
  Clock,
  Plus,
  Search,
  CheckCircle,
  Percent,
  Calendar,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const { users, orders, addUser, currentUser, hasPermission, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);

  // New staff form state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('+254 7');
  const [staffRole, setStaffRole] = useState<UserRole>('waiter_server');
  const [staffDept, setStaffDept] = useState<DepartmentKey>('BAR_CLUB');
  const [staffCommission, setStaffCommission] = useState<number>(5.0);

  // Calculate sales generated per server
  const serverSalesMap = orders
    .filter((o) => o.status === 'completed')
    .reduce((acc, o) => {
      const waiter = o.waiterName || o.cashierName;
      acc[waiter] = (acc[waiter] || 0) + o.total;
      return acc;
    }, {} as Record<string, number>);

  const filteredUsers = users.filter((u) => {
    if (selectedDept !== 'ALL' && u.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.phone.includes(q);
    }
    return true;
  });

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    addUser({
      name: staffName,
      email: staffEmail || `${staffName.toLowerCase().replace(/\s+/g, '.')}@hospitality.co.ke`,
      role: staffRole,
      department: staffDept,
      phone: staffPhone,
      active: true,
      commissionRate: staffCommission,
      currentShift: 'Evening Shift (18:00 - 04:00)',
    });

    setAddStaffModalOpen(false);
    setStaffName('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Employee Management, Shifts & Commissions
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
              Roster & Performance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Staff shifts, role-based departmental allocations, bottle sales commissions, and server leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('manage_employees') && (
            <button
              onClick={() => setAddStaffModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Performance Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(serverSalesMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, sales], idx) => (
            <div
              key={name}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    idx === 0
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-950'
                      : 'bg-amber-700 text-white'
                  }`}
                >
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{name}</h4>
                  <div className="text-[10px] text-slate-400">
                    Est. Commission: <strong className="text-emerald-400 font-mono">KES {Math.round(sales * 0.05).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400">Total Billed</span>
                <div className="text-sm font-black font-mono text-cyan-400">
                  KES {sales.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Filter & Search Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, role or phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-xs"
        >
          <option value="ALL">All Departments</option>
          <option value="BAR_CLUB">Bar & Club</option>
          <option value="HOTEL_ROOMS">Hotel & Rooms</option>
          <option value="BUTCHERY">Butchery</option>
          <option value="RESTAURANT">Restaurant</option>
          <option value="SECURITY_CCTV">Security & CCTV</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Active Shift</th>
                <th className="p-3.5">Commission Rate</th>
                <th className="p-3.5">Today's Sales</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((user) => {
                const sales = serverSalesMap[user.name] || 0;
                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{user.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{user.department}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">{user.currentShift}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      {user.commissionRate ? `${user.commissionRate}%` : 'N/A'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      KES {sales.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                        On Duty
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {addStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaffSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Enroll Staff & Assign Role
              </h3>
              <button
                type="button"
                onClick={() => setAddStaffModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 text-[10px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Dennis Omondi"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Email Address</label>
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="dennis@club.co.ke"
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Hospitality Role</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="waiter_server">Waiter / Server</option>
                    <option value="cashier">Cashier</option>
                    <option value="receptionist">Hotel Receptionist</option>
                    <option value="club_bar_manager">Club/Bar Manager</option>
                    <option value="butchery_manager">Butchery Manager</option>
                    <option value="hotel_manager">Hotel Manager</option>
                    <option value="security_officer">Security Officer</option>
                    <option value="cctv_operator">CCTV Operator</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Department</label>
                  <select
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value as any)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="BAR_CLUB">Bar & VIP Club</option>
                    <option value="HOTEL_ROOMS">Hotel Accommodations</option>
                    <option value="BUTCHERY">Butchery & Grill</option>
                    <option value="RESTAURANT">Restaurant Dining</option>
                    <option value="SECURITY_CCTV">Security & Surveillance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Bottle Sales Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={staffCommission}
                  onChange={(e) => setStaffCommission(Number(e.target.value))}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddStaffModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Save Staff Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
