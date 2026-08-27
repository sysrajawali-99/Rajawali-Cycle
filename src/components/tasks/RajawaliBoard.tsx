import React, { useState, useMemo } from 'react';
import {
  KanbanSquare,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Building2,
  Users,
  AlertTriangle,
  Sparkles,
  CheckSquare,
  Square,
  ArrowRight
} from 'lucide-react';
import {
  Project,
  Employee,
  CleaningTask,
  TaskStatus,
  ShiftType,
  UserRole
} from '../../types';

interface RajawaliBoardProps {
  projects: Project[];
  employees: Employee[];
  tasks: CleaningTask[];
  selectedProjectId: string;
  onUpdateTasks: (updated: CleaningTask[]) => void;
  userRole: UserRole;
}

export const RajawaliBoard: React.FC<RajawaliBoardProps> = ({
  projects = [],
  employees = [],
  tasks = [],
  selectedProjectId = 'ALL',
  onUpdateTasks,
  userRole
}) => {
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>(
    selectedProjectId !== 'ALL' ? selectedProjectId : projects[0]?.id || 'proj-1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');

  // Modal State for New Task
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState<{
    areaName: string;
    frequency: 'Harian' | 'Per-Shift' | 'Mingguan' | 'Deep Cleaning';
    assignedEmployees: string[];
    shift: ShiftType;
    priority: 'Rutin' | 'Sedang' | 'Tinggi' | 'Urgent';
    checklistItemsText: string;
    notes: string;
  }>({
    areaName: '',
    frequency: 'Harian',
    assignedEmployees: [],
    shift: 'Pagi (06:00 - 14:00)',
    priority: 'Sedang',
    checklistItemsText: 'Dusting meja & furniture\nMopping lantai dengan Neutral Cleaner\nRefill tissue & sabun cuci tangan\nKuras tempat sampah',
    notes: ''
  });

  // Filtered tasks for selected project
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.projectId !== activeProjectFilter) return false;
      if (shiftFilter !== 'ALL' && !t.shift.includes(shiftFilter)) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          t.areaName.toLowerCase().includes(q) ||
          t.assignedEmployees.some((e) => e.toLowerCase().includes(q)) ||
          t.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, activeProjectFilter, shiftFilter, searchQuery]);

  // Toggle single checklist item
  const handleToggleChecklist = (taskId: string, checkId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextChecklist = t.checklist.map((c) => {
          if (c.id === checkId) {
            return { ...c, done: !c.done };
          }
          return c;
        });

        // Auto move to 'done' if all items are checked
        const allDone = nextChecklist.every((c) => c.done);
        return {
          ...t,
          checklist: nextChecklist,
          status: allDone ? ('done' as TaskStatus) : t.status,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Move task to next status
  const handleMoveStatus = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Save new task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.areaName.trim()) return;

    const lines = taskForm.checklistItemsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const checklist = lines.map((line, idx) => ({
      id: `chk-${Date.now()}-${idx}`,
      text: line,
      done: false
    }));

    const newTask: CleaningTask = {
      id: `tsk-${Date.now()}`,
      projectId: activeProjectFilter,
      areaName: taskForm.areaName,
      frequency: taskForm.frequency,
      assignedEmployees:
        taskForm.assignedEmployees.length > 0
          ? taskForm.assignedEmployees
          : ['Petugas Standby'],
      shift: taskForm.shift,
      status: 'todo',
      priority: taskForm.priority,
      checklist,
      notes: taskForm.notes,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onUpdateTasks([newTask, ...tasks]);
    setShowAddTaskModal(false);
  };

  // Available employees for the active project
  const projectEmployees = useMemo(() => {
    return employees.filter(
      (e) => e.projectId === activeProjectFilter && e.status !== 'Resign'
    );
  }, [employees, activeProjectFilter]);

  const activeProjectObj = projects.find((p) => p.id === activeProjectFilter);

  // Columns definition
  const columns: { id: TaskStatus; title: string; color: string; badgeBg: string }[] = [
    {
      id: 'todo',
      title: 'Jadwal / To-Do',
      color: 'border-slate-700 bg-slate-900/60',
      badgeBg: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'in_progress',
      title: 'Sedang Dikerjakan',
      color: 'border-blue-600/40 bg-blue-950/10',
      badgeBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
    },
    {
      id: 'review',
      title: 'Audit QC Supervisor',
      color: 'border-purple-600/40 bg-purple-950/10',
      badgeBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
    },
    {
      id: 'done',
      title: 'Selesai (Done)',
      color: 'border-emerald-600/40 bg-emerald-950/10',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <KanbanSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Rajawali Boards (Area Cleaning Management)
              </h1>
              <p className="text-xs text-slate-400">
                Papan pemantauan tugas kebersihan area publik, checklist sanitasi toilet, dan audit supervisor.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Site selector */}
            <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
              <select
                id="tasks-project-select"
                value={activeProjectFilter}
                onChange={(e) => setActiveProjectFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-3"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    📍 {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Add Task Button */}
            <button
              id="add-task-btn"
              onClick={() => {
                setTaskForm({
                  areaName: '',
                  frequency: 'Harian',
                  assignedEmployees: projectEmployees.slice(0, 2).map((e) => e.name),
                  shift: 'Pagi (06:00 - 14:00)',
                  priority: 'Sedang',
                  checklistItemsText:
                    'Dusting meja & furniture\nMopping lantai dengan Neutral Cleaner\nRefill tissue & sabun cuci tangan\nKuras tempat sampah',
                  notes: ''
                });
                setShowAddTaskModal(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas Area</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="task-search-input"
              type="text"
              placeholder="Cari nama area, petugas, catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center space-x-2">
            <span className="text-xs text-slate-400 shrink-0">Shift:</span>
            <select
              id="task-shift-filter"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL">Semua Shift</option>
              <option value="Pagi">Pagi (06:00 - 14:00)</option>
              <option value="Siang">Siang (14:00 - 22:00)</option>
              <option value="Malam">Malam (22:00 - 06:00)</option>
              <option value="General">General (08:00 - 17:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.color} p-3 flex flex-col justify-between min-h-[500px] shadow-lg`}
            >
              <div>
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="font-bold text-white text-xs tracking-tight">{col.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="py-10 text-center text-slate-600 text-xs italic">
                      Tidak ada area pada kolom ini
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const doneCount = task.checklist.filter((c) => c.done).length;
                      const totalCount = task.checklist.length;
                      const allDone = totalCount > 0 && doneCount === totalCount;

                      return (
                        <div
                          key={task.id}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl shadow-md space-y-2.5 transition-all text-xs"
                        >
                          {/* Priority & Frequency */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                task.priority === 'Urgent'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : task.priority === 'Tinggi'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[10px] text-slate-400">{task.frequency}</span>
                          </div>

                          {/* Area Name */}
                          <h4 className="font-bold text-white text-sm leading-snug">{task.areaName}</h4>

                          {/* Assignees */}
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                            <Users className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{task.assignedEmployees.join(', ')}</span>
                          </div>

                          {/* Interactive Checklist */}
                          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 space-y-1.5">
                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                              <span>Checklist Kebersihan:</span>
                              <span className={allDone ? 'text-emerald-400' : 'text-slate-300'}>
                                {doneCount}/{totalCount}
                              </span>
                            </div>

                            {task.checklist.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleToggleChecklist(task.id, item.id)}
                                className="w-full flex items-start space-x-2 text-left hover:bg-slate-900 p-1 rounded transition-colors group cursor-pointer"
                              >
                                {item.done ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 mt-0.5" />
                                )}
                                <span
                                  className={`text-[11px] leading-tight ${
                                    item.done ? 'line-through text-slate-500' : 'text-slate-300'
                                  }`}
                                >
                                  {item.text}
                                </span>
                              </button>
                            ))}
                          </div>

                          {task.notes && (
                            <p className="text-[10px] text-slate-400 italic">"{task.notes}"</p>
                          )}

                          {/* Move Status Buttons */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => {
                                  const prev =
                                    col.id === 'done'
                                      ? 'review'
                                      : col.id === 'review'
                                      ? 'in_progress'
                                      : 'todo';
                                  handleMoveStatus(task.id, prev);
                                }}
                                className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
                              >
                                ◀ Mundur
                              </button>
                            )}

                            {col.id !== 'done' ? (
                              <button
                                onClick={() => {
                                  const next =
                                    col.id === 'todo'
                                      ? 'in_progress'
                                      : col.id === 'in_progress'
                                      ? 'review'
                                      : 'done';
                                  handleMoveStatus(task.id, next);
                                }}
                                className="text-[10px] text-amber-300 hover:text-white px-2 py-1 bg-slate-800 hover:bg-amber-600 rounded font-semibold ml-auto flex items-center space-x-1"
                              >
                                <span>Lanjut</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-bold ml-auto flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Tambah Tugas Kebersihan Area</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Area / Ruangan:</label>
                <input
                  id="task-area-input"
                  type="text"
                  required
                  placeholder="Contoh: Toilet Barat Lt. 2 / Koridor VIP"
                  value={taskForm.areaName}
                  onChange={(e) => setTaskForm({ ...taskForm, areaName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Frekuensi:</label>
                  <select
                    id="task-freq-select"
                    value={taskForm.frequency}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        frequency: e.target.value as any
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Harian">Harian</option>
                    <option value="Per-Shift">Per-Shift</option>
                    <option value="Mingguan">Mingguan</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prioritas:</label>
                  <select
                    id="task-priority-select"
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as any
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Rutin">Rutin</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Petugas (Cleaner):</label>
                <select
                  multiple
                  id="task-assignees-select"
                  value={taskForm.assignedEmployees}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                    setTaskForm({ ...taskForm, assignedEmployees: selected });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-amber-500 h-24"
                >
                  {projectEmployees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} ({emp.position})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-0.5">Tahan tombol Ctrl / Cmd untuk memilih lebih dari satu.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Item Checklist (1 baris per item):
                </label>
                <textarea
                  id="task-checklist-input"
                  rows={4}
                  required
                  value={taskForm.checklistItemsText}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, checklistItemsText: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Tambahan:</label>
                <input
                  id="task-notes-input"
                  type="text"
                  placeholder="Instruksi khusus sebelum mall buka / audit..."
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="save-task-submit"
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Simpan Tugas Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
