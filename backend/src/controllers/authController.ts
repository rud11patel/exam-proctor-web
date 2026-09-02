import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository';
import { generateToken } from '../utils/jwt';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { UserRole } from '../types/index';

export async function register(req: Request, res: Response) {
  const { name, email, password, role, rollNumber, department, course } = req.body;

  if (!name || !email || !password) {
    return ApiResponseBuilder.error(res, 'Name, email, and password are required', 'VALIDATION_ERROR', 400);
  }

  const normalizedRole: UserRole = role ? (role.toUpperCase() as UserRole) : 'STUDENT';

  // SECURITY RULE: Public registration MUST NOT allow ADMIN creation
  if (normalizedRole === 'ADMIN') {
    return ApiResponseBuilder.error(
      res,
      'Public registration for ADMIN role is strictly forbidden',
      'FORBIDDEN_ROLE',
      400
    );
  }

  const existingUser = await UserRepository.findByEmail(email);
  if (existingUser) {
    return ApiResponseBuilder.error(res, 'An account with this email address already exists', 'DUPLICATE_EMAIL', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userProfile = await UserRepository.createUserWithProfile({
    name,
    email,
    passwordHash,
    role: normalizedRole,
    rollNumber,
    department,
    course,
  });

  const token = generateToken({
    userId: userProfile.id,
    email: userProfile.email,
    role: userProfile.role,
  });

  return ApiResponseBuilder.success(
    res,
    {
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        status: userProfile.status,
        rollNumber: userProfile.roll_number,
        department: userProfile.department,
        course: userProfile.course,
      },
      token,
    },
    201
  );
}

export async function login(req: Request, res: Response) {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return ApiResponseBuilder.error(res, 'Email and password are required', 'VALIDATION_ERROR', 400);
  }

  const user = await UserRepository.findByEmail(email);
  if (!user) {
    return ApiResponseBuilder.error(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    return ApiResponseBuilder.error(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  if (user.status !== 'ACTIVE') {
    return ApiResponseBuilder.error(
      res,
      'Your account has been deactivated. Please contact an administrator.',
      'ACCOUNT_INACTIVE',
      403
    );
  }

  // If specific role requested, verify role match
  if (role && user.role !== role.toUpperCase()) {
    return ApiResponseBuilder.error(
      res,
      `Account exists but is registered as ${user.role}, not ${role.toUpperCase()}`,
      'ROLE_MISMATCH',
      403
    );
  }

  const profile = await UserRepository.getUserProfile(user.id);
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return ApiResponseBuilder.success(res, {
    user: {
      id: profile!.id,
      name: profile!.name,
      email: profile!.email,
      role: profile!.role,
      status: profile!.status,
      rollNumber: profile!.roll_number,
      department: profile!.department,
      course: profile!.course,
    },
    token,
  });
}

export async function logout(req: Request, res: Response) {
  return ApiResponseBuilder.success(res, { message: 'Logged out successfully' });
}

export async function getCurrentUser(req: Request, res: Response) {
  const user = req.user!;
  const profile = await UserRepository.getUserProfile(user.id);

  return ApiResponseBuilder.success(res, {
    user: {
      id: profile!.id,
      name: profile!.name,
      email: profile!.email,
      role: profile!.role,
      status: profile!.status,
      rollNumber: profile!.roll_number,
      department: profile!.department,
      course: profile!.course,
    },
  });
}
