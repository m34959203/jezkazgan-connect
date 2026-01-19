# Afisha.kz - Прогресс разработки

**Версия документа:** 2.0
**Дата обновления:** Январь 2026
**Версия приложения:** 2.2.0-premium
**Ветка разработки:** `claude/auto-publish-ai-images-vWa7y`

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
| Главная | `/` | ✅ | Фото-карусель города, выбор города, события |
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
| Баннеры города | `/admin/cities/:id/banners` | ✅ | Рекламные баннеры |
| Фото карусели | `/admin/cities/:id/photos` | ✅ | Фото для главной страницы |
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
| **Авто-публикации** | `/business/autopublish` | ✅ | Соцсети (Premium) |
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
| Фото-карусель | ✅ | Embla Carousel + Autoplay |
| Загрузка изображений | ✅ | Cloudinary интеграция |
| Баннеры городов | ✅ | Рекламные баннеры на главной |
| Управление фото карусели | ✅ | CRUD через админку |
| Сохранение событий | ✅ | Избранное для пользователей |
| **ИИ генерация изображений** | ✅ | Nano Banana AI (Premium) |
| **Авто-публикации в соцсети** | ✅ | Telegram, VK, Instagram (Premium) |
| **Видео формат для событий** | ✅ | YouTube, Vimeo, MP4 (Premium) |

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

### Этап 6: Расширение кабинета бизнеса

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

### Этап 7: UI/UX улучшения

1. **Фото-карусель на главной** — замена градиентного фона:
   - Автоматическая смена слайдов каждые 5 секунд
   - Фото достопримечательностей выбранного города
   - Поддержка городов: Жезказган, Алматы, Астана
   - Изображения из Wikimedia Commons (лицензионные)
   - Затемнение для читаемости текста
2. **Упрощение меню Header**:
   - Убрана опция "Создать бизнес" (выбирается при регистрации)
   - Для бизнес-пользователей только "Кабинет бизнеса"
   - Для админов/модераторов только "Админ-панель"
3. **Улучшение навигации в кабинетах**:
   - Ссылки "На сайт" для быстрого возврата на главную

### Этап 8: Загрузка изображений и управление контентом

1. **Cloudinary интеграция** — загрузка изображений:
   - Компонент `ImageUpload` с drag-and-drop
   - Предпросмотр и удаление изображений
   - Автоматическая загрузка в Cloudinary
   - Поддержка разных папок (events, promotions, cities)
   - Unsigned upload preset для безопасности
2. **Баннеры городов** — рекламная система:
   - Таблица `city_banners` в БД
   - CRUD API для управления баннерами
   - Админ-страница `/admin/cities/:id/banners`
   - Публичный API для показа баннеров
   - Счётчики просмотров и кликов
3. **Фото карусели** — управление через админку:
   - Таблица `city_photos` в БД
   - CRUD API для управления фото
   - Админ-страница `/admin/cities/:id/photos`
   - Публичный API `/cities/:slug/photos`
   - Приоритет API над хардкодом на главной
   - Загрузка фото через Cloudinary
4. **Страница события** — улучшения:
   - Рабочие кнопки "Сохранить" и "Поделиться"
   - Удалена кнопка "Купить билет" (платформа для афиши)
   - Подключение к реальному API
5. **Избранное** — функционал сохранения:
   - Таблица `favorites` в БД
   - API для добавления/удаления из избранного
   - Страница избранного для пользователей

### Этап 9: Business Premium функции (Текущий)

1. **ИИ генерация изображений (Nano Banana):**
   - Сервис `nanobanana.ts` — интеграция с AI API (OpenAI DALL-E совместимый)
   - API routes `/ai/*` — генерация, история, подсказки
   - Компонент `AiImageGenerator` — UI с промптами и историей
   - Стили: banner, promo, event, poster, social
   - Автоперевод русских промптов на английский
   - История генераций с повторным использованием

2. **Авто-публикации в соцсети:**
   - Сервис `autopublish.ts` — публикация в Telegram, VK, Instagram
   - API routes `/autopublish/*` — настройки, тестирование, публикация
   - Таблица `auto_publish_settings` — настройки для каждой платформы
   - Таблица `auto_publish_history` — история публикаций
   - Страница `/business/autopublish` — управление подключениями
   - Поддержка: Telegram Bot API, VK API, Instagram Graph API

3. **Видео формат для событий:**
   - Поля `videoUrl`, `videoThumbnail` в таблице events
   - Компонент `VideoUpload` — загрузка YouTube/Vimeo/MP4
   - Автоматическое извлечение превью для YouTube
   - Проверка Premium тарифа при создании события с видео

4. **Обновление страницы подписки:**
   - Добавлены новые Premium функции в список возможностей
   - Расширен блок преимуществ Premium
   - Иконки для AI, авто-публикаций, видео

---

## Структура кода

### Frontend (`/src`)

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           # Навигация, меню пользователя
│   │   └── Footer.tsx           # Обновлённые области
│   ├── ui/                      # shadcn/ui компоненты + Carousel
│   │   ├── image-upload.tsx     # Компонент загрузки изображений
│   │   ├── video-upload.tsx     # Компонент загрузки видео (Premium)
│   │   └── ai-image-generator.tsx # AI генерация изображений (Premium)
│   └── ThemeProvider.tsx        # Управление темой
├── hooks/
│   └── use-api.ts               # React Query hooks (admin + team)
├── lib/
│   ├── api.ts                   # API функции (admin + team)
│   └── utils.ts
├── pages/
│   ├── admin/                   # 12 страниц админки
│   │   ├── AdminLayout.tsx      # + ссылка "На сайт"
│   │   ├── Dashboard.tsx
│   │   ├── CitiesPage.tsx       # Управление городами
│   │   ├── CityBannersPage.tsx  # Баннеры города
│   │   ├── CityPhotosPage.tsx   # Фото карусели
│   │   └── ...
│   ├── business/                # 13 страниц кабинета
│   │   ├── BusinessLayout.tsx   # Sidebar с лимитами + "На сайт"
│   │   ├── Dashboard.tsx
│   │   ├── Publications.tsx
│   │   ├── Events.tsx           # Список событий
│   │   ├── CreateEvent.tsx      # Создание события (+ видео, AI)
│   │   ├── Promotions.tsx       # Список акций
│   │   ├── CreatePromotion.tsx  # Создание акции
│   │   ├── Profile.tsx          # Профиль бизнеса
│   │   ├── Team.tsx             # Управление командой (Premium)
│   │   ├── Subscription.tsx     # Тарифы (обновлено Premium функциями)
│   │   ├── Settings.tsx         # Настройки
│   │   ├── Banner.tsx           # Рекламный баннер
│   │   └── AutoPublish.tsx      # Авто-публикации в соцсети (Premium)
│   ├── Index.tsx                # Главная с фото-каруселью
│   └── ...                      # Публичные страницы
└── App.tsx                      # Роутинг
```

### Backend (`/backend/src`)

```
backend/src/
├── db/
│   ├── index.ts                 # Подключение к Neon
│   ├── schema.ts                # Drizzle схема (+ cityBanners, cityPhotos)
│   └── seed.ts                  # Seed данные
├── routes/
│   ├── auth.ts                  # /auth (login, register, me, profile)
│   ├── cities.ts                # /cities (+ banners, photos)
│   ├── events.ts                # /events (+ videoUrl, videoThumbnail)
│   ├── businesses.ts            # /businesses
│   ├── promotions.ts            # /promotions
│   ├── admin.ts                 # /admin/* (+ analytics, moderation, delete)
│   ├── team.ts                  # /team/* (Premium feature)
│   ├── favorites.ts             # /favorites (избранное)
│   ├── upload.ts                # /upload (Cloudinary config)
│   ├── ai.ts                    # /ai/* (AI генерация, Premium)
│   └── autopublish.ts           # /autopublish/* (соцсети, Premium)
├── services/
│   ├── cloudinary.ts            # Cloudinary интеграция
│   ├── nanobanana.ts            # AI генерация изображений
│   └── autopublish.ts           # Публикация в соцсети
├── middleware/
│   └── auth.ts                  # JWT middleware
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
| `GET /cities/:slug/banners` | GET | Баннеры города |
| `GET /cities/:slug/photos` | GET | Фото карусели города |
| `GET /events` | GET | События (cityId, category, featured) |
| `GET /events/:id` | GET | Детали события |
| `GET /businesses` | GET | Бизнесы (cityId, category) |
| `GET /promotions` | GET | Акции (cityId, active) |
| `POST /auth/login` | POST | Авторизация |
| `POST /auth/register` | POST | Регистрация |
| `GET /auth/me` | GET | Текущий пользователь (JWT) |
| `POST /auth/change-password` | POST | Смена пароля |
| `PATCH /auth/profile` | PATCH | Обновление профиля |

### Админ (требуется JWT, роль admin/moderator)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /admin/stats` | GET | Статистика платформы |
| `GET /admin/analytics` | GET | Расширенная аналитика |
| `GET /admin/moderation` | GET | Очередь модерации |
| `GET /admin/users` | GET | Список пользователей |
| `PATCH /admin/users/:id` | PATCH | Обновить пользователя |
| `DELETE /admin/users/:id` | DELETE | Удалить пользователя |
| `GET /admin/businesses` | GET | Список бизнесов + tier stats |
| `PATCH /admin/businesses/:id` | PATCH | Обновить бизнес |
| `PATCH /admin/businesses/:id/verify` | PATCH | Верифицировать |
| `DELETE /admin/businesses/:id` | DELETE | Удалить бизнес |
| `GET /admin/events` | GET | События на модерации |
| `PATCH /admin/events/:id/approve` | PATCH | Одобрить событие |
| `PATCH /admin/events/:id/reject` | PATCH | Отклонить событие |
| `DELETE /admin/events/:id` | DELETE | Удалить событие |
| `GET /admin/promotions` | GET | Все акции |
| `PATCH /admin/promotions/:id` | PATCH | Обновить акцию |
| `DELETE /admin/promotions/:id` | DELETE | Удалить акцию |
| `GET /admin/cities` | GET | Все города |
| `POST /admin/cities` | POST | Создать город |
| `PATCH /admin/cities/:id` | PATCH | Обновить город |
| `DELETE /admin/cities/:id` | DELETE | Удалить город |

### Баннеры городов (требуется JWT, роль admin)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /admin/cities/:cityId/banners` | GET | Список баннеров города |
| `POST /admin/cities/:cityId/banners` | POST | Создать баннер |
| `PATCH /admin/cities/:cityId/banners/:id` | PATCH | Обновить баннер |
| `DELETE /admin/cities/:cityId/banners/:id` | DELETE | Удалить баннер |
| `GET /admin/banners` | GET | Все баннеры (обзор) |

### Фото карусели (требуется JWT, роль admin)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /admin/cities/:cityId/photos` | GET | Список фото города |
| `POST /admin/cities/:cityId/photos` | POST | Добавить фото |
| `PATCH /admin/cities/:cityId/photos/:id` | PATCH | Обновить фото |
| `DELETE /admin/cities/:cityId/photos/:id` | DELETE | Удалить фото |

### Избранное (требуется JWT)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /favorites` | GET | Список избранного |
| `GET /favorites/check` | GET | Проверить избранное |
| `POST /favorites` | POST | Добавить в избранное |
| `POST /favorites/toggle` | POST | Переключить избранное |
| `DELETE /favorites/:id` | DELETE | Удалить из избранного |

### Загрузка изображений (требуется JWT)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /upload/config` | GET | Конфигурация Cloudinary |
| `GET /upload/presets` | GET | Пресеты загрузки |

### Команда (требуется JWT, роль business, тариф Premium)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /team` | GET | Список сотрудников (max 5) |
| `POST /team/invite` | POST | Пригласить по email |
| `PUT /team/:id` | PUT | Изменить роль |
| `DELETE /team/:id` | DELETE | Удалить сотрудника |

### AI Генерация изображений (требуется JWT, тариф Premium)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /ai/status` | GET | Статус AI сервиса |
| `GET /ai/suggestions` | GET | Подсказки для промптов |
| `POST /ai/generate` | POST | Генерация изображения |
| `GET /ai/history` | GET | История генераций |
| `PATCH /ai/:id/used` | PATCH | Отметить использование |

### Авто-публикации (требуется JWT, тариф Premium)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /autopublish/settings` | GET | Настройки платформ |
| `POST /autopublish/settings` | POST | Создать/обновить настройки |
| `POST /autopublish/test-connection` | POST | Тестирование подключения |
| `POST /autopublish/publish` | POST | Публикация контента |
| `GET /autopublish/history` | GET | История публикаций |
| `DELETE /autopublish/settings/:platform` | DELETE | Удалить настройки платформы |

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
  category, image, videoUrl, videoThumbnail,  -- NEW: видео формат
  date, endDate, location, address,
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

-- Сотрудники бизнеса
business_members (
  id, businessId, userId,
  role: admin|editor|viewer,
  invitedBy, invitedAt, acceptedAt, isActive
)

-- Баннеры городов (NEW)
city_banners (
  id, cityId, businessId, title, description,
  imageUrl, link, linkType, position,
  isActive, startDate, endDate,
  viewsCount, clicksCount, createdAt, updatedAt
)

-- Фото карусели (NEW)
city_photos (
  id, cityId, title, imageUrl,
  position, isActive, createdAt, updatedAt
)

-- Избранное
favorites (
  id, userId, eventId, businessId, promotionId,
  createdAt
)

-- Настройки авто-публикации (NEW - Premium)
auto_publish_settings (
  id, businessId, platform: telegram|instagram|vk|facebook,
  isEnabled, telegramBotToken, telegramChannelId,
  instagramAccessToken, instagramBusinessAccountId,
  vkAccessToken, vkGroupId,
  publishEvents, publishPromotions, autoPublishOnCreate,
  createdAt, updatedAt
)

-- История авто-публикаций (NEW - Premium)
auto_publish_history (
  id, businessId, platform, contentType, contentId,
  status: pending|published|failed,
  externalPostId, externalPostUrl, errorMessage,
  publishedAt, createdAt
)

-- AI генерация изображений (NEW - Premium)
ai_image_generations (
  id, businessId, userId, prompt, style,
  generatedImageUrl, status: pending|generating|completed|failed,
  errorMessage, usedFor, usedForId, creditsUsed, createdAt
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

### Детали тарифов (обновлено v2.2.0)

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
| **ИИ генерация изображений** | - | - | ✅ Nano Banana |
| **Авто-публикации в соцсети** | - | - | ✅ TG/VK/IG |
| **Видео формат для событий** | - | - | ✅ YouTube/Vimeo |

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
- [x] Фото-карусель на главной странице
- [x] Улучшение Header меню
- [x] Загрузка изображений (Cloudinary)
- [x] Баннеры городов в админке
- [x] Управление фото карусели в админке
- [x] Избранное (сохранение событий)
- [x] **ИИ генерация изображений (Nano Banana)** ← NEW
- [x] **Авто-публикации в соцсети (Telegram/VK/Instagram)** ← NEW
- [x] **Видео формат для событий** ← NEW
- [ ] Оплата тарифов (интеграция Kaspi/карты)
- [ ] Email уведомления

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

## Внешние ресурсы

### Cloudinary (Хранение изображений)

Все изображения загружаются в Cloudinary с использованием unsigned upload preset:

| Настройка | Значение |
|-----------|----------|
| Cloud Name | `dlulp8x9o` |
| Upload Preset | `afisha_unsigned` |
| Папки | `afisha/events`, `afisha/promotions`, `afisha/cities`, `afisha/businesses` |

**Компонент ImageUpload:**
- Drag-and-drop загрузка
- Предпросмотр изображения
- Автоматическая оптимизация
- Поддержка форматов: JPG, PNG, WebP, GIF

### Фото городов (Cloudinary + API)

Фотографии достопримечательностей городов загружены в Cloudinary и управляются через админку:

| Город | Достопримечательности |
|-------|----------------------|
| Жезказган | Горы Улытау, Степь Сарыарка, Река Кенгир |
| Алматы | Каток Медеу, Вознесенский собор, Чарынский каньон |
| Астана | Назарбаев Университет, Астана Арена |
| Актау | Набережная, Каспийское море |
| Кокшетау | Бурабай, Природа |

**Приоритет загрузки фото:**
1. API `/cities/:slug/photos` — управляемые фото из БД
2. Хардкод `cityLandmarks` — fallback фото из Cloudinary

Изображения автоматически меняются в карусели каждые 5 секунд с использованием Embla Carousel + Autoplay.

---

## Полезные ссылки

- **Документация продукта:** [docs/UNIFIED_PRODUCT_VISION.md](./UNIFIED_PRODUCT_VISION.md)
- **User Stories:** [docs/USER_STORIES.md](./USER_STORIES.md)
- **Спецификация кабинета:** [docs/BUSINESS_CABINET_SPEC.md](./BUSINESS_CABINET_SPEC.md)
- **API спецификация:** [docs/ADMIN_PANEL_SPEC.md](./ADMIN_PANEL_SPEC.md)

---

*Последнее обновление: 19 января 2026 (v2.2.0-premium)*
