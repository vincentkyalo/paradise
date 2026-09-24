import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerVIPTier } from '../../types';
import {
  Users,
  Crown,
  CreditCard,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  Car,
  DollarSign,
  Gift,
  CheckCircle2,
  Calendar,
  History
} from 'lucide-react';

export const CustomerCRM: React.FC = () => {
  const {
    customers,
    addCustomer,
    settleCustomerTab,
    orders,
    currentUser,
    hasPermission,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [settleTabModalOpen, setSettleTabModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState<number>(5000);

  // Add customer form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('+254 7');
  const [custEmail, setCustEmail] = useState('');
  const [custTier, setCustTier] = useState<CustomerVIPTier>('VIP_GOLD');
  const [custCreditLimit, setCustCreditLimit] = useState<number>(50000);
  const [custCarPlate, setCustCarPlate] = useState('');
  const [custPrefDrinks, setCustPrefDrinks] = useState('Johnnie Walker Black, Tusker');

  const filteredCustomers = customers.filter((c) => {
    if (selectedTier !== 'ALL' && c.vipTier !== selectedTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.carPlate && c.carPlate.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getTierBadge = (tier: CustomerVIPTier) => {
    switch (tier) {
      case 'REGULAR':
      case 'Regular':
        return { label: 'Regular', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'SILVER':
        return { label: 'Silver Patron', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
      case 'VIP_GOLD':
      case 'Gold':
        return { label: 'Gold VIP', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'PLATINUM_VVIP':
      case 'Platinum':
      case 'Diamond':
        return { label: 'Platinum VVIP', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { label: 'Regular', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    addCustomer({
      name: custName,
      phone: custPhone,
      email: custEmail || '',
      vipTier: custTier,
      creditLimit: custCreditLimit,
      outstandingTab: 0,
      loyaltyPoints: 100,
      carPlate: custCarPlate || '',
      preferredDrinks: custPrefDrinks.split(',').map((s) => s.trim()),
    });

    setAddCustomerModalOpen(false);
    setCustName('');
  };

  const handleSettleTabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || settleAmount <= 0) return;

    settleCustomerTab(selectedCustomer.id, settleAmount);
    setSettleTabModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              VIP Customer CRM, Credit Tabs & Loyalty
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Patron Retention
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            VIP bottle service preferences, house account credit limits, tab settlements, and loyalty points tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddCustomerModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add VIP Patron</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Customer Directory + Patron Detail Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Customer Directory (2 Cols) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Search & Filter Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patrons by name, phone or vehicle plate..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['ALL', 'PLATINUM_VVIP', 'VIP_GOLD', 'SILVER', 'REGULAR'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition cursor-pointer ${
                    selectedTier === tier
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {tier.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCustomers.map((cust) => {
              const tierBadge = getTierBadge(cust.vipTier);
              const isSelected = selectedCustomer?.id === cust.id;
              const isTabHigh = cust.outstandingTab > cust.creditLimit * 0.7;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-xs">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{cust.name}</h4>
                          <div className="text-[10px] text-slate-400 font-mono">{cust.phone}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${tierBadge.bg}`}>
                        {tierBadge.label}
                      </span>
                    </div>

                    {/* Credit Limit & Tab Progress Bar */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">House Tab Balance:</span>
                        <span className={`font-mono font-bold ${cust.outstandingTab > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          KES {cust.outstandingTab.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Limit: KES {cust.creditLimit.toLocaleString()}</span>
                        <span>
                          Available: KES {Math.max(0, cust.creditLimit - cust.outstandingTab).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isTabHigh ? 'bg-rose-500' : 'bg-amber-400'}`}
                          style={{
                            width: `${Math.min(100, (cust.outstandingTab / cust.creditLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats: Points & Vehicle */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                      <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                      {cust.loyaltyPoints} Points
                    </span>
                    {cust.carPlate && (
                      <span className="font-mono bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                        {cust.carPlate}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Patron Dossier (1 Col) */}
        <div className="space-y-4">
          {selectedCustomer ? (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedCustomer.name}</h3>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {selectedCustomer.vipTier.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Contact Data */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono">{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.carPlate && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Car className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{selectedCustomer.carPlate}</span>
                  </div>
                )}
              </div>

              {/* Preferred Drinks / Dishes */}
              {selectedCustomer.preferredDrinks && selectedCustomer.preferredDrinks.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Favorite Orders & Bottle Service
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCustomer.preferredDrinks.map((pref, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 text-[11px]"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credit Tab Settlement Action */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Current Tab Due:</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    KES {selectedCustomer.outstandingTab.toLocaleString()}
                  </span>
                </div>

                {selectedCustomer.outstandingTab > 0 ? (
                  <button
                    onClick={() => {
                      setSettleAmount(selectedCustomer.outstandingTab);
                      setSettleTabModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settle / Pay Off Tab</span>
                  </button>
                ) : (
                  <div className="text-center py-2 text-[11px] text-emerald-400 bg-emerald-950/20 rounded-lg border border-emerald-900/30">
                    Account is fully paid & in good standing
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
              <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-300">No Patron Selected</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Select any guest profile to view credit limits, outstanding tabs, and favorite drinks.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settle Tab Modal */}
      {settleTabModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSettleTabSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Settle Tab: {selectedCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setSettleTabModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px]">Total Balance Due</span>
                <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                  KES {selectedCustomer.outstandingTab.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Amount Paying Now (KES)</label>
                <input
                  type="number"
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettleTabModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Customer Modal */}
      {addCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomer}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Enroll VIP Patron
              </h3>
              <button
                type="button"
                onClick={() => setAddCustomerModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 text-[10px]">Full Name / Title</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Hon. Moses Kuria"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Vehicle Registration</label>
                  <input
                    type="text"
                    value={custCarPlate}
                    onChange={(e) => setCustCarPlate(e.target.value)}
                    placeholder="KDD 888Z"
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">VIP Tier</label>
                  <select
                    value={custTier}
                    onChange={(e) => setCustTier(e.target.value as any)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="SILVER">Silver Patron</option>
                    <option value="VIP_GOLD">Gold VIP</option>
                    <option value="PLATINUM_VVIP">Platinum VVIP</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Approved Credit Limit (KES)</label>
                  <input
                    type="number"
                    value={custCreditLimit}
                    onChange={(e) => setCustCreditLimit(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Favorite Drinks / Meat Cuts</label>
                <input
                  type="text"
                  value={custPrefDrinks}
                  onChange={(e) => setCustPrefDrinks(e.target.value)}
                  placeholder="Glenfiddich 18, Mbuzi Choma, Tusker Malt"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddCustomerModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Save VIP Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
