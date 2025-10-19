import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  TableCellsIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrophyIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { 
  AHPResult, 
  GroupAggregationResult, 
  performSensitivityAnalysis,
  validateAHPResult,
  AHPNode
} from '../../utils/ahpCalculations';

interface AHPResultsDashboardProps {
  projectId: string;
  projectTitle: string;
  individualResults: AHPResult[];
  groupResult?: GroupAggregationResult;
  nodes: AHPNode[];
  onExportResults: () => void;
  onBackToEvaluation: () => void;
}

const AHPResultsDashboard: React.FC<AHPResultsDashboardProps> = ({
  projectId,
  projectTitle,
  individualResults,
  groupResult,
  nodes,
  onExportResults,
  onBackToEvaluation
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'individual' | 'group' | 'consistency' | 'sensitivity'>('overview');
  const [selectedEvaluator, setSelectedEvaluator] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sensitivityResults, setSensitivityResults] = useState<any[]>([]);

  // 결과 유효성 검증
  const validationResults = individualResults.map(result => ({
    evaluatorId: result.evaluator_id,
    validation: validateAHPResult(result)
  }));

  // 민감도 분석 수행
  useEffect(() => {
    if (individualResults.length > 0 && nodes.length > 0) {
      const baseResult = individualResults[0];
      // 민감도 분석 실행 (실제 구현에서는 백그라운드에서 수행)
      // const sensitivity = performSensitivityAnalysis(baseResult, nodes, [], 0.1);
      // setSensitivityResults(sensitivity);
    }
  }, [individualResults, nodes]);

  // 일관성 상태 계산
  const getConsistencyStatus = (cr: number) => {
    if (cr <= 0.05) return { status: 'excellent', color: 'green', text: '우수' };
    if (cr <= 0.1) return { status: 'acceptable', color: 'yellow', text: '양호' };
    return { status: 'poor', color: 'red', text: '불량' };
  };

  // 순위 변화 계산
  const getRankingChanges = () => {
    if (individualResults.length < 2) return [];
    
    const firstResult = individualResults[0];
    const lastResult = individualResults[individualResults.length - 1];
    
    return firstResult.alternative_rankings.map(alt => {
      const currentRank = lastResult.alternative_rankings.find(a => a.id === alt.id)?.rank || alt.rank;
      const change = alt.rank - currentRank;
      return {
        ...alt,
        currentRank,
        change
      };
    });
  };

  // 개요 화면
  const renderOverview = () => (
    <div className="space-y-6">
      {/* 전체 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{individualResults.length}</div>
              <div className="text-sm text-gray-600">평가자 수</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {groupResult?.aggregated_result.alternative_rankings[0]?.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">1위 대안</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((groupResult?.consensus_level || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">의견 일치도</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((groupResult?.aggregated_result.overall_consistency || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">전체 일관성</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 최종 순위 */}
      <Card title="최종 순위 (그룹 결과)">
        <div className="space-y-3">
          {groupResult?.aggregated_result.alternative_rankings.map((alt, index) => (
            <div key={alt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                }`}>
                  {alt.rank}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{alt.name}</div>
                  <div className="text-sm text-gray-600">점수: {(alt.score * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${alt.score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 일관성 상태 */}
      <Card title="일관성 분석">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">평가자별 일관성</h4>
            <div className="space-y-2">
              {validationResults.map((result, index) => {
                const consistency = getConsistencyStatus(
                  individualResults[index].overall_consistency
                );
                return (
                  <div key={result.evaluatorId} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm text-gray-700">
                      평가자 {index + 1}
                    </span>
                    <span className={`text-sm font-medium text-${consistency.color}-600`}>
                      {consistency.text} ({Math.round(individualResults[index].overall_consistency * 100)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">검증 결과</h4>
            <div className="space-y-2">
              {validationResults.map((result, index) => (
                <div key={result.evaluatorId} className="text-sm">
                  <div className="font-medium text-gray-700">평가자 {index + 1}</div>
                  {result.validation.isValid ? (
                    <div className="text-green-600 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      검증 통과
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {result.validation.issues.length}개 문제 발견
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // 개별 결과 화면
  const renderIndividualResults = () => (
    <div className="space-y-6">
      {/* 평가자 선택 */}
      <Card title="평가자별 결과">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {individualResults.map((result, index) => (
              <Button
                key={result.evaluator_id}
                variant={selectedEvaluator === result.evaluator_id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedEvaluator(result.evaluator_id || `evaluator_${index}`)}
              >
                평가자 {index + 1}
              </Button>
            ))}
          </div>

          {selectedEvaluator && (() => {
            const selectedResult = individualResults.find(r => 
              r.evaluator_id === selectedEvaluator
            ) || individualResults[parseInt(selectedEvaluator.split('_')[1])];
            
            if (!selectedResult) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 순위 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">순위</h4>
                  <div className="space-y-2">
                    {selectedResult.alternative_rankings.map(alt => (
                      <div key={alt.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2">
                            {alt.rank}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{alt.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {(alt.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 일관성 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">일관성 분석</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm font-medium text-gray-700">전체 일관성</div>
                      <div className={`text-lg font-bold text-${
                        getConsistencyStatus(selectedResult.overall_consistency).color
                      }-600`}>
                        {Math.round(selectedResult.overall_consistency * 100)}%
                      </div>
                    </div>
                    
                    {Object.entries(selectedResult.consistency_ratios).map(([nodeId, cr]) => (
                      <div key={nodeId} className="flex justify-between text-sm">
                        <span className="text-gray-600">기준별 일관성</span>
                        <span className={`font-medium text-${
                          getConsistencyStatus(cr).color
                        }-600`}>
                          {Math.round(cr * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </Card>
    </div>
  );

  // 그룹 결과 화면
  const renderGroupResults = () => (
    <div className="space-y-6">
      <Card title="그룹 의사결정 결과">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 집계 결과 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">최종 순위</h4>
            <div className="space-y-3">
              {groupResult?.aggregated_result.alternative_rankings.map(alt => (
                <div key={alt.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{alt.name}</span>
                    <span className="text-lg font-bold text-blue-600">#{alt.rank}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${alt.score * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    점수: {(alt.score * 100).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 의견 분석 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">의견 일치도 분석</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">전체 의견 일치도</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((groupResult?.consensus_level || 0) * 100)}%
                </div>
              </div>

              {groupResult?.disagreement_analysis.slice(0, 3).map((analysis, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="text-sm font-medium text-gray-900">{analysis.criterion}</div>
                  <div className="text-sm text-gray-600">
                    불일치 수준: {Math.round(analysis.disagreement_level * 100)}%
                  </div>
                  {analysis.outlier_evaluators.length > 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      이상 의견: {analysis.outlier_evaluators.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AHP 분석 결과</h1>
            <p className="text-gray-600">{projectTitle}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(true)}
              className="flex items-center"
            >
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              상세 정보
            </Button>
            <Button
              variant="outline"
              onClick={onExportResults}
              className="flex items-center"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              결과 내보내기
            </Button>
            <Button variant="primary" onClick={onBackToEvaluation}>
              평가로 돌아가기
            </Button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'overview', name: '개요', icon: ChartBarIcon },
            { id: 'individual', name: '개별 결과', icon: UserGroupIcon },
            { id: 'group', name: '그룹 결과', icon: TrophyIcon },
            { id: 'consistency', name: '일관성 분석', icon: ExclamationTriangleIcon },
            { id: 'sensitivity', name: '민감도 분석', icon: AdjustmentsHorizontalIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
                selectedView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto p-6">
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'individual' && renderIndividualResults()}
        {selectedView === 'group' && renderGroupResults()}
        {selectedView === 'consistency' && (
          <Card title="일관성 상세 분석">
            <div className="space-y-4">
              <p className="text-gray-600">
                각 평가자의 판단 일관성을 자세히 분석합니다.
              </p>
              {/* 일관성 분석 상세 내용 */}
            </div>
          </Card>
        )}
        {selectedView === 'sensitivity' && (
          <Card title="민감도 분석">
            <div className="space-y-4">
              <p className="text-gray-600">
                기준 가중치 변화가 최종 순위에 미치는 영향을 분석합니다.
              </p>
              {/* 민감도 분석 내용 */}
            </div>
          </Card>
        )}
      </div>

      {/* 상세 정보 모달 */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="분석 상세 정보"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">프로젝트 정보</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>프로젝트 ID: {projectId}</div>
              <div>분석 날짜: {new Date().toLocaleDateString('ko-KR')}</div>
              <div>참여 평가자: {individualResults.length}명</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">계산 방법</h4>
            <div className="text-sm text-gray-600">
              <p>• 가중치 계산: 고유벡터 방법 (Eigenvector Method)</p>
              <p>• 그룹 집계: 기하평균 방법 (Geometric Mean)</p>
              <p>• 일관성 검증: 일관성 비율 (Consistency Ratio)</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AHPResultsDashboard;