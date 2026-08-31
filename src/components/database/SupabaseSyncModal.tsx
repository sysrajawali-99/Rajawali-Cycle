import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  UploadCloud,
  DownloadCloud,
  X,
  ExternalLink,
  Code2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { supabaseService, SUPABASE_SQL_SCHEMA } from '../../services/supabaseService';
import { supabaseUrl, supabaseAnonKey } from '../../utils/supabase';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [activeTab, setActiveTab] = useState<'STATUS' | 'SCHEMA' | 'CODE'>('STATUS');
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(supabaseService.isAutoSyncEnabled());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(supabaseService.getLastSyncTime());
  const [liveSyncState, setLiveSyncState] = useState<string>(supabaseService.getSyncState());
  const [lastSyncedModule, setLastSyncedModule] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
  }>({
    tested: false,
    ok: false,
    message: 'Belum diuji'
  });
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
      setIsAutoSync(supabaseService.isAutoSyncEnabled());
      setLastSyncTime(supabaseService.getLastSyncTime());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSyncStatus = (e: any) => {
      if (e.detail) {
        setLiveSyncState(e.detail.state);
        if (e.detail.moduleKey) {
          setLastSyncedModule(e.detail.moduleKey);
        }
        if (e.detail.state === 'synced') {
          setLastSyncTime(new Date().toISOString());
        }
      }
    };

    window.addEventListener('supabase_sync_status', handleSyncStatus as EventListener);
    return () => window.removeEventListener('supabase_sync_status', handleSyncStatus as EventListener);
  }, []);

  const toggleAutoSync = () => {
    const nextState = !isAutoSync;
    supabaseService.setAutoSyncEnabled(nextState);
    setIsAutoSync(nextState);
    setStatusMessage({
      type: 'success',
      text: nextState
        ? '⚡ Auto-Backup Realtime DIAKTIFKAN: Setiap penambahan atau perubahan data akan langsung terupdate ke database Supabase.'
        : 'Auto-Backup Realtime DINONAKTIFKAN: Anda dapat melakukan sinkronisasi secara manual.'
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const res = await supabaseService.testConnection();
      setConnectionStatus({
        tested: true,
        ok: res.ok,
        message: res.message
      });
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        ok: false,
        message: err?.message || 'Gagal menghubungi server Supabase'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushData = async () => {
    setIsPushing(true);
    setStatusMessage(null);
    try {
      const res = await supabaseService.pushAllDataToSupabase();
      setStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message
      });
      if (res.success) {
        setConnectionStatus({
          tested: true,
          ok: true,
          message: 'Terhubung & Data Telah Tersinkronisasi'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal sinkronisasi data ke Supabase'
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullData = async () => {
    if (!window.confirm('Tarik data dari Supabase akan menimpa data lokal di browser. Lanjutkan?')) {
      return;
    }
    setIsPulling(true);
    setStatusMessage(null);
    try {
      const res = await supabaseService.pullAllDataFromSupabase();
      setStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message
      });
      if (res.success) {
        onDataRestored?.();
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal mengambil data dari Supabase'
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const sampleCodeSnippet = `import { supabase } from '@/utils/supabase';

// Contoh 1: Ambil data proyek
const { data: projects, error } = await supabase
  .from('projects')
  .select('*');

// Contoh 2: Tambah hutang baru
const { data, error } = await supabase
  .from('debts')
  .insert([
    {
      id: 'debt-' + Date.now(),
      code: 'HUT-2026-001',
      creditor_name: 'PT Supplier Utama',
      total_amount: 15000000,
      remaining_amount: 15000000,
      status: 'UNPAID'
    }
  ]);

// Contoh 3: Realtime Subscription
supabase
  .channel('public:tasks')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
    console.log('Perubahan data task:', payload);
  })
  .subscribe();`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Integrasi Supabase Database</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pusat integrasi Cloud PostgreSQL & Realtime DB untuk Rajawali Cycle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('STATUS')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'STATUS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Koneksi & Sinkronisasi</span>
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'SCHEMA'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Skema Tabel SQL</span>
          </button>
          <button
            onClick={() => setActiveTab('CODE')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'CODE'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Panduan Kode Klien</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {statusMessage && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <p className="text-xs sm:text-sm font-medium">{statusMessage.text}</p>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'STATUS' && (
            <div className="space-y-6">
              {/* Real-time Auto Backup Toggle Card */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-black text-white">Auto-Backup Cloud Realtime (Setiap Posting)</h4>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isAutoSync
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isAutoSync ? '● Aktif' : '○ Nonaktif'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isAutoSync
                        ? 'Setiap kali Anda menambah, mengubah, atau memposting data proyek, karyawan, transaksi kas, hutang, piutang, task QC, atau inventori, sistem langsung mengunggah perubahannya secara instan ke cloud Supabase di latar belakang.'
                        : 'Auto-sync dimatikan. Data hanya disimpan di memori lokal browser Anda sampai Anda menekan tombol sinkronisasi manual.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={toggleAutoSync}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                        isAutoSync
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 border border-emerald-400/50'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${isAutoSync ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
                      <span>{isAutoSync ? 'Auto-Backup Aktif' : 'Aktifkan Auto-Backup'}</span>
                    </button>
                    {lastSyncTime && (
                      <span className="text-[11px] text-emerald-400/80 font-mono">
                        Sinkronisasi Terakhir: {new Date(lastSyncTime).toLocaleTimeString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Sync Status Bar */}
                <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Status Sync Realtime:</span>
                    {liveSyncState === 'syncing' ? (
                      <span className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan ke Cloud ({lastSyncedModule || 'Posting'})...</span>
                      </span>
                    ) : liveSyncState === 'synced' ? (
                      <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Database Supabase Cloud Up-to-Date ✓</span>
                      </span>
                    ) : liveSyncState === 'error' ? (
                      <span className="flex items-center space-x-1.5 text-rose-400 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Gagal Sinkronisasi (Periksa Skema SQL)</span>
                      </span>
                    ) : (
                      <span className="text-slate-300 font-medium">Standby & Siap Mendeteksi Posting Baru</span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">
                    ⚡ Mode Sinkronisasi Terpusat (Proyek, Keuangan, HRD, QC, Logistik)
                  </div>
                </div>
              </div>

              {/* Connection Status Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          connectionStatus.ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <span className="text-sm font-bold text-white">Status Server Supabase:</span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          connectionStatus.ok
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {connectionStatus.ok ? 'Online & Terhubung' : 'Memeriksa / Standby'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{connectionStatus.message}</p>
                  </div>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">Project Endpoint:</span>
                    <code className="text-emerald-400 font-mono text-[11px] break-all">{supabaseUrl}</code>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-1">Anon / Publishable Key:</span>
                    <code className="text-slate-300 font-mono text-[11px] break-all">
                      {supabaseAnonKey.slice(0, 16)}...{supabaseAnonKey.slice(-8)}
                    </code>
                  </div>
                </div>
              </div>

              {/* Sync Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <UploadCloud className="w-5 h-5" />
                      <h4 className="font-bold text-sm text-white">Unggah & Sinkronkan ke Supabase</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Kirim seluruh data lokal saat ini (Proyek, Karyawan, Tugas QC, Stok, Hutang & Piutang, Transaksi Kas) ke tabel Supabase.
                    </p>
                  </div>
                  <button
                    onClick={handlePushData}
                    disabled={isPushing}
                    className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                  >
                    <UploadCloud className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
                    <span>{isPushing ? 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <DownloadCloud className="w-5 h-5" />
                      <h4 className="font-bold text-sm text-white">Tarik Data dari Supabase</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Unduh database terbaru dari Supabase dan sinkronkan ke memori aplikasi lokal secara langsung.
                    </p>
                  </div>
                  <button
                    onClick={handlePullData}
                    disabled={isPulling}
                    className="mt-4 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <DownloadCloud className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />
                    <span>{isPulling ? 'Mengunduh...' : 'Tarik Data Supabase'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SCHEMA' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Skema SQL Database Supabase</h4>
                  <p className="text-xs text-slate-400">
                    Buka Supabase Dashboard &gt; SQL Editor, lalu jalankan query ini untuk membuat tabel otomatis.
                  </p>
                </div>
                <button
                  onClick={handleCopySchema}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow"
                >
                  {copiedSchema ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSchema ? 'Tersalin!' : 'Salin SQL Skema'}</span>
                </button>
              </div>

              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 max-h-80 overflow-y-auto">
                <pre className="whitespace-pre">{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {activeTab === 'CODE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Cara Memanggil Supabase di Komponen React</h4>
                  <p className="text-xs text-slate-400">
                    Gunakan instance <code>supabase</code> dari <code>@/utils/supabase</code> di mana saja.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-700"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Contoh'}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 max-h-80 overflow-y-auto">
                <pre className="whitespace-pre">{sampleCodeSnippet}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>RLS (Row Level Security) Diaktifkan</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
