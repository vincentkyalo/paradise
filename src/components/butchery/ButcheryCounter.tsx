import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ButcheryCut, OrderItem, PaymentMethod } from '../../types';
import {
  Beef,
  Scale,
  Flame,
  ShoppingBag,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  Thermometer,
  Layers,
  Sparkles,
  Printer,
  ChevronRight
} from 'lucide-react';

export const ButcheryCounter: React.FC = () => {
  const {
    butcheryCuts,
    updateButcheryStock,
    createOrder,
    currentUser,
    tables,
    showToast,
    openReceipt
  } = useApp();

  const [selectedCut, setSelectedCut] = useState<ButcheryCut>(butcheryCuts[0]);
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [tareKg, setTareKg] = useState<number>(0.0);
  const [cookOption, setCookOption] = useState<'Raw Takeaway' | 'Choma Grill' | 'Wet Fry'>('Choma Grill');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [butcheryNotes, setButcheryNotes] = useState<string>('Medium well, light salt & kachumbari');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');

  // Compute calculated line price
  const netWeight = Math.max(0, Number((weightKg - tareKg).toFixed(2)));
  const calculatedPrice = Math.round(netWeight * selectedCut.pricePerKg);

  const handleTare = () => {
    setTareKg(weightKg);
    showToast(`Scale tared to ${weightKg.toFixed(2)} KG`, 'info');
  };

  const handleResetTare = () => {
    setTareKg(0);
    showToast('Tare cleared', 'info');
  };

  const handleQuickWeightAdd = (delta: number) => {
    setWeightKg((prev) => Math.max(0.1, Number((prev + delta).toFixed(2))));
  };

  const handleCreateButcheryOrder = () => {
    if (netWeight <= 0) {
      showToast('Scale reads 0.00 KG. Place meat on scale first.', 'warning');
      return;
    }

    if (selectedCut.stockKg < netWeight) {
      showToast(`Insufficient stock! Only ${selectedCut.stockKg} KG remaining in cold room.`, 'error');
      return;
    }

    const selectedTable = tables.find((t) => t.id === selectedTableId);
    const tax = Math.round(calculatedPrice * 0.16);

    const order = createOrder({
      department: 'BUTCHERY',
      orderType: cookOption === 'Raw Takeaway' ? 'butchery_raw' : 'butchery_grill',
      tableId: selectedTableId || undefined,
      tableName: selectedTable ? `${selectedTable.number} - ${selectedTable.name}` : undefined,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items: [
        {
          id: `oi-but-${Date.now()}`,
          productId: selectedCut.id,
          name: `${selectedCut.name} (${netWeight} KG)`,
          category: selectedCut.category,
          unitPrice: selectedCut.pricePerKg,
          quantity: 1,
          weightKg: netWeight,
          notes: `${cookOption} • ${butcheryNotes}`,
          kdsStatus: cookOption === 'Raw Takeaway' ? 'ready' : 'pending',
          department: 'BUTCHERY',
        },
      ],
      subtotal: calculatedPrice,
      serviceCharge: 0,
      discountPercent: 0,
      discountAmount: 0,
      tax,
      total: calculatedPrice,
      paymentMethod,
      mpesaRef: paymentMethod === 'mpesa' ? `MBZ${Date.now().toString().slice(-6)}` : undefined,
      status: 'completed',
      notes: `Butchery Scale Dispatch • ${selectedCut.carcassOrigin || 'Local Ranch'}`,
    });

    showToast(`Dispatched ${netWeight} KG ${selectedCut.name} for KES ${calculatedPrice.toLocaleString()}`, 'success');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner & Cold Room Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Beef className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Butchery Counter & Nyama Choma Grill
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
              Digital Certified Scale 15KG Max
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Weight-based pricing, carcass traceability, tare calibration, and direct Nyama Choma grill ticket routing.
          </p>
        </div>

        {/* Cold Storage Sensor Telemetry */}
        <div className="flex items-center gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400">Meat Cold Room 1</div>
              <div className="font-mono font-bold text-emerald-400 text-sm">2.4°C (Normal)</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
            <Thermometer className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-[10px] text-slate-400">Deep Freeze Vault</div>
              <div className="font-mono font-bold text-cyan-400 text-sm">-18.6°C (Optimal)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Meat Catalog + Interactive Digital Scale Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cuts Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              Available Meat Cuts & Carcass Stock
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {butcheryCuts.length} Cuts in Cellar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {butcheryCuts.map((cut) => {
              const isSelected = selectedCut.id === cut.id;
              const isLowStock = cut.stockKg <= cut.minStockKg;

              return (
                <div
                  key={cut.id}
                  onClick={() => setSelectedCut(cut)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {cut.category}
                      </span>
                      {isLowStock && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2 leading-tight">
                      {cut.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Origin: {cut.carcassOrigin || 'Kenyan Ranches'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400">Price per KG</span>
                      <div className="text-base font-black text-rose-400 font-mono">
                        KES {cut.pricePerKg.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Available</span>
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {cut.stockKg.toFixed(1)} KG
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Digital Scale Station & Weigh Terminal (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {/* Digital Scale LED Readout */}
            <div className="bg-slate-950 p-5 rounded-2xl border-2 border-slate-800 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400 uppercase tracking-wider">
                  <Scale className="w-4 h-4" />
                  Electronic Scale Readout
                </span>
                <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {tareKg > 0 ? `TARE: ${tareKg.toFixed(2)} KG` : 'ZERO READY'}
                </span>
              </div>

              {/* Large Bright LED Digital Digits */}
              <div className="py-2 text-center">
                <div className="text-5xl font-black text-amber-400 font-mono tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  {netWeight.toFixed(2)}
                  <span className="text-xl text-slate-400 ml-2 font-normal">KG</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Active Cut: <strong className="text-white">{selectedCut.name}</strong> (@ KES {selectedCut.pricePerKg}/kg)
                </div>
              </div>

              {/* Tare & Zero Scale Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-900">
                <button
                  onClick={handleTare}
                  className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                  TARE Scale
                </button>
                <button
                  onClick={handleResetTare}
                  className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 transition cursor-pointer"
                >
                  Zero / Reset
                </button>
              </div>
            </div>

            {/* Quick Weight Adjuster Controls (Weight Presets) */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Simulate Meat Weight on Pan
              </label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0].map((wt) => (
                  <button
                    key={wt}
                    onClick={() => setWeightKg(wt)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      weightKg === wt
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {wt.toFixed(1)} KG
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleQuickWeightAdd(-0.25)}
                  className="flex-1 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono cursor-pointer"
                >
                  -0.25 KG
                </button>
                <button
                  onClick={() => handleQuickWeightAdd(0.25)}
                  className="flex-1 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono cursor-pointer"
                >
                  +0.25 KG
                </button>
              </div>
            </div>

            {/* Preparation Option Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Kitchen Prep / Destination
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { key: 'Choma Grill', label: 'Nyama Choma Grill', icon: Flame },
                  { key: 'Wet Fry', label: 'Wet Fry Sauté', icon: Sparkles },
                  { key: 'Raw Takeaway', label: 'Raw Takeaway Pack', icon: ShoppingBag },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSel = cookOption === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setCookOption(opt.key as any)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        isSel
                          ? 'border-rose-500 bg-rose-500/20 text-rose-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] text-center leading-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table & Notes for Dine-In Grill */}
            {cookOption !== 'Raw Takeaway' && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Dine-In Table</label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                  >
                    <option value="">Patio / Walk-in</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.number} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-xs"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash Tender</option>
                    <option value="card">Card Terminal</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Grand Calculated Total & Dispatch Button */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Calculated:</span>
                <div className="text-[10px] text-slate-500">
                  {netWeight} KG × KES {selectedCut.pricePerKg}/KG
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">
                KES {calculatedPrice.toLocaleString()}
              </div>
            </div>

            <button
              onClick={handleCreateButcheryOrder}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {cookOption === 'Raw Takeaway' ? 'Print Meat Ticket & Package' : 'Dispatch to Charcoal Grill'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
