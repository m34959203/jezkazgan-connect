import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import {
  Store,
  Calendar,
  Gift,
  TrendingUp,
  Users,
  BarChart3,
  Megaphone,
  Check,
  Star,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const features = [
  {
    icon: Store,
    title: 'Профиль компании',
    description: 'Создайте страницу вашего бизнеса с полной информацией: фото, контакты, режим работы, услуги и цены.',
  },
  {
    icon: Calendar,
    title: 'Публикация событий',
    description: 'Размещайте мероприятия в городской афише. Концерты, мастер-классы, открытия — всё увидят тысячи пользователей.',
  },
  {
    icon: Gift,
    title: 'Акции и скидки',
    description: 'Публикуйте выгодные предложения. Привлекайте новых клиентов и повышайте лояльность постоянных.',
  },
  {
    icon: TrendingUp,
    title: 'Статистика и аналитика',
    description: 'Отслеживайте просмотры, клики и сохранения. Понимайте свою аудиторию и оптимизируйте контент.',
  },
  {
    icon: Users,
    title: 'Работа с командой',
    description: 'Добавляйте сотрудников с разными уровнями доступа. Делегируйте публикации и управление.',
  },
  {
    icon: BarChart3,
    title: 'Интеграция с CRM',
    description: 'Подключите автопубликацию через API. Синхронизируйте события и акции из вашей CRM-системы.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'навсегда',
    description: 'Для начала работы с платформой',
    features: [
      '3 публикации в месяц',
      'Базовый профиль компании',
      'Статистика просмотров',
      'Поддержка по email',
    ],
    limitations: [
      'Без баннерной рекламы',
      'Без приоритета в выдаче',
      'Без API доступа',
    ],
    cta: 'Начать бесплатно',
    popular: false,
  },
  {
    name: 'Lite',
    price: '9 900',
    period: 'в месяц',
    description: 'Для активно развивающегося бизнеса',
    features: [
      '10 публикаций в месяц',
      'Расширенный профиль',
      'Детальная аналитика',
      'Приоритетная поддержка',
      'Бейдж "Проверенный"',
      'Выделение в списке',
    ],
    limitations: [
      'Без баннерной рекламы',
      'Без API доступа',
    ],
    cta: 'Выбрать Lite',
    popular: true,
  },
  {
    name: 'Premium',
    price: '29 900',
    period: 'в месяц',
    description: 'Максимум возможностей для лидеров',
    features: [
      'Безлимитные публикации',
      'Premium профиль компании',
      'Расширенная аналитика',
      'Персональный менеджер',
      'Бейдж "Premium партнёр"',
      'Топ позиция в выдаче',
      'Баннерная реклама',
      'API для автопубликации',
      '1 баннер на главной',
    ],
    limitations: [],
    cta: 'Выбрать Premium',
    popular: false,
  },
];

const advertisingOptions = [
  {
    icon: Megaphone,
    title: 'Баннер на главной',
    description: 'Яркий баннер в верхней части главной страницы города. Максимальный охват аудитории.',
    price: 'от 50 000 ₸/неделя',
  },
  {
    icon: Star,
    title: 'Топ в категории',
    description: 'Ваш бизнес или событие закрепляется в топе выбранной категории на 7 дней.',
    price: 'от 15 000 ₸/неделя',
  },
  {
    icon: Zap,
    title: 'Продвижение события',
    description: 'Выделение события в афише + push-уведомления подписчикам категории.',
    price: 'от 10 000 ₸/событие',
  },
  {
    icon: Users,
    title: 'Таргетированная рассылка',
    description: 'Email и push уведомления пользователям по выбранным интересам и геолокации.',
    price: 'от 5 000 ₸/1000 контактов',
  },
];

const steps = [
  {
    number: 1,
    title: 'Зарегистрируйтесь',
    description: 'Создайте аккаунт на платформе и выберите "Я представляю бизнес" при регистрации.',
  },
  {
    number: 2,
    title: 'Заполните профиль',
    description: 'Добавьте информацию о компании: название, описание, контакты, фотографии и режим работы.',
  },
  {
    number: 3,
    title: 'Пройдите верификацию',
    description: 'Модератор проверит данные в течение 24 часов. После одобрения вы получите доступ ко всем функциям.',
  },
  {
    number: 4,
    title: 'Начните публиковать',
    description: 'Создавайте события и акции, отслеживайте статистику и привлекайте новых клиентов.',
  },
];

export default function ForBusiness() {
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Store className="w-4 h-4" />
            Для бизнеса
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Развивайте бизнес с <span className="text-primary">KazAfisha</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Присоединяйтесь к платформе, которой доверяют тысячи жителей Казахстана.
            Рассказывайте о своих событиях и акциях целевой аудитории.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Зарегистрировать бизнес
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border bg-card font-medium hover:bg-muted transition-colors"
            >
              Смотреть тарифы
            </a>
          </div>
        </div>

        {/* Возможности */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Возможности платформы</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Все инструменты для эффективного продвижения вашего бизнеса в одном месте
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как начать */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Как начать работу?</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Четыре простых шага для подключения вашего бизнеса к платформе
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Тарифы */}
        <section id="pricing" className="mb-20 scroll-mt-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Тарифные планы</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Выберите подходящий тариф для вашего бизнеса. Начните бесплатно и масштабируйтесь по мере роста.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl border ${
                  plan.popular
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Популярный
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">₸</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.period}</p>
                </div>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-4 h-4 flex items-center justify-center shrink-0">—</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={`block w-full text-center py-3 rounded-xl font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Реклама */}
        <section id="advertising" className="mb-20 scroll-mt-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Рекламные возможности</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Дополнительные инструменты для максимального охвата аудитории
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {advertisingOptions.map((option) => (
              <div
                key={option.title}
                className="flex gap-4 p-6 rounded-2xl border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <option.icon className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                  <p className="text-sm font-medium text-primary">{option.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Преимущества */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Почему выбирают нас?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">50 000+ пользователей</h3>
              <p className="text-sm text-muted-foreground">
                Активная аудитория в крупнейших городах Казахстана
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Проверенное качество</h3>
              <p className="text-sm text-muted-foreground">
                Модерация контента гарантирует доверие пользователей
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Быстрый старт</h3>
              <p className="text-sm text-muted-foreground">
                Регистрация за 5 минут, верификация за 24 часа
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Присоединяйтесь к сотням бизнесов, которые уже привлекают клиентов через KazAfisha
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Зарегистрировать бизнес
            </Link>
            <a
              href="mailto:business@kazafisha.kz"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border bg-card font-medium hover:bg-muted transition-colors"
            >
              Связаться с нами
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
