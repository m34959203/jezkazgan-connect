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
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
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
import { useMyBusinessPublications } from '@/hooks/use-api';

const statusConfig = {
  pending: { label: 'На модерации', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Активно', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-800', icon: XCircle },
  expired: { label: 'Завершено', color: 'bg-gray-100 text-gray-800', icon: Clock },
};

export default function BusinessEvents() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: publications, isLoading } = useMyBusinessPublications();

  const events = (publications?.events || []).map((e) => ({
    id: e.id,
    title: e.title,
    status: e.status,
    views: e.viewsCount,
    date: e.date,
    createdAt: e.createdAt,
  }));

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = events.filter((e) => e.status === 'approved').length;
  const pendingCount = events.filter((e) => e.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">События</h1>
          <p className="text-muted-foreground">Управление событиями</p>
        </div>
        <Button asChild>
          <Link to="/business/publications/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Создать событие
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-sm text-muted-foreground">Всего событий</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="approved">Активные</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="rejected">Отклонённые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events list */}
      <Card>
        <CardHeader>
          <CardTitle>Список событий</CardTitle>
          <CardDescription>Показано: {filteredEvents.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет событий</h3>
              <p className="text-muted-foreground mb-4">Создайте первое событие</p>
              <Button asChild>
                <Link to="/business/publications/events/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Создать событие
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Просмотры</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const status = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Создано: {new Date(event.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {event.views.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
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
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Просмотреть
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
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
