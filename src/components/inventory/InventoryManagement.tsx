import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, DepartmentKey } from '../../types';
import {
  Boxes,
  AlertTriangle,
  Plus,
  ArrowUpDown,
  Search,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Edit2,
  ShieldCheck
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const {
    products,
    updateProductStock,
    updateProductPrice,
    addProduct,
    butcheryCuts,
    updateButcheryStock,
    currentUser,
    hasPermission,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'butchery' | 'audit'>('products');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [newProdModalOpen, setNewProdModalOpen] = useState(false);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Beers');
  const [newProdDept, setNewProdDept] = useState<DepartmentKey>('BAR_CLUB');
  const [newProdPrice, setNewProdPrice] = useState<number>(350);
  const [newProdCost, setNewProdCost] = useState<number>(200);
  const [newProdStock, setNewProdStock] = useState<number>(50);
  const [newProdMinStock, setNewProdMinStock] = useState<number>(15);

  const filteredProducts = products.filter((p) => {
    if (selectedDept !== 'ALL' && p.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.barcode.includes(q);
    }
    return true;
  });

  const lowStockProducts = products.filter((p) => p.stock <= p.minStockLevel);

  const handleOpenStockAdjust = (p: Product) => {
    setSelectedProduct(p);
    setStockDelta(12);
    setStockModalOpen(true);
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    updateProductStock(selectedProduct.id, stockDelta);
    setStockModalOpen(false);
    showToast(`Adjusted stock for ${selectedProduct.name} by ${stockDelta > 0 ? '+' : ''}${stockDelta} units`, 'success');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addProduct({
      name: newProdName,
      department: newProdDept,
      category: newProdCategory,
      price: newProdPrice,
      costPrice: newProdCost,
      stock: newProdStock,
      unit: newProdDept === 'BUTCHERY' ? 'kg' : 'bottle',
      barcode: `600${Math.floor(1000 + Math.random() * 9000)}`,
      minStockLevel: newProdMinStock,
    });

    setNewProdModalOpen(false);
    setNewProdName('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Inventory, Central Cellar & Stock Logistics
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Live Stock Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time bottle inventory, butchery cold carcass levels, stock-take variance reconciliations, and restock purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('manage_inventory') && (
            <button
              onClick={() => setNewProdModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Total Catalog SKU Count</span>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">
              {products.length} Items
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-rose-400 font-semibold">Low Safety Stock Warnings</span>
            <div className="text-2xl font-bold text-rose-400 font-mono mt-0.5">
              {lowStockProducts.length} Items
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/40 text-rose-400 flex items-center justify-center border border-rose-800/40">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-emerald-400 font-semibold">Butchery Cold Carcass Stock</span>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">
              {butcheryCuts.reduce((s, c) => s + c.stockKg, 0).toFixed(1)} KG
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item name, SKU or barcode..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-300 text-xs"
          >
            <option value="ALL">All Departments</option>
            <option value="BAR_CLUB">Bar & VIP Club</option>
            <option value="RESTAURANT">Restaurant & Kitchen</option>
            <option value="HOTEL_ROOMS">Hotel Supplies</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Product Name / Barcode</th>
                <th className="p-3.5">Category / Dept</th>
                <th className="p-3.5">Selling Price</th>
                <th className="p-3.5">Cost Price</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Safety Min</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((prod) => {
                const isLow = prod.stock <= prod.minStockLevel;
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{prod.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Barcode: {prod.barcode}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {prod.category}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{prod.department}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-amber-400">
                      KES {prod.price.toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      KES {prod.costPrice.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`font-mono font-bold text-sm ${isLow ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                        {prod.stock} {prod.unit}s
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {prod.minStockLevel} {prod.unit}s
                    </td>
                    <td className="p-3.5">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                          Reorder Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                          Healthy Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenStockAdjust(prod)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjust Modal */}
      {stockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleStockSubmit}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-orange-400" />
                Stock Intake / Transfer
              </h3>
              <button
                type="button"
                onClick={() => setStockModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-white">{selectedProduct.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Current Stock: <strong className="text-white font-mono">{selectedProduct.stock} {selectedProduct.unit}s</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px]">Stock Delta (+ To Add, - To Write-Off)</label>
                <input
                  type="number"
                  required
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs font-bold"
                />
              </div>

              <div className="flex gap-2">
                {[6, 12, 24, 48].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStockDelta(amt)}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStockModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-bold cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Save Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Product Modal */}
      {newProdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                Add Product to Catalog
              </h3>
              <button
                type="button"
                onClick={() => setNewProdModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 text-[10px]">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Gordon's Pink Gin 750ml"
                  className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Department</label>
                  <select
                    value={newProdDept}
                    onChange={(e) => setNewProdDept(e.target.value as any)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="BAR_CLUB">Bar & VIP Club</option>
                    <option value="RESTAURANT">Restaurant & Kitchen</option>
                    <option value="HOTEL_ROOMS">Hotel Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                  >
                    <option value="Beers">Beers</option>
                    <option value="Wines">Wines</option>
                    <option value="Spirits">Spirits</option>
                    <option value="Cocktails">Cocktails</option>
                    <option value="Soft drinks">Soft drinks</option>
                    <option value="Food">Food</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Selling Price (KES)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Cost Price (KES)</label>
                  <input
                    type="number"
                    required
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Min Reorder Threshold</label>
                  <input
                    type="number"
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(Number(e.target.value))}
                    className="w-full mt-0.5 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewProdModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-bold cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
