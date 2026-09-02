import { Exam } from '@/types';
import { ApiClient } from './apiClient';

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

  async createExam(data: Omit<Exam, 'id' | 'createdAt' | 'status'>): Promise<Exam> {
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
        questionIds: data.questions.map((q) => q.id),
      }),
    });

    if (res.success && res.data?.exam) {
      return this.mapDbExamToUi(res.data.exam);
    }

    throw new Error(res.error?.message || 'Failed to create exam');
  },

  mapDbExamToUi(e: any): Exam {
    return {
      id: e.id,
      title: e.title,
      description: e.description || '',
      subject: e.subject,
      duration: e.duration,
      totalMarks: parseFloat(e.maximum_marks),
      passingMarks: parseFloat(e.passing_marks),
      negativeMarking: parseFloat(e.negative_marking),
      randomizeQuestions: e.randomize_questions,
      randomizeOptions: e.randomize_options,
      maxAttempts: e.maximum_attempts,
      status: e.status === 'PUBLISHED' || e.status === 'ACTIVE' ? 'published' : e.status === 'COMPLETED' ? 'completed' : 'draft',
      questions: [],
      assignedStudentsCount: e.assigned_count || 1,
      createdAt: e.created_at,
      schedule: {
        startTime: e.start_time || new Date().toISOString(),
        endTime: e.end_time || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      },
    };
  },
};
