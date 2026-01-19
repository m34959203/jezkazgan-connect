import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Building2, Calendar, Eye, Download, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { fetchAdminAnalytics, type AdminAnalyticsData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const categoryLabels: Record<string, string> = {
  concerts: 'Концерты',
  theater: 'Театр',
  sports: 'Спорт',
  exhibitions: 'Выставки',
  festivals: 'Фестивали',
  education: 'Образование',
  children: 'Детям',
  other: 'Другое',
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30');
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAnalytics(parseInt(period));
      setAnalytics(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аналитику',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Не удалось загрузить данные</p>
        <Button onClick={loadAnalytics} className="mt-4">Повторить</Button>
      </div>
    );
  }

  const overviewStats = [
    {
      title: 'Всего пользователей',
      value: analytics.overview.totalUsers.toLocaleString(),
      change: `+${analytics.overview.newUsers}`,
      trend: 'up' as const,
      description: `новых за ${period} дней`,
    },
    {
      title: 'Бизнесов',
      value: analytics.overview.totalBusinesses.toLocaleString(),
      change: `+${analytics.overview.newBusinesses}`,
      trend: 'up' as const,
      description: `новых за ${period} дней`,
    },
    {
      title: 'Событий',
      value: analytics.overview.totalEvents.toLocaleString(),
      change: '',
      trend: 'up' as const,
      description: 'всего на платформе',
    },
    {
      title: 'Просмотров',
      value: analytics.overview.totalViews.toLocaleString(),
      change: '',
      trend: 'up' as const,
      description: 'событий и акций',
    },
  ];

  const totalBusinesses = analytics.tierDistribution.free + analytics.tierDistribution.lite + analytics.tierDistribution.premium;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Аналитика</h1>
          <p className="text-muted-foreground">
            Статистика и метрики платформы
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 дней</SelectItem>
              <SelectItem value="30">30 дней</SelectItem>
              <SelectItem value="90">90 дней</SelectItem>
              <SelectItem value="365">Год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    {stat.change}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Бизнесы по городам
            </CardTitle>
            <CardDescription>Распределение зарегистрированных бизнесов</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.usersByCity.length > 0 ? (
                analytics.usersByCity.map((city) => (
                  <div key={city.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{city.name}</span>
                      <span className="text-muted-foreground">
                        {city.count.toLocaleString()} ({city.percentage}%)
                      </span>
                    </div>
                    <Progress value={city.percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Популярные категории
            </CardTitle>
            <CardDescription>По количеству просмотров</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.eventsByCategory.length > 0 ? (
                analytics.eventsByCategory.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{categoryLabels[category.category] || category.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.count} событий
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{category.views.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">просмотров</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Распределение по тарифам
          </CardTitle>
          <CardDescription>Бизнесы по типам подписки</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Free</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{analytics.tierDistribution.free}</span>
                <Badge variant="secondary">
                  {totalBusinesses > 0 ? Math.round((analytics.tierDistribution.free / totalBusinesses) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Lite</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.tierDistribution.lite}</span>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {totalBusinesses > 0 ? Math.round((analytics.tierDistribution.lite / totalBusinesses) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Premium</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">{analytics.tierDistribution.premium}</span>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {totalBusinesses > 0 ? Math.round((analytics.tierDistribution.premium / totalBusinesses) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Метрики конверсии
          </CardTitle>
          <CardDescription>Premium-пользователи и бизнесы</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Premium пользователей</p>
              <span className="text-2xl font-bold">{analytics.conversionMetrics.premiumUsers}</span>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Premium бизнесов</p>
              <span className="text-2xl font-bold">{analytics.conversionMetrics.premiumBusinesses}</span>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Конверсия в Premium</p>
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                {analytics.conversionMetrics.conversionRate}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick insights */}
      <Card>
        <CardHeader>
          <CardTitle>Ключевые инсайты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Рост</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.overview.newUsers > 0
                  ? `${analytics.overview.newUsers} новых пользователей за последние ${period} дней`
                  : 'Нет новых регистраций за выбранный период'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Бизнес</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.overview.newBusinesses > 0
                  ? `${analytics.overview.newBusinesses} новых бизнесов зарегистрировано`
                  : 'Нет новых бизнесов за выбранный период'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Контент</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.overview.totalEvents} событий и {analytics.overview.totalPromotions} акций на платформе
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
