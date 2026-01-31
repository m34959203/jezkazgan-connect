import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MousePointerClick,
  Image as ImageIcon,
  ExternalLink,
  Calendar as CalendarIcon,
  ToggleLeft,
  ToggleRight,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  useCityBanners,
  useCreateCityBanner,
  useUpdateCityBanner,
  useDeleteCityBanner,
  useAdminBusinesses,
} from '@/hooks/use-api';
import { toast } from 'sonner';
import type { CityBanner } from '@/lib/api';
import { cn } from '@/lib/utils';

interface BannerFormData {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  linkType: string;
  isActive: boolean;
  businessId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const defaultFormData: BannerFormData = {
  title: '',
  description: '',
  imageUrl: '',
  link: '',
  linkType: 'external',
  isActive: true,
  businessId: '',
  startDate: undefined,
  endDate: undefined,
};

export default function CityBannersPage() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CityBanner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<CityBanner | null>(null);

  const { data, isLoading } = useCityBanners(cityId || '');
  const { data: businessesData } = useAdminBusinesses({ limit: 100 });
  const createBanner = useCreateCityBanner();
  const updateBanner = useUpdateCityBanner();
  const deleteBanner = useDeleteCityBanner();

  const banners = data?.banners || [];
  const city = data?.city;
  const premiumBusinesses = businessesData?.businesses?.filter(b => b.tier === 'premium') || [];

  const activeBanners = banners.filter(b => b.isActive).length;
  const totalViews = banners.reduce((acc, b) => acc + b.viewsCount, 0);
  const totalClicks = banners.reduce((acc, b) => acc + b.clicksCount, 0);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (banner: CityBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      link: banner.link || '',
      linkType: banner.linkType || 'external',
      isActive: banner.isActive,
      businessId: banner.businessId || '',
      startDate: banner.startDate ? new Date(banner.startDate) : undefined,
      endDate: banner.endDate ? new Date(banner.endDate) : undefined,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast.error('Заполните название и URL изображения');
      return;
    }

    try {
      const bannerData = {
        title: formData.title,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl,
        link: formData.link || undefined,
        linkType: formData.linkType,
        isActive: formData.isActive,
        businessId: formData.businessId || undefined,
        startDate: formData.startDate ? formData.startDate.toISOString() : undefined,
        endDate: formData.endDate ? formData.endDate.toISOString() : undefined,
      };

      if (editingBanner) {
        await updateBanner.mutateAsync({
          cityId: cityId!,
          bannerId: editingBanner.id,
          data: bannerData,
        });
        toast.success('Баннер обновлён');
      } else {
        await createBanner.mutateAsync({
          cityId: cityId!,
          data: bannerData,
        });
        toast.success('Баннер создан');
      }
      setDialogOpen(false);
      setFormData(defaultFormData);
      setEditingBanner(null);
    } catch (error) {
      toast.error('Ошибка при сохранении баннера');
    }
  };

  const handleToggleActive = async (banner: CityBanner) => {
    try {
      await updateBanner.mutateAsync({
        cityId: cityId!,
        bannerId: banner.id,
        data: { isActive: !banner.isActive },
      });
      toast.success(banner.isActive ? 'Баннер отключён' : 'Баннер включён');
    } catch (error) {
      toast.error('Ошибка при обновлении баннера');
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;

    try {
      await deleteBanner.mutateAsync({
        cityId: cityId!,
        bannerId: bannerToDelete.id,
      });
      toast.success('Баннер удалён');
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    } catch (error) {
      toast.error('Ошибка при удалении баннера');
    }
  };

  const confirmDelete = (banner: CityBanner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/cities')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Баннеры: {city?.name}</h1>
          <p className="text-muted-foreground">
            Управление рекламными баннерами для города
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить баннер
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <div className="text-2xl font-bold">{banners.length}</div>
            </div>
            <p className="text-sm text-muted-foreground">Всего баннеров</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ToggleRight className="w-5 h-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{activeBanners}</div>
            </div>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            </div>
            <p className="text-sm text-muted-foreground">Просмотров</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-purple-600" />
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            </div>
            <p className="text-sm text-muted-foreground">Кликов</p>
          </CardContent>
        </Card>
      </div>

      {/* Banners table */}
      <Card>
        <CardHeader>
          <CardTitle>Список баннеров</CardTitle>
          <CardDescription>
            Баннеры показываются в карусели на странице города вместо стандартных фото
          </CardDescription>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет баннеров</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте рекламные баннеры премиум-клиентов для этого города
              </p>
              <Button onClick={handleOpenCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый баннер
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Баннер</TableHead>
                  <TableHead>Бизнес</TableHead>
                  <TableHead>Ссылка</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Статистика</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner, index) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {banner.imageUrl ? (
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{banner.title}</span>
                          {banner.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {banner.businessName ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {banner.businessName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {banner.link ? (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {banner.link}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {banner.startDate || banner.endDate ? (
                        <div className="text-sm">
                          {banner.startDate && (
                            <span>{new Date(banner.startDate).toLocaleDateString('ru')}</span>
                          )}
                          {banner.startDate && banner.endDate && ' - '}
                          {banner.endDate && (
                            <span>{new Date(banner.endDate).toLocaleDateString('ru')}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Бессрочно</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {banner.viewsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3" />
                          {banner.clicksCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {banner.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Активен</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">Отключён</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenEdit(banner)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(banner)}>
                            {banner.isActive ? (
                              <>
                                <ToggleLeft className="w-4 h-4 mr-2" />
                                Отключить
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4 mr-2" />
                                Включить
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => confirmDelete(banner)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Редактировать баннер' : 'Добавить баннер'}
            </DialogTitle>
            <DialogDescription>
              {editingBanner
                ? 'Измените данные рекламного баннера'
                : 'Добавьте рекламный баннер премиум-клиента для этого города'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  placeholder="Название баннера"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessId">Премиум бизнес</Label>
                <Select
                  value={formData.businessId}
                  onValueChange={(value) => setFormData({ ...formData, businessId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите бизнес" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Без привязки</SelectItem>
                    {premiumBusinesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Краткое описание (опционально)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL изображения *</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/banner.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              {formData.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link">Ссылка</Label>
                <Input
                  id="link"
                  placeholder="https://example.com"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkType">Тип ссылки</Label>
                <Select
                  value={formData.linkType}
                  onValueChange={(value) => setFormData({ ...formData, linkType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">Внешняя</SelectItem>
                    <SelectItem value="business">Страница бизнеса</SelectItem>
                    <SelectItem value="event">Событие</SelectItem>
                    <SelectItem value="promotion">Акция</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата начала</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, 'd MMM yyyy', { locale: ru }) : 'Выберите'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Дата окончания</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, 'd MMM yyyy', { locale: ru }) : 'Выберите'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Баннер активен</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={createBanner.isPending || updateBanner.isPending}
            >
              {(createBanner.isPending || updateBanner.isPending) ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить баннер?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить баннер "{bannerToDelete?.title}"? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteBanner.isPending}
            >
              {deleteBanner.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
