import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin-only category management
router.post('/', authenticate, authorize([Role.ADMIN]), createCategory);
router.put('/:id', authenticate, authorize([Role.ADMIN]), updateCategory);
router.delete('/:id', authenticate, authorize([Role.ADMIN]), deleteCategory);

export default router;
