// ============================================================================
// Survey System Types - 인구통계학적 설문조사 및 평가자 관리 시스템
// ============================================================================

export interface SurveyQuestion {
  id: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'number' | 'date';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdBy: string; // 연구자 ID
  projectId: string; // 연관된 프로젝트 ID
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
  
  // 평가자 링크 관련
  evaluatorLink: string; // 평가자용 고유 링크
  linkExpiresAt?: Date; // 링크 만료일
  maxResponses?: number; // 최대 응답 수
  
  // 통계 정보
  totalResponses: number;
  completedResponses: number;
  averageCompletionTime?: number; // 평균 완료 시간(분)
}

export interface SurveyResponse {
  id: string; // 자동 넘버링 ID (SR-001, SR-002, ...)
  surveyId: string;
  evaluatorId?: string; // 평가자 ID (로그인한 경우)
  evaluatorToken: string; // 익명 평가자용 고유 토큰
  
  // 응답 데이터
  responses: Record<string, any>; // 질문 ID를 키로 하는 응답 데이터
  
  // 메타데이터
  startedAt: Date;
  completedAt?: Date;
  completionTime?: number; // 완료까지 걸린 시간(초)
  isCompleted: boolean;
  
  // 세션 정보
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    isMobile: boolean;
    browser: string;
    os: string;
  };
  
  // 평가자 인구통계학적 정보
  demographics?: {
    age?: string;
    gender?: string;
    education?: string;
    occupation?: string;
    experience?: string;
    [key: string]: unknown;
  };
}

// API 응답 타입들
export interface CreateSurveyRequest {
  title: string;
  description: string;
  questions: Omit<SurveyQuestion, 'id'>[];
  projectId: string;
  maxResponses?: number;
  expiresAt?: Date;
}

