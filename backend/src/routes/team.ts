import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db, businesses, businessMembers, users } from '../db';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// GET /team - получить список членов команды
app.get('/', authMiddleware, async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Найти бизнес пользователя
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  const biz = business[0];

  // Проверить что тариф Premium
  if (biz.tier !== 'premium') {
    return c.json({ error: 'Premium subscription required', tier: biz.tier }, 403);
  }

  // Получить членов команды
  const members = await db
    .select({
      id: businessMembers.id,
      role: businessMembers.role,
      invitedAt: businessMembers.invitedAt,
      acceptedAt: businessMembers.acceptedAt,
      isActive: businessMembers.isActive,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(businessMembers)
    .innerJoin(users, eq(businessMembers.userId, users.id))
    .where(eq(businessMembers.businessId, biz.id));

  return c.json({
    members,
    maxMembers: 5,
    currentCount: members.length,
  });
});

// POST /team/invite - пригласить сотрудника
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
});

app.post('/invite', authMiddleware, zValidator('json', inviteSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const data = c.req.valid('json');

  // Найти бизнес пользователя
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  const biz = business[0];

  // Проверить что тариф Premium
  if (biz.tier !== 'premium') {
    return c.json({ error: 'Premium subscription required' }, 403);
  }

  // Проверить лимит (5 сотрудников)
  const currentMembers = await db
    .select()
    .from(businessMembers)
    .where(and(
      eq(businessMembers.businessId, biz.id),
      eq(businessMembers.isActive, true)
    ));

  if (currentMembers.length >= 5) {
    return c.json({ error: 'Maximum team members reached (5)' }, 400);
  }

  // Найти пользователя по email
  const invitedUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (!invitedUser.length) {
    return c.json({ error: 'User not found', message: 'Пользователь с таким email не зарегистрирован' }, 404);
  }

  const targetUser = invitedUser[0];

  // Нельзя пригласить владельца
  if (targetUser.id === user.id) {
    return c.json({ error: 'Cannot invite yourself' }, 400);
  }

  // Проверить, не приглашён ли уже
  const existing = await db
    .select()
    .from(businessMembers)
    .where(and(
      eq(businessMembers.businessId, biz.id),
      eq(businessMembers.userId, targetUser.id)
    ))
    .limit(1);

  if (existing.length) {
    return c.json({ error: 'User already invited' }, 400);
  }

  // Создать приглашение
  const result = await db
    .insert(businessMembers)
    .values({
      businessId: biz.id,
      userId: targetUser.id,
      role: data.role,
      invitedBy: user.id,
      acceptedAt: new Date(), // Автоматически принято
      isActive: true,
    })
    .returning();

  return c.json(result[0], 201);
});

// PUT /team/:id - обновить роль сотрудника
const updateSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
});

app.put('/:id', authMiddleware, zValidator('json', updateSchema), async (c) => {
  const memberId = c.req.param('id');
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const data = c.req.valid('json');

  // Найти бизнес пользователя
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  const biz = business[0];

  // Проверить что участник принадлежит этому бизнесу
  const member = await db
    .select()
    .from(businessMembers)
    .where(and(
      eq(businessMembers.id, memberId),
      eq(businessMembers.businessId, biz.id)
    ))
    .limit(1);

  if (!member.length) {
    return c.json({ error: 'Member not found' }, 404);
  }

  // Обновить роль
  const result = await db
    .update(businessMembers)
    .set({ role: data.role })
    .where(eq(businessMembers.id, memberId))
    .returning();

  return c.json(result[0]);
});

// DELETE /team/:id - удалить сотрудника
app.delete('/:id', authMiddleware, async (c) => {
  const memberId = c.req.param('id');
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Найти бизнес пользователя
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  const biz = business[0];

  // Проверить что участник принадлежит этому бизнесу
  const member = await db
    .select()
    .from(businessMembers)
    .where(and(
      eq(businessMembers.id, memberId),
      eq(businessMembers.businessId, biz.id)
    ))
    .limit(1);

  if (!member.length) {
    return c.json({ error: 'Member not found' }, 404);
  }

  // Удалить (или деактивировать)
  await db
    .delete(businessMembers)
    .where(eq(businessMembers.id, memberId));

  return c.json({ success: true });
});

export default app;
