import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EVENT_CATEGORIES, EventCategory, DateFilter, PriceFilter, EventFilters as Filters } from '@/types';
import { cn } from '@/lib/utils';

interface EventFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const dateFilters: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'На неделе' },
  { value: 'month', label: 'В этом месяце' },
];

const priceFilters: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'Любая цена' },
  { value: 'free', label: 'Бесплатно' },
  { value: 'paid', label: 'Платно' },
];

export function EventFiltersComponent({ filters, onChange }: EventFiltersProps) {
  const handleSearchChange = (search: string) => {
    onChange({ ...filters, search });
  };

  const handleCategoryChange = (category: EventCategory | 'all') => {
    onChange({ ...filters, category });
  };

  const handleDateChange = (date: DateFilter) => {
    onChange({ ...filters, date });
  };

  const handlePriceChange = (price: PriceFilter) => {
    onChange({ ...filters, price });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      category: 'all',
      date: 'all',
      price: 'all',
    });
  };

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.date !== 'all' || filters.price !== 'all';

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск событий, организаторов, мест..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input pl-12"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Категории */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
        <button
          onClick={() => handleCategoryChange('all')}
          className={cn(
            'category-tag whitespace-nowrap',
            filters.category === 'all' && 'bg-primary text-primary-foreground'
          )}
        >
          ✨ Все
        </button>
        {Object.entries(EVENT_CATEGORIES).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key as EventCategory)}
            className={cn(
              'category-tag whitespace-nowrap',
              filters.category === key && 'bg-primary text-primary-foreground'
            )}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Дата и цена */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {dateFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleDateChange(value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                filters.date === value
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {priceFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handlePriceChange(value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                filters.price === value
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Сбросить
          </Button>
        )}
      </div>
    </div>
  );
}
