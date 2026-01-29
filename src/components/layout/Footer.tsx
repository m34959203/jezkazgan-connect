import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Send } from 'lucide-react';
import { useCities } from '@/hooks/use-api';

export function Footer() {
  const { data: cities } = useCities();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCitySlug = localStorage.getItem('selectedCity') || 'almaty';
  const currentCity = cities?.find(c => c.slug === selectedCitySlug);
  const cityName = currentCity?.name || 'Казахстан';
  const currentYear = new Date().getFullYear();

  const handleHashLink = (e: React.MouseEvent<HTMLAnchorElement>, path: string, hash: string) => {
    e.preventDefault();

    if (location.pathname === path) {
      // Already on the page, just scroll to section
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `${path}#${hash}`);
      }
    } else {
      // Navigate to the page with hash
      navigate(`${path}#${hash}`);
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* О проекте */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">A</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">KazAfisha</h3>
                <p className="text-xs text-muted-foreground">{cityName}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Городская платформа для жителей и бизнеса. События, акции, сообщества — всё в одном месте.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/kazafisha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/kazafisha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Разделы */}
          <div>
            <h4 className="font-semibold mb-4">Разделы</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Афиша событий</Link></li>
              <li><Link to="/categories" className="hover:text-foreground transition-colors">Категории</Link></li>
              <li><Link to="/promotions" className="hover:text-foreground transition-colors">Скидки и акции</Link></li>
              <li><Link to="/businesses" className="hover:text-foreground transition-colors">Каталог бизнесов</Link></li>
              <li><Link to="/community" className="hover:text-foreground transition-colors">Сообщество</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">О платформе</Link></li>
            </ul>
          </div>

          {/* Для бизнеса */}
          <div>
            <h4 className="font-semibold mb-4">Для бизнеса</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/for-business" className="hover:text-foreground transition-colors">Возможности</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Регистрация бизнеса</Link></li>
              <li>
                <a
                  href="/for-business#pricing"
                  onClick={(e) => handleHashLink(e, '/for-business', 'pricing')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Тарифы
                </a>
              </li>
              <li>
                <a
                  href="/for-business#advertising"
                  onClick={(e) => handleHashLink(e, '/for-business', 'advertising')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Реклама
                </a>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{cityName}, Казахстан</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+77001234567" className="hover:text-foreground transition-colors">
                  +7 (700) 123-45-67
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:info@kazafisha.kz" className="hover:text-foreground transition-colors">
                  info@kazafisha.kz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} KazAfisha. Все права защищены.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Пользовательское соглашение</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
