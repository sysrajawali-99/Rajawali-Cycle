import { supabase, testSupabaseConnection } from '../utils/supabase';
import { storageService } from './storageService';
import {
  Project,
  Employee,
  TimesheetMonthRecord,
  InventoryItem,
  ProjectStock,
  InventoryLog,
  CleaningTask,
  UserAccount,
  CompanyProfile,
  ChartOfAccount,
  FinanceTransaction,
  DebtRecord,
  ReceivableRecord
} from '../types';

export const SUPABASE_SQL_SCHEMA = `-- SKEMA DATABASE SUPABASE UNTUK RAJAWALI CYCLE
-- Buka Supabase Dashboard > SQL Editor > Paste query ini dan klik 'Run'

-- 1. Table Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  location TEXT,
  client_name TEXT,
  target_work_hours NUMERIC,
  budget NUMERIC,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Table Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  nik TEXT,
  name TEXT NOT NULL,
  role TEXT,
  division TEXT,
  project_id TEXT,
  status TEXT,
  phone TEXT,
  join_date TEXT,
  bank_name TEXT,
  bank_account TEXT,
  basic_salary NUMERIC,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Table Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT,
  area TEXT,
  priority TEXT,
  status TEXT,
  assignee_id TEXT,
  assignee_name TEXT,
  due_date TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Table Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT,
  min_stock NUMERIC,
  unit_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. Table Project Stocks
CREATE TABLE IF NOT EXISTS public.project_stocks (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  project_id TEXT,
  current_stock NUMERIC,
  min_stock NUMERIC,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. Table Inventory Logs
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_name TEXT,
  project_id TEXT,
  project_name TEXT,
  type TEXT,
  quantity NUMERIC,
  pic TEXT,
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. Table Debts (Hutang Usaha)
CREATE TABLE IF NOT EXISTS public.debts (
  id TEXT PRIMARY KEY,
  code TEXT,
  creditor_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  invoice_number TEXT,
  issue_date TEXT,
  due_date TEXT,
  total_amount NUMERIC,
  paid_amount NUMERIC,
  remaining_amount NUMERIC,
  status TEXT,
  project_id TEXT,
  project_name TEXT,
  account_code TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. Table Receivables (Piutang Usaha)
CREATE TABLE IF NOT EXISTS public.receivables (
  id TEXT PRIMARY KEY,
  code TEXT,
  customer_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  invoice_number TEXT,
  issue_date TEXT,
  due_date TEXT,
  term_of_payment TEXT,
  total_amount NUMERIC,
  paid_amount NUMERIC,
  remaining_amount NUMERIC,
  status TEXT,
  project_id TEXT,
  project_name TEXT,
  account_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 9. Table Finance Transactions (Buku Kas & Jurnal)
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id TEXT PRIMARY KEY,
  code TEXT,
  date TEXT,
  type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  payment_method TEXT,
  primary_account_code TEXT,
  contra_account_code TEXT,
  project_id TEXT,
  project_name TEXT,
  division TEXT,
  payee_or_payer TEXT,
  reference_number TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 10. Table App Sync Data (Untuk full backup JSON fleksibel)
CREATE TABLE IF NOT EXISTS public.app_sync_store (
  key TEXT PRIMARY KEY,
  data JSONB,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Mengaktifkan Row Level Security (RLS) & Kebijakan Akses Publik Anon
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_sync_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all public projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public project_stocks" ON public.project_stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public inventory_logs" ON public.inventory_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public debts" ON public.debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public receivables" ON public.receivables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public finance_transactions" ON public.finance_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all public app_sync_store" ON public.app_sync_store FOR ALL USING (true) WITH CHECK (true);
`;

export const supabaseService = {
  testConnection: testSupabaseConnection,

  /**
   * Push all current data to Supabase (Universal JSON & Table store)
   */
  async pushAllDataToSupabase(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const projects = storageService.getProjects();
      const employees = storageService.getEmployees();
      const tasks = storageService.getTasks();
      const inventoryItems = storageService.getInventoryItems();
      const projectStocks = storageService.getProjectStocks();
      const inventoryLogs = storageService.getInventoryLogs();
      const debts = storageService.getDebts();
      const receivables = storageService.getReceivables();
      const financeTransactions = storageService.getFinanceTransactions();
      const timesheets = storageService.getTimesheets();
      const companyProfile = storageService.getCompanyProfile();

      // 1. Simpan ke snapshot JSON di app_sync_store
      const syncItems = [
        { key: 'projects', data: projects, updated_at: new Date().toISOString() },
        { key: 'employees', data: employees, updated_at: new Date().toISOString() },
        { key: 'tasks', data: tasks, updated_at: new Date().toISOString() },
        { key: 'inventory_items', data: inventoryItems, updated_at: new Date().toISOString() },
        { key: 'project_stocks', data: projectStocks, updated_at: new Date().toISOString() },
        { key: 'inventory_logs', data: inventoryLogs, updated_at: new Date().toISOString() },
        { key: 'debts', data: debts, updated_at: new Date().toISOString() },
        { key: 'receivables', data: receivables, updated_at: new Date().toISOString() },
        { key: 'finance_transactions', data: financeTransactions, updated_at: new Date().toISOString() },
        { key: 'timesheets', data: timesheets, updated_at: new Date().toISOString() },
        { key: 'company_profile', data: companyProfile, updated_at: new Date().toISOString() }
      ];

      const { error: storeError } = await supabase.from('app_sync_store').upsert(syncItems, { onConflict: 'key' });

      if (storeError) {
        // If app_sync_store doesn't exist yet, guide user
        if (storeError.code === '42P01') {
          return {
            success: false,
            message: 'Tabel Supabase belum dibuat. Silakan salin skema SQL dan jalankan di Supabase SQL Editor.',
            details: storeError
          };
        }
        return {
          success: false,
          message: `Gagal sinkronisasi data ke Supabase: ${storeError.message}`,
          details: storeError
        };
      }

      return {
        success: true,
        message: `Berhasil sinkronisasi seluruh data (${projects.length} Proyek, ${employees.length} Karyawan, ${debts.length} Hutang, ${receivables.length} Piutang, ${financeTransactions.length} Transaksi) ke Supabase!`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error saat menghubungkan ke Supabase: ${err?.message || 'Koneksi terputus'}`,
        details: err
      };
    }
  },

  /**
   * Pull all data from Supabase into local storage
   */
  async pullAllDataFromSupabase(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const { data, error } = await supabase.from('app_sync_store').select('*');
      if (error) {
        return {
          success: false,
          message: `Gagal mengambil data dari Supabase: ${error.message}`
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Belum ada data di database Supabase. Silakan unggah/sync data terlebih dahulu.'
        };
      }

      let restoredCount = 0;
      data.forEach((item: { key: string; data: any }) => {
        if (!item.data) return;
        switch (item.key) {
          case 'projects':
            storageService.saveProjects(item.data);
            restoredCount++;
            break;
          case 'employees':
            storageService.saveEmployees(item.data);
            restoredCount++;
            break;
          case 'tasks':
            storageService.saveTasks(item.data);
            restoredCount++;
            break;
          case 'inventory_items':
            storageService.saveInventoryItems(item.data);
            restoredCount++;
            break;
          case 'project_stocks':
            storageService.saveProjectStocks(item.data);
            restoredCount++;
            break;
          case 'inventory_logs':
            storageService.saveInventoryLogs(item.data);
            restoredCount++;
            break;
          case 'debts':
            storageService.saveDebts(item.data);
            restoredCount++;
            break;
          case 'receivables':
            storageService.saveReceivables(item.data);
            restoredCount++;
            break;
          case 'finance_transactions':
            storageService.saveFinanceTransactions(item.data);
            restoredCount++;
            break;
          case 'timesheets':
            storageService.saveTimesheets(item.data);
            restoredCount++;
            break;
          case 'company_profile':
            storageService.saveCompanyProfile(item.data);
            restoredCount++;
            break;
        }
      });

      return {
        success: true,
        message: `Berhasil mengunduh dan memulihkan ${restoredCount} modul data dari Supabase!`,
        data
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error saat mengambil data dari Supabase: ${err?.message || 'Koneksi gagal'}`
      };
    }
  }
};
