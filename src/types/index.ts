// =============================================================================
// AHP Enterprise Platform - Core Type Definitions (3차 개발)
// =============================================================================

// 사용자 타입 (확장)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // computed property for display
  fullName?: string;
  role: 'admin' | 'manager' | 'evaluator' | 'viewer';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// 프로젝트 타입 (확장)
export interface Project {
  id: string;
  name: string; // project name
  title: string;
  description: string;
  goal: string;
  status: 'draft' | 'active' | 'completed' | 'archived' | 'pending';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  criteria: Criteria[];
  alternatives: Alternative[];
  evaluators: string[];
  settings: ProjectSettings;
}

// 프로젝트 설정
export interface ProjectSettings {
  allowInconsistency: boolean;
  maxConsistencyRatio: number;
  enableSensitivityAnalysis: boolean;
  enableGroupDecision: boolean;
}

// 기준 타입 (확장 - Criterion -> Criteria로 통일)
export interface Criteria {
  id: string;
  name: string;
  description?: string;
  level: number;
  parentId?: string;
  children?: Criteria[];
  weight?: number;
  isLeaf: boolean;
}

// 대안 타입 (확장)
export interface Alternative {
  id: string;
  name: string;
  description?: string;
  scores?: Record<string, number>; // criteriaId -> score
  finalScore?: number;
  rank?: number;
}

// 쌍대비교 매트릭스 (새로운 구조)
export interface ComparisonMatrix {
  id: string;
  projectId: string;
  type: 'criteria' | 'alternatives';
  parentCriteriaId?: string;
  matrix: number[][];
  size: number;
  consistencyRatio: number;
  isConsistent: boolean;
  evaluatorId: string;
  createdAt: string;
  updatedAt: string;
}

// 개별 쌍대비교 (기존 유지하되 확장)
export interface Comparison {
  id: string;
  matrixId: string;
  itemAId: string;
  itemBId: string;
  value: number; // 1/9 ~ 9
  confidence?: number; // 0-1
}

// AHP 결과 (새로운 구조)
export interface AHPResults {
  projectId: string;
  calculatedAt: string;
  criteriaWeights: Record<string, number>;
  alternativeScores: Record<string, number>;
  finalRanking: AlternativeRanking[];
  consistencyAnalysis: ConsistencyAnalysis;
  sensitivityAnalysis?: SensitivityAnalysis[];
}

export interface AlternativeRanking {
  alternativeId: string;
  name: string;
  score: number;
  rank: number;
  confidenceInterval?: [number, number];
}

export interface ConsistencyAnalysis {
  criteriaConsistency: number;
  alternativeConsistencies: Record<string, number>;
  overallConsistency: boolean;
  warnings: string[];
}

export interface SensitivityAnalysis {
  criteriaId: string;
  criteriaName: string;
  variations: Array<{
    weightChange: number;
    newRanking: string[];
    rankingChanged: boolean;
  }>;
}

// API 응답 타입 (확장)
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  totalPages: number;
  currentPage: number;
  next?: string;
  previous?: string;
}

// 인증 관련 타입
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface AuthToken {
  access: string;
  refresh: string;
  expiresAt: string;
}

// 세션 타입 (확장)
export interface Session {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  expiresAt?: string;
}

// UI 상태 타입
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  details?: any;
}

export interface UIState {
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// AHP 계산 관련 타입
export interface MatrixValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  consistencyRatio: number;
}

export interface WeightCalculation {
  weights: number[];
  eigenVector: number[];
  maxEigenValue: number;
  consistencyIndex: number;
  consistencyRatio: number;
  iterations?: number;
}

// 내보내기 관련 타입
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv' | 'json';
  includeCharts: boolean;
  includeSensitivity: boolean;
  includeConsistency: boolean;
  language: 'ko' | 'en';
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}