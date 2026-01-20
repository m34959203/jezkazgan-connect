import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { VideoUpload } from '@/components/ui/video-upload';
import { AiImageGenerator } from '@/components/ui/ai-image-generator';
import { AiImageIdeas } from '@/components/ui/ai-image-ideas';
import type { ImageIdea } from '@/lib/api';
import { useMyBusiness } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { createEvent } from '@/lib/api';

const eventCategories = [
  { value: 'concerts', label: 'Концерты' },
  { value: 'education', label: 'Обучение' },
  { value: 'seminars', label: 'Семинары' },
  { value: 'leisure', label: 'Досуг' },
  { value: 'sports', label: 'Спорт' },
  { value: 'children', label: 'Для детей' },
  { value: 'exhibitions', label: 'Выставки' },
  { value: 'other', label: 'Другое' },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: business, isLoading } = useMyBusiness();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [image, setImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<ImageIdea | null>(null);

  // Handle idea selection - opens AI generator with pre-filled prompt
  const handleIdeaSelected = (idea: ImageIdea) => {
    setSelectedIdea(idea);
  };

  // Check premium status
  const isPremium = business?.tier === 'premium' &&
    (!business.tierUntil || new Date(business.tierUntil) > new Date());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Бизнес не найден</p>
        <Button asChild className="mt-4">
          <Link to="/create-business">Создать бизнес</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category || !date || !time) {
      toast({
        title: 'Заполните обязательные поля',
        description: 'Название, категория, дата и время обязательны',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into ISO datetime
      const dateTime = new Date(`${date}T${time}`).toISOString();

      await createEvent({
        cityId: business.city?.id || '',
        businessId: business.id,
        title,
        description: description || undefined,
        category,
        date: dateTime,
        location: location || undefined,
        address: address || undefined,
        price: isFree ? undefined : (price ? parseInt(price) : undefined),
        isFree,
        image: image || undefined,
        videoUrl: videoUrl || undefined,
        videoThumbnail: videoThumbnail || undefined,
      });

      toast({
        title: 'Событие создано!',
        description: 'Событие отправлено на модерацию',
      });

      navigate('/business/publications');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось создать событие';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/business/publications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к публикациям
        </Link>
        <h1 className="text-2xl font-bold">Создать событие</h1>
        <p className="text-muted-foreground">Добавьте новое событие в афишу города</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название события *</Label>
              <Input
                id="title"
                placeholder="Например: Концерт группы 'Мечта'"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Расскажите подробнее о событии..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Image upload with AI generation */}
            <div className="space-y-3">
              <ImageUpload
                value={image}
                onChange={setImage}
                folder="afisha/events"
                label="Изображение события"
              />

              {/* AI Image Ideas */}
              <div className="flex flex-wrap items-center gap-2">
                <AiImageIdeas
                  title={title}
                  description={description}
                  category={category}
                  location={location}
                  onSelectIdea={handleIdeaSelected}
                  isPremium={isPremium}
                />
                <AiImageGenerator
                  contentType="event"
                  onImageGenerated={(url) => {
                    setImage(url);
                    setSelectedIdea(null); // Clear selected idea after generation
                  }}
                  isPremium={isPremium}
                  context={{
                    title,
                    description,
                    category,
                  }}
                  defaultPrompt={selectedIdea?.prompt}
                  defaultStyle={selectedIdea?.style}
                />
                {!isPremium && (
                  <span className="text-xs text-muted-foreground">
                    Генерация с ИИ доступна в Premium
                  </span>
                )}
              </div>

              {/* Selected Idea Preview */}
              {selectedIdea && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-medium text-sm">{selectedIdea.title}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {selectedIdea.style}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setSelectedIdea(null)}
                    >
                      ✕
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{selectedIdea.description}</p>
                  <div className="bg-background/50 rounded p-2">
                    <p className="text-xs font-mono">{selectedIdea.prompt}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video (Premium feature) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Видео
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Добавьте видео для более привлекательной презентации
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <VideoUpload
              value={videoUrl}
              onChange={setVideoUrl}
              onThumbnailChange={setVideoThumbnail}
              thumbnail={videoThumbnail}
              isPremium={isPremium}
            />
          </CardContent>
        </Card>

        {/* Date and time */}
        <Card>
          <CardHeader>
            <CardTitle>Дата и время</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Дата *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Время *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    className="pl-10"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Место проведения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Название места</Label>
              <Input
                id="location"
                placeholder="Например: ДК Горняков"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="ул. Мира, 15"
                  className="pl-10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle>Стоимость</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isFree">Бесплатное событие</Label>
                <p className="text-sm text-muted-foreground">Вход свободный</p>
              </div>
              <Switch
                id="isFree"
                checked={isFree}
                onCheckedChange={setIsFree}
              />
            </div>

            {!isFree && (
              <div className="space-y-2">
                <Label htmlFor="price">Цена (тенге)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="1000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            После создания событие будет отправлено на модерацию. После одобрения оно появится в афише города.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/business/publications')}>
            Отмена
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Создать событие'}
          </Button>
        </div>
      </form>
    </div>
  );
}
