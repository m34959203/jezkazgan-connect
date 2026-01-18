import { db, cities } from './index';

const kazakhstanCities = [
  // Wave 1 - Города республиканского значения
  { name: 'Алматы', nameKz: 'Алматы', slug: 'almaty', region: 'Город республиканского значения', population: 2000000 },
  { name: 'Астана', nameKz: 'Астана', slug: 'astana', region: 'Город республиканского значения', population: 1300000 },
  { name: 'Шымкент', nameKz: 'Шымкент', slug: 'shymkent', region: 'Город республиканского значения', population: 1100000 },

  // Wave 2 - Крупные города (областные центры)
  { name: 'Караганда', nameKz: 'Қарағанды', slug: 'karaganda', region: 'Карагандинская область', population: 500000 },
  { name: 'Актобе', nameKz: 'Ақтөбе', slug: 'aktobe', region: 'Актюбинская область', population: 450000 },
  { name: 'Тараз', nameKz: 'Тараз', slug: 'taraz', region: 'Жамбылская область', population: 400000 },
  { name: 'Павлодар', nameKz: 'Павлодар', slug: 'pavlodar', region: 'Павлодарская область', population: 350000 },
  { name: 'Усть-Каменогорск', nameKz: 'Өскемен', slug: 'ust-kamenogorsk', region: 'Восточно-Казахстанская область', population: 330000 },

  // Wave 3 - Региональные центры
  { name: 'Семей', nameKz: 'Семей', slug: 'semey', region: 'Абайская область', population: 320000 },
  { name: 'Атырау', nameKz: 'Атырау', slug: 'atyrau', region: 'Атырауская область', population: 280000 },
  { name: 'Костанай', nameKz: 'Қостанай', slug: 'kostanay', region: 'Костанайская область', population: 240000 },
  { name: 'Кызылорда', nameKz: 'Қызылорда', slug: 'kyzylorda', region: 'Кызылординская область', population: 230000 },
  { name: 'Уральск', nameKz: 'Орал', slug: 'uralsk', region: 'Западно-Казахстанская область', population: 220000 },
  { name: 'Петропавловск', nameKz: 'Петропавл', slug: 'petropavlovsk', region: 'Северо-Казахстанская область', population: 210000 },
  { name: 'Актау', nameKz: 'Ақтау', slug: 'aktau', region: 'Мангистауская область', population: 190000 },
  { name: 'Талдыкорган', nameKz: 'Талдықорған', slug: 'taldykorgan', region: 'Жетысуская область', population: 150000 },
  { name: 'Кокшетау', nameKz: 'Көкшетау', slug: 'kokshetau', region: 'Акмолинская область', population: 145000 },
  { name: 'Туркестан', nameKz: 'Түркістан', slug: 'turkestan', region: 'Туркестанская область', population: 140000 },
  { name: 'Жезказган', nameKz: 'Жезқазған', slug: 'jezkazgan', region: 'Улытауская область', population: 90000 },
  { name: 'Экибастуз', nameKz: 'Екібастұз', slug: 'ekibastuz', region: 'Павлодарская область', population: 130000 },
  { name: 'Конаев', nameKz: 'Қонаев', slug: 'konaev', region: 'Алматинская область', population: 100000 },
];

async function seed() {
  console.log('🌱 Seeding cities...');

  for (const city of kazakhstanCities) {
    await db.insert(cities).values(city).onConflictDoNothing();
  }

  console.log(`✅ Seeded ${kazakhstanCities.length} cities`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
