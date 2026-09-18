import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '@/config/env';
import * as schema from '@/db/schema';

const pool = new Pool({ connectionString: env.database_url });

export const db = drizzle(pool, { schema });