import { Exam } from '@/types';
import { ApiClient } from './apiClient';

export interface CreateExamParams {
  title: string;
  description?: string;
  subject: string;
  duration: number;
  totalMarks?: number;
  passingMarks?: number;
  negativeMarking?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  maxAttempts?: number;
  questionIds: string[];
  studentIds?: string[];
  startTime?: string;
  endTime?: string;
}

export const examService = {
  async getFacultyExams(): Promise<Exam[]> {
    const res = await ApiClient.request<{ exams: any[] }>('/exams');
    if (res.success && res.data?.exams) {
      return res.data.exams.map(this.mapDbExamToUi);
    }
    return [];
  },

  async getStudentExams(): Promise<Exam[]> {
    const res = await ApiClient.request<{ exams: any[] }>('/student/exams');
    if (res.success && res.data?.exams) {
      return res.data.exams.map((e) => {
        const uiExam = this.mapDbExamToUi(e);
        if (e.attempt_status) {
          uiExam.status = e.attempt_status === 'SUBMITTED' ? 'completed' : e.attempt_status === 'IN_PROGRESS' ? 'active' : 'published';
        }
        return uiExam;
      });
    }
    return [];
  },

  async getExamById(id: string): Promise<Exam | null> {
    const res = await ApiClient.request<{ exam: any }>(`/exams/${id}`);
    if (res.success && res.data?.exam) {
      return this.mapDbExamToUi(res.data.exam);
    }
    return null;
  },

  async getStudentExamDetail(id: string): Promise<{ exam: Exam; stats?: any }> {
    const res = await ApiClient.request<{ exam: any; stats?: any }>(`/student/exams/${id}`);
    if (res.success && res.data?.exam) {
      const exam = this.mapDbExamToUi({
        ...res.data.exam,
        ...(res.data.stats || {}),
      });
      return { exam, stats: res.data.stats };
    }
    throw new Error(res.error?.message || 'Failed to fetch exam details');
  },

  async createExam(data: CreateExamParams): Promise<Exam> {
    const res = await ApiClient.request<{ exam: any }>('/exams', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        subject: data.subject,
        duration: data.duration,
        maximumMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        negativeMarking: data.negativeMarking,
        randomizeQuestions: data.randomizeQuestions,
        randomizeOptions: data.randomizeOptions,
        maximumAttempts: data.maxAttempts,
        questionIds: data.questionIds,
        studentIds: data.studentIds,
        startTime: data.startTime,
        endTime: data.endTime,
      }),
    });

    if (res.success && res.data?.exam) {
      return this.mapDbExamToUi(res.data.exam);
    }

    throw new Error(res.error?.message || 'Failed to create exam');
  },

  async deleteExam(examId: string): Promise<{ message: string; action?: string }> {
    const res = await ApiClient.request<{ message: string; action?: string }>(`/exams/${examId}`, {
      method: 'DELETE',
    });

    if (res.success && res.data) {
      return res.data;
    }

    throw new Error(res.error?.message || 'Failed to delete examination');
  },

  mapDbExamToUi(e: any): Exam {
    return {
      id: e.id,
      title: e.title,
      description: e.description || '',
      subject: e.subject,
      duration: e.duration,
      durationMinutes: e.duration,
      totalQuestions: e.total_questions ? parseInt(e.total_questions, 10) : 0,
      totalMarks: parseFloat(e.maximum_marks || e.totalMarks || 100),
      passingMarks: parseFloat(e.passing_marks || e.passingMarks || 40),
      negativeMarking: parseFloat(e.negative_marking || e.negativeMarking || 0),
      randomizeQuestions: !!e.randomize_questions,
      randomizeOptions: !!e.randomize_options,
      maxAttempts: parseInt(e.maximum_attempts || e.maxAttempts || 1, 10),
      attemptCount: e.attempt_count !== undefined ? parseInt(e.attempt_count, 10) : undefined,
      completedCount: e.completed_count !== undefined ? parseInt(e.completed_count, 10) : undefined,
      remainingAttempts: e.remaining_attempts !== undefined ? parseInt(e.remaining_attempts, 10) : undefined,
      inProgressAttemptId: e.in_progress_attempt_id || e.activeAttemptId || null,
      bestScore: e.best_score !== undefined && e.best_score !== null ? parseFloat(e.best_score) : null,
      status: e.status === 'PUBLISHED' || e.status === 'ACTIVE' ? 'published' : e.status === 'COMPLETED' ? 'completed' : 'draft',
      questionIds: [],
      assignedStudentIds: [],
      isPublished: true,
      resultsPublished: !!e.results_published,
      assignedStudentsCount: e.assigned_count || 1,
      createdBy: e.created_by || '',
      createdAt: e.created_at,
      startTime: e.start_time || new Date().toISOString(),
      endTime: e.end_time || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      schedule: {
        startTime: e.start_time || new Date().toISOString(),
        endTime: e.end_time || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      },
    };
  },
};
