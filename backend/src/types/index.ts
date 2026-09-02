export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface UserDbModel {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export interface StudentProfileDbModel {
  id: string;
  user_id: string;
  student_id?: string;
  roll_number?: string;
  department?: string;
  course?: string;
  university?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FacultyProfileDbModel {
  id: string;
  user_id: string;
  department?: string;
  university?: string;
  created_at: Date;
  updated_at: Date;
}
