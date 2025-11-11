// 고급 분석 시스템 TypeScript 타입 정의
// Opus 4.1 설계 기반

// =============================================================================
// 기본 분석 타입
// =============================================================================

export interface BaseAnalysisResult {
  id: string;
  timestamp: string;
  projectId: string;
  analysisType: 'sensitivity' | 'monte_carlo' | 'scenario' | 'robustness';
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export interface AlternativeRank {
  alternativeId: string;
  alternativeName: string;
  rank: number;
  score: number;
  normalizedScore: number;
}

export interface CriterionNode {
  id: string;
  name: string;
  description?: string;
  weight: number;
  children?: CriterionNode[];
  parent?: string;
  level: number;
}

export interface RankChange {
  alternativeId: string;
  oldRank: number;
  newRank: number;
  rankDifference: number;
}

// =============================================================================
// 민감도 분석 타입
// =============================================================================

export interface SensitivityPoint {
  weight: number;
  ranking: AlternativeRank[];
  scores: Map<string, number>;
  rankChanges: RankChange[];
}

export interface CriticalPoint {
  weight: number;
  weightRange: [number, number];
  alternativesSwapped: [string, string];
  rankPositions: number;
  sensitivity: number;
}

export interface StabilityRange {
  minWeight: number;
  maxWeight: number;
  range: number;
  isStable: boolean;
  stabilityIndex: number;
}

export interface SingleCriterionSensitivity {
  criterionId: string;
  criterionName: string;
  originalWeight: number;
  sensitivityPoints: SensitivityPoint[];
  criticalPoints: CriticalPoint[];
  stabilityRange: StabilityRange;
  mostSensitive: string[]; // alternative IDs
  leastSensitive: string[];
}

export interface MultiDimensionalPoint {
  weights: number[];
  ranking: AlternativeRank[];
  scores: Map<string, number>;
  stabilityScore: number;
}

export interface MultiDimensionalSensitivity {
  criteriaIds: string[];
  dimensions: number;
  points: MultiDimensionalPoint[];
  paretoFrontier: MultiDimensionalPoint[];
  stabilityRegions: StabilityRegion[];
}

export interface StabilityRegion {
  center: number[];
  radius: number;
  stability: number;
  dominantAlternative: string;
}

export interface GradientSensitivity {
  gradients: Map<string, number>;
  mostSensitive: { criterionId: string; value: number };
  leastSensitive: { criterionId: string; value: number };
  averageSensitivity: number;
}

export interface SensitivityAnalysisResult extends BaseAnalysisResult {
  analysisType: 'sensitivity';
  singleCriterion: SingleCriterionSensitivity[];
  multiDimensional?: MultiDimensionalSensitivity;
  gradient: GradientSensitivity;
  overallStability: number;
  recommendations: SensitivityRecommendation[];
}

export interface SensitivityRecommendation {
  type: 'warning' | 'suggestion' | 'insight';
  title: string;
  description: string;
  affectedCriteria: string[];
  affectedAlternatives: string[];
  priority: 'low' | 'medium' | 'high';
  actionItems?: string[];
}

// =============================================================================
// 성능 민감도 분석 타입
// =============================================================================

export interface PerformancePoint {
  multiplier: number;
  newScore: number;
  rank: number;
  totalScore: number;
  ranking: AlternativeRank[];
}

export interface BreakEvenPoint {
  multiplierRange: [number, number];
  scoreRange: [number, number];
  rankChange: [number, number];
  criticalValue: number;
}

export interface PerformanceSensitivity {
  alternativeId: string;
  criterionId: string;
  originalScore: number;
  performancePoints: PerformancePoint[];
  breakEvenPoints: BreakEvenPoint[];
  dominanceRange: [number, number];
}

// =============================================================================
// 몬테카를로 시뮬레이션 타입
// =============================================================================

export interface SimulationRun {
  iteration: number;
  matrix?: number[][];
  weights?: Map<string, number>;
  priorities?: number[];
  consistencyRatio?: number;
  ranking: AlternativeRank[];
  scores: Map<string, number>;
}

export interface AlternativeStatistics {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  coefficientOfVariation: number;
}

export interface SimulationStatistics {
  alternativeStats: Map<string, AlternativeStatistics>;
  overallConvergence: number;
  stabilityIndex: number;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  mean: number;
  confidenceLevel: number;
}

export interface StabilityMetrics {
  rankCorrelation: number;
  scoreCorrelation: number;
  convergenceRate: number;
  volatilityIndex: number;
}

export interface MonteCarloResults extends BaseAnalysisResult {
  analysisType: 'monte_carlo';
  totalIterations: number;
  validIterations: number;
  convergenceRate: number;
  results: SimulationRun[];
  statistics: SimulationStatistics;
  rankProbabilities: Map<string, number[]>;
  confidenceIntervals: Map<string, ConfidenceInterval>;
  stabilityMetrics: StabilityMetrics;
  uncertaintyLevel: number;
  simulationMethod: 'comparison_uncertainty' | 'weight_uncertainty' | 'mixed';
}

export interface WeightSimulationRun {
  iteration: number;
  weights: Map<string, number>;
  scores: Map<string, number>;
  ranking: AlternativeRank[];
}

export interface WeightUncertaintyResults {
  iterations: number;
  results: WeightSimulationRun[];
  weightStatistics: Map<string, AlternativeStatistics>;
  rankingStability: number;
  correlations: Map<string, Map<string, number>>;
}

// =============================================================================
// What-if 시나리오 분석 타입
// =============================================================================

export interface ScenarioChange {
  type: 'weight' | 'score' | 'comparison' | 'alternative' | 'criterion';
  target: string;
  subTarget?: string;
  oldValue: any;
  newValue: any;
  reason?: string;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  changes: ScenarioChange[];
  timestamp: Date;
  type: 'what_if' | 'goal_seeking' | 'optimization' | 'stress_test';
}

export interface BaselineState {
  weights: Map<string, number>;
  scores: Map<string, Map<string, number>>;
  ranking: AlternativeRank[];
  consistencyRatios: Map<string, number>;
}

export interface ImpactAnalysis {
  rankChanges: RankChange[];
  scoreChanges: Map<string, number>;
  weightChanges: Map<string, number>;
  overallImpact: 'minor' | 'moderate' | 'major';
  impactScore: number;
}

export interface Recommendation {
  type: 'action' | 'caution' | 'opportunity';
  title: string;
  description: string;
  priority: number;
  confidence: number;
}

export interface RevertAction {
  description: string;
  action: () => void;
  validation: () => boolean;
}

export interface ScenarioExecutionResult {
  scenario: ScenarioDefinition;
  baseline: BaselineState;
  results: any; // AHPResults
  impact: ImpactAnalysis;
  recommendations: Recommendation[];
  revertActions: RevertAction[];
  confidence: number;
}

export interface InteractionEffect {
  scenario1: string;
  scenario2: string;
  expectedCombined: AlternativeRank[];
  actualCombined: AlternativeRank[];
  interactionStrength: number;
  synergy: boolean;
}

export interface CompositeScenarioResult {
  individualResults: ScenarioExecutionResult[];
  combinedResult: ScenarioExecutionResult;
  interactionEffects: InteractionEffect[];
  synergies: InteractionEffect[];
  conflicts: InteractionEffect[];
  optimalCombination?: ScenarioDefinition;
}

export interface GoalSeekingResult {
  achieved: boolean;
  currentRank: number;
  targetRank: number;
  requiredChanges: ScenarioChange[];
  feasibility: number;
  alternativePaths?: ScenarioDefinition[];
}

export interface Objective {
  name: string;
  type: 'maximize' | 'minimize';
  weight: number;
  evaluate: (result: ScenarioExecutionResult) => number;
}

export interface EvaluatedScenario {
  scenario: ScenarioDefinition;
  result: ScenarioExecutionResult;
  objectiveScores: number[];
}

export interface ParetoOptimalResult {
  allScenarios: EvaluatedScenario[];
  paretoFront: EvaluatedScenario[];
  tradeoffs: TradeoffAnalysis[];
  recommendedScenarios: EvaluatedScenario[];
}

export interface TradeoffAnalysis {
  objective1: string;
  objective2: string;
  tradeoffRate: number;
  elasticity: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  changes: ScenarioChange[];
  uncertainty: number;
}

export interface ScenarioResult {
  scenario: Scenario;
  runs: SimulationRun[];
  summary: ScenarioSummary;
  robustness: number;
}

export interface ScenarioSummary {
  meanRanking: AlternativeRank[];
  medianRanking: AlternativeRank[];
  rankingVolatility: number;
  dominantAlternative?: string;
}

export interface ScenarioSimulationResults {
  scenarios: Map<string, ScenarioResult>;
  crossScenarioAnalysis: CrossScenarioAnalysis;
  recommendedAlternative: string;
}

export interface CrossScenarioAnalysis {
  consistentWinners: string[];
  volatileAlternatives: string[];
  scenarioDependentChoices: Map<string, string[]>;
  robustnessRanking: AlternativeRank[];
}

// =============================================================================
// 로버스트성 분석 타입
// =============================================================================

export interface ReversalCondition {
  description: string;
  criterionChanges: Map<string, number>;
  scoreChanges?: Map<string, Map<string, number>>;
  probability: number;
}

export interface RankReversalAnalysis {
  reversalConditions: ReversalCondition[];
  mostVulnerable: { alternative1: string; alternative2: string; condition: ReversalCondition };
  overallRobustness: number;
}

export interface StressLevelResult {
  stressLevel: number;
  scenarios: number;
  rankingStability: number;
  scoreVariation: number;
  consistencyDegradation: number;
  failurePoints: FailurePoint[];
}

export interface FailurePoint {
  scenario: string;
  failureType: 'inconsistency' | 'rank_reversal' | 'score_anomaly';
  threshold: number;
  actualValue: number;
  description: string;
}

export interface StressTestResult {
  stressLevels: StressLevelResult[];
  breakingPoint: number;
  resilience: number;
  recommendations: string[];
}

export interface IIAViolation {
  affectedAlternatives: string[];
  rankChanges: RankChange[];
  violationType: 'rank_reversal' | 'preference_change';
  severity: number;
}

export interface IIARobustnessResult {
  iiaCompliant: boolean;
  violations: Array<{
    type: 'removal' | 'addition';
    alternative: any;
    violation: IIAViolation;
    severity: number;
  }>;
  robustnessScore: number;
  recommendations: string[];
}

// =============================================================================
// 시각화 및 리포트 타입
// =============================================================================

export interface Visualization {
  type: 'tornado' | 'histogram' | 'spider' | 'heatmap' | 'line' | 'scatter' | 'parallel_coordinates';
  title: string;
  data: any;
  options: VisualizationOptions;
}

export interface VisualizationOptions {
  width?: number;
  height?: number;
  colors?: string[];
  interactive?: boolean;
  animation?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  [key: string]: any;
}

export interface DataTable {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  format?: TableFormat;
}

export interface TableFormat {
  numberFormat?: string;
  highlightRows?: number[];
  highlightCols?: number[];
  sortable?: boolean;
  filterable?: boolean;
}

export interface Insight {
  type: 'warning' | 'opportunity' | 'neutral' | 'positive';
  title: string;
  description: string;
  confidence: number;
  data?: any;
  actionable?: boolean;
}

export interface ReportMetadata {
  title: string;
  subtitle?: string;
  author: string;
  createdAt: Date;
  projectId: string;
  version: string;
  analysisTypes: string[];
}

export interface ExecutiveSummary {
  keyFindings: string[];
  recommendations: string[];
  riskFactors: string[];
  confidence: number;
  nextSteps: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: ReportContent;
  visualizations: Visualization[];
  tables: DataTable[];
  insights: Insight[];
}

export interface ReportContent {
  summary: string;
  details: string;
  methodology?: string;
  limitations?: string[];
}

export interface ReportAppendix {
  title: string;
  content: string;
  data?: any;
  type: 'data' | 'methodology' | 'calculations' | 'references';
}

export interface AnalysisReport {
  metadata: ReportMetadata;
  executiveSummary: ExecutiveSummary;
  sections: ReportSection[];
  appendices?: ReportAppendix[];
}

// =============================================================================
// 종합 분석 결과 타입
// =============================================================================

export interface ComprehensiveAnalysisResults {
  basic: any; // AHPResults
  sensitivity: SensitivityAnalysisResult;
  monteCarlo: MonteCarloResults;
  scenarios: ScenarioSimulationResults;
  robustness: {
    rankReversal: RankReversalAnalysis;
    stressTest: StressTestResult;
    iiaCompliance: IIARobustnessResult;
  };
  metadata: {
    analysisId: string;
    projectId: string;
    timestamp: string;
    duration: number; // milliseconds
    analysisVersion: string;
  };
}

// =============================================================================
// API 요청/응답 타입
// =============================================================================

export interface SensitivityAnalysisRequest {
  projectId: string;
  criteria?: string[];
  analysisType?: 'single' | 'multi' | 'gradient' | 'all';
  resolution?: number;
  includePerformanceSensitivity?: boolean;
}

export interface MonteCarloRequest {
  projectId: string;
  iterations?: number;
  uncertaintyLevel?: number;
  simulationMethod?: 'comparison_uncertainty' | 'weight_uncertainty' | 'mixed';
  seed?: number;
  confidenceLevel?: number;
}

export interface ScenarioAnalysisRequest {
  projectId: string;
  scenarios: ScenarioDefinition[];
  iterations?: number;
  includeInteractionEffects?: boolean;
}

export interface AnalysisAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  executionTime: number;
}

// =============================================================================
// 컴포넌트 Props 타입
// =============================================================================

export interface SensitivityDashboardProps {
  projectId: string;
  onAnalysisComplete?: (result: SensitivityAnalysisResult) => void;
  onError?: (error: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface TornadoDiagramProps {
  data: SingleCriterionSensitivity[];
  selectedAlternative?: string;
  height?: number;
  interactive?: boolean;
  onCriterionClick?: (criterionId: string) => void;
}

export interface MonteCarloVisualizationProps {
  results: MonteCarloResults;
  selectedAlternative?: string;
  showConfidenceIntervals?: boolean;
  chartType?: 'histogram' | 'box' | 'violin' | 'density';
}

export interface ScenarioComparisonProps {
  scenarios: Map<string, ScenarioResult>;
  baselineResult: any;
  metrics?: string[];
  onScenarioSelect?: (scenarioId: string) => void;
}

// =============================================================================
// 유틸리티 타입
// =============================================================================

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AnalysisProgress {
  phase: string;
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export interface AnalysisConfig {
  enableParallelProcessing: boolean;
  maxIterations: number;
  convergenceThreshold: number;
  cacheResults: boolean;
  exportFormats: ('pdf' | 'excel' | 'json')[];
}

export interface PerformanceMetrics {
  calculationTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  parallelizationFactor: number;
}