import { Request, Response } from 'express';
import { ExamRepository } from '../repositories/examRepository';
import { QuestionRepository } from '../repositories/questionRepository';
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
  const user = req.user!;

  if (!title || !subject || !duration || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    return ApiResponseBuilder.error(res, 'Title, subject, duration, and at least 1 question are required', 'VALIDATION_ERROR', 400);
  }

  // QUESTION SELECTION OWNERSHIP CHECK:
  // Faculty users can ONLY use questions they created!
  if (user.role === 'FACULTY') {
    for (const qId of questionIds) {
      const question = await QuestionRepository.getQuestionById(qId);
      if (!question || question.created_by !== user.id) {
        return ApiResponseBuilder.error(
          res,
          `You cannot create an exam containing questions owned by another faculty member (Question ID: ${qId})`,
          'FORBIDDEN',
          403
        );
      }
    }
  }

  // SERVER-AUTHORITATIVE CREATED_BY (Ignore body payload createdBy)
  const exam = await ExamRepository.createExam({
    title: title.trim(),
    description: description ? description.trim() : undefined,
    subject: subject.trim(),
    duration: parseInt(duration, 10),
    maximumMarks: maximumMarks ? parseFloat(maximumMarks) : 100,
    passingMarks: passingMarks ? parseFloat(passingMarks) : 40,
    negativeMarking: negativeMarking ? parseFloat(negativeMarking) : 0,
    randomizeQuestions: !!randomizeQuestions,
    randomizeOptions: !!randomizeOptions,
    maximumAttempts: maximumAttempts ? parseInt(maximumAttempts, 10) : 1,
    createdBy: user.id,
    questionIds,
    studentIds,
  });

  return ApiResponseBuilder.success(res, { exam }, 201);
}

export async function getFacultyExams(req: Request, res: Response) {
  const user = req.user!;
  // FACULTY EXAM VISIBILITY: Faculty only sees exams they created!
  const facultyId = user.role === 'FACULTY' ? user.id : undefined;

  const exams = await ExamRepository.getExamsForFaculty(facultyId);
  return ApiResponseBuilder.success(res, { exams });
}

export async function getExamById(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const exam = await ExamRepository.getExamById(id);

  if (!exam) {
    return ApiResponseBuilder.error(res, 'Exam not found', 'NOT_FOUND', 404);
  }

  // FACULTY RETRIEVAL SECURITY: Faculty can only access exams they created!
  if (user.role === 'FACULTY' && exam.created_by !== user.id) {
    return ApiResponseBuilder.error(res, 'You are not authorized to access this exam', 'FORBIDDEN', 403);
  }

  return ApiResponseBuilder.success(res, { exam });
}

export async function deleteExam(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const exam = await ExamRepository.getExamById(id);

  if (!exam) {
    return ApiResponseBuilder.error(res, 'Exam not found', 'NOT_FOUND', 404);
  }

  // FACULTY DELETION OWNERSHIP: Faculty can only delete exams they created!
  if (user.role === 'FACULTY' && exam.created_by !== user.id) {
    return ApiResponseBuilder.error(res, 'You are not authorized to delete this exam', 'FORBIDDEN', 403);
  }

  await ExamRepository.deleteExam(id);

  return ApiResponseBuilder.success(res, { message: 'Exam deleted successfully' });
}
