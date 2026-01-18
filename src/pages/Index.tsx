import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventCard } from '@/components/events/EventCard';
import { EventFiltersComponent } from '@/components/events/EventFilters';
import { PromotionCard } from '@/components/promotions/PromotionCard';
import { Button } from '@/components/ui/button';
import { mockEvents, mockPromotions } from '@/data/mockData';
import { EventFilters } from '@/types';
import { useCities } from '@/hooks/use-api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Достопримечательности городов (реальные фото из Wikimedia Commons)
const cityLandmarks: Record<string, { images: { url: string; title: string }[] }> = {
  jezkazgan: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Zhezkazgan_012_5765.jpg/1280px-Zhezkazgan_012_5765.jpg', title: 'Жезказган - вид на город' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Kengir_reservoir.jpg/1280px-Kengir_reservoir.jpg', title: 'Кенгирское водохранилище' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Zhezkazgan_006_5748.jpg/1280px-Zhezkazgan_006_5748.jpg', title: 'Площадь Металлургов' },
    ]
  },
  almaty: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Medeu_skating_rink.jpg/1280px-Medeu_skating_rink.jpg', title: 'Каток Медеу' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Almaty_-_Pair_on_viewpoint_%28edit%29.jpg/1280px-Almaty_-_Pair_on_viewpoint_%28edit%29.jpg', title: 'Вид на Алматы с Кок-Тобе' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Almaty_city_view.jpg/1280px-Almaty_city_view.jpg', title: 'Панорама Алматы' },
    ]
  },
  astana: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bajterek_panorama.jpg/1280px-Bajterek_panorama.jpg', title: 'Монумент Байтерек' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Khan_Shatyr_Entertainment_Center_2.jpg/1280px-Khan_Shatyr_Entertainment_Center_2.jpg', title: 'Хан Шатыр' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Central_Downtown_Astana_2.jpg/1280px-Central_Downtown_Astana_2.jpg', title: 'Центр Астаны' },
    ]
  },
  default: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag-map_of_Kazakhstan.svg/1280px-Flag-map_of_Kazakhstan.svg.png', title: 'Казахстан' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Charyn_Canyon_Kazakhstan.jpg/1280px-Charyn_Canyon_Kazakhstan.jpg', title: 'Чарынский каньон' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Kolsai_Lakes%2C_Kazakhstan.jpg/1280px-Kolsai_Lakes%2C_Kazakhstan.jpg', title: 'Кольсайские озёра' },
    ]
  }
};

export default function Index() {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('selectedCity') || 'jezkazgan';
  });
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: 'all',
    date: 'all',
    price: 'all',
  });

  // Загружаем города из API
  const { data: cities } = useCities();

  // Текущий город
  const currentCity = cities?.find(c => c.slug === selectedCity);

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

  // Фильтрация событий
  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      // Поиск
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(searchLower) ||
          event.organizerName.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Категория
      if (filters.category !== 'all' && event.category !== filters.category) {
        return false;
      }

      // Дата
      if (filters.date !== 'all') {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filters.date === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (eventDate < today || eventDate >= tomorrow) return false;
        } else if (filters.date === 'week') {
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          if (eventDate < today || eventDate >= weekEnd) return false;
        } else if (filters.date === 'month') {
          const monthEnd = new Date(today);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          if (eventDate < today || eventDate >= monthEnd) return false;
        }
      }

      // Цена
      if (filters.price !== 'all') {
        if (filters.price === 'free' && event.price !== null) return false;
        if (filters.price === 'paid' && event.price === null) return false;
      }

      return true;
    });
  }, [filters]);

  const featuredEvents = mockEvents.filter(e => e.isFeatured);
  const topPromotions = mockPromotions.slice(0, 3);

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
                <div className="relative h-[400px] md:h-[500px] w-full">
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
            <div className="text-center max-w-3xl mx-auto mb-8">
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

            {/* Фильтры */}
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <EventFiltersComponent filters={filters} onChange={setFilters} />
            </div>
          </div>
        </div>
      </section>

      {/* Главные события */}
      {featuredEvents.length > 0 && !filters.search && filters.category === 'all' && (
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
                {filters.search || filters.category !== 'all'
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
                date: 'all',
                price: 'all',
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
