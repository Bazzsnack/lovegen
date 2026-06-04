import { z } from 'zod';
import { RESERVED_SLUGS } from '../constants';

export const slugSchema = z.string()
  .min(3, "Slug must be at least 3 characters long")
  .max(60, "Slug cannot exceed 60 characters")
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/, "Slug can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen")
  .refine(slug => !RESERVED_SLUGS.includes(slug), {
    message: "This slug is reserved and cannot be used",
  });
