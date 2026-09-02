import { User, UserRole } from '@/types';
import { ApiClient } from './apiClient';

const SESSION_KEY = 'proctorai_session_user';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const token = ApiClient.getToken();
    if (!token) {
      return null;
    }

    const res = await ApiClient.request<{ user: any }>('/auth/me');
    if (res.success && res.data?.user) {
      const u = res.data.user;
      const userObj: User = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.toLowerCase() as UserRole,
        institution: 'State Technological University',
        department: u.department,
        studentId: u.rollNumber,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
      return userObj;
    }

    // Token expired or server unreachable
    ApiClient.clearToken();
    localStorage.removeItem(SESSION_KEY);
    return null;
  },

  async login(email: string, role: UserRole, password?: string): Promise<User> {
    const res = await ApiClient.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'Password@123', role }),
    });

    if (res.success && res.data) {
      ApiClient.setToken(res.data.token);
      const u = res.data.user;
      const userObj: User = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.toLowerCase() as UserRole,
        institution: 'State Technological University',
        department: u.department,
        studentId: u.rollNumber,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
      return userObj;
    }

    if (res.error) {
      if (res.error.code === 'NETWORK_ERROR') {
        throw new Error('Unable to connect to the backend server (http://localhost:5000). Please start the backend server.');
      }
      throw new Error(res.error.message);
    }

    throw new Error('Authentication failed');
  },

  async register(data: { name: string; email: string; role: 'student' | 'faculty'; password?: string; institution?: string }): Promise<User> {
    // SECURITY RULE: Public users cannot register as Admin
    if ((data.role as string) === 'admin') {
      throw new Error('Public registration for Admin role is strictly forbidden.');
    }

    const res = await ApiClient.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password || 'Password@123',
        role: data.role.toUpperCase(),
      }),
    });

    if (res.success && res.data) {
      ApiClient.setToken(res.data.token);
      const u = res.data.user;
      const userObj: User = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.toLowerCase() as UserRole,
        institution: data.institution || 'State Technological University',
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
      return userObj;
    }

    if (res.error) {
      if (res.error.code === 'NETWORK_ERROR') {
        throw new Error('Unable to connect to the backend server (http://localhost:5000). Please start the backend server.');
      }
      throw new Error(res.error.message);
    }

    throw new Error('Registration failed');
  },

  async logout(): Promise<void> {
    await ApiClient.request('/auth/logout', { method: 'POST' });
    ApiClient.clearToken();
    localStorage.removeItem(SESSION_KEY);
  },
};
