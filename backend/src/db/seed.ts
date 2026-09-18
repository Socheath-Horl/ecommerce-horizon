import { eq } from 'drizzle-orm';
import { db } from './index';
import { categories, products, users } from './schema';

const ADMIN_EMAIL = 'a@mail.com';

const CATEGORY_SEEDS = [
  { name: 'Outerwear', slug: 'outerwear' },
  { name: 'Travel', slug: 'travel' },
  { name: 'Carry & Desk', slug: 'carry-desks' },
  { name: 'Drinkware', slug: 'drinkware' },
];

const PRODUCT_SEEDS = [
  { name: 'Waxed Field Jacket', slug: 'waxed-field-jacket', price: '189.00', stock: 24, category_slug: 'outerwear', featured: true },
  { name: 'Country Wax Jacket', slug: 'country-wax-jacket', price: '145.00', stock: 3, category_slug: 'outerwear', featured: true },
  { name: 'Weekender Duffel', slug: 'weekender-duffel', price: '168.00', stock: 7, category_slug: 'travel', featured: true },
  { name: 'Canvas Duffel', slug: 'canvas-duffel', price: '124.00', stock: 41, category_slug: 'travel', featured: true },
  { name: 'Cabin Carry-On', slug: 'cabin-carry-on', price: '139.00', stock: 12, category_slug: 'travel', featured: true },
  { name: 'Trail Mug', slug: 'trail-mug', price: '42.00', stock: 120, category_slug: 'drinkware', featured: true },
  { name: 'Insulated Bottle 750ml', slug: 'insulated-bottle', price: '34.00', stock: 88, category_slug: 'drinkware', featured: true },
  { name: 'Steel Bottle 1L', slug: 'steel-bottle', price: '28.00', stock: 64, category_slug: 'drinkware', featured: false },
  { name: 'Utility Backpack', slug: 'utility-backpack', price: '98.00', stock: 9, category_slug: 'carry-desks', featured: true },
  { name: 'Daypack', slug: 'daypack', price: '8.95', stock: 0, category_slug: 'carry-desks', featured: false },
];

async function seed() {
  console.log('Seeding horizon-ecommerce…');

  for (const c of CATEGORY_SEEDS) {
    await db.insert(categories).values(c).onConflictDoNothing({ target: categories.slug });
  }
  console.log(`categories: ${CATEGORY_SEEDS.length} upserted (idempotent by slug)`);

  const cat_by_slug = new Map((await db.select().from(categories)).map((c) => [c.slug, c.id]));

  for (const p of PRODUCT_SEEDS) {
    const category_id = cat_by_slug.get(p.category_slug);
    if (!category_id) throw new Error(`Missing category for slug: ${p.category_slug}`);
    await db.insert(products).values({
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      is_featured: p.featured,
      category_id,
      description: '',
    }).onConflictDoNothing({ target: products.slug });
  }
  console.log(`products: ${PRODUCT_SEEDS.length} upserted (idempotent by slug)`);

  const admin = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (admin.length) {
    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.email, ADMIN_EMAIL));
    console.log(`admin: ${ADMIN_EMAIL} promoted to ADMIN`);
  } else {
    console.log(`admin: ${ADMIN_EMAIL} not found — log in via Zitadel first, then re-run \`npm run db:seed\``);
  }

  const [catCount, prodCount] = await Promise.all([
    db.select().from(categories),
    db.select().from(products),
  ]);
  console.log(`verify → categories: ${catCount.length}, products: ${prodCount.length}`);
}

seed().catch((err) => { console.error(err); process.exit(1); });