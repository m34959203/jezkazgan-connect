import { useState } from 'react';
import { Search, X, Gift } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PromotionCard } from '@/components/promotions/PromotionCard';
import { mockPromotions } from '@/data/mockData';

export default function Promotions() {
  const [search, setSearch] = useState('');

  const filteredPromotions = mockPromotions.filter((promo) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      promo.title.toLowerCase().includes(searchLower) ||
      promo.businessName.toLowerCase().includes(searchLower) ||
      promo.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-6 h-6 text-teal" />
              <h1 className="text-3xl md:text-4xl font-bold">Скидки и акции</h1>
            </div>
            <p className="text-muted-foreground">
              Лучшие предложения от бизнесов Жезказгана
            </p>
          </div>

          {/* Поиск */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск акций..."
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
        </div>

        {filteredPromotions.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Акции не найдены
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
