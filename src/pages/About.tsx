import { Layout } from '@/components/layout/Layout';
import { Calendar, Gift, Store, Users, Star, Shield, Zap, Globe } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Афиша событий',
    description: 'Все события вашего города в одном месте. Концерты, выставки, мастер-классы, спортивные мероприятия и многое другое.',
  },
  {
    icon: Gift,
    title: 'Скидки и акции',
    description: 'Выгодные предложения от местных бизнесов. Экономьте на любимых товарах и услугах.',
  },
  {
    icon: Store,
    title: 'Каталог бизнесов',
    description: 'Удобный поиск компаний по категориям. Рестораны, салоны красоты, спортзалы, образовательные центры.',
  },
  {
    icon: Users,
    title: 'Сообщество',
    description: 'Группы по интересам и биржа коллабораций. Находите единомышленников и партнёров для проектов.',
  },
];

const benefits = [
  {
    icon: Zap,
    title: 'Быстро и удобно',
    description: 'Интуитивный интерфейс и умный поиск помогут найти нужное за секунды.',
  },
  {
    icon: Shield,
    title: 'Проверенная информация',
    description: 'Все бизнесы проходят модерацию. Актуальные данные о событиях и акциях.',
  },
  {
    icon: Star,
    title: 'Premium преимущества',
    description: 'Эксклюзивные акции, кешбэк и приоритетная поддержка для премиум пользователей.',
  },
  {
    icon: Globe,
    title: 'Города Казахстана',
    description: 'Платформа работает в крупнейших городах страны с единым аккаунтом.',
  },
];

export default function About() {
  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            О платформе <span className="text-primary">KazAfisha</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Городская платформа, объединяющая жителей и бизнес.
            События, акции, сообщества — всё в одном месте.
          </p>
        </div>

        {/* Что такое KazAfisha */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Что такое KazAfisha?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Как пользоваться */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Как пользоваться?</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Выберите город</h3>
                  <p className="text-muted-foreground">
                    В шапке сайта выберите ваш город из списка. Контент автоматически отфильтруется.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Изучайте события и акции</h3>
                  <p className="text-muted-foreground">
                    Просматривайте афишу, фильтруйте по категориям, сохраняйте интересное в избранное.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Зарегистрируйтесь для большего</h3>
                  <p className="text-muted-foreground">
                    Создайте аккаунт, чтобы сохранять избранное, вступать в группы и получать уведомления о новых событиях.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Станьте Premium</h3>
                  <p className="text-muted-foreground">
                    Получите доступ к эксклюзивным акциям, кешбэку до 10% и другим привилегиям.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Преимущества */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Почему KazAfisha?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 p-6 rounded-2xl border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Присоединяйтесь к тысячам пользователей, которые уже нашли лучшие события и выгодные предложения в своём городе.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Создать аккаунт
            </a>
            <a href="/for-business" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border bg-card font-medium hover:bg-muted transition-colors">
              Для бизнеса
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
