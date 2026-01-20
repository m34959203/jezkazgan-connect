import { useState, useEffect } from 'react';
import { Wand2, Loader2, Sparkles, Image as ImageIcon, History, ChevronDown, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  checkAiGenerationStatus,
  getAiPromptSuggestions,
  generateAiImage,
  fetchAiGenerationHistory,
  type AiGenerationHistory,
  type AiStatus,
} from '@/lib/api';

// Kazakhstan AI Law - mandatory AI content disclosure
const AI_DISCLAIMER_RU = 'Изображение сгенерировано ИИ';
const AI_DISCLAIMER_KZ = 'Сурет ЖИ арқылы жасалған';

interface AiImageGeneratorProps {
  contentType: 'event' | 'promotion' | 'banner';
  onImageGenerated: (imageUrl: string, metadata?: { isAiGenerated: boolean }) => void;
  context?: {
    title?: string;
    description?: string;
    category?: string;
    discount?: string;
  };
  isPremium?: boolean;
  className?: string;
  defaultPrompt?: string;
  defaultStyle?: 'banner' | 'promo' | 'event' | 'poster' | 'social';
}

const styleOptions = [
  { value: 'promo', label: 'Промо-материал', description: 'Яркие рекламные изображения' },
  { value: 'event', label: 'Афиша события', description: 'Постеры для мероприятий' },
  { value: 'banner', label: 'Баннер', description: 'Широкоформатные баннеры' },
  { value: 'poster', label: 'Постер', description: 'Вертикальный формат' },
  { value: 'social', label: 'Соцсети', description: 'Квадратный формат для Instagram' },
];

export function AiImageGenerator({
  contentType,
  onImageGenerated,
  context,
  isPremium = false,
  className,
  defaultPrompt,
  defaultStyle,
}: AiImageGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [prompt, setPrompt] = useState(defaultPrompt || '');
  const [style, setStyle] = useState<string>(defaultStyle || 'promo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<AiGenerationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Check if AI is available
  useEffect(() => {
    checkAiGenerationStatus()
      .then((status) => setAiStatus(status))
      .catch(() => setAiStatus({ available: false, provider: 'ideogram', model: 'V_2', isFree: false }));
  }, []);

  // Update prompt and style when defaults change (e.g., from idea selection)
  useEffect(() => {
    if (defaultPrompt) {
      setPrompt(defaultPrompt);
    }
  }, [defaultPrompt]);

  useEffect(() => {
    if (defaultStyle) {
      setStyle(defaultStyle);
    }
  }, [defaultStyle]);

  const providerLabels: Record<string, string> = {
    ideogram: 'Ideogram V2',
    openai: 'OpenAI DALL-E 3',
    huggingface: 'FLUX.1 (бесплатно)',
    replicate: 'Replicate SDXL',
  };

  // Load suggestions when dialog opens
  useEffect(() => {
    if (isOpen && context) {
      getAiPromptSuggestions({
        contentType,
        ...context,
      })
        .then((data) => setSuggestions(data.suggestions))
        .catch(() => setSuggestions([]));
    }
  }, [isOpen, contentType, context]);

  // Load history when showing
  useEffect(() => {
    if (showHistory) {
      fetchAiGenerationHistory({ limit: 10 })
        .then(setHistory)
        .catch(() => setHistory([]));
    }
  }, [showHistory]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Введите описание изображения');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateAiImage({
        prompt,
        style: style as 'banner' | 'promo' | 'event' | 'poster' | 'social',
        translatePrompt: true,
      });

      setGeneratedImage(result.imageUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка генерации';
      if (message.includes('Premium')) {
        setError('Требуется подписка Business Premium для генерации изображений');
      } else {
        setError(message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      // Pass AI metadata for Kazakhstan AI Law compliance
      onImageGenerated(generatedImage, { isAiGenerated: true });
      setIsOpen(false);
      setGeneratedImage(null);
      setPrompt('');
    }
  };

  const handleUseFromHistory = (imageUrl: string) => {
    // All images from history are AI-generated
    onImageGenerated(imageUrl, { isAiGenerated: true });
    setIsOpen(false);
  };

  if (!isPremium) {
    return (
      <div className={cn('p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200', className)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-200/50 rounded-lg">
            <Wand2 className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">ИИ генерация изображений</span>
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Создавайте уникальные изображения с помощью Ideogram V2 или FLUX
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
          variant="outline"
          className={cn('gap-2', className)}
          disabled={aiStatus?.available === false}
        >
          <Wand2 className="w-4 h-4" />
          Сгенерировать с ИИ
          <Sparkles className="w-3 h-3 text-amber-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Генерация изображения с ИИ
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>Опишите желаемое изображение, и ИИ создаст его для вас</span>
            {aiStatus && (
              <Badge variant={aiStatus.isFree ? 'secondary' : 'outline'} className="text-xs">
                {providerLabels[aiStatus.provider] || aiStatus.provider}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Готовые идеи:</Label>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1"
                    onClick={() => setPrompt(suggestion)}
                  >
                    {suggestion.substring(0, 40)}...
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Описание изображения</Label>
            <Textarea
              id="prompt"
              placeholder="Например: Яркий баннер для скидки 30% на казахскую кухню, современный дизайн..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Style selector */}
          <div className="space-y-2">
            <Label>Стиль изображения</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Generated image preview with mandatory AI label */}
          {generatedImage && (
            <div className="space-y-3">
              <Label>Сгенерированное изображение</Label>
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={generatedImage}
                  alt="Generated by AI"
                  className="w-full h-64 object-cover"
                />
                {/* Kazakhstan AI Law - mandatory AI disclosure label */}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                  {AI_DISCLAIMER_RU}
                </div>
              </div>
              {/* Legal notice */}
              <p className="text-xs text-muted-foreground text-center">
                {AI_DISCLAIMER_KZ} • Согласно Закону РК об ИИ
              </p>
              <Button onClick={handleUseImage} className="w-full">
                <ImageIcon className="w-4 h-4 mr-2" />
                Использовать это изображение
              </Button>
            </div>
          )}

          {/* Generate button */}
          {!generatedImage && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Сгенерировать
                </>
              )}
            </Button>
          )}

          {/* History */}
          <Collapsible open={showHistory} onOpenChange={setShowHistory}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  История генераций
                </span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', showHistory && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  История пуста
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {history.map((item) => (
                    item.generatedImageUrl && (
                      <button
                        key={item.id}
                        type="button"
                        className="relative aspect-square rounded-lg overflow-hidden border hover:ring-2 ring-primary transition-all"
                        onClick={() => handleUseFromHistory(item.generatedImageUrl!)}
                      >
                        <img
                          src={item.generatedImageUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover"
                        />
                        {/* AI label on history items */}
                        <div className="absolute top-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-[8px] font-medium">
                          ИИ
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs">Использовать</span>
                        </div>
                      </button>
                    )
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}
