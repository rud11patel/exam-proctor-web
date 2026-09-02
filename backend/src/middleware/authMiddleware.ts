import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRepository } from '../repositories/userRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { UserDbModel, UserRole } from '../types/index';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserDbModel;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponseBuilder.error(res, 'Authentication token required', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      return ApiResponseBuilder.error(res, 'User session invalid or expired', 'UNAUTHORIZED', 401);
    }

    if (user.status !== 'ACTIVE') {
      return ApiResponseBuilder.error(
        res,
        'Your account has been deactivated. Please contact an administrator.',
        'ACCOUNT_INACTIVE',
        403
      );
    }

    req.user = user;
    next();
  } catch (error: any) {
    return ApiResponseBuilder.error(
      res,
      'Invalid or expired authentication token',
      'UNAUTHORIZED',
      401
    );
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponseBuilder.error(res, 'Unauthenticated user', 'UNAUTHORIZED', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponseBuilder.error(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        'FORBIDDEN',
        403
      );
    }

    next();
  };
}
