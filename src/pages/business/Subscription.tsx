import { useState } from 'react';
import {
  Check,
  X,
  Crown,
  Zap,
  CreditCard,
  Receipt,
  AlertCircle,
  Download,
  TrendingUp,
  Building2,
  BarChart3,
  Megaphone,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useMyBusiness } from '@/hooks/use-api';

const tierLimits = { free: 3, lite: 10, premium: 999 };

const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Для начинающих',
    features: [
      { name: '3 публикации в месяц', included: true },
      { name: 'Базовый профиль', included: true },
      { name: '5 фото в галерее', included: true },
      { name: 'Базовая статистика', included: true },
      { name: 'Детальная статистика', included: false },
      { name: 'Приоритет в поиске', included: false },
      { name: 'Значок "Проверено"', included: false },
      { name: 'Ответы на отзывы', included: false },
      { name: 'Рекламный баннер', included: false },
    ],
  },
  {
    id: 'lite',
    name: 'Lite',
    price: 50000,
    description: 'Для активных бизнесов',
    popular: true,
    features: [
      { name: '10 публикаций в месяц', included: true },
      { name: 'Расширенный профиль', included: true },
      { name: '15 фото в галерее', included: true },
      { name: 'Детальная статистика', included: true },
      { name: 'Приоритет в поиске', included: true },
      { name: 'Значок "Проверено"', included: true },
      { name: 'Ответы на отзывы', included: true },
      { name: 'Рекламный баннер', included: false },
      { name: 'Несколько сотрудников', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 200000,
    description: 'Максимум возможностей',
    features: [
      { name: 'Безлимит публикаций', included: true },
      { name: 'Полный профиль', included: true },
      { name: '50 фото в галерее', included: true },
      { name: 'Полная статистика + экспорт', included: true },
      { name: 'Топ в поиске', included: true },
      { name: 'Значок "Проверено"', included: true },
      { name: 'Ответы на отзывы', included: true },
      { name: 'Рекламный баннер на главной', included: true },
      { name: 'До 5 сотрудников', included: true },
    ],
  },
];

const formatPrice = (price: number) => {
  if (price === 0) return 'Бесплатно';
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₸/мес';
};

export default function BusinessSubscription() {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('kaspi');

  const { data: businessData, isLoading } = useMyBusiness();

  // Use real data
  const businessTier = (businessData?.tier || 'free') as keyof typeof tierLimits;
  const postsLimit = tierLimits[businessTier];
  const postsUsed = businessData?.postsThisMonth || 0;
  const tierUntil = businessData?.tierUntil;

  const business = {
    tier: businessTier,
    postsUsed,
    postsLimit,
    nextBillingDate: tierUntil || null,
  };

  const currentTierIndex = tiers.findIndex((t) => t.id === business.tier);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleUpgrade = (tierId: string) => {
    setSelectedTier(tierId);
    setUpgradeDialogOpen(true);
  };

  const handleConfirmUpgrade = () => {
    // Here would be the payment integration
    console.log('Upgrading to:', selectedTier, 'via', paymentMethod);
    setUpgradeDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Подписка</h1>
        <p className="text-muted-foreground">
          Управление тарифом и платежами
        </p>
      </div>

      {/* Current subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Текущий тариф</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                business.tier === 'premium' ? 'bg-amber-100' :
                business.tier === 'lite' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {business.tier === 'premium' ? (
                  <Crown className="w-7 h-7 text-amber-600" />
                ) : business.tier === 'lite' ? (
                  <Zap className="w-7 h-7 text-blue-600" />
                ) : (
                  <Building2 className="w-7 h-7 text-gray-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">
                    {tiers.find((t) => t.id === business.tier)?.name}
                  </h3>
                  <Badge variant="outline">Активен</Badge>
                </div>
                {business.tier !== 'free' && business.nextBillingDate && (
                  <p className="text-muted-foreground">
                    Подписка до: {new Date(business.nextBillingDate).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {business.tier !== 'premium' && (
                <Button onClick={() => handleUpgrade(business.tier === 'free' ? 'lite' : 'premium')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Улучшить тариф
                </Button>
              )}
              {business.tier !== 'free' && (
                <Button variant="outline">
                  Отменить подписку
                </Button>
              )}
            </div>
          </div>

          {/* Usage */}
          {business.tier !== 'premium' && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Использовано публикаций</span>
                <span className="text-sm">{business.postsUsed} из {business.postsLimit}</span>
              </div>
              <Progress value={(business.postsUsed / business.postsLimit) * 100} className="h-2" />
              {business.postsUsed >= business.postsLimit && (
                <div className="flex items-center gap-2 mt-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Лимит исчерпан. Улучшите тариф для новых публикаций.</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier comparison */}
      <div>
        <h2 className="text-xl font-bold mb-4">Сравнение тарифов</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier, index) => {
            const isCurrent = tier.id === business.tier;
            const isUpgrade = index > currentTierIndex;
            const isDowngrade = index < currentTierIndex;

            return (
              <Card
                key={tier.id}
                className={`relative ${isCurrent ? 'border-primary ring-2 ring-primary/20' : ''} ${
                  tier.popular ? 'border-blue-300' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600">Популярный</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="outline" className="bg-background">Текущий</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                    tier.id === 'premium' ? 'bg-amber-100' :
                    tier.id === 'lite' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {tier.id === 'premium' ? (
                      <Crown className="w-6 h-6 text-amber-600" />
                    ) : tier.id === 'lite' ? (
                      <Zap className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="text-3xl font-bold mt-2">
                    {tier.price === 0 ? 'Бесплатно' : (
                      <>
                        {new Intl.NumberFormat('ru-RU').format(tier.price)}
                        <span className="text-base font-normal text-muted-foreground"> ₸/мес</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className={!feature.included ? 'text-muted-foreground' : ''}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button className="w-full" variant="outline" disabled>
                      Текущий тариф
                    </Button>
                  ) : isUpgrade ? (
                    <Button className="w-full" onClick={() => handleUpgrade(tier.id)}>
                      Выбрать
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Понизить нельзя
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Premium features highlight */}
      {business.tier !== 'premium' && (
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-amber-600" />
              <div>
                <h3 className="text-lg font-bold">Преимущества Premium</h3>
                <p className="text-sm text-muted-foreground">Максимум для вашего бизнеса</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-200/50 flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium">Рекламный баннер</p>
                  <p className="text-xs text-muted-foreground">На главной странице</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-200/50 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium">Безлимит</p>
                  <p className="text-xs text-muted-foreground">Публикаций</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-200/50 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium">Полная аналитика</p>
                  <p className="text-xs text-muted-foreground">С экспортом</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-200/50 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium">Команда</p>
                  <p className="text-xs text-muted-foreground">До 5 сотрудников</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle>История платежей</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            История платежей пуста
          </p>
        </CardContent>
      </Card>

      {/* Upgrade dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оформление подписки</DialogTitle>
            <DialogDescription>
              Выберите способ оплаты для тарифа {tiers.find((t) => t.id === selectedTier)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Тариф</span>
                <span className="font-medium">{tiers.find((t) => t.id === selectedTier)?.name}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Сумма</span>
                <span className="font-bold text-lg">
                  {formatPrice(tiers.find((t) => t.id === selectedTier)?.price || 0)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Способ оплаты</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="kaspi" id="kaspi" />
                  <Label htmlFor="kaspi" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">
                      K
                    </div>
                    Kaspi QR / Kaspi Pay
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="w-5 h-5" />
                    Банковская карта
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleConfirmUpgrade}>
              Оплатить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
