/**
 * 포괄적인 AHP Excel 내보내기 유틸리티
 * 보안상 이유로 임시 비활성화됨
 */

// 인터페이스 정의
export interface AHPProjectData {
  projectInfo: {
    projectId: string;
    title: string;
    description: string;
    facilitator: string;
    creationDate: string;
    completionDate?: string;
    status: 'active' | 'completed' | 'paused';
    totalParticipants: number;
    completedParticipants: number;
    overallConsistencyRatio: number;
    groupConsensusLevel: number;
  };
  hierarchy: HierarchyNode;
  criteriaWeights: CriteriaWeight[];
  alternatives: Alternative[];
  participants: ParticipantData[];
  rankingResults: {
    ideal: RankingResult[];
    distributive: RankingResult[];
    combined: RankingResult[];
  };
  sensitivityAnalysis: SensitivityResult[];
  pairwiseMatrices: PairwiseMatrix[];
  groupAnalysis: GroupAnalysisData;
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: 'goal' | 'criterion' | 'alternative';
  weight?: number;
  children?: HierarchyNode[];
  level: number;
}

export interface CriteriaWeight {
  criterionId: string;
  criterionName: string;
  weight: number;
  normalizedWeight: number;
  parentId?: string;
  level: number;
  consistencyRatio: number;
}

export interface Alternative {
  id: string;
  name: string;
  description?: string;
  idealScore: number;
  distributiveScore: number;
  criteriaScores: { [criterionId: string]: number };
}

export interface ParticipantData {
  participantId: string;
  name: string;
  email: string;
  role: string;
  completionDate?: string;
  overallConsistencyRatio: number;
  completionRate: number;
  individualRanking: RankingResult[];
  evaluationTime: number;
  criteriaWeights: CriteriaWeight[];
  pairwiseComparisons: PairwiseComparison[];
}

export interface RankingResult {
  alternativeId: string;
  alternativeName: string;
  score: number;
  normalizedScore: number;
  rank: number;
  rankChange?: number;
}

export interface SensitivityResult {
  criterionId: string;
  criterionName: string;
  originalWeight: number;
  weightVariations: any[];
  overallSensitivity: 'low' | 'medium' | 'high';
  criticalThreshold: number;
}

export interface PairwiseMatrix {
  participantId: string;
  criterionId: string;
  criterionName: string;
  matrix: number[][];
  elementNames: string[];
  consistencyRatio: number;
  eigenVector: number[];
  priorityVector: number[];
}

export interface PairwiseComparison {
  criterionId: string;
  element1Id: string;
  element2Id: string;
  element1Name: string;
  element2Name: string;
  value: number;
  timestamp: string;
  responseTime: number;
}

export interface GroupAnalysisData {
  consensusLevel: number;
  agreementMatrix: number[][];
  outlierParticipants: string[];
  convergenceAnalysis: {
    iterations: number;
    finalDeviation: number;
    convergenceRate: number;
  };
  kendallTau: number;
  spearmanRho: number;
}

/**
 * AHP Excel 내보내기 클래스 (보안상 이유로 임시 비활성화)
 */
export class AHPExcelExporter {
  private data: AHPProjectData;

  constructor(data: AHPProjectData) {
    this.data = data;
  }

  /**
   * 전체 리포트 생성 (CSV 대체)
   */
  public async generateCompleteReport(): Promise<void> {
    try {
      console.warn('Excel export is temporarily disabled for security reasons. Generating CSV report instead.');
      this.downloadCSVReports();
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('리포트 생성에 실패했습니다.');
    }
  }

  private downloadCSVReports(): void {
    const fileName = `AHP_종합분석보고서_${this.data.projectInfo.title}_${new Date().toISOString().split('T')[0]}.csv`;
    
    const csvContent = [
      '프로젝트 정보',
      `프로젝트 ID,${this.data.projectInfo.projectId}`,
      `프로젝트 제목,${this.data.projectInfo.title}`,
      `진행자,${this.data.projectInfo.facilitator}`,
      `전체 일관성 비율,${this.data.projectInfo.overallConsistencyRatio.toFixed(3)}`,
      '',
      '최종 순위 (Ideal 모드)',
      '순위,대안명,점수',
      ...this.data.rankingResults.ideal.map(r => `${r.rank},${r.alternativeName},${r.score.toFixed(4)}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

/**
 * 샘플 데이터를 사용한 리포트 테스트 함수
 */
export function generateSampleExcelReport(): void {
  console.warn('Excel export is temporarily disabled for security reasons.');
}