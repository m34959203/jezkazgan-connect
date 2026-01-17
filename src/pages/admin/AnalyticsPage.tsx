import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Building2, Calendar, Eye, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

// Mock analytics data
const overviewStats = [
  {
    title: 'Посещения',
    value: '45,231',
    change: '+12.5%',
    trend: 'up' as const,
    description: 'за последние 30 дней',
  },
  {
    title: 'Уникальных пользователей',
    value: '12,847',
    change: '+8.2%',
    trend: 'up' as const,
    description: 'за последние 30 дней',
  },
  {
    title: 'Новые регистрации',
    value: '523',
    change: '+23.1%',
    trend: 'up' as const,
    description: 'за последние 30 дней',
  },
  {
    title: 'Среднее время на сайте',
    value: '4:32',
    change: '-5.3%',
    trend: 'down' as const,
    description: 'минут',
  },
];

const topCities = [
  { name: 'Алматы', users: 5420, percentage: 38 },
  { name: 'Астана', users: 4210, percentage: 29 },
  { name: 'Шымкент', users: 2100, percentage: 15 },
  { name: 'Караганда', users: 1850, percentage: 13 },
  { name: 'Жезказган', users: 890, percentage: 6 },
];

const topCategories = [
  { name: 'Рестораны', views: 12500, events: 45 },
  { name: 'Развлечения', views: 9800, events: 32 },
  { name: 'Спорт', views: 7600, events: 28 },
  { name: 'Красота', views: 5400, events: 19 },
  { name: 'Образование', views: 3200, events: 12 },
];

const conversionMetrics = [
  { name: 'Просмотр → Регистрация', rate: 4.2, change: '+0.5%' },
  { name: 'Регистрация → Бизнес', rate: 12.5, change: '+2.1%' },
  { name: 'Free → Lite', rate: 8.3, change: '-1.2%' },
  { name: 'Lite → Premium', rate: 15.7, change: '+3.4%' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30days');

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
              <SelectItem value="7days">7 дней</SelectItem>
              <SelectItem value="30days">30 дней</SelectItem>
              <SelectItem value="90days">90 дней</SelectItem>
              <SelectItem value="year">Год</SelectItem>
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
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
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
              Пользователи по городам
            </CardTitle>
            <CardDescription>Распределение активных пользователей</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCities.map((city) => (
                <div key={city.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{city.name}</span>
                    <span className="text-muted-foreground">
                      {city.users.toLocaleString()} ({city.percentage}%)
                    </span>
                  </div>
                  <Progress value={city.percentage} className="h-2" />
                </div>
              ))}
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
              {topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.events} событий
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{category.views.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">просмотров</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Метрики конверсии
          </CardTitle>
          <CardDescription>Воронка пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {conversionMetrics.map((metric) => (
              <div key={metric.name} className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{metric.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.rate}%</span>
                  <Badge
                    variant="secondary"
                    className={metric.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {metric.change}
                  </Badge>
                </div>
              </div>
            ))}
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
                Регистрации выросли на 23% после запуска email-рассылки
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Внимание</span>
              </div>
              <p className="text-sm text-muted-foreground">
                8 бизнесов с Lite подпиской не публиковали контент более 2 недель
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Рекомендация</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Концерты и фестивали показывают лучший CTR - рекомендуем больше такого контента
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
