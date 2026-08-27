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
  USER_ROLE: 'rajawali_user_role'
};

export const storageService = {
  getProjects(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      this.saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    try {
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      return JSON.parse(raw);
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
      if (Array.isArray(parsed) && parsed.length > 0) {
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
  }
};
