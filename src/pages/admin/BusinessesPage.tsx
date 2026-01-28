import { useState } from 'react';
import { Search, MoreHorizontal, CheckCircle, XCircle, Eye, Edit, Trash2, Loader2, AlertCircle, MapPin, Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminBusinesses, useVerifyBusiness, useUpdateBusiness } from '@/hooks/use-api';
import { deleteAdminBusiness } from '@/lib/api';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const tierLabels: Record<string, string> = {
  free: 'Free',
  lite: 'Lite',
  premium: 'Premium',
};

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-800',
  lite: 'bg-blue-100 text-blue-800',
  premium: 'bg-amber-100 text-amber-800',
};

const tierLimits: Record<string, string> = {
  free: '3',
  lite: '10',
  premium: '∞',
};

const categoryLabels: Record<string, string> = {
  restaurants: 'Рестораны',
  cafes: 'Кафе',
  sports: 'Спорт',
  beauty: 'Красота',
  shopping: 'Магазины',
  education: 'Образование',
  services: 'Услуги',
  entertainment: 'Развлечения',
  other: 'Другое',
};

interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  tier: string;
  isVerified: boolean;
  ownerName?: string;
  ownerEmail?: string;
  cityName?: string;
  address?: string;
  phone?: string;
  website?: string;
  postsThisMonth: number;
  createdAt: string;
}

export default function BusinessesPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [deleteBusinessId, setDeleteBusinessId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewBusiness, setViewBusiness] = useState<Business | null>(null);
  const [editBusiness, setEditBusiness] = useState<Business | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', category: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useAdminBusinesses({
    search: search || undefined,
    tier: tierFilter !== 'all' ? tierFilter : undefined,
    verified: verifiedFilter !== 'all' ? verifiedFilter : undefined,
  });

  const verifyBusiness = useVerifyBusiness();
  const updateBusiness = useUpdateBusiness();

  const handleVerify = async (businessId: string) => {
    try {
      await verifyBusiness.mutateAsync(businessId);
      toast({
        title: 'Успешно',
        description: 'Бизнес верифицирован',
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось верифицировать бизнес',
        variant: 'destructive',
      });
    }
  };

  const handleChangeTier = async (businessId: string, tier: string) => {
    try {
      await updateBusiness.mutateAsync({ id: businessId, data: { tier } });
      toast({
        title: 'Успешно',
        description: `Тариф изменен на ${tierLabels[tier]}`,
      });
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить тариф',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBusiness = async () => {
    if (!deleteBusinessId) return;
    setIsDeleting(true);
    try {
      await deleteAdminBusiness(deleteBusinessId);
      toast({
        title: 'Успешно',
        description: 'Бизнес удалён',
      });
      refetch();
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить бизнес',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteBusinessId(null);
    }
  };

  const handleOpenEdit = (business: Business) => {
    setEditBusiness(business);
    setEditForm({
      name: business.name,
      description: business.description || '',
      category: business.category,
    });
  };

  const handleSaveEdit = async () => {
    if (!editBusiness) return;
    setIsSaving(true);
    try {
      await updateBusiness.mutateAsync({
        id: editBusiness.id,
        data: {
          name: editForm.name,
          description: editForm.description,
          category: editForm.category,
        },
      });
      toast({
        title: 'Успешно',
        description: 'Бизнес обновлён',
      });
      setEditBusiness(null);
      refetch();
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить бизнес',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ошибка загрузки</h2>
        <p className="text-muted-foreground">Не удалось загрузить бизнесы</p>
      </div>
    );
  }

  const businesses = data?.businesses ?? [];
  const total = data?.total ?? 0;
  const tierStats = data?.tierStats ?? { free: 0, lite: 0, premium: 0 };
  const pendingVerification = businesses.filter((b) => !b.isVerified).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Бизнесы</h1>
          <p className="text-muted-foreground">
            Управление бизнес-аккаунтами
          </p>
        </div>
        {pendingVerification > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {pendingVerification} ожидают верификации
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">Всего бизнесов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tierStats.free}</div>
            <p className="text-sm text-muted-foreground">Free</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tierStats.lite}</div>
            <p className="text-sm text-muted-foreground">Lite</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tierStats.premium}</div>
            <p className="text-sm text-muted-foreground">Premium</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или владельцу..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Тариф" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все тарифы</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="lite">Lite</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Верификация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="verified">Верифицированные</SelectItem>
                <SelectItem value="pending">Ожидают проверки</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Businesses table */}
      <Card>
        <CardHeader>
          <CardTitle>Список бизнесов</CardTitle>
          <CardDescription>
            Показано: {businesses.length} бизнесов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бизнес</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Тариф</TableHead>
                <TableHead>Публикаций</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Бизнесы не найдены
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{business.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {business.ownerName || business.ownerEmail || 'Без владельца'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{categoryLabels[business.category] || business.category}</TableCell>
                    <TableCell>{business.cityName || '-'}</TableCell>
                    <TableCell>
                      <Badge className={tierColors[business.tier]} variant="secondary">
                        {tierLabels[business.tier]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{business.postsThisMonth}</span>
                      <span className="text-muted-foreground">
                        /{tierLimits[business.tier]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {business.isVerified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Верифицирован
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-300">
                          Ожидает
                        </Badge>
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
                          <DropdownMenuItem onClick={() => setViewBusiness(business)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Просмотреть
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(business)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          {!business.isVerified && (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleVerify(business.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Верифицировать
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Изменить тариф</DropdownMenuLabel>
                          {Object.entries(tierLabels).map(([tier, label]) => (
                            <DropdownMenuItem
                              key={tier}
                              onClick={() => handleChangeTier(business.id, tier)}
                              disabled={business.tier === tier}
                            >
                              {label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteBusinessId(business.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteBusinessId} onOpenChange={() => setDeleteBusinessId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить бизнес?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Бизнес и все связанные данные (события, акции) будут удалены навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBusiness}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View business dialog */}
      <Dialog open={!!viewBusiness} onOpenChange={() => setViewBusiness(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewBusiness?.name}</DialogTitle>
            <DialogDescription>
              Информация о бизнесе
            </DialogDescription>
          </DialogHeader>
          {viewBusiness && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={tierColors[viewBusiness.tier]} variant="secondary">
                  {tierLabels[viewBusiness.tier]}
                </Badge>
                {viewBusiness.isVerified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Верифицирован
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Ожидает верификации
                  </Badge>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Категория:</span>{' '}
                  <span className="font-medium">{categoryLabels[viewBusiness.category] || viewBusiness.category}</span>
                </div>

                {viewBusiness.description && (
                  <div>
                    <span className="text-muted-foreground">Описание:</span>
                    <p className="mt-1">{viewBusiness.description}</p>
                  </div>
                )}

                {viewBusiness.cityName && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{viewBusiness.cityName}</span>
                    {viewBusiness.address && <span className="text-muted-foreground">• {viewBusiness.address}</span>}
                  </div>
                )}

                {viewBusiness.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{viewBusiness.phone}</span>
                  </div>
                )}

                {viewBusiness.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={viewBusiness.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {viewBusiness.website}
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">Владелец:</span>{' '}
                  <span className="font-medium">{viewBusiness.ownerName || viewBusiness.ownerEmail || 'Не указан'}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Публикаций в этом месяце:</span>{' '}
                  <span className="font-medium">{viewBusiness.postsThisMonth}/{tierLimits[viewBusiness.tier]}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Дата создания:</span>{' '}
                  <span className="font-medium">{new Date(viewBusiness.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit business dialog */}
      <Dialog open={!!editBusiness} onOpenChange={() => setEditBusiness(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Редактировать бизнес</DialogTitle>
            <DialogDescription>
              Внесите изменения в информацию о бизнесе
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Название</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Название бизнеса"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Описание бизнеса"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Категория</Label>
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBusiness(null)} disabled={isSaving}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving || !editForm.name.trim()}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
