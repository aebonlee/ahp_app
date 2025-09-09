/**
 * AHP 분석 결과 종합 대시보드
 * 최종 우선순위, 일관성 비율, 민감도 분석, 의사결정 지원 정보 제공
 */

import React, { useState, useEffect } from 'react';
import { calculatePriorities, calculateGroupAHP, performSensitivityAnalysis } from '../../utils/enhancedAhpCalculator';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  weight?: number;
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
  scores?: { [criterionId: string]: number };
}

interface ProjectData {
  id?: string;
  title: string;
  description?: string;
  evaluationMethod?: string;
}

interface EvaluationData {
  criteriaComparisons: Array<{i: number, j: number, value: number}>;
  alternativeComparisons: {[criterionId: string]: Array<{i: number, j: number, value: number}>};
}

interface AHPResultsDashboardProps {
  projectData: ProjectData | null;
  criteriaData: Criterion[];
  alternativesData: Alternative[];
  evaluationData: EvaluationData;
  onComplete: (results: any) => void;
}

interface FinalResult {
  alternativeId: string;
  alternativeName: string;
  finalScore: number;
  rank: number;
  criteriaScores: { [criterionId: string]: number };
}

const AHPResultsDashboard: React.FC<AHPResultsDashboardProps> = ({
  projectData,
  criteriaData,
  alternativesData,
  evaluationData,
  onComplete
}) => {
  const [results, setResults] = useState<FinalResult[]>([]);
  const [criteriaWeights, setCriteriaWeights] = useState<{ [id: string]: number }>({});
  const [consistencyRatios, setConsistencyRatios] = useState<{ 
    criteria: number;
    alternatives: { [criterionId: string]: number };
  }>({ criteria: 0, alternatives: {} });
  const [sensitivityData, setSensitivityData] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'results' | 'consistency' | 'sensitivity'>('results');
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  useEffect(() => {
    calculateFinalResults();
  }, [criteriaData, alternativesData, evaluationData]);

  const calculateFinalResults = () => {
    if (!criteriaData.length || !alternativesData.length) return;

    try {
      // 1. 기준 간 중요도 계산
      const criteriaMatrix = createMatrixFromComparisons(
        evaluationData.criteriaComparisons,
        criteriaData.length
      );
      
      const criteriaResult = calculatePriorities(criteriaMatrix);
      const newCriteriaWeights: { [id: string]: number } = {};
      criteriaData.forEach((criterion, index) => {
        newCriteriaWeights[criterion.id] = criteriaResult.priorities[index];
      });
      setCriteriaWeights(newCriteriaWeights);

      // 2. 각 기준별 대안 우선순위 계산
      const alternativeScores: { [alternativeId: string]: { [criterionId: string]: number } } = {};
      const newConsistencyRatios = { 
        criteria: criteriaResult.consistencyRatio,
        alternatives: {} as { [criterionId: string]: number }
      };

      alternativesData.forEach(alternative => {
        alternativeScores[alternative.id] = {};
      });

      criteriaData.forEach(criterion => {
        const comparisons = evaluationData.alternativeComparisons[criterion.id] || [];
        if (comparisons.length > 0) {
          const alternativeMatrix = createMatrixFromComparisons(
            comparisons,
            alternativesData.length
          );
          
          const alternativeResult = calculatePriorities(alternativeMatrix);
          newConsistencyRatios.alternatives[criterion.id] = alternativeResult.consistencyRatio;

          alternativesData.forEach((alternative, index) => {
            alternativeScores[alternative.id][criterion.id] = alternativeResult.priorities[index];
          });
        }
      });

      setConsistencyRatios(newConsistencyRatios);

      // 3. 최종 종합 점수 계산
      const finalResults: FinalResult[] = alternativesData.map(alternative => {
        let finalScore = 0;
        const criteriaScores: { [criterionId: string]: number } = {};

        criteriaData.forEach(criterion => {
          const alternativeScore = alternativeScores[alternative.id][criterion.id] || 0;
          const criterionWeight = newCriteriaWeights[criterion.id] || 0;
          
          criteriaScores[criterion.id] = alternativeScore;
          finalScore += alternativeScore * criterionWeight;
        });

        return {
          alternativeId: alternative.id,
          alternativeName: alternative.name,
          finalScore,
          rank: 0, // 순위는 아래에서 계산
          criteriaScores
        };
      });

      // 4. 순위 계산
      finalResults.sort((a, b) => b.finalScore - a.finalScore);
      finalResults.forEach((result, index) => {
        result.rank = index + 1;
      });

      setResults(finalResults);

      // 5. 민감도 분석
      if (criteriaData.length > 1 && alternativesData.length > 1) {
        const sensitivityResults = performSensitivityAnalysis(
          criteriaMatrix,
          Object.values(evaluationData.alternativeComparisons).map(comparisons =>
            createMatrixFromComparisons(comparisons, alternativesData.length)
          )
        );
        setSensitivityData(sensitivityResults);
      }

    } catch (error) {
      console.error('결과 계산 중 오류:', error);
    }
  };

  const createMatrixFromComparisons = (comparisons: Array<{i: number, j: number, value: number}>, size: number): number[][] => {
    const matrix = Array(size).fill(null).map(() => Array(size).fill(1));
    
    comparisons.forEach(({ i, j, value }) => {
      if (i < size && j < size) {
        matrix[i][j] = value;
        matrix[j][i] = 1 / value;
      }
    });

    return matrix;
  };

  const renderResultsView = () => (
    <div className="space-y-6">
      {/* 최종 순위 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">🏆 최종 분석 결과</h3>
          <div className="text-sm text-gray-600">
            총 {alternativesData.length}개 대안 중 순위
          </div>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div 
              key={result.alternativeId}
              className={`p-4 rounded-lg border-2 transition-all ${
                index === 0 ? 'bg-yellow-50 border-yellow-300' :
                index === 1 ? 'bg-gray-50 border-gray-300' :
                index === 2 ? 'bg-orange-50 border-orange-300' :
                'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-500' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}>
                    {result.rank}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{result.alternativeName}</h4>
                    <p className="text-sm text-gray-600">
                      종합점수: {(result.finalScore * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-600' :
                    index === 1 ? 'text-gray-600' :
                    index === 2 ? 'text-orange-600' :
                    'text-blue-600'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                  </div>
                </div>
              </div>

              {/* 기준별 세부 점수 */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {criteriaData.map(criterion => (
                  <div key={criterion.id} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-xs font-medium text-gray-600 mb-1">{criterion.name}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">
                        {(result.criteriaScores[criterion.id] * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        가중치: {((criteriaWeights[criterion.id] || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(result.criteriaScores[criterion.id] || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 기준별 가중치 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 기준별 중요도</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {criteriaData.map(criterion => (
            <div key={criterion.id} className="bg-blue-50 rounded-lg p-4">
              <div className="font-medium text-blue-900 mb-2">{criterion.name}</div>
              <div className="text-2xl font-bold text-blue-600">
                {((criteriaWeights[criterion.id] || 0) * 100).toFixed(1)}%
              </div>
              {criterion.description && (
                <div className="text-sm text-blue-700 mt-1">{criterion.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConsistencyView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">🎯 일관성 분석</h3>
        
        {/* 기준 일관성 */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">기준 간 비교 일관성</h4>
          <div className={`p-4 rounded-lg ${
            consistencyRatios.criteria <= 0.1 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  <span className={consistencyRatios.criteria <= 0.1 ? 'text-green-600' : 'text-red-600'}>
                    {(consistencyRatios.criteria * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  일관성 비율 (Consistency Ratio)
                </div>
              </div>
              <div className="text-4xl">
                {consistencyRatios.criteria <= 0.1 ? '✅' : '⚠️'}
              </div>
            </div>
            <div className="mt-2 text-sm">
              {consistencyRatios.criteria <= 0.1 
                ? '훌륭합니다! 일관성 있는 판단으로 신뢰할 수 있는 결과입니다.'
                : '주의: 일관성이 낮습니다. 쌍대비교를 다시 검토해보세요.'}
            </div>
          </div>
        </div>

        {/* 대안별 일관성 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">기준별 대안 비교 일관성</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criteriaData.map(criterion => {
              const cr = consistencyRatios.alternatives[criterion.id] || 0;
              return (
                <div 
                  key={criterion.id}
                  className={`p-4 rounded-lg ${
                    cr <= 0.1 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-2">{criterion.name}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">
                      <span className={cr <= 0.1 ? 'text-green-600' : 'text-red-600'}>
                        {(cr * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-2xl">
                      {cr <= 0.1 ? '✅' : '⚠️'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 일관성 개선 가이드 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 일관성 개선 가이드</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 일관성 비율이 10% 이상일 경우 쌍대비교를 재검토하세요</li>
            <li>• 상호 모순되는 판단이 있는지 확인하세요 (A > B, B > C, C > A)</li>
            <li>• 너무 극단적인 비교 값(9:1)을 남용하지 마세요</li>
            <li>• 비슷한 중요도의 요소들은 1:1에 가깝게 설정하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSensitivityView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📈 민감도 분석</h3>
        
        {sensitivityData ? (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">🔍 민감도 분석 결과</h4>
              <p className="text-sm text-yellow-700">
                기준의 중요도가 변할 때 대안의 순위가 어떻게 바뀌는지 보여줍니다.
                안정적인 결과일수록 신뢰할 수 있는 의사결정입니다.
              </p>
            </div>

            {/* 여기에 민감도 분석 차트나 표를 추가할 수 있습니다 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="font-medium text-gray-800 mb-2">민감도 분석 차트</h4>
              <p className="text-sm text-gray-600">
                차트 컴포넌트가 구현되면 여기에 표시됩니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h4 className="font-medium text-gray-800 mb-2">민감도 분석 불가</h4>
            <p className="text-sm text-gray-600">
              민감도 분석을 위해서는 최소 2개 이상의 기준과 대안이 필요합니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const handleComplete = () => {
    const finalResults = {
      projectData,
      results,
      criteriaWeights,
      consistencyRatios,
      sensitivityData,
      timestamp: new Date().toISOString()
    };
    
    onComplete(finalResults);
  };

  if (!projectData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">프로젝트 데이터 없음</h3>
          <p className="text-red-700">
            분석할 프로젝트 데이터가 없습니다. 이전 단계를 완료해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{projectData.title} - 분석 결과</h2>
            <p className="text-gray-600 mt-2">{projectData.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showDetailedAnalysis ? '간단히 보기' : '상세 분석'}
            </button>
            <button
              onClick={handleComplete}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              분석 완료
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setCurrentView('results')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'results'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏆 결과
          </button>
          <button
            onClick={() => setCurrentView('consistency')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'consistency'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎯 일관성
          </button>
          <button
            onClick={() => setCurrentView('sensitivity')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'sensitivity'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 민감도
          </button>
        </div>
      </div>

      {/* Content */}
      {currentView === 'results' && renderResultsView()}
      {currentView === 'consistency' && renderConsistencyView()}
      {currentView === 'sensitivity' && renderSensitivityView()}

      {/* Summary Card */}
      {currentView === 'results' && results.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">📋 의사결정 요약</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm opacity-80">최우수 대안</div>
              <div className="text-2xl font-bold">{results[0]?.alternativeName}</div>
              <div className="text-sm opacity-80">
                {(results[0]?.finalScore * 100).toFixed(1)}% 점수
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80">평가 기준 수</div>
              <div className="text-2xl font-bold">{criteriaData.length}개</div>
              <div className="text-sm opacity-80">기준으로 평가</div>
            </div>
            <div>
              <div className="text-sm opacity-80">일관성 수준</div>
              <div className="text-2xl font-bold">
                {consistencyRatios.criteria <= 0.1 ? '우수' : '재검토 필요'}
              </div>
              <div className="text-sm opacity-80">
                CR: {(consistencyRatios.criteria * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AHPResultsDashboard;