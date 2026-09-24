import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Table, TableStatus, ClubEvent, SecurityIncident } from '../../types';
import {
  Sparkles,
  Users,
  DollarSign,
  Wine,
  Calendar,
  ShieldAlert,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Ticket,
  Eye,
  Filter
} from 'lucide-react';

export const ClubManagement: React.FC = () => {
  const {
    tables,
    updateTableStatus,
    assignTableWaiter,
    updateTableDetails,
    users,
    events,
    sellEventTicket,
    incidents,
    reportIncident,
    orders,
    customers,
    currentUser,
    setCurrentView,
    showToast
  } = useApp();

  const [activeSection, setActiveSection] = useState<string>('All');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reserveName, setReserveName] = useState('');
  const [reserveTime, setReserveTime] = useState('21:00');
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<SecurityIncident['severity']>('medium');

  const sections = ['All', 'VIP Lounge', 'Main Dance Floor', 'Garden Patio', 'Sports Bar', 'Executive Booth'];

  const filteredTables = tables.filter((t) =>
    activeSection === 'All' ? true : t.section === activeSection
  );

  // Status badge style helper
  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Available', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'occupied':
        return { label: 'Occupied', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'reserved':
        return { label: 'Reserved', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'waiting_payment':
        return { label: 'Waiting Pay', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'closed':
        return { label: 'Closed', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  // Compute table and waiter metrics
  const totalClubSales = orders
    .filter((o) => o.department === 'BAR_CLUB' && o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const activeVipSpend = tables
    .filter((t) => t.section === 'VIP Lounge')
    .reduce((sum, t) => sum + (t.totalSpend || 0), 0);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !reserveName.trim()) return;

    updateTableDetails(selectedTable.id, {
      status: 'reserved',
      reservedFor: reserveName,
      reservationTime: reserveTime,
    });
    setReservationModalOpen(false);
    setReserveName('');
    showToast(`Table ${selectedTable.number} reserved for ${reserveName}`, 'success');
  };

  const handleLogIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc.trim()) return;

    reportIncident({
      location: selectedTable ? `${selectedTable.number} (${selectedTable.section})` : 'Club Main Floor',
      severity: incidentSeverity,
      reportedBy: `${currentUser.name} (${currentUser.role})`,
      description: incidentDesc,
      tableId: selectedTable?.id,
    });

    setIncidentModalOpen(false);
    setIncidentDesc('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner & KPI Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Club Management & Visual Floor Map
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              VIP Bottle Service & Floor Ops
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time table occupancy, minimum spend enforcement, VIP guest tabs, door tickets, and floor server tracking.
          </p>
        </div>

        {/* Top Summary Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Total Club Sales:</span>
            <div className="text-base font-bold font-mono text-purple-400">
              KES {totalClubSales.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">VIP Lounge Total:</span>
            <div className="text-base font-bold font-mono text-amber-400">
              KES {activeVipSpend.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => setIncidentModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-600/40 text-rose-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Main Floor Visual Layout + Section Filter */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Visual Table Grid (2 Columns) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            {/* Section Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition cursor-pointer ${
                    activeSection === sec
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Occupied
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Reserved
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> Wait Pay
              </span>
            </div>
          </div>

          {/* Interactive Table Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTables.map((table) => {
              const statusStyle = getStatusBadge(table.status);
              const isSelected = selectedTable?.id === table.id;
              const isUnderMinSpend =
                table.status === 'occupied' &&
                table.minSpend > 0 &&
                (table.totalSpend || 0) < table.minSpend;

              return (
                <div
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white font-mono flex items-center gap-1">
                        {table.number}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusStyle.bg}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-xs font-semibold text-slate-200">{table.name}</div>
                      <div className="text-[11px] text-slate-400">{table.section} • Capacity {table.capacity}</div>
                    </div>

                    {/* Minimum Spend Alert & Progress */}
                    {table.minSpend > 0 && (
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Min Spend:</span>
                          <span className="font-mono text-amber-400 font-bold">
                            KES {table.minSpend.toLocaleString()}
                          </span>
                        </div>
                        {table.status === 'occupied' && (
                          <div className="mt-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Current: KES {(table.totalSpend || 0).toLocaleString()}</span>
                              <span className={isUnderMinSpend ? 'text-amber-400' : 'text-emerald-400'}>
                                {isUnderMinSpend ? 'Short by KES ' + (table.minSpend - (table.totalSpend || 0)).toLocaleString() : 'Target Met'}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full ${isUnderMinSpend ? 'bg-amber-500' : 'bg-emerald-400'}`}
                                style={{
                                  width: `${Math.min(100, Math.round(((table.totalSpend || 0) / table.minSpend) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {table.reservedFor && (
                      <div className="mt-2 text-[10px] p-1.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-300">
                        Reserved for: <strong>{table.reservedFor}</strong> @ {table.reservationTime}
                      </div>
                    )}
                  </div>

                  {/* Table Footer: Server & Bottle Count */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Server: <strong className="text-slate-300">{table.currentWaiterName || 'Unassigned'}</strong>
                    </span>
                    {(table.bottleServiceCount || 0) > 0 && (
                      <span className="flex items-center gap-1 text-purple-400 font-bold">
                        <Wine className="w-3 h-3" /> {table.bottleServiceCount} Bottles
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Selected Table Controls & Club Events/Tickets */}
        <div className="space-y-6">
          {/* Selected Table Inspector */}
          {selectedTable ? (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Table {selectedTable.number} Controls</span>
                  </h3>
                  <p className="text-xs text-slate-400">{selectedTable.name}</p>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Status Change Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Update Table Status
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(['available', 'occupied', 'waiting_payment', 'closed'] as TableStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateTableStatus(selectedTable.id, st);
                        setSelectedTable({ ...selectedTable, status: st });
                      }}
                      className={`p-2 rounded-xl capitalize font-semibold transition cursor-pointer ${
                        selectedTable.status === st
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign Waiter */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Assign Waiter / Server
                </label>
                <select
                  value={selectedTable.currentWaiterId || ''}
                  onChange={(e) => {
                    const server = users.find((u) => u.id === e.target.value);
                    if (server) {
                      assignTableWaiter(selectedTable.id, server.id, server.name);
                      setSelectedTable({
                        ...selectedTable,
                        currentWaiterId: server.id,
                        currentWaiterName: server.name,
                      });
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                >
                  <option value="">-- Select Dedicated Server --</option>
                  {users
                    .filter((u) => u.role === 'waiter_server' || u.role === 'club_bar_manager')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.phone})
                      </option>
                    ))}
                </select>
              </div>

              {/* Action Buttons: Reserve / Fast Order */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setReservationModalOpen(true)}
                  className="flex-1 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                >
                  Book Reservation
                </button>
                <button
                  onClick={() => setCurrentView('pos')}
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  Open in POS →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
              <Wine className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-300">No Table Selected</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Select any table on the visual map to assign servers, verify minimum spend, or book reservations.
              </p>
            </div>
          )}

          {/* Club Events & Entry Ticketing at the Door */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                Club Events & Door Cover Charges
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                Gate Entry
              </span>
            </div>

            <div className="space-y-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white">{evt.title}</div>
                      <div className="text-[10px] text-purple-300">{evt.theme}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {evt.date} • {evt.djLineup}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {evt.ticketsSold}/{evt.capacity} Pax
                    </span>
                  </div>

                  {/* Sell Ticket Fast Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => sellEventTicket(evt.id, false)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                    >
                      General Entry (KES {evt.entryFee.toLocaleString()})
                    </button>
                    <button
                      onClick={() => sellEventTicket(evt.id, true)}
                      className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition cursor-pointer"
                    >
                      VIP Pass (KES {evt.vipTicketPrice.toLocaleString()})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Booking Modal */}
      {reservationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleReserveSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Reserve Table {selectedTable?.number}
              </h3>
              <button
                type="button"
                onClick={() => setReservationModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px]">VIP Guest / Host Name</label>
                <input
                  type="text"
                  required
                  value={reserveName}
                  onChange={(e) => setReserveName(e.target.value)}
                  placeholder="e.g. Sen. Otieno Party (8 Pax)"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Reservation Arrival Time</label>
                <input
                  type="time"
                  value={reserveTime}
                  onChange={(e) => setReserveTime(e.target.value)}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReservationModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Save Reservation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Incident Modal */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleLogIncident}
            className="bg-slate-900 border border-rose-800/60 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Log Security Incident
              </h3>
              <button
                type="button"
                onClick={() => setIncidentModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px]">Incident Severity</label>
                <select
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="low">Low (Noise / Misunderstanding)</option>
                  <option value="medium">Medium (Unauthorized Entry / Verbal)</option>
                  <option value="high">High (Physical altercation / Broken Glass)</option>
                  <option value="critical">Critical (Weapons / Police Escort)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Description & Officers Involved</label>
                <textarea
                  rows={3}
                  required
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Describe details of the event and corrective actions taken..."
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIncidentModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Submit Incident
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
