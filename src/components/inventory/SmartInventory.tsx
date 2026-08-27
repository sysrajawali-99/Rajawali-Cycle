import React, { useState, useMemo, useRef } from 'react';
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
  FileText,
  Download,
  Calendar,
  Layers,
  DollarSign,
  FileSpreadsheet,
  UploadCloud,
  Upload,
  FileCheck2,
  X,
  Info
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
import { generateInventoryUsagePDF } from '../../utils/pdfExport';
import {
  downloadInventoryTemplateXLSX,
  downloadInventoryTemplateCSV,
  exportMasterInventoryToXLSX,
  parseInventoryFile,
  BulkParsedInventoryItem
} from '../../utils/inventoryExcel';

interface SmartInventoryProps {
  projects: Project[];
  inventoryItems: InventoryItem[];
  projectStocks: ProjectStock[];
  inventoryLogs: InventoryLog[];
  selectedProjectId: string;
  onUpdateStocks: (updated: ProjectStock[]) => void;
  onAddLog: (log: InventoryLog) => void;
  onAddMasterItem: (item: InventoryItem) => void;
  onUpdateInventoryItems?: (items: InventoryItem[]) => void;
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
  onUpdateInventoryItems,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'recap' | 'logs' | 'catalog'>('stocks');
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>(
    selectedProjectId !== 'ALL' ? selectedProjectId : projects[0]?.id || 'proj-1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Recap Tab Specific Filter States
  const [recapProjectFilter, setRecapProjectFilter] = useState<string>(
    selectedProjectId !== 'ALL' ? selectedProjectId : 'ALL'
  );
  const [recapCategoryFilter, setRecapCategoryFilter] = useState<string>('ALL');
  const [recapStartDate, setRecapStartDate] = useState<string>('2026-08-01');
  const [recapEndDate, setRecapEndDate] = useState<string>('2026-08-31');
  const [recapSearch, setRecapSearch] = useState<string>('');

  // Modals
  const [stockActionModal, setStockActionModal] = useState<{
    type: 'IN' | 'OUT';
    item: InventoryItem;
    currentStock: number;
  } | null>(null);

  const [showAddMasterModal, setShowAddMasterModal] = useState(false);

  // Bulk Upload Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkParsedList, setBulkParsedList] = useState<BulkParsedInventoryItem[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkErrorMessage, setBulkErrorMessage] = useState<string | null>(null);
  const [bulkImportMode, setBulkImportMode] = useState<'append' | 'replace'>('append');
  const [bulkInitStockForProjects, setBulkInitStockForProjects] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Bulk File Selection & Parsing Handler
  const handleBulkFileSelected = async (file: File) => {
    setBulkFile(file);
    setBulkErrorMessage(null);
    setIsBulkLoading(true);

    try {
      const parsed = await parseInventoryFile(file);
      setBulkParsedList(parsed);
    } catch (err: any) {
      console.error('Error parsing inventory file:', err);
      setBulkErrorMessage(err.message || 'Gagal membaca file spreadsheet/CSV.');
      setBulkParsedList([]);
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Download template handlers
  const handleDownloadTemplateXLSX = () => {
    downloadInventoryTemplateXLSX();
  };

  const handleDownloadTemplateCSVDelimited = (delim: ';' | ',') => {
    downloadInventoryTemplateCSV(delim);
  };

  const handleExportMasterToXLSX = () => {
    exportMasterInventoryToXLSX(inventoryItems, projectStocks, projects);
  };

  // Execute Bulk Import
  const handleExecuteBulkImport = () => {
    const validItems = bulkParsedList.filter((item) => item.isValid);
    if (validItems.length === 0) {
      alert('Tidak ada data barang yang valid untuk di-import.');
      return;
    }

    const itemsToSave: InventoryItem[] = validItems.map((p) => p.item);
    let finalMasterCatalog: InventoryItem[] = [];

    if (bulkImportMode === 'replace') {
      finalMasterCatalog = itemsToSave;
    } else {
      // Append / Merge: update existing by code or append new
      const catalogMap = new Map<string, InventoryItem>();
      inventoryItems.forEach((existing) => {
        catalogMap.set(existing.code.toLowerCase(), existing);
      });
      itemsToSave.forEach((newItem) => {
        catalogMap.set(newItem.code.toLowerCase(), newItem);
      });
      finalMasterCatalog = Array.from(catalogMap.values());
    }

    if (onUpdateInventoryItems) {
      onUpdateInventoryItems(finalMasterCatalog);
    } else {
      // Fallback if not provided
      itemsToSave.forEach((it) => onAddMasterItem(it));
    }

    // Optional: Initialize project stock for all projects if initial stock specified
    if (bulkInitStockForProjects) {
      const nowStr = new Date().toISOString().split('T')[0];
      const nextStocks = [...projectStocks];

      validItems.forEach((p) => {
        if (p.initialStock > 0) {
          projects.forEach((proj) => {
            const existingIdx = nextStocks.findIndex(
              (s) => s.itemId === p.item.id && s.projectId === proj.id
            );
            if (existingIdx >= 0) {
              // Update stock if replacing or append
              nextStocks[existingIdx] = {
                ...nextStocks[existingIdx],
                currentStock: p.initialStock,
                lastUpdated: nowStr
              };
            } else {
              nextStocks.push({
                id: `stk-${Date.now()}-${proj.id}-${p.item.id}`,
                projectId: proj.id,
                itemId: p.item.id,
                currentStock: p.initialStock,
                lastUpdated: nowStr
              });
            }
          });
        }
      });

      onUpdateStocks(nextStocks);
    }

    alert(
      `Berhasil mengimpor ${validItems.length} Master Barang ke dalam sistem Rajawali!` +
        (bulkInitStockForProjects ? ' Stok awal per lokasi telah disinkronisasikan.' : '')
    );

    setShowBulkModal(false);
    setBulkFile(null);
    setBulkParsedList([]);
    setActiveTab('catalog');
  };

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

  // ----------------------------------------------------
  // RECAP COMPUTATION (Daily Usage Filtered by Project/Category/Date)
  // ----------------------------------------------------
  const recapUsageLogs = useMemo(() => {
    return inventoryLogs.filter((log) => {
      if (log.type !== 'OUT') return false;
      if (recapProjectFilter !== 'ALL' && log.projectId !== recapProjectFilter) return false;

      const item = inventoryItems.find((i) => i.id === log.itemId);
      if (recapCategoryFilter !== 'ALL' && item?.category !== recapCategoryFilter) return false;

      // Date filter (assuming log.date starts with YYYY-MM-DD)
      const logDate = log.date.split(' ')[0];
      if (recapStartDate && logDate < recapStartDate) return false;
      if (recapEndDate && logDate > recapEndDate) return false;

      // Search query
      if (recapSearch.trim() !== '') {
        const q = recapSearch.toLowerCase();
        const itemName = item?.name.toLowerCase() || '';
        const itemCode = item?.code.toLowerCase() || '';
        const pic = log.pic.toLowerCase();
        const notes = log.notes.toLowerCase();
        return itemName.includes(q) || itemCode.includes(q) || pic.includes(q) || notes.includes(q);
      }

      return true;
    });
  }, [inventoryLogs, inventoryItems, recapProjectFilter, recapCategoryFilter, recapStartDate, recapEndDate, recapSearch]);

  const recapStats = useMemo(() => {
    let totalQty = 0;
    let totalEstimatedCost = 0;

    recapUsageLogs.forEach((log) => {
      const item = inventoryItems.find((i) => i.id === log.itemId);
      totalQty += log.quantity;
      totalEstimatedCost += log.quantity * (item?.unitPrice || 0);
    });

    return {
      totalTransactions: recapUsageLogs.length,
      totalQty,
      totalEstimatedCost
    };
  }, [recapUsageLogs, inventoryItems]);

  const handleDownloadUsagePDF = () => {
    generateInventoryUsagePDF({
      inventoryLogs,
      inventoryItems,
      projects,
      selectedProjectId: recapProjectFilter,
      startDate: recapStartDate,
      endDate: recapEndDate,
      categoryFilter: recapCategoryFilter
    });
  };

  const activeProjectObj = projects.find((p) => p.id === activeProjectFilter);
  const recapProjectObj = projects.find((p) => p.id === recapProjectFilter);

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
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            id="tab-stocks-btn"
            onClick={() => setActiveTab('stocks')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'stocks'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stok di Lokasi ({stockRows.length})</span>
          </button>

          {/* REKAP PEMAKAIAN HARIAN TAB */}
          <button
            id="tab-recap-btn"
            onClick={() => setActiveTab('recap')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'recap'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Rekap Pemakaian Harian (PDF)</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
              {recapUsageLogs.length}
            </span>
          </button>

          <button
            id="tab-logs-btn"
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
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
      ) : activeTab === 'recap' ? (
        /* ---------------------------------------------------- */
        /* TAB: REKAP PEMAKAIAN HARIAN DENGAN DOWNLOAD PDF */
        /* ---------------------------------------------------- */
        <div className="space-y-4">
          {/* Top Recap Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>Rekap Pemakaian Harian Smart Inventory & Chemical</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Laporan resmi pemakaian bahan kimia & alat kerja harian. Dapat difilter per lokasi proyek atau konsolidasi seluruh gedung.
                </p>
              </div>

              {/* Direct PDF Download Button */}
              <button
                id="download-inventory-recap-pdf-btn"
                onClick={handleDownloadUsagePDF}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 border border-emerald-400/30 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Rekap (A4)</span>
              </button>
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filter 1: Lokasi Proyek */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Filter Lokasi Proyek:
                </label>
                <select
                  id="recap-project-filter"
                  value={recapProjectFilter}
                  onChange={(e) => setRecapProjectFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">
                    🏢 Semua Lokasi Proyek (Konsolidasi Pusat)
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      📍 {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Kategori Item */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Kategori Chemical / Alat:
                </label>
                <select
                  id="recap-category-filter"
                  value={recapCategoryFilter}
                  onChange={(e) => setRecapCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">Semua Kategori</option>
                  <option value="Chemical" className="bg-slate-900">Chemical (Pembersih Cair)</option>
                  <option value="Equipment" className="bg-slate-900">Equipment (Alat Berat / Mesin)</option>
                  <option value="Consumable" className="bg-slate-900">Consumable (Plastik / Lap)</option>
                  <option value="Safety / APD" className="bg-slate-900">Safety / APD</option>
                </select>
              </div>

              {/* Filter 3: Rentang Tanggal Mulai */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tanggal Mulai:
                </label>
                <input
                  id="recap-start-date"
                  type="date"
                  value={recapStartDate}
                  onChange={(e) => setRecapStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Filter 4: Rentang Tanggal Selesai */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tanggal Selesai:
                </label>
                <input
                  id="recap-end-date"
                  type="date"
                  value={recapEndDate}
                  onChange={(e) => setRecapEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Keyword Search Bar for Recap */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                id="recap-search-input"
                type="text"
                placeholder="Cari nama chemical, PIC pengambil, atau area pembersihan..."
                value={recapSearch}
                onChange={(e) => setRecapSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* 3 Executive Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                Total Transaksi Pemakaian
              </span>
              <div className="text-2xl font-black text-white">
                {recapStats.totalTransactions}{' '}
                <span className="text-xs font-normal text-slate-400">Log Pengeluaran</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Periode {recapStartDate} s/d {recapEndDate}
              </div>
            </div>

            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">
                Total Volume / Kuantitas Terpakai
              </span>
              <div className="text-2xl font-black text-emerald-400">
                {recapStats.totalQty}{' '}
                <span className="text-xs font-normal text-slate-400">Unit / Jerigen / Pcs</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Lokasi: {recapProjectFilter === 'ALL' ? 'Semua Gedung (5 Proyek)' : recapProjectObj?.name}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                Estimasi Biaya Nilai Chemical
              </span>
              <div className="text-2xl font-black text-amber-400 truncate">
                {formatCurrency(recapStats.totalEstimatedCost)}
              </div>
              <div className="text-[11px] text-slate-500">
                Berdasarkan harga satuan master barang
              </div>
            </div>
          </div>

          {/* Detailed Usage Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Daftar Rincian Pemakaian Harian (Log OUT)
                </h4>
                <p className="text-xs text-slate-400">
                  Menampilkan {recapUsageLogs.length} catatan pemakaian chemical & alat
                </p>
              </div>
              <button
                onClick={handleDownloadUsagePDF}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Simpan PDF A4</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 text-center">No</th>
                    <th className="py-3 px-3">Tanggal & Waktu</th>
                    <th className="py-3 px-3">Lokasi Proyek</th>
                    <th className="py-3 px-3">Chemical / Alat</th>
                    <th className="py-3 px-3 text-center">Kategori</th>
                    <th className="py-3 px-3 text-center">Qty Pakai</th>
                    <th className="py-3 px-3 text-center">Sisa Stok</th>
                    <th className="py-3 px-3 text-right">Nilai Biaya</th>
                    <th className="py-3 px-3">Petugas PIC</th>
                    <th className="py-3 px-4">Area & Keperluan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recapUsageLogs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500">
                        <div className="space-y-2">
                          <Package className="w-8 h-8 text-slate-600 mx-auto" />
                          <div className="font-bold text-slate-400">Tidak ada data pemakaian untuk filter ini.</div>
                          <p className="text-[11px] text-slate-500">
                            Coba ubah rentang tanggal atau pilih lokasi proyek lain.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recapUsageLogs.map((log, index) => {
                      const item = inventoryItems.find((i) => i.id === log.itemId);
                      const proj = projects.find((p) => p.id === log.projectId);
                      const lineCost = log.quantity * (item?.unitPrice || 0);

                      return (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-500">
                            {index + 1}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-300">
                            {log.date}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white text-xs">{proj?.name || '-'}</div>
                            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.2 rounded">
                              {proj?.code}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-200">{item?.name || log.itemId}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item?.code}</div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-700">
                              {item?.category || 'Chemical'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              -{log.quantity} {item?.unit || 'Unit'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-amber-400">
                            {log.newStock} {item?.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-300">
                            {formatCurrency(lineCost)}
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-medium">
                            {log.pic}
                          </td>
                          <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                            {log.notes}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">Katalog Master Chemical, Alat & APD</h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold font-mono">
                  {inventoryItems.length} Item
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Daftar standarisasi bahan kimia pembersih, alat operasional, dan perlengkapan safety PT Rajawali.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Template Download Group */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
                <button
                  id="btn-download-inv-template-xlsx"
                  onClick={handleDownloadTemplateXLSX}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white font-bold text-xs rounded-lg border border-emerald-500/40 transition cursor-pointer"
                  title="Unduh Template Excel (.xlsx) dengan kolom terpisah A-H"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Template Excel (.xlsx)</span>
                </button>
                <button
                  id="btn-download-inv-template-csv"
                  onClick={() => handleDownloadTemplateCSVDelimited(';')}
                  className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] font-semibold rounded-lg transition cursor-pointer"
                  title="Unduh Template CSV (Titik Koma ';' - Standar Excel Indonesia)"
                >
                  <Download className="w-3 h-3 text-slate-400" />
                  <span>CSV (;)</span>
                </button>
              </div>

              {/* Export Master Items */}
              <button
                id="btn-export-master-inventory"
                onClick={handleExportMasterToXLSX}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                title="Export seluruh katalog master barang ke format Excel (.xlsx)"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Master (.xlsx)</span>
              </button>

              {/* Bulk Upload Button */}
              <button
                id="btn-open-bulk-upload-inventory"
                onClick={() => {
                  setShowBulkModal(true);
                  setBulkFile(null);
                  setBulkParsedList([]);
                  setBulkErrorMessage(null);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white font-bold text-xs rounded-xl border border-blue-500/40 shadow-sm transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Upload Massal (Excel / CSV)</span>
              </button>

              {/* Single Master Add */}
              <button
                id="add-master-item-btn"
                onClick={() => setShowAddMasterModal(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Master</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventoryItems.map((item) => (
              <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs hover:border-slate-700 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <span className="text-amber-400 font-mono text-[11px]">{item.code}</span>
                  </div>
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-700">
                    {item.category}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">{item.description || 'Tidak ada deskripsi'}</p>
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

      {/* Bulk Upload Modal for Master Items */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Upload Massal Master Barang (Excel .xlsx / CSV)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal">
                      Multi-Format
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Impor data master chemical, peralatan, consumable, dan APD dalam jumlah besar sekaligus dengan kolom terpisah.
                  </p>
                </div>
              </div>
              <button
                id="btn-close-bulk-inventory-modal"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Step 1: Download Template */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">
                      1
                    </span>
                    <span>Unduh Template Format Resmi (Kolom Terpisah A - H)</span>
                  </div>

                  {/* Template download buttons */}
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <button
                      id="bulk-modal-download-xlsx-btn"
                      onClick={handleDownloadTemplateXLSX}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm transition cursor-pointer text-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Template Excel (.xlsx)</span>
                    </button>
                    <button
                      id="bulk-modal-download-csv-semicolon-btn"
                      onClick={() => handleDownloadTemplateCSVDelimited(';')}
                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition cursor-pointer text-[11px]"
                      title="Format titik koma (;) standar Excel regional Indonesia"
                    >
                      <Download className="w-3 h-3 text-slate-400" />
                      <span>CSV (Titik Koma ';')</span>
                    </button>
                    <button
                      id="bulk-modal-download-csv-comma-btn"
                      onClick={() => handleDownloadTemplateCSVDelimited(',')}
                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition cursor-pointer text-[11px]"
                      title="Format koma (,) standar internasional"
                    >
                      <Download className="w-3 h-3 text-slate-400" />
                      <span>CSV (Koma ',')</span>
                    </button>
                  </div>
                </div>

                {/* Column Mapping Legend */}
                <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-[11px] text-slate-300">
                  <div className="font-semibold text-slate-200 mb-1.5 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>Struktur Kolom Template:</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10.5px]">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <b className="text-amber-400">Kolom A:</b> Kode Barang <br />
                      <span className="text-slate-400">(Cth: CHM-101, TLS-201)</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <b className="text-amber-400">Kolom B:</b> Nama Barang <br />
                      <span className="text-slate-400">(Wajib diisi)</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <b className="text-amber-400">Kolom C:</b> Kategori <br />
                      <span className="text-slate-400">(Chemical/Tools/Safety)</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <b className="text-amber-400">Kolom D:</b> Satuan <br />
                      <span className="text-slate-400">(Jerigen 5L / Pcs / Unit)</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <b className="text-amber-400">Kolom E:</b> Min. Stok <br />
                      <span className="text-slate-400">(Angka batas kritis)</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <b className="text-amber-400">Kolom F:</b> Harga Satuan <br />
                      <span className="text-slate-400">(Angka Rupiah, cth: 75000)</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <b className="text-amber-400">Kolom G:</b> Deskripsi <br />
                      <span className="text-slate-400">(Fungsi pemakaian)</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                      <b className="text-amber-400">Kolom H:</b> Stok Awal <br />
                      <span className="text-slate-400">(Saldo awal per lokasi)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload File */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  <span>Pilih atau Tarik File Spreadsheet (.xlsx, .xls, .csv)</span>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleBulkFileSelected(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/80 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv, text/csv, text/plain, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleBulkFileSelected(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="p-3 bg-slate-900 group-hover:bg-amber-500/10 rounded-full border border-slate-800 group-hover:border-amber-500/30 text-slate-400 group-hover:text-amber-400 transition">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {bulkFile ? bulkFile.name : 'Klik untuk pilih file atau tarik file ke area ini'}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV dengan auto-detect separator
                    </p>
                  </div>
                  {bulkFile && (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[11px] font-mono font-semibold">
                      {(bulkFile.size / 1024).toFixed(1)} KB • Terpilih
                    </span>
                  )}
                </div>

                {isBulkLoading && (
                  <div className="flex items-center justify-center space-x-2 py-4 text-amber-400">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Membaca dan memvalidasi baris data file...</span>
                  </div>
                )}

                {bulkErrorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{bulkErrorMessage}</span>
                  </div>
                )}
              </div>

              {/* Step 3: Parsed Data Preview & Options */}
              {bulkParsedList.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                          3
                        </span>
                        <span>Pratinjau Data ({bulkParsedList.length} Baris Terdeteksi)</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold">
                        {bulkParsedList.filter((p) => p.isValid).length} Valid
                      </span>
                      {bulkParsedList.filter((p) => !p.isValid).length > 0 && (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[11px] font-bold">
                          {bulkParsedList.filter((p) => !p.isValid).length} Perlu Dicek
                        </span>
                      )}
                    </div>

                    {/* Import Mode Options */}
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="importMode"
                          checked={bulkImportMode === 'append'}
                          onChange={() => setBulkImportMode('append')}
                          className="accent-amber-500"
                        />
                        <span>Tambah / Update (Append)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="importMode"
                          checked={bulkImportMode === 'replace'}
                          onChange={() => setBulkImportMode('replace')}
                          className="accent-amber-500"
                        />
                        <span className="text-amber-400 font-medium">Ganti Total (Replace)</span>
                      </label>
                    </div>
                  </div>

                  {/* Stock Initialization Checkbox */}
                  <div className="flex items-center space-x-2 px-1 text-slate-300">
                    <input
                      id="init-project-stock-check"
                      type="checkbox"
                      checked={bulkInitStockForProjects}
                      onChange={(e) => setBulkInitStockForProjects(e.target.checked)}
                      className="accent-amber-500 rounded cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="init-project-stock-check" className="cursor-pointer">
                      Otomatis inisialisasi <b>Stok Awal</b> (Kolom H) ke seluruh lokasi gedung proyek aktif ({projects.length} Lokasi Proyek).
                    </label>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Kode</th>
                          <th className="p-2.5">Nama Barang</th>
                          <th className="p-2.5">Kategori</th>
                          <th className="p-2.5">Satuan</th>
                          <th className="p-2.5 text-center">Min. Stok</th>
                          <th className="p-2.5 text-right">Harga Satuan</th>
                          <th className="p-2.5 text-center">Stok Awal</th>
                          <th className="p-2.5">Catatan / Validasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                        {bulkParsedList.map((row, idx) => (
                          <tr key={idx} className={row.isValid ? 'hover:bg-slate-800/30' : 'bg-rose-950/20'}>
                            <td className="p-2.5">
                              {row.isValid ? (
                                <span className="flex items-center text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                                  OK
                                </span>
                              ) : (
                                <span className="flex items-center text-rose-400 font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />
                                  Error
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono text-amber-400 font-bold">{row.item.code}</td>
                            <td className="p-2.5 text-white font-medium">{row.item.name}</td>
                            <td className="p-2.5">
                              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                                {row.item.category}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-300">{row.item.unit}</td>
                            <td className="p-2.5 text-center text-rose-400 font-bold">{row.item.minStock}</td>
                            <td className="p-2.5 text-right font-mono text-amber-300">
                              {formatCurrency(row.item.unitPrice)}
                            </td>
                            <td className="p-2.5 text-center font-bold text-emerald-400">
                              {row.initialStock}
                            </td>
                            <td className="p-2.5 text-slate-400 max-w-xs truncate">
                              {row.notes || (row.isValid ? 'Siap di-import' : 'Data tidak lengkap')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
              <span className="text-slate-400 text-xs">
                {bulkParsedList.length > 0
                  ? `${bulkParsedList.filter((p) => p.isValid).length} dari ${bulkParsedList.length} baris siap disimpan.`
                  : 'Silakan pilih file Excel / CSV terlebih dahulu.'}
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="execute-bulk-inventory-import-btn"
                  type="button"
                  disabled={bulkParsedList.filter((p) => p.isValid).length === 0 || isBulkLoading}
                  onClick={handleExecuteBulkImport}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>
                    Import {bulkParsedList.filter((p) => p.isValid).length} Master Barang
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
