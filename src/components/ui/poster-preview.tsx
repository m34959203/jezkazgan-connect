import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AiBadge } from '@/components/ui/ai-badge';
import { cn } from '@/lib/utils';

export interface PosterDetails {
  title: string;
  tagline: string;
  date: string;
  location: string;
  description: string;
  theme: string;
}

export interface GeneratedPoster {
  imageUrl: string;
  details: PosterDetails;
  isAiGenerated?: boolean;
}

interface PosterPreviewProps {
  poster: GeneratedPoster;
  onDownload?: () => void;
  onShare?: () => void;
  onUse?: () => void;
  className?: string;
}

// Theme color mapping for visual consistency
const THEME_COLORS: Record<string, { badge: string; accent: string }> = {
  'Modern Nomad': { badge: 'bg-primary', accent: 'text-primary' },
  'Urban Pulse': { badge: 'bg-purple-600', accent: 'text-purple-400' },
  'Great Steppe': { badge: 'bg-emerald-600', accent: 'text-emerald-400' },
  'Cyber Shanyrak': { badge: 'bg-cyan-600', accent: 'text-cyan-400' },
  'Silk Road': { badge: 'bg-amber-700', accent: 'text-amber-400' },
};

export function PosterPreview({
  poster,
  onDownload,
  onShare,
  onUse,
  className,
}: PosterPreviewProps) {
  const themeColors = THEME_COLORS[poster.details.theme] || THEME_COLORS['Modern Nomad'];

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Default download behavior
    const link = document.createElement('a');
    link.href = poster.imageUrl;
    link.download = `poster-${poster.details.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn('space-y-4 animate-in fade-in-50 duration-500', className)}>
      {/* Poster Card */}
      <div className="relative aspect-[9/16] w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-border/50 group">
        {/* Background Image */}
        <img
          src={poster.imageUrl}
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-700 group-hover:scale-110"
          alt="Poster Background"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50" />

        {/* AI Badge - Kazakhstan AI Law compliance */}
        {poster.isAiGenerated && (
          <AiBadge position="top-right" size="sm" />
        )}

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          {/* Top Section */}
          <div className="text-center pt-4">
            <span className={cn(
              'inline-block px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded-full',
              themeColors.badge
            )}>
              {poster.details.theme}
            </span>

            <h2 className="text-3xl sm:text-4xl font-display font-bold mt-6 leading-tight text-white drop-shadow-2xl">
              {poster.details.title}
            </h2>

            <p className={cn(
              'mt-4 text-sm font-semibold uppercase tracking-widest',
              themeColors.accent
            )}>
              {poster.details.tagline}
            </p>
          </div>

          {/* Bottom Section */}
          <div className="space-y-4">
            {/* Event Info Card */}
            <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-center gap-2 font-semibold text-white">
                  <span className={themeColors.accent}>📅</span>
                  {poster.details.date}
                </div>
                <div className="h-[1px] w-12 bg-white/20 mx-auto" />
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <span className={themeColors.accent}>📍</span>
                  {poster.details.location}
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="flex flex-col items-center">
              <div className="text-[9px] text-white/40 uppercase tracking-[0.4em] mb-2">
                Afisha.kz
              </div>
              <div className={cn('w-12 h-[2px] rounded-full', themeColors.badge.replace('bg-', 'bg-') + '/50')} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 max-w-sm mx-auto">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          Скачать
        </Button>

        {onShare && (
          <Button
            variant="outline"
            size="icon"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}

        {onUse && (
          <Button
            className="flex-1 gap-2"
            onClick={onUse}
          >
            Использовать
          </Button>
        )}
      </div>

      {/* Kazakhstan AI Law notice */}
      {poster.isAiGenerated && (
        <p className="text-[10px] text-muted-foreground text-center max-w-sm mx-auto">
          Изображение сгенерировано ИИ • Сурет ЖИ арқылы жасалған • Согласно Закону РК об ИИ
        </p>
      )}
    </div>
  );
}
