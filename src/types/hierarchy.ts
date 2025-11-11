// 계층적 평가 시스템 타입 정의
// Opus 4.1 설계 문서 기반

export interface HierarchyNode {
  id: string;
  projectId: string;
  parentId: string | null;
  nodeType: 'goal' | 'criterion' | 'subcriterion' | 'alternative';
  level: number;
  name: string;
  description?: string;
  code?: string; // 예: C1, C1.1, C1.1.1
  position: number;
  isActive: boolean;
  localWeight?: number;
  globalWeight?: number;
  metadata: Record<string, any>;
  children?: HierarchyNode[];
  createdAt: string;
  updatedAt: string;
}

export interface HierarchicalComparison {
  id: string;
  evaluationId: string;
  nodeId: string;
  elementAId: string;
  elementBId: string;
  value: number; // 1/9 ~ 9 스케일
  isConsistent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationSession {
  id: string;
  projectId: string;
  evaluatorId: string;
  sessionType: 'individual' | 'group';
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  currentStepId: string | null;
  progress: {
    totalSteps: number;
    completedSteps: number;
    progressPercentage: number;
  };
  consistencyMetrics: {
    overallCR: number;
    nodesCR: Record<string, number>;
  };
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationStep {
  id: string;
  sessionId: string;
  nodeId: string;
  stepType: 'comparison' | 'validation' | 'review';
  stepOrder: number;
  isCompleted: boolean;
  comparisons: HierarchicalComparison[];
  localWeights: Record<string, number>;
  consistencyRatio: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ConsistencyResult {
  consistencyRatio: number;
  consistencyIndex: number;
  randomIndex: number;
  isConsistent: boolean;
  maxEigenvalue: number;
  inconsistentPairs: Array<{
    elementA: string;
    elementB: string;
    currentValue: number;
    suggestedValue: number;
    impact: number;
  }>;
}

// Power Method 계산용 인터페이스
export interface PowerMethodConfig {
  maxIterations: number;
  tolerance: number;
  convergenceThreshold: number;
}

export interface PowerMethodResult {
  weights: number[];
  eigenvalue: number;
  iterations: number;
  converged: boolean;
  error: number;
}

// 계층적 가중치 계산 결과
export interface HierarchicalWeights {
  nodeId: string;
  localWeights: Record<string, number>;
  globalWeights: Record<string, number>;
  hierarchyPath: string[];
  level: number;
}

// 실시간 진행률 추적
export interface EvaluationProgress {
  sessionId: string;
  totalNodes: number;
  completedNodes: number;
  totalComparisons: number;
  completedComparisons: number;
  averageConsistency: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
  currentStep: {
    nodeId: string;
    nodeName: string;
    stepType: string;
    progress: number;
  };
}

// WebSocket 메시지 타입
export interface HierarchyWebSocketMessage {
  type: 'evaluation_progress' | 'consistency_update' | 'step_completed' | 'session_update';
  sessionId: string;
  data: EvaluationProgress | ConsistencyResult | EvaluationStep | EvaluationSession;
  timestamp: string;
}

// API 응답 타입
export interface HierarchyAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    totalCount?: number;
    page?: number;
    pageSize?: number;
  };
}

// 계층 구조 생성 요청
export interface CreateHierarchyRequest {
  projectId: string;
  goal: {
    name: string;
    description?: string;
  };
  criteria: Array<{
    name: string;
    description?: string;
    subcriteria?: Array<{
      name: string;
      description?: string;
    }>;
  }>;
  alternatives: Array<{
    name: string;
    description?: string;
  }>;
}

// 평가 세션 생성 요청
export interface CreateEvaluationRequest {
  projectId: string;
  evaluatorId: string;
  sessionType: 'individual' | 'group';
  evaluationMode: 'full' | 'partial';
  selectedNodes?: string[];
}

// 쌍대비교 제출 요청
export interface SubmitComparisonRequest {
  sessionId: string;
  stepId: string;
  comparisons: Array<{
    elementAId: string;
    elementBId: string;
    value: number;
  }>;
}