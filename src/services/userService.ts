import { User } from '@/types';
import { ApiClient } from './apiClient';

export const userService = {
  async getStudents(): Promise<User[]> {
    const res = await ApiClient.request<{ users: any[] }>('/users/students');
    if (res.success && res.data?.users) {
      return res.data.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: 'student',
        studentId: u.studentId || u.rollNumber || 'CS2026-089',
        department: u.department,
      }));
    }
    return [];
  },
};
