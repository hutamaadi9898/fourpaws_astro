import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';
import { getEnv } from '../env';

const globalForDb = globalThis as unknown as {
  __dbPool?: Pool;
  __db?: NodePgDatabase<typeof schema>;
};

function createPool() {
  const env = getEnv();
  return new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });
}

if (!globalForDb.__dbPool) {
  globalForDb.__dbPool = createPool();
}

const pool = globalForDb.__dbPool;

if (!globalForDb.__db) {
  globalForDb.__db = drizzle(pool, { schema });
}

export const db = globalForDb.__db!;
export { schema };

export async function withTransaction<T>(operation: (tx: NodePgDatabase<typeof schema>) => Promise<T>) {
  return db.transaction(operation);
}

export async function closeDb(): Promise<void> {
  await pool.end();
  globalForDb.__db = undefined;
  globalForDb.__dbPool = undefined;
}
