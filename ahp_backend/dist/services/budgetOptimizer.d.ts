/**
 * 자원배분(예산배분) 최적화 서비스
 * 0/1 배낭문제 및 연속 배분 최적화 해결
 */
export interface BudgetItem {
    alternativeId: string;
    alternativeName: string;
    cost: number;
    utility: number;
    efficiency: number;
}
export interface BudgetConstraint {
    totalBudget: number;
    minBudgetPerItem?: number;
    maxBudgetPerItem?: number;
    mandatoryItems?: string[];
    excludedItems?: string[];
}
export interface BudgetAllocation {
    alternativeId: string;
    alternativeName: string;
    allocated: number;
    isSelected: boolean;
    allocationRatio: number;
}
export interface OptimizationResult {
    allocations: BudgetAllocation[];
    totalUtility: number;
    totalCost: number;
    budgetUtilization: number;
    efficiencyScore: number;
    unallocatedBudget: number;
}
export interface ScenarioAnalysis {
    baseScenario: OptimizationResult;
    scenarios: {
        budgetChange: number;
        result: OptimizationResult;
        marginalUtility: number;
    }[];
}
export declare class BudgetOptimizer {
    /**
     * 0/1 배낭문제 해결 (이진 선택형)
     * @param items 예산 항목들
     * @param constraint 예산 제약조건
     * @returns 최적화 결과
     */
    static solveBinaryKnapsack(items: BudgetItem[], constraint: BudgetConstraint): OptimizationResult;
    /**
     * 연속 배분 최적화 (선형계획법)
     * @param items 예산 항목들
     * @param constraint 예산 제약조건
     * @returns 최적화 결과
     */
    static solveContinuousAllocation(items: BudgetItem[], constraint: BudgetConstraint): OptimizationResult;
    /**
     * 시나리오 분석 (예산 ±k% 변화)
     * @param items 예산 항목들
     * @param baseConstraint 기본 제약조건
     * @param scenarios 시나리오 목록 (예: [-20, -10, 10, 20] %)
     * @param isBinary 이진 선택 여부
     * @returns 시나리오 분석 결과
     */
    static performScenarioAnalysis(items: BudgetItem[], baseConstraint: BudgetConstraint, scenarios?: number[], isBinary?: boolean): ScenarioAnalysis;
    /**
     * 동적 계획법으로 0/1 배낭문제 해결
     * @param items 항목들
     * @param budget 예산
     * @returns DP 테이블
     */
    private static solveKnapsackDP;
    /**
     * 배낭문제 역추적으로 선택된 항목 찾기
     * @param items 항목들
     * @param budget 예산
     * @param dp DP 테이블
     * @returns 선택된 항목들
     */
    private static backtrackKnapsack;
    /**
     * 효율성 기반 항목 추천
     * @param items 항목들
     * @param topK 상위 K개
     * @returns 추천 항목들
     */
    static getEfficiencyRecommendations(items: BudgetItem[], topK?: number): BudgetItem[];
    /**
     * 예산 최적화 인사이트 생성
     * @param result 최적화 결과
     * @param items 원본 항목들
     * @returns 인사이트 메시지들
     */
    static generateInsights(result: OptimizationResult, items: BudgetItem[]): string[];
}
export default BudgetOptimizer;
