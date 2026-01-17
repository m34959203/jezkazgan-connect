import { useState } from 'react';
import { Search, MoreHorizontal, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';
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

// Mock events data
const mockEvents = [
  {
    id: '1',
    title: 'Концерт Димаша Кудайбергена',
    business: 'Astana Arena',
    category: 'concerts',
    city: 'Астана',
    date: '2026-02-14',
    price: '15 000 - 50 000 ₸',
    status: 'approved',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    title: 'Мастер-класс по кулинарии',
    business: 'Ресторан "Тюльпан"',
    category: 'workshops',
    city: 'Алматы',
    date: '2026-01-25',
    price: '5 000 ₸',
    status: 'pending',
    createdAt: '2026-01-16',
  },
  {
    id: '3',
    title: 'Yoga Weekend',
    business: 'Фитнес "Энергия"',
    category: 'sports',
    city: 'Астана',
    date: '2026-01-28',
    price: 'Бесплатно',
    status: 'approved',
    createdAt: '2026-01-10',
  },
  {
    id: '4',
    title: 'Детский праздник',
    business: 'ТРЦ Mega',
    category: 'kids',
    city: 'Караганда',
    date: '2026-02-01',
    price: 'Бесплатно',
    status: 'pending',
    createdAt: '2026-01-17',
  },
  {
    id: '5',
    title: 'Бизнес-форум 2026',
    business: 'Hilton Astana',
    category: 'business',
    city: 'Астана',
    date: '2026-03-15',
    price: '25 000 ₸',
    status: 'rejected',
    createdAt: '2026-01-12',
  },
];

const categoryLabels: Record<string, string> = {
  concerts: 'Концерты',
  workshops: 'Мастер-классы',
  sports: 'Спорт',
  kids: 'Детям',
  business: 'Бизнес',
  theatre: 'Театр',
  exhibitions: 'Выставки',
  other: 'Другое',
};

const statusLabels: Record<string, string> = {
  pending: 'На модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.business.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = mockEvents.filter((e) => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">События</h1>
          <p className="text-muted-foreground">
            Управление событиями и мероприятиями
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {pendingCount} на модерации
            </Badge>
          )}
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockEvents.length}</div>
            <p className="text-sm text-muted-foreground">Всего событий</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockEvents.filter((e) => e.status === 'approved').length}
            </div>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {mockEvents.filter((e) => e.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">На модерации</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockEvents.filter((e) => new Date(e.date) > new Date()).length}
            </div>
            <p className="text-sm text-muted-foreground">Предстоящих</p>
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
                placeholder="Поиск по названию или организатору..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="approved">Одобренные</SelectItem>
                <SelectItem value="rejected">Отклонённые</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="concerts">Концерты</SelectItem>
                <SelectItem value="workshops">Мастер-классы</SelectItem>
                <SelectItem value="sports">Спорт</SelectItem>
                <SelectItem value="kids">Детям</SelectItem>
                <SelectItem value="business">Бизнес</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events table */}
      <Card>
        <CardHeader>
          <CardTitle>Список событий</CardTitle>
          <CardDescription>
            Показано: {filteredEvents.length} событий
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Событие</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.business}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categoryLabels[event.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString('ru-RU')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3" />
                      {event.city}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{event.price}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[event.status]}>
                      {statusLabels[event.status]}
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
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        {event.status === 'pending' && (
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
