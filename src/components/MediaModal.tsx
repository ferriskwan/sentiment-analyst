import React, { useState } from 'react';
import {
  X,
  Heart,
  Download,
  Share2,
  ExternalLink,
  Info,
  ChevronDown,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { Photo, Video, MediaType } from '../types';

interface MediaModalProps {
  item: Photo | Video | null;
  type: MediaType;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (item: Photo | Video) => void;
  relatedItems: (Photo | Video)[];
  onSelectRelated: (item: Photo | Video) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  item,
  type,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  relatedItems,
  onSelectRelated,
}) => {
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const isPhoto = type === 'photos';
  const photo = isPhoto ? (item as Photo) : null;
  const video = !isPhoto ? (item as Video) : null;

  const creatorName = isPhoto ? photo?.photographer : video?.user?.name;
  const creatorUrl = isPhoto ? photo?.photographer_url : video?.user?.url || video?.url;
  const title = isPhoto ? photo?.alt || 'High-Resolution Stock Photo' : `Stock Video by ${creatorName}`;
  const width = item.width;
  const height = item.height;
  const avgColor = item.avg_color || '#27272A';

  const handleDownload = (url: string, suffix: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `pexels-${item.id}-${suffix}.${isPhoto ? 'jpg' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadDropdown(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="media-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="media-preview-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 text-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          {/* Creator Profile */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {creatorName ? creatorName.charAt(0) : 'P'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <a
                  href={creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold text-white hover:text-zinc-300 transition-colors truncate flex items-center gap-1"
                >
                  <span>{creatorName || 'Pexels Creator'}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                </a>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Free to use under Pexels License
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="modal-fav-btn"
              onClick={() => onToggleFavorite(item)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isFavorite
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-800'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">
                {isFavorite ? 'Saved' : 'Favorite'}
              </span>
            </button>

            <button
              id="modal-share-btn"
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Copy Pexels URL"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Download Dropdown */}
            <div className="relative">
              <button
                id="modal-download-primary-btn"
                onClick={() => setDownloadDropdown(!downloadDropdown)}
                className="px-3.5 py-2 bg-white text-zinc-950 hover:bg-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {downloadDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-2 z-40 text-zinc-200">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/80">
                    Select Resolution
                  </div>
                  {isPhoto && photo && (
                    <>
                      <button
                        onClick={() => handleDownload(photo.src.original, 'original')}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-semibold text-white">Original</span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {photo.width} × {photo.height}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDownload(photo.src.large2x, 'large')}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                      >
                        <span>Large</span>
                        <span className="text-[10px] font-mono text-zinc-400">940w</span>
                      </button>
                      <button
                        onClick={() => handleDownload(photo.src.medium, 'medium')}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                      >
                        <span>Medium</span>
                        <span className="text-[10px] font-mono text-zinc-400">350w</span>
                      </button>
                      <button
                        onClick={() => handleDownload(photo.src.small, 'small')}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                      >
                        <span>Small</span>
                        <span className="text-[10px] font-mono text-zinc-400">130w</span>
                      </button>
                    </>
                  )}

                  {!isPhoto && video && (
                    <>
                      {video.video_files.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => handleDownload(file.link, `${file.quality}-${file.width}x${file.height}`)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-semibold text-white uppercase">{file.quality}</span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {file.width ? `${file.width}×${file.height}` : file.file_type}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Close Modal */}
            <button
              id="close-media-modal-btn"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer ml-1"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Main Visual Display */}
          <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[300px] max-h-[62vh] border border-zinc-800">
            {isPhoto && photo && (
              <div className="relative max-h-[60vh] max-w-full flex items-center justify-center">
                <img
                  src={photo.src.large2x || photo.src.large}
                  alt={title}
                  className="max-h-[60vh] w-auto max-w-full object-contain mx-auto select-none"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                  <span className="text-white/40 text-4xl sm:text-6xl font-bold uppercase tracking-widest transform -rotate-45 drop-shadow-lg select-none whitespace-nowrap">
                    PEXELS VISUAL IMPACT
                  </span>
                </div>
              </div>
            )}

            {!isPhoto && video && (
              <video
                src={video.video_files.find((f) => f.quality === 'hd')?.link || video.video_files[0]?.link}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[60vh] w-auto max-w-full object-contain mx-auto"
              />
            )}
          </div>

          {/* Media Info & Tech Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                Title / Context
              </span>
              <span className="font-medium text-zinc-200 line-clamp-1">{title}</span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                Original Dimensions
              </span>
              <span className="font-mono text-zinc-200">{width} × {height} px</span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                Media Format
              </span>
              <span className="font-mono text-zinc-200">
                {isPhoto ? 'JPEG Image' : `${video?.duration}s MP4 Video`}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                Dominant Color
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  style={{ backgroundColor: avgColor }}
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                />
                <span className="font-mono text-zinc-300 uppercase">{avgColor}</span>
              </div>
            </div>
          </div>

          {/* Related Media Section */}
          {relatedItems.length > 0 && (
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold tracking-wide uppercase text-zinc-200">
                    Related {isPhoto ? 'Photos' : 'Videos'}
                  </h3>
                </div>
                <span className="text-xs text-zinc-500">Click to explore</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {relatedItems.slice(0, 6).map((rel) => {
                  const relPhoto = isPhoto ? (rel as Photo) : null;
                  const relVideo = !isPhoto ? (rel as Video) : null;
                  const relThumb = isPhoto ? relPhoto?.src.medium : relVideo?.image;

                  return (
                    <button
                      key={rel.id}
                      onClick={() => onSelectRelated(rel)}
                      className="group relative aspect-4/3 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/60 hover:border-white transition-all cursor-pointer"
                    >
                      <img
                        src={relThumb}
                        alt="Related media"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-sm">
                          View
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
