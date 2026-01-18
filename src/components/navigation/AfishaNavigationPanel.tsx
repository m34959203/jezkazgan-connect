import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Percent,
  Star,
  Baby,
  Ticket,
  Gift,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { EVENT_CATEGORIES, EventCategory } from '@/types';

export interface AfishaFilters {
  search: string;
  category: EventCategory | 'all';
  selectedDate: Date | null;
  showDiscounts: boolean;
  showFeatured: boolean;
  showChildren: boolean;
  showFree: boolean;
}

interface AfishaNavigationPanelProps {
  cityName: string;
  filters: AfishaFilters;
  onChange: (filters: AfishaFilters) => void;
  onViewAll?: () => void;
}

// Генерация дат на 180 дней вперед
function generateDates(startDate: Date, count: number = 180): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
}

// Форматирование дня недели
function getDayName(date: Date): string {
  const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
  return days[date.getDay()];
}

// Форматирование месяца
function getMonthName(date: Date): string {
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return months[date.getMonth()];
}

// Проверка выходного дня
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Проверка сегодняшнего дня
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Проверка первого дня месяца или первого дня в списке
function isFirstDayOfMonth(date: Date, index: number): boolean {
  return date.getDate() === 1 || index === 0;
}

export function AfishaNavigationPanel({
  cityName,
  filters,
  onChange,
  onViewAll
}: AfishaNavigationPanelProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [discountPopoverOpen, setDiscountPopoverOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  const dates = useMemo(() => generateDates(new Date()), []);

  // Ширина одного элемента даты (min-w-[52px] + padding + gap)
  const DATE_ITEM_WIDTH = 56; // 52px + 4px gap

  // Проверка возможности скролла
  const checkScrollability = () => {
    if (dateScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = dateScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Инициализация и обработка изменения размера
  useEffect(() => {
    checkScrollability();
    const scrollContainer = dateScrollRef.current;

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);

      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, []);

  const handleDateSelect = (date: Date) => {
    if (filters.selectedDate?.toDateString() === date.toDateString()) {
      onChange({ ...filters, selectedDate: null });
    } else {
      onChange({ ...filters, selectedDate: date });
    }
  };

  const handleCategoryChange = (category: EventCategory | 'all') => {
    onChange({ ...filters, category });
    setCategoryPopoverOpen(false);
  };

  const handleSearchChange = (search: string) => {
    onChange({ ...filters, search });
  };

  // Прокрутка на определенное количество элементов
  const scrollDates = (direction: 'left' | 'right') => {
    if (dateScrollRef.current) {
      const container = dateScrollRef.current;
      const visibleItems = Math.floor(container.clientWidth / DATE_ITEM_WIDTH);
      const scrollAmount = DATE_ITEM_WIDTH * Math.max(1, visibleItems - 1);

      const newScrollLeft = direction === 'left'
        ? Math.max(0, container.scrollLeft - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + scrollAmount);

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'all' ||
    filters.selectedDate !== null ||
    filters.showDiscounts ||
    filters.showFeatured ||
    filters.showChildren ||
    filters.showFree;

  const clearFilters = () => {
    onChange({
      search: '',
      category: 'all',
      selectedDate: null,
      showDiscounts: false,
      showFeatured: false,
      showChildren: false,
      showFree: false,
    });
    setShowSearch(false);
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="container py-4">
        {/* Заголовок секции */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Развлечения {cityName}
          </h2>
          <Link to="/categories" onClick={onViewAll}>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
              Все
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Календарь дат */}
        <div className="relative mb-4">
          {/* Кнопка прокрутки влево */}
          <button
            onClick={() => scrollDates('left')}
            disabled={!canScrollLeft}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-background/90 backdrop-blur-sm border border-border rounded-full shadow-md transition-all duration-200",
              canScrollLeft
                ? "hover:bg-muted hover:scale-110 active:scale-95 opacity-100"
                : "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Даты */}
          <div
            ref={dateScrollRef}
            className="flex gap-1 overflow-x-auto hide-scrollbar px-10 py-2"
          >
            {dates.map((date, index) => {
              const isSelected = filters.selectedDate?.toDateString() === date.toDateString();
              const weekend = isWeekend(date);
              const today = isToday(date);
              const showMonth = isFirstDayOfMonth(date, index);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    'flex flex-col items-center min-w-[52px] px-2 py-2 rounded-xl transition-all duration-200',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'hover:bg-muted hover:scale-102',
                    today && !isSelected && 'ring-2 ring-primary/40 bg-primary/5'
                  )}
                >
                  <span className={cn(
                    'text-[10px] font-medium uppercase tracking-wide',
                    weekend && !isSelected ? 'text-destructive' : '',
                    isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}>
                    {showMonth ? getMonthName(date) : getDayName(date)}
                  </span>
                  <span className={cn(
                    'text-lg font-bold',
                    isSelected ? 'text-primary-foreground' : '',
                    weekend && !isSelected ? 'text-destructive' : ''
                  )}>
                    {date.getDate()}
                  </span>
                  {!showMonth && (
                    <span className={cn(
                      'text-[9px] font-medium',
                      isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground/60'
                    )}>
                      {getMonthName(date)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Кнопка прокрутки вправо */}
          <button
            onClick={() => scrollDates('right')}
            disabled={!canScrollRight}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-background/90 backdrop-blur-sm border border-border rounded-full shadow-md transition-all duration-200",
              canScrollRight
                ? "hover:bg-muted hover:scale-110 active:scale-95 opacity-100"
                : "opacity-0 pointer-events-none"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Строка поиска (показывается при клике на иконку) */}
        {showSearch && (
          <div className="relative mb-4 animate-fade-in">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск событий, концертов, выставок..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/60"
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearch(false);
                handleSearchChange('');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Фильтры-чипы */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Поиск */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'rounded-full gap-2 transition-all duration-200 hover:scale-105 active:scale-95',
              showSearch && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Сортировка */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>

          {/* Тип мероприятия */}
          <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'rounded-full gap-2 transition-all duration-200 hover:scale-105 active:scale-95',
                  filters.category !== 'all' && 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                <Ticket className="w-4 h-4" />
                {filters.category === 'all'
                  ? 'Тип мероприятия'
                  : EVENT_CATEGORIES[filters.category].label}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    filters.category === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Все категории
                </button>
                {Object.entries(EVENT_CATEGORIES).map(([key, { label, icon }]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key as EventCategory)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                      filters.category === key
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Скидки */}
          <Popover open={discountPopoverOpen} onOpenChange={setDiscountPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'rounded-full gap-2 transition-all duration-200 hover:scale-105 active:scale-95',
                  (filters.showDiscounts || filters.showFree) && 'bg-teal text-white hover:bg-teal/90'
                )}
              >
                <Percent className="w-4 h-4" />
                Скидки
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={filters.showDiscounts}
                    onCheckedChange={(checked) =>
                      onChange({ ...filters, showDiscounts: checked as boolean })
                    }
                  />
                  <span className="text-sm">Со скидкой</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={filters.showFree}
                    onCheckedChange={(checked) =>
                      onChange({ ...filters, showFree: checked as boolean })
                    }
                  />
                  <span className="text-sm">Бесплатно</span>
                </label>
              </div>
            </PopoverContent>
          </Popover>

          {/* Выбор Афиши (Featured) */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'rounded-full gap-2 transition-all duration-200 hover:scale-105 active:scale-95',
              filters.showFeatured && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={() => onChange({ ...filters, showFeatured: !filters.showFeatured })}
          >
            <Star className="w-4 h-4" />
            Выбор Афиши
          </Button>

          {/* Детские */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'rounded-full gap-2 transition-all duration-200 hover:scale-105 active:scale-95',
              filters.showChildren && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={() => onChange({ ...filters, showChildren: !filters.showChildren })}
          >
            <Baby className="w-4 h-4" />
            Детские
          </Button>

          {/* Сбросить фильтры */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={clearFilters}
            >
              <X className="w-4 h-4" />
              Сбросить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
