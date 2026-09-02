import { pool } from '../config/database';

export class AuditRepository {
  static async logAction(data: {
    actorId?: string;
    actorName: string;
    actorRole: string;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, target_type, target_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          data.actorId || null,
          data.actorName,
          data.actorRole,
          data.action,
          data.targetType || null,
          data.targetId || null,
          JSON.stringify(data.metadata || {}),
        ]
      );
    } catch (error) {
      console.error('Audit log creation warning:', error);
    }
  }

  static async getAuditLogs(search?: string, actionFilter?: string): Promise<any[]> {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(actor_name) LIKE $${params.length} OR LOWER(action) LIKE $${params.length})`;
    }

    if (actionFilter && actionFilter !== 'ALL') {
      params.push(actionFilter);
      query += ` AND action = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT 100';
    const result = await pool.query(query, params);
    return result.rows;
  }
}
