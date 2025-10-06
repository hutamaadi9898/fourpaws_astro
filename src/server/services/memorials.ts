import { and, desc, eq, inArray } from 'drizzle-orm';

import { slugify } from '@/lib/slug';
import { db, schema } from '../db/client';
import {
  createMemorialSchema,
  publishMemorialSchema,
  updateMemorialSchema,
  type CreateMemorialInput,
  type PublishMemorialInput,
  type UpdateMemorialInput
} from '../validation/memorials';
import { forbidden, notFound } from '../http/errors';

async function slugExists(slug: string) {
  const existing = await db.query.memorialPages.findFirst({
    where: eq(schema.memorialPages.slug, slug)
  });
  return Boolean(existing);
}

async function resolveSlug(title: string) {
  const base = slugify(title);
  if (!(await slugExists(base))) return base;

  let suffix = 2;
  let candidate = `${base}-${suffix}`;
  while (await slugExists(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

async function ensureOwnerOwnsPet(ownerId: string, petId: string) {
  const pet = await db.query.pets.findFirst({
    where: and(eq(schema.pets.id, petId), eq(schema.pets.ownerId, ownerId))
  });
  if (!pet) {
    throw forbidden('Pet does not belong to the current owner');
  }
  return pet;
}

async function ensureMemorial(ownerId: string, memorialId: string) {
  const memorial = await db.query.memorialPages.findFirst({
    where: eq(schema.memorialPages.id, memorialId),
    with: {
      pet: true
    }
  });
  if (!memorial || memorial.pet.ownerId !== ownerId) {
    throw notFound('Memorial not found');
  }
  return memorial;
}

export async function listMemorials(ownerId: string) {
  const rows = await db
    .select({
      memorial: schema.memorialPages,
      pet: schema.pets,
      theme: schema.themes
    })
    .from(schema.memorialPages)
    .innerJoin(schema.pets, eq(schema.pets.id, schema.memorialPages.petId))
    .leftJoin(schema.themes, eq(schema.themes.id, schema.memorialPages.themeId))
    .where(eq(schema.pets.ownerId, ownerId))
    .orderBy(desc(schema.memorialPages.updatedAt));

  const memorialIds = rows.map((row) => row.memorial.id);
  const mediaAssets = memorialIds.length
    ? await db
        .select()
        .from(schema.mediaAssets)
        .where(inArray(schema.mediaAssets.memorialId, memorialIds))
    : [];

  type Media = (typeof mediaAssets)[number];
  const mediaByMemorial = new Map<string, Media[]>();
  for (const asset of mediaAssets) {
    const bucket = mediaByMemorial.get(asset.memorialId) ?? [];
    bucket.push(asset);
    mediaByMemorial.set(asset.memorialId, bucket);
  }

  return rows.map(({ memorial, pet, theme }) => ({
    ...memorial,
    pet,
    theme,
    mediaAssets: mediaByMemorial.get(memorial.id) ?? []
  }));
}

export async function createMemorial(ownerId: string, input: CreateMemorialInput) {
  const payload = createMemorialSchema.parse(input);
  await ensureOwnerOwnsPet(ownerId, payload.petId);

  const slug = await resolveSlug(payload.title);
  const now = new Date();
  const [memorial] = await db
    .insert(schema.memorialPages)
    .values({
      petId: payload.petId,
      themeId: payload.themeId ?? null,
      title: payload.title,
      subtitle: payload.subtitle ?? null,
      summary: payload.summary ?? null,
      story: payload.story ?? null,
      slug,
      status: payload.status ?? 'draft',
      publishedAt: payload.status === 'published' ? now : null
    })
    .returning();

  return memorial;
}

export async function updateMemorial(ownerId: string, memorialId: string, input: UpdateMemorialInput) {
  const existing = await ensureMemorial(ownerId, memorialId);
  const payload = updateMemorialSchema.parse(input);

  const updateData: Partial<typeof schema.memorialPages.$inferInsert> = {};

  if (payload.themeId !== undefined) updateData.themeId = payload.themeId ?? null;
  if (payload.title !== undefined) {
    updateData.title = payload.title;
    updateData.slug = await resolveSlug(payload.title);
  }
  if (payload.subtitle !== undefined) updateData.subtitle = payload.subtitle ?? null;
  if (payload.summary !== undefined) updateData.summary = payload.summary ?? null;
  if (payload.story !== undefined) updateData.story = payload.story ?? null;
  if (payload.status !== undefined) {
    updateData.status = payload.status;
    if (payload.status === 'draft') {
      updateData.publishedAt = null;
    } else if (!existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  updateData.updatedAt = new Date();

  const [memorial] = await db
    .update(schema.memorialPages)
    .set(updateData)
    .where(eq(schema.memorialPages.id, memorialId))
    .returning();

  return memorial;
}

export async function publishMemorial(ownerId: string, memorialId: string, input: PublishMemorialInput) {
  const payload = publishMemorialSchema.parse(input);
  await ensureMemorial(ownerId, memorialId);

  if (payload.publish) {
    const publishedAt = payload.scheduledAt ? new Date(payload.scheduledAt) : new Date();
    const [memorial] = await db
      .update(schema.memorialPages)
      .set({ status: 'published', publishedAt, updatedAt: new Date() })
      .where(eq(schema.memorialPages.id, memorialId))
      .returning();
    return memorial;
  }

  const [memorial] = await db
    .update(schema.memorialPages)
    .set({ status: 'draft', publishedAt: null, updatedAt: new Date() })
    .where(eq(schema.memorialPages.id, memorialId))
    .returning();
  return memorial;
}

export async function getMemorial(ownerId: string, memorialId: string) {
  return ensureMemorial(ownerId, memorialId);
}
