import { useState } from 'react';
import { Search, MoreHorizontal, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Calendar, MapPin, Loader2, AlertCircle, Star, Crown } from 'lucide-react';
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
import { useAdminEvents, useApproveEvent, useRejectEvent, useToggleEventFeatured } from '@/hooks/use-api';
import { deleteAdminEvent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useAdminEvents({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const approveEvent = useApproveEvent();
  const rejectEvent = useRejectEvent();
  const toggleFeatured = useToggleEventFeatured();

  const handleToggleFeatured = async (eventId: string, currentFeatured: boolean, isPremium: boolean) => {
    if (!isPremium && !currentFeatured) {
      toast({
        title: 'Недоступно',
        description: 'Только события от премиум бизнесов могут быть отмечены как "Выбор Афиши"',
        variant: 'destructive',
      });
      return;
    }

    try {
      await toggleFeatured.mutateAsync({ id: eventId, isFeatured: !currentFeatured });
      toast({
        title: 'Успешно',
        description: currentFeatured ? 'Событие убрано из "Выбор Афиши"' : 'Событие добавлено в "Выбор Афиши"',
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус события',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      await approveEvent.mutateAsync(eventId);
      toast({
        title: 'Успешно',
        description: 'Событие одобрено',
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось одобрить событие',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      await rejectEvent.mutateAsync(eventId);
      toast({
        title: 'Успешно',
        description: 'Событие отклонено',
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить событие',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    setIsDeleting(true);
    try {
      await deleteAdminEvent(deleteEventId);
      toast({
        title: 'Успешно',
        description: 'Событие удалено',
      });
      refetch();
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить событие',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteEventId(null);
    }
  };

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
        <p className="text-muted-foreground">Не удалось загрузить события</p>
      </div>
    );
  }

  const events = data?.events ?? [];
  const total = data?.total ?? 0;
  const pendingCount = data?.pendingCount ?? 0;

  // Filter events by search locally
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    (event.businessName?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const approvedCount = events.filter((e) => e.isApproved).length;

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
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">Всего событий</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{approvedCount}</div>
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
              {events.filter((e) => new Date(e.date) > new Date()).length}
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
                <TableHead>Просмотры</TableHead>
                <TableHead>Выбор Афиши</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    События не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => {
                  const isPremium = event.businessTier === 'premium';
                  const isFeatured = event.isFeatured;

                  return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isPremium && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Crown className="w-4 h-4 text-amber-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Премиум бизнес</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.businessName || 'Без организатора'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryLabels[event.category] || event.category}
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
                        {event.cityName || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{event.viewsCount}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={isFeatured ? 'text-amber-500' : 'text-muted-foreground'}
                              onClick={() => handleToggleFeatured(event.id, !!isFeatured, isPremium)}
                              disabled={!isPremium && !isFeatured}
                            >
                              <Star className={`w-5 h-5 ${isFeatured ? 'fill-amber-500' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {!isPremium ? (
                              <p>Только для премиум бизнесов</p>
                            ) : isFeatured ? (
                              <p>Убрать из "Выбор Афиши"</p>
                            ) : (
                              <p>Добавить в "Выбор Афиши"</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {event.isApproved ? (
                        <Badge className="bg-green-100 text-green-800">
                          Одобрено
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">
                          На модерации
                        </Badge>
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
                          {isPremium && (
                            <DropdownMenuItem
                              className={isFeatured ? 'text-amber-600' : ''}
                              onClick={() => handleToggleFeatured(event.id, !!isFeatured, isPremium)}
                            >
                              <Star className={`w-4 h-4 mr-2 ${isFeatured ? 'fill-amber-500' : ''}`} />
                              {isFeatured ? 'Убрать из "Выбор Афиши"' : 'Добавить в "Выбор Афиши"'}
                            </DropdownMenuItem>
                          )}
                          {!event.isApproved && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleApprove(event.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Одобрить
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleReject(event.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Отклонить
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteEventId(event.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить событие?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Событие будет удалено навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
