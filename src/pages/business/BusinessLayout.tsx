import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Building2,
  BarChart3,
  Megaphone,
  CreditCard,
  Settings,
  ChevronLeft,
  Menu,
  Crown,
  Zap,
  Calendar,
  Percent,
  Users,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCurrentUser, useMyBusiness } from '@/hooks/use-api';

const tierConfig = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-800', limit: 3 },
  lite: { label: 'Lite', color: 'bg-blue-100 text-blue-800', limit: 10 },
  premium: { label: 'Premium', color: 'bg-amber-100 text-amber-800', limit: Infinity },
};

const sidebarLinks = [
  { href: '/business', label: 'Дашборд', icon: LayoutDashboard },
  {
    href: '/business/publications',
    label: 'Публикации',
    icon: FileText,
    children: [
      { href: '/business/publications/events', label: 'События', icon: Calendar },
      { href: '/business/publications/promotions', label: 'Акции', icon: Percent },
    ]
  },
  { href: '/business/profile', label: 'Профиль', icon: Building2 },
  { href: '/business/team', label: 'Команда', icon: Users, minTier: 'premium' },
  { href: '/business/stats', label: 'Статистика', icon: BarChart3, minTier: 'lite' },
  { href: '/business/banner', label: 'Реклама', icon: Megaphone, minTier: 'premium' },
  { href: '/business/subscription', label: 'Подписка', icon: CreditCard },
  { href: '/business/settings', label: 'Настройки', icon: Settings },
];

const tierOrder = { free: 0, lite: 1, premium: 2 };

export default function BusinessLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: business, isLoading: businessLoading } = useMyBusiness();

  // Tier configuration with defaults
  const businessTier = (business?.tier || 'free') as keyof typeof tierConfig;
  const tier = tierConfig[businessTier];

  // Calculate posts limit based on tier
  const postsLimit = tier.limit === Infinity ? 999 : tier.limit;
  const postsUsed = business?.postsThisMonth || 0;

  if (userLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Проверка что пользователь - бизнес
  if (!user || user.role !== 'business') {
    return <Navigate to="/auth" replace />;
  }

  // Если у пользователя нет бизнеса - перенаправляем на создание
  if (!business) {
    return <Navigate to="/create-business" replace />;
  }

  const postsPercentage = businessTier === 'premium'
    ? 100
    : (postsUsed / postsLimit) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {business.name.charAt(0)}
            </span>
          </div>
          <span className="font-semibold">{business.name}</span>
        </div>
        <Badge className={tier.color}>{tier.label}</Badge>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-40 h-screen bg-card border-r transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0 lg:w-16",
            "lg:translate-x-0",
            !sidebarOpen && "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Business info */}
            <div className={cn("p-4 border-b", !sidebarOpen && "lg:p-2")}>
              <div className={cn("flex items-center gap-3", !sidebarOpen && "lg:justify-center")}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary-foreground">
                    {business.name.charAt(0)}
                  </span>
                </div>
                {sidebarOpen && (
                  <div className="overflow-hidden">
                    <h2 className="font-semibold truncate">{business.name}</h2>
                    <div className="flex items-center gap-1">
                      <Badge className={cn(tier.color, "text-xs")}>{tier.label}</Badge>
                      {business.isVerified && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                          Проверено
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Posts limit indicator */}
              {sidebarOpen && businessTier !== 'premium' && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Публикаций</span>
                    <span>{postsUsed}/{postsLimit}</span>
                  </div>
                  <Progress value={postsPercentage} className="h-1.5" />
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link) => {
                // Check tier restriction
                if (link.minTier && tierOrder[businessTier] < tierOrder[link.minTier]) {
                  return (
                    <div
                      key={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground opacity-50",
                        !sidebarOpen && "lg:justify-center lg:px-2"
                      )}
                    >
                      <link.icon className="w-5 h-5 shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1">{link.label}</span>
                          <Crown className="w-4 h-4 text-amber-500" />
                        </>
                      )}
                    </div>
                  );
                }

                const isActive = location.pathname === link.href ||
                  (link.children && link.children.some(c => location.pathname === c.href));

                return (
                  <div key={link.href}>
                    <Link
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        !sidebarOpen && "lg:justify-center lg:px-2"
                      )}
                    >
                      <link.icon className="w-5 h-5 shrink-0" />
                      {sidebarOpen && <span>{link.label}</span>}
                    </Link>

                    {/* Children links */}
                    {sidebarOpen && link.children && isActive && (
                      <div className="ml-6 mt-1 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                              location.pathname === child.href
                                ? "bg-primary/5 text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <child.icon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Upgrade banner */}
            {sidebarOpen && businessTier !== 'premium' && (
              <div className="p-4 border-t">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-sm">Улучшить тариф</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {businessTier === 'free'
                      ? 'Получите больше публикаций и статистику'
                      : 'Получите рекламный баннер и безлимит'}
                  </p>
                  <Button size="sm" className="w-full" asChild>
                    <Link to="/business/subscription">
                      Подробнее
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Back to site */}
            <div className="p-2 border-t">
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                  !sidebarOpen && "lg:justify-center lg:px-2"
                )}
              >
                <ExternalLink className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>На сайт</span>}
              </Link>
            </div>

            {/* Collapse button */}
            <div className="hidden lg:block p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <ChevronLeft className={cn("w-4 h-4 transition-transform", !sidebarOpen && "rotate-180")} />
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
