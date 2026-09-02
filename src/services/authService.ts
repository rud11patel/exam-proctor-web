import { User, UserRole } from '@/types';
import { ApiClient } from './apiClient';

const SESSION_KEY = 'proctorai_session_user';

// Default mock users for offline fallback if backend server is unreachable
const MOCK_USERS: Record<string, User> = {
  student: {
    id: 'user-student-1',
    name: 'Alex Rivera',
    email: 'student@university.edu',
    role: 'student',
    studentId: 'CS2026-089',
    institution: 'State Technological University',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
  },
  faculty: {
    id: 'user-faculty-1',
    name: 'Prof. David Miller',
    email: 'professor@university.edu',
    role: 'faculty',
    department: 'Computer Science & AI',
    institution: 'State Technological University',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date().toISOString(),
  },
  admin: {
    id: 'user-admin-1',
    name: 'Institutional Admin',
    email: 'admin@university.edu',
    role: 'admin',
    department: 'Examination Controller Office',
    institution: 'State Technological University',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: new Date().toISOString(),
  },
};

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const token = ApiClient.getToken();
    if (!token) {
      // Offline local session check
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
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

    // Token expired or invalid
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
      // If backend network error, fallback to client session for offline demo
      if (res.error.code === 'NETWORK_ERROR') {
        const mockUser = MOCK_USERS[role] || {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role,
          institution: 'State Technological University',
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
        return mockUser;
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
        const mockUser: User = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role,
          institution: data.institution || 'State Technological University',
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
        return mockUser;
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
