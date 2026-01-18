import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Image,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Edit,
  Crown,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// Mock data
const mockBusiness = {
  tier: 'premium' as const, // Change to 'lite' or 'free' to see locked state
};

const mockBanner = {
  id: '1',
  imageUrl: 'https://placehold.co/1200x300/F59E0B/FFF?text=Рекламный+баннер',
  link: '/business/profile',
  linkType: 'profile' as const,
  isActive: true,
  schedule: {
    enabled: false,
    startTime: '09:00',
    endTime: '21:00',
    days: ['пн', 'вт', 'ср', 'чт', 'пт'],
  },
  stats: {
    impressions: 45230,
    clicks: 1245,
    ctr: 2.75,
  },
};

const mockWeeklyStats = [
  { day: 'Пн', impressions: 6500, clicks: 180 },
  { day: 'Вт', impressions: 7200, clicks: 195 },
  { day: 'Ср', impressions: 6800, clicks: 175 },
  { day: 'Чт', impressions: 7500, clicks: 210 },
  { day: 'Пт', impressions: 8200, clicks: 240 },
  { day: 'Сб', impressions: 5100, clicks: 130 },
  { day: 'Вс', impressions: 3930, clicks: 115 },
];

export default function BusinessBanner() {
  const business = mockBusiness;
  const [banner, setBanner] = useState(mockBanner);

  // Check if user has Premium tier
  if (business.tier !== 'premium') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Рекламный баннер</h1>
          <p className="text-muted-foreground">
            Размещение баннера на главной странице
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Функция Premium</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Рекламный баннер на главной странице доступен только для тарифа Premium.
              Привлекайте больше клиентов с помощью яркой рекламы!
            </p>
            <Button asChild>
              <Link to="/business/subscription">
                <Crown className="w-4 h-4 mr-2" />
                Перейти на Premium — 200,000 ₸/мес
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Benefits preview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <Eye className="w-8 h-8 mx-auto text-primary mb-2" />
              <h4 className="font-medium">45,000+ показов</h4>
              <p className="text-sm text-muted-foreground">в месяц в среднем</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MousePointer className="w-8 h-8 mx-auto text-primary mb-2" />
              <h4 className="font-medium">2-3% CTR</h4>
              <p className="text-sm text-muted-foreground">кликабельность</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
              <h4 className="font-medium">+40% трафика</h4>
              <p className="text-sm text-muted-foreground">на ваш профиль</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const maxImpressions = Math.max(...mockWeeklyStats.map((s) => s.impressions));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Рекламный баннер</h1>
          <p className="text-muted-foreground">
            Управление баннером на главной странице
          </p>
        </div>
        <Badge className={banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {banner.isActive ? 'Активен' : 'Отключён'}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Показы</p>
                <p className="text-2xl font-bold">{banner.stats.impressions.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">за 30 дней</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Клики</p>
                <p className="text-2xl font-bold">{banner.stats.clicks.toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">за 30 дней</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CTR</p>
                <p className="text-2xl font-bold">{banner.stats.ctr}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">кликабельность</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Позиция</p>
                <p className="text-2xl font-bold">Главная</p>
              </div>
              <Image className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">топ страницы</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Banner preview & upload */}
        <Card>
          <CardHeader>
            <CardTitle>Баннер</CardTitle>
            <CardDescription>
              Рекомендуемый размер: 1200x300px
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {banner.imageUrl ? (
              <div className="relative group">
                <img
                  src={banner.imageUrl}
                  alt="Banner preview"
                  className="w-full h-auto rounded-lg border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary">
                    <Edit className="w-4 h-4 mr-1" />
                    Изменить
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Удалить
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Перетащите изображение или нажмите для загрузки
                </p>
                <Button variant="outline">
                  Выбрать файл
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Ссылка при клике</Label>
                <Select
                  value={banner.linkType}
                  onValueChange={(value) => setBanner({ ...banner, linkType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profile">Профиль бизнеса</SelectItem>
                    <SelectItem value="event">Конкретное событие</SelectItem>
                    <SelectItem value="promotion">Конкретная акция</SelectItem>
                    <SelectItem value="external">Внешняя ссылка</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {banner.linkType === 'external' && (
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://..."
                    value={banner.link}
                    onChange={(e) => setBanner({ ...banner, link: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Баннер активен</Label>
                  <p className="text-xs text-muted-foreground">Показывать на главной</p>
                </div>
                <Switch
                  checked={banner.isActive}
                  onCheckedChange={(checked) => setBanner({ ...banner, isActive: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Stats chart */}
        <div className="space-y-6">
          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Расписание показа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Показывать по расписанию</Label>
                  <p className="text-xs text-muted-foreground">
                    Ограничить время показа баннера
                  </p>
                </div>
                <Switch
                  checked={banner.schedule.enabled}
                  onCheckedChange={(checked) =>
                    setBanner({
                      ...banner,
                      schedule: { ...banner.schedule, enabled: checked },
                    })
                  }
                />
              </div>

              {banner.schedule.enabled && (
                <div className="space-y-3 p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">С</Label>
                      <Input
                        type="time"
                        value={banner.schedule.startTime}
                        onChange={(e) =>
                          setBanner({
                            ...banner,
                            schedule: { ...banner.schedule, startTime: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">До</Label>
                      <Input
                        type="time"
                        value={banner.schedule.endTime}
                        onChange={(e) =>
                          setBanner({
                            ...banner,
                            schedule: { ...banner.schedule, endTime: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                      <button
                        key={day}
                        className={`flex-1 py-1 text-xs rounded ${
                          banner.schedule.days.includes(day.toLowerCase())
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly chart */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика за неделю</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockWeeklyStats.map((stat) => (
                  <div key={stat.day} className="flex items-center gap-3">
                    <span className="w-6 text-sm text-muted-foreground">{stat.day}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 bg-primary/20 rounded"
                          style={{ width: `${(stat.impressions / maxImpressions) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {stat.impressions.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground w-16 text-right">
                      {stat.clicks} кликов
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Советы для эффективного баннера</p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                <li>• Используйте яркие, контрастные цвета</li>
                <li>• Добавьте чёткий призыв к действию (CTA)</li>
                <li>• Укажите ограниченное предложение для срочности</li>
                <li>• Обновляйте баннер раз в 2-4 недели</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
