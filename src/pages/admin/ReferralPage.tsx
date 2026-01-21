import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Gift, TrendingUp, Crown, Edit, Ban, Ticket, Percent } from 'lucide-react';
import {
  useAdminReferralStats,
  useAdminReferralRewards,
  useAdminReferralCodes,
  useUpdateAdminReferralReward,
  useDeactivateAdminReferralCode
} from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ReferralPage() {
  const { data: statsData, isLoading: statsLoading } = useAdminReferralStats();
  const { data: rewardsData } = useAdminReferralRewards();
  const { data: codesData } = useAdminReferralCodes({ limit: 20 });
  const updateReward = useUpdateAdminReferralReward();
  const deactivateCode = useDeactivateAdminReferralCode();
  const { toast } = useToast();

  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [rewardForm, setRewardForm] = useState({
    referrerAmount: '',
    referredAmount: '',
    description: '',
    isActive: true,
  });

  const rewardTypeLabels: Record<string, string> = {
    registration: 'За регистрацию',
    premium_conversion: 'За переход в Premium',
    first_purchase: 'За первую покупку',
  };

  const openEditReward = (reward: any) => {
    setEditingReward(reward);
    setRewardForm({
      referrerAmount: String(reward.referrerAmount),
      referredAmount: String(reward.referredAmount),
      description: reward.description || '',
      isActive: reward.isActive,
    });
    setRewardDialogOpen(true);
  };

  const handleSaveReward = async () => {
    if (!editingReward) return;

    try {
      await updateReward.mutateAsync({
        type: editingReward.rewardType,
        data: {
          referrerAmount: parseFloat(rewardForm.referrerAmount) || 0,
          referredAmount: parseFloat(rewardForm.referredAmount) || 0,
          description: rewardForm.description || undefined,
          isActive: rewardForm.isActive,
        },
      });
      toast({ title: 'Успешно', description: 'Награда обновлена' });
      setRewardDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeactivateCode = async (id: string) => {
    if (!confirm('Деактивировать этот реферальный код?')) return;

    try {
      await deactivateCode.mutateAsync(id);
      toast({ title: 'Успешно', description: 'Код деактивирован' });
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const stats = statsData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Реферальная программа</h1>
          <p className="text-muted-foreground">Управление реферальной системой</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Кодов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.codes?.total || 0}</p>
            <p className="text-xs text-muted-foreground">
              Активных: {stats?.codes?.active || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Рефералов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.referrals?.total || 0}</p>
            <p className="text-xs text-muted-foreground">
              За 30 дней: +{stats?.last30Days?.newReferrals || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Конверсия в Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.referrals?.premiumConverted || 0}</p>
            <p className="text-xs text-muted-foreground">
              {stats?.referrals?.conversionRate || 0}% конверсия
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4 text-green-500" />
              Выдано наград
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {stats?.rewards?.totalGiven?.toLocaleString() || 0} ₸
            </p>
            <p className="text-xs text-muted-foreground">всего за всё время</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rewards">
        <TabsList>
          <TabsTrigger value="rewards">Настройки наград</TabsTrigger>
          <TabsTrigger value="codes">Реферальные коды</TabsTrigger>
          <TabsTrigger value="top">Топ рефереров</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки наград</CardTitle>
              <CardDescription>Установите размер бонусов за различные действия</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rewardsData?.rewards?.map((reward) => (
                  <Card key={reward.id} className="relative">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {rewardTypeLabels[reward.rewardType] || reward.rewardType}
                        <Badge variant={reward.isActive ? 'default' : 'secondary'}>
                          {reward.isActive ? 'Активно' : 'Неактивно'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Рефереру:</span>
                          <span className="font-semibold text-green-600">+{reward.referrerAmount} ₸</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Приглашённому:</span>
                          <span className="font-semibold text-blue-600">+{reward.referredAmount} ₸</span>
                        </div>
                        {reward.description && (
                          <p className="text-xs text-muted-foreground mt-2">{reward.description}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => openEditReward(reward)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {/* Add missing reward types */}
                {['registration', 'premium_conversion', 'first_purchase']
                  .filter((type) => !rewardsData?.rewards?.find((r) => r.rewardType === type))
                  .map((type) => (
                    <Card key={type} className="border-dashed">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-muted-foreground">
                          {rewardTypeLabels[type]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Награда не настроена</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setEditingReward({ rewardType: type, referrerAmount: 0, referredAmount: 0, isActive: true });
                            setRewardForm({
                              referrerAmount: '',
                              referredAmount: '',
                              description: '',
                              isActive: true,
                            });
                            setRewardDialogOpen(true);
                          }}
                        >
                          Настроить
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingReward ? rewardTypeLabels[editingReward.rewardType] || 'Награда' : 'Награда'}
                </DialogTitle>
                <DialogDescription>Настройте размер бонусов</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Бонус рефереру (₸)</Label>
                  <Input
                    type="number"
                    value={rewardForm.referrerAmount}
                    onChange={(e) => setRewardForm({ ...rewardForm, referrerAmount: e.target.value })}
                    placeholder="500"
                  />
                  <p className="text-xs text-muted-foreground">Сумма, которую получит пригласивший</p>
                </div>
                <div className="space-y-2">
                  <Label>Бонус приглашённому (₸)</Label>
                  <Input
                    type="number"
                    value={rewardForm.referredAmount}
                    onChange={(e) => setRewardForm({ ...rewardForm, referredAmount: e.target.value })}
                    placeholder="300"
                  />
                  <p className="text-xs text-muted-foreground">Сумма, которую получит приглашённый</p>
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Input
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                    placeholder="Описание для пользователей"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Активно</Label>
                  <Switch
                    checked={rewardForm.isActive}
                    onCheckedChange={(v) => setRewardForm({ ...rewardForm, isActive: v })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleSaveReward} disabled={updateReward.isPending}>
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="codes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Реферальные коды</CardTitle>
              <CardDescription>Все реферальные коды пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Код</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Использований</TableHead>
                    <TableHead>Заработано</TableHead>
                    <TableHead>Premium конверсий</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codesData?.codes?.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-bold">{code.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{code.userName || 'Пользователь'}</p>
                          <p className="text-xs text-muted-foreground">{code.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {code.usageCount}
                        {code.maxUsages && <span className="text-muted-foreground">/{code.maxUsages}</span>}
                      </TableCell>
                      <TableCell className="text-green-600">
                        +{code.totalRewardsEarned.toLocaleString()} ₸
                      </TableCell>
                      <TableCell>{code.premiumConversions}</TableCell>
                      <TableCell>
                        <Badge variant={code.isActive ? 'default' : 'secondary'}>
                          {code.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {code.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeactivateCode(code.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Топ рефереров</CardTitle>
              <CardDescription>Пользователи с наибольшим количеством рефералов</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Код</TableHead>
                    <TableHead>Рефералов</TableHead>
                    <TableHead>Premium конверсий</TableHead>
                    <TableHead>Заработано</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.topReferrers?.map((referrer, index) => (
                    <TableRow key={referrer.userId}>
                      <TableCell>
                        <Badge variant={index < 3 ? 'default' : 'outline'}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{referrer.userName || 'Пользователь'}</p>
                          <p className="text-xs text-muted-foreground">{referrer.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{referrer.code}</TableCell>
                      <TableCell className="font-semibold">{referrer.usageCount}</TableCell>
                      <TableCell>{referrer.premiumConversions}</TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        +{referrer.totalRewards.toLocaleString()} ₸
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
