import { ExamResult } from '@/types';
import { ApiClient } from './apiClient';

export const resultService = {
  async getStudentResults(): Promise<ExamResult[]> {
    const res = await ApiClient.request<{ results: any[] }>('/results/student/results');
    if (res.success && res.data?.results) {
      return res.data.results.map((r) => ({
        id: r.id,
        attemptId: r.attempt_id,
        examId: r.exam_id,
        examTitle: r.exam_title,
        studentId: r.student_id,
        studentName: 'Alex Rivera',
        totalScore: parseFloat(r.obtained_marks),
        maxScore: parseFloat(r.total_marks),
        percentage: parseFloat(r.percentage),
        isPassed: !!r.is_passed,
        correctAnswers: r.correct_count,
        incorrectAnswers: r.incorrect_count,
        unanswered: r.unanswered_count,
        proctoringScore: 99,
        proctoringFlagsCount: 0,
        submittedAt: r.calculated_at,
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
        studentId: att.student_id,
        studentName: 'Alex Rivera',
        totalScore: parseFloat(att.total_score || 0),
        maxScore: parseFloat(exam.maximumMarks || 100),
        percentage: parseFloat(att.percentage || 0),
        isPassed: !!att.is_passed,
        correctAnswers: att.correct_count || 0,
        incorrectAnswers: att.incorrect_count || 0,
        unanswered: att.unanswered_count || 0,
        proctoringScore: 98,
        proctoringFlagsCount: 0,
        submittedAt: att.submitted_at || new Date().toISOString(),
      };
    }
    return null;
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
