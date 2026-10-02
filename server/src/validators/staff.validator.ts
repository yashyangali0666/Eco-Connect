import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(8),
  vehicleType: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  serviceArea: z.string().optional().nullable(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional().nullable(),
  vehicleType: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  serviceArea: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});
