import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  ArrowRightLeft,
  Search,
  Filter,
  Building2,
  Phone,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  Edit2,
  Trash2,
  Sparkles
} from 'lucide-react';
import {
  Project,
  Employee,
  MutationHistory,
  EmployeePosition,
  ShiftType,
  EmployeeStatus,
  UserRole
} from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface EmployeeManagementProps {
  projects: Project[];
  employees: Employee[];
  mutations: MutationHistory[];
  selectedProjectId: string;
  onUpdateEmployees: (updated: Employee[]) => void;
  onAddMutation: (mutation: MutationHistory) => void;
  userRole: UserRole;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  projects = [],
  employees = [],
  mutations = [],
  selectedProjectId = 'ALL',
  onUpdateEmployees,
  onAddMutation,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'mutations'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>(selectedProjectId);
  const [filterPosition, setFilterPosition] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [mutatingEmployee, setMutatingEmployee] = useState<Employee | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    nik: string;
    phone: string;
    position: EmployeePosition;
    projectId: string;
    shift: ShiftType;
    dailyRate: number;
    status: EmployeeStatus;
    joinDate: string;
    uniformSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    bankName: string;
    bankAccount: string;
  }>({
    name: '',
    nik: '',
    phone: '',
    position: 'Cleaner',
    projectId: projects[0]?.id || 'proj-1',
    shift: 'Pagi (06:00 - 14:00)',
    dailyRate: 130000,
    status: 'Aktif',
    joinDate: new Date().toISOString().split('T')[0],
    uniformSize: 'L',
    bankName: 'BCA',
    bankAccount: ''
  });

  // Mutation form state
  const [mutationForm, setMutationForm] = useState<{
    targetProjectId: string;
    effectiveDate: string;
    reason: string;
  }>({
    targetProjectId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchProject = filterProject === 'ALL' || emp.projectId === filterProject;
      const matchPosition = filterPosition === 'ALL' || emp.position === filterPosition;
      const matchStatus = filterStatus === 'ALL' || emp.status === filterStatus;
      
      let matchQuery = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        matchQuery = (
          emp.name.toLowerCase().includes(q) ||
          emp.nik.toLowerCase().includes(q) ||
          emp.phone.includes(q) ||
          emp.position.toLowerCase().includes(q)
        );
      }
      return matchProject && matchPosition && matchStatus && matchQuery;
    });
  }, [employees, filterProject, filterPosition, filterStatus, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      nik: emp.nik,
      phone: emp.phone,
      position: emp.position,
      projectId: emp.projectId,
      shift: emp.shift,
      dailyRate: emp.dailyRate,
      status: emp.status,
      joinDate: emp.joinDate,
      uniformSize: emp.uniformSize,
      bankName: emp.bankName,
      bankAccount: emp.bankAccount
    });
  };

  // Open Mutation Modal
  const handleOpenMutation = (emp: Employee) => {
    setMutatingEmployee(emp);
    const otherProjects = projects.filter((p) => p.id !== emp.projectId);
    setMutationForm({
      targetProjectId: otherProjects[0]?.id || '',
      effectiveDate: new Date().toISOString().split('T')[0],
      reason: ''
    });
  };

  // Save new or edited employee
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Nama karyawan wajib diisi!');
      return;
    }

    if (editingEmployee) {
      // Update existing
      const updated = employees.map((emp) => {
        if (emp.id === editingEmployee.id) {
          return {
            ...emp,
            ...formData
          };
        }
        return emp;
      });
      onUpdateEmployees(updated);
      setEditingEmployee(null);
    } else {
      // Add new
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        ...formData,
        nik: formData.nik || `RC-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
      };
      onUpdateEmployees([newEmp, ...employees]);
      setShowAddModal(false);
    }
  };

  // Execute Staff Mutation (Transfer to new project site)
  const handleExecuteMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutatingEmployee || !mutationForm.targetProjectId) return;

    const fromProject = projects.find((p) => p.id === mutatingEmployee.projectId);
    const toProject = projects.find((p) => p.id === mutationForm.targetProjectId);

    if (!toProject) return;

    // Create mutation audit record
    const newMutation: MutationHistory = {
      id: `mut-${Date.now()}`,
      employeeId: mutatingEmployee.id,
      employeeName: mutatingEmployee.name,
      nik: mutatingEmployee.nik,
      fromProjectId: mutatingEmployee.projectId,
      fromProjectName: fromProject?.name || 'Unknown',
      toProjectId: toProject.id,
      toProjectName: toProject.name,
      effectiveDate: mutationForm.effectiveDate,
      reason: mutationForm.reason || 'Penugasan operasional proyek',
      adminName: userRole,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // Update employee's project ID
    const updatedEmployees = employees.map((emp) => {
      if (emp.id === mutatingEmployee.id) {
        return {
          ...emp,
          projectId: toProject.id,
          status: 'Aktif' as EmployeeStatus
        };
      }
      return emp;
    });

    onAddMutation(newMutation);
    onUpdateEmployees(updatedEmployees);
    setMutatingEmployee(null);
  };

  // Delete / Resign employee
  const handleDeleteEmployee = (empId: string) => {
    if (confirm('Yakin ingin mengubah status karyawan ini menjadi Resign / Nonaktif?')) {
      const updated = employees.map((emp) => {
        if (emp.id === empId) {
          return { ...emp, status: 'Resign' as EmployeeStatus };
        }
        return emp;
      });
      onUpdateEmployees(updated);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Data Karyawan & Penempatan Lokasi
              </h1>
              <p className="text-xs text-slate-400">
                Kelola profil personil cleaning service, penetapan shift, rate harian, dan mutasi antar lokasi proyek.
              </p>
            </div>
          </div>

          {/* Action: Add employee */}
          <div className="flex items-center space-x-2">
            <button
              id="add-employee-btn"
              onClick={() => {
                setFormData({
                  name: '',
                  nik: `RC-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
                  phone: '',
                  position: 'Cleaner',
                  projectId: filterProject !== 'ALL' ? filterProject : projects[0]?.id || 'proj-1',
                  shift: 'Pagi (06:00 - 14:00)',
                  dailyRate: 130000,
                  status: 'Aktif',
                  joinDate: new Date().toISOString().split('T')[0],
                  uniformSize: 'L',
                  bankName: 'BCA',
                  bankAccount: ''
                });
                setShowAddModal(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Karyawan Baru</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-4 pt-3 border-t border-slate-800">
          <button
            id="tab-roster-btn"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'roster'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Roster Personil ({employees.filter(e => e.status !== 'Resign').length})</span>
          </button>
          <button
            id="tab-mutations-btn"
            onClick={() => setActiveTab('mutations')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'mutations'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Mutasi Lokasi ({mutations.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'roster' ? (
        <>
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="employee-search-input"
                type="text"
                placeholder="Cari nama, NIK, no HP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            {/* Filter Project */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                id="employee-filter-project"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Lokasi Proyek</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Position */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
              <span className="text-xs text-slate-400 shrink-0">Posisi:</span>
              <select
                id="employee-filter-position"
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
                <option value="Supervisor" className="bg-slate-900">Supervisor</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
              <span className="text-xs text-slate-400 shrink-0">Status:</span>
              <select
                id="employee-filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Status</option>
                <option value="Aktif" className="bg-slate-900">Aktif</option>
                <option value="Cuti" className="bg-slate-900">Cuti</option>
                <option value="Resign" className="bg-slate-900">Resign / Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.length === 0 ? (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                <p className="text-base font-semibold text-slate-400">Karyawan tidak ditemukan.</p>
                <p className="text-xs">Ubah kriteria pencarian atau tambahkan data karyawan baru.</p>
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const proj = projects.find((p) => p.id === emp.projectId);
                return (
                  <div
                    key={emp.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all space-y-3 flex flex-col justify-between"
                  >
                    {/* Top: Name, Position, Status */}
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white text-base leading-snug">{emp.name}</h3>
                          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                            <span className="text-amber-400 font-semibold">{emp.position}</span>
                            <span>•</span>
                            <span className="text-slate-500">{emp.nik}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            emp.status === 'Aktif'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : emp.status === 'Cuti'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-700 text-slate-400 border-slate-600'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </div>

                      {/* Detail attributes */}
                      <div className="mt-3 space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500 flex items-center space-x-1">
                            <Building2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Lokasi Proyek:</span>
                          </span>
                          <span className="font-semibold text-slate-200 text-right truncate max-w-[150px]">
                            {proj?.name || '-'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span>Shift Kerja:</span>
                          </span>
                          <span className="text-slate-300">{emp.shift}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500 flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>No. Kontak:</span>
                          </span>
                          <span className="text-slate-300">{emp.phone}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-500 flex items-center space-x-1">
                            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                            <span>Rate Gaji / Hari:</span>
                          </span>
                          <span className="font-bold text-amber-400">
                            {formatCurrency(emp.dailyRate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: Edit, Mutate, Delete */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      {/* Mutate Location */}
                      <button
                        id={`mutate-btn-${emp.id}`}
                        onClick={() => handleOpenMutation(emp)}
                        title="Pindah / Mutasi ke Proyek Lain"
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Pindah Site</span>
                      </button>

                      {/* Edit Info */}
                      <button
                        id={`edit-emp-btn-${emp.id}`}
                        onClick={() => handleOpenEdit(emp)}
                        title="Edit Profil Karyawan"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Resign / Delete */}
                      {emp.status !== 'Resign' && (
                        <button
                          id={`delete-emp-btn-${emp.id}`}
                          onClick={() => handleDeleteEmployee(emp.id)}
                          title="Nonaktifkan Karyawan"
                          className="p-2 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Mutations History Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">Catatan Audit Mutasi & Rotasi Lapangan</h3>
              <p className="text-xs text-slate-400">
                Log resmi pemindahan karyawan antar lokasi proyek untuk transparansi roaster dan timesheet.
              </p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
              {mutations.length} Mutasi Tercatat
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {mutations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Belum ada riwayat mutasi karyawan.
              </div>
            ) : (
              mutations.map((mut) => (
                <div key={mut.id} className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{mut.employeeName}</span>
                      <span className="text-slate-500">({mut.nik})</span>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-500/30">
                        Mutasi Sukses
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-300">
                      <span className="text-rose-400 font-medium">{mut.fromProjectName}</span>
                      <span className="text-amber-400">➔</span>
                      <span className="text-emerald-400 font-bold">{mut.toProjectName}</span>
                    </div>

                    <p className="text-slate-400 italic">"{mut.reason}"</p>
                  </div>

                  <div className="text-right space-y-1 text-slate-400 shrink-0">
                    <div>Tgl Berlaku: <span className="font-semibold text-slate-200">{mut.effectiveDate}</span></div>
                    <div className="text-[11px]">Diproses oleh: <span className="text-amber-400">{mut.adminName}</span></div>
                    <div className="text-[10px] text-slate-500">{mut.createdAt}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {(showAddModal || editingEmployee) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
                <p className="text-xs text-slate-400">
                  Data akan otomatis muncul di Eagle Timesheet lokasi penempatan.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEmployee(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap:</label>
                  <input
                    id="modal-emp-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Contoh: Muhammad Rizky"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NIK (Nomor Induk Karyawan):</label>
                  <input
                    id="modal-emp-nik"
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="RC-20240101"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Posisi / Jabatan:</label>
                  <select
                    id="modal-emp-position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value as EmployeePosition })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Cleaner">Cleaner (Petugas Kebersihan)</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Floor Specialist">Floor Specialist (Kristalisasi)</option>
                    <option value="Gardener">Gardener (Taman)</option>
                    <option value="Gondola / Facade Cleaner">Gondola Cleaner (Kaca Gedung)</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lokasi Proyek Penempatan:</label>
                  <select
                    id="modal-emp-project"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shift Kerja:</label>
                  <select
                    id="modal-emp-shift"
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value as ShiftType })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pagi (06:00 - 14:00)">Pagi (06:00 - 14:00)</option>
                    <option value="Siang (14:00 - 22:00)">Siang (14:00 - 22:00)</option>
                    <option value="Malam (22:00 - 06:00)">Malam (22:00 - 06:00)</option>
                    <option value="General (08:00 - 17:00)">General (08:00 - 17:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rate Gaji Harian (Rp):</label>
                  <input
                    id="modal-emp-dailyrate"
                    type="number"
                    min="50000"
                    step="5000"
                    required
                    value={formData.dailyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyRate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor WhatsApp / HP:</label>
                  <input
                    id="modal-emp-phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="0812-xxxx-xxxx"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ukuran Seragam:</label>
                  <select
                    id="modal-emp-uniform"
                    value={formData.uniformSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        uniformSize: e.target.value as 'S' | 'M' | 'L' | 'XL' | 'XXL'
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bank Penggajian:</label>
                  <input
                    id="modal-emp-bankname"
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="BCA / Mandiri / BRI"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nomor Rekening Bank:</label>
                  <input
                    id="modal-emp-bankacc"
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Nomor rekening transfer payroll"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="modal-save-emp-btn"
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Simpan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mutation (Transfer Site) Modal */}
      {mutatingEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Mutasi / Pindah Lokasi Proyek</h3>
                <p className="text-xs text-slate-400">
                  {mutatingEmployee.name} ({mutatingEmployee.position})
                </p>
              </div>
              <button
                onClick={() => setMutatingEmployee(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteMutation} className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500">Lokasi Asal Saat Ini:</div>
                <div className="font-bold text-amber-400 text-sm">
                  {projects.find((p) => p.id === mutatingEmployee.projectId)?.name}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Pindahkan ke Lokasi Proyek Baru:
                </label>
                <select
                  id="mutation-target-project"
                  required
                  value={mutationForm.targetProjectId}
                  onChange={(e) =>
                    setMutationForm({ ...mutationForm, targetProjectId: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-500"
                >
                  {projects
                    .filter((p) => p.id !== mutatingEmployee.projectId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type} - {p.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tanggal Efektif Mulai Bertugas:
                </label>
                <input
                  id="mutation-effective-date"
                  type="date"
                  required
                  value={mutationForm.effectiveDate}
                  onChange={(e) =>
                    setMutationForm({ ...mutationForm, effectiveDate: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Alasan Pemindahan / Mutasi:
                </label>
                <textarea
                  id="mutation-reason"
                  rows={2}
                  required
                  value={mutationForm.reason}
                  onChange={(e) =>
                    setMutationForm({ ...mutationForm, reason: e.target.value })
                  }
                  placeholder="Contoh: Penambahan tenaga kerja area lobby, rotasi bulanan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMutatingEmployee(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="execute-mutation-submit-btn"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20"
                >
                  Eksekusi Mutasi Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
