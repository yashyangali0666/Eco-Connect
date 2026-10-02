import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/', getAdminAnalytics);

export default router;
