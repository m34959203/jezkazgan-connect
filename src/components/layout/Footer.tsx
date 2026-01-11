import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* О проекте */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">Ж</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Афиша Жезказган</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Городская платформа для жителей и бизнеса. События, акции, сообщества — всё в одном месте.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
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
            </ul>
          </div>

          {/* Для бизнеса */}
          <div>
            <h4 className="font-semibold mb-4">Для бизнеса</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/auth" className="hover:text-foreground transition-colors">Регистрация бизнеса</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Разместить событие</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Добавить акцию</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">VIP-доступ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Реклама</a></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>г. Жезказган, Карагандинская область, Казахстан</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+77102123456" className="hover:text-foreground transition-colors">
                  +7 (7102) 12-34-56
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:info@afisha-zhz.kz" className="hover:text-foreground transition-colors">
                  info@afisha-zhz.kz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 Афиша Жезказган. Все права защищены.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-foreground transition-colors">Пользовательское соглашение</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
