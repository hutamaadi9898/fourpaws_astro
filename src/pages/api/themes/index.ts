import { listThemes, createTheme } from '@/server/services/themes';
import { withErrorHandling } from '@/server/http/handler';
import { requireAdminContext, parseJsonBody } from '@/server/http/context';
import { json } from '@/server/http/responses';
import { createThemeSchema, type CreateThemeInput } from '@/server/validation/themes';

export const GET = withErrorHandling(async (context) => {
  await requireAdminContext(context);
  const themes = await listThemes();
  return json({ themes });
});

export const POST = withErrorHandling(async (context) => {
  await requireAdminContext(context);
  const body = await parseJsonBody<CreateThemeInput>(context.request);
  const payload = createThemeSchema.parse(body);
  const theme = await createTheme(payload);
  return json({ theme }, { status: 201 });
});
