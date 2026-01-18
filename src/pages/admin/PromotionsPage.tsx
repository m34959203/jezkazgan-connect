import { useState } from 'react';
import { Search, MoreHorizontal, Eye, Trash2, Percent, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuLabel,
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

// Mock promotions data
const mockPromotions = [
  {
    id: '1',
    title: 'Скидка 30% на все меню',
    business: 'Ресторан "Тюльпан"',
    discount: '30%',
    city: 'Алматы',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    status: 'active',
    views: 1250,
  },
  {
    id: '2',
    title: 'Бесплатный кофе к завтраку',
    business: 'Кофейня Арома',
    discount: 'Бонус',
    city: 'Алматы',
    startDate: '2026-01-15',
    endDate: '2026-02-15',
    status: 'pending',
    views: 0,
  },
  {
    id: '3',
    title: 'Первое занятие бесплатно',
    business: 'Фитнес "Энергия"',
    discount: '100%',
    city: 'Астана',
    startDate: '2026-01-01',
    endDate: '2026-03-01',
    status: 'active',
    views: 2100,
  },
  {
    id: '4',
    title: 'Скидка 20% на стрижку',
    business: 'Салон красоты Glamour',
    discount: '20%',
    city: 'Караганда',
    startDate: '2025-12-01',
    endDate: '2026-01-15',
    status: 'expired',
    views: 560,
  },
  {
    id: '5',
    title: 'Кэшбек 15% на технику',
    business: 'ТехноМир',
    discount: '15%',
    city: 'Шымкент',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'pending',
    views: 0,
  },
];

const statusLabels: Record<string, string> = {
  pending: 'На модерации',
  active: 'Активна',
  expired: 'Истекла',
  rejected: 'Отклонена',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function PromotionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPromotions = mockPromotions.filter((promo) => {
    const matchesSearch =
      promo.title.toLowerCase().includes(search.toLowerCase()) ||
      promo.business.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = mockPromotions.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Акции и скидки</h1>
          <p className="text-muted-foreground">
            Модерация акций от бизнесов
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            <AlertCircle className="w-4 h-4 mr-1" />
            {pendingCount} на модерации
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockPromotions.length}</div>
            <p className="text-sm text-muted-foreground">Всего акций</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {mockPromotions.filter((p) => p.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">На модерации</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {mockPromotions.filter((p) => p.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockPromotions.reduce((acc, p) => acc + p.views, 0).toLocaleString()}
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
                placeholder="Поиск по названию или бизнесу..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="expired">Истекшие</SelectItem>
                <SelectItem value="rejected">Отклонённые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promotions table */}
      <Card>
        <CardHeader>
          <CardTitle>Список акций</CardTitle>
          <CardDescription>
            Акции создаются бизнесами в личном кабинете
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Акция</TableHead>
                <TableHead>Скидка</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Период</TableHead>
                <TableHead>Просмотры</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.map((promo) => (
                <TableRow key={promo.id} className={promo.status === 'pending' ? 'bg-amber-50/50' : ''}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{promo.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {promo.business}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Percent className="w-3 h-3 mr-1" />
                      {promo.discount}
                    </Badge>
                  </TableCell>
                  <TableCell>{promo.city}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(promo.startDate).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="text-muted-foreground">
                        до {new Date(promo.endDate).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{promo.views.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[promo.status]}>
                      {statusLabels[promo.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Просмотреть
                        </DropdownMenuItem>
                        {promo.status === 'pending' && (
                          <>
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Одобрить
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="w-4 h-4 mr-2" />
                              Отклонить
                            </DropdownMenuItem>
                          </>
                        )}
                        {promo.status === 'active' && (
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="w-4 h-4 mr-2" />
                            Снять с публикации
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
