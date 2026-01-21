# Afisha.kz

Единая платформа событий, скидок и бизнеса для всех городов Казахстана.

## Статус проекта

| Компонент | Статус | URL |
|-----------|--------|-----|
| Backend API | ✅ Online | https://afisha-bekend-production.up.railway.app |
| Frontend | ✅ Online | https://jezkazgan-connect-production.up.railway.app |
| Database | ✅ Connected | Neon PostgreSQL |
| Admin Panel | ✅ Готова | /admin |
| Business Cabinet | ✅ Готова | /business |

## Технологии

### Backend
- **Hono** — легковесный веб-фреймворк
- **Drizzle ORM** — type-safe ORM для PostgreSQL
- **Neon** — serverless PostgreSQL
- **Railway** — хостинг

### Frontend
- **React 18** + TypeScript
- **Vite** — сборщик
- **Tailwind CSS** + shadcn/ui — UI компоненты
- **TanStack Query** — управление состоянием и кэширование

## Структура проекта

```
jezkazgan-connect/
├── backend/                 # Hono API сервер
│   └── src/
│       ├── db/             # Drizzle схема и подключение
│       ├── routes/         # API endpoints (auth, cities, events, businesses, promotions, admin)
│       └── index.ts        # Entry point
├── src/                    # React frontend
│   ├── components/         # UI компоненты
│   │   ├── layout/         # Header, Footer
│   │   ├── ui/             # shadcn/ui
│   │   └── ThemeProvider.tsx
│   ├── hooks/              # React Query hooks (use-api.ts)
│   ├── lib/                # API клиент (api.ts)
│   └── pages/
│       ├── admin/          # Админ-панель (10 страниц)
│       ├── business/       # Кабинет бизнеса (4 страницы)
│       └── ...             # Публичные страницы
└── docs/                   # Документация
```

## Реализованный функционал

### Публичная часть
- Главная страница с выбором города
- Каталог событий с фильтрами (категория, дата, цена)
- Каталог бизнесов по категориям
- Страница акций и скидок
- Авторизация и регистрация (JWT)
- Профиль пользователя

### Админ-панель (`/admin`)
- Dashboard со статистикой платформы
- Управление пользователями (роли, Premium)
- Управление бизнесами (верификация, тарифы)
- Модерация событий (одобрение/отклонение)
- Модерация акций
- Управление городами
- Финансовая статистика
- Аналитика и графики
- Настройки (тема, язык)

### Кабинет бизнеса (`/business`)
- Dashboard с KPI и лимитами тарифа
- Управление публикациями
- Страница подписки с тарифами
- Рекламный баннер (Premium)
- AI генерация изображений (Premium) — Ideogram V2
- Авто-публикации в соцсети: Telegram, VK, Instagram, Facebook (Premium)
- Видео формат для событий (Premium)

### Закон РК об ИИ (с января 2026)
- Обязательная маркировка AI-контента
- Визуальные метки на сгенерированных изображениях
- Трёхязычная маркировка (RU, KZ, EN)

## API Endpoints

### Публичные
| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/cities` | GET | Список городов |
| `/events` | GET | События (фильтры: cityId, category) |
| `/businesses` | GET | Бизнесы (фильтры: cityId, category) |
| `/promotions` | GET | Акции (фильтры: cityId, active) |
| `/auth/login` | POST | Авторизация |
| `/auth/register` | POST | Регистрация |

### Админ (JWT protected)
| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/admin/stats` | GET | Статистика платформы |
| `/admin/users` | GET/PATCH | Управление пользователями |
| `/admin/businesses` | GET/PATCH | Управление бизнесами |
| `/admin/events` | GET/PATCH | Модерация событий |
| `/admin/promotions` | GET/PATCH | Модерация акций |
| `/admin/cities` | GET/POST/PATCH | Управление городами |

## Локальная разработка

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

## Монетизация

### B2C (пользователи)
| Тариф | Цена | Доступ |
|-------|------|--------|
| Базовый | Бесплатно | Афиша, каталог |
| Premium | 1,500-2,000 ₸/мес | + Все акции, QR-коды |

### B2B (бизнес)
| Тариф | Цена | Публикаций | Premium функции |
|-------|------|------------|-----------------|
| Free | 0 ₸ | 3/мес | - |
| Lite | 50,000 ₸/мес | 10/мес | Статистика |
| Premium | 200,000 ₸/мес | Безлимит | AI генерация, соцсети, видео |

## Документация

- [Прогресс разработки](docs/DEVELOPMENT_PROGRESS.md) — текущее состояние, хронология
- [Продуктовый документ](docs/UNIFIED_PRODUCT_VISION.md) — архитектура, стек, roadmap
- [User Stories](docs/USER_STORIES.md) — функциональные требования
- [Кабинет бизнеса](docs/BUSINESS_CABINET_SPEC.md) — спецификация кабинета
- [Админ-панель](docs/ADMIN_PANEL_SPEC.md) — спецификация админки

## Ветка разработки

Текущая ветка: `claude/fix-api-resolution-7q0rU`

---

*Afisha.kz — Январь 2026*
