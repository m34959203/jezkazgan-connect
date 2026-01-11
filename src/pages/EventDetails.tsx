import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Users, Share2, Bookmark, 
  ArrowLeft, Phone, Globe, ExternalLink, Tag 
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventCard } from '@/components/events/EventCard';
import { mockEvents } from '@/data/mockData';
import { EVENT_CATEGORIES } from '@/types';

export default function EventDetails() {
  const { id } = useParams();
  const event = mockEvents.find(e => e.id === id);

  if (!event) {
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

  const category = EVENT_CATEGORIES[event.category];
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatPrice = (price: number | null, maxPrice?: number) => {
    if (price === null) return 'Бесплатно';
    if (maxPrice) return `${price.toLocaleString()} - ${maxPrice.toLocaleString()} ₸`;
    return `от ${price.toLocaleString()} ₸`;
  };

  // Похожие события
  const similarEvents = mockEvents
    .filter(e => e.id !== event.id && e.category === event.category)
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
          src={event.image}
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
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{event.time}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-8">
            {/* Описание */}
            <section>
              <h2 className="text-xl font-semibold mb-4">О событии</h2>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </section>

            {/* Теги */}
            {event.tags.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Теги</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
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
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Организатор */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Организатор</h2>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                {event.organizerLogo ? (
                  <img
                    src={event.organizerLogo}
                    alt={event.organizerName}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">
                      {event.organizerName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{event.organizerName}</p>
                  <p className="text-sm text-muted-foreground">Организатор</p>
                </div>
              </div>
            </section>
          </div>

          {/* Сайдбар */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Карточка с ценой и действиями */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-md">
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">Стоимость</span>
                  <p className={`text-3xl font-bold ${event.price === null ? 'text-teal' : ''}`}>
                    {formatPrice(event.price, event.maxPrice)}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full btn-glow" size="lg">
                    Купить билет
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="lg">
                      <Bookmark className="w-5 h-5 mr-2" />
                      Сохранить
                    </Button>
                    <Button variant="outline" size="lg">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Статистика */}
                <div className="mt-6 pt-6 border-t border-border flex justify-around text-center">
                  <div>
                    <p className="text-2xl font-bold">{event.viewCount}</p>
                    <p className="text-xs text-muted-foreground">просмотров</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{event.saveCount}</p>
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
