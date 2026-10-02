import { z } from 'zod';
import { RequestStatus } from '@prisma/client';

export const createPickupRequestSchema = z.object({
  wasteCategoryId: z.string().uuid('Invalid waste category ID'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.enum(['kg', 'bags', 'items'], {
    errorMap: () => ({ message: 'Unit must be one of: kg, bags, items' }),
  }),
  description: z.string().max(1000).optional().nullable(),
  pickupAddress: z.string().min(5, 'Pickup address is required (at least 5 characters)'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Valid postal code is required'),
  landmark: z.string().max(255).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  pickupDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid pickup date is required',
  }),
  timeSlot: z.string().min(3, 'Pickup time slot is required'),
  imageUrl: z.string().url().optional().nullable(),
});

export const updatePickupStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus, {
    errorMap: () => ({ message: 'Invalid pickup request status' }),
  }),
  note: z.string().max(500).optional(),
});

export const assignStaffSchema = z.object({
  staffId: z.string().uuid('Invalid staff member ID'),
  note: z.string().max(500).optional(),
});

export const addCommentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty').max(1000),
});
