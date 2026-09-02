import { Router } from 'express';
import { createQuestion, getQuestions, getQuestionById, deleteQuestion } from '../controllers/questionController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('FACULTY', 'ADMIN'), createQuestion);
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.delete('/:id', requireRole('FACULTY', 'ADMIN'), deleteQuestion);

export default router;
