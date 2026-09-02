export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    HEALTH: '/health',
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    EXAMS: '/exams',
    QUESTIONS: '/questions',
  },
};
