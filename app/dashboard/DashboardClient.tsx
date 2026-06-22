'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckSquare, Plus, Folder, FolderPlus, Edit2, Trash2, Calendar,
  AlertCircle, CheckCircle2, Clock, ArrowUpDown, Sun, Moon, LogOut,
  User, X, Search, ChevronRight, Check, AlertTriangle, Loader2, Menu
} from 'lucide-react';
import { logoutAction } from '@/app/actions/logout';

interface Task {
  id: string;
  name: string;
  description: string | null;
  dueDate: string | Date | null;
  priority: string;
  status: string;
  userId: string;
  listId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface List {
  id: string;
  name: string;
  userId: string;
  tasks: Task[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

interface DashboardClientProps {
  user: UserInfo;
  initialLists: List[];
}

export default function DashboardClient({ user, initialLists }: DashboardClientProps) {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>(initialLists);
  const [activeListId, setActiveListId] = useState<string | null>(
    initialLists.length > 0 ? initialLists[0].id : null
  );

  // App settings & state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Filter/Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, in_progress, completed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, low, medium, high
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, dueDate, priority, name
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Inline List Edit States
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState('');

  // Modals States
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalTaskName, setModalTaskName] = useState('');
  const [modalTaskDesc, setModalTaskDesc] = useState('');
  const [modalTaskDueDate, setModalTaskDueDate] = useState('');
  const [modalTaskPriority, setModalTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [modalTaskStatus, setModalTaskStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');

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
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setLists(prev => [...prev, data.list]);
        setActiveListId(data.list.id);
        setNewListName('');
        setIsCreatingList(false);
      } else {
        setErrorMessage(data.message || 'Failed to create list');
      }
    } catch (err) {
      setErrorMessage('Network error, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameList = async (listId: string) => {
    if (!editListName.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editListName.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setLists(prev => prev.map(l => l.id === listId ? { ...l, name: data.list.name } : l));
        setEditingListId(null);
      } else {
        setErrorMessage(data.message || 'Failed to rename list');
      }
    } catch (err) {
      setErrorMessage('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list? This will also permanently delete all tasks in it.')) {
      return;
    }

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
      } else {
        setErrorMessage(data.message || 'Failed to delete list');
      }
    } catch (err) {
      setErrorMessage('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // Task Operations
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setModalTaskName('');
    setModalTaskDesc('');
    setModalTaskDueDate('');
    setModalTaskPriority('medium');
    setModalTaskStatus('pending');
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setModalTaskName(task.name);
    setModalTaskDesc(task.description || '');
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setModalTaskDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setModalTaskDueDate('');
    }
    setModalTaskPriority(task.priority as any);
    setModalTaskStatus(task.status as any);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTaskName.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    const payload = {
      name: modalTaskName.trim(),
      description: modalTaskDesc.trim() || null,
      dueDate: modalTaskDueDate ? new Date(modalTaskDueDate).toISOString() : null,
      priority: modalTaskPriority,
      status: modalTaskStatus,
      listId: activeListId,
    };

    try {
      let res;
      if (editingTask) {
        res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
      } else {
        setErrorMessage(data.message || 'Failed to save task');
      }
    } catch (err) {
      setErrorMessage('Network error');
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

  // Date styling helper
  const getDueDateLabel = (dueDateStr: string | Date | null) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    
    // Create a copy to check the date-only values for today/tomorrow/yesterday
    const dueMidnight = new Date(due);
    dueMidnight.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isOverdue = dueMidnight < today;

    // Formatting date
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (due.getFullYear() !== today.getFullYear()) {
      options.year = '2-digit';
    }

    const formattedDate = due.toLocaleDateString('en-US', options);
    
    // Formatting time
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    const formattedTime = due.toLocaleTimeString('en-US', timeOptions);
    const timeStr = ` at ${formattedTime}`;

    if (dueMidnight.getTime() === today.getTime()) {
      return { text: `Today${timeStr}`, colorClass: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30', isOverdue: false };
    } else if (dueMidnight.getTime() === tomorrow.getTime()) {
      return { text: `Tomorrow${timeStr}`, colorClass: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30', isOverdue: false };
    } else if (dueMidnight.getTime() === yesterday.getTime()) {
      return { text: `Yesterday${timeStr}`, colorClass: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30', isOverdue: true };
    } else {
      return {
        text: `${formattedDate}${timeStr}`,
        colorClass: isOverdue
          ? 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
          : 'text-zinc-650 bg-zinc-100 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/30',
        isOverdue
      };
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

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased transition-colors duration-300">
      {/* Sidebar - Collapsible on Mobile */}
      <aside className={`
        ${sidebarOpen ? 'flex' : 'hidden md:flex'}
        fixed inset-0 z-30 md:static w-full md:w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col shrink-0 shadow-lg md:shadow-none transition-all duration-300
      `}>
        {/* Sidebar Header */}
        <div className="h-16 border-b border-zinc-150 dark:border-zinc-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-650 to-indigo-650 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info (Sidebar) */}
        <div className="px-6 py-4 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-850 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{user.name}</h4>
              <p className="text-xs text-zinc-550 dark:text-zinc-450 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Lists Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
              <span>My Lists</span>
              <button
                onClick={() => setIsCreatingList(true)}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Create New List"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>

            {/* List Create Inline Input */}
            {isCreatingList && (
              <form onSubmit={handleCreateList} className="flex items-center gap-2 p-1.5 rounded-lg border border-indigo-200 bg-indigo-50/30 dark:border-indigo-900/30 dark:bg-indigo-950/10">
                <Folder className="h-4 w-4 text-indigo-500 shrink-0" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="List name..."
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-full py-0.5 px-1 focus:ring-0 placeholder-zinc-405"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingList(false)}
                  className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </form>
            )}

            {/* Lists List */}
            {lists.length === 0 ? (
              <p className="text-xs text-zinc-400 px-2 py-4 italic">No lists created yet.</p>
            ) : (
              <div className="space-y-1">
                {lists.map(list => {
                  const isActive = list.id === activeListId;
                  const isEditing = list.id === editingListId;
                  const uncompletedCount = list.tasks.filter(t => t.status !== 'completed').length;

                  return (
                    <div
                      key={list.id}
                      className={`
                        group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200
                        ${isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-medium'
                          : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 text-zinc-650 dark:text-zinc-400'}
                      `}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                          <Folder className="h-4 w-4 text-zinc-400" />
                          <input
                            type="text"
                            autoFocus
                            value={editListName}
                            onChange={e => setEditListName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRenameList(list.id);
                              if (e.key === 'Escape') setEditingListId(null);
                            }}
                            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-550"
                          />
                          <button
                            onClick={() => handleRenameList(list.id)}
                            className="p-0.5 text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingListId(null)}
                            className="p-0.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setActiveListId(list.id);
                              setSidebarOpen(false); // Close drawer on mobile
                            }}
                            className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                          >
                            <Folder className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-indigo-650 dark:text-indigo-400' : 'text-zinc-400'}`} />
                            <span className="truncate pr-8">{list.name}</span>
                          </button>

                          {/* Task Badge / Controls */}
                          <div className="absolute right-3 flex items-center gap-1.5">
                            {uncompletedCount > 0 && !isActive && (
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-750 dark:text-zinc-400 rounded-full shrink-0">
                                {uncompletedCount}
                              </span>
                            )}

                            {/* Options always visible */}
                            <div className="flex items-center bg-transparent backdrop-blur-sm pl-2">
                              <button
                                onClick={() => {
                                  setEditingListId(list.id);
                                  setEditListName(list.name);
                                }}
                                className="p-1 rounded text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-colors"
                                title="Rename"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteList(list.id)}
                                className="p-1 rounded text-zinc-450 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer (Sign Out) */}
        <div className="p-4 border-t border-zinc-150 dark:border-zinc-800">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-750 dark:text-zinc-350 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Task Search Bar */}
            {activeListId && (
              <div className="relative max-w-xl w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/60 border border-transparent focus:border-indigo-500 rounded-xl py-1.5 pl-9 pr-4 text-xs focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-all placeholder-zinc-450"
                />
              </div>
            )}
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-450 text-sm flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!activeList ? (
            /* Empty State: No active list selected */
            <div className="h-[70vh] flex flex-col justify-center items-center text-center max-w-sm mx-auto">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-violet-650/10 to-indigo-650/10 dark:from-indigo-950/40 border border-indigo-200 dark:border-indigo-900/30 text-indigo-655 flex items-center justify-center mb-6 shadow-inner">
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
            /* Active list tasks dashboard */
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* List Header & Stats */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-3">
                    <Folder className="h-7 w-7 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {activeList.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span>{activeTasksCount.total} tasks total</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-305" />
                    <span>{activeTasksCount.completed} completed</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-305" />
                    <span>{activeTasksCount.pending} pending</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleOpenCreateTask}
                    className="inline-flex items-center gap-2 py-2.5 px-4.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </button>
                </div>
              </div>

              {/* Filtering, Sorting, and Mobile Search */}
              <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="sm:hidden relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-550"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Left: Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Status:</span>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-550 cursor-pointer"
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Priority filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Priority:</span>
                      <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-550 cursor-pointer"
                      >
                        <option value="all">All</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Right: Sorting */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-550 cursor-pointer"
                      >
                        <option value="createdAt">Date Created</option>
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="name">Name</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border border-zinc-205 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"
                      title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

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
                  {filteredAndSortedTasks.map(task => {
                    const isCompleted = task.status === 'completed';
                    const isInProgress = task.status === 'in_progress';
                    const dueDateInfo = getDueDateLabel(task.dueDate);

                    // Priority Badge styles
                    const priorityStyles: Record<string, string> = {
                      high: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450',
                      medium: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-405',
                      low: 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400',
                    };

                    return (
                      <div
                        key={task.id}
                        className={`
                          group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4.5 flex items-start justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700
                          ${isCompleted ? 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200/60 opacity-70' : ''}
                        `}
                      >
                        {/* Left check status toggle */}
                        <button
                          onClick={() => handleToggleTaskStatus(task)}
                          className="mt-0.5 outline-none focus:outline-none shrink-0"
                        >
                          {isCompleted ? (
                            <div className="h-5.5 w-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                              <Check className="h-3.5 w-3.5 stroke-[3px]" />
                            </div>
                          ) : isInProgress ? (
                            <div className="h-5.5 w-5.5 rounded-full border-2 border-indigo-500 flex items-center justify-center hover:border-indigo-650 transition-colors">
                              <Clock className="h-3 w-3 text-indigo-500" />
                            </div>
                          ) : (
                            <div className="h-5.5 w-5.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors" />
                          )}
                        </button>

                        {/* Mid Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`
                              text-sm font-bold truncate pr-4 text-zinc-900 dark:text-zinc-50
                              ${isCompleted ? 'line-through text-zinc-400 dark:text-zinc-500 font-medium' : ''}
                            `}>
                              {task.name}
                            </h3>

                            {/* Priority Badge */}
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide select-none shrink-0 ${priorityStyles[task.priority] || ''}`}>
                              {task.priority}
                            </span>

                            {/* Status label if in progress */}
                            {isInProgress && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wide shrink-0">
                                In Progress
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className={`
                              text-xs text-zinc-500 dark:text-zinc-400 mb-2.5 leading-relaxed break-words line-clamp-2
                              ${isCompleted ? 'text-zinc-400 dark:text-zinc-500' : ''}
                            `}>
                              {task.description}
                            </p>
                          )}

                          {/* Due Date Indicator */}
                          {mounted && dueDateInfo && (
                            <div className="flex items-center gap-3">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-medium shrink-0 ${dueDateInfo.colorClass}`}>
                                <Calendar className="h-3 w-3" />
                                <span>{dueDateInfo.text}</span>
                              </div>
                              {dueDateInfo.isOverdue && !isCompleted && (
                                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-455 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  Overdue
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right Actions always visible */}
                        <div className="flex items-center gap-1 transition-opacity">
                          <button
                            onClick={() => handleOpenEditTask(task)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            title="Edit task"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            title="Delete task"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Task Modal (Add/Edit) */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 dark:bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90dvh]">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h2>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTask} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  value={modalTaskName}
                  onChange={e => setModalTaskName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Add notes..."
                  value={modalTaskDesc}
                  onChange={e => setModalTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={modalTaskDueDate}
                    onChange={e => setModalTaskDueDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
                    Priority
                  </label>
                  <div className="flex bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 gap-1">
                    {(['low', 'medium', 'high'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setModalTaskPriority(p)}
                        className={`
                          flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all select-none
                          ${modalTaskPriority === p
                            ? 'bg-white dark:bg-zinc-750 text-indigo-650 dark:text-indigo-400 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}
                        `}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
                  Status
                </label>
                <div className="flex bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 gap-1">
                  {(['pending', 'in_progress', 'completed'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setModalTaskStatus(s)}
                      className={`
                        flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all select-none
                        ${modalTaskStatus === s
                          ? 'bg-white dark:bg-zinc-750 text-indigo-650 dark:text-indigo-400 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}
                      `}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="py-2.5 px-4.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                  <span>{editingTask ? 'Save Changes' : 'Add Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
