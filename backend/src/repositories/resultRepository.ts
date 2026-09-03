import { pool } from '../config/database';

export class ResultRepository {
  static async getStudentResults(studentId: string): Promise<any[]> {
    const query = `
      SELECT 
        e.id as exam_id,
        e.title as exam_title,
        e.subject as exam_subject,
        e.maximum_marks,
        e.passing_marks,
        e.duration,
        e.maximum_attempts,
        att_stats.total_attempts_count::integer as total_attempts_count,
        att_stats.completed_attempts_count::integer as completed_attempts_count,
        GREATEST(0, e.maximum_attempts - att_stats.total_attempts_count)::integer as remaining_attempts,
        best.id as attempt_id,
        best.attempt_number as best_attempt_number,
        best.total_score as best_score,
        best.percentage as percentage,
        best.is_passed,
        best.correct_count,
        best.incorrect_count,
        best.unanswered_count,
        best.submitted_at
      FROM exams e
      JOIN (
        SELECT 
          exam_id,
          COUNT(*) as total_attempts_count,
          COUNT(*) FILTER (WHERE status = 'SUBMITTED') as completed_attempts_count
        FROM exam_attempts
        WHERE student_id = $1
        GROUP BY exam_id
      ) att_stats ON e.id = att_stats.exam_id
      JOIN LATERAL (
        SELECT 
          id,
          attempt_number,
          total_score,
          percentage,
          is_passed,
          correct_count,
          incorrect_count,
          unanswered_count,
          submitted_at
        FROM exam_attempts
        WHERE exam_id = e.id AND student_id = $1 AND status = 'SUBMITTED'
        ORDER BY total_score DESC, percentage DESC, submitted_at DESC
        LIMIT 1
      ) best ON true
      WHERE att_stats.completed_attempts_count > 0
      ORDER BY best.submitted_at DESC
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  static async getStudentExamAttempts(examId: string, studentId: string): Promise<any[]> {
    const query = `
      SELECT 
        att.*,
        e.title as exam_title,
        e.subject as exam_subject,
        e.maximum_marks,
        e.passing_marks
      FROM exam_attempts att
      JOIN exams e ON att.exam_id = e.id
      WHERE att.exam_id = $1 AND att.student_id = $2 AND att.status = 'SUBMITTED'
      ORDER BY att.attempt_number ASC
    `;
    const result = await pool.query(query, [examId, studentId]);
    return result.rows;
  }

  static async getFacultyExamResults(examId: string): Promise<any[]> {
    const query = `
      SELECT r.*, u.name as student_name, u.email as student_email, sp.roll_number
      FROM exam_results r
      JOIN users u ON r.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE r.exam_id = $1
      ORDER BY r.obtained_marks DESC
    `;
    const result = await pool.query(query, [examId]);
    return result.rows;
  }

  static async toggleResultPublication(examId: string, publishedStatus: boolean): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE exams SET results_published = $1 WHERE id = $2', [publishedStatus, examId]);
      await client.query('UPDATE exam_results SET published_status = $1 WHERE exam_id = $2', [publishedStatus, examId]);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
