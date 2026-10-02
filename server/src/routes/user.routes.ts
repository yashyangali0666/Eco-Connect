import { Router } from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/', getAllUsers);
router.patch('/:id/status', toggleUserStatus);

export default router;
