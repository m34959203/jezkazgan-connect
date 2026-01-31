import { useState } from 'react';
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Plus,
  Megaphone,
  Star,
  Zap,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building2,
  AlertCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type AdType = 'banner' | 'top_category' | 'promotion' | 'mailing';
type AdStatus = 'pending' | 'active' | 'completed' | 'cancelled';

interface AdOrder {
  id: string;
  type: AdType;
  businessName: string;
  businessId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  status: AdStatus;
  createdAt: string;
  cityName: string;
}

const adTypeLabels: Record<AdType, { label: string; icon: typeof Megaphone }> = {
  banner: { label: 'Баннер на главной', icon: Megaphone },
  top_category: { label: 'Топ в категории', icon: Star },
  promotion: { label: 'Продвижение события', icon: Zap },
  mailing: { label: 'Рассылка', icon: Mail },
};

const statusLabels: Record<AdStatus, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
  active: { label: 'Активно', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Завершено', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Отменено', color: 'bg-red-100 text-red-800' },
};

// Mock data for demonstration
const mockOrders: AdOrder[] = [
  {
    id: '1',
    type: 'banner',
    businessName: 'Кофейня "Арома"',
    businessId: 'b1',
    title: 'Баннер на главной - Февраль',
    description: 'Размещение баннера на главной странице города',
    startDate: '2026-01-25',
    endDate: '2026-02-10',
    price: 50000,
    status: 'active',
    createdAt: '2026-01-20',
    cityName: 'Алматы',
  },
  {
    id: '2',
    type: 'top_category',
    businessName: 'Фитнес "Энергия"',
    businessId: 'b2',
    title: 'Топ в категории Спорт',
    description: 'Закрепление в топе категории Спорт',
    startDate: '2026-02-01',
    endDate: '2026-02-08',
    price: 15000,
    status: 'pending',
    createdAt: '2026-01-28',
    cityName: 'Алматы',
  },
  {
    id: '3',
    type: 'promotion',
    businessName: 'Театр "Премьера"',
    businessId: 'b3',
    title: 'Продвижение спектакля',
    description: 'Продвижение события с push-уведомлениями',
    startDate: '2026-02-05',
    endDate: '2026-02-18',
    price: 10000,
    status: 'pending',
    createdAt: '2026-01-30',
    cityName: 'Астана',
  },
];

export default function AdvertisingPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<AdOrder[]>(mockOrders);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  // New order form state
  const [newOrder, setNewOrder] = useState({
    type: 'banner' as AdType,
    businessName: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    price: 0,
    cityName: '',
  });

  const handleCreateOrder = () => {
    const order: AdOrder = {
      id: String(Date.now()),
      ...newOrder,
      businessId: 'new',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrders([order, ...orders]);
    setIsCreateOpen(false);
    setNewOrder({
      type: 'banner',
      businessName: '',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      price: 0,
      cityName: '',
    });
    toast({
      title: 'Заказ создан',
      description: 'Рекламный заказ успешно добавлен',
    });
  };

  const handleStatusChange = (orderId: string, newStatus: AdStatus) => {
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast({
      title: 'Статус обновлён',
      description: `Заказ ${newStatus === 'active' ? 'активирован' : newStatus === 'cancelled' ? 'отменён' : 'обновлён'}`,
    });
  };

  const handleDelete = (orderId: string) => {
    setOrders(orders.filter(o => o.id !== orderId));
    toast({
      title: 'Заказ удалён',
      description: 'Рекламный заказ удалён',
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.title.toLowerCase().includes(search.toLowerCase()) ||
      order.businessName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || order.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const activeOrders = orders.filter(o => o.status === 'active').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders
    .filter(o => o.status === 'active' || o.status === 'completed')
    .reduce((acc, o) => acc + o.price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Рекламные заказы</h1>
          <p className="text-muted-foreground">
            Управление разовыми рекламными размещениями
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать заказ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Новый рекламный заказ</DialogTitle>
              <DialogDescription>
                Создание разового рекламного размещения для бизнеса
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Тип рекламы</Label>
                <Select
                  value={newOrder.type}
                  onValueChange={(v) => setNewOrder({ ...newOrder, type: v as AdType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(adTypeLabels).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Бизнес</Label>
                <Input
                  placeholder="Название бизнеса"
                  value={newOrder.businessName}
                  onChange={(e) => setNewOrder({ ...newOrder, businessName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Город</Label>
                <Input
                  placeholder="Город размещения"
                  value={newOrder.cityName}
                  onChange={(e) => setNewOrder({ ...newOrder, cityName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Название заказа</Label>
                <Input
                  placeholder="Краткое описание заказа"
                  value={newOrder.title}
                  onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Описание</Label>
                <Textarea
                  placeholder="Детали размещения"
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Дата начала</Label>
                  <Input
                    type="date"
                    value={newOrder.startDate}
                    onChange={(e) => setNewOrder({ ...newOrder, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Дата окончания</Label>
                  <Input
                    type="date"
                    value={newOrder.endDate}
                    onChange={(e) => setNewOrder({ ...newOrder, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Стоимость (₸)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newOrder.price || ''}
                  onChange={(e) => setNewOrder({ ...newOrder, price: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateOrder}>
                Создать заказ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-sm text-muted-foreground">Всего заказов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeOrders}</div>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <p className="text-sm text-muted-foreground">Ожидают</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} ₸</div>
            <p className="text-sm text-muted-foreground">Выручка</p>
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Тип рекламы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {Object.entries(adTypeLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(statusLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle>Список заказов</CardTitle>
          <CardDescription>
            Разовые рекламные размещения для бизнесов без Premium подписки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тип</TableHead>
                <TableHead>Заказ</TableHead>
                <TableHead>Бизнес</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Период</TableHead>
                <TableHead>Стоимость</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Заказы не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const TypeIcon = adTypeLabels[order.type].icon;
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TypeIcon className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {adTypeLabels[order.type].label}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {order.businessName}
                        </div>
                      </TableCell>
                      <TableCell>{order.cityName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.startDate).toLocaleDateString('ru-RU')}
                          </div>
                          <div className="text-muted-foreground">
                            до {new Date(order.endDate).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{order.price.toLocaleString()} ₸</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusLabels[order.status].color}>
                          {statusLabels[order.status].label}
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
                              Подробнее
                            </DropdownMenuItem>
                            {order.status === 'pending' && (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleStatusChange(order.id, 'active')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Активировать
                              </DropdownMenuItem>
                            )}
                            {order.status === 'active' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, 'completed')}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Завершить
                              </DropdownMenuItem>
                            )}
                            {(order.status === 'pending' || order.status === 'active') && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleStatusChange(order.id, 'cancelled')}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Отменить
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(order.id)}
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

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">О рекламных заказах</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Типы размещений:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4" />
                  <span><strong>Баннер на главной</strong> — размещение в верхней части страницы</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span><strong>Топ в категории</strong> — закрепление в топе выбранной категории</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span><strong>Продвижение события</strong> — выделение + push-уведомления</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span><strong>Рассылка</strong> — email/push по выбранной аудитории</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Примечание:</h4>
              <p className="text-muted-foreground">
                Эти услуги включены в тариф <strong>Premium</strong> для бизнесов с подпиской.
                Данный раздел предназначен для разовых заказов от бизнесов без Premium подписки.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
