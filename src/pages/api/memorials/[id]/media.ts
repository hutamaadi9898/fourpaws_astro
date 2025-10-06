import { addMediaAsset, reorderMedia } from '@/server/services/media';
import { withErrorHandling } from '@/server/http/handler';
import { requireAdminContext, parseJsonBody } from '@/server/http/context';
import { json, noContent } from '@/server/http/responses';
import type { CreateMediaInput, ReorderMediaInput } from '@/server/validation/media';

export const POST = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const memorialId = context.params.id!;
  const body = await parseJsonBody<Omit<CreateMediaInput, 'memorialId'>>(context.request);
  const asset = await addMediaAsset(admin.userId, { ...body, memorialId });
  return json({ asset }, { status: 201 });
});

export const PATCH = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const memorialId = context.params.id!;
  const body = await parseJsonBody<ReorderMediaInput>(context.request);
  await reorderMedia(admin.userId, memorialId, body);
  return noContent();
});
