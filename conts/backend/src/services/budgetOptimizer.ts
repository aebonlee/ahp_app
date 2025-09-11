/**
 * 자원배분(예산배분) 최적화 서비스
 * 0/1 배낭문제 및 연속 배분 최적화 해결
 */

export interface BudgetItem {
  alternativeId: string;
  alternativeName: string;
  cost: number;
  utility: number; // AHP에서 계산된 종합 중요도
  efficiency: number; // utility/cost 비율
}

export interface BudgetConstraint {
  totalBudget: number;
  minBudgetPerItem?: number;
  maxBudgetPerItem?: number;
  mandatoryItems?: string[]; // 필수 선택 항목
  excludedItems?: string[]; // 제외 항목
}

export interface BudgetAllocation {
  alternativeId: string;
  alternativeName: string;
  allocated: number;
  isSelected: boolean;
  allocationRatio: number; // 해당 항목에 배정된 비율
}

export interface OptimizationResult {
  allocations: BudgetAllocation[];
  totalUtility: number;
  totalCost: number;
  budgetUtilization: number; // 예산 활용률
  efficiencyScore: number; // 효율성 점수
  unallocatedBudget: number;
}

export interface ScenarioAnalysis {
  baseScenario: OptimizationResult;
  scenarios: {
    budgetChange: number; // ±k%
    result: OptimizationResult;
    marginalUtility: number; // 한계효용
  }[];
}

export class BudgetOptimizer {

  /**
   * 0/1 배낭문제 해결 (이진 선택형)
   * @param items 예산 항목들
   * @param constraint 예산 제약조건
   * @returns 최적화 결과
   */
  static solveBinaryKnapsack(
    items: BudgetItem[], 
    constraint: BudgetConstraint
  ): OptimizationResult {
    
    const { totalBudget, mandatoryItems = [], excludedItems = [] } = constraint;
    
    // 1. 필터링: 제외 항목 제거, 예산 초과 항목 제거
    const validItems = items.filter(item => 
      !excludedItems.includes(item.alternativeId) && 
      item.cost <= totalBudget
    );

    // 2. 필수 항목 처리
    const mandatoryItemsData = validItems.filter(item => 
      mandatoryItems.includes(item.alternativeId)
    );
    
    const mandatoryCost = mandatoryItemsData.reduce((sum, item) => sum + item.cost, 0);
    const mandatoryUtility = mandatoryItemsData.reduce((sum, item) => sum + item.utility, 0);
    
    if (mandatoryCost > totalBudget) {
      throw new Error('Mandatory items exceed total budget');
    }

    // 3. 선택 가능한 항목들 (필수 항목 제외)
    const optionalItems = validItems.filter(item => 
      !mandatoryItems.includes(item.alternativeId)
    );
    
    const remainingBudget = totalBudget - mandatoryCost;

    // 4. 동적 계획법으로 0/1 배낭문제 해결
    const dp = this.solveKnapsackDP(optionalItems, remainingBudget);
    
    // 5. 결과 구성
    const selectedOptionalItems = this.backtrackKnapsack(optionalItems, remainingBudget, dp);
    const allSelectedItems = [...mandatoryItemsData, ...selectedOptionalItems];
    
    const totalCost = allSelectedItems.reduce((sum, item) => sum + item.cost, 0);
    const totalUtility = allSelectedItems.reduce((sum, item) => sum + item.utility, 0);

    const allocations: BudgetAllocation[] = items.map(item => ({
      alternativeId: item.alternativeId,
      alternativeName: item.alternativeName,
      allocated: allSelectedItems.some(selected => selected.alternativeId === item.alternativeId) 
        ? item.cost : 0,
      isSelected: allSelectedItems.some(selected => selected.alternativeId === item.alternativeId),
      allocationRatio: allSelectedItems.some(selected => selected.alternativeId === item.alternativeId) 
        ? item.cost / totalBudget : 0
    }));

    return {
      allocations,
      totalUtility,
      totalCost,
      budgetUtilization: totalCost / totalBudget,
      efficiencyScore: totalUtility / totalCost,
      unallocatedBudget: totalBudget - totalCost
    };
  }

  /**
   * 연속 배분 최적화 (선형계획법)
   * @param items 예산 항목들
   * @param constraint 예산 제약조건
   * @returns 최적화 결과
   */
  static solveContinuousAllocation(
    items: BudgetItem[], 
    constraint: BudgetConstraint
  ): OptimizationResult {
    
    const { totalBudget, minBudgetPerItem = 0, maxBudgetPerItem } = constraint;
    
    // 1. 효율성(utility/cost) 기준으로 정렬
    const sortedItems = [...items].sort((a, b) => b.efficiency - a.efficiency);
    
    // 2. 탐욕 알고리즘으로 연속 배분
    const allocations: BudgetAllocation[] = [];
    let remainingBudget = totalBudget;
    let totalUtility = 0;
    
    for (const item of sortedItems) {
      if (remainingBudget <= 0) break;
      
      // 최소/최대 제약 고려한 배분 계산
      const minAllocation = Math.max(minBudgetPerItem, 0);
      const maxAllocation = Math.min(
        maxBudgetPerItem || item.cost,
        item.cost,
        remainingBudget
      );
      
      let allocation = 0;
      
      if (maxAllocation >= minAllocation) {
        // 효율성이 높은 항목에 우선 배분
        allocation = maxAllocation;
        
        // 해당 배분에 대한 효용 계산 (비례 배분)
        const allocationRatio = allocation / item.cost;
        const utilityGain = item.utility * allocationRatio;
        
        totalUtility += utilityGain;
        remainingBudget -= allocation;
      }
      
      allocations.push({
        alternativeId: item.alternativeId,
        alternativeName: item.alternativeName,
        allocated: allocation,
        isSelected: allocation > 0,
        allocationRatio: allocation / totalBudget
      });
    }
    
    // 3. 배분되지 않은 항목들 추가
    items.forEach(item => {
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

    const totalCost = allocations.reduce((sum, alloc) => sum + alloc.allocated, 0);

    return {
      allocations,
      totalUtility,
      totalCost,
      budgetUtilization: totalCost / totalBudget,
      efficiencyScore: totalUtility / totalCost,
      unallocatedBudget: totalBudget - totalCost
    };
  }

  /**
   * 시나리오 분석 (예산 ±k% 변화)
   * @param items 예산 항목들
   * @param baseConstraint 기본 제약조건
   * @param scenarios 시나리오 목록 (예: [-20, -10, 10, 20] %)
   * @param isBinary 이진 선택 여부
   * @returns 시나리오 분석 결과
   */
  static performScenarioAnalysis(
    items: BudgetItem[],
    baseConstraint: BudgetConstraint,
    scenarios: number[] = [-20, -10, 10, 20],
    isBinary: boolean = false
  ): ScenarioAnalysis {
    
    // 기본 시나리오 계산
    const baseResult = isBinary 
      ? this.solveBinaryKnapsack(items, baseConstraint)
      : this.solveContinuousAllocation(items, baseConstraint);

    // 각 시나리오별 계산
    const scenarioResults = scenarios.map(budgetChange => {
      const adjustedBudget = baseConstraint.totalBudget * (1 + budgetChange / 100);
      const adjustedConstraint = { ...baseConstraint, totalBudget: adjustedBudget };
      
      const result = isBinary 
        ? this.solveBinaryKnapsack(items, adjustedConstraint)
        : this.solveContinuousAllocation(items, adjustedConstraint);

      // 한계효용 계산 (예산 단위당 효용 증가)
      const budgetDelta = adjustedBudget - baseConstraint.totalBudget;
      const utilityDelta = result.totalUtility - baseResult.totalUtility;
      const marginalUtility = budgetDelta !== 0 ? utilityDelta / budgetDelta : 0;

      return {
        budgetChange,
        result,
        marginalUtility
      };
    });

    return {
      baseScenario: baseResult,
      scenarios: scenarioResults
    };
  }

  /**
   * 동적 계획법으로 0/1 배낭문제 해결
   * @param items 항목들
   * @param budget 예산
   * @returns DP 테이블
   */
  private static solveKnapsackDP(items: BudgetItem[], budget: number): number[][] {
    const n = items.length;
    const W = Math.floor(budget); // 정수 예산으로 변환
    
    // DP[i][w] = i번째까지 항목으로 예산 w에서 얻을 수 있는 최대 효용
    const dp: number[][] = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
      const item = items[i - 1];
      const cost = Math.floor(item.cost);
      const utility = item.utility;
      
      for (let w = 0; w <= W; w++) {
        // 현재 항목을 선택하지 않는 경우
        dp[i][w] = dp[i - 1][w];
        
        // 현재 항목을 선택하는 경우
        if (cost <= w) {
          dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - cost] + utility);
        }
      }
    }
    
    return dp;
  }

  /**
   * 배낭문제 역추적으로 선택된 항목 찾기
   * @param items 항목들
   * @param budget 예산
   * @param dp DP 테이블
   * @returns 선택된 항목들
   */
  private static backtrackKnapsack(
    items: BudgetItem[], 
    budget: number, 
    dp: number[][]
  ): BudgetItem[] {
    
    const n = items.length;
    const W = Math.floor(budget);
    const selectedItems: BudgetItem[] = [];
    
    let i = n;
    let w = W;
    
    while (i > 0 && w > 0) {
      // 현재 항목이 선택되었는지 확인
      if (dp[i][w] !== dp[i - 1][w]) {
        selectedItems.push(items[i - 1]);
        w -= Math.floor(items[i - 1].cost);
      }
      i--;
    }
    
    return selectedItems;
  }

  /**
   * 효율성 기반 항목 추천
   * @param items 항목들
   * @param topK 상위 K개
   * @returns 추천 항목들
   */
  static getEfficiencyRecommendations(items: BudgetItem[], topK: number = 5): BudgetItem[] {
    return [...items]
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, topK);
  }

  /**
   * 예산 최적화 인사이트 생성
   * @param result 최적화 결과
   * @param items 원본 항목들
   * @returns 인사이트 메시지들
   */
  static generateInsights(result: OptimizationResult, items: BudgetItem[]): string[] {
    const insights: string[] = [];
    
    // 예산 활용률 분석
    if (result.budgetUtilization < 0.8) {
      insights.push(`예산 활용률이 ${(result.budgetUtilization * 100).toFixed(1)}%로 낮습니다. 추가 투자를 고려해보세요.`);
    } else if (result.budgetUtilization > 0.95) {
      insights.push(`예산을 거의 모두 활용했습니다 (${(result.budgetUtilization * 100).toFixed(1)}%).`);
    }
    
    // 효율성 분석
    const averageEfficiency = items.reduce((sum, item) => sum + item.efficiency, 0) / items.length;
    const selectedItems = result.allocations.filter(alloc => alloc.isSelected);
    
    if (result.efficiencyScore > averageEfficiency * 1.2) {
      insights.push('효율성이 높은 항목들이 잘 선택되었습니다.');
    }
    
    // 미선택 고효율 항목 분석
    const unselectedHighEfficiency = items.filter(item => {
      const isSelected = result.allocations.some(alloc => 
        alloc.alternativeId === item.alternativeId && alloc.isSelected
      );
      return !isSelected && item.efficiency > averageEfficiency;
    });
    
    if (unselectedHighEfficiency.length > 0) {
      insights.push(`효율성이 높지만 선택되지 않은 항목들: ${unselectedHighEfficiency.map(item => item.alternativeName).join(', ')}`);
    }
    
    return insights;
  }
}

export default BudgetOptimizer;