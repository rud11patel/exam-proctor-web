import { pool } from '../config/database';

export class AnalyticsRepository {
  static async getFacultyDashboardStats(facultyId?: string): Promise<any> {
    const examStats = await pool.query(`
      SELECT
        COUNT(*) as total_exams,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_exams,
        COUNT(*) FILTER (WHERE status = 'PUBLISHED') as upcoming_exams,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_exams
      FROM exams
    `);

    const candidateStats = await pool.query(`
      SELECT COUNT(DISTINCT student_id) as total_candidates FROM exam_assignments
    `);

    const perfStats = await pool.query(`
      SELECT AVG(percentage) as average_percentage FROM exam_results
    `);

    return {
      totalExams: parseInt(examStats.rows[0].total_exams, 10) || 0,
      activeExams: parseInt(examStats.rows[0].active_exams, 10) || 0,
      upcomingExams: parseInt(examStats.rows[0].upcoming_exams, 10) || 0,
      completedExams: parseInt(examStats.rows[0].completed_exams, 10) || 0,
      totalCandidates: parseInt(candidateStats.rows[0].total_candidates, 10) || 0,
      averagePerformance: Math.round((parseFloat(perfStats.rows[0].average_percentage) || 0) * 10) / 10,
    };
  }

  static async getAdminDashboardStats(): Promise<any> {
    const userStats = await pool.query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'STUDENT') as total_students,
        COUNT(*) FILTER (WHERE role = 'FACULTY') as total_faculty,
        COUNT(*) FILTER (WHERE role = 'ADMIN') as total_admins,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_users
      FROM users
    `);

    const examStats = await pool.query(`
      SELECT COUNT(*) as total_exams FROM exams
    `);

    const attemptStats = await pool.query(`
      SELECT COUNT(*) as total_attempts FROM exam_attempts WHERE status = 'SUBMITTED'
    `);

    return {
      users: {
        total: parseInt(userStats.rows[0].total_users, 10) || 0,
        students: parseInt(userStats.rows[0].total_students, 10) || 0,
        faculty: parseInt(userStats.rows[0].total_faculty, 10) || 0,
        admins: parseInt(userStats.rows[0].total_admins, 10) || 0,
        active: parseInt(userStats.rows[0].active_users, 10) || 0,
      },
      totalExams: parseInt(examStats.rows[0].total_exams, 10) || 0,
      totalAttempts: parseInt(attemptStats.rows[0].total_attempts, 10) || 0,
    };
  }

  static async getExamAnalytics(examId: string): Promise<any> {
    const examRes = await pool.query('SELECT * FROM exams WHERE id = $1', [examId]);
    if (examRes.rows.length === 0) throw new Error('Exam not found');

    const resultStats = await pool.query(
      `SELECT
        COUNT(*) as candidate_count,
        AVG(obtained_marks) as avg_score,
        MAX(obtained_marks) as max_score,
        MIN(obtained_marks) as min_score,
        AVG(percentage) as avg_percentage,
        COUNT(*) FILTER (WHERE is_passed = true) as pass_count
       FROM exam_results WHERE exam_id = $1`,
      [examId]
    );

    const totalAssignedRes = await pool.query(
      'SELECT COUNT(*) as count FROM exam_assignments WHERE exam_id = $1',
      [examId]
    );

    const totalCandidates = parseInt(resultStats.rows[0].candidate_count, 10) || 0;
    const totalAssigned = parseInt(totalAssignedRes.rows[0].count, 10) || totalCandidates;
    const passCount = parseInt(resultStats.rows[0].pass_count, 10) || 0;

    return {
      exam: examRes.rows[0],
      analytics: {
        totalCandidates,
        completionRate: totalAssigned > 0 ? Math.round((totalCandidates / totalAssigned) * 100) : 100,
        avgScore: Math.round((parseFloat(resultStats.rows[0].avg_score) || 0) * 100) / 100,
        maxScore: parseFloat(resultStats.rows[0].max_score) || 0,
        minScore: parseFloat(resultStats.rows[0].min_score) || 0,
        avgPercentage: Math.round((parseFloat(resultStats.rows[0].avg_percentage) || 0) * 10) / 10,
        passRate: totalCandidates > 0 ? Math.round((passCount / totalCandidates) * 100) : 0,
      },
    };
  }
}
