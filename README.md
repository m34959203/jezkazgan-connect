# Afisha.kz

Единая платформа событий, скидок и бизнеса для всех городов Казахстана.

## Статус проекта

| Компонент | Статус | URL |
|-----------|--------|-----|
| Backend API | ✅ Online | https://afisha-bekend-production.up.railway.app |
| Frontend | ✅ Online | https://jezkazgan-connect-production.up.railway.app |
| Database | ✅ Connected | Neon PostgreSQL |

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
│       ├── routes/         # API endpoints
│       └── index.ts        # Entry point
├── src/                    # React frontend
│   ├── components/         # UI компоненты
│   ├── hooks/              # React Query hooks
│   ├── lib/                # API клиент
│   └── pages/              # Страницы
└── docs/                   # Документация
    ├── UNIFIED_PRODUCT_VISION.md
    └── USER_STORIES.md
```

## API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/cities` | GET | Список городов |
| `/events` | GET | События (фильтры: cityId, category) |
| `/businesses` | GET | Бизнесы (фильтры: cityId, category) |
| `/promotions` | GET | Акции (фильтры: cityId, active) |
| `/auth/login` | POST | Авторизация |
| `/auth/register` | POST | Регистрация |

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
| Тариф | Цена | Публикаций |
|-------|------|------------|
| Бесплатный | 0 ₸ | 3/мес |
| Lite | 50,000 ₸/мес | 10/мес |
| Premium | 200,000 ₸/мес | ∞ + баннер |

## Документация

- [Продуктовый документ](docs/UNIFIED_PRODUCT_VISION.md) — архитектура, стек, roadmap
- [User Stories](docs/USER_STORIES.md) — функциональные требования

---

*Afisha.kz — январь 2026*
