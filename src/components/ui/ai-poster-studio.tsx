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
  Video,
  Image as ImageIcon,
  Play,
  Download,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PosterPreview, type GeneratedPoster } from '@/components/ui/poster-preview';
import { AiBadge } from '@/components/ui/ai-badge';
import { cn } from '@/lib/utils';
import {
  checkStudioStatus,
  getStudioThemes,
  generateStudioPoster,
  generateStudioVideo,
  type StudioTheme,
  type StudioStatus,
  type StudioVideoResult,
  type VideoAspectRatio,
  type VideoDuration,
} from '@/lib/api';

export type PosterTheme =
  // Стили по категориям событий
  | 'concert-vibe'
  | 'edu-smart'
  | 'business-pro'
  | 'leisure-fun'
  | 'sport-energy'
  | 'kids-magic'
  | 'art-gallery';

interface AiPosterStudioProps {
  /** Callback when poster is generated and user wants to use it */
  onPosterGenerated?: (imageUrl: string, details: GeneratedPoster['details']) => void;
  /** Callback when video is generated */
  onVideoGenerated?: (videoUrl: string, details: GeneratedPoster['details']) => void;
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
  name: string;
  tooltip: string;
}> = {
  'concert-vibe': {
    icon: '🎸',
    gradient: 'from-pink-500 to-purple-600',
    name: 'Концерты',
    tooltip: 'Яркие неоновые цвета, динамичная атмосфера живой музыки и сцены',
  },
  'edu-smart': {
    icon: '📚',
    gradient: 'from-blue-600 to-indigo-700',
    name: 'Обучение',
    tooltip: 'Чистый академический стиль с элементами знаний и просвещения',
  },
  'business-pro': {
    icon: '💼',
    gradient: 'from-slate-500 to-gray-700',
    name: 'Семинары',
    tooltip: 'Профессиональный корпоративный дизайн для деловых мероприятий',
  },
  'leisure-fun': {
    icon: '🎉',
    gradient: 'from-orange-400 to-pink-500',
    name: 'Досуг',
    tooltip: 'Весёлые праздничные цвета для развлекательных событий',
  },
  'sport-energy': {
    icon: '⚽',
    gradient: 'from-red-500 to-orange-600',
    name: 'Спорт',
    tooltip: 'Энергичный динамичный стиль для спортивных мероприятий',
  },
  'kids-magic': {
    icon: '🎈',
    gradient: 'from-yellow-400 to-pink-400',
    name: 'Для детей',
    tooltip: 'Яркие сказочные цвета для детских праздников и мероприятий',
  },
  'art-gallery': {
    icon: '🎨',
    gradient: 'from-violet-500 to-purple-600',
    name: 'Выставки',
    tooltip: 'Элегантный галерейный стиль для культурных событий и искусства',
  },
};

// Get all themes as array
const getThemes = () => Object.entries(THEME_VISUALS);

type GenerationStep = 'idle' | 'refining' | 'generating' | 'complete' | 'error';
type ContentType = 'poster' | 'video';

export function AiPosterStudio({
  onPosterGenerated,
  onVideoGenerated,
  context,
  isPremium = false,
  className,
  triggerVariant = 'outline',
}: AiPosterStudioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [studioStatus, setStudioStatus] = useState<StudioStatus | null>(null);
  const [themes, setThemes] = useState<StudioTheme[]>([]);
  const [contentType, setContentType] = useState<ContentType>('poster');

  // Form state
  const [title, setTitle] = useState(context?.title || '');
  const [date, setDate] = useState(context?.date || '');
  const [location, setLocation] = useState(context?.location || '');
  const [description, setDescription] = useState(context?.description || '');
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme>('concert-vibe');

  // Video specific settings
  const [videoDuration, setVideoDuration] = useState<VideoDuration>('8s');
  const [videoAspectRatio, setVideoAspectRatio] = useState<VideoAspectRatio>('16:9');

  // Generation state
  const [step, setStep] = useState<GenerationStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [poster, setPoster] = useState<GeneratedPoster | null>(null);
  const [video, setVideo] = useState<StudioVideoResult | null>(null);

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

  const handleGeneratePoster = async () => {
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

  const handleGenerateVideo = async () => {
    if (!title.trim() || !date.trim() || !location.trim()) {
      setError('Заполните название, дату и локацию');
      return;
    }

    setStep('refining');
    setError(null);
    setVideo(null);

    try {
      setStep('generating');

      const result = await generateStudioVideo({
        title,
        date,
        location,
        description,
        theme: selectedTheme,
        duration: videoDuration,
        aspectRatio: videoAspectRatio,
      });

      setVideo(result);
      setStep('complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка генерации видео';
      if (message.includes('Premium')) {
        setError('Требуется подписка Business Premium');
      } else if (message.includes('not available')) {
        setError('Генерация видео временно недоступна. Обратитесь в поддержку.');
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

  const handleUseVideo = () => {
    if (video && onVideoGenerated) {
      onVideoGenerated(video.videoUrl, video.details);
      setIsOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setPoster(null);
    setVideo(null);
    setStep('idle');
    setError(null);
  };

  const isVideoAvailable = studioStatus?.video?.available ?? false;

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
              Создавайте афиши и видео с ИИ для любого города Казахстана
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
            Создайте профессиональный контент для вашего события с учётом контекста города
          </DialogDescription>
        </DialogHeader>

        {/* Content Type Tabs */}
        <Tabs value={contentType} onValueChange={(v) => { setContentType(v as ContentType); resetForm(); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="poster" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Афиша
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2" disabled={!isVideoAvailable}>
              <Video className="w-4 h-4" />
              Видео
              {!isVideoAvailable && (
                <Badge variant="outline" className="text-[10px] ml-1">Скоро</Badge>
              )}
            </TabsTrigger>
          </TabsList>

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
                  <TooltipProvider delayDuration={300}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {getThemes().map(([themeId, theme]) => {
                        const isSelected = selectedTheme === themeId;

                        return (
                          <Tooltip key={themeId}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => setSelectedTheme(themeId as PosterTheme)}
                                disabled={step === 'refining' || step === 'generating'}
                                className={cn(
                                  'relative p-2 rounded-lg border-2 transition-all text-left',
                                  'hover:border-primary/50 hover:bg-primary/5',
                                  isSelected
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                    : 'border-border'
                                )}
                              >
                                <div className={cn(
                                  'w-7 h-7 rounded-md flex items-center justify-center text-base mb-1',
                                  `bg-gradient-to-br ${theme.gradient}`
                                )}>
                                  {theme.icon}
                                </div>
                                <div className="font-medium text-xs truncate">
                                  {theme.name}
                                </div>
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[200px]">
                              <p className="text-xs">{theme.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>

              {/* Video Settings (only for video tab) */}
              <TabsContent value="video" className="mt-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      Настройки видео
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Длительность</Label>
                        <Select
                          value={videoDuration}
                          onValueChange={(v) => setVideoDuration(v as VideoDuration)}
                          disabled={step === 'refining' || step === 'generating'}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4s">4 секунды</SelectItem>
                            <SelectItem value="8s">8 секунд</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Формат</Label>
                        <Select
                          value={videoAspectRatio}
                          onValueChange={(v) => setVideoAspectRatio(v as VideoAspectRatio)}
                          disabled={step === 'refining' || step === 'generating'}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16:9">16:9 (Горизонтальное)</SelectItem>
                            <SelectItem value="9:16">9:16 (Stories)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Generate Buttons */}
              <TabsContent value="poster" className="mt-0">
                {step !== 'complete' && (
                  <Button
                    onClick={handleGeneratePoster}
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
                {step === 'complete' && poster && (
                  <Button variant="outline" onClick={resetForm} className="w-full">
                    Создать новую афишу
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="video" className="mt-0">
                {step !== 'complete' && (
                  <Button
                    onClick={handleGenerateVideo}
                    disabled={step === 'refining' || step === 'generating' || !title.trim() || !date.trim() || !location.trim()}
                    className="w-full h-12 gap-2 text-base"
                    size="lg"
                  >
                    {step === 'refining' && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Анализируем сценарий...
                      </>
                    )}
                    {step === 'generating' && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Генерируем видео (до 5 минут)...
                      </>
                    )}
                    {(step === 'idle' || step === 'error') && (
                      <>
                        <Video className="w-5 h-5" />
                        Создать видео
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
                {step === 'complete' && video && (
                  <Button variant="outline" onClick={resetForm} className="w-full">
                    Создать новое видео
                  </Button>
                )}
              </TabsContent>
            </div>

            {/* Right Column - Preview */}
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              {step === 'idle' && !poster && !video && (
                <div className="text-center p-8 border-2 border-dashed border-border rounded-3xl w-full">
                  <div className="text-5xl mb-4">🇰🇿</div>
                  <h3 className="text-lg font-semibold text-muted-foreground">Студия готова</h3>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    {contentType === 'poster'
                      ? 'Создайте афишу для любого города Казахстана'
                      : 'Создайте промо-видео для вашего события'}
                  </p>
                </div>
              )}

              {(step === 'refining' || step === 'generating') && (
                <div className="text-center">
                  <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-primary font-semibold uppercase tracking-widest text-xs animate-pulse">
                    {contentType === 'poster'
                      ? (step === 'refining' ? 'Генерируем смыслы...' : 'Рисуем атмосферу...')
                      : (step === 'refining' ? 'Создаём сценарий...' : 'Рендерим видео...')}
                  </p>
                </div>
              )}

              {/* Poster Preview */}
              <TabsContent value="poster" className="w-full mt-0">
                {poster && step === 'complete' && (
                  <PosterPreview
                    poster={poster}
                    onUse={onPosterGenerated ? handleUsePoster : undefined}
                    className="w-full"
                  />
                )}
              </TabsContent>

              {/* Video Preview */}
              <TabsContent value="video" className="w-full mt-0">
                {video && step === 'complete' && (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border shadow-lg">
                      <video
                        src={video.videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        className={cn(
                          'w-full',
                          video.aspectRatio === '9:16' ? 'max-h-[400px] mx-auto' : ''
                        )}
                      />
                      <AiBadge position="top-right" size="sm" />
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      <p>{video.details.title}</p>
                      <p className="text-xs">{video.duration} • {video.aspectRatio}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = video.videoUrl;
                          link.download = `video-${video.details.title.replace(/\s+/g, '-').toLowerCase()}.mp4`;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Скачать
                      </Button>
                      {onVideoGenerated && (
                        <Button className="flex-1 gap-2" onClick={handleUseVideo}>
                          <Play className="w-4 h-4" />
                          Использовать
                        </Button>
                      )}
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center">
                      Видео сгенерировано ИИ • Бейне ЖИ арқылы жасалған • Согласно Закону РК об ИИ
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
