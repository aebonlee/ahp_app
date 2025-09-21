/**
 * AHP (Analytic Hierarchy Process) 계산 서비스
 * 백엔드에서 수학적 계산을 담당
 */
export interface AHPMatrix {
    size: number;
    matrix: number[][];
}
export interface AHPResult {
    weights: number[];
    consistencyRatio: number;
    consistencyIndex: number;
    lambdaMax: number;
    isConsistent: boolean;
}
export interface InconsistencyAdvice {
    i: number;
    j: number;
    currentValue: number;
    recommendedValue: number;
    errorMagnitude: number;
    rank: number;
}
/**
 * AHP 계산 서비스 클래스
 */
export declare class AHPCalculatorService {
    private static readonly RANDOM_INDEX;
    /**
     * 기하평균법을 사용한 가중치 계산
     * @param matrix 쌍대비교 행렬
     * @returns 정규화된 가중치 벡터
     */
    static calculateWeights(matrix: number[][]): number[];
    /**
     * 일관성 비율 계산
     * @param matrix 쌍대비교 행렬
     * @param weights 가중치 벡터
     * @returns AHP 결과 객체
     */
    static calculateConsistency(matrix: number[][], weights: number[]): AHPResult;
    /**
     * 완전한 AHP 계산 (가중치 + 일관성)
     * @param matrix 쌍대비교 행렬
     * @returns AHP 결과
     */
    static calculateAHP(matrix: number[][]): AHPResult;
    /**
     * 비일관성 개선 제안 생성
     * @param matrix 쌍대비교 행렬
     * @param weights 현재 가중치
     * @param topK 상위 K개 제안
     * @returns 개선 제안 목록
     */
    static generateInconsistencyAdvice(matrix: number[][], weights: number[], topK?: number): InconsistencyAdvice[];
    /**
     * 가장 가까운 Saaty 척도값 찾기
     * @param target 목표값
     * @returns 가장 가까운 Saaty 척도값
     */
    private static findNearestSaatyValue;
    /**
     * 직접입력 데이터 정규화
     * @param values 원시값 배열
     * @param isBenefit 편익형 여부 (false면 비용형)
     * @returns 정규화된 가중치
     */
    static normalizeDirectInput(values: number[], isBenefit?: boolean): number[];
    /**
     * 계층적 가중치 통합 (하위 기준 → 상위 기준)
     * @param criteriaWeights 기준별 가중치
     * @param hierarchy 계층 구조
     * @returns 통합된 가중치
     */
    static synthesizeHierarchy(criteriaWeights: Map<string, number[]>, hierarchy: any[]): Map<string, number>;
    /**
     * 그룹 의사결정 통합 (평가자별 결과 → 그룹 결과)
     * @param individualResults 개별 평가자 결과
     * @param evaluatorWeights 평가자별 가중치
     * @returns 통합된 그룹 결과
     */
    static aggregateGroupDecision(individualResults: Array<{
        evaluatorId: string;
        weights: number[];
    }>, evaluatorWeights: Map<string, number>): number[];
    /**
     * 행렬 유효성 검증
     * @param matrix 검증할 행렬
     * @returns 유효성 검증 결과
     */
    static validateMatrix(matrix: number[][]): {
        valid: boolean;
        errors: string[];
    };
}
export default AHPCalculatorService;
