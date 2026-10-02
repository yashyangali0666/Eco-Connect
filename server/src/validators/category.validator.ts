import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  icon: z.string().min(1, 'Icon name is required'),
  imageUrl: z.string().url().optional().nullable(),
  acceptedItems: z.array(z.string()).min(1, 'At least one accepted item required'),
  rejectedItems: z.array(z.string()).min(1, 'At least one rejected item required'),
  disposalInstructions: z.string().min(10, 'Disposal instructions are required'),
  color: z.string().optional().default('#10B981'),
  isActive: z.boolean().optional().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();
