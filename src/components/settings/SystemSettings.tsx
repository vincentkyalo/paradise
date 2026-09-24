import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, PermissionKey } from '../../types';
import {
  Settings,
  Shield,
  Printer,
  Building,
  Save,
  CheckCircle2,
  Database,
  RotateCcw,
  Sliders,
  Sparkles
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { rolePermissions, updateRolePermission, currentUser, hasPermission, showToast } = useApp();

  const [businessName, setBusinessName] = useState('THE HAVEN RESORT, CLUB & BUTCHERY');
  const [taxPin, setTaxPin] = useState('P051892014M');
  const [vatRate, setVatRate] = useState<number>(16);
  const [currency, setCurrency] = useState('KES');
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(10);
  const [thermalPaperSize, setThermalPaperSize] = useState<'80mm' | '58mm'>('80mm');
  const [autoPrintReceipt, setAutoPrintReceipt] = useState<boolean>(true);
  const [receiptFooter, setReceiptFooter] = useState('Thank you for patronizing The Haven! Powered by Hospitality CRM');

  const [selectedRoleToEdit, setSelectedRoleToEdit] = useState<UserRole>('cashier');

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Administrator' },
    { role: 'business_owner', label: 'Business Owner' },
    { role: 'general_manager', label: 'General Manager' },
    { role: 'club_bar_manager', label: 'Club/Bar Manager' },
    { role: 'hotel_manager', label: 'Hotel Manager' },
    { role: 'butchery_manager', label: 'Butchery Manager' },
    { role: 'cashier', label: 'Cashier' },
    { role: 'waiter_server', label: 'Waiter / Server' },
    { role: 'receptionist', label: 'Hotel Receptionist' },
    { role: 'accountant', label: 'Accountant' },
    { role: 'inventory_manager', label: 'Inventory Manager' },
    { role: 'security_officer', label: 'Security Officer' },
    { role: 'cctv_operator', label: 'CCTV Operator' },
    { role: 'auditor', label: 'Auditor' },
  ];

  const permissionKeys: { key: PermissionKey; label: string }[] = [
    { key: 'view_sales', label: 'View Sales' },
    { key: 'create_sales', label: 'Create Sales / Take Orders' },
    { key: 'edit_sales', label: 'Edit Sales / Apply Discounts' },
    { key: 'void_refund', label: 'Void / Refund Transactions' },
    { key: 'view_reports', label: 'View Business Reports' },
    { key: 'manage_inventory', label: 'Manage Inventory & Stock' },
    { key: 'manage_employees', label: 'Manage Staff & Commissions' },
    { key: 'manage_rooms', label: 'Manage Hotel Rooms & Folios' },
    { key: 'view_cctv', label: 'Access Live CCTV Feeds' },
    { key: 'export_data', label: 'Export Data (CSV / Ledgers)' },
    { key: 'manage_users', label: 'Manage Users & Permissions' },
    { key: 'manage_settings', label: 'Manage System Settings' },
    { key: 'access_financials', label: 'Access Financials & P&L' },
  ];

  const handleSaveBusinessProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Business credentials and receipt template updated successfully!', 'success');
  };

  const currentRolePerms = rolePermissions[selectedRoleToEdit] || [];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-300" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              System Settings & Granular Access Control
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              RBAC Configurator
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise role-based permissions matrix for 14 operational roles, fiscal VAT configuration, and thermal printers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Business & Fiscal Profile (1 Col) */}
        <div className="space-y-6">
          <form
            onSubmit={handleSaveBusinessProfile}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Building className="w-4 h-4" />
              Hospitality Enterprise Identity
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px]">Business Legal Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">KRA / Tax PIN</label>
                  <input
                    type="text"
                    value={taxPin}
                    onChange={(e) => setTaxPin(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Base Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">VAT Rate (%)</label>
                  <input
                    type="number"
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Service Charge (%)</label>
                  <input
                    type="number"
                    value={serviceChargeRate}
                    onChange={(e) => setServiceChargeRate(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Receipt Footer Message</label>
                <textarea
                  rows={2}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
            >
              <Save className="w-4 h-4" />
              <span>Save Enterprise Profile</span>
            </button>
          </form>

          {/* Thermal Printer Settings */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Printer className="w-4 h-4" />
              Thermal POS Hardware Options
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Thermal Receipt Paper Width</span>
                <div className="flex gap-1.5">
                  {(['80mm', '58mm'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setThermalPaperSize(sz)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold transition cursor-pointer ${
                        thermalPaperSize === sz
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300">Auto-Print Receipt Upon Payment</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPrintReceipt}
                    onChange={(e) => setAutoPrintReceipt(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Role Permissions Matrix Configurator (2 Cols) */}
        <div className="xl:col-span-2 bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Granular Role-Based Access Control (RBAC)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Toggle exact authorizations for each of the 14 hospitality roles.
              </p>
            </div>

            {/* Select Role Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Configuring Role:</span>
              <select
                value={selectedRoleToEdit}
                onChange={(e) => setSelectedRoleToEdit(e.target.value as UserRole)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-amber-300 font-bold text-xs"
              >
                {rolesList.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Permissions Checkbox Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {permissionKeys.map((perm) => {
              const isEnabled = currentRolePerms.includes(perm.key);
              const isSuperAdmin = selectedRoleToEdit === 'super_admin';

              return (
                <div
                  key={perm.key}
                  onClick={() => {
                    if (isSuperAdmin) {
                      showToast('Super Administrator retains all privileges by system design.', 'info');
                      return;
                    }
                    updateRolePermission(selectedRoleToEdit, perm.key, !isEnabled);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                    isEnabled
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-medium">{perm.label}</span>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                      isEnabled
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isEnabled && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>
              Configured: <strong>{currentRolePerms.length}</strong> of {permissionKeys.length} permissions granted to{' '}
              <strong className="text-amber-400">{rolesList.find((r) => r.role === selectedRoleToEdit)?.label}</strong>
            </span>
            <span className="text-emerald-400 font-semibold">Real-Time Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
