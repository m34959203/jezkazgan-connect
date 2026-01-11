import { MessageSquare, Clock, DollarSign } from 'lucide-react';
import { CollabRequest } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollabCardProps {
  collab: CollabRequest;
}

const statusLabels = {
  open: { label: 'Открыто', color: 'bg-teal text-white' },
  in_progress: { label: 'В работе', color: 'bg-primary text-primary-foreground' },
  closed: { label: 'Закрыто', color: 'bg-muted text-muted-foreground' },
};

export function CollabCard({ collab }: CollabCardProps) {
  const status = statusLabels[collab.status];
  
  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}ч назад`;
    const days = Math.floor(hours / 24);
    return `${days}д назад`;
  };

  return (
    <article className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Badge variant="outline" className="mb-2">
            {collab.category}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-1">
            {collab.title}
          </h3>
        </div>
        <span className={cn('shrink-0 px-2 py-1 rounded-full text-xs font-medium', status.color)}>
          {status.label}
        </span>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {collab.description}
      </p>

      {/* Автор */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {collab.authorName[0]}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">{collab.authorName}</p>
          <p className="text-xs text-muted-foreground">{collab.businessName}</p>
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

      <Button className="w-full" disabled={collab.status === 'closed'}>
        Откликнуться
      </Button>
    </article>
  );
}
