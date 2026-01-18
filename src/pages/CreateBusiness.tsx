import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Phone, Instagram, Globe, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCities } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { createBusiness } from '@/lib/api';

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

export default function CreateBusiness() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: cities } = useCities();

  const [cityOpen, setCityOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [cityId, setCityId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');

  const selectedCity = cities?.find(c => c.id === cityId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !category || !cityId) {
      toast({
        title: 'Заполните обязательные поля',
        description: 'Название, категория и город обязательны',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createBusiness({
        name,
        description: description || undefined,
        category,
        cityId,
        address: address || undefined,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        instagram: instagram || undefined,
        website: website || undefined,
      });

      toast({
        title: 'Бизнес создан!',
        description: 'Добро пожаловать в бизнес-кабинет',
      });

      // Refresh user data and redirect
      window.location.href = '/business';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось создать бизнес';

      // Check if it's an auth error
      const isAuthError = errorMessage.includes('Unauthorized') ||
                          errorMessage.includes('401') ||
                          errorMessage.includes('Token expired') ||
                          errorMessage.includes('Not authenticated');

      toast({
        title: isAuthError ? 'Ошибка авторизации' : 'Ошибка',
        description: isAuthError
          ? 'Пожалуйста, выйдите из аккаунта и войдите заново.'
          : errorMessage,
        variant: 'destructive',
      });

      // If auth error, redirect to login after a delay
      if (isAuthError) {
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Создать бизнес</h1>
              <p className="text-muted-foreground">Зарегистрируйте свой бизнес на Афише</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="space-y-4 p-6 bg-card rounded-xl border">
            <h2 className="font-semibold">Основная информация</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Название бизнеса *</Label>
              <Input
                id="name"
                placeholder='Например: Ресторан "Тюльпан"'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Город *</Label>
              <Popover open={cityOpen} onOpenChange={setCityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityOpen}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {selectedCity?.name || "Выберите город"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Поиск города..." />
                    <CommandList>
                      <CommandEmpty>Город не найден</CommandEmpty>
                      <CommandGroup>
                        {cities?.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => {
                              setCityId(city.id);
                              setCityOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                cityId === city.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Расскажите о вашем бизнесе..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-4 p-6 bg-card rounded-xl border">
            <h2 className="font-semibold">Контакты</h2>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="ул. Мира, 15"
                  className="pl-10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (777) 123-45-67"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+7 (777) 123-45-67"
                    className="pl-10"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="instagram"
                    placeholder="@username"
                    className="pl-10"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Сайт</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    className="pl-10"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Что дальше?</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              После создания бизнеса вы получите доступ к бизнес-кабинету, где сможете публиковать события и акции.
              На бесплатном тарифе доступно 3 публикации в месяц.
            </p>
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Создать бизнес'}
          </Button>
        </form>
      </div>
    </div>
  );
}
