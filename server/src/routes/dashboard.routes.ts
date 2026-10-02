import { Router } from 'express';
import {
  getUserDashboard,
  getStaffDashboard,
  getAdminDashboard,
} from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/user', getUserDashboard);
router.get('/staff', authorize([Role.STAFF, Role.ADMIN]), getStaffDashboard);
router.get('/admin', authorize([Role.ADMIN]), getAdminDashboard);

export default router;
