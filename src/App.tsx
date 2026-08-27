/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Project,
  Employee,
  TimesheetMonthRecord,
  InventoryItem,
  ProjectStock,
  InventoryLog,
  CleaningTask,
  MutationHistory,
  BlastAnnouncement,
  SopItem,
  AppView,
  UserAccount
} from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { EagleTimesheet } from './components/timesheet/EagleTimesheet';
import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { SmartInventory } from './components/inventory/SmartInventory';
import { RajawaliBoard } from './components/tasks/RajawaliBoard';
import { EagleBlast } from './components/blast/EagleBlast';
import { SopLibrary } from './components/sop/SopLibrary';
import { ReportingCenter } from './components/reports/ReportingCenter';
import { AccessControl } from './components/access/AccessControl';
import { ProjectLocationSettings } from './components/projects/ProjectLocationSettings';
import { LoginPage } from './components/auth/LoginPage';
import { INITIAL_USERS } from './data/initialData';

export default function App() {
  // Auth & Session State
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // App navigation & context state
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Core Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetMonthRecord[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [projectStocks, setProjectStocks] = useState<ProjectStock[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [mutations, setMutations] = useState<MutationHistory[]>([]);
  const [blasts, setBlasts] = useState<BlastAnnouncement[]>([]);
  const [sops, setSops] = useState<SopItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initial Load from storage
  useEffect(() => {
    const loadedProjects = storageService.getProjects();
    const loadedUsers = storageService.getUsers();
    const activeUser = storageService.getActiveUser();

    setProjects(loadedProjects);
    setUsers(loadedUsers);
    setEmployees(storageService.getEmployees());
    setTimesheets(storageService.getTimesheets());
    setInventoryItems(storageService.getInventoryItems());
    setProjectStocks(storageService.getProjectStocks());
    setInventoryLogs(storageService.getInventoryLogs());
    setTasks(storageService.getTasks());
    setMutations(storageService.getMutations());
    setBlasts(storageService.getBlasts());
    setSops(storageService.getSops());

    if (activeUser) {
      // Find latest updated version of user from users list
      const matched = loadedUsers.find((u) => u.id === activeUser.id) || activeUser;
      setCurrentUser(matched);

      // Enforce location lock if user is locked
      if (matched.isLocationLocked && matched.assignedProjectId !== 'ALL') {
        setSelectedProjectId(matched.assignedProjectId);
      }
    }

    setIsLoaded(true);
  }, []);

  // Update handlers with persistent storage
  const handleUpdateProjects = (updated: Project[]) => {
    setProjects(updated);
    storageService.saveProjects(updated);
  };

  const handleUpdateEmployees = (updated: Employee[]) => {
    setEmployees(updated);
    storageService.saveEmployees(updated);
  };

  const handleUpdateTimesheets = (updated: TimesheetMonthRecord[]) => {
    setTimesheets(updated);
    storageService.saveTimesheets(updated);
  };

  const handleUpdateStocks = (updated: ProjectStock[]) => {
    setProjectStocks(updated);
    storageService.saveProjectStocks(updated);
  };

  const handleAddInventoryLog = (log: InventoryLog) => {
    const nextLogs = [log, ...inventoryLogs];
    setInventoryLogs(nextLogs);
    storageService.saveInventoryLogs(nextLogs);
  };

  const handleAddMasterItem = (item: InventoryItem) => {
    const nextItems = [...inventoryItems, item];
    setInventoryItems(nextItems);
    storageService.saveInventoryItems(nextItems);
  };

  const handleUpdateTasks = (updated: CleaningTask[]) => {
    setTasks(updated);
    storageService.saveTasks(updated);
  };

  const handleAddMutation = (mutation: MutationHistory) => {
    const nextMutations = [mutation, ...mutations];
    setMutations(nextMutations);
    storageService.saveMutations(nextMutations);
  };

  const handleAddBlast = (blast: BlastAnnouncement) => {
    const nextBlasts = [blast, ...blasts];
    setBlasts(nextBlasts);
    storageService.saveBlasts(nextBlasts);
  };

  // User Management Handlers
  const handleUpdateUsers = (updatedUsers: UserAccount[]) => {
    setUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);

    // If current logged-in user was updated, update currentUser session
    if (currentUser) {
      const activeUpdated = updatedUsers.find((u) => u.id === currentUser.id);
      if (activeUpdated) {
        setCurrentUser(activeUpdated);
        storageService.saveActiveUser(activeUpdated);

        // Re-enforce location lock
        if (activeUpdated.isLocationLocked && activeUpdated.assignedProjectId !== 'ALL') {
          setSelectedProjectId(activeUpdated.assignedProjectId);
        }

        // If active view is no longer allowed, fall back to dashboard
        if (!activeUpdated.allowedViews.includes(currentView) && currentView !== 'dashboard') {
          setCurrentView('dashboard');
        }
      }
    }
  };

  const handleResetUsersToDefault = () => {
    storageService.saveUsers(INITIAL_USERS);
    setUsers(INITIAL_USERS);
    if (currentUser) {
      const refreshed = INITIAL_USERS.find((u) => u.id === currentUser.id) || INITIAL_USERS[0];
      setCurrentUser(refreshed);
      storageService.saveActiveUser(refreshed);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    storageService.saveActiveUser(user);

    // Update lastLogin in users array
    const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
    setUsers(updatedUsers);
    storageService.saveUsers(updatedUsers);

    // Set site lock based on role/user permissions
    if (user.isLocationLocked && user.assignedProjectId !== 'ALL') {
      setSelectedProjectId(user.assignedProjectId);
    } else {
      setSelectedProjectId('ALL');
    }

    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    storageService.clearActiveUser();
    setCurrentUser(null);
    setSelectedProjectId('ALL');
    setCurrentView('dashboard');
  };

  // Project selector change handler (respects location lock)
  const handleSelectProject = (projectId: string) => {
    if (currentUser?.isLocationLocked) {
      // Locked users cannot switch
      return;
    }
    setSelectedProjectId(projectId);
  };

  // Safe navigation view changer that verifies user permissions
  const handleNavigateView = (view: AppView) => {
    if (!currentUser) {
      setCurrentView('dashboard');
      return;
    }

    // Access control view is restricted to Super Admin or users with access_control
    if (view === 'access_control' && currentUser.role !== 'Super Admin (HQ)' && !currentUser.allowedViews.includes('access_control')) {
      alert('Akses Ditolak: Modul Hak Akses Pengguna hanya dapat diakses oleh Super Admin HQ.');
      return;
    }

    // Check if view is allowed
    const isAllowed =
      currentUser.allowedViews.includes(view) ||
      (view === 'sop' && currentUser.allowedViews.includes('sops')) ||
      (view === 'sops' && currentUser.allowedViews.includes('sop' as any)) ||
      (view === 'access_control' && currentUser.role === 'Super Admin (HQ)');

    if (!isAllowed) {
      alert(`Akses Ditolak: Anda tidak memiliki izin untuk membuka menu ${view}. Hubungi Super Admin.`);
      return;
    }

    setCurrentView(view);
  };

  // Reset demo operational data
  const handleResetData = () => {
    storageService.resetToDefault();
    setProjects(storageService.getProjects());
    setEmployees(storageService.getEmployees());
    setTimesheets(storageService.getTimesheets());
    setInventoryItems(storageService.getInventoryItems());
    setProjectStocks(storageService.getProjectStocks());
    setInventoryLogs(storageService.getInventoryLogs());
    setTasks(storageService.getTasks());
    setMutations(storageService.getMutations());
    setBlasts(storageService.getBlasts());
    setSops(storageService.getSops());
  };

  // Badge counts
  const lowStockCount = useMemo(() => {
    return projectStocks.filter((stock) => {
      const item = inventoryItems.find((i) => i.id === stock.inventoryItemId);
      if (!item) return false;
      if (selectedProjectId !== 'ALL' && stock.projectId !== selectedProjectId) return false;
      return stock.currentStock <= item.minThreshold;
    }).length;
  }, [projectStocks, inventoryItems, selectedProjectId]);

  const activeTasksCount = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedProjectId !== 'ALL' && t.projectId !== selectedProjectId) return false;
      return t.status !== 'done';
    }).length;
  }, [tasks, selectedProjectId]);

  const unreadBlastCount = useMemo(() => {
    return blasts.filter((b) => b.pinned).length;
  }, [blasts]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 text-sm font-semibold space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl animate-pulse">
          🦅
        </div>
        <div>Memuat Sistem Terpadu Rajawali Cycle...</div>
      </div>
    );
  }

  // Not authenticated: Render Login Page
  if (!currentUser) {
    return <LoginPage users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        currentUser={currentUser}
        onLogout={handleLogout}
        onResetData={handleResetData}
        lowStockCount={lowStockCount}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        onSelectView={handleNavigateView}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={handleNavigateView}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onResetData={handleResetData}
          currentUser={currentUser}
          lowStockCount={lowStockCount}
          activeTasksCount={activeTasksCount}
          unreadBlastCount={unreadBlastCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pb-24 md:pb-8 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Dashboard Overview */}
            {currentView === 'dashboard' && (
              <DashboardOverview
                projects={projects}
                employees={employees}
                timesheets={timesheets}
                projectStocks={projectStocks}
                inventoryItems={inventoryItems}
                tasks={tasks}
                blasts={blasts}
                selectedProjectId={selectedProjectId}
                onNavigate={handleNavigateView}
                userRole={currentUser.role}
              />
            )}

            {/* Pengaturan Lokasi Project (Spesifikasi Gedung & Fasilitas) */}
            {currentView === 'project_settings' && (
              <ProjectLocationSettings
                projects={projects}
                selectedProjectId={selectedProjectId}
                onUpdateProjects={handleUpdateProjects}
                userRole={currentUser.role}
              />
            )}

            {/* Eagle Timesheet Matrix */}
            {currentView === 'timesheet' && (
              <EagleTimesheet
                projects={projects}
                employees={employees}
                timesheets={timesheets}
                selectedProjectId={selectedProjectId}
                onUpdateTimesheets={handleUpdateTimesheets}
                userRole={currentUser.role}
              />
            )}

            {/* Employee Management & Mutations */}
            {currentView === 'employees' && (
              <EmployeeManagement
                projects={projects}
                employees={employees}
                mutations={mutations}
                selectedProjectId={selectedProjectId}
                onUpdateEmployees={handleUpdateEmployees}
                onAddMutation={handleAddMutation}
                userRole={currentUser.role}
              />
            )}

            {/* Smart Inventory & Chemical */}
            {currentView === 'inventory' && (
              <SmartInventory
                projects={projects}
                inventoryItems={inventoryItems}
                projectStocks={projectStocks}
                inventoryLogs={inventoryLogs}
                selectedProjectId={selectedProjectId}
                onUpdateStocks={handleUpdateStocks}
                onAddLog={handleAddInventoryLog}
                onAddMasterItem={handleAddMasterItem}
                userRole={currentUser.role}
              />
            )}

            {/* Rajawali Tasks & Kanban Board */}
            {currentView === 'tasks' && (
              <RajawaliBoard
                projects={projects}
                employees={employees}
                tasks={tasks}
                selectedProjectId={selectedProjectId}
                onUpdateTasks={handleUpdateTasks}
                userRole={currentUser.role}
              />
            )}

            {/* Eagle Blast Announcements */}
            {currentView === 'blast' && (
              <EagleBlast
                blasts={blasts}
                onAddBlast={handleAddBlast}
                userRole={currentUser.role}
              />
            )}

            {/* SOP Library & K3 Safety */}
            {(currentView === 'sops' || currentView === 'sop') && (
              <SopLibrary sops={sops} />
            )}

            {/* Reporting Center & Payroll */}
            {currentView === 'reports' && (
              <ReportingCenter
                projects={projects}
                employees={employees}
                timesheets={timesheets}
                projectStocks={projectStocks}
                inventoryItems={inventoryItems}
                selectedProjectId={selectedProjectId}
                userRole={currentUser.role}
              />
            )}

            {/* Access Control & RBAC Permissions Matrix */}
            {currentView === 'access_control' && (
              <AccessControl
                users={users}
                projects={projects}
                currentUser={currentUser}
                onUpdateUsers={handleUpdateUsers}
                onResetUsersToDefault={handleResetUsersToDefault}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={handleNavigateView}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        currentUser={currentUser}
        onLogout={handleLogout}
        onResetData={handleResetData}
        lowStockCount={lowStockCount}
        activeTasksCount={activeTasksCount}
        unreadBlastCount={unreadBlastCount}
      />
    </div>
  );
}
