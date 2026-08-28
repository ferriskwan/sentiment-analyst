import React from 'react';
import { RotateCcw, Check, Palette, Maximize, Smartphone, Monitor, Square } from 'lucide-react';
import { FilterState, OrientationFilter, SizeFilter, MediaType } from '../types';
import { COLOR_PALETTE } from '../data/fallbackMedia';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  mediaType: MediaType;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  mediaType,
}) => {
  const orientationOptions: { value: OrientationFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Orientations', icon: <Maximize className="w-3.5 h-3.5" /> },
    { value: 'landscape', label: 'Landscape (16:9)', icon: <Monitor className="w-3.5 h-3.5" /> },
    { value: 'portrait', label: 'Portrait (9:16)', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { value: 'square', label: 'Square (1:1)', icon: <Square className="w-3.5 h-3.5" /> },
  ];

  const sizeOptions: { value: SizeFilter; label: string; desc: string }[] = [
    { value: 'all', label: 'All Sizes', desc: 'Any resolution' },
    { value: 'large', label: 'Large', desc: '24MP / 4K UHD' },
    { value: 'medium', label: 'Medium', desc: '12MP / 1080p' },
    { value: 'small', label: 'Small', desc: '4MP / 720p' },
  ];

  const isFiltered =
    filters.orientation !== 'all' ||
    filters.size !== 'all' ||
    (filters.color !== 'all' && filters.color !== '');

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs transition-all space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-900">
            Refine Media Results
          </h3>
          <span className="text-[11px] text-zinc-400">
            ({mediaType === 'photos' ? 'Photos filters' : 'Video filters'})
          </span>
        </div>

        {isFiltered && (
          <button
            id="reset-filters-btn"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orientation Filter */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-2">Orientation</label>
          <div className="grid grid-cols-2 gap-1.5">
            {orientationOptions.map((opt) => {
              const active = filters.orientation === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`filter-orientation-${opt.value}`}
                  onClick={() => onFilterChange({ orientation: opt.value })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Filter */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-2">Size / Resolution</label>
          <div className="grid grid-cols-2 gap-1.5">
            {sizeOptions.map((opt) => {
              const active = filters.size === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`filter-size-${opt.value}`}
                  onClick={() => onFilterChange({ size: opt.value })}
                  className={`flex flex-col px-3 py-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
                  }`}
                >
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span
                    className={`text-[10px] ${
                      active ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette Filter (Mainly active for Photos) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-500" />
              Dominant Color
            </label>
            {filters.color && filters.color !== 'all' && (
              <span className="text-[11px] font-mono text-zinc-500 capitalize">
                {filters.color}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {COLOR_PALETTE.map((c) => {
              const active = filters.color === c.value || (!filters.color && c.value === 'all');
              if (c.value === 'all') {
                return (
                  <button
                    key={c.value}
                    id="filter-color-all"
                    onClick={() => onFilterChange({ color: 'all' })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer ${
                      active
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    All
                  </button>
                );
              }

              return (
                <button
                  key={c.value}
                  id={`filter-color-${c.value}`}
                  onClick={() => onFilterChange({ color: c.value })}
                  style={{ backgroundColor: c.hex }}
                  className={`w-6 h-6 rounded-full border border-black/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs ${
                    active ? 'ring-2 ring-offset-2 ring-zinc-900 scale-110' : ''
                  }`}
                  title={c.name}
                >
                  {active && (
                    <Check
                      className={`w-3 h-3 ${
                        c.value === 'white' || c.value === 'yellow'
                          ? 'text-zinc-900'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
