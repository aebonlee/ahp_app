export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'evaluator';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'completed';
  evaluation_mode: 'practical' | 'theoretical' | 'direct_input';
  workflow_stage: 'creating' | 'waiting' | 'evaluating' | 'completed';
  admin_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Criterion {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  parent_id?: number;
  level: number;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface Alternative {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectEvaluator {
  id: number;
  project_id: number;
  evaluator_id: number;
  assigned_at: Date;
}

export interface PairwiseComparison {
  id: number;
  project_id: number;
  evaluator_id: number;
  criterion_id?: number;
  element1_id: number;
  element2_id: number;
  element1_type: 'criterion' | 'alternative';
  element2_type: 'criterion' | 'alternative';
  comparison_value: number;
  created_at: Date;
  updated_at: Date;
}

export interface Result {
  id: number;
  project_id: number;
  evaluator_id?: number;
  criterion_id?: number;
  element_id: number;
  element_type: 'criterion' | 'alternative';
  local_weight: number;
  global_weight?: number;
  consistency_ratio?: number;
  calculation_type: 'individual' | 'group';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'evaluator';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  evaluation_mode?: 'practical' | 'theoretical' | 'direct_input';
}

export interface CreateCriterionRequest {
  name: string;
  description?: string;
  parent_id?: number;
}

export interface CreateAlternativeRequest {
  name: string;
  description?: string;
}

export interface PairwiseComparisonRequest {
  criterion_id?: number;
  element1_id: number;
  element2_id: number;
  element1_type: 'criterion' | 'alternative';
  element2_type: 'criterion' | 'alternative';
  comparison_value: number;
}

// 평가 방식 관련 타입 정의
export type EvaluationMode = 'practical' | 'theoretical' | 'direct_input';
export type WorkflowStage = 'creating' | 'waiting' | 'evaluating' | 'completed';

export interface EvaluationModeConfig {
  mode: EvaluationMode;
  name: string;
  description: string;
  features: string[];
  suitable_for: string[];
}

export interface WorkflowStageInfo {
  stage: WorkflowStage;
  name: string;
  description: string;
  available_actions: string[];
  next_stages: WorkflowStage[];
}

export interface DirectInputData {
  id: number;
  project_id: number;
  evaluator_id: number;
  criterion_id?: number;
  element_id: number;
  element_type: 'criterion' | 'alternative';
  input_value: number;
  input_method: 'weight' | 'score' | 'rating';
  created_at: Date;
  updated_at: Date;
}