import { Check, Clock, Calendar, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => Promise<void>;
  mounted: boolean;
}

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

export default function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  mounted,
}: TaskCardProps) {
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
      className={`
        group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4.5 flex items-start justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700
        ${isCompleted ? 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200/60 opacity-70' : ''}
      `}
    >
      {/* Left check status toggle */}
      <button
        onClick={() => onToggleStatus(task)}
        className="mt-0.5 outline-none focus:outline-none shrink-0"
      >
        {isCompleted ? (
          <div className="h-5.5 w-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <Check className="h-3.5 w-3.5 stroke-[3px]" />
          </div>
        ) : isInProgress ? (
          <div className="h-5.5 w-5.5 rounded-full border-2 border-indigo-500 flex items-center justify-center hover:border-indigo-600 transition-colors">
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
          onClick={() => onEdit(task)}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          title="Edit task"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
