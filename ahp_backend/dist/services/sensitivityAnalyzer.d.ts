/**
 * 민감도 분석 서비스
 * 상위기준 가중치 변화에 따른 대안 순위 변동 분석
 */
export interface SensitivityInput {
    criteriaHierarchy: CriterionNode[];
    alternativeScores: AlternativeScore[];
    targetCriterionId: string;
    weightAdjustments: WeightAdjustment[];
}
export interface CriterionNode {
    id: string;
    name: string;
    level: number;
    parentId: string | null;
    localWeight: number;
    globalWeight: number;
    children: CriterionNode[];
}
export interface AlternativeScore {
    alternativeId: string;
    alternativeName: string;
    scoresByCriterion: {
        [criterionId: string]: number;
    };
    totalScore: number;
    rank: number;
}
export interface WeightAdjustment {
    criterionId: string;
    originalWeight: number;
    newWeight: number;
}
export interface SensitivityResult {
    baselineRanking: AlternativeScore[];
    adjustedRanking: AlternativeScore[];
    rankChanges: RankChange[];
    stabilityIndex: number;
    criticalThresholds: CriticalThreshold[];
}
export interface RankChange {
    alternativeId: string;
    alternativeName: string;
    originalRank: number;
    newRank: number;
    rankDelta: number;
    scoreChange: number;
}
export interface CriticalThreshold {
    fromAlternative: string;
    toAlternative: string;
    thresholdWeight: number;
    description: string;
}
export declare class SensitivityAnalyzer {
    /**
     * 실시간 민감도 분석 수행
     * @param input 민감도 분석 입력 데이터
     * @returns 민감도 분석 결과
     */
    static performRealTimeSensitivity(input: SensitivityInput): SensitivityResult;
    /**
     * 가중치 조정 적용
     * @param hierarchy 기준 계층구조
     * @param adjustments 가중치 조정 목록
     * @returns 조정된 계층구조
     */
    private static applyWeightAdjustments;
    /**
     * 글로벌 가중치 재계산
     * @param hierarchy 조정된 계층구조
     * @returns 새로운 글로벌 가중치 맵
     */
    private static recalculateGlobalWeights;
    /**
     * 대안 점수 재계산
     * @param originalScores 기존 대안 점수
     * @param newGlobalWeights 새로운 글로벌 가중치
     * @returns 재계산된 대안 점수
     */
    private static recalculateAlternativeScores;
    /**
     * 순위 변화 분석
     * @param baseline 기준 순위
     * @param adjusted 조정된 순위
     * @returns 순위 변화 목록
     */
    private static analyzeRankChanges;
    /**
     * 안정성 지수 계산
     * @param rankChanges 순위 변화 목록
     * @returns 안정성 지수 (0-1, 1이 가장 안정)
     */
    private static calculateStabilityIndex;
    /**
     * 임계값 분석 - 대안 순위가 뒤바뀌는 지점 찾기
     * @param hierarchy 기준 계층구조
     * @param alternativeScores 대안 점수
     * @param targetCriterionId 대상 기준 ID
     * @returns 임계값 목록
     */
    private static findCriticalThresholds;
    /**
     * 두 대안의 순위가 뒤바뀌는 임계 가중치 계산
     * @param alt1 현재 상위 대안
     * @param alt2 현재 하위 대안
     * @param criterionId 대상 기준 ID
     * @returns 임계 가중치 (null이면 계산 불가)
     */
    private static calculateRankingThreshold;
    /**
     * 그래프 시각화용 데이터 생성
     * @param criterionId 대상 기준 ID
     * @param alternatives 대안 목록
     * @param weightRange 가중치 범위 [min, max]
     * @param steps 계산 단계 수
     * @returns 시각화 데이터
     */
    static generateVisualizationData(criterionId: string, alternatives: AlternativeScore[], weightRange?: [number, number], steps?: number): {
        weight: number;
        rankings: AlternativeScore[];
    }[];
}
export default SensitivityAnalyzer;
