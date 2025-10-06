import { and, eq, max } from 'drizzle-orm';

import { getStorageAdapter } from '../storage';
import { db, schema } from '../db/client';
import {
  createMediaSchema,
  reorderMediaSchema,
  type CreateMediaInput,
  type ReorderMediaInput
} from '../validation/media';
import { badRequest, notFound } from '../http/errors';

async function ensureMemorialOwnership(ownerId: string, memorialId: string) {
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

export async function addMediaAsset(ownerId: string, input: CreateMediaInput) {
  const payload = createMediaSchema.parse(input);
  await ensureMemorialOwnership(ownerId, payload.memorialId);

  const buffer = Buffer.from(payload.base64Data, 'base64');
  if (!buffer.length) {
    throw badRequest('Uploaded data is empty');
  }

  const storage = getStorageAdapter();
  const stored = await storage.save({
    data: buffer,
    fileName: payload.fileName,
    prefix: `memorials/${payload.memorialId}`
  });

  const [currentMax] = await db
    .select({ value: max(schema.mediaAssets.sortOrder).as('value') })
    .from(schema.mediaAssets)
    .where(eq(schema.mediaAssets.memorialId, payload.memorialId));

  const nextSortOrder = (currentMax?.value ?? 0) + 1;

  const [asset] = await db
    .insert(schema.mediaAssets)
    .values({
      memorialId: payload.memorialId,
      title: payload.title ?? null,
      altText: payload.altText ?? null,
      caption: payload.caption ?? null,
      mediaType: payload.mediaType ?? 'image',
      fileKey: stored.fileKey,
      sortOrder: nextSortOrder
    })
    .returning();

  return asset;
}

export async function reorderMedia(ownerId: string, memorialId: string, input: ReorderMediaInput) {
  const payload = reorderMediaSchema.parse(input);
  await ensureMemorialOwnership(ownerId, memorialId);

  const updates = payload.items.map((item) =>
    db
      .update(schema.mediaAssets)
      .set({ sortOrder: item.sortOrder })
      .where(and(eq(schema.mediaAssets.id, item.id), eq(schema.mediaAssets.memorialId, memorialId)))
  );

  await Promise.all(updates);
}

export async function removeMedia(ownerId: string, mediaId: string) {
  const asset = await db.query.mediaAssets.findFirst({
    where: eq(schema.mediaAssets.id, mediaId),
    with: {
      memorial: {
        with: {
          pet: true
        }
      }
    }
  });

  if (!asset || asset.memorial.pet.ownerId !== ownerId) {
    throw notFound('Media asset not found');
  }

  const storage = getStorageAdapter();
  await storage.remove(asset.fileKey);
  await db.delete(schema.mediaAssets).where(eq(schema.mediaAssets.id, mediaId));
}
