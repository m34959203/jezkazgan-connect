import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Phone, Building2, Eye, EyeOff, MapPin, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useCities, useLogin, useRegister } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

type AuthTab = 'login' | 'register';
type UserType = 'resident' | 'entrepreneur';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<AuthTab>('login');
  const [userType, setUserType] = useState<UserType>('resident');
  const [showPassword, setShowPassword] = useState(false);
  const [businessCityOpen, setBusinessCityOpen] = useState(false);
  const [businessCitySlug, setBusinessCitySlug] = useState<string>('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  // API hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // City selection sync with localStorage
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('selectedCity') || 'jezkazgan';
  });
  const { data: cities } = useCities();
  const currentCity = cities?.find(c => c.slug === selectedCity);

  // Listen for city changes from Header
  useEffect(() => {
    const handleStorageChange = () => {
      const city = localStorage.getItem('selectedCity') || 'jezkazgan';
      if (city !== selectedCity) {
        setSelectedCity(city);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedCity]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в аккаунт',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: error instanceof Error ? error.message : 'Неверный email или пароль',
        variant: 'destructive',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync({ email, password, name, phone });
      toast({
        title: 'Регистрация успешна!',
        description: 'Добро пожаловать в Афишу',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Ошибка регистрации',
        description: error instanceof Error ? error.message : 'Не удалось зарегистрироваться',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Левая панель - форма */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Назад */}
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>

          {/* Логотип */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {currentCity?.name?.charAt(0) || 'А'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Афиша {currentCity?.name || 'Казахстан'}</h1>
              <p className="text-sm text-muted-foreground">
                {tab === 'login' ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
              </p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as AuthTab)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            {/* Вход */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Забыли пароль?
                  </a>
                </div>

                <Button type="submit" className="w-full btn-glow" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? 'Вход...' : 'Войти'}
                </Button>
              </form>
            </TabsContent>

            {/* Регистрация */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Тип пользователя */}
                <div className="space-y-2">
                  <Label>Тип аккаунта</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('resident')}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        userType === 'resident'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <User className="w-6 h-6 mb-2 text-primary" />
                      <p className="font-medium">Житель</p>
                      <p className="text-xs text-muted-foreground">
                        Просмотр событий и акций
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('entrepreneur')}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        userType === 'entrepreneur'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <Building2 className="w-6 h-6 mb-2 text-teal" />
                      <p className="font-medium">Бизнес</p>
                      <p className="text-xs text-muted-foreground">
                        Размещение событий
                      </p>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-name">Имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Ваше имя"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Телефон</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+7 (7XX) XXX-XX-XX"
                      className="pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {userType === 'entrepreneur' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="business">Название бизнеса</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="business"
                          type="text"
                          placeholder="Название компании"
                          className="pl-10"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Город бизнеса</Label>
                      <Popover open={businessCityOpen} onOpenChange={setBusinessCityOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={businessCityOpen}
                            className="w-full justify-between pl-10 relative"
                          >
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            {businessCitySlug
                              ? cities?.find((city) => city.slug === businessCitySlug)?.name
                              : "Выберите город..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Введите название города..." />
                            <CommandList>
                              <CommandEmpty>Город не найден</CommandEmpty>
                              <CommandGroup>
                                {cities?.map((city) => (
                                  <CommandItem
                                    key={city.id}
                                    value={city.name}
                                    onSelect={() => {
                                      setBusinessCitySlug(city.slug);
                                      setBusinessCityOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        businessCitySlug === city.slug ? "opacity-100" : "opacity-0"
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
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Минимум 8 символов"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full btn-glow" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <a href="#" className="text-primary hover:underline">условиями использования</a>
                  {' '}и{' '}
                  <a href="#" className="text-primary hover:underline">политикой конфиденциальности</a>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Правая панель - изображение */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200"
          alt={currentCity?.name || 'Казахстан'}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-teal/60 mix-blend-multiply" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold font-display mb-4">
              Добро пожаловать в сообщество
            </h2>
            <p className="text-xl text-white/90 max-w-md">
              Присоединяйтесь к тысячам жителей и предпринимателей города {currentCity?.name || 'Казахстан'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
