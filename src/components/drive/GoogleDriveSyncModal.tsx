import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  FolderOpen,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileJson,
  FileSpreadsheet,
  Trash2,
  X,
  Lock,
  ArrowRight,
  Clock,
  Database,
  Sparkles,
  Settings,
  HardDrive
} from 'lucide-react';
import {
  googleDriveService,
  DriveBackupFile,
  DriveUserInfo,
  DriveSyncSettings,
  DEFAULT_DRIVE_FOLDER_ID,
  DEFAULT_DRIVE_FOLDER_URL
} from '../../services/googleDriveService';
import { ConfirmModal } from '../common/ConfirmModal';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
  userName?: string;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  userName = 'Super Admin'
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'history' | 'export' | 'settings'>('backup');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<DriveUserInfo | null>(null);
  const [syncSettings, setSyncSettings] = useState<DriveSyncSettings>(googleDriveService.getSyncSettings());
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(googleDriveService.getLastBackupTime());

  // Loading & process states
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // File list & selection
  const [backupFiles, setBackupFiles] = useState<DriveBackupFile[]>([]);
  const [selectedFileToRestore, setSelectedFileToRestore] = useState<DriveBackupFile | null>(null);
  const [selectedFileToDelete, setSelectedFileToDelete] = useState<DriveBackupFile | null>(null);

  // Messages & alerts
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backupNote, setBackupNote] = useState<string>('');

  // Initial check on mount/open
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = () => {
    const token = googleDriveService.getStoredToken();
    const user = googleDriveService.getStoredUserInfo();
    if (token) {
      setIsConnected(true);
      setUserInfo(user || { email: 'sys.rajawali@gmail.com', name: 'Rajawali Account' });
      fetchDriveFiles();
    } else {
      setIsConnected(false);
      setUserInfo(null);
    }
    setSyncSettings(googleDriveService.getSyncSettings());
    setLastBackupTime(googleDriveService.getLastBackupTime());
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleConnectGoogle = async () => {
    setIsAuthenticating(true);
    try {
      const { user } = await googleDriveService.requestAccessToken();
      setIsConnected(true);
      setUserInfo(user);
      showToast('success', `Berhasil terhubung ke Google Drive (${user.email})`);
      fetchDriveFiles();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyambungkan Google Drive.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    googleDriveService.clearSession();
    setIsConnected(false);
    setUserInfo(null);
    setBackupFiles([]);
    showToast('success', 'Koneksi Google Drive diputuskan.');
  };

  const fetchDriveFiles = async () => {
    if (!googleDriveService.getStoredToken()) return;
    setIsFetchingFiles(true);
    try {
      const files = await googleDriveService.listFilesFromFolder(syncSettings.folderId);
      setBackupFiles(files);
    } catch (err: any) {
      console.warn('Could not list drive files:', err);
    } finally {
      setIsFetchingFiles(false);
    }
  };

  const handleExecuteBackup = async () => {
    setIsBackingUp(true);
    try {
      const uploadedFile = await googleDriveService.backupAllDataToDrive(
        userName,
        backupNote || 'Cadangan Manual Sistem Rajawali'
      );
      setLastBackupTime(new Date().toISOString());
      showToast('success', `Cadangan berhasil disimpan ke Google Drive: "${uploadedFile.name}"`);
      setBackupNote('');
      fetchDriveFiles();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal membuat cadangan data ke Google Drive.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!selectedFileToRestore) return;
    setIsRestoring(true);
    try {
      const content = await googleDriveService.downloadFileContent(selectedFileToRestore.id);
      const result = googleDriveService.restoreDatabaseFromSnapshot(content);

      if (result.success) {
        showToast(
          'success',
          `Data berhasil dipulihkan! (${result.summary.totalProjects} Lokasi, ${result.summary.totalEmployees} Karyawan, ${result.summary.totalTimesheets} Timesheet)`
        );
        setSelectedFileToRestore(null);
        if (onDataRestored) {
          onDataRestored();
        }
      } else {
        showToast('error', result.error || 'Gagal memulihkan database.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengunduh dan memulihkan file cadangan.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFileToDelete) return;
    try {
      await googleDriveService.deleteFileFromDrive(selectedFileToDelete.id);
      showToast('success', `File "${selectedFileToDelete.name}" berhasil dihapus dari Google Drive.`);
      setSelectedFileToDelete(null);
      fetchDriveFiles();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus file dari Google Drive.');
    }
  };

  const handleExportCsvModule = async (moduleType: 'employees' | 'timesheets' | 'inventory' | 'sops' | 'tasks') => {
    setIsExporting(moduleType);
    try {
      const file = await googleDriveService.exportModuleCsvToDrive(moduleType);
      showToast('success', `File spreadsheet "${file.name}" berhasil diunggah ke Google Drive.`);
      fetchDriveFiles();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengekspor data ke Google Drive.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    googleDriveService.saveSyncSettings(syncSettings);
    showToast('success', 'Pengaturan sinkronisasi Google Drive tersimpan.');
    fetchDriveFiles();
  };

  if (!isOpen) return null;

  const currentFolderUrl = `https://drive.google.com/drive/folders/${syncSettings.folderId || DEFAULT_DRIVE_FOLDER_ID}?usp=drive_link`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Google Drive Cloud Sync & Backup
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Resmi & Gratis
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Penyimpanan cadangan database, laporan, dan dokumen operasional terpusat di Google Drive
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl text-xs flex items-center space-x-2 border transition-all ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="flex-1 font-medium">{toastMessage.text}</span>
          </div>
        )}

        {/* Connection Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>Status:</span>
                <span className={isConnected ? 'text-emerald-400' : 'text-slate-400'}>
                  {isConnected ? 'Terhubung ke Google Drive' : 'Belum Terhubung'}
                </span>
              </div>
              {userInfo && (
                <div className="text-[11px] text-slate-400">
                  Akun: <b className="text-slate-200">{userInfo.email}</b> ({userInfo.name})
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={currentFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition"
              title="Buka Folder di Tab Baru"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Buka Folder Drive</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 transition cursor-pointer"
              >
                Putus Koneksi
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isAuthenticating}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>Hubungkan Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Cadangan 1-Klik</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              fetchDriveFiles();
            }}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Riwayat di Drive ({backupFiles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor CSV / Tabel</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Folder</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: 1-KLIK BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              {/* Snapshot Info Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Snapshot Komprehensif Seluruh Database</h4>
                      <p className="text-xs text-slate-400">
                        Menyimpan seluruh data Master Karyawan, Timesheet, Mutasi, Stok, Tugas Kebersihan, SOP, dan Akun
                      </p>
                    </div>
                  </div>
                  {lastBackupTime && (
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Terakhir Dicadangkan</div>
                      <div className="text-xs text-emerald-400 font-semibold flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(lastBackupTime).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Target Folder</div>
                    <div className="font-bold text-slate-200 truncate" title={syncSettings.folderId}>
                      📁 Rajawali Backup Folder
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Format Snapshot</div>
                    <div className="font-bold text-amber-400">JSON Archive (.json)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Enkripsi & Keamanan</div>
                    <div className="font-bold text-emerald-400">Google OAuth TLS</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] text-slate-500">Biaya Kuota</div>
                    <div className="font-bold text-blue-400">Gratis (15 GB Drive)</div>
                  </div>
                </div>
              </div>

              {/* Action Form */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Catatan Tambahan Cadangan (Opsional):
                </label>
                <input
                  type="text"
                  value={backupNote}
                  onChange={(e) => setBackupNote(e.target.value)}
                  placeholder="Contoh: Cadangan Bulanan Akhir Agustus 2026 / Sebelum Audit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>File cadangan dapat dipulihkan kapan saja ke aplikasi dari tab "Riwayat di Drive".</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteBackup}
                    disabled={isBackingUp}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isBackingUp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CloudUpload className="w-4 h-4" />
                    )}
                    <span>{isBackingUp ? 'Menyimpan ke Google Drive...' : 'Cadangkan Semua Data Sekarang'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT FILE CADANGAN DI GOOGLE DRIVE */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Daftar File Cadangan di Folder Google Drive
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    File yang tersimpan pada folder ID: <code className="text-amber-400">{syncSettings.folderId}</code>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchDriveFiles}
                  disabled={isFetchingFiles}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFiles ? 'animate-spin' : ''}`} />
                  <span>Segarkan</span>
                </button>
              </div>

              {isFetchingFiles ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <span>Memeriksa file di Google Drive...</span>
                </div>
              ) : backupFiles.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                  <HardDrive className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Belum ada file cadangan di Google Drive</p>
                  <p className="text-[11px] text-slate-500">
                    Klik tombol "Cadangkan Semua Data Sekarang" untuk membuat file cadangan pertama Anda.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/50">
                  {backupFiles.map((file) => {
                    const isJson = file.name.endsWith('.json') || file.mimeType?.includes('json');
                    return (
                      <div key={file.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/60 transition gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${isJson ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {isJson ? <FileJson className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate flex items-center space-x-2">
                              <span>{file.name}</span>
                              {isJson && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                                  Full Snapshot
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                              <span>{file.createdTime ? new Date(file.createdTime).toLocaleString('id-ID') : '-'}</span>
                              {file.size && <span>• {(parseInt(file.size, 10) / 1024).toFixed(1)} KB</span>}
                              {file.description && <span className="truncate max-w-[200px] text-slate-500">({file.description})</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {isJson && (
                            <button
                              type="button"
                              onClick={() => setSelectedFileToRestore(file)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center space-x-1"
                              title="Pulihkan data dari snapshot ini"
                            >
                              <CloudDownload className="w-3.5 h-3.5" />
                              <span>Pulihkan</span>
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                              title="Lihat di Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedFileToDelete(file)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Hapus file ini dari Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EKSPOR TABEL / CSV KE DRIVE */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Ekspor Modul Spesifik sebagai Spreadsheet (.CSV) ke Google Drive
                </h4>
                <p className="text-[11px] text-slate-400">
                  File spreadsheet dapat langsung dibuka dengan Google Sheets atau diunduh dari folder Drive.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Master Karyawan */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Master Data Karyawan</div>
                      <div className="text-[11px] text-slate-400">NIK, Posisi, Gaji, Penempatan</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCsvModule('employees')}
                    disabled={Boolean(isExporting)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition cursor-pointer disabled:opacity-50"
                  >
                    {isExporting === 'employees' ? 'Mengunggah...' : 'Kirim ke Drive'}
                  </button>
                </div>

                {/* 2. Timesheet Absensi */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Rekap Eagle Timesheet</div>
                      <div className="text-[11px] text-slate-400">Kehadiran 1-31 Hari, Potongan, Lembur</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCsvModule('timesheets')}
                    disabled={Boolean(isExporting)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition cursor-pointer disabled:opacity-50"
                  >
                    {isExporting === 'timesheets' ? 'Mengunggah...' : 'Kirim ke Drive'}
                  </button>
                </div>

                {/* 3. Smart Inventory */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Smart Inventory & Chemical</div>
                      <div className="text-[11px] text-slate-400">Katalog Barang, Min Stock, Harga</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCsvModule('inventory')}
                    disabled={Boolean(isExporting)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white transition cursor-pointer disabled:opacity-50"
                  >
                    {isExporting === 'inventory' ? 'Mengunggah...' : 'Kirim ke Drive'}
                  </button>
                </div>

                {/* 4. Katalog SOP */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Katalog SOP & Pedoman K3</div>
                      <div className="text-[11px] text-slate-400">Daftar Standar Prosedur Operasional</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCsvModule('sops')}
                    disabled={Boolean(isExporting)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white transition cursor-pointer disabled:opacity-50"
                  >
                    {isExporting === 'sops' ? 'Mengunggah...' : 'Kirim ke Drive'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PENGATURAN FOLDER & AUTO-SYNC */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pengaturan Folder Google Drive
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Drive Target Folder ID:
                  </label>
                  <input
                    type="text"
                    value={syncSettings.folderId}
                    onChange={(e) => setSyncSettings({ ...syncSettings, folderId: e.target.value.trim() })}
                    placeholder={DEFAULT_DRIVE_FOLDER_ID}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Folder saat ini: <code className="text-amber-400">{DEFAULT_DRIVE_FOLDER_URL}</code>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Notifikasi Status Cadangan</div>
                    <div className="text-[11px] text-slate-400">Tampilkan pesan konfirmasi setelah cadangan selesai</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={syncSettings.notifyOnSuccess}
                    onChange={(e) => setSyncSettings({ ...syncSettings, notifyOnSuccess: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Koneksi Google Drive aman melalui token resmi Google Identity Services.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* CONFIRM RESTORE MODAL */}
      <ConfirmModal
        isOpen={Boolean(selectedFileToRestore)}
        title="Pulihkan Database dari Google Drive"
        message={`PERINGATAN: Memulihkan file "${selectedFileToRestore?.name}" akan menimpa data operasional aplikasi saat ini dengan data dari file cadangan tersebut. Apakah Anda yakin ingin melanjutkan?`}
        confirmText="Ya, Pulihkan Sekarang"
        cancelText="Batal"
        confirmVariant="warning"
        onConfirm={handleConfirmRestore}
        onCancel={() => setSelectedFileToRestore(null)}
      />

      {/* CONFIRM DELETE BACKUP MODAL */}
      <ConfirmModal
        isOpen={Boolean(selectedFileToDelete)}
        title="Hapus File Cadangan dari Google Drive"
        message={`Apakah Anda yakin ingin menghapus file "${selectedFileToDelete?.name}" dari folder Google Drive? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus File"
        cancelText="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setSelectedFileToDelete(null)}
      />
    </div>
  );
};
