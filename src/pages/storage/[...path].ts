import type { APIRoute } from 'astro';
import { readFile, stat } from 'fs/promises';
import path from 'path';

import { getStorageAdapter } from '@/server/storage';
import { getEnv } from '@/server/env';

export const GET: APIRoute = async ({ params }) => {
  const adapter = getStorageAdapter();
  const key = params.path;
  if (!key) {
    return new Response('Not found', { status: 404 });
  }

  const fileKey = Array.isArray(key) ? key.join('/') : key;
  const resolvedPath = adapter.resolvePath(fileKey);
  const env = getEnv();
  const root = path.resolve(env.STORAGE_ROOT ?? './storage');

  if (!resolvedPath.startsWith(root)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    await stat(resolvedPath);
    const buffer = await readFile(resolvedPath);
    return new Response(new Uint8Array(buffer));
  } catch (error) {
    return new Response('Not found', { status: 404 });
  }
};
