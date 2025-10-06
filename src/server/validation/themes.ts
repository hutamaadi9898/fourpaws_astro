import { z } from 'zod';

export const createThemeSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(255).optional().nullable(),
  primaryColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Primary color must be a hex value'),
  secondaryColor: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Secondary color must be a hex value'),
  accentColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Accent color must be a hex value'),
  backgroundColor: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Background color must be a hex value'),
  headingFont: z.string().min(2).max(80),
  bodyFont: z.string().min(2).max(80)
});

export type CreateThemeInput = z.infer<typeof createThemeSchema>;
