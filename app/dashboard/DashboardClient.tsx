'use client';

import { useState, useEffect, useMemo } from 'react';
import { Folder, Plus, AlertCircle, CheckCircle2, Search, Menu, Calendar } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import TaskFilters from './components/TaskFilters';
import TaskModal from './components/TaskModal';
import AnniversaryCard from './components/AnniversaryCard';
import AnniversaryFilters from './components/AnniversaryFilters';
import AnniversaryModal from './components/AnniversaryModal';
import { Task, List, UserInfo, Anniversary } from './types';

interface DashboardClientProps {
  user: UserInfo;
  initialLists: List[];
}

export default function DashboardClient({ user, initialLists }: DashboardClientProps) {
  const [lists, setLists] = useState<List[]>(initialLists);
  const [activeListId, setActiveListId] = useState<string | null>(
    initialLists.length > 0 ? initialLists[0].id : null
  );

  const [currentUser, setCurrentUser] = useState<UserInfo>(user);

  const handleToggleUserReminders = async (enabled: boolean) => {
    setCurrentUser(prev => ({ ...prev, emailRemindersEnabled: enabled }));
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailRemindersEnabled: enabled }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCurrentUser(prev => ({ ...prev, emailRemindersEnabled: !enabled }));
        setErrorMessage(data.message || 'Failed to update reminder settings');
      }
    } catch (err) {
      setCurrentUser(prev => ({ ...prev, emailRemindersEnabled: !enabled }));
      setErrorMessage('Network error, failed to update settings');
    }
  };

  // App settings & state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Filter/Sort States for Tasks
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, in_progress, completed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, low, medium, high
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, dueDate, priority, name
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter/Sort States for Anniversaries
  const [anniversarySearchQuery, setAnniversarySearchQuery] = useState('');
  const [anniversarySortBy, setAnniversarySortBy] = useState('nextOccurrence'); // nextOccurrence, date, name
  const [anniversarySortOrder, setAnniversarySortOrder] = useState<'asc' | 'desc'>('asc');

  // List Inline state (shared with Sidebar)
  const [isCreatingList, setIsCreatingList] = useState(false);

  // Modals States
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [anniversaryModalOpen, setAnniversaryModalOpen] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // Enforce Light Mode on Mount
  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.remove('dark');
  }, []);

  // Find currently active list
  const activeList = useMemo(() => {
    return lists.find(l => l.id === activeListId) || null;
  }, [lists, activeListId]);

  // List Operations
  const handleCreateList = async (name: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setLists(prev => [...prev, data.list]);
        setActiveListId(data.list.id);
        return true;
      } else {
        setErrorMessage(data.message || 'Failed to create list');
        return false;
      }
    } catch (err) {
      setErrorMessage('Network error, please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameList = async (listId: string, name: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setLists(prev => prev.map(l => l.id === listId ? { ...l, name: data.list.name } : l));
        return true;
      } else {
        setErrorMessage(data.message || 'Failed to rename list');
        return false;
      }
    } catch (err) {
      setErrorMessage('Network error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        const remainingLists = lists.filter(l => l.id !== listId);
        setLists(remainingLists);
        if (activeListId === listId) {
          setActiveListId(remainingLists.length > 0 ? remainingLists[0].id : null);
        }
        return true;
      } else {
        setErrorMessage(data.message || 'Failed to delete list');
        return false;
      }
    } catch (err) {
      setErrorMessage('Network error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Task Operations
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (payload: {
    name: string;
    description: string | null;
    dueDate: string | null;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
  }) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let res;
      if (editingTask) {
        res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, listId: activeListId }),
        });
      } else {
        res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, listId: activeListId }),
        });
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setLists(prev => prev.map(l => {
          if (l.id !== activeListId) return l;
          if (editingTask) {
            return {
              ...l,
              tasks: l.tasks.map(t => t.id === editingTask.id ? data.task : t)
            };
          } else {
            return {
              ...l,
              tasks: [data.task, ...l.tasks]
            };
          }
        }));
        setTaskModalOpen(false);
        return true;
      } else {
        setErrorMessage(data.message || 'Failed to save task');
        return false;
      }
    } catch (err) {
      setErrorMessage('Network error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        setLists(prev => prev.map(l => {
          if (l.id !== activeListId) return l;
          return {
            ...l,
            tasks: l.tasks.filter(t => t.id !== taskId)
          };
        }));
      }
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';

    // Optimistic Update
    setLists(prev => prev.map(l => {
      if (l.id !== task.listId) return l;
      return {
        ...l,
        tasks: l.tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t)
      };
    }));

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        // Rollback on failure
        setLists(prev => prev.map(l => {
          if (l.id !== task.listId) return l;
          return {
            ...l,
            tasks: l.tasks.map(t => t.id === task.id ? task : t)
          };
        }));
      }
    } catch (err) {
      // Rollback on network error
      setLists(prev => prev.map(l => {
        if (l.id !== task.listId) return l;
        return {
          ...l,
          tasks: l.tasks.map(t => t.id === task.id ? task : t)
        };
      }));
    }
  };

  // Anniversary Operations
  const handleOpenCreateAnniversary = () => {
    setEditingAnniversary(null);
    setAnniversaryModalOpen(true);
  };

  const handleOpenEditAnniversary = (anniversary: Anniversary) => {
    setEditingAnniversary(anniversary);
    setAnniversaryModalOpen(true);
  };

  const handleSaveAnniversary = async (payload: {
    name: string;
    description: string | null;
    date: string;
    isImportant: boolean;
    reminderTime: '12 AM' | '8 AM';
  }) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let res;
      if (editingAnniversary) {
        res = await fetch(`/api/anniversaries/${editingAnniversary.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, listId: activeListId }),
        });
      } else {
        res = await fetch('/api/anniversaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, listId: activeListId }),
        });
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setLists(prev => prev.map(l => {
          if (l.id !== activeListId) return l;
          const currentAnniversaries = l.anniversaries || [];
          if (editingAnniversary) {
            return {
              ...l,
              anniversaries: currentAnniversaries.map(a => a.id === editingAnniversary.id ? data.anniversary : a)
            };
          } else {
            return {
              ...l,
              anniversaries: [data.anniversary, ...currentAnniversaries]
            };
          }
        }));
        setAnniversaryModalOpen(false);
        return true;
      } else {
        setErrorMessage(data.message || 'Failed to save special date');
        return false;
      }
    } catch (err) {
      setErrorMessage('Network error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnniversary = async (anniversaryId: string) => {
    if (!confirm('Are you sure you want to delete this special date?')) return;

    try {
      const res = await fetch(`/api/anniversaries/${anniversaryId}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.success) {
        setLists(prev => prev.map(l => {
          if (l.id !== activeListId) return l;
          const currentAnniversaries = l.anniversaries || [];
          return {
            ...l,
            anniversaries: currentAnniversaries.filter(a => a.id !== anniversaryId)
          };
        }));
      }
    } catch (err) {
      console.error('Delete anniversary error:', err);
    }
  };

  // Filter and Sort active tasks
  const filteredAndSortedTasks = useMemo(() => {
    if (!activeList) return [];

    let result = [...activeList.tasks];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    // 3. Priority Filter
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : (sortOrder === 'asc' ? Infinity : -Infinity);
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : (sortOrder === 'asc' ? Infinity : -Infinity);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (sortBy === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      let valA: any = a[sortBy as keyof Task];
      let valB: any = b[sortBy as keyof Task];

      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        valA = priorityWeight[a.priority as 'low' | 'medium' | 'high'] || 0;
        valB = priorityWeight[b.priority as 'low' | 'medium' | 'high'] || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [activeList, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Filter and Sort active anniversaries
  const filteredAndSortedAnniversaries = useMemo(() => {
    if (!activeList || activeList.type !== 'anniversary' || !activeList.anniversaries) return [];

    let result = [...activeList.anniversaries];

    // 1. Search Query Filter
    if (anniversarySearchQuery.trim()) {
      const q = anniversarySearchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // Helper to calculate days remaining
    const getDaysRemaining = (dateStr: string | Date) => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextOccurrence = new Date(today.getFullYear(), date.getMonth(), date.getDate());
      if (nextOccurrence < today) {
        nextOccurrence.setFullYear(today.getFullYear() + 1);
      }
      return Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    // 2. Sort
    result.sort((a, b) => {
      if (anniversarySortBy === 'nextOccurrence') {
        const daysA = getDaysRemaining(a.date);
        const daysB = getDaysRemaining(b.date);
        return anniversarySortOrder === 'asc' ? daysA - daysB : daysB - daysA;
      }

      if (anniversarySortBy === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const valA = dateA.getMonth() * 100 + dateA.getDate();
        const valB = dateB.getMonth() * 100 + dateB.getDate();
        return anniversarySortOrder === 'asc' ? valA - valB : valB - valA;
      }

      // Name sort
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return anniversarySortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return anniversarySortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [activeList, anniversarySearchQuery, anniversarySortBy, anniversarySortOrder]);

  const activeTasksCount = useMemo(() => {
    if (!activeList) return { total: 0, completed: 0, pending: 0 };
    const total = activeList.tasks.length;
    const completed = activeList.tasks.filter(t => t.status === 'completed').length;
    return {
      total,
      completed,
      pending: total - completed
    };
  }, [activeList]);

  const isAnniversaryActive = activeList?.type === 'anniversary';

  return (
    <div className="h-[100dvh] bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased transition-colors duration-300">
      <Sidebar
        user={currentUser}
        lists={lists}
        activeListId={activeListId}
        setActiveListId={setActiveListId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onCreateList={handleCreateList}
        onRenameList={handleRenameList}
        onDeleteList={handleDeleteList}
        isLoading={isLoading}
        isCreatingList={isCreatingList}
        setIsCreatingList={setIsCreatingList}
        onToggleUserReminders={handleToggleUserReminders}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Bar */}
            {activeListId && (
              <div className="relative max-w-xl w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder={isAnniversaryActive ? "Search special dates..." : "Search tasks..."}
                  value={isAnniversaryActive ? anniversarySearchQuery : searchQuery}
                  onChange={e => isAnniversaryActive ? setAnniversarySearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/60 border border-transparent focus:border-indigo-500 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-all placeholder-zinc-450"
                />
              </div>
            )}
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-455 text-sm flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!activeList ? (
            /* Empty State: No active list selected */
            <div className="h-[70vh] flex flex-col justify-center items-center text-center max-w-sm mx-auto">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 dark:from-indigo-950/40 border border-indigo-200 dark:border-indigo-900/30 text-indigo-655 flex items-center justify-center mb-6 shadow-inner">
                <Folder className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold tracking-tight mb-2">Welcome to TaskFlow</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Create a new list in the sidebar or select an existing one to begin organizing your workflow.
              </p>
              <button
                onClick={() => setIsCreatingList(true)}
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create a List
              </button>
            </div>
          ) : (
            /* Active list dashboard */
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* List Header & Stats */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-3">
                    {isAnniversaryActive ? (
                      <Calendar className="h-7 w-7 text-pink-500 shrink-0" />
                    ) : (
                      <Folder className="h-7 w-7 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {activeList.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    {isAnniversaryActive ? (
                      <span>{(activeList.anniversaries || []).length} special dates stored</span>
                    ) : (
                      <>
                        <span>{activeTasksCount.total} tasks total</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-305" />
                        <span>{activeTasksCount.completed} completed</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-305" />
                        <span>{activeTasksCount.pending} pending</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {isAnniversaryActive ? (
                    <button
                      onClick={handleOpenCreateAnniversary}
                      className="inline-flex items-center gap-2 py-2.5 px-4.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-xs font-bold text-white hover:from-violet-600 hover:to-indigo-600 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Date
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenCreateTask}
                      className="inline-flex items-center gap-2 py-2.5 px-4.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add Task
                    </button>
                  )}
                </div>
              </div>

              {isAnniversaryActive ? (
                <>
                  {/* Filtering, Sorting for Anniversary */}
                  <AnniversaryFilters
                    searchQuery={anniversarySearchQuery}
                    setSearchQuery={setAnniversarySearchQuery}
                    sortBy={anniversarySortBy}
                    setSortBy={setAnniversarySortBy}
                    sortOrder={anniversarySortOrder}
                    setSortOrder={setAnniversarySortOrder}
                  />

                  {/* Anniversary List */}
                  {filteredAndSortedAnniversaries.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-12 text-center shadow-sm">
                      <div className="h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-bold mb-1">No special dates found</h3>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        Add a new birthday, anniversary, or annual event to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredAndSortedAnniversaries.map(anniversary => (
                        <AnniversaryCard
                          key={anniversary.id}
                          anniversary={anniversary}
                          onEdit={handleOpenEditAnniversary}
                          onDelete={handleDeleteAnniversary}
                          mounted={mounted}
                          userRemindersEnabled={currentUser.emailRemindersEnabled}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Filtering, Sorting for Tasks */}
                  <TaskFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                  />

                  {/* Tasks List */}
                  {filteredAndSortedTasks.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-850 p-12 text-center shadow-sm">
                      <div className="h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-bold mb-1">No tasks found</h3>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        Try adjusting your filters, searching for something else, or add a new task to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredAndSortedTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={handleToggleTaskStatus}
                          onEdit={handleOpenEditTask}
                          onDelete={handleDeleteTask}
                          mounted={mounted}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        editingTask={editingTask}
        onSave={handleSaveTask}
        isLoading={isLoading}
      />

      <AnniversaryModal
        isOpen={anniversaryModalOpen}
        onClose={() => setAnniversaryModalOpen(false)}
        editingAnniversary={editingAnniversary}
        onSave={handleSaveAnniversary}
        isLoading={isLoading}
        userRemindersEnabled={currentUser.emailRemindersEnabled}
      />
    </div>
  );
}