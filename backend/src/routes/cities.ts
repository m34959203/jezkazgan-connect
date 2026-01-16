import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db, cities } from '../db';

const app = new Hono();

// GET /cities - список всех активных городов
app.get('/', async (c) => {
  const result = await db
    .select()
    .from(cities)
    .where(eq(cities.isActive, true))
    .orderBy(cities.name);

  return c.json(result);
});

// GET /cities/:slug - город по slug
app.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const result = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, slug))
    .limit(1);

  if (!result.length) {
    return c.json({ error: 'City not found' }, 404);
  }

  return c.json(result[0]);
});

export default app;
