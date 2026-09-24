import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, OrderItem, PaymentMethod, Table, Customer, User, SplitPaymentDetail } from '../../types';
import {
  Wine,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Percent,
  Receipt,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  Split,
  Layers,
  CheckCircle,
  DollarSign,
  Smartphone,
  CreditCard,
  Building,
  UserCheck,
  Tag,
  Share2,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const BarClubPOS: React.FC = () => {
  const {
    products,
    tables,
    users,
    customers,
    rooms,
    currentUser,
    hasPermission,
    createOrder,
    heldOrders,
    saveHeldOrder,
    resumeHeldOrder,
    voidOrder,
    refundOrder,
    openReceipt,
    showToast
  } = useApp();

  // Selected Department / Product Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  // Cart / Bill State
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>(currentUser.id);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState<boolean>(true);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmountManual, setDiscountAmountManual] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Modals & Panels
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [splitBillModalOpen, setSplitBillModalOpen] = useState<boolean>(false);
  const [mergeBillsModalOpen, setMergeBillsModalOpen] = useState<boolean>(false);
  const [heldBillsModalOpen, setHeldBillsModalOpen] = useState<boolean>(false);
  const [voidModalOpen, setVoidModalOpen] = useState<boolean>(false);
  const [voidReason, setVoidReason] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('mpesa');

  // Specific payment method inputs
  const [mpesaPhone, setMpesaPhone] = useState<string>('+254 722 000 000');
  const [mpesaRefCode, setMpesaRefCode] = useState<string>('QKT' + Math.floor(100000 + Math.random() * 900000));
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  // Mixed payment breakdown states
  const [mixedCash, setMixedCash] = useState<number>(0);
  const [mixedMpesa, setMixedMpesa] = useState<number>(0);
  const [mixedCard, setMixedCard] = useState<number>(0);

  // Equal split count
  const [splitCount, setSplitCount] = useState<number>(2);

  const categories = [
    'All',
    'Beers',
    'Wines',
    'Spirits',
    'Cocktails',
    'Soft drinks',
    'Energy drinks',
    'Water',
    'Juices',
    'Food',
    'Snacks',
  ];

  // Filter products by category, search, department
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart financial totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (discountAmountManual > 0) return discountAmountManual;
    if (discountPercent > 0) return Math.round((subtotal * discountPercent) / 100);
    return 0;
  }, [subtotal, discountPercent, discountAmountManual]);

  const serviceCharge = useMemo(() => {
    if (!serviceChargeEnabled) return 0;
    return Math.round((subtotal - discountAmount) * 0.1); // 10% standard hospitality service charge
  }, [subtotal, discountAmount, serviceChargeEnabled]);

  const taxableAmount = subtotal - discountAmount;
  const tax = Math.round(taxableAmount * 0.16); // 16% VAT Kenya
  const total = taxableAmount + serviceCharge;

  // Add product to cart
  const addToCart = (product: Product, asShot: boolean = false) => {
    const unitPrice = asShot && product.shotPrice ? product.shotPrice : product.price;
    const itemName = asShot ? `${product.name} (Single Shot / Tot)` : product.name;
    const itemKey = `${product.id}-${asShot ? 'shot' : 'bottle'}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.id === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          name: itemName,
          category: product.category,
          unitPrice,
          quantity: 1,
          isShot: asShot,
          department: product.department,
        },
      ];
    });

    showToast(`Added ${itemName} to bill`, 'info');
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Barcode quick scan simulator
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const match = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.id === barcodeInput.trim()
    );
    if (match) {
      addToCart(match, false);
      setBarcodeInput('');
    } else {
      showToast(`No product found with barcode ${barcodeInput}`, 'error');
    }
  };

  // Hold current order
  const handleHoldOrder = () => {
    if (cartItems.length === 0) return;
    const selectedTable = tables.find((t) => t.id === selectedTableId);
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const selectedWaiter = users.find((u) => u.id === selectedWaiterId);

    saveHeldOrder({
      department: 'BAR_CLUB',
      orderType: selectedTable ? 'club_table' : 'bar_walkin',
      tableId: selectedTableId || undefined,
      tableName: selectedTable ? `${selectedTable.number} - ${selectedTable.name}` : undefined,
      waiterId: selectedWaiterId,
      waiterName: selectedWaiter?.name || currentUser.name,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      items: cartItems,
      subtotal,
      serviceCharge,
      discountPercent,
      discountAmount,
      tax,
      total,
      paymentMethod: 'mpesa',
      status: 'held',
      notes: orderNotes,
    });

    // Clear active cart
    setCartItems([]);
    setSelectedTableId('');
    setDiscountPercent(0);
    setDiscountAmountManual(0);
  };

  // Resume held order
  const handleResumeHeld = (heldId: string) => {
    const resumed = resumeHeldOrder(heldId);
    if (resumed) {
      setCartItems(resumed.items);
      setSelectedTableId(resumed.tableId || '');
      setSelectedWaiterId(resumed.waiterId || currentUser.id);
      setSelectedCustomerId(resumed.customerId || '');
      setDiscountPercent(resumed.discountPercent || 0);
      setDiscountAmountManual(resumed.discountAmount || 0);
      setOrderNotes(resumed.notes || '');
      setHeldBillsModalOpen(false);
    }
  };

  // Finalize payment
  const handleProcessPayment = () => {
    if (cartItems.length === 0) {
      showToast('Cart is empty. Select products first.', 'warning');
      return;
    }

    const selectedTable = tables.find((t) => t.id === selectedTableId);
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const selectedWaiter = users.find((u) => u.id === selectedWaiterId);

    // Validate customer tab limit if credit_account
    if (selectedPaymentMethod === 'credit_account') {
      if (!selectedCustomer) {
        showToast('Please select a customer with an active account credit limit.', 'error');
        return;
      }
      const availableLimit = selectedCustomer.creditLimit - selectedCustomer.outstandingTab;
      if (total > availableLimit) {
        showToast(
          `Credit limit exceeded! Patron only has KES ${availableLimit.toLocaleString()} available.`,
          'error'
        );
        return;
      }
    }

    // Validate room selection if room_folio
    if (selectedPaymentMethod === 'room_folio' && !selectedRoomId) {
      showToast('Please select an occupied room folio to charge.', 'error');
      return;
    }

    // Prepare mixed payment details
    let paymentDetails: SplitPaymentDetail[] | undefined = undefined;
    if (selectedPaymentMethod === 'mixed') {
      paymentDetails = ([
        { method: 'cash' as const, amount: mixedCash },
        { method: 'mpesa' as const, amount: mixedMpesa },
        { method: 'card' as const, amount: mixedCard },
      ] as SplitPaymentDetail[]).filter((p) => p.amount > 0);
    }

    const order = createOrder({
      department: 'BAR_CLUB',
      orderType: selectedTable ? 'club_table' : 'bar_walkin',
      tableId: selectedTableId || undefined,
      tableName: selectedTable ? `${selectedTable.number} - ${selectedTable.name}` : undefined,
      roomId: selectedPaymentMethod === 'room_folio' ? selectedRoomId : undefined,
      roomNumber: selectedPaymentMethod === 'room_folio' ? rooms.find((r) => r.id === selectedRoomId)?.number : undefined,
      waiterId: selectedWaiterId,
      waiterName: selectedWaiter?.name || currentUser.name,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      items: cartItems,
      subtotal,
      serviceCharge,
      discountPercent,
      discountAmount,
      tax,
      total,
      paymentMethod: selectedPaymentMethod,
      paymentDetails,
      mpesaRef: selectedPaymentMethod === 'mpesa' ? mpesaRefCode : undefined,
      status: 'completed',
      notes: orderNotes,
    });

    // Reset bill state
    setCartItems([]);
    setSelectedTableId('');
    setDiscountPercent(0);
    setDiscountAmountManual(0);
    setOrderNotes('');
    setPaymentModalOpen(false);
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="p-3 lg:p-5 h-[calc(100vh-65px)] flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Left Column: Product Catalog & Fast Touch Grid */}
      <div className="flex-1 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Search, Barcode & Category Ribbon */}
        <div className="p-3 border-b border-slate-800 space-y-2.5 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beers, whiskies, cocktails, wines or food..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Barcode Fast Scan Input */}
            <form onSubmit={handleBarcodeSubmit} className="relative w-48 hidden sm:block">
              <Barcode className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-amber-500/40 rounded-xl text-xs text-amber-300 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
              />
            </form>
          </div>

          {/* Category Chips Scrollbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredProducts.map((prod) => {
            const isLow = prod.stock <= prod.minStockLevel;
            return (
              <div
                key={prod.id}
                className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {prod.category}
                    </span>
                    {isLow && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {prod.stock} left
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-2 leading-snug">
                    {prod.name}
                  </h4>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-1">
                    KES {prod.price.toLocaleString()}
                  </div>
                </div>

                {/* Measure Buttons (Bottle vs Shot if allowed) */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-1.5">
                  <button
                    onClick={() => addToCart(prod, false)}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{prod.allowsShotMeasure ? 'Bottle' : 'Add'}</span>
                  </button>

                  {prod.allowsShotMeasure && prod.shotPrice && (
                    <button
                      onClick={() => addToCart(prod, true)}
                      className="px-2 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[10px] font-semibold transition cursor-pointer"
                      title={`Add single shot @ KES ${prod.shotPrice}`}
                    >
                      Shot ({prod.shotPrice})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Order Bill & Register Terminal */}
      <div className="w-full lg:w-[420px] shrink-0 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Bill Header: Table, Waiter, Customer Selectors */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Receipt className="w-4 h-4" />
              Active Bar Tab / Ticket
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {cartItems.length} items
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Table Selector */}
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Table Assignment</label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:border-amber-500 text-xs"
              >
                <option value="">Walk-in Bar Guest</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.number} - {t.name} ({t.section})
                  </option>
                ))}
              </select>
            </div>

            {/* Waiter / Server */}
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Server</label>
              <select
                value={selectedWaiterId}
                onChange={(e) => setSelectedWaiterId(e.target.value)}
                className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:border-amber-500 text-xs"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* VIP Customer / Tab selector */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Customer / VIP Tab</span>
              {selectedCustomerObj && (
                <span className="text-amber-400 font-mono">
                  {selectedCustomerObj.vipTier} • Limit KES {selectedCustomerObj.creditLimit.toLocaleString()}
                </span>
              )}
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:border-amber-500 text-xs"
            >
              <option value="">Walk-in Patron</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.vipTier} - {c.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bill Line Items Scroll Area */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Wine className="w-12 h-12 stroke-1 text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">No items on current tab</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tap items or scan barcode to add drinks & food.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-semibold text-white truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    KES {item.unitPrice.toLocaleString()} each
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 font-mono font-bold text-white text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:text-emerald-400 text-slate-400 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-16 text-right font-mono font-bold text-white text-xs">
                    KES {(item.unitPrice * item.quantity).toLocaleString()}
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Actions: Hold, Reopen, Split, Merge, Void */}
        <div className="p-2 bg-slate-950/90 border-t border-slate-800 grid grid-cols-4 gap-1 text-[10px]">
          <button
            onClick={handleHoldOrder}
            disabled={cartItems.length === 0}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium flex flex-col items-center gap-0.5 disabled:opacity-40 cursor-pointer"
          >
            <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Hold Bill</span>
          </button>

          <button
            onClick={() => setHeldBillsModalOpen(true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium flex flex-col items-center gap-0.5 cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reopen ({heldOrders.length})</span>
          </button>

          <button
            onClick={() => setSplitBillModalOpen(true)}
            disabled={cartItems.length === 0}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium flex flex-col items-center gap-0.5 disabled:opacity-40 cursor-pointer"
          >
            <Split className="w-3.5 h-3.5 text-blue-400" />
            <span>Split Bill</span>
          </button>

          <button
            onClick={() => {
              if (hasPermission('void_refund') || currentUser.role === 'super_admin') {
                setVoidModalOpen(true);
              } else {
                showToast('Void requires manager override credentials.', 'error');
              }
            }}
            disabled={cartItems.length === 0}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400 font-medium flex flex-col items-center gap-0.5 disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Void</span>
          </button>
        </div>

        {/* Calculation & Payment Button Box */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
          {/* Subtotal & Toggles */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">KES {subtotal.toLocaleString()}</span>
            </div>

            {/* Service Charge Toggle (10%) */}
            <div className="flex items-center justify-between text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={serviceChargeEnabled}
                  onChange={(e) => setServiceChargeEnabled(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>10% Late Night/VIP Service Charge</span>
              </label>
              <span className="font-mono text-white">
                {serviceChargeEnabled ? `KES ${serviceCharge.toLocaleString()}` : 'Waived'}
              </span>
            </div>

            {/* Discount with Permission Check */}
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>Discount:</span>
                <button
                  onClick={() => {
                    if (hasPermission('edit_sales') || hasPermission('void_refund')) {
                      const pct = discountPercent === 10 ? 0 : 10;
                      setDiscountPercent(pct);
                      showToast(`Applied ${pct}% Discount`, 'info');
                    } else {
                      showToast('Discount requires manager permission.', 'error');
                    }
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 cursor-pointer"
                >
                  {discountPercent > 0 ? `${discountPercent}% Applied` : 'Add 10%'}
                </button>
              </div>
              <span className="font-mono text-emerald-400">
                - KES {discountAmount.toLocaleString()}
              </span>
            </div>

            {/* Grand Total */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Total Due:</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">
                KES {total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={() => setPaymentModalOpen(true)}
            disabled={cartItems.length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Process Payment (KES {total.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  Select Payment Tender
                </h3>
                <p className="text-xs text-slate-400">Total amount due: KES {total.toLocaleString()}</p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
              {[
                { key: 'mpesa', label: 'M-Pesa Express', icon: Smartphone },
                { key: 'cash', label: 'Cash Drawer', icon: DollarSign },
                { key: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                { key: 'credit_account', label: 'VIP Tab / Credit', icon: UserCheck },
                { key: 'room_folio', label: 'Hotel Room Folio', icon: Building },
                { key: 'bank_transfer', label: 'Bank Transfer', icon: Layers },
                { key: 'mixed', label: 'Mixed / Split', icon: Split },
              ].map((m) => {
                const Icon = m.icon;
                const isSel = selectedPaymentMethod === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setSelectedPaymentMethod(m.key as PaymentMethod)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                      isSel
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] text-center">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Payment Specific Form Details */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              {selectedPaymentMethod === 'mpesa' && (
                <div className="space-y-2">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> M-Pesa STK Push / Manual Confirmation
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px]">Customer Phone Number</label>
                    <input
                      type="text"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px]">M-Pesa Transaction Ref Code</label>
                    <input
                      type="text"
                      value={mpesaRefCode}
                      onChange={(e) => setMpesaRefCode(e.target.value)}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'cash' && (
                <div className="space-y-2">
                  <div className="text-cyan-400 font-semibold flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Cash Tendered & Change Calculator
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px]">Amount Handed by Customer</label>
                    <input
                      type="number"
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(Number(e.target.value))}
                      placeholder={total.toString()}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[1000, 2000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCashTendered(amt)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-mono cursor-pointer"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                  {cashTendered > total && (
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex justify-between font-mono font-bold">
                      <span>Change to Return:</span>
                      <span>KES {(cashTendered - total).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedPaymentMethod === 'room_folio' && (
                <div className="space-y-2">
                  <div className="text-blue-400 font-semibold flex items-center gap-1.5">
                    <Building className="w-4 h-4" /> Charge to Hotel Room Guest Folio
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px]">Select Occupied Room</label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    >
                      <option value="">-- Choose Hotel Room --</option>
                      {rooms
                        .filter((r) => r.status === 'occupied')
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            Room {r.number} - {r.currentGuest?.name} ({r.type})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'mixed' && (
                <div className="space-y-2">
                  <div className="text-amber-400 font-semibold">Split Tender Amounts</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Cash</label>
                      <input
                        type="number"
                        value={mixedCash || ''}
                        onChange={(e) => setMixedCash(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">M-Pesa</label>
                      <input
                        type="number"
                        value={mixedMpesa || ''}
                        onChange={(e) => setMixedMpesa(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Card</label>
                      <input
                        type="number"
                        value={mixedCard || ''}
                        onChange={(e) => setMixedCard(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Allocated Sum:</span>
                    <span
                      className={`font-mono font-bold ${
                        mixedCash + mixedMpesa + mixedCard === total
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      KES {(mixedCash + mixedMpesa + mixedCard).toLocaleString()} / {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Payment Action */}
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Confirm & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Orders Modal */}
      {heldBillsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                Held & Parked Customer Tabs
              </h3>
              <button
                onClick={() => setHeldBillsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {heldOrders.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No parked bills currently in queue.
                </div>
              ) : (
                heldOrders.map((held) => (
                  <div
                    key={held.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {held.tableName || held.customerName || held.txnNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {held.items.length} items • Held at {held.createdAt}
                      </div>
                      <div className="font-mono text-amber-400 font-bold mt-0.5">
                        KES {held.total.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleResumeHeld(held.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                    >
                      Resume Bill
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Split Bill Modal */}
      {splitBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Split className="w-4 h-4 text-blue-400" />
                Split Bill Equally
              </h3>
              <button
                onClick={() => setSplitBillModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Bill:</span>
                <span className="font-mono text-white font-bold">KES {total.toLocaleString()}</span>
              </div>
              <div>
                <label className="text-slate-400 text-[10px]">Number of Guests</label>
                <div className="flex items-center gap-2 mt-1">
                  {[2, 3, 4, 5, 6].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setSplitCount(cnt)}
                      className={`flex-1 py-1.5 rounded-lg font-mono font-bold transition cursor-pointer ${
                        splitCount === cnt
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-center space-y-1">
                <span className="text-[11px] text-blue-300">Each Guest Pays:</span>
                <div className="text-2xl font-black text-white font-mono">
                  KES {Math.ceil(total / splitCount).toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(`Bill split into ${splitCount} equal portions of KES ${Math.ceil(total / splitCount).toLocaleString()}`, 'info');
                setSplitBillModalOpen(false);
              }}
              className="w-full py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold cursor-pointer"
            >
              Print Split Receipts
            </button>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {voidModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/60 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Void Order Authorization
              </h3>
              <button
                onClick={() => setVoidModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-400 text-[11px]">
                This action requires supervisor authorization and will be permanently recorded in the immutable audit log.
              </p>
              <div>
                <label className="text-slate-400 text-[10px]">Reason for Voiding</label>
                <select
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs"
                >
                  <option value="">-- Select Reason --</option>
                  <option value="Customer changed mind / Left">Customer changed mind / Left</option>
                  <option value="Wrong item entered by server">Wrong item entered by server</option>
                  <option value="Product quality / Spoilage issue">Product quality / Spoilage issue</option>
                  <option value="Testing & Training entry">Testing & Training entry</option>
                  <option value="Payment failed / Declined">Payment failed / Declined</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setVoidModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCartItems([]);
                  setVoidModalOpen(false);
                  showToast('Ticket cleared and void reason recorded.', 'warning');
                }}
                disabled={!voidReason}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Confirm Void
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
