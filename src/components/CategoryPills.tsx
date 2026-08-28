import React from 'react';
import { CATEGORIES } from '../data/fallbackMedia';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (categoryQuery: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-hidden py-1">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.query.toLowerCase() ||
            (cat.id === 'all' && !selectedCategory);

          return (
            <button
              key={cat.id}
              id={`cat-pill-${cat.id}`}
              onClick={() => onSelectCategory(cat.query)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs scale-105'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
