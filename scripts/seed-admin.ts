import 'dotenv/config';

import { ensureOwnerExists } from '../src/server/auth/service';
import { closeDb } from '../src/server/db/client';
import { getEnv } from '../src/server/env';

async function main() {
  const env = getEnv();
  const email = process.env.ADMIN_EMAIL ?? 'owner@example.com';
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_NAME ?? 'Studio Owner';

  if (!password) {
    throw new Error('ADMIN_PASSWORD must be provided to seed the owner account');
  }

  const user = await ensureOwnerExists({ email, password, displayName });
  console.log(`Admin account ready for ${user.email}`);

  if (!process.env.ADMIN_PASSWORD) {
    console.warn('Remember to update ADMIN_PASSWORD in your environment configuration.');
  }

  if (!process.env.SESSION_SECRET) {
    console.warn('SESSION_SECRET is empty; login routes will fail until it is set.');
  }

  if (!env.STORAGE_ROOT) {
    console.warn('STORAGE_ROOT missing, defaulting to ./storage');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
