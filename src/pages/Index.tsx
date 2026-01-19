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
// Фото из Wikimedia Commons (лицензия CC)
const cityLandmarks: Record<string, { images: { url: string; title: string }[] }> = {
  // Жезказган - Улытауская область
  jezkazgan: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zhezkazgan_view.jpg/1280px-Zhezkazgan_view.jpg', title: 'Вид на Жезказган' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Kengir_Reservoir.jpg/1280px-Kengir_Reservoir.jpg', title: 'Кенгирское водохранилище' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Metallurgov_Square_Zhezkazgan.jpg/1280px-Metallurgov_Square_Zhezkazgan.jpg', title: 'Площадь Металлургов' },
    ]
  },
  // Алматы - крупнейший город
  almaty: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Medeu_skating_rink.jpg/1280px-Medeu_skating_rink.jpg', title: 'Каток Медеу' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Kok_tobe_almaty.jpg/1280px-Kok_tobe_almaty.jpg', title: 'Кок-Тобе' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Almaty_-_panorama.jpg/1280px-Almaty_-_panorama.jpg', title: 'Панорама Алматы' },
    ]
  },
  // Астана - столица
  astana: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bayterek_tower_Astana_1.jpg/800px-Bayterek_tower_Astana_1.jpg', title: 'Байтерек' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Khan_Shatyr_Entertainment_Center_in_Astana.jpg/1280px-Khan_Shatyr_Entertainment_Center_in_Astana.jpg', title: 'Хан Шатыр' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Central_Downtown_Astana_2.jpg/1280px-Central_Downtown_Astana_2.jpg', title: 'Центр Астаны' },
    ]
  },
  // Шымкент - третий по величине город
  shymkent: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Shymkent_Plaza.jpg/1280px-Shymkent_Plaza.jpg', title: 'Шымкент Плаза' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Shymkent_city_center.jpg/1280px-Shymkent_city_center.jpg', title: 'Центр Шымкента' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Ordabasy_Square_Shymkent.jpg/1280px-Ordabasy_Square_Shymkent.jpg', title: 'Площадь Ордабасы' },
    ]
  },
  // Караганда - индустриальный центр
  karaganda: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Karagandy_city%2C_Kazakhstan.jpg/1280px-Karagandy_city%2C_Kazakhstan.jpg', title: 'Караганда' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Karaganda_Miners_Palace.jpg/1280px-Karaganda_Miners_Palace.jpg', title: 'Дворец горняков' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Central_Park_Karaganda.jpg/1280px-Central_Park_Karaganda.jpg', title: 'Центральный парк' },
    ]
  },
  // Актобе
  aktobe: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Aktobe_city_view.jpg/1280px-Aktobe_city_view.jpg', title: 'Вид на Актобе' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Rixos_Hotel_Aktobe.jpg/1280px-Rixos_Hotel_Aktobe.jpg', title: 'Отель Риксос' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Aktobe_Mosque.jpg/1280px-Aktobe_Mosque.jpg', title: 'Мечеть Актобе' },
    ]
  },
  // Тараз - древний город
  taraz: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Aisha_Bibi_Mausoleum.jpg/1280px-Aisha_Bibi_Mausoleum.jpg', title: 'Мавзолей Айша-Биби' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Taraz_City_Center.jpg/1280px-Taraz_City_Center.jpg', title: 'Центр Тараза' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Karakhan_Mausoleum_Taraz.jpg/1280px-Karakhan_Mausoleum_Taraz.jpg', title: 'Мавзолей Карахана' },
    ]
  },
  // Павлодар
  pavlodar: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Pavlodar_City.jpg/1280px-Pavlodar_City.jpg', title: 'Павлодар' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Irtysh_River_Pavlodar.jpg/1280px-Irtysh_River_Pavlodar.jpg', title: 'Река Иртыш' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Mashkhur_Zhusup_Mosque_Pavlodar.jpg/1280px-Mashkhur_Zhusup_Mosque_Pavlodar.jpg', title: 'Мечеть Машхур Жусупа' },
    ]
  },
  // Усть-Каменогорск
  'ust-kamenogorsk': {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ust-Kamenogorsk_view.jpg/1280px-Ust-Kamenogorsk_view.jpg', title: 'Вид на Усть-Каменогорск' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Irtysh_Ust-Kamenogorsk.jpg/1280px-Irtysh_Ust-Kamenogorsk.jpg', title: 'Иртыш в Усть-Каменогорске' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Altai_Mountains_Kazakhstan.jpg/1280px-Altai_Mountains_Kazakhstan.jpg', title: 'Алтайские горы' },
    ]
  },
  // Семей (бывший Семипалатинск)
  semey: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Semey_bridge.jpg/1280px-Semey_bridge.jpg', title: 'Мост через Иртыш' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Abay_museum_Semey.jpg/1280px-Abay_museum_Semey.jpg', title: 'Музей Абая' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Dostoyevsky_Museum_Semey.jpg/1280px-Dostoyevsky_Museum_Semey.jpg', title: 'Музей Достоевского' },
    ]
  },
  // Атырау - нефтяная столица
  atyrau: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Atyrau_skyline.jpg/1280px-Atyrau_skyline.jpg', title: 'Атырау' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Ural_River_Atyrau.jpg/1280px-Ural_River_Atyrau.jpg', title: 'Река Урал' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Atyrau_Bridge.jpg/1280px-Atyrau_Bridge.jpg', title: 'Мост Европа-Азия' },
    ]
  },
  // Костанай
  kostanay: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Kostanay_center.jpg/1280px-Kostanay_center.jpg', title: 'Центр Костаная' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Kostanay_regional_mosque.jpg/1280px-Kostanay_regional_mosque.jpg', title: 'Областная мечеть' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Tobol_River_Kostanay.jpg/1280px-Tobol_River_Kostanay.jpg', title: 'Река Тобол' },
    ]
  },
  // Кызылорда
  kyzylorda: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kyzylorda_city.jpg/1280px-Kyzylorda_city.jpg', title: 'Кызылорда' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Syr_Darya_River.jpg/1280px-Syr_Darya_River.jpg', title: 'Река Сырдарья' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Korkyt_Ata_monument.jpg/1280px-Korkyt_Ata_monument.jpg', title: 'Монумент Коркыт-Ата' },
    ]
  },
  // Уральск
  uralsk: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Uralsk_city.jpg/1280px-Uralsk_city.jpg', title: 'Уральск' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Pugachev_house_Uralsk.jpg/1280px-Pugachev_house_Uralsk.jpg', title: 'Дом-музей Пугачёва' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Ural_river_Uralsk.jpg/1280px-Ural_river_Uralsk.jpg', title: 'Река Урал' },
    ]
  },
  // Петропавловск
  petropavlovsk: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Petropavlovsk_Kazakhstan.jpg/1280px-Petropavlovsk_Kazakhstan.jpg', title: 'Петропавловск' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Ishim_River_Petropavlovsk.jpg/1280px-Ishim_River_Petropavlovsk.jpg', title: 'Река Ишим' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Abylay_Khan_Residence.jpg/1280px-Abylay_Khan_Residence.jpg', title: 'Резиденция Абылай-хана' },
    ]
  },
  // Актау - город на Каспии
  aktau: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Aktau_seaside.jpg/1280px-Aktau_seaside.jpg', title: 'Набережная Актау' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Caspian_Sea_Aktau.jpg/1280px-Caspian_Sea_Aktau.jpg', title: 'Каспийское море' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Aktau_lighthouse.jpg/1280px-Aktau_lighthouse.jpg', title: 'Маяк Актау' },
    ]
  },
  // Талдыкорган
  taldykorgan: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Taldykorgan_city.jpg/1280px-Taldykorgan_city.jpg', title: 'Талдыкорган' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Zhetysu_mountains.jpg/1280px-Zhetysu_mountains.jpg', title: 'Горы Жетысу' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Karatal_River.jpg/1280px-Karatal_River.jpg', title: 'Река Каратал' },
    ]
  },
  // Кокшетау - край озёр
  kokshetau: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Burabay_Lake.jpg/1280px-Burabay_Lake.jpg', title: 'Озеро Боровое' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Burabay_National_Park.jpg/1280px-Burabay_National_Park.jpg', title: 'Бурабай' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Okzhetpes_rock.jpg/1280px-Okzhetpes_rock.jpg', title: 'Скала Окжетпес' },
    ]
  },
  // Туркестан - духовная столица
  turkestan: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Khoja_Ahmed_Yasawi_Mausoleum.jpg/1280px-Khoja_Ahmed_Yasawi_Mausoleum.jpg', title: 'Мавзолей Ходжи Ахмеда Ясави' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Turkestan_city.jpg/1280px-Turkestan_city.jpg', title: 'Туркестан' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Arystan_Bab_Mausoleum.jpg/1280px-Arystan_Bab_Mausoleum.jpg', title: 'Мавзолей Арыстан-Баба' },
    ]
  },
  // Экибастуз - угольная столица
  ekibastuz: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Ekibastuz_GRES.jpg/1280px-Ekibastuz_GRES.jpg', title: 'Экибастузская ГРЭС' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bogatyr_coal_mine.jpg/1280px-Bogatyr_coal_mine.jpg', title: 'Разрез Богатырь' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ekibastuz_city.jpg/1280px-Ekibastuz_city.jpg', title: 'Экибастуз' },
    ]
  },
  // Конаев (бывший Капшагай)
  konaev: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Kapchagay_reservoir.jpg/1280px-Kapchagay_reservoir.jpg', title: 'Капчагайское водохранилище' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ili_River_Kazakhstan.jpg/1280px-Ili_River_Kazakhstan.jpg', title: 'Река Или' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Kapchagay_beach.jpg/1280px-Kapchagay_beach.jpg', title: 'Пляж Капчагая' },
    ]
  },
  // Fallback для городов без фото
  default: {
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Kazakhstan_location_map.svg/1280px-Kazakhstan_location_map.svg.png', title: 'Карта Казахстана' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Charyn_Canyon.jpg/1280px-Charyn_Canyon.jpg', title: 'Чарынский каньон' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kolsai_Lake_1.jpg/1280px-Kolsai_Lake_1.jpg', title: 'Кольсайские озёра' },
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
