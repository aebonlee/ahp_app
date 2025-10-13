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
    [key: string]: any;
  };
}

export interface EvaluatorInvitation {
  id: string;
  surveyId: string;
  invitationToken: string; // 고유 초대 토큰
  evaluatorEmail?: string; // 이메일로 초대한 경우
  
  // 상태 추적
  status: 'pending' | 'started' | 'completed' | 'expired';
  invitedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // 응답 데이터 참조
  responseId?: string;
  
  // 리마인더 정보
  reminderSentAt?: Date;
  reminderCount: number;
}

// Survey Builder에서 사용하는 임시 상태
export interface SurveyBuilderState {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  isPreview: boolean;
  currentEditingQuestion?: string;
}

// 설문조사 통계 및 분석
export interface SurveyAnalytics {
  surveyId: string;
  
  // 기본 통계
  totalInvitations: number;
  responseRate: number; // 응답률 (%)
  completionRate: number; // 완료율 (%)
  averageTime: number; // 평균 완료 시간
  
  // 시간대별 분석
  dailyResponses: Array<{
    date: string;
    responses: number;
    completions: number;
  }>;
  
  // 질문별 분석
  questionAnalytics: Array<{
    questionId: string;
    question: string;
    type: string;
    responses: number;
    skipRate: number;
    
    // 선택형 질문의 경우
    optionStats?: Array<{
      option: string;
      count: number;
      percentage: number;
    }>;
    
    // 텍스트 질문의 경우
    textStats?: {
      averageLength: number;
      commonWords: string[];
    };
  }>;
  
  // 인구통계학적 분석
  demographicStats?: {
    ageDistribution: Record<string, number>;
    genderDistribution: Record<string, number>;
    educationDistribution: Record<string, number>;
    occupationDistribution: Record<string, number>;
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

export interface CreateSurveyResponse {
  survey: Survey;
  evaluatorLink: string;
  qrCode?: string; // QR 코드 이미지 URL
}

export interface SurveyListResponse {
  surveys: Survey[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SurveyResponsesResponse {
  responses: SurveyResponse[];
  analytics: SurveyAnalytics;
  total: number;
  page: number;
  pageSize: number;
}

// 평가자용 설문조사 페이지 데이터
export interface EvaluatorSurveyData {
  survey: Pick<Survey, 'id' | 'title' | 'description' | 'questions'>;
  invitation: EvaluatorInvitation;
  isValidLink: boolean;
  isExpired: boolean;
  alreadyCompleted: boolean;
}

// 설문조사 공유 옵션
export interface SurveyShareOptions {
  generateQR: boolean;
  sendEmail: boolean;
  emailList?: string[];
  customMessage?: string;
  reminderSchedule?: {
    enabled: boolean;
    intervals: number[]; // 일 단위 [1, 3, 7]
  };
}