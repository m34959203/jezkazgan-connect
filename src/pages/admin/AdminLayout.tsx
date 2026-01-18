import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Tag,
  MapPin,
  DollarSign,
  Shield,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrentUser, useLogout } from '@/hooks/use-api';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/businesses', label: 'Бизнесы', icon: Building2 },
  { href: '/admin/events', label: 'События', icon: Calendar },
  { href: '/admin/promotions', label: 'Акции', icon: Tag },
  { href: '/admin/cities', label: 'Города', icon: MapPin },
  { href: '/admin/finance', label: 'Финансы', icon: DollarSign },
  { href: '/admin/moderation', label: 'Модерация', icon: Shield },
  { href: '/admin/analytics', label: 'Аналитика', icon: BarChart3 },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if user is admin
  if (user && user.role !== 'admin' && user.role !== 'moderator') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Доступ запрещён</h1>
          <p className="text-muted-foreground mb-4">
            У вас нет прав для доступа к админ-панели
          </p>
          <Link to="/">
            <Button>На главную</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 h-14 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <span className="font-bold">Админ-панель</span>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="font-bold">Afisha Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {/* Back to site */}
          <div className="pt-4 mt-4 border-t">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              На сайт
            </Link>
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
