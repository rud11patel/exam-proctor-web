import { Request, Response } from 'express';
import { ApiResponseBuilder } from '../utils/apiResponse';

export function notFoundHandler(req: Request, res: Response) {
  return ApiResponseBuilder.error(
    res,
    `Cannot ${req.method} ${req.originalUrl} — Endpoint not found`,
    'NOT_FOUND',
    404
  );
}
