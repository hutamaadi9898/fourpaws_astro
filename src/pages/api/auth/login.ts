import type { APIContext } from 'astro';

import { authenticate, type Credentials } from '@/server/auth/service';
import { withErrorHandling } from '@/server/http/handler';
import { parseJsonBody } from '@/server/http/context';
import { consumeRateLimit } from '@/server/http/rate-limit';
import { json } from '@/server/http/responses';
import { unauthorized } from '@/server/http/errors';

function clientKey(context: APIContext) {
  return context.clientAddress ?? context.request.headers.get('x-forwarded-for') ?? 'unknown';
}

export const POST = withErrorHandling(async (context) => {
  const key = `login:${clientKey(context)}`;
  const rate = consumeRateLimit(key, { points: 5, windowMs: 60_000 });
  if (rate.limited) {
    return json(
      { error: 'Too many login attempts. Please wait before retrying.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rate.resetAt - Date.now()) / 1000).toString()
        }
      }
    );
  }

  const body = await parseJsonBody<Credentials>(context.request);
  const result = await authenticate(body);
  if (!result) {
    throw unauthorized('Invalid email or password');
  }

  return json(
    {
      user: {
        id: result.user.id,
        email: result.user.email
      }
    },
    {
      headers: {
        'Set-Cookie': result.cookie
      }
    }
  );
});
