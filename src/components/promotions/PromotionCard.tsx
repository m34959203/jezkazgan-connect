import { Link } from 'react-router-dom';
import { Calendar, Eye, ExternalLink } from 'lucide-react';
import { Promotion } from '@/types';
import { Button } from '@/components/ui/button';

interface PromotionCardProps {
  promotion: Promotion;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const isExpiringSoon = () => {
    const daysLeft = Math.ceil((promotion.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft > 0;
  };

  return (
    <article className="event-card h-full flex flex-col group">
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
        <img
          src={promotion.image}
          alt={promotion.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Скидка */}
        <div className="absolute top-3 left-3">
          <span className="badge-gold text-lg font-bold">
            {promotion.discount}
          </span>
        </div>

        {/* Скоро заканчивается */}
        {isExpiringSoon() && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
              Скоро закончится
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {/* Бизнес */}
        <div className="flex items-center gap-2 mb-2">
          {promotion.businessLogo ? (
            <img
              src={promotion.businessLogo}
              alt={promotion.businessName}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {promotion.businessName[0]}
              </span>
            </div>
          )}
          <Link 
            to={`/businesses/${promotion.businessId}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {promotion.businessName}
          </Link>
        </div>

        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {promotion.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {promotion.description}
        </p>

        {promotion.conditions && (
          <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded mb-3">
            {promotion.conditions}
          </p>
        )}

        <div className="mt-auto space-y-3">
          {/* Срок действия */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              до {formatDate(promotion.validUntil)}
            </span>
          </div>

          {/* Действия */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{promotion.viewCount}</span>
            </div>
            <Button size="sm" className="btn-glow">
              Получить
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
