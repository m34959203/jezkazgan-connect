import { Users, Building2, Calendar, Tag, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock stats - в реальности будут из API
const stats = [
  {
    title: 'Пользователи',
    value: '1,234',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Бизнесы',
    value: '156',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Building2,
  },
  {
    title: 'События',
    value: '45',
    change: '+23%',
    changeType: 'positive' as const,
    icon: Calendar,
  },
  {
    title: 'Акции',
    value: '89',
    change: '-5%',
    changeType: 'negative' as const,
    icon: Tag,
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'business',
    title: 'Новый бизнес: "Кофейня Арома"',
    city: 'Алматы',
    time: '10 минут назад',
    status: 'pending',
  },
  {
    id: 2,
    type: 'event',
    title: 'Событие: "Концерт Димаша"',
    city: 'Астана',
    time: '25 минут назад',
    status: 'approved',
  },
  {
    id: 3,
    type: 'user',
    title: 'Новый пользователь: Айдар К.',
    city: 'Караганда',
    time: '1 час назад',
    status: 'approved',
  },
  {
    id: 4,
    type: 'complaint',
    title: 'Жалоба на бизнес "ТехноМир"',
    city: 'Шымкент',
    time: '2 часа назад',
    status: 'pending',
  },
];

const pendingTasks = [
  { id: 1, title: 'Верификация бизнесов', count: 5 },
  { id: 2, title: 'События на модерации', count: 12 },
  { id: 3, title: 'Жалобы пользователей', count: 3 },
  { id: 4, title: 'Истекающие подписки', count: 8 },
];

export default function Dashboard() {
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
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {stat.change}
                </span>{' '}
                за последний месяц
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
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-medium">{task.title}</span>
                  <Badge variant="secondary">{task.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Последняя активность
            </CardTitle>
            <CardDescription>Недавние события на платформе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      activity.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.city} · {activity.time}
                    </p>
                  </div>
                  {activity.status === 'pending' && (
                    <Badge variant="outline" className="shrink-0">
                      Ожидает
                    </Badge>
                  )}
                </div>
              ))}
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
            <Button>
              <Building2 className="w-4 h-4 mr-2" />
              Верифицировать бизнес
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Модерировать события
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Добавить пользователя
            </Button>
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Посмотреть отчёты
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
