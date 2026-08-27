import React, { useState, useMemo } from 'react';
import {
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  History,
  Building2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  BarChart3,
  FileText
} from 'lucide-react';
import {
  Project,
  InventoryItem,
  ProjectStock,
  InventoryLog,
  InventoryCategory,
  UserRole
} from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface SmartInventoryProps {
  projects: Project[];
  inventoryItems: InventoryItem[];
  projectStocks: ProjectStock[];
  inventoryLogs: InventoryLog[];
  selectedProjectId: string;
  onUpdateStocks: (updated: ProjectStock[]) => void;
  onAddLog: (log: InventoryLog) => void;
  onAddMasterItem: (item: InventoryItem) => void;
  userRole: UserRole;
}

export const SmartInventory: React.FC<SmartInventoryProps> = ({
  projects = [],
  inventoryItems = [],
  projectStocks = [],
  inventoryLogs = [],
  selectedProjectId = 'ALL',
  onUpdateStocks,
  onAddLog,
  onAddMasterItem,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'logs' | 'catalog'>('stocks');
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>(
    selectedProjectId !== 'ALL' ? selectedProjectId : projects[0]?.id || 'proj-1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals
  const [stockActionModal, setStockActionModal] = useState<{
    type: 'IN' | 'OUT';
    item: InventoryItem;
    currentStock: number;
  } | null>(null);

  const [showAddMasterModal, setShowAddMasterModal] = useState(false);

  // Stock Action Form State
  const [actionForm, setActionForm] = useState<{
    quantity: number;
    pic: string;
    notes: string;
  }>({
    quantity: 1,
    pic: 'Admin Operasional',
    notes: ''
  });

  // Master Item Form State
  const [masterForm, setMasterForm] = useState<{
    code: string;
    name: string;
    category: InventoryCategory;
    unit: string;
    minStock: number;
    description: string;
    unitPrice: number;
  }>({
    code: `CHM-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    category: 'Chemical',
    unit: 'Jerigen 5L',
    minStock: 4,
    description: '',
    unitPrice: 75000
  });

  // Helper to get stock for an item in current selected project
  const getItemStock = (itemId: string, projId: string): number => {
    const found = projectStocks.find(
      (ps) => ps.itemId === itemId && ps.projectId === projId
    );
    return found ? found.currentStock : 0;
  };

  // Stock rows for the active project
  const stockRows = useMemo(() => {
    return inventoryItems
      .filter((item) => {
        if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            item.code.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .map((item) => {
        const currentStock = getItemStock(item.id, activeProjectFilter);
        const isCritical = currentStock <= item.minStock;
        return {
          item,
          currentStock,
          isCritical
        };
      });
  }, [inventoryItems, projectStocks, activeProjectFilter, categoryFilter, searchQuery]);

  // Critical items count in active project
  const criticalItemsCount = useMemo(() => {
    return stockRows.filter((r) => r.isCritical).length;
  }, [stockRows]);

  // Handle Restock (IN) or Usage (OUT)
  const handleExecuteStockAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockActionModal) return;

    const { type, item, currentStock } = stockActionModal;
    const qty = Number(actionForm.quantity) || 0;

    if (qty <= 0) {
      alert('Jumlah quantity harus lebih besar dari 0!');
      return;
    }

    if (type === 'OUT' && qty > currentStock) {
      alert(`Stok tidak mencukupi! Sisa stok saat ini hanya ${currentStock} ${item.unit}`);
      return;
    }

    const newStock = type === 'IN' ? currentStock + qty : currentStock - qty;

    // 1. Update Project Stock
    const nextStocks = [...projectStocks];
    const existingIdx = nextStocks.findIndex(
      (ps) => ps.itemId === item.id && ps.projectId === activeProjectFilter
    );

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (existingIdx >= 0) {
      nextStocks[existingIdx] = {
        ...nextStocks[existingIdx],
        currentStock: newStock,
        lastUpdated: nowStr.split(' ')[0]
      };
    } else {
      nextStocks.push({
        id: `stk-${Date.now()}`,
        projectId: activeProjectFilter,
        itemId: item.id,
        currentStock: newStock,
        lastUpdated: nowStr.split(' ')[0]
      });
    }

    // 2. Create Audit Log
    const newLog: InventoryLog = {
      id: `log-${Date.now()}`,
      projectId: activeProjectFilter,
      itemId: item.id,
      type,
      quantity: qty,
      previousStock: currentStock,
      newStock,
      date: nowStr,
      pic: actionForm.pic || 'Admin Site',
      notes: actionForm.notes || (type === 'IN' ? 'Restock dari gudang pusat' : 'Pemakaian rutin operasional')
    };

    onUpdateStocks(nextStocks);
    onAddLog(newLog);
    setStockActionModal(null);
  };

  // Handle Add Master Catalog Item
  const handleSaveMasterItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterForm.name.trim()) return;

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      ...masterForm
    };

    onAddMasterItem(newItem);
    setShowAddMasterModal(false);
  };

  const activeProjectObj = projects.find((p) => p.id === activeProjectFilter);

  return (
    <div className="space-y-4">
      {/* Header & Site Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Smart Inventory & Chemical Tracker
                </h1>
                {criticalItemsCount > 0 && (
                  <span className="flex items-center space-x-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{criticalItemsCount} Item Kritis</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Pencatatan real-time penerimaan stok (Restock) dan pemakaian harian chemical / alat pembersih.
              </p>
            </div>
          </div>

          {/* Project Site Selector for Inventory */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
            <select
              id="inventory-project-select"
              value={activeProjectFilter}
              onChange={(e) => setActiveProjectFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-3"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  📍 {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-4 pt-3 border-t border-slate-800">
          <button
            id="tab-stocks-btn"
            onClick={() => setActiveTab('stocks')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'stocks'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stok di Lokasi ({stockRows.length})</span>
          </button>
          <button
            id="tab-logs-btn"
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'logs'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Keluar / Masuk ({inventoryLogs.filter(l => l.projectId === activeProjectFilter).length})</span>
          </button>
          <button
            id="tab-catalog-btn"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Katalog Master Chemical & Alat</span>
          </button>
        </div>
      </div>

      {activeTab === 'stocks' ? (
        <>
          {/* Low stock alert banner */}
          {criticalItemsCount > 0 && (
            <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl flex items-start space-x-3 text-xs text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-300">Peringatan Batas Stok Rendah (Restock Needed)</div>
                <p className="text-slate-300 mt-0.5">
                  Terdapat <span className="font-bold text-rose-400">{criticalItemsCount} item</span> di lokasi{' '}
                  <span className="font-bold text-white">{activeProjectObj?.name}</span> yang berada di bawah batas minimum aman. Segera lakukan input permintaan restock dari gudang pusat.
                </p>
              </div>
            </div>
          )}

          {/* Filters & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2 col-span-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="inventory-search-input"
                type="text"
                placeholder="Cari nama chemical, kode barang, fungsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
              <span className="text-xs text-slate-400 shrink-0">Kategori:</span>
              <select
                id="inventory-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Kategori</option>
                <option value="Chemical" className="bg-slate-900">Chemical (Cairan Pembersih)</option>
                <option value="Equipment" className="bg-slate-900">Equipment (Alat Berat / Mesin)</option>
                <option value="Consumable" className="bg-slate-900">Consumable (Plastik / Lap)</option>
                <option value="Safety / APD" className="bg-slate-900">Safety / APD</option>
              </select>
            </div>
          </div>

          {/* Stocks Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Kode & Nama Barang</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5 text-center">Satuan</th>
                    <th className="p-3.5 text-center">Min. Stok</th>
                    <th className="p-3.5 text-center">Sisa Stok Saat Ini</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Aksi Cepat Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {stockRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500">
                        Tidak ada data stok yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    stockRows.map(({ item, currentStock, isCritical }) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          isCritical ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        {/* Item Name */}
                        <td className="p-3.5">
                          <div className="font-bold text-white flex items-center space-x-2">
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            <span className="text-amber-400 font-mono">{item.code}</span>
                            <span className="mx-1">•</span>
                            <span>{item.description}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3.5">
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-700">
                            {item.category}
                          </span>
                        </td>

                        {/* Unit */}
                        <td className="p-3.5 text-center font-medium text-slate-300">
                          {item.unit}
                        </td>

                        {/* Min Stock */}
                        <td className="p-3.5 text-center font-semibold text-slate-400">
                          {item.minStock} {item.unit}
                        </td>

                        {/* Current Stock */}
                        <td className="p-3.5 text-center">
                          <span
                            className={`text-base font-black px-3 py-1 rounded-xl inline-block ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {currentStock}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="p-3.5 text-center">
                          {isCritical ? (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Stok Kritis</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aman / Normal</span>
                            </span>
                          )}
                        </td>

                        {/* Action Buttons: Stock In & Usage */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Stock IN */}
                            <button
                              id={`stock-in-btn-${item.id}`}
                              onClick={() => {
                                setStockActionModal({
                                  type: 'IN',
                                  item,
                                  currentStock
                                });
                                setActionForm({
                                  quantity: 1,
                                  pic: userRole,
                                  notes: `Penerimaan restock gudang pusat ${activeProjectObj?.name}`
                                });
                              }}
                              title="Penerimaan Barang Masuk (Restock)"
                              className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors shadow-sm cursor-pointer"
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              <span>+ Masuk</span>
                            </button>

                            {/* Stock OUT (Usage) */}
                            <button
                              id={`stock-out-btn-${item.id}`}
                              onClick={() => {
                                setStockActionModal({
                                  type: 'OUT',
                                  item,
                                  currentStock
                                });
                                setActionForm({
                                  quantity: 1,
                                  pic: userRole,
                                  notes: 'Pemakaian harian operasional cleaning'
                                });
                              }}
                              title="Catat Pemakaian Harian"
                              className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg transition-colors shadow-sm cursor-pointer"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>- Pakai</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'logs' ? (
        /* Inventory Logs Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">
                Log Audit Keluar-Masuk Barang ({activeProjectObj?.name})
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan transparan untuk mencegah kebocoran logistik dan bahan kimia di lokasi proyek.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {inventoryLogs.filter((l) => l.projectId === activeProjectFilter).length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Belum ada catatan transaksi stok pada lokasi ini.
              </div>
            ) : (
              inventoryLogs
                .filter((l) => l.projectId === activeProjectFilter)
                .map((log) => {
                  const item = inventoryItems.find((i) => i.id === log.itemId);
                  const isIN = log.type === 'IN';

                  return (
                    <div key={log.id} className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-xl text-white font-bold ${
                            isIN ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        >
                          {isIN ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{item?.name || 'Item'}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isIN
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              {isIN ? `+${log.quantity} ${item?.unit || ''} MASUK` : `-${log.quantity} ${item?.unit || ''} PAKAI`}
                            </span>
                          </div>

                          <p className="text-slate-300 text-xs mt-1">"{log.notes}"</p>

                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                            <span>Stok Awal: <b className="text-slate-300">{log.previousStock}</b></span>
                            <span>➔</span>
                            <span>Sisa Stok: <b className="text-amber-400">{log.newStock}</b></span>
                            <span>•</span>
                            <span>PIC: <b className="text-slate-300">{log.pic}</b></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-slate-400 text-[11px] shrink-0">
                        {log.date}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      ) : (
        /* Master Catalog Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Katalog Master Chemical, Alat & APD</h3>
              <p className="text-xs text-slate-400">
                Daftar standarisasi bahan kimia dan peralatan kerja outsourcing PT Rajawali.
              </p>
            </div>
            <button
              id="add-master-item-btn"
              onClick={() => setShowAddMasterModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master Barang</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventoryItems.map((item) => (
              <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <span className="text-amber-400 font-mono text-[11px]">{item.code}</span>
                  </div>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-700">
                    {item.category}
                  </span>
                </div>
                <p className="text-slate-400">{item.description}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-300">
                  <span>Satuan: <b className="text-white">{item.unit}</b></span>
                  <span>Min. Stok: <b className="text-rose-400">{item.minStock}</b></span>
                  <span>Harga: <b className="text-amber-400">{formatCurrency(item.unitPrice)}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock IN / OUT Action Modal */}
      {stockActionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>{stockActionModal.type === 'IN' ? '📥 Barang Masuk / Restock' : '📤 Catat Pemakaian Harian'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {stockActionModal.item.name} ({activeProjectObj?.name})
                </p>
              </div>
              <button
                onClick={() => setStockActionModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteStockAction} className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Sisa Stok Saat Ini:</span>
                <span className="font-bold text-white">
                  {stockActionModal.currentStock} {stockActionModal.item.unit}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Jumlah ({stockActionModal.item.unit}):
                </label>
                <input
                  id="stock-qty-input"
                  type="number"
                  min="1"
                  max={stockActionModal.type === 'OUT' ? stockActionModal.currentStock : 9999}
                  required
                  value={actionForm.quantity}
                  onChange={(e) =>
                    setActionForm({ ...actionForm, quantity: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Petugas / Penanggung Jawab (PIC):
                </label>
                <input
                  id="stock-pic-input"
                  type="text"
                  required
                  value={actionForm.pic}
                  onChange={(e) => setActionForm({ ...actionForm, pic: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Nama Admin / Supervisor"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Catatan / Keterangan (No Surat Jalan / Area Penggunaan):
                </label>
                <textarea
                  id="stock-notes-input"
                  rows={2}
                  value={actionForm.notes}
                  onChange={(e) => setActionForm({ ...actionForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder={
                    stockActionModal.type === 'IN'
                      ? 'No Surat Jalan atau tanggal kirim dari pusat...'
                      : 'Area pembersihan (misal: deep sanitasi toilet food court)...'
                  }
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStockActionModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="save-stock-action-btn"
                  type="submit"
                  className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-lg ${
                    stockActionModal.type === 'IN'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                  }`}
                >
                  {stockActionModal.type === 'IN' ? 'Konfirmasi Restock Masuk' : 'Konfirmasi Pemakaian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Master Item Modal */}
      {showAddMasterModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Tambah Master Barang Baru</h3>
              <button
                onClick={() => setShowAddMasterModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMasterItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Barang:</label>
                <input
                  id="master-item-name"
                  type="text"
                  required
                  value={masterForm.name}
                  onChange={(e) => setMasterForm({ ...masterForm, name: e.target.value })}
                  placeholder="Contoh: Marble Polishing Powder"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kode:</label>
                  <input
                    id="master-item-code"
                    type="text"
                    required
                    value={masterForm.code}
                    onChange={(e) => setMasterForm({ ...masterForm, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori:</label>
                  <select
                    id="master-item-category"
                    value={masterForm.category}
                    onChange={(e) =>
                      setMasterForm({ ...masterForm, category: e.target.value as InventoryCategory })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Chemical">Chemical</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Consumable">Consumable</option>
                    <option value="Safety / APD">Safety / APD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Satuan:</label>
                  <input
                    id="master-item-unit"
                    type="text"
                    required
                    value={masterForm.unit}
                    onChange={(e) => setMasterForm({ ...masterForm, unit: e.target.value })}
                    placeholder="Jerigen 5L / Pcs / Unit"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Batas Min. Stok:</label>
                  <input
                    id="master-item-minstock"
                    type="number"
                    min="1"
                    required
                    value={masterForm.minStock}
                    onChange={(e) =>
                      setMasterForm({ ...masterForm, minStock: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan / Fungsi:</label>
                <textarea
                  id="master-item-desc"
                  rows={2}
                  value={masterForm.description}
                  onChange={(e) => setMasterForm({ ...masterForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="Deskripsi bahan dan penggunaan..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMasterModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="save-master-item-submit"
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Simpan Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
