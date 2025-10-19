/**
 * 예산배분 뷰 컴포넌트
 * AHP 결과를 바탕으로 한 예산 배분 최적화 및 시나리오 분석
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';

interface BudgetItem {
  id: string;
  name: string;
  ahpScore: number;
  cost: number;
  utility: number;
  efficiency: number; // utility/cost
  priority: 'mandatory' | 'high' | 'medium' | 'low';
  category?: string;
  description?: string;
  isSelected?: boolean;
  allocatedAmount?: number;
}

interface BudgetConstraint {
  totalBudget: number;
  minBudgetPerItem?: number;
  maxBudgetPerItem?: number;
  mandatoryItems: string[];
  excludedItems: string[];
  categoryLimits?: { [category: string]: number };
}

interface OptimizationResult {
  selectedItems: BudgetItem[];
  totalCost: number;
  totalUtility: number;
  efficiency: number;
  budgetUtilization: number;
  unallocatedBudget: number;
}

interface ScenarioAnalysis {
  budgetChange: number;
  result: OptimizationResult;
  marginalUtility: number;
  newSelections: string[];
  removedSelections: string[];
}

interface BudgetingViewProps {
  alternatives: Array<{
    id: string;
    name: string;
    ahpScore: number;
    description?: string;
  }>;
  initialBudget?: number;
  onOptimize?: (result: OptimizationResult) => void;
  onExport?: (data: any) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const BudgetingView: React.FC<BudgetingViewProps> = ({
  alternatives,
  initialBudget = 1000000,
  onOptimize,
  onExport
}) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [constraint, setConstraint] = useState<BudgetConstraint>({
    totalBudget: initialBudget,
    mandatoryItems: [],
    excludedItems: [],
    minBudgetPerItem: 0,
    maxBudgetPerItem: initialBudget
  });
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [scenarioResults, setScenarioResults] = useState<ScenarioAnalysis[]>([]);
  const [optimizationMode, setOptimizationMode] = useState<'binary' | 'continuous' | 'fractional'>('binary');
  const [chartType, setChartType] = useState<'efficiency' | 'allocation' | 'scenario' | 'portfolio'>('efficiency');
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    initializeBudgetItems();
  }, [alternatives]);

  const initializeBudgetItems = () => {
    const items: BudgetItem[] = alternatives.map((alt, index) => ({
      id: alt.id,
      name: alt.name,
      ahpScore: alt.ahpScore,
      cost: Math.round(50000 + Math.random() * 200000), // 5만~25만 랜덤 비용
      utility: alt.ahpScore,
      efficiency: alt.ahpScore / (50000 + Math.random() * 200000),
      priority: index < alternatives.length * 0.3 ? 'high' : 
                index < alternatives.length * 0.6 ? 'medium' : 'low',
      category: `카테고리 ${Math.ceil((index + 1) / 2)}`,
      description: alt.description,
      isSelected: false,
      allocatedAmount: 0
    }));
    
    // 효율성 재계산
    items.forEach(item => {
      item.efficiency = item.utility / item.cost;
    });
    
    setBudgetItems(items);
  };

  const updateItemCost = (itemId: string, newCost: number) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, cost: newCost, efficiency: item.utility / newCost }
        : item
    ));
  };

  const updateItemPriority = (itemId: string, priority: 'mandatory' | 'high' | 'medium' | 'low') => {
    setBudgetItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, priority } : item
    ));
    
    // mandatory 우선순위일 때 제약조건도 업데이트
    if (priority === 'mandatory') {
      setConstraint(prev => ({
        ...prev,
        mandatoryItems: [...prev.mandatoryItems.filter(id => id !== itemId), itemId]
      }));
    } else {
      setConstraint(prev => ({
        ...prev,
        mandatoryItems: prev.mandatoryItems.filter(id => id !== itemId)
      }));
    }
  };

  const performOptimization = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      let result: OptimizationResult;
      
      switch (optimizationMode) {
        case 'binary':
          result = solveBinaryKnapsack();
          break;
        case 'continuous':
          result = solveContinuousAllocation();
          break;
        case 'fractional':
          result = solveFractionalKnapsack();
          break;
        default:
          result = solveBinaryKnapsack();
      }
      
      setOptimizationResult(result);
      
      // 시나리오 분석 수행
      const scenarios = await performScenarioAnalysis(result);
      setScenarioResults(scenarios);
      
      if (onOptimize) {
        onOptimize(result);
      }
      
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [budgetItems, constraint, optimizationMode]);

  const solveBinaryKnapsack = (): OptimizationResult => {
    // 효율성 기준으로 정렬
    const availableItems = budgetItems.filter(item => 
      !constraint.excludedItems.includes(item.id)
    );
    
    const sortedItems = [...availableItems].sort((a, b) => b.efficiency - a.efficiency);
    
    let remainingBudget = constraint.totalBudget;
    let totalUtility = 0;
    const selectedItems: BudgetItem[] = [];
    
    // 필수 항목 먼저 선택
    constraint.mandatoryItems.forEach(itemId => {
      const item = budgetItems.find(b => b.id === itemId);
      if (item && remainingBudget >= item.cost) {
        selectedItems.push({ ...item, isSelected: true });
        remainingBudget -= item.cost;
        totalUtility += item.utility;
      }
    });
    
    // 나머지 항목들 효율성 순으로 선택
    sortedItems.forEach(item => {
      if (!constraint.mandatoryItems.includes(item.id) && 
          remainingBudget >= item.cost &&
          (constraint.minBudgetPerItem === undefined || item.cost >= constraint.minBudgetPerItem) &&
          (constraint.maxBudgetPerItem === undefined || item.cost <= constraint.maxBudgetPerItem)) {
        
        selectedItems.push({ ...item, isSelected: true });
        remainingBudget -= item.cost;
        totalUtility += item.utility;
      }
    });
    
    const totalCost = constraint.totalBudget - remainingBudget;
    
    return {
      selectedItems,
      totalCost,
      totalUtility,
      efficiency: totalUtility / totalCost,
      budgetUtilization: totalCost / constraint.totalBudget,
      unallocatedBudget: remainingBudget
    };
  };

  const solveContinuousAllocation = (): OptimizationResult => {
    const availableItems = budgetItems.filter(item => 
      !constraint.excludedItems.includes(item.id)
    );
    
    const sortedItems = [...availableItems].sort((a, b) => b.efficiency - a.efficiency);
    let remainingBudget = constraint.totalBudget;
    let totalUtility = 0;
    const selectedItems: BudgetItem[] = [];
    
    sortedItems.forEach(item => {
      if (remainingBudget <= 0) return;
      
      const allocation = Math.min(item.cost, remainingBudget);
      const allocationRatio = allocation / item.cost;
      const utilityGain = item.utility * allocationRatio;
      
      selectedItems.push({
        ...item,
        isSelected: allocation > 0,
        allocatedAmount: allocation
      });
      
      remainingBudget -= allocation;
      totalUtility += utilityGain;
    });
    
    const totalCost = constraint.totalBudget - remainingBudget;
    
    return {
      selectedItems,
      totalCost,
      totalUtility,
      efficiency: totalUtility / totalCost,
      budgetUtilization: totalCost / constraint.totalBudget,
      unallocatedBudget: remainingBudget
    };
  };

  const solveFractionalKnapsack = (): OptimizationResult => {
    // 분할 가능한 배낭 문제 (탐욕 알고리즘)
    const availableItems = budgetItems.filter(item => 
      !constraint.excludedItems.includes(item.id)
    );
    
    const sortedItems = [...availableItems].sort((a, b) => b.efficiency - a.efficiency);
    let remainingBudget = constraint.totalBudget;
    let totalUtility = 0;
    const selectedItems: BudgetItem[] = [];
    
    // 필수 항목 먼저 선택
    constraint.mandatoryItems.forEach(itemId => {
      const item = budgetItems.find(b => b.id === itemId);
      if (item) {
        const allocation = Math.min(item.cost, remainingBudget);
        selectedItems.push({ 
          ...item, 
          isSelected: true, 
          allocatedAmount: allocation 
        });
        remainingBudget -= allocation;
        totalUtility += item.utility * (allocation / item.cost);
      }
    });
    
    // 효율성 순으로 분할 배분
    sortedItems.forEach(item => {
      if (!constraint.mandatoryItems.includes(item.id) && remainingBudget > 0) {
        const allocation = Math.min(item.cost, remainingBudget);
        const allocationRatio = allocation / item.cost;
        
        selectedItems.push({
          ...item,
          isSelected: allocation > 0,
          allocatedAmount: allocation
        });
        
        remainingBudget -= allocation;
        totalUtility += item.utility * allocationRatio;
      }
    });
    
    const totalCost = constraint.totalBudget - remainingBudget;
    
    return {
      selectedItems,
      totalCost,
      totalUtility,
      efficiency: totalUtility / totalCost,
      budgetUtilization: totalCost / constraint.totalBudget,
      unallocatedBudget: remainingBudget
    };
  };

  const performScenarioAnalysis = async (baseResult: OptimizationResult): Promise<ScenarioAnalysis[]> => {
    const scenarios = [-30, -20, -10, 10, 20, 30]; // ±% 예산 변화
    const results: ScenarioAnalysis[] = [];
    
    scenarios.forEach(budgetChangePercent => {
      const adjustedBudget = constraint.totalBudget * (1 + budgetChangePercent / 100);
      const originalConstraint = { ...constraint };
      
      // 임시로 예산 변경
      const tempConstraint = { ...constraint, totalBudget: adjustedBudget };
      
      // 새로운 최적화 수행 (간단한 추정)
      let newResult: OptimizationResult;
      
      if (budgetChangePercent > 0) {
        // 예산 증가: 추가 선택 가능
        const remainingItems = budgetItems.filter(item => 
          !baseResult.selectedItems.some(selected => selected.id === item.id)
        ).sort((a, b) => b.efficiency - a.efficiency);
        
        let extraBudget = adjustedBudget - baseResult.totalCost;
        const newSelections: string[] = [];
        let additionalUtility = 0;
        
        remainingItems.forEach(item => {
          if (extraBudget >= item.cost) {
            newSelections.push(item.id);
            extraBudget -= item.cost;
            additionalUtility += item.utility;
          }
        });
        
        newResult = {
          ...baseResult,
          totalUtility: baseResult.totalUtility + additionalUtility,
          totalCost: adjustedBudget - extraBudget,
          budgetUtilization: (adjustedBudget - extraBudget) / adjustedBudget,
          unallocatedBudget: extraBudget
        };
        
        results.push({
          budgetChange: budgetChangePercent,
          result: newResult,
          marginalUtility: additionalUtility / (adjustedBudget - constraint.totalBudget),
          newSelections,
          removedSelections: []
        });
        
      } else {
        // 예산 감소: 일부 제거 필요
        const sortedSelected = [...baseResult.selectedItems].sort((a, b) => a.efficiency - b.efficiency);
        let budgetCut = constraint.totalBudget - adjustedBudget;
        const removedSelections: string[] = [];
        let lostUtility = 0;
        
        sortedSelected.forEach(item => {
          if (budgetCut > 0 && !constraint.mandatoryItems.includes(item.id)) {
            removedSelections.push(item.id);
            budgetCut -= item.cost;
            lostUtility += item.utility;
          }
        });
        
        newResult = {
          ...baseResult,
          totalUtility: baseResult.totalUtility - lostUtility,
          totalCost: adjustedBudget,
          budgetUtilization: 1.0,
          unallocatedBudget: Math.max(0, budgetCut)
        };
        
        results.push({
          budgetChange: budgetChangePercent,
          result: newResult,
          marginalUtility: -lostUtility / (constraint.totalBudget - adjustedBudget),
          newSelections: [],
          removedSelections
        });
      }
    });
    
    return results;
  };

  const exportBudgetAnalysis = () => {
    const exportData = {
      analysis_type: 'budget_optimization',
      timestamp: new Date().toISOString(),
      constraint,
      optimization_mode: optimizationMode,
      budget_items: budgetItems,
      optimization_result: optimizationResult,
      scenario_analysis: scenarioResults
    };
    
    if (onExport) {
      onExport(exportData);
    } else {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `budget_analysis_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const prepareEfficiencyChartData = () => {
    return budgetItems.map(item => ({
      name: item.name,
      cost: item.cost,
      utility: item.utility,
      efficiency: item.efficiency,
      selected: optimizationResult?.selectedItems.some(s => s.id === item.id) || false
    }));
  };

  const prepareAllocationChartData = () => {
    if (!optimizationResult) return [];
    
    return optimizationResult.selectedItems.map(item => ({
      name: item.name,
      cost: item.allocatedAmount || item.cost,
      utility: item.utility * ((item.allocatedAmount || item.cost) / item.cost),
      efficiency: item.efficiency
    }));
  };

  const prepareScenarioChartData = () => {
    return scenarioResults.map(scenario => ({
      budgetChange: `${scenario.budgetChange > 0 ? '+' : ''}${scenario.budgetChange}%`,
      totalUtility: scenario.result.totalUtility,
      budgetUtilization: scenario.result.budgetUtilization * 100,
      marginalUtility: scenario.marginalUtility
    }));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">💰 예산배분 최적화</h3>
          <p className="text-gray-600">AHP 결과를 활용한 최적 자원 배분 계획</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportBudgetAnalysis}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            📊 분석 내보내기
          </button>
        </div>
      </div>

      {/* 예산 설정 및 제약조건 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 예산 설정 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-800 mb-4">💳 예산 설정</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                총 예산
              </label>
              <input
                type="number"
                value={constraint.totalBudget}
                onChange={(e) => setConstraint(prev => ({ 
                  ...prev, 
                  totalBudget: parseInt(e.target.value) || 0 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="총 예산"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  항목별 최소 예산
                </label>
                <input
                  type="number"
                  value={constraint.minBudgetPerItem || ''}
                  onChange={(e) => setConstraint(prev => ({ 
                    ...prev, 
                    minBudgetPerItem: parseInt(e.target.value) || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="최소값"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  항목별 최대 예산
                </label>
                <input
                  type="number"
                  value={constraint.maxBudgetPerItem || ''}
                  onChange={(e) => setConstraint(prev => ({ 
                    ...prev, 
                    maxBudgetPerItem: parseInt(e.target.value) || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="최대값"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최적화 방식
              </label>
              <select
                value={optimizationMode}
                onChange={(e) => setOptimizationMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">이진 선택 (0/1 배낭문제)</option>
                <option value="continuous">연속 배분 (부분 할당)</option>
                <option value="fractional">분할 배낭 (완전 분할)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 최적화 실행 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-800 mb-4">🎯 최적화 실행</h4>
          
          <div className="space-y-4">
            <button
              onClick={performOptimization}
              disabled={isOptimizing}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isOptimizing ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>최적화 중...</span>
                </span>
              ) : (
                `${optimizationMode === 'binary' ? '이진 선택' : 
                  optimizationMode === 'continuous' ? '연속 배분' : '분할 배낭'} 최적화`
              )}
            </button>
            
            {optimizationResult && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {optimizationResult.totalUtility.toFixed(3)}
                  </div>
                  <div className="text-sm text-blue-700">총 효용</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {(optimizationResult.budgetUtilization * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-700">예산 활용률</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 항목별 비용 및 우선순위 설정 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-800 mb-4">📋 항목별 설정</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">항목명</th>
                <th className="border border-gray-300 px-4 py-2 text-left">AHP 점수</th>
                <th className="border border-gray-300 px-4 py-2 text-left">비용</th>
                <th className="border border-gray-300 px-4 py-2 text-left">효율성</th>
                <th className="border border-gray-300 px-4 py-2 text-left">우선순위</th>
                <th className="border border-gray-300 px-4 py-2 text-left">상태</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.ahpScore.toFixed(3)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={item.cost}
                      onChange={(e) => updateItemCost(item.id, parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.efficiency.toFixed(6)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={item.priority}
                      onChange={(e) => updateItemPriority(item.id, e.target.value as any)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="mandatory">필수</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {optimizationResult?.selectedItems.some(s => s.id === item.id) ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">✓ 선택됨</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">미선택</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 차트 선택 */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">시각화:</span>
        {[
          { type: 'efficiency', label: '효율성 분석', icon: '📊' },
          { type: 'allocation', label: '배분 결과', icon: '🥧' },
          { type: 'scenario', label: '시나리오 분석', icon: '📈' },
          { type: 'portfolio', label: '포트폴리오', icon: '💼' }
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
          {chartType === 'efficiency' && (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={prepareEfficiencyChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cost" name="비용" />
                <YAxis dataKey="utility" name="효용" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    typeof value === 'number' ? value.toFixed(3) : value,
                    name === 'cost' ? '비용' : name === 'utility' ? '효용' : name
                  ]}
                />
                <Scatter 
                  name="항목" 
                  data={prepareEfficiencyChartData()}
                  fill="#3b82f6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'allocation' && optimizationResult && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareAllocationChartData()}
                  dataKey="cost"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name} (${percent ? ((percent as number) * 100).toFixed(1) : '0'}%)`}
                >
                  {prepareAllocationChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'scenario' && scenarioResults.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareScenarioChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="budgetChange" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalUtility" stroke="#8884d8" name="총 효용" />
                <Line type="monotone" dataKey="budgetUtilization" stroke="#82ca9d" name="예산 활용률(%)" />
              </LineChart>
            </ResponsiveContainer>
          )}
          
          {chartType === 'portfolio' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareEfficiencyChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utility" fill="#3b82f6" name="효용" />
                <Bar dataKey="efficiency" fill="#10b981" name="효율성" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 최적화 결과 상세 */}
      {optimizationResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-800 mb-4">🎯 최적화 결과</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {optimizationResult.selectedItems.length}
              </div>
              <div className="text-sm text-blue-700">선택된 항목</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {optimizationResult.totalCost.toLocaleString()}
              </div>
              <div className="text-sm text-green-700">총 비용</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {optimizationResult.efficiency.toFixed(4)}
              </div>
              <div className="text-sm text-yellow-700">전체 효율성</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {optimizationResult.unallocatedBudget.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700">잔여 예산</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">선택된 항목:</h5>
            {optimizationResult.selectedItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium">{item.name}</span>
                <div className="text-right">
                  <div className="font-bold text-green-700">
                    {(item.allocatedAmount || item.cost).toLocaleString()}원
                  </div>
                  <div className="text-sm text-green-600">
                    효용: {item.utility.toFixed(3)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetingView;