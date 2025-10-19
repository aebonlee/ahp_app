/**
 * 민감도 분석 뷰 컴포넌트
 * 슬라이더로 가중치 조정하고 결과 변화를 스파이더/바 차트로 시각화
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from 'recharts';

interface CriterionWeight {
  id: string;
  name: string;
  originalWeight: number;
  currentWeight: number;
  minWeight: number;
  maxWeight: number;
  isLocked: boolean;
}

interface AlternativeScore {
  id: string;
  name: string;
  originalScore: number;
  currentScore: number;
  originalRank: number;
  currentRank: number;
  scoresByCategory: { [criterionId: string]: number };
}

interface SensitivityData {
  weightPoint: number;
  scores: { [alternativeId: string]: number };
  rankings: string[];
  stabilityIndex: number;
}

interface SensitivityViewProps {
  criteria: CriterionWeight[];
  alternatives: AlternativeScore[];
  onWeightChange?: (criterionId: string, newWeight: number) => void;
  onReset?: () => void;
  onExport?: (data: any) => void;
}

const SensitivityView: React.FC<SensitivityViewProps> = ({
  criteria,
  alternatives,
  onWeightChange,
  onReset,
  onExport
}) => {
  const [selectedCriterion, setSelectedCriterion] = useState<string>(criteria[0]?.id || '');
  const [weightSliders, setWeightSliders] = useState<{ [id: string]: number }>({});
  const [sensitivityData, setSensitivityData] = useState<SensitivityData[]>([]);
  const [chartType, setChartType] = useState<'radar' | 'bar' | 'line'>('bar');
  const [stabilityIndex, setStabilityIndex] = useState<number>(1.0);
  const [criticalThresholds, setCriticalThresholds] = useState<{ [criterionId: string]: number[] }>({});

  useEffect(() => {
    // 초기 슬라이더 값 설정
    const initialWeights: { [id: string]: number } = {};
    criteria.forEach(criterion => {
      initialWeights[criterion.id] = criterion.currentWeight;
    });
    setWeightSliders(initialWeights);
  }, [criteria]);

  useEffect(() => {
    if (selectedCriterion) {
      generateSensitivityData(selectedCriterion);
      calculateCriticalThresholds();
    }
  }, [selectedCriterion, weightSliders]);

  const generateSensitivityData = useCallback((criterionId: string) => {
    const criterion = criteria.find(c => c.id === criterionId);
    if (!criterion) return;

    const data: SensitivityData[] = [];
    const steps = 21; // -50% ~ +50%, 5% 간격
    
    for (let i = 0; i < steps; i++) {
      const factor = 0.5 + (i / (steps - 1)); // 0.5 ~ 1.5
      const adjustedWeight = criterion.originalWeight * factor;
      
      // 가중치가 유효 범위 내인지 확인
      if (adjustedWeight >= criterion.minWeight && adjustedWeight <= criterion.maxWeight) {
        const adjustedScores = calculateAdjustedScores(criterionId, adjustedWeight);
        const rankings = alternatives
          .map(alt => ({ id: alt.id, score: adjustedScores[alt.id] || 0 }))
          .sort((a, b) => b.score - a.score)
          .map(item => item.id);
        
        const stability = calculateStabilityIndex(rankings);
        
        data.push({
          weightPoint: adjustedWeight,
          scores: adjustedScores,
          rankings,
          stabilityIndex: stability
        });
      }
    }
    
    setSensitivityData(data);
  }, [criteria, alternatives]);

  const calculateAdjustedScores = (criterionId: string, newWeight: number): { [alternativeId: string]: number } => {
    const adjustedScores: { [alternativeId: string]: number } = {};
    
    // 가중치 정규화
    const totalOriginalWeight = criteria.reduce((sum, c) => sum + (c.id === criterionId ? c.originalWeight : c.currentWeight), 0);
    const weightDifference = newWeight - criteria.find(c => c.id === criterionId)!.originalWeight;
    const scaleFactor = (totalOriginalWeight - weightDifference) / (totalOriginalWeight - criteria.find(c => c.id === criterionId)!.originalWeight);
    
    alternatives.forEach(alternative => {
      let totalScore = 0;
      
      criteria.forEach(criterion => {
        const weight = criterion.id === criterionId ? 
          newWeight : 
          criterion.currentWeight * scaleFactor;
        const score = alternative.scoresByCategory[criterion.id] || 0;
        totalScore += weight * score;
      });
      
      adjustedScores[alternative.id] = totalScore;
    });
    
    return adjustedScores;
  };

  const calculateStabilityIndex = (currentRankings: string[]): number => {
    const originalRankings = alternatives
      .sort((a, b) => a.originalRank - b.originalRank)
      .map(alt => alt.id);
    
    let matches = 0;
    for (let i = 0; i < Math.min(currentRankings.length, originalRankings.length); i++) {
      if (currentRankings[i] === originalRankings[i]) {
        matches++;
      }
    }
    
    return matches / originalRankings.length;
  };

  const calculateCriticalThresholds = () => {
    const thresholds: { [criterionId: string]: number[] } = {};
    
    criteria.forEach(criterion => {
      const criticalPoints: number[] = [];
      let previousRankings: string[] = [];
      
      sensitivityData.forEach((data, index) => {
        if (index === 0) {
          previousRankings = data.rankings;
          return;
        }
        
        // 순위 변동 감지
        const hasRankingChange = !data.rankings.every((id, idx) => id === previousRankings[idx]);
        
        if (hasRankingChange) {
          criticalPoints.push(data.weightPoint);
        }
        
        previousRankings = data.rankings;
      });
      
      thresholds[criterion.id] = criticalPoints;
    });
    
    setCriticalThresholds(thresholds);
  };

  const handleSliderChange = (criterionId: string, value: number) => {
    const newWeights = { ...weightSliders, [criterionId]: value };
    
    // 다른 가중치들을 비례적으로 조정
    const criterion = criteria.find(c => c.id === criterionId)!;
    const originalWeight = criterion.originalWeight;
    const weightChange = value - originalWeight;
    
    const otherCriteria = criteria.filter(c => c.id !== criterionId && !c.isLocked);
    const totalOtherWeight = otherCriteria.reduce((sum, c) => sum + c.originalWeight, 0);
    
    if (totalOtherWeight > 0) {
      otherCriteria.forEach(otherCriterion => {
        const proportion = otherCriterion.originalWeight / totalOtherWeight;
        const adjustment = -weightChange * proportion;
        newWeights[otherCriterion.id] = Math.max(
          otherCriterion.minWeight,
          Math.min(otherCriterion.maxWeight, otherCriterion.originalWeight + adjustment)
        );
      });
    }
    
    setWeightSliders(newWeights);
    
    if (onWeightChange) {
      onWeightChange(criterionId, value);
    }
  };

  const resetWeights = () => {
    const originalWeights: { [id: string]: number } = {};
    criteria.forEach(criterion => {
      originalWeights[criterion.id] = criterion.originalWeight;
    });
    setWeightSliders(originalWeights);
    
    if (onReset) {
      onReset();
    }
  };

  const exportAnalysis = () => {
    const exportData = {
      analysis_type: 'sensitivity',
      timestamp: new Date().toISOString(),
      criteria: criteria.map(c => ({
        id: c.id,
        name: c.name,
        original_weight: c.originalWeight,
        current_weight: weightSliders[c.id] || c.currentWeight,
        critical_thresholds: criticalThresholds[c.id] || []
      })),
      alternatives: alternatives.map(alt => ({
        id: alt.id,
        name: alt.name,
        original_score: alt.originalScore,
        current_score: alt.currentScore,
        original_rank: alt.originalRank,
        current_rank: alt.currentRank
      })),
      sensitivity_data: sensitivityData,
      stability_index: stabilityIndex
    };
    
    if (onExport) {
      onExport(exportData);
    } else {
      // 기본 JSON 다운로드
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sensitivity_analysis_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const prepareChartData = () => {
    return alternatives.map(alt => ({
      name: alt.name,
      original: alt.originalScore,
      current: alt.currentScore,
      change: ((alt.currentScore - alt.originalScore) / alt.originalScore * 100).toFixed(1),
      rank: alt.currentRank,
      ...Object.fromEntries(
        criteria.map(criterion => [
          criterion.name, 
          alt.scoresByCategory[criterion.id] || 0
        ])
      )
    }));
  };

  const prepareSensitivityChartData = () => {
    if (!selectedCriterion || sensitivityData.length === 0) return [];
    
    return sensitivityData.map(data => ({
      weight: data.weightPoint.toFixed(3),
      ...Object.fromEntries(
        alternatives.map(alt => [
          alt.name,
          data.scores[alt.id] || 0
        ])
      ),
      stability: data.stabilityIndex
    }));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">📊 민감도 분석</h3>
          <p className="text-gray-600">가중치 변화가 최종 결과에 미치는 영향을 분석합니다</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetWeights}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            🔄 초기화
          </button>
          <button
            onClick={exportAnalysis}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            📊 분석 내보내기
          </button>
        </div>
      </div>

      {/* 가중치 조정 패널 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">🎛️ 가중치 실시간 조정</h4>
        
        <div className="space-y-4">
          {criteria.map(criterion => (
            <div key={criterion.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{criterion.name}</span>
                  {criterion.isLocked && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">🔒 고정</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500">
                    원래: {(criterion.originalWeight * 100).toFixed(1)}%
                  </span>
                  <span className="font-medium text-blue-600">
                    현재: {((weightSliders[criterion.id] || criterion.currentWeight) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min={criterion.minWeight}
                  max={criterion.maxWeight}
                  step={0.001}
                  value={weightSliders[criterion.id] || criterion.currentWeight}
                  onChange={(e) => handleSliderChange(criterion.id, parseFloat(e.target.value))}
                  disabled={criterion.isLocked}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    criterion.isLocked ? 'opacity-50 cursor-not-allowed' : ''
                  } bg-gray-200 slider`}
                />
                
                {/* 임계점 표시 */}
                {criticalThresholds[criterion.id]?.map((threshold, index) => (
                  <div
                    key={index}
                    className="absolute top-0 w-1 h-2 bg-red-500"
                    style={{
                      left: `${((threshold - criterion.minWeight) / (criterion.maxWeight - criterion.minWeight)) * 100}%`
                    }}
                    title={`순위 변동점: ${(threshold * 100).toFixed(1)}%`}
                  />
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{(criterion.minWeight * 100).toFixed(1)}%</span>
                <span>{(criterion.maxWeight * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* 안정성 지수 */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-800">순위 안정성 지수</span>
            <span className={`text-lg font-bold ${
              stabilityIndex > 0.8 ? 'text-green-600' :
              stabilityIndex > 0.6 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {(stabilityIndex * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-yellow-700 mt-1">
            가중치 변화에 따른 순위 변동의 정도를 나타냅니다
          </div>
        </div>
      </div>

      {/* 차트 선택 */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">차트 형태:</span>
        {[
          { type: 'bar', label: '막대 차트', icon: '📊' },
          { type: 'radar', label: '스파이더 차트', icon: '🕸️' },
          { type: 'line', label: '민감도 곡선', icon: '📈' }
        ].map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => setChartType(type as any)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              chartType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-96">
          {chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? value.toFixed(3) : value, 
                    name === 'original' ? '원래 점수' : name === 'current' ? '현재 점수' : name
                  ]}
                />
                <Legend />
                <Bar dataKey="original" fill="#94a3b8" name="원래 점수" />
                <Bar dataKey="current" fill="#3b82f6" name="현재 점수" />
              </BarChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'radar' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={prepareChartData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                {criteria.map((criterion, index) => (
                  <Radar
                    key={criterion.id}
                    name={criterion.name}
                    dataKey={criterion.name}
                    stroke={`hsl(${(index * 360) / criteria.length}, 70%, 50%)`}
                    fill={`hsl(${(index * 360) / criteria.length}, 70%, 50%)`}
                    fillOpacity={0.1}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareSensitivityChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weight" label={{ value: '가중치', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: '점수', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? value.toFixed(3) : value, 
                    name
                  ]}
                />
                <Legend />
                {alternatives.map((alt, index) => (
                  <Line
                    key={alt.id}
                    type="monotone"
                    dataKey={alt.name}
                    stroke={`hsl(${(index * 360) / alternatives.length}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 현재 순위 표시 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">🏆 현재 순위</h4>
        <div className="space-y-2">
          {alternatives
            .sort((a, b) => a.currentRank - b.currentRank)
            .map((alternative, index) => (
              <div key={alternative.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-400 text-gray-900' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium">{alternative.name}</div>
                    <div className="text-sm text-gray-600">
                      점수: {alternative.currentScore.toFixed(3)}
                      {alternative.originalRank !== alternative.currentRank && (
                        <span className={`ml-2 text-xs ${
                          alternative.currentRank < alternative.originalRank ? 'text-green-600' : 'text-red-600'
                        }`}>
                          (원래 {alternative.originalRank}위)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    alternative.currentScore > alternative.originalScore ? 'text-green-600' :
                    alternative.currentScore < alternative.originalScore ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {alternative.currentScore > alternative.originalScore ? '↗' : 
                     alternative.currentScore < alternative.originalScore ? '↘' : '→'}
                    {(((alternative.currentScore - alternative.originalScore) / alternative.originalScore) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SensitivityView;