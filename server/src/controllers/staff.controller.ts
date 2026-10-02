import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { sendSuccess, sendError } from '../utils/response';
import { createStaffSchema, updateStaffSchema } from '../validators/staff.validator';
import { Role, RequestStatus } from '@prisma/client';

export async function getAllStaff(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const staffMembers = await prisma.user.findMany({
      where: { role: Role.STAFF },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        staffProfile: {
          select: {
            id: true,
            vehicleType: true,
            vehicleNumber: true,
            serviceArea: true,
          },
        },
        _count: {
          select: {
            assignedPickups: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Compute completed pickups for each staff
    const staffWithMetrics = await Promise.all(
      staffMembers.map(async (staff) => {
        const completedCount = await prisma.pickupRequest.count({
          where: {
            assignedStaffId: staff.id,
            status: RequestStatus.COMPLETED,
          },
        });
        const activeCount = await prisma.pickupRequest.count({
          where: {
            assignedStaffId: staff.id,
            status: { in: [RequestStatus.ASSIGNED, RequestStatus.OUT_FOR_PICKUP, RequestStatus.COLLECTED] },
          },
        });

        return {
          ...staff,
          metrics: {
            totalAssigned: staff._count.assignedPickups,
            activeAssigned: activeCount,
            completedPickups: completedCount,
          },
        };
      })
    );

    sendSuccess(res, staffWithMetrics, 'Staff members retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createStaffSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      sendError(res, 'A user with this email address already exists', 409);
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const staff = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        passwordHash,
        role: Role.STAFF,
        staffProfile: {
          create: {
            vehicleType: data.vehicleType || null,
            vehicleNumber: data.vehicleNumber || null,
            serviceArea: data.serviceArea || null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        staffProfile: true,
      },
    });

    sendSuccess(res, staff, 'Staff member created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data = updateStaffSchema.parse(req.body);

    const staff = await prisma.user.findFirst({
      where: { id, role: Role.STAFF },
    });

    if (!staff) {
      sendError(res, 'Staff member not found', 404);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        staffProfile: {
          upsert: {
            create: {
              vehicleType: data.vehicleType || null,
              vehicleNumber: data.vehicleNumber || null,
              serviceArea: data.serviceArea || null,
            },
            update: {
              ...(data.vehicleType !== undefined && { vehicleType: data.vehicleType }),
              ...(data.vehicleNumber !== undefined && { vehicleNumber: data.vehicleNumber }),
              ...(data.serviceArea !== undefined && { serviceArea: data.serviceArea }),
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        staffProfile: true,
      },
    });

    sendSuccess(res, updatedUser, 'Staff member updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function toggleStaffStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const staff = await prisma.user.findFirst({
      where: { id, role: Role.STAFF },
    });

    if (!staff) {
      sendError(res, 'Staff member not found', 404);
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !staff.isActive },
      select: { id: true, name: true, isActive: true },
    });

    sendSuccess(
      res,
      updated,
      `Staff member ${updated.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
}
