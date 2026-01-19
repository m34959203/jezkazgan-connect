import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Share2, Bookmark,
  ArrowLeft, Tag, Loader2
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventCard } from '@/components/events/EventCard';
import { useEvent, useEvents } from '@/hooks/use-api';
import { toggleFavorite, checkFavorite } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { EVENT_CATEGORIES } from '@/types';

export default function EventDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const { data: event, isLoading, error } = useEvent(id || '');
  const { data: allEvents = [] } = useEvents({ category: event?.category });

  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  // Check favorite status on mount
  useEffect(() => {
    if (!isLoggedIn || !id) return;
    checkFavorite({ eventId: id })
      .then((res) => setIsFavorite(res.isFavorite))
      .catch(() => {});
  }, [id, isLoggedIn]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в аккаунт, чтобы сохранять события',
        variant: 'destructive',
      });
      return;
    }

    if (!id) return;

    setIsSaving(true);
    try {
      const result = await toggleFavorite({ eventId: id });
      setIsFavorite(result.isFavorite);
      toast({
        title: result.isFavorite ? 'Добавлено в избранное' : 'Удалено из избранного',
        description: result.isFavorite
          ? 'Событие сохранено в вашем профиле'
          : 'Событие удалено из избранного',
      });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить избранное',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = event?.title || 'Событие';

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or error, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Ссылка скопирована',
        description: 'Ссылка на событие скопирована в буфер обмена',
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать ссылку',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка события...</p>
        </div>
      </Layout>
    );
  }

  // Error or not found
  if (error || !event) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Событие не найдено</h1>
          <Link to="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const category = EVENT_CATEGORIES[event.category] || { icon: '📅', label: 'Событие' };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  };

  const formatPrice = (price: number | null, maxPrice?: number) => {
    if (price === null || event.isFree) return 'Бесплатно';
    if (maxPrice) return `${price.toLocaleString()} - ${maxPrice.toLocaleString()} ₸`;
    return `от ${price.toLocaleString()} ₸`;
  };

  // Parse event date
  const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;

  // Similar events (same category, different event)
  const similarEvents = allEvents
    .filter(e => e.id !== event.id)
    .slice(0, 3);

  return (
    <Layout>
      {/* Хлебные крошки */}
      <div className="container py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к афише
        </Link>
      </div>

      {/* Главное изображение */}
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
        <img
          src={event.image || 'https://via.placeholder.com/1200x600?text=No+Image'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 container pb-8">
          <Badge className="mb-4 badge-gold">
            {category.icon} {category.label}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(event.date)}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{event.time}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-8">
            {/* Описание */}
            {event.description && (
              <section>
                <h2 className="text-xl font-semibold mb-4">О событии</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </section>
            )}

            {/* Место проведения */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Место проведения</h2>
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    {event.address && (
                      <p className="text-sm text-muted-foreground">{event.address}</p>
                    )}
                    {event.city && (
                      <p className="text-sm text-muted-foreground">{event.city.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Организатор */}
            {event.business && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Организатор</h2>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  {event.business.logo ? (
                    <img
                      src={event.business.logo}
                      alt={event.business.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-foreground">
                        {event.business.name[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{event.business.name}</p>
                    <p className="text-sm text-muted-foreground">Организатор</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Сайдбар */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Карточка с ценой и действиями */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-md">
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">Стоимость</span>
                  <p className={`text-3xl font-bold ${event.isFree || event.price === null ? 'text-teal' : ''}`}>
                    {formatPrice(event.price)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant={isFavorite ? "default" : "outline"}
                      className={`flex-1 ${isFavorite ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                      size="lg"
                      onClick={handleToggleFavorite}
                      disabled={isSaving}
                    >
                      <Bookmark className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Сохранено' : 'Сохранить'}
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleShare}>
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Статистика */}
                <div className="mt-6 pt-6 border-t border-border flex justify-around text-center">
                  <div>
                    <p className="text-2xl font-bold">{event.viewsCount || 0}</p>
                    <p className="text-xs text-muted-foreground">просмотров</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{event.savesCount || 0}</p>
                    <p className="text-xs text-muted-foreground">сохранений</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Похожие события */}
        {similarEvents.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Похожие события</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
