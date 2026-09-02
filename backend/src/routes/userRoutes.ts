import { Router } from 'express';
import { getProfile, updateProfile, getAdminUsers, updateUserStatus } from '../controllers/userController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// User Profile routes
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);

// Admin User Management routes
router.get('/admin/list', requireAuth, requireRole('ADMIN'), getAdminUsers);
router.patch('/admin/:id/status', requireAuth, requireRole('ADMIN'), updateUserStatus);

export default router;
