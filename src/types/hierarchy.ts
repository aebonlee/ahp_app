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
  code: string; // 예: "C1", "C1.1"
  position: number;
  isActive: boolean;
  localWeight?: number;
  globalWeight?: number;
  children?: HierarchyNode[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
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
  isConsistent: boolean;
  ratio: number;
  index: number;
  eigenValue: number;
  eigenVector?: number[];
  message: string;
  inconsistentPairs?: InconsistentPair[];
  suggestedAdjustments?: SuggestedAdjustment[];
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
  progressPercentage: number;
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

// Opus 설계 추가 타입들

export interface EvaluationMatrix {
  id: string;
  projectId: string;
  evaluatorId?: string;
  parentNodeId: string;
  matrixType: 'pairwise' | 'direct' | 'rating';
  matrixData: number[][];
  consistencyRatio?: number;
  isConsistent?: boolean;
  eigenValue?: number;
  eigenVector?: number[];
  iterationCount?: number;
  calculationMethod: 'power_method' | 'eigenvalue_method';
  createdAt?: string;
  updatedAt?: string;
}

export interface HierarchicalStructure {
  projectId: string;
  goal: HierarchyNode;
  criteria: HierarchyNode[];
  subcriteria?: HierarchyNode[][];
  alternatives: HierarchyNode[];
  totalLevels: number;
  nodeCount: number;
  isComplete: boolean;
}

export interface PairwiseComparison {
  i: number;
  j: number;
  value: number;
  elementA: string;
  elementB: string;
}

export interface InconsistentPair {
  i: number;
  j: number;
  actualValue: number;
  expectedValue: number;
  deviation: number;
}

export interface SuggestedAdjustment {
  position: [number, number];
  currentValue: number;
  suggestedValue: number;
  impact: number;
}

export interface EvaluationResult {
  success: boolean;
  consistency: ConsistencyResult;
  weights: number[];
  nextNode: HierarchyNode | null;
  progress?: number;
  timeSpent?: number;
}

export interface NodeProgress {
  nodeId: string;
  nodeName: string;
  level: number;
  totalComparisons: number;
  completedComparisons: number;
  isCompleted: boolean;
  isConsistent: boolean;
  consistencyRatio: number;
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpent: number;
}

export interface OverallProgress {
  totalNodes: number;
  completedNodes: number;
  percentage: number;
  levelProgress: LevelProgress[];
  estimatedTimeRemaining: number;
  currentNode: NodeInfo | null;
  nextNode: NodeInfo | null;
}

export interface LevelProgress {
  level: number;
  totalNodes: number;
  completedNodes: number;
  percentage: number;
}

export interface NodeInfo {
  id: string;
  name: string;
  level: number;
  progress: number;
}

export interface GlobalWeightResult {
  criteria: Record<string, CriterionWeight>;
  subcriteria: Record<string, SubcriterionWeight>;
  alternatives: Record<string, AlternativeScore>;
  rankings: RankingResult[];
}

export interface CriterionWeight {
  name: string;
  localWeight: number;
  globalWeight: number;
}

export interface SubcriterionWeight {
  name: string;
  parentId: string;
  localWeight: number;
  globalWeight: number;
}

export interface AlternativeScore {
  name: string;
  totalScore: number;
  scoreBreakdown: ScoreComponent[];
  rank: number;
}

export interface ScoreComponent {
  criterionId: string;
  criterionName: string;
  criterionWeight: number;
  alternativeWeight: number;
  contribution: number;
}

export interface RankingResult {
  rank: number;
  alternativeId: string;
  name: string;
  score: number;
  percentage: string;
}

export interface ProgressMessage {
  type: 'PROGRESS_UPDATE' | 'NODE_COMPLETED' | 'EVALUATION_COMPLETED';
  projectId: string;
  evaluatorId: string;
  timestamp: string;
  data: any;
}

// 에러 타입
export enum HierarchicalEvaluationError {
  INVALID_HIERARCHY = 'INVALID_HIERARCHY',
  INCOMPLETE_EVALUATION = 'INCOMPLETE_EVALUATION', 
  INCONSISTENT_MATRIX = 'INCONSISTENT_MATRIX',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

export class HierarchyError extends Error {
  constructor(
    public code: HierarchicalEvaluationError,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HierarchyError';
  }
}