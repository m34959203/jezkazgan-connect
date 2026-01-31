import { Link } from 'react-router-dom';
import {
  Eye,
  Calendar,
  Percent,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyBusiness, useMyBusinessStats } from '@/hooks/use-api';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function BusinessStats() {
  const { data: business, isLoading: businessLoading } = useMyBusiness();
  const { data: stats, isLoading: statsLoading } = useMyBusinessStats();

  const businessTier = business?.tier || 'free';
  const isLiteOrHigher = businessTier === 'lite' || businessTier === 'premium';

  if (businessLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Free tier - show upgrade prompt
  if (businessTier === 'free') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Статистика</h1>
          <p className="text-muted-foreground">Анализ эффективности вашего бизнеса</p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Статистика недоступна</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Расширенная статистика доступна начиная с тарифа Lite.
              Отслеживайте просмотры, анализируйте эффективность публикаций и принимайте решения на основе данных.
            </p>
            <Button asChild>
              <Link to="/business/subscription">
                Перейти на Lite
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalViews = stats?.totalViews || 0;
  const eventsTotal = stats?.events?.total || 0;
  const eventsViews = stats?.events?.totalViews || 0;
  const promotionsTotal = stats?.promotions?.total || 0;
  const promotionsViews = stats?.promotions?.totalViews || 0;

  // Calculate average views
  const avgEventViews = eventsTotal > 0 ? Math.round(eventsViews / eventsTotal) : 0;
  const avgPromotionViews = promotionsTotal > 0 ? Math.round(promotionsViews / promotionsTotal) : 0;

  // Sort publications by views for top performers
  const topPublications = [...(stats?.recentPublications || [])]
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Статистика</h1>
        <p className="text-muted-foreground">Анализ эффективности вашего бизнеса</p>
      </div>

      {/* Main stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего просмотров</p>
                <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>Все публикации</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просмотры событий</p>
                <p className="text-3xl font-bold">{eventsViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              ~{avgEventViews} просмотров на событие
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просмотры акций</p>
                <p className="text-3xl font-bold">{promotionsViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Percent className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              ~{avgPromotionViews} просмотров на акцию
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего публикаций</p>
                <p className="text-3xl font-bold">{eventsTotal + promotionsTotal}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {eventsTotal} событий, {promotionsTotal} акций
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views chart placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Просмотры за неделю</CardTitle>
            <CardDescription>Динамика просмотров ваших публикаций</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-2">
              {[35, 55, 40, 75, 60, 85, 65].map((height, i) => {
                const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{days[i]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Publication breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Разбивка по типу</CardTitle>
            <CardDescription>Соотношение событий и акций</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    События
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {eventsTotal} ({eventsTotal + promotionsTotal > 0 ? Math.round((eventsTotal / (eventsTotal + promotionsTotal)) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${eventsTotal + promotionsTotal > 0 ? (eventsTotal / (eventsTotal + promotionsTotal)) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    Акции
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {promotionsTotal} ({eventsTotal + promotionsTotal > 0 ? Math.round((promotionsTotal / (eventsTotal + promotionsTotal)) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${eventsTotal + promotionsTotal > 0 ? (promotionsTotal / (eventsTotal + promotionsTotal)) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Средний охват</span>
                  <span className="font-semibold">
                    {eventsTotal + promotionsTotal > 0
                      ? Math.round(totalViews / (eventsTotal + promotionsTotal))
                      : 0} просмотров
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top publications */}
      <Card>
        <CardHeader>
          <CardTitle>Топ публикации</CardTitle>
          <CardDescription>Самые популярные по просмотрам</CardDescription>
        </CardHeader>
        <CardContent>
          {topPublications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>У вас пока нет публикаций</p>
              <Button variant="link" size="sm" asChild>
                <Link to="/business/publications/events/new">Создать первое событие</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {topPublications.map((pub, index) => (
                <div key={pub.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{pub.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {pub.type === 'event' ? 'Событие' : 'Акция'}
                      </Badge>
                      <span>
                        {formatDistanceToNow(new Date(pub.createdAt), { addSuffix: true, locale: ru })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    {pub.viewsCount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Статус событий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <span className="text-sm">Одобрено</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats?.events?.approved || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <span className="text-sm">На модерации</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {stats?.events?.pending || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">Всего</span>
                <Badge variant="secondary">
                  {stats?.events?.total || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-600" />
              Статус акций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <span className="text-sm">Активные</span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {stats?.promotions?.active || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">Всего</span>
                <Badge variant="secondary">
                  {stats?.promotions?.total || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
