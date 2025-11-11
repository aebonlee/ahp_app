// AI 기반 결과 해석 컴포넌트
// Opus 4.1 설계 기반

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentTextIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import type {
  ComprehensiveAnalysisResults,
  Insight,
  Recommendation,
  AnalysisStatus
} from '../../types/analysis';

interface AIResultInterpretationProps {
  analysisResults: ComprehensiveAnalysisResults;
  onInsightAction?: (insight: Insight, action: string) => void;
  onRecommendationAccept?: (recommendation: Recommendation) => void;
  showAdvancedInsights?: boolean;
}

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

interface AIRecommendation {
  id: string;
  type: 'immediate' | 'strategic' | 'preventive' | 'optimization';
  title: string;
  description: string;
  rationale: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: 'short' | 'medium' | 'long';
  confidence: number;
  prerequisites?: string[];
  risks?: string[];
  alternatives?: string[];
}

const AIResultInterpretation: React.FC<AIResultInterpretationProps> = ({
  analysisResults,
  onInsightAction,
  onRecommendationAccept,
  showAdvancedInsights = true
}) => {
  // State 관리
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [interpretationMode, setInterpretationMode] = useState<'summary' | 'detailed' | 'expert'>('summary');

  // AI 인사이트 생성
  const generateInsights = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/analysis/ai-interpretation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          analysisResults,
          mode: interpretationMode,
          includeAdvanced: showAdvancedInsights
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('AI 인사이트 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [analysisResults, interpretationMode, showAdvancedInsights]);

  // 초기 인사이트 생성
  useEffect(() => {
    if (analysisResults) {
      generateInsights();
    }
  }, [analysisResults, generateInsights]);

  // 인사이트 필터링
  const filteredInsights = useMemo(() => {
    if (selectedCategory === 'all') return insights;
    return insights.filter(insight => insight.category === selectedCategory);
  }, [insights, selectedCategory]);

  // 인사이트 유형별 아이콘
  const getInsightIcon = useCallback((type: string) => {
    switch (type) {
      case 'pattern':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'anomaly':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'risk':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'opportunity':
        return <LightBulbIcon className="h-5 w-5" />;
      case 'trend':
        return <ArrowTrendingUpIcon className="h-5 w-5" />;
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  }, []);

  // 인사이트 유형별 색상
  const getInsightColor = useCallback((type: string) => {
    switch (type) {
      case 'pattern':
        return 'blue';
      case 'anomaly':
        return 'red';
      case 'risk':
        return 'orange';
      case 'opportunity':
        return 'green';
      case 'trend':
        return 'purple';
      default:
        return 'gray';
    }
  }, []);

  // 신뢰도 표시 컴포넌트
  const ConfidenceBadge: React.FC<{ confidence: number }> = ({ confidence }) => (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < Math.round(confidence * 5) ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-600">{(confidence * 100).toFixed(0)}%</span>
    </div>
  );

  // 요약 통계
  const summaryStats = useMemo(() => {
    const highImpactInsights = insights.filter(i => i.impact === 'high').length;
    const averageConfidence = insights.length > 0 
      ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length 
      : 0;
    const criticalRecommendations = recommendations.filter(r => r.type === 'immediate').length;
    const opportunitiesCount = insights.filter(i => i.type === 'opportunity').length;

    return {
      highImpactInsights,
      averageConfidence,
      criticalRecommendations,
      opportunitiesCount
    };
  }, [insights, recommendations]);

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <SparklesIcon className="h-7 w-7 text-purple-600" />
            <span>AI 결과 해석</span>
          </h1>
          <p className="text-gray-600">
            인공지능이 분석 결과를 해석하고 인사이트를 제공합니다.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={interpretationMode}
            onChange={(e) => setInterpretationMode(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="summary">요약</option>
            <option value="detailed">상세</option>
            <option value="expert">전문가</option>
          </select>
          
          <Button
            onClick={generateInsights}
            disabled={isGenerating}
            className="flex items-center space-x-2"
          >
            <CpuChipIcon className="h-4 w-4" />
            <span>{isGenerating ? '분석 중...' : '재분석'}</span>
          </Button>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isGenerating && (
        <Card>
          <div className="p-6 text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-gray-700">AI가 결과를 분석하고 있습니다...</span>
            </div>
          </div>
        </Card>
      )}

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">핵심 인사이트</p>
                <p className="text-2xl font-bold text-purple-600">
                  {summaryStats.highImpactInsights}개
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">높은 영향도</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 신뢰도</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(summaryStats.averageConfidence * 100).toFixed(0)}%
                </p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">AI 분석 신뢰도</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">긴급 권고</p>
                <p className="text-2xl font-bold text-red-600">
                  {summaryStats.criticalRecommendations}개
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">즉시 조치 필요</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">기회 발견</p>
                <p className="text-2xl font-bold text-green-600">
                  {summaryStats.opportunitiesCount}개
                </p>
              </div>
              <LightBulbIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">개선 기회</p>
          </div>
        </Card>
      </div>

      {/* 인사이트 필터 */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">발견된 인사이트</h3>
            <div className="flex space-x-2">
              {['all', 'ranking', 'sensitivity', 'stability', 'consistency', 'performance'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? '전체' :
                   category === 'ranking' ? '순위' :
                   category === 'sensitivity' ? '민감도' :
                   category === 'stability' ? '안정성' :
                   category === 'consistency' ? '일관성' : '성능'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 인사이트 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredInsights.length === 0 ? (
            <Card>
              <div className="p-8 text-center text-gray-500">
                <InformationCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>해당 카테고리의 인사이트가 없습니다.</p>
              </div>
            </Card>
          ) : (
            filteredInsights.map(insight => {
              const color = getInsightColor(insight.type);
              const icon = getInsightIcon(insight.type);
              
              return (
                <Card
                  key={insight.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedInsight?.id === insight.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-md bg-${color}-100 text-${color}-600`}>
                        {icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                              insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {insight.impact === 'high' ? '높음' :
                               insight.impact === 'medium' ? '보통' : '낮음'}
                            </span>
                            <ConfidenceBadge confidence={insight.confidence} />
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-xs px-2 py-1 rounded-full bg-${color}-50 text-${color}-700`}>
                            {insight.type === 'pattern' ? '패턴' :
                             insight.type === 'anomaly' ? '이상징후' :
                             insight.type === 'risk' ? '위험' :
                             insight.type === 'opportunity' ? '기회' : '트렌드'}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {insight.evidence.length}개 증거
                            </span>
                            <span className="text-xs text-gray-500">
                              우선도 {insight.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* 선택된 인사이트 상세 정보 */}
        <div>
          {selectedInsight ? (
            <Card>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedInsight.title}
                  </h3>
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">상세 설명</h4>
                    <p className="text-sm text-gray-700">{selectedInsight.description}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">증거 자료</h4>
                    <ul className="space-y-1">
                      {selectedInsight.evidence.map((evidence, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="mr-2 text-gray-400">•</span>
                          <span>{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">권장 조치</h4>
                    <ul className="space-y-1">
                      {selectedInsight.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="mr-2 text-green-500">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <ConfidenceBadge confidence={selectedInsight.confidence} />
                      <span className="text-xs text-gray-500">
                        {new Date(selectedInsight.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onInsightAction?.(selectedInsight as any, 'bookmark')}
                      >
                        북마크
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onInsightAction?.(selectedInsight as any, 'implement')}
                      >
                        조치 계획
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-8 text-center text-gray-500">
                <EyeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>인사이트를 선택하면 상세 정보를 확인할 수 있습니다.</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 권고사항 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
            AI 권고사항
          </h3>
          
          <div className="space-y-4">
            {recommendations.map(rec => (
              <div key={rec.id} 
                   className={`p-4 rounded-md border-l-4 ${
                     rec.type === 'immediate' ? 'border-red-400 bg-red-50' :
                     rec.type === 'strategic' ? 'border-blue-400 bg-blue-50' :
                     rec.type === 'preventive' ? 'border-yellow-400 bg-yellow-50' :
                     'border-green-400 bg-green-50'
                   }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.type === 'immediate' ? 'bg-red-100 text-red-800' :
                        rec.type === 'strategic' ? 'bg-blue-100 text-blue-800' :
                        rec.type === 'preventive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.type === 'immediate' ? '긴급' :
                         rec.type === 'strategic' ? '전략적' :
                         rec.type === 'preventive' ? '예방적' : '최적화'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.effort === 'high' ? 'bg-red-100 text-red-800' :
                        rec.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.effort === 'high' ? '높은 노력' :
                         rec.effort === 'medium' ? '보통 노력' : '낮은 노력'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>근거:</strong> {rec.rationale}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>예상 효과:</strong> {rec.expectedImpact}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>기간: {
                        rec.timeframe === 'short' ? '단기' :
                        rec.timeframe === 'medium' ? '중기' : '장기'
                      }</span>
                      <ConfidenceBadge confidence={rec.confidence} />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onRecommendationAccept?.(rec as any)}
                    >
                      상세보기
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onRecommendationAccept?.(rec as any)}
                    >
                      적용
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIResultInterpretation;