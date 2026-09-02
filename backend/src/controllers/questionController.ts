import { Request, Response } from 'express';
import { QuestionRepository } from '../repositories/questionRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';

export async function createQuestion(req: Request, res: Response) {
  const { questionText, questionType, subject, topic, difficulty, marks, explanation, imageUrl, options } = req.body;
  const user = req.user!;

  // 1. Question text validation
  if (!questionText || typeof questionText !== 'string' || !questionText.trim()) {
    return ApiResponseBuilder.error(res, 'Question text is required', 'VALIDATION_ERROR', 400);
  }

  // 2. Subject validation
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    return ApiResponseBuilder.error(res, 'Subject is required', 'VALIDATION_ERROR', 400);
  }

  // 3. Marks validation
  const parsedMarks = parseFloat(marks);
  if (isNaN(parsedMarks) || parsedMarks <= 0) {
    return ApiResponseBuilder.error(res, 'Marks must be greater than 0', 'VALIDATION_ERROR', 400);
  }

  // 4. Options minimum count validation
  if (!options || !Array.isArray(options) || options.length < 2) {
    return ApiResponseBuilder.error(res, 'Please provide at least 2 options', 'VALIDATION_ERROR', 400);
  }

  // 5. Options non-empty text validation
  for (let i = 0; i < options.length; i++) {
    if (!options[i].text || typeof options[i].text !== 'string' || !options[i].text.trim()) {
      return ApiResponseBuilder.error(res, `All options must contain text (Option ${i + 1} is empty)`, 'VALIDATION_ERROR', 400);
    }
  }

  // 6. Exactly ONE correct option validation
  const correctCount = options.filter((o: any) => !!o.isCorrect).length;
  if (correctCount === 0) {
    return ApiResponseBuilder.error(res, 'Please select the correct answer', 'VALIDATION_ERROR', 400);
  }
  if (correctCount > 1 && (questionType === 'MCQ_SINGLE' || questionType === 'TRUE_FALSE')) {
    return ApiResponseBuilder.error(res, 'Multiple Choice questions must have exactly 1 correct answer', 'VALIDATION_ERROR', 400);
  }

  // SERVER-AUTHORITATIVE CREATED_BY (Ignore body payload createdBy)
  const created = await QuestionRepository.createQuestion({
    questionText: questionText.trim(),
    questionType: questionType || 'MCQ_SINGLE',
    subject: subject.trim(),
    topic: topic ? topic.trim() : undefined,
    difficulty: difficulty ? difficulty.toUpperCase() : 'MEDIUM',
    marks: parsedMarks,
    explanation: explanation ? explanation.trim() : undefined,
    imageUrl: imageUrl ? imageUrl.trim() : undefined,
    createdBy: user.id,
    options: options.map((o: any) => ({
      text: o.text.trim(),
      isCorrect: !!o.isCorrect,
    })),
  });

  return ApiResponseBuilder.success(res, { question: created }, 201);
}

export async function getQuestions(req: Request, res: Response) {
  const { search, subject, difficulty, type } = req.query;
  const user = req.user!;

  // FACULTY QUESTION VISIBILITY: Faculty only sees questions they created!
  const createdBy = user.role === 'FACULTY' ? user.id : undefined;

  const questions = await QuestionRepository.getQuestions({
    search: search as string,
    subject: subject as string,
    difficulty: difficulty as string,
    type: type as string,
    createdBy,
  });

  return ApiResponseBuilder.success(res, { questions });
}

export async function getQuestionById(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const question = await QuestionRepository.getQuestionById(id);

  if (!question) {
    return ApiResponseBuilder.error(res, 'Question not found', 'NOT_FOUND', 404);
  }

  // FACULTY RETRIEVAL SECURITY: Faculty can only access questions they own!
  if (user.role === 'FACULTY' && question.created_by !== user.id) {
    return ApiResponseBuilder.error(res, 'You are not authorized to access this question', 'FORBIDDEN', 403);
  }

  return ApiResponseBuilder.success(res, { question });
}

export async function deleteQuestion(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const question = await QuestionRepository.getQuestionById(id);

  if (!question) {
    return ApiResponseBuilder.error(res, 'Question not found', 'NOT_FOUND', 404);
  }

  // FACULTY DELETION OWNERSHIP: Faculty can only delete questions they created!
  if (user.role === 'FACULTY' && question.created_by !== user.id) {
    return ApiResponseBuilder.error(res, 'You are not authorized to delete this question', 'FORBIDDEN', 403);
  }

  await QuestionRepository.deleteQuestion(id);

  return ApiResponseBuilder.success(res, { message: 'Question deleted successfully' });
}
