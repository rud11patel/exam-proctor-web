import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import questionRoutes from './questionRoutes';
import examRoutes from './examRoutes';
import studentExamRoutes from './studentExamRoutes';
import resultRoutes from './resultRoutes';
import analyticsRoutes from './analyticsRoutes';
import auditRoutes from './auditRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/questions', questionRoutes);
router.use('/exams', examRoutes);
router.use('/results', resultRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin/audit-logs', auditRoutes);
router.use('/', studentExamRoutes);

export default router;
