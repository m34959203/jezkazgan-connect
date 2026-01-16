# Afisha.kz Backend

API сервер для платформы Afisha.kz

## Стек

- **Hono** — легковесный web framework
- **Drizzle ORM** — type-safe ORM
- **Neon** — serverless PostgreSQL
- **Zod** — валидация

## Быстрый старт

```bash
# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
# Заполнить DATABASE_URL от Neon

# Применить миграции
npm run db:push

# Запустить dev сервер
npm run dev
```

## API Endpoints

### Auth
- `POST /auth/register` — регистрация
- `POST /auth/login` — вход
- `GET /auth/me` — текущий пользователь

### Cities
- `GET /cities` — список городов
- `GET /cities/:slug` — город по slug

### Events
- `GET /events` — список событий
- `GET /events/:id` — событие по ID
- `POST /events` — создать событие

### Businesses
- `GET /businesses` — список бизнесов
- `GET /businesses/:id` — бизнес по ID
- `POST /businesses` — создать бизнес
- `PUT /businesses/:id` — обновить бизнес

### Promotions
- `GET /promotions` — список акций
- `GET /promotions/:id` — акция по ID
- `POST /promotions` — создать акцию

## Скрипты

```bash
npm run dev        # Запуск dev сервера
npm run build      # Сборка для продакшена
npm run start      # Запуск продакшен сервера
npm run db:generate # Генерация миграций
npm run db:migrate  # Применение миграций
npm run db:push     # Push схемы в БД (dev)
npm run db:studio   # Drizzle Studio (GUI для БД)
```

## Структура

```
backend/
├── src/
│   ├── index.ts          # Entry point
│   ├── db/
│   │   ├── schema.ts     # Drizzle схема
│   │   └── index.ts      # Подключение к БД
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── cities.ts
│   │   ├── events.ts
│   │   ├── businesses.ts
│   │   └── promotions.ts
│   ├── middleware/
│   └── lib/
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```
