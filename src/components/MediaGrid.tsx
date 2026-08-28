import React, { useEffect, useRef } from 'react';
import { Loader2, AlertCircle, RefreshCw, Sparkles, Image as ImageIcon, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Photo, Video, MediaType, FavoriteItem } from '../types';
import { PhotoCard } from './PhotoCard';
import { VideoCard } from './VideoCard';

// Sortable Wrapper Component
interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  index: number;
}

function SortableItem({ id, children, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-start gap-4 ${isDragging ? 'opacity-70' : ''}`}>
      <div 
        {...attributes} 
        {...listeners}
        className="mt-4 p-2 bg-white rounded-lg shadow-sm border border-zinc-200 cursor-grab active:cursor-grabbing hover:bg-zinc-50 shrink-0"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-zinc-400">#{index + 1}</span>
          <GripVertical className="w-5 h-5 text-zinc-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

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
  onReorder?: (oldIndex: number, newIndex: number) => void;
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (mediaType === 'photos') {
        const oldIndex = photos.findIndex((p) => p.id === active.id);
        const newIndex = photos.findIndex((p) => p.id === over.id);
        if (onReorder && oldIndex !== -1 && newIndex !== -1) {
          onReorder(oldIndex, newIndex);
        }
      } else {
        const oldIndex = videos.findIndex((v) => v.id === active.id);
        const newIndex = videos.findIndex((v) => v.id === over.id);
        if (onReorder && oldIndex !== -1 && newIndex !== -1) {
          onReorder(oldIndex, newIndex);
        }
      }
    }
  };

  const itemIds = mediaType === 'photos' 
    ? photos.map(p => p.id) 
    : videos.map(v => v.id);

  return (
    <div className="space-y-6">
      {/* Results Header / Counter */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            {mediaType === 'photos' ? 'Ranked Photos' : 'Ranked Videos'}
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            ({itemsCount} loaded {totalResults ? `of ${totalResults.toLocaleString()}` : ''})
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 hidden sm:block">
          Drag to rank • Click for full preview
        </span>
      </div>

      {/* Media List: Sortable Vertical Rows */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {mediaType === 'photos' ? (
              photos.map((photo, index) => (
                <SortableItem key={photo.id} id={photo.id} index={index}>
                  <PhotoCard
                    photo={photo}
                    isFavorite={isFav(photo.id, 'photos')}
                    onToggleFavorite={onToggleFavorite}
                    onSelect={onSelectPhoto}
                  />
                </SortableItem>
              ))
            ) : (
              videos.map((video, index) => (
                <SortableItem key={video.id} id={video.id} index={index}>
                  <VideoCard
                    video={video}
                    isFavorite={isFav(video.id, 'videos')}
                    onToggleFavorite={onToggleFavorite}
                    onSelect={onSelectVideo}
                  />
                </SortableItem>
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

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
