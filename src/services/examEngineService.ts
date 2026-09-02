import { Question, ExamAttempt, AnswerState } from '@/types';
import { ApiClient } from './apiClient';

const PENDING_ANSWERS_PREFIX = 'proctorai_pending_answers_';

export const examEngineService = {
  async startExamAttempt(examId: string): Promise<string> {
    const res = await ApiClient.request<{ attempt: { id: string } }>(`/student/exams/${examId}/start`, {
      method: 'POST',
    });

    if (res.success && res.data?.attempt?.id) {
      return res.data.attempt.id;
    }

    throw new Error(res.error?.message || 'Failed to start exam attempt');
  },

  async getAttemptState(attemptId: string): Promise<{
    attempt: ExamAttempt;
    remainingTimeSeconds: number;
    questions: Question[];
    answers: Record<string, AnswerState>;
  }> {
    // Flush any pending unsynchronized local answers to PostgreSQL first
    await this.flushPendingAnswers(attemptId);

    const res = await ApiClient.request<{
      attempt: any;
      exam: any;
      remainingSeconds: number;
      questions: any[];
      answers: Record<string, any>;
    }>(`/attempts/${attemptId}`);

    if (res.success && res.data) {
      const d = res.data;
      const questions: Question[] = d.questions.map((q) => ({
        id: q.id,
        text: q.question_text,
        type: q.question_type === 'MCQ_SINGLE' ? 'mcq-single' : q.question_type === 'MCQ_MULTIPLE' ? 'mcq-multiple' : 'true-false',
        subject: q.subject,
        topic: q.topic || 'General',
        difficulty: q.difficulty.toLowerCase(),
        marks: parseFloat(q.marks),
        options: (q.options || []).map((o: any) => ({
          id: o.id,
          text: o.option_text,
          isCorrect: false, // SECURITY RULE: is_correct is stripped by backend
        })),
        createdAt: new Date().toISOString(),
      }));

      const answers: Record<string, AnswerState> = {};
      Object.entries(d.answers || {}).forEach(([qId, val]: [string, any]) => {
        answers[qId] = {
          questionId: qId,
          selectedOptions: val.selectedOptions || [],
          isMarkedForReview: val.isMarkedForReview || false,
          savedAt: new Date().toISOString(),
        };
      });

      const attemptObj: ExamAttempt = {
        id: d.attempt.id,
        examId: d.attempt.exam_id,
        studentId: d.attempt.student_id,
        attemptNumber: d.attempt.attempt_number,
        startTime: d.attempt.started_at,
        status: d.attempt.status === 'SUBMITTED' ? 'submitted' : d.attempt.status === 'EXPIRED' ? 'expired' : 'in-progress',
        answers,
      };

      return {
        attempt: attemptObj,
        remainingTimeSeconds: d.remainingSeconds,
        questions,
        answers,
      };
    }

    throw new Error(res.error?.message || 'Failed to retrieve exam attempt state');
  },

  async autoSaveAnswer(
    attemptId: string,
    questionId: string,
    selectedOptions: string[],
    isMarkedForReview: boolean = false
  ): Promise<void> {
    try {
      const res = await ApiClient.request(`/attempts/${attemptId}/answers`, {
        method: 'PUT',
        body: JSON.stringify({ questionId, selectedOptions, isMarkedForReview }),
      });

      if (!res.success) {
        this.enqueuePendingAnswer(attemptId, questionId, selectedOptions, isMarkedForReview);
      } else {
        this.clearPendingAnswer(attemptId, questionId);
      }
    } catch (error) {
      this.enqueuePendingAnswer(attemptId, questionId, selectedOptions, isMarkedForReview);
    }
  },

  async submitExamAttempt(attemptId: string): Promise<any> {
    await this.flushPendingAnswers(attemptId);

    const res = await ApiClient.request<{ result: any }>(`/attempts/${attemptId}/submit`, {
      method: 'POST',
    });

    if (res.success && res.data?.result) {
      localStorage.removeItem(`${PENDING_ANSWERS_PREFIX}${attemptId}`);
      return res.data.result;
    }

    throw new Error(res.error?.message || 'Failed to submit exam attempt');
  },

  enqueuePendingAnswer(
    attemptId: string,
    questionId: string,
    selectedOptions: string[],
    isMarkedForReview: boolean
  ): void {
    const key = `${PENDING_ANSWERS_PREFIX}${attemptId}`;
    const existingStr = localStorage.getItem(key);
    const pending: Record<string, { selectedOptions: string[]; isMarkedForReview: boolean }> = existingStr
      ? JSON.parse(existingStr)
      : {};

    pending[questionId] = { selectedOptions, isMarkedForReview };
    localStorage.setItem(key, JSON.stringify(pending));
  },

  clearPendingAnswer(attemptId: string, questionId: string): void {
    const key = `${PENDING_ANSWERS_PREFIX}${attemptId}`;
    const existingStr = localStorage.getItem(key);
    if (existingStr) {
      const pending = JSON.parse(existingStr);
      delete pending[questionId];
      if (Object.keys(pending).length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(pending));
      }
    }
  },

  async flushPendingAnswers(attemptId: string): Promise<void> {
    const key = `${PENDING_ANSWERS_PREFIX}${attemptId}`;
    const existingStr = localStorage.getItem(key);
    if (!existingStr) return;

    const pending: Record<string, { selectedOptions: string[]; isMarkedForReview: boolean }> = JSON.parse(existingStr);
    const questionIds = Object.keys(pending);

    for (const qId of questionIds) {
      const item = pending[qId];
      try {
        const res = await ApiClient.request(`/attempts/${attemptId}/answers`, {
          method: 'PUT',
          body: JSON.stringify({
            questionId: qId,
            selectedOptions: item.selectedOptions,
            isMarkedForReview: item.isMarkedForReview,
          }),
        });
        if (res.success) {
          delete pending[qId];
        }
      } catch (err) {
        // Keep in queue for next sync retry
      }
    }

    if (Object.keys(pending).length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(pending));
    }
  },
};
