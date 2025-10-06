import { getMemorial, updateMemorial } from '@/server/services/memorials';
import { withErrorHandling } from '@/server/http/handler';
import { requireAdminContext, parseJsonBody } from '@/server/http/context';
import { json } from '@/server/http/responses';
import type { UpdateMemorialInput } from '@/server/validation/memorials';

export const GET = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const memorialId = context.params.id!;
  const memorial = await getMemorial(admin.userId, memorialId);
  return json({ memorial });
});

export const PATCH = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const memorialId = context.params.id!;
  const body = await parseJsonBody<UpdateMemorialInput>(context.request);
  const memorial = await updateMemorial(admin.userId, memorialId, body);
  return json({ memorial });
});
