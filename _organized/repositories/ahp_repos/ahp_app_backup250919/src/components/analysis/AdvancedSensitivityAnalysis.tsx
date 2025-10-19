/**
 * 고도화된 민감도 분석 컴포넌트
 * 다양한 시나리오별 민감도 분석 및 시각화
 */

import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

// Google Charts 타입 정의
declare const google: any;

export interface SensitivityScenario {
  id: string;
  name: string;
  description: string;
  weightChanges: { [criterionId: string]: number }; // 가중치 변화량 (예: 0.1 = +10%)
  enabled: boolean;
}

export interface SensitivityResult {
  scenarioId: string;
  alternative: string;
  originalRank: number;
  newRank: number;
  rankChange: number;
  originalScore: number;
  newScore: number;
  scoreChange: number;
  stability: 'stable' | 'moderate' | 'sensitive' | 'very_sensitive';
}

export interface CriticalThreshold {
  criterionId: string;
  criterionName: string;
  threshold: number; // 순위가 바뀌는 임계 가중치 변화
  affectedAlternatives: string[];
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
}

interface AdvancedSensitivityAnalysisProps {
  projectData: {
    criteriaWeights: { id: string; name: string; weight: number }[];
    alternatives: { id: string; name: string; score: number; rank: number }[];
  };
  onAnalysisComplete?: (results: SensitivityResult[]) => void;
  className?: string;
}

const AdvancedSensitivityAnalysis: React.FC<AdvancedSensitivityAnalysisProps> = ({
  projectData,
  onAnalysisComplete,
  className = ''
}) => {
  const [scenarios, setScenarios] = useState<SensitivityScenario[]>([]);
  const [results, setResults] = useState<SensitivityResult[]>([]);
  const [criticalThresholds, setCriticalThresholds] = useState<CriticalThreshold[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [analysisMode, setAnalysisMode] = useState<'single' | 'multi' | 'threshold'>('single');
  const [customWeightChanges, setCustomWeightChanges] = useState<{ [key: string]: number }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [chartType, setChartType] = useState<'radar' | 'waterfall' | 'tornado' | 'heatmap'>('tornado');

  // Google Charts 초기화
  useEffect(() => {
    const loadGoogleCharts = () => {
      if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', { 
          packages: ['corechart', 'table', 'sankey'],
          language: 'ko'
        });
        google.charts.setOnLoadCallback(() => {
          if (results.length > 0) {
            drawSensitivityChart();
          }
        });
      } else {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          google.charts.load('current', { 
            packages: ['corechart', 'table', 'sankey'],
            language: 'ko'
          });
          google.charts.setOnLoadCallback(() => {
            if (results.length > 0) {
              drawSensitivityChart();
            }
          });
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleCharts();
  }, []);

  // 기본 시나리오 초기화
  useEffect(() => {
    initializeScenarios();
    initializeCustomWeights();
  }, [projectData]);

  const initializeScenarios = () => {
    const defaultScenarios: SensitivityScenario[] = [
      {
        id: 'conservative',
        name: '보수적 시나리오',
        description: '기존 가중치에서 소폭 변동 (±10%)',
        weightChanges: projectData.criteriaWeights.reduce((acc, cw) => {
          acc[cw.id] = 0.1 * (Math.random() - 0.5) * 2; // -10% ~ +10%
          return acc;
        }, {} as { [key: string]: number }),
        enabled: true
      },
      {
        id: 'aggressive',
        name: '적극적 시나리오',
        description: '가중치 대폭 변동 (±30%)',
        weightChanges: projectData.criteriaWeights.reduce((acc, cw) => {
          acc[cw.id] = 0.3 * (Math.random() - 0.5) * 2; // -30% ~ +30%
          return acc;
        }, {} as { [key: string]: number }),
        enabled: true
      },
      {
        id: 'cost_focused',
        name: '비용 중심 시나리오',
        description: '비용 관련 기준의 가중치 증가',
        weightChanges: projectData.criteriaWeights.reduce((acc, cw) => {
          acc[cw.id] = cw.name.includes('비용') || cw.name.includes('가격') ? 0.25 : -0.1;
          return acc;
        }, {} as { [key: string]: number }),
        enabled: true
      },
      {
        id: 'quality_focused',
        name: '품질 중심 시나리오',
        description: '품질/성능 관련 기준의 가중치 증가',
        weightChanges: projectData.criteriaWeights.reduce((acc, cw) => {
          acc[cw.id] = cw.name.includes('품질') || cw.name.includes('성능') || cw.name.includes('기술') ? 0.25 : -0.1;
          return acc;
        }, {} as { [key: string]: number }),
        enabled: true
      },
      {
        id: 'balanced',
        name: '균형 시나리오',
        description: '모든 기준의 가중치를 균등하게 조정',
        weightChanges: projectData.criteriaWeights.reduce((acc, cw) => {
          const target = 1 / projectData.criteriaWeights.length;
          acc[cw.id] = target - cw.weight;
          return acc;
        }, {} as { [key: string]: number }),
        enabled: true
      }
    ];

    setScenarios(defaultScenarios);
    setSelectedScenario(defaultScenarios[0].id);
  };

  const initializeCustomWeights = () => {
    const initialWeights = projectData.criteriaWeights.reduce((acc, cw) => {
      acc[cw.id] = 0;
      return acc;
    }, {} as { [key: string]: number });
    setCustomWeightChanges(initialWeights);
  };

  const runSensitivityAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      let analysisResults: SensitivityResult[] = [];
      
      if (analysisMode === 'single') {
        // 단일 시나리오 분석
        const scenario = scenarios.find(s => s.id === selectedScenario);
        if (scenario) {
          analysisResults = calculateSensitivityResults(scenario);
        }
      } else if (analysisMode === 'multi') {
        // 다중 시나리오 분석
        const enabledScenarios = scenarios.filter(s => s.enabled);
        analysisResults = enabledScenarios.flatMap(scenario => 
          calculateSensitivityResults(scenario)
        );
      } else if (analysisMode === 'threshold') {
        // 임계값 분석
        analysisResults = calculateThresholdAnalysis();
      }

      setResults(analysisResults);
      calculateCriticalThresholds();
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResults);
      }

      // 차트 그리기
      if (showChart && typeof google !== 'undefined') {
        setTimeout(() => drawSensitivityChart(), 100);
      }

    } catch (error) {
      console.error('민감도 분석 중 오류 발생:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateSensitivityResults = (scenario: SensitivityScenario): SensitivityResult[] => {
    const results: SensitivityResult[] = [];

    projectData.alternatives.forEach(alternative => {
      // 새로운 가중치로 점수 재계산
      const newScore = calculateNewScore(alternative, scenario.weightChanges);
      
      // 새로운 순위 계산
      const newRanking = projectData.alternatives.map(alt => ({
        ...alt,
        newScore: calculateNewScore(alt, scenario.weightChanges)
      })).sort((a, b) => b.newScore - a.newScore);

      const newRank = newRanking.findIndex(alt => alt.id === alternative.id) + 1;
      const rankChange = alternative.rank - newRank;
      const scoreChange = newScore - alternative.score;

      // 안정성 계산
      const stability = getStabilityLevel(Math.abs(rankChange), Math.abs(scoreChange / alternative.score));

      results.push({
        scenarioId: scenario.id,
        alternative: alternative.name,
        originalRank: alternative.rank,
        newRank,
        rankChange,
        originalScore: alternative.score,
        newScore,
        scoreChange,
        stability
      });
    });

    return results;
  };

  const calculateNewScore = (alternative: any, weightChanges: { [key: string]: number }): number => {
    // 실제로는 각 기준별 점수와 새로운 가중치를 곱해서 계산
    // 여기서는 시뮬레이션을 위해 가중치 변화에 따른 점수 변화를 근사
    let newScore = alternative.score;
    
    Object.entries(weightChanges).forEach(([criterionId, change]) => {
      const criterion = projectData.criteriaWeights.find(cw => cw.id === criterionId);
      if (criterion) {
        // 가중치 변화가 해당 대안에 미치는 영향을 시뮬레이션
        const impact = change * criterion.weight * (0.8 + Math.random() * 0.4); // 0.8~1.2 배수
        newScore += impact * alternative.score;
      }
    });

    return Math.max(0, newScore);
  };

  const calculateThresholdAnalysis = (): SensitivityResult[] => {
    // 각 기준별로 순위가 바뀌는 임계점을 찾는 분석
    const results: SensitivityResult[] = [];
    const thresholds: CriticalThreshold[] = [];

    projectData.criteriaWeights.forEach(criterion => {
      // 이진 탐색으로 임계점 찾기
      let threshold = findCriticalThreshold(criterion.id);
      
      const affectedAlts = projectData.alternatives.filter(alt => {
        const scenario: SensitivityScenario = {
          id: 'threshold_test',
          name: 'Threshold Test',
          description: '',
          weightChanges: { [criterion.id]: threshold },
          enabled: true
        };
        const newScore = calculateNewScore(alt, scenario.weightChanges);
        const newRanking = projectData.alternatives.map(a => ({
          ...a,
          newScore: calculateNewScore(a, scenario.weightChanges)
        })).sort((a, b) => b.newScore - a.newScore);
        const newRank = newRanking.findIndex(a => a.id === alt.id) + 1;
        return newRank !== alt.rank;
      });

      thresholds.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        threshold,
        affectedAlternatives: affectedAlts.map(alt => alt.name),
        sensitivity: getSensitivityLevel(threshold)
      });
    });

    setCriticalThresholds(thresholds);
    return results;
  };

  const findCriticalThreshold = (criterionId: string): number => {
    // 이진 탐색으로 순위가 바뀌는 최소 가중치 변화 찾기
    let low = 0;
    let high = 1;
    let threshold = 0.5;

    for (let i = 0; i < 20; i++) { // 최대 20회 반복
      const testScenario: SensitivityScenario = {
        id: 'test',
        name: 'Test',
        description: '',
        weightChanges: { [criterionId]: threshold },
        enabled: true
      };

      const hasRankChange = projectData.alternatives.some(alt => {
        const newScore = calculateNewScore(alt, testScenario.weightChanges);
        const newRanking = projectData.alternatives.map(a => ({
          ...a,
          newScore: calculateNewScore(a, testScenario.weightChanges)
        })).sort((a, b) => b.newScore - a.newScore);
        const newRank = newRanking.findIndex(a => a.id === alt.id) + 1;
        return newRank !== alt.rank;
      });

      if (hasRankChange) {
        high = threshold;
      } else {
        low = threshold;
      }

      threshold = (low + high) / 2;

      if (high - low < 0.001) break;
    }

    return threshold;
  };

  const getStabilityLevel = (rankChange: number, scoreChangeRatio: number): SensitivityResult['stability'] => {
    if (rankChange === 0 && scoreChangeRatio < 0.05) return 'stable';
    if (rankChange <= 1 && scoreChangeRatio < 0.15) return 'moderate';
    if (rankChange <= 2 && scoreChangeRatio < 0.3) return 'sensitive';
    return 'very_sensitive';
  };

  const getSensitivityLevel = (threshold: number): CriticalThreshold['sensitivity'] => {
    if (threshold > 0.3) return 'low';
    if (threshold > 0.15) return 'medium';
    if (threshold > 0.05) return 'high';
    return 'critical';
  };

  const calculateCriticalThresholds = () => {
    // 임계값 계산은 별도로 실행됨
  };

  const drawSensitivityChart = () => {
    if (!results.length || typeof google === 'undefined') return;

    switch (chartType) {
      case 'tornado':
        drawTornadoChart();
        break;
      case 'radar':
        drawRadarChart();
        break;
      case 'waterfall':
        drawWaterfallChart();
        break;
      case 'heatmap':
        drawHeatmapChart();
        break;
    }
  };

  const drawTornadoChart = () => {
    const data = new google.visualization.DataTable();
    data.addColumn('string', '기준');
    data.addColumn('number', '순위 하락');
    data.addColumn('number', '순위 상승');

    projectData.criteriaWeights.forEach(criterion => {
      const positiveChange = results.filter(r => 
        r.scenarioId.includes(criterion.name) && r.rankChange > 0
      ).reduce((sum, r) => sum + r.rankChange, 0);
      
      const negativeChange = results.filter(r => 
        r.scenarioId.includes(criterion.name) && r.rankChange < 0
      ).reduce((sum, r) => sum + Math.abs(r.rankChange), 0);

      data.addRow([criterion.name, -negativeChange, positiveChange]);
    });

    const options = {
      title: '토네이도 차트 - 기준별 순위 변동 영향',
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { 
        title: '순위 변동',
        minValue: -3,
        maxValue: 3
      },
      vAxis: { title: '평가 기준' },
      colors: ['#FF6B6B', '#4ECDC4'],
      backgroundColor: '#fafafa',
      chartArea: { left: 120, top: 50, width: '70%', height: '80%' },
      legend: { position: 'top' }
    };

    const chart = new google.visualization.BarChart(document.getElementById('sensitivity-tornado-chart'));
    chart.draw(data, options);
  };

  const drawRadarChart = () => {
    // Google Charts는 레이더 차트를 직접 지원하지 않으므로 라인 차트로 대체
    const data = new google.visualization.DataTable();
    data.addColumn('string', '기준');
    
    projectData.alternatives.forEach(alt => {
      data.addColumn('number', alt.name);
    });

    projectData.criteriaWeights.forEach(criterion => {
      const row: (string | number)[] = [criterion.name];
      projectData.alternatives.forEach(alt => {
        const altResults = results.filter(r => r.alternative === alt.name);
        const avgScoreChange = altResults.reduce((sum, r) => sum + r.scoreChange, 0) / altResults.length || 0;
        row.push(Math.abs(avgScoreChange));
      });
      data.addRow(row);
    });

    const options = {
      title: '민감도 프로파일 - 기준별 대안 영향도',
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { title: '평가 기준' },
      vAxis: { title: '점수 변화 크기' },
      backgroundColor: '#fafafa',
      chartArea: { left: 80, top: 50, width: '75%', height: '80%' },
      lineWidth: 2,
      pointSize: 5
    };

    const chart = new google.visualization.LineChart(document.getElementById('sensitivity-radar-chart'));
    chart.draw(data, options);
  };

  const drawWaterfallChart = () => {
    // 폭포형 차트를 막대 차트로 시뮬레이션
    const data = new google.visualization.DataTable();
    data.addColumn('string', '대안');
    data.addColumn('number', '원본 점수');
    data.addColumn('number', '변경된 점수');

    projectData.alternatives.forEach(alt => {
      const altResults = results.filter(r => r.alternative === alt.name);
      const avgNewScore = altResults.reduce((sum, r) => sum + r.newScore, 0) / altResults.length || alt.score;
      data.addRow([alt.name, alt.score, avgNewScore]);
    });

    const options = {
      title: '워터폴 차트 - 점수 변화 분석',
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { title: '대안' },
      vAxis: { title: '점수' },
      colors: ['#1f77b4', '#ff7f0e'],
      backgroundColor: '#fafafa',
      chartArea: { left: 80, top: 50, width: '75%', height: '80%' },
      legend: { position: 'top' }
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('sensitivity-waterfall-chart'));
    chart.draw(data, options);
  };

  const drawHeatmapChart = () => {
    const data = new google.visualization.DataTable();
    data.addColumn('string', '대안');
    data.addColumn('string', '시나리오');
    data.addColumn('number', '순위 변화');

    results.forEach(result => {
      const scenario = scenarios.find(s => s.id === result.scenarioId);
      data.addRow([result.alternative, scenario?.name || result.scenarioId, result.rankChange]);
    });

    const options = {
      title: '히트맵 - 시나리오별 순위 변동',
      titleTextStyle: { fontSize: 16, bold: true },
      backgroundColor: '#fafafa',
      colorAxis: {
        colors: ['#FF6B6B', '#FFFFFF', '#4ECDC4'],
        minValue: -3,
        maxValue: 3
      }
    };

    const chart = new google.visualization.Table(document.getElementById('sensitivity-heatmap-chart'));
    chart.draw(data, options);
  };

  const addCustomScenario = () => {
    const newScenario: SensitivityScenario = {
      id: `custom_${Date.now()}`,
      name: '사용자 정의 시나리오',
      description: '사용자가 직접 설정한 가중치 변화',
      weightChanges: { ...customWeightChanges },
      enabled: true
    };

    setScenarios([...scenarios, newScenario]);
    setSelectedScenario(newScenario.id);
  };

  const getStabilityColor = (stability: SensitivityResult['stability']) => {
    const colors = {
      stable: 'text-green-600',
      moderate: 'text-blue-600',
      sensitive: 'text-yellow-600',
      very_sensitive: 'text-red-600'
    };
    return colors[stability];
  };

  const getStabilityText = (stability: SensitivityResult['stability']) => {
    const texts = {
      stable: '안정적',
      moderate: '보통',
      sensitive: '민감함',
      very_sensitive: '매우 민감함'
    };
    return texts[stability];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 분석 설정 */}
      <Card title="민감도 분석 설정">
        <div className="space-y-4">
          {/* 분석 모드 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">분석 모드</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={analysisMode === 'single'}
                  onChange={(e) => setAnalysisMode(e.target.value as any)}
                  className="mr-2"
                />
                <span>단일 시나리오</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="multi"
                  checked={analysisMode === 'multi'}
                  onChange={(e) => setAnalysisMode(e.target.value as any)}
                  className="mr-2"
                />
                <span>다중 시나리오</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="threshold"
                  checked={analysisMode === 'threshold'}
                  onChange={(e) => setAnalysisMode(e.target.value as any)}
                  className="mr-2"
                />
                <span>임계값 분석</span>
              </label>
            </div>
          </div>

          {/* 시나리오 선택/설정 */}
          {analysisMode === 'single' && (
            <div>
              <label className="block text-sm font-medium mb-2">시나리오 선택</label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {scenarios.map(scenario => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {analysisMode === 'multi' && (
            <div>
              <label className="block text-sm font-medium mb-2">분석할 시나리오</label>
              <div className="space-y-2">
                {scenarios.map(scenario => (
                  <label key={scenario.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scenario.enabled}
                      onChange={(e) => setScenarios(scenarios.map(s => 
                        s.id === scenario.id ? { ...s, enabled: e.target.checked } : s
                      ))}
                      className="mr-2"
                    />
                    <span>{scenario.name}</span>
                    <span className="text-sm text-gray-500 ml-2">- {scenario.description}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 사용자 정의 가중치 변경 */}
          <div>
            <label className="block text-sm font-medium mb-2">사용자 정의 가중치 변경</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectData.criteriaWeights.map(criterion => (
                <div key={criterion.id} className="flex items-center space-x-3">
                  <span className="text-sm w-24 truncate">{criterion.name}</span>
                  <input
                    type="range"
                    min={-0.5}
                    max={0.5}
                    step={0.01}
                    value={customWeightChanges[criterion.id] || 0}
                    onChange={(e) => setCustomWeightChanges({
                      ...customWeightChanges,
                      [criterion.id]: parseFloat(e.target.value)
                    })}
                    className="flex-1"
                  />
                  <span className="text-sm w-16 text-right">
                    {((customWeightChanges[criterion.id] || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Button variant="secondary" onClick={addCustomScenario}>
                사용자 정의 시나리오 추가
              </Button>
            </div>
          </div>

          {/* 차트 설정 */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showChart}
                onChange={(e) => setShowChart(e.target.checked)}
                className="mr-2"
              />
              <span>차트 표시</span>
            </label>
            {showChart && (
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="border rounded px-3 py-2"
              >
                <option value="tornado">토네이도 차트</option>
                <option value="radar">레이더 차트</option>
                <option value="waterfall">워터폴 차트</option>
                <option value="heatmap">히트맵</option>
              </select>
            )}
          </div>

          {/* 분석 실행 */}
          <div className="flex space-x-2">
            <Button
              variant="primary"
              onClick={runSensitivityAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '분석 중...' : '민감도 분석 실행'}
            </Button>
            <Button variant="secondary" onClick={() => setResults([])}>
              결과 초기화
            </Button>
          </div>
        </div>
      </Card>

      {/* 분석 결과 */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 차트 */}
          {showChart && (
            <Card title={`민감도 분석 차트 - ${chartType}`}>
              <div className="h-96">
                <div id={`sensitivity-${chartType}-chart`} className="w-full h-full"></div>
              </div>
            </Card>
          )}

          {/* 결과 테이블 */}
          <Card title="민감도 분석 결과">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-2">대안</th>
                    <th className="text-center p-2">원래 순위</th>
                    <th className="text-center p-2">새 순위</th>
                    <th className="text-center p-2">순위 변화</th>
                    <th className="text-center p-2">안정성</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{result.alternative}</td>
                      <td className="text-center p-2">{result.originalRank}</td>
                      <td className="text-center p-2">{result.newRank}</td>
                      <td className="text-center p-2">
                        <span className={`${
                          result.rankChange > 0 ? 'text-green-600' :
                          result.rankChange < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {result.rankChange > 0 ? '+' : ''}{result.rankChange}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <span className={getStabilityColor(result.stability)}>
                          {getStabilityText(result.stability)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 임계값 분석 결과 */}
      {analysisMode === 'threshold' && criticalThresholds.length > 0 && (
        <Card title="임계값 분석 결과">
          <div className="space-y-4">
            {criticalThresholds.map(threshold => (
              <div key={threshold.criterionId} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{threshold.criterionName}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    threshold.sensitivity === 'critical' ? 'bg-red-100 text-red-800' :
                    threshold.sensitivity === 'high' ? 'bg-orange-100 text-orange-800' :
                    threshold.sensitivity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {threshold.sensitivity} 민감도
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>임계 가중치 변화: ±{(threshold.threshold * 100).toFixed(1)}%</p>
                  <p>영향받는 대안: {threshold.affectedAlternatives.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSensitivityAnalysis;