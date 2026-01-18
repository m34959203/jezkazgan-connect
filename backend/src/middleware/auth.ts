import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';

export const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'business' | 'moderator' | 'admin';
  isPremium: boolean;
}

/**
 * Middleware для проверки JWT токена
 * Добавляет user в context если токен валидный
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isPremium: users.isPremium,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      return c.json({ error: 'Unauthorized', message: 'User not found' }, 401);
    }

    c.set('user', user[0] as AuthUser);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, 401);
  }
};

/**
 * Middleware для проверки роли admin или moderator
 * Должен использоваться ПОСЛЕ authMiddleware
 */
export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthUser;

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return c.json({ error: 'Forbidden', message: 'Admin or moderator access required' }, 403);
  }

  await next();
};

/**
 * Middleware для проверки роли business
 * Должен использоваться ПОСЛЕ authMiddleware
 */
export const businessMiddleware = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthUser;

  if (!user || (user.role !== 'business' && user.role !== 'admin' && user.role !== 'moderator')) {
    return c.json({ error: 'Forbidden', message: 'Business account required' }, 403);
  }

  await next();
};

/**
 * Опциональная аутентификация - не блокирует запрос если токена нет
 * Полезно для эндпоинтов где авторизация опциональна
 */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const payload = await verify(token, JWT_SECRET);
      const userId = payload.userId as string;

      const user = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          isPremium: users.isPremium,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length) {
        c.set('user', user[0] as AuthUser);
      }
    } catch {
      // Игнорируем ошибку - токен невалидный, но запрос продолжается
    }
  }

  await next();
};

/**
 * Helper для получения текущего пользователя из context
 */
export const getCurrentUser = (c: Context): AuthUser | null => {
  return c.get('user') as AuthUser | null;
};
