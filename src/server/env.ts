import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid Postgres connection string'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters for HMAC signing'),
  STORAGE_ROOT: z.string().default('./storage'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    STORAGE_ROOT: process.env.STORAGE_ROOT,
    NODE_ENV: process.env.NODE_ENV
  });

  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export const isProduction = () => getEnv().NODE_ENV === 'production';
