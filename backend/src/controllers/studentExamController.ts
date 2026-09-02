import { Request, Response } from 'express';
import { ExamRepository } from '../repositories/examRepository';
import { AttemptRepository } from '../repositories/attemptRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';

export async function getStudentExams(req: Request, res: Response) {
  const studentId = req.user!.id;
  const exams = await ExamRepository.getExamsForStudent(studentId);
  return ApiResponseBuilder.success(res, { exams });
}

export async function getStudentExamDetail(req: Request, res: Response) {
  const { id } = req.params;
  const exam = await ExamRepository.getExamById(id);

  if (!exam) {
    return ApiResponseBuilder.error(res, 'Exam not found', 'NOT_FOUND', 404);
  }

  return ApiResponseBuilder.success(res, { exam });
}

export async function startAttempt(req: Request, res: Response) {
  const { id: examId } = req.params;
  const studentId = req.user!.id;

  try {
    const attempt = await AttemptRepository.startAttempt(examId, studentId);
    return ApiResponseBuilder.success(res, { attempt });
  } catch (error: any) {
    return ApiResponseBuilder.error(res, error.message || 'Failed to start exam attempt', 'ATTEMPT_ERROR', 400);
  }
}

export async function getAttemptState(req: Request, res: Response) {
  const { id: attemptId } = req.params;
  const user = req.user!;

  try {
    const attempt = await AttemptRepository.getAttemptById(attemptId);
    if (!attempt) {
      return ApiResponseBuilder.error(res, 'Attempt not found', 'NOT_FOUND', 404);
    }

    // CANDIDATE OWNERSHIP SECURITY RULE:
    // Students can ONLY access their OWN attempt. Faculty/Admin can view any attempt.
    if (user.role === 'STUDENT' && attempt.student_id !== user.id) {
      return ApiResponseBuilder.error(res, 'You are not authorized to view this exam attempt', 'FORBIDDEN', 403);
    }

    const state = await AttemptRepository.getAttemptState(attemptId);
    return ApiResponseBuilder.success(res, state);
  } catch (error: any) {
    return ApiResponseBuilder.error(res, error.message || 'Failed to retrieve attempt state', 'ATTEMPT_ERROR', 400);
  }
}

export async function saveAnswer(req: Request, res: Response) {
  const { id: attemptId } = req.params;
  const { questionId, selectedOptions, isMarkedForReview } = req.body;
  const user = req.user!;

  if (!questionId) {
    return ApiResponseBuilder.error(res, 'questionId is required', 'VALIDATION_ERROR', 400);
  }

  try {
    const attempt = await AttemptRepository.getAttemptById(attemptId);
    if (!attempt) {
      return ApiResponseBuilder.error(res, 'Attempt not found', 'NOT_FOUND', 404);
    }

    // CANDIDATE OWNERSHIP SECURITY RULE:
    if (user.role === 'STUDENT' && attempt.student_id !== user.id) {
      return ApiResponseBuilder.error(res, 'You are not authorized to modify this exam attempt', 'FORBIDDEN', 403);
    }

    await AttemptRepository.saveAnswer(attemptId, questionId, selectedOptions || [], !!isMarkedForReview);
    return ApiResponseBuilder.success(res, { message: 'Answer saved' });
  } catch (error: any) {
    return ApiResponseBuilder.error(res, error.message || 'Failed to auto-save answer', 'SAVE_ERROR', 400);
  }
}

export async function submitAttempt(req: Request, res: Response) {
  const { id: attemptId } = req.params;
  const studentId = req.user!.id;

  try {
    const attempt = await AttemptRepository.getAttemptById(attemptId);
    if (!attempt) {
      return ApiResponseBuilder.error(res, 'Attempt not found', 'NOT_FOUND', 404);
    }

    // CANDIDATE OWNERSHIP SECURITY RULE:
    if (req.user!.role === 'STUDENT' && attempt.student_id !== studentId) {
      return ApiResponseBuilder.error(res, 'You are not authorized to submit this exam attempt', 'FORBIDDEN', 403);
    }

    const result = await AttemptRepository.submitAttempt(attemptId, studentId);
    return ApiResponseBuilder.success(res, { result });
  } catch (error: any) {
    return ApiResponseBuilder.error(res, error.message || 'Failed to submit exam attempt', 'SUBMISSION_ERROR', 400);
  }
}
