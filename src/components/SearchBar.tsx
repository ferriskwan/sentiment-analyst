import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  onClear: () => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  activeFilterCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onSearch,
  onClear,
  isFilterOpen,
  onToggleFilter,
  activeFilterCount,
}) => {
  const [inputValue, setInputValue] = useState(query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue('');
    onClear();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="media-search-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search high-res stock photos & videos (e.g. Nature, Architecture, Coffee, Sunset)..."
            className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-zinc-200 rounded-xl shadow-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400 transition-all"
          />
          {inputValue && (
            <button
              type="button"
              id="clear-search-btn"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          id="submit-search-btn"
          className="hidden sm:inline-flex items-center justify-center px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          Search
        </button>

        <button
          type="button"
          id="toggle-filters-btn"
          onClick={onToggleFilter}
          className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
            isFilterOpen || activeFilterCount > 0
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
          }`}
          title="Toggle Orientation, Size & Color Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden md:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span
              className={`inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                isFilterOpen || activeFilterCount > 0
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-900 text-white'
              }`}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
