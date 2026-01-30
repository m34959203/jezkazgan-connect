import { useState, useEffect } from 'react';
import {
  Wand2,
  Loader2,
  Sparkles,
  Crown,
  Palette,
  MapPin,
  Calendar,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PosterPreview, type GeneratedPoster } from '@/components/ui/poster-preview';
import { cn } from '@/lib/utils';
import {
  checkStudioStatus,
  getStudioThemes,
  generateStudioPoster,
  type StudioTheme,
  type StudioStatus,
} from '@/lib/api';

export type PosterTheme =
  | 'modern-nomad'
  | 'urban-pulse'
  | 'great-steppe'
  | 'cyber-shanyrak'
  | 'silk-road';

interface AiPosterStudioProps {
  /** Callback when poster is generated and user wants to use it */
  onPosterGenerated?: (imageUrl: string, details: GeneratedPoster['details']) => void;
  /** Pre-fill form with event context */
  context?: {
    title?: string;
    date?: string;
    location?: string;
    description?: string;
  };
  /** Is user a Premium subscriber */
  isPremium?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Trigger button variant */
  triggerVariant?: 'default' | 'outline' | 'ghost';
}

// Theme visual configurations for the selector
const THEME_VISUALS: Record<PosterTheme, {
  icon: string;
  gradient: string;
  description: string;
}> = {
  'modern-nomad': {
    icon: '🏛️',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Этно-футуризм',
  },
  'urban-pulse': {
    icon: '🌃',
    gradient: 'from-purple-500 to-indigo-600',
    description: 'Мегаполис',
  },
  'great-steppe': {
    icon: '🏔️',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Природа',
  },
  'cyber-shanyrak': {
    icon: '⚡',
    gradient: 'from-cyan-500 to-blue-600',
    description: 'Технологии',
  },
  'silk-road': {
    icon: '🏺',
    gradient: 'from-amber-600 to-red-700',
    description: 'История',
  },
};

type GenerationStep = 'idle' | 'refining' | 'generating' | 'complete' | 'error';

export function AiPosterStudio({
  onPosterGenerated,
  context,
  isPremium = false,
  className,
  triggerVariant = 'outline',
}: AiPosterStudioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [studioStatus, setStudioStatus] = useState<StudioStatus | null>(null);
  const [themes, setThemes] = useState<StudioTheme[]>([]);

  // Form state
  const [title, setTitle] = useState(context?.title || '');
  const [date, setDate] = useState(context?.date || '');
  const [location, setLocation] = useState(context?.location || '');
  const [description, setDescription] = useState(context?.description || '');
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme>('modern-nomad');

  // Generation state
  const [step, setStep] = useState<GenerationStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [poster, setPoster] = useState<GeneratedPoster | null>(null);

  // Check studio availability and load themes
  useEffect(() => {
    if (isOpen) {
      checkStudioStatus()
        .then(setStudioStatus)
        .catch(() => setStudioStatus({ available: false, provider: 'gemini', features: [] }));

      getStudioThemes()
        .then((data) => setThemes(data.themes))
        .catch(() => setThemes([]));
    }
  }, [isOpen]);

  // Update form when context changes
  useEffect(() => {
    if (context?.title) setTitle(context.title);
    if (context?.date) setDate(context.date);
    if (context?.location) setLocation(context.location);
    if (context?.description) setDescription(context.description);
  }, [context]);

  const handleGenerate = async () => {
    if (!title.trim() || !date.trim() || !location.trim()) {
      setError('Заполните название, дату и локацию');
      return;
    }

    setStep('refining');
    setError(null);
    setPoster(null);

    try {
      setStep('generating');

      const result = await generateStudioPoster({
        title,
        date,
        location,
        description,
        theme: selectedTheme,
      });

      setPoster({
        imageUrl: result.imageUrl,
        details: result.details,
        isAiGenerated: true,
      });

      setStep('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка генерации';
      if (message.includes('Premium')) {
        setError('Требуется подписка Business Premium');
      } else {
        setError(message);
      }
      setStep('error');
    }
  };

  const handleUsePoster = () => {
    if (poster && onPosterGenerated) {
      onPosterGenerated(poster.imageUrl, poster.details);
      setIsOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setPoster(null);
    setStep('idle');
    setError(null);
  };

  // Non-premium placeholder
  if (!isPremium) {
    return (
      <div className={cn(
        'p-4 border rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20',
        className
      )}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">KZ Connect Studio</span>
              <Badge variant="outline" className="text-primary border-primary/30">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Создавайте профессиональные афиши с ИИ для любого города Казахстана
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          className={cn('gap-2', className)}
          disabled={studioStatus?.available === false}
        >
          <Palette className="w-4 h-4" />
          KZ Connect Studio
          <Sparkles className="w-3 h-3 text-primary" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            KZ Connect Studio
            <Badge variant="secondary" className="text-xs">
              Powered by Gemini
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Создайте профессиональную афишу для вашего события с учётом контекста города
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left Column - Form */}
          <div className="space-y-5">
            {/* Event Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Детали события
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название события</Label>
                  <Input
                    id="title"
                    placeholder="Концерт, выставка или форум"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={step === 'refining' || step === 'generating'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Дата
                    </Label>
                    <Input
                      id="date"
                      placeholder="1 февраля 2026"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={step === 'refining' || step === 'generating'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Город и место
                    </Label>
                    <Input
                      id="location"
                      placeholder="Алматы, Медеу"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={step === 'refining' || step === 'generating'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание (опционально)</Label>
                  <Textarea
                    id="description"
                    placeholder="Краткое описание события..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="resize-none"
                    disabled={step === 'refining' || step === 'generating'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme Selection Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Визуальный стиль
                </CardTitle>
                <CardDescription>
                  Выберите тему, отражающую дух вашего события
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(THEME_VISUALS) as PosterTheme[]).map((themeId) => {
                    const theme = THEME_VISUALS[themeId];
                    const themeData = themes.find(t => t.id === themeId);
                    const isSelected = selectedTheme === themeId;

                    return (
                      <button
                        key={themeId}
                        type="button"
                        onClick={() => setSelectedTheme(themeId)}
                        disabled={step === 'refining' || step === 'generating'}
                        className={cn(
                          'relative p-3 rounded-xl border-2 transition-all text-left',
                          'hover:border-primary/50 hover:bg-primary/5',
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-2',
                          `bg-gradient-to-br ${theme.gradient}`
                        )}>
                          {theme.icon}
                        </div>
                        <div className="font-medium text-sm">
                          {themeData?.name || themeId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {theme.description}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Generate Button */}
            {step !== 'complete' && (
              <Button
                onClick={handleGenerate}
                disabled={step === 'refining' || step === 'generating' || !title.trim() || !date.trim() || !location.trim()}
                className="w-full h-12 gap-2 text-base"
                size="lg"
              >
                {step === 'refining' && (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Анализируем контекст региона...
                  </>
                )}
                {step === 'generating' && (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Создаём уникальный визуал...
                  </>
                )}
                {(step === 'idle' || step === 'error') && (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Создать афишу
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}

            {/* Try Again Button */}
            {step === 'complete' && (
              <Button
                variant="outline"
                onClick={resetForm}
                className="w-full"
              >
                Создать новую афишу
              </Button>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {step === 'idle' && !poster && (
              <div className="text-center p-8 border-2 border-dashed border-border rounded-3xl w-full">
                <div className="text-5xl mb-4">🇰🇿</div>
                <h3 className="text-lg font-semibold text-muted-foreground">Студия готова</h3>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Создайте афишу для любого города Казахстана
                </p>
              </div>
            )}

            {(step === 'refining' || step === 'generating') && (
              <div className="text-center">
                <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin mx-auto mb-6" />
                <p className="text-primary font-semibold uppercase tracking-widest text-xs animate-pulse">
                  {step === 'refining' ? 'Генерируем смыслы...' : 'Рисуем атмосферу...'}
                </p>
              </div>
            )}

            {poster && step === 'complete' && (
              <PosterPreview
                poster={poster}
                onUse={onPosterGenerated ? handleUsePoster : undefined}
                className="w-full"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
