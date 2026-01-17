import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bell, User, MapPin, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useCities } from '@/hooks/use-api';

const navLinks = [
  { href: '/', label: 'Афиша' },
  { href: '/categories', label: 'Категории' },
  { href: '/promotions', label: 'Скидки' },
  { href: '/businesses', label: 'Бизнесы' },
  { href: '/community', label: 'Сообщество' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('selectedCity') || 'jezkazgan';
  });
  const location = useLocation();

  // Загружаем города из API
  const { data: cities, isLoading: citiesLoading } = useCities();

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
            <Link to="/auth">
              <Button variant="default" size="sm" className="hidden sm:flex gap-2 btn-glow">
                <User className="w-4 h-4" />
                <span>Войти</span>
              </Button>
            </Link>

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
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="default" className="w-full mt-2 btn-glow">
                  <User className="w-4 h-4 mr-2" />
                  Войти
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
