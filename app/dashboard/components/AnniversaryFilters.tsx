import { Search, ArrowUpDown } from 'lucide-react';

interface AnniversaryFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export default function AnniversaryFilters({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: AnniversaryFiltersProps) {
  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      {/* Mobile/Desktop Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-405" />
        <input
          type="text"
          placeholder="Search special dates..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:bg-white placeholder-zinc-450"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Event Type Info */}
        <div className="text-xs text-zinc-450 dark:text-zinc-500 italic">
          Annual events & birthdays
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
              <option value="nextOccurrence">Days Remaining</option>
              <option value="date">Calendar Date</option>
              <option value="name">Name</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"
            title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
