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
  UserAccount,
  CompanyProfile,
  ChartOfAccount,
  FinanceTransaction,
  BankStatementImport,
  PeriodClosing,
  AuditTrailItem,
  CurrencyRate,
  DebtRecord,
  ReceivableRecord,
  InvestmentRecord
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_EMPLOYEES,
  generateSeedTimesheets,
  INITIAL_MUTATIONS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_PROJECT_STOCKS,
  INITIAL_INVENTORY_LOGS,
  INITIAL_TASKS,
  INITIAL_BLASTS,
  INITIAL_SOPS,
  INITIAL_USERS,
  INITIAL_COMPANY_PROFILE
} from '../data/initialData';
import {
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_FINANCE_TRANSACTIONS,
  INITIAL_BANK_STATEMENTS,
  INITIAL_PERIOD_CLOSINGS,
  INITIAL_AUDIT_TRAILS,
  INITIAL_CURRENCY_RATES,
  INITIAL_DEBTS,
  INITIAL_RECEIVABLES,
  INITIAL_INVESTMENTS
} from '../data/initialFinanceData';

const STORAGE_KEYS = {
  COMPANY_PROFILE: 'rajawali_company_profile',
  PROJECTS: 'rajawali_projects',
  EMPLOYEES: 'rajawali_employees',
  TIMESHEETS: 'rajawali_timesheets',
  MUTATIONS: 'rajawali_mutations',
  INVENTORY_ITEMS: 'rajawali_inventory_items',
  PROJECT_STOCKS: 'rajawali_project_stocks',
  INVENTORY_LOGS: 'rajawali_inventory_logs',
  TASKS: 'rajawali_tasks',
  BLASTS: 'rajawali_blasts',
  SOPS: 'rajawali_sops',
  USERS: 'rajawali_users_accounts',
  ACTIVE_USER: 'rajawali_active_session_user',
  SELECTED_PROJECT: 'rajawali_selected_project_id',
  USER_ROLE: 'rajawali_user_role',
  CHART_OF_ACCOUNTS: 'rajawali_finance_coa',
  FINANCE_TRANSACTIONS: 'rajawali_finance_transactions',
  BANK_STATEMENTS: 'rajawali_finance_bank_statements',
  PERIOD_CLOSINGS: 'rajawali_finance_period_closings',
  AUDIT_TRAILS: 'rajawali_finance_audit_trails',
  CURRENCY_RATES: 'rajawali_finance_currency_rates',
  DEBTS: 'rajawali_finance_debts',
  RECEIVABLES: 'rajawali_finance_receivables',
  INVESTMENTS: 'rajawali_finance_investments'
};

// =============================================================================
// STORAGE MIDDLEWARE & CLOUD AUTO-SYNC PIPELINE
// =============================================================================
export type StorageActionType =
  | 'projects'
  | 'debts'
  | 'receivables'
  | 'finance_transactions'
  | 'employees'
  | 'timesheets'
  | 'mutations'
  | 'inventory_items'
  | 'project_stocks'
  | 'inventory_logs'
  | 'tasks'
  | 'blasts'
  | 'sops'
  | 'users'
  | 'company_profile'
  | 'chart_of_accounts'
  | 'bank_statements'
  | 'period_closings'
  | 'audit_trails'
  | 'currency_rates'
  | 'investments';

export interface StorageMiddlewareContext<T = any> {
  key: StorageActionType;
  storageKey: string;
  data: T;
  timestamp: string;
  source?: 'user_action' | 'system_sync' | 'reset';
}

export type StorageMiddleware = (context: StorageMiddlewareContext) => void | Promise<void>;

const storageMiddlewares: StorageMiddleware[] = [];

/**
 * Register a storage middleware that intercepts and acts on every state update
 * (e.g. Supabase Real-time Cloud Upsert, Activity Logging, Google Drive Backup).
 */
export function registerStorageMiddleware(middleware: StorageMiddleware) {
  storageMiddlewares.push(middleware);
}

// Backward compatibility alias
export function registerDataChangeListener(listener: (key: string, data: any) => void) {
  registerStorageMiddleware((ctx) => listener(ctx.key, ctx.data));
}

/**
 * Core update wrapper: Persists to local storage instantly with zero latency,
 * dispatches optional DOM events, and runs all registered storage middlewares
 * (such as automatic Supabase upsert) without requiring manual sync triggers.
 */
function applyStorageUpdate<T>(
  actionKey: StorageActionType,
  storageKey: string,
  data: T,
  customEventName?: string
): void {
  // 1. Instant local persistence
  localStorage.setItem(storageKey, JSON.stringify(data));

  // 2. Dispatch custom DOM event if requested
  if (customEventName) {
    try {
      window.dispatchEvent(new Event(customEventName));
    } catch {
      // ignore
    }
  }

  // 3. Execute middleware pipeline (Supabase Auto Upsert, Audit, etc.)
  const context: StorageMiddlewareContext<T> = {
    key: actionKey,
    storageKey,
    data,
    timestamp: new Date().toISOString(),
    source: 'user_action'
  };

  storageMiddlewares.forEach((middleware) => {
    try {
      middleware(context);
    } catch (err) {
      console.warn(`[StorageMiddleware Error] on ${actionKey}:`, err);
    }
  });
}

export const storageService = {
  getCompanyProfile(): CompanyProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
    if (!raw) {
      this.saveCompanyProfile(INITIAL_COMPANY_PROFILE);
      return INITIAL_COMPANY_PROFILE;
    }
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? { ...INITIAL_COMPANY_PROFILE, ...parsed } : INITIAL_COMPANY_PROFILE;
    } catch {
      return INITIAL_COMPANY_PROFILE;
    }
  },

  saveCompanyProfile(data: CompanyProfile) {
    applyStorageUpdate('company_profile', STORAGE_KEYS.COMPANY_PROFILE, data, 'company_profile_updated');
  },

  getProjects(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw === null) {
      this.saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveProjects(data: Project[]) {
    applyStorageUpdate('projects', STORAGE_KEYS.PROJECTS, data);
  },

  getEmployees(): Employee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (raw === null) {
      this.saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveEmployees(data: Employee[]) {
    applyStorageUpdate('employees', STORAGE_KEYS.EMPLOYEES, data);
  },

  getTimesheets(): TimesheetMonthRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMESHEETS);
    if (raw === null) {
      const emps = this.getEmployees();
      const initialTS = generateSeedTimesheets(emps);
      this.saveTimesheets(initialTS);
      return initialTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveTimesheets(data: TimesheetMonthRecord[]) {
    applyStorageUpdate('timesheets', STORAGE_KEYS.TIMESHEETS, data);
  },

  getMutations(): MutationHistory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MUTATIONS);
    if (raw === null) {
      this.saveMutations(INITIAL_MUTATIONS);
      return INITIAL_MUTATIONS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveMutations(data: MutationHistory[]) {
    applyStorageUpdate('mutations', STORAGE_KEYS.MUTATIONS, data);
  },

  getInventoryItems(): InventoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_ITEMS);
    if (raw === null) {
      this.saveInventoryItems(INITIAL_INVENTORY_ITEMS);
      return INITIAL_INVENTORY_ITEMS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveInventoryItems(data: InventoryItem[]) {
    applyStorageUpdate('inventory_items', STORAGE_KEYS.INVENTORY_ITEMS, data);
  },

  getProjectStocks(): ProjectStock[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECT_STOCKS);
    if (raw === null) {
      this.saveProjectStocks(INITIAL_PROJECT_STOCKS);
      return INITIAL_PROJECT_STOCKS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveProjectStocks(data: ProjectStock[]) {
    applyStorageUpdate('project_stocks', STORAGE_KEYS.PROJECT_STOCKS, data);
  },

  getInventoryLogs(): InventoryLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
    if (raw === null) {
      this.saveInventoryLogs(INITIAL_INVENTORY_LOGS);
      return INITIAL_INVENTORY_LOGS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveInventoryLogs(data: InventoryLog[]) {
    applyStorageUpdate('inventory_logs', STORAGE_KEYS.INVENTORY_LOGS, data);
  },

  getTasks(): CleaningTask[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw === null) {
      this.saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveTasks(data: CleaningTask[]) {
    applyStorageUpdate('tasks', STORAGE_KEYS.TASKS, data);
  },

  getBlasts(): BlastAnnouncement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BLASTS);
    if (raw === null) {
      this.saveBlasts(INITIAL_BLASTS);
      return INITIAL_BLASTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveBlasts(data: BlastAnnouncement[]) {
    applyStorageUpdate('blasts', STORAGE_KEYS.BLASTS, data);
  },

  getSops(): SopDocument[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SOPS);
    if (raw === null) {
      this.saveSops(INITIAL_SOPS);
      return INITIAL_SOPS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveSops(data: SopDocument[]) {
    applyStorageUpdate('sops', STORAGE_KEYS.SOPS, data);
  },

  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      this.saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(data: UserAccount[]) {
    applyStorageUpdate('users', STORAGE_KEYS.USERS, data);
  },

  getActiveUser(): UserAccount | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveActiveUser(user: UserAccount | null) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    }
  },

  clearActiveUser() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  },

  resetToDefault() {
    this.clearAllDataToEmpty();
  },

  // Finance Storage Handlers
  getChartOfAccounts(): ChartOfAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHART_OF_ACCOUNTS);
    if (raw === null) {
      this.saveChartOfAccounts(INITIAL_CHART_OF_ACCOUNTS);
      return INITIAL_CHART_OF_ACCOUNTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_CHART_OF_ACCOUNTS;
    } catch {
      return INITIAL_CHART_OF_ACCOUNTS;
    }
  },

  saveChartOfAccounts(data: ChartOfAccount[]) {
    applyStorageUpdate('chart_of_accounts', STORAGE_KEYS.CHART_OF_ACCOUNTS, data);
  },

  getFinanceTransactions(): FinanceTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE_TRANSACTIONS);
    if (raw === null) {
      this.saveFinanceTransactions(INITIAL_FINANCE_TRANSACTIONS);
      return INITIAL_FINANCE_TRANSACTIONS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveFinanceTransactions(data: FinanceTransaction[]) {
    applyStorageUpdate('finance_transactions', STORAGE_KEYS.FINANCE_TRANSACTIONS, data);
  },

  getBankStatements(): BankStatementImport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BANK_STATEMENTS);
    if (raw === null) {
      this.saveBankStatements(INITIAL_BANK_STATEMENTS);
      return INITIAL_BANK_STATEMENTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveBankStatements(data: BankStatementImport[]) {
    applyStorageUpdate('bank_statements', STORAGE_KEYS.BANK_STATEMENTS, data);
  },

  getPeriodClosings(): PeriodClosing[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PERIOD_CLOSINGS);
    if (raw === null) {
      this.savePeriodClosings(INITIAL_PERIOD_CLOSINGS);
      return INITIAL_PERIOD_CLOSINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  savePeriodClosings(data: PeriodClosing[]) {
    applyStorageUpdate('period_closings', STORAGE_KEYS.PERIOD_CLOSINGS, data);
  },

  getAuditTrails(): AuditTrailItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_TRAILS);
    if (raw === null) {
      this.saveAuditTrails(INITIAL_AUDIT_TRAILS);
      return INITIAL_AUDIT_TRAILS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveAuditTrails(data: AuditTrailItem[]) {
    applyStorageUpdate('audit_trails', STORAGE_KEYS.AUDIT_TRAILS, data);
  },

  getCurrencyRates(): CurrencyRate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENCY_RATES);
    if (raw === null) {
      this.saveCurrencyRates(INITIAL_CURRENCY_RATES);
      return INITIAL_CURRENCY_RATES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_CURRENCY_RATES;
    } catch {
      return INITIAL_CURRENCY_RATES;
    }
  },

  saveCurrencyRates(data: CurrencyRate[]) {
    applyStorageUpdate('currency_rates', STORAGE_KEYS.CURRENCY_RATES, data);
  },

  // -------------------------------------------------------------------------
  // DEBTS (HUTANG USAHA & OPERASIONAL)
  // -------------------------------------------------------------------------
  getDebts(): DebtRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (raw === null) {
      this.saveDebts(INITIAL_DEBTS);
      return INITIAL_DEBTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveDebts(data: DebtRecord[]) {
    applyStorageUpdate('debts', STORAGE_KEYS.DEBTS, data);
  },

  // -------------------------------------------------------------------------
  // RECEIVABLES (PIUTANG USAHA & KONTRAK KLIEN)
  // -------------------------------------------------------------------------
  getReceivables(): ReceivableRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECEIVABLES);
    if (raw === null) {
      this.saveReceivables(INITIAL_RECEIVABLES);
      return INITIAL_RECEIVABLES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveReceivables(data: ReceivableRecord[]) {
    applyStorageUpdate('receivables', STORAGE_KEYS.RECEIVABLES, data);
  },

  // -------------------------------------------------------------------------
  // INVESTMENTS (INVESTASI & BAGI HASIL INVESTOR)
  // -------------------------------------------------------------------------
  getInvestments(): InvestmentRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    if (raw === null) {
      this.saveInvestments(INITIAL_INVESTMENTS);
      return INITIAL_INVESTMENTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveInvestments(data: InvestmentRecord[]) {
    applyStorageUpdate('investments', STORAGE_KEYS.INVESTMENTS, data);
  },

  // -------------------------------------------------------------------------
  // SYSTEM RESET (KHUSUS SUPER ADMIN)
  // -------------------------------------------------------------------------
  // KOSONGKAN SELURUH DATA SISTEM (0 DATA / BERSIH TOTAL UNTUK MULAI DARI NOL)
  clearAllDataToEmpty() {
    this.saveProjects([]);
    this.saveEmployees([]);
    this.saveTimesheets([]);
    this.saveMutations([]);
    this.saveInventoryItems([]);
    this.saveProjectStocks([]);
    this.saveInventoryLogs([]);
    this.saveTasks([]);
    this.saveBlasts([]);
    this.saveSops([]);
    this.saveFinanceTransactions([]);
    this.saveBankStatements([]);
    this.savePeriodClosings([]);
    this.saveAuditTrails([]);
    this.saveDebts([]);
    this.saveReceivables([]);
    this.saveInvestments([]);

    // Pertahankan struktur Chart of Accounts baku agar modul akuntansi siap pakai
    this.saveChartOfAccounts(INITIAL_CHART_OF_ACCOUNTS);
    this.saveCurrencyRates(INITIAL_CURRENCY_RATES);

    // Pertahankan sesi akun Super Admin agar tidak ter-logout
    const active = this.getActiveUser();
    const adminUser: UserAccount = active || INITIAL_USERS[0];
    this.saveUsers([adminUser]);
    this.saveActiveUser(adminUser);

    try {
      window.dispatchEvent(new Event('app_data_reset'));
    } catch {
      // ignore
    }
  },

  // ISI ULANG DENGAN DATA CONTOH / DEMO
  resetAllDataToDefault() {
    this.saveProjects(INITIAL_PROJECTS);
    this.saveEmployees(INITIAL_EMPLOYEES);
    this.saveTimesheets(generateSeedTimesheets(INITIAL_EMPLOYEES));
    this.saveMutations(INITIAL_MUTATIONS);
    this.saveInventoryItems(INITIAL_INVENTORY_ITEMS);
    this.saveProjectStocks(INITIAL_PROJECT_STOCKS);
    this.saveInventoryLogs(INITIAL_INVENTORY_LOGS);
    this.saveTasks(INITIAL_TASKS);
    this.saveBlasts(INITIAL_BLASTS);
    this.saveSops(INITIAL_SOPS);
    this.saveCompanyProfile(INITIAL_COMPANY_PROFILE);
    this.saveUsers(INITIAL_USERS);
    this.saveChartOfAccounts(INITIAL_CHART_OF_ACCOUNTS);
    this.saveFinanceTransactions(INITIAL_FINANCE_TRANSACTIONS);
    this.saveBankStatements(INITIAL_BANK_STATEMENTS);
    this.savePeriodClosings(INITIAL_PERIOD_CLOSINGS);
    this.saveAuditTrails(INITIAL_AUDIT_TRAILS);
    this.saveCurrencyRates(INITIAL_CURRENCY_RATES);
    this.saveDebts(INITIAL_DEBTS);
    this.saveReceivables(INITIAL_RECEIVABLES);
    this.saveInvestments(INITIAL_INVESTMENTS);

    // Keep active user or reset to superadmin
    try {
      window.dispatchEvent(new Event('app_data_reset'));
    } catch {
      // ignore
    }
  }
};
