import { Request, Response } from 'express';
import { ResultRepository } from '../repositories/resultRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';

export async function getStudentResults(req: Request, res: Response) {
  const studentId = req.user!.id;
  const results = await ResultRepository.getStudentResults(studentId);
  return ApiResponseBuilder.success(res, { results });
}

export async function getFacultyExamResults(req: Request, res: Response) {
  const { id: examId } = req.params;
  const results = await ResultRepository.getFacultyExamResults(examId);
  return ApiResponseBuilder.success(res, { results });
}

export async function toggleResultRelease(req: Request, res: Response) {
  const { id: examId } = req.params;
  const { published } = req.body;

  await ResultRepository.toggleResultPublication(examId, !!published);
  return ApiResponseBuilder.success(res, { message: `Results release updated to ${published}` });
}
