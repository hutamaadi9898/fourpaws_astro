import { publishMemorial } from '@/server/services/memorials';
import { withErrorHandling } from '@/server/http/handler';
import { requireAdminContext, parseJsonBody } from '@/server/http/context';
import { json } from '@/server/http/responses';
import type { PublishMemorialInput } from '@/server/validation/memorials';

export const POST = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const memorialId = context.params.id!;
  const body = await parseJsonBody<PublishMemorialInput>(context.request);
  const memorial = await publishMemorial(admin.userId, memorialId, body);
  return json({ memorial });
});
