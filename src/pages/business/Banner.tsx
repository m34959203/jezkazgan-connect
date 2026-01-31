import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Image,
  Eye,
  MousePointer,
  TrendingUp,
  Crown,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { useMyBusiness, useMyBusinessBanner, useUpdateMyBusinessBanner, useDeleteMyBusinessBanner } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BusinessBanner() {
  const { toast } = useToast();
  const { data: business, isLoading: businessLoading } = useMyBusiness();
  const { data: bannerData, isLoading: bannerLoading } = useMyBusinessBanner();
  const updateBanner = useUpdateMyBusinessBanner();
  const deleteBanner = useDeleteMyBusinessBanner();

  const [imageUrl, setImageUrl] = useState('');
  const [linkType, setLinkType] = useState<'profile' | 'event' | 'promotion' | 'external'>('profile');
  const [externalLink, setExternalLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sync form with loaded banner data
  const banner = bannerData?.banner;
  const hasBanner = !!banner;

  // Initialize form when banner data loads
  useEffect(() => {
    if (banner) {
      setImageUrl(banner.imageUrl || '');
      setLinkType((banner.linkType as any) || 'profile');
      setIsActive(banner.isActive ?? true);
      if (banner.linkType === 'external' && banner.link) {
        setExternalLink(banner.link);
      }
    }
  }, [banner]);

  if (businessLoading || bannerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user has Premium tier
  if (!business || business.tier !== 'premium') {
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
              <h4 className="font-medium">Тысячи показов</h4>
              <p className="text-sm text-muted-foreground">в месяц</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MousePointer className="w-8 h-8 mx-auto text-primary mb-2" />
              <h4 className="font-medium">Высокий CTR</h4>
              <p className="text-sm text-muted-foreground">кликабельность</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
              <h4 className="font-medium">Больше трафика</h4>
              <p className="text-sm text-muted-foreground">на ваш профиль</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!imageUrl) {
      toast({
        title: 'Загрузите изображение',
        description: 'Для сохранения баннера необходимо загрузить изображение',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateBanner.mutateAsync({
        imageUrl,
        linkType,
        link: linkType === 'external' ? externalLink : undefined,
        isActive,
      });
      toast({
        title: 'Баннер сохранён',
        description: 'Изменения успешно применены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить баннер',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBanner.mutateAsync();
      setImageUrl('');
      setShowDeleteDialog(false);
      toast({
        title: 'Баннер удалён',
        description: 'Баннер успешно удалён',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить баннер',
        variant: 'destructive',
      });
    }
  };

  const stats = banner?.stats || { impressions: 0, clicks: 0, ctr: 0 };
  const displayImageUrl = imageUrl || banner?.imageUrl || '';
  const displayIsActive = hasBanner ? (banner?.isActive ?? true) : isActive;

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
        {hasBanner && (
          <Badge className={displayIsActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {displayIsActive ? 'Активен' : 'Отключён'}
          </Badge>
        )}
      </div>

      {/* Stats */}
      {hasBanner && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Показы</p>
                  <p className="text-2xl font-bold">{stats.impressions.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">за всё время</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Клики</p>
                  <p className="text-2xl font-bold">{stats.clicks.toLocaleString()}</p>
                </div>
                <MousePointer className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">за всё время</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="text-2xl font-bold">{stats.ctr}%</p>
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
              <p className="text-xs text-muted-foreground mt-1">страница города</p>
            </CardContent>
          </Card>
        </div>
      )}

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
            <ImageUpload
              value={displayImageUrl}
              onChange={(url) => setImageUrl(url)}
              folder="afisha/banners"
              aspectRatio={4}
            />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Ссылка при клике</Label>
                <Select
                  value={linkType}
                  onValueChange={(value) => setLinkType(value as any)}
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

              {linkType === 'external' && (
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://..."
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Баннер активен</Label>
                  <p className="text-xs text-muted-foreground">Показывать на главной</p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={updateBanner.isPending || !displayImageUrl}
                className="flex-1"
              >
                {updateBanner.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {hasBanner ? 'Сохранить изменения' : 'Создать баннер'}
              </Button>
              {hasBanner && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteBanner.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info & tips */}
        <div className="space-y-6">
          {/* No banner yet */}
          {!hasBanner && (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Создайте свой первый баннер</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Загрузите изображение баннера, выберите ссылку и нажмите "Создать баннер"
                </p>
              </CardContent>
            </Card>
          )}

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
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить баннер?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Баннер будет удалён вместе со всей статистикой.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBanner.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
