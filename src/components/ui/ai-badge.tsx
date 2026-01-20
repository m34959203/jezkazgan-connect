import { cn } from '@/lib/utils';

// Kazakhstan AI Law - mandatory AI content disclosure labels
export const AI_LABELS = {
  ru: 'Сгенерировано ИИ',
  kz: 'ЖИ жасаған',
  en: 'AI Generated',
} as const;

// Short labels for compact displays
export const AI_LABELS_SHORT = {
  ru: 'ИИ',
  kz: 'ЖИ',
  en: 'AI',
} as const;

interface AiBadgeProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Language for the label */
  lang?: 'ru' | 'kz' | 'en';
  /** Show short version (just "ИИ") */
  short?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Position when used as overlay */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * AI Badge Component
 * Kazakhstan AI Law compliance - mandatory disclosure for AI-generated content
 *
 * Usage:
 * - On AI-generated images: <AiBadge position="top-left" />
 * - Inline in text: <AiBadge size="sm" />
 * - Short version for thumbnails: <AiBadge short />
 */
export function AiBadge({
  size = 'md',
  lang = 'ru',
  short = false,
  className,
  position,
}: AiBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5',
  };

  const positionClasses = {
    'top-left': 'absolute top-2 left-2',
    'top-right': 'absolute top-2 right-2',
    'bottom-left': 'absolute bottom-2 left-2',
    'bottom-right': 'absolute bottom-2 right-2',
  };

  const label = short ? AI_LABELS_SHORT[lang] : AI_LABELS[lang];

  return (
    <div
      className={cn(
        'inline-flex items-center bg-black/70 text-white rounded font-medium',
        sizeClasses[size],
        position && positionClasses[position],
        className
      )}
      title={AI_LABELS[lang]}
      aria-label={AI_LABELS[lang]}
    >
      {label}
    </div>
  );
}

/**
 * AI Image Wrapper Component
 * Wraps an image and adds mandatory AI disclosure badge
 */
interface AiImageProps {
  src: string;
  alt: string;
  isAiGenerated?: boolean;
  className?: string;
  imageClassName?: string;
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  badgeSize?: 'sm' | 'md' | 'lg';
}

export function AiImage({
  src,
  alt,
  isAiGenerated = false,
  className,
  imageClassName,
  badgePosition = 'top-left',
  badgeSize = 'md',
}: AiImageProps) {
  return (
    <div className={cn('relative', className)}>
      <img
        src={src}
        alt={isAiGenerated ? `${alt} (AI Generated)` : alt}
        className={imageClassName}
      />
      {isAiGenerated && (
        <AiBadge position={badgePosition} size={badgeSize} />
      )}
    </div>
  );
}
