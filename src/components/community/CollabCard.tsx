import { MessageSquare, Clock, DollarSign, Loader2, Check } from 'lucide-react';
import { type Collaboration, COLLAB_CATEGORY_LABELS, COLLAB_STATUS_LABELS } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollabCardProps {
  collab: Collaboration;
  onRespond: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
}

const statusColors = {
  open: 'bg-teal text-white',
  in_progress: 'bg-primary text-primary-foreground',
  closed: 'bg-muted text-muted-foreground',
};

export function CollabCard({ collab, onRespond, isLoading, isLoggedIn }: CollabCardProps) {
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'только что';
    if (hours < 24) return `${hours}ч назад`;
    const days = Math.floor(hours / 24);
    return `${days}д назад`;
  };

  const categoryLabel = COLLAB_CATEGORY_LABELS[collab.category] || collab.category;
  const statusLabel = COLLAB_STATUS_LABELS[collab.status];
  const statusColor = statusColors[collab.status];

  const isDisabled = collab.status === 'closed' || collab.hasResponded || isLoading;

  return (
    <article className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Badge variant="outline" className="mb-2">
            {categoryLabel}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-1">
            {collab.title}
          </h3>
        </div>
        <span className={cn('shrink-0 px-2 py-1 rounded-full text-xs font-medium', statusColor)}>
          {statusLabel}
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {collab.description}
      </p>

      {/* Автор */}
      <div className="flex items-center gap-2 mb-3">
        {collab.creatorAvatar ? (
          <img
            src={collab.creatorAvatar}
            alt={collab.creatorName || ''}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {(collab.creatorName || 'U')[0].toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm font-medium">{collab.creatorName || 'Пользователь'}</p>
          {collab.businessName && (
            <p className="text-xs text-muted-foreground">{collab.businessName}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
        {collab.budget && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{collab.budget}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{timeAgo(collab.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-4 h-4" />
          <span>{collab.responseCount} откликов</span>
        </div>
      </div>

      {isLoggedIn ? (
        <Button
          className="w-full"
          disabled={isDisabled}
          onClick={onRespond}
          variant={collab.hasResponded ? 'outline' : 'default'}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : collab.hasResponded ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Вы откликнулись
            </>
          ) : collab.status === 'closed' ? (
            'Закрыто'
          ) : (
            'Откликнуться'
          )}
        </Button>
      ) : (
        <Button className="w-full" variant="outline" onClick={onRespond}>
          Войти для отклика
        </Button>
      )}
    </article>
  );
}
