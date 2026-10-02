import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    sendSuccess(
      res,
      {
        notifications,
        unreadCount,
      },
      'Notifications retrieved'
    );
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      sendError(res, 'Notification not found', 404);
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    sendSuccess(res, updated, 'Marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}
