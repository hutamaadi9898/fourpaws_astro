import { removeMedia } from '@/server/services/media';
import { withErrorHandling } from '@/server/http/handler';
import { requireAdminContext } from '@/server/http/context';
import { noContent } from '@/server/http/responses';

export const DELETE = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const mediaId = context.params.id!;
  await removeMedia(admin.userId, mediaId);
  return noContent();
});
