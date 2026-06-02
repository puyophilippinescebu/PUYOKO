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

export function normalizeLocation(loc: string): string {
  if (!loc) return '';
  const clean = loc.trim();
  const lower = clean.toLowerCase();
  
  // Spell checks & standardisations
  if (lower.includes('consolasion') || lower.includes('concolasion') || lower.includes('consolacion')) {
    return 'Consolacion, Cebu';
  }
  if (lower.includes('san fernando')) {
    return 'San Fernando, Cebu';
  }
  if (lower.includes('lapu-lapu') || lower.includes('lapulapu') || lower.includes('mactan')) {
    return 'Lapu-Lapu City, Cebu';
  }
  if (lower.includes('cebu city') || (lower.startsWith('cebu') && lower.endsWith('city'))) {
    return 'Cebu City, Cebu';
  }
  if (lower.includes('mandaue')) {
    return 'Mandaue City, Cebu';
  }
  if (lower.includes('talisay')) {
    return 'Talisay City, Cebu';
  }
  if (lower.includes('compostela')) {
    return 'Compostela, Cebu';
  }
  if (lower.includes('liloan')) {
    return 'Liloan, Cebu';
  }
  if (lower.includes('minglanilla')) {
    return 'Minglanilla, Cebu';
  }
  if (lower.includes('naga')) {
    return 'Naga City, Cebu';
  }
  if (lower.includes('carcar')) {
    return 'Carcar City, Cebu';
  }
  if (lower.includes('toledo')) {
    return 'Toledo City, Cebu';
  }
  if (lower.includes('balamban')) {
    return 'Balamban, Cebu';
  }
  if (lower.includes('danao')) {
    return 'Danao City, Cebu';
  }
  if (lower.includes('cordova')) {
    return 'Cordova, Cebu';
  }

  // Handle reversals: "Cebu, Consolacion" or "Cebu Consolacion"
  if (lower.startsWith('cebu') && clean.length > 4) {
    const rest = clean.substring(4).replace(/^[\s,:-]+/, '').trim();
    if (rest) {
      const capitalizedRest = rest.charAt(0).toUpperCase() + rest.slice(1);
      return `${capitalizedRest}, Cebu`;
    }
  }

  // Ensure comma formatting: "Consolacion Cebu" -> "Consolacion, Cebu"
  if (!clean.includes(',')) {
    if (lower.endsWith(' cebu')) {
      const main = clean.substring(0, clean.length - 5).trim();
      return `${main}, Cebu`;
    }
    return `${clean}, Cebu`;
  }

  const parts = clean.split(',').map(p => p.trim());
  if (parts.length === 2) {
    const main = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const region = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    return `${main}, ${region}`;
  }

  return clean;
}


