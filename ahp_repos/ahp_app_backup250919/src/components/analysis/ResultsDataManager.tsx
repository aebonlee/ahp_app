import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import dataService from '../../services/dataService';

interface AHPResults {
  criteriaWeights: Record<string, number>;
  alternativeScores: Record<string, Record<string, number>>;
  finalRanking: { id: string; name: string; score: number; rank: number }[];
  consistencyRatio: number;
  groupConsistency?: number;
  individualResults?: Record<string, any>;
}

interface ResultsDataManagerProps {
  projectId: string;
  criteria: Array<{ id: string; name: string }>;
  alternatives: Array<{ id: string; name: string }>;
  evaluators: Array<{ id: string; name: string; status: string }>;
}

const ResultsDataManager: React.FC<ResultsDataManagerProps> = ({
  projectId,
  criteria,
  alternatives,
  evaluators
}) => {
  const [results, setResults] = useState<AHPResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'summary' | 'criteria' | 'alternatives' | 'individual' | 'sensitivity'>('summary');

  useEffect(() => {
    loadResults();
  }, [projectId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📊 프로젝트 ${projectId}의 결과 로드`);

      // TODO: 실제 백엔드에서 결과 조회
      // const resultsData = await dataService.getResults(projectId);
      
      // 샘플 결과 데이터 생성
      const sampleResults: AHPResults = {
        criteriaWeights: criteria.reduce((acc, criterion, index) => {
          // 샘플 가중치 생성
          const weights = [0.4, 0.3, 0.2, 0.1];
          acc[criterion.id] = weights[index % weights.length] || 0.1;
          return acc;
        }, {} as Record<string, number>),
        
        alternativeScores: alternatives.reduce((acc, alternative) => {
          acc[alternative.id] = criteria.reduce((cAcc, criterion, index) => {
            // 샘플 점수 생성
            const scores = [0.6, 0.8, 0.4, 0.7];
            cAcc[criterion.id] = scores[index % scores.length] || Math.random();
            return cAcc;
          }, {} as Record<string, number>);
          return acc;
        }, {} as Record<string, Record<string, number>>),
        
        finalRanking: alternatives.map((alt, index) => ({
          id: alt.id,
          name: alt.name,
          score: Math.random() * 0.5 + 0.3, // 0.3 ~ 0.8 범위
          rank: index + 1
        })).sort((a, b) => b.score - a.score).map((alt, index) => ({
          ...alt,
          rank: index + 1
        })),
        
        consistencyRatio: 0.08, // 일관성 비율
        groupConsistency: 0.12,
        
        individualResults: evaluators.reduce((acc, evaluator) => {
          acc[evaluator.id] = {
            name: evaluator.name,
            consistencyRatio: Math.random() * 0.15,
            completionDate: new Date().toISOString(),
            criteriaWeights: criteria.reduce((cAcc, criterion) => {
              cAcc[criterion.id] = Math.random();
              return cAcc;
            }, {} as Record<string, number>)
          };
          return acc;
        }, {} as Record<string, any>)
      };

      setResults(sampleResults);
      console.log('✅ 결과 로드 완료');
    } catch (error) {
      console.error('Failed to load results:', error);
      setError('결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateResults = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 AHP 결과 계산 중...');

      // TODO: 실제 AHP 계산 로직
      // const calculatedResults = await dataService.calculateGroupResults(projectId);
      
      // 시뮬레이션: 약간의 지연 후 결과 업데이트
      setTimeout(() => {
        loadResults();
      }, 2000);

      console.log('✅ 결과 계산 완료');
    } catch (error) {
      console.error('Failed to calculate results:', error);
      setError('결과 계산 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      console.log('📊 Excel 내보내기 시작');
      
      // TODO: 실제 Excel 내보내기 구현
      // const blob = await dataService.exportToExcel(projectId);
      
      // 시뮬레이션: 다운로드 링크 생성
      const csvContent = generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `AHP_Results_${projectId}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Excel 내보내기 완료');
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      setError('Excel 내보내기 중 오류가 발생했습니다.');
    }
  };

  const generateCSVContent = (): string => {
    if (!results) return '';

    let csv = 'AHP Analysis Results\n\n';
    
    // 기준 가중치
    csv += 'Criteria Weights\n';
    csv += 'Criterion,Weight\n';
    criteria.forEach(criterion => {
      const weight = results.criteriaWeights[criterion.id] || 0;
      csv += `${criterion.name},${weight.toFixed(4)}\n`;
    });
    
    csv += '\n';
    
    // 최종 순위
    csv += 'Final Ranking\n';
    csv += 'Rank,Alternative,Score\n';
    results.finalRanking.forEach(item => {
      csv += `${item.rank},${item.name},${item.score.toFixed(4)}\n`;
    });
    
    return csv;
  };

  const handleGenerateReport = async () => {
    try {
      console.log('📄 보고서 생성 시작');
      
      // TODO: 실제 PDF 보고서 생성
      // const reportBlob = await dataService.generateReport(projectId);
      
      // 시뮬레이션: HTML 보고서 생성
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(generateHTMLReport());
        reportWindow.document.close();
      }
      
      console.log('✅ 보고서 생성 완료');
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError('보고서 생성 중 오류가 발생했습니다.');
    }
  };

  const generateHTMLReport = (): string => {
    if (!results) return '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>AHP 분석 보고서</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; }
            .section { margin: 30px 0; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .chart { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>AHP 분석 보고서</h1>
            <p>생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
        </div>
        
        <div class="section">
            <h2>1. 기준별 가중치</h2>
            <table>
                <tr><th>기준</th><th>가중치</th></tr>
                ${criteria.map(criterion => `
                    <tr>
                        <td>${criterion.name}</td>
                        <td>${((results.criteriaWeights[criterion.id] || 0) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </table>
        </div>
        
        <div class="section">
            <h2>2. 최종 순위</h2>
            <table>
                <tr><th>순위</th><th>대안</th><th>점수</th></tr>
                ${results.finalRanking.map(item => `
                    <tr>
                        <td>${item.rank}</td>
                        <td>${item.name}</td>
                        <td>${(item.score * 100).toFixed(1)}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
        
        <div class="section">
            <h2>3. 일관성 분석</h2>
            <p>일관성 비율 (CR): ${(results.consistencyRatio * 100).toFixed(1)}%</p>
            <p>그룹 일관성: ${((results.groupConsistency || 0) * 100).toFixed(1)}%</p>
            <p>${results.consistencyRatio <= 0.1 ? '✅ 일관성이 양호합니다' : '⚠️ 일관성을 재검토하시기 바랍니다'}</p>
        </div>
    </body>
    </html>
    `;
  };

  const getConsistencyStatus = (cr: number) => {
    if (cr <= 0.05) return { color: 'text-green-600', text: '매우 양호', bg: 'bg-green-50' };
    if (cr <= 0.1) return { color: 'text-blue-600', text: '양호', bg: 'bg-blue-50' };
    if (cr <= 0.15) return { color: 'text-yellow-600', text: '보통', bg: 'bg-yellow-50' };
    return { color: 'text-red-600', text: '재검토 필요', bg: 'bg-red-50' };
  };

  if (loading && !results) {
    return (
      <Card title="결과 분석">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">결과를 로드하고 있습니다...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="결과 분석 및 보고서">
        <div className="space-y-6">
          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'summary', name: '요약', icon: '📊' },
                { id: 'criteria', name: '기준 분석', icon: '📋' },
                { id: 'alternatives', name: '대안 분석', icon: '🎯' },
                { id: 'individual', name: '개별 결과', icon: '👤' },
                { id: 'sensitivity', name: '민감도 분석', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <Button
                onClick={handleCalculateResults}
                disabled={loading}
              >
                {loading ? '계산 중...' : '결과 재계산'}
              </Button>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleExportToExcel}
                disabled={loading || !results}
              >
                📊 Excel 내보내기
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateReport}
                disabled={loading || !results}
              >
                📄 보고서 생성
              </Button>
            </div>
          </div>

          {results ? (
            <div className="space-y-6">
              {/* 요약 탭 */}
              {selectedTab === 'summary' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">분석 요약</h3>
                  
                  {/* 일관성 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`rounded-lg p-4 ${getConsistencyStatus(results.consistencyRatio).bg}`}>
                      <div className="text-2xl font-bold">
                        {(results.consistencyRatio * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">일관성 비율</div>
                      <div className={`text-sm font-medium ${getConsistencyStatus(results.consistencyRatio).color}`}>
                        {getConsistencyStatus(results.consistencyRatio).text}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-800">{criteria.length}</div>
                      <div className="text-sm text-blue-600">평가 기준 수</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-800">{alternatives.length}</div>
                      <div className="text-sm text-green-600">대안 수</div>
                    </div>
                  </div>

                  {/* 최종 순위 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">🏆 최종 순위</h4>
                    <div className="space-y-2">
                      {results.finalRanking.map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-gray-300 text-gray-700'
                            }`}>
                              {item.rank}
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="text-lg font-semibold">
                            {(item.score * 100).toFixed(1)}점
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 기준 분석 탭 */}
              {selectedTab === 'criteria' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">기준별 가중치 분석</h3>
                  <div className="space-y-3">
                    {criteria.map(criterion => {
                      const weight = results.criteriaWeights[criterion.id] || 0;
                      return (
                        <div key={criterion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">{criterion.name}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${weight * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-12 text-right">
                              {(weight * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 대안 분석 탭 */}
              {selectedTab === 'alternatives' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">대안별 상세 분석</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            대안
                          </th>
                          {criteria.map(criterion => (
                            <th key={criterion.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {criterion.name}
                            </th>
                          ))}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            최종 점수
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {alternatives.map(alternative => (
                          <tr key={alternative.id}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {alternative.name}
                            </td>
                            {criteria.map(criterion => (
                              <td key={criterion.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {((results.alternativeScores[alternative.id]?.[criterion.id] || 0) * 100).toFixed(1)}
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {((results.finalRanking.find(r => r.id === alternative.id)?.score || 0) * 100).toFixed(1)}점
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 개별 결과 탭 */}
              {selectedTab === 'individual' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">평가자별 개별 결과</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(results.individualResults || {}).map(([evaluatorId, result]) => (
                      <div key={evaluatorId} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{result.name}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>일관성 비율:</span>
                            <span className={getConsistencyStatus(result.consistencyRatio).color}>
                              {(result.consistencyRatio * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>완료일:</span>
                            <span>{new Date(result.completionDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 민감도 분석 탭 */}
              {selectedTab === 'sensitivity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">민감도 분석</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      민감도 분석은 기준의 가중치 변화에 따른 대안 순위의 변화를 분석합니다.
                      이 기능은 향후 업데이트에서 제공될 예정입니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">분석 결과가 없습니다.</p>
              <p className="text-sm text-gray-500">평가가 완료된 후 결과를 확인할 수 있습니다.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResultsDataManager;