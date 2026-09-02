import { Question, QuestionFilter } from '@/types';
import { ApiClient } from './apiClient';

export const questionService = {
  async getQuestions(filter?: QuestionFilter): Promise<Question[]> {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.subject) params.append('subject', filter.subject);
    if (filter?.difficulty) params.append('difficulty', filter.difficulty);
    if (filter?.type) params.append('type', filter.type);

    const res = await ApiClient.request<{ questions: any[] }>(`/questions?${params.toString()}`);
    if (res.success && res.data?.questions) {
      return res.data.questions.map((q) => ({
        id: q.id,
        text: q.question_text,
        type: q.question_type === 'MCQ_SINGLE' ? 'mcq-single' : q.question_type === 'MCQ_MULTIPLE' ? 'mcq-multiple' : 'true-false',
        subject: q.subject,
        topic: q.topic || 'General',
        difficulty: q.difficulty.toLowerCase(),
        marks: parseFloat(q.marks),
        explanation: q.explanation,
        options: (q.options || []).map((o: any) => ({
          id: o.id,
          text: o.option_text,
          isCorrect: !!o.is_correct,
        })),
        createdAt: q.created_at,
      }));
    }
    return [];
  },

  async createQuestion(data: Omit<Question, 'id' | 'createdAt'>): Promise<Question> {
    const res = await ApiClient.request<{ question: any }>('/questions', {
      method: 'POST',
      body: JSON.stringify({
        questionText: data.text,
        questionType: data.type === 'mcq-single' ? 'MCQ_SINGLE' : data.type === 'mcq-multiple' ? 'MCQ_MULTIPLE' : 'TRUE_FALSE',
        subject: data.subject,
        topic: data.topic,
        difficulty: data.difficulty.toUpperCase(),
        marks: data.marks,
        explanation: data.explanation,
        options: data.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      }),
    });

    if (res.success && res.data?.question) {
      const q = res.data.question;
      return {
        id: q.id,
        text: q.question_text,
        type: data.type,
        subject: q.subject,
        topic: q.topic || 'General',
        difficulty: data.difficulty,
        marks: parseFloat(q.marks),
        options: (q.options || []).map((o: any) => ({
          id: o.id,
          text: o.option_text,
          isCorrect: !!o.is_correct,
        })),
        createdAt: q.created_at,
      };
    }

    throw new Error(res.error?.message || 'Failed to create question');
  },

  async deleteQuestion(id: string): Promise<void> {
    await ApiClient.request(`/questions/${id}`, { method: 'DELETE' });
  },
};
