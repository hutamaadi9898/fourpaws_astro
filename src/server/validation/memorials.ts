import { z } from 'zod';

export const memorialStatusSchema = z.enum(['draft', 'published']);

export const createMemorialSchema = z.object({
  petId: z.string().uuid(),
  themeId: z.string().uuid().optional().nullable(),
  title: z.string().min(3).max(180),
  subtitle: z.string().max(255).optional().nullable(),
  summary: z.string().optional().nullable(),
  story: z.string().optional().nullable(),
  status: memorialStatusSchema.optional()
});

export const updateMemorialSchema = z.object({
  themeId: z.string().uuid().optional().nullable(),
  title: z.string().min(3).max(180).optional(),
  subtitle: z.string().max(255).optional().nullable(),
  summary: z.string().optional().nullable(),
  story: z.string().optional().nullable(),
  status: memorialStatusSchema.optional()
});

export const publishMemorialSchema = z.object({
  publish: z.boolean(),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
});

export type CreateMemorialInput = z.infer<typeof createMemorialSchema>;
export type UpdateMemorialInput = z.infer<typeof updateMemorialSchema>;
export type PublishMemorialInput = z.infer<typeof publishMemorialSchema>;
