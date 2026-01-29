import { Link } from 'react-router-dom';
import { Calendar, Eye, ExternalLink, Gift } from 'lucide-react';
import { type Promotion } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface PromotionCardProps {
  promotion: Promotion;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const isExpiringSoon = () => {
    const validUntil = new Date(promotion.validUntil);
    const daysLeft = Math.ceil((validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft > 0;
  };

  const businessName = promotion.business?.name || 'Бизнес';
  const businessLogo = promotion.business?.logo;

  return (
    <article className="event-card h-full flex flex-col group">
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
        {promotion.image ? (
          <img
            src={promotion.image}
            alt={promotion.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Gift className="w-12 h-12 text-primary/40" />
          </div>
        )}

        {/* Скидка */}
        {promotion.discount && (
          <div className="absolute top-3 left-3">
            <span className="badge-gold text-lg font-bold">
              {promotion.discount}
            </span>
          </div>
        )}

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
          {businessLogo ? (
            <img
              src={businessLogo}
              alt={businessName}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {businessName[0]}
              </span>
            </div>
          )}
          <Link
            to={`/businesses/${promotion.businessId}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {businessName}
          </Link>
        </div>

        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {promotion.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {promotion.description || 'Специальное предложение'}
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
              <span>{promotion.viewsCount}</span>
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
