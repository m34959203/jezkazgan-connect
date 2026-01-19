import { useState, useRef } from 'react';
import { Video, X, Link as LinkIcon, Loader2, Play, Crown, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  onThumbnailChange?: (url: string) => void;
  thumbnail?: string;
  isPremium?: boolean;
  label?: string;
  className?: string;
}

// Extract video ID from various video platform URLs
function getVideoEmbedUrl(url: string): { embedUrl: string; thumbnail: string } | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      thumbnail: '', // Vimeo requires API call for thumbnail
    };
  }

  // Direct video URL
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
    return {
      embedUrl: url,
      thumbnail: '',
    };
  }

  return null;
}

export function VideoUpload({
  value,
  onChange,
  onThumbnailChange,
  thumbnail,
  isPremium = false,
  label = 'Видео (Business Premium)',
  className,
}: VideoUploadProps) {
  const [urlInputValue, setUrlInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleUrlSubmit = async () => {
    if (!urlInputValue.trim()) return;

    setIsValidating(true);
    setError(null);

    const videoInfo = getVideoEmbedUrl(urlInputValue.trim());

    if (!videoInfo) {
      setError('Неподдерживаемый формат видео. Используйте YouTube, Vimeo или прямую ссылку на видео.');
      setIsValidating(false);
      return;
    }

    onChange(urlInputValue.trim());

    // Set thumbnail if available
    if (videoInfo.thumbnail && onThumbnailChange) {
      onThumbnailChange(videoInfo.thumbnail);
    }

    setUrlInputValue('');
    setIsValidating(false);
  };

  const handleRemove = () => {
    onChange('');
    if (onThumbnailChange) {
      onThumbnailChange('');
    }
    setError(null);
  };

  // Not premium - show locked state
  if (!isPremium) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label className="flex items-center gap-2">
          {label}
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </Label>
        <div className="p-4 border-2 border-dashed rounded-lg bg-muted/30">
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="p-3 bg-amber-100 rounded-full mb-3">
              <Video className="h-6 w-6 text-amber-600" />
            </div>
            <p className="text-sm font-medium mb-1">Видео формат для событий</p>
            <p className="text-xs text-muted-foreground">
              Доступно в тарифе Business Premium
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="flex items-center gap-2">
        {label}
        <Badge variant="outline" className="text-green-700 border-green-300">
          Premium
        </Badge>
      </Label>

      {value ? (
        // Video preview
        <div className="relative rounded-lg overflow-hidden border bg-black">
          {/* Check if it's an embed or direct video */}
          {value.includes('youtube.com/embed') || value.includes('player.vimeo.com') ? (
            <iframe
              src={value.includes('embed') ? value : getVideoEmbedUrl(value)?.embedUrl}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="Video thumbnail"
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video bg-muted flex items-center justify-center">
                  <Play className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 bg-black/50 rounded-full">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
            {value.includes('youtube') ? 'YouTube' : value.includes('vimeo') ? 'Vimeo' : 'Видео'}
          </div>
        </div>
      ) : (
        // URL input
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=... или прямая ссылка"
                className="pl-9"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInputValue.trim() || isValidating}
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Добавить'
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Youtube className="w-4 h-4" />
              YouTube
            </span>
            <span>Vimeo</span>
            <span>MP4/WebM</span>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
