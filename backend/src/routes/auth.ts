import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import { db, users } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const app = new Hono();

// TODO: Добавить proper auth с Better Auth
// Пока простая реализация для MVP

// Register schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

// POST /auth/register
app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name, phone } = c.req.valid('json');

  // Check if user exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length) {
    return c.json({ error: 'Email already registered' }, 400);
  }

  // TODO: Hash password properly
  // Для MVP просто сохраняем (НЕ ДЕЛАТЬ ТАК В ПРОДАКШЕНЕ)
  const result = await db
    .insert(users)
    .values({
      email,
      passwordHash: password, // TODO: bcrypt.hash(password)
      name,
      phone,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    });

  // Generate JWT token
  const token = await sign(
    {
      userId: result[0].id,
      role: result[0].role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    },
    JWT_SECRET
  );

  return c.json({
    user: result[0],
    token,
  }, 201);
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /auth/login
app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user.length) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // TODO: Proper password comparison
  if (user[0].passwordHash !== password) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Generate JWT token
  const token = await sign(
    {
      userId: user[0].id,
      role: user[0].role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    },
    JWT_SECRET
  );

  return c.json({
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      isPremium: user[0].isPremium,
    },
    token,
  });
});

// GET /auth/me - текущий пользователь
app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  let payload;
  try {
    payload = await verify(token, JWT_SECRET);
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }

  const userId = payload.userId as string;

  const user = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      avatar: users.avatar,
      role: users.role,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user[0]);
});

export default app;
