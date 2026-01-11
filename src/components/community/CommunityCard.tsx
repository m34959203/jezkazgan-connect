import { Link } from 'react-router-dom';
import { Users, Lock } from 'lucide-react';
import { Community } from '@/types';
import { Button } from '@/components/ui/button';

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Link to={`/community/${community.id}`} className="block group">
      <article className="event-card h-full flex flex-col">
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
          <img
            src={community.image}
            alt={community.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {community.isPrivate && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                <Lock className="w-3 h-3" />
                Закрытое
              </span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-semibold text-white line-clamp-1">
              {community.name}
            </h3>
            <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
              <Users className="w-4 h-4" />
              <span>{community.memberCount} участников</span>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {community.description}
          </p>

          <Button className="mt-auto w-full" variant="outline">
            Присоединиться
          </Button>
        </div>
      </article>
    </Link>
  );
}
