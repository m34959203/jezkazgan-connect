import { useState } from 'react';
import { Search, Download, DollarSign, TrendingUp, CreditCard, Receipt, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminFinance } from '@/hooks/use-api';

const tierLabels: Record<string, string> = {
  free: 'Free',
  lite: 'Lite',
  premium: 'Premium',
};

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-800',
  lite: 'bg-blue-100 text-blue-800',
  premium: 'bg-amber-100 text-amber-800',
};

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  expiring: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  completed: 'Выполнено',
  pending: 'Ожидание',
  active: 'Активна',
  expiring: 'Истекает',
  failed: 'Ошибка',
  refunded: 'Возврат',
  cancelled: 'Отменено',
};

const typeLabels: Record<string, string> = {
  subscription: 'Подписка',
  premium: 'Premium',
  business_lite: 'Lite подписка',
  business_premium: 'Premium подписка',
  user_premium: 'Premium пользователь',
  banner: 'Баннер',
  other: 'Другое',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
};

export default function FinancePage() {
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('month');

  const { data, isLoading, error } = useAdminFinance(periodFilter);

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
        <p className="text-muted-foreground">Не удалось загрузить финансовые данные</p>
      </div>
    );
  }

  const stats = data?.stats ?? {
    totalRevenue: 0,
    revenueChange: 0,
    premiumSubscriptions: 0,
    liteSubscriptions: 0,
    expiringSubscriptions: 0,
    premiumUsers: 0,
  };

  const transactions = data?.transactions ?? [];
  const subscriptions = data?.subscriptions ?? [];

  // Filter transactions by search
  const filteredTransactions = transactions.filter(t =>
    !search || t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Финансы</h1>
          <p className="text-muted-foreground">
            Доходы, подписки и транзакции
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Экспорт отчёта
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Доход за период</p>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            {stats.revenueChange !== 0 && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange}% к прошлому периоду
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premium подписок</p>
                <div className="text-2xl font-bold">{stats.premiumSubscriptions}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {formatCurrency(200000)}/мес каждая
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lite подписок</p>
                <div className="text-2xl font-bold">{stats.liteSubscriptions}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {formatCurrency(50000)}/мес каждая
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Истекают скоро</p>
                <div className="text-2xl font-bold text-red-600">{stats.expiringSubscriptions}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Требуют продления
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="subscriptions">Подписки</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по описанию..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Период" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Неделя</SelectItem>
                    <SelectItem value="month">Месяц</SelectItem>
                    <SelectItem value="quarter">Квартал</SelectItem>
                    <SelectItem value="year">Год</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions table */}
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
              <CardDescription>
                Все платежи и возвраты
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Транзакции не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeLabels[transaction.type] || transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                            {transaction.amount < 0 ? '' : '+'}{formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[transaction.status] || 'bg-gray-100 text-gray-800'}>
                            {statusLabels[transaction.status] || transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          {/* Subscriptions table */}
          <Card>
            <CardHeader>
              <CardTitle>Активные подписки</CardTitle>
              <CardDescription>
                Платные подписки бизнесов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Бизнес</TableHead>
                    <TableHead>Тариф</TableHead>
                    <TableHead>Сумма/мес</TableHead>
                    <TableHead>Начало</TableHead>
                    <TableHead>Окончание</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Активные подписки не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.business}</TableCell>
                        <TableCell>
                          <Badge className={tierColors[sub.tier]}>
                            {tierLabels[sub.tier]}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(sub.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(sub.startDate).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {sub.endDate ? new Date(sub.endDate).toLocaleDateString('ru-RU') : 'Бессрочно'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[sub.status]}>
                            {statusLabels[sub.status] || sub.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
