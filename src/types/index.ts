export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  institution?: string;
  university?: string;
  studentId?: string;
  department?: string;
  createdAt?: string;
}

export type QuestionType = 'mcq_single' | 'mcq_multiple' | 'true_false';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswers: string[]; // option IDs
  marks: number;
  explanation?: string;
  subject: string;
  topic?: string;
  difficulty: QuestionDifficulty;
  imageUrl?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number; // e.g., 0.25 per wrong answer
  questionIds: string[];
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  maxAttempts: number;
  assignedStudentIds: string[];
  isPublished: boolean;
  resultsPublished: boolean;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  createdBy: string;
  createdAt: string;
  status?: string;
  duration?: number;
  assignedStudentsCount?: number;
  attemptCount?: number;
  completedCount?: number;
  remainingAttempts?: number;
  inProgressAttemptId?: string | null;
  bestScore?: number | null;
  schedule?: {
    startTime: string;
    endTime: string;
  };
}

export interface ExamResult {
  id: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  examSubject?: string;
  studentId: string;
  studentName?: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  passingMarks?: number;
  duration?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  unanswered?: number;
  proctoringScore?: number;
  proctoringFlagsCount?: number;
  submittedAt?: string;
  attemptNumber?: number;
  totalAttempts?: number;
  maxAttempts?: number;
  remainingAttempts?: number;
}

export interface AnswerState {
  questionId: string;
  selectedOptionIds: string[];
  isMarkedForReview: boolean;
  savedAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startTime: string;       // ISO timestamp when attempt started
  serverEndTime: number;    // timestamp in ms when attempt expires
  submittedAt: string | null;
  status: 'in_progress' | 'submitted' | 'expired';
  answers: Record<string, AnswerState>; // questionId -> AnswerState
  totalScore: number | null;
  percentage: number | null;
  isPassed: boolean | null;
  correctCount: number | null;
  incorrectCount: number | null;
  unansweredCount: number | null;
}

export interface SystemCheckStatus {
  webcam: boolean;
  microphone: boolean;
  browserLockdown: boolean;
  networkLatency: number;
  screenResolution: string;
}
