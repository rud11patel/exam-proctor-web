import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, requireRole('ADMIN'), getAuditLogs);

export default router;
