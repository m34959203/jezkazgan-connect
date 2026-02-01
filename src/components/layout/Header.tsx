import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bell, User, MapPin, Loader2, Check, ChevronsUpDown, Shield, LogOut, Building2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useCities, useCurrentUser, useLogout } from '@/hooks/use-api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';

const navLinks = [
  { href: '/', label: 'Афиша' },
  { href: '/categories', label: 'Категории' },
  { href: '/promotions', label: 'Скидки' },
  { href: '/businesses', label: 'Бизнесы' },
  { href: '/community', label: 'Сообщество' },
];

function MobileThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getLabel = () => {
    if (theme === 'light') return 'Светлая тема';
    if (theme === 'dark') return 'Тёмная тема';
    return 'Системная тема';
  };

  return (
    <button
      onClick={cycleTheme}
      className="px-4 py-3 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 w-full text-left"
    >
      {resolvedTheme === 'dark' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      {getLabel()}
    </button>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('selectedCity') || 'jezkazgan';
  });
  const location = useLocation();

  // Загружаем города из API
  const { data: cities, isLoading: citiesLoading } = useCities();

  // Текущий пользователь
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const isBusiness = user?.role === 'business';

  // Текущий город
  const currentCity = cities?.find(c => c.slug === selectedCity);

  // Сохраняем выбранный город
  useEffect(() => {
    localStorage.setItem('selectedCity', selectedCity);
  }, [selectedCity]);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Логотип + Город */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">
                  {currentCity?.name?.charAt(0) || 'А'}
                </span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">Афиша</h1>
              </div>
            </Link>

            {/* Селектор города с поиском */}
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              {citiesLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      role="combobox"
                      aria-expanded={cityOpen}
                      className="w-[140px] h-8 justify-between text-sm px-2"
                    >
                      {currentCity?.name || "Город..."}
                      <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
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
                                setSelectedCity(city.slug);
                                setCityOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCity === city.slug ? "opacity-100" : "opacity-0"
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
              )}
            </div>
          </div>

          {/* Навигация - десктоп */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'nav-link',
                  location.pathname === link.href && 'active'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Действия */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="max-w-[100px] truncate">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isBusiness && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/business" className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          Кабинет бизнеса
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Админ-панель
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="hidden sm:flex gap-2 btn-glow">
                  <User className="w-4 h-4" />
                  <span>Войти</span>
                </Button>
              </Link>
            )}

            {/* Мобильное меню */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border/50 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <MobileThemeToggle />
              {isBusiness && (
                <Link
                  to="/business"
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Building2 className="w-4 h-4" />
                  Кабинет бизнеса
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Админ-панель
                </Link>
              )}
              {user ? (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="default" className="w-full mt-2 btn-glow">
                    <User className="w-4 h-4 mr-2" />
                    Войти
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
