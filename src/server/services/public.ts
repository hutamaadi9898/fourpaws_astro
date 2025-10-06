import { eq } from 'drizzle-orm';

import { db, schema } from '../db/client';
import { notFound } from '../http/errors';

export async function listPublishedMemorials() {
  const memorials = await db.query.memorialPages.findMany({
    where: eq(schema.memorialPages.status, 'published'),
    columns: {
      id: true,
      title: true,
      subtitle: true,
      slug: true,
      summary: true,
      publishedAt: true
    },
    with: {
      pet: {
        columns: {
          name: true,
          species: true
        }
      }
    },
    orderBy: (memorials, { desc }) => desc(memorials.publishedAt)
  });

  return memorials;
}

export async function getPublishedMemorialBySlug(slug: string) {
  const memorial = await db.query.memorialPages.findFirst({
    where: (memorials, { eq: eqOp, and }) => and(eqOp(memorials.slug, slug), eqOp(memorials.status, 'published')),
    with: {
      pet: true,
      theme: true,
      mediaAssets: {
        orderBy: (media, { asc }) => asc(media.sortOrder)
      }
    }
  });

  if (!memorial) {
    throw notFound('Memorial not found');
  }

  return memorial;
}
