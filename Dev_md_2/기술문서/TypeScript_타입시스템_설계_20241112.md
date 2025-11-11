# 📚 TypeScript 타입 시스템 설계 문서
## 작성일: 2024-11-12
## 작성자: Claude Sonnet 4
## 프로젝트: AHP Decision Support Platform

---

## 🎯 타입 시스템 개요

### 설계 원칙
- **타입 안전성**: 100% strict mode 적용
- **확장성**: 플러그인 아키텍처 지원
- **재사용성**: 모듈화된 타입 정의
- **문서화**: 자체 설명하는 인터페이스

### 타입 계층 구조
```
BaseTypes (공통 타입)
├── Analysis Types (분석 관련)
│   ├── Sensitivity Analysis
│   ├── Monte Carlo Simulation  
│   ├── Scenario Analysis
│   └── AI Interpretation
├── Monitoring Types (모니터링)
│   ├── Real-time Metrics
│   ├── Event Tracking
│   └── Alert System
└── Group Types (그룹 평가)
    ├── Group Management
    ├── Consensus Measurement
    └── Aggregation Methods
```

---

## 🔬 분석 시스템 타입 (`types/analysis.ts`)

### 기본 분석 타입

```typescript
// 기본 분석 결과 인터페이스
interface BaseAnalysisResult {
  id: string;
  timestamp: string;
  projectId: string;
  analysisType: 'sensitivity' | 'monte_carlo' | 'scenario' | 'robustness';
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

// 대안 순위 정보
interface AlternativeRank {
  alternativeId: string;
  alternativeName: string;
  rank: number;
  score: number;
  normalizedScore: number;
}

// 순위 변화 추적
interface RankChange {
  alternativeId: string;
  oldRank: number;
  newRank: number;
  rankDifference: number;
}
```

### 민감도 분석 타입

```typescript
// 민감도 분석 포인트
interface SensitivityPoint {
  weight: number;
  ranking: AlternativeRank[];
  scores: Map<string, number>;
  rankChanges: RankChange[];
}

// 임계점 정의
interface CriticalPoint {
  weight: number;
  weightRange: [number, number];
  alternativesSwapped: [string, string];
  rankPositions: number;
  sensitivity: number;
}

// 안정성 범위
interface StabilityRange {
  minWeight: number;
  maxWeight: number;
  range: number;
  isStable: boolean;
  stabilityIndex: number;
}

// 단일 기준 민감도 분석 결과
interface SingleCriterionSensitivity {
  criterionId: string;
  criterionName: string;
  originalWeight: number;
  sensitivityPoints: SensitivityPoint[];
  criticalPoints: CriticalPoint[];
  stabilityRange: StabilityRange;
  mostSensitive: string[];
  leastSensitive: string[];
}
```

### 몬테카를로 시뮬레이션 타입

```typescript
// 시뮬레이션 실행
interface SimulationRun {
  iteration: number;
  matrix?: number[][];
  weights?: Map<string, number>;
  priorities?: number[];
  consistencyRatio?: number;
  ranking: AlternativeRank[];
  scores: Map<string, number>;
}

// 통계 정보
interface AlternativeStatistics {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  coefficientOfVariation: number;
}

// 신뢰 구간
interface ConfidenceInterval {
  lower: number;
  upper: number;
  mean: number;
  confidenceLevel: number;
}

// 몬테카를로 결과
interface MonteCarloResults extends BaseAnalysisResult {
  analysisType: 'monte_carlo';
  totalIterations: number;
  validIterations: number;
  convergenceRate: number;
  results: SimulationRun[];
  statistics: SimulationStatistics;
  rankProbabilities: Map<string, number[]>;
  confidenceIntervals: Map<string, ConfidenceInterval>;
  stabilityMetrics: StabilityMetrics;
}
```

### 시나리오 분석 타입

```typescript
// 시나리오 변경사항
interface ScenarioChange {
  type: 'weight' | 'score' | 'comparison' | 'alternative' | 'criterion';
  target: string;
  subTarget?: string;
  oldValue: any;
  newValue: any;
  reason?: string;
}

// 시나리오 정의
interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  changes: ScenarioChange[];
  timestamp: Date;
  type: 'what_if' | 'goal_seeking' | 'optimization' | 'stress_test';
}

// 영향 분석
interface ImpactAnalysis {
  rankChanges: RankChange[];
  scoreChanges: Map<string, number>;
  weightChanges: Map<string, number>;
  overallImpact: 'minor' | 'moderate' | 'major';
  impactScore: number;
}

// 목표 탐색 결과
interface GoalSeekingResult {
  achieved: boolean;
  currentRank: number;
  targetRank: number;
  requiredChanges: ScenarioChange[];
  feasibility: number;
  alternativePaths?: ScenarioDefinition[];
}
```

### AI 인사이트 타입

```typescript
// 인사이트 정의
interface Insight {
  type: 'warning' | 'opportunity' | 'neutral' | 'positive';
  title: string;
  description: string;
  confidence: number;
  data?: any;
  actionable?: boolean;
}

// 추천사항
interface Recommendation {
  type: 'action' | 'caution' | 'opportunity';
  title: string;
  description: string;
  priority: number;
  confidence: number;
}

// AI 인사이트 인터페이스 (내부)
interface AIInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'risk' | 'opportunity' | 'trend';
  category: 'ranking' | 'sensitivity' | 'stability' | 'consistency' | 'performance';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  evidence: string[];
  recommendations: string[];
  priority: number;
  timestamp: string;
}
```

---

## 📊 모니터링 시스템 타입 (`types/monitoring.ts`)

### 실시간 메트릭

```typescript
// 실시간 지표
interface RealtimeMetrics {
  projectId: string;
  timestamp: string;
  counters: {
    totalEvaluators: number;
    activeEvaluators: number;
    completedNodes: number;
    totalComparisons: number;
    sessionsStarted: number;
    sessionsCompleted: number;
  };
  gauges: {
    overallProgress: number;
    averageConsistency: number;
    systemLoad: number;
    responseTime: number;
    errorRate: number;
  };
  histograms: {
    comparisonTimes: number[];
    sessionDurations: number[];
    consistencyRatios: number[];
  };
}

// 평가 이벤트
interface EvaluationEvent {
  id: string;
  eventId: string;
  projectId: string;
  evaluatorId: string;
  eventType: 'comparison_submitted' | 'node_completed' | 'evaluation_started' | 
            'evaluation_completed' | 'evaluation_paused' | 'user_joined' | 'user_left';
  timestamp: string;
  duration?: number;
  totalTime?: number;
  consistencyRatio?: number;
  eventData: Record<string, any>;
}
```

### 이상 탐지

```typescript
// 이상 탐지 결과
interface AnomalyDetection {
  id: string;
  type: 'statistical' | 'pattern' | 'ml' | 'rule_based';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedEntities: string[];
  detectedAt: string;
  resolvedAt?: string;
  metadata: {
    threshold?: number;
    actualValue?: number;
    confidence: number;
    suggestions: string[];
  };
  actions: Array<{
    type: 'notify' | 'investigate' | 'auto_fix';
    description: string;
    completed: boolean;
  }>;
}

// 모니터링 알림
interface MonitoringAlert {
  id: string;
  projectId?: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata: Record<string, any>;
}
```

### 성능 메트릭

```typescript
// 성능 지표
interface PerformanceMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
  };
  application: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    activeConnections: number;
  };
}

// 예측 결과
interface PredictionResult {
  metric: string;
  forecastHours: number;
  predictions: Array<{
    timestamp: string;
    value: number;
    confidence: number;
  }>;
  accuracy: number;
  model: string;
  generatedAt: string;
}
```

---

## 👥 그룹 평가 시스템 타입 (`types/group.ts`)

### 그룹 관리

```typescript
// 그룹 정의
interface EvaluationGroup {
  id: string;
  name: string;
  description: string;
  projectId: string;
  members: GroupMember[];
  settings: GroupSettings;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  completedAt?: string;
}

// 그룹 구성원
interface GroupMember {
  id: string;
  evaluatorId: string;
  name: string;
  email: string;
  role: 'leader' | 'member' | 'observer';
  weight: number; // 그룹 내 가중치
  status: 'invited' | 'active' | 'completed' | 'withdrawn';
  joinedAt?: string;
  completedAt?: string;
}

// 그룹 설정
interface GroupSettings {
  aggregationMethod: 'geometric_mean' | 'arithmetic_mean' | 'median' | 'aij' | 'aip';
  consensusThreshold: number;
  allowPartialEvaluation: boolean;
  enableRealTimeSync: boolean;
  maxRounds: number;
  delphiSettings?: DelphiSettings;
}
```

### 합의도 측정

```typescript
// 합의도 지표
interface ConsensusMetrics {
  groupId: string;
  calculatedAt: string;
  overallConsensus: number;
  criteriaConsensus: Map<string, number>;
  
  // 다양한 합의도 지표
  shannonEntropy: number;
  kendallW: number;
  gini: number;
  disagreementIndex: number;
  
  // 집단 응집성
  cohesiveness: number;
  polarization: number;
  
  // 개별 평가자 편차
  memberDeviations: Map<string, MemberDeviation>;
}

// 구성원별 편차
interface MemberDeviation {
  evaluatorId: string;
  overallDeviation: number;
  criteriaDeviations: Map<string, number>;
  influenceScore: number;
  outlierStatus: 'normal' | 'moderate_outlier' | 'extreme_outlier';
}
```

### 집계 방법

```typescript
// 집계 결과
interface AggregationResult {
  method: AggregationMethod;
  groupId: string;
  aggregatedMatrix: number[][];
  aggregatedWeights: number[];
  participantCount: number;
  consistency: {
    groupConsistency: number;
    individualConsistencies: Map<string, number>;
    weightedConsistency: number;
  };
  calculatedAt: string;
}

// Delphi 라운드
interface DelphiRound {
  roundNumber: number;
  groupId: string;
  status: 'active' | 'completed' | 'cancelled';
  
  // 라운드 결과
  results: Map<string, number[]>; // evaluatorId -> weights
  feedback: Map<string, string>; // evaluatorId -> feedback
  
  // 합의도 변화
  consensusImprovement: number;
  convergenceRate: number;
  
  startedAt: string;
  completedAt?: string;
  
  // 다음 라운드 권장사항
  recommendations: string[];
}
```

---

## 🛠️ 컴포넌트 Props 타입

### 대시보드 컴포넌트

```typescript
// 민감도 분석 대시보드 Props
interface SensitivityDashboardProps {
  projectId: string;
  onAnalysisComplete?: (result: SensitivityAnalysisResult) => void;
  onError?: (error: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// AI 해석 컴포넌트 Props
interface AIResultInterpretationProps {
  analysisResults: ComprehensiveAnalysisResults;
  onInsightAction?: (insight: Insight, action: string) => void;
  onRecommendationAccept?: (recommendation: Recommendation) => void;
  showAdvancedInsights?: boolean;
}

// 토네이도 다이어그램 Props
interface TornadoDiagramProps {
  data: SingleCriterionSensitivity[];
  selectedAlternative?: string;
  height?: number;
  interactive?: boolean;
  onCriterionClick?: (criterionId: string) => void;
}
```

### 모니터링 컴포넌트

```typescript
// 실시간 모니터링 대시보드 Props
interface RealtimeMonitoringProps {
  projectId?: string;
  timeRange: { start: string; end: string };
  refreshInterval?: number;
  onAlert?: (alert: MonitoringAlert) => void;
  onAnomalyDetected?: (anomaly: AnomalyDetection) => void;
}

// 메트릭 시각화 Props
interface MetricsVisualizationProps {
  projectId?: string;
  timeRange: { start: string; end: string };
  refreshInterval?: number;
  showPredictions?: boolean;
  chartHeight?: number;
}
```

---

## 🔄 API 타입

### 요청/응답 타입

```typescript
// 분석 요청
interface SensitivityAnalysisRequest {
  projectId: string;
  criteria?: string[];
  analysisType?: 'single' | 'multi' | 'gradient' | 'all';
  resolution?: number;
  includePerformanceSensitivity?: boolean;
}

// 몬테카를로 요청
interface MonteCarloRequest {
  projectId: string;
  iterations?: number;
  uncertaintyLevel?: number;
  simulationMethod?: 'comparison_uncertainty' | 'weight_uncertainty' | 'mixed';
  seed?: number;
  confidenceLevel?: number;
}

// API 응답
interface AnalysisAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  executionTime: number;
}
```

### WebSocket 이벤트 타입

```typescript
// 실시간 업데이트
interface RealtimeUpdate {
  type: 'metrics_update' | 'progress_update' | 'user_activity' | 'alert';
  projectId?: string;
  timestamp: string;
  data: {
    metrics?: RealtimeMetrics;
    progress?: ProjectProgress;
    activeUsers?: ActiveUser[];
    alert?: MonitoringAlert;
  };
}

// 진행률 업데이트
interface AnalysisProgress {
  phase: string;
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}
```

---

## ⚙️ 설정 및 구성 타입

### 분석 설정

```typescript
// 분석 설정
interface AnalysisConfig {
  enableParallelProcessing: boolean;
  maxIterations: number;
  convergenceThreshold: number;
  cacheResults: boolean;
  exportFormats: ('pdf' | 'excel' | 'json')[];
}

// 대시보드 필터
interface DashboardFilter {
  projectIds?: string[];
  timeRange?: { start: string; end: string };
  severityLevel?: 'all' | 'info' | 'warning' | 'error' | 'critical';
  includeResolved?: boolean;
  evaluatorIds?: string[];
}
```

### 시각화 설정

```typescript
// 시각화 옵션
interface VisualizationOptions {
  width?: number;
  height?: number;
  colors?: string[];
  interactive?: boolean;
  animation?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  [key: string]: any;
}

// 차트 속성
interface MetricsChartProps {
  data: ChartPoint[];
  type: 'line' | 'bar' | 'area' | 'scatter';
  options: VisualizationOptions;
  onDataPointClick?: (point: ChartPoint) => void;
}
```

---

## 🎯 타입 가드 및 유틸리티

### 타입 가드

```typescript
// 분석 결과 타입 가드
function isSensitivityResult(result: BaseAnalysisResult): result is SensitivityAnalysisResult {
  return result.analysisType === 'sensitivity';
}

function isMonteCarloResult(result: BaseAnalysisResult): result is MonteCarloResults {
  return result.analysisType === 'monte_carlo';
}

// 알림 심각도 체크
function isCriticalAlert(alert: MonitoringAlert): boolean {
  return alert.severity === 'critical' || alert.severity === 'error';
}
```

### 타입 유틸리티

```typescript
// 부분 업데이트 타입
type PartialUpdate<T> = Partial<T> & { id: string };

// 분석 상태 유니언
type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

// 메트릭 키 추출
type MetricKeys = keyof RealtimeMetrics['gauges'] | keyof RealtimeMetrics['counters'];

// API 엔드포인트 매핑
type APIEndpoints = {
  [K in BaseAnalysisResult['analysisType']]: string;
};
```

---

## 📋 타입 시스템 장점

### 1. 컴파일 타임 안전성
- 모든 데이터 구조의 타입 안전성 보장
- 런타임 오류 사전 방지
- IDE 자동 완성 및 리팩토링 지원

### 2. 코드 가독성
- 자체 문서화되는 인터페이스
- 명확한 데이터 흐름 추적
- 개발자 간 의사소통 개선

### 3. 확장성
- 새로운 분석 타입 쉽게 추가
- 플러그인 아키텍처 지원
- 하위 호환성 유지

### 4. 유지보수성
- 타입 변경 시 영향 범위 명확
- 리팩토링 안정성 보장
- 테스트 케이스 작성 용이

---

**문서 버전**: 1.0.0  
**타입 정의 파일**: 3개 (analysis.ts, monitoring.ts, group.ts)  
**총 인터페이스 수**: 70개 이상  
**TypeScript 버전**: 4.9.5 (strict mode)