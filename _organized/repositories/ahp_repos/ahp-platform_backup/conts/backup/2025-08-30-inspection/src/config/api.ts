// API 설정 - 백엔드 서버 URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://ahp-forpaper.onrender.com');

// 데이터 저장 모드 설정
export const DATA_STORAGE_MODE = process.env.REACT_APP_DATA_MODE || 
  (process.env.NODE_ENV === 'production' ? 'offline' : 'hybrid');

// 오프라인 모드에서의 동기화 간격 (ms)
export const SYNC_INTERVAL = 5 * 60 * 1000; // 5분

// API 타임아웃 설정
export const API_TIMEOUT = 30000; // 30초

// 재시도 설정
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1초
  backoffMultiplier: 2
};

// API 엔드포인트
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify'
  },
  // Projects
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    GET: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`
  },
  // Criteria
  CRITERIA: {
    LIST: (projectId: string) => `/api/projects/${projectId}/criteria`,
    CREATE: '/api/criteria',
    UPDATE: (id: string) => `/api/criteria/${id}`,
    DELETE: (id: string) => `/api/criteria/${id}`
  },
  // Alternatives
  ALTERNATIVES: {
    LIST: (projectId: string) => `/api/projects/${projectId}/alternatives`,
    CREATE: '/api/alternatives',
    UPDATE: (id: string) => `/api/alternatives/${id}`,
    DELETE: (id: string) => `/api/alternatives/${id}`
  },
  // Evaluations
  EVALUATIONS: {
    SUBMIT: '/api/evaluate',
    GET_MATRIX: (projectId: string) => `/api/matrix/${projectId}`,
    COMPUTE: '/api/compute',
    RESULTS: (projectId: string) => `/api/results/${projectId}`
  },
  // Evaluators
  EVALUATORS: {
    LIST: (projectId: string) => `/api/projects/${projectId}/evaluators`,
    ADD: '/api/evaluators',
    UPDATE: (id: string) => `/api/evaluators/${id}`,
    REMOVE: (id: string) => `/api/evaluators/${id}`,
    SEND_INVITATIONS: (projectId: string) => `/api/projects/${projectId}/invitations`
  },
  // Comparisons
  COMPARISONS: {
    SAVE: '/api/comparisons',
    GET: (projectId: string, evaluatorId?: string) => 
      `/api/projects/${projectId}/comparisons${evaluatorId ? `?evaluatorId=${evaluatorId}` : ''}`,
    UPDATE_SESSION: (projectId: string, evaluatorId: string) =>
      `/api/projects/${projectId}/evaluators/${evaluatorId}/session`
  },
  // Results
  RESULTS: {
    GET: (projectId: string) => `/api/projects/${projectId}/results`,
    INDIVIDUAL: (projectId: string, evaluatorId: string) =>
      `/api/projects/${projectId}/evaluators/${evaluatorId}/results`,
    CALCULATE_GROUP: (projectId: string) => `/api/projects/${projectId}/results/calculate`,
    SENSITIVITY: (projectId: string) => `/api/projects/${projectId}/analysis/sensitivity`
  },
  // Export
  EXPORT: {
    EXCEL: (projectId: string) => `/api/projects/${projectId}/export/excel`,
    PDF: (projectId: string) => `/api/projects/${projectId}/export/pdf`,
    REPORT: (projectId: string) => `/api/projects/${projectId}/export/report`
  },
  // Sync (for offline mode)
  SYNC: {
    UPLOAD: '/api/sync/upload',
    DOWNLOAD: '/api/sync/download',
    STATUS: '/api/sync/status'
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