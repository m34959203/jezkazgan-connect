# Afisha.kz - Прогресс разработки

**Версия документа:** 1.6
**Дата обновления:** Январь 2026
**Ветка разработки:** `claude/fix-auth-401-error-puWyd`

---

## Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Реализованный функционал](#реализованный-функционал)
4. [Хронология разработки](#хронология-разработки)
5. [Структура кода](#структура-кода)
6. [API Endpoints](#api-endpoints)
7. [База данных](#база-данных)
8. [Тарифные планы](#тарифные-планы)
9. [Следующие шаги](#следующие-шаги)

---

## Обзор проекта

**Afisha.kz** — единая платформа событий, скидок и бизнеса для всех городов Казахстана.

### Цели проекта

1. **Для жителей (B2C):** Найти события, акции и бизнесы в своём городе
2. **Для бизнеса (B2B):** Продвигать события и акции, привлекать клиентов
3. **Для администраторов:** Модерировать контент и управлять платформой

### Текущий статус

| Компонент | Статус | URL |
|-----------|--------|-----|
| Backend API | ✅ Online | https://afisha-bekend-production.up.railway.app |
| Frontend | ✅ Online | https://jezkazgan-connect-production.up.railway.app |
| Database | ✅ Connected | Neon PostgreSQL |
| Admin Panel | ✅ Готова | /admin |
| Business Cabinet | ✅ Готова | /business |

---

## Архитектура

### Технологический стек

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui        │
│  TanStack Query для управления состоянием и кэширования         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API (JWT Auth)
┌───────────────────────────▼─────────────────────────────────────┐
│                        BACKEND                                   │
│  Hono (Node.js) + Drizzle ORM + TypeScript                      │
│  JWT аутентификация + Role-based access control                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ SQL
┌───────────────────────────▼─────────────────────────────────────┐
│                       DATABASE                                   │
│  Neon PostgreSQL (Serverless)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Деплой

```
GitHub Repository
      │
      ▼
Railway Platform
  ├── Frontend Service (Vite static build)
  └── Backend Service (Node.js)
            │
            ▼
      Neon PostgreSQL
```

---

## Реализованный функционал

### 1. Публичная часть (Frontend)

| Страница | Путь | Статус | Описание |
|----------|------|--------|----------|
| Главная | `/` | ✅ | Выбор города, featured события |
| События города | `/city/:slug` | ✅ | Список событий с фильтрами |
| Детали события | `/events/:id` | ✅ | Полная информация |
| Каталог бизнесов | `/businesses` | ✅ | Список с категориями |
| Профиль бизнеса | `/businesses/:id` | ✅ | Детали бизнеса |
| Акции и скидки | `/promotions` | ✅ | Список активных акций |
| Авторизация | `/auth` | ✅ | Вход/Регистрация |
| Создание бизнеса | `/create-business` | ✅ | Регистрация бизнеса |

### 2. Админ-панель (`/admin`)

| Страница | Путь | Статус | Описание |
|----------|------|--------|----------|
| Dashboard | `/admin` | ✅ | Статистика платформы (реальные данные API) |
| Пользователи | `/admin/users` | ✅ | CRUD, смена ролей, Premium |
| Бизнесы | `/admin/businesses` | ✅ | Верификация, смена тарифа |
| События | `/admin/events` | ✅ | Модерация, одобрение/отклонение |
| Акции | `/admin/promotions` | ✅ | Модерация акций |
| Города | `/admin/cities` | ✅ | Управление городами |
| Финансы | `/admin/finance` | ✅ | Статистика доходов |
| Модерация | `/admin/moderation` | ✅ | Очередь модерации |
| Аналитика | `/admin/analytics` | ✅ | Графики и отчёты |
| Настройки | `/admin/settings` | ✅ | Тема, язык, конфигурация |

**Навигация:**
- Ссылка "На сайт" для возврата на главную

### 3. Кабинет бизнеса (`/business`)

| Страница | Путь | Статус | Описание |
|----------|------|--------|----------|
| Dashboard | `/business` | ✅ | KPI, быстрые действия |
| Публикации | `/business/publications` | ✅ | Мои события и акции |
| События | `/business/publications/events` | ✅ | Список событий бизнеса |
| Создать событие | `/business/publications/events/new` | ✅ | Форма создания события |
| Акции | `/business/publications/promotions` | ✅ | Список акций бизнеса |
| Создать акцию | `/business/publications/promotions/new` | ✅ | Форма создания акции |
| Профиль | `/business/profile` | ✅ | Редактирование профиля бизнеса |
| Команда | `/business/team` | ✅ | Управление сотрудниками (Premium) |
| Статистика | `/business/stats` | ✅ | Аналитика (Lite+) |
| Подписка | `/business/subscription` | ✅ | Тарифы, оплата |
| Баннер | `/business/banner` | ✅ | Рекламный баннер (Premium) |
| Настройки | `/business/settings` | ✅ | Настройки аккаунта |

**Навигация:**
- Sidebar с ограничениями по тарифу (заблокированные пункты с иконкой короны)
- Ссылка "На сайт" для возврата на главную
- Индикатор использованных публикаций

### 4. Дополнительный функционал

| Функция | Статус | Описание |
|---------|--------|----------|
| Переключение темы | ✅ | Светлая/тёмная/системная |
| JWT аутентификация | ✅ | Токены в localStorage + API refresh |
| Role-based доступ | ✅ | user, business, moderator, admin |
| Адаптивный дизайн | ✅ | Mobile-first |
| Команда сотрудников | ✅ | До 5 человек (Premium) |

---

## Хронология разработки

### Этап 1: Базовая инфраструктура

1. Инициализация проекта (React + Vite + Tailwind)
2. Настройка shadcn/ui компонентов
3. Создание backend на Hono + Drizzle ORM
4. Подключение Neon PostgreSQL
5. Деплой на Railway (frontend + backend)

### Этап 2: Публичная часть

1. Главная страница с выбором города
2. Страница города с событиями
3. Каталог бизнесов и профили
4. Страница акций
5. Авторизация и регистрация

### Этап 3: Админ-панель

1. Создание Layout с боковым меню
2. Dashboard со статистикой
3. Страницы управления (Users, Businesses, Events, Promotions)
4. Страницы Cities, Finance, Moderation, Analytics, Settings
5. **Подключение к реальному API** (все страницы используют живые данные)

### Этап 4: Кабинет бизнеса

1. Проектирование UX/UI (см. `docs/BUSINESS_CABINET_SPEC.md`)
2. Dashboard с KPI и лимитами тарифа
3. Управление публикациями с ограничениями
4. Страница подписки с тарифами
5. Управление рекламным баннером (Premium)
6. **Добавление ссылки в Header** для бизнес-пользователей

### Этап 5: Исправления и улучшения

1. **Тема** — создан ThemeProvider с localStorage
2. **Области городов** — обновлены на актуальные 2022 года
3. **Акции** — убрана кнопка "Добавить" (создаёт бизнес)
4. **Admin API** — создан `/admin` endpoint с JWT auth
5. **Frontend API hooks** — подключены ко всем админ-страницам

### Этап 6: Расширение кабинета бизнеса (Текущий)

1. **useCurrentUser hook** — обновлён для получения свежих данных через API
2. **Создание событий/акций** — добавлены страницы CreateEvent, CreatePromotion
3. **Список событий/акций** — добавлены страницы Events, Promotions
4. **Профиль бизнеса** — страница редактирования профиля
5. **Настройки** — страница настроек аккаунта
6. **Команда сотрудников** — полная реализация для Premium:
   - Таблица `business_members` в БД
   - API endpoints для CRUD операций
   - Страница управления командой
   - Роли: admin, editor, viewer
7. **Обновление структуры тарифов** — переработаны фичи тарифов
8. **Навигация** — добавлены ссылки "На сайт" в кабинетах

---

## Структура кода

### Frontend (`/src`)

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Навигация, кабинет бизнеса
│   │   └── Footer.tsx           # Обновлённые области
│   ├── ui/                      # shadcn/ui компоненты
│   └── ThemeProvider.tsx        # Управление темой
├── hooks/
│   └── use-api.ts               # React Query hooks (admin + team)
├── lib/
│   ├── api.ts                   # API функции (admin + team)
│   └── utils.ts
├── pages/
│   ├── admin/                   # 10 страниц админки
│   │   ├── AdminLayout.tsx      # + ссылка "На сайт"
│   │   ├── Dashboard.tsx
│   │   └── ...
│   ├── business/                # 12 страниц кабинета
│   │   ├── BusinessLayout.tsx   # Sidebar с лимитами + "На сайт"
│   │   ├── Dashboard.tsx
│   │   ├── Publications.tsx
│   │   ├── Events.tsx           # Список событий
│   │   ├── CreateEvent.tsx      # Создание события
│   │   ├── Promotions.tsx       # Список акций
│   │   ├── CreatePromotion.tsx  # Создание акции
│   │   ├── Profile.tsx          # Профиль бизнеса
│   │   ├── Team.tsx             # Управление командой (Premium)
│   │   ├── Subscription.tsx     # Тарифы
│   │   ├── Settings.tsx         # Настройки
│   │   └── Banner.tsx           # Рекламный баннер
│   └── ...                      # Публичные страницы
└── App.tsx                      # Роутинг
```

### Backend (`/backend/src`)

```
backend/src/
├── db/
│   ├── index.ts                 # Подключение к Neon
│   ├── schema.ts                # Drizzle схема (+ businessMembers)
│   └── seed.ts                  # Seed данные
├── routes/
│   ├── auth.ts                  # /auth (login, register, me)
│   ├── cities.ts                # /cities
│   ├── events.ts                # /events
│   ├── businesses.ts            # /businesses
│   ├── promotions.ts            # /promotions
│   ├── admin.ts                 # /admin/* (JWT protected)
│   └── team.ts                  # /team/* (Premium feature)
└── index.ts                     # Hono app entry
```

---

## API Endpoints

### Публичные

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /` | GET | Health check |
| `GET /cities` | GET | Список городов |
| `GET /cities/:slug` | GET | Город по slug |
| `GET /events` | GET | События (cityId, category, featured) |
| `GET /events/:id` | GET | Детали события |
| `GET /businesses` | GET | Бизнесы (cityId, category) |
| `GET /promotions` | GET | Акции (cityId, active) |
| `POST /auth/login` | POST | Авторизация |
| `POST /auth/register` | POST | Регистрация |
| `GET /auth/me` | GET | Текущий пользователь (JWT) |

### Админ (требуется JWT, роль admin/moderator)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /admin/stats` | GET | Статистика платформы |
| `GET /admin/users` | GET | Список пользователей |
| `PATCH /admin/users/:id` | PATCH | Обновить пользователя |
| `GET /admin/businesses` | GET | Список бизнесов + tier stats |
| `PATCH /admin/businesses/:id` | PATCH | Обновить бизнес |
| `PATCH /admin/businesses/:id/verify` | PATCH | Верифицировать |
| `GET /admin/events` | GET | События на модерации |
| `PATCH /admin/events/:id/approve` | PATCH | Одобрить событие |
| `PATCH /admin/events/:id/reject` | PATCH | Отклонить событие |
| `GET /admin/promotions` | GET | Все акции |
| `PATCH /admin/promotions/:id` | PATCH | Обновить акцию |
| `GET /admin/cities` | GET | Все города |
| `POST /admin/cities` | POST | Создать город |
| `PATCH /admin/cities/:id` | PATCH | Обновить город |

### Команда (требуется JWT, роль business, тариф Premium)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /team` | GET | Список сотрудников (max 5) |
| `POST /team/invite` | POST | Пригласить по email |
| `PUT /team/:id` | PUT | Изменить роль |
| `DELETE /team/:id` | DELETE | Удалить сотрудника |

---

## База данных

### Таблицы (Drizzle Schema)

```sql
-- Пользователи
users (
  id, email, password, name, phone, avatar,
  role: user|business|moderator|admin,
  isPremium, premiumUntil, createdAt
)

-- Города
cities (
  id, name, nameKz, slug, region, population,
  isActive, createdAt
)

-- Бизнесы
businesses (
  id, ownerId, cityId, name, description, category,
  address, phone, whatsapp, instagram, website,
  logo, cover, isVerified,
  tier: free|lite|premium, tierUntil, postsThisMonth,
  createdAt
)

-- События
events (
  id, cityId, businessId, creatorId, title, description,
  category, image, date, endDate, location, address,
  price, maxPrice, isFree, isFeatured, isApproved,
  viewsCount, savesCount, createdAt
)

-- Акции
promotions (
  id, businessId, cityId, title, description, image,
  discount, conditions, validFrom, validUntil,
  isActive, isPremiumOnly, viewsCount, savesCount,
  createdAt
)

-- Сотрудники бизнеса (NEW)
business_members (
  id, businessId, userId,
  role: admin|editor|viewer,
  invitedBy, invitedAt, acceptedAt, isActive
)
```

### Роли сотрудников

| Роль | Права |
|------|-------|
| `admin` | Полный доступ к управлению бизнесом |
| `editor` | Создание и редактирование публикаций |
| `viewer` | Просмотр статистики и отчётов |

---

## Тарифные планы

### B2C (Пользователи)

| Тариф | Цена | Доступ |
|-------|------|--------|
| Базовый | Бесплатно | Афиша, каталог |
| Premium | 1,500-2,000 ₸/мес | + Все акции, QR-коды |

### B2B (Бизнес)

| Тариф | Цена | Публикаций | Баннер | Команда |
|-------|------|------------|--------|---------|
| Free | 0 ₸ | 3/мес | - | - |
| Lite | 50,000 ₸/мес | 10/мес | - | - |
| Premium | 200,000 ₸/мес | Безлимит | Да | До 5 |

### Детали тарифов (обновлено)

| Функция | Free | Lite | Premium |
|---------|------|------|---------|
| Публикаций в месяц | 3 | 10 | ∞ |
| Фото в галерее | 5 | 15 | 30 |
| Телефон, адрес, WhatsApp | ✅ | ✅ | ✅ |
| Ссылка на Instagram | ✅ | ✅ | ✅ |
| Просмотры и клики | - | ✅ | ✅ |
| Приоритет в поиске | - | ✅ | Топ |
| Значок "Проверено" | - | ✅ | ✅ |
| Рекламный баннер | - | - | ✅ |
| Команда сотрудников | - | - | До 5 |

### ROI анализ

| Бизнес | Средний чек | Маржа | Lite окупается | Premium окупается |
|--------|-------------|-------|----------------|-------------------|
| Кафе/ресторан | 8-15K ₸ | 30% | 14 клиентов | 57 клиентов |
| Салон красоты | 12-25K ₸ | 50% | 6 клиентов | 22 клиента |
| Автосервис | 40-80K ₸ | 40% | 2 клиента | 8 клиентов |
| Стоматология | 25-60K ₸ | 60% | 2 клиента | 8 клиентов |

---

## Следующие шаги

### Приоритет 1 (Ближайшие задачи)

- [x] Создание событий/акций из кабинета бизнеса
- [x] Страница профиля бизнеса
- [x] Страница настроек
- [x] Команда сотрудников (Premium)
- [ ] Оплата тарифов (интеграция Kaspi/карты)
- [ ] Email уведомления
- [ ] Загрузка изображений (S3/Cloudinary)

### Приоритет 2 (После MVP)

- [ ] QR-коды для акций
- [ ] Push-уведомления
- [ ] Чат между бизнесом и клиентами
- [ ] Отзывы и рейтинги

### Приоритет 3 (Развитие)

- [ ] Мобильное приложение (React Native)
- [ ] Продажа билетов
- [ ] Сообщества
- [ ] Коллаборации

---

## Полезные ссылки

- **Документация продукта:** [docs/UNIFIED_PRODUCT_VISION.md](./UNIFIED_PRODUCT_VISION.md)
- **User Stories:** [docs/USER_STORIES.md](./USER_STORIES.md)
- **Спецификация кабинета:** [docs/BUSINESS_CABINET_SPEC.md](./BUSINESS_CABINET_SPEC.md)
- **API спецификация:** [docs/ADMIN_PANEL_SPEC.md](./ADMIN_PANEL_SPEC.md)

---

*Последнее обновление: Январь 2026*
