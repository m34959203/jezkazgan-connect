import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Gift, Share2, Copy, CheckCircle, Crown, Loader2, Ticket, TrendingUp } from 'lucide-react';
import { useReferralCode, useGenerateReferralCode, useReferralStats, useReferralRewards, useApplyReferralCode } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

export default function ReferralProgram() {
  const { data: codeData, isLoading: codeLoading, error: codeError } = useReferralCode();
  const { data: statsData, isLoading: statsLoading } = useReferralStats();
  const { data: rewardsData } = useReferralRewards();
  const generateCode = useGenerateReferralCode();
  const applyCode = useApplyReferralCode();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');

  const handleGenerateCode = async () => {
    try {
      await generateCode.mutateAsync();
      toast({ title: 'Успешно', description: 'Реферальный код создан!' });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const handleApplyCode = async () => {
    if (!referralCodeInput.trim()) {
      toast({ title: 'Ошибка', description: 'Введите реферальный код', variant: 'destructive' });
      return;
    }

    try {
      const result = await applyCode.mutateAsync(referralCodeInput.trim());
      toast({ title: 'Успешно!', description: `Вы получили ${result.bonusReceived} ₸ бонусом!` });
      setApplyDialogOpen(false);
      setReferralCodeInput('');
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const copyCode = () => {
    if (codeData?.code) {
      navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Скопировано', description: 'Реферальный код скопирован в буфер обмена' });
    }
  };

  const copyShareUrl = () => {
    if (codeData?.shareUrl) {
      navigator.clipboard.writeText(codeData.shareUrl);
      toast({ title: 'Скопировано', description: 'Ссылка скопирована' });
    }
  };

  const shareToSocial = (platform: 'telegram' | 'whatsapp') => {
    const text = codeData?.shareMessage || `Регистрируйся на Afisha.kz по моему коду ${codeData?.code} и получи бонус!`;
    const url = codeData?.shareUrl || `https://afisha.kz/register?ref=${codeData?.code}`;

    if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    }
  };

  // Check if premium required error
  const isPremiumRequired = (codeError as any)?.message?.includes('Premium');

  if (isPremiumRequired) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
            <CardTitle>Станьте Premium</CardTitle>
            <CardDescription>
              Реферальная программа доступна только для Premium пользователей
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Приглашайте друзей и получайте бонусы на кешбек-кошелёк!
            </p>
            <Button onClick={() => window.location.href = '/subscription'}>
              Узнать о Premium
            </Button>

            {/* Apply code section for non-premium users */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-3">У вас есть реферальный код?</p>
              <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Применить код</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Применить реферальный код</DialogTitle>
                    <DialogDescription>
                      Введите код, который вам дал друг
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      placeholder="XXXXXXXX"
                      className="text-center text-lg font-mono tracking-wider"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleApplyCode} disabled={applyCode.isPending}>
                      {applyCode.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Применить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (codeLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const stats = statsData?.stats;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Card with Code */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Реферальная программа
          </CardTitle>
          <CardDescription>
            {rewardsData?.programDescription?.ru || 'Приглашайте друзей и получайте бонусы!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {codeData?.code ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 p-6 bg-background rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Ваш реферальный код</p>
                  <p className="text-4xl font-mono font-bold tracking-wider text-primary">
                    {codeData.code}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" onClick={copyShareUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  Копировать ссылку
                </Button>
                <Button variant="outline" size="sm" onClick={() => shareToSocial('telegram')}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Telegram
                </Button>
                <Button variant="outline" size="sm" onClick={() => shareToSocial('whatsapp')}>
                  <Share2 className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">У вас пока нет реферального кода</p>
              <Button onClick={handleGenerateCode} disabled={generateCode.isPending}>
                {generateCode.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                Создать реферальный код
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rewardsData?.rewards?.registration && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-500" />
                За регистрацию
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">+{rewardsData.rewards.registration.referrerBonus} ₸</p>
              <p className="text-sm text-muted-foreground">вам за приглашение</p>
              <p className="text-xl font-semibold text-blue-600 mt-2">+{rewardsData.rewards.registration.referredBonus} ₸</p>
              <p className="text-sm text-muted-foreground">вашему другу</p>
            </CardContent>
          </Card>
        )}

        {rewardsData?.rewards?.premiumConversion && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                За Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">+{rewardsData.rewards.premiumConversion.referrerBonus} ₸</p>
              <p className="text-sm text-muted-foreground">когда друг станет Premium</p>
            </CardContent>
          </Card>
        )}

        {stats && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Ваша статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              <p className="text-sm text-muted-foreground">приглашено друзей</p>
              <p className="text-xl font-semibold text-green-600 mt-2">+{stats.totalEarned.toLocaleString()} ₸</p>
              <p className="text-sm text-muted-foreground">заработано</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Referrals List */}
      {statsData?.hasCode && statsData?.referrals && statsData.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ваши рефералы</CardTitle>
            <CardDescription>Люди, которые зарегистрировались по вашему коду</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statsData.referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{referral.referredName}</p>
                      <p className="text-xs text-muted-foreground">
                        {referral.registeredAt
                          ? new Date(referral.registeredAt).toLocaleDateString('ru-RU')
                          : 'Ожидает регистрации'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        referral.status === 'premium_converted'
                          ? 'default'
                          : referral.status === 'registered'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {referral.status === 'premium_converted'
                        ? 'Premium'
                        : referral.status === 'registered'
                        ? 'Зарегистрирован'
                        : 'Ожидает'}
                    </Badge>
                    {referral.reward > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        +{referral.reward.toLocaleString()} ₸
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>У вас есть реферальный код?</CardTitle>
          <CardDescription>Введите код друга и получите бонус</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
              placeholder="Введите код"
              className="font-mono tracking-wider"
            />
            <Button onClick={handleApplyCode} disabled={applyCode.isPending || !referralCodeInput.trim()}>
              {applyCode.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Применить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
