import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Bookmark, Eye } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured' | 'compact';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const category = EVENT_CATEGORIES[event.category];
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const formatPrice = (price: number | null, maxPrice?: number) => {
    if (price === null) return 'Бесплатно';
    if (maxPrice) return `${price.toLocaleString()} - ${maxPrice.toLocaleString()} ₸`;
    return `${price.toLocaleString()} ₸`;
  };

  if (variant === 'featured') {
    return (
      <Link to={`/events/${event.id}`} className="block group">
        <article className="event-card overflow-hidden">
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Категория */}
            <div className="absolute top-4 left-4">
              <span className={cn('badge-gold', category.color)}>
                {category.icon} {category.label}
              </span>
            </div>

            {/* Избранное */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            >
              <Bookmark className="w-5 h-5" />
            </Button>

            {/* Контент */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                {event.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className={cn(
                  'text-lg font-bold',
                  event.price === null ? 'text-teal-light' : 'text-white'
                )}>
                  {formatPrice(event.price, event.maxPrice)}
                </span>
                <div className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {event.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    {event.saveCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/events/${event.id}`} className="block group">
        <article className="flex gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">{category.icon}</span>
              <span className="text-xs text-muted-foreground">{category.label}</span>
            </div>
            <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {event.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{formatDate(event.date)}</span>
              <span>•</span>
              <span>{event.time}</span>
            </div>
            <span className={cn(
              'text-sm font-medium mt-1 block',
              event.price === null ? 'text-teal' : 'text-foreground'
            )}>
              {formatPrice(event.price)}
            </span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <article className="event-card h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Дата */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center shadow-sm">
            <div className="text-lg font-bold text-foreground leading-none">
              {new Date(event.date).getDate()}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(event.date)}
            </div>
          </div>

          {/* Категория */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-foreground">
              {category.icon} {category.label}
            </Badge>
          </div>

          {/* Бесплатно */}
          {event.price === null && (
            <div className="absolute bottom-3 left-3">
              <span className="badge-teal">Бесплатно</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
            <span className={cn(
              'font-semibold',
              event.price === null ? 'text-teal' : 'text-foreground'
            )}>
              {formatPrice(event.price, event.maxPrice)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Добавить в избранное
              }}
            >
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
