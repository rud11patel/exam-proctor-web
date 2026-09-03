import { Router } from 'express';
import { getStudentResults, getStudentExamAttempts, getFacultyExamResults, toggleResultRelease } from '../controllers/resultController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/student/results', requireRole('STUDENT'), getStudentResults);
router.get('/student/exams/:id/attempts', requireRole('STUDENT'), getStudentExamAttempts);
router.get('/faculty/exams/:id/results', requireRole('FACULTY', 'ADMIN'), getFacultyExamResults);
router.patch('/faculty/exams/:id/publish-results', requireRole('FACULTY', 'ADMIN'), toggleResultRelease);

export default router;
