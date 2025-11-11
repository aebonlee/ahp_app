// 그룹 평가 시스템 타입 정의
// Opus 4.1 설계 문서 기반

export interface EvaluationGroup {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  aggregationMethod: 'geometric_mean' | 'arithmetic_mean' | 'weighted_avg' | 'fuzzy';
  consensusThreshold: number; // 0-1
  minEvaluators: number;
  maxEvaluators: number;
  status: 'pending' | 'active' | 'paused' | 'completed';
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  evaluatorId: string;
  role: 'leader' | 'member' | 'observer';
  expertiseLevel: number; // 1-10
  weight: number;
  joinedAt: string;
  evaluationStartedAt?: string;
  evaluationCompletedAt?: string;
  isActive: boolean;
}

export interface GroupAggregatedMatrix {
  id: string;
  groupId: string;
  nodeId: string;
  aggregationMethod: string;
  matrixData: number[][];
  consistencyRatio: number;
  isConsistent: boolean;
  eigenValue: number;
  eigenVector: number[];
  consensusIndex: number; // 0-1
  participantCount: number;
  calculationTimestamp: string;
}

export interface DisagreementAnalysis {
  id: string;
  groupId: string;
  nodeId: string;
  evaluator1Id: string;
  evaluator2Id: string;
  elementI: number;
  elementJ: number;
  value1: number;
  value2: number;
  disagreementLevel: number; // 0-1
  impactOnConsensus: number;
  suggestedResolution?: string;
}

export interface ConsensusMetrics {
  overallConsensus: number; // 0-1
  kendallsW: number; // Kendall's coefficient of concordance
  shannonEntropy: number;
  disagreementMatrix: number[][];
  criticalDisagreements: DisagreementAnalysis[];
}

export interface GroupEvaluationSession {
  id: string;
  groupId: string;
  sessionType: 'synchronous' | 'asynchronous' | 'delphi';
  round: number; // For Delphi method
  status: 'pending' | 'in_progress' | 'consensus_reached' | 'max_rounds_reached';
  consensusThreshold: number;
  currentConsensus: number;
  maxRounds?: number;
  currentRoundStartedAt?: string;
  expectedEndAt?: string;
  metadata: Record<string, any>;
}

export interface DelphiRound {
  id: string;
  sessionId: string;
  roundNumber: number;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  consensusLevel: number;
  participantResponses: Array<{
    evaluatorId: string;
    submittedAt: string;
    confidence: number;
    feedback?: string;
  }>;
  aggregatedResults: Record<string, any>;
  feedbackSummary?: string;
}

// 통합 방법론 관련 타입
export interface AggregationConfig {
  method: 'aij' | 'aip' | 'weighted' | 'fuzzy';
  weights?: Record<string, number>; // 평가자별 가중치
  fuzzyParameters?: {
    alphaLevel: number;
    defuzzificationMethod: 'centroid' | 'bisector' | 'mom';
  };
}

export interface AIJResult {
  aggregatedMatrix: number[][];
  geometricMeans: number[];
  normalizedWeights: number[];
  consistencyRatio: number;
}

export interface AIPResult {
  individualPriorities: Array<{
    evaluatorId: string;
    priorities: number[];
    localCR: number;
  }>;
  aggregatedPriorities: number[];
  weightedPriorities?: number[];
  consensusIndex: number;
}

export interface GroupCalculationResult {
  aggregationMethod: string;
  result: AIJResult | AIPResult;
  consensusMetrics: ConsensusMetrics;
  participantContributions: Array<{
    evaluatorId: string;
    weight: number;
    consistency: number;
    expertise: number;
  }>;
  qualityMetrics: {
    overallQuality: number;
    reliability: number;
    validity: number;
  };
}

// 실시간 그룹 모니터링
export interface GroupMonitoringData {
  groupId: string;
  activeParticipants: number;
  totalParticipants: number;
  completionRate: number;
  averageConsistency: number;
  currentConsensus: number;
  timeRemaining?: number;
  recentActivities: Array<{
    evaluatorId: string;
    action: string;
    nodeId: string;
    timestamp: string;
  }>;
  alerts: Array<{
    type: 'low_consensus' | 'inconsistency' | 'timeout' | 'participant_inactive';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: string;
  }>;
}

// WebSocket 메시지 타입
export interface GroupWebSocketMessage {
  type: 'group_progress' | 'consensus_update' | 'participant_joined' | 'participant_left' | 'round_completed';
  groupId: string;
  sessionId?: string;
  data: GroupMonitoringData | ConsensusMetrics | GroupMember | DelphiRound;
  timestamp: string;
}

// 컴포넌트 Props 타입
export interface GroupEvaluationDashboardProps {
  projectId: string;
  groupId?: string;
  currentUserId: string;
  onGroupCreate?: (group: EvaluationGroup) => void;
  onGroupJoin?: (groupId: string) => void;
}

export interface ConsensusVisualizationProps {
  consensusMetrics: ConsensusMetrics;
  threshold: number;
  showDetails?: boolean;
  onDisagreementSelect?: (disagreement: DisagreementAnalysis) => void;
}

export interface DelphiProcessManagerProps {
  sessionId: string;
  groupId: string;
  currentRound: DelphiRound;
  onRoundComplete?: () => void;
  onSessionComplete?: () => void;
}

export interface GroupComparisonMatrixProps {
  groupId: string;
  nodeId: string;
  aggregationMethod: string;
  participantMatrices: Array<{
    evaluatorId: string;
    matrix: number[][];
    consistency: number;
  }>;
  onAggregationUpdate?: (result: GroupCalculationResult) => void;
}

// API 요청/응답 타입
export interface CreateGroupRequest {
  projectId: string;
  name: string;
  description?: string;
  aggregationMethod: string;
  consensusThreshold: number;
  minEvaluators: number;
  maxEvaluators: number;
}

export interface JoinGroupRequest {
  groupId: string;
  evaluatorId: string;
  expertiseLevel: number;
  role?: string;
}

export interface SubmitGroupComparisonRequest {
  groupId: string;
  sessionId: string;
  nodeId: string;
  comparisons: Array<{
    elementAId: string;
    elementBId: string;
    value: number;
  }>;
}

export interface StartDelphiRoundRequest {
  sessionId: string;
  roundNumber: number;
  feedbackSummary?: string;
  targetNodes?: string[];
}

export interface GroupAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    totalParticipants?: number;
    consensusLevel?: number;
    round?: number;
  };
}