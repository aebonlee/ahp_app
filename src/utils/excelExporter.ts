/**
 * 포괄적인 AHP Excel 내보내기 유틸리티
 * AHP for Paper 분석을 기반으로 구현된 고급 Excel 내보내기 기능
 */

// xlsx 패키지를 조건부로 import (보안 취약점으로 인한 임시 비활성화)
// import * as XLSX from 'xlsx';

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
  evaluationTime: number; // 총 평가 소요 시간 (분)
  criteriaWeights: CriteriaWeight[];
  pairwiseComparisons: PairwiseComparison[];
}

export interface RankingResult {
  alternativeId: string;
  alternativeName: string;
  score: number;
  normalizedScore: number;
  rank: number;
  rankChange?: number; // Ideal vs Distributive 순위 변화
}

export interface SensitivityResult {
  criterionId: string;
  criterionName: string;
  originalWeight: number;
  weightVariations: {
    change: number; // ±10%, ±20% 등
    newWeight: number;
    rankingChanges: {
      alternativeId: string;
      alternativeName: string;
      originalRank: number;
      newRank: number;
      rankChange: number;
      scoreChange: number;
    }[];
    stabilityMeasure: number; // 0-1, 1이 가장 안정적
  }[];
  overallSensitivity: 'low' | 'medium' | 'high';
  criticalThreshold: number; // 순위가 바뀌는 최소 가중치 변화
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
  value: number; // 1/9 ~ 9
  timestamp: string;
  responseTime: number; // 초
}

export interface GroupAnalysisData {
  consensusLevel: number;
  agreementMatrix: number[][]; // 참가자 간 일치도 매트릭스
  outlierParticipants: string[]; // 이상치 참가자
  convergenceAnalysis: {
    iterations: number;
    finalDeviation: number;
    convergenceRate: number;
  };
  kendallTau: number; // Kendall's Tau 순위 상관관계
  spearmanRho: number; // Spearman's Rho 순위 상관관계
}

/**
 * 보안상 안전한 AHP 데이터 내보내기
 */
export class AHPExcelExporter {
  private workbook: any; // XLSX.WorkBook;
  private data: AHPProjectData;

  constructor(data: AHPProjectData) {
    // 보안 취약점으로 인한 임시 비활성화
    console.warn('Excel export functionality temporarily disabled due to security vulnerabilities');
    // this.workbook = XLSX.utils.book_new();
    this.workbook = null;
    this.data = data;
  }

  /**
   * 전체 리포트 생성 및 다운로드 (안전한 JSON 형태)
   */
  public async generateCompleteReport(): Promise<void> {
    try {
      // 보안 취약점으로 인한 임시 비활성화
      console.warn('Excel export functionality temporarily disabled due to security vulnerabilities in xlsx package');
      
      // JSON 형태로 데이터 다운로드 (임시 대안)
      const jsonData = {
        projectInfo: this.data.projectInfo,
        hierarchy: this.data.hierarchy,
        rankingResults: this.data.rankingResults,
        criteriaWeights: this.data.criteriaWeights,
        alternatives: this.data.alternatives,
        participants: this.data.participants.map(p => ({
          ...p,
          pairwiseComparisons: p.pairwiseComparisons.length
        })),
        sensitivityAnalysis: this.data.sensitivityAnalysis,
        groupAnalysis: this.data.groupAnalysis
      };
      
      const dataStr = JSON.stringify(jsonData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `AHP_분석결과_${this.data.projectInfo.title}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('분석 결과를 JSON 형태로 다운로드했습니다.');
      
    } catch (error) {
      console.error('데이터 다운로드 중 오류 발생:', error);
      throw new Error('데이터 다운로드에 실패했습니다.');
    }
  }

  /**
   * 안전한 CSV 형태로 순위 결과 내보내기
   */
  public generateRankingCSV(): void {
    try {
      const csvData = [
        ['순위', '대안명', 'Ideal점수', 'Distributive점수', '정규화점수'],
        ...this.data.rankingResults.ideal.map(result => {
          const distResult = this.data.rankingResults.distributive.find(
            d => d.alternativeId === result.alternativeId
          );
          return [
            result.rank.toString(),
            result.alternativeName,
            result.score.toFixed(4),
            (distResult?.score || 0).toFixed(4),
            (result.normalizedScore * 100).toFixed(2) + '%'
          ];
        })
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `AHP_순위결과_${this.data.projectInfo.title}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('순위 결과를 CSV 형태로 다운로드했습니다.');
    } catch (error) {
      console.error('CSV 다운로드 중 오류 발생:', error);
      throw new Error('CSV 다운로드에 실패했습니다.');
    }
  }

  /**
   * 프로젝트 요약 텍스트 파일 생성
   */
  public generateSummaryText(): void {
    try {
      const summary = `
AHP 의사결정 분석 요약 보고서
==============================

프로젝트 정보:
- 프로젝트 ID: ${this.data.projectInfo.projectId}
- 제목: ${this.data.projectInfo.title}
- 설명: ${this.data.projectInfo.description}
- 진행자: ${this.data.projectInfo.facilitator}
- 생성일: ${new Date(this.data.projectInfo.creationDate).toLocaleDateString('ko-KR')}
- 완료일: ${this.data.projectInfo.completionDate ? new Date(this.data.projectInfo.completionDate).toLocaleDateString('ko-KR') : '진행중'}
- 상태: ${this.data.projectInfo.status === 'completed' ? '완료' : this.data.projectInfo.status === 'active' ? '진행중' : '일시정지'}

참여 현황:
- 총 참가자 수: ${this.data.projectInfo.totalParticipants}
- 완료 참가자 수: ${this.data.projectInfo.completedParticipants}
- 참여율: ${Math.round((this.data.projectInfo.completedParticipants / this.data.projectInfo.totalParticipants) * 100)}%

품질 지표:
- 전체 일관성 비율(CR): ${this.data.projectInfo.overallConsistencyRatio.toFixed(3)}
- 그룹 합의 수준: ${(this.data.projectInfo.groupConsensusLevel * 100).toFixed(1)}%

최종 순위 (Ideal 모드):
${this.data.rankingResults.ideal.map(r => 
  `${r.rank}위: ${r.alternativeName} (점수: ${r.score.toFixed(4)}, 비율: ${(r.normalizedScore * 100).toFixed(1)}%)`
).join('\n')}

기준 가중치:
${this.data.criteriaWeights.map(cw => 
  `- ${cw.criterionName}: ${(cw.normalizedWeight * 100).toFixed(1)}% (CR: ${cw.consistencyRatio.toFixed(3)})`
).join('\n')}

참가자별 일관성:
${this.data.participants.map(p => 
  `- ${p.name}: CR ${p.overallConsistencyRatio.toFixed(3)}, 완료율 ${p.completionRate}%, 소요시간 ${p.evaluationTime}분`
).join('\n')}

==============================
보고서 생성일: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}
      `.trim();

      const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `AHP_요약보고서_${this.data.projectInfo.title}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('요약 보고서를 텍스트 형태로 다운로드했습니다.');
    } catch (error) {
      console.error('텍스트 다운로드 중 오류 발생:', error);
      throw new Error('텍스트 다운로드에 실패했습니다.');
    }
  }

  // 모든 시트 생성 메서드들을 비활성화
  private createProjectOverviewSheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createHierarchySheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createRankingResultsSheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createCriteriaWeightsSheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createParticipantDetailsSheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createConsistencyAnalysisSheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createSensitivityAnalysisSheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createGroupAnalysisSheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createPairwiseMatricesSheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  private createStatisticalSummarySheet(): void {
    console.warn('Excel sheet creation temporarily disabled due to xlsx security vulnerabilities');
  }

  // 스타일링 메서드들도 비활성화
  private applyProjectOverviewStyles(ws: any): void { }
  private applyHierarchyStyles(ws: any): void { }
  private applyRankingStyles(ws: any): void { }
  private applyCriteriaWeightsStyles(ws: any): void { }
  private applyParticipantDetailsStyles(ws: any): void { }
  private applyConsistencyAnalysisStyles(ws: any): void { }
  private applySensitivityAnalysisStyles(ws: any): void { }
  private applyGroupAnalysisStyles(ws: any): void { }
  private applyPairwiseMatricesStyles(ws: any): void { }
  private applyStatisticalSummaryStyles(ws: any): void { }

  private downloadWorkbook(): void {
    console.warn('Excel download temporarily disabled due to xlsx security vulnerabilities');
  }

  // 유틸리티 메서드들
  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': '진행중',
      'completed': '완료',
      'paused': '일시정지'
    };
    return statusMap[status] || status;
  }

  private getNodeTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'goal': '목표',
      'criterion': '기준',
      'alternative': '대안'
    };
    return typeMap[type] || type;
  }

  private getConsistencyGrade(cr: number): string {
    if (cr <= 0.05) return '매우 우수';
    if (cr <= 0.08) return '우수';
    if (cr <= 0.10) return '양호';
    if (cr <= 0.15) return '개선 필요';
    return '불량';
  }

  private calculateDescriptiveStats(values: number[]): number[] {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n/2-1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
    const cv = mean > 0 ? stdDev / mean : 0;

    return [mean, stdDev, min, max, median, cv];
  }
}

/**
 * 샘플 데이터를 사용한 안전한 데이터 내보내기 테스트 함수
 */
export function generateSampleReport(): void {
  const sampleData: AHPProjectData = {
    projectInfo: {
      projectId: 'PRJ-001',
      title: '신기술 도입 우선순위 결정',
      description: 'AI, IoT, 블록체인 등 신기술 도입을 위한 AHP 의사결정',
      facilitator: '김기술팀장',
      creationDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      status: 'completed',
      totalParticipants: 4,
      completedParticipants: 4,
      overallConsistencyRatio: 0.087,
      groupConsensusLevel: 0.78
    },
    hierarchy: {
      id: 'goal',
      name: '신기술 도입 우선순위',
      type: 'goal',
      level: 0,
      children: [
        { id: 'c1', name: '비용 효율성', type: 'criterion', weight: 0.35, level: 1 },
        { id: 'c2', name: '기술 성숙도', type: 'criterion', weight: 0.28, level: 1 },
        { id: 'c3', name: '구현 복잡도', type: 'criterion', weight: 0.22, level: 1 },
        { id: 'c4', name: '전략적 중요성', type: 'criterion', weight: 0.15, level: 1 }
      ]
    },
    criteriaWeights: [
      { criterionId: 'c1', criterionName: '비용 효율성', weight: 0.35, normalizedWeight: 0.35, level: 1, consistencyRatio: 0.08 },
      { criterionId: 'c2', criterionName: '기술 성숙도', weight: 0.28, normalizedWeight: 0.28, level: 1, consistencyRatio: 0.06 },
      { criterionId: 'c3', criterionName: '구현 복잡도', weight: 0.22, normalizedWeight: 0.22, level: 1, consistencyRatio: 0.09 },
      { criterionId: 'c4', criterionName: '전략적 중요성', weight: 0.15, normalizedWeight: 0.15, level: 1, consistencyRatio: 0.07 }
    ],
    alternatives: [
      { id: 'a1', name: 'AI/머신러닝', idealScore: 0.421, distributiveScore: 0.398, criteriaScores: { 'c1': 0.45, 'c2': 0.38, 'c3': 0.42, 'c4': 0.46 } },
      { id: 'a2', name: '클라우드 컴퓨팅', idealScore: 0.298, distributiveScore: 0.312, criteriaScores: { 'c1': 0.32, 'c2': 0.41, 'c3': 0.35, 'c4': 0.28 } },
      { id: 'a3', name: 'IoT 시스템', idealScore: 0.186, distributiveScore: 0.195, criteriaScores: { 'c1': 0.15, 'c2': 0.18, 'c3': 0.16, 'c4': 0.19 } },
      { id: 'a4', name: '블록체인', idealScore: 0.095, distributiveScore: 0.095, criteriaScores: { 'c1': 0.08, 'c2': 0.03, 'c3': 0.07, 'c4': 0.07 } }
    ],
    participants: [
      {
        participantId: 'p1',
        name: '김기술팀장',
        email: 'kim@example.com',
        role: 'manager',
        completionDate: new Date().toISOString(),
        overallConsistencyRatio: 0.09,
        completionRate: 100,
        evaluationTime: 75,
        individualRanking: [
          { alternativeId: 'a1', alternativeName: 'AI/머신러닝', score: 0.421, normalizedScore: 0.421, rank: 1 }
        ],
        criteriaWeights: [
          { criterionId: 'c1', criterionName: '비용 효율성', weight: 0.35, normalizedWeight: 0.35, level: 1, consistencyRatio: 0.08 }
        ],
        pairwiseComparisons: []
      }
    ],
    rankingResults: {
      ideal: [
        { alternativeId: 'a1', alternativeName: 'AI/머신러닝', score: 0.421, normalizedScore: 0.421, rank: 1 },
        { alternativeId: 'a2', alternativeName: '클라우드 컴퓨팅', score: 0.298, normalizedScore: 0.298, rank: 2 },
        { alternativeId: 'a3', alternativeName: 'IoT 시스템', score: 0.186, normalizedScore: 0.186, rank: 3 },
        { alternativeId: 'a4', alternativeName: '블록체인', score: 0.095, normalizedScore: 0.095, rank: 4 }
      ],
      distributive: [
        { alternativeId: 'a1', alternativeName: 'AI/머신러닝', score: 0.398, normalizedScore: 0.398, rank: 1 },
        { alternativeId: 'a2', alternativeName: '클라우드 컴퓨팅', score: 0.312, normalizedScore: 0.312, rank: 2 },
        { alternativeId: 'a3', alternativeName: 'IoT 시스템', score: 0.195, normalizedScore: 0.195, rank: 3 },
        { alternativeId: 'a4', alternativeName: '블록체인', score: 0.095, normalizedScore: 0.095, rank: 4 }
      ],
      combined: []
    },
    sensitivityAnalysis: [],
    pairwiseMatrices: [],
    groupAnalysis: {
      consensusLevel: 0.78,
      agreementMatrix: [[1, 0.8, 0.7, 0.6], [0.8, 1, 0.9, 0.5], [0.7, 0.9, 1, 0.4], [0.6, 0.5, 0.4, 1]],
      outlierParticipants: [],
      convergenceAnalysis: { iterations: 5, finalDeviation: 0.023, convergenceRate: 0.85 },
      kendallTau: 0.67,
      spearmanRho: 0.72
    }
  };

  const exporter = new AHPExcelExporter(sampleData);
  exporter.generateCompleteReport().then(() => {
    console.log('데이터 내보내기가 성공적으로 완료되었습니다.');
  }).catch(error => {
    console.error('데이터 내보내기 실패:', error);
  });
}

// 추가 함수들은 보안상 비활성화
export function createChartsDataSheet(workbook: any, data: AHPProjectData): void {
  console.warn('Chart data sheet creation temporarily disabled due to security vulnerabilities');
}

export function createScenarioAnalysisSheet(workbook: any, data: AHPProjectData): void {
  console.warn('Scenario analysis sheet creation temporarily disabled due to security vulnerabilities');
}

export function createQualityAssuranceSheet(workbook: any, data: AHPProjectData): void {
  console.warn('Quality assurance sheet creation temporarily disabled due to security vulnerabilities');
}

export function createActionPlanSheet(workbook: any, data: AHPProjectData): void {
  console.warn('Action plan sheet creation temporarily disabled due to security vulnerabilities');
}