import { db, users, businesses, events, promotions, cities } from './index';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

// Demo business data
const demoBusinesses = [
  {
    user: {
      email: 'restaurant@demo.afisha.kz',
      password: 'demo123456',
      name: 'Демо Ресторан',
    },
    business: {
      name: 'Ресторан "Алтын Орда"',
      description: 'Уютный ресторан казахской и европейской кухни в центре города. Банкетный зал на 100 человек, живая музыка по выходным.',
      category: 'restaurants' as const,
      address: 'ул. Абая, 15',
      phone: '+7 (7102) 55-44-33',
      whatsapp: '77021234567',
      instagram: 'altyn_orda_jez',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
      cover: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=400&fit=crop',
      tier: 'premium' as const,
      isVerified: true,
    },
    events: [
      {
        title: 'Вечер живой музыки',
        description: 'Приглашаем на вечер живой музыки! Выступление группы "Жас Толқын" с хитами 80-х и 90-х. Заказ столов по телефону.',
        category: 'concerts' as const,
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
        location: 'Ресторан "Алтын Орда"',
        address: 'ул. Абая, 15',
        isFree: false,
        price: 5000,
        isApproved: true,
        viewsCount: 156,
      },
      {
        title: 'Мастер-класс по приготовлению бешбармака',
        description: 'Научитесь готовить настоящий казахский бешбармак под руководством нашего шеф-повара. В стоимость входят все ингредиенты и дегустация.',
        category: 'education' as const,
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // через 2 недели
        location: 'Ресторан "Алтын Орда"',
        address: 'ул. Абая, 15',
        isFree: false,
        price: 15000,
        isApproved: true,
        viewsCount: 89,
      },
    ],
    promotions: [
      {
        title: 'Бизнес-ланч за 2500 ₸',
        description: 'Комплексный обед: салат, первое, второе блюдо и напиток. Каждый день с 12:00 до 15:00.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
        discount: '-40%',
        conditions: 'С понедельника по пятницу, с 12:00 до 15:00',
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 месяца
        viewsCount: 342,
      },
      {
        title: 'Скидка 20% на банкеты',
        description: 'При бронировании банкетного зала на свадьбу или юбилей - скидка 20% на всё меню!',
        image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop',
        discount: '-20%',
        conditions: 'При бронировании от 30 гостей',
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 месяца
        viewsCount: 127,
      },
    ],
  },
  {
    user: {
      email: 'fitness@demo.afisha.kz',
      password: 'demo123456',
      name: 'Демо Фитнес',
    },
    business: {
      name: 'Фитнес-клуб "Energy"',
      description: 'Современный фитнес-клуб с тренажерным залом, групповыми занятиями, бассейном и сауной. Профессиональные тренеры.',
      category: 'sports' as const,
      address: 'пр. Мира, 42',
      phone: '+7 (7102) 33-22-11',
      whatsapp: '77029876543',
      instagram: 'energy_fitness_jez',
      logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
      cover: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&h=400&fit=crop',
      tier: 'lite' as const,
      isVerified: true,
    },
    events: [
      {
        title: 'Марафон похудения "Новый Я"',
        description: '30-дневный интенсивный курс для снижения веса. Персональная программа тренировок, консультации диетолога, еженедельные замеры.',
        category: 'sports' as const,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // через 3 дня
        location: 'Фитнес-клуб "Energy"',
        address: 'пр. Мира, 42',
        isFree: false,
        price: 45000,
        isApproved: true,
        viewsCount: 234,
      },
      {
        title: 'Открытая тренировка по йоге',
        description: 'Бесплатная ознакомительная тренировка по хатха-йоге для всех желающих. Коврики предоставляются.',
        category: 'sports' as const,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // через 5 дней
        location: 'Фитнес-клуб "Energy"',
        address: 'пр. Мира, 42',
        isFree: true,
        isApproved: true,
        viewsCount: 178,
      },
    ],
    promotions: [
      {
        title: 'Первый месяц - 50% скидка!',
        description: 'Для новых клиентов первый месяц абонемента со скидкой 50%. Успей записаться!',
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop',
        discount: '-50%',
        conditions: 'Только для новых клиентов',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 месяц
        viewsCount: 567,
      },
    ],
  },
  {
    user: {
      email: 'beauty@demo.afisha.kz',
      password: 'demo123456',
      name: 'Демо Салон',
    },
    business: {
      name: 'Салон красоты "Грация"',
      description: 'Полный спектр услуг: парикмахерские услуги, маникюр, педикюр, косметология, массаж. Работаем с 9:00 до 21:00.',
      category: 'beauty' as const,
      address: 'ул. Ленина, 28',
      phone: '+7 (7102) 44-55-66',
      whatsapp: '77025554433',
      instagram: 'gracia_salon_jez',
      logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
      cover: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&h=400&fit=crop',
      tier: 'free' as const,
      isVerified: false,
    },
    events: [
      {
        title: 'День открытых дверей',
        description: 'Приглашаем познакомиться с нашим салоном! Бесплатные консультации косметолога, розыгрыш призов, скидки на услуги.',
        category: 'other' as const,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // через 10 дней
        location: 'Салон красоты "Грация"',
        address: 'ул. Ленина, 28',
        isFree: true,
        isApproved: true,
        viewsCount: 95,
      },
    ],
    promotions: [
      {
        title: 'Маникюр + педикюр = -30%',
        description: 'При заказе комплекса маникюр + педикюр получите скидку 30% на общую сумму!',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop',
        discount: '-30%',
        conditions: 'При записи на оба вида услуг в один день',
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 1.5 месяца
        viewsCount: 203,
      },
    ],
  },
];

async function seedDemoBusinesses() {
  console.log('🏢 Seeding demo businesses...');

  // Get Jezkazgan city
  const [jezkazganCity] = await db
    .select()
    .from(cities)
    .where(eq(cities.slug, 'jezkazgan'))
    .limit(1);

  if (!jezkazganCity) {
    console.error('❌ Jezkazgan city not found. Run the main seed first.');
    return;
  }

  const cityId = jezkazganCity.id;
  console.log(`📍 Using city: ${jezkazganCity.name} (${cityId})`);

  for (const demo of demoBusinesses) {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, demo.user.email))
        .limit(1);

      let userId: string;

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        console.log(`👤 User ${demo.user.email} already exists`);
      } else {
        // Create user
        const passwordHash = await bcrypt.hash(demo.user.password, 10);
        const [newUser] = await db
          .insert(users)
          .values({
            email: demo.user.email,
            passwordHash,
            name: demo.user.name,
            role: 'business',
          })
          .returning();
        userId = newUser.id;
        console.log(`👤 Created user: ${demo.user.email}`);
      }

      // Check if business already exists
      const existingBusiness = await db
        .select()
        .from(businesses)
        .where(eq(businesses.ownerId, userId))
        .limit(1);

      let businessId: string;

      if (existingBusiness.length > 0) {
        businessId = existingBusiness[0].id;
        console.log(`🏪 Business ${demo.business.name} already exists`);
      } else {
        // Create business
        const tierUntil = demo.business.tier !== 'free'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          : null;

        const [newBusiness] = await db
          .insert(businesses)
          .values({
            ownerId: userId,
            cityId,
            ...demo.business,
            tierUntil,
            postsThisMonth: 0,
          })
          .returning();
        businessId = newBusiness.id;
        console.log(`🏪 Created business: ${demo.business.name} (${demo.business.tier})`);
      }

      // Create or update events
      for (const event of demo.events) {
        const existingEvent = await db
          .select()
          .from(events)
          .where(and(
            eq(events.title, event.title),
            eq(events.businessId, businessId)
          ))
          .limit(1);

        if (existingEvent.length === 0) {
          await db.insert(events).values({
            cityId,
            businessId,
            creatorId: userId,
            ...event,
          });
          console.log(`  📅 Created event: ${event.title}`);
        } else {
          // Update existing event dates
          await db
            .update(events)
            .set({ date: event.date })
            .where(eq(events.id, existingEvent[0].id));
          console.log(`  📅 Updated event date: ${event.title}`);
        }
      }

      // Create or update promotions
      for (const promo of demo.promotions) {
        const existingPromo = await db
          .select()
          .from(promotions)
          .where(and(
            eq(promotions.title, promo.title),
            eq(promotions.businessId, businessId)
          ))
          .limit(1);

        if (existingPromo.length === 0) {
          await db.insert(promotions).values({
            businessId,
            cityId,
            ...promo,
            isActive: true,
          });
          console.log(`  🎁 Created promotion: ${promo.title}`);
        } else {
          // Update existing promotion dates
          await db
            .update(promotions)
            .set({ validUntil: promo.validUntil, isActive: true })
            .where(eq(promotions.id, existingPromo[0].id));
          console.log(`  🎁 Updated promotion date: ${promo.title}`);
        }
      }

    } catch (error) {
      console.error(`❌ Error creating ${demo.business.name}:`, error);
    }
  }

  console.log('\n✅ Demo businesses seeded successfully!');
  console.log('\n📋 Demo accounts:');
  for (const demo of demoBusinesses) {
    console.log(`   ${demo.business.name} (${demo.business.tier})`);
    console.log(`   Email: ${demo.user.email}`);
    console.log(`   Password: ${demo.user.password}`);
    console.log('');
  }
}

// Export for API use
export { seedDemoBusinesses };

// Run directly if executed as script (ESM-compatible check)
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  seedDemoBusinesses()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}
