export type AttendanceStatus = 'H' | 'A' | 'I' | 'O' | '';

export type EmployeePosition = 
  | 'Cleaner'
  | 'Team Leader'
  | 'Floor Specialist'
  | 'Gardener'
  | 'Gondola / Facade Cleaner'
  | 'Supervisor';

export type ShiftType = 
  | 'Pagi (06:00 - 14:00)'
  | 'Siang (14:00 - 22:00)'
  | 'Malam (22:00 - 06:00)'
  | 'General (08:00 - 17:00)';

export type EmployeeStatus = 'Aktif' | 'Mutasi' | 'Cuti' | 'Resign';

export type FloorType = 'Marmer' | 'Granit' | 'Kramik' | 'Kayu' | 'Concrete';

export interface Project {
  id: string;
  code: string;
  name: string;
  type: 'Mall' | 'Rumah Sakit' | 'Perkantoran' | 'Apartemen' | 'Pabrik / Industri' | 'Hotel' | 'Universitas' | 'Lainnya';
  address: string;
  siteSupervisor: string;
  phone: string;
  activeCleanersCount: number;

  // Spesifikasi Detail Lokasi Proyek
  manpowerCount?: number;             // b. Jumlah Manpower
  floorCount?: number;                // c. Jumlah Lantai
  passengerLiftCount?: number;        // d. Jumlah Lift Penumpang
  serviceLiftCount?: number;          // e. Jumlah Lift Service
  escalatorCount?: number;            // f. Jumlah Eskalator
  travelatorCount?: number;           // g. Jumlah Travalator
  lobbyCount?: number;                // h. Jumlah Lobby
  basementParkingCount?: number;      // i. Jumlah Parkir Basement
  upperParkingCount?: number;         // j. Jumlah Lantai Parkir Atas
  totalToiletCount?: number;          // k. Jumlah Keseluruhan Toilet
  cubicleCount?: number;              // l. Jumlah Kubikal
  urinalCount?: number;               // m. Jumlah Urinal
  washbasinCount?: number;            // n. Jumlah Washtafel
  toiletPointsPerFloorPW?: string;    // o. Jumlah Titik Toilet Per lantai P/W

  // Jenis Lantai (Pilihan Multi-select)
  floorTypes?: FloorType[];           // Marmer, Granit, Kramik, Kayu, Concrete

  // Metadata Pendukung
  clientName?: string;
  operationalHours?: string;
  totalAreaM2?: number;
  notes?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  nik: string;
  name: string;
  phone: string;
  position: EmployeePosition;
  projectId: string;
  shift: ShiftType;
  dailyRate: number; // Rupiah per hari hadir
  status: EmployeeStatus;
  joinDate: string;
  uniformSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  bankName: string;
  bankAccount: string;
}

export interface TimesheetMonthRecord {
  id: string;
  employeeId: string;
  projectId: string;
  month: number; // 1 - 12
  year: number;  // e.g. 2026
  days: Record<number, AttendanceStatus>; // 1 -> 'H', 2 -> 'A', etc.
  deductionAmount: number; // Nilai potongan dalam rupiah
  deductionReason: string; // Catatan alasan potongan
  bonusAmount: number;     // Insentif / tambahan lembur
  notes: string;
}

export interface MutationHistory {
  id: string;
  employeeId: string;
  employeeName: string;
  nik: string;
  fromProjectId: string;
  fromProjectName: string;
  toProjectId: string;
  toProjectName: string;
  effectiveDate: string;
  reason: string;
  adminName: string;
  createdAt: string;
}

export type InventoryCategory = 'Chemical' | 'Equipment' | 'Consumable' | 'Safety / APD';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: InventoryCategory;
  unit: string; // e.g. 'Jerigen 5L', 'Botol 1L', 'Pcs', 'Roll', 'Unit'
  minStock: number; // Minimal threshold
  description: string;
  unitPrice: number;
}

export interface ProjectStock {
  id: string;
  projectId: string;
  itemId: string;
  currentStock: number;
  lastUpdated: string;
}

export interface InventoryLog {
  id: string;
  projectId: string;
  itemId: string;
  type: 'IN' | 'OUT'; // IN: Barang Masuk/Restock, OUT: Pemakaian Harian
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  pic: string;
  notes: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface CleaningTask {
  id: string;
  projectId: string;
  areaName: string;
  frequency: 'Harian' | 'Per-Shift' | 'Mingguan' | 'Deep Cleaning';
  assignedEmployees: string[]; // List of employee names or IDs
  shift: ShiftType;
  status: TaskStatus;
  priority: 'Rutin' | 'Sedang' | 'Tinggi' | 'Urgent';
  checklist: { id: string; text: string; done: boolean }[];
  notes: string;
  updatedAt: string;
}

export interface BlastAnnouncement {
  id: string;
  title: string;
  content: string;
  sender?: string;
  senderRole?: string;
  author?: string;
  date: string;
  category: string;
  pinned: boolean;
  targetProjectId?: string; // 'ALL' or specific projectId
}

export interface SopDocument {
  id: string;
  code?: string;
  title: string;
  category: string;
  version: string;
  description?: string;
  steps: string[];
  safetyEquipment?: string[];
  chemicalsUsed?: string[];
  requiredChemicals?: string[];
  requiredPPE?: string[];
  lastUpdated: string;
}

export type SopItem = SopDocument;

export type AppView = 
  | 'dashboard'
  | 'project_settings'
  | 'timesheet'
  | 'employees'
  | 'inventory'
  | 'tasks'
  | 'blast'
  | 'sops'
  | 'sop'
  | 'reports'
  | 'access_control';

export type UserRole = 
  | 'Super Admin (HQ)' 
  | 'Admin Operasional' 
  | 'Admin Lokasi 1' 
  | 'Admin Lokasi 2' 
  | 'Supervisor Lapangan' 
  | 'Manajemen Pusat';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  assignedProjectId: string; // 'ALL' or specific projectId
  isLocationLocked: boolean; // if true, site selector is fixed and locked
  allowedViews: AppView[];
  status: 'Aktif' | 'Nonaktif';
  phone?: string;
  lastLogin?: string;
}
