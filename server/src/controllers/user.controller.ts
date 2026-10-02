import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: any = { role: 'USER' };
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { pickupRequests: true },
          },
        },
      }),
    ]);

    sendSuccess(
      res,
      {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    if (user.role === 'ADMIN') {
      sendError(res, 'Cannot toggle status of administrator account', 400);
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });

    sendSuccess(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
}
