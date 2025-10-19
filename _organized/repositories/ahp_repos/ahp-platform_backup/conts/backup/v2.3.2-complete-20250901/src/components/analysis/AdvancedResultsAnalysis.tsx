import React, { useState, useEffect, useMemo } from 'react';
import Card from '../common/Card';

interface AnalysisResult {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number;
  details: {
    criteriaContributions: { [criteriaId: string]: number };
    sensitivityAnalysis: { [criteriaId: string]: number };
  };
}

interface GroupAnalysisResult {
  groupResult: AnalysisResult[];
  individualResults: { [evaluatorId: string]: AnalysisResult[] };
  consensusMetrics: {
    overallConsensus: number;
    criteriaConsensus: { [criteriaId: string]: number };
    disagreementPoints: Array<{
      criteriaId: string;
      evaluators: string[];
      deviation: number;
    }>;
  };
}

interface AdvancedResultsAnalysisProps {
  projectId: string;
  results?: any; // 기존 결과 데이터
  onExport?: (data: any, format: string) => void;
  className?: string;
}

const AdvancedResultsAnalysis: React.FC<AdvancedResultsAnalysisProps> = ({
  projectId,
  results,
  onExport,
  className = ''
}) => {
  const [analysisType, setAnalysisType] = useState<'individual' | 'group' | 'sensitivity'>('individual');
  const [groupResults, setGroupResults] = useState<GroupAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  // 샘플 데이터 (실제로는 API에서 가져옴)
  const sampleData = useMemo(() => ({
    criteria: [
      { id: 'c1', name: '개발 생산성 효율화', weight: 0.45 },
      { id: 'c2', name: '코딩 실무 품질 적합화', weight: 0.35 },
      { id: 'c3', name: '개발 프로세스 자동화', weight: 0.20 }
    ],
    alternatives: [
      { id: 'a1', name: 'GitHub Copilot' },
      { id: 'a2', name: 'Claude Code' },
      { id: 'a3', name: 'Cursor AI' },
      { id: 'a4', name: 'Tabnine' }
    ],
    evaluators: [
      { id: 'e1', name: '평가자 1', expertise: 'senior' },
      { id: 'e2', name: '평가자 2', expertise: 'mid' },
      { id: 'e3', name: '평가자 3', expertise: 'junior' }
    ]
  }), []);

  // 고급 분석 계산
  const performAdvancedAnalysis = () => {
    setLoading(true);
    
    // 시뮬레이션을 위한 딜레이
    setTimeout(() => {
      // 개별 분석 결과
      const individualAnalysis: AnalysisResult[] = [
        {
          alternativeId: 'a2',
          alternativeName: 'Claude Code',
          score: 0.387,
          rank: 1,
          details: {
            criteriaContributions: {
              'c1': 0.174, // 45% * 0.387 비율
              'c2': 0.154, // 35% * 0.44
              'c3': 0.059  // 20% * 0.295
            },
            sensitivityAnalysis: {
              'c1': 0.12, // 이 기준의 가중치가 10% 변할 때 순위 변화 가능성
              'c2': 0.08,
              'c3': 0.15
            }
          }
        },
        {
          alternativeId: 'a1',
          alternativeName: 'GitHub Copilot',
          score: 0.285,
          rank: 2,
          details: {
            criteriaContributions: {
              'c1': 0.153,
              'c2': 0.091,
              'c3': 0.041
            },
            sensitivityAnalysis: {
              'c1': 0.09,
              'c2': 0.11,
              'c3': 0.07
            }
          }
        },
        {
          alternativeId: 'a3',
          alternativeName: 'Cursor AI',
          score: 0.198,
          rank: 3,
          details: {
            criteriaContributions: {
              'c1': 0.081,
              'c2': 0.084,
              'c3': 0.033
            },
            sensitivityAnalysis: {
              'c1': 0.06,
              'c2': 0.09,
              'c3': 0.04
            }
          }
        },
        {
          alternativeId: 'a4',
          alternativeName: 'Tabnine',
          score: 0.130,
          rank: 4,
          details: {
            criteriaContributions: {
              'c1': 0.047,
              'c2': 0.056,
              'c3': 0.027
            },
            sensitivityAnalysis: {
              'c1': 0.03,
              'c2': 0.05,
              'c3': 0.02
            }
          }
        }
      ];

      // 그룹 분석 결과
      const groupAnalysis: GroupAnalysisResult = {
        groupResult: individualAnalysis,
        individualResults: {
          'e1': individualAnalysis.map(alt => ({ ...alt, score: alt.score * (0.9 + Math.random() * 0.2) })),
          'e2': individualAnalysis.map(alt => ({ ...alt, score: alt.score * (0.9 + Math.random() * 0.2) })),
          'e3': individualAnalysis.map(alt => ({ ...alt, score: alt.score * (0.9 + Math.random() * 0.2) }))
        },
        consensusMetrics: {
          overallConsensus: 0.78,
          criteriaConsensus: {
            'c1': 0.85,
            'c2': 0.72,
            'c3': 0.69
          },
          disagreementPoints: [
            {
              criteriaId: 'c3',
              evaluators: ['e2', 'e3'],
              deviation: 0.23
            },
            {
              criteriaId: 'c2',
              evaluators: ['e1', 'e3'],
              deviation: 0.18
            }
          ]
        }
      };

      setGroupResults(groupAnalysis);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    performAdvancedAnalysis();
  }, []);

  const renderIndividualAnalysis = () => (
    <div className="space-y-6">
      {/* 순위 및 점수 */}
      <Card title="최종 순위 및 점수">
        <div className="space-y-3">
          {groupResults?.groupResult.map((result, index) => (
            <div key={result.alternativeId} className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                }`}>
                  {result.rank}
                </div>
                <div>
                  <div className="font-medium">{result.alternativeName}</div>
                  <div className="text-sm text-gray-600">종합 점수: {(result.score * 100).toFixed(1)}%</div>
                </div>
              </div>
              <div className="w-48">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${result.score * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 기준별 기여도 */}
      <Card title="기준별 기여도 분석">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">대안</th>
                {sampleData.criteria.map(criteria => (
                  <th key={criteria.id} className="px-4 py-2 text-center">
                    {criteria.name}
                    <div className="text-xs text-gray-500">가중치: {(criteria.weight * 100).toFixed(0)}%</div>
                  </th>
                ))}
                <th className="px-4 py-2 text-center">총합</th>
              </tr>
            </thead>
            <tbody>
              {groupResults?.groupResult.map(result => (
                <tr key={result.alternativeId} className="border-t">
                  <td className="px-4 py-2 font-medium">{result.alternativeName}</td>
                  {sampleData.criteria.map(criteria => (
                    <td key={criteria.id} className="px-4 py-2 text-center">
                      <div className="flex flex-col items-center">
                        <div className="font-medium">
                          {(result.details.criteriaContributions[criteria.id] * 100).toFixed(1)}%
                        </div>
                        <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${(result.details.criteriaContributions[criteria.id] / criteria.weight) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center font-bold">
                    {(result.score * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 민감도 분석 */}
      <Card title="민감도 분석">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            각 기준의 가중치가 10% 변동할 때 순위 변화 가능성을 보여줍니다.
          </p>
          {groupResults?.groupResult.slice(0, 2).map(result => (
            <div key={result.alternativeId} className="p-4 border rounded">
              <h4 className="font-medium mb-3">{result.alternativeName} (현재 {result.rank}위)</h4>
              <div className="grid grid-cols-3 gap-4">
                {sampleData.criteria.map(criteria => (
                  <div key={criteria.id} className="text-center">
                    <div className="text-sm text-gray-600">{criteria.name}</div>
                    <div className={`text-lg font-medium ${
                      result.details.sensitivityAnalysis[criteria.id] > 0.1 ? 'text-red-600' :
                      result.details.sensitivityAnalysis[criteria.id] > 0.05 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {(result.details.sensitivityAnalysis[criteria.id] * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">변동 위험</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-blue-800">
              💡 <strong>해석:</strong> 빨간색(10% 이상)은 높은 민감도, 노란색(5-10%)은 중간 민감도, 
              초록색(5% 미만)은 낮은 민감도를 의미합니다.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderGroupAnalysis = () => (
    <div className="space-y-6">
      {/* 전체 합의도 */}
      <Card title="그룹 합의도 분석">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${
              (groupResults?.consensusMetrics.overallConsensus || 0) > 0.8 ? 'text-green-600' :
              (groupResults?.consensusMetrics.overallConsensus || 0) > 0.6 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {((groupResults?.consensusMetrics.overallConsensus || 0) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">전체 합의도</div>
          </div>
          <div className="space-y-2">
            {sampleData.criteria.map(criteria => (
              <div key={criteria.id} className="flex justify-between items-center">
                <span className="text-sm">{criteria.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (groupResults?.consensusMetrics.criteriaConsensus[criteria.id] || 0) > 0.8 ? 'bg-green-500' :
                        (groupResults?.consensusMetrics.criteriaConsensus[criteria.id] || 0) > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(groupResults?.consensusMetrics.criteriaConsensus[criteria.id] || 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-10">
                    {((groupResults?.consensusMetrics.criteriaConsensus[criteria.id] || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 평가자별 결과 비교 */}
      <Card title="평가자별 결과 비교">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">대안</th>
                <th className="px-4 py-2 text-center">그룹 결과</th>
                {sampleData.evaluators.map(evaluator => (
                  <th key={evaluator.id} className="px-4 py-2 text-center">
                    {evaluator.name}
                    <div className="text-xs text-gray-500">({evaluator.expertise})</div>
                  </th>
                ))}
                <th className="px-4 py-2 text-center">표준편차</th>
              </tr>
            </thead>
            <tbody>
              {groupResults?.groupResult.map(result => {
                const individualScores = sampleData.evaluators.map(evaluator => 
                  groupResults.individualResults[evaluator.id]?.find(r => r.alternativeId === result.alternativeId)?.score || 0
                );
                const avgScore = individualScores.reduce((sum, score) => sum + score, 0) / individualScores.length;
                const stdDev = Math.sqrt(individualScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / individualScores.length);
                
                return (
                  <tr key={result.alternativeId} className="border-t">
                    <td className="px-4 py-2 font-medium">{result.alternativeName}</td>
                    <td className="px-4 py-2 text-center font-bold">
                      {(result.score * 100).toFixed(1)}%
                    </td>
                    {individualScores.map((score, index) => (
                      <td key={index} className="px-4 py-2 text-center">
                        {(score * 100).toFixed(1)}%
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center">
                      <span className={`font-medium ${
                        stdDev > 0.1 ? 'text-red-600' :
                        stdDev > 0.05 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {(stdDev * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 의견 불일치 지점 */}
      {groupResults?.consensusMetrics.disagreementPoints && groupResults.consensusMetrics.disagreementPoints.length > 0 && (
        <Card title="주요 의견 불일치 지점">
          <div className="space-y-3">
            {groupResults.consensusMetrics.disagreementPoints.map((point, index) => {
              const criteria = sampleData.criteria.find(c => c.id === point.criteriaId);
              return (
                <div key={index} className="p-4 bg-red-50 border border-red-200 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-red-800">{criteria?.name}</div>
                      <div className="text-sm text-red-600">
                        불일치 평가자: {point.evaluators.map(id => 
                          sampleData.evaluators.find(e => e.id === id)?.name
                        ).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-800 font-bold">{(point.deviation * 100).toFixed(0)}%</div>
                      <div className="text-xs text-red-600">편차</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-blue-50 p-4 rounded">
            <div className="text-sm text-blue-800">
              💡 <strong>권장사항:</strong> 의견 불일치가 큰 기준에 대해서는 추가 토론이나 
              평가 가이드라인 제공을 고려해보세요.
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 분석 유형 선택 */}
      <Card title="고급 결과 분석">
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'individual', name: '개별 분석', icon: '📊' },
            { id: 'group', name: '그룹 분석', icon: '👥' },
            { id: 'sensitivity', name: '민감도 분석', icon: '🎛️' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setAnalysisType(type.id as any)}
              className={`px-4 py-2 rounded border ${
                analysisType === type.id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>

        {/* 내보내기 옵션 */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            프로젝트 ID: {projectId} | 분석 일시: {new Date().toLocaleString('ko-KR')}
          </div>
          <div className="flex space-x-2">
            {onExport && ['Excel', 'PDF', 'PowerPoint'].map(format => (
              <button
                key={format}
                onClick={() => onExport(groupResults, format.toLowerCase())}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                {format} 내보내기
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 로딩 상태 */}
      {loading && (
        <Card title="분석 중...">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">고급 분석을 수행하고 있습니다...</span>
          </div>
        </Card>
      )}

      {/* 분석 결과 렌더링 */}
      {!loading && (
        <>
          {analysisType === 'individual' && renderIndividualAnalysis()}
          {analysisType === 'group' && renderGroupAnalysis()}
          {analysisType === 'sensitivity' && (
            <Card title="민감도 분석">
              <div className="text-center py-8 text-gray-500">
                민감도 분석 기능을 개발 중입니다...
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AdvancedResultsAnalysis;