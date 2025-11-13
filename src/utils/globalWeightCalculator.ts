import type {
  HierarchicalStructure,
  HierarchyNode,
  GlobalWeightResult,
  CriterionWeight,
  SubcriterionWeight,
  AlternativeScore,
  ScoreComponent,
  RankingResult,
  HierarchicalEvaluationError,
  HierarchyError
} from '../types/hierarchy';

// Opus 4.1 설계 문서 기반 글로벌 가중치 계산기

export class GlobalWeightCalculator {
  private structure: HierarchicalStructure;
  private localWeights: Map<string, number[]>;
  
  constructor(structure: HierarchicalStructure) {
    this.structure = structure;
    this.localWeights = new Map();
  }
  
  /**
   * 전체 계층의 글로벌 가중치 계산
   */
  async calculateGlobalWeights(): Promise<GlobalWeightResult> {
    try {
      const results: GlobalWeightResult = {
        criteria: {},
        subcriteria: {},
        alternatives: {},
        rankings: []
      };
      
      // Level 1: 주기준 글로벌 가중치 (= 로컬 가중치)
      for (const criterion of this.structure.criteria) {
        results.criteria[criterion.id] = {
          name: criterion.name,
          localWeight: criterion.localWeight || 0,
          globalWeight: criterion.localWeight || 0
        };
      }
      
      // Level 2: 하위기준 글로벌 가중치
      if (this.structure.subcriteria) {
        for (const criterion of this.structure.criteria) {
          const subcriteriaGroup = this.structure.subcriteria
            .flat()
            .filter(sc => sc.parentId === criterion.id);
          
          for (const subcriterion of subcriteriaGroup) {
            const parentGlobalWeight = results.criteria[criterion.id].globalWeight;
            const globalWeight = (subcriterion.localWeight || 0) * parentGlobalWeight;
            
            results.subcriteria[subcriterion.id] = {
              name: subcriterion.name,
              parentId: criterion.id,
              localWeight: subcriterion.localWeight || 0,
              globalWeight
            };
          }
        }
      }
      
      // Level 3+: 대안별 최종 점수
      const leafCriteria = this.getLeafCriteria();
      
      for (const alternative of this.structure.alternatives) {
        let totalScore = 0;
        const scoreBreakdown: ScoreComponent[] = [];
        
        for (const leafCriterion of leafCriteria) {
          const criterionGlobalWeight = this.getCriterionGlobalWeight(
            leafCriterion, 
            results
          );
          const alternativeLocalWeight = await this.getAlternativeWeight(
            leafCriterion.id, 
            alternative.id
          );
          
          const contribution = criterionGlobalWeight * alternativeLocalWeight;
          totalScore += contribution;
          
          scoreBreakdown.push({
            criterionId: leafCriterion.id,
            criterionName: leafCriterion.name,
            criterionWeight: criterionGlobalWeight,
            alternativeWeight: alternativeLocalWeight,
            contribution
          });
        }
        
        results.alternatives[alternative.id] = {
          name: alternative.name,
          totalScore,
          scoreBreakdown,
          rank: 0 // 나중에 설정
        };
      }
      
      // 순위 계산
      results.rankings = this.calculateRankings(results.alternatives);
      
      // 대안 객체에 순위 업데이트
      results.rankings.forEach(ranking => {
        if (results.alternatives[ranking.alternativeId]) {
          results.alternatives[ranking.alternativeId].rank = ranking.rank;
        }
      });
      
      return results;
      
    } catch (error) {
      throw new HierarchyError(
        HierarchicalEvaluationError.CALCULATION_ERROR,
        '글로벌 가중치 계산 중 오류가 발생했습니다',
        error
      );
    }
  }
  
  /**
   * 말단 기준 찾기
   */
  private getLeafCriteria(): HierarchyNode[] {
    const leaves: HierarchyNode[] = [];
    
    const traverse = (node: HierarchyNode) => {
      if (!node.children || node.children.length === 0) {
        if (node.nodeType === 'criterion' || node.nodeType === 'subcriterion') {
          leaves.push(node);
        }
      } else {
        node.children.forEach(traverse);
      }
    };
    
    this.structure.criteria.forEach(traverse);
    return leaves;
  }
  
  /**
   * 기준의 글로벌 가중치 가져오기
   */
  private getCriterionGlobalWeight(
    criterion: HierarchyNode, 
    results: Partial<GlobalWeightResult>
  ): number {
    // 직접 주기준인 경우
    if (results.criteria && results.criteria[criterion.id]) {
      return results.criteria[criterion.id].globalWeight;
    }
    
    // 하위기준인 경우
    if (results.subcriteria && results.subcriteria[criterion.id]) {
      return results.subcriteria[criterion.id].globalWeight;
    }
    
    // 수동 계산: 부모를 따라 올라가며 가중치 곱하기
    let weight = criterion.localWeight || 0;
    let current = criterion;
    
    while (current.parentId) {
      const parent = this.findNodeById(current.parentId);
      if (parent && parent.localWeight) {
        weight *= parent.localWeight;
      }
      current = parent!;
    }
    
    return weight;
  }
  
  /**
   * 대안의 특정 기준에 대한 가중치
   */
  private async getAlternativeWeight(
    criterionId: string, 
    alternativeId: string
  ): Promise<number> {
    const key = `${criterionId}_alternatives`;
    
    if (!this.localWeights.has(key)) {
      // DB에서 로드하거나 기본값 사용 (균등 가중치)
      return 1 / this.structure.alternatives.length;
    }
    
    const weights = this.localWeights.get(key)!;
    const alternativeIndex = this.structure.alternatives
      .findIndex(alt => alt.id === alternativeId);
    
    return weights[alternativeIndex] || 0;
  }
  
  /**
   * 순위 계산
   */
  private calculateRankings(
    alternatives: Record<string, AlternativeScore>
  ): RankingResult[] {
    const sorted = Object.entries(alternatives)
      .sort(([, a], [, b]) => b.totalScore - a.totalScore)
      .map(([id, data], index) => {
        return {
          rank: index + 1,
          alternativeId: id,
          name: data.name,
          score: data.totalScore,
          percentage: (data.totalScore * 100).toFixed(2) + '%'
        };
      });
    
    return sorted;
  }
  
  /**
   * ID로 노드 찾기
   */
  private findNodeById(id: string): HierarchyNode | null {
    const queue: HierarchyNode[] = [
      this.structure.goal,
      ...this.structure.criteria,
      ...this.structure.alternatives
    ];
    
    while (queue.length > 0) {
      const node = queue.shift()!;
      
      if (node.id === id) {
        return node;
      }
      
      if (node.children) {
        queue.push(...node.children);
      }
    }
    
    return null;
  }
  
  /**
   * 로컬 가중치 설정
   */
  setLocalWeights(nodeId: string, weights: number[]): void {
    this.localWeights.set(nodeId, weights);
  }
  
  /**
   * 모든 로컬 가중치 설정
   */
  setAllLocalWeights(weights: Map<string, number[]>): void {
    this.localWeights = new Map(weights);
  }
  
  /**
   * 특정 노드의 로컬 가중치 가져오기
   */
  getLocalWeights(nodeId: string): number[] | null {
    return this.localWeights.get(nodeId) || null;
  }
  
  /**
   * 가중치 검증 (합이 1인지 확인)
   */
  validateWeights(weights: number[], tolerance: number = 1e-6): boolean {
    const sum = weights.reduce((acc, w) => acc + w, 0);
    return Math.abs(sum - 1.0) < tolerance;
  }
  
  /**
   * 가중치 정규화
   */
  normalizeWeights(weights: number[]): number[] {
    const sum = weights.reduce((acc, w) => acc + w, 0);
    if (sum === 0) {
      return weights.map(() => 1 / weights.length);
    }
    return weights.map(w => w / sum);
  }
  
  /**
   * 민감도 분석
   */
  performSensitivityAnalysis(
    criterionId: string,
    weightChange: number
  ): { 
    originalRankings: RankingResult[], 
    newRankings: RankingResult[],
    rankChanges: Array<{
      alternativeId: string,
      originalRank: number,
      newRank: number,
      rankChange: number
    }>
  } {
    // 원래 순위 저장
    const originalResults = this.calculateGlobalWeights();
    
    // 가중치 변경 적용 (구현 필요)
    // 실제 구현에서는 특정 기준의 가중치를 변경하고 재계산
    
    // 새로운 순위 계산
    const newResults = this.calculateGlobalWeights();
    
    // 순위 변화 분석
    const rankChanges = originalResults.then(orig => {
      return newResults.then(newRes => {
        return orig.rankings.map(origRank => {
          const newRank = newRes.rankings.find(
            nr => nr.alternativeId === origRank.alternativeId
          );
          return {
            alternativeId: origRank.alternativeId,
            originalRank: origRank.rank,
            newRank: newRank?.rank || origRank.rank,
            rankChange: origRank.rank - (newRank?.rank || origRank.rank)
          };
        });
      });
    });
    
    // 동기 버전으로 간소화 (실제로는 Promise 반환해야 함)
    return {
      originalRankings: [],
      newRankings: [],
      rankChanges: []
    };
  }
  
  /**
   * 계층 구조 깊이 계산
   */
  calculateHierarchyDepth(): number {
    let maxDepth = 0;
    
    const traverse = (node: HierarchyNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      if (node.children) {
        node.children.forEach(child => traverse(child, depth + 1));
      }
    };
    
    traverse(this.structure.goal, 0);
    return maxDepth;
  }
  
  /**
   * 가중치 분포 통계
   */
  getWeightDistributionStats(): {
    mean: number,
    std: number,
    min: number,
    max: number,
    entropy: number
  } {
    const allWeights: number[] = [];
    
    for (const weights of this.localWeights.values()) {
      allWeights.push(...weights);
    }
    
    if (allWeights.length === 0) {
      return { mean: 0, std: 0, min: 0, max: 0, entropy: 0 };
    }
    
    const mean = allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length;
    const variance = allWeights.reduce(
      (sum, w) => sum + Math.pow(w - mean, 2), 0
    ) / allWeights.length;
    const std = Math.sqrt(variance);
    const min = Math.min(...allWeights);
    const max = Math.max(...allWeights);
    
    // Shannon Entropy 계산
    const entropy = -allWeights
      .filter(w => w > 0)
      .reduce((sum, w) => sum + w * Math.log(w), 0);
    
    return { mean, std, min, max, entropy };
  }
}