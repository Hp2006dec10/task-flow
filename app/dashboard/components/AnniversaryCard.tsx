import { Edit2, Trash2, Bell, BellOff, Sparkles, Clock } from 'lucide-react';
import { Anniversary } from '../types';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  onEdit: (anniversary: Anniversary) => void;
  onDelete: (id: string) => Promise<void>;
  mounted: boolean;
  userRemindersEnabled: boolean;
}

const getAnniversaryLabel = (dateStr: string | Date | null) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  // Calculate next occurrence countdown
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextOccurrence = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (nextOccurrence < today) {
    nextOccurrence.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = nextOccurrence.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let countdownText = '';
  if (diffDays === 0) {
    countdownText = 'Today';
  } else if (diffDays === 1) {
    countdownText = 'Tomorrow';
  } else {
    countdownText = `In ${diffDays} days`;
  }

  return {
    dateText: `${month} ${day}`,
    countdownText: `(${countdownText})`,
    colorClass: diffDays === 0
      ? 'text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30'
      : 'text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30'
  };
};

export default function AnniversaryCard({
  anniversary,
  onEdit,
  onDelete,
  mounted,
  userRemindersEnabled,
}: AnniversaryCardProps) {
  const dateInfo = getAnniversaryLabel(anniversary.date);

  return (
    <div
      className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4.5 flex items-start justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
    >
      {/* Decorative Sparkles Icon */}
      <div className="mt-0.5 shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/30 text-pink-500">
        <Sparkles className="h-4.5 w-4.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold truncate pr-4 text-zinc-900 dark:text-zinc-50 mb-1">
          {anniversary.name}
        </h3>

        {anniversary.description && (
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mb-2.5 leading-relaxed break-words line-clamp-2">
            {anniversary.description}
          </p>
        )}

        {/* Date / Countdown Indicator */}
        {mounted && dateInfo && (
          <div className="flex items-center flex-nowrap gap-3">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-medium shrink-0 ${dateInfo.colorClass}`}>
              <Clock className="h-3 w-3" />
              <span>
                {dateInfo.dateText} <span className="hidden sm:inline">{dateInfo.countdownText}</span>
              </span>
            </div>

            {/* Email reminder status bell */}
            {anniversary.isImportant && userRemindersEnabled ? (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-pink-200 dark:border-pink-900/30 bg-pink-50/50 dark:bg-pink-950/10 text-[9px] font-semibold text-pink-600 dark:text-pink-400 shrink-0" title={`Reminder set at ${anniversary.reminderTime}`}>
                <Bell className="h-2.5 w-2.5" />
                <span>{anniversary.reminderTime}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-[9px] font-semibold text-zinc-400 shrink-0" title={anniversary.isImportant ? "Reminders disabled globally" : "Reminders muted for this event"}>
                <BellOff className="h-2.5 w-2.5" />
                <span>Muted</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 transition-opacity">
        <button
          onClick={() => onEdit(anniversary)}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          title="Edit date"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(anniversary.id)}
          className="p-2 rounded-xl text-zinc-400 hover:text-rose-650 dark:hover:text-rose-455 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          title="Delete date"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
