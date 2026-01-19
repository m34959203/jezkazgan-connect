import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Gift, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EventCard } from '@/components/events/EventCard';
import { AfishaNavigationPanel, AfishaFilters } from '@/components/navigation/AfishaNavigationPanel';
import { PromotionCard } from '@/components/promotions/PromotionCard';
import { Button } from '@/components/ui/button';
import { useCities, useEvents, usePromotions, usePublicCityPhotos } from '@/hooks/use-api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Достопримечательности городов Казахстана
// Фото загружены в Cloudinary из Wikimedia Commons (CC лицензия)
const cityLandmarks: Record<string, { images: { url: string; title: string }[] }> = {
  // Жезказган - центр Улытауской области
  jezkazgan: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854723/afisha/cities/jezkazgan_ulytau.jpg', title: 'Горы Улытау' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854718/afisha/cities/jezkazgan_saryarka.jpg', title: 'Степь Сарыарка' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854713/afisha/cities/jezkazgan_kengir.jpg', title: 'Река Кенгир' },
    ]
  },
  // Алматы - крупнейший город
  almaty: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Каток Медеу' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Вознесенский собор' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Чарынский каньон' },
    ]
  },
  // Астана - столица
  astana: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854423/afisha/cities/astana_university.jpg', title: 'Назарбаев Университет' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854428/afisha/cities/astana_arena.jpg', title: 'Астана Арена' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
    ]
  },
  // Шымкент - третий по величине город
  shymkent: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854482/afisha/cities/shymkent_city.jpg', title: 'Шымкент' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Природа' },
    ]
  },
  // Караганда
  karaganda: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Актобе
  aktobe: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Тараз
  taraz: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Павлодар
  pavlodar: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Усть-Каменогорск
  'ust-kamenogorsk': {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Семей
  semey: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Атырау
  atyrau: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Костанай
  kostanay: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Кызылорда
  kyzylorda: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Уральск
  uralsk: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Петропавловск
  petropavlovsk: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Актау - город на Каспии
  aktau: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854485/afisha/cities/aktau_city.jpg', title: 'Актау' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
    ]
  },
  // Талдыкорган
  taldykorgan: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Кокшетау - край озёр
  kokshetau: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854484/afisha/cities/kokshetau_burabay.jpg', title: 'Бурабай' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Природа' },
    ]
  },
  // Туркестан - духовная столица
  turkestan: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
    ]
  },
  // Экибастуз
  ekibastuz: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Конаев
  konaev: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Казахстан' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Город' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
    ]
  },
  // Fallback для любых других городов
  default: {
    images: [
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854480/afisha/cities/kazakhstan_charyn.jpg', title: 'Чарынский каньон' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854327/afisha/cities/almaty_medeu.jpg', title: 'Медеу' },
      { url: 'https://res.cloudinary.com/dlulp8x9o/image/upload/v1768854418/afisha/cities/almaty_cathedral.jpg', title: 'Архитектура' },
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

  // Загружаем фото из API для текущего города
  const { data: cityPhotosData } = usePublicCityPhotos(selectedCity);

  // Получаем фото для текущего города (API или fallback на хардкод)
  const landmarks = useMemo(() => {
    // Если есть фото из API, используем их
    if (cityPhotosData?.photos && cityPhotosData.photos.length > 0) {
      return {
        images: cityPhotosData.photos.map(photo => ({
          url: photo.imageUrl,
          title: photo.title,
        }))
      };
    }
    // Иначе используем хардкод
    return cityLandmarks[selectedCity] || cityLandmarks.default;
  }, [cityPhotosData, selectedCity]);

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
