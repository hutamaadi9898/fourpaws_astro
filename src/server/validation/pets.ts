import { z } from 'zod';

const isoDate = z.string().datetime({ offset: true });

export const createPetSchema = z.object({
  name: z.string().min(2).max(120),
  species: z.string().min(2).max(80),
  breed: z.string().max(120).optional(),
  birthDate: isoDate.optional(),
  passingDate: isoDate.optional(),
  memorialized: z.boolean().optional().default(false)
});

export const updatePetSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  species: z.string().min(2).max(80).optional(),
  breed: z.union([z.string().max(120), z.null()]).optional(),
  birthDate: z.union([isoDate, z.null()]).optional(),
  passingDate: z.union([isoDate, z.null()]).optional(),
  memorialized: z.boolean().optional()
});

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
