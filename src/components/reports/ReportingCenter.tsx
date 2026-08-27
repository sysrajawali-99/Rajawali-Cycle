import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  Search,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  Project,
  Employee,
  TimesheetMonthRecord,
  ProjectStock,
  InventoryItem,
  UserRole
} from '../../types';
import {
  formatCurrency,
  getMonthName,
  getDaysInMonth,
  downloadCSV
} from '../../utils/formatters';

interface ReportingCenterProps {
  projects: Project[];
  employees: Employee[];
  timesheets: TimesheetMonthRecord[];
  projectStocks: ProjectStock[];
  inventoryItems: InventoryItem[];
  selectedProjectId: string;
  userRole: UserRole;
}

export const ReportingCenter: React.FC<ReportingCenterProps> = ({
  projects = [],
  employees = [],
  timesheets = [],
  projectStocks = [],
  inventoryItems = [],
  selectedProjectId = 'ALL',
  userRole
}) => {
  const [reportMonth, setReportMonth] = useState<number>(8); // August
  const [reportYear, setReportYear] = useState<number>(2026);
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Employee for Slip Modal
  const [slipEmployee, setSlipEmployee] = useState<{
    employee: Employee;
    timesheet: TimesheetMonthRecord;
    hadirCount: number;
    alpaCount: number;
    izinCount: number;
    grossPay: number;
    netPay: number;
  } | null>(null);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (emp.status === 'Resign') return false;
      if (filterProject !== 'ALL' && emp.projectId !== filterProject) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.nik.toLowerCase().includes(q) ||
          emp.position.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, filterProject, searchQuery]);

  // Payroll records calculated
  const payrollRows = useMemo(() => {
    return filteredEmployees.map((emp) => {
      const rec = timesheets.find(
        (ts) =>
          ts.employeeId === emp.id &&
          ts.month === reportMonth &&
          ts.year === reportYear
      ) || {
        id: `ts-${emp.id}`,
        employeeId: emp.id,
        projectId: emp.projectId,
        month: reportMonth,
        year: reportYear,
        days: {},
        deductionAmount: 0,
        deductionReason: '',
        bonusAmount: 0,
        notes: ''
      };

      let hadirCount = 0;
      let alpaCount = 0;
      let izinCount = 0;
      let offCount = 0;

      Object.values(rec.days).forEach((st) => {
        if (st === 'H') hadirCount++;
        else if (st === 'A') alpaCount++;
        else if (st === 'I') izinCount++;
        else if (st === 'O') offCount++;
      });

      const grossPay = hadirCount * emp.dailyRate + (rec.bonusAmount || 0);
      const netPay = Math.max(0, grossPay - (rec.deductionAmount || 0));

      return {
        employee: emp,
        timesheet: rec,
        hadirCount,
        alpaCount,
        izinCount,
        offCount,
        grossPay,
        netPay
      };
    });
  }, [filteredEmployees, timesheets, reportMonth, reportYear]);

  // Aggregates
  const totalPayroll = useMemo(() => {
    return payrollRows.reduce((acc, row) => acc + row.netPay, 0);
  }, [payrollRows]);

  const totalDeductions = useMemo(() => {
    return payrollRows.reduce((acc, row) => acc + (row.timesheet.deductionAmount || 0), 0);
  }, [payrollRows]);

  const totalHadirDays = useMemo(() => {
    return payrollRows.reduce((acc, row) => acc + row.hadirCount, 0);
  }, [payrollRows]);

  // Export Payroll Recap CSV
  const handleExportPayrollCSV = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Jabatan',
      'Lokasi Proyek',
      'Shift',
      'Bank & No Rekening',
      'Rate Harian (Rp)',
      'Total Hadir',
      'Total Alpa',
      'Total Izin',
      'Gaji Kotor (Rp)',
      'Potongan (Rp)',
      'Alasan Potongan',
      'Insentif / Lembur (Rp)',
      'Gaji Bersih / Take Home Pay (Rp)'
    ];

    const rows: (string | number)[][] = [headers];

    payrollRows.forEach((r) => {
      const proj = projects.find((p) => p.id === r.employee.projectId);
      rows.push([
        r.employee.nik,
        r.employee.name,
        r.employee.position,
        proj?.name || '-',
        r.employee.shift,
        `${r.employee.bankName} - ${r.employee.bankAccount}`,
        r.employee.dailyRate,
        r.hadirCount,
        r.alpaCount,
        r.izinCount,
        r.grossPay,
        r.timesheet.deductionAmount || 0,
        r.timesheet.deductionReason || '',
        r.timesheet.bonusAmount || 0,
        r.netPay
      ]);
    });

    const filename = `Rekap_Payroll_Rajawali_${getMonthName(reportMonth)}_${reportYear}.csv`;
    downloadCSV(filename, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Rekap Laporan & Payroll Slip Center
              </h1>
              <p className="text-xs text-slate-400">
                Pencetakan slip gaji, rekap cut-off kehadiran, dan transparansi transfer payroll outsourcing.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Export CSV */}
            <button
              id="export-payroll-report-btn"
              onClick={handleExportPayrollCSV}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Export Rekap CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="payroll-search-input"
              type="text"
              placeholder="Cari nama karyawan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              id="payroll-project-filter"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL">Semua Lokasi Proyek</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400">Periode:</span>
            <span className="text-xs font-bold text-amber-400">
              {getMonthName(reportMonth)} {reportYear}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <span className="text-xs text-slate-400">Total Pengeluaran Payroll</span>
          <div className="text-2xl font-black text-amber-400">
            {formatCurrency(totalPayroll)}
          </div>
          <p className="text-[10px] text-slate-500">{payrollRows.length} Personil Penerima Gaji</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <span className="text-xs text-slate-400">Akumulasi Hari Kerja Hadir</span>
          <div className="text-2xl font-black text-emerald-400">
            {totalHadirDays} <span className="text-sm font-normal text-slate-400">Hari</span>
          </div>
          <p className="text-[10px] text-slate-500">Tercatat di Eagle Timesheet</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-1">
          <span className="text-xs text-slate-400">Total Potongan Kedisiplinan</span>
          <div className="text-2xl font-black text-rose-400">
            {formatCurrency(totalDeductions)}
          </div>
          <p className="text-[10px] text-slate-500">Denda pelanggaran seragam / terlambat</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Karyawan & NIK</th>
                <th className="p-3.5">Lokasi & Posisi</th>
                <th className="p-3.5 text-right">Rate / Hari</th>
                <th className="p-3.5 text-center">Hadir</th>
                <th className="p-3.5 text-center">Alpa</th>
                <th className="p-3.5 text-right">Gaji Kotor</th>
                <th className="p-3.5 text-right">Potongan</th>
                <th className="p-3.5 text-right">Gaji Bersih</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {payrollRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    Tidak ada data payroll yang sesuai.
                  </td>
                </tr>
              ) : (
                payrollRows.map((row) => {
                  const proj = projects.find((p) => p.id === row.employee.projectId);
                  return (
                    <tr key={row.employee.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{row.employee.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{row.employee.nik}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-300 font-medium">{proj?.name || '-'}</div>
                        <div className="text-[11px] text-amber-400">{row.employee.position}</div>
                      </td>

                      <td className="p-3.5 text-right font-medium text-slate-300">
                        {formatCurrency(row.employee.dailyRate)}
                      </td>

                      <td className="p-3.5 text-center font-bold text-emerald-400">
                        {row.hadirCount}
                      </td>

                      <td className="p-3.5 text-center font-bold text-rose-400">
                        {row.alpaCount}
                      </td>

                      <td className="p-3.5 text-right font-medium text-slate-300">
                        {formatCurrency(row.grossPay)}
                      </td>

                      <td className="p-3.5 text-right font-semibold text-rose-400">
                        {row.timesheet.deductionAmount > 0
                          ? `- ${formatCurrency(row.timesheet.deductionAmount)}`
                          : 'Rp 0'}
                      </td>

                      <td className="p-3.5 text-right font-black text-amber-400 text-sm">
                        {formatCurrency(row.netPay)}
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          id={`print-slip-btn-${row.employee.id}`}
                          onClick={() => setSlipEmployee(row)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-[11px] rounded-lg transition-colors border border-slate-700 mx-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Slip Gaji</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Gaji Modal / Print Preview */}
      {slipEmployee && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            {/* Header Slip */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🦅</span>
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-tight">PT RAJAWALI CYCLE INDONESIA</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    SLIP GAJI RESMI OUTSOURCING CLEANING SERVICE
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSlipEmployee(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Employee Info Header */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px]">Nama Personil:</span>
                <div className="font-bold text-white text-sm">{slipEmployee.employee.name}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">NIK / Kode:</span>
                <div className="font-bold text-amber-400 font-mono">{slipEmployee.employee.nik}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Posisi / Jabatan:</span>
                <div className="text-slate-300 font-medium">{slipEmployee.employee.position}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Lokasi Penempatan:</span>
                <div className="text-slate-300 font-medium truncate">
                  {projects.find((p) => p.id === slipEmployee.employee.projectId)?.name}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Periode Gaji:</span>
                <div className="text-slate-300">{getMonthName(reportMonth)} {reportYear}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Rekening Payroll:</span>
                <div className="text-slate-300">{slipEmployee.employee.bankName} - {slipEmployee.employee.bankAccount}</div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 border border-slate-800 rounded-2xl p-3.5 bg-slate-950/50">
              <div className="font-bold text-slate-300 text-xs pb-1 border-b border-slate-800">
                Rincian Pendapatan (Penghasilan):
              </div>
              <div className="flex justify-between text-slate-300">
                <span>
                  Gaji Pokok ({slipEmployee.hadirCount} hari x {formatCurrency(slipEmployee.employee.dailyRate)}):
                </span>
                <span className="font-semibold text-white">
                  {formatCurrency(slipEmployee.hadirCount * slipEmployee.employee.dailyRate)}
                </span>
              </div>
              {slipEmployee.timesheet.bonusAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Insentif / Tambahan Lembur:</span>
                  <span className="font-semibold">
                    +{formatCurrency(slipEmployee.timesheet.bonusAmount)}
                  </span>
                </div>
              )}

              <div className="font-bold text-slate-300 text-xs pt-2 pb-1 border-b border-slate-800">
                Rincian Potongan:
              </div>
              {slipEmployee.timesheet.deductionAmount > 0 ? (
                <div className="flex justify-between text-rose-400">
                  <span>
                    Potongan Denda ({slipEmployee.timesheet.deductionReason || 'Disiplin'}):
                  </span>
                  <span className="font-semibold">
                    -{formatCurrency(slipEmployee.timesheet.deductionAmount)}
                  </span>
                </div>
              ) : (
                <div className="text-slate-500 italic">Tidak ada potongan denda</div>
              )}

              {/* Net Total Take Home Pay */}
              <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                <span className="font-extrabold text-white text-sm">TOTAL GAJI BERSIH (TAKE HOME PAY):</span>
                <span className="text-lg font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                  {formatCurrency(slipEmployee.netPay)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSlipEmployee(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Slip (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
