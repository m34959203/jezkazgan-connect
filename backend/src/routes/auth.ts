import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { db, users } from '../db';
import { JWT_SECRET, authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';

const BCRYPT_ROUNDS = 10;

const app = new Hono<{ Variables: { user: AuthUser } }>();

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

  // Hash password with bcrypt
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const result = await db
    .insert(users)
    .values({
      email,
      passwordHash,
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
    return c.json({ error: 'Пользователь не найден. Пожалуйста, зарегистрируйтесь.' }, 401);
  }

  // Verify password with bcrypt
  // Support both hashed passwords and legacy plain text passwords
  const storedPassword = user[0].passwordHash || '';
  const isValidPassword = storedPassword.startsWith('$2')
    ? await bcrypt.compare(password, storedPassword)
    : storedPassword === password; // Legacy plain text fallback

  if (!isValidPassword) {
    return c.json({ error: 'Неверный пароль' }, 401);
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

// GET /auth/debug - debug token verification
app.get('/debug', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'No Authorization header', headers: Object.fromEntries(c.req.raw.headers) });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Invalid Authorization format', authHeader });
  }

  const token = authHeader.substring(7);

  // Check if old format
  if (token.startsWith('temp_token_')) {
    return c.json({ error: 'Old temp_token format detected', token: token.substring(0, 30) + '...' });
  }

  try {
    const payload = await verify(token, JWT_SECRET);
    return c.json({
      success: true,
      payload,
      jwtSecretUsed: JWT_SECRET === 'secret' ? 'default (secret)' : 'from env',
    });
  } catch (error) {
    return c.json({
      error: 'Token verification failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      tokenPreview: token.substring(0, 50) + '...',
      jwtSecretUsed: JWT_SECRET === 'secret' ? 'default (secret)' : 'from env',
    });
  }
});

// GET /auth/me - текущий пользователь
app.get('/me', authMiddleware, async (c) => {
  const authUser = getCurrentUser(c);

  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Get full user data from database
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
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!user.length) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(user[0]);
});

export default app;
