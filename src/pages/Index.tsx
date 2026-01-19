import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Gift, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventCard } from '@/components/events/EventCard';
import { AfishaNavigationPanel, AfishaFilters } from '@/components/navigation/AfishaNavigationPanel';
import { PromotionCard } from '@/components/promotions/PromotionCard';
import { Button } from '@/components/ui/button';
import { useCities, useEvents, usePromotions } from '@/hooks/use-api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Достопримечательности городов Казахстана
// Фото из Pexels (бесплатные, без атрибуции) и Wikimedia Commons (CC лицензия)
const cityLandmarks: Record<string, { images: { url: string; title: string }[] }> = {
  // Все города используют общие фото Казахстана из Pexels
  // Pexels CDN формат: https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w=1280
  jezkazgan: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Казахстан' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Ночной город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  almaty: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Bandy_in_Medeu_Kazakhstan.JPG', title: 'Каток Медеу' },
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Алматы' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
    ]
  },
  astana: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Астана' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Ночная Астана' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Столица' },
    ]
  },
  shymkent: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Шымкент' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  karaganda: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Караганда' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  aktobe: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Актобе' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  taraz: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Тараз' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  pavlodar: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Павлодар' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  'ust-kamenogorsk': {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Усть-Каменогорск' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  semey: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Семей' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  atyrau: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Атырау' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  kostanay: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Костанай' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  kyzylorda: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Кызылорда' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  uralsk: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Уральск' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  petropavlovsk: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Петропавловск' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  aktau: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Актау' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  taldykorgan: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Талдыкорган' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  kokshetau: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Кокшетау' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  turkestan: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Туркестан' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  ekibastuz: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Экибастуз' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  konaev: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Конаев' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  },
  default: {
    images: [
      { url: 'https://images.pexels.com/photos/31710241/pexels-photo-31710241.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Казахстан' },
      { url: 'https://images.pexels.com/photos/31608923/pexels-photo-31608923.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Город' },
      { url: 'https://images.pexels.com/photos/31612914/pexels-photo-31612914.jpeg?auto=compress&cs=tinysrgb&w=1280', title: 'Панорама' },
    ]
  }
};

export default function Index() {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('selectedCity') || 'jezkazgan';
  });
  const [filters, setFilters] = useState<AfishaFilters>({
    search: '',
    category: 'all',
    selectedDate: null,
    showDiscounts: false,
    showFeatured: false,
    showChildren: false,
    showFree: false,
  });

  // Загружаем города из API
  const { data: cities } = useCities();

  // Текущий город
  const currentCity = cities?.find(c => c.slug === selectedCity);

  // Загружаем события и акции из API
  const { data: events = [], isLoading: eventsLoading } = useEvents({
    cityId: currentCity?.id,
    category: filters.category !== 'all' ? filters.category : undefined,
    featured: filters.showFeatured || undefined,
  });
  const { data: promotions = [], isLoading: promotionsLoading } = usePromotions({
    cityId: currentCity?.id,
  });

  // Слушаем изменения в localStorage (когда город меняется в Header)
  useEffect(() => {
    const handleStorageChange = () => {
      const city = localStorage.getItem('selectedCity') || 'jezkazgan';
      setSelectedCity(city);
    };

    window.addEventListener('storage', handleStorageChange);

    // Также проверяем периодически для изменений в той же вкладке
    const interval = setInterval(() => {
      const city = localStorage.getItem('selectedCity') || 'jezkazgan';
      if (city !== selectedCity) {
        setSelectedCity(city);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedCity]);

  // Фильтрация событий (дополнительная фильтрация на клиенте)
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Поиск
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(searchLower) ||
          (event.business?.name || '').toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Дата (конкретная дата из календаря)
      if (filters.selectedDate) {
        const eventDate = new Date(event.date);
        const selectedDate = new Date(filters.selectedDate);
        eventDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (eventDate.toDateString() !== selectedDate.toDateString()) return false;
      }

      // Бесплатные
      if (filters.showFree && !event.isFree) {
        return false;
      }

      // Детские
      if (filters.showChildren && event.category !== 'children') {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  const featuredEvents = events.filter(e => e.isFeatured);
  const topPromotions = promotions.slice(0, 3);

  // Получаем фото для текущего города
  const landmarks = cityLandmarks[selectedCity] || cityLandmarks.default;

  return (
    <Layout>
      {/* Hero секция с каруселью */}
      <section className="relative">
        {/* Карусель фотографий */}
        <Carousel
          opts={{
            loop: true,
            align: 'start',
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {landmarks.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[300px] md:h-[400px] w-full">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Затемнение для читаемости текста */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 border-0 text-white" />
          <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 border-0 text-white" />
        </Carousel>

        {/* Контент поверх карусели */}
        <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-gradient-gold font-display drop-shadow-lg">Афиша</span>
                <br />
                <span className="text-white drop-shadow-lg">
                  {currentCity?.name || 'Казахстан'}
                </span>
              </h1>
              <p className="text-lg text-white/90 max-w-xl mx-auto drop-shadow">
                События, акции и сообщества твоего города. Узнавай первым о самом интересном!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Навигационная панель в стиле afisha.ru */}
      <AfishaNavigationPanel
        cityName={currentCity?.name || 'Казахстан'}
        filters={filters}
        onChange={setFilters}
      />

      {/* Главные события */}
      {featuredEvents.length > 0 && !filters.search && filters.category === 'all' && !filters.selectedDate && !filters.showFeatured && !filters.showChildren && !filters.showFree && (
        <section className="py-8 md:py-12">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Главные события</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {featuredEvents.slice(0, 2).map((event) => (
                <EventCard key={event.id} event={event} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Все события */}
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">
                {filters.search || filters.category !== 'all' || filters.selectedDate || filters.showFeatured || filters.showChildren || filters.showFree
                  ? `Найдено: ${filteredEvents.length}`
                  : 'Все события'}
              </h2>
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                По вашему запросу ничего не найдено
              </p>
              <Button variant="outline" onClick={() => setFilters({
                search: '',
                category: 'all',
                selectedDate: null,
                showDiscounts: false,
                showFeatured: false,
                showChildren: false,
                showFree: false,
              })}>
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Актуальные скидки */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-teal" />
              <h2 className="text-2xl font-bold">Актуальные скидки</h2>
            </div>
            <Link to="/promotions">
              <Button variant="ghost" className="gap-1">
                Все акции
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPromotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA для бизнеса */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-gold-dark p-8 md:p-12">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Развивайте свой бизнес вместе с нами
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                Размещайте события и акции, находите партнеров, общайтесь с предпринимателями города в VIP-чате
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="btn-glow">
                    Зарегистрировать бизнес
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Узнать больше
                </Button>
              </div>
            </div>

            {/* Декоративный орнамент */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <pattern id="kazakh-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="currentColor" />
                </pattern>
                <rect width="200" height="200" fill="url(#kazakh-pattern)" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
