import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Anniversary } from '../types';

interface AnniversaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAnniversary: Anniversary | null;
  onSave: (data: {
    name: string;
    description: string | null;
    date: string;
    isImportant: boolean;
    reminderTime: '12 AM' | '8 AM';
  }) => Promise<boolean>;
  isLoading: boolean;
  userRemindersEnabled: boolean;
}

export default function AnniversaryModal({
  isOpen,
  onClose,
  editingAnniversary,
  onSave,
  isLoading,
  userRemindersEnabled,
}: AnniversaryModalProps) {
  const [modalName, setModalName] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalDate, setModalDate] = useState('');
  const [modalIsImportant, setModalIsImportant] = useState(true);
  const [modalReminderTime, setModalReminderTime] = useState<'12 AM' | '8 AM'>('8 AM');

  useEffect(() => {
    if (isOpen) {
      if (editingAnniversary) {
        setModalName(editingAnniversary.name);
        setModalDesc(editingAnniversary.description || '');
        if (editingAnniversary.date) {
          const dateObj = new Date(editingAnniversary.date);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          setModalDate(`${year}-${month}-${day}`);
        } else {
          setModalDate('');
        }
        setModalIsImportant(editingAnniversary.isImportant);
        setModalReminderTime(editingAnniversary.reminderTime as '12 AM' | '8 AM');
      } else {
        setModalName('');
        setModalDesc('');
        setModalDate('');
        // By default, set every date to be important during creation if user has not opted out entirely
        setModalIsImportant(userRemindersEnabled);
        setModalReminderTime('8 AM');
      }
    }
  }, [editingAnniversary, isOpen, userRemindersEnabled]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim() || !modalDate) return;

    await onSave({
      name: modalName.trim(),
      description: modalDesc.trim() || null,
      date: new Date(modalDate).toISOString(),
      isImportant: modalIsImportant,
      reminderTime: modalReminderTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 dark:bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold">
            {editingAnniversary ? 'Edit Special Date' : 'Create Special Date'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 animate-fade-in">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., Mom's Birthday, Wedding Anniversary"
              value={modalName}
              onChange={e => setModalName(e.target.value)}
              className="w-full bg-zinc-550 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Add notes (e.g., gift ideas, location)..."
              value={modalDesc}
              onChange={e => setModalDesc(e.target.value)}
              rows={3}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-455 dark:text-zinc-500 mb-1.5">
              Date *
            </label>
            <input
              type="date"
              required
              value={modalDate}
              onChange={e => setModalDate(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-550 cursor-pointer"
            />
          </div>

          {/* Email reminder fields */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="modalIsImportant"
                checked={modalIsImportant}
                onChange={e => setModalIsImportant(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-550 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="modalIsImportant" className="text-xs font-semibold text-zinc-755 dark:text-zinc-300 cursor-pointer select-none">
                Send Email Reminder (Mark as Important)
              </label>
            </div>
            
            {/* Global toggle warnings if reminders are disabled globally */}
            {!userRemindersEnabled && modalIsImportant && (
              <p className="text-[10px] text-amber-600 dark:text-amber-450 font-medium ml-6 mb-2">
                Note: Global email reminders are currently disabled in your sidebar profile settings.
              </p>
            )}

            {/* Reminder Time Selection */}
            {modalIsImportant && (
              <div className="ml-6 animate-slide-up">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
                  Reminder Hour (IST Timezone)
                </label>
                <div className="flex bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 gap-1 max-w-xs">
                  {(['12 AM', '8 AM'] as const).map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setModalReminderTime(time)}
                      className={`
                        flex-1 py-1 text-xs font-semibold rounded-lg transition-all select-none
                        ${modalReminderTime === time
                          ? 'bg-white dark:bg-zinc-750 text-indigo-650 dark:text-indigo-400 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50'
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
              <span>{editingAnniversary ? 'Save Changes' : 'Add Special Date'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
