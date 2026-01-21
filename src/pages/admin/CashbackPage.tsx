import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Plus, Percent, DollarSign, Store, TrendingUp, Edit, Trash2 } from 'lucide-react';
import {
  useAdminCashbackStats,
  useAdminCashbackRules,
  useAdminCashbackPayments,
  useCreateAdminCashbackRule,
  useUpdateAdminCashbackRule,
  useDeleteAdminCashbackRule
} from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function CashbackPage() {
  const { data: statsData, isLoading: statsLoading } = useAdminCashbackStats();
  const { data: rulesData, isLoading: rulesLoading } = useAdminCashbackRules();
  const { data: paymentsData } = useAdminCashbackPayments({ limit: 20 });
  const createRule = useCreateAdminCashbackRule();
  const updateRule = useUpdateAdminCashbackRule();
  const deleteRule = useDeleteAdminCashbackRule();
  const { toast } = useToast();

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minPurchase: '',
    maxCashback: '',
    isPremiumOnly: true,
    isActive: true,
    priority: '0',
  });

  const resetRuleForm = () => {
    setRuleForm({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minPurchase: '',
      maxCashback: '',
      isPremiumOnly: true,
      isActive: true,
      priority: '0',
    });
    setEditingRule(null);
  };

  const openEditRule = (rule: any) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      value: String(rule.value),
      minPurchase: rule.minPurchase ? String(rule.minPurchase) : '',
      maxCashback: rule.maxCashback ? String(rule.maxCashback) : '',
      isPremiumOnly: rule.isPremiumOnly,
      isActive: rule.isActive,
      priority: String(rule.priority || 0),
    });
    setRuleDialogOpen(true);
  };

  const handleSaveRule = async () => {
    if (!ruleForm.name || !ruleForm.value) {
      toast({ title: 'Ошибка', description: 'Заполните название и значение', variant: 'destructive' });
      return;
    }

    try {
      const data = {
        name: ruleForm.name,
        description: ruleForm.description || undefined,
        type: ruleForm.type,
        value: parseFloat(ruleForm.value),
        minPurchase: ruleForm.minPurchase ? parseFloat(ruleForm.minPurchase) : 0,
        maxCashback: ruleForm.maxCashback ? parseFloat(ruleForm.maxCashback) : null,
        isPremiumOnly: ruleForm.isPremiumOnly,
        isActive: ruleForm.isActive,
        priority: parseInt(ruleForm.priority) || 0,
      };

      if (editingRule) {
        await updateRule.mutateAsync({ id: editingRule.id, data });
        toast({ title: 'Успешно', description: 'Правило обновлено' });
      } else {
        await createRule.mutateAsync(data);
        toast({ title: 'Успешно', description: 'Правило создано' });
      }

      setRuleDialogOpen(false);
      resetRuleForm();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Удалить это правило?')) return;

    try {
      await deleteRule.mutateAsync(id);
      toast({ title: 'Успешно', description: 'Правило удалено' });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const stats = statsData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Кешбек система</h1>
          <p className="text-muted-foreground">Управление кешбеком для Premium пользователей</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Кошельков
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.wallets?.total || 0}</p>
            <p className="text-xs text-muted-foreground">
              Баланс: {stats?.wallets?.totalBalance?.toLocaleString() || 0} ₸
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Начислено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats?.wallets?.totalEarned?.toLocaleString() || 0} ₸
            </p>
            <p className="text-xs text-muted-foreground">всего за всё время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-500" />
              Платежей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.payments?.total || 0}</p>
            <p className="text-xs text-muted-foreground">
              Подтверждено: {stats?.payments?.confirmed || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4 text-purple-500" />
              За 30 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.last30Days?.cashbackGiven?.toLocaleString() || 0} ₸
            </p>
            <p className="text-xs text-muted-foreground">кешбека выдано</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Правила кешбека</TabsTrigger>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Правила кешбека</CardTitle>
                <CardDescription>Настройте процент кешбека для разных категорий</CardDescription>
              </div>
              <Dialog open={ruleDialogOpen} onOpenChange={(open) => { if (!open) resetRuleForm(); setRuleDialogOpen(open); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить правило
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingRule ? 'Редактировать правило' : 'Новое правило'}</DialogTitle>
                    <DialogDescription>Настройте параметры начисления кешбека</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Название</Label>
                      <Input
                        value={ruleForm.name}
                        onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                        placeholder="Например: Стандартный кешбек"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Input
                        value={ruleForm.description}
                        onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                        placeholder="Описание для пользователей"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Тип</Label>
                        <Select value={ruleForm.type} onValueChange={(v: any) => setRuleForm({ ...ruleForm, type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Процент</SelectItem>
                            <SelectItem value="fixed">Фиксированная сумма</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{ruleForm.type === 'percentage' ? 'Процент (%)' : 'Сумма (₸)'}</Label>
                        <Input
                          type="number"
                          value={ruleForm.value}
                          onChange={(e) => setRuleForm({ ...ruleForm, value: e.target.value })}
                          placeholder={ruleForm.type === 'percentage' ? '5' : '100'}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Мин. покупка (₸)</Label>
                        <Input
                          type="number"
                          value={ruleForm.minPurchase}
                          onChange={(e) => setRuleForm({ ...ruleForm, minPurchase: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Макс. кешбек (₸)</Label>
                        <Input
                          type="number"
                          value={ruleForm.maxCashback}
                          onChange={(e) => setRuleForm({ ...ruleForm, maxCashback: e.target.value })}
                          placeholder="Без лимита"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Приоритет</Label>
                      <Input
                        type="number"
                        value={ruleForm.priority}
                        onChange={(e) => setRuleForm({ ...ruleForm, priority: e.target.value })}
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">Выше = важнее</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Только для Premium</Label>
                      <Switch
                        checked={ruleForm.isPremiumOnly}
                        onCheckedChange={(v) => setRuleForm({ ...ruleForm, isPremiumOnly: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Активно</Label>
                      <Switch
                        checked={ruleForm.isActive}
                        onCheckedChange={(v) => setRuleForm({ ...ruleForm, isActive: v })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setRuleDialogOpen(false); resetRuleForm(); }}>
                      Отмена
                    </Button>
                    <Button onClick={handleSaveRule} disabled={createRule.isPending || updateRule.isPending}>
                      {editingRule ? 'Сохранить' : 'Создать'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Значение</TableHead>
                    <TableHead>Мин. покупка</TableHead>
                    <TableHead>Использований</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rulesData?.rules?.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          {rule.description && (
                            <p className="text-xs text-muted-foreground">{rule.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.type === 'percentage' ? 'Процент' : 'Фикс.'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule.type === 'percentage' ? `${rule.value}%` : `${rule.value} ₸`}
                      </TableCell>
                      <TableCell>{rule.minPurchase || 0} ₸</TableCell>
                      <TableCell>
                        {rule.usageCount}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({rule.totalCashbackGiven?.toLocaleString() || 0} ₸)
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Активно' : 'Неактивно'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditRule(rule)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>История платежей</CardTitle>
              <CardDescription>Все платежи с использованием кешбека</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Бизнес</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Кешбек использ.</TableHead>
                    <TableHead>Кешбек начисл.</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsData?.payments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.userName || 'Пользователь'}</p>
                          <p className="text-xs text-muted-foreground">{payment.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.businessName || '-'}</TableCell>
                      <TableCell>{payment.totalAmount.toLocaleString()} ₸</TableCell>
                      <TableCell className="text-blue-600">
                        -{payment.cashbackUsed.toLocaleString()} ₸
                      </TableCell>
                      <TableCell className="text-green-600">
                        +{payment.cashbackEarned.toLocaleString()} ₸
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'confirmed'
                              ? 'default'
                              : payment.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {payment.status === 'confirmed'
                            ? 'Подтверждён'
                            : payment.status === 'pending'
                            ? 'Ожидает'
                            : 'Отклонён'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
