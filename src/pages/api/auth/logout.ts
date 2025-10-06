import { signOut } from '@/server/auth/service';
import { withErrorHandling } from '@/server/http/handler';
import { json } from '@/server/http/responses';

export const POST = withErrorHandling(async (context) => {
  const cookie = context.request.headers.get('cookie');
  const clearedCookie = await signOut(cookie);
  return json(
    { success: true },
    {
      headers: {
        'Set-Cookie': clearedCookie
      }
    }
  );
});
