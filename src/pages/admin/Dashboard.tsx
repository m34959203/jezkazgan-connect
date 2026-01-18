import { Link } from 'react-router-dom';
import { Users, Building2, Calendar, Tag, TrendingUp, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminStats } from '@/hooks/use-api';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
        <p className="text-muted-foreground">Не удалось загрузить статистику</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Пользователи',
      value: stats?.users ?? 0,
      icon: Users,
      description: `+${stats?.newUsersThisMonth ?? 0} за месяц`,
    },
    {
      title: 'Бизнесы',
      value: stats?.businesses ?? 0,
      icon: Building2,
      description: `${stats?.pendingBusinesses ?? 0} на проверке`,
    },
    {
      title: 'События',
      value: stats?.events ?? 0,
      icon: Calendar,
      description: `${stats?.pendingEvents ?? 0} на модерации`,
    },
    {
      title: 'Акции',
      value: stats?.promotions ?? 0,
      icon: Tag,
      description: 'Активных акций',
    },
  ];

  const pendingTasks = [
    { id: 1, title: 'Верификация бизнесов', count: stats?.pendingBusinesses ?? 0, href: '/admin/businesses' },
    { id: 2, title: 'События на модерации', count: stats?.pendingEvents ?? 0, href: '/admin/events' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Обзор платформы Afisha.kz
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Требуют внимания
            </CardTitle>
            <CardDescription>Задачи, ожидающие вашего действия</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Link
                  key={task.id}
                  to={task.href}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{task.title}</span>
                  <Badge variant="secondary">{task.count}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Обзор за месяц
            </CardTitle>
            <CardDescription>Статистика за последние 30 дней</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Новых пользователей</span>
                </div>
                <span className="font-bold text-lg">{stats?.newUsersThisMonth ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <span>Ожидают проверки</span>
                </div>
                <span className="font-bold text-lg">{stats?.pendingBusinesses ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span>На модерации</span>
                </div>
                <span className="font-bold text-lg">{stats?.pendingEvents ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/businesses">
                <Building2 className="w-4 h-4 mr-2" />
                Верифицировать бизнес
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/events">
                <Calendar className="w-4 h-4 mr-2" />
                Модерировать события
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Управление пользователями
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">
                <TrendingUp className="w-4 h-4 mr-2" />
                Посмотреть отчёты
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
