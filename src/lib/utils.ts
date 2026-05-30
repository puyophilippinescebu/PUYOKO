import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ParsedVideo {
  type: 'youtube' | 'tiktok' | 'facebook';
  embedUrl: string;
  isVertical: boolean;
}

export function getVideoEmbedUrl(url: string): ParsedVideo | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. YouTube
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    let videoId = '';
    if (trimmed.includes('watch?v=')) {
      videoId = trimmed.split('watch?v=')[1]?.split('&')[0];
    } else if (trimmed.includes('youtu.be/')) {
      videoId = trimmed.split('youtu.be/')[1]?.split('?')[0];
    } else if (trimmed.includes('embed/')) {
      videoId = trimmed.split('embed/')[1]?.split('?')[0];
    } else if (trimmed.includes('shorts/')) {
      videoId = trimmed.split('shorts/')[1]?.split('?')[0];
    }
    return videoId ? { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${videoId}`, isVertical: trimmed.includes('shorts/') } : null;
  }

  // 2. TikTok
  if (trimmed.includes('tiktok.com')) {
    let videoId = '';
    if (trimmed.includes('/video/')) {
      videoId = trimmed.split('/video/')[1]?.split('?')[0];
    }
    return { 
      type: 'tiktok', 
      embedUrl: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : `https://www.tiktok.com/embed/v2/test`,
      isVertical: true 
    };
  }

  // 3. Facebook
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0&mute=0`,
      isVertical: false
    };
  }

  return null;
}

