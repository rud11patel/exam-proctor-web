import { Request, Response, NextFunction } from 'express';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { env } from '../config/env';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected internal error occurred';

  // Do not expose stack traces or internal DB details in production
  const details = env.NODE_ENV === 'development' ? err.stack : undefined;

  return ApiResponseBuilder.error(res, message, code, statusCode, details);
}
