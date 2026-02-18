// API 설정 - 실제 작동하는 Django 백엔드 URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ahp-django-backend.onrender.com';

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

// API 엔드포인트 - 백엔드 실제 라우팅 기반 (검증 완료: 2026-02-18)
// 백엔드 등록 앱: accounts, projects, evaluations, analysis, subscriptions
// 미구현 앱 (TODO): exports, workshops, payments
export const API_ENDPOINTS = {
  // Auth - JWT + dj_rest_auth
  AUTH: {
    LOGIN: '/api/service/auth/login/',
    REGISTER: '/api/service/accounts/register/',
    LOGOUT: '/api/service/accounts/logout/',
    ME: '/api/service/accounts/dashboard/',
    PROFILE: '/api/service/accounts/dashboard/',
    REFRESH: '/api/service/auth/token/refresh/',
    TOKEN: '/api/service/auth/token/',
    VERIFY: '/api/service/auth/token/verify/',
  },
  // Projects - 확인된 경로: /api/service/projects/projects/
  PROJECTS: {
    LIST: '/api/service/projects/projects/',
    CREATE: '/api/service/projects/projects/',
    GET: (id: string) => `/api/service/projects/projects/${id}/`,
    UPDATE: (id: string) => `/api/service/projects/projects/${id}/`,
    DELETE: (id: string) => `/api/service/projects/projects/${id}/`
  },
  // Criteria - /api/service/projects/ 아래
  CRITERIA: {
    LIST: (projectId: string) => `/api/service/projects/projects/${projectId}/criteria/`,
    CREATE: (projectId: string) => `/api/service/projects/projects/${projectId}/add_criteria/`,
    UPDATE: (id: string) => `/api/service/projects/criteria/${id}/`,
    DELETE: (id: string) => `/api/service/projects/criteria/${id}/`
  },
  // Alternatives - Criteria 모델의 type='alternative' 필터링으로 구현됨 (확인: 2026-02-18)
  // CriteriaViewSet filterset_fields: ['project', 'type', 'parent', 'level']
  ALTERNATIVES: {
    LIST: (projectId: string) => `/api/service/projects/criteria/?project=${projectId}&type=alternative`,
    CREATE: (projectId: string) => `/api/service/projects/projects/${projectId}/add_criteria/`,
    UPDATE: (_projectId: string, id: string) => `/api/service/projects/criteria/${id}/`,
    DELETE: (_projectId: string, id: string) => `/api/service/projects/criteria/${id}/`
  },
  // Evaluations (쌍대비교 세션)
  EVALUATIONS: {
    SUBMIT: '/api/service/evaluations/comparisons/',
    GET_MATRIX: (projectId: string) => `/api/service/evaluations/comparisons/?project=${projectId}`,
    COMPUTE: '/api/service/analysis/calculate/individual/',
    RESULTS: (projectId: string) => `/api/service/analysis/analysis/?project=${projectId}`
  },
  // Evaluators - 초대장(invitations)을 통해 평가자 관리
  EVALUATORS: {
    LIST: (projectId: string) => `/api/service/evaluations/invitations/?project=${projectId}`,
    ADD: '/api/service/evaluations/invitations/',
    UPDATE: (id: string) => `/api/service/evaluations/invitations/${id}/`,
    REMOVE: (id: string) => `/api/service/evaluations/invitations/${id}/`,
    SEND_INVITATIONS: (_projectId: string) => `/api/service/evaluations/invitations/`
  },
  // Comparisons - 쌍대비교 데이터
  COMPARISONS: {
    SAVE: '/api/service/evaluations/comparisons/',
    GET: (projectId: string, evaluatorId?: string) =>
      `/api/service/evaluations/comparisons/?project=${projectId}${evaluatorId ? `&evaluator=${evaluatorId}` : ''}`,
    UPDATE_SESSION: (_projectId: string, evaluatorId: string) =>
      `/api/service/evaluations/progress/?evaluator=${evaluatorId}`
  },
  // Results - analysis 앱
  RESULTS: {
    GET: (projectId: string) => `/api/service/analysis/analysis/?project=${projectId}`,
    INDIVIDUAL: (projectId: string, evaluatorId: string) =>
      `/api/service/analysis/calculate/individual/`,
    CALCULATE_GROUP: (_projectId: string) => `/api/service/analysis/calculate/group/`,
    SENSITIVITY: (_projectId: string) => `/api/service/analysis/sensitivity/`
  },
  // Surveys - demographic-surveys (evaluations 앱)
  SURVEYS: {
    LIST: (projectId: string) => `/api/service/evaluations/demographic-surveys/?project=${projectId}`,
    CREATE: '/api/service/evaluations/demographic-surveys/',
    GET: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/`,
    UPDATE: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/`,
    DELETE: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/`,
    STATUS: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/status/`,
    RESPONSES: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/responses/`,
    ANALYTICS: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/analytics/`,
    SUBMIT_RESPONSE: (surveyId: string) => `/api/service/evaluations/demographic-surveys/${surveyId}/submit/`
  },
  // Export - TODO: 백엔드 exports 앱 미등록 (simple_urls.py에 추가 필요)
  EXPORT: {
    EXCEL: (projectId: string) => `/api/service/exports/excel/?project=${projectId}`,
    PDF: (projectId: string) => `/api/service/exports/pdf/?project=${projectId}`,
    REPORT: (projectId: string) => `/api/service/exports/report/?project=${projectId}`
  },
  // Invitations - evaluations 앱 내 invitations ViewSet
  INVITATIONS: {
    LIST: '/api/service/evaluations/invitations/',
    CREATE: '/api/service/evaluations/invitations/',
    BULK: '/api/service/evaluations/bulk-invitations/',
    VERIFY_TOKEN: '/api/service/evaluations/invitations/verify_token/',
    GET: (id: string) => `/api/service/evaluations/invitations/${id}/`,
    ACCEPT: (id: string) => `/api/service/evaluations/invitations/${id}/accept/`,
    DECLINE: (id: string) => `/api/service/evaluations/invitations/${id}/decline/`,
    RESEND: (id: string) => `/api/service/evaluations/invitations/${id}/resend/`,
    REVOKE: (id: string) => `/api/service/evaluations/invitations/${id}/revoke/`,
    REGENERATE: (id: string) => `/api/service/evaluations/invitations/${id}/regenerate_token/`
  },
  // Payment / Subscription - subscriptions 앱 (payments는 미구현)
  PAYMENT: {
    PLANS: '/api/service/subscriptions/plans/',
    CHECKOUT: '/api/service/subscriptions/checkout/',
    SUBSCRIPTION: '/api/service/subscriptions/subscription/',
    CANCEL: '/api/service/subscriptions/subscription/cancel/',
    UPGRADE: '/api/service/subscriptions/subscription/upgrade/',
    DOWNGRADE: '/api/service/subscriptions/subscription/downgrade/',
    PAYMENT_METHODS: '/api/service/subscriptions/methods/',
    INVOICES: '/api/service/subscriptions/invoices/',
    WEBHOOK: '/api/service/subscriptions/webhook/',
  },
  // Workshops - TODO: 백엔드 workshops 앱 미등록 (simple_urls.py에 추가 필요)
  WORKSHOPS: {
    LIST: '/api/service/workshops/',
    CREATE: '/api/service/workshops/',
    GET: (id: string) => `/api/service/workshops/${id}/`,
    UPDATE: (id: string) => `/api/service/workshops/${id}/`,
    DELETE: (id: string) => `/api/service/workshops/${id}/`,
    PARTICIPANTS: (id: string) => `/api/service/workshops/${id}/participants/`,
    START: (id: string) => `/api/service/workshops/${id}/start/`,
    COMPLETE: (id: string) => `/api/service/workshops/${id}/complete/`,
    CANCEL: (id: string) => `/api/service/workshops/${id}/cancel/`,
  },
  // Service Status
  STATUS: '/health/',
  DATA: '/db-status/',
  // System Reset (super admin only)
  SYSTEM: {
    RESET: '/api/service/admin/system/reset/'
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