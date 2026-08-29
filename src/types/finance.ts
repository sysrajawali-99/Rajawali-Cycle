import { AppView } from './index';

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export type AccountCategory = 
  | 'Kas & Bank'
  | 'Piutang Usaha'
  | 'Persediaan & Logistik'
  | 'Biaya Dibayar di Muka'
  | 'Aset Tetap'
  | 'Akumulasi Penyusutan'
  | 'Utang Usaha / Supplier'
  | 'Utang Gaji & Operasional'
  | 'Utang Pajak'
  | 'Utang Jangka Panjang'
  | 'Modal Saham'
  | 'Laba Ditahan'
  | 'Pendapatan Jasa Kontrak'
  | 'Pendapatan Jasa Khusus'
  | 'Pendapatan Non-Operasional'
  | 'HPP - Tenaga Kerja Langsung'
  | 'HPP - Chemical & Perlengkapan'
  | 'Beban Gaji Staf & Manajemen'
  | 'Beban Operasional Gedung'
  | 'Beban Pemeliharaan & Mesin'
  | 'Beban Pemasaran & Representasi'
  | 'Beban Umum & Administrasi'
  | 'Beban Penyusutan Aset'
  | 'Beban Pajak & Bunga Bank';

export interface ChartOfAccount {
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  normalBalance: 'Debit' | 'Credit';
  initialBalance: number;
  currentBalance: number;
  description: string;
  isActive: boolean;
  isSystem?: boolean;
}

export type TransactionType = 'IN' | 'OUT' | 'JOURNAL' | 'ADJUSTMENT';

export type PaymentMethod = 
  | 'Bank BCA (123-456-7890)'
  | 'Bank Mandiri (987-654-3210)'
  | 'Bank BNI (555-444-333)'
  | 'Bank BRI (888-999-000)'
  | 'Kas Tunai / Petty Cash HQ'
  | 'Kas Operasional Lapangan';

export type DivisionType = 
  | 'Cleaning Service'
  | 'Gondola & Facade'
  | 'Gardening & Landscape'
  | 'Sanitation & Pest Control'
  | 'Logistik & Chemical'
  | 'HQ Management & Operasional';

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  notes?: string;
}

export interface FinanceTransaction {
  id: string;
  code: string; // e.g. BKM-2026-08-001 or BKK-2026-08-001 or JU-2026-08-001
  date: string; // YYYY-MM-DD
  type: TransactionType; // IN (Uang Masuk), OUT (Uang Keluar), JOURNAL (Jurnal Umum), ADJUSTMENT (Jurnal Penyesuaian)
  title: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  primaryAccountCode: string; // Akun Kas/Bank atau Akun Utama
  contraAccountCode: string; // Akun Lawan (Pendapatan/Beban/Utang/Piutang)
  journalEntries: JournalEntryLine[];
  projectId: string; // 'ALL' or specific projectId (Cost Center)
  projectName?: string;
  division: DivisionType;
  currency: 'IDR' | 'USD' | 'SGD';
  exchangeRate: number; // to IDR
  referenceNumber?: string; // No Kuitansi / Invoice / Faktur
  payeeOrPayer?: string; // Dari Siapa / Kepada Siapa
  attachmentName?: string;
  isReconciled: boolean;
  bankStatementItemId?: string;
  isAdjusting: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type ReconcileStatus = 'MATCHED' | 'UNMATCHED' | 'MANUAL_MATCHED' | 'IGNORED';

export interface BankStatementItem {
  id: string;
  date: string;
  description: string;
  type: 'CR' | 'DB'; // CR = Uang Masuk, DB = Uang Keluar
  amount: number;
  balance?: number;
  referenceNumber?: string;
  matchStatus: ReconcileStatus;
  matchedTransactionId?: string;
  matchedTransactionCode?: string;
  suggestedAccountCode?: string;
  confidenceScore?: number; // 0 - 100
  notes?: string;
}

export interface BankStatementImport {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  periodMonth: string; // e.g. 2026-08
  fileName: string;
  uploadDate: string;
  totalTransactions: number;
  totalCredit: number; // Masuk
  totalDebit: number; // Keluar
  matchedCount: number;
  unmatchedCount: number;
  items: BankStatementItem[];
}

export interface PeriodClosing {
  id: string;
  periodYear?: number;
  periodMonth: string | number;
  periodLabel?: string;
  closedAt: string;
  closedBy: string;
  status?: 'CLOSED' | 'OPEN';
  isLocked?: boolean;
  netProfitTransferred?: number;
  netProfit?: number;
  totalRevenue: number;
  totalExpense?: number;
  totalExpenses?: number;
  notes: string;
}

export interface AuditTrailItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'RECONCILE' | 'CLOSE_PERIOD' | 'REOPEN_PERIOD' | 'IMPORT_STATEMENT';
  module: 'Uang Masuk' | 'Uang Keluar' | 'Jurnal Umum' | 'Jurnal Penyesuaian' | 'Rekonsiliasi Bank' | 'Tutup Buku' | 'Master Akun COA';
  recordId: string;
  recordCode?: string;
  description: string;
  amount?: number;
  ipAddress?: string;
}

export interface CostCenterReport {
  projectId: string;
  projectName: string;
  revenue: number;
  cogsLabor: number;
  cogsChemical: number;
  cogsOther: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
  directOpex: number;
  netContribution: number;
  netContributionPct: number;
  cleanerCount: number;
  costPerCleaner: number;
}

export interface FinancialRatios {
  currentRatio: number; // Aset Lancar / Liabilitas Lancar
  quickRatio: number; // (Kas + Piutang) / Liabilitas Lancar
  cashRatio: number; // Kas & Bank / Liabilitas Lancar
  grossProfitMargin: number; // (Laba Kotor / Pendapatan) * 100
  operatingProfitMargin: number; // (Laba Usaha / Pendapatan) * 100
  netProfitMargin: number; // (Laba Bersih / Pendapatan) * 100
  returnOnAssets: number; // (Laba Bersih / Total Aset) * 100
  returnOnEquity: number; // (Laba Bersih / Total Ekuitas) * 100
  debtToEquityRatio: number; // Total Liabilitas / Total Ekuitas
  workingCapital: number; // Aset Lancar - Liabilitas Lancar
  monthlyBurnRate: number; // Rata-rata beban operasional bulanan
  cashRunwayMonths: number; // Total Kas / Monthly Burn Rate
}

export type FinancialRatio = FinancialRatios;

export interface ProfitLossStatement {
  periodLabel: string;
  revenueAccounts: { code: string; name: string; amount: number }[];
  totalRevenue: number;
  cogsAccounts: { code: string; name: string; amount: number }[];
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
  opexAccounts: { code: string; name: string; amount: number }[];
  totalOpex: number;
  operatingIncome: number;
  operatingMarginPct: number;
  otherIncomeAccounts: { code: string; name: string; amount: number }[];
  totalOtherIncome: number;
  otherExpenseAccounts: { code: string; name: string; amount: number }[];
  totalOtherExpense: number;
  netProfit: number;
  netMarginPct: number;
}

export interface BalanceSheetStatement {
  asOfDate: string;
  currentAssets: { code: string; name: string; amount: number }[];
  totalCurrentAssets: number;
  fixedAssets: { code: string; name: string; amount: number }[];
  totalFixedAssets: number;
  totalAssets: number;
  currentLiabilities: { code: string; name: string; amount: number }[];
  totalCurrentLiabilities: number;
  longTermLiabilities: { code: string; name: string; amount: number }[];
  totalLongTermLiabilities: number;
  totalLiabilities: number;
  equityAccounts: { code: string; name: string; amount: number }[];
  currentPeriodNetProfit: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  variance: number;
}

export interface CashFlowStatement {
  periodLabel: string;
  operatingInflows: { description: string; amount: number }[];
  totalOperatingInflows: number;
  operatingOutflows: { description: string; amount: number }[];
  totalOperatingOutflows: number;
  netOperatingCashFlow: number;

  investingInflows: { description: string; amount: number }[];
  investingOutflows: { description: string; amount: number }[];
  netInvestingCashFlow: number;

  financingInflows: { description: string; amount: number }[];
  financingOutflows: { description: string; amount: number }[];
  netFinancingCashFlow: number;

  netCashChange: number;
  beginningCash: number;
  endingCash: number;
}

export interface EquityStatement {
  periodLabel: string;
  beginningShareCapital: number;
  capitalAdditions: number;
  endingShareCapital: number;
  beginningRetainedEarnings: number;
  currentNetProfit: number;
  dividendsPaid: number;
  endingRetainedEarnings: number;
  totalBeginningEquity: number;
  totalEndingEquity: number;
}

export interface CurrencyRate {
  code: 'IDR' | 'USD' | 'SGD';
  name: string;
  symbol: string;
  rateToIdr: number;
  lastUpdated: string;
}
