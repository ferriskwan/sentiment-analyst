import React, { useEffect, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Photo, Video, MediaType, FavoriteItem } from '../types';
import { PhotoCard } from './PhotoCard';
import { VideoCard } from './VideoCard';

interface MediaGridProps {
  mediaType: MediaType;
  photos: Photo[];
  videos: Video[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  favorites: FavoriteItem[];
  onToggleFavorite: (item: Photo | Video) => void;
  onSelectPhoto: (photo: Photo) => void;
  onSelectVideo: (video: Video) => void;
  onRetry: () => void;
  error: string | null;
  totalResults?: number;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  mediaType,
  photos,
  videos,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  favorites,
  onToggleFavorite,
  onSelectPhoto,
  onSelectVideo,
  onRetry,
  error,
  totalResults,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver for seamless Infinite Scrolling
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  const isFav = (id: number, type: MediaType) => {
    const key = `${type.slice(0, -1)}-${id}`;
    return favorites.some((f) => f.id === key);
  };

  if (isLoading && photos.length === 0 && videos.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mb-3" />
        <p className="text-sm font-semibold text-zinc-700">Retrieving high-res media...</p>
        <p className="text-xs text-zinc-400 mt-1">Connecting to Pexels visual network</p>
      </div>
    );
  }

  if (error && photos.length === 0 && videos.length === 0) {
    return (
      <div className="py-16 px-4 max-w-lg mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-sm font-bold text-zinc-900 mb-1">Failed to load media</h3>
        <p className="text-xs text-zinc-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const itemsCount = mediaType === 'photos' ? photos.length : videos.length;

  if (itemsCount === 0 && !isLoading) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
          <ImageIcon className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-bold text-zinc-900 mb-1">No media matches found</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Try adjusting your search query, clearing specific color filters, or switching categories.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Reset search & explore</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header / Counter */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            {mediaType === 'photos' ? 'Stock Photos' : 'Stock Videos'}
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            ({itemsCount} loaded {totalResults ? `of ${totalResults.toLocaleString()}` : ''})
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 hidden sm:block">
          Hover for creator & direct downloads • Click for full preview
        </span>
      </div>

      {/* Media Grid: Columns masonry for photos, Responsive grid for videos */}
      {mediaType === 'photos' ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isFavorite={isFav(photo.id, 'photos')}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectPhoto}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isFavorite={isFav(video.id, 'videos')}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectVideo}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel / Load More Container */}
      <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center">
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
            <span>Loading more live results from Pexels...</span>
          </div>
        ) : hasMore ? (
          <button
            id="load-more-btn"
            onClick={onLoadMore}
            className="px-6 py-2.5 bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-900 text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer hover:bg-zinc-50"
          >
            Load More Results
          </button>
        ) : (
          <p className="text-xs text-zinc-400 italic">
            You've reached the end of this collection
          </p>
        )}
      </div>
    </div>
  );
};
