/**
 * 예산배분 최적화 컴포넌트
 * 0/1 배낭문제 및 연속 배분 최적화
 */

import React, { useState, useEffect } from 'react';
import Card from '../common/Card';

interface BudgetItem {
  alternativeId: string;
  alternativeName: string;
  cost: number;
  utility: number; // AHP에서 계산된 종합 중요도
  efficiency: number; // utility/cost 비율
}

interface BudgetAllocation {
  alternativeId: string;
  alternativeName: string;
  allocated: number;
  isSelected: boolean;
  allocationRatio: number;
}

interface OptimizationResult {
  allocations: BudgetAllocation[];
  totalUtility: number;
  totalCost: number;
  budgetUtilization: number;
  efficiencyScore: number;
  unallocatedBudget: number;
}

interface ScenarioResult {
  budgetChange: number;
  result: OptimizationResult;
  marginalUtility: number;
}

interface BudgetOptimizationProps {
  projectId: string;
  alternativeScores: Array<{
    alternativeId: string;
    alternativeName: string;
    totalScore: number;
  }>;
  onClose?: () => void;
}

const BudgetOptimization: React.FC<BudgetOptimizationProps> = ({
  projectId,
  alternativeScores,
  onClose
}) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(1000000);
  const [optimizationMode, setOptimizationMode] = useState<'binary' | 'continuous'>('binary');
  const [mandatoryItems, setMandatoryItems] = useState<string[]>([]);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  // 초기 데이터 설정
  useEffect(() => {
    if (alternativeScores.length > 0) {
      const items: BudgetItem[] = alternativeScores.map(alt => {
        const cost = Math.random() * 500000 + 100000; // 임시 비용 (10만~60만)
        const utility = alt.totalScore;
        const efficiency = utility / cost;
        
        return {
          alternativeId: alt.alternativeId,
          alternativeName: alt.alternativeName,
          cost: Math.round(cost),
          utility,
          efficiency
        };
      });
      
      setBudgetItems(items);
    }
  }, [alternativeScores]);

  // 비용 입력 핸들러
  const handleCostChange = (alternativeId: string, newCost: number) => {
    setBudgetItems(prev => prev.map(item => 
      item.alternativeId === alternativeId 
        ? { ...item, cost: newCost, efficiency: item.utility / newCost }
        : item
    ));
  };

  // 필수/제외 항목 토글
  const toggleMandatory = (alternativeId: string) => {
    setMandatoryItems(prev => 
      prev.includes(alternativeId)
        ? prev.filter(id => id !== alternativeId)
        : [...prev, alternativeId]
    );
    
    // 필수 항목으로 선택되면 제외 목록에서 제거
    setExcludedItems(prev => prev.filter(id => id !== alternativeId));
  };

  const toggleExcluded = (alternativeId: string) => {
    setExcludedItems(prev => 
      prev.includes(alternativeId)
        ? prev.filter(id => id !== alternativeId)
        : [...prev, alternativeId]
    );
    
    // 제외 항목으로 선택되면 필수 목록에서 제거
    setMandatoryItems(prev => prev.filter(id => id !== alternativeId));
  };

  // 최적화 수행
  const performOptimization = async () => {
    if (budgetItems.length === 0) return;
    
    setIsOptimizing(true);
    
    try {
      // 간단한 클라이언트 사이드 최적화 (실제로는 백엔드 API 호출)
      const result = optimizationMode === 'binary' 
        ? solveBinaryKnapsack()
        : solveContinuousAllocation();
      
      setOptimizationResult(result);
      
      // 시나리오 분석 수행
      const scenarios = await performScenarioAnalysis(result);
      setScenarioResults(scenarios);
      
      // 인사이트 생성
      const generatedInsights = generateInsights(result);
      setInsights(generatedInsights);
      
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // 0/1 배낭문제 해결 (간단한 탐욕 알고리즘)
  const solveBinaryKnapsack = (): OptimizationResult => {
    // 효율성 기준으로 정렬
    const sortedItems = [...budgetItems]
      .filter(item => !excludedItems.includes(item.alternativeId))
      .sort((a, b) => b.efficiency - a.efficiency);
    
    const allocations: BudgetAllocation[] = [];
    let remainingBudget = totalBudget;
    let totalUtility = 0;
    
    // 필수 항목 먼저 선택
    budgetItems.forEach(item => {
      if (mandatoryItems.includes(item.alternativeId)) {
        if (remainingBudget >= item.cost) {
          allocations.push({
            alternativeId: item.alternativeId,
            alternativeName: item.alternativeName,
            allocated: item.cost,
            isSelected: true,
            allocationRatio: item.cost / totalBudget
          });
          remainingBudget -= item.cost;
          totalUtility += item.utility;
        }
      }
    });
    
    // 나머지 항목들 효율성 순으로 선택
    sortedItems.forEach(item => {
      if (!mandatoryItems.includes(item.alternativeId) && 
          !excludedItems.includes(item.alternativeId) &&
          remainingBudget >= item.cost) {
        
        allocations.push({
          alternativeId: item.alternativeId,
          alternativeName: item.alternativeName,
          allocated: item.cost,
          isSelected: true,
          allocationRatio: item.cost / totalBudget
        });
        remainingBudget -= item.cost;
        totalUtility += item.utility;
      }
    });
    
    // 선택되지 않은 항목들 추가
    budgetItems.forEach(item => {
      if (!allocations.some(alloc => alloc.alternativeId === item.alternativeId)) {
        allocations.push({
          alternativeId: item.alternativeId,
          alternativeName: item.alternativeName,
          allocated: 0,
          isSelected: false,
          allocationRatio: 0
        });
      }
    });

    const totalCost = totalBudget - remainingBudget;

    return {
      allocations,
      totalUtility,
      totalCost,
      budgetUtilization: totalCost / totalBudget,
      efficiencyScore: totalUtility / totalCost,
      unallocatedBudget: remainingBudget
    };
  };

  // 연속 배분 최적화
  const solveContinuousAllocation = (): OptimizationResult => {
    // 효율성 기준으로 정렬
    const sortedItems = [...budgetItems]
      .filter(item => !excludedItems.includes(item.alternativeId))
      .sort((a, b) => b.efficiency - a.efficiency);
    
    const allocations: BudgetAllocation[] = [];
    let remainingBudget = totalBudget;
    let totalUtility = 0;
    
    // 효율성이 높은 순서대로 예산 배분
    sortedItems.forEach(item => {
      if (remainingBudget <= 0) return;
      
      const allocation = Math.min(item.cost, remainingBudget);
      const allocationRatio = allocation / item.cost;
      const utilityGain = item.utility * allocationRatio;
      
      allocations.push({
        alternativeId: item.alternativeId,
        alternativeName: item.alternativeName,
        allocated: allocation,
        isSelected: allocation > 0,
        allocationRatio: allocation / totalBudget
      });
      
      remainingBudget -= allocation;
      totalUtility += utilityGain;
    });
    
    // 배분되지 않은 항목들 추가
    budgetItems.forEach(item => {
      if (!allocations.some(alloc => alloc.alternativeId === item.alternativeId)) {
        allocations.push({
          alternativeId: item.alternativeId,
          alternativeName: item.alternativeName,
          allocated: 0,
          isSelected: false,
          allocationRatio: 0
        });
      }
    });

    const totalCost = totalBudget - remainingBudget;

    return {
      allocations,
      totalUtility,
      totalCost,
      budgetUtilization: totalCost / totalBudget,
      efficiencyScore: totalUtility / totalCost,
      unallocatedBudget: remainingBudget
    };
  };

  // 시나리오 분석
  const performScenarioAnalysis = async (baseResult: OptimizationResult): Promise<ScenarioResult[]> => {
    const scenarios = [-20, -10, 10, 20]; // ±k%
    const results: ScenarioResult[] = [];
    
    scenarios.forEach(budgetChange => {
      const adjustedBudget = totalBudget * (1 + budgetChange / 100);
      const originalBudget = totalBudget;
      
      // 임시로 예산 변경하여 최적화 수행
      const tempTotalBudget = totalBudget;
      // setTotalBudget을 직접 호출하지 않고 지역 변수 사용
      
      // 간단한 재계산 (실제로는 다시 최적화 수행)
      const budgetDelta = adjustedBudget - originalBudget;
      const utilityDelta = baseResult.totalUtility * (budgetChange / 100 * 0.5); // 추정치
      const marginalUtility = budgetDelta !== 0 ? utilityDelta / budgetDelta : 0;
      
      const adjustedResult: OptimizationResult = {
        ...baseResult,
        totalUtility: baseResult.totalUtility + utilityDelta,
        totalCost: Math.min(adjustedBudget, baseResult.totalCost * (1 + budgetChange / 100 * 0.8)),
        budgetUtilization: Math.min(1, baseResult.budgetUtilization * (1 + budgetChange / 100 * 0.3)),
        unallocatedBudget: Math.max(0, adjustedBudget - baseResult.totalCost)
      };
      
      results.push({
        budgetChange,
        result: adjustedResult,
        marginalUtility
      });
    });
    
    return results;
  };

  // 인사이트 생성
  const generateInsights = (result: OptimizationResult): string[] => {
    const insights: string[] = [];
    
    // 예산 활용률 분석
    if (result.budgetUtilization < 0.8) {
      insights.push(`예산 활용률이 ${(result.budgetUtilization * 100).toFixed(1)}%로 낮습니다. 추가 투자를 고려해보세요.`);
    } else if (result.budgetUtilization > 0.95) {
      insights.push(`예산을 거의 모두 활용했습니다 (${(result.budgetUtilization * 100).toFixed(1)}%).`);
    }
    
    // 효율성 분석
    const selectedItems = result.allocations.filter(alloc => alloc.isSelected);
    if (selectedItems.length > 0) {
      insights.push(`${selectedItems.length}개 항목이 선택되어 총 효용 ${result.totalUtility.toFixed(3)}을 달성했습니다.`);
    }
    
    // 미선택 고효율 항목
    const unselectedHighEfficiency = budgetItems.filter(item => {
      const isSelected = result.allocations.some(alloc => 
        alloc.alternativeId === item.alternativeId && alloc.isSelected
      );
      const averageEfficiency = budgetItems.reduce((sum, i) => sum + i.efficiency, 0) / budgetItems.length;
      return !isSelected && item.efficiency > averageEfficiency;
    });
    
    if (unselectedHighEfficiency.length > 0) {
      insights.push(`효율성이 높지만 선택되지 않은 항목: ${unselectedHighEfficiency.map(item => item.alternativeName).join(', ')}`);
    }
    
    return insights;
  };

  // 결과 내보내기
  const exportResults = () => {
    if (!optimizationResult) return;
    
    const exportData = {
      project_id: projectId,
      optimization_mode: optimizationMode,
      total_budget: totalBudget,
      optimization_result: optimizationResult,
      scenario_analysis: scenarioResults,
      insights: insights,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget_optimization_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card title="예산배분 최적화">
        <div className="space-y-6">
          {/* 기본 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                총 예산
              </label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="총 예산을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최적화 방식
              </label>
              <select
                value={optimizationMode}
                onChange={(e) => setOptimizationMode(e.target.value as 'binary' | 'continuous')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">이진 선택형 (0/1 배낭문제)</option>
                <option value="continuous">연속 배분형 (선형계획)</option>
              </select>
            </div>
          </div>

          {/* 항목별 비용 및 제약조건 설정 */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">대안별 비용 및 제약조건</h5>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">대안명</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">비용</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">효용</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">효율성</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">제약조건</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetItems.map(item => (
                    <tr key={item.alternativeId} className="border-t border-gray-200">
                      <td className="px-4 py-3 font-medium">{item.alternativeName}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => handleCostChange(item.alternativeId, parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">{item.utility.toFixed(3)}</td>
                      <td className="px-4 py-3 text-sm">{item.efficiency.toFixed(6)}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleMandatory(item.alternativeId)}
                            className={`px-2 py-1 text-xs rounded ${
                              mandatoryItems.includes(item.alternativeId)
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}
                          >
                            필수
                          </button>
                          <button
                            onClick={() => toggleExcluded(item.alternativeId)}
                            className={`px-2 py-1 text-xs rounded ${
                              excludedItems.includes(item.alternativeId)
                                ? 'bg-red-100 text-red-700 border border-red-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}
                          >
                            제외
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 최적화 실행 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={performOptimization}
              disabled={isOptimizing || budgetItems.length === 0}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isOptimizing ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>최적화 중...</span>
                </span>
              ) : (
                `${optimizationMode === 'binary' ? '이진 선택' : '연속 배분'} 최적화 실행`
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* 최적화 결과 */}
      {optimizationResult && (
        <Card title="최적화 결과">
          <div className="space-y-6">
            {/* 요약 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {optimizationResult.totalUtility.toFixed(3)}
                </div>
                <div className="text-sm text-blue-700">총 효용</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(optimizationResult.budgetUtilization * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">예산 활용률</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {optimizationResult.efficiencyScore.toFixed(6)}
                </div>
                <div className="text-sm text-yellow-700">효율성 점수</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {optimizationResult.unallocatedBudget.toLocaleString()}
                </div>
                <div className="text-sm text-purple-700">잔여 예산</div>
              </div>
            </div>

            {/* 배분 결과 */}
            <div>
              <h6 className="font-medium text-gray-800 mb-3">배분 결과</h6>
              <div className="space-y-2">
                {optimizationResult.allocations
                  .filter(alloc => alloc.isSelected)
                  .sort((a, b) => b.allocated - a.allocated)
                  .map(allocation => (
                    <div key={allocation.alternativeId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="font-medium">{allocation.alternativeName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">
                          {allocation.allocated.toLocaleString()}원
                        </div>
                        <div className="text-sm text-green-600">
                          ({(allocation.allocationRatio * 100).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 시나리오 분석 */}
            {scenarioResults.length > 0 && (
              <div>
                <h6 className="font-medium text-gray-800 mb-3">예산 시나리오 분석</h6>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">예산 변화</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">총 효용</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">활용률</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">한계효용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarioResults.map(scenario => (
                        <tr key={scenario.budgetChange} className="border-t border-gray-200">
                          <td className="px-4 py-3">
                            <span className={`font-medium ${
                              scenario.budgetChange > 0 ? 'text-green-600' : 
                              scenario.budgetChange < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {scenario.budgetChange > 0 ? '+' : ''}{scenario.budgetChange}%
                            </span>
                          </td>
                          <td className="px-4 py-3">{scenario.result.totalUtility.toFixed(3)}</td>
                          <td className="px-4 py-3">{(scenario.result.budgetUtilization * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3">{scenario.marginalUtility.toFixed(6)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 인사이트 */}
            {insights.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h6 className="font-medium text-yellow-800 mb-2">💡 최적화 인사이트</h6>
                <div className="space-y-1">
                  {insights.map((insight, index) => (
                    <p key={index} className="text-sm text-yellow-700">• {insight}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={exportResults}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                📊 결과 내보내기
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setOptimizationResult(null);
                    setScenarioResults([]);
                    setInsights([]);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  초기화
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    닫기
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BudgetOptimization;