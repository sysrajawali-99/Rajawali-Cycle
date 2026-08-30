import React, { useMemo, useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck2,
  Package,
  KanbanSquare,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Building2,
  Clock,
  Sparkles,
  ShieldCheck,
  Megaphone,
  CreditCard,
  Building
} from 'lucide-react';
import {
  Project,
  Employee,
  TimesheetMonthRecord,
  ProjectStock,
  InventoryItem,
  CleaningTask,
  BlastAnnouncement,
  AppView,
  UserRole,
  CompanyProfile
} from '../../types';
import { formatCurrency, formatNumber, getMonthName } from '../../utils/formatters';
import { ComparativeCharts } from './ComparativeCharts';
import { QuarterlyPerformanceDashboard } from './QuarterlyPerformanceDashboard';
import { storageService } from '../../services/storageService';

interface DashboardOverviewProps {
  projects: Project[];
  employees: Employee[];
  timesheets: TimesheetMonthRecord[];
  projectStocks: ProjectStock[];
  inventoryItems: InventoryItem[];
  tasks: CleaningTask[];
  blasts: BlastAnnouncement[];
  selectedProjectId: string;
  onNavigate: (view: AppView) => void;
  userRole: UserRole;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects = [],
  employees = [],
  timesheets = [],
  projectStocks = [],
  inventoryItems = [],
  tasks = [],
  blasts = [],
  selectedProjectId = 'ALL',
  onNavigate,
  userRole
}) => {
  const currentMonth = 8; // August 2026
  const currentYear = 2026;
  const todayDateNumber = 25; // August 25

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => storageService.getCompanyProfile());

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCompanyProfile(storageService.getCompanyProfile());
    };
    window.addEventListener('company_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('company_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (e.status === 'Resign') return false;
      if (selectedProjectId !== 'ALL' && e.projectId !== selectedProjectId) return false;
      return true;
    });
  }, [employees, selectedProjectId]);

  // Today's attendance stats
  const todayAttendance = useMemo(() => {
    let present = 0;
    let alpa = 0;
    let izin = 0;
    let off = 0;
    let unrecorded = 0;

    filteredEmployees.forEach((emp) => {
      const rec = timesheets.find(
        (ts) =>
          ts.employeeId === emp.id &&
          ts.month === currentMonth &&
          ts.year === currentYear
      );
      const st = rec?.days[todayDateNumber] || '';
      if (st === 'H') present++;
      else if (st === 'A') alpa++;
      else if (st === 'I') izin++;
      else if (st === 'O') off++;
      else unrecorded++;
    });

    const total = filteredEmployees.length || 1;
    const rate = Math.round((present / total) * 100);

    return { present, alpa, izin, off, unrecorded, rate };
  }, [filteredEmployees, timesheets]);

  // Low stock items count
  const criticalStocks = useMemo(() => {
    return inventoryItems.filter((item) => {
      const activeProjectIds =
        selectedProjectId === 'ALL'
          ? projects.map((p) => p.id)
          : [selectedProjectId];

      return activeProjectIds.some((pId) => {
        const found = projectStocks.find(
          (ps) => ps.itemId === item.id && ps.projectId === pId
        );
        const current = found ? found.currentStock : 0;
        return current <= item.minStock;
      });
    });
  }, [inventoryItems, projectStocks, selectedProjectId, projects]);

  // Total payroll estimation this month
  const totalPayrollEst = useMemo(() => {
    let sum = 0;
    filteredEmployees.forEach((emp) => {
      const rec = timesheets.find(
        (ts) =>
          ts.employeeId === emp.id &&
          ts.month === currentMonth &&
          ts.year === currentYear
      );
      if (!rec) return;
      let hadir = 0;
      Object.values(rec.days).forEach((st) => {
        if (st === 'H') hadir++;
      });
      const gross = hadir * emp.dailyRate + (rec.bonusAmount || 0);
      const net = Math.max(0, gross - (rec.deductionAmount || 0));
      sum += net;
    });
    return sum;
  }, [filteredEmployees, timesheets]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedProjectId !== 'ALL' && t.projectId !== selectedProjectId) return false;
      return true;
    });
  }, [tasks, selectedProjectId]);

  return (
    <div className="space-y-5">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Personil */}
        <div
          onClick={() => onNavigate('employees')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Personil Aktif</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {filteredEmployees.length}{' '}
            <span className="text-xs font-normal text-slate-400">Cleaner</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>Shift Terbagi 4 Waktu</span>
            <span className="text-blue-400 font-semibold flex items-center space-x-0.5">
              <span>Detail</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Kehadiran Hari Ini */}
        <div
          onClick={() => onNavigate('timesheet')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Kehadiran Hari Ini (Tgl {todayDateNumber})</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {todayAttendance.rate}%{' '}
            <span className="text-xs font-normal text-slate-400">
              ({todayAttendance.present}/{filteredEmployees.length} Hadir)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>
              Alpa: <b className="text-rose-400">{todayAttendance.alpa}</b> • Izin:{' '}
              <b className="text-amber-400">{todayAttendance.izin}</b>
            </span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-0.5">
              <span>Ceklis</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Stok Kritis Alert */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Stok Chemical & Alat</span>
            <div
              className={`p-2 rounded-xl transition-colors ${
                criticalStocks.length > 0
                  ? 'bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-white'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {criticalStocks.length > 0 ? (
              <span className="text-rose-400">{criticalStocks.length} Kritis</span>
            ) : (
              <span className="text-emerald-400">Aman</span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>{inventoryItems.length} Master Item</span>
            <span className="text-amber-400 font-semibold flex items-center space-x-0.5">
              <span>Kelola</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Estimasi Payroll Bulan Ini */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Estimasi Payroll ({getMonthName(currentMonth)})</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-400 mt-2 truncate">
            {formatCurrency(totalPayrollEst)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <span>Auto-Calculated</span>
            <span className="text-amber-400 font-semibold flex items-center space-x-0.5">
              <span>Laporan</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* QUARTERLY VISUAL PERFORMANCE DASHBOARD (Recharts: Project Completion Trends & Resource Efficiency) */}
      <QuarterlyPerformanceDashboard
        projects={projects}
        employees={employees}
        timesheets={timesheets}
        tasks={tasks}
        projectStocks={projectStocks}
        inventoryItems={inventoryItems}
        selectedProjectId={selectedProjectId}
      />

      {/* EXECUTIVE COMPARATIVE ANALYTICS (Payroll MoM & Manpower Quota vs Actual) */}
      <ComparativeCharts
        projects={projects}
        employees={employees}
        timesheets={timesheets}
        currentMonth={currentMonth}
        currentYear={currentYear}
        selectedProjectId={selectedProjectId}
      />

      {/* Main Grid: Live Tasks & Latest Blasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cleaning Tasks Progress (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <KanbanSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Monitoring Area Kebersihan (Rajawali Boards)</h3>
                <p className="text-xs text-slate-400">Status pengerjaan checklist zona publik dan sanitasi</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Lihat Board Penuh ➔
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800/80 p-4">
                Belum ada tugas kebersihan harian yang dibuat. Klik menu "Rajawali Boards" untuk menambahkan tugas baru.
              </div>
            ) : (
              filteredTasks.slice(0, 4).map((task) => {
                const doneCount = task.checklist.filter((c) => c.done).length;
                const totalCount = task.checklist.length;
                const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                return (
                  <div
                    key={task.id}
                    className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-xl transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-xs">{task.areaName}</h4>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="text-slate-300">Petugas: {task.assignedEmployees.join(', ')}</span>
                          <span>•</span>
                          <span className="text-slate-500">{task.shift}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          task.status === 'done'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : task.status === 'review'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : task.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {task.status === 'done'
                          ? 'Selesai'
                          : task.status === 'review'
                          ? 'Audit QC'
                          : task.status === 'in_progress'
                          ? 'Sedang Dikerjakan'
                          : 'Jadwal'}
                      </span>
                    </div>

                    {/* Checklist progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Checklist Pengerjaan ({doneCount}/{totalCount} item)</span>
                        <span className="font-semibold text-slate-300">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            percent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Announcements (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Eagle Blast Pusat</h3>
                  <p className="text-xs text-slate-400">Instruksi & kebijakan manajemen</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {blasts.slice(0, 3).map((blast) => (
                <div
                  key={blast.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        blast.category === 'PENTING'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {blast.category}
                    </span>
                    <span className="text-[10px] text-slate-500">{blast.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-xs line-clamp-1">{blast.title}</h4>
                  <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{blast.content}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('blast')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Buka Semua Pengumuman ➔
          </button>
        </div>
      </div>
    </div>
  );
};
