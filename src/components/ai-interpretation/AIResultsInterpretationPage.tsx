/**
 * AI 결과 분석 & 해석 페이지
 * AHP 평가 결과를 AI가 분석하고 해석하여 의사결정 인사이트를 제공하는 시스템
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../common/PageHeader';
import cleanDataService from '../../services/dataService_clean';
import { getAIService } from '../../services/aiService';
import type { User } from '../../types';

interface Project {
  id?: string;
  title: string;
  description: string;
  status: string;
  criteria_count?: number;
  alternatives_count?: number;
  evaluator_count?: number;
  completion_rate?: number;
}

interface AnalysisResult {
  projectId: string;
  projectTitle: string;
  timestamp: string;
  rankings: Alternative[];
  weights: Criterion[];
  consistencyRatio: number;
  sensitivity: SensitivityData;
  insights: Insight[];
}

interface Alternative {
  id: string;
  name: string;
  score: number;
  rank: number;
  description?: string;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
  localWeight: number;
  globalWeight: number;
}

interface SensitivityData {
  critical: string[];
  stable: string[];
  threshold: number;
}

interface Insight {
  type: 'strength' | 'weakness' | 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedData?: any;
}

interface AIResultsInterpretationPageProps {
  user?: User;
}

const AIResultsInterpretationPage: React.FC<AIResultsInterpretationPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<string>('project-selection');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [interpretationSettings, setInterpretationSettings] = useState({
    analysisDepth: 'comprehensive',
    language: 'korean',
    includeVisualizations: true,
    includeSensitivity: true,
    includeRecommendations: true,
    comparisonMode: false
  });

  const tabs = [
    { id: 'project-selection', title: '프로젝트 선택', icon: '📊' },
    { id: 'results-overview', title: '결과 개요', icon: '📈' },
    { id: 'ai-analysis', title: 'AI 분석', icon: '🤖' },
    { id: 'insights', title: '인사이트', icon: '💡' },
    { id: 'recommendations', title: '권장사항', icon: '✅' }
  ];

  // 프로젝트 목록 로드
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await cleanDataService.getProjects();
      // 완료된 프로젝트만 필터링
      const completedProjects = (projectsData || []).filter(
        (p: any) => p.status === 'completed' || p.completion_rate === 100
      );
      setProjects(completedProjects);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 프로젝트 선택 및 결과 로드
  const selectProjectAndLoadResults = async (project: Project) => {
    if (!project.id) {
      console.error('프로젝트 ID가 없습니다.');
      return;
    }

    setSelectedProject(project);
    setLoading(true);
    
    try {
      // 프로젝트의 평가 결과 데이터 로드
      const [criteria, alternatives, evaluations] = await Promise.all([
        cleanDataService.getCriteria(project.id),
        cleanDataService.getAlternatives(project.id),
        cleanDataService.getEvaluators(project.id)
      ]);

      // 임시 결과 데이터 생성 (실제로는 백엔드에서 계산된 결과를 받아옴)
      const mockResult: AnalysisResult = {
        projectId: project.id,
        projectTitle: project.title,
        timestamp: new Date().toISOString(),
        rankings: (alternatives || []).map((alt: any, index: number) => ({
          id: alt.id || `alt-${index}`,
          name: alt.name,
          score: Math.random() * 100,
          rank: index + 1,
          description: alt.description
        })).sort((a: Alternative, b: Alternative) => b.score - a.score),
        weights: (criteria || []).map((crit: any) => ({
          id: crit.id || '',
          name: crit.name,
          weight: Math.random(),
          localWeight: Math.random(),
          globalWeight: Math.random()
        })),
        consistencyRatio: 0.08,
        sensitivity: {
          critical: ['가격', '품질'],
          stable: ['브랜드', '서비스'],
          threshold: 0.15
        },
        insights: []
      };

      setAnalysisResult(mockResult);
      setActiveTab('results-overview');
      
      // AI 분석 자동 시작
      startAIAnalysis(mockResult);
    } catch (error) {
      console.error('결과 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI 분석 시작
  const startAIAnalysis = async (result: AnalysisResult) => {
    setAnalyzing(true);
    
    try {
      // 실제 AI 분석 호출
      const aiService = getAIService();
      let aiInterpretation = '';
      
      if (aiService) {
        try {
          aiInterpretation = await aiService.interpretAHPResults(selectedProject, result);
        } catch (error) {
          console.error('AI 분석 실패:', error);
        }
      }
      
      // AI 분석 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights: Insight[] = [
        {
          type: 'strength',
          title: '명확한 우선순위 도출',
          description: `${result.rankings[0].name}이(가) ${result.rankings[0].score.toFixed(2)}점으로 가장 높은 점수를 획득하여 명확한 최적 대안으로 선정되었습니다.`,
          priority: 'high'
        },
        {
          type: 'opportunity',
          title: '일관성 비율 우수',
          description: `일관성 비율이 ${result.consistencyRatio.toFixed(3)}으로 0.1 이하를 유지하여 평가의 신뢰성이 매우 높습니다.`,
          priority: 'high'
        },
        {
          type: 'risk',
          title: '민감도 분석 필요 항목',
          description: `'${result.sensitivity.critical.join(', ')}' 기준의 가중치 변화가 최종 순위에 큰 영향을 미칠 수 있으므로 추가 검토가 필요합니다.`,
          priority: 'medium'
        },
        {
          type: 'recommendation',
          title: '추가 검증 제안',
          description: '상위 3개 대안에 대한 세부 실행계획 수립과 리스크 평가를 수행하시기를 권장합니다.',
          priority: 'medium'
        },
        {
          type: 'weakness',
          title: '평가자 수 개선 여지',
          description: `현재 ${result.projectTitle}의 평가자 수가 제한적입니다. 더 많은 전문가 의견을 수렴하면 결과의 대표성을 높일 수 있습니다.`,
          priority: 'low'
        }
      ];
      
      setAnalysisResult(prev => prev ? { ...prev, insights } : null);
      setActiveTab('ai-analysis');
    } catch (error) {
      console.error('AI 분석 실패:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // 차트 데이터 생성
  const generateChartData = (result: AnalysisResult) => {
    return {
      barChart: {
        labels: result.rankings.map(r => r.name),
        data: result.rankings.map(r => r.score)
      },
      pieChart: {
        labels: result.weights.map(w => w.name),
        data: result.weights.map(w => w.weight * 100)
      },
      radarChart: {
        labels: result.weights.map(w => w.name),
        datasets: result.rankings.slice(0, 3).map(alt => ({
          label: alt.name,
          data: result.weights.map(() => Math.random() * 100)
        }))
      }
    };
  };

  // 결과 내보내기
  const exportAnalysis = (format: 'pdf' | 'word' | 'ppt') => {
    if (!analysisResult) return;
    
    console.log(`분석 결과를 ${format} 형식으로 내보내기:`, analysisResult);
    alert(`${format.toUpperCase()} 형식으로 분석 보고서가 생성되었습니다. (구현 예정)`);
  };

  const renderProjectSelection = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          📊 AI 분석할 프로젝트 선택
        </h2>
        <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
          완료된 AHP 프로젝트의 결과를 AI가 심층 분석하여 인사이트를 제공합니다.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
               style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>프로젝트를 불러오는 중...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-4xl mb-4">📋</div>
          <p className="text-xl mb-4" style={{ color: 'var(--text-secondary)' }}>
            완료된 프로젝트가 없습니다
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            AHP 평가를 완료한 후 AI 분석을 이용할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <div 
              key={project.id || `project-${index}`}
              className="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderColor: 'var(--border-light)'
              }}
              onClick={() => selectProjectAndLoadResults(project)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {project.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {project.description}
                  </p>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: 'var(--success-pastel)',
                    color: 'var(--success-dark)'
                  }}
                >
                  평가 완료
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span>📊 기준: {project.criteria_count || 0}개</span>
                  <span>🎯 대안: {project.alternatives_count || 0}개</span>
                  <span>👥 평가자: {project.evaluator_count || 0}명</span>
                </div>
                <button 
                  className="px-4 py-2 rounded font-medium text-white transition-colors"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectProjectAndLoadResults(project);
                  }}
                >
                  AI 분석 시작 →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderResultsOverview = () => {
    if (!analysisResult) return null;
    
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            📈 평가 결과 개요
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            프로젝트: <strong>{analysisResult.projectTitle}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              🏆 최종 순위
            </h3>
            <div className="space-y-3">
              {analysisResult.rankings.map((alt, index) => (
                <div key={alt.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{alt.name}</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                    {alt.score.toFixed(2)}점
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              ⚖️ 기준 가중치
            </h3>
            <div className="space-y-2">
              {analysisResult.weights.map((criterion) => (
                <div key={criterion.id}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>{criterion.name}</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {(criterion.weight * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${criterion.weight * 100}%`,
                        backgroundColor: 'var(--accent-primary)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              📊 평가 지표
            </h3>
            <div className="space-y-3">
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>일관성 비율 (CR)</span>
                <div className="text-2xl font-bold" 
                     style={{ color: analysisResult.consistencyRatio <= 0.1 ? 'var(--success-primary)' : 'var(--warning-primary)' }}>
                  {analysisResult.consistencyRatio.toFixed(3)}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {analysisResult.consistencyRatio <= 0.1 ? '✅ 일관성 있음' : '⚠️ 재검토 필요'}
                </span>
              </div>
              
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>민감도 분석</span>
                <div className="mt-1">
                  <span className="text-sm" style={{ color: 'var(--error-primary)' }}>
                    위험 기준: {analysisResult.sensitivity.critical.join(', ')}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-sm" style={{ color: 'var(--success-primary)' }}>
                    안정 기준: {analysisResult.sensitivity.stable.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {analyzing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
                 style={{ borderColor: 'var(--accent-primary)' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>AI가 결과를 분석하고 있습니다...</p>
          </div>
        )}
      </div>
    );
  };

  const renderAIAnalysis = () => {
    if (!analysisResult || !analysisResult.insights) return null;

    const insightsByType = {
      strength: analysisResult.insights.filter(i => i.type === 'strength'),
      weakness: analysisResult.insights.filter(i => i.type === 'weakness'),
      opportunity: analysisResult.insights.filter(i => i.type === 'opportunity'),
      risk: analysisResult.insights.filter(i => i.type === 'risk')
    };

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            🤖 AI 심층 분석
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            AI가 발견한 주요 패턴과 인사이트입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 강점 분석 */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--success-pastel)' }}>
            <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--success-dark)' }}>
              💪 강점 (Strengths)
            </h3>
            <div className="space-y-3">
              {insightsByType.strength.map((insight, index) => (
                <div key={index} className="p-3 rounded" style={{ backgroundColor: 'white' }}>
                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {insight.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 약점 분석 */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--warning-pastel)' }}>
            <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--warning-dark)' }}>
              ⚠️ 개선점 (Weaknesses)
            </h3>
            <div className="space-y-3">
              {insightsByType.weakness.map((insight, index) => (
                <div key={index} className="p-3 rounded" style={{ backgroundColor: 'white' }}>
                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {insight.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 기회 분석 */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--accent-pastel)' }}>
            <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--accent-dark)' }}>
              🚀 기회 (Opportunities)
            </h3>
            <div className="space-y-3">
              {insightsByType.opportunity.map((insight, index) => (
                <div key={index} className="p-3 rounded" style={{ backgroundColor: 'white' }}>
                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {insight.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 위험 분석 */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--error-pastel)' }}>
            <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--error-dark)' }}>
              ⚡ 위험 (Risks)
            </h3>
            <div className="space-y-3">
              {insightsByType.risk.map((insight, index) => (
                <div key={index} className="p-3 rounded" style={{ backgroundColor: 'white' }}>
                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {insight.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInsights = () => {
    if (!analysisResult || !analysisResult.insights) return null;

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            💡 핵심 인사이트
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            의사결정에 도움이 되는 핵심 발견사항입니다.
          </p>
        </div>

        <div className="space-y-4">
          {analysisResult.insights
            .sort((a, b) => {
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((insight, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: insight.priority === 'high' ? 'var(--error-primary)' :
                              insight.priority === 'medium' ? 'var(--warning-primary)' :
                              'var(--success-primary)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {insight.type === 'strength' ? '💪' :
                       insight.type === 'weakness' ? '⚠️' :
                       insight.type === 'opportunity' ? '🚀' :
                       insight.type === 'risk' ? '⚡' :
                       '✅'}
                    </span>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {insight.title}
                      </h3>
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: insight.priority === 'high' ? 'var(--error-pastel)' :
                                        insight.priority === 'medium' ? 'var(--warning-pastel)' :
                                        'var(--success-pastel)',
                          color: insight.priority === 'high' ? 'var(--error-dark)' :
                                insight.priority === 'medium' ? 'var(--warning-dark)' :
                                'var(--success-dark)'
                        }}
                      >
                        {insight.priority === 'high' ? '높음' :
                         insight.priority === 'medium' ? '중간' :
                         '낮음'}
                      </span>
                    </div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {insight.description}
                </p>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!analysisResult) return null;

    const recommendations = analysisResult.insights.filter(i => i.type === 'recommendation');

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            ✅ AI 권장사항
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            분석 결과를 바탕으로 한 실행 가능한 권장사항입니다.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--accent-pastel)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--accent-dark)' }}>
              🎯 최종 의사결정 권장사항
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded" style={{ backgroundColor: 'white' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  1차 선택: {analysisResult.rankings[0]?.name}
                </h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  종합 점수 {analysisResult.rankings[0]?.score.toFixed(2)}점으로 가장 높은 평가를 받았습니다.
                  모든 기준에서 균형잡힌 성과를 보이며, 특히 핵심 기준에서 우수한 평가를 받았습니다.
                </p>
              </div>
              
              {analysisResult.rankings[1] && (
                <div className="p-4 rounded" style={{ backgroundColor: 'white' }}>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    대안 선택: {analysisResult.rankings[1].name}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    2순위 대안으로 {analysisResult.rankings[1].score.toFixed(2)}점을 획득했습니다.
                    1순위와 근소한 차이를 보이므로 상황에 따라 고려할 만한 대안입니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              📋 후속 조치 사항
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-green-500">✓</span>
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {rec.title}
                    </h4>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {rec.description}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="flex items-start space-x-3">
                <span className="text-green-500">✓</span>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    실행 계획 수립
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    선택된 대안에 대한 구체적인 실행 계획과 일정을 수립하시기 바랍니다.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-green-500">✓</span>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    성과 모니터링
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    실행 후 주기적인 성과 측정과 피드백을 통해 의사결정의 효과성을 검증하시기 바랍니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 pt-6">
          <button
            onClick={() => exportAnalysis('pdf')}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--error-primary)' }}
          >
            📄 PDF 보고서
          </button>
          <button
            onClick={() => exportAnalysis('word')}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            📝 Word 문서
          </button>
          <button
            onClick={() => exportAnalysis('ppt')}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--warning-primary)' }}
          >
            📊 PPT 프레젠테이션
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'project-selection':
        return renderProjectSelection();
      case 'results-overview':
        return renderResultsOverview();
      case 'ai-analysis':
        return renderAIAnalysis();
      case 'insights':
        return renderInsights();
      case 'recommendations':
        return renderRecommendations();
      default:
        return renderProjectSelection();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <PageHeader
        title="AI 결과 분석 & 해석"
        description="AHP 평가 결과를 AI가 분석하고 해석하여 의사결정 인사이트를 제공합니다"
        icon="🤖"
        onBack={() => window.history.back()}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.id !== 'project-selection' && !selectedProject}
                className={`flex items-center space-x-2 px-4 py-2 rounded font-medium transition-all ${
                  activeTab === tab.id ? 'shadow-lg' : ''
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  opacity: tab.id !== 'project-selection' && !selectedProject ? 0.5 : 1
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AIResultsInterpretationPage;