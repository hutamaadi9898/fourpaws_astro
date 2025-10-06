import { asc } from 'drizzle-orm';

import { db, schema } from '../db/client';
import type { InsertTheme } from '../db/schema';

export async function listThemes() {
  return db.query.themes.findMany({ orderBy: (themes, { asc }) => asc(themes.name) });
}

export async function createTheme(input: InsertTheme) {
  const [theme] = await db.insert(schema.themes).values(input).returning();
  return theme;
}
