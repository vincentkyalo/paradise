import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Room, RoomStatus, GuestInfo, PaymentMethod } from '../../types';
import {
  BedDouble,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Calendar,
  CreditCard,
  Plus,
  Receipt,
  FileText,
  KeyRound,
  Trash2,
  Brush,
  AlertCircle
} from 'lucide-react';

export const HotelManagement: React.FC = () => {
  const {
    rooms,
    checkInRoom,
    checkOutRoom,
    addFolioCharge,
    updateRoomStatus,
    currentUser,
    showToast
  } = useApp();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Check-In Form State
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('+254 7');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestIdNum, setGuestIdNum] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-09-24');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-26');
  const [depositAmount, setDepositAmount] = useState<number>(10000);
  const [specialRequests, setSpecialRequests] = useState('');

  // Check-Out Modal State
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [checkOutPaymentMethod, setCheckOutPaymentMethod] = useState<PaymentMethod>('mpesa');

  // Add Cross-Charge Modal State
  const [chargeModalOpen, setChargeModalOpen] = useState(false);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState<number>(1500);
  const [chargeDept, setChargeDept] = useState<'RESTAURANT' | 'BAR_CLUB' | 'BUTCHERY'>('RESTAURANT');

  const filteredRooms = rooms.filter((r) =>
    filterStatus === 'ALL' ? true : r.status === filterStatus
  );

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Available', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'occupied':
        return { label: 'Occupied', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'reserved':
        return { label: 'Reserved', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'housekeeping':
        return { label: 'Housekeeping', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'checkout_pending':
        return { label: 'Pending Out', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'out_of_order':
        return { label: 'Out of Order', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const handleOpenCheckIn = (room: Room) => {
    setSelectedRoom(room);
    setDepositAmount(room.ratePerNight);
    setCheckInModalOpen(true);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !guestName.trim()) return;

    checkInRoom(selectedRoom.id, {
      name: guestName,
      phone: guestPhone,
      email: guestEmail,
      idNumber: guestIdNum,
      checkInDate,
      checkOutDate,
      depositAmount,
      specialRequests,
    });

    setCheckInModalOpen(false);
    // Reset fields
    setGuestName('');
    setGuestPhone('+254 7');
    setGuestEmail('');
    setGuestIdNum('');
  };

  const handleCheckOutSubmit = () => {
    if (!selectedRoom) return;
    checkOutRoom(selectedRoom.id, checkOutPaymentMethod);
    setCheckOutModalOpen(false);
    setSelectedRoom(null);
  };

  const handleAddFolioChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !chargeDesc.trim() || chargeAmount <= 0) return;

    addFolioCharge(selectedRoom.id, {
      department: chargeDept,
      description: chargeDesc,
      amount: chargeAmount,
      txnRef: `MAN-${Date.now().toString().slice(-4)}`
    });

    setChargeModalOpen(false);
    setChargeDesc('');
  };

  // Selected room folio calculations
  const selectedFolioTotal = selectedRoom
    ? selectedRoom.folioCharges.reduce((sum, f) => sum + f.amount, 0)
    : 0;
  const selectedFolioBalance = selectedRoom
    ? selectedFolioTotal - selectedRoom.paidAmount
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner & Quick Counters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Hotel Accommodations & Folio Management
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Suites & Room Service
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control guest check-in/out, cross-post restaurant/bar/butchery orders to room folios, and dispatch housekeeping.
          </p>
        </div>

        {/* Room Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'available', 'occupied', 'checkout_pending', 'housekeeping', 'reserved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl capitalize font-medium transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Rooms' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Room Grid + Folio Detail Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Room Cards Grid (2 Columns) */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const statusStyle = getStatusColor(room.status);
            const isSelected = selectedRoom?.id === room.id;
            const folioSum = room.folioCharges.reduce((s, c) => s + c.amount, 0);

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-white font-mono">
                      Room {room.number}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusStyle.bg}`}>
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="mt-1">
                    <div className="text-xs font-semibold text-slate-200">{room.type}</div>
                    <div className="text-[11px] text-slate-400">Floor {room.floor} • KES {room.ratePerNight.toLocaleString()}/night</div>
                  </div>

                  {/* Current Guest Badge */}
                  {room.currentGuest ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{room.currentGuest.name}</span>
                        <span className="text-[10px] text-blue-400 font-mono">
                          {room.keyCardAssigned || 'Key OK'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Out: {room.currentGuest.checkOutDate}</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          Folio: KES {folioSum.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : room.status === 'housekeeping' ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
                      <Brush className="w-4 h-4 text-rose-400 animate-spin" />
                      <span>Housekeeping Required ({room.cleaningPriority || 'Urgent'})</span>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-[11px] text-slate-500">
                      Ready for guest check-in
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs">
                  {room.status === 'available' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCheckIn(room);
                      }}
                      className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Check In Guest</span>
                    </button>
                  )}

                  {(room.status === 'occupied' || room.status === 'checkout_pending') && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(room);
                          setChargeModalOpen(true);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer text-center"
                      >
                        + Charge
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(room);
                          setCheckOutModalOpen(true);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer text-center"
                      >
                        Check Out
                      </button>
                    </>
                  )}

                  {room.status === 'housekeeping' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRoomStatus(room.id, 'available');
                        showToast(`Room ${room.number} inspected and marked ready!`, 'success');
                      }}
                      className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition cursor-pointer"
                    >
                      Mark Cleaned & Ready
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Room Folio & Service Details (1 Column) */}
        <div className="space-y-4">
          {selectedRoom ? (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Room {selectedRoom.number} Folio</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {selectedRoom.type}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Guest: {selectedRoom.currentGuest?.name || 'Unoccupied'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Guest Summary Info */}
              {selectedRoom.currentGuest && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone / ID:</span>
                    <span className="text-white font-mono">{selectedRoom.currentGuest.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stay Duration:</span>
                    <span className="text-slate-300">
                      {selectedRoom.currentGuest.checkInDate} to {selectedRoom.currentGuest.checkOutDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Deposit:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      KES {selectedRoom.currentGuest.depositAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Itemized Folio Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-blue-400" />
                    Itemized Folio Ledger
                  </span>
                  {selectedRoom.currentGuest && (
                    <button
                      onClick={() => setChargeModalOpen(true)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      + Add Charge
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {selectedRoom.folioCharges.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-xs">
                      No charges recorded on this room folio.
                    </div>
                  ) : (
                    selectedRoom.folioCharges.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-white">{item.description}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.date} • Dept: {item.department}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-200">
                          KES {item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Folio Totals Summary */}
                <div className="pt-3 border-t border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Charges:</span>
                    <span className="font-mono text-white">
                      KES {selectedFolioTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Deposits / Advance Paid:</span>
                    <span className="font-mono text-emerald-400">
                      - KES {selectedRoom.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex justify-between items-baseline">
                    <span className="font-bold text-white">Net Balance Due:</span>
                    <span className="font-mono text-base font-extrabold text-amber-400">
                      KES {Math.max(0, selectedFolioBalance).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                {selectedRoom.currentGuest && (
                  <button
                    onClick={() => setCheckOutModalOpen(true)}
                    className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    Finalize Room Checkout & Settle
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
              <BedDouble className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-slate-300">No Room Selected</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Select any room from the grid to inspect the folio, add dining room service charges, or finalize checkout.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Check In Modal */}
      {checkInModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCheckInSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Check-In: Room {selectedRoom.number} ({selectedRoom.type})
              </h3>
              <button
                type="button"
                onClick={() => setCheckInModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 text-[10px]">Guest Full Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Dr. Caroline Kimani"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">ID / Passport Number</label>
                  <input
                    type="text"
                    required
                    value={guestIdNum}
                    onChange={(e) => setGuestIdNum(e.target.value)}
                    placeholder="ID-2849102"
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Check-In Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Check-Out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Deposit / Advance Collected (KES)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Special Requests / Notes</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Extra pillows, airport pickup, sparkling water"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckInModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Confirm & Issue Key Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Cross-Charge Modal */}
      {chargeModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddFolioChargeSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                Add Charge: Room {selectedRoom.number}
              </h3>
              <button
                type="button"
                onClick={() => setChargeModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px]">Charging Department</label>
                <select
                  value={chargeDept}
                  onChange={(e) => setChargeDept(e.target.value as any)}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="RESTAURANT">Restaurant & Kitchen</option>
                  <option value="BAR_CLUB">Bar & VIP Club</option>
                  <option value="BUTCHERY">Butchery / Nyama Choma</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Description</label>
                <input
                  type="text"
                  required
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  placeholder="e.g. 1kg Goat Choma + 2x Tusker Cider"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Amount (KES)</label>
                <input
                  type="number"
                  required
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(Number(e.target.value))}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChargeModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Post to Folio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Checkout Settle Modal */}
      {checkOutModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                Checkout Settle: Room {selectedRoom.number}
              </h3>
              <button
                onClick={() => setCheckOutModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Guest Name:</span>
                  <span className="font-bold text-white">{selectedRoom.currentGuest?.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Folio:</span>
                  <span className="font-mono text-white">KES {selectedFolioTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Paid Deposit:</span>
                  <span className="font-mono text-emerald-400">- KES {selectedRoom.paidAmount.toLocaleString()}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold">
                  <span className="text-amber-400">Remaining Balance:</span>
                  <span className="text-amber-400 font-mono text-sm">
                    KES {Math.max(0, selectedFolioBalance).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Payment Tender for Final Balance</label>
                <select
                  value={checkOutPaymentMethod}
                  onChange={(e) => setCheckOutPaymentMethod(e.target.value as any)}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="mpesa">M-Pesa Express</option>
                  <option value="cash">Cash Tender</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="bank_transfer">Direct Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCheckOutModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOutSubmit}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Finalize & Dispatch Cleaners
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
