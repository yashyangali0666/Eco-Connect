import prisma from '../prisma';

export interface LogActivityParams {
  pickupRequestId: string;
  userId?: string | null;
  action: string;
  description: string;
  metadata?: any;
}

export interface CreateNotificationParams {
  userId: string;
  pickupRequestId?: string | null;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'STATUS_CHANGE';
}

export async function logActivity(params: LogActivityParams) {
  try {
    return await prisma.activityLog.create({
      data: {
        pickupRequestId: params.pickupRequestId,
        userId: params.userId || null,
        action: params.action,
        description: params.description,
        metadata: params.metadata || undefined,
      },
    });
  } catch (error) {
    console.error('Failed to record activity log:', error);
  }
}

export async function sendNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        pickupRequestId: params.pickupRequestId || null,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
