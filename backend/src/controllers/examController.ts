import { Request, Response } from 'express';
import { ExamRepository } from '../repositories/examRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';

export async function createExam(req: Request, res: Response) {
  const {
    title,
    description,
    subject,
    duration,
    maximumMarks,
    passingMarks,
    negativeMarking,
    randomizeQuestions,
    randomizeOptions,
    maximumAttempts,
    questionIds,
    studentIds,
  } = req.body;

  if (!title || !subject || !duration || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    return ApiResponseBuilder.error(res, 'Title, subject, duration, and at least 1 question are required', 'VALIDATION_ERROR', 400);
  }

  const exam = await ExamRepository.createExam({
    title,
    description,
    subject,
    duration: parseInt(duration, 10),
    maximumMarks: maximumMarks ? parseFloat(maximumMarks) : 100,
    passingMarks: passingMarks ? parseFloat(passingMarks) : 40,
    negativeMarking: negativeMarking ? parseFloat(negativeMarking) : 0,
    randomizeQuestions: !!randomizeQuestions,
    randomizeOptions: !!randomizeOptions,
    maximumAttempts: maximumAttempts ? parseInt(maximumAttempts, 10) : 1,
    createdBy: req.user?.id,
    questionIds,
    studentIds,
  });

  return ApiResponseBuilder.success(res, { exam }, 201);
}

export async function getFacultyExams(req: Request, res: Response) {
  const exams = await ExamRepository.getExamsForFaculty(req.user?.id);
  return ApiResponseBuilder.success(res, { exams });
}

export async function getExamById(req: Request, res: Response) {
  const { id } = req.params;
  const exam = await ExamRepository.getExamById(id);

  if (!exam) {
    return ApiResponseBuilder.error(res, 'Exam not found', 'NOT_FOUND', 404);
  }

  return ApiResponseBuilder.success(res, { exam });
}

export async function deleteExam(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await ExamRepository.deleteExam(id);

  if (!deleted) {
    return ApiResponseBuilder.error(res, 'Exam not found', 'NOT_FOUND', 404);
  }

  return ApiResponseBuilder.success(res, { message: 'Exam deleted successfully' });
}
