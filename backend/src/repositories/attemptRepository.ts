import { pool } from '../config/database';
import { QuestionRepository } from './questionRepository';

export interface ExamAttemptDb {
  id: string;
  exam_id: string;
  student_id: string;
  attempt_number: number;
  started_at: Date;
  server_end_time: Date;
  submitted_at?: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'TERMINATED';
  total_score: number;
  percentage: number;
  is_passed: boolean;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
}

export class AttemptRepository {
  static async startAttempt(examId: string, studentId: string): Promise<ExamAttemptDb> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Verify exam existence & status
      const examRes = await client.query('SELECT * FROM exams WHERE id = $1', [examId]);
      if (examRes.rows.length === 0) throw new Error('Exam not found');
      const exam = examRes.rows[0];

      // 2. Check if student already has an active attempt or has reached maximum attempts
      const allAttemptsRes = await client.query<ExamAttemptDb>(
        'SELECT * FROM exam_attempts WHERE exam_id = $1 AND student_id = $2 ORDER BY attempt_number ASC',
        [examId, studentId]
      );

      const activeAttempt = allAttemptsRes.rows.find((a) => a.status === 'IN_PROGRESS');
      if (activeAttempt) {
        await client.query('COMMIT');
        return activeAttempt; // Resume active in-progress attempt
      }

      const totalAttemptsStarted = allAttemptsRes.rows.length;
      if (totalAttemptsStarted >= exam.maximum_attempts) {
        throw new Error('Maximum attempt limit reached for this examination');
      }

      // 3. Create new attempt with authoritative server_end_time
      const nextAttemptNum = totalAttemptsStarted + 1;
      const attemptRes = await client.query<ExamAttemptDb>(
        `INSERT INTO exam_attempts (exam_id, student_id, attempt_number, started_at, server_end_time, status)
         VALUES ($1, $2, $3, NOW(), NOW() + ($4 || ' minutes')::interval, 'IN_PROGRESS')
         RETURNING *`,
        [examId, studentId, nextAttemptNum, exam.duration]
      );

      await client.query('COMMIT');
      return attemptRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAttemptById(attemptId: string): Promise<ExamAttemptDb | null> {
    const res = await pool.query<ExamAttemptDb>('SELECT * FROM exam_attempts WHERE id = $1', [attemptId]);
    return res.rows[0] || null;
  }

  static async getAttemptState(attemptId: string): Promise<any> {
    const attempt = await this.getAttemptById(attemptId);
    if (!attempt) throw new Error('Attempt not found');

    const examRes = await pool.query('SELECT * FROM exams WHERE id = $1', [attempt.exam_id]);
    const exam = examRes.rows[0];

    // Fetch sanitized questions for student
    const questions = await QuestionRepository.getSanitizedQuestionsForExam(
      attempt.exam_id,
      exam.randomize_questions,
      exam.randomize_options
    );

    // Fetch saved answers
    const answersRes = await pool.query(
      'SELECT question_id, selected_options, is_marked_for_review FROM answers WHERE attempt_id = $1',
      [attemptId]
    );

    const answersMap: Record<string, { selectedOptions: string[]; isMarkedForReview: boolean }> = {};
    answersRes.rows.forEach((a) => {
      answersMap[a.question_id] = {
        selectedOptions: a.selected_options || [],
        isMarkedForReview: a.is_marked_for_review || false,
      };
    });

    const now = new Date();
    const serverEndTime = new Date(attempt.server_end_time);
    const remainingSeconds = Math.max(0, Math.floor((serverEndTime.getTime() - now.getTime()) / 1000));

    return {
      attempt,
      exam: {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        maximumMarks: exam.maximum_marks,
        negativeMarking: exam.negative_marking,
      },
      remainingSeconds,
      questions,
      answers: answersMap,
    };
  }

  static async saveAnswer(
    attemptId: string,
    questionId: string,
    selectedOptions: string[],
    isMarkedForReview: boolean
  ): Promise<boolean> {
    const attempt = await this.getAttemptById(attemptId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      throw new Error('Cannot update answers for an inactive or submitted attempt');
    }

    const now = new Date();
    if (new Date(attempt.server_end_time) < now) {
      await pool.query("UPDATE exam_attempts SET status = 'EXPIRED' WHERE id = $1", [attemptId]);
      throw new Error('Examination time window has expired');
    }

    await pool.query(
      `INSERT INTO answers (attempt_id, question_id, selected_options, is_marked_for_review, answered_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET selected_options = $3, is_marked_for_review = $4, answered_at = NOW()`,
      [attemptId, questionId, JSON.stringify(selectedOptions), isMarkedForReview]
    );

    return true;
  }

  static async submitAttempt(attemptId: string, studentId: string): Promise<ExamAttemptDb> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const attemptRes = await client.query<ExamAttemptDb>(
        'SELECT * FROM exam_attempts WHERE id = $1 AND student_id = $2 FOR UPDATE',
        [attemptId, studentId]
      );

      if (attemptRes.rows.length === 0) throw new Error('Attempt not found');
      const attempt = attemptRes.rows[0];

      if (attempt.status === 'SUBMITTED') {
        await client.query('COMMIT');
        return attempt; // Prevent duplicate evaluation
      }

      const examRes = await client.query('SELECT * FROM exams WHERE id = $1', [attempt.exam_id]);
      const exam = examRes.rows[0];

      // Fetch questions & correct option IDs
      const qRes = await client.query(
        `SELECT q.id, q.marks, qo.id as correct_option_id
         FROM questions q
         JOIN exam_questions eq ON q.id = eq.question_id
         JOIN question_options qo ON q.id = qo.question_id
         WHERE eq.exam_id = $1 AND qo.is_correct = true`,
        [attempt.exam_id]
      );

      const correctOptionsMap: Record<string, string[]> = {};
      const marksMap: Record<string, number> = {};
      qRes.rows.forEach((r) => {
        if (!correctOptionsMap[r.id]) correctOptionsMap[r.id] = [];
        correctOptionsMap[r.id].push(r.correct_option_id);
        marksMap[r.id] = parseFloat(r.marks);
      });

      // Fetch student saved answers
      const ansRes = await client.query(
        'SELECT question_id, selected_options FROM answers WHERE attempt_id = $1',
        [attemptId]
      );
      const studentAnswersMap: Record<string, string[]> = {};
      ansRes.rows.forEach((a) => {
        studentAnswersMap[a.question_id] = a.selected_options || [];
      });

      let totalScore = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      let unansweredCount = 0;

      const questionIds = Object.keys(marksMap);
      for (const qId of questionIds) {
        const studentSel = studentAnswersMap[qId] || [];
        const correctSel = correctOptionsMap[qId] || [];

        if (studentSel.length === 0) {
          unansweredCount++;
        } else {
          const isCorrect =
            studentSel.length === correctSel.length &&
            studentSel.every((optId) => correctSel.includes(optId));

          if (isCorrect) {
            correctCount++;
            totalScore += marksMap[qId];
          } else {
            incorrectCount++;
            totalScore -= parseFloat(exam.negative_marking || 0);
          }
        }
      }

      totalScore = Math.max(0, totalScore);
      const maxMarks = parseFloat(exam.maximum_marks) || 100;
      const percentage = Math.round((totalScore / maxMarks) * 100 * 100) / 100;
      const isPassed = totalScore >= parseFloat(exam.passing_marks);

      const updatedRes = await client.query<ExamAttemptDb>(
        `UPDATE exam_attempts
         SET status = 'SUBMITTED',
             submitted_at = NOW(),
             total_score = $1,
             percentage = $2,
             is_passed = $3,
             correct_count = $4,
             incorrect_count = $5,
             unanswered_count = $6,
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [totalScore, percentage, isPassed, correctCount, incorrectCount, unansweredCount, attemptId]
      );

      // Sync into exam_results table
      await client.query(
        `INSERT INTO exam_results (
          attempt_id, exam_id, student_id, total_marks, obtained_marks,
          percentage, correct_count, incorrect_count, unanswered_count,
          is_passed, published_status, calculated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (attempt_id)
        DO UPDATE SET
          obtained_marks = $5,
          percentage = $6,
          correct_count = $7,
          incorrect_count = $8,
          unanswered_count = $9,
          is_passed = $10,
          calculated_at = NOW()`,
        [
          attemptId,
          attempt.exam_id,
          studentId,
          maxMarks,
          totalScore,
          percentage,
          correctCount,
          incorrectCount,
          unansweredCount,
          isPassed,
          exam.results_published ?? true,
        ]
      );

      await client.query('COMMIT');
      return updatedRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
