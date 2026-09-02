import { Request, Response } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { UserStatus } from '../types/index';

export async function getProfile(req: Request, res: Response) {
  const user = req.user!;
  const profile = await UserRepository.getUserProfile(user.id);
  return ApiResponseBuilder.success(res, { user: profile });
}

export async function updateProfile(req: Request, res: Response) {
  const user = req.user!;
  const { name, department, course, role, status } = req.body;

  // SECURITY RULE: Users cannot modify their own role or status via profile update
  if (role || status) {
    return ApiResponseBuilder.error(
      res,
      'Modifying user role or account status is forbidden',
      'FORBIDDEN_FIELD',
      400
    );
  }

  const updated = await UserRepository.updateUserProfile(user.id, {
    name,
    department,
    course,
  });

  return ApiResponseBuilder.success(res, { user: updated });
}

export async function getAdminUsers(req: Request, res: Response) {
  const { query, role } = req.query;

  const users = await UserRepository.getAllUsersWithProfiles(
    query as string,
    role as string
  );

  const sanitized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    rollNumber: u.roll_number,
    department: u.department,
    course: u.course,
    createdAt: u.created_at,
  }));

  return ApiResponseBuilder.success(res, { users: sanitized });
}

export async function updateUserStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== 'ACTIVE' && status !== 'INACTIVE')) {
    return ApiResponseBuilder.error(res, 'Status must be ACTIVE or INACTIVE', 'VALIDATION_ERROR', 400);
  }

  const updated = await UserRepository.updateUserStatus(id, status as UserStatus);

  return ApiResponseBuilder.success(res, {
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status,
    },
  });
}
