import { Router } from 'express';
import { getProfile, updateProfile, getStudents, getAdminUsers, updateUserStatus } from '../controllers/userController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// User Profile routes
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);

// Students roster for Faculty/Admin exam assignment
router.get('/students', requireAuth, requireRole('FACULTY', 'ADMIN'), getStudents);

// Admin User Management routes
router.get('/admin/list', requireAuth, requireRole('ADMIN'), getAdminUsers);
router.patch('/admin/:id/status', requireAuth, requireRole('ADMIN'), updateUserStatus);

export default router;
