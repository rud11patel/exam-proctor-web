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
        studentId: u.studentId || u.student_id || u.rollNumber || 'STU-000001',
        department: u.department,
        university: u.university,
        institution: u.university,
      }));
    }

    if (res.error) {
      throw new Error(res.error.message || 'Unable to load students. Please try again.');
    }

    return [];
  },
};
