/**
 * AHP 플랫폼 핵심 타입 정의
 * 모든 컴포넌트에서 사용할 표준화된 타입
 */

// ==================== 기본 타입 ====================

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== 사용자 관련 ====================

export type UserRole = 'super_admin' | 'service_admin' | 'service_user' | 'evaluator';

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
}

// ==================== 프로젝트 관련 ====================

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  ownerId: string;
  status: ProjectStatus;
  evaluationMethod: EvaluationMethod;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  tags?: string[];
}

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';
export type EvaluationMethod = 'hierarchical' | 'traditional' | 'direct' | 'fuzzy';

// ==================== 기준 (Criteria) 관련 ====================

export interface Criterion extends BaseEntity {
  projectId: string;
  name: string;
  description?: string;
  parentId?: string | null;  // 표준화: parentId 사용 (parent_id 아님)
  level: number;
  order: number;
  weight?: number;
  localWeight?: number;
  globalWeight?: number;
  children?: Criterion[];
  isLeaf?: boolean;
}

export interface CriterionHierarchy {
  root: Criterion[];
  flatten: Criterion[];
  levels: Map<number, Criterion[]>;
  parentChildMap: Map<string, Criterion[]>;
}

// ==================== 대안 (Alternative) 관련 ====================

export interface Alternative extends BaseEntity {
  projectId: string;
  name: string;
  description?: string;
  order: number;
  score?: number;
  rank?: number;
  metadata?: Record<string, any>;
}

// ==================== 평가자 관련 ====================

export interface Evaluator extends BaseEntity {
  projectId: string;
  userId?: string;
  name: string;
  email: string;
  role: EvaluatorRole;
  status: EvaluatorStatus;
  invitationCode?: string;
  invitationToken?: string;
  invitedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  progress: number;
}

export type EvaluatorRole = 'expert' | 'stakeholder' | 'participant';
export type EvaluatorStatus = 'invited' | 'accepted' | 'in_progress' | 'completed' | 'expired';

// ==================== 평가 관련 ====================

export interface Evaluation extends BaseEntity {
  projectId: string;
  evaluatorId: string;
  type: EvaluationType;
  status: EvaluationStatus;
  startedAt?: string;
  completedAt?: string;
  consistencyRatio?: number;
  data: EvaluationData;
}

export type EvaluationType = 'criteria' | 'alternatives' | 'hierarchical';
export type EvaluationStatus = 'not_started' | 'in_progress' | 'completed' | 'validated';

export interface EvaluationData {
  comparisons?: ComparisonMatrix;
  weights?: WeightMatrix;
  steps?: EvaluationStep[];
  metadata?: Record<string, any>;
}

// ==================== 비교 행렬 관련 ====================

export interface ComparisonMatrix {
  size: number;
  matrix: number[][];
  rowLabels: string[];
  columnLabels: string[];
  consistencyRatio?: number;
  eigenVector?: number[];
  lambdaMax?: number;
}

export interface WeightMatrix {
  criteriaWeights: Record<string, number>;
  alternativeScores: Record<string, number>;
  globalWeights?: Record<string, number>;
}

// ==================== 평가 단계 관련 ====================

export interface EvaluationStep {
  id: string;
  type: 'criteria' | 'alternatives';
  level: number;
  parentId?: string;
  parentName?: string;
  items: (Criterion | Alternative)[];
  completed: boolean;
  matrix?: ComparisonMatrix;
  weights?: Record<string, number>;
  consistencyRatio?: number;
  timestamp?: string;
}

// ==================== 쌍대비교 관련 ====================

export interface PairwiseComparison {
  id: string;
  leftItemId: string;
  rightItemId: string;
  leftItemName: string;
  rightItemName: string;
  value: number;  // -9 to 9 (negative favors left, positive favors right)
  intensity: number;  // 1 to 9
  direction: 'left' | 'equal' | 'right';
  confidence?: number;  // 0 to 1
  comment?: string;
}

// ==================== 결과 분석 관련 ====================

export interface AnalysisResult extends BaseEntity {
  projectId: string;
  type: AnalysisType;
  timestamp: string;
  data: AnalysisData;
  summary: AnalysisSummary;
}

export type AnalysisType = 'final' | 'sensitivity' | 'group' | 'scenario';

export interface AnalysisData {
  rankings: AlternativeRanking[];
  weights: WeightMatrix;
  consistencyMetrics: ConsistencyMetrics;
  participantStats?: ParticipantStatistics;
  sensitivityData?: SensitivityAnalysis;
}

export interface AlternativeRanking {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number;
  confidence?: number;
}

export interface ConsistencyMetrics {
  overallCR: number;
  criteriaCR: Record<string, number>;
  evaluatorCR: Record<string, number>;
  isConsistent: boolean;
}

export interface ParticipantStatistics {
  totalInvited: number;
  totalCompleted: number;
  completionRate: number;
  averageTime: number;
  consensusLevel: number;
}

export interface SensitivityAnalysis {
  criticalCriteria: string[];
  stabilityIndex: number;
  rankReversal: boolean;
  thresholds: Record<string, number>;
}

export interface AnalysisSummary {
  topAlternative: string;
  topScore: number;
  consistencyStatus: 'excellent' | 'good' | 'acceptable' | 'poor';
  participationRate: number;
  confidence: 'high' | 'medium' | 'low';
  recommendations?: string[];
}

// ==================== 세션 관련 ====================

export interface Session extends BaseEntity {
  userId?: string;
  evaluatorId?: string;
  token: string;
  type: SessionType;
  expiresAt: string;
  lastActivity: string;
  metadata?: Record<string, any>;
}

export type SessionType = 'user' | 'evaluator' | 'anonymous' | 'temporary';

// ==================== API 응답 관련 ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ==================== 폼 관련 ====================

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'checkbox' | 'radio';
  value: T;
  options?: Array<{ label: string; value: T }>;
  validation?: ValidationRule[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

// ==================== 알림 관련 ====================

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'invitation' 
  | 'reminder' 
  | 'completion' 
  | 'deadline' 
  | 'result' 
  | 'system';

// ==================== 구독/결제 관련 ====================

export interface Subscription extends BaseEntity {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  features: SubscriptionFeatures;
}

export type SubscriptionPlan = 'free' | 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired';

export interface SubscriptionFeatures {
  maxProjects: number;
  maxEvaluators: number;
  maxCriteria: number;
  maxAlternatives: number;
  advancedAnalysis: boolean;
  exportFeatures: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

// ==================== 유틸리티 타입 ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type AsyncState<T> = {
  loading: boolean;
  data?: T;
  error?: Error;
};

// ==================== 내보내기 ====================

export default {
  // Re-export all types for convenience
};