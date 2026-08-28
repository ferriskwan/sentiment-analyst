import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw, Sparkles, Image as ImageIcon, GripVertical, Check } from 'lucide-react';
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

// Sortable Wrapper Component (Tablet Style)
interface SortableItemProps {
  id: string | number;
  index: number;
  imageUrl: string;
  title: string;
  author: string;
  onSelect: () => void;
}

function SortableItem({ id, index, imageUrl, title, author, onSelect }: SortableItemProps) {
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
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex flex-row items-center gap-4 sm:gap-6 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm ${isDragging ? 'opacity-90 ring-2 ring-black/5 shadow-lg scale-[1.01]' : 'hover:border-zinc-300 transition-all duration-200'}`}
    >
      {/* Rank Number */}
      <div className="w-12 sm:w-16 shrink-0 flex justify-center">
        <span className="font-serif italic text-3xl sm:text-4xl text-zinc-300 font-light tracking-tighter">
          {(index + 1).toString().padStart(2, '0')}
        </span>
      </div>

      {/* Thumbnail */}
      <div 
        className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-100 cursor-pointer shadow-sm" 
        onClick={onSelect}
      >
        <img src={imageUrl} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      </div>

      {/* Text Details */}
      <div className="flex-1 min-w-0 py-2">
        <h3 
          className="text-[11px] sm:text-sm font-bold text-gray-900 uppercase tracking-wider truncate mb-1 cursor-pointer hover:text-black" 
          onClick={onSelect}
        >
          {title || 'UNTITLED MEDIA CAPTURE'}
        </h3>
        <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
          SRC // {author}
        </p>
      </div>

      {/* Drag Handle */}
      <div className="w-12 shrink-0 flex justify-center">
        <div 
          {...attributes} 
          {...listeners}
          className="p-2 sm:p-3 cursor-grab active:cursor-grabbing hover:bg-zinc-50 rounded-lg transition-colors text-zinc-300 hover:text-zinc-500"
        >
          <GripVertical className="w-5 h-5" />
        </div>
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
  onSaveRanking?: () => void;
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
  onReorder,
  onSaveRanking,
  onRetry,
  error,
  totalResults,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveClick = () => {
    if (onSaveRanking) {
      onSaveRanking();
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

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
    <div className="space-y-8">
      {/* Results Header / Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-zinc-200/80 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
          ANALYSIS POOL ({itemsCount} SUBJECTS)
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-medium italic text-zinc-400 hidden sm:block">
            Drag items to rank by transaction likelihood
          </span>
          <button 
            onClick={handleSaveClick}
            disabled={isSaved}
            className={`flex items-center gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${
              isSaved 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50 cursor-pointer'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Saved
              </>
            ) : (
              'Save Ranking'
            )}
          </button>
        </div>
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
          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
            {mediaType === 'photos' ? (
              photos.map((photo, index) => (
                <SortableItem 
                  key={photo.id} 
                  id={photo.id} 
                  index={index}
                  imageUrl={photo.src.medium || photo.src.original}
                  title={photo.alt || `Visual Subject ${photo.id}`}
                  author={photo.photographer}
                  onSelect={() => onSelectPhoto(photo)}
                />
              ))
            ) : (
              videos.map((video, index) => (
                <SortableItem 
                  key={video.id} 
                  id={video.id} 
                  index={index}
                  imageUrl={video.image}
                  title={`Motion Subject ${video.id}`}
                  author={video.user.name}
                  onSelect={() => onSelectVideo(video)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Infinite Scroll Sentinel / Load More Container */}
      <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center">
        {isLoadingMore ? (
          <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
        ) : hasMore ? (
          <button
            id="load-more-btn"
            onClick={onLoadMore}
            className="px-6 py-2.5 bg-transparent border border-zinc-200 hover:border-zinc-400 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer hover:text-zinc-800"
          >
            Load More Results
          </button>
        ) : (
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            End of Collection
          </p>
        )}
      </div>
    </div>
  );
};
