import { Link } from 'react-router-dom';
import {
  Eye,
  Phone,
  FileText,
  TrendingUp,
  Plus,
  Calendar,
  Percent,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMyBusiness, useMyBusinessStats } from '@/hooks/use-api';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const activityIcons = {
  approved: CheckCircle,
  review: Star,
  views: Eye,
  pending: Clock,
  rejected: XCircle,
};

const activityColors = {
  approved: 'text-green-600',
  review: 'text-amber-500',
  views: 'text-blue-600',
  pending: 'text-amber-600',
  rejected: 'text-red-600',
};

const tierLabels = {
  free: 'Free',
  lite: 'Lite',
  premium: 'Premium',
};

export default function BusinessDashboard() {
  const { data: business, isLoading: businessLoading } = useMyBusiness();
  const { data: stats, isLoading: statsLoading } = useMyBusinessStats();

  // Tier limits
  const tierLimits = { free: 3, lite: 10, premium: 999 };
  const businessTier = (business?.tier || 'free') as keyof typeof tierLimits;
  const postsLimit = tierLimits[businessTier];
  const postsUsed = business?.postsThisMonth || 0;
  const postsRemaining = postsLimit - postsUsed;
  const postsPercentage = (postsUsed / postsLimit) * 100;

  // Calculate total views from stats
  const totalViews = stats?.totalViews || 0;

  // Build recent activity from stats
  const recentActivity = (stats?.recentPublications || []).map((pub) => ({
    id: pub.id,
    type: pub.status === 'approved' || pub.status === 'active' ? 'approved' : pub.status === 'pending' ? 'pending' : 'views',
    title: `${pub.type === 'event' ? 'Событие' : 'Акция'} "${pub.title}" - ${pub.viewsCount} просмотров`,
    time: formatDistanceToNow(new Date(pub.createdAt), { addSuffix: true, locale: ru }),
  }));

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upgrade banner for Free/Lite */}
      {businessTier !== 'premium' && (
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">
                    Вы используете тариф {tierLabels[businessTier]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {businessTier === 'free'
                      ? `Осталось ${postsRemaining} из ${postsLimit} публикаций. Перейдите на Lite для расширенной статистики.`
                      : `Осталось ${postsRemaining} публикаций. Перейдите на Premium для безлимита и рекламного баннера.`}
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link to="/business/subscription">
                  {businessTier === 'free' ? 'Перейти на Lite' : 'Перейти на Premium'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Дашборд</h1>
        <p className="text-muted-foreground">Обзор вашего бизнеса</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просмотры</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Всего просмотров публикаций</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">События</p>
                <p className="text-2xl font-bold">{stats?.events?.total || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.events?.approved || 0} одобрено, {stats?.events?.pending || 0} на модерации
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Акции</p>
                <p className="text-2xl font-bold">{stats?.promotions?.total || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Percent className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.promotions?.active || 0} активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Публикации</p>
                <p className="text-2xl font-bold">{postsUsed}/{postsLimit}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <Progress value={postsPercentage} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/business/publications/events/new">
                <Calendar className="w-4 h-4 mr-2" />
                Создать событие
                <Plus className="w-4 h-4 ml-auto" />
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/business/publications/promotions/new">
                <Percent className="w-4 h-4 mr-2" />
                Добавить акцию
                <Plus className="w-4 h-4 ml-auto" />
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/business/profile">
                Редактировать профиль
              </Link>
            </Button>

            {postsRemaining === 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Лимит исчерпан</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Улучшите тариф для новых публикаций
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats summary card */}
        <Card>
          <CardHeader>
            <CardTitle>Сводка</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Всего публикаций</span>
                <span className="font-medium">{(stats?.events?.total || 0) + (stats?.promotions?.total || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Активных событий</span>
                <span className="font-medium">{stats?.events?.approved || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Активных акций</span>
                <span className="font-medium">{stats?.promotions?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">На модерации</span>
                <span className="font-medium">{stats?.events?.pending || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart placeholder for Lite+ */}
        <Card>
          <CardHeader>
            <CardTitle>Просмотры за неделю</CardTitle>
          </CardHeader>
          <CardContent>
            {businessTier === 'free' ? (
              <div className="h-32 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Графики доступны в тарифе Lite
                </p>
                <Button variant="link" size="sm" asChild>
                  <Link to="/business/subscription">Улучшить тариф</Link>
                </Button>
              </div>
            ) : (
              <div className="h-32 flex items-end gap-1">
                {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
          <CardDescription>Ваши публикации</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>У вас пока нет публикаций</p>
              <Button variant="link" size="sm" asChild>
                <Link to="/business/publications/events/new">Создать первое событие</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activityIcons[activity.type as keyof typeof activityIcons] || Eye;
                const colorClass = activityColors[activity.type as keyof typeof activityColors] || 'text-blue-600';

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
