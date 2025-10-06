import { createPet, listPets } from '@/server/services/pets';
import { withErrorHandling } from '@/server/http/handler';
import { requireAdminContext, parseJsonBody } from '@/server/http/context';
import { json } from '@/server/http/responses';
import { consumeRateLimit } from '@/server/http/rate-limit';
import type { CreatePetInput } from '@/server/validation/pets';

export const GET = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const pets = await listPets(admin.userId);
  return json({ pets });
});

export const POST = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const rate = consumeRateLimit(`pets:create:${admin.userId}`, { points: 20, windowMs: 60_000 });
  if (rate.limited) {
    return json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const body = await parseJsonBody<CreatePetInput>(context.request);
  const pet = await createPet(admin.userId, body);
  return json({ pet }, { status: 201 });
});
