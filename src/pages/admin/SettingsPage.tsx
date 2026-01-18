import { useState } from 'react';
import { Save, Globe, Bell, CreditCard, Shield, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    siteName: 'Afisha.kz',
    siteDescription: 'Афиша событий и бизнесов Казахстана',
    defaultCity: 'almaty',
    supportEmail: 'support@afisha.kz',
    enableRegistration: true,
    requireEmailVerification: true,
    enableBusinessRegistration: true,
    autoApproveBusinesses: false,
    autoApproveEvents: false,
    moderateComments: true,
    freeTierPostLimit: 3,
    liteTierPostLimit: 10,
    liteTierPrice: 50000,
    premiumTierPrice: 200000,
    userPremiumPrice: 2000,
    enablePayments: true,
    paymentProvider: 'kaspi',
    enableEmailNotifications: true,
    enablePushNotifications: false,
    adminNotifyNewBusiness: true,
    adminNotifyNewComplaint: true,
  });

  const handleSave = () => {
    // В реальности здесь был бы API вызов
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground">
            Конфигурация платформы
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Сохранить
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            Общие
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <Shield className="w-4 h-4 mr-2" />
            Модерация
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <CreditCard className="w-4 h-4 mr-2" />
            Тарифы
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Внешний вид
          </TabsTrigger>
        </TabsList>

        {/* General settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Основные настройки</CardTitle>
              <CardDescription>
                Базовая информация о платформе
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Название сайта</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email поддержки</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Описание сайта</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultCity">Город по умолчанию</Label>
                <Select
                  value={settings.defaultCity}
                  onValueChange={(value) => setSettings({ ...settings, defaultCity: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="almaty">Алматы</SelectItem>
                    <SelectItem value="astana">Астана</SelectItem>
                    <SelectItem value="shymkent">Шымкент</SelectItem>
                    <SelectItem value="karaganda">Караганда</SelectItem>
                    <SelectItem value="jezkazgan">Жезказган</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Регистрация</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Разрешить регистрацию</Label>
                    <p className="text-sm text-muted-foreground">
                      Новые пользователи могут создавать аккаунты
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Подтверждение email</Label>
                    <p className="text-sm text-muted-foreground">
                      Требовать подтверждение email при регистрации
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Регистрация бизнесов</Label>
                    <p className="text-sm text-muted-foreground">
                      Разрешить регистрацию бизнес-аккаунтов
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableBusinessRegistration}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableBusinessRegistration: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation settings */}
        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Настройки модерации</CardTitle>
              <CardDescription>
                Правила проверки контента
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Авто-одобрение бизнесов</Label>
                  <p className="text-sm text-muted-foreground">
                    Новые бизнесы одобряются автоматически
                  </p>
                </div>
                <Switch
                  checked={settings.autoApproveBusinesses}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproveBusinesses: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Авто-одобрение событий</Label>
                  <p className="text-sm text-muted-foreground">
                    События от верифицированных бизнесов одобряются автоматически
                  </p>
                </div>
                <Switch
                  checked={settings.autoApproveEvents}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproveEvents: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Модерация комментариев</Label>
                  <p className="text-sm text-muted-foreground">
                    Проверять комментарии перед публикацией
                  </p>
                </div>
                <Switch
                  checked={settings.moderateComments}
                  onCheckedChange={(checked) => setSettings({ ...settings, moderateComments: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing settings */}
        <TabsContent value="pricing">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Тарифы для бизнеса</CardTitle>
                <CardDescription>
                  Настройка подписок B2B
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-4">Free</h4>
                    <div className="space-y-2">
                      <Label>Лимит публикаций/мес</Label>
                      <Input
                        type="number"
                        value={settings.freeTierPostLimit}
                        onChange={(e) => setSettings({ ...settings, freeTierPostLimit: parseInt(e.target.value) })}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Бесплатно</p>
                  </div>
                  <div className="p-4 border rounded-lg border-blue-200 bg-blue-50/50">
                    <h4 className="font-medium mb-4 text-blue-700">Lite</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Лимит публикаций/мес</Label>
                        <Input
                          type="number"
                          value={settings.liteTierPostLimit}
                          onChange={(e) => setSettings({ ...settings, liteTierPostLimit: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Цена (₸/мес)</Label>
                        <Input
                          type="number"
                          value={settings.liteTierPrice}
                          onChange={(e) => setSettings({ ...settings, liteTierPrice: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg border-amber-200 bg-amber-50/50">
                    <h4 className="font-medium mb-4 text-amber-700">Premium</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Лимит публикаций</Label>
                        <Input value="Безлимит" disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Цена (₸/мес)</Label>
                        <Input
                          type="number"
                          value={settings.premiumTierPrice}
                          onChange={(e) => setSettings({ ...settings, premiumTierPrice: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premium для пользователей</CardTitle>
                <CardDescription>
                  Настройка подписки B2C
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Цена Premium (₸/мес)</Label>
                    <Input
                      type="number"
                      value={settings.userPremiumPrice}
                      onChange={(e) => setSettings({ ...settings, userPremiumPrice: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Платёжная система</Label>
                    <Select
                      value={settings.paymentProvider}
                      onValueChange={(value) => setSettings({ ...settings, paymentProvider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kaspi">Kaspi Pay</SelectItem>
                        <SelectItem value="halyk">Halyk Bank</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <Label>Включить платежи</Label>
                    <p className="text-sm text-muted-foreground">
                      Разрешить оплату подписок
                    </p>
                  </div>
                  <Switch
                    checked={settings.enablePayments}
                    onCheckedChange={(checked) => setSettings({ ...settings, enablePayments: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Email и push-уведомления
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email-уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Отправлять email пользователям
                  </p>
                </div>
                <Switch
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push-уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Отправлять push-уведомления в браузер
                  </p>
                </div>
                <Switch
                  checked={settings.enablePushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enablePushNotifications: checked })}
                />
              </div>
              <Separator />
              <h4 className="font-medium pt-2">Уведомления администраторам</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Новый бизнес</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомлять о новых регистрациях бизнесов
                  </p>
                </div>
                <Switch
                  checked={settings.adminNotifyNewBusiness}
                  onCheckedChange={(checked) => setSettings({ ...settings, adminNotifyNewBusiness: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Новая жалоба</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомлять о новых жалобах
                  </p>
                </div>
                <Switch
                  checked={settings.adminNotifyNewComplaint}
                  onCheckedChange={(checked) => setSettings({ ...settings, adminNotifyNewComplaint: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Внешний вид</CardTitle>
              <CardDescription>
                Настройка темы и брендинга
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Тема оформления</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        theme === 'light'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Sun className="w-6 h-6" />
                      <span className="text-sm font-medium">Светлая</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Moon className="w-6 h-6" />
                      <span className="text-sm font-medium">Тёмная</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        theme === 'system'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Monitor className="w-6 h-6" />
                      <span className="text-sm font-medium">Системная</span>
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Выберите тему оформления. Системная тема автоматически переключается в зависимости от настроек вашего устройства.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Основной цвет</Label>
                  <div className="flex gap-2">
                    {['#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Смена основного цвета требует перезагрузки приложения.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Для изменения логотипа и других элементов брендинга обратитесь к разработчикам.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
