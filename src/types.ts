export interface PhotoSource {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color?: string;
  src: PhotoSource;
  alt: string;
  liked?: boolean;
}

export interface VideoFile {
  id: number;
  quality: 'hd' | 'sd' | 'uhd' | string;
  file_type: string;
  width: number | null;
  height: number | null;
  fps?: number;
  link: string;
}

export interface VideoPicture {
  id: number;
  picture: string;
  nr: number;
}

export interface VideoUser {
  id: number;
  name: string;
  url: string;
}

export interface Video {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string; // Thumbnail preview poster
  user: VideoUser;
  video_files: VideoFile[];
  video_pictures: VideoPicture[];
  avg_color?: string;
}

export type MediaType = 'photos' | 'videos';
export type FeedSection = 'curated' | 'popular' | 'trending' | 'discover';
export type OrientationFilter = 'all' | 'landscape' | 'portrait' | 'square';
export type SizeFilter = 'all' | 'large' | 'medium' | 'small';

export interface FilterState {
  orientation: OrientationFilter;
  size: SizeFilter;
  color: string;
}

export interface FavoriteItem {
  id: string; // 'photo-123' or 'video-456'
  type: MediaType;
  item: Photo | Video;
  savedAt: number;
}
