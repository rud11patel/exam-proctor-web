import { pool } from '../config/database';

export interface QuestionOptionDb {
  id: string;
  question_id: string;
  option_text: string;
  is_correct?: boolean;
}

export interface QuestionDb {
  id: string;
  question_text: string;
  question_type: 'MCQ_SINGLE' | 'MCQ_MULTIPLE' | 'TRUE_FALSE';
  subject: string;
  topic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  explanation?: string;
  image_url?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  options?: QuestionOptionDb[];
}

export class QuestionRepository {
  static async createQuestion(data: {
    questionText: string;
    questionType: 'MCQ_SINGLE' | 'MCQ_MULTIPLE' | 'TRUE_FALSE';
    subject: string;
    topic?: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    marks: number;
    explanation?: string;
    imageUrl?: string;
    createdBy?: string;
    options: { text: string; isCorrect: boolean }[];
  }): Promise<QuestionDb> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const qRes = await client.query<QuestionDb>(
        `INSERT INTO questions (question_text, question_type, subject, topic, difficulty, marks, explanation, image_url, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          data.questionText,
          data.questionType,
          data.subject,
          data.topic || null,
          data.difficulty,
          data.marks,
          data.explanation || null,
          data.imageUrl || null,
          data.createdBy || null,
        ]
      );
      const question = qRes.rows[0];

      const insertedOptions: QuestionOptionDb[] = [];
      for (const opt of data.options) {
        const optRes = await client.query<QuestionOptionDb>(
          `INSERT INTO question_options (question_id, option_text, is_correct)
           VALUES ($1, $2, $3)
           RETURNING id, question_id, option_text, is_correct`,
          [question.id, opt.text, opt.isCorrect]
        );
        insertedOptions.push(optRes.rows[0]);
      }

      await client.query('COMMIT');
      question.options = insertedOptions;
      return question;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getQuestions(filters: {
    search?: string;
    subject?: string;
    difficulty?: string;
    type?: string;
  }): Promise<QuestionDb[]> {
    let query = `SELECT * FROM questions WHERE 1=1`;
    const params: any[] = [];

    if (filters.search) {
      params.push(`%${filters.search.toLowerCase()}%`);
      query += ` AND (LOWER(question_text) LIKE $${params.length} OR LOWER(subject) LIKE $${params.length})`;
    }

    if (filters.subject && filters.subject !== 'ALL') {
      params.push(filters.subject);
      query += ` AND subject = $${params.length}`;
    }

    if (filters.difficulty && filters.difficulty !== 'ALL') {
      params.push(filters.difficulty.toUpperCase());
      query += ` AND difficulty = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const qResult = await pool.query<QuestionDb>(query, params);
    const questions = qResult.rows;

    for (const q of questions) {
      const optResult = await pool.query<QuestionOptionDb>(
        'SELECT id, question_id, option_text, is_correct FROM question_options WHERE question_id = $1',
        [q.id]
      );
      q.options = optResult.rows;
    }

    return questions;
  }

  static async getQuestionById(id: string): Promise<QuestionDb | null> {
    const qRes = await pool.query<QuestionDb>('SELECT * FROM questions WHERE id = $1', [id]);
    if (qRes.rows.length === 0) return null;

    const question = qRes.rows[0];
    const optRes = await pool.query<QuestionOptionDb>(
      'SELECT id, question_id, option_text, is_correct FROM question_options WHERE question_id = $1',
      [id]
    );
    question.options = optRes.rows;
    return question;
  }

  static async getSanitizedQuestionsForExam(examId: string, randomizeQuestions: boolean, randomizeOptions: boolean): Promise<QuestionDb[]> {
    let query = `
      SELECT q.id, q.question_text, q.question_type, q.subject, q.topic, q.difficulty, q.marks, q.image_url, eq.ordering
      FROM questions q
      JOIN exam_questions eq ON q.id = eq.question_id
      WHERE eq.exam_id = $1
    `;
    if (randomizeQuestions) {
      query += ' ORDER BY RANDOM()';
    } else {
      query += ' ORDER BY eq.ordering ASC';
    }

    const qResult = await pool.query<QuestionDb>(query, [examId]);
    const questions = qResult.rows;

    for (const q of questions) {
      let optQuery = 'SELECT id, question_id, option_text FROM question_options WHERE question_id = $1';
      if (randomizeOptions) optQuery += ' ORDER BY RANDOM()';

      // SECURITY RULE: omits `is_correct` field for student view!
      const optResult = await pool.query<QuestionOptionDb>(optQuery, [q.id]);
      q.options = optResult.rows;
    }

    return questions;
  }

  static async deleteQuestion(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
