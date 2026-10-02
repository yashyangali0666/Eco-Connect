import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
