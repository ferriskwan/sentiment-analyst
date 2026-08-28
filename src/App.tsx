import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryPills } from './components/CategoryPills';
import { FilterBar } from './components/FilterBar';
import { MediaGrid } from './components/MediaGrid';
import { MediaModal } from './components/MediaModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { ExportRankingsDrawer } from './components/ExportRankingsDrawer';
import { DisqusComments } from './components/DisqusComments';
import { Photo, Video, MediaType, FeedSection, FilterState, FavoriteItem } from './types';
import { FALLBACK_PHOTOS, FALLBACK_VIDEOS } from './data/fallbackMedia';

const INITIAL_FILTERS: FilterState = {
  orientation: 'all',
  size: 'all',
  color: 'all',
};

const FAVORITES_STORAGE_KEY = 'pexels_saved_favorites_v1';

export default function App() {
  const [mediaType, setMediaType] = useState<MediaType>('photos');
  const [section, setSection] = useState<FeedSection>('curated');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Data states
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Modal preview state
  const [selectedItem, setSelectedItem] = useState<Photo | Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to persist favorites:', e);
    }
  }, [favorites]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.orientation !== 'all') count++;
    if (filters.size !== 'all') count++;
    if (filters.color !== 'all' && filters.color !== '') count++;
    return count;
  }, [filters]);

  // Main fetch function for media
  const fetchMedia = useCallback(
    async (pageToFetch: number, isLoadMore = false) => {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      // Intercept and load saved ranking snapshot if it exists for this query
      if (pageToFetch === 1) {
        const payloadKey = `saved-payload-${mediaType}-${query || 'home'}`;
        const savedPayload = sessionStorage.getItem(payloadKey);
        if (savedPayload) {
          try {
            const parsed = JSON.parse(savedPayload);
            if (mediaType === 'photos') {
              setPhotos(parsed);
              setTotalResults(parsed.length);
            } else {
              setVideos(parsed);
              setTotalResults(parsed.length);
            }
            setHasMore(false); // Disable infinite scroll for saved snapshots
            setIsLoading(false);
            return;
          } catch (e) {
            console.error("Failed to parse saved ranking payload", e);
          }
        }
      }

      try {
        const params = new URLSearchParams();
        params.append('type', mediaType);
        params.append('section', section);
        params.append('page', '1'); // Force page 1 for limit of 10
        params.append('per_page', '10'); // Limit to 10

        if (query) {
          params.append('query', query);
        }
        if (filters.orientation !== 'all') {
          params.append('orientation', filters.orientation);
        }
        if (filters.size !== 'all') {
          params.append('size', filters.size);
        }
        if (filters.color !== 'all' && filters.color !== '') {
          params.append('color', filters.color);
        }

        const res = await fetch(`/api/media?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setHasApiKey(data.hasApiKey !== false);

        if (data.error && data.photos?.length === 0 && data.videos?.length === 0) {
          throw new Error(data.error);
        }

        // Handle live results or fallback demo data when API key is unconfigured
        if (mediaType === 'photos') {
          let fetchedPhotos: Photo[] = data.photos || [];
          if (!data.hasApiKey && fetchedPhotos.length === 0) {
            // Filter fallback photos locally
            fetchedPhotos = FALLBACK_PHOTOS.filter((p) => {
              if (query) {
                const q = query.toLowerCase();
                return p.alt.toLowerCase().includes(q) || p.photographer.toLowerCase().includes(q);
              }
              return true;
            });
          }

          const rankKey = `rank-photos-${query || 'home'}`;
          const savedRank = sessionStorage.getItem(rankKey);
          if (savedRank) {
            const rankArray = JSON.parse(savedRank);
            fetchedPhotos.sort((a, b) => {
              const indexA = rankArray.indexOf(a.id);
              const indexB = rankArray.indexOf(b.id);
              if (indexA === -1 && indexB === -1) return 0;
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            });
          }

          if (isLoadMore) {
            setPhotos((prev) => [...prev, ...fetchedPhotos]);
          } else {
            setPhotos(fetchedPhotos);
          }

          setTotalResults(Math.min(data.total_results || fetchedPhotos.length, 10));
          setHasMore(false); // Only top 10 items allowed
        } else {
          // Videos
          let fetchedVideos: Video[] = data.videos || [];
          if (!data.hasApiKey && fetchedVideos.length === 0) {
            fetchedVideos = FALLBACK_VIDEOS.filter((v) => {
              if (query) {
                const q = query.toLowerCase();
                return (v.user?.name || '').toLowerCase().includes(q);
              }
              return true;
            });
          }

          const rankKey = `rank-videos-${query || 'home'}`;
          const savedRank = sessionStorage.getItem(rankKey);
          if (savedRank) {
            const rankArray = JSON.parse(savedRank);
            fetchedVideos.sort((a, b) => {
              const indexA = rankArray.indexOf(a.id);
              const indexB = rankArray.indexOf(b.id);
              if (indexA === -1 && indexB === -1) return 0;
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            });
          }

          if (isLoadMore) {
            setVideos((prev) => [...prev, ...fetchedVideos]);
          } else {
            setVideos(fetchedVideos);
          }

          setTotalResults(Math.min(data.total_results || fetchedVideos.length, 10));
          setHasMore(false); // Only top 10 items allowed
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to retrieve media results.');
        // If error occurred and no data exists, supply fallback demo media
        if (!isLoadMore) {
          if (mediaType === 'photos') {
            setPhotos(FALLBACK_PHOTOS);
          } else {
            setVideos(FALLBACK_VIDEOS);
          }
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [mediaType, section, query, filters]
  );

  // Trigger initial or filter change fetch
  useEffect(() => {
    setPage(1);
    fetchMedia(1, false);
  }, [fetchMedia]);

  // Load next page
  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMedia(nextPage, true);
  };

  const handleReorder = useCallback((oldIndex: number, newIndex: number) => {
    if (mediaType === 'photos') {
      setPhotos((prev) => {
        const newArr = [...prev];
        const [moved] = newArr.splice(oldIndex, 1);
        newArr.splice(newIndex, 0, moved);
        const rankKey = `rank-photos-${query || 'home'}`;
        sessionStorage.setItem(rankKey, JSON.stringify(newArr.map(p => p.id)));
        return newArr;
      });
    } else {
      setVideos((prev) => {
        const newArr = [...prev];
        const [moved] = newArr.splice(oldIndex, 1);
        newArr.splice(newIndex, 0, moved);
        const rankKey = `rank-videos-${query || 'home'}`;
        sessionStorage.setItem(rankKey, JSON.stringify(newArr.map(v => v.id)));
        return newArr;
      });
    }
  }, [mediaType, query]);

  const handleSaveRanking = useCallback(() => {
    const payloadKey = `saved-payload-${mediaType}-${query || 'home'}`;
    if (mediaType === 'photos') {
      sessionStorage.setItem(payloadKey, JSON.stringify(photos));
    } else {
      sessionStorage.setItem(payloadKey, JSON.stringify(videos));
    }
  }, [mediaType, query, photos, videos]);

  // Search & Category handlers
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleClearSearch = () => {
    setQuery('');
  };

  const handleSelectCategory = (catQuery: string) => {
    setQuery(catQuery);
  };

  // Filter modifications
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Favorites handler
  const handleToggleFavorite = (item: Photo | Video) => {
    const itemType: MediaType = 'src' in item ? 'photos' : 'videos';
    const key = `${itemType.slice(0, -1)}-${item.id}`;

    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === key);
      if (exists) {
        return prev.filter((f) => f.id !== key);
      } else {
        return [{ id: key, type: itemType, item, savedAt: Date.now() }, ...prev];
      }
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAllFavorites = () => {
    setFavorites([]);
  };

  // Modal open & selection handlers
  const handleSelectPhoto = (photo: Photo) => {
    setSelectedItem(photo);
    setMediaType('photos');
    setIsModalOpen(true);
  };

  const handleSelectVideo = (video: Video) => {
    setSelectedItem(video);
    setMediaType('videos');
    setIsModalOpen(true);
  };

  const handleSelectFavoriteMedia = (item: Photo | Video, type: MediaType) => {
    setSelectedItem(item);
    setMediaType(type);
    setIsFavoritesOpen(false);
    setIsModalOpen(true);
  };

  // Related items for modal
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    if (mediaType === 'photos') {
      return photos.filter((p) => p.id !== selectedItem.id).slice(0, 8);
    } else {
      return videos.filter((v) => v.id !== selectedItem.id).slice(0, 8);
    }
  }, [selectedItem, mediaType, photos, videos]);

  const isCurrentItemFavorite = useMemo(() => {
    if (!selectedItem) return false;
    const key = `${mediaType.slice(0, -1)}-${selectedItem.id}`;
    return favorites.some((f) => f.id === key);
  }, [selectedItem, mediaType, favorites]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      {/* Primary Navigation & Section Tabs */}
      <Header
        mediaType={mediaType}
        setMediaType={setMediaType}
        section={section}
        setSection={(sec) => {
          setSection(sec);
          setQuery(''); // Reset query when exploring distinct sections
        }}
        favoriteCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
        {/* Search Bar & Instant Filter Trigger */}
        <div className="space-y-3">
          <SearchBar
            query={query}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            isFilterOpen={isFilterOpen}
            onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
            activeFilterCount={activeFilterCount}
          />

          {/* Category Quick Pills */}
          <CategoryPills
            selectedCategory={query}
            onSelectCategory={handleSelectCategory}
          />

          {/* Expandable Refinement Filter Bar */}
          {isFilterOpen && (
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              mediaType={mediaType}
            />
          )}
        </div>

        {/* Media Grid (Photos / Videos with Masonry & Live Infinite Scroll) */}
        <MediaGrid
          mediaType={mediaType}
          photos={photos}
          videos={videos}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectPhoto={handleSelectPhoto}
          onSelectVideo={handleSelectVideo}
          onReorder={handleReorder}
          onSaveRanking={handleSaveRanking}
          onRetry={() => fetchMedia(1, false)}
          error={error}
          totalResults={totalResults}
        />

        {/* Disqus Comments */}
        <div className="border-t border-gray-100 bg-white">
          <DisqusComments query={query} />
        </div>
      </main>

      {/* Full Preview Modal */}
      <MediaModal
        item={selectedItem}
        type={mediaType}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isFavorite={isCurrentItemFavorite}
        onToggleFavorite={handleToggleFavorite}
        relatedItems={relatedItems}
        onSelectRelated={(item) => setSelectedItem(item)}
      />

      {/* Favorites Slide-over Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onClearAll={handleClearAllFavorites}
        onSelectMedia={handleSelectFavoriteMedia}
      />

      {/* Export Rankings Drawer */}
      <ExportRankingsDrawer
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
