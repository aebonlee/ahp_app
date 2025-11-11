// 실시간 모니터링 시스템 타입 정의
// Opus 4.1 설계 기반

export interface EvaluationEvent {
  id: string;
  eventId: string;
  projectId: string;
  evaluatorId: string;
  eventType: 'comparison_submitted' | 'node_completed' | 'evaluation_started' | 
           'evaluation_completed' | 'evaluation_paused' | 'user_joined' | 'user_left';
  eventData: Record<string, any>;
  timestamp: string;
  sessionId?: string;
  nodeId?: string;
  duration?: number;
  consistencyRatio?: number;
  totalTime?: number;
  metadata: Record<string, any>;
}

export interface RealtimeMetrics {
  projectId: string;
  timestamp: string;
  
  // 기본 카운터
  counters: {
    totalEvaluators: number;
    activeEvaluators: number;
    completedNodes: number;
    totalComparisons: number;
    sessionsStarted: number;
    sessionsCompleted: number;
  };
  
  // 게이지 메트릭
  gauges: {
    overallProgress: number; // 0-100%
    averageConsistency: number;
    systemLoad: number;
    responseTime: number; // ms
    errorRate: number; // %
  };
  
  // 히스토그램 데이터
  histograms: {
    comparisonTimes: number[]; // 비교 소요시간 분포
    sessionDurations: number[]; // 세션 지속시간 분포
    consistencyRatios: number[]; // CR 값 분포
  };
}

export interface ActiveUser {
  evaluatorId: string;
  name?: string;
  role: string;
  status: 'online' | 'evaluating' | 'idle' | 'offline';
  lastActivity: string;
  currentNodeId?: string;
  progressPercentage: number;
  currentSessionId?: string;
  connectionTime: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ProjectProgress {
  projectId: string;
  totalNodes: number;
  completedNodes: number;
  progressPercentage: number;
  
  evaluatorProgress: Array<{
    evaluatorId: string;
    completedNodes: number;
    totalNodes: number;
    progressPercentage: number;
    lastActivity: string;
    currentNode?: string;
    estimatedCompletion?: string;
  }>;
  
  nodeProgress: Array<{
    nodeId: string;
    nodeName: string;
    completedEvaluators: number;
    totalEvaluators: number;
    averageConsistency: number;
    estimatedCompletion?: string;
  }>;
}

export interface AnomalyDetection {
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
    pattern?: string;
    confidence?: number; // 0-1
    suggestions?: string[];
  };
  actions: Array<{
    type: 'notify' | 'auto_fix' | 'investigate';
    description: string;
    completed: boolean;
  }>;
}

export interface PerformanceMetrics {
  timestamp: string;
  
  system: {
    cpuUsage: number; // %
    memoryUsage: number; // %
    diskUsage: number; // %
    networkIO: {
      bytesIn: number;
      bytesOut: number;
    };
  };
  
  application: {
    activeConnections: number;
    requestsPerSecond: number;
    responseTime: {
      avg: number;
      p95: number;
      p99: number;
    };
    errorRate: number; // %
    throughput: number; // req/s
  };
  
  database: {
    connectionPool: {
      active: number;
      idle: number;
      total: number;
    };
    queryPerformance: {
      avgQueryTime: number;
      slowQueries: number;
      totalQueries: number;
    };
  };
  
  websocket: {
    totalConnections: number;
    messagesPerSecond: number;
    latency: number; // ms
  };
}

export interface MonitoringAlert {
  id: string;
  type: 'performance' | 'anomaly' | 'system' | 'business';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  projectId?: string;
  evaluatorId?: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  autoResolved: boolean;
  
  conditions: {
    metric: string;
    operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
    threshold: number;
    actualValue: number;
    duration: number; // seconds
  };
  
  actions: Array<{
    type: 'email' | 'sms' | 'webhook' | 'auto_scale' | 'restart';
    target: string;
    executed: boolean;
    executedAt?: string;
    result?: string;
  }>;
}

export interface RealtimeUpdate {
  type: 'evaluation_update' | 'metrics_update' | 'progress_update' | 
        'alert' | 'user_activity' | 'system_status';
  projectId?: string;
  timestamp: string;
  data: {
    event?: EvaluationEvent;
    metrics?: RealtimeMetrics;
    progress?: ProjectProgress;
    activeUsers?: ActiveUser[];
    alert?: MonitoringAlert;
    anomaly?: AnomalyDetection;
    performance?: PerformanceMetrics;
  };
}

export interface DashboardFilter {
  projectIds?: string[];
  evaluatorIds?: string[];
  timeRange: {
    start: string;
    end: string;
    preset?: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d' | 'custom';
  };
  eventTypes?: string[];
  includeResolved?: boolean;
  severityLevel?: 'all' | 'warning+' | 'error+' | 'critical';
}

export interface MonitoringConfig {
  refreshInterval: number; // ms
  alertThresholds: {
    responseTime: number; // ms
    errorRate: number; // %
    consistencyThreshold: number;
    inactivityTimeout: number; // minutes
  };
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
    inApp: boolean;
  };
  retention: {
    events: number; // days
    metrics: number; // days
    logs: number; // days
  };
}

// WebSocket 메시지 타입
export interface MonitoringWebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'update' | 'heartbeat';
  channel?: string;
  projectId?: string;
  data?: RealtimeUpdate;
  timestamp: string;
}

// 컴포넌트 Props 타입
export interface MonitoringDashboardProps {
  projectId?: string;
  userRole: 'admin' | 'manager' | 'evaluator';
  autoRefresh?: boolean;
  initialFilter?: DashboardFilter;
  onAlertAction?: (alert: MonitoringAlert, action: string) => void;
}

export interface MetricsChartProps {
  metrics: RealtimeMetrics[];
  timeRange: { start: string; end: string };
  metricType: 'counter' | 'gauge' | 'histogram';
  showLegend?: boolean;
  height?: number;
}

export interface ActiveUsersDisplayProps {
  users: ActiveUser[];
  onUserSelect?: (userId: string) => void;
  showDetails?: boolean;
}

export interface AlertPanelProps {
  alerts: MonitoringAlert[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  autoRefresh?: boolean;
}

// API 요청/응답 타입
export interface GetMetricsRequest {
  projectId?: string;
  timeRange: { start: string; end: string };
  granularity: '1m' | '5m' | '15m' | '1h' | '1d';
  metrics?: string[];
}

export interface CreateAlertRuleRequest {
  name: string;
  description?: string;
  projectId?: string;
  metric: string;
  operator: string;
  threshold: number;
  duration: number;
  actions: Array<{
    type: string;
    target: string;
    config?: Record<string, any>;
  }>;
}

export interface MonitoringAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    totalCount?: number;
    timeRange?: { start: string; end: string };
    granularity?: string;
  };
}

// 예측 분석 타입
export interface PredictionResult {
  metric: string;
  projectId: string;
  predictions: Array<{
    timestamp: string;
    predictedValue: number;
    confidence: number; // 0-1
    upperBound: number;
    lowerBound: number;
  }>;
  model: {
    type: 'linear' | 'seasonal' | 'arima' | 'lstm';
    accuracy: number; // %
    trainedAt: string;
    features: string[];
  };
}

export interface TrendAnalysis {
  metric: string;
  timeRange: { start: string; end: string };
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changeRate: number; // % change
  significance: 'low' | 'medium' | 'high';
  seasonality?: {
    detected: boolean;
    period: string; // '1h', '1d', '1w'
    strength: number; // 0-1
  };
}