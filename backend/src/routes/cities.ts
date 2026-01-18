import { Hono } from 'hono';
import { eq, and, or, isNull, gte, lte, sql } from 'drizzle-orm';
import { db, cities, cityBanners, businesses } from '../db';

const app = new Hono();

// GET /cities - список всех активных городов
app.get('/', async (c) => {
  try {
    const result = await db
      .select()
      .from(cities)
      .where(eq(cities.isActive, true))
      .orderBy(cities.name);

    return c.json(result);
  } catch (error) {
    console.error('Cities fetch error:', error);
    return c.json({ error: 'Database error', details: String(error) }, 500);
  }
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

// GET /cities/:slug/banners - активные баннеры города (публичный)
app.get('/:slug/banners', async (c) => {
  const slug = c.req.param('slug');

  try {
    // Сначала получим город по slug
    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.slug, slug))
      .limit(1);

    if (!city) {
      return c.json({ error: 'City not found' }, 404);
    }

    const now = new Date();

    // Получаем активные баннеры для этого города
    const result = await db
      .select({
        id: cityBanners.id,
        title: cityBanners.title,
        description: cityBanners.description,
        imageUrl: cityBanners.imageUrl,
        link: cityBanners.link,
        linkType: cityBanners.linkType,
        position: cityBanners.position,
        businessId: cityBanners.businessId,
        businessName: businesses.name,
      })
      .from(cityBanners)
      .leftJoin(businesses, eq(cityBanners.businessId, businesses.id))
      .where(
        and(
          eq(cityBanners.cityId, city.id),
          eq(cityBanners.isActive, true),
          or(isNull(cityBanners.startDate), lte(cityBanners.startDate, now)),
          or(isNull(cityBanners.endDate), gte(cityBanners.endDate, now))
        )
      )
      .orderBy(cityBanners.position);

    // Увеличиваем счётчик просмотров для каждого баннера
    if (result.length > 0) {
      const bannerIds = result.map(b => b.id);
      await db
        .update(cityBanners)
        .set({ viewsCount: sql`${cityBanners.viewsCount} + 1` })
        .where(sql`${cityBanners.id} = ANY(${bannerIds})`);
    }

    return c.json({ banners: result, city });
  } catch (error) {
    console.error('City banners fetch error:', error);
    return c.json({ error: 'Database error', details: String(error) }, 500);
  }
});

export default app;
