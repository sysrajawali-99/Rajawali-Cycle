import React, { useState, useMemo } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Unlink,
  PlusCircle,
  HelpCircle,
  FileText,
  Printer,
  Download,
  Building2,
  PieChart,
  Calendar,
  Trash2,
  AlertTriangle,
  X,
  RotateCcw
} from 'lucide-react';
import {
  BankStatementImport,
  BankStatementItem,
  FinanceTransaction,
  ChartOfAccount,
  ReconcileStatus,
  AuditTrailItem
} from '../../types/finance';
import { Project, UserAccount } from '../../types';
import { financeService } from '../../services/financeService';
import { BankStatementUploadModal } from './BankStatementUploadModal';
import { getSamplePresetStatement } from '../../utils/bankStatementParser';

interface FinanceBankReconcileProps {
  bankStatements: BankStatementImport[];
  transactions: FinanceTransaction[];
  accounts: ChartOfAccount[];
  projects: Project[];
  currentUser?: UserAccount | null;
  onUpdateStatements: (statements: BankStatementImport[]) => void;
  onAddTransaction: (trx: FinanceTransaction) => void;
  onUpdateTransaction: (trx: FinanceTransaction) => void;
  onLogAudit?: (audit: AuditTrailItem) => void;
}

export const FinanceBankReconcile: React.FC<FinanceBankReconcileProps> = ({
  bankStatements,
  transactions,
  accounts,
  projects,
  currentUser,
  onUpdateStatements,
  onAddTransaction,
  onUpdateTransaction,
  onLogAudit
}) => {
  const [selectedStatementId, setSelectedStatementId] = useState<string>(
    bankStatements[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReconcileStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [manualMatchItem, setManualMatchItem] = useState<BankStatementItem | null>(null);
  const [quickConvertItem, setQuickConvertItem] = useState<BankStatementItem | null>(null);

  // Delete Modals State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [unlinkTransactionsOnDelete, setUnlinkTransactionsOnDelete] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Selected Active Statement
  const activeStatement = useMemo(() => {
    return bankStatements.find((s) => s.id === selectedStatementId) || bankStatements[0];
  }, [bankStatements, selectedStatementId]);

  // Filtered items in active statement
  const filteredItems = useMemo(() => {
    if (!activeStatement) return [];
    return activeStatement.items.filter((item) => {
      if (statusFilter !== 'ALL' && item.matchStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchRef = (item.referenceNumber || '').toLowerCase().includes(q);
        const matchCode = (item.matchedTransactionCode || '').toLowerCase().includes(q);
        if (!matchDesc && !matchRef && !matchCode) return false;
      }
      return true;
    });
  }, [activeStatement, statusFilter, searchQuery]);

  // Reconciliation Statistics
  const stats = useMemo(() => {
    if (!activeStatement) {
      return { totalCount: 0, matchedCount: 0, unmatchedCount: 0, matchPct: 0, totalCr: 0, totalDb: 0 };
    }
    const totalCount = activeStatement.items.length;
    const matchedCount = activeStatement.items.filter(
      (i) => i.matchStatus === 'MATCHED' || i.matchStatus === 'MANUAL_MATCHED'
    ).length;
    const unmatchedCount = totalCount - matchedCount;
    const matchPct = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;
    const totalCr = activeStatement.items
      .filter((i) => i.type === 'CR')
      .reduce((s, i) => s + i.amount, 0);
    const totalDb = activeStatement.items
      .filter((i) => i.type === 'DB')
      .reduce((s, i) => s + i.amount, 0);

    return { totalCount, matchedCount, unmatchedCount, matchPct, totalCr, totalDb };
  }, [activeStatement]);

  // Bank vs Book Ledger Balance comparison
  const bankBookComparison = useMemo(() => {
    if (!activeStatement) {
      return {
        accountName: 'Rekening Buku Kas',
        bankEndingBalance: 0,
        bookBalance: 0,
        variance: 0,
        isReconciled: true
      };
    }

    let matchedAcc = accounts.find((a) => 
      activeStatement.accountNumber && a.name.includes(activeStatement.accountNumber)
    );
    if (!matchedAcc && activeStatement.bankName) {
      const bName = activeStatement.bankName.toUpperCase();
      if (bName.includes('BNI')) {
        matchedAcc = accounts.find((a) => a.code === '1122' || a.name.includes('BNI'));
      } else if (bName.includes('MANDIRI')) {
        matchedAcc = accounts.find((a) => a.code === '1121' || a.name.includes('Mandiri'));
      } else if (bName.includes('BCA')) {
        matchedAcc = accounts.find((a) => a.code === '1120' || a.name.includes('BCA'));
      }
    }
    const primaryAccount = matchedAcc || accounts.find((a) => a.code === '1120') || accounts[0];
    const bookBalance = primaryAccount?.currentBalance || 0;
    const lastBankItem = activeStatement.items[activeStatement.items.length - 1];
    const bankEndingBalance = lastBankItem?.balance || 0;
    const variance = Math.abs(bankEndingBalance - bookBalance);

    return {
      accountName: primaryAccount?.name || 'Rekening Buku Kas',
      bankEndingBalance,
      bookBalance,
      variance,
      isReconciled: variance < 1000
    };
  }, [accounts, activeStatement]);

  // Run Auto-Matching Algorithm on Current Statement
  const handleRunAutoMatch = () => {
    if (!activeStatement) return;

    const matchedItems = financeService.autoMatchBankStatements(
      activeStatement.items,
      transactions
    );

    const updatedStatements = bankStatements.map((s) => {
      if (s.id === activeStatement.id) {
        return {
          ...s,
          items: matchedItems,
          matchedCount: matchedItems.filter((i) => i.matchStatus === 'MATCHED').length,
          unmatchedCount: matchedItems.filter((i) => i.matchStatus === 'UNMATCHED').length
        };
      }
      return s;
    });

    onUpdateStatements(updatedStatements);
    if (onLogAudit) {
      onLogAudit({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        userName: currentUser?.name || 'Finance Admin',
        userRole: currentUser?.role || 'Admin Operasional',
        actionType: 'RECONCILE',
        module: 'Rekonsiliasi Bank',
        recordId: activeStatement.id,
        recordCode: activeStatement.fileName,
        description: `Menjalankan algoritma auto-matching rekonsiliasi ${activeStatement.bankName}`
      });
    }

    setNotification({
      type: 'success',
      message: 'Proses auto-matching selesai! Transaksi yang cocok telah diperbarui.'
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Convert Unmatched Statement Item to New Internal Transaction
  const handleQuickConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickConvertItem || !activeStatement) return;

    const form = e.target as any;
    const accountCode = form.accountCode.value;
    const projectId = form.projectId.value;
    const title = form.title.value;
    const now = new Date();

    const isCr = quickConvertItem.type === 'CR';
    const prefix = isCr ? 'BKM' : 'BKK';
    const code = `${prefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(transactions.length + 1).padStart(3, '0')}`;

    const primaryAccCode = '1120'; // BCA
    const selectedAcc = accounts.find((a) => a.code === accountCode);
    const selectedProj = projects.find((p) => p.id === projectId);

    const newTrx: FinanceTransaction = {
      id: `trx-${Date.now()}`,
      code,
      date: quickConvertItem.date,
      type: isCr ? 'IN' : 'OUT',
      title: title || quickConvertItem.description,
      description: `Dicatat otomatis dari mutasi rekening koran: ${quickConvertItem.description}`,
      amount: quickConvertItem.amount,
      paymentMethod: 'Bank BCA (123-456-7890)',
      primaryAccountCode: primaryAccCode,
      contraAccountCode: accountCode,
      journalEntries: isCr
        ? [
            {
              id: `j-${Date.now()}-1`,
              accountCode: primaryAccCode,
              accountName: 'Bank BCA - Rek Operasional',
              debit: quickConvertItem.amount,
              credit: 0,
              notes: 'Penerimaan rekening koran'
            },
            {
              id: `j-${Date.now()}-2`,
              accountCode,
              accountName: selectedAcc?.name || 'Pendapatan',
              debit: 0,
              credit: quickConvertItem.amount,
              notes: title
            }
          ]
        : [
            {
              id: `j-${Date.now()}-1`,
              accountCode,
              accountName: selectedAcc?.name || 'Beban Operasional',
              debit: quickConvertItem.amount,
              credit: 0,
              notes: title
            },
            {
              id: `j-${Date.now()}-2`,
              accountCode: primaryAccCode,
              accountName: 'Bank BCA - Rek Operasional',
              debit: 0,
              credit: quickConvertItem.amount,
              notes: 'Pengeluaran rekening koran'
            }
          ],
      projectId,
      projectName: selectedProj ? selectedProj.name : 'Seluruh Lokasi (HQ)',
      division: 'Cleaning Service',
      currency: 'IDR',
      exchangeRate: 1,
      referenceNumber: quickConvertItem.referenceNumber || 'BANK-MUTATION',
      payeeOrPayer: quickConvertItem.description,
      isReconciled: true,
      bankStatementItemId: quickConvertItem.id,
      isAdjusting: false,
      createdAt: `${quickConvertItem.date} 12:00`,
      createdBy: currentUser?.name || 'Finance Admin'
    };

    // Add transaction
    onAddTransaction(newTrx);

    // Update statement item as MATCHED
    const updatedItems = activeStatement.items.map((i) => {
      if (i.id === quickConvertItem.id) {
        return {
          ...i,
          matchStatus: 'MATCHED' as ReconcileStatus,
          matchedTransactionId: newTrx.id,
          matchedTransactionCode: newTrx.code,
          confidenceScore: 100,
          notes: `Dibuat & dicocokkan otomatis dengan ${newTrx.code}`
        };
      }
      return i;
    });

    const updatedStatements = bankStatements.map((s) => {
      if (s.id === activeStatement.id) {
        return { ...s, items: updatedItems };
      }
      return s;
    });

    onUpdateStatements(updatedStatements);
    setQuickConvertItem(null);
    setNotification({
      type: 'success',
      message: `Mutasi berhasil dicatat sebagai transaksi ${code} dan langsung berstatus MATCHED!`
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Handle Manual Match with Existing Transaction
  const handleManualForceMatch = (trxId: string) => {
    if (!manualMatchItem || !activeStatement) return;

    const matchedTrx = transactions.find((t) => t.id === trxId);
    if (!matchedTrx) return;

    const updatedItems = activeStatement.items.map((i) => {
      if (i.id === manualMatchItem.id) {
        return {
          ...i,
          matchStatus: 'MANUAL_MATCHED' as ReconcileStatus,
          matchedTransactionId: matchedTrx.id,
          matchedTransactionCode: matchedTrx.code,
          confidenceScore: 100,
          notes: `Dicocokkan manual oleh ${currentUser?.name || 'Finance Admin'}`
        };
      }
      return i;
    });

    const updatedStatements = bankStatements.map((s) => {
      if (s.id === activeStatement.id) {
        return { ...s, items: updatedItems };
      }
      return s;
    });

    // Mark internal transaction as reconciled
    onUpdateTransaction({ ...matchedTrx, isReconciled: true, bankStatementItemId: manualMatchItem.id });
    onUpdateStatements(updatedStatements);
    setManualMatchItem(null);
  };

  // Handle Unmatch / Release
  const handleUnmatch = (item: BankStatementItem) => {
    if (!activeStatement) return;

    const updatedItems = activeStatement.items.map((i) => {
      if (i.id === item.id) {
        return {
          ...i,
          matchStatus: 'UNMATCHED' as ReconcileStatus,
          matchedTransactionId: undefined,
          matchedTransactionCode: undefined,
          confidenceScore: 0,
          notes: 'Dilepas dari pencocokan'
        };
      }
      return i;
    });

    const updatedStatements = bankStatements.map((s) => {
      if (s.id === activeStatement.id) {
        return { ...s, items: updatedItems };
      }
      return s;
    });

    onUpdateStatements(updatedStatements);
  };

  // Handle Upload Statement Success from BankStatementUploadModal
  const handleImportSuccess = (newImport: BankStatementImport) => {
    const nextStatements = [newImport, ...bankStatements];
    onUpdateStatements(nextStatements);
    setSelectedStatementId(newImport.id);
    setNotification({
      type: 'success',
      message: `Rekening koran "${newImport.bankName}" (${newImport.items.length} mutasi) berhasil diunggah.`
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // ---------------------------------------------------------------------------
  // DELETE ACTIVE BANK STATEMENT HANDLER
  // ---------------------------------------------------------------------------
  const handleDeleteActiveStatement = () => {
    if (!activeStatement) return;

    const deletedId = activeStatement.id;
    const deletedName = `${activeStatement.bankName} - ${activeStatement.periodMonth}`;
    const count = activeStatement.items.length;

    // Unlink any matched internal transactions if requested
    if (unlinkTransactionsOnDelete) {
      const statementItemIds = new Set(activeStatement.items.map((i) => i.id));
      transactions.forEach((trx) => {
        if (trx.bankStatementItemId && statementItemIds.has(trx.bankStatementItemId)) {
          onUpdateTransaction({
            ...trx,
            isReconciled: false,
            bankStatementItemId: undefined
          });
        }
      });
    }

    const nextStatements = bankStatements.filter((s) => s.id !== deletedId);
    onUpdateStatements(nextStatements);
    setSelectedStatementId(nextStatements[0]?.id || '');
    setIsDeleteModalOpen(false);

    if (onLogAudit) {
      onLogAudit({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        userName: currentUser?.name || 'Finance Admin',
        userRole: currentUser?.role || 'Admin Operasional',
        actionType: 'DELETE',
        module: 'Rekonsiliasi Bank',
        recordId: deletedId,
        recordCode: activeStatement.fileName || activeStatement.bankName,
        description: `Menghapus rekening koran aktif: ${deletedName} (${activeStatement.accountNumber}) berisi ${count} transaksi mutasi.`
      });
    }

    setNotification({
      type: 'success',
      message: `Rekening koran "${deletedName}" (${count} mutasi) berhasil dihapus.`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // ---------------------------------------------------------------------------
  // DELETE ALL BANK STATEMENTS HANDLER
  // ---------------------------------------------------------------------------
  const handleDeleteAllStatements = () => {
    if (bankStatements.length === 0) return;

    const totalTrxCount = bankStatements.reduce((sum, s) => sum + s.items.length, 0);

    if (unlinkTransactionsOnDelete) {
      transactions.forEach((trx) => {
        if (trx.bankStatementItemId || trx.isReconciled) {
          onUpdateTransaction({
            ...trx,
            isReconciled: false,
            bankStatementItemId: undefined
          });
        }
      });
    }

    onUpdateStatements([]);
    setSelectedStatementId('');
    setIsDeleteAllModalOpen(false);

    if (onLogAudit) {
      onLogAudit({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        userName: currentUser?.name || 'Finance Admin',
        userRole: currentUser?.role || 'Admin Operasional',
        actionType: 'DELETE',
        module: 'Rekonsiliasi Bank',
        recordId: 'ALL_STATEMENTS',
        description: `Menghapus seluruh (${bankStatements.length}) berkas rekening koran bank.`
      });
    }

    setNotification({
      type: 'success',
      message: `Seluruh (${bankStatements.length}) rekening koran dan ${totalTrxCount} baris mutasi berhasil dibersihkan.`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Quick Preset Sample Loader
  const handleLoadSampleStatement = (bankKey: 'BNI' | 'BCA' | 'MANDIRI' = 'BNI') => {
    const sample = getSamplePresetStatement(bankKey);
    const newImport: BankStatementImport = {
      id: `stmt-${Date.now()}`,
      bankName: sample.bankName,
      accountNumber: sample.accountNumber,
      accountHolder: sample.accountHolder,
      periodMonth: sample.periodMonth,
      fileName: sample.fileName,
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalTransactions: sample.items.length,
      totalCredit: sample.totalCredit,
      totalDebit: sample.totalDebit,
      matchedCount: sample.items.filter((i) => i.matchStatus === 'MATCHED').length,
      unmatchedCount: sample.items.filter((i) => i.matchStatus === 'UNMATCHED').length,
      items: sample.items
    };

    const nextStatements = [newImport, ...bankStatements];
    onUpdateStatements(nextStatements);
    setSelectedStatementId(newImport.id);

    setNotification({
      type: 'success',
      message: `Contoh rekening koran ${sample.bankName} berhasil dimuat.`
    });
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
              : notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
              : 'bg-blue-950/90 text-blue-300 border-blue-500/40'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Reconcile Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Rekonsiliasi Bank & Pembaca Rekening Koran
                </h1>
                <p className="text-xs text-slate-400">
                  Upload e-Statement mutasi bank, auto-matching dengan buku kas, dan kelola data rekening koran
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Upload Rekening Koran</span>
            </button>

            <button
              onClick={handleRunAutoMatch}
              disabled={!activeStatement || activeStatement.items.length === 0}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              title="Jalankan algoritma pencocokan cerdas"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Match Otomatis</span>
            </button>

            {activeStatement && (
              <button
                id="delete-active-bank-statement-btn"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/90 text-rose-300 hover:text-white border border-rose-800/80 text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-950/30"
                title="Hapus berkas rekening koran yang sedang aktif"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Hapus Rekening Koran Aktif</span>
              </button>
            )}
          </div>
        </div>

        {/* Bank Statement Selector & KPI Banner */}
        {bankStatements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Rekening Koran Aktif ({bankStatements.length})
                  </label>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer"
                    title="Hapus rekening koran yang dipilih"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus</span>
                  </button>
                </div>
                <select
                  value={selectedStatementId}
                  onChange={(e) => setSelectedStatementId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-bold focus:outline-none"
                >
                  {bankStatements.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.bankName} - {s.periodMonth} ({s.items.length} Trx)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-800/80">
                <span className="truncate">{activeStatement?.accountNumber} ({activeStatement?.accountHolder})</span>
                {bankStatements.length > 1 && (
                  <button
                    onClick={() => setIsDeleteAllModalOpen(true)}
                    className="text-slate-400 hover:text-rose-400 underline shrink-0 ml-1"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Tingkat Kesesuaian</span>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="text-xl font-extrabold text-emerald-400">{stats.matchPct}%</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {stats.matchedCount} / {stats.totalCount} Matched
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.matchPct}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Mutasi Masuk (CR)</span>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                {financeService.formatRupiah(stats.totalCr)}
              </div>
              <span className="text-[10px] text-slate-500">Penerimaan Rekening Bank</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Mutasi Keluar (DB)</span>
              <div className="text-base font-extrabold text-rose-400 mt-0.5">
                {financeService.formatRupiah(stats.totalDb)}
              </div>
              <span className="text-[10px] text-slate-500">Pengeluaran Rekening Bank</span>
            </div>
          </div>
        ) : (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3 text-slate-400">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">Belum Ada Rekening Koran yang Diimpor</div>
                  <p className="text-[11px] text-slate-400">
                    Data rekening koran sedang kosong. Unggah file mutasi atau muat contoh demo untuk memulai rekonsiliasi.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                >
                  + Upload e-Statement
                </button>
                <button
                  onClick={() => handleLoadSampleStatement('BNI')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  Muat Contoh Preset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Variance & Audit Reconciliation Bar */}
      {activeStatement && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Saldo Rekening Koran Bank:</span>
              <div className="text-sm font-bold font-mono text-white">
                {financeService.formatRupiah(bankBookComparison.bankEndingBalance)}
              </div>
            </div>

            <div className="text-slate-500 font-bold text-lg">vs</div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Saldo Buku Kas di Sistem:</span>
              <div className="text-sm font-bold font-mono text-white">
                {financeService.formatRupiah(bankBookComparison.bookBalance)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Selisih Rekonsiliasi:</span>
              <div
                className={`text-sm font-extrabold font-mono ${
                  bankBookComparison.variance === 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {financeService.formatRupiah(bankBookComparison.variance)}
              </div>
            </div>

            <button
              id="download-reconcile-csv-btn"
              data-testid="download-as-csv-btn"
              onClick={() => {
                if (!activeStatement) return;
                const headers = [
                  'Bank',
                  'No Rekening',
                  'Periode',
                  'Tanggal Mutasi',
                  'Keterangan Mutasi',
                  'Tipe Mutasi',
                  'Nominal (Rp)',
                  'Status Rekonsiliasi',
                  'Kode Transaksi Terkait',
                  'ID Transaksi Terkait'
                ];
                const rows = activeStatement.items.map((i) => [
                  activeStatement.bankName,
                  activeStatement.accountNumber,
                  activeStatement.periodMonth,
                  i.date,
                  i.description,
                  i.type === 'CR' ? 'Kredit (Masuk)' : 'Debit (Keluar)',
                  i.amount,
                  i.matchStatus,
                  i.matchedTransactionCode || '-',
                  i.matchedTransactionId || '-'
                ]);
                financeService.exportToCSV(
                  `Rekonsiliasi_Bank_${activeStatement.bankName}_${activeStatement.periodMonth}`,
                  headers,
                  rows
                );
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-750 hover:bg-emerald-650 text-white text-xs font-bold border border-emerald-600/50 shadow-md shadow-emerald-950/40 cursor-pointer transition-all"
              title="Download hasil rekonsiliasi dan mutasi rekening bank dalam format CSV untuk Excel atau Google Sheets"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              <span>Download as CSV</span>
            </button>

            <button
              onClick={() => {
                if (!activeStatement) return;
                const headers = ['Tanggal', 'Keterangan Mutasi', 'Tipe', 'Nominal (Rp)', 'Status Match', 'Transaksi Terkait'];
                const rows = activeStatement.items.map((i) => [
                  i.date,
                  i.description,
                  i.type === 'CR' ? 'Kredit (Masuk)' : 'Debit (Keluar)',
                  financeService.formatRupiah(i.amount),
                  i.matchStatus,
                  i.matchedTransactionCode || '-'
                ]);
                financeService.exportFinancialStatementPDF(
                  `Laporan Rekonsiliasi Bank ${activeStatement.bankName}`,
                  activeStatement.periodMonth,
                  headers,
                  rows
                );
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      {activeStatement && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari mutasi rekening, nama pengirim, atau no referensi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({activeStatement?.items.length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('UNMATCHED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'UNMATCHED'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Belum Cocok ({stats.unmatchedCount})
              </button>
              <button
                onClick={() => setStatusFilter('MATCHED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'MATCHED'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sudah Cocok ({stats.matchedCount})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Statement Transactions Table */}
      {activeStatement ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Keterangan Mutasi Bank</th>
                  <th className="p-3.5">Jenis</th>
                  <th className="p-3.5 text-right">Nominal Mutasi</th>
                  <th className="p-3.5 text-center">Status Match</th>
                  <th className="p-3.5">Transaksi Sistem Terkait</th>
                  <th className="p-3.5 text-center">Aksi / Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Tidak ada mutasi yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                        {item.date}
                      </td>

                      <td className="p-3.5 max-w-[320px]">
                        <div className="font-semibold text-white">{item.description}</div>
                        {item.referenceNumber && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Ref: {item.referenceNumber}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] text-amber-400/90 mt-0.5 italic">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        {item.type === 'CR' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>MASUK (CR)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>KELUAR (DB)</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold">
                        <span className={item.type === 'CR' ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.type === 'CR' ? '+' : '-'} {financeService.formatRupiah(item.amount)}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        {item.matchStatus === 'MATCHED' || item.matchStatus === 'MANUAL_MATCHED' ? (
                          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Matched ({item.confidenceScore || 100}%)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            <AlertCircle className="w-3 h-3" />
                            <span>Unmatched</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        {item.matchedTransactionCode ? (
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-blue-400 text-xs">
                              {item.matchedTransactionCode}
                            </span>
                            <div className="text-[10px] text-slate-400">Tersinkronisasi ke Buku Kas</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Belum ada jurnal terkait</span>
                        )}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        {item.matchStatus === 'UNMATCHED' ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setQuickConvertItem(item)}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-bold transition-all cursor-pointer"
                              title="Konversi langsung menjadi transaksi jurnal baru"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>+ Buat Jurnal</span>
                            </button>

                            <button
                              onClick={() => setManualMatchItem(item)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                              title="Hubungkan secara manual dengan transaksi yang sudah ada"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUnmatch(item)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-[10px] font-semibold transition-all cursor-pointer"
                            title="Lepas status pencocokan"
                          >
                            <Unlink className="w-3 h-3" />
                            <span>Lepas Match</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-extrabold text-white text-lg">Belum Ada Rekening Koran Aktif</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seluruh data rekening koran telah dibersihkan atau belum diunggah. Unggah file mutasi bank (PDF, Excel, CSV, atau Teks) untuk memulai rekonsiliasi otomatis.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Upload Rekening Koran Sekarang</span>
            </button>
            <button
              onClick={() => handleLoadSampleStatement('BNI')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Muat Contoh Data Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: HAPUS REKENING KORAN AKTIF */}
      {/* ------------------------------------------------------------- */}
      {isDeleteModalOpen && activeStatement && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Hapus Rekening Koran Aktif</h3>
                  <p className="text-xs text-slate-400">Konfirmasi pembersihan berkas e-Statement</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Statement Summary Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Bank & Periode:</span>
                <span className="text-amber-400 font-bold font-mono">
                  {activeStatement.bankName} • {activeStatement.periodMonth}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Nomor Rekening:</span>
                <span className="text-white font-mono font-semibold">{activeStatement.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Pemilik Akun:</span>
                <span className="text-slate-300 truncate max-w-[200px]">{activeStatement.accountHolder}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Nama File Berkas:</span>
                <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">{activeStatement.fileName}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-medium">Total Baris Mutasi:</span>
                <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                  {activeStatement.items.length} transaksi
                </span>
              </div>
            </div>

            {/* Unlink Option Checkbox */}
            <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={unlinkTransactionsOnDelete}
                onChange={(e) => setUnlinkTransactionsOnDelete(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-slate-300 leading-relaxed">
                Lepaskan status pencocokan (un-reconcile) pada transaksi buku kas terkait agar kembali berstatus belum cocok.
              </span>
            </label>

            {/* Warning Message */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/90 leading-relaxed flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Data mutasi rekening koran ini akan dihapus dari sistem rekonsiliasi. Transaksi di jurnal buku kas umum internal tetap aman.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="confirm-delete-active-statement-btn"
                onClick={handleDeleteActiveStatement}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Rekening Koran</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: HAPUS SEMUA REKENING KORAN */}
      {/* ------------------------------------------------------------- */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Hapus Seluruh Rekening Koran</h3>
                  <p className="text-xs text-slate-400">Kosongkan semua ({bankStatements.length}) berkas mutasi</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 space-y-2">
              <div className="font-bold text-rose-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Peringatan Pembersihan Total</span>
              </div>
              <p className="leading-relaxed">
                Anda akan menghapus seluruh {bankStatements.length} berkas rekening koran yang telah diimpor ke sistem.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAllStatements}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Semua ({bankStatements.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: UPLOAD REKENING KORAN & PARSER */}
      {/* ------------------------------------------------------------- */}
      <BankStatementUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        transactions={transactions}
        currentUser={currentUser}
        onImportSuccess={handleImportSuccess}
        onLogAudit={onLogAudit}
      />

      {/* ------------------------------------------------------------- */}
      {/* MODAL: QUICK CONVERT UNMATCHED ITEM TO NEW TRANSACTION */}
      {/* ------------------------------------------------------------- */}
      {quickConvertItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Konversi Mutasi Jadi Jurnal Kas</h3>
                  <p className="text-xs text-slate-400">
                    Otomatis catat dan hubungkan mutasi rekening bank yang belum ada di sistem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickConvertItem(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickConvert} className="space-y-3.5">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mutasi Rekening:</span>
                  <span className="text-white font-semibold">{quickConvertItem.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal:</span>
                  <span className="text-slate-300 font-mono">{quickConvertItem.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jenis & Nominal:</span>
                  <span
                    className={`font-mono font-bold ${
                      quickConvertItem.type === 'CR' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {quickConvertItem.type === 'CR' ? 'UANG MASUK (+)' : 'UANG KELUAR (-)'}{' '}
                    {financeService.formatRupiah(quickConvertItem.amount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Judul Transaksi / Keperluan *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={quickConvertItem.description}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Alokasi Akun Lawan (COA) *
                </label>
                <select
                  name="accountCode"
                  defaultValue={quickConvertItem.type === 'CR' ? '4110' : '6170'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} - {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Cost Center (Proyek / Site)
                </label>
                <select
                  name="projectId"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Seluruh Lokasi (Kantor Pusat HQ)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickConvertItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 cursor-pointer"
                >
                  Simpan & Hubungkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: MANUAL MATCH WITH EXISTING TRANSACTION */}
      {/* ------------------------------------------------------------- */}
      {manualMatchItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Pilih Transaksi Untuk Dicocokkan</h3>
                  <p className="text-xs text-slate-400">
                    Pilih transaksi internal yang sesuai dengan mutasi {financeService.formatRupiah(manualMatchItem.amount)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManualMatchItem(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {transactions
                .filter((t) => (manualMatchItem.type === 'CR' ? t.type === 'IN' : t.type === 'OUT'))
                .map((trx) => (
                  <div
                    key={trx.id}
                    onClick={() => handleManualForceMatch(trx.id)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{trx.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {trx.code} • {trx.date} • {trx.projectName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400 text-xs">
                        {financeService.formatRupiah(trx.amount)}
                      </div>
                      <span className="text-[10px] text-blue-400 group-hover:underline">
                        Pilih & Cocokkan →
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setManualMatchItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
