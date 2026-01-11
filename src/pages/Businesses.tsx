import { useState } from 'react';
import { Search, X, Building2, Filter } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { BusinessCard } from '@/components/businesses/BusinessCard';
import { mockBusinesses } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categories = ['Все', 'Рестораны', 'Кафе', 'Спорт', 'Красота', 'Образование', 'Услуги'];

export default function Businesses() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const filteredBusinesses = mockBusinesses.filter((biz) => {
    // Поиск
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        biz.businessName.toLowerCase().includes(searchLower) ||
        biz.description.toLowerCase().includes(searchLower) ||
        biz.category.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Категория
    if (selectedCategory !== 'Все' && biz.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Каталог бизнесов</h1>
          </div>
          <p className="text-muted-foreground">
            Найдите проверенные компании и предпринимателей города
          </p>
        </div>

        {/* Фильтры */}
        <div className="space-y-4 mb-8">
          {/* Поиск */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск бизнесов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input pl-12"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Категории */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'category-tag whitespace-nowrap',
                  selectedCategory === cat && 'bg-primary text-primary-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Результаты */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">
              Бизнесы не найдены
            </p>
            <Button variant="outline" onClick={() => {
              setSearch('');
              setSelectedCategory('Все');
            }}>
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
