import { z } from 'zod';

export function parseOne<T extends z.ZodTypeAny>(data: unknown, schema: T, label = 'Result') {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`${label} validation failed: ${parsed.error.message}`);
  }

  return parsed.data;
}

export function parseMany<T extends z.ZodTypeAny>(data: unknown, schema: T, label = 'Result set') {
  const parsed = z.array(schema).safeParse(data);
  if (!parsed.success) {
    throw new Error(`${label} validation failed: ${parsed.error.message}`);
  }

  return parsed.data;
}
