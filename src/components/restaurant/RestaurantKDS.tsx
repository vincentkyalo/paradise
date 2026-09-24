import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem } from '../../types';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Flame,
  ChefHat,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';

export const RestaurantKDS: React.FC = () => {
  const { orders, showToast } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'COOKING' | 'READY'>('ALL');

  // Extract all food items that need kitchen preparation
  const kitchenTickets = orders
    .filter((o) => o.status === 'completed')
    .slice(0, 10);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Restaurant & Kitchen Display System (KDS)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Live Cooking Expediter
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ticket expediter for Charcoal Nyama Choma grill, hot kitchen platters, and room service.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'PENDING', 'COOKING', 'READY'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition cursor-pointer ${
                activeFilter === filter
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kitchenTickets.map((order, idx) => {
          const isChoma = order.department === 'BUTCHERY' || order.items.some((i) => i.name.includes('Choma'));
          const elapsedTimeMins = (idx * 6) + 4; // realistic elapsed minutes

          return (
            <div
              key={order.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg"
            >
              {/* Ticket Header */}
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white font-mono">
                      {order.txnNumber}
                    </span>
                    {isChoma && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-400" /> Grill Station
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Destination: <strong className="text-slate-200">{order.tableName || order.roomNumber ? `Room ${order.roomNumber}` : 'Takeaway / Bar'}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-mono font-bold flex items-center gap-1 ${
                    elapsedTimeMins > 20 ? 'text-rose-400 animate-pulse' : elapsedTimeMins > 10 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsedTimeMins}m ago</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Waiter: {order.waiterName || 'Till'}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-2.5 flex-1">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-start justify-between gap-2"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-mono text-center leading-5 text-[11px]">
                          {item.quantity}×
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-amber-300/80 mt-1 pl-7 italic">
                          "{item.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Footer */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => showToast(`Ticket ${order.txnNumber} marked cooking on grill`, 'info')}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Start Cooking
                </button>
                <button
                  onClick={() => showToast(`Ticket ${order.txnNumber} ready for server pickup!`, 'success')}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                >
                  Mark Order Ready
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
