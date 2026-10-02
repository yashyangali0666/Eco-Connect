import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { sendSuccess } from '../utils/response';
import { RequestStatus } from '@prisma/client';

export async function getAdminAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const totalRequests = await prisma.pickupRequest.count();
    const completedRequests = await prisma.pickupRequest.count({
      where: { status: RequestStatus.COMPLETED },
    });
    const cancelledRequests = await prisma.pickupRequest.count({
      where: { status: RequestStatus.CANCELLED },
    });

    const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;
    const cancellationRate = totalRequests > 0 ? Math.round((cancelledRequests / totalRequests) * 100) : 0;

    // Requests by Status
    const statusCounts = await prisma.pickupRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const requestsByStatus = statusCounts.map((sc) => ({
      status: sc.status,
      count: sc._count.id,
      label: sc.status.replace(/_/g, ' '),
    }));

    // Requests by Waste Category
    const categoryCounts = await prisma.pickupRequest.groupBy({
      by: ['wasteCategoryId'],
      _count: { id: true },
      _sum: { quantity: true },
    });

    const categories = await prisma.wasteCategory.findMany({
      select: { id: true, name: true, color: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const requestsByCategory = categoryCounts.map((cc) => {
      const cat = categoryMap.get(cc.wasteCategoryId);
      return {
        categoryId: cc.wasteCategoryId,
        categoryName: cat?.name || 'Unknown',
        color: cat?.color || '#10B981',
        count: cc._count.id,
        totalQuantity: cc._sum.quantity || 0,
      };
    });

    // Daily volume for the last 14 days
    const now = new Date();
    const dailyVolume = [];

    for (let i = 13; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

      const [createdCount, completedCount] = await Promise.all([
        prisma.pickupRequest.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        prisma.pickupRequest.count({
          where: { completedAt: { gte: startOfDay, lte: endOfDay } },
        }),
      ]);

      dailyVolume.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requests: createdCount,
        completed: completedCount,
      });
    }

    sendSuccess(
      res,
      {
        summary: {
          totalRequests,
          completedRequests,
          cancelledRequests,
          completionRate,
          cancellationRate,
        },
        requestsByStatus,
        requestsByCategory,
        dailyVolume,
      },
      'Analytics loaded successfully'
    );
  } catch (error) {
    next(error);
  }
}
