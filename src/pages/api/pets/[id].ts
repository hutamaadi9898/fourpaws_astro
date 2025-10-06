import { deletePet, getPet, updatePet } from '@/server/services/pets';
import { withErrorHandling } from '@/server/http/handler';
import { requireAdminContext, parseJsonBody } from '@/server/http/context';
import { json, noContent } from '@/server/http/responses';
import type { UpdatePetInput } from '@/server/validation/pets';

export const GET = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const petId = context.params.id!;
  const pet = await getPet(admin.userId, petId);
  if (!pet) {
    return json({ error: 'Pet not found' }, { status: 404 });
  }
  return json({ pet });
});

export const PATCH = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const petId = context.params.id!;
  const body = await parseJsonBody<UpdatePetInput>(context.request);
  const pet = await updatePet(admin.userId, petId, body);
  if (!pet) {
    return json({ error: 'Pet not found' }, { status: 404 });
  }
  return json({ pet });
});

export const DELETE = withErrorHandling(async (context) => {
  const admin = await requireAdminContext(context);
  const petId = context.params.id!;
  const pet = await deletePet(admin.userId, petId);
  if (!pet) {
    return json({ error: 'Pet not found' }, { status: 404 });
  }
  return noContent();
});
