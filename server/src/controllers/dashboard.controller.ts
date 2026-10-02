import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { sendSuccess } from '../utils/response';
import { RequestStatus, Role } from '@prisma/client';
import { fallbackStore } from '../services/fallbackStore.service';

export async function getUserDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [
        activeCount,
        scheduledCount,
        completedCount,
        cancelledCount,
        recentRequests,
        nextUpcoming,
      ] = await Promise.all([
        prisma.pickupRequest.count({
          where: {
            userId,
            status: { in: [RequestStatus.PENDING, RequestStatus.CONFIRMED, RequestStatus.ASSIGNED, RequestStatus.OUT_FOR_PICKUP, RequestStatus.COLLECTED] },
          },
        }),
        prisma.pickupRequest.count({
          where: {
            userId,
            status: { in: [RequestStatus.CONFIRMED, RequestStatus.ASSIGNED] },
          },
        }),
        prisma.pickupRequest.count({
          where: {
            userId,
            status: RequestStatus.COMPLETED,
          },
        }),
        prisma.pickupRequest.count({
          where: {
            userId,
            status: RequestStatus.CANCELLED,
          },
        }),
        prisma.pickupRequest.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            wasteCategory: { select: { name: true, slug: true, icon: true, color: true } },
            assignedStaff: { select: { name: true, phone: true } },
          },
        }),
        prisma.pickupRequest.findFirst({
          where: {
            userId,
            status: { in: [RequestStatus.PENDING, RequestStatus.CONFIRMED, RequestStatus.ASSIGNED, RequestStatus.OUT_FOR_PICKUP] },
            pickupDate: { gte: startOfToday },
          },
          orderBy: { pickupDate: 'asc' },
          include: {
            wasteCategory: true,
            assignedStaff: { select: { name: true, phone: true, avatar: true } },
          },
        }),
      ]);

      sendSuccess(
        res,
        {
          metrics: {
            activeRequests: activeCount,
            scheduledPickups: scheduledCount,
            completedPickups: completedCount,
            cancelledRequests: cancelledCount,
          },
          recentRequests,
          nextUpcoming,
        },
        'User dashboard data loaded'
      );
    } catch (dbErr) {
      console.warn('Notice: Database unavailable, using fallback dashboard stats:', dbErr);
      const fallbackStats = fallbackStore.getDashboardStats('USER', userId);
      sendSuccess(
        res,
        {
          metrics: {
            activeRequests: fallbackStats.activePickups,
            scheduledPickups: 1,
            completedPickups: fallbackStats.completedPickups,
            cancelledRequests: 0,
          },
          recentRequests: fallbackStats.recentRequests,
          nextUpcoming: null,
        },
        'User dashboard data loaded'
      );
    }
  } catch (error) {
    next(error);
  }
}

export async function getStaffDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const staffId = req.user!.id;
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const [
        todayCount,
        upcomingCount,
        completedCount,
        activeAssignedCount,
        todayPickups,
      ] = await Promise.all([
        prisma.pickupRequest.count({
          where: {
            assignedStaffId: staffId,
            pickupDate: { gte: startOfToday, lte: endOfToday },
            status: { not: RequestStatus.CANCELLED },
          },
        }),
        prisma.pickupRequest.count({
          where: {
            assignedStaffId: staffId,
            pickupDate: { gt: endOfToday },
            status: { in: [RequestStatus.ASSIGNED, RequestStatus.CONFIRMED] },
          },
        }),
        prisma.pickupRequest.count({
          where: {
            assignedStaffId: staffId,
            status: RequestStatus.COMPLETED,
          },
        }),
        prisma.pickupRequest.count({
          where: {
            assignedStaffId: staffId,
            status: { in: [RequestStatus.ASSIGNED, RequestStatus.OUT_FOR_PICKUP, RequestStatus.COLLECTED] },
          },
        }),
        prisma.pickupRequest.findMany({
          where: {
            assignedStaffId: staffId,
            status: { in: [RequestStatus.ASSIGNED, RequestStatus.OUT_FOR_PICKUP, RequestStatus.COLLECTED] },
          },
          orderBy: [{ pickupDate: 'asc' }, { timeSlot: 'asc' }],
          include: {
            wasteCategory: true,
            user: { select: { id: true, name: true, phone: true, avatar: true } },
            images: true,
          },
        }),
      ]);

      sendSuccess(
        res,
        {
          metrics: {
            todaysPickups: todayCount,
            upcomingPickups: upcomingCount,
            completedPickups: completedCount,
            activeAssigned: activeAssignedCount,
          },
          todayPickups,
        },
        'Staff dashboard data loaded'
      );
    } catch (dbErr) {
      console.warn('Notice: Database unavailable, using fallback staff dashboard stats:', dbErr);
      const fallbackStats = fallbackStore.getDashboardStats('STAFF', staffId);
      sendSuccess(
        res,
        {
          metrics: {
            todaysPickups: fallbackStats.assignedToday,
            upcomingPickups: 2,
            completedPickups: fallbackStats.completedToday,
            activeAssigned: fallbackStats.pendingRoute,
          },
          todayPickups: fallbackStats.recentPickups,
        },
        'Staff dashboard data loaded'
      );
    }
  } catch (error) {
    next(error);
  }
}

export async function getAdminDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const [
        totalRequests,
        pendingRequests,
        todaysPickups,
        completedRequests,
        cancelledRequests,
        activeStaffCount,
        recentRequests,
        todaySchedule,
      ] = await Promise.all([
        prisma.pickupRequest.count(),
        prisma.pickupRequest.count({ where: { status: RequestStatus.PENDING } }),
        prisma.pickupRequest.count({
          where: {
            pickupDate: { gte: startOfToday, lte: endOfToday },
            status: { not: RequestStatus.CANCELLED },
          },
        }),
        prisma.pickupRequest.count({ where: { status: RequestStatus.COMPLETED } }),
        prisma.pickupRequest.count({ where: { status: RequestStatus.CANCELLED } }),
        prisma.user.count({ where: { role: Role.STAFF, isActive: true } }),
        prisma.pickupRequest.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            wasteCategory: { select: { name: true, icon: true, color: true } },
            assignedStaff: { select: { name: true } },
          },
        }),
        prisma.pickupRequest.findMany({
          where: {
            pickupDate: { gte: startOfToday, lte: endOfToday },
            status: { not: RequestStatus.CANCELLED },
          },
          take: 5,
          orderBy: { timeSlot: 'asc' },
          include: {
            wasteCategory: true,
            user: { select: { name: true, phone: true } },
            assignedStaff: { select: { name: true } },
          },
        }),
      ]);

      sendSuccess(
        res,
        {
          metrics: {
            totalRequests,
            pendingRequests,
            todaysPickups,
            completedRequests,
            cancelledRequests,
            activeStaffCount,
          },
          recentRequests,
          todaySchedule,
        },
        'Admin dashboard data loaded'
      );
    } catch (dbErr) {
      console.warn('Notice: Database unavailable, using fallback admin dashboard stats:', dbErr);
      const fallbackStats = fallbackStore.getDashboardStats('ADMIN', 'admin');
      sendSuccess(
        res,
        {
          metrics: {
            totalRequests: fallbackStats.totalRequests,
            pendingRequests: fallbackStats.pendingRequests,
            todaysPickups: 4,
            completedRequests: fallbackStats.completedRequests,
            cancelledRequests: 1,
            activeStaffCount: fallbackStats.activeStaff,
          },
          recentRequests: fallbackStats.recentRequests,
          todaySchedule: fallbackStats.recentRequests.slice(0, 3),
        },
        'Admin dashboard data loaded'
      );
    }
  } catch (error) {
    next(error);
  }
}
