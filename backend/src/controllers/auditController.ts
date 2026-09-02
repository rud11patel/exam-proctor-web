import { Request, Response } from 'express';
import { AuditRepository } from '../repositories/auditRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';

export async function getAuditLogs(req: Request, res: Response) {
  const { search, action } = req.query;
  const logs = await AuditRepository.getAuditLogs(search as string, action as string);

  const formatted = logs.map((l) => ({
    id: l.id,
    timestamp: l.created_at,
    actor: {
      name: l.actor_name,
      role: l.actor_role,
    },
    action: l.action,
    target: `${l.target_type || 'System'} ${l.target_id || ''}`.trim(),
    details: l.metadata,
  }));

  return ApiResponseBuilder.success(res, { logs: formatted });
}
