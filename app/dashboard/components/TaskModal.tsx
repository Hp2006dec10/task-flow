import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
  onSave: (taskData: {
    name: string;
    description: string | null;
    dueDate: string | null;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
  }) => Promise<boolean>;
  isLoading: boolean;
}

export default function TaskModal({
  isOpen,
  onClose,
  editingTask,
  onSave,
  isLoading,
}: TaskModalProps) {
  const [modalTaskName, setModalTaskName] = useState('');
  const [modalTaskDesc, setModalTaskDesc] = useState('');
  const [modalTaskDueDate, setModalTaskDueDate] = useState('');
  const [modalTaskPriority, setModalTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [modalTaskStatus, setModalTaskStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setModalTaskName(editingTask.name);
        setModalTaskDesc(editingTask.description || '');
        if (editingTask.dueDate) {
          const date = new Date(editingTask.dueDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          setModalTaskDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
        } else {
          setModalTaskDueDate('');
        }
        setModalTaskPriority(editingTask.priority as 'low' | 'medium' | 'high');
        setModalTaskStatus(editingTask.status as 'pending' | 'in_progress' | 'completed');
      } else {
        setModalTaskName('');
        setModalTaskDesc('');
        setModalTaskDueDate('');
        setModalTaskPriority('medium');
        setModalTaskStatus('pending');
      }
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTaskName.trim()) return;

    const payload = {
      name: modalTaskName.trim(),
      description: modalTaskDesc.trim() || null,
      dueDate: modalTaskDueDate ? new Date(modalTaskDueDate).toISOString() : null,
      priority: modalTaskPriority,
      status: modalTaskStatus,
    };

    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 dark:bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold">
            {editingTask ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="What needs to be done?"
              value={modalTaskName}
              onChange={e => setModalTaskName(e.target.value)}
              className="w-full bg-zinc-550 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-455 dark:text-zinc-500 mb-1.5">
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
              <div className="flex bg-zinc-550 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 gap-1">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setModalTaskPriority(p)}
                    className={`
                      flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all select-none
                      ${modalTaskPriority === p
                        ? 'bg-white dark:bg-zinc-750 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
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
            <div className="flex bg-zinc-550 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 gap-1">
              {(['pending', 'in_progress', 'completed'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setModalTaskStatus(s)}
                  className={`
                    flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all select-none
                    ${modalTaskStatus === s
                      ? 'bg-white dark:bg-zinc-750 text-indigo-600 dark:text-indigo-400 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
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
              onClick={onClose}
              className="py-2.5 px-4.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-550 dark:hover:bg-zinc-850 transition-colors"
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
  );
}
