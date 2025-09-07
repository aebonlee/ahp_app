// API 설정 - 프로덕션 환경만 사용
const API_BASE_URL = 'https://ahp-platform.onrender.com';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    CHECK_SESSION: '/api/auth/session',
  },
  
  // 프로젝트
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    GET: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
  },
  
  // 평가
  EVALUATION: {
    SUBMIT: '/api/evaluate',
    GET_RESULTS: (projectId: string) => `/api/results/${projectId}`,
  },
  
  // 사용자
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
  },
};