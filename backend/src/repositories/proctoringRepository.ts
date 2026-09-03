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
  static async recordEventWithThreshold(
    attemptId: string,
    studentId: string,
    eventType: string,
    metadata?: any
  ): Promise<{ event: ProctoringEventDb | null; violationCount: number; isAlreadySubmitted: boolean }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock the attempt row to prevent race conditions
      const attemptRes = await client.query(
        'SELECT status FROM exam_attempts WHERE id = $1 AND student_id = $2 FOR UPDATE',
        [attemptId, studentId]
      );

      if (attemptRes.rows.length === 0) {
        throw new Error('Attempt not found or unauthorized');
      }

      const status = attemptRes.rows[0].status;
      // If the exam is already in a terminal state, don't record further violations
      if (['SUBMITTED', 'EXPIRED', 'TERMINATED'].includes(status)) {
        await client.query('COMMIT');
        return { event: null, violationCount: 0, isAlreadySubmitted: true };
      }

      // 2. Record the event
      const insertRes = await client.query<ProctoringEventDb>(
        `INSERT INTO proctoring_events (attempt_id, student_id, event_type, metadata)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [attemptId, studentId, eventType, metadata ? JSON.stringify(metadata) : '{}']
      );
      const event = insertRes.rows[0];

      // 3. Count all violations for this attempt
      const countRes = await client.query(
        'SELECT COUNT(*) as count FROM proctoring_events WHERE attempt_id = $1',
        [attemptId]
      );
      const violationCount = parseInt(countRes.rows[0].count, 10);

      await client.query('COMMIT');

      return { event, violationCount, isAlreadySubmitted: false };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

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
