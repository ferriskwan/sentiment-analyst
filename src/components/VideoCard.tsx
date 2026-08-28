import React, { useState, useRef } from 'react';
import { Heart, Download, Play, Maximize2, ExternalLink } from 'lucide-react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  isFavorite: boolean;
  onToggleFavorite: (video: Video) => void;
  onSelect: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const bestVideoFile =
    video.video_files.find((f) => f.quality === 'hd') ||
    video.video_files.find((f) => f.quality === 'sd') ||
    video.video_files[0];

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted or pending
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleDownload = (e: React.MouseEvent, url: string, quality: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `pexels-video-${video.id}-${quality}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadOpen(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id={`video-card-${video.id}`}
      onClick={() => onSelect(video)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer break-inside-avoid mb-4"
    >
      {/* Poster Image / Video Element */}
      <div className="relative w-full aspect-video bg-zinc-900 overflow-hidden">
        <img
          src={video.image}
          alt={`Video by ${video.user?.name || 'Creator'}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isHovered && bestVideoFile ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />

        {bestVideoFile && (
          <video
            ref={videoRef}
            src={bestVideoFile.link}
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Video Duration / Quality Badge (Always visible on bottom right of thumbnail) */}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono font-medium text-white flex items-center gap-1.5 z-5 pointer-events-none group-hover:opacity-0 transition-opacity">
          <Play className="w-2.5 h-2.5 fill-white" />
          <span>{formatDuration(video.duration)}</span>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-between p-3.5 z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <a
            href={video.user?.url || video.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 max-w-[70%] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-medium hover:bg-black/70 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-900 flex items-center justify-center text-[10px] font-bold shrink-0">
              {video.user?.name ? video.user.name.charAt(0) : 'V'}
            </div>
            <span className="truncate">{video.user?.name || 'Videographer'}</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
          </a>

          <button
            id={`fav-btn-video-${video.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(video);
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

        {/* Bottom bar */}
        <div className="flex items-end justify-between gap-2">
          <div className="text-white space-y-0.5">
            <p className="text-xs font-semibold line-clamp-1 drop-shadow-xs">
              {video.duration}s Video • {video.width} × {video.height}
            </p>
            <p className="text-[11px] text-zinc-300 font-mono drop-shadow-xs flex items-center gap-1">
              <span>{video.video_files.length} Quality options</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 relative">
            <button
              id={`view-video-modal-${video.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(video);
              }}
              className="p-2 bg-white/90 hover:bg-white text-zinc-900 rounded-lg text-xs font-semibold backdrop-blur-md transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              title="Open full video player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
              <button
                id={`download-video-btn-${video.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDownloadOpen(!downloadOpen);
                }}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                title="Download video"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Quick Download Dropdown */}
              {downloadOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-30 text-zinc-900"
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                    Video Files
                  </div>
                  {video.video_files.map((file) => (
                    <button
                      key={file.id}
                      onClick={(e) => handleDownload(e, file.link, `${file.quality}-${file.width}x${file.height}`)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 flex items-center justify-between cursor-pointer"
                    >
                      <span className="uppercase font-semibold">{file.quality}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {file.width ? `${file.width}x${file.height}` : file.file_type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
