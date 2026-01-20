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

### AI Image Generation (Premium)
- `GET /ai/status` — статус AI сервиса
- `GET /ai/suggestions` — подсказки для промптов
- `POST /ai/generate` — генерация изображения
- `GET /ai/history` — история генераций

### Auto-Publish (Premium)
- `GET /autopublish/settings` — настройки платформ
- `POST /autopublish/settings` — создать/обновить настройки
- `POST /autopublish/test-connection` — тест подключения
- `POST /autopublish/publish` — публикация контента
- `GET /autopublish/history` — история публикаций

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
│   │   ├── migrate.ts    # Программные миграции
│   │   └── index.ts      # Подключение к БД
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── cities.ts
│   │   ├── events.ts
│   │   ├── businesses.ts
│   │   ├── promotions.ts
│   │   ├── ai.ts         # AI генерация (Premium)
│   │   └── autopublish.ts # Авто-публикации (Premium)
│   ├── services/
│   │   ├── nanobanana.ts # AI Image Generation
│   │   └── autopublish.ts # Social Media Publishing
│   ├── middleware/
│   └── lib/
├── drizzle.config.ts
├── nixpacks.toml         # Railway build config
├── package.json
└── tsconfig.json
```

## AI Image Providers

| Провайдер | Модель | ENV переменная |
|-----------|--------|----------------|
| **Ideogram** (рекомендуется) | V2 | `IDEOGRAM_API_KEY` |
| Hugging Face (бесплатно) | FLUX.1-schnell | `HUGGINGFACE_API_KEY` |
| OpenAI | DALL-E 3 | `OPENAI_API_KEY` |
| Replicate | SDXL | `REPLICATE_API_KEY` |

Установите `AI_IMAGE_PROVIDER=ideogram` для использования Ideogram V2.
