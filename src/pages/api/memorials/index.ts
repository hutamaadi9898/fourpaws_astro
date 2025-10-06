import { createMemorial, listMemorials } from '@/server/services/memorials';
import { withErrorHandling } from '@/server/http/handler';
import { requireAdminContext, parseJsonBody } from '@/server/http/context';
import { json } from '@/server/http/responses';
import { consumeRateLimit } from '@/server/http/rate-limit';
import type { CreateMemorialInput } from '@/server/validation/memorials';

export const GET = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const memorials = await listMemorials(admin.userId);
  return json({ memorials });
});

export const POST = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const rate = consumeRateLimit(`memorials:create:${admin.userId}`, { points: 10, windowMs: 60_000 });
  if (rate.limited) {
    return json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const body = await parseJsonBody<CreateMemorialInput>(context.request);
  const memorial = await createMemorial(admin.userId, body);
  return json({ memorial }, { status: 201 });
});
