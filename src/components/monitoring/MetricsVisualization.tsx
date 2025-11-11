// 성능 메트릭 시각화 컴포넌트
// Opus 4.1 설계 기반

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import type {
  RealtimeMetrics,
  PerformanceMetrics,
  TrendAnalysis,
  MetricsChartProps,
  DashboardFilter
} from '../../types/monitoring';

interface MetricsVisualizationProps {
  projectId?: string;
  timeRange: { start: string; end: string };
  refreshInterval?: number;
  showPredictions?: boolean;
  chartHeight?: number;
}

interface ChartPoint {
  timestamp: string;
  value: number;
  label?: string;
}

const MetricsVisualization: React.FC<MetricsVisualizationProps> = ({
  projectId,
  timeRange,
  refreshInterval = 30000,
  showPredictions = false,
  chartHeight = 300
}) => {
  // State 관리
  const [metricsHistory, setMetricsHistory] = useState<RealtimeMetrics[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('overallProgress');
  const [trends, setTrends] = useState<Record<string, TrendAnalysis>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 메트릭 옵션 정의
  const metricOptions = [
    { key: 'overallProgress', label: '전체 진행률', unit: '%', color: '#3B82F6' },
    { key: 'averageConsistency', label: '평균 일관성', unit: '', color: '#10B981' },
    { key: 'responseTime', label: '응답 시간', unit: 'ms', color: '#F59E0B' },
    { key: 'activeEvaluators', label: '활성 평가자', unit: '명', color: '#8B5CF6' },
    { key: 'totalComparisons', label: '총 비교 수', unit: '개', color: '#EF4444' },
    { key: 'errorRate', label: '오류율', unit: '%', color: '#F97316' }
  ];

  // 히스토리컬 데이터 로드
  const loadMetricsHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        granularity: '5m',
        start: timeRange.start,
        end: timeRange.end
      });

      if (projectId) {
        queryParams.append('projectId', projectId);
      }

      const [metricsRes, performanceRes] = await Promise.all([
        fetch(`/api/monitoring/metrics/historical?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`/api/monitoring/performance/history?${queryParams}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        if (metricsData.success && metricsData.data) {
          setMetricsHistory(metricsData.data);
        }
      }

      if (performanceRes.ok) {
        const perfData = await performanceRes.json();
        if (perfData.success && perfData.data) {
          setPerformanceHistory(perfData.data);
        }
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('메트릭 히스토리 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, projectId]);

  // 트렌드 분석 로드
  const loadTrendAnalysis = useCallback(async () => {
    try {
      const trendsPromises = metricOptions.map(async (option) => {
        const response = await fetch(`/api/monitoring/trends/${option.key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ timeRange, projectId })
        });

        if (response.ok) {
          const trendData = await response.json();
          if (trendData.success && trendData.data) {
            return [option.key, trendData.data];
          }
        }
        return [option.key, null];
      });

      const trendsResults = await Promise.all(trendsPromises);
      const trendsMap: Record<string, TrendAnalysis> = {};
      trendsResults.forEach(([key, trend]) => {
        if (trend) trendsMap[key as string] = trend as TrendAnalysis;
      });
      
      setTrends(trendsMap);
    } catch (error) {
      console.error('트렌드 분석 로드 실패:', error);
    }
  }, [timeRange, projectId]);

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (metricsHistory.length === 0) return [];

    const selectedOption = metricOptions.find(opt => opt.key === selectedMetric);
    if (!selectedOption) return [];

    return metricsHistory.map(metric => {
      let value: number;
      
      if (selectedMetric.startsWith('counters.')) {
        const key = selectedMetric.replace('counters.', '');
        value = (metric.counters as any)[key] || 0;
      } else if (selectedMetric.startsWith('gauges.')) {
        const key = selectedMetric.replace('gauges.', '');
        value = (metric.gauges as any)[key] || 0;
      } else {
        // 직접 매핑
        switch (selectedMetric) {
          case 'overallProgress':
            value = metric.gauges.overallProgress;
            break;
          case 'averageConsistency':
            value = metric.gauges.averageConsistency;
            break;
          case 'responseTime':
            value = metric.gauges.responseTime;
            break;
          case 'activeEvaluators':
            value = metric.counters.activeEvaluators;
            break;
          case 'totalComparisons':
            value = metric.counters.totalComparisons;
            break;
          case 'errorRate':
            value = metric.gauges.errorRate;
            break;
          default:
            value = 0;
        }
      }

      return {
        timestamp: metric.timestamp,
        value,
        label: new Date(metric.timestamp).toLocaleTimeString()
      };
    });
  }, [metricsHistory, selectedMetric]);

  // SVG 차트 컴포넌트
  const LineChart: React.FC<{ data: ChartPoint[]; color: string; height: number }> = ({
    data,
    color,
    height
  }) => {
    if (data.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">데이터 없음</div>;

    const width = 800;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    // 좌표 변환
    const getX = (index: number) => padding + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

    // 패스 생성
    const pathData = data.map((point, index) => {
      const x = getX(index);
      const y = getY(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    // 그리드 라인
    const gridLines = [];
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      const value = maxValue - (i / 5) * valueRange;
      gridLines.push(
        <g key={i}>
          <line
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
          <text
            x={padding - 10}
            y={y + 5}
            textAnchor="end"
            fontSize="12"
            fill="#6B7280"
          >
            {value.toFixed(1)}
          </text>
        </g>
      );
    }

    return (
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* 그리드 */}
          {gridLines}
          
          {/* 영역 */}
          <defs>
            <linearGradient id={`gradient-${selectedMetric}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          <path
            d={`${pathData} L ${getX(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`}
            fill={`url(#gradient-${selectedMetric})`}
          />
          
          {/* 라인 */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* 데이터 포인트 */}
          {data.map((point, index) => (
            <circle
              key={index}
              cx={getX(index)}
              cy={getY(point.value)}
              r="3"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          ))}
        </svg>
        
        {/* 호버 툴팁 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-10">
          {data.length > 0 && (
            <>
              <span>{new Date(data[0].timestamp).toLocaleTimeString()}</span>
              <span>{new Date(data[data.length - 1].timestamp).toLocaleTimeString()}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  // 메트릭 카드 컴포넌트
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    unit: string;
    trend?: TrendAnalysis;
    color: string;
    icon: React.ReactNode;
  }> = ({ title, value, unit, trend, color, icon }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {typeof value === 'number' ? value.toFixed(2) : value}
            <span className="text-sm text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div style={{ color }}>{icon}</div>
          {trend && (
            <div className={`flex items-center text-xs px-2 py-1 rounded ${
              trend.trend === 'increasing' ? 'bg-green-100 text-green-800' :
              trend.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
              trend.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {trend.trend === 'increasing' && <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />}
              {trend.trend === 'decreasing' && <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
              <span>
                {trend.changeRate > 0 ? '+' : ''}{trend.changeRate.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
      {trend && (
        <div className="mt-2 text-xs text-gray-500">
          {trend.significance === 'high' ? '유의미한 ' :
           trend.significance === 'medium' ? '보통의 ' : '미미한 '}
          {trend.trend === 'increasing' ? '증가' :
           trend.trend === 'decreasing' ? '감소' :
           trend.trend === 'stable' ? '안정' : '변동'}
          세
        </div>
      )}
    </Card>
  );

  // 최신 메트릭 가져오기
  const latestMetrics = metricsHistory[metricsHistory.length - 1];
  
  // 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      loadMetricsHistory();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [loadMetricsHistory, refreshInterval]);

  // 초기 데이터 로드
  useEffect(() => {
    loadMetricsHistory();
    loadTrendAnalysis();
  }, [loadMetricsHistory, loadTrendAnalysis]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">성능 메트릭</h2>
          <p className="text-gray-600">실시간 시스템 성능 및 사용자 활동 지표</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              loadMetricsHistory();
              loadTrendAnalysis();
            }}
            disabled={isLoading}
          >
            새로고침
          </Button>
        </div>
      </div>

      {/* 메트릭 카드들 */}
      {latestMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title="전체 진행률"
            value={latestMetrics.gauges.overallProgress}
            unit="%"
            trend={trends.overallProgress}
            color="#3B82F6"
            icon={<ChartBarIcon className="h-6 w-6" />}
          />
          <MetricCard
            title="평균 일관성"
            value={latestMetrics.gauges.averageConsistency}
            unit=""
            trend={trends.averageConsistency}
            color="#10B981"
            icon={<CpuChipIcon className="h-6 w-6" />}
          />
          <MetricCard
            title="응답 시간"
            value={latestMetrics.gauges.responseTime}
            unit="ms"
            trend={trends.responseTime}
            color="#F59E0B"
            icon={<ClockIcon className="h-6 w-6" />}
          />
          <MetricCard
            title="활성 평가자"
            value={latestMetrics.counters.activeEvaluators}
            unit="명"
            trend={trends.activeEvaluators}
            color="#8B5CF6"
            icon={<EyeIcon className="h-6 w-6" />}
          />
          <MetricCard
            title="총 비교 수"
            value={latestMetrics.counters.totalComparisons}
            unit="개"
            trend={trends.totalComparisons}
            color="#EF4444"
            icon={<SignalIcon className="h-6 w-6" />}
          />
          <MetricCard
            title="오류율"
            value={latestMetrics.gauges.errorRate}
            unit="%"
            trend={trends.errorRate}
            color="#F97316"
            icon={<SignalIcon className="h-6 w-6" />}
          />
        </div>
      )}

      {/* 차트 영역 */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">시계열 차트</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {metricOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="h-80">
              <LineChart
                data={chartData}
                color={metricOptions.find(opt => opt.key === selectedMetric)?.color || '#3B82F6'}
                height={chartHeight}
              />
            </div>
          )}
        </div>
      </Card>

      {/* 히스토그램 (선택적) */}
      {latestMetrics && latestMetrics.histograms && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 비교 시간 분포 */}
          {latestMetrics.histograms.comparisonTimes.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="font-semibold mb-3">비교 시간 분포</h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    평균: {(latestMetrics.histograms.comparisonTimes.reduce((sum, time) => sum + time, 0) / 
                           latestMetrics.histograms.comparisonTimes.length).toFixed(1)}초
                  </div>
                  <div className="text-sm text-gray-600">
                    샘플: {latestMetrics.histograms.comparisonTimes.length}개
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 세션 지속시간 분포 */}
          {latestMetrics.histograms.sessionDurations.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="font-semibold mb-3">세션 지속시간 분포</h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    평균: {(latestMetrics.histograms.sessionDurations.reduce((sum, duration) => sum + duration, 0) / 
                           latestMetrics.histograms.sessionDurations.length / 60).toFixed(1)}분
                  </div>
                  <div className="text-sm text-gray-600">
                    샘플: {latestMetrics.histograms.sessionDurations.length}개
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 일관성 비율 분포 */}
          {latestMetrics.histograms.consistencyRatios.length > 0 && (
            <Card>
              <div className="p-4">
                <h3 className="font-semibold mb-3">일관성 비율 분포</h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    평균: {(latestMetrics.histograms.consistencyRatios.reduce((sum, cr) => sum + cr, 0) / 
                           latestMetrics.histograms.consistencyRatios.length).toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600">
                    일관성 통과: {latestMetrics.histograms.consistencyRatios.filter(cr => cr <= 0.1).length}/
                                 {latestMetrics.histograms.consistencyRatios.length}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricsVisualization;