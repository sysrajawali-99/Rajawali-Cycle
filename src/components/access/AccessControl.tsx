import React, { useState } from 'react';
import {
  ShieldCheck,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  Lock,
  Unlock,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles,
  KeyRound,
  Check,
  X,
  LayoutDashboard,
  CalendarCheck2,
  UserCheck,
  PackageCheck,
  KanbanSquare,
  Megaphone,
  BookOpen,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { UserAccount, AppView, Project, UserRole } from '../../types';

interface AccessControlProps {
  users: UserAccount[];
  projects: Project[];
  currentUser: UserAccount;
  onUpdateUsers: (updatedUsers: UserAccount[]) => void;
  onResetUsersToDefault: () => void;
}

const AVAILABLE_MENUS: {
  id: AppView;
  label: string;
  category: 'Utama' | 'Operasional' | 'Kepatuhan & Laporan';
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Utama',
    category: 'Utama',
    description: 'Ringkasan KPI, absensi harian, dan ringkasan stok',
    icon: <LayoutDashboard className="w-4 h-4 text-amber-400" />
  },
  {
    id: 'project_settings',
    label: 'Pengaturan Lokasi Project',
    category: 'Utama',
    description: 'Spesifikasi gedung, manpower, lift, toilet & jenis lantai',
    icon: <Building2 className="w-4 h-4 text-amber-400" />
  },
  {
    id: 'timesheet',
    label: 'Eagle Timesheet Matrix',
    category: 'Operasional',
    description: 'Matriks kehadiran 1-31, lembur, dan potongan absen',
    icon: <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
  },
  {
    id: 'employees',
    label: 'Data Karyawan & Mutasi',
    category: 'Operasional',
    description: 'Database personil cleaner, shift, dan riwayat mutasi',
    icon: <UserCheck className="w-4 h-4 text-blue-400" />
  },
  {
    id: 'inventory',
    label: 'Smart Inventory & Chemical',
    category: 'Operasional',
    description: 'Monitoring stok chemical, log pemakaian harian & restock',
    icon: <PackageCheck className="w-4 h-4 text-purple-400" />
  },
  {
    id: 'tasks',
    label: 'Rajawali Board & Tasks',
    category: 'Operasional',
    description: 'Kanban tugas harian, checklist area, dan inspeksi',
    icon: <KanbanSquare className="w-4 h-4 text-teal-400" />
  },
  {
    id: 'blast',
    label: 'Eagle Blast Pengumuman',
    category: 'Kepatuhan & Laporan',
    description: 'Pemberitahuan resmi, memo K3, dan briefing operasional',
    icon: <Megaphone className="w-4 h-4 text-rose-400" />
  },
  {
    id: 'sops',
    label: 'Perpustakaan SOP & K3',
    category: 'Kepatuhan & Laporan',
    description: 'Standar Operasional Prosedur dan panduan MSDS',
    icon: <BookOpen className="w-4 h-4 text-indigo-400" />
  },
  {
    id: 'reports',
    label: 'Laporan & Slip Gaji',
    category: 'Kepatuhan & Laporan',
    description: 'Rekapitulasi payroll bulanan dan cetak slip gaji',
    icon: <FileSpreadsheet className="w-4 h-4 text-amber-500" />
  }
];

export const AccessControl: React.FC<AccessControlProps> = ({
  users,
  projects,
  currentUser,
  onUpdateUsers,
  onResetUsersToDefault
}) => {
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New user form state
  const [newUserForm, setNewUserForm] = useState<{
    username: string;
    name: string;
    email: string;
    role: UserRole;
    password: string;
    assignedProjectId: string;
    isLocationLocked: boolean;
    allowedViews: AppView[];
  }>({
    username: '',
    name: '',
    email: '',
    role: 'Admin Lokasi 1',
    password: 'password123',
    assignedProjectId: projects[0]?.id || 'proj-1',
    isLocationLocked: true,
    allowedViews: [
      'dashboard',
      'project_settings',
      'timesheet',
      'employees',
      'inventory',
      'tasks',
      'blast',
      'sops',
      'reports'
    ]
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle specific menu permission for a user directly in the matrix
  const handleToggleMenu = (userId: string, menuId: AppView) => {
    const updated = users.map((u) => {
      if (u.id !== userId) return u;

      // Super admin always retains access_control
      let newViews = [...u.allowedViews];
      if (newViews.includes(menuId)) {
        newViews = newViews.filter((v) => v !== menuId);
      } else {
        newViews.push(menuId);
      }

      if (u.role === 'Super Admin (HQ)' && !newViews.includes('access_control')) {
        newViews.push('access_control');
      }

      return {
        ...u,
        allowedViews: newViews
      };
    });

    onUpdateUsers(updated);
    showToast(`Hak akses menu diperbarui secara otomatis.`);
  };

  // Grant All Menus for a user
  const handleGrantAllMenus = (userId: string) => {
    const allViews: AppView[] = [
      'dashboard',
      'timesheet',
      'employees',
      'inventory',
      'tasks',
      'blast',
      'sops',
      'reports'
    ];

    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.role === 'Super Admin (HQ)') {
      allViews.push('access_control');
    }

    const updated = users.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, allowedViews: allViews };
    });

    onUpdateUsers(updated);
    showToast(`Semua menu telah diberikan kepada pengguna.`);
  };

  // Revoke optional menus (leave dashboard)
  const handleSetMinimalMenus = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    const minimalViews: AppView[] = ['dashboard'];
    if (targetUser?.role === 'Super Admin (HQ)') {
      minimalViews.push('access_control');
    }

    const updated = users.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, allowedViews: minimalViews };
    });

    onUpdateUsers(updated);
    showToast(`Hak akses diatur ke tingkat minimal (Dashboard).`);
  };

  // Toggle user active status
  const handleToggleUserStatus = (userId: string) => {
    if (userId === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang masuk.');
      return;
    }

    const updated = users.map((u) => {
      if (u.id !== userId) return u;
      const nextStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      return { ...u, status: nextStatus as 'Aktif' | 'Nonaktif' };
    });

    onUpdateUsers(updated);
    showToast(`Status pengguna berhasil diubah.`);
  };

  // Save changes from Edit User Modal
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const updated = users.map((u) => {
      if (u.id !== selectedUserForEdit.id) return u;
      return selectedUserForEdit;
    });

    onUpdateUsers(updated);
    setSelectedUserForEdit(null);
    showToast(`Data dan konfigurasi akun ${selectedUserForEdit.name} berhasil disimpan.`);
  };

  // Create new user account
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.username.trim() || !newUserForm.name.trim()) {
      alert('Mohon lengkapi username dan nama pengguna.');
      return;
    }

    // check if username already exists
    const exists = users.some(
      (u) => u.username.toLowerCase() === newUserForm.username.trim().toLowerCase()
    );
    if (exists) {
      alert('Username sudah digunakan oleh akun lain. Gunakan username unik.');
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username: newUserForm.username.trim(),
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim() || `${newUserForm.username.trim()}@rajawali.co.id`,
      role: newUserForm.role,
      password: newUserForm.password || 'password123',
      avatar: newUserForm.role === 'Super Admin (HQ)' ? '👑' : newUserForm.role === 'Admin Operasional' ? '🏢' : '📍',
      assignedProjectId: newUserForm.assignedProjectId,
      isLocationLocked: newUserForm.isLocationLocked,
      allowedViews: newUserForm.allowedViews,
      status: 'Aktif'
    };

    onUpdateUsers([...users, newUser]);
    setIsAddUserModalOpen(false);
    setNewUserForm({
      username: '',
      name: '',
      email: '',
      role: 'Admin Lokasi 1',
      password: 'password123',
      assignedProjectId: projects[0]?.id || 'proj-1',
      isLocationLocked: true,
      allowedViews: ['dashboard', 'timesheet', 'employees', 'inventory', 'tasks', 'blast', 'sops', 'reports']
    });
    showToast(`Akun pengguna baru ${newUser.name} berhasil dibuat.`);
  };

  // Delete user (cannot delete self or primary superadmin)
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (userId === 'user-superadmin') {
      alert('Akun Super Admin Utama tidak boleh dihapus.');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus akun pengguna ini?')) {
      const updated = users.filter((u) => u.id !== userId);
      onUpdateUsers(updated);
      showToast(`Pengguna berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-sm font-semibold animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Hak Akses & Manajemen Pengguna
              </h1>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Khusus Super Admin
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Sebagai <strong className="text-white">Super Admin (HQ)</strong>, Anda memiliki kendali penuh untuk
              menentukan modul/menu apa saja yang dapat diakses oleh masing-masing user serta membatasi cakupan visibilitas
              lokasi (Semua Lokasi vs Terkunci pada Site tertentu).
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="reset-users-default-btn"
              onClick={() => {
                if (confirm('Kembalikan semua daftar akun dan hak akses menu ke pengaturan bawaan pabrik?')) {
                  onResetUsersToDefault();
                  showToast('Hak akses dan akun berhasil direset ke bawaan.');
                }
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Default</span>
            </button>

            <button
              id="add-new-user-btn"
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Total Akun Sistem</span>
            <div className="text-xl font-extrabold text-white">{users.length} Akun</div>
            <span className="text-[11px] text-emerald-400">{users.filter((u) => u.status === 'Aktif').length} Aktif</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Super Admin HQ</span>
            <div className="text-xl font-extrabold text-amber-400">
              {users.filter((u) => u.role === 'Super Admin (HQ)').length} User
            </div>
            <span className="text-[11px] text-slate-400">Akses Penuh Semua Lokasi</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Admin Lokasi (Site Locked)</span>
            <div className="text-xl font-extrabold text-emerald-400">
              {users.filter((u) => u.isLocationLocked).length} User
            </div>
            <span className="text-[11px] text-slate-400">Terkunci pada 1 Site</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Total Modul Sistem</span>
            <div className="text-xl font-extrabold text-blue-400">{AVAILABLE_MENUS.length} Modul</div>
            <span className="text-[11px] text-slate-400">Dapat diatur per user</span>
          </div>
        </div>
      </div>

      {/* Main Section: Interactive Menu Permission Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Matriks Hak Akses Menu & Visibilitas Lokasi</span>
            </h2>
            <p className="text-xs text-slate-400">
              Klik pada kotak centang menu untuk langsung mengaktifkan atau menonaktifkan menu untuk pengguna tersebut.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              <Check className="w-3 h-3" /> <span>Diberikan</span>
            </span>
            <span className="inline-flex items-center space-x-1 bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              <X className="w-3 h-3" /> <span>Dibatasi</span>
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-950 text-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr className="border-b border-slate-800">
                <th className="py-3.5 px-4 min-w-[220px]">Pengguna & Role</th>
                <th className="py-3.5 px-3 min-w-[160px]">Cakupan Lokasi</th>
                {AVAILABLE_MENUS.map((menu) => (
                  <th key={menu.id} className="py-3.5 px-2.5 text-center min-w-[100px]" title={menu.description}>
                    <div className="flex flex-col items-center justify-center space-y-1">
                      {menu.icon}
                      <span className="text-[10px] normal-case truncate max-w-[90px] font-semibold">
                        {menu.label}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-3 text-center min-w-[110px]">Aksi Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
              {users.map((u) => {
                const assignedProj = projects.find((p) => p.id === u.assignedProjectId);
                const isSuperAdmin = u.role === 'Super Admin (HQ)';

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User Info Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0">
                          {u.avatar || '👤'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white text-sm truncate">{u.name}</span>
                            {u.id === currentUser.id && (
                              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                                Sesi Anda
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                            <span className="font-mono text-amber-400">@{u.username}</span>
                            <span>•</span>
                            <span
                              className={`font-semibold ${
                                isSuperAdmin
                                  ? 'text-amber-400'
                                  : u.role === 'Admin Operasional'
                                  ? 'text-blue-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location Scope Column */}
                    <td className="py-3 px-3">
                      {u.isLocationLocked ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {assignedProj ? assignedProj.name : 'Lokasi Terkunci'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Hanya bisa lihat lokasi ini
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            <Unlock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>🌐 Semua Lokasi (HQ)</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Bebas pilih semua gedung
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Menu Toggles Columns */}
                    {AVAILABLE_MENUS.map((menu) => {
                      const hasAccess = u.allowedViews.includes(menu.id);

                      return (
                        <td key={menu.id} className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleMenu(u.id, menu.id)}
                            title={`Klik untuk ${hasAccess ? 'Mencabut' : 'Memberikan'} akses ke menu ${menu.label}`}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              hasAccess
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40'
                                : 'bg-slate-800/80 text-slate-500 border border-slate-700 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40'
                            }`}
                          >
                            {hasAccess ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}

                    {/* Action Column */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedUserForEdit(u)}
                          title="Edit Pengaturan Lengkap Akun"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          title={u.status === 'Aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.status === 'Aktif'
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-400'
                              : 'bg-rose-500/20 text-rose-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                          }`}
                        >
                          {u.status === 'Aktif' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        </button>
                        {u.id !== currentUser.id && u.id !== 'user-superadmin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Hapus Akun"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quick Batch Actions Info */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Perubahan pada matriks hak akses akan langsung diterapkan pada navigasi bilah samping (Sidebar) dan menu ponsel pengguna saat mereka aktif.
            </span>
          </div>
        </div>
      </div>

      {/* User Accounts Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map((u) => {
          const assignedProj = projects.find((p) => p.id === u.assignedProjectId);

          return (
            <div
              key={u.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                    {u.avatar || '👤'}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      u.status === 'Aktif'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base leading-tight truncate">{u.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">@{u.username}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-semibold text-amber-400">{u.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Visibilitas:</span>
                    <span className="font-semibold text-slate-200">
                      {u.isLocationLocked ? `📍 ${assignedProj?.code || 'Site Locked'}` : '🌐 Semua Lokasi'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Menu Aktif:</span>
                    <span className="font-bold text-emerald-400">{u.allowedViews.length} dari {AVAILABLE_MENUS.length}</span>
                  </div>
                  {u.lastLogin && (
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                      <span>Login Terakhir:</span>
                      <span>{u.lastLogin}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleGrantAllMenus(u.id)}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold text-center transition-colors cursor-pointer"
                >
                  Beri Semua Menu
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(u)}
                  className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Edit User Settings & Permissions */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Pengguna & Hak Akses</h3>
                  <p className="text-xs text-slate-400">Ubah profil, kata sandi, lokasi, dan modul menu.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={selectedUserForEdit.name}
                    onChange={(e) =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username (Login ID)</label>
                  <input
                    type="text"
                    required
                    value={selectedUserForEdit.username}
                    onChange={(e) =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, username: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Peran</label>
                  <select
                    value={selectedUserForEdit.role}
                    onChange={(e) =>
                      setSelectedUserForEdit({
                        ...selectedUserForEdit,
                        role: e.target.value as UserRole
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="Super Admin (HQ)">Super Admin (HQ)</option>
                    <option value="Admin Operasional">Admin Operasional</option>
                    <option value="Admin Lokasi 1">Admin Lokasi 1</option>
                    <option value="Admin Lokasi 2">Admin Lokasi 2</option>
                    <option value="Supervisor Lapangan">Supervisor Lapangan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kata Sandi (Password)</label>
                  <input
                    type="text"
                    value={selectedUserForEdit.password || ''}
                    onChange={(e) =>
                      setSelectedUserForEdit({ ...selectedUserForEdit, password: e.target.value })
                    }
                    placeholder="password123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Location Scope Settings */}
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                <span className="text-xs font-bold text-amber-400 block">Pengaturan Visibilitas Lokasi Gedung</span>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUserForEdit.isLocationLocked}
                      onChange={(e) =>
                        setSelectedUserForEdit({
                          ...selectedUserForEdit,
                          isLocationLocked: e.target.checked
                        })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                    />
                    <span>Kunci Pengguna pada 1 Lokasi Khusus (Tidak bisa lihat lokasi lain)</span>
                  </label>
                </div>

                {selectedUserForEdit.isLocationLocked && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Pilih Lokasi yang Ditugaskan:
                    </label>
                    <select
                      value={selectedUserForEdit.assignedProjectId}
                      onChange={(e) =>
                        setSelectedUserForEdit({
                          ...selectedUserForEdit,
                          assignedProjectId: e.target.value
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    >
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          📍 {proj.name} ({proj.code}) - {proj.type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Menu Permissions Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">Hak Akses Menu Sistem:</label>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUserForEdit({
                          ...selectedUserForEdit,
                          allowedViews: AVAILABLE_MENUS.map((m) => m.id)
                        })
                      }
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUserForEdit({
                          ...selectedUserForEdit,
                          allowedViews: ['dashboard']
                        })
                      }
                      className="text-slate-400 hover:underline cursor-pointer"
                    >
                      Hanya Dashboard
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {AVAILABLE_MENUS.map((menu) => {
                    const isChecked = selectedUserForEdit.allowedViews.includes(menu.id);

                    return (
                      <label
                        key={menu.id}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let next = [...selectedUserForEdit.allowedViews];
                            if (e.target.checked) {
                              next.push(menu.id);
                            } else {
                              next = next.filter((v) => v !== menu.id);
                            }
                            setSelectedUserForEdit({
                              ...selectedUserForEdit,
                              allowedViews: next
                            });
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                        />
                        <div className="flex items-center space-x-2 min-w-0">
                          {menu.icon}
                          <span className="truncate font-semibold">{menu.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New User Account */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tambah Akun Pengguna Baru</h3>
                  <p className="text-xs text-slate-400">Buat akun untuk admin site baru atau staf operasional.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap Staf</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dedi Kurniawan"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: admin.lokasi3"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Peran</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="Admin Lokasi 1">Admin Lokasi 1</option>
                    <option value="Admin Lokasi 2">Admin Lokasi 2</option>
                    <option value="Admin Operasional">Admin Operasional</option>
                    <option value="Supervisor Lapangan">Supervisor Lapangan</option>
                    <option value="Super Admin (HQ)">Super Admin (HQ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="text"
                    required
                    placeholder="password123"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Location Scope Settings */}
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
                <span className="text-xs font-bold text-amber-400 block">Pengaturan Visibilitas Lokasi Gedung</span>
                
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserForm.isLocationLocked}
                      onChange={(e) =>
                        setNewUserForm({
                          ...newUserForm,
                          isLocationLocked: e.target.checked
                        })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                    />
                    <span>Kunci Pengguna pada 1 Lokasi Khusus (Tidak bisa lihat lokasi lain)</span>
                  </label>
                </div>

                {newUserForm.isLocationLocked && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Pilih Lokasi yang Ditugaskan:
                    </label>
                    <select
                      value={newUserForm.assignedProjectId}
                      onChange={(e) =>
                        setNewUserForm({
                          ...newUserForm,
                          assignedProjectId: e.target.value
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    >
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          📍 {proj.name} ({proj.code}) - {proj.type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Menu Permissions Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">Hak Akses Menu Sistem:</label>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setNewUserForm({
                          ...newUserForm,
                          allowedViews: AVAILABLE_MENUS.map((m) => m.id)
                        })
                      }
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewUserForm({
                          ...newUserForm,
                          allowedViews: ['dashboard']
                        })
                      }
                      className="text-slate-400 hover:underline cursor-pointer"
                    >
                      Hanya Dashboard
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
                  {AVAILABLE_MENUS.map((menu) => {
                    const isChecked = newUserForm.allowedViews.includes(menu.id);

                    return (
                      <label
                        key={menu.id}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let next = [...newUserForm.allowedViews];
                            if (e.target.checked) {
                              next.push(menu.id);
                            } else {
                              next = next.filter((v) => v !== menu.id);
                            }
                            setNewUserForm({
                              ...newUserForm,
                              allowedViews: next
                            });
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                        />
                        <div className="flex items-center space-x-2 min-w-0">
                          {menu.icon}
                          <span className="truncate font-semibold">{menu.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
