import { Request, Response } from 'express';
import { QuestionRepository } from '../repositories/questionRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';

export async function createQuestion(req: Request, res: Response) {
  const { questionText, questionType, subject, topic, difficulty, marks, explanation, imageUrl, options } = req.body;

  if (!questionText || !subject || !options || !Array.isArray(options) || options.length < 2) {
    return ApiResponseBuilder.error(res, 'Question text, subject, and at least 2 options are required', 'VALIDATION_ERROR', 400);
  }

  const created = await QuestionRepository.createQuestion({
    questionText,
    questionType: questionType || 'MCQ_SINGLE',
    subject,
    topic,
    difficulty: difficulty ? difficulty.toUpperCase() : 'MEDIUM',
    marks: marks ? parseFloat(marks) : 1,
    explanation,
    imageUrl,
    createdBy: req.user?.id,
    options,
  });

  return ApiResponseBuilder.success(res, { question: created }, 201);
}

export async function getQuestions(req: Request, res: Response) {
  const { search, subject, difficulty, type } = req.query;

  const questions = await QuestionRepository.getQuestions({
    search: search as string,
    subject: subject as string,
    difficulty: difficulty as string,
    type: type as string,
  });

  return ApiResponseBuilder.success(res, { questions });
}

export async function getQuestionById(req: Request, res: Response) {
  const { id } = req.params;
  const question = await QuestionRepository.getQuestionById(id);

  if (!question) {
    return ApiResponseBuilder.error(res, 'Question not found', 'NOT_FOUND', 404);
  }

  return ApiResponseBuilder.success(res, { question });
}

export async function deleteQuestion(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await QuestionRepository.deleteQuestion(id);

  if (!deleted) {
    return ApiResponseBuilder.error(res, 'Question not found', 'NOT_FOUND', 404);
  }

  return ApiResponseBuilder.success(res, { message: 'Question deleted successfully' });
}
