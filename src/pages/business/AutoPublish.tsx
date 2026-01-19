import { useState, useEffect } from 'react';
import {
  Send,
  Settings,
  Check,
  X,
  Loader2,
  Crown,
  ExternalLink,
  History,
  AlertCircle,
  RefreshCcw,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMyBusiness } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAutoPublishSettings,
  saveAutoPublishSettings,
  testAutoPublishConnection,
  fetchAutoPublishHistory,
  deleteAutoPublishSettings,
  type AutoPublishSetting,
  type AutoPublishHistoryItem,
  type SocialPlatform,
} from '@/lib/api';

// Platform icons (using text for simplicity)
const platformConfig: Record<SocialPlatform, { name: string; color: string; icon: string }> = {
  telegram: { name: 'Telegram', color: 'bg-blue-500', icon: 'TG' },
  instagram: { name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: 'IG' },
  vk: { name: 'VKontakte', color: 'bg-blue-600', icon: 'VK' },
  facebook: { name: 'Facebook', color: 'bg-blue-700', icon: 'FB' },
};

export default function AutoPublish() {
  const { toast } = useToast();
  const { data: business, isLoading: businessLoading } = useMyBusiness();

  const [settings, setSettings] = useState<AutoPublishSetting[]>([]);
  const [history, setHistory] = useState<AutoPublishHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Form state for platform config
  const [formData, setFormData] = useState({
    telegramBotToken: '',
    telegramChannelId: '',
    instagramAccessToken: '',
    instagramBusinessAccountId: '',
    vkAccessToken: '',
    vkGroupId: '',
    facebookAccessToken: '',
    facebookPageId: '',
    publishEvents: true,
    publishPromotions: true,
    autoPublishOnCreate: false,
    isEnabled: false,
  });

  const isPremium = business?.tier === 'premium' &&
    (!business?.tierUntil || new Date(business.tierUntil) > new Date());

  // Load settings and history
  useEffect(() => {
    if (isPremium) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isPremium]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, historyData] = await Promise.all([
        fetchAutoPublishSettings(),
        fetchAutoPublishHistory({ limit: 20 }),
      ]);
      setSettings(settingsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load auto-publish data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openConfigDialog = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    // Reset form
    setFormData({
      telegramBotToken: '',
      telegramChannelId: '',
      instagramAccessToken: '',
      instagramBusinessAccountId: '',
      vkAccessToken: '',
      vkGroupId: '',
      facebookAccessToken: '',
      facebookPageId: '',
      publishEvents: true,
      publishPromotions: true,
      autoPublishOnCreate: false,
      isEnabled: false,
    });
    setConfigDialogOpen(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedPlatform) return;

    setIsSaving(true);
    try {
      await saveAutoPublishSettings({
        platform: selectedPlatform,
        ...formData,
      });

      toast({
        title: 'Настройки сохранены',
        description: `${platformConfig[selectedPlatform].name} настроен успешно`,
      });

      setConfigDialogOpen(false);
      loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка сохранения';
      toast({
        title: 'Ошибка',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedPlatform) return;

    setIsTesting(true);
    try {
      // First save settings
      await saveAutoPublishSettings({
        platform: selectedPlatform,
        ...formData,
      });

      // Then test
      const result = await testAutoPublishConnection(selectedPlatform);

      if (result.success) {
        toast({
          title: 'Подключение успешно',
          description: result.info || `${platformConfig[selectedPlatform].name} подключен`,
        });
      } else {
        toast({
          title: 'Ошибка подключения',
          description: result.error || 'Не удалось подключиться',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка проверки';
      toast({
        title: 'Ошибка',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleEnabled = async (platform: SocialPlatform, enabled: boolean) => {
    try {
      await saveAutoPublishSettings({
        platform,
        isEnabled: enabled,
      });

      setSettings((prev) =>
        prev.map((s) =>
          s.platform === platform ? { ...s, isEnabled: enabled } : s
        )
      );

      toast({
        title: enabled ? 'Включено' : 'Отключено',
        description: `Авто-публикация в ${platformConfig[platform].name} ${enabled ? 'включена' : 'отключена'}`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить настройку',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSettings = async (platform: SocialPlatform) => {
    try {
      await deleteAutoPublishSettings(platform);
      setSettings((prev) => prev.filter((s) => s.platform !== platform));
      toast({
        title: 'Настройки удалены',
        description: `${platformConfig[platform].name} отключен`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить настройки',
        variant: 'destructive',
      });
    }
  };

  if (businessLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not premium - show upgrade prompt
  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Авто-публикации</h1>
          <p className="text-muted-foreground">
            Автоматическая публикация в социальные сети
          </p>
        </div>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200">
          <CardContent className="py-8">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-amber-200/50 rounded-full mb-4">
                <Crown className="w-8 h-8 text-amber-700" />
              </div>
              <h2 className="text-xl font-bold mb-2">Business Premium</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Автоматически публикуйте события и акции в Telegram, Instagram и VK.
                Экономьте время и увеличивайте охват!
              </p>
              <Button asChild>
                <a href="/business/subscription">Улучшить тариф</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const configuredPlatforms = settings.filter((s) => s.isConfigured);
  const availablePlatforms = (['telegram', 'vk', 'instagram', 'facebook'] as SocialPlatform[]).filter(
    (p) => !configuredPlatforms.find((s) => s.platform === p)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Авто-публикации</h1>
          <p className="text-muted-foreground">
            Настройка автоматической публикации в социальные сети
          </p>
        </div>
        <Badge variant="outline" className="text-green-700 border-green-300">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            История
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6 space-y-6">
          {/* Connected platforms */}
          {configuredPlatforms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Подключенные платформы</CardTitle>
                <CardDescription>
                  Управляйте настройками авто-публикации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {configuredPlatforms.map((setting) => (
                  <div
                    key={setting.platform}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${platformConfig[setting.platform].color}`}
                      >
                        {platformConfig[setting.platform].icon}
                      </div>
                      <div>
                        <div className="font-medium">
                          {platformConfig[setting.platform].name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {setting.publishEvents && setting.publishPromotions
                            ? 'События и акции'
                            : setting.publishEvents
                            ? 'Только события'
                            : 'Только акции'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Активно</span>
                        <Switch
                          checked={setting.isEnabled}
                          onCheckedChange={(enabled) =>
                            handleToggleEnabled(setting.platform, enabled)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSettings(setting.platform)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Add new platform */}
          <Card>
            <CardHeader>
              <CardTitle>Добавить платформу</CardTitle>
              <CardDescription>
                Подключите новую социальную сеть для авто-публикации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(['telegram', 'vk', 'instagram', 'facebook'] as SocialPlatform[]).map((platform) => {
                  const isConfigured = configuredPlatforms.find((s) => s.platform === platform);

                  return (
                    <button
                      key={platform}
                      onClick={() => !isConfigured && openConfigDialog(platform)}
                      disabled={!!isConfigured}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        isConfigured
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-primary hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${platformConfig[platform].color}`}
                        >
                          {platformConfig[platform].icon}
                        </div>
                        <span className="font-medium">{platformConfig[platform].name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isConfigured ? 'Уже подключено' : 'Нажмите для настройки'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Как это работает?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>При создании события или акции вы сможете опубликовать их в соцсети</li>
                  <li>Можно включить автоматическую публикацию при создании</li>
                  <li>История публикаций сохраняется для отслеживания</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>История публикаций</CardTitle>
                <CardDescription>Последние 20 публикаций</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Обновить
              </Button>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  История публикаций пуста
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${platformConfig[item.platform].color}`}
                        >
                          {platformConfig[item.platform].icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {item.contentType === 'event' ? 'Событие' : 'Акция'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'published' ? (
                          <>
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              <Check className="w-3 h-3 mr-1" />
                              Опубликовано
                            </Badge>
                            {item.externalPostUrl && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={item.externalPostUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </>
                        ) : item.status === 'failed' ? (
                          <Badge variant="destructive">
                            <X className="w-3 h-3 mr-1" />
                            Ошибка
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            В процессе
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlatform && (
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm ${platformConfig[selectedPlatform].color}`}
                >
                  {platformConfig[selectedPlatform].icon}
                </div>
              )}
              Настройка {selectedPlatform && platformConfig[selectedPlatform].name}
            </DialogTitle>
            <DialogDescription>
              Введите данные для подключения к платформе
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedPlatform === 'telegram' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="telegramBotToken">Bot Token</Label>
                  <Input
                    id="telegramBotToken"
                    type="password"
                    placeholder="123456:ABC-DEF..."
                    value={formData.telegramBotToken}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, telegramBotToken: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Получите токен у @BotFather в Telegram
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegramChannelId">Channel ID или Username</Label>
                  <Input
                    id="telegramChannelId"
                    placeholder="@mychannel или -100123456789"
                    value={formData.telegramChannelId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, telegramChannelId: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Бот должен быть администратором канала
                  </p>
                </div>
              </>
            )}

            {selectedPlatform === 'vk' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="vkAccessToken">Access Token</Label>
                  <Input
                    id="vkAccessToken"
                    type="password"
                    placeholder="vk1.a.xxx..."
                    value={formData.vkAccessToken}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, vkAccessToken: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vkGroupId">ID группы</Label>
                  <Input
                    id="vkGroupId"
                    placeholder="123456789"
                    value={formData.vkGroupId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, vkGroupId: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {selectedPlatform === 'instagram' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="instagramAccessToken">Access Token</Label>
                  <Input
                    id="instagramAccessToken"
                    type="password"
                    placeholder="EAA..."
                    value={formData.instagramAccessToken}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, instagramAccessToken: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramBusinessAccountId">Business Account ID</Label>
                  <Input
                    id="instagramBusinessAccountId"
                    placeholder="17841..."
                    value={formData.instagramBusinessAccountId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        instagramBusinessAccountId: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Требуется Instagram Business аккаунт, подключенный к Facebook
                  </p>
                </div>
              </>
            )}

            {selectedPlatform === 'facebook' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="facebookAccessToken">Page Access Token</Label>
                  <Input
                    id="facebookAccessToken"
                    type="password"
                    placeholder="EAA..."
                    value={formData.facebookAccessToken}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, facebookAccessToken: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookPageId">Page ID</Label>
                  <Input
                    id="facebookPageId"
                    placeholder="123456789..."
                    value={formData.facebookPageId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, facebookPageId: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Требуется Page Access Token с правами pages_manage_posts
                  </p>
                </div>
              </>
            )}

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Публиковать события</Label>
                  <p className="text-xs text-muted-foreground">Автоматически при создании</p>
                </div>
                <Switch
                  checked={formData.publishEvents}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, publishEvents: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Публиковать акции</Label>
                  <p className="text-xs text-muted-foreground">Автоматически при создании</p>
                </div>
                <Switch
                  checked={formData.publishPromotions}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, publishPromotions: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Авто-публикация</Label>
                  <p className="text-xs text-muted-foreground">
                    Публиковать сразу при создании контента
                  </p>
                </div>
                <Switch
                  checked={formData.autoPublishOnCreate}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, autoPublishOnCreate: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || isSaving}
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4 mr-2" />
              )}
              Проверить
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving || isTesting}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
