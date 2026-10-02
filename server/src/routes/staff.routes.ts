import { Router } from 'express';
import {
  getAllStaff,
  createStaff,
  updateStaff,
  toggleStaffStatus,
} from '../controllers/staff.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/', getAllStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.patch('/:id/status', toggleStaffStatus);

export default router;
