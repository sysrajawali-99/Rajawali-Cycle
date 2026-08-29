import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Package,
  KanbanSquare,
  MoreHorizontal,
  Megaphone,
  BookOpen,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
  RotateCcw,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Lock,
  LogOut,
  Briefcase,
  Layers
} from 'lucide-react';
import { AppView, Project, UserAccount } from '../../types';

interface MobileBottomNavProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  projects?: Project[];
  selectedProjectId?: string;
  onSelectProject?: (id: string) => void;
  currentUser?: UserAccount;
  onLogout?: () => void;
  onResetData?: () => void;
  lowStockCount?: number;
  activeTasksCount?: number;
  unreadBlastCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  projects = [],
  selectedProjectId = 'ALL',
  onSelectProject,
  currentUser,
  onLogout,
  onResetData,
  lowStockCount = 0,
  activeTasksCount = 0,
  unreadBlastCount = 0
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isHrmSheetOpen, setIsHrmSheetOpen] = useState(true);
  const [isOmSheetOpen, setIsOmSheetOpen] = useState(true);

  const currentProject = (projects || []).find((p) => p.id === selectedProjectId);

  const allowedViews = currentUser?.allowedViews || [
    'dashboard',
    'project_settings',
    'timesheet',
    'employees',
    'inventory',
    'tasks',
    'blast',
    'sops',
    'reports'
  ];

  const isViewAllowed = (viewId: AppView) => {
    if (viewId === 'access_control') {
      return currentUser?.role === 'Super Admin (HQ)' || allowedViews.includes('access_control');
    }
    return allowedViews.includes(viewId) || (viewId === 'sops' && allowedViews.includes('sop' as any));
  };

  // Quick bottom bar candidate items
  const candidateMainItems: {
    id: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Beranda',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'timesheet',
      label: 'Timesheet',
      icon: <CalendarCheck2 className="w-5 h-5" />
    },
    {
      id: 'employees',
      label: 'Karyawan',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'inventory',
      label: 'Stok',
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'tasks',
      label: 'Tugas',
      icon: <KanbanSquare className="w-5 h-5" />,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
      badgeColor: 'bg-blue-500 text-white'
    }
  ];

  const filteredMainItems = candidateMainItems.filter((item) =>
    allowedViews.includes(item.id)
  );

  // Grouped Menu Lists for the "More" Action Sheet
  const hrmSheetItems = [
    {
      id: 'timesheet' as AppView,
      label: 'Eagle Timesheet',
      description: 'Matriks kehadiran 1-31 & lembur',
      icon: <CalendarCheck2 className="w-4 h-4 text-emerald-400" />,
      badge: 31
    },
    {
      id: 'employees' as AppView,
      label: 'Data Karyawan & Lokasi',
      description: 'Database personil & riwayat mutasi',
      icon: <Users className="w-4 h-4 text-blue-400" />
    },
    {
      id: 'sops' as AppView,
      label: 'SOP & Dokumen K3',
      description: 'Standar mutu pembersihan & APD',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'reports' as AppView,
      label: 'Pusat Laporan & Payroll',
      description: 'Cetak slip gaji & ekspor rekapitulasi data',
      icon: <FileSpreadsheet className="w-4 h-4 text-blue-400" />
    }
  ].filter((item) => isViewAllowed(item.id));

  const omSheetItems = [
    {
      id: 'project_settings' as AppView,
      label: 'Pengaturan Lokasi',
      description: 'Spesifikasi gedung, manpower, lift & lantai',
      icon: <Building2 className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'inventory' as AppView,
      label: 'Smart Inventory',
      description: 'Update stok & chemical kritis',
      icon: <Package className="w-4 h-4 text-purple-400" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined
    },
    {
      id: 'tasks' as AppView,
      label: 'Rajawali Boards',
      description: 'Papan monitoring & QC kebersihan',
      icon: <KanbanSquare className="w-4 h-4 text-teal-400" />,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined
    }
  ].filter((item) => isViewAllowed(item.id));

  const otherSheetItems = [
    {
      id: 'blast' as AppView,
      label: 'Eagle Blast',
      description: 'Memo resmi manajemen & pengumuman K3',
      icon: <Megaphone className="w-4 h-4 text-amber-400" />,
      badge: unreadBlastCount > 0 ? unreadBlastCount : undefined
    },
    {
      id: 'access_control' as AppView,
      label: 'Hak Akses Pengguna',
      description: 'Kelola izin menu & visibilitas user',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />
    }
  ].filter((item) => isViewAllowed(item.id));

  const handleSelectNav = (view: AppView) => {
    onSelectView(view);
    setIsMoreMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Fixed Bottom Navigation Bar for Mobile Phones (iOS / Android) */}
      <nav
        id="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 md:hidden shadow-[0_-8px_20px_rgba(0,0,0,0.6)] pb-safe"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {filteredMainItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleSelectNav(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[54px] min-h-[48px] touch-manipulation active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Indicator Pill */}
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                )}

                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-slate-950 ${
                        item.badgeColor || 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 leading-tight tracking-tight truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            id="mobile-nav-more-btn"
            onClick={() => setIsMoreMenuOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[54px] min-h-[48px] touch-manipulation active:scale-95 cursor-pointer ${
              isMoreMenuOpen || ['project_settings', 'blast', 'sops', 'sop', 'reports', 'access_control'].includes(currentView)
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
              {unreadBlastCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-950" />
              )}
            </div>
            <span className="text-[10px] mt-1 leading-tight tracking-tight">
              Menu Lain
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Drawer Action Sheet */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm md:hidden animate-fade-in">
          {/* Backdrop Tap to close */}
          <div
            className="flex-1 w-full"
            onClick={() => setIsMoreMenuOpen(false)}
          />

          {/* Sheet Body */}
          <div className="bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 space-y-4 max-h-[88vh] overflow-y-auto pb-safe shadow-2xl animate-slide-up">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-1 opacity-75" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Struktur Menu Lengkap</h3>
                  <p className="text-[11px] text-slate-400">
                    {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Portal Operasional'}
                  </p>
                </div>
              </div>
              <button
                id="close-more-sheet-btn"
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Site & Scope Context on Mobile */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Visibilitas Lokasi
                </span>
                <span className="text-xs font-bold text-amber-400 truncate max-w-[180px]">
                  {currentUser?.isLocationLocked ? '📍 Terkunci' : '🌐 Semua Lokasi'}
                </span>
              </div>

              {currentUser?.isLocationLocked ? (
                <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-200">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold truncate">
                    {currentProject ? currentProject.name : 'Lokasi Terkunci'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <select
                    id="mobile-sheet-project-select"
                    value={selectedProjectId}
                    onChange={(e) => onSelectProject?.(e.target.value)}
                    className="bg-transparent text-xs text-white w-full focus:outline-none cursor-pointer py-1"
                  >
                    <option value="ALL" className="bg-slate-900 text-white">
                      🌐 Semua Lokasi Proyek (HQ All Sites)
                    </option>
                    {(projects || []).map((proj) => (
                      <option key={proj.id} value={proj.id} className="bg-slate-900 text-white">
                        📍 {proj.name} ({proj.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Group 1: Human Resource Management (HRM) */}
            {hrmSheetItems.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsHrmSheetOpen(!isHrmSheetOpen)}
                  className="w-full flex items-center justify-between p-3 bg-blue-950/30 border-b border-slate-800/80 text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">Human Resource Management (HRM)</div>
                      <div className="text-[10px] text-slate-400">Timesheet, Karyawan, SOP & Payroll</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-bold">
                      {hrmSheetItems.length} Submenu
                    </span>
                    {isHrmSheetOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {isHrmSheetOpen && (
                  <div className="p-2 space-y-1.5">
                    {hrmSheetItems.map((item) => {
                      const isActive =
                        currentView === item.id || (item.id === 'sops' && currentView === 'sop');
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectNav(item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                            isActive
                              ? 'bg-blue-500/20 border-blue-500/40 text-white shadow-md'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="p-1.5 bg-slate-950 rounded-lg shrink-0">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white truncate">{item.label}</div>
                              <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Group 2: Operations Management (OM) */}
            {omSheetItems.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsOmSheetOpen(!isOmSheetOpen)}
                  className="w-full flex items-center justify-between p-3 bg-amber-950/30 border-b border-slate-800/80 text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">Operations Management (OM)</div>
                      <div className="text-[10px] text-slate-400">Lokasi, Smart Inventory & Rajawali Boards</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                      {omSheetItems.length} Submenu
                    </span>
                    {isOmSheetOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {isOmSheetOpen && (
                  <div className="p-2 space-y-1.5">
                    {omSheetItems.map((item) => {
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectNav(item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                            isActive
                              ? 'bg-amber-500/20 border-amber-500/40 text-white shadow-md'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="p-1.5 bg-slate-950 rounded-lg shrink-0">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white truncate">{item.label}</div>
                              <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Remaining items */}
            {otherSheetItems.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Menu Lainnya
                </span>
                {otherSheetItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectNav(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate">{item.label}</div>
                          <div className="text-[11px] text-slate-400 truncate">{item.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        {item.badge !== undefined && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Logout and Reset Action */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              {onLogout && (
                <button
                  id="mobile-sheet-logout-btn"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>
              )}

              {onResetData && (
                <button
                  id="mobile-sheet-reset-btn"
                  onClick={() => {
                    if (confirm('Kembalikan semua data Timesheet, Karyawan, dan Stok ke data awal?')) {
                      onResetData();
                      setIsMoreMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-950 text-slate-400 hover:text-slate-200 font-semibold text-xs rounded-xl border border-slate-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

