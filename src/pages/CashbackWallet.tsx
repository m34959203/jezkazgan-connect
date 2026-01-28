import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, Store, QrCode, Copy, CheckCircle } from 'lucide-react';
import { useCashbackWallet, useCashbackTransactions, useCashbackPayments, useCashbackPartners, useCreateCashbackPayment } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function CashbackWallet() {
  const { data: walletData, isLoading: walletLoading, error: walletError } = useCashbackWallet();
  const { data: transactionsData } = useCashbackTransactions({ limit: 20 });
  const { data: paymentsData } = useCashbackPayments({ limit: 10 });
  const { data: partnersData } = useCashbackPartners();
  const createPayment = useCreateCashbackPayment();
  const { toast } = useToast();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [useCashback, setUseCashback] = useState('');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCreatePayment = async () => {
    if (!selectedBusiness || !paymentAmount) {
      toast({ title: 'Ошибка', description: 'Выберите партнёра и укажите сумму', variant: 'destructive' });
      return;
    }

    try {
      const result = await createPayment.mutateAsync({
        businessId: selectedBusiness,
        totalAmount: parseFloat(paymentAmount),
        useCashback: useCashback ? parseFloat(useCashback) : 0,
      });
      setPaymentResult(result);
      toast({ title: 'Успешно', description: 'Платёж создан! Покажите код кассиру.' });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const copyCode = () => {
    if (paymentResult?.payment?.confirmationCode) {
      navigator.clipboard.writeText(paymentResult.payment.confirmationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetPaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedBusiness('');
    setPaymentAmount('');
    setUseCashback('');
    setPaymentResult(null);
  };

  if (walletError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {(walletError as any)?.message?.includes('Premium')
                ? 'Система кешбека доступна только для Premium пользователей'
                : 'Ошибка загрузки кошелька'}
            </p>
            <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/subscription'}>
              Стать Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (walletLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const wallet = walletData?.wallet;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Кешбек кошелёк
          </CardTitle>
          <CardDescription>Используйте кешбек для оплаты у партнёров Afisha.kz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-3xl font-bold text-primary">{wallet?.balance?.toLocaleString() || 0} ₸</p>
              <p className="text-sm text-muted-foreground">Доступный баланс</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-xl font-semibold text-green-600">+{wallet?.totalEarned?.toLocaleString() || 0} ₸</p>
              <p className="text-sm text-muted-foreground">Всего заработано</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-xl font-semibold text-blue-600">-{wallet?.totalSpent?.toLocaleString() || 0} ₸</p>
              <p className="text-sm text-muted-foreground">Всего потрачено</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <Dialog open={paymentDialogOpen} onOpenChange={(open) => { if (!open) resetPaymentDialog(); else setPaymentDialogOpen(true); }}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <QrCode className="mr-2 h-4 w-4" />
                    Оплатить
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  {!paymentResult ? (
                    <>
                      <DialogHeader>
                        <DialogTitle>Оплата с кешбеком</DialogTitle>
                        <DialogDescription>
                          Создайте платёж и покажите код кассиру
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Партнёр</Label>
                          <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите партнёра" />
                            </SelectTrigger>
                            <SelectContent>
                              {partnersData?.partners?.map((partner) => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  {partner.name} ({partner.cashbackPercent}% кешбек)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Сумма покупки (₸)</Label>
                          <Input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="1000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Использовать кешбек (₸)</Label>
                          <Input
                            type="number"
                            value={useCashback}
                            onChange={(e) => setUseCashback(e.target.value)}
                            placeholder="0"
                            max={wallet?.balance || 0}
                          />
                          <p className="text-xs text-muted-foreground">
                            Доступно: {wallet?.balance?.toLocaleString() || 0} ₸
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreatePayment} disabled={createPayment.isPending}>
                          {createPayment.isPending ? 'Создание...' : 'Создать платёж'}
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          Платёж создан
                        </DialogTitle>
                        <DialogDescription>
                          Покажите этот код кассиру для оплаты
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-6 text-center space-y-4">
                        <div className="bg-muted p-6 rounded-lg">
                          <p className="text-4xl font-mono font-bold tracking-wider">
                            {paymentResult.payment.confirmationCode}
                          </p>
                        </div>
                        <Button variant="outline" onClick={copyCode}>
                          {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                          {copied ? 'Скопировано' : 'Копировать код'}
                        </Button>
                        <div className="text-left space-y-2 p-4 bg-muted/50 rounded-lg">
                          <p><span className="text-muted-foreground">Сумма покупки:</span> {paymentResult.payment.totalAmount.toLocaleString()} ₸</p>
                          <p><span className="text-muted-foreground">Списание кешбека:</span> {paymentResult.payment.cashbackUsed.toLocaleString()} ₸</p>
                          <p><span className="text-muted-foreground">К оплате:</span> <strong>{paymentResult.payment.amountToPay.toLocaleString()} ₸</strong></p>
                          <p><span className="text-muted-foreground">Начислится кешбек:</span> <span className="text-green-600">+{paymentResult.payment.cashbackEarned.toLocaleString()} ₸</span></p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={resetPaymentDialog}>Закрыть</Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">История операций</TabsTrigger>
          <TabsTrigger value="payments">Мои платежи</TabsTrigger>
          <TabsTrigger value="partners">Партнёры</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>История операций</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsData?.transactions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Пока нет операций
                </p>
              ) : (
                <div className="space-y-3">
                  {transactionsData?.transactions?.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description || tx.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm', { locale: ru })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} ₸
                        </p>
                        <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {tx.status === 'completed' ? 'Выполнено' : tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Мои платежи</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsData?.payments?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Пока нет платежей
                </p>
              ) : (
                <div className="space-y-3">
                  {paymentsData?.payments?.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                          <Store className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{payment.businessName || 'Партнёр'}</p>
                          <p className="text-xs text-muted-foreground">
                            Код: {payment.confirmationCode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{payment.totalAmount.toLocaleString()} ₸</p>
                        <Badge
                          variant={payment.status === 'confirmed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {payment.status === 'confirmed' ? 'Подтверждён' : payment.status === 'pending' ? 'Ожидает' : 'Отклонён'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Партнёры с кешбеком</CardTitle>
              <CardDescription>Используйте кешбек для оплаты у этих партнёров</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnersData?.partners?.map((partner) => (
                  <div key={partner.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      {partner.logo ? (
                        <img src={partner.logo} alt={partner.name} className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <Store className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{partner.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{partner.address || partner.category}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {partner.cashbackPercent}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
