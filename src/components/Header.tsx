import React from 'react';
import { Camera, Film, Heart, Sparkles, Compass, Flame, Award, Key, Database } from 'lucide-react';
import { MediaType, FeedSection } from '../types';

interface HeaderProps {
  mediaType: MediaType;
  setMediaType: (type: MediaType) => void;
  section: FeedSection;
  setSection: (section: FeedSection) => void;
  favoriteCount: number;
  onOpenFavorites: () => void;
  onOpenExport: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mediaType,
  setMediaType,
  section,
  setSection,
  favoriteCount,
  onOpenFavorites,
  onOpenExport,
  hasApiKey,
}) => {
  const sections: { id: FeedSection; label: string; icon: React.ReactNode }[] = [
    { id: 'curated', label: 'Curated', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'popular', label: 'Popular', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'trending', label: 'Trending', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'discover', label: 'Discover', icon: <Compass className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
      {/* Top tier brand bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-950 text-white rounded-lg flex items-center justify-center shadow-xs">
              <span className="font-display font-bold text-lg">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 font-sans">
                  Pexels Visual Impact
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-zinc-100 text-zinc-600 border border-zinc-200">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                High-resolution stock photography & cinematography
              </p>
            </div>
          </div>

          {/* Media Type Switcher: Photos vs Videos */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              id="photos-type-btn"
              onClick={() => setMediaType('photos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                mediaType === 'photos'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photos</span>
            </button>
            <button
              id="videos-type-btn"
              onClick={() => setMediaType('videos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                mediaType === 'videos'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>
          </div>

          {/* Right Action Tools: API Status + Actions */}
          <div className="flex items-center gap-2.5">
            {!hasApiKey && (
              <div
                title="PEXELS_API_KEY can be added in Settings. Showing curated demo stock media."
                className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
              >
                <Key className="w-3 h-3 text-amber-600" />
                <span>Curated Stock Mode</span>
              </div>
            )}

            <button
              onClick={onOpenExport}
              className="relative p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-200 flex items-center gap-1.5 text-xs font-semibold"
              title="View and export check-out"
            >
              <Database className="w-4 h-4 text-zinc-500" />
              <span className="hidden sm:inline">Check-out</span>
            </button>

            <button
              id="favorites-drawer-btn"
              onClick={onOpenFavorites}
              className="relative p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-200 flex items-center gap-1.5 text-xs font-semibold"
              title="View your saved favorites"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
              <span className="hidden sm:inline">Favorites</span>
              {favoriteCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full min-w-[18px]">
                  {favoriteCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 border-t border-gray-100">
          {sections.map((sec) => {
            const isActive = section === sec.id;
            return (
              <button
                key={sec.id}
                id={`section-tab-${sec.id}`}
                onClick={() => setSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {sec.icon}
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
