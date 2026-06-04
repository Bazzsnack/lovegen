import { z } from 'zod';

export const pageSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  subtitle: z.string().max(200, "Subtitle is too long").optional(),
  phrases: z.array(z.string().max(200)).min(1, "At least one phrase is required").max(5, "Maximum 5 phrases allowed"),
  theme: z.enum(['rose-petal', 'starlight', 'ocean-breeze', 'golden-hour', 'midnight-bloom', 'aurora']),
  particleSpeed: z.enum(['slow', 'medium', 'fast']),
  particleDensity: z.enum(['sparse', 'normal', 'dense']),
  fontPairing: z.enum(['playfair-inter', 'dancing-inter']),
  imageUrls: z.array(z.string().url()).max(10),
  audioUrl: z.string().url().nullable().optional(),
  audioFilename: z.string().nullable().optional(),
  qrConfig: z.object({
    dotStyle: z.string(),
    cornerStyle: z.string(),
    fgColor: z.string(),
    bgColor: z.string()
  }).default({ dotStyle: 'rounded', cornerStyle: 'square', fgColor: '#ff1a66', bgColor: '#ffffff' }),
  isPublished: z.boolean().default(false)
});

export type PageFormData = z.infer<typeof pageSchema>;
