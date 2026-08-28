import React from 'react';
import { X, Heart, Trash2, ExternalLink, Download } from 'lucide-react';
import { FavoriteItem, Photo, Video } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onRemoveFavorite: (id: string) => void;
  onClearAll: () => void;
  onSelectMedia: (item: Photo | Video, type: 'photos' | 'videos') => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onClearAll,
  onSelectMedia,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="favorites-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        id="favorites-drawer"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 border-l border-zinc-200 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h2 className="text-sm font-bold text-zinc-900">Your Saved Favorites</h2>
            <span className="text-xs text-zinc-500 font-mono">({favorites.length})</span>
          </div>

          <div className="flex items-center gap-1">
            {favorites.length > 0 && (
              <button
                id="clear-all-favorites-btn"
                onClick={onClearAll}
                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Clear all favorites"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-favorites-drawer-btn"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-rose-300" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">No favorites saved yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Click the heart icon on any photo or video to save it here for quick access and downloads.
              </p>
            </div>
          ) : (
            favorites.map((fav) => {
              const isPhoto = fav.type === 'photos';
              const photo = isPhoto ? (fav.item as Photo) : null;
              const video = !isPhoto ? (fav.item as Video) : null;
              const thumb = isPhoto ? photo?.src.small : video?.image;
              const title = isPhoto ? photo?.alt || 'Stock Photo' : `Video by ${video?.user?.name}`;
              const creator = isPhoto ? photo?.photographer : video?.user?.name;

              return (
                <div
                  key={fav.id}
                  id={`fav-item-${fav.id}`}
                  onClick={() => onSelectMedia(fav.item, fav.type)}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 transition-all cursor-pointer group"
                >
                  <img
                    src={thumb}
                    alt={title}
                    className="w-14 h-14 object-cover rounded-lg bg-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-sm bg-zinc-100 text-zinc-600">
                        {fav.type}
                      </span>
                      <p className="text-xs font-semibold text-zinc-900 truncate">
                        {title}
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      By {creator}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(fav.id);
                      }}
                      className="p-1.5 text-zinc-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
