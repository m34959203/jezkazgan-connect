import { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Instagram,
  Globe,
  Edit,
  Save,
  X,
  Camera,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyBusiness } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { updateBusiness } from '@/lib/api';

const businessCategories = [
  { value: 'restaurants', label: 'Рестораны' },
  { value: 'cafes', label: 'Кафе' },
  { value: 'sports', label: 'Спорт' },
  { value: 'beauty', label: 'Красота' },
  { value: 'education', label: 'Образование' },
  { value: 'services', label: 'Услуги' },
  { value: 'shopping', label: 'Магазины' },
  { value: 'entertainment', label: 'Развлечения' },
  { value: 'other', label: 'Другое' },
];

export default function BusinessProfile() {
  const { toast } = useToast();
  const { data: business, isLoading, refetch } = useMyBusiness();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    website: '',
  });

  const startEditing = () => {
    if (business) {
      setFormData({
        name: business.name || '',
        description: business.description || '',
        category: business.category || '',
        address: business.address || '',
        phone: business.phone || '',
        whatsapp: business.whatsapp || '',
        instagram: business.instagram || '',
        website: business.website || '',
      });
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!business) return;

    setIsSaving(true);
    try {
      await updateBusiness(business.id, {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        instagram: formData.instagram || undefined,
        website: formData.website || undefined,
      });

      toast({
        title: 'Профиль обновлён',
        description: 'Изменения сохранены',
      });

      setIsEditing(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Бизнес не найден</p>
      </div>
    );
  }

  const categoryLabel = businessCategories.find(c => c.value === business.category)?.label || business.category;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Профиль бизнеса</h1>
          <p className="text-muted-foreground">Информация о вашем бизнесе</p>
        </div>
        {!isEditing ? (
          <Button onClick={startEditing}>
            <Edit className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={cancelEditing}>
              <X className="w-4 h-4 mr-2" />
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        )}
      </div>

      {/* Business card preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-xl bg-muted flex items-center justify-center">
                {business.logo ? (
                  <img src={business.logo} alt={business.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              {isEditing && (
                <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full">
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-2xl font-bold h-auto py-1"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{business.name}</h2>
                  )}
                  {business.isVerified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Проверено
                    </Badge>
                  )}
                </div>
                {isEditing ? (
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{categoryLabel}</Badge>
                )}
              </div>

              {isEditing ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание бизнеса..."
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground">
                  {business.description || 'Описание не указано'}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {business.city && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {business.city.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact info */}
      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
          <CardDescription>Контакты для клиентов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Адрес</Label>
              {isEditing ? (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10"
                    placeholder="ул. Мира, 15"
                  />
                </div>
              ) : (
                <p className="text-sm">{business.address || 'Не указан'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Телефон</Label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    placeholder="+7 (777) 123-45-67"
                  />
                </div>
              ) : (
                <p className="text-sm">{business.phone || 'Не указан'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>WhatsApp</Label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="pl-10"
                    placeholder="+7 (777) 123-45-67"
                  />
                </div>
              ) : (
                <p className="text-sm">{business.whatsapp || 'Не указан'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Instagram</Label>
              {isEditing ? (
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="pl-10"
                    placeholder="@username"
                  />
                </div>
              ) : (
                <p className="text-sm">{business.instagram || 'Не указан'}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Сайт</Label>
              {isEditing ? (
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="pl-10"
                    placeholder="https://example.com"
                  />
                </div>
              ) : (
                <p className="text-sm">{business.website || 'Не указан'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{business.tier === 'premium' ? 'Premium' : business.tier === 'lite' ? 'Lite' : 'Free'}</p>
              <p className="text-sm text-muted-foreground">Тариф</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{business.postsThisMonth || 0}</p>
              <p className="text-sm text-muted-foreground">Публикаций</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{business.isVerified ? 'Да' : 'Нет'}</p>
              <p className="text-sm text-muted-foreground">Верификация</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{business.city?.name || '-'}</p>
              <p className="text-sm text-muted-foreground">Город</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
