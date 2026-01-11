import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { EVENT_CATEGORIES, EventCategory } from '@/types';
import { mockEvents } from '@/data/mockData';

const categoryImages: Record<EventCategory, string> = {
  concerts: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
  education: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
  seminars: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600',
  leisure: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',
  sports: 'https://images.unsplash.com/photo-1461896836934- voices58a894e?w=600',
  children: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600',
  exhibitions: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600',
  other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
};

export default function Categories() {
  const getEventCount = (category: EventCategory) => {
    return mockEvents.filter(e => e.category === category).length;
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(EVENT_CATEGORIES).map(([key, { label, icon, color }]) => {
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
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="text-4xl mb-2">{icon}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{label}</h3>
                  <p className="text-white/70 text-sm">
                    {count} {count === 1 ? 'событие' : count < 5 ? 'события' : 'событий'}
                  </p>
                </div>

                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
