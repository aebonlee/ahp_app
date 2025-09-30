// 사용자 역할 타입
export type UserRole = 'super_admin' | 'service_admin' | 'service_user' | 'evaluator';

// 사용자 타입
export interface User {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  department?: string;
  position?: string;
  is_verified: boolean;
  can_create_projects: boolean;
  max_projects: number;
  created_at: string;
  last_login?: string;
  profile?: UserProfile;
}

// 사용자 프로필
export interface UserProfile {
  email_notifications: boolean;
  evaluation_reminders: boolean;
  project_updates: boolean;
  language: 'ko' | 'en';
  timezone: string;
  total_evaluations: number;
  total_projects_owned: number;
  total_projects_participated: number;
}

// JWT 토큰
export interface AuthTokens {
  access: string;
  refresh: string;
}

// 로그인 응답
export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// 프로젝트 상태
export type ProjectStatus = 
  | 'setup' 
  | 'model_building' 
  | 'evaluator_assignment' 
  | 'evaluation_in_progress' 
  | 'evaluation_complete' 
  | 'results_available';

// 프로젝트 타입
export interface Project {
  id: string | number;
  title: string;
  description: string;
  objective: string;
  owner: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  criteria_count?: number;
  alternatives_count?: number;
  evaluator_count?: number;
  completion_rate?: number;
}

// 기준 타입
export interface Criteria {
  id: string | number;
  project: number;
  name: string;
  description: string;
  parent?: number;
  level: number;
  order_index: number;
  weight: number;
  local_weight: number;
  created_at: string;
}

// 대안 타입
export interface Alternative {
  id: string | number;
  project: number;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
}

// 평가자 타입
export interface Evaluator {
  id: string | number;
  project: number;
  user?: number;
  name: string;
  email: string;
  role: 'admin' | 'evaluator';
  access_key: string;
  is_invited: boolean;
  invitation_sent_at?: string;
  evaluation_started_at?: string;
  evaluation_completed_at?: string;
  progress_percentage: number;
  created_at: string;
}

// 비교 데이터 타입
export interface Comparison {
  id: string | number;
  project: number;
  evaluator: number;
  criteria: number;
  item1: number;
  item2: number;
  value: number;
  created_at: string;
  updated_at: string;
}

// 결과 타입
export interface Result {
  id: string | number;
  project: number;
  evaluator?: number;
  is_group_result: boolean;
  weights: Record<string, number>;
  rankings: Record<string, number>;
  consistency_ratio: number;
  created_at: string;
  updated_at: string;
}

// 프로젝트 데이터 타입 (확장된 버전)
export interface ProjectData {
  id?: string;
  title: string;
  description: string;
  objective?: string;
  status: 'draft' | 'active' | 'completed' | 'deleted';
  evaluation_mode: 'practical' | 'theoretical' | 'direct_input' | 'fuzzy_ahp';
  evaluation_method?: 'pairwise' | 'direct' | 'mixed';
  workflow_stage: 'creating' | 'waiting' | 'evaluating' | 'completed';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  criteria_count?: number;
  alternatives_count?: number;
  owner?: string;
  ownerEmail?: string;
  evaluatorCount?: number;
  completionRate?: number;
  dueDate?: string;
  settings?: any;
}

// 사용자 프로젝트 타입 (UI용 확장)
export interface UserProject extends Omit<ProjectData, 'evaluation_method'> {
  evaluator_count?: number;
  completion_rate?: number;
  criteria_count: number;
  alternatives_count: number;
  last_modified: string;
  evaluation_method: 'pairwise' | 'direct' | 'mixed';
}

// API 에러 타입
export interface ApiError {
  message: string;
  details?: any;
  status?: number;
}