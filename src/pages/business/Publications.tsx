import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const mockBusiness = {
  tier: 'lite' as const,
  postsUsed: 7,
  postsLimit: 10,
};

const mockPublications = [
  {
    id: '1',
    type: 'event',
    title: 'Мастер-класс по живописи',
    status: 'approved',
    views: 234,
    date: '2026-01-25',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    type: 'promotion',
    title: 'Скидка 20% на все меню',
    status: 'approved',
    views: 567,
    date: '2026-01-31',
    createdAt: '2026-01-10',
  },
  {
    id: '3',
    type: 'event',
    title: 'Живая музыка по пятницам',
    status: 'pending',
    views: 0,
    date: '2026-02-01',
    createdAt: '2026-01-17',
  },
  {
    id: '4',
    type: 'promotion',
    title: 'Бизнес-ланч за 2000 ₸',
    status: 'rejected',
    views: 0,
    date: '2026-01-20',
    createdAt: '2026-01-12',
    rejectionReason: 'Некорректная информация о ценах',
  },
  {
    id: '5',
    type: 'event',
    title: 'Новогодний корпоратив',
    status: 'expired',
    views: 890,
    date: '2025-12-31',
    createdAt: '2025-12-01',
  },
];

const statusConfig = {
  pending: { label: 'На модерации', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Активно', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-800', icon: XCircle },
  expired: { label: 'Завершено', color: 'bg-gray-100 text-gray-800', icon: Clock },
};

const typeConfig = {
  event: { label: 'Событие', icon: Calendar, color: 'text-blue-600' },
  promotion: { label: 'Акция', icon: Percent, color: 'text-green-600' },
};

export default function BusinessPublications() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const business = mockBusiness;
  const postsRemaining = business.postsLimit - business.postsUsed;
  const canPost = postsRemaining > 0 || business.tier === 'premium';

  const filteredPublications = mockPublications.filter((pub) => {
    const matchesSearch = pub.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pub.status === statusFilter;
    const matchesType = typeFilter === 'all' || pub.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = mockPublications.filter((p) => p.status === 'approved').length;
  const pendingCount = mockPublications.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Публикации</h1>
          <p className="text-muted-foreground">
            Управление событиями и акциями
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canPost && (
            <Badge variant="destructive" className="mr-2">
              <AlertCircle className="w-3 h-3 mr-1" />
              Лимит исчерпан
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={!canPost}>
                <Plus className="w-4 h-4 mr-2" />
                Создать
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/business/publications/events/new">
                  <Calendar className="w-4 h-4 mr-2" />
                  Событие
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/business/publications/promotions/new">
                  <Percent className="w-4 h-4 mr-2" />
                  Акция
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Limit indicator */}
      {business.tier !== 'premium' && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Использовано публикаций</span>
              <span className="text-sm text-muted-foreground">
                {business.postsUsed} из {business.postsLimit}
              </span>
            </div>
            <Progress value={(business.postsUsed / business.postsLimit) * 100} className="h-2" />
            {postsRemaining <= 2 && postsRemaining > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                Осталось мало публикаций. Рассмотрите улучшение тарифа.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockPublications.length}</div>
            <p className="text-sm text-muted-foreground">Всего</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">На модерации</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockPublications.reduce((acc, p) => acc + p.views, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Просмотров</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="event">События</SelectItem>
                <SelectItem value="promotion">Акции</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="approved">Активные</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="rejected">Отклонённые</SelectItem>
                <SelectItem value="expired">Завершённые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Publications list */}
      <Card>
        <CardHeader>
          <CardTitle>Список публикаций</CardTitle>
          <CardDescription>
            Показано: {filteredPublications.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPublications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет публикаций</h3>
              <p className="text-muted-foreground mb-4">
                Создайте первое событие или акцию
              </p>
              {canPost && (
                <div className="flex justify-center gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/business/publications/events/new">
                      <Calendar className="w-4 h-4 mr-2" />
                      Создать событие
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/business/publications/promotions/new">
                      <Percent className="w-4 h-4 mr-2" />
                      Добавить акцию
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Публикация</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Просмотры</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPublications.map((pub) => {
                  const status = statusConfig[pub.status as keyof typeof statusConfig];
                  const type = typeConfig[pub.type as keyof typeof typeConfig];
                  const StatusIcon = status.icon;
                  const TypeIcon = type.icon;

                  return (
                    <TableRow key={pub.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${type.color}`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{pub.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Создано: {new Date(pub.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{type.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(pub.date).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {pub.views.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        {pub.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">
                            {pub.rejectionReason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Просмотреть
                            </DropdownMenuItem>
                            {pub.status !== 'expired' && (
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
