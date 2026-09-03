import { ExamResult } from '@/types';
import { ApiClient } from './apiClient';

export const resultService = {
  async getStudentResults(): Promise<ExamResult[]> {
    const res = await ApiClient.request<{ results: any[] }>('/results/student/results');
    if (res.success && res.data?.results) {
      return res.data.results.map((r) => ({
        id: r.attempt_id || r.id || r.exam_id,
        attemptId: r.attempt_id,
        examId: r.exam_id,
        examTitle: r.exam_title,
        examSubject: r.exam_subject || 'General',
        studentId: r.student_id,
        studentName: r.student_name,
        totalScore: parseFloat(r.best_score ?? r.obtained_marks ?? 0),
        maxScore: parseFloat(r.maximum_marks ?? r.total_marks ?? 100),
        percentage: parseFloat(r.percentage ?? 0),
        isPassed: !!r.is_passed,
        passingMarks: r.passing_marks ? parseFloat(r.passing_marks) : 40,
        duration: r.duration,
        correctAnswers: r.correct_count ?? 0,
        incorrectAnswers: r.incorrect_count ?? 0,
        unanswered: r.unanswered_count ?? 0,
        proctoringScore: 100,
        proctoringFlagsCount: 0,
        submittedAt: r.submitted_at || r.calculated_at,
        attemptNumber: r.best_attempt_number ?? 1,
        totalAttempts: r.total_attempts_count ?? 1,
        maxAttempts: r.maximum_attempts ?? 1,
        remainingAttempts: r.remaining_attempts ?? 0,
      }));
    }
    return [];
  },

  async getAttemptResult(attemptId: string): Promise<ExamResult | null> {
    const res = await ApiClient.request<{ attempt: any; exam: any }>(`/attempts/${attemptId}`);
    if (res.success && res.data?.attempt) {
      const att = res.data.attempt;
      const exam = res.data.exam;
      return {
        id: `res-${att.id}`,
        attemptId: att.id,
        examId: att.exam_id,
        examTitle: exam.title,
        examSubject: exam.subject,
        studentId: att.student_id,
        totalScore: parseFloat(att.total_score || 0),
        maxScore: parseFloat(exam.maximumMarks || exam.maximum_marks || 100),
        percentage: parseFloat(att.percentage || 0),
        isPassed: !!att.is_passed,
        passingMarks: parseFloat(exam.passingMarks || exam.passing_marks || 40),
        duration: exam.duration,
        correctAnswers: att.correct_count || 0,
        incorrectAnswers: att.incorrect_count || 0,
        unanswered: att.unanswered_count || 0,
        proctoringScore: 100,
        proctoringFlagsCount: 0,
        submittedAt: att.submitted_at || new Date().toISOString(),
        attemptNumber: att.attempt_number || 1,
      };
    }
    return null;
  },

  async getStudentExamAttempts(examId: string): Promise<any[]> {
    const res = await ApiClient.request<{ attempts: any[] }>(`/results/student/exams/${examId}/attempts`);
    if (res.success && res.data?.attempts) {
      return res.data.attempts;
    }
    return [];
  },

  async getFacultyExamResults(examId: string): Promise<any[]> {
    const res = await ApiClient.request<{ results: any[] }>(`/results/faculty/exams/${examId}/results`);
    if (res.success && res.data?.results) {
      return res.data.results;
    }
    return [];
  },

  async toggleResultRelease(examId: string, published: boolean): Promise<void> {
    await ApiClient.request(`/results/faculty/exams/${examId}/publish-results`, {
      method: 'PATCH',
      body: JSON.stringify({ published }),
    });
  },
};
