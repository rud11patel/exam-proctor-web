import { pool } from '../config/database';

export class ResultRepository {
  static async getStudentResults(studentId: string): Promise<any[]> {
    const query = `
      SELECT r.*, e.title as exam_title, e.subject as exam_subject, e.passing_marks
      FROM exam_results r
      JOIN exams e ON r.exam_id = e.id
      WHERE r.student_id = $1 AND r.published_status = true
      ORDER BY r.calculated_at DESC
    `;
    const result = await pool.query(query, [studentId]);
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
