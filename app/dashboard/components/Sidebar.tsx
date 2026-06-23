import { useState } from 'react';
import {
  Folder, FolderPlus, Edit2, Trash2, LogOut, User, X, Check, Calendar
} from 'lucide-react';
import { logoutAction } from '@/app/actions/logout';
import { List, UserInfo } from '../types';

interface SidebarProps {
  user: UserInfo;
  lists: List[];
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onCreateList: (name: string) => Promise<boolean>;
  onRenameList: (listId: string, newName: string) => Promise<boolean>;
  onDeleteList: (listId: string) => Promise<boolean>;
  isLoading: boolean;
  isCreatingList: boolean;
  setIsCreatingList: (creating: boolean) => void;
  onToggleUserReminders: (enabled: boolean) => Promise<void>;
}

export default function Sidebar({
  user,
  lists,
  activeListId,
  setActiveListId,
  sidebarOpen,
  setSidebarOpen,
  onCreateList,
  onRenameList,
  onDeleteList,
  isLoading,
  isCreatingList,
  setIsCreatingList,
  onToggleUserReminders,
}: SidebarProps) {
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const success = await onCreateList(newListName);
    if (success) {
      setNewListName('');
      setIsCreatingList(false);
    }
  };

  const handleRenameSubmit = async (listId: string) => {
    if (!editListName.trim()) return;

    const success = await onRenameList(listId, editListName);
    if (success) {
      setEditingListId(null);
    }
  };

  return (
    <aside className={`
      ${sidebarOpen ? 'flex' : 'hidden md:flex'}
      fixed inset-0 z-30 md:static w-full md:w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex-col shrink-0 shadow-lg md:shadow-none transition-all duration-300
    `}>
      {/* Sidebar Header */}
      <div className="h-16 border-b border-zinc-150 dark:border-zinc-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/icon.png" alt="TaskFlow Logo" className="h-9 w-9 rounded-lg object-cover shadow-md shadow-indigo-600/10" />
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
      <div className="px-6 py-4 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-850 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate">{user.name}</h4>
            <p className="text-xs text-zinc-550 dark:text-zinc-450 truncate">{user.email}</p>
          </div>
        </div>

        {/* Global email reminders toggle */}
        <div className="flex items-center gap-2 mt-1.5 px-0.5">
          <input
            type="checkbox"
            id="emailRemindersToggle"
            checked={user.emailRemindersEnabled}
            onChange={(e) => onToggleUserReminders(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
          />
          <label htmlFor="emailRemindersToggle" className="text-[10px] font-bold text-zinc-500 dark:text-zinc-450 cursor-pointer select-none uppercase tracking-wider">
            Email Reminders
          </label>
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
            <form onSubmit={handleCreateSubmit} className="flex items-center gap-2 p-1.5 rounded-lg border border-indigo-200 bg-indigo-50/30 dark:border-indigo-900/30 dark:bg-indigo-950/10">
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
                const isAnniversary = list.type === 'anniversary';

                return (
                  <div
                    key={list.id}
                    className={`
                      group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200
                      ${isActive
                        ? 'bg-indigo-550 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-medium'
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
                            if (e.key === 'Enter') handleRenameSubmit(list.id);
                            if (e.key === 'Escape') setEditingListId(null);
                          }}
                          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-indigo-550"
                        />
                        <button
                          onClick={() => handleRenameSubmit(list.id)}
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
                          {isAnniversary ? (
                            <Calendar className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-pink-500'}`} />
                          ) : (
                            <Folder className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                          )}
                          <span className="truncate pr-8">{list.name}</span>
                        </button>

                        {/* Task Badge / Controls (hidden for system anniversaries list) */}
                        {!isAnniversary && (
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
                                onClick={() => onDeleteList(list.id)}
                                className="p-1 rounded text-zinc-450 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
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
  );
}
