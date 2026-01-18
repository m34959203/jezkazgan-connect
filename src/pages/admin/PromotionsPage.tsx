import { useState } from 'react';
import { Search, MoreHorizontal, Eye, Trash2, Percent, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
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
import { useAdminPromotions, useUpdatePromotion } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

export default function PromotionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const { data, isLoading, error } = useAdminPromotions();
  const updatePromotion = useUpdatePromotion();

  const handleToggleActive = async (promoId: string, isActive: boolean) => {
    try {
      await updatePromotion.mutateAsync({ id: promoId, data: { isActive: !isActive } });
      toast({
        title: 'Успешно',
        description: isActive ? 'Акция снята с публикации' : 'Акция активирована',
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить акцию',
        variant: 'destructive',
      });
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
        <p className="text-muted-foreground">Не удалось загрузить акции</p>
      </div>
    );
  }

  const promotions = data?.promotions ?? [];
  const total = data?.total ?? 0;

  // Filter promotions
  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.title.toLowerCase().includes(search.toLowerCase()) ||
      (promo.businessName?.toLowerCase().includes(search.toLowerCase()) ?? false);

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && promo.isActive;
    if (statusFilter === 'inactive') return matchesSearch && !promo.isActive;
    return matchesSearch;
  });

  const activeCount = promotions.filter((p) => p.isActive).length;
  const totalViews = promotions.reduce((acc, p) => acc + p.viewsCount, 0);

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
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">Всего акций</p>
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
            <div className="text-2xl font-bold text-gray-600">{total - activeCount}</div>
            <p className="text-sm text-muted-foreground">Неактивных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
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
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
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
              {filteredPromotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Акции не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredPromotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{promo.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {promo.businessName || 'Без бизнеса'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.discount && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Percent className="w-3 h-3 mr-1" />
                          {promo.discount}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{promo.cityName || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {promo.validFrom && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(promo.validFrom).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          до {new Date(promo.validUntil).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{promo.viewsCount.toLocaleString()}</TableCell>
                    <TableCell>
                      {promo.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          Активна
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          Неактивна
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
                          {promo.isActive ? (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleToggleActive(promo.id, promo.isActive)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Снять с публикации
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleToggleActive(promo.id, promo.isActive)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Активировать
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
