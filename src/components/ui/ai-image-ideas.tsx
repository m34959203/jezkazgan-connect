import { useState } from 'react';
import { Lightbulb, Loader2, Sparkles, Copy, Check, Wand2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getAiImageIdeas, type ImageIdea } from '@/lib/api';

interface AiImageIdeasProps {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  location?: string;
  onSelectIdea: (idea: ImageIdea) => void;
  isPremium?: boolean;
  className?: string;
}

const styleLabels: Record<string, string> = {
  banner: 'Баннер',
  promo: 'Промо',
  event: 'Афиша',
  poster: 'Постер',
  social: 'Соцсети',
};

export function AiImageIdeas({
  title,
  description,
  category,
  date,
  location,
  onSelectIdea,
  isPremium = false,
  className,
}: AiImageIdeasProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<ImageIdea[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAiImageIdeas({
        title,
        description,
        category,
        date,
        location,
      });
      setIdeas(result.ideas);
    } catch (err) {
      setError('Не удалось загрузить идеи');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && ideas.length === 0) {
      loadIdeas();
    }
  };

  const handleCopyPrompt = async (idea: ImageIdea) => {
    await navigator.clipboard.writeText(idea.prompt);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectIdea = (idea: ImageIdea) => {
    onSelectIdea(idea);
    setIsOpen(false);
  };

  // Non-premium view
  if (!isPremium) {
    return (
      <div className={cn('p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-900/20 border-purple-200', className)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-200/50 rounded-lg">
            <Lightbulb className="w-5 h-5 text-purple-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Идеи для изображений</span>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              ИИ подберёт 3 лучших идеи с готовыми промптами
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('gap-2', className)}
        >
          <Lightbulb className="w-4 h-4" />
          Идеи для изображений
          <Sparkles className="w-3 h-3 text-purple-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Идеи для изображения
          </DialogTitle>
          <DialogDescription>
            На основе информации о событии подготовлены 3 идеи с промптами для генерации
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">Генерируем идеи...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={loadIdeas}>
                Попробовать снова
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="group relative p-4 border rounded-xl hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold">{idea.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {styleLabels[idea.style] || idea.style}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {idea.description}
                      </p>
                    </div>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                      {idea.id}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {idea.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Prompt preview */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Промпт для генерации:</p>
                    <p className="text-sm font-mono line-clamp-2">{idea.prompt}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCopyPrompt(idea)}
                    >
                      {copiedId === idea.id ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5 text-green-500" />
                          Скопировано
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1.5" />
                          Копировать промпт
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleSelectIdea(idea)}
                    >
                      <Wand2 className="w-4 h-4 mr-1.5" />
                      Выбрать эту идею
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Refresh button */}
          {!isLoading && ideas.length > 0 && (
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadIdeas}
                className="text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Сгенерировать новые идеи
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
