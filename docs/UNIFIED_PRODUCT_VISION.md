# Afisha.kz — Продуктовый документ

**Версия:** 2.4
**Дата:** 20 января 2026
**Разработка:** Соло + AI-кодинг

---

## 1. Продукт

**Afisha.kz** — единая платформа событий, скидок и бизнеса для всех городов Казахстана.

| Параметр | Значение |
|----------|----------|
| География | Все города РК |
| Аудитория | ~12,000,000 интернет-пользователей |
| Платформы | Web + Android + iOS |
| Разработка | Соло + AI (vibe coding) |

---

## 2. Статус разработки

### ✅ Реализовано

#### Backend API (100% базовой структуры)
- **Framework:** Hono + TypeScript
- **Database:** Drizzle ORM + Neon PostgreSQL (serverless)
- **Deployment:** Railway (https://afisha-bekend-production.up.railway.app)

| Endpoint | Метод | Описание | Статус |
|----------|-------|----------|--------|
| `/` | GET | Health check, версия API | ✅ |
| `/health` | GET | Статус сервера | ✅ |
| `/cities` | GET | Список всех городов | ✅ |
| `/cities/:slug` | GET | Город по slug | ✅ |
| `/events` | GET | Список событий (фильтры: cityId, category, featured) | ✅ |
| `/events/:id` | GET | Детали события | ✅ |
| `/businesses` | GET | Список бизнесов (фильтры: cityId, category) | ✅ |
| `/promotions` | GET | Список акций (фильтры: cityId, active) | ✅ |
| `/auth/login` | POST | Авторизация | ✅ |
| `/auth/register` | POST | Регистрация | ✅ |

#### База данных
Таблицы созданы в Neon PostgreSQL:
- `users` — пользователи с ролями (user, business, moderator, admin)
- `cities` — 20 городов Казахстана
- `businesses` — бизнесы с тарифами (free, lite, premium)
- `events` — события с категориями
- `promotions` — акции и скидки
- `favorites` — избранное пользователей
- `communities` — сообщества
- `community_members` — участники сообществ

#### Frontend (85%)
- **Framework:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query (React Query)
- **Deployment:** Railway (https://jezkazgan-connect-production.up.railway.app)

**Подключение к API:**
- ✅ API клиент (`src/lib/api.ts`) — типизированные функции для всех endpoints
- ✅ React Query hooks (`src/hooks/use-api.ts`) — useCities, useEvents, useBusinesses, usePromotions
- ✅ Селектор городов в хедере с localStorage персистентностью
- ✅ Динамическое обновление контента по выбранному городу

### 🔄 В процессе
- Заполнение базы данных тестовыми событиями/бизнесами
- Интеграция селектора города с фильтрацией контента

### ❌ Не начато
- Мобильное приложение (React Native + Expo)
- Push-уведомления
- Платежи и подписки
- Загрузка изображений (Cloudflare R2)

---

## 3. SWOT-анализ

### Сильные стороны
- ✅ Готовый UI/UX (85% фронтенда)
- ✅ Современный стек (React, TypeScript)
- ✅ Рабочий бэкенд с API
- ✅ Комплексное решение (события + бизнес + скидки + сообщества)
- ✅ Freemium модель

### Слабые стороны
- ❌ Нет мобильных приложений
- ❌ Один разработчик
- ❌ Нет контента (события, бизнесы)

### Возможности
- 🎯 Пустой рынок региональных афиш в РК
- 🎯 Гос. поддержка МСБ
- 🎯 White-label для СНГ

### Угрозы
- ⚠️ Конкуренция от 2GIS/Yandex
- ⚠️ Нехватка контента на старте

---

## 4. Технический стек

### Принцип: Один язык везде (TypeScript)

```
┌─────────────────────────────────────────────────────────────┐
│                      AFISHA.KZ STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WEB (есть 85%)                                            │
│  ├── React 18 + TypeScript                                  │
│  ├── Tailwind CSS + shadcn/ui                              │
│  ├── TanStack Query (кэш, запросы)                         │
│  ├── Zustand (глобальный стейт)                            │
│  ├── React Hook Form + Zod (формы)                         │
│  └── Vite (сборка)                                          │
│                                                             │
│  MOBILE                                                     │
│  ├── React Native + Expo                                    │
│  ├── Expo Router (навигация)                               │
│  ├── NativeWind (Tailwind для RN)                          │
│  ├── TanStack Query + Zustand (как на web)                 │
│  └── EAS Build (сборка)                                     │
│                                                             │
│  BACKEND                                                    │
│  ├── Hono (легковесный, edge-ready)                        │
│  ├── Drizzle ORM (type-safe, быстрый)                      │
│  ├── PostgreSQL на Neon (serverless)                       │
│  ├── Better Auth (авторизация)                             │
│  └── Zod (валидация)                                        │
│                                                             │
│  INFRASTRUCTURE                                             │
│  ├── Vercel (web frontend)                                  │
│  ├── Railway / Fly.io (backend API)                        │
│  ├── Neon (PostgreSQL serverless)                          │
│  ├── Cloudflare R2 (файлы, картинки)                       │
│  ├── Upstash Redis (кэш, rate limiting)                    │
│  ├── Resend (email)                                         │
│  └── OneSignal (push-уведомления)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Почему этот стек

| Выбор | Причина |
|-------|---------|
| **Hono** | Легче NestJS, edge-ready, отличная типизация |
| **Drizzle** | Нет проблем Prisma с serverless, быстрее |
| **Neon** | Serverless PostgreSQL, бесплатный tier |
| **Better Auth** | Своя БД, нет vendor lock-in |
| **Expo** | Managed workflow, EAS Build, OTA updates |

### Структура бэкенда

```
backend/
├── src/
│   ├── index.ts              # Hono app entry
│   ├── db/
│   │   ├── schema.ts         # Drizzle схема
│   │   ├── migrations/       # Миграции
│   │   └── index.ts          # Подключение к Neon
│   ├── routes/
│   │   ├── auth.ts           # Регистрация, вход, OAuth
│   │   ├── users.ts          # Профили пользователей
│   │   ├── cities.ts         # Города
│   │   ├── events.ts         # CRUD события
│   │   ├── businesses.ts     # CRUD бизнесы
│   │   ├── promotions.ts     # CRUD акции
│   │   ├── communities.ts    # Сообщества
│   │   └── subscriptions.ts  # Подписки, платежи
│   ├── middleware/
│   │   ├── auth.ts           # JWT проверка
│   │   └── rateLimit.ts      # Rate limiting
│   └── lib/
│       ├── storage.ts        # Cloudflare R2
│       ├── email.ts          # Resend
│       └── push.ts           # OneSignal
├── drizzle.config.ts
├── wrangler.toml             # Для Cloudflare Workers (опционально)
└── package.json
```

### Схема базы данных (Drizzle)

```typescript
// db/schema.ts
import { pgTable, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('user'), // user, business, admin
  createdAt: timestamp('created_at').defaultNow(),
});

export const cities = pgTable('cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // almaty, astana, shymkent
  isActive: boolean('is_active').default(true),
});

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id),
  cityId: uuid('city_id').references(() => cities.id),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  address: text('address'),
  phone: text('phone'),
  instagram: text('instagram'),
  isVerified: boolean('is_verified').default(false),
  tier: text('tier').default('free'), // free, lite, premium
  createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  cityId: uuid('city_id').references(() => cities.id),
  businessId: uuid('business_id').references(() => businesses.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  date: timestamp('date'),
  location: text('location'),
  price: integer('price'),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id),
  cityId: uuid('city_id').references(() => cities.id),
  title: text('title').notNull(),
  description: text('description'),
  discount: text('discount'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 5. Масштабирование по городам

### Архитектура

```
            ┌─────────────────────────────┐
            │        afisha.kz            │
            │   (выбор города на входе)   │
            └──────────────┬──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐       ┌─────────┐       ┌─────────┐
   │ Алматы  │       │ Астана  │       │ Шымкент │  ...
   └─────────┘       └─────────┘       └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Единая БД  │
                    │  (city_id)  │
                    └─────────────┘
```

**Принцип:** Одна БД, контент разделён по `city_id`.

### Приоритет запуска

| Wave | Города | Срок |
|------|--------|------|
| 1 | Алматы, Астана, Шымкент | Месяц 1-3 |
| 2 | Караганда, Актобе, Тараз, Павлодар | Месяц 4-6 |
| 3 | Остальные регионы | Месяц 7-12 |

---

## 6. Монетизация

### B2C (пользователи)

| Тариф | Цена | Доступ |
|-------|------|--------|
| Базовый | Бесплатно | Афиша, каталог, сообщества |
| Premium | 1,500-2,000 ₸/мес | + Все акции, QR-коды |

### B2B (бизнес)

| Тариф | Цена | Публикаций |
|-------|------|------------|
| Бесплатный | 0 ₸ | 3/мес |
| Lite | 50,000 ₸/мес | 10/мес |
| Premium | 200,000 ₸/мес | ∞ + баннер |

### Проекция Year 1

| Источник | Доход |
|----------|-------|
| B2C Premium | 43M ₸ |
| B2B Lite + Premium | 162M ₸ |
| Баннеры | 24M ₸ |
| **Итого** | **~230M ₸ (~$460K)** |

---

## 7. Roadmap

### Phase 1: MVP (6-8 недель)

```
Неделя 1-2: Backend основа
├── Hono + Drizzle + Neon setup
├── Схема БД, миграции
├── Auth (Better Auth)
└── Cities, Users CRUD

Неделя 3-4: Core API
├── Events CRUD + фильтры
├── Businesses CRUD
├── Promotions CRUD
├── Image upload (R2)
└── Search

Неделя 5-6: Web интеграция
├── Подключить API к React фронтенду
├── Авторизация на фронте
├── Формы создания контента
└── Профили бизнесов

Неделя 7-8: Mobile MVP
├── Expo + React Native setup
├── Навигация
├── Основные экраны
└── Push-уведомления
```

### Phase 2: Launch (месяц 3)
- Beta-тест в одном городе
- App Store / Google Play
- Первые 100 бизнесов

### Phase 3: Growth (месяц 4-6)
- 3 города
- Платежи (Kaspi)
- Подписки
- Аналитика для бизнеса

---

## 8. Стоимость инфраструктуры

### При старте (0-1K пользователей)

| Сервис | Tier | Цена/мес |
|--------|------|----------|
| Neon | Free | $0 |
| Vercel | Free | $0 |
| Railway | Starter | $5 |
| Cloudflare R2 | Free tier | $0 |
| Upstash Redis | Free | $0 |
| Resend | Free (3K emails) | $0 |
| OneSignal | Free | $0 |
| **Итого** | | **~$5/мес** |

### При росте (10K+ пользователей)

| Сервис | Tier | Цена/мес |
|--------|------|----------|
| Neon | Launch | $19 |
| Vercel | Pro | $20 |
| Railway | Pro | $20 |
| Cloudflare R2 | Pay-as-you-go | ~$10 |
| Upstash Redis | Pay-as-you-go | ~$10 |
| Resend | Pro | $20 |
| OneSignal | Growth | $9 |
| **Итого** | | **~$108/мес** |

---

## 9. Ключевые метрики

| Метрика | Q1 | Q2 | Q3 | Q4 |
|---------|-----|-----|-----|-----|
| MAU | 5K | 30K | 100K | 200K |
| Бизнесов | 100 | 500 | 2,000 | 5,000 |
| MRR | 500K ₸ | 3M ₸ | 10M ₸ | 20M ₸ |
| App Downloads | 1K | 10K | 50K | 150K |

---

## 10. Следующие шаги

### Приоритет 1: Наполнение контентом
1. Добавить тестовые события для Жезказгана
2. Добавить тестовые бизнесы и акции
3. Проверить отображение на фронтенде

### Приоритет 2: Функционал подписок
1. Интегрировать ограничения тарифов для бизнесов (3/10/∞ постов)
2. Добавить Premium-only акции для пользователей
3. Подключить платёжную систему (Kaspi)

### Приоритет 3: Мобильное приложение
1. Создать React Native + Expo проект
2. Переиспользовать API клиент и типы
3. Опубликовать в App Store / Google Play

---

## 11. Deployment URLs

| Сервис | URL | Статус |
|--------|-----|--------|
| Backend API | https://afisha-bekend-production.up.railway.app | ✅ Online |
| Frontend | https://jezkazgan-connect-production.up.railway.app | ✅ Online |
| Database | Neon PostgreSQL (serverless) | ✅ Connected |

---

*Документ актуален на 20 января 2026*
