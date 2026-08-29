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
  ChartOfAccount,
  FinanceTransaction,
  BankStatementImport,
  PeriodClosing,
  AuditTrailItem,
  CurrencyRate
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
  INITIAL_USERS
} from '../data/initialData';
import {
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_FINANCE_TRANSACTIONS,
  INITIAL_BANK_STATEMENTS,
  INITIAL_PERIOD_CLOSINGS,
  INITIAL_AUDIT_TRAILS,
  INITIAL_CURRENCY_RATES
} from '../data/initialFinanceData';

const STORAGE_KEYS = {
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
  CURRENCY_RATES: 'rajawali_finance_currency_rates'
};

export const storageService = {
  getProjects(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      this.saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(data: Project[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data));
  },

  getEmployees(): Employee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!raw) {
      this.saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  },

  saveEmployees(data: Employee[]) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(data));
  },

  getTimesheets(): TimesheetMonthRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMESHEETS);
    if (!raw) {
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
    localStorage.setItem(STORAGE_KEYS.TIMESHEETS, JSON.stringify(data));
  },

  getMutations(): MutationHistory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MUTATIONS);
    if (!raw) {
      this.saveMutations(INITIAL_MUTATIONS);
      return INITIAL_MUTATIONS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_MUTATIONS;
    } catch {
      return INITIAL_MUTATIONS;
    }
  },

  saveMutations(data: MutationHistory[]) {
    localStorage.setItem(STORAGE_KEYS.MUTATIONS, JSON.stringify(data));
  },

  getInventoryItems(): InventoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_ITEMS);
    if (!raw) {
      this.saveInventoryItems(INITIAL_INVENTORY_ITEMS);
      return INITIAL_INVENTORY_ITEMS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_INVENTORY_ITEMS;
    } catch {
      return INITIAL_INVENTORY_ITEMS;
    }
  },

  saveInventoryItems(data: InventoryItem[]) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify(data));
  },

  getProjectStocks(): ProjectStock[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECT_STOCKS);
    if (!raw) {
      this.saveProjectStocks(INITIAL_PROJECT_STOCKS);
      return INITIAL_PROJECT_STOCKS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_PROJECT_STOCKS;
    } catch {
      return INITIAL_PROJECT_STOCKS;
    }
  },

  saveProjectStocks(data: ProjectStock[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECT_STOCKS, JSON.stringify(data));
  },

  getInventoryLogs(): InventoryLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
    if (!raw) {
      this.saveInventoryLogs(INITIAL_INVENTORY_LOGS);
      return INITIAL_INVENTORY_LOGS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_INVENTORY_LOGS;
    } catch {
      return INITIAL_INVENTORY_LOGS;
    }
  },

  saveInventoryLogs(data: InventoryLog[]) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(data));
  },

  getTasks(): CleaningTask[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      this.saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy demo tasks (tsk-1 through tsk-7)
        const demoTaskIds = ['tsk-1', 'tsk-2', 'tsk-3', 'tsk-3b', 'tsk-3c', 'tsk-3d', 'tsk-3e', 'tsk-4', 'tsk-5', 'tsk-6', 'tsk-7'];
        const hasDemoTasks = parsed.some((t: CleaningTask) => demoTaskIds.includes(t.id));
        if (hasDemoTasks) {
          const cleaned = parsed.filter((t: CleaningTask) => !demoTaskIds.includes(t.id));
          this.saveTasks(cleaned);
          return cleaned;
        }
        return parsed;
      }
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  },

  saveTasks(data: CleaningTask[]) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data));
  },

  getBlasts(): BlastAnnouncement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BLASTS);
    if (!raw) {
      this.saveBlasts(INITIAL_BLASTS);
      return INITIAL_BLASTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_BLASTS;
    } catch {
      return INITIAL_BLASTS;
    }
  },

  saveBlasts(data: BlastAnnouncement[]) {
    localStorage.setItem(STORAGE_KEYS.BLASTS, JSON.stringify(data));
  },

  getSops(): SopDocument[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SOPS);
    if (!raw) {
      this.saveSops(INITIAL_SOPS);
      return INITIAL_SOPS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const enriched = parsed.map((item: SopDocument) => {
          const matchedInitial = INITIAL_SOPS.find((init) => init.id === item.id);
          if (matchedInitial) {
            return {
              ...matchedInitial,
              ...item,
              objective: item.objective || matchedInitial.objective,
              equipmentList: item.equipmentList && item.equipmentList.length > 0 ? item.equipmentList : matchedInitial.equipmentList,
              chemicalList: item.chemicalList && item.chemicalList.length > 0 ? item.chemicalList : matchedInitial.chemicalList,
              equipmentMaintenance: item.equipmentMaintenance && item.equipmentMaintenance.length > 0 ? item.equipmentMaintenance : matchedInitial.equipmentMaintenance,
              requiredPPE: item.requiredPPE && item.requiredPPE.length > 0 ? item.requiredPPE : matchedInitial.requiredPPE,
            };
          }
          return item;
        });
        return enriched;
      }
      return INITIAL_SOPS;
    } catch {
      return INITIAL_SOPS;
    }
  },

  saveSops(data: SopDocument[]) {
    localStorage.setItem(STORAGE_KEYS.SOPS, JSON.stringify(data));
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
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data));
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
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.TIMESHEETS);
    localStorage.removeItem(STORAGE_KEYS.MUTATIONS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.PROJECT_STOCKS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.BLASTS);
    localStorage.removeItem(STORAGE_KEYS.SOPS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    // Don't necessarily clear active user if user just wants data reset, or reset users to default
    this.saveUsers(INITIAL_USERS);
    localStorage.removeItem(STORAGE_KEYS.CHART_OF_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.FINANCE_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BANK_STATEMENTS);
    localStorage.removeItem(STORAGE_KEYS.PERIOD_CLOSINGS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_TRAILS);
    localStorage.removeItem(STORAGE_KEYS.CURRENCY_RATES);
  },

  // Finance Storage Handlers
  getChartOfAccounts(): ChartOfAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHART_OF_ACCOUNTS);
    if (!raw) {
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
    localStorage.setItem(STORAGE_KEYS.CHART_OF_ACCOUNTS, JSON.stringify(data));
  },

  getFinanceTransactions(): FinanceTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE_TRANSACTIONS);
    if (!raw) {
      this.saveFinanceTransactions(INITIAL_FINANCE_TRANSACTIONS);
      return INITIAL_FINANCE_TRANSACTIONS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_FINANCE_TRANSACTIONS;
    } catch {
      return INITIAL_FINANCE_TRANSACTIONS;
    }
  },

  saveFinanceTransactions(data: FinanceTransaction[]) {
    localStorage.setItem(STORAGE_KEYS.FINANCE_TRANSACTIONS, JSON.stringify(data));
  },

  getBankStatements(): BankStatementImport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BANK_STATEMENTS);
    if (!raw) {
      this.saveBankStatements(INITIAL_BANK_STATEMENTS);
      return INITIAL_BANK_STATEMENTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_BANK_STATEMENTS;
    } catch {
      return INITIAL_BANK_STATEMENTS;
    }
  },

  saveBankStatements(data: BankStatementImport[]) {
    localStorage.setItem(STORAGE_KEYS.BANK_STATEMENTS, JSON.stringify(data));
  },

  getPeriodClosings(): PeriodClosing[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PERIOD_CLOSINGS);
    if (!raw) {
      this.savePeriodClosings(INITIAL_PERIOD_CLOSINGS);
      return INITIAL_PERIOD_CLOSINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_PERIOD_CLOSINGS;
    } catch {
      return INITIAL_PERIOD_CLOSINGS;
    }
  },

  savePeriodClosings(data: PeriodClosing[]) {
    localStorage.setItem(STORAGE_KEYS.PERIOD_CLOSINGS, JSON.stringify(data));
  },

  getAuditTrails(): AuditTrailItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_TRAILS);
    if (!raw) {
      this.saveAuditTrails(INITIAL_AUDIT_TRAILS);
      return INITIAL_AUDIT_TRAILS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_AUDIT_TRAILS;
    } catch {
      return INITIAL_AUDIT_TRAILS;
    }
  },

  saveAuditTrails(data: AuditTrailItem[]) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_TRAILS, JSON.stringify(data));
  },

  getCurrencyRates(): CurrencyRate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENCY_RATES);
    if (!raw) {
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
    localStorage.setItem(STORAGE_KEYS.CURRENCY_RATES, JSON.stringify(data));
  }
};
