import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  Users,
  Package,
  KanbanSquare,
  Megaphone,
  BookOpen,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  X,
  RotateCcw,
  Lock
} from 'lucide-react';
import { AppView, UserAccount } from '../../types';

interface SidebarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onResetData?: () => void;
  currentUser?: UserAccount;
  lowStockCount?: number;
  activeTasksCount?: number;
  unreadBlastCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onCloseMobile,
  onResetData,
  currentUser,
  lowStockCount = 0,
  activeTasksCount = 0,
  unreadBlastCount = 0
}) => {
  const allMenuItems: {
    id: AppView;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Utama',
      description: 'Ringkasan & KPI Operasional',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'project_settings',
      label: 'Pengaturan Lokasi',
      description: 'Spesifikasi Gedung & Lantai',
      icon: <Building2 className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'timesheet',
      label: 'Eagle Timesheet',
      description: 'Matriks Kehadiran 1-31 Hari',
      icon: <CalendarCheck2 className="w-5 h-5" />,
      badge: 31,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    {
      id: 'employees',
      label: 'Data Karyawan & Lokasi',
      description: 'Penempatan & Riwayat Mutasi',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'inventory',
      label: 'Smart Inventory',
      description: 'Update Stok & Chemical Kritis',
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
    },
    {
      id: 'tasks',
      label: 'Rajawali Boards',
      description: 'Papan Monitoring Kebersihan',
      icon: <KanbanSquare className="w-5 h-5" />,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    },
    {
      id: 'blast',
      label: 'Eagle Blast',
      description: 'Pengumuman Resmi Manajemen',
      icon: <Megaphone className="w-5 h-5" />,
      badge: unreadBlastCount > 0 ? unreadBlastCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'sops',
      label: 'SOP & Dokumen K3',
      description: 'Standar Pembersihan & MSDS',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: 'reports',
      label: 'Pusat Laporan & Payroll',
      description: 'Ekspor Excel & Slip Gaji',
      icon: <FileSpreadsheet className="w-5 h-5" />
    },
    {
      id: 'access_control',
      label: 'Hak Akses Pengguna',
      description: 'Kelola Izin Menu & User',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    }
  ];

  // Filter menu items by user's authorized views
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

  const visibleMenuItems = allMenuItems.filter((item) => {
    if (item.id === 'access_control') {
      return currentUser?.role === 'Super Admin (HQ)' || allowedViews.includes('access_control');
    }
    return allowedViews.includes(item.id) || (item.id === 'sops' && allowedViews.includes('sop' as any));
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 md:top-14 z-40 md:z-20 w-72 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen md:h-[calc(100vh-3.5rem)] transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header Inside Drawer */}
        <div className="p-3 border-b border-slate-800 md:hidden flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🦅</span>
            <span className="font-extrabold text-white text-sm">RAJAWALI CYCLE</span>
          </div>
          <button
            id="close-sidebar-mobile-btn"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info Capsule inside sidebar */}
        {currentUser && (
          <div className="p-3 m-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0">
                {currentUser.avatar || '👤'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                <div className="text-[10px] text-amber-400 truncate font-semibold">{currentUser.role}</div>
              </div>
            </div>
            {currentUser.isLocationLocked && (
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center space-x-1.5 text-[10px] text-emerald-400 font-medium">
                <Lock className="w-3 h-3 shrink-0" />
                <span className="truncate">Visibilitas Terkunci per Lokasi</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <div className="p-3 space-y-1 flex-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Menu yang Dapat Diakses</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
              {visibleMenuItems.length} Menu
            </span>
          </div>

          {visibleMenuItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'sops' && currentView === 'sop');
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectView(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group min-h-[44px] cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-medium leading-tight truncate">{item.label}</div>
                    <div className="text-[11px] text-slate-500 truncate group-hover:text-slate-400">
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Info Box */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 m-2 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Sistem Terintegrasi Lapangan</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Role-Based Access Control aktif. Hak akses dikelola oleh Super Admin HQ.
          </p>

          {onResetData && (
            <button
              id="sidebar-reset-btn"
              onClick={() => {
                if (confirm('Kembalikan semua data ke setelan awal pabrik?')) {
                  onResetData();
                  onCloseMobile();
                }
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] rounded-lg border border-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
