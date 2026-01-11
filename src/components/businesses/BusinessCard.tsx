import { Link } from 'react-router-dom';
import { MapPin, Phone, Instagram, CheckCircle } from 'lucide-react';
import { EntrepreneurProfile } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BusinessCardProps {
  business: EntrepreneurProfile;
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link to={`/businesses/${business.id}`} className="block group">
      <article className="event-card h-full flex flex-col">
        {/* Обложка */}
        <div className="relative h-32 overflow-hidden rounded-t-xl">
          <img
            src={business.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'}
            alt={business.businessName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Логотип */}
          <div className="absolute -bottom-6 left-4">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.businessName}
                className="w-14 h-14 rounded-xl object-cover border-4 border-card shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center border-4 border-card shadow-md">
                <span className="text-xl font-bold text-primary-foreground">
                  {business.businessName[0]}
                </span>
              </div>
            )}
          </div>

          {/* Верифицирован */}
          {business.isVerified && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm gap-1">
                <CheckCircle className="w-3 h-3 text-teal" />
                Проверено
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 pt-8 flex flex-col">
          {/* Категория */}
          <Badge variant="outline" className="w-fit mb-2 text-xs">
            {business.category}
          </Badge>

          {/* Название */}
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors mb-1">
            {business.businessName}
          </h3>

          {/* Описание */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {business.description}
          </p>

          {/* Адрес */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{business.address}</span>
          </div>

          {/* Контакты */}
          <div className="mt-auto flex items-center gap-2 pt-3 border-t border-border/50">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={`tel:${business.phone}`} onClick={(e) => e.stopPropagation()}>
                <Phone className="w-4 h-4 mr-1" />
                Позвонить
              </a>
            </Button>
            {business.instagram && (
              <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <a 
                  href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
