import { z } from 'zod';

export const createMediaSchema = z.object({
  memorialId: z.string().uuid(),
  title: z.string().max(180).optional().nullable(),
  altText: z.string().max(255).optional().nullable(),
  caption: z.string().optional().nullable(),
  mediaType: z.enum(['image', 'video']).optional().default('image'),
  fileName: z.string().min(1),
  base64Data: z.string().min(1, 'base64Data is required for uploads')
});

export const reorderMediaSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int()
    })
  )
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type ReorderMediaInput = z.infer<typeof reorderMediaSchema>;
