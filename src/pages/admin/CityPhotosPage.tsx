import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  Upload,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useCityPhotos,
  useCreateCityPhoto,
  useUpdateCityPhoto,
  useDeleteCityPhoto,
} from '@/hooks/use-api';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';
import type { CityPhoto } from '@/lib/api';

interface PhotoFormData {
  title: string;
  imageUrl: string;
  isActive: boolean;
}

const defaultFormData: PhotoFormData = {
  title: '',
  imageUrl: '',
  isActive: true,
};

export default function CityPhotosPage() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<CityPhoto | null>(null);
  const [formData, setFormData] = useState<PhotoFormData>(defaultFormData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<CityPhoto | null>(null);

  const { data, isLoading } = useCityPhotos(cityId || '');
  const createPhoto = useCreateCityPhoto();
  const updatePhoto = useUpdateCityPhoto();
  const deletePhoto = useDeleteCityPhoto();

  const photos = data?.photos || [];
  const city = data?.city;

  const activePhotos = photos.filter(p => p.isActive).length;

  const handleOpenCreate = () => {
    setEditingPhoto(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (photo: CityPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      imageUrl: photo.imageUrl,
      isActive: photo.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast.error('Заполните название и загрузите изображение');
      return;
    }

    try {
      const photoData = {
        title: formData.title,
        imageUrl: formData.imageUrl,
        isActive: formData.isActive,
      };

      if (editingPhoto) {
        await updatePhoto.mutateAsync({
          cityId: cityId!,
          photoId: editingPhoto.id,
          data: photoData,
        });
        toast.success('Фото обновлено');
      } else {
        await createPhoto.mutateAsync({
          cityId: cityId!,
          data: photoData,
        });
        toast.success('Фото добавлено');
      }
      setDialogOpen(false);
      setFormData(defaultFormData);
      setEditingPhoto(null);
    } catch (error) {
      toast.error('Ошибка при сохранении фото');
    }
  };

  const handleToggleActive = async (photo: CityPhoto) => {
    try {
      await updatePhoto.mutateAsync({
        cityId: cityId!,
        photoId: photo.id,
        data: { isActive: !photo.isActive },
      });
      toast.success(photo.isActive ? 'Фото скрыто' : 'Фото показано');
    } catch (error) {
      toast.error('Ошибка при обновлении фото');
    }
  };

  const handleDelete = async () => {
    if (!photoToDelete) return;

    try {
      await deletePhoto.mutateAsync({
        cityId: cityId!,
        photoId: photoToDelete.id,
      });
      toast.success('Фото удалено');
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    } catch (error) {
      toast.error('Ошибка при удалении фото');
    }
  };

  const confirmDelete = (photo: CityPhoto) => {
    setPhotoToDelete(photo);
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
          <h1 className="text-3xl font-bold">Фото карусели: {city?.name}</h1>
          <p className="text-muted-foreground">
            Управление фотографиями для карусели на главной странице
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить фото
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <div className="text-2xl font-bold">{photos.length}</div>
            </div>
            <p className="text-sm text-muted-foreground">Всего фотографий</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ToggleRight className="w-5 h-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{activePhotos}</div>
            </div>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
      </div>

      {/* Photos table */}
      <Card>
        <CardHeader>
          <CardTitle>Фотографии карусели</CardTitle>
          <CardDescription>
            Эти фото показываются в карусели на главной странице для данного города
          </CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет фотографий</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте фотографии достопримечательностей для этого города
              </p>
              <Button onClick={handleOpenCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первое фото
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Фото</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {photos.map((photo, index) => (
                  <TableRow key={photo.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {photo.imageUrl ? (
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{photo.title}</span>
                    </TableCell>
                    <TableCell>
                      {photo.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Активно</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">Скрыто</Badge>
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(photo)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(photo)}>
                            {photo.isActive ? (
                              <>
                                <ToggleLeft className="w-4 h-4 mr-2" />
                                Скрыть
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4 mr-2" />
                                Показать
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => confirmDelete(photo)}
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPhoto ? 'Редактировать фото' : 'Добавить фото'}
            </DialogTitle>
            <DialogDescription>
              {editingPhoto
                ? 'Измените данные фотографии'
                : 'Добавьте фотографию для карусели города'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                placeholder="Например: Горы Улытау"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Изображение *</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                folder="afisha/cities"
                label="Загрузите фото"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Показывать в карусели</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={createPhoto.isPending || updatePhoto.isPending}
            >
              {(createPhoto.isPending || updatePhoto.isPending) ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить фото?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить фото "{photoToDelete?.title}"? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePhoto.isPending}
            >
              {deletePhoto.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
