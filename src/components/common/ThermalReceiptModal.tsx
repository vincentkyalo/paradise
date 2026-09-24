import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Share2, Smartphone, Check, X, Building, Barcode } from 'lucide-react';

export const ThermalReceiptModal: React.FC = () => {
  const { receiptModalOrder, closeReceipt, showToast } = useApp();
  const [digitalPhone, setDigitalPhone] = useState('+254 722 000 000');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!receiptModalOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendDigital = (channel: 'whatsapp' | 'sms') => {
    setSentSuccess(true);
    showToast(
      `Digital receipt sent to ${digitalPhone} via ${channel.toUpperCase()}!`,
      'success'
    );
    setTimeout(() => {
      setSentSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Toolbar (hidden on print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Official Thermal Tax Receipt</h3>
          </div>
          <button
            onClick={closeReceipt}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-slate-950/50 print:p-0 print:bg-white">
          {/* Paper Bill Simulation */}
          <div className="w-[330px] bg-[#fffef7] text-black font-mono text-xs p-5 shadow-lg rounded-sm border border-slate-300 print:shadow-none print:border-none print:w-full">
            {/* Business Header */}
            <div className="text-center space-y-0.5 border-b border-dashed border-gray-400 pb-3">
              <h1 className="font-black text-sm tracking-tight">THE HAVEN RESORT & CLUB</h1>
              <p className="text-[10px] text-gray-700">VIP CLUB • HOTEL • BUTCHERY • RESTAURANT</p>
              <p className="text-[10px] text-gray-600">Off Lang'ata Road, Nairobi, Kenya</p>
              <p className="text-[10px] text-gray-600">KRA PIN: P051892014M • TEL: +254 700 123 456</p>
            </div>

            {/* Receipt Meta */}
            <div className="py-2.5 text-[10px] space-y-0.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>RECEIPT NO:</span>
                <span className="font-bold">{receiptModalOrder.txnNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE / TIME:</span>
                <span>{receiptModalOrder.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span>DEPARTMENT:</span>
                <span className="font-bold">{receiptModalOrder.department.replace('_', ' ')}</span>
              </div>
              {receiptModalOrder.tableName && (
                <div className="flex justify-between">
                  <span>TABLE:</span>
                  <span className="font-bold">{receiptModalOrder.tableName}</span>
                </div>
              )}
              {receiptModalOrder.roomNumber && (
                <div className="flex justify-between">
                  <span>ROOM NUMBER:</span>
                  <span className="font-bold">Room {receiptModalOrder.roomNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>SERVER / TILL:</span>
                <span>{receiptModalOrder.waiterName || receiptModalOrder.cashierName}</span>
              </div>
              {receiptModalOrder.customerName && (
                <div className="flex justify-between">
                  <span>PATRON:</span>
                  <span>{receiptModalOrder.customerName}</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-2.5 border-b border-dashed border-gray-400">
              <div className="grid grid-cols-12 font-bold text-[10px] pb-1 border-b border-gray-300">
                <span className="col-span-6">ITEM</span>
                <span className="col-span-2 text-center">QTY</span>
                <span className="col-span-4 text-right">TOTAL</span>
              </div>

              <div className="space-y-1.5 pt-1.5 text-[10px]">
                {receiptModalOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 leading-tight">
                    <div className="col-span-6">
                      <div className="font-medium truncate">{item.name}</div>
                      {item.isShot && <span className="text-[8px] text-gray-500">Single Shot</span>}
                    </div>
                    <div className="col-span-2 text-center font-mono">
                      {item.weightKg ? `${item.weightKg}kg` : item.quantity}
                    </div>
                    <div className="col-span-4 text-right font-mono font-bold">
                      KES {(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 text-[10px] space-y-1 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="font-mono">KES {receiptModalOrder.subtotal.toLocaleString()}</span>
              </div>

              {receiptModalOrder.discountAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>DISCOUNT ({receiptModalOrder.discountPercent}%):</span>
                  <span className="font-mono">- KES {receiptModalOrder.discountAmount.toLocaleString()}</span>
                </div>
              )}

              {receiptModalOrder.serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span>SERVICE CHARGE (10%):</span>
                  <span className="font-mono">KES {receiptModalOrder.serviceCharge.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>VAT (16% INCL):</span>
                <span className="font-mono">KES {receiptModalOrder.tax.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs font-black pt-1.5 border-t border-gray-800">
                <span>TOTAL DUE:</span>
                <span className="font-mono text-sm">KES {receiptModalOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Tender Method */}
            <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between uppercase">
                <span>PAYMENT METHOD:</span>
                <span className="font-bold">{receiptModalOrder.paymentMethod.replace('_', ' ')}</span>
              </div>
              {receiptModalOrder.mpesaRef && (
                <div className="flex justify-between font-mono">
                  <span>M-PESA CONFIRMATION:</span>
                  <span className="font-bold text-gray-900">{receiptModalOrder.mpesaRef}</span>
                </div>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="pt-3 text-center space-y-2 text-[9px] text-gray-600">
              <div className="font-mono tracking-widest text-center text-xs">
                ||||| | |||| ||||| || |||||| | |||||
              </div>
              <p className="font-semibold">THANK YOU FOR YOUR PATRONAGE!</p>
              <p className="text-[8px]">Goods once sold are not returnable without supervisor approval.</p>
              <p className="text-[8px] text-gray-400">System: Hospitality CRM Enterprise v3.2</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls (hidden on print) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 print:hidden">
          {/* Digital Send Form */}
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={digitalPhone}
              onChange={(e) => setDigitalPhone(e.target.value)}
              placeholder="Guest Phone for SMS/WhatsApp"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
            />
            <button
              onClick={() => handleSendDigital('whatsapp')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleSendDigital('sms')}
              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              SMS
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={closeReceipt}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Done / Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print 80mm Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
