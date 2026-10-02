import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { sendSuccess, sendError } from '../utils/response';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

import { fallbackStore } from '../services/fallbackStore.service';

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true' && req.user?.role === 'ADMIN';

    let categories: any[] = [];
    try {
      categories = await prisma.wasteCategory.findMany({
        where: includeInactive ? undefined : { isActive: true },
        include: {
          _count: {
            select: { pickupRequests: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (dbErr) {
      categories = fallbackStore.getCategories();
    }

    if (!categories || categories.length === 0) {
      categories = fallbackStore.getCategories();
    }

    sendSuccess(res, categories, 'Waste categories retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    let category: any = null;
    try {
      category = await prisma.wasteCategory.findUnique({
        where: { slug },
        include: {
          _count: {
            select: { pickupRequests: true },
          },
        },
      });
    } catch (dbErr) {
      category = fallbackStore.getCategoryBySlug(slug);
    }

    if (!category) {
      category = fallbackStore.getCategoryBySlug(slug);
    }

    if (!category) {
      sendError(res, 'Waste category not found', 404);
      return;
    }

    sendSuccess(res, category, 'Waste category details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = createCategorySchema.parse(req.body);

    const existingSlug = await prisma.wasteCategory.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      sendError(res, 'A category with this URL slug already exists', 409);
      return;
    }

    const category = await prisma.wasteCategory.create({
      data: validatedData,
    });

    sendSuccess(res, category, 'Waste category created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const validatedData = updateCategorySchema.parse(req.body);

    const category = await prisma.wasteCategory.update({
      where: { id },
      data: validatedData,
    });

    sendSuccess(res, category, 'Waste category updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const requestCount = await prisma.pickupRequest.count({
      where: { wasteCategoryId: id },
    });

    if (requestCount > 0) {
      // Soft-delete by setting isActive to false
      const updated = await prisma.wasteCategory.update({
        where: { id },
        data: { isActive: false },
      });
      sendSuccess(res, updated, 'Waste category has linked requests; deactivated instead of deleted');
      return;
    }

    await prisma.wasteCategory.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Waste category deleted successfully');
  } catch (error) {
    next(error);
  }
}
