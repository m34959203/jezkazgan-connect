import { Hono } from 'hono';

const app = new Hono();

// OpenAPI 3.0 Specification
const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Afisha.kz API',
    description: `
# Afisha.kz API Documentation

API для платформы мероприятий и бизнесов Казахстана.

## Аутентификация

API использует JWT токены для аутентификации. Получите токен через endpoint \`/auth/login\` и передавайте его в заголовке:

\`\`\`
Authorization: Bearer <your_token>
\`\`\`

## Роли пользователей

- **user** - Обычный пользователь
- **business** - Владелец бизнеса
- **moderator** - Модератор
- **admin** - Администратор

## Тарифы

### B2C (Пользователи)
- **Базовый** - Бесплатно
- **Premium** - 1,500₸/месяц

### B2B (Бизнесы)
- **Free** - 3 публикации/месяц
- **Lite** - 50,000₸/месяц, 10 публикаций
- **Premium** - 200,000₸/месяц, безлимит + AI + соцсети
    `,
    version: '2.3.0',
    contact: {
      name: 'Afisha.kz Support',
      email: 'support@afisha.kz',
      url: 'https://afisha.kz',
    },
    license: {
      name: 'Proprietary',
    },
  },
  servers: [
    {
      url: 'https://afisha-bekend-production.up.railway.app',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Аутентификация и авторизация' },
    { name: 'Cities', description: 'Города Казахстана' },
    { name: 'Events', description: 'События и мероприятия' },
    { name: 'Businesses', description: 'Бизнесы и организации' },
    { name: 'Promotions', description: 'Акции и скидки' },
    { name: 'Reviews', description: 'Отзывы и рейтинги' },
    { name: 'Payments', description: 'Платежи (Kaspi/Halyk)' },
    { name: 'Referrals', description: 'Реферальная система' },
    { name: 'Push', description: 'Push-уведомления' },
    { name: 'Analytics', description: 'Аналитика и метрики' },
    { name: 'Admin', description: 'Административные функции' },
  ],
  paths: {
    // Auth
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Регистрация нового пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  referralCode: { type: 'string', description: 'Реферальный код' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Пользователь создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { description: 'Ошибка валидации' },
          409: { description: 'Email уже используется' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вход в систему',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Успешный вход',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Неверные учётные данные' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Получить текущего пользователя',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Данные пользователя',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: { description: 'Не авторизован' },
        },
      },
    },

    // Cities
    '/cities': {
      get: {
        tags: ['Cities'],
        summary: 'Список городов',
        responses: {
          200: {
            description: 'Список городов',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/City' },
                },
              },
            },
          },
        },
      },
    },
    '/cities/{slug}': {
      get: {
        tags: ['Cities'],
        summary: 'Получить город по slug',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Данные города',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/City' },
              },
            },
          },
          404: { description: 'Город не найден' },
        },
      },
    },

    // Events
    '/events': {
      get: {
        tags: ['Events'],
        summary: 'Список событий',
        parameters: [
          { name: 'cityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'featured', in: 'query', schema: { type: 'boolean' } },
          { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: {
            description: 'Список событий',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Event' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Events'],
        summary: 'Создать событие',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EventCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Событие создано' },
          401: { description: 'Не авторизован' },
        },
      },
    },
    '/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Получить событие по ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Данные события',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
          404: { description: 'Событие не найдено' },
        },
      },
    },

    // Businesses
    '/businesses': {
      get: {
        tags: ['Businesses'],
        summary: 'Список бизнесов',
        parameters: [
          { name: 'cityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'verified', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Список бизнесов',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Business' },
                },
              },
            },
          },
        },
      },
    },

    // Promotions
    '/promotions': {
      get: {
        tags: ['Promotions'],
        summary: 'Список акций',
        parameters: [
          { name: 'cityId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'businessId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Список акций',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Promotion' },
                },
              },
            },
          },
        },
      },
    },

    // Reviews
    '/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Создать отзыв',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewCreate' },
            },
          },
        },
        responses: {
          201: { description: 'Отзыв создан' },
        },
      },
    },
    '/reviews/business/{businessId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Отзывы о бизнесе',
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['recent', 'helpful', 'rating_high', 'rating_low'] } },
        ],
        responses: {
          200: {
            description: 'Отзывы и статистика рейтинга',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewsResponse' },
              },
            },
          },
        },
      },
    },

    // Payments
    '/payments/create': {
      post: {
        tags: ['Payments'],
        summary: 'Создать платёж',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaymentCreate' },
            },
          },
        },
        responses: {
          200: {
            description: 'Платёж создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaymentResponse' },
              },
            },
          },
        },
      },
    },
    '/payments/pricing': {
      get: {
        tags: ['Payments'],
        summary: 'Получить тарифы',
        responses: {
          200: {
            description: 'Информация о тарифах',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PricingInfo' },
              },
            },
          },
        },
      },
    },

    // Referrals
    '/referrals/my-code': {
      get: {
        tags: ['Referrals'],
        summary: 'Получить свой реферальный код',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Реферальный код',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReferralCode' },
              },
            },
          },
        },
      },
    },
    '/referrals/stats': {
      get: {
        tags: ['Referrals'],
        summary: 'Статистика рефералов',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Статистика',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReferralStats' },
              },
            },
          },
        },
      },
    },

    // Push Notifications
    '/push/subscribe': {
      post: {
        tags: ['Push'],
        summary: 'Подписаться на push-уведомления',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PushSubscription' },
            },
          },
        },
        responses: {
          200: { description: 'Подписка создана' },
        },
      },
    },
    '/push/notifications': {
      get: {
        tags: ['Push'],
        summary: 'Список уведомлений',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'unread', in: 'query', schema: { type: 'boolean' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Список уведомлений',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationsResponse' },
              },
            },
          },
        },
      },
    },

    // Analytics
    '/analytics/track': {
      post: {
        tags: ['Analytics'],
        summary: 'Отслеживать событие',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AnalyticsEvent' },
            },
          },
        },
        responses: {
          200: { description: 'Событие записано' },
        },
      },
    },
    '/analytics/conversions': {
      get: {
        tags: ['Analytics', 'Admin'],
        summary: 'Метрики конверсии',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'period', in: 'query', schema: { type: 'integer', default: 30 } },
        ],
        responses: {
          200: {
            description: 'Метрики конверсии',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ConversionMetrics' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' },
          avatar: { type: 'string', format: 'uri' },
          role: { type: 'string', enum: ['user', 'business', 'moderator', 'admin'] },
          isPremium: { type: 'boolean' },
          premiumUntil: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      City: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          nameKz: { type: 'string' },
          slug: { type: 'string' },
          region: { type: 'string' },
          population: { type: 'integer' },
          isActive: { type: 'boolean' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string', enum: ['concerts', 'theater', 'festivals', 'education', 'seminars', 'leisure', 'sports', 'children', 'exhibitions', 'other'] },
          image: { type: 'string', format: 'uri' },
          isImageAiGenerated: { type: 'boolean' },
          date: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          address: { type: 'string' },
          price: { type: 'integer' },
          isFree: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          viewsCount: { type: 'integer' },
          savesCount: { type: 'integer' },
        },
      },
      EventCreate: {
        type: 'object',
        required: ['title', 'category', 'date', 'cityId'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          image: { type: 'string', format: 'uri' },
          date: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          address: { type: 'string' },
          price: { type: 'integer' },
          isFree: { type: 'boolean' },
          cityId: { type: 'string', format: 'uuid' },
        },
      },
      Business: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
          logo: { type: 'string', format: 'uri' },
          cover: { type: 'string', format: 'uri' },
          isVerified: { type: 'boolean' },
          tier: { type: 'string', enum: ['free', 'lite', 'premium'] },
        },
      },
      Promotion: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string', format: 'uri' },
          discount: { type: 'string' },
          conditions: { type: 'string' },
          validFrom: { type: 'string', format: 'date-time' },
          validUntil: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean' },
        },
      },
      ReviewCreate: {
        type: 'object',
        required: ['targetType', 'rating'],
        properties: {
          targetType: { type: 'string', enum: ['business', 'event'] },
          businessId: { type: 'string', format: 'uuid' },
          eventId: { type: 'string', format: 'uuid' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string' },
          content: { type: 'string' },
          pros: { type: 'string' },
          cons: { type: 'string' },
          images: { type: 'array', items: { type: 'string', format: 'uri' } },
        },
      },
      ReviewsResponse: {
        type: 'object',
        properties: {
          reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
          stats: {
            type: 'object',
            properties: {
              averageRating: { type: 'number' },
              totalReviews: { type: 'integer' },
              distribution: {
                type: 'object',
                properties: {
                  5: { type: 'integer' },
                  4: { type: 'integer' },
                  3: { type: 'integer' },
                  2: { type: 'integer' },
                  1: { type: 'integer' },
                },
              },
            },
          },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          rating: { type: 'integer' },
          title: { type: 'string' },
          content: { type: 'string' },
          pros: { type: 'string' },
          cons: { type: 'string' },
          likesCount: { type: 'integer' },
          dislikesCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      PaymentCreate: {
        type: 'object',
        required: ['provider', 'type'],
        properties: {
          provider: { type: 'string', enum: ['kaspi', 'halyk'] },
          type: { type: 'string', enum: ['subscription', 'premium', 'banner', 'other'] },
          subscriptionType: { type: 'string', enum: ['user_premium', 'business_lite', 'business_premium'] },
          subscriptionPeriod: { type: 'string', enum: ['monthly', 'yearly'] },
          amount: { type: 'integer' },
          businessId: { type: 'string', format: 'uuid' },
        },
      },
      PaymentResponse: {
        type: 'object',
        properties: {
          paymentId: { type: 'string', format: 'uuid' },
          amount: { type: 'integer' },
          currency: { type: 'string' },
          provider: { type: 'string' },
          paymentUrl: { type: 'string', format: 'uri' },
          qrCode: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
      PricingInfo: {
        type: 'object',
        properties: {
          subscriptions: { type: 'object' },
          paymentMethods: { type: 'array', items: { type: 'object' } },
        },
      },
      ReferralCode: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          usageCount: { type: 'integer' },
          totalEarnings: { type: 'integer' },
          isActive: { type: 'boolean' },
          shareUrl: { type: 'string', format: 'uri' },
        },
      },
      ReferralStats: {
        type: 'object',
        properties: {
          totalReferrals: { type: 'integer' },
          convertedReferrals: { type: 'integer' },
          pendingBonuses: { type: 'integer' },
          paidBonuses: { type: 'integer' },
          conversionRate: { type: 'number' },
        },
      },
      PushSubscription: {
        type: 'object',
        required: ['endpoint', 'keys'],
        properties: {
          endpoint: { type: 'string', format: 'uri' },
          keys: {
            type: 'object',
            properties: {
              p256dh: { type: 'string' },
              auth: { type: 'string' },
            },
          },
        },
      },
      NotificationsResponse: {
        type: 'object',
        properties: {
          notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
          unreadCount: { type: 'integer' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          icon: { type: 'string' },
          link: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AnalyticsEvent: {
        type: 'object',
        required: ['eventType'],
        properties: {
          eventType: { type: 'string', enum: ['page_view', 'event_view', 'business_view', 'promotion_view', 'premium_conversion', 'business_tier_upgrade', 'referral_signup', 'first_purchase', 'subscription_started', 'subscription_cancelled'] },
          eventData: { type: 'object' },
          sessionId: { type: 'string' },
          source: { type: 'string' },
          utmSource: { type: 'string' },
          utmMedium: { type: 'string' },
          utmCampaign: { type: 'string' },
        },
      },
      ConversionMetrics: {
        type: 'object',
        properties: {
          period: { type: 'integer' },
          conversions: {
            type: 'object',
            properties: {
              premiumUserConversions: { type: 'integer' },
              businessTierUpgrades: { type: 'integer' },
            },
          },
          users: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              premium: { type: 'integer' },
              conversionRate: { type: 'number' },
            },
          },
          businesses: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              free: { type: 'integer' },
              lite: { type: 'integer' },
              premium: { type: 'integer' },
              paidConversionRate: { type: 'number' },
            },
          },
        },
      },
    },
  },
};

// Serve OpenAPI JSON
app.get('/openapi.json', (c) => {
  return c.json(openApiSpec);
});

// Serve Swagger UI HTML
app.get('/', (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Afisha.kz API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/docs/openapi.json",
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true
      });
    }
  </script>
</body>
</html>
`;
  return c.html(html);
});

export default app;
