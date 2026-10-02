import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { generateRequestNumber } from '../utils/requestNumber';
import { sendSuccess, sendError } from '../utils/response';
import { logActivity, sendNotification } from '../services/activity.service';
import {
  createPickupRequestSchema,
  updatePickupStatusSchema,
  assignStaffSchema,
  addCommentSchema,
} from '../validators/request.validator';
import { RequestStatus, Role, Prisma } from '@prisma/client';

// Status transition matrix
const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.PENDING]: [RequestStatus.CONFIRMED, RequestStatus.CANCELLED, RequestStatus.REJECTED],
  [RequestStatus.CONFIRMED]: [RequestStatus.ASSIGNED, RequestStatus.CANCELLED, RequestStatus.REJECTED],
  [RequestStatus.ASSIGNED]: [RequestStatus.OUT_FOR_PICKUP, RequestStatus.CANCELLED],
  [RequestStatus.OUT_FOR_PICKUP]: [RequestStatus.COLLECTED, RequestStatus.ASSIGNED],
  [RequestStatus.COLLECTED]: [RequestStatus.COMPLETED],
  [RequestStatus.COMPLETED]: [], // Terminal state
  [RequestStatus.CANCELLED]: [], // Terminal state
  [RequestStatus.REJECTED]: [],  // Terminal state
};

export async function getRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const {
      status,
      wasteCategoryId,
      staffId,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const where: Prisma.PickupRequestWhereInput = {};

    // Role-based visibility scoping
    if (user.role === Role.USER) {
      where.userId = user.id;
    } else if (user.role === Role.STAFF) {
      where.assignedStaffId = user.id;
    }

    // Status filter
    if (status && Object.values(RequestStatus).includes(status as RequestStatus)) {
      where.status = status as RequestStatus;
    }

    // Category filter
    if (wasteCategoryId && typeof wasteCategoryId === 'string') {
      where.wasteCategoryId = wasteCategoryId;
    }

    // Staff filter (for Admin view)
    if (staffId && typeof staffId === 'string' && user.role === Role.ADMIN) {
      where.assignedStaffId = staffId;
    }

    // Date range filter
    if (startDate || endDate) {
      where.pickupDate = {};
      if (startDate) where.pickupDate.gte = new Date(startDate as string);
      if (endDate) where.pickupDate.lte = new Date(endDate as string);
    }

    // Text search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { requestNumber: { contains: query, mode: 'insensitive' } },
        { pickupAddress: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { postalCode: { contains: query, mode: 'insensitive' } },
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
      ];
    }

    // Order by mapping
    const validSortFields = ['createdAt', 'pickupDate', 'status', 'requestNumber'];
    const orderField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const orderDirection: Prisma.SortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, requests] = await Promise.all([
      prisma.pickupRequest.count({ where }),
      prisma.pickupRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: orderDirection },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          wasteCategory: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
          assignedStaff: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              staffProfile: { select: { vehicleType: true, vehicleNumber: true, serviceArea: true } },
            },
          },
          images: true,
          _count: {
            select: { comments: true },
          },
        },
      }),
    ]);

    sendSuccess(
      res,
      {
        requests,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Requests retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function getRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;

    const request = await prisma.pickupRequest.findFirst({
      where: {
        OR: [{ id }, { requestNumber: id }],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        wasteCategory: true,
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            staffProfile: true,
          },
        },
        images: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, role: true, avatar: true } },
          },
        },
      },
    });

    if (!request) {
      sendError(res, 'Pickup request not found', 404);
      return;
    }

    // Role-based IDOR authorization guard
    if (user.role === Role.USER && request.userId !== user.id) {
      sendError(res, 'Access denied. You do not have permission to view this request.', 403);
      return;
    }

    if (user.role === Role.STAFF && request.assignedStaffId !== user.id) {
      sendError(res, 'Access denied. This request is not assigned to your route.', 403);
      return;
    }

    sendSuccess(res, request, 'Request details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const validatedData = createPickupRequestSchema.parse(req.body);

    // Verify waste category exists and is active
    const category = await prisma.wasteCategory.findUnique({
      where: { id: validatedData.wasteCategoryId },
    });

    if (!category || !category.isActive) {
      sendError(res, 'Selected waste category is invalid or currently inactive', 400);
      return;
    }

    const requestNumber = await generateRequestNumber();

    const request = await prisma.pickupRequest.create({
      data: {
        requestNumber,
        userId: user.id,
        wasteCategoryId: validatedData.wasteCategoryId,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        description: validatedData.description || null,
        pickupAddress: validatedData.pickupAddress,
        city: validatedData.city,
        state: validatedData.state,
        postalCode: validatedData.postalCode,
        landmark: validatedData.landmark || null,
        latitude: validatedData.latitude || null,
        longitude: validatedData.longitude || null,
        pickupDate: new Date(validatedData.pickupDate),
        timeSlot: validatedData.timeSlot,
        status: RequestStatus.PENDING,
        ...(validatedData.imageUrl && {
          images: {
            create: {
              url: validatedData.imageUrl,
              filename: 'waste-upload.jpg',
            },
          },
        }),
      },
      include: {
        wasteCategory: true,
        images: true,
      },
    });

    // Record Activity Log
    await logActivity({
      pickupRequestId: request.id,
      userId: user.id,
      action: 'CREATED',
      description: `Pickup request ${request.requestNumber} submitted by citizen.`,
      metadata: {
        wasteCategory: category.name,
        quantity: `${validatedData.quantity} ${validatedData.unit}`,
        scheduledDate: validatedData.pickupDate,
      },
    });

    // Send notification to user
    await sendNotification({
      userId: user.id,
      pickupRequestId: request.id,
      title: 'Pickup Request Received',
      message: `Your pickup request ${request.requestNumber} for ${category.name} has been submitted and is pending review.`,
      type: 'INFO',
    });

    // Send notification to Admins
    const admins = await prisma.user.findMany({
      where: { role: Role.ADMIN, isActive: true },
      select: { id: true },
    });

    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        pickupRequestId: request.id,
        title: 'New Pickup Request',
        message: `New request ${request.requestNumber} submitted by ${user.name} for ${category.name}.`,
        type: 'ALERT',
      });
    }

    sendSuccess(res, request, 'Pickup request submitted successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status: targetStatus, note } = updatePickupStatusSchema.parse(req.body);

    const request = await prisma.pickupRequest.findUnique({
      where: { id },
      include: {
        wasteCategory: true,
        user: true,
        assignedStaff: true,
      },
    });

    if (!request) {
      sendError(res, 'Pickup request not found', 404);
      return;
    }

    const currentStatus = request.status;

    // Check staff permissions
    if (user.role === Role.STAFF) {
      if (request.assignedStaffId !== user.id) {
        sendError(res, 'You are not assigned to this pickup request', 403);
        return;
      }

      // Staff allowed transitions
      const staffAllowedFromAssigned: RequestStatus[] = [RequestStatus.OUT_FOR_PICKUP];
      const staffAllowedFromOutForPickup: RequestStatus[] = [RequestStatus.COLLECTED];
      const staffAllowedFromCollected: RequestStatus[] = [RequestStatus.COMPLETED];

      let isAllowed = false;
      if (currentStatus === RequestStatus.ASSIGNED && staffAllowedFromAssigned.includes(targetStatus)) isAllowed = true;
      if (currentStatus === RequestStatus.OUT_FOR_PICKUP && staffAllowedFromOutForPickup.includes(targetStatus)) isAllowed = true;
      if (currentStatus === RequestStatus.COLLECTED && staffAllowedFromCollected.includes(targetStatus)) isAllowed = true;

      if (!isAllowed) {
        sendError(
          res,
          `Invalid status transition for staff: Cannot transition from ${currentStatus} to ${targetStatus}`,
          400
        );
        return;
      }
    }

    // Non-admin status transition validation
    if (user.role !== Role.ADMIN) {
      const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(targetStatus)) {
        sendError(
          res,
          `Invalid status transition: Cannot transition from ${currentStatus} to ${targetStatus}`,
          400
        );
        return;
      }
    }

    // Complete timestamp
    const completedAt = targetStatus === RequestStatus.COMPLETED ? new Date() : request.completedAt;

    const updated = await prisma.pickupRequest.update({
      where: { id },
      data: {
        status: targetStatus,
        completedAt,
        ...(note && { adminNotes: note }),
      },
      include: {
        wasteCategory: true,
        user: true,
        assignedStaff: true,
      },
    });

    // Record activity
    await logActivity({
      pickupRequestId: id,
      userId: user.id,
      action: targetStatus,
      description: note || `Status updated from ${currentStatus} to ${targetStatus} by ${user.name}.`,
      metadata: { previousStatus: currentStatus, newStatus: targetStatus, note },
    });

    // Send notification to Citizen
    let notificationTitle = 'Pickup Status Updated';
    let notificationMsg = `Your request ${request.requestNumber} status is now ${targetStatus.replace(/_/g, ' ')}.`;

    if (targetStatus === RequestStatus.CONFIRMED) {
      notificationTitle = 'Pickup Request Confirmed! ✅';
      notificationMsg = `Your pickup request ${request.requestNumber} has been verified and confirmed. A collector will be assigned soon.`;
    } else if (targetStatus === RequestStatus.OUT_FOR_PICKUP) {
      notificationTitle = 'Collector En Route! 🚚';
      notificationMsg = `Our collection team has started their route towards ${request.pickupAddress}.`;
    } else if (targetStatus === RequestStatus.COLLECTED) {
      notificationTitle = 'Waste Collected! 📦';
      notificationMsg = `Your ${request.wasteCategory.name} has been collected and weighed.`;
    } else if (targetStatus === RequestStatus.COMPLETED) {
      notificationTitle = 'Pickup Completed! 🎉';
      notificationMsg = `Your pickup ${request.requestNumber} is complete. Thank you for recycling with EcoCollect!`;
    }

    await sendNotification({
      userId: request.userId,
      pickupRequestId: id,
      title: notificationTitle,
      message: notificationMsg,
      type: targetStatus === RequestStatus.COMPLETED ? 'SUCCESS' : 'STATUS_CHANGE',
    });

    sendSuccess(res, updated, `Status successfully updated to ${targetStatus}`);
  } catch (error) {
    next(error);
  }
}

export async function assignStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUser = req.user!;
    const { id } = req.params;
    const { staffId, note } = assignStaffSchema.parse(req.body);

    const [request, staff] = await Promise.all([
      prisma.pickupRequest.findUnique({
        where: { id },
        include: { wasteCategory: true },
      }),
      prisma.user.findFirst({
        where: { id: staffId, role: Role.STAFF, isActive: true },
        include: { staffProfile: true },
      }),
    ]);

    if (!request) {
      sendError(res, 'Pickup request not found', 404);
      return;
    }

    if (!staff) {
      sendError(res, 'Staff member not found or is currently inactive', 404);
      return;
    }

    // Auto update status to ASSIGNED if currently CONFIRMED or PENDING
    const newStatus =
      request.status === RequestStatus.PENDING || request.status === RequestStatus.CONFIRMED
        ? RequestStatus.ASSIGNED
        : request.status;

    const updated = await prisma.pickupRequest.update({
      where: { id },
      data: {
        assignedStaffId: staff.id,
        status: newStatus,
        ...(note && { adminNotes: note }),
      },
      include: {
        wasteCategory: true,
        user: true,
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            staffProfile: true,
          },
        },
      },
    });

    // Record activity
    await logActivity({
      pickupRequestId: id,
      userId: adminUser.id,
      action: 'ASSIGNED',
      description: `Assigned to collector ${staff.name}. ${note ? `Note: ${note}` : ''}`,
      metadata: { staffId: staff.id, staffName: staff.name, vehicle: staff.staffProfile?.vehicleNumber },
    });

    // Notify Staff
    await sendNotification({
      userId: staff.id,
      pickupRequestId: id,
      title: 'New Pickup Assigned 🚚',
      message: `You have been assigned to pickup request ${request.requestNumber} (${request.wasteCategory.name}) at ${request.pickupAddress}.`,
      type: 'STATUS_CHANGE',
    });

    // Notify Citizen
    await sendNotification({
      userId: request.userId,
      pickupRequestId: id,
      title: 'Collector Assigned',
      message: `Collector ${staff.name} has been assigned to your pickup request ${request.requestNumber}.`,
      type: 'INFO',
    });

    sendSuccess(res, updated, `Assigned successfully to ${staff.name}`);
  } catch (error) {
    next(error);
  }
}

export async function cancelRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { reason } = req.body;

    const request = await prisma.pickupRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      sendError(res, 'Pickup request not found', 404);
      return;
    }

    // Check authorization: citizen can cancel own; admin can cancel any
    if (user.role === Role.USER && request.userId !== user.id) {
      sendError(res, 'Forbidden: You cannot cancel another user\'s request', 403);
      return;
    }

    // Check status eligibility: only PENDING or CONFIRMED can be cancelled by citizen
    if (
      user.role === Role.USER &&
      request.status !== RequestStatus.PENDING &&
      request.status !== RequestStatus.CONFIRMED
    ) {
      sendError(
        res,
        `Cannot cancel request in ${request.status} status. Please contact support.`,
        400
      );
      return;
    }

    const updated = await prisma.pickupRequest.update({
      where: { id },
      data: {
        status: RequestStatus.CANCELLED,
        adminNotes: reason ? `Cancellation reason: ${reason}` : request.adminNotes,
      },
    });

    await logActivity({
      pickupRequestId: id,
      userId: user.id,
      action: 'CANCELLED',
      description: `Request cancelled by ${user.name}. ${reason ? `Reason: ${reason}` : ''}`,
      metadata: { cancelledBy: user.id, reason },
    });

    await sendNotification({
      userId: request.userId,
      pickupRequestId: id,
      title: 'Request Cancelled',
      message: `Your pickup request ${request.requestNumber} has been cancelled.`,
      type: 'WARNING',
    });

    sendSuccess(res, updated, 'Pickup request cancelled successfully');
  } catch (error) {
    next(error);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { comment } = addCommentSchema.parse(req.body);

    const request = await prisma.pickupRequest.findUnique({
      where: { id },
    });

    if (!request) {
      sendError(res, 'Pickup request not found', 404);
      return;
    }

    // RBAC check: User can only comment on own; staff on assigned; admin on any
    if (user.role === Role.USER && request.userId !== user.id) {
      sendError(res, 'Forbidden', 403);
      return;
    }
    if (user.role === Role.STAFF && request.assignedStaffId !== user.id) {
      sendError(res, 'Forbidden', 403);
      return;
    }

    const newComment = await prisma.comment.create({
      data: {
        pickupRequestId: id,
        userId: user.id,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true, avatar: true },
        },
      },
    });

    await logActivity({
      pickupRequestId: id,
      userId: user.id,
      action: 'COMMENT_ADDED',
      description: `${user.name} added a note: "${comment.slice(0, 60)}${comment.length > 60 ? '...' : ''}"`,
    });

    sendSuccess(res, newComment, 'Comment added successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 'No image file uploaded', 400);
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    sendSuccess(
      res,
      {
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}
