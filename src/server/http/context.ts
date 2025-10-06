import type { APIContext } from 'astro';

import { requireSession } from '../auth/service';
import { badRequest, unauthorized } from './errors';

export interface AdminContext {
  userId: string;
  email: string;
  clientIp: string;
  context: APIContext;
}

function resolveClientIp(apiContext: APIContext) {
  if (apiContext.clientAddress) return apiContext.clientAddress;
  return apiContext.request.headers.get('x-forwarded-for') ?? 'unknown';
}

export async function requireAdminContext(apiContext: APIContext) {
  const cookie = apiContext.request.headers.get('cookie');
  const session = await requireSession(cookie);
  if (!session) {
    throw unauthorized();
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    clientIp: resolveClientIp(apiContext),
    context: apiContext
  } satisfies AdminContext;
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  let text: string;
  try {
    text = await request.text();
  } catch (error) {
    throw badRequest('Unable to read request body', error);
  }

  if (!text) {
    throw badRequest('Request body cannot be empty');
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw badRequest('Invalid JSON payload', error);
  }
}
