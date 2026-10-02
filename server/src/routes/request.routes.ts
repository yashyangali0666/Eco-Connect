import { Router } from 'express';
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  assignStaff,
  cancelRequest,
  addComment,
  uploadImage,
} from '../controllers/request.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, getRequests);
router.get('/:id', authenticate, getRequestById);
router.post('/', authenticate, createRequest);
router.patch('/:id/status', authenticate, authorize([Role.ADMIN, Role.STAFF]), updateRequestStatus);
router.patch('/:id/assign', authenticate, authorize([Role.ADMIN]), assignStaff);
router.patch('/:id/cancel', authenticate, cancelRequest);
router.post('/:id/comments', authenticate, addComment);
router.post('/upload', authenticate, upload.single('image'), uploadImage);

export default router;
