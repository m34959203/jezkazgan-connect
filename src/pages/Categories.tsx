import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { EVENT_CATEGORIES, EventCategory } from '@/types';
import { fetchCategoryStats, type CategoryStats } from '@/lib/api';
import { Button } from '@/components/ui/button';

const categoryImages: Record<EventCategory, string> = {
  concerts: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
  theater: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600',
  festivals: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',
  education: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
  seminars: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600',
  leisure: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
  sports: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600',
  children: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600',
  exhibitions: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600',
  other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
};

export default function Categories() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategoryStats();
  }, []);

  const loadCategoryStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await fetchCategoryStats();
      setCategoryStats(stats);
    } catch (err) {
      setError('Не удалось загрузить статистику категорий');
      console.error('Failed to load category stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventCount = (category: EventCategory) => {
    return categoryStats?.[category] || 0;
  };

  const formatEventCount = (count: number) => {
    if (count === 0) return '0 событий';
    if (count === 1) return '1 событие';
    if (count >= 2 && count <= 4) return `${count} события`;
    return `${count} событий`;
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Категории событий</h1>
          <p className="text-muted-foreground">
            Выберите интересующую категорию для просмотра событий
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <p className="text-lg text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={loadCategoryStats}>
              Попробовать снова
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(EVENT_CATEGORIES).map(([key, { label, icon }]) => {
              const category = key as EventCategory;
              const count = getEventCount(category);

              return (
                <Link
                  key={category}
                  to={`/?category=${category}`}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
                >
                  <img
                    src={categoryImages[category]}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="text-4xl mb-2">{icon}</div>
                    <h3 className="text-xl font-bold text-white mb-1">{label}</h3>
                    <p className="text-white/70 text-sm">
                      {formatEventCount(count)}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
