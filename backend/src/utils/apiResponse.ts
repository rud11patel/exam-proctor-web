import { Response } from 'express';
import { ApiResponse } from '../types/index';

export class ApiResponseBuilder {
  static success<T>(res: Response, data: T, statusCode: number = 200) {
    const payload: ApiResponse<T> = {
      success: true,
      data,
    };
    return res.status(statusCode).json(payload);
  }

  static error(res: Response, message: string, code: string = 'BAD_REQUEST', statusCode: number = 400, details?: any) {
    const payload: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
    return res.status(statusCode).json(payload);
  }
}
