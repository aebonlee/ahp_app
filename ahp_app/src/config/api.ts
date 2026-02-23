// API 설정 - 실제 작동하는 Django 백엔드 URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ahp-django-backend.onrender.com';

// 슈퍼 관리자 이메일 - 환경변수 우선, 기본값 fallback
// NOTE: 클라이언트 측 admin 판별은 UI 표시용이며, 실제 권한은 서버에서 검증
export const SUPER_ADMIN_EMAIL = process.env.REACT_APP_SUPER_ADMIN_EMAIL || 'admin@ahp.com';

// 데이터 저장 모드 설정 - Django 백엔드 연동
export const DATA_STORAGE_MODE = process.env.REACT_APP_DATA_MODE || 
  (process.env.NODE_ENV === 'production' ? 'online' : 'hybrid');

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
    LOGIN: '/api/service/auth/token/',          // JWT 토큰 발급 (simplejwt)
    REGISTER: '/api/service/auth/register/',
    LOGOUT: '/api/service/auth/logout/',
    ME: '/api/service/accounts/me/',             // 실제 존재하는 엔드포인트
    PROFILE: '/api/service/accounts/me/',        // GET/PATCH 모두 지원
    REFRESH: '/api/service/auth/token/refresh/'
  },
  // Projects - Django 백엔드 실제 경로 (URL 중복 제거)
  PROJECTS: {
    LIST: '/api/service/projects/projects/',
    CREATE: '/api/service/projects/projects/',
    GET: (id: string) => `/api/service/projects/projects/${id}/`,
    UPDATE: (id: string) => `/api/service/projects/projects/${id}/`,
    DELETE: (id: string) => `/api/service/projects/projects/${id}/`
  },
  // Criteria - CriteriaViewSet: /projects/criteria/ with ?project= filter
  CRITERIA: {
    LIST: (projectId: string) => `/api/service/projects/criteria/?project=${projectId}`,
    CREATE: '/api/service/projects/criteria/',
    UPDATE: (id: string) => `/api/service/projects/criteria/${id}/`,
    DELETE: (id: string) => `/api/service/projects/criteria/${id}/`
  },
  // Alternatives - criteria에서 type=alternative 로 구분
  ALTERNATIVES: {
    LIST: (projectId: string) => `/api/service/projects/criteria/?project=${projectId}&type=alternative`,
    CREATE: '/api/service/projects/criteria/',
    UPDATE: (id: string) => `/api/service/projects/criteria/${id}/`,
    DELETE: (id: string) => `/api/service/projects/criteria/${id}/`
  },
  // Evaluations
  EVALUATIONS: {
    SUBMIT: '/api/service/evaluations/comparisons/',
    GET_MATRIX: (projectId: string) => `/api/service/evaluations/comparisons/?project=${projectId}`,
    COMPUTE: '/api/service/analysis/calculate/individual/',
    RESULTS: (projectId: string) => `/api/service/analysis/project-summary/?project_id=${projectId}`
  },
  // Evaluators - EvaluationInvitationViewSet: /evaluations/invitations/
  EVALUATORS: {
    LIST: (projectId: string) => `/api/service/evaluations/invitations/?project=${projectId}`,
    ADD: '/api/service/evaluations/invitations/',
    UPDATE: (id: string) => `/api/service/evaluations/invitations/${id}/`,
    REMOVE: (id: string) => `/api/service/evaluations/invitations/${id}/`,
    SEND_INVITATIONS: (projectId: string) => `/api/service/evaluations/bulk-invitations/`
  },
  // Comparisons - PairwiseComparisonViewSet: /evaluations/comparisons/
  COMPARISONS: {
    SAVE: '/api/service/evaluations/comparisons/',
    GET: (projectId: string, evaluatorId?: string) =>
      `/api/service/evaluations/comparisons/?project=${projectId}${evaluatorId ? `&evaluator=${evaluatorId}` : ''}`,
    UPDATE_SESSION: (projectId: string, evaluatorId: string) =>
      `/api/service/evaluations/progress/${evaluatorId}/`
  },
  // Results - AnalysisViewSet custom endpoints
  RESULTS: {
    GET: (projectId: string) => `/api/service/analysis/project-summary/?project_id=${projectId}`,
    INDIVIDUAL: (projectId: string, evaluatorId: string) =>
      `/api/service/analysis/calculate/individual/`,
    CALCULATE_GROUP: (projectId: string) => `/api/service/analysis/calculate/group/`,
    SENSITIVITY: (projectId: string) => `/api/service/analysis/sensitivity/`
  },
  // Surveys - 설문조사 관련 API
  SURVEYS: {
    LIST: (projectId: string) => `/api/service/projects/${projectId}/surveys/`,
    CREATE: (projectId: string) => `/api/service/projects/${projectId}/surveys/`,
    GET: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/`,
    UPDATE: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/`,
    DELETE: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/`,
    STATUS: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/status/`,
    RESPONSES: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/responses/`,
    ANALYTICS: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/analytics/`,
    SUBMIT_RESPONSE: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/submit/`
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