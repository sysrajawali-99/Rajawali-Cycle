import { storageService } from './storageService';
import {
  Project,
  Employee,
  TimesheetMonthRecord,
  MutationHistory,
  InventoryItem,
  ProjectStock,
  InventoryLog,
  CleaningTask,
  BlastAnnouncement,
  SopDocument,
  UserAccount
} from '../types';

export const DEFAULT_DRIVE_FOLDER_ID = '1GaPlyK1JeoLhjxcuxeapN2N9oJ9yNAJA';
export const DEFAULT_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${DEFAULT_DRIVE_FOLDER_ID}?usp=drive_link`;
export const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '90022021121-putcjfmghgnls1atmk7j7eq3dv6s8g5i.apps.googleusercontent.com';

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

const STORAGE_KEYS = {
  TOKEN: 'rajawali_gdrive_access_token',
  TOKEN_EXPIRY: 'rajawali_gdrive_token_expiry',
  USER_INFO: 'rajawali_gdrive_user_info',
  SYNC_SETTINGS: 'rajawali_gdrive_sync_settings',
  LAST_BACKUP_TIME: 'rajawali_gdrive_last_backup_time'
};

export interface DriveUserInfo {
  email: string;
  name: string;
  picture?: string;
}

export interface DriveBackupFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime?: string;
  description?: string;
  webViewLink?: string;
}

export interface DriveSyncSettings {
  folderId: string;
  autoSyncEnabled: boolean;
  autoSyncIntervalHours: number; // e.g. 12 or 24 hours
  notifyOnSuccess: boolean;
}

export interface DatabaseBackupSnapshot {
  app: string;
  version: string;
  timestamp: string;
  description?: string;
  author?: string;
  data: {
    projects: Project[];
    employees: Employee[];
    timesheets: TimesheetMonthRecord[];
    mutations: MutationHistory[];
    inventoryItems: InventoryItem[];
    projectStocks: ProjectStock[];
    inventoryLogs: InventoryLog[];
    tasks: CleaningTask[];
    blasts: BlastAnnouncement[];
    sops: SopDocument[];
    users: UserAccount[];
  };
  summary: {
    totalProjects: number;
    totalEmployees: number;
    totalTimesheets: number;
    totalTasks: number;
    totalSops: number;
    totalInventoryItems: number;
  };
}

export const googleDriveService = {
  getStoredToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!token || !expiry) return null;

    const expiryTime = parseInt(expiry, 10);
    if (Date.now() > expiryTime - 60000) {
      // Token expired or about to expire in 1 min
      this.clearSession();
      return null;
    }
    return token;
  },

  getStoredUserInfo(): DriveUserInfo | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getSyncSettings(): DriveSyncSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_SETTINGS);
    const defaultSettings: DriveSyncSettings = {
      folderId: DEFAULT_DRIVE_FOLDER_ID,
      autoSyncEnabled: false,
      autoSyncIntervalHours: 24,
      notifyOnSuccess: true
    };
    if (!raw) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return defaultSettings;
    }
  },

  saveSyncSettings(settings: Partial<DriveSyncSettings>) {
    const current = this.getSyncSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SYNC_SETTINGS, JSON.stringify(updated));
  },

  getLastBackupTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP_TIME);
  },

  setLastBackupTime(timestamp: string) {
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP_TIME, timestamp);
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  },

  /**
   * Request Google OAuth Access Token via Google Identity Services (GSI)
   */
  async requestAccessToken(): Promise<{ token: string; user: DriveUserInfo }> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
        reject(
          new Error(
            'Google Identity Services belum termuat. Periksa koneksi internet Anda atau refresh halaman.'
          )
        );
        return;
      }

      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              reject(new Error(`Otorisasi Google Drive gagal: ${tokenResponse.error}`));
              return;
            }

            const token = tokenResponse.access_token;
            const expiresIn = tokenResponse.expires_in
              ? parseInt(tokenResponse.expires_in, 10) * 1000
              : 3600 * 1000;
            const expiryTime = Date.now() + expiresIn;

            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

            // Fetch authenticated user info
            try {
              const userInfo = await googleDriveService.fetchUserInfo(token);
              localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
              resolve({ token, user: userInfo });
            } catch (err) {
              const fallbackUser: DriveUserInfo = {
                email: 'sys.rajawali@gmail.com',
                name: 'Rajawali Admin'
              };
              localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(fallbackUser));
              resolve({ token, user: fallbackUser });
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        reject(new Error(err?.message || 'Gagal memulai koneksi Google Drive'));
      }
    });
  },

  async fetchUserInfo(token: string): Promise<DriveUserInfo> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      throw new Error('Gagal mengambil data profil Google');
    }
    const data = await res.json();
    return {
      email: data.email || 'sys.rajawali@gmail.com',
      name: data.name || 'Akun Google Rajawali',
      picture: data.picture
    };
  },

  /**
   * Helper to ensure a valid access token exists or request it
   */
  async getValidToken(): Promise<string> {
    const existing = this.getStoredToken();
    if (existing) return existing;
    const { token } = await this.requestAccessToken();
    return token;
  },

  /**
   * Upload file to Google Drive folder using Multipart Upload
   */
  async uploadFileToDrive(params: {
    fileName: string;
    mimeType: string;
    content: string | Blob;
    folderId?: string;
    description?: string;
  }): Promise<DriveBackupFile> {
    const token = await this.getValidToken();
    const targetFolderId = params.folderId || this.getSyncSettings().folderId || DEFAULT_DRIVE_FOLDER_ID;

    const metadata = {
      name: params.fileName,
      mimeType: params.mimeType,
      parents: [targetFolderId],
      description: params.description || `Cadangan Otomatis Rajawali Cycle - ${new Date().toLocaleString('id-ID')}`
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    let fileContentString = '';
    if (typeof params.content === 'string') {
      fileContentString = params.content;
    } else {
      fileContentString = await params.content.text();
    }

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${params.mimeType}\r\n\r\n` +
      fileContentString +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,description,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData?.error?.message || response.statusText;
      throw new Error(`Gagal mengunggah ke Google Drive: ${msg}`);
    }

    const result = await response.json();
    this.setLastBackupTime(new Date().toISOString());
    return result;
  },

  /**
   * List backup files stored inside the designated Google Drive folder
   */
  async listFilesFromFolder(folderId?: string): Promise<DriveBackupFile[]> {
    const token = await this.getValidToken();
    const targetFolderId = folderId || this.getSyncSettings().folderId || DEFAULT_DRIVE_FOLDER_ID;

    const query = encodeURIComponent(`'${targetFolderId}' in parents and trashed = false`);
    const fields = encodeURIComponent('files(id, name, mimeType, size, createdTime, modifiedTime, description, webViewLink)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=createdTime desc&pageSize=50`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Gagal memuat daftar file dari Google Drive');
    }

    const data = await response.json();
    return data.files || [];
  },

  /**
   * Download file content from Google Drive
   */
  async downloadFileContent(fileId: string): Promise<string> {
    const token = await this.getValidToken();
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Gagal mengunduh file dari Google Drive');
    }

    return await response.text();
  },

  /**
   * Delete file from Google Drive
   */
  async deleteFileFromDrive(fileId: string): Promise<void> {
    const token = await this.getValidToken();
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Gagal menghapus file dari Google Drive');
    }
  },

  /**
   * Generate complete database snapshot payload
   */
  generateDatabaseSnapshot(authorName?: string, customNote?: string): DatabaseBackupSnapshot {
    const projects = storageService.getProjects();
    const employees = storageService.getEmployees();
    const timesheets = storageService.getTimesheets();
    const mutations = storageService.getMutations();
    const inventoryItems = storageService.getInventoryItems();
    const projectStocks = storageService.getProjectStocks();
    const inventoryLogs = storageService.getInventoryLogs();
    const tasks = storageService.getTasks();
    const blasts = storageService.getBlasts();
    const sops = storageService.getSops();
    const users = storageService.getUsers();

    return {
      app: 'Rajawali Cycle - Outsourcing Suite',
      version: '2.4',
      timestamp: new Date().toISOString(),
      description: customNote || 'Full Automated System Snapshot',
      author: authorName || 'Super Admin HQ',
      data: {
        projects,
        employees,
        timesheets,
        mutations,
        inventoryItems,
        projectStocks,
        inventoryLogs,
        tasks,
        blasts,
        sops,
        users
      },
      summary: {
        totalProjects: projects.length,
        totalEmployees: employees.length,
        totalTimesheets: timesheets.length,
        totalTasks: tasks.length,
        totalSops: sops.length,
        totalInventoryItems: inventoryItems.length
      }
    };
  },

  /**
   * Upload whole database snapshot directly to Google Drive
   */
  async backupAllDataToDrive(authorName?: string, customNote?: string): Promise<DriveBackupFile> {
    const snapshot = this.generateDatabaseSnapshot(authorName, customNote);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `Rajawali_Backup_${dateStr}.json`;
    const jsonContent = JSON.stringify(snapshot, null, 2);

    const description = `Snapshot Database Rajawali Cycle (${snapshot.summary.totalProjects} Proyek, ${snapshot.summary.totalEmployees} Karyawan, ${snapshot.summary.totalTimesheets} Timesheet, ${snapshot.summary.totalTasks} Tugas)`;

    return await this.uploadFileToDrive({
      fileName,
      mimeType: 'application/json',
      content: jsonContent,
      description
    });
  },

  /**
   * Restore database from snapshot JSON string
   */
  restoreDatabaseFromSnapshot(snapshotJson: string): { success: boolean; summary?: any; error?: string } {
    try {
      const parsed: DatabaseBackupSnapshot = JSON.parse(snapshotJson);
      if (!parsed || !parsed.data) {
        return { success: false, error: 'Format file cadangan tidak valid (struktur data tidak lengkap).' };
      }

      const { data } = parsed;

      if (Array.isArray(data.projects)) storageService.saveProjects(data.projects);
      if (Array.isArray(data.employees)) storageService.saveEmployees(data.employees);
      if (Array.isArray(data.timesheets)) storageService.saveTimesheets(data.timesheets);
      if (Array.isArray(data.mutations)) storageService.saveMutations(data.mutations);
      if (Array.isArray(data.inventoryItems)) storageService.saveInventoryItems(data.inventoryItems);
      if (Array.isArray(data.projectStocks)) storageService.saveProjectStocks(data.projectStocks);
      if (Array.isArray(data.inventoryLogs)) storageService.saveInventoryLogs(data.inventoryLogs);
      if (Array.isArray(data.tasks)) storageService.saveTasks(data.tasks);
      if (Array.isArray(data.blasts)) storageService.saveBlasts(data.blasts);
      if (Array.isArray(data.sops)) storageService.saveSops(data.sops);
      if (Array.isArray(data.users)) storageService.saveUsers(data.users);

      return {
        success: true,
        summary: parsed.summary || {
          totalProjects: data.projects?.length || 0,
          totalEmployees: data.employees?.length || 0,
          totalTimesheets: data.timesheets?.length || 0,
          totalTasks: data.tasks?.length || 0,
          totalSops: data.sops?.length || 0
        }
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal memulihkan database dari snapshot' };
    }
  },

  /**
   * Export specific table data to CSV file on Google Drive
   */
  async exportModuleCsvToDrive(
    moduleType: 'employees' | 'timesheets' | 'inventory' | 'sops' | 'tasks'
  ): Promise<DriveBackupFile> {
    let fileName = '';
    let csvContent = '';
    const dateStr = new Date().toISOString().slice(0, 10);

    if (moduleType === 'employees') {
      const emps = storageService.getEmployees();
      const projects = storageService.getProjects();
      const projectMap = new Map(projects.map((p) => [p.id, p.name]));

      fileName = `Rajawali_Master_Karyawan_${dateStr}.csv`;
      const headers = ['NIK', 'Nama', 'Posisi / Jabatan', 'Lokasi Penempatan', 'Shift', 'Gaji Harian', 'Ukuran Seragam', 'Bank', 'No Rekening', 'Status', 'Tanggal Masuk'];
      const rows = emps.map((e) => [
        `"${e.nik}"`,
        `"${e.name}"`,
        `"${e.position}"`,
        `"${projectMap.get(e.projectId) || e.projectId}"`,
        `"${e.shift}"`,
        e.dailyRate,
        `"${e.uniformSize}"`,
        `"${e.bankName}"`,
        `"${e.bankAccount}"`,
        `"${e.status}"`,
        `"${e.joinDate}"`
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    } else if (moduleType === 'inventory') {
      const items = storageService.getInventoryItems();
      fileName = `Rajawali_Master_Inventory_${dateStr}.csv`;
      const headers = ['Kode', 'Nama Item', 'Kategori', 'Satuan', 'Min Stock', 'Estimasi Harga', 'Deskripsi'];
      const rows = items.map((i) => [
        `"${i.code}"`,
        `"${i.name}"`,
        `"${i.category}"`,
        `"${i.unit}"`,
        i.minStock,
        i.unitPrice,
        `"${i.description || ''}"`
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    } else if (moduleType === 'tasks') {
      const tasks = storageService.getTasks();
      const projects = storageService.getProjects();
      const projectMap = new Map(projects.map((p) => [p.id, p.name]));
      fileName = `Rajawali_Tasks_Monitoring_${dateStr}.csv`;
      const headers = ['ID', 'Lokasi Proyek', 'Area', 'Tipe Tugas', 'Shift', 'Prioritas', 'Status', 'QC Review', 'Target Waktu', 'Diperbarui'];
      const rows = tasks.map((t) => [
        `"${t.id}"`,
        `"${projectMap.get(t.projectId) || t.projectId}"`,
        `"${t.areaName}"`,
        `"${t.taskType || 'Tugas Tambahan'}"`,
        `"${t.shift}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${t.qcStatus || 'Pending'}"`,
        `"${t.targetCompletionTime || '-'}"`,
        `"${t.updatedAt}"`
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    } else if (moduleType === 'sops') {
      const sops = storageService.getSops();
      fileName = `Rajawali_Katalog_SOP_${dateStr}.csv`;
      const headers = ['Kode SOP', 'Judul SOP', 'Kategori', 'Versi', 'Tujuan Pekerjaan', 'Jumlah Tahapan', 'Terakhir Update'];
      const rows = sops.map((s) => [
        `"${s.code || s.id}"`,
        `"${s.title}"`,
        `"${s.category}"`,
        `"${s.version}"`,
        `"${(s.objective || '').replace(/"/g, '""')}"`,
        s.steps?.length || 0,
        `"${s.lastUpdated}"`
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    } else {
      const timesheets = storageService.getTimesheets();
      fileName = `Rajawali_Timesheet_Rekap_${dateStr}.csv`;
      const headers = ['ID', 'Employee ID', 'Project ID', 'Bulan', 'Tahun', 'Potongan', 'Bonus Lembur', 'Catatan'];
      const rows = timesheets.map((ts) => [
        `"${ts.id}"`,
        `"${ts.employeeId}"`,
        `"${ts.projectId}"`,
        ts.month,
        ts.year,
        ts.deductionAmount,
        ts.bonusAmount,
        `"${ts.notes || ''}"`
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    }

    return await this.uploadFileToDrive({
      fileName,
      mimeType: 'text/csv',
      content: csvContent,
      description: `Ekspor data ${moduleType} Rajawali Cycle (${dateStr})`
    });
  }
};
