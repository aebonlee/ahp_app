// API 설정 - Django 백엔드 서버 URL (Render.com 백엔드)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://ahp-django-backend.onrender.com');

// 데이터 저장 모드 설정
export const DATA_STORAGE_MODE = process.env.REACT_APP_DATA_MODE || 
  (process.env.NODE_ENV === 'production' ? 'offline' : 'hybrid');

// 오프라인 모드에서의 동기화 간격 (ms)
export const SYNC_INTERVAL = 5 * 60 * 1000; // 5분

// API 타임아웃 설정
export const API_TIMEOUT = 30000; // 30초

// 재시도 설정
export const RETRY_config = {
  maxRetries: 3,
  retryDelay: 1000, // 1초
  backoffMultiplier: 2
};

// API 엔드포인트 - 실제 Django 백엔드 구조에 맞춰 수정
export const API_ENDPOINTS = {
  // Auth - JWT 토큰 기반 인증
  AUTH: {
    LOGIN: '/api/service/auth/token/',
    REGISTER: '/api/service/accounts/register/',
    LOGOUT: '/api/service/accounts/logout/',
    VERIFY: '/api/service/auth/token/verify/',
    REFRESH: '/api/service/auth/token/refresh/'
  },
  // Projects - 실제 Django Service API
  PROJECTS: {
    LIST: '/api/service/projects/',
    CREATE: '/api/service/projects/',
    GET: (id: string) => `/api/service/projects/${id}/`,
    UPDATE: (id: string) => `/api/service/projects/${id}/`,
    DELETE: (id: string) => `/api/service/projects/${id}/`
  },
  // Criteria - 실제 Django Service API
  CRITERIA: {
    LIST: (projectId: string) => `/api/service/criteria/?project=${projectId}`,
    CREATE: '/api/service/criteria/',
    UPDATE: (id: string) => `/api/service/criteria/${id}/`,
    DELETE: (id: string) => `/api/service/criteria/${id}/`
  },
  // Alternatives
  ALTERNATIVES: {
    LIST: (projectId: string) => `/api/service/criteria/?project=${projectId}&type=alternative`,
    CREATE: '/api/service/criteria/',
    UPDATE: (id: string) => `/api/service/criteria/${id}/`,
    DELETE: (id: string) => `/api/service/criteria/${id}/`
  },
  // Evaluations
  EVALUATIONS: {
    SUBMIT: '/api/service/comparisons/',
    GET_MATRIX: (projectId: string) => `/api/service/comparisons/?project=${projectId}`,
    COMPUTE: '/api/service/results/',
    RESULTS: (projectId: string) => `/api/service/results/?project=${projectId}`
  },
  // Evaluators
  EVALUATORS: {
    LIST: (projectId: string) => `/api/service/evaluators/?project=${projectId}`,
    ADD: '/api/service/evaluators/',
    UPDATE: (id: string) => `/api/service/evaluators/${id}/`,
    REMOVE: (id: string) => `/api/service/evaluators/${id}/`,
    SEND_INVITATIONS: (projectId: string) => `/api/service/evaluators/invite/`
  },
  // Comparisons
  COMPARISONS: {
    SAVE: '/api/service/comparisons/',
    GET: (projectId: string, evaluatorId?: string) => 
      `/api/service/comparisons/?project=${projectId}${evaluatorId ? `&evaluator=${evaluatorId}` : ''}`,
    UPDATE_SESSION: (projectId: string, evaluatorId: string) =>
      `/api/service/comparisons/${evaluatorId}/progress/`
  },
  // Results
  RESULTS: {
    GET: (projectId: string) => `/api/service/results/${projectId}/`,
    INDIVIDUAL: (projectId: string, evaluatorId: string) =>
      `/api/service/results/individual/?project=${projectId}&evaluator=${evaluatorId}`,
    CALCULATE_GROUP: (projectId: string) => `/api/service/results/group/`,
    SENSITIVITY: (projectId: string) => `/api/service/results/sensitivity/?project=${projectId}`
  },
  // Export
  EXPORT: {
    EXCEL: (projectId: string) => `/api/service/export/excel/?project=${projectId}`,
    PDF: (projectId: string) => `/api/service/export/pdf/?project=${projectId}`,
    REPORT: (projectId: string) => `/api/service/export/report/?project=${projectId}`
  },
  // Service Status
  STATUS: '/api/service/status/',
  DATA: '/api/service/data/'
};

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  UNAUTHORIZED: '인증이 필요합니다. 다시 로그인해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.'
} as const;