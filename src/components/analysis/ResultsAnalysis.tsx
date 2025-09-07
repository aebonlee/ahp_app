import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface EvaluationProgress {
  evaluatorId: string;
  evaluatorName: string;
  completionRate: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lastActivity: string;
}

interface ResultRanking {
  id: string;
  name: string;
  priority: number;
  rank: number;
  type: 'criterion' | 'alternative';
}

interface ConsistencyData {
  evaluatorId: string;
  evaluatorName: string;
  consistencyRatio: number;
  isConsistent: boolean;
}

interface ResultsAnalysisProps {
  projectId: string;
  evaluationMode: 'practical' | 'theoretical' | 'direct_input';
}

const ResultsAnalysis: React.FC<ResultsAnalysisProps> = ({ projectId, evaluationMode }) => {
  const [activeView, setActiveView] = useState<'progress' | 'ranking' | 'consistency' | 'detailed'>('progress');
  const [viewMode, setViewMode] = useState<'distributive' | 'ideal'>('distributive');
  const [evaluationProgress, setEvaluationProgress] = useState<EvaluationProgress[]>([]);
  const [criteriaRanking, setCriteriaRanking] = useState<ResultRanking[]>([]);
  const [alternativeRanking, setAlternativeRanking] = useState<ResultRanking[]>([]);
  const [consistencyData, setConsistencyData] = useState<ConsistencyData[]>([]);
  const [loading, setLoading] = useState(false);

  // 가상 데이터 생성 (실제로는 API에서 가져올 데이터)
  useEffect(() => {
    generateMockData();
  }, [projectId]);

  const generateMockData = () => {
    // 평가 진행 상황 가상 데이터
    const mockProgress: EvaluationProgress[] = [
      { evaluatorId: '1', evaluatorName: '관리자', completionRate: 100, status: 'completed', lastActivity: '2024-02-15' },
      { evaluatorId: '2', evaluatorName: 'p001', completionRate: 100, status: 'completed', lastActivity: '2024-02-14' },
      { evaluatorId: '3', evaluatorName: 'p002', completionRate: 85, status: 'in_progress', lastActivity: '2024-02-13' },
      { evaluatorId: '4', evaluatorName: 'p003', completionRate: 100, status: 'completed', lastActivity: '2024-02-12' },
      { evaluatorId: '5', evaluatorName: 'p004', completionRate: 60, status: 'in_progress', lastActivity: '2024-02-11' },
    ];

    // 기준 순위 가상 데이터
    const mockCriteria: ResultRanking[] = [
      { id: '1', name: '코딩 작성 속도 향상', priority: 0.285, rank: 1, type: 'criterion' },
      { id: '2', name: '코드 품질 개선 및 최적화', priority: 0.245, rank: 2, type: 'criterion' },
      { id: '3', name: '디버깅 시간 단축', priority: 0.185, rank: 3, type: 'criterion' },
      { id: '4', name: '반복 작업 최소화', priority: 0.165, rank: 4, type: 'criterion' },
      { id: '5', name: 'AI생성 코딩의 신뢰성', priority: 0.120, rank: 5, type: 'criterion' },
    ];

    // 대안 순위 가상 데이터
    const mockAlternatives: ResultRanking[] = [
      { id: '1', name: 'Claude Code', priority: 0.325, rank: 1, type: 'alternative' },
      { id: '2', name: 'GitHub Copilot', priority: 0.285, rank: 2, type: 'alternative' },
      { id: '3', name: 'Cursor AI', priority: 0.185, rank: 3, type: 'alternative' },
      { id: '4', name: 'Tabnine', priority: 0.125, rank: 4, type: 'alternative' },
      { id: '5', name: 'Amazon CodeWhisperer', priority: 0.080, rank: 5, type: 'alternative' },
    ];

    // 일관성 데이터 가상 데이터
    const mockConsistency: ConsistencyData[] = [
      { evaluatorId: '1', evaluatorName: '관리자', consistencyRatio: 0.05, isConsistent: true },
      { evaluatorId: '2', evaluatorName: 'p001', consistencyRatio: 0.08, isConsistent: true },
      { evaluatorId: '3', evaluatorName: 'p002', consistencyRatio: 0.12, isConsistent: false },
      { evaluatorId: '4', evaluatorName: 'p003', consistencyRatio: 0.03, isConsistent: true },
      { evaluatorId: '5', evaluatorName: 'p004', consistencyRatio: 0.09, isConsistent: true },
    ];

    setEvaluationProgress(mockProgress);
    setCriteriaRanking(mockCriteria);
    setAlternativeRanking(mockAlternatives);
    setConsistencyData(mockConsistency);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-yellow-600';
      case 'not_started': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '평가완료';
      case 'in_progress': return '평가중';
      case 'not_started': return '시작안함';
      default: return '알수없음';
    }
  };

  const exportToExcel = () => {
    // Excel 내보내기 로직
    const data = {
      progress: evaluationProgress,
      criteriaRanking,
      alternativeRanking,
      consistencyData
    };
    
    console.log('Exporting to Excel:', data);
    alert('Excel 파일로 내보내기 기능이 실행됩니다.');
  };

  return (
    <div className="space-y-6">
      {/* 제어 패널 */}
      <Card title="결과 분석">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex space-x-2">
            <Button
              variant={activeView === 'progress' ? 'primary' : 'secondary'}
              onClick={() => setActiveView('progress')}
              size="sm"
            >
              평가현황
            </Button>
            <Button
              variant={activeView === 'ranking' ? 'primary' : 'secondary'}
              onClick={() => setActiveView('ranking')}
              size="sm"
            >
              통합결과
            </Button>
            <Button
              variant={activeView === 'consistency' ? 'primary' : 'secondary'}
              onClick={() => setActiveView('consistency')}
              size="sm"
            >
              일관성 분석
            </Button>
            <Button
              variant={activeView === 'detailed' ? 'primary' : 'secondary'}
              onClick={() => setActiveView('detailed')}
              size="sm"
            >
              세부내용
            </Button>
          </div>

          {activeView === 'ranking' && (
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'distributive' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('distributive')}
                size="sm"
              >
                분배적 모드
              </Button>
              <Button
                variant={viewMode === 'ideal' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('ideal')}
                size="sm"
              >
                이상적 모드
              </Button>
            </div>
          )}

          <Button
            onClick={exportToExcel}
            variant="secondary"
            size="sm"
          >
            Excel 저장
          </Button>
        </div>
      </Card>

      {/* 평가 진행 상황 */}
      {activeView === 'progress' && (
        <Card title="평가 진행 상황">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">평가자</th>
                  <th className="px-4 py-2 text-center">진행률</th>
                  <th className="px-4 py-2 text-center">상태</th>
                  <th className="px-4 py-2 text-center">마지막 활동</th>
                  <th className="px-4 py-2 text-center">진행도</th>
                </tr>
              </thead>
              <tbody>
                {evaluationProgress.map((evaluator) => (
                  <tr key={evaluator.evaluatorId} className="border-t">
                    <td className="px-4 py-2">{evaluator.evaluatorName}</td>
                    <td className="px-4 py-2 text-center">{evaluator.completionRate}%</td>
                    <td className={`px-4 py-2 text-center ${getStatusColor(evaluator.status)}`}>
                      {getStatusText(evaluator.status)}
                    </td>
                    <td className="px-4 py-2 text-center">{evaluator.lastActivity}</td>
                    <td className="px-4 py-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${evaluator.completionRate}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 통합 결과 순위 */}
      {activeView === 'ranking' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* 기준 순위 */}
          <Card title={`최하위기준 통합결과 순위 (${viewMode === 'distributive' ? '분배적' : '이상적'} 모드)`}>
            <div className="space-y-2">
              {criteriaRanking.map((criterion, index) => (
                <div key={criterion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-8">#{criterion.rank}</span>
                    <span className="font-medium">{criterion.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(criterion.priority / 0.3) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-16 text-right">
                      {(criterion.priority * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 대안 순위 */}
          <Card title={`대안 통합결과 순위 (${viewMode === 'distributive' ? '분배적' : '이상적'} 모드)`}>
            <div className="space-y-2">
              {alternativeRanking.map((alternative, index) => (
                <div key={alternative.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-8">#{alternative.rank}</span>
                    <span className="font-medium">{alternative.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(alternative.priority / 0.35) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-16 text-right">
                      {(alternative.priority * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 일관성 분석 */}
      {activeView === 'consistency' && (
        <Card title="일관성 비율 분석">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>일관성 비율(CR) 기준:</strong> 0.1 이하는 일관성 있음, 0.1 초과는 재검토 필요
            </p>
          </div>
          <div className="space-y-3">
            {consistencyData.map((data) => (
              <div key={data.evaluatorId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{data.evaluatorName}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono">{data.consistencyRatio.toFixed(3)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    data.isConsistent 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {data.isConsistent ? '일관성 있음' : '재검토 필요'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 세부 내용 */}
      {activeView === 'detailed' && (
        <Card title="세부 분석 내용">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => alert('기준별 세부 분석')}>
                기준별 평가값 및 중요도
              </Button>
              <Button variant="secondary" onClick={() => alert('대안별 세부 분석')}>
                대안별 평가값 및 중요도
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => alert('민감도 분석')}>
                민감도 분석
              </Button>
              <Button variant="secondary" onClick={() => alert('파레토 최적화')}>
                파레토 최적화 결과
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 하단 알림 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">
          <strong>중요:</strong> 계정 및 프로젝트에 대한 모든 내용은 사용 종료 7일 후에 삭제됩니다. 
          저장을 원하시면 'Excel 저장' 버튼을 클릭하여 파일로 저장하여 보관하시기 바랍니다.
        </p>
      </div>
    </div>
  );
};

export default ResultsAnalysis;