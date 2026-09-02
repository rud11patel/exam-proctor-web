import { Router } from 'express';
import {
  getStudentExams,
  getStudentExamDetail,
  startAttempt,
  getAttemptState,
  saveAnswer,
  submitAttempt,
} from '../controllers/studentExamController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

// Student Exam endpoints
router.get('/student/exams', requireRole('STUDENT'), getStudentExams);
router.get('/student/exams/:id', requireRole('STUDENT'), getStudentExamDetail);
router.post('/student/exams/:id/start', requireRole('STUDENT'), startAttempt);

// Attempt & Auto-save endpoints
router.get('/attempts/:id', getAttemptState);
router.put('/attempts/:id/answers', requireRole('STUDENT'), saveAnswer);
router.post('/attempts/:id/submit', requireRole('STUDENT'), submitAttempt);

export default router;
