import { and, eq } from 'drizzle-orm';

import { db, schema } from '../db/client';
import type { CreatePetInput, UpdatePetInput } from '../validation/pets';
import { createPetSchema, updatePetSchema } from '../validation/pets';

function toDate(input?: string | null) {
  if (!input) return null;
  return new Date(input);
}

export async function listPets(ownerId: string) {
  return db.query.pets.findMany({
    where: eq(schema.pets.ownerId, ownerId),
    orderBy: (pets, { asc }) => asc(pets.createdAt)
  });
}

export async function getPet(ownerId: string, petId: string) {
  return db.query.pets.findFirst({
    where: and(eq(schema.pets.id, petId), eq(schema.pets.ownerId, ownerId)),
    with: {
      memorialPages: true
    }
  });
}

export async function createPet(ownerId: string, input: CreatePetInput) {
  const payload = createPetSchema.parse(input);
  const [pet] = await db
    .insert(schema.pets)
    .values({
      ownerId,
      name: payload.name,
      species: payload.species,
      breed: payload.breed ?? null,
      birthDate: toDate(payload.birthDate),
      passingDate: toDate(payload.passingDate),
      memorialized: payload.memorialized ?? false
    })
    .returning();

  return pet;
}

export async function updatePet(ownerId: string, petId: string, input: UpdatePetInput) {
  const payload = updatePetSchema.parse(input);
  const updateData: Partial<typeof schema.pets.$inferInsert> = {};

  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.species !== undefined) updateData.species = payload.species;
  if (payload.breed !== undefined) updateData.breed = payload.breed ?? null;
  if (payload.birthDate !== undefined)
    updateData.birthDate = payload.birthDate ? toDate(payload.birthDate) : null;
  if (payload.passingDate !== undefined)
    updateData.passingDate = payload.passingDate ? toDate(payload.passingDate) : null;
  if (payload.memorialized !== undefined) updateData.memorialized = payload.memorialized;
  updateData.updatedAt = new Date();

  const [pet] = await db
    .update(schema.pets)
    .set(updateData)
    .where(and(eq(schema.pets.id, petId), eq(schema.pets.ownerId, ownerId)))
    .returning();

  return pet;
}

export async function deletePet(ownerId: string, petId: string) {
  const [deleted] = await db
    .delete(schema.pets)
    .where(and(eq(schema.pets.id, petId), eq(schema.pets.ownerId, ownerId)))
    .returning();
  return deleted;
}
