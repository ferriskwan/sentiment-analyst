import React, { useState } from 'react';
import { Heart, Download, Eye, Maximize2, ExternalLink } from 'lucide-react';
import { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  isFavorite: boolean;
  onToggleFavorite: (photo: Photo) => void;
  onSelect: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const handleDownload = (e: React.MouseEvent, url: string, filenameSuffix: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `pexels-${photo.id}-${filenameSuffix}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadOpen(false);
  };

  return (
    <div
      id={`photo-card-${photo.id}`}
      onClick={() => onSelect(photo)}
      className="group relative rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer break-inside-avoid mb-4"
    >
      {/* Background color placeholder */}
      <div
        style={{ backgroundColor: photo.avg_color || '#E4E4E7' }}
        className="w-full relative"
      >
        <img
          src={photo.src.large}
          alt={photo.alt || 'Pexels stock photo'}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full object-cover transition-all duration-500 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0 h-64'
          }`}
        />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-between p-3.5 z-10">
        {/* Top bar: Photographer info & Favorite button */}
        <div className="flex items-center justify-between gap-2">
          <a
            href={photo.photographer_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 max-w-[70%] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-medium hover:bg-black/70 transition-colors"
            title={`View ${photo.photographer} on Pexels`}
          >
            <div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-900 flex items-center justify-center text-[10px] font-bold shrink-0">
              {photo.photographer ? photo.photographer.charAt(0) : 'P'}
            </div>
            <span className="truncate">{photo.photographer || 'Photographer'}</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
          </a>

          <button
            id={`fav-btn-photo-${photo.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(photo);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-black/40 text-white hover:bg-rose-500 hover:text-white'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom bar: Dimensions & Actions (View modal, Download) */}
        <div className="flex items-end justify-between gap-2">
          <div className="text-white space-y-0.5">
            <p className="text-xs font-semibold line-clamp-1 drop-shadow-xs">
              {photo.alt || 'Stock Photography'}
            </p>
            <p className="text-[11px] text-zinc-300 font-mono drop-shadow-xs flex items-center gap-1">
              <span>{photo.width} × {photo.height}</span>
              <span>•</span>
              <span className="capitalize">{photo.width > photo.height ? 'Landscape' : photo.height > photo.width ? 'Portrait' : 'Square'}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 relative">
            <button
              id={`view-photo-modal-${photo.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(photo);
              }}
              className="p-2 bg-white/90 hover:bg-white text-zinc-900 rounded-lg text-xs font-semibold backdrop-blur-md transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              title="Open full preview"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
              <button
                id={`download-photo-btn-${photo.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDownloadOpen(!downloadOpen);
                }}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                title="Download photo"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Quick Download Dropdown */}
              {downloadOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-30 text-zinc-900"
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                    Download Sizes
                  </div>
                  <button
                    onClick={(e) => handleDownload(e, photo.src.original, 'original')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 flex items-center justify-between cursor-pointer"
                  >
                    <span>Original</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Full Res</span>
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, photo.src.large2x, 'large')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 flex items-center justify-between cursor-pointer"
                  >
                    <span>Large</span>
                    <span className="text-[10px] text-zinc-400 font-mono">940w</span>
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, photo.src.medium, 'medium')}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 flex items-center justify-between cursor-pointer"
                  >
                    <span>Medium</span>
                    <span className="text-[10px] text-zinc-400 font-mono">350w</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
