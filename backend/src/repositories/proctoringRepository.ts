import { pool } from '../config/database';

export interface ProctoringEventDb {
  id: string;
  attempt_id: string;
  student_id: string;
  event_type: string;
  metadata?: any;
  created_at: Date;
}

export class ProctoringRepository {
  static async recordEvent(
    attemptId: string,
    studentId: string,
    eventType: string,
    metadata?: any
  ): Promise<ProctoringEventDb> {
    const res = await pool.query<ProctoringEventDb>(
      `INSERT INTO proctoring_events (attempt_id, student_id, event_type, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [attemptId, studentId, eventType, metadata ? JSON.stringify(metadata) : '{}']
    );
    return res.rows[0];
  }

  static async getEventsByAttempt(attemptId: string): Promise<ProctoringEventDb[]> {
    const res = await pool.query<ProctoringEventDb>(
      `SELECT * FROM proctoring_events WHERE attempt_id = $1 ORDER BY created_at ASC`,
      [attemptId]
    );
    return res.rows;
  }

  static async getViolationCounts(attemptId: string): Promise<Record<string, number>> {
    const res = await pool.query<{ event_type: string; count: string }>(
      `SELECT event_type, COUNT(*) as count FROM proctoring_events WHERE attempt_id = $1 GROUP BY event_type`,
      [attemptId]
    );

    const counts: Record<string, number> = {};
    for (const r of res.rows) {
      counts[r.event_type] = parseInt(r.count, 10);
    }
    return counts;
  }
}
