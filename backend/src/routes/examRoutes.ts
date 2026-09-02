import { Router } from 'express';
import { createExam, getFacultyExams, getExamById, deleteExam } from '../controllers/examController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('FACULTY', 'ADMIN'), createExam);
router.get('/', requireRole('FACULTY', 'ADMIN'), getFacultyExams);
router.get('/:id', getExamById);
router.delete('/:id', requireRole('FACULTY', 'ADMIN'), deleteExam);

export default router;
