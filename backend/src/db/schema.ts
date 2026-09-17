import { type PgColumn } from 'drizzle-orm/pg-core';
import {
  boolean, integer, numeric, pgEnum, pgTable, text, timestamp, uuid,
} from 'drizzle-orm/pg-core';

export const role_enum = pgEnum('role', ['GUEST', 'CUSTOMER', 'USER', 'ADMIN']);

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references((): PgColumn => users.id),
  original_name: text('original_name').notNull(),
  file_name: text('file_name').notNull(),
  mime_type: text('mime_type').notNull(),
  size: integer('size').notNull(),
  bucket: text('bucket').notNull(),
  key: text('key').notNull(),
  url: text('url').notNull(),
  entity_type: text('entity_type'),
  entity_id: uuid('entity_id'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: role_enum('role').notNull().default('CUSTOMER'),
  avatar_id: uuid('avatar_id').references((): PgColumn => files.id),
  phone: text('phone'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  image_id: uuid('image_id').references(() => files.id),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  price: numeric('price').notNull(),
  stock: integer('stock').notNull().default(0),
  is_featured: boolean('is_featured').notNull().default(false),
  category_id: uuid('category_id').notNull().references(() => categories.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
