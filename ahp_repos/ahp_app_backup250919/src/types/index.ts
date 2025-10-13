// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'evaluator';
  createdAt: string;
}

// 프로젝트 타입
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  criteria?: Criterion[];
  alternatives?: Alternative[];
}

// 기준 타입
export interface Criterion {
  id: string;
  name: string;
  description?: string;
  weight?: number;
  parentId?: string;
  children?: Criterion[];
}

// 대안 타입
export interface Alternative {
  id: string;
  name: string;
  description?: string;
  score?: number;
}

// 평가 타입
export interface Evaluation {
  id: string;
  projectId: string;
  evaluatorId: string;
  comparisons: Comparison[];
  completedAt?: string;
  consistencyRatio?: number;
}

// 쌍대비교 타입
export interface Comparison {
  criterionId: string;
  itemA: string;
  itemB: string;
  value: number; // 1/9 ~ 9
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 세션 타입
export interface Session {
  user: User | null;
  isAuthenticated: boolean;
  expiresAt?: string;
}