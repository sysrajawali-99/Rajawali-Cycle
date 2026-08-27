import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MinusCircle,
  HelpCircle,
  Download,
  Filter,
  Search,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  Edit3,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  Smartphone,
  Table,
  UserCheck,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import {
  Project,
  Employee,
  TimesheetMonthRecord,
  AttendanceStatus,
  UserRole
} from '../../types';
import {
  formatCurrency,
  getDaysInMonth,
  getDayName,
  isWeekend,
  getMonthName,
  downloadCSV
} from '../../utils/formatters';

interface EagleTimesheetProps {
  projects: Project[];
  employees: Employee[];
  timesheets: TimesheetMonthRecord[];
  selectedProjectId: string;
  onUpdateTimesheets: (updated: TimesheetMonthRecord[]) => void;
  userRole: UserRole;
}

export const EagleTimesheet: React.FC<EagleTimesheetProps> = ({
  projects = [],
  employees = [],
  timesheets = [],
  selectedProjectId = 'ALL',
  onUpdateTimesheets,
  userRole
}) => {
  // Calendar month state: Default to August 2026
  const [currentMonth, setCurrentMonth] = useState<number>(8);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  
  // Mobile / View Mode: 'daily' (Mobile-Friendly Roll-Call) or 'matrix' (31-Day Table)
  const [viewMode, setViewMode] = useState<'daily' | 'matrix'>('daily');
  const [activeDailyDate, setActiveDailyDate] = useState<number>(25); // Default today (day 25)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('ALL');
  const [filterPosition, setFilterPosition] = useState<string>('ALL');
  const [selectedDayToBulk, setSelectedDayToBulk] = useState<number>(25);

  // Deduction Modal State
  const [editingDeduction, setEditingDeduction] = useState<{
    employee: Employee;
    timesheetRecord: TimesheetMonthRecord;
    amount: number;
    reason: string;
    bonus: number;
  } | null>(null);

  // Status legend modal or tooltip
  const [showLegend, setShowLegend] = useState(false);

  // Days in selected month
  const totalDays = useMemo(() => {
    return getDaysInMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const daysArray = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => i + 1);
  }, [totalDays]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (emp.status === 'Resign') return false; // Only active/mutated in current roster
      if (selectedProjectId !== 'ALL' && emp.projectId !== selectedProjectId) return false;
      if (filterShift !== 'ALL' && !emp.shift.includes(filterShift)) return false;
      if (filterPosition !== 'ALL' && emp.position !== filterPosition) return false;
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
  }, [employees, selectedProjectId, filterShift, filterPosition, searchQuery]);

  // Helper to find or create timesheet record for an employee for this month/year
  const getRecordForEmployee = (employeeId: string): TimesheetMonthRecord => {
    const existing = timesheets.find(
      (ts) =>
        ts.employeeId === employeeId &&
        ts.month === currentMonth &&
        ts.year === currentYear
    );

    if (existing) return existing;

    // Default empty record
    const emp = employees.find(e => e.id === employeeId);
    return {
      id: `ts-${employeeId}-${currentYear}-${currentMonth}`,
      employeeId,
      projectId: emp?.projectId || '',
      month: currentMonth,
      year: currentYear,
      days: {},
      deductionAmount: 0,
      deductionReason: '',
      bonusAmount: 0,
      notes: ''
    };
  };

  // Direct status setter for mobile buttons
  const handleSetStatusDirect = (employeeId: string, day: number, newStatus: AttendanceStatus | '') => {
    const currentRecord = getRecordForEmployee(employeeId);
    const existingStatus = currentRecord.days[day] || '';

    // If tapping the same status, toggle it off to empty
    const finalStatus = existingStatus === newStatus ? '' : newStatus;

    const newDays = { ...currentRecord.days };
    if (finalStatus === '') {
      delete newDays[day];
    } else {
      newDays[day] = finalStatus as AttendanceStatus;
    }

    const updatedRecord: TimesheetMonthRecord = {
      ...currentRecord,
      days: newDays
    };

    const nextTimesheets = [...timesheets];
    const existingIdx = nextTimesheets.findIndex(
      (ts) =>
        ts.employeeId === employeeId &&
        ts.month === currentMonth &&
        ts.year === currentYear
    );

    if (existingIdx >= 0) {
      nextTimesheets[existingIdx] = updatedRecord;
    } else {
      nextTimesheets.push(updatedRecord);
    }

    onUpdateTimesheets(nextTimesheets);
  };

  // Cycle Attendance Status on Click: '' -> 'H' -> 'A' -> 'I' -> 'O' -> ''
  const handleCellClick = (employeeId: string, day: number) => {
    const currentRecord = getRecordForEmployee(employeeId);
    const currentStatus = currentRecord.days[day] || '';

    let nextStatus: AttendanceStatus = 'H';
    if (currentStatus === '') nextStatus = 'H';
    else if (currentStatus === 'H') nextStatus = 'A';
    else if (currentStatus === 'A') nextStatus = 'I';
    else if (currentStatus === 'I') nextStatus = 'O';
    else if (currentStatus === 'O') nextStatus = '';

    const newDays = { ...currentRecord.days };
    if (nextStatus === '') {
      delete newDays[day];
    } else {
      newDays[day] = nextStatus;
    }

    const updatedRecord: TimesheetMonthRecord = {
      ...currentRecord,
      days: newDays
    };

    const nextTimesheets = [...timesheets];
    const existingIdx = nextTimesheets.findIndex(
      (ts) =>
        ts.employeeId === employeeId &&
        ts.month === currentMonth &&
        ts.year === currentYear
    );

    if (existingIdx >= 0) {
      nextTimesheets[existingIdx] = updatedRecord;
    } else {
      nextTimesheets.push(updatedRecord);
    }

    onUpdateTimesheets(nextTimesheets);
  };

  // Bulk action: Mark all filtered employees present for a given day
  const handleBulkMarkPresent = (day: number) => {
    const nextTimesheets = [...timesheets];

    filteredEmployees.forEach((emp) => {
      const rec = getRecordForEmployee(emp.id);
      const updatedRec: TimesheetMonthRecord = {
        ...rec,
        days: {
          ...rec.days,
          [day]: 'H'
        }
      };

      const existingIdx = nextTimesheets.findIndex(
        (ts) =>
          ts.employeeId === emp.id &&
          ts.month === currentMonth &&
          ts.year === currentYear
      );

      if (existingIdx >= 0) {
        nextTimesheets[existingIdx] = updatedRec;
      } else {
        nextTimesheets.push(updatedRec);
      }
    });

    onUpdateTimesheets(nextTimesheets);
  };

  // Bulk action: Clear specific day
  const handleBulkClearDay = (day: number) => {
    const nextTimesheets = [...timesheets];

    filteredEmployees.forEach((emp) => {
      const rec = getRecordForEmployee(emp.id);
      const newDays = { ...rec.days };
      delete newDays[day];

      const updatedRec: TimesheetMonthRecord = {
        ...rec,
        days: newDays
      };

      const existingIdx = nextTimesheets.findIndex(
        (ts) =>
          ts.employeeId === emp.id &&
          ts.month === currentMonth &&
          ts.year === currentYear
      );

      if (existingIdx >= 0) {
        nextTimesheets[existingIdx] = updatedRec;
      } else {
        nextTimesheets.push(updatedRec);
      }
    });

    onUpdateTimesheets(nextTimesheets);
  };

  // Calculation helpers per row
  const calculateRowStats = (employee: Employee, record: TimesheetMonthRecord) => {
    let hadir = 0;
    let alpa = 0;
    let izin = 0;
    let off = 0;

    Object.values(record.days).forEach((status) => {
      if (status === 'H') hadir++;
      else if (status === 'A') alpa++;
      else if (status === 'I') izin++;
      else if (status === 'O') off++;
    });

    const grossPay = hadir * employee.dailyRate + (record.bonusAmount || 0);
    const deduction = record.deductionAmount || 0;
    const netPay = Math.max(0, grossPay - deduction);

    return {
      hadir,
      alpa,
      izin,
      off,
      grossPay,
      deduction,
      bonus: record.bonusAmount || 0,
      netPay
    };
  };

  // Stats for the active daily roll-call
  const dailyStats = useMemo(() => {
    let hadir = 0;
    let alpa = 0;
    let izin = 0;
    let off = 0;
    let unrecorded = 0;

    filteredEmployees.forEach((emp) => {
      const rec = getRecordForEmployee(emp.id);
      const st = rec.days[activeDailyDate];
      if (st === 'H') hadir++;
      else if (st === 'A') alpa++;
      else if (st === 'I') izin++;
      else if (st === 'O') off++;
      else unrecorded++;
    });

    return { hadir, alpa, izin, off, unrecorded, total: filteredEmployees.length };
  }, [filteredEmployees, timesheets, activeDailyDate, currentMonth, currentYear]);

  // Overall Financial & Attendance Summary for current view
  const summary = useMemo(() => {
    let totalPayrollAll = 0;
    let totalDeductionsAll = 0;
    let totalBonusAll = 0;
    let totalHadirAll = 0;
    let totalAlpaAll = 0;
    let totalIzinAll = 0;

    filteredEmployees.forEach((emp) => {
      const rec = getRecordForEmployee(emp.id);
      const stats = calculateRowStats(emp, rec);
      totalPayrollAll += stats.netPay;
      totalDeductionsAll += stats.deduction;
      totalBonusAll += stats.bonus;
      totalHadirAll += stats.hadir;
      totalAlpaAll += stats.alpa;
      totalIzinAll += stats.izin;
    });

    return {
      totalEmployees: filteredEmployees.length,
      totalPayrollAll,
      totalDeductionsAll,
      totalBonusAll,
      totalHadirAll,
      totalAlpaAll,
      totalIzinAll
    };
  }, [filteredEmployees, timesheets, currentMonth, currentYear]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Day navigation for Daily Roll-Call
  const handlePrevDay = () => {
    if (activeDailyDate > 1) {
      setActiveDailyDate(activeDailyDate - 1);
    }
  };

  const handleNextDay = () => {
    if (activeDailyDate < totalDays) {
      setActiveDailyDate(activeDailyDate + 1);
    }
  };

  // Save deduction / bonus edits
  const handleSaveDeduction = () => {
    if (!editingDeduction) return;

    const nextTimesheets = [...timesheets];
    const existingIdx = nextTimesheets.findIndex(
      (ts) =>
        ts.employeeId === editingDeduction.employee.id &&
        ts.month === currentMonth &&
        ts.year === currentYear
    );

    const updatedRec: TimesheetMonthRecord = {
      ...editingDeduction.timesheetRecord,
      deductionAmount: Number(editingDeduction.amount) || 0,
      deductionReason: editingDeduction.reason,
      bonusAmount: Number(editingDeduction.bonus) || 0
    };

    if (existingIdx >= 0) {
      nextTimesheets[existingIdx] = updatedRec;
    } else {
      nextTimesheets.push(updatedRec);
    }

    onUpdateTimesheets(nextTimesheets);
    setEditingDeduction(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'NIK',
      'Nama Karyawan',
      'Posisi',
      'Lokasi Proyek',
      'Shift',
      'Rate Harian (Rp)',
      ...daysArray.map((d) => `Tgl ${d}`),
      'Total Hadir',
      'Total Alpa',
      'Total Izin',
      'Potongan (Rp)',
      'Alasan Potongan',
      'Insentif / Lembur (Rp)',
      'Gaji Bersih / Take Home Pay (Rp)'
    ];

    const rows: (string | number)[][] = [headers];

    filteredEmployees.forEach((emp) => {
      const rec = getRecordForEmployee(emp.id);
      const stats = calculateRowStats(emp, rec);
      const proj = projects.find((p) => p.id === emp.projectId);

      const dayCells = daysArray.map((d) => rec.days[d] || '-');

      rows.push([
        emp.nik,
        emp.name,
        emp.position,
        proj?.name || '-',
        emp.shift,
        emp.dailyRate,
        ...dayCells,
        stats.hadir,
        stats.alpa,
        stats.izin,
        stats.deduction,
        rec.deductionReason || '',
        stats.bonus,
        stats.netPay
      ]);
    });

    const filename = `Timesheet_Rajawali_${getMonthName(currentMonth)}_${currentYear}.csv`;
    downloadCSV(filename, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-xl space-y-3">
        {/* Top Header: Title & Month Picker & View Mode Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 sm:p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <CalendarCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Eagle Timesheet Matrix
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {summary.totalEmployees} Personil
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Sistem absensi harian dan perhitungan payroll otomatis 1-31 hari.
              </p>
            </div>
          </div>

          {/* Month Navigator & View Mode Buttons */}
          <div className="flex items-center flex-wrap gap-2 justify-between lg:justify-end">
            {/* View Mode Toggle: Mobile Card vs 31-Day Matrix */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                id="view-mode-daily-btn"
                onClick={() => setViewMode('daily')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'daily'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Absensi Harian</span>
              </button>
              <button
                id="view-mode-matrix-btn"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Matriks 31 Hari</span>
              </button>
            </div>

            {/* Month Picker */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                id="prev-month-btn"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2.5 py-1 font-bold text-xs sm:text-sm text-amber-300 min-w-[120px] text-center">
                {getMonthName(currentMonth)} {currentYear}
              </div>
              <button
                id="next-month-btn"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              id="export-timesheet-csv-btn"
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Legend Drawer Trigger */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Status Absensi:</span>
            <span className="text-emerald-400 font-bold">H: Hadir</span> • 
            <span className="text-rose-400 font-bold">A: Alpa</span> • 
            <span className="text-amber-400 font-bold">I: Izin</span> • 
            <span className="text-slate-400 font-bold">OFF: Libur</span>
          </div>
          <button
            id="show-legend-btn"
            onClick={() => setShowLegend(!showLegend)}
            className="text-amber-400 hover:underline flex items-center space-x-1"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Panduan</span>
          </button>
        </div>

        {/* Legend Drawer (Toggleable) */}
        {showLegend && (
          <div className="mt-2 pt-2 border-t border-slate-800 bg-slate-950/80 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center flex-wrap gap-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ✓
                </span>
                <span className="text-slate-300"><b>Hadir (H)</b>: Gaji Penuh</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-6 h-6 rounded bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ✗
                </span>
                <span className="text-slate-300"><b>Alpa (A)</b>: Mangkir</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-6 h-6 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                  !
                </span>
                <span className="text-slate-300"><b>Izin (I)</b>: Sakit / Dinas</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-6 h-6 rounded bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs shadow-sm">
                  OFF
                </span>
                <span className="text-slate-300"><b>Off (O)</b>: Jadwal Libur</span>
              </div>
            </div>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold"
            >
              Tutup ✕
            </button>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            id="timesheet-search-input"
            type="text"
            placeholder="Cari nama karyawan / NIK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        {/* Filter Shift */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">Shift:</span>
          <select
            id="timesheet-filter-shift"
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">Semua Shift</option>
            <option value="Pagi" className="bg-slate-900">Pagi (06:00 - 14:00)</option>
            <option value="Siang" className="bg-slate-900">Siang (14:00 - 22:00)</option>
            <option value="Malam" className="bg-slate-900">Malam (22:00 - 06:00)</option>
            <option value="General" className="bg-slate-900">General (08:00 - 17:00)</option>
          </select>
        </div>

        {/* Filter Position */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">Posisi:</span>
          <select
            id="timesheet-filter-position"
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">Semua Posisi</option>
            <option value="Cleaner" className="bg-slate-900">Cleaner</option>
            <option value="Team Leader" className="bg-slate-900">Team Leader</option>
            <option value="Floor Specialist" className="bg-slate-900">Floor Specialist</option>
            <option value="Gardener" className="bg-slate-900">Gardener</option>
            <option value="Gondola / Facade Cleaner" className="bg-slate-900">Gondola Cleaner</option>
          </select>
        </div>

        {/* Quick KPI Badge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400">Total Personil:</span>{' '}
            <span className="font-bold text-white">{summary.totalEmployees} Org</span>
          </div>
          <div className="text-xs">
            <span className="text-slate-400">Payroll:</span>{' '}
            <span className="font-bold text-amber-400">{formatCurrency(summary.totalPayrollAll)}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: MOBILE DAILY ROLL-CALL VIEW (Optimized for Android & iPhone)      */}
      {/* ========================================================================= */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {/* Day Date Navigation Strip */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <button
                id="daily-prev-day-btn"
                onClick={handlePrevDay}
                disabled={activeDailyDate <= 1}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Kemarin</span>
              </button>

              {/* Centered Big Date */}
              <div className="text-center">
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  {getDayName(currentYear, currentMonth, activeDailyDate)}
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-white">
                  Tanggal {activeDailyDate} {getMonthName(currentMonth)} {currentYear}
                </div>
              </div>

              <button
                id="daily-next-day-btn"
                onClick={handleNextDay}
                disabled={activeDailyDate >= totalDays}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-xs font-semibold"
              >
                <span className="hidden xs:inline">Besok</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Horizontal Scrollable Day Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
              {daysArray.map((day) => {
                const dayName = getDayName(currentYear, currentMonth, day);
                const isSelected = activeDailyDate === day;
                const weekend = isWeekend(currentYear, currentMonth, day);
                return (
                  <button
                    key={day}
                    id={`day-pill-${day}`}
                    onClick={() => setActiveDailyDate(day)}
                    className={`flex flex-col items-center justify-center min-w-[42px] py-1.5 rounded-xl text-xs transition-all shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-105 ring-2 ring-amber-400'
                        : weekend
                        ? 'bg-slate-950/80 text-amber-400/80 hover:bg-slate-800 border border-amber-500/20'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span className="text-[9px] uppercase leading-none opacity-80">{dayName}</span>
                    <span className="text-sm font-bold mt-0.5">{day}</span>
                  </button>
                );
              })}
            </div>

            {/* Daily KPI Counters & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-1 rounded-lg">
                  ✓ {dailyStats.hadir} Hadir
                </span>
                <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold px-2.5 py-1 rounded-lg">
                  ✗ {dailyStats.alpa} Alpa
                </span>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-2.5 py-1 rounded-lg">
                  ! {dailyStats.izin} Izin
                </span>
                <span className="bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-lg">
                  OFF {dailyStats.off}
                </span>
                {dailyStats.unrecorded > 0 && (
                  <span className="bg-slate-950 text-slate-500 text-[11px] px-2 py-1 rounded-lg">
                    {dailyStats.unrecorded} Belum Diisi
                  </span>
                )}
              </div>

              {/* Bulk Quick Action on Mobile */}
              <div className="flex items-center space-x-1.5">
                <button
                  id="mobile-bulk-mark-present-btn"
                  onClick={() => handleBulkMarkPresent(activeDailyDate)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Hadirkan Semua</span>
                </button>
                <button
                  id="mobile-bulk-clear-day-btn"
                  onClick={() => handleBulkClearDay(activeDailyDate)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  Kosongkan
                </button>
              </div>
            </div>
          </div>

          {/* Personnel List (Mobile Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredEmployees.length === 0 ? (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                Tidak ada personil yang sesuai dengan pencarian atau filter shift/posisi.
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const rec = getRecordForEmployee(emp.id);
                const stats = calculateRowStats(emp, rec);
                const currentStatus = rec.days[activeDailyDate] || '';
                const proj = projects.find((p) => p.id === emp.projectId);

                return (
                  <div
                    key={emp.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3 hover:border-slate-700 transition-all"
                  >
                    {/* Person Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm sm:text-base text-white truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 flex-wrap">
                          <span className="font-mono text-amber-400 font-bold">{emp.nik}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">{emp.position}</span>
                          <span>•</span>
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                            {emp.shift}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          📍 {proj?.name || '-'}
                        </div>
                      </div>

                      {/* Month Accumulation Badge */}
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400">Total Hadir:</div>
                        <div className="text-sm font-black text-emerald-400">
                          {stats.hadir} <span className="text-[10px] font-normal text-slate-400">Hari</span>
                        </div>
                        <div className="text-[11px] font-bold text-amber-400">
                          {formatCurrency(stats.netPay)}
                        </div>
                      </div>
                    </div>

                    {/* Touch Attendance Action Buttons (4 Large Touch Targets for iOS/Android) */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {/* Hadir Button */}
                      <button
                        id={`btn-hadir-${emp.id}-${activeDailyDate}`}
                        onClick={() => handleSetStatusDirect(emp.id, activeDailyDate, 'H')}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] active:scale-95 ${
                          currentStatus === 'H'
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                            : 'bg-slate-950/80 text-emerald-400/80 border-emerald-500/30 hover:bg-emerald-950/40'
                        }`}
                      >
                        <span className="text-sm">✓</span>
                        <span className="text-[10px] mt-0.5">Hadir</span>
                      </button>

                      {/* Alpa Button */}
                      <button
                        id={`btn-alpa-${emp.id}-${activeDailyDate}`}
                        onClick={() => handleSetStatusDirect(emp.id, activeDailyDate, 'A')}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] active:scale-95 ${
                          currentStatus === 'A'
                            ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                            : 'bg-slate-950/80 text-rose-400/80 border-rose-500/30 hover:bg-rose-950/40'
                        }`}
                      >
                        <span className="text-sm">✗</span>
                        <span className="text-[10px] mt-0.5">Alpa</span>
                      </button>

                      {/* Izin Button */}
                      <button
                        id={`btn-izin-${emp.id}-${activeDailyDate}`}
                        onClick={() => handleSetStatusDirect(emp.id, activeDailyDate, 'I')}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] active:scale-95 ${
                          currentStatus === 'I'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                            : 'bg-slate-950/80 text-amber-400/80 border-amber-500/30 hover:bg-amber-950/40'
                        }`}
                      >
                        <span className="text-sm">!</span>
                        <span className="text-[10px] mt-0.5">Izin</span>
                      </button>

                      {/* Off Button */}
                      <button
                        id={`btn-off-${emp.id}-${activeDailyDate}`}
                        onClick={() => handleSetStatusDirect(emp.id, activeDailyDate, 'O')}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] active:scale-95 ${
                          currentStatus === 'O'
                            ? 'bg-slate-700 text-white border-slate-600 shadow-md'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xs font-mono">OFF</span>
                        <span className="text-[10px] mt-0.5">Libur</span>
                      </button>
                    </div>

                    {/* Bottom Info: Rate & Deduction Trigger */}
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                      <div className="text-slate-400">
                        Rate: <span className="text-slate-200 font-semibold">{formatCurrency(emp.dailyRate)}</span>/hr
                      </div>

                      <button
                        id={`edit-deduction-btn-${emp.id}`}
                        onClick={() =>
                          setEditingDeduction({
                            employee: emp,
                            timesheetRecord: rec,
                            amount: rec.deductionAmount || 0,
                            reason: rec.deductionReason || '',
                            bonus: rec.bonusAmount || 0
                          })
                        }
                        className="flex items-center space-x-1 text-amber-400 hover:underline font-semibold"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>
                          {rec.deductionAmount > 0 || rec.bonusAmount > 0
                            ? 'Edit Denda/Bonus'
                            : '+ Potongan/Lembur'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FULL 31-DAY MATRIX TABLE                                          */}
      {/* ========================================================================= */}
      {viewMode === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Mobile swipe hint banner */}
          <div className="bg-slate-950/80 px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between border-b border-slate-800 md:hidden">
            <span>👉 Geser tabel ke kanan/kiri untuk melihat tgl 1-31</span>
            <span className="font-bold text-amber-400">Mode Grid</span>
          </div>

          <div className="overflow-x-auto max-h-[620px] relative scrollbar-thin scrollbar-thumb-slate-700">
            <table className="w-full text-left border-collapse">
              {/* Table Header with Sticky Columns */}
              <thead className="bg-slate-950 text-slate-300 text-xs uppercase font-bold sticky top-0 z-20 shadow-md">
                <tr>
                  {/* Sticky Left: No, Name & Position */}
                  <th className="p-2 sm:p-3 w-8 sm:w-10 text-center sticky left-0 z-30 bg-slate-950 border-r border-slate-800">
                    #
                  </th>
                  <th className="p-2 sm:p-3 min-w-[160px] sm:min-w-[200px] sticky left-8 sm:left-10 z-30 bg-slate-950 border-r border-slate-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                    Nama & Posisi
                  </th>
                  <th className="p-3 min-w-[140px] border-r border-slate-800 hidden sm:table-cell">
                    Project & Shift
                  </th>
                  <th className="p-3 min-w-[95px] text-right border-r border-slate-800 hidden md:table-cell">
                    Rate / Hari
                  </th>

                  {/* Dynamic 1-31 Date Columns */}
                  {daysArray.map((day) => {
                    const dayName = getDayName(currentYear, currentMonth, day);
                    const weekend = isWeekend(currentYear, currentMonth, day);
                    return (
                      <th
                        key={day}
                        onClick={() => setSelectedDayToBulk(day)}
                        title={`Klik untuk pilih Tgl ${day} (${dayName})`}
                        className={`p-1.5 text-center min-w-[34px] max-w-[34px] border-r border-slate-800/80 cursor-pointer transition-colors ${
                          weekend ? 'bg-amber-950/30 text-amber-400' : 'text-slate-300'
                        } ${selectedDayToBulk === day ? 'ring-2 ring-amber-500 bg-amber-500/20' : 'hover:bg-slate-800'}`}
                      >
                        <div className="text-[11px] font-extrabold">{day}</div>
                        <div className="text-[9px] font-normal text-slate-400">{dayName}</div>
                      </th>
                    );
                  })}

                  {/* Summary & Financial Calculation Columns */}
                  <th className="p-3 text-center min-w-[60px] bg-slate-950 border-l border-slate-800 text-emerald-400">
                    Hadir
                  </th>
                  <th className="p-3 text-center min-w-[50px] bg-slate-950 border-r border-slate-800 text-rose-400">
                    Alpa
                  </th>
                  <th className="p-3 text-center min-w-[50px] bg-slate-950 border-r border-slate-800 text-amber-400">
                    Izin
                  </th>
                  <th className="p-3 min-w-[130px] bg-slate-950 border-r border-slate-800 text-right text-rose-300 hidden sm:table-cell">
                    Potongan (Rp)
                  </th>
                  <th className="p-3 min-w-[150px] bg-slate-950 text-right text-amber-400 sticky right-0 z-30 shadow-[-4px_0_10px_rgba(0,0,0,0.5)]">
                    Gaji Bersih
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={totalDays + 9} className="p-12 text-center text-slate-500">
                      <p className="text-base font-semibold text-slate-400">Tidak ada data karyawan yang cocok.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => {
                    const rec = getRecordForEmployee(emp.id);
                    const stats = calculateRowStats(emp, rec);
                    const proj = projects.find((p) => p.id === emp.projectId);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors group">
                        {/* Number */}
                        <td className="p-2 sm:p-3 text-center font-mono text-slate-500 sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 border-r border-slate-800">
                          {index + 1}
                        </td>

                        {/* Sticky Name & Info */}
                        <td className="p-2 sm:p-3 sticky left-8 sm:left-10 z-10 bg-slate-900 group-hover:bg-slate-800 border-r border-slate-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                          <div className="font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                            {emp.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1 truncate">
                            <span className="font-mono text-amber-400">{emp.nik}</span>
                            <span>•</span>
                            <span className="truncate">{emp.position}</span>
                          </div>
                        </td>

                        {/* Project & Shift */}
                        <td className="p-3 border-r border-slate-800/60 hidden sm:table-cell">
                          <div className="text-slate-300 font-medium truncate max-w-[130px]">
                            {proj?.name || '-'}
                          </div>
                          <div className="text-[10px] text-slate-400">{emp.shift}</div>
                        </td>

                        {/* Rate / Hari */}
                        <td className="p-3 text-right font-medium text-slate-300 border-r border-slate-800/60 hidden md:table-cell">
                          {formatCurrency(emp.dailyRate)}
                        </td>

                        {/* 1-31 Attendance Check Cells */}
                        {daysArray.map((day) => {
                          const status = rec.days[day] || '';
                          const weekend = isWeekend(currentYear, currentMonth, day);

                          return (
                            <td
                              key={day}
                              id={`cell-${emp.id}-${day}`}
                              onClick={() => handleCellClick(emp.id, day)}
                              title={`Klik untuk ubah kehadiran ${emp.name} (Tgl ${day})`}
                              className={`p-1 text-center border-r border-slate-800/50 cursor-pointer select-none transition-all ${
                                weekend ? 'bg-amber-950/10' : ''
                              } hover:bg-amber-500/20 active:scale-95`}
                            >
                              <div
                                className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                                  status === 'H'
                                    ? 'bg-emerald-500 text-white font-extrabold shadow-emerald-500/30'
                                    : status === 'A'
                                    ? 'bg-rose-500 text-white font-extrabold shadow-rose-500/30'
                                    : status === 'I'
                                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-amber-500/30'
                                    : status === 'O'
                                    ? 'bg-slate-800 text-slate-400 font-mono text-[10px]'
                                    : 'text-slate-700 hover:text-slate-400'
                                }`}
                              >
                                {status === 'H' && '✓'}
                                {status === 'A' && '✗'}
                                {status === 'I' && '!'}
                                {status === 'O' && 'OFF'}
                                {status === '' && '·'}
                              </div>
                            </td>
                          );
                        })}

                        {/* Hadir Count */}
                        <td className="p-3 text-center font-bold text-emerald-400 bg-slate-950/40 border-l border-slate-800">
                          {stats.hadir}
                        </td>

                        {/* Alpa Count */}
                        <td className="p-3 text-center font-bold text-rose-400 bg-slate-950/40 border-r border-slate-800">
                          {stats.alpa}
                        </td>

                        {/* Izin Count */}
                        <td className="p-3 text-center font-bold text-amber-400 bg-slate-950/40 border-r border-slate-800">
                          {stats.izin}
                        </td>

                        {/* Potongan & Lembur Button */}
                        <td className="p-3 text-right bg-slate-950/40 border-r border-slate-800 hidden sm:table-cell">
                          <button
                            id={`matrix-edit-deduction-btn-${emp.id}`}
                            onClick={() =>
                              setEditingDeduction({
                                employee: emp,
                                timesheetRecord: rec,
                                amount: rec.deductionAmount || 0,
                                reason: rec.deductionReason || '',
                                bonus: rec.bonusAmount || 0
                              })
                            }
                            className="text-right hover:text-amber-400 transition-colors w-full group/btn"
                          >
                            <div className="font-semibold text-rose-400">
                              {stats.deduction > 0 ? `- ${formatCurrency(stats.deduction)}` : 'Rp 0'}
                            </div>
                            {stats.bonus > 0 && (
                              <div className="text-[10px] text-emerald-400 font-medium">
                                + {formatCurrency(stats.bonus)} (Bonus)
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 group-hover/btn:text-amber-400">
                              {rec.deductionReason ? `(${rec.deductionReason})` : 'Edit'}
                            </div>
                          </button>
                        </td>

                        {/* Net Take Home Pay */}
                        <td className="p-3 text-right font-black text-amber-400 sticky right-0 z-10 bg-slate-900 group-hover:bg-slate-800 shadow-[-4px_0_10px_rgba(0,0,0,0.5)]">
                          <div className="text-sm">{formatCurrency(stats.netPay)}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {stats.hadir} x {formatCurrency(emp.dailyRate)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deduction / Bonus Modal Form */}
      {editingDeduction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Atur Potongan Denda & Lembur</h3>
                <p className="text-xs text-slate-400">{editingDeduction.employee.name} ({editingDeduction.employee.nik})</p>
              </div>
              <button
                onClick={() => setEditingDeduction(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Daily Rate Info */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between text-xs">
                <span className="text-slate-400">Rate Gaji Pokok Harian:</span>
                <span className="font-bold text-slate-200">
                  {formatCurrency(editingDeduction.employee.dailyRate)} / hari
                </span>
              </div>

              {/* Deduction Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-rose-300 mb-1">
                  Nominal Potongan Denda / Pelanggaran (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    id="deduction-amount-input"
                    type="number"
                    min="0"
                    step="5000"
                    value={editingDeduction.amount}
                    onChange={(e) =>
                      setEditingDeduction({
                        ...editingDeduction,
                        amount: Number(e.target.value)
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-sm font-bold text-rose-300 focus:outline-none focus:border-rose-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Deduction Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alasan / Keterangan Potongan:
                </label>
                <textarea
                  id="deduction-reason-input"
                  rows={2}
                  value={editingDeduction.reason}
                  onChange={(e) =>
                    setEditingDeduction({
                      ...editingDeduction,
                      reason: e.target.value
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  placeholder="Contoh: Terlambat 45 menit, atribut seragam tidak lengkap tgl 12..."
                />
              </div>

              {/* Bonus / Lembur Amount */}
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Insentif / Tambahan Lembur (Opsional - Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">Rp</span>
                  <input
                    id="bonus-amount-input"
                    type="number"
                    min="0"
                    step="10000"
                    value={editingDeduction.bonus}
                    onChange={(e) =>
                      setEditingDeduction({
                        ...editingDeduction,
                        bonus: Number(e.target.value)
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingDeduction(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                id="save-deduction-btn"
                onClick={handleSaveDeduction}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-colors"
              >
                Simpan Potongan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
