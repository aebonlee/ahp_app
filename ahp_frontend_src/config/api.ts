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

// API 엔드포인트 - Django REST API 구조
export const API_ENDPOINTS = {
  // Auth - Django JWT
  AUTH: {
    LOGIN: '/api/v1/auth/token/',
    REGISTER: '/api/v1/accounts/register/',
    LOGOUT: '/api/v1/auth/logout/',
    VERIFY: '/api/v1/auth/token/verify/',
    REFRESH: '/api/v1/auth/token/refresh/'
  },
  // Projects - Django ViewSet
  PROJECTS: {
    LIST: '/api/v1/projects/projects/',
    CREATE: '/api/v1/projects/projects/',
    GET: (id: string) => `/api/v1/projects/projects/${id}/`,
    UPDATE: (id: string) => `/api/v1/projects/projects/${id}/`,
    DELETE: (id: string) => `/api/v1/projects/projects/${id}/`
  },
  // Criteria - Django ViewSet
  CRITERIA: {
    LIST: (projectId: string) => `/api/v1/projects/criteria/?project=${projectId}`,
    CREATE: '/api/v1/projects/criteria/',
    UPDATE: (id: string) => `/api/v1/projects/criteria/${id}/`,
    DELETE: (id: string) => `/api/v1/projects/criteria/${id}/`
  },
  // Alternatives (같은 Criteria 모델 사용, type=alternative)
  ALTERNATIVES: {
    LIST: (projectId: string) => `/api/v1/projects/criteria/?project=${projectId}&type=alternative`,
    CREATE: '/api/v1/projects/criteria/',
    UPDATE: (id: string) => `/api/v1/projects/criteria/${id}/`,
    DELETE: (id: string) => `/api/v1/projects/criteria/${id}/`
  },
  // Evaluations - Django ViewSet
  EVALUATIONS: {
    SUBMIT: '/api/v1/evaluations/evaluations/',
    GET_MATRIX: (projectId: string) => `/api/v1/evaluations/evaluations/?project=${projectId}`,
    COMPUTE: '/api/v1/analysis/calculate/',
    RESULTS: (projectId: string) => `/api/v1/analysis/results/?project=${projectId}`
  },
  // Evaluators - Django ViewSet
  EVALUATORS: {
    LIST: (projectId: string) => `/api/v1/evaluations/invitations/?project=${projectId}`,
    ADD: '/api/v1/evaluations/invitations/',
    UPDATE: (id: string) => `/api/v1/evaluations/invitations/${id}/`,
    REMOVE: (id: string) => `/api/v1/evaluations/invitations/${id}/`,
    SEND_INVITATIONS: (projectId: string) => `/api/v1/evaluations/invitations/send/`
  },
  // Comparisons - Django ViewSet
  COMPARISONS: {
    SAVE: '/api/v1/evaluations/comparisons/',
    GET: (projectId: string, evaluatorId?: string) => 
      `/api/v1/evaluations/comparisons/?evaluation__project=${projectId}${evaluatorId ? `&evaluation__evaluator=${evaluatorId}` : ''}`,
    UPDATE_SESSION: (projectId: string, evaluatorId: string) =>
      `/api/v1/evaluations/evaluations/${evaluatorId}/update_progress/`
  },
  // Results - Django ViewSet
  RESULTS: {
    GET: (projectId: string) => `/api/v1/analysis/results/${projectId}/`,
    INDIVIDUAL: (projectId: string, evaluatorId: string) =>
      `/api/v1/analysis/results/individual/?project=${projectId}&evaluator=${evaluatorId}`,
    CALCULATE_GROUP: (projectId: string) => `/api/v1/analysis/results/group/`,
    SENSITIVITY: (projectId: string) => `/api/v1/analysis/sensitivity/?project=${projectId}`
  },
  // Export - Django ViewSet
  EXPORT: {
    EXCEL: (projectId: string) => `/api/v1/analysis/export/excel/?project=${projectId}`,
    PDF: (projectId: string) => `/api/v1/analysis/export/pdf/?project=${projectId}`,
    REPORT: (projectId: string) => `/api/v1/analysis/export/report/?project=${projectId}`
  },
  // Sync (for offline mode) - Django 미지원, 향후 구현
  SYNC: {
    UPLOAD: '/api/v1/sync/upload/',
    DOWNLOAD: '/api/v1/sync/download/',
    STATUS: '/api/v1/sync/status/'
  }
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