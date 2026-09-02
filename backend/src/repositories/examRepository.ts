import { pool } from '../config/database';

export interface ExamDb {
  id: string;
  title: string;
  description?: string;
  subject: string;
  start_time?: Date;
  end_time?: Date;
  duration: number;
  maximum_marks: number;
  passing_marks: number;
  negative_marking: number;
  randomize_questions: boolean;
  randomize_options: boolean;
  maximum_attempts: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  results_published: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  total_questions?: number;
  assigned_count?: number;
}

export class ExamRepository {
  static async createExam(data: {
    title: string;
    description?: string;
    subject: string;
    startTime?: Date;
    endTime?: Date;
    duration: number;
    maximumMarks: number;
    passingMarks: number;
    negativeMarking: number;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    maximumAttempts: number;
    createdBy?: string;
    questionIds: string[];
    studentIds?: string[];
    facultyUniversity?: string;
  }): Promise<ExamDb> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const examRes = await client.query<ExamDb>(
        `INSERT INTO exams (
          title, description, subject, start_time, end_time, duration,
          maximum_marks, passing_marks, negative_marking,
          randomize_questions, randomize_options, maximum_attempts, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PUBLISHED', $13)
        RETURNING *`,
        [
          data.title,
          data.description || null,
          data.subject,
          data.startTime || null,
          data.endTime || null,
          data.duration,
          data.maximumMarks,
          data.passingMarks,
          data.negativeMarking,
          data.randomizeQuestions,
          data.randomizeOptions,
          data.maximumAttempts,
          data.createdBy || null,
        ]
      );
      const exam = examRes.rows[0];

      // Link questions
      for (let i = 0; i < data.questionIds.length; i++) {
        await client.query(
          `INSERT INTO exam_questions (exam_id, question_id, ordering) VALUES ($1, $2, $3)`,
          [exam.id, data.questionIds[i], i + 1]
        );
      }

      // Link assigned students (or assign active students from same university if faculty, or all students if admin)
      let studentsToAssign = data.studentIds || [];
      if (studentsToAssign.length === 0) {
        if (data.facultyUniversity && data.facultyUniversity.trim()) {
          const univStudentsRes = await client.query(
            `SELECT u.id FROM users u
             JOIN student_profiles sp ON u.id = sp.user_id
             WHERE u.role = 'STUDENT'
               AND u.status = 'ACTIVE'
               AND sp.university IS NOT NULL
               AND TRIM(sp.university) != ''
               AND LOWER(TRIM(sp.university)) = LOWER(TRIM($1))`,
            [data.facultyUniversity.trim()]
          );
          studentsToAssign = univStudentsRes.rows.map((r) => r.id);
        } else {
          const allStudentsRes = await client.query("SELECT id FROM users WHERE role = 'STUDENT' AND status = 'ACTIVE'");
          studentsToAssign = allStudentsRes.rows.map((r) => r.id);
        }
      }

      for (const studentId of studentsToAssign) {
        await client.query(
          `INSERT INTO exam_assignments (exam_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [exam.id, studentId]
        );
      }

      await client.query('COMMIT');
      return exam;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getExamsForFaculty(facultyId?: string): Promise<ExamDb[]> {
    let query = `
      SELECT e.*,
             (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id) as total_questions,
             (SELECT COUNT(*) FROM exam_assignments ea WHERE ea.exam_id = e.id) as assigned_count
      FROM exams e
      WHERE (e.status != 'ARCHIVED' OR e.status IS NULL)
    `;
    const params: any[] = [];
    if (facultyId) {
      params.push(facultyId);
      query += ` AND e.created_by = $1`;
    }
    query += ` ORDER BY e.created_at DESC`;

    const result = await pool.query<ExamDb>(query, params);
    return result.rows;
  }

  static async getExamsForStudent(studentId: string): Promise<any[]> {
    const query = `
      SELECT e.*,
             (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id) as total_questions,
             ea.assigned_at,
             att.id as attempt_id,
             att.status as attempt_status,
             att.total_score,
             att.percentage,
             att.is_passed
      FROM exams e
      JOIN exam_assignments ea ON e.id = ea.exam_id
      LEFT JOIN exam_attempts att ON e.id = att.exam_id AND att.student_id = $1
      WHERE ea.student_id = $1 AND e.status IN ('PUBLISHED', 'ACTIVE')
      ORDER BY e.created_at DESC
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  static async getExamById(id: string): Promise<ExamDb | null> {
    const query = `
      SELECT e.*,
             (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id) as total_questions,
             (SELECT COUNT(*) FROM exam_assignments ea WHERE ea.exam_id = e.id) as assigned_count
      FROM exams e
      WHERE e.id = $1
    `;
    const result = await pool.query<ExamDb>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Production-safe examination deletion with row-level locks, ownership enforcement,
   * lifecycle validation, and academic data retention safeguards.
   */
  static async deleteExam(
    id: string,
    user: { id: string; role: string }
  ): Promise<{
    status: 'NOT_FOUND' | 'FORBIDDEN' | 'CANNOT_DELETE_ACTIVE_EXAM' | 'SUCCESS';
    action?: 'DELETED' | 'ARCHIVED';
    exam?: ExamDb;
    message: string;
  }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock the exam row to prevent concurrent modifications
      const examRes = await client.query<ExamDb>('SELECT * FROM exams WHERE id = $1 FOR UPDATE', [id]);
      if (examRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return { status: 'NOT_FOUND', message: 'Exam not found' };
      }
      const exam = examRes.rows[0];

      // 2. Ownership enforcement: Faculty can only delete their own exams; Admins have universal rights
      if (user.role === 'FACULTY' && exam.created_by !== user.id) {
        await client.query('ROLLBACK');
        return { status: 'FORBIDDEN', message: 'You are not authorized to delete this examination' };
      }

      // 3. Lifecycle check: Reject deletion if students are actively taking the exam
      const activeAttemptsRes = await client.query(
        "SELECT COUNT(*) FROM exam_attempts WHERE exam_id = $1 AND status = 'IN_PROGRESS'",
        [id]
      );
      const activeCount = parseInt(activeAttemptsRes.rows[0].count, 10);
      if (activeCount > 0) {
        await client.query('ROLLBACK');
        return {
          status: 'CANNOT_DELETE_ACTIVE_EXAM',
          message: 'Cannot delete examination while candidates are actively taking it.',
        };
      }

      // 4. Data retention safeguard: Check for completed/submitted student attempts
      const completedAttemptsRes = await client.query(
        "SELECT COUNT(*) FROM exam_attempts WHERE exam_id = $1 AND status != 'IN_PROGRESS'",
        [id]
      );
      const completedCount = parseInt(completedAttemptsRes.rows[0].count, 10);

      if (completedCount > 0) {
        // Safe Archive: Preserve academic evaluation records and student answers while archiving the exam
        await client.query(
          "UPDATE exams SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [id]
        );
        // Remove active student assignments so the exam is no longer assigned to candidates
        await client.query('DELETE FROM exam_assignments WHERE exam_id = $1', [id]);

        await client.query('COMMIT');
        return {
          status: 'SUCCESS',
          action: 'ARCHIVED',
          exam,
          message: 'Examination has completed candidate evaluations and was safely archived to preserve academic records.',
        };
      }

      // 5. Hard Deletion: No student attempts exist, clean deletion within transaction
      await client.query('DELETE FROM exam_questions WHERE exam_id = $1', [id]);
      await client.query('DELETE FROM exam_assignments WHERE exam_id = $1', [id]);
      await client.query('DELETE FROM exams WHERE id = $1', [id]);

      await client.query('COMMIT');
      return {
        status: 'SUCCESS',
        action: 'DELETED',
        exam,
        message: 'Examination deleted successfully.',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
