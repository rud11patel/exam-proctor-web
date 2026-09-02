import { Router } from 'express';
import { getFacultyDashboard, getAdminDashboard, getExamAnalytics, exportExamCsv } from '../controllers/analyticsController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/faculty/dashboard', requireRole('FACULTY', 'ADMIN'), getFacultyDashboard);
router.get('/admin/dashboard', requireRole('ADMIN'), getAdminDashboard);
router.get('/exams/:id', requireRole('FACULTY', 'ADMIN'), getExamAnalytics);
router.get('/exams/:id/export-csv', requireRole('FACULTY', 'ADMIN'), exportExamCsv);

export default router;
