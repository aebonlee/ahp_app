// 실시간 모니터링 계산 엔진
// Opus 4.1 설계 기반

import type {
  EvaluationEvent,
  RealtimeMetrics,
  AnomalyDetection,
  PerformanceMetrics,
  TrendAnalysis,
  PredictionResult
} from '../types/monitoring';

/**
 * 실시간 메트릭 계산
 */
export function calculateRealtimeMetrics(
  events: EvaluationEvent[],
  timeWindow: number = 3600000 // 1시간 (ms)
): RealtimeMetrics {
  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindow);
  
  // 시간 윈도우 내의 이벤트 필터링
  const recentEvents = events.filter(event => 
    new Date(event.timestamp) >= windowStart
  );

  // 기본 카운터 계산
  const evaluatorIds = new Set(recentEvents.map(e => e.evaluatorId));
  const activeEvaluators = recentEvents.filter(e => 
    ['comparison_submitted', 'node_completed'].includes(e.eventType) &&
    new Date(e.timestamp) >= new Date(now.getTime() - 300000) // 5분 내 활동
  );
  
  const counters = {
    totalEvaluators: evaluatorIds.size,
    activeEvaluators: new Set(activeEvaluators.map(e => e.evaluatorId)).size,
    completedNodes: recentEvents.filter(e => e.eventType === 'node_completed').length,
    totalComparisons: recentEvents.filter(e => e.eventType === 'comparison_submitted').length,
    sessionsStarted: recentEvents.filter(e => e.eventType === 'evaluation_started').length,
    sessionsCompleted: recentEvents.filter(e => e.eventType === 'evaluation_completed').length
  };

  // 게이지 메트릭 계산
  const completedEvents = recentEvents.filter(e => e.eventType === 'node_completed');
  const consistencyRatios = completedEvents
    .map(e => e.consistencyRatio)
    .filter(cr => cr !== undefined) as number[];
  
  const averageConsistency = consistencyRatios.length > 0 
    ? consistencyRatios.reduce((sum, cr) => sum + cr, 0) / consistencyRatios.length 
    : 0;

  const totalNodes = recentEvents.filter(e => 
    ['node_completed', 'evaluation_started'].includes(e.eventType)
  ).length;
  
  const overallProgress = totalNodes > 0 
    ? (counters.completedNodes / totalNodes) * 100 
    : 0;

  const gauges = {
    overallProgress,
    averageConsistency,
    systemLoad: calculateSystemLoad(recentEvents),
    responseTime: calculateAverageResponseTime(recentEvents),
    errorRate: calculateErrorRate(recentEvents)
  };

  // 히스토그램 데이터 계산
  const comparisonTimes = recentEvents
    .filter(e => e.eventType === 'comparison_submitted' && e.duration)
    .map(e => e.duration!);
    
  const sessionDurations = recentEvents
    .filter(e => e.eventType === 'evaluation_completed' && e.totalTime)
    .map(e => e.totalTime!);

  const histograms = {
    comparisonTimes,
    sessionDurations,
    consistencyRatios
  };

  return {
    projectId: recentEvents[0]?.projectId || '',
    timestamp: now.toISOString(),
    counters,
    gauges,
    histograms
  };
}

/**
 * 시스템 로드 계산
 */
function calculateSystemLoad(events: EvaluationEvent[]): number {
  const eventCounts = events.reduce((acc, event) => {
    const minute = Math.floor(new Date(event.timestamp).getTime() / 60000);
    acc[minute] = (acc[minute] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const counts = Object.values(eventCounts);
  const avgEventsPerMinute = counts.length > 0 
    ? counts.reduce((sum, count) => sum + count, 0) / counts.length 
    : 0;

  // 분당 60개 이벤트를 100%로 가정
  return Math.min(100, (avgEventsPerMinute / 60) * 100);
}

/**
 * 평균 응답 시간 계산
 */
function calculateAverageResponseTime(events: EvaluationEvent[]): number {
  const responseTimes = events
    .filter(e => e.duration !== undefined)
    .map(e => e.duration!);
    
  return responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;
}

/**
 * 오류율 계산
 */
function calculateErrorRate(events: EvaluationEvent[]): number {
  const errorEvents = events.filter(e => 
    e.eventData.error || e.eventData.status === 'error'
  );
  
  return events.length > 0 
    ? (errorEvents.length / events.length) * 100 
    : 0;
}

/**
 * 통계적 이상 탐지
 */
export function detectStatisticalAnomalies(
  metrics: RealtimeMetrics[],
  threshold: number = 2.0 // Z-score 임계값
): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = [];
  
  if (metrics.length < 10) return anomalies; // 충분한 데이터 필요
  
  // 각 메트릭에 대해 Z-score 계산
  const metricKeys = [
    'counters.totalComparisons',
    'gauges.averageConsistency',
    'gauges.responseTime',
    'gauges.errorRate'
  ];
  
  metricKeys.forEach(metricKey => {
    const values = metrics.map(m => getNestedValue(m, metricKey)).filter((v): v is number => v !== undefined);
    
    if (values.length < 10) return;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const latestValue = values[values.length - 1];
    const zScore = stdDev > 0 ? Math.abs(latestValue - mean) / stdDev : 0;
    
    if (zScore > threshold) {
      anomalies.push({
        id: `stat_${Date.now()}_${metricKey}`,
        type: 'statistical',
        severity: zScore > 3 ? 'high' : 'medium',
        title: `Statistical Anomaly in ${metricKey}`,
        description: `Z-score: ${zScore.toFixed(2)}, Current: ${latestValue}, Expected: ${mean.toFixed(2)}`,
        affectedEntities: [metricKey],
        detectedAt: new Date().toISOString(),
        metadata: {
          threshold,
          actualValue: latestValue,
          confidence: Math.min(1, zScore / 4),
          suggestions: generateStatisticalSuggestions(metricKey, zScore, latestValue, mean)
        },
        actions: [
          {
            type: 'notify',
            description: 'Send alert notification',
            completed: false
          },
          {
            type: 'investigate',
            description: 'Analyze root cause',
            completed: false
          }
        ]
      });
    }
  });
  
  return anomalies;
}

/**
 * 패턴 기반 이상 탐지
 */
export function detectPatternAnomalies(
  events: EvaluationEvent[],
  timeWindow: number = 3600000 // 1시간
): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = [];
  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindow);
  
  const recentEvents = events.filter(event => 
    new Date(event.timestamp) >= windowStart
  );

  // 1. 급격한 활동 증가 감지
  const rapidIncrease = detectRapidActivityIncrease(recentEvents);
  if (rapidIncrease) anomalies.push(rapidIncrease);

  // 2. 비정상적인 비활성화 패턴 감지
  const inactivityPattern = detectInactivityPattern(recentEvents);
  if (inactivityPattern) anomalies.push(inactivityPattern);

  // 3. 일관성 급락 패턴 감지
  const consistencyDrop = detectConsistencyDrop(recentEvents);
  if (consistencyDrop) anomalies.push(consistencyDrop);

  return anomalies;
}

/**
 * 급격한 활동 증가 감지
 */
function detectRapidActivityIncrease(events: EvaluationEvent[]): AnomalyDetection | null {
  if (events.length < 20) return null;
  
  // 5분 단위로 이벤트 그룹화
  const buckets = groupEventsByTimeBucket(events, 300000); // 5분
  const counts = Object.values(buckets).map(bucket => bucket.length);
  
  if (counts.length < 4) return null;
  
  const recent = counts.slice(-2).reduce((sum, count) => sum + count, 0);
  const baseline = counts.slice(0, -2).reduce((sum, count) => sum + count, 0) / (counts.length - 2);
  
  const increaseRatio = baseline > 0 ? recent / baseline : 0;
  
  if (increaseRatio > 3.0) { // 3배 이상 증가
    return {
      id: `pattern_rapid_${Date.now()}`,
      type: 'pattern',
      severity: increaseRatio > 5 ? 'high' : 'medium',
      title: 'Rapid Activity Increase Detected',
      description: `Activity increased by ${(increaseRatio * 100).toFixed(0)}% in the last 10 minutes`,
      affectedEntities: ['activity_rate'],
      detectedAt: new Date().toISOString(),
      metadata: {
        pattern: 'rapid_increase',
        actualValue: recent,
        threshold: baseline * 3,
        confidence: Math.min(1, increaseRatio / 5),
        suggestions: [
          'Check for potential bot activity or unusual evaluation patterns',
          'Monitor server resources for capacity planning',
          'Verify data integrity of recent submissions'
        ]
      },
      actions: [
        {
          type: 'notify',
          description: 'Alert administrators',
          completed: false
        },
        {
          type: 'investigate',
          description: 'Analyze recent user activity',
          completed: false
        }
      ]
    };
  }
  
  return null;
}

/**
 * 비활성화 패턴 감지
 */
function detectInactivityPattern(events: EvaluationEvent[]): AnomalyDetection | null {
  const now = new Date();
  const lastHour = new Date(now.getTime() - 3600000);
  const recentEvents = events.filter(e => new Date(e.timestamp) >= lastHour);
  
  if (recentEvents.length === 0) {
    return {
      id: `pattern_inactive_${Date.now()}`,
      type: 'pattern',
      severity: 'medium',
      title: 'Complete Inactivity Detected',
      description: 'No evaluation activity in the last hour',
      affectedEntities: ['all_evaluators'],
      detectedAt: new Date().toISOString(),
      metadata: {
        pattern: 'inactivity',
        actualValue: 0,
        confidence: 0.9,
        suggestions: [
          'Check system connectivity and availability',
          'Verify evaluator notifications are working',
          'Review evaluation deadlines and schedules'
        ]
      },
      actions: [
        {
          type: 'notify',
          description: 'Alert project managers',
          completed: false
        },
        {
          type: 'auto_fix',
          description: 'Send reminder notifications',
          completed: false
        }
      ]
    };
  }
  
  return null;
}

/**
 * 일관성 급락 감지
 */
function detectConsistencyDrop(events: EvaluationEvent[]): AnomalyDetection | null {
  const completionEvents = events.filter(e => 
    e.eventType === 'node_completed' && e.consistencyRatio !== undefined
  );
  
  if (completionEvents.length < 10) return null;
  
  const recentCR = completionEvents.slice(-5).map(e => e.consistencyRatio!);
  const baselineCR = completionEvents.slice(0, -5).map(e => e.consistencyRatio!);
  
  if (recentCR.length < 3 || baselineCR.length < 3) return null;
  
  const recentAvg = recentCR.reduce((sum, cr) => sum + cr, 0) / recentCR.length;
  const baselineAvg = baselineCR.reduce((sum, cr) => sum + cr, 0) / baselineCR.length;
  
  const dropRatio = baselineAvg > 0 ? (baselineAvg - recentAvg) / baselineAvg : 0;
  
  if (dropRatio > 0.3 && recentAvg > 0.15) { // 30% 감소 && CR > 0.15
    return {
      id: `pattern_consistency_${Date.now()}`,
      type: 'pattern',
      severity: dropRatio > 0.5 ? 'high' : 'medium',
      title: 'Consistency Quality Drop',
      description: `Average consistency ratio dropped by ${(dropRatio * 100).toFixed(1)}%`,
      affectedEntities: ['consistency_quality'],
      detectedAt: new Date().toISOString(),
      metadata: {
        pattern: 'consistency_drop',
        actualValue: recentAvg,
        threshold: baselineAvg * 0.7,
        confidence: Math.min(1, dropRatio / 0.5),
        suggestions: [
          'Provide additional training on AHP evaluation methods',
          'Review and clarify evaluation criteria',
          'Consider implementing consistency improvement suggestions',
          'Check for evaluator fatigue or rush completion'
        ]
      },
      actions: [
        {
          type: 'notify',
          description: 'Alert evaluation coordinators',
          completed: false
        },
        {
          type: 'auto_fix',
          description: 'Suggest consistency improvements',
          completed: false
        }
      ]
    };
  }
  
  return null;
}

/**
 * 트렌드 분석
 */
export function analyzeTrend(
  values: number[],
  timestamps: string[],
  metricName: string
): TrendAnalysis {
  if (values.length < 3) {
    throw new Error('Insufficient data for trend analysis');
  }

  const timeRange = {
    start: timestamps[0],
    end: timestamps[timestamps.length - 1]
  };

  // 선형 회귀로 트렌드 계산
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 변화율 계산
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const changeRate = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  // 트렌드 방향 결정
  let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  if (Math.abs(changeRate) < 5) {
    trend = 'stable';
  } else if (slope > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }

  // 변동성 계산
  const mean = sumY / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const coefficient = mean !== 0 ? Math.sqrt(variance) / mean : 0;
  
  if (coefficient > 0.3) {
    trend = 'volatile';
  }

  // 유의성 계산
  const significance: 'low' | 'medium' | 'high' = 
    Math.abs(changeRate) > 20 ? 'high' :
    Math.abs(changeRate) > 10 ? 'medium' : 'low';

  return {
    metric: metricName,
    timeRange,
    trend,
    changeRate,
    significance
  };
}

/**
 * 유틸리티 함수들
 */
function getNestedValue(obj: any, path: string): number | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function groupEventsByTimeBucket(
  events: EvaluationEvent[], 
  bucketSize: number
): Record<number, EvaluationEvent[]> {
  return events.reduce((buckets, event) => {
    const bucket = Math.floor(new Date(event.timestamp).getTime() / bucketSize);
    if (!buckets[bucket]) buckets[bucket] = [];
    buckets[bucket].push(event);
    return buckets;
  }, {} as Record<number, EvaluationEvent[]>);
}

function generateStatisticalSuggestions(
  metric: string, 
  zScore: number, 
  actualValue: number, 
  expectedValue: number
): string[] {
  const suggestions: string[] = [];
  
  if (metric.includes('responseTime')) {
    suggestions.push('Check server resources and database performance');
    suggestions.push('Review recent code deployments for performance regressions');
    if (actualValue > expectedValue * 2) {
      suggestions.push('Consider scaling up infrastructure');
    }
  } else if (metric.includes('errorRate')) {
    suggestions.push('Check application logs for error patterns');
    suggestions.push('Verify API endpoints and database connectivity');
  } else if (metric.includes('consistency')) {
    suggestions.push('Provide evaluator guidance and training');
    suggestions.push('Review evaluation criteria clarity');
  } else if (metric.includes('comparisons')) {
    suggestions.push('Monitor for unusual user activity patterns');
    suggestions.push('Check for potential automated submissions');
  }
  
  return suggestions;
}