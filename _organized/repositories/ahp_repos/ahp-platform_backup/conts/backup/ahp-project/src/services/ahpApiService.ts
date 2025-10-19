/**
 * AHP API 서비스
 * 쌍대비교 → 통합 → 결과 API 시퀀스 구현
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 토큰 가져오기 헬퍼
const getAuthToken = () => localStorage.getItem('token');

// API 요청 헬퍼
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface ElementInfo {
  id: string;
  name: string;
  description: string;
  level?: number;
}

export interface ComparisonData {
  projectId: number;
  matrixKey: string;
  iIndex: number;
  jIndex: number;
  value: number;
}

export interface WeightResult {
  localWeights: number[];
  CR: number;
  lambdaMax: number;
  isConsistent: boolean;
  eigenVector: number[];
}

export interface GlobalWeightData {
  projectId: number;
  criteriaWeights: { [key: string]: number };
  alternativeWeights: { [key: string]: { [key: string]: number } };
}

export interface FinalRanking {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number;
}

/**
 * AHP API 시퀀스 서비스 클래스
 */
class AHPApiService {
  
  /**
   * 1. 비교 항목 조회
   * GET /api/matrix/:projectId?type=criteria&level=1
   */
  async getMatrixElements(
    projectId: number, 
    type: 'criteria' | 'alternatives' = 'criteria', 
    level: number = 1
  ): Promise<ElementInfo[]> {
    const response = await apiRequest(
      `/matrix/${projectId}?type=${type}&level=${level}`
    );
    return response.elements;
  }

  /**
   * 2. 쌍대비교 평가 저장 (여러 번 반복)
   * POST /api/evaluate/pairwise
   */
  async savePairwiseComparison(data: ComparisonData): Promise<void> {
    await apiRequest('/evaluate/pairwise', {
      method: 'POST',
      body: JSON.stringify({
        project_id: data.projectId,
        matrix_key: data.matrixKey,
        i_index: data.iIndex,
        j_index: data.jIndex,
        value: data.value,
      }),
    });
  }

  /**
   * 3. 가중치 계산 (로컬)
   * POST /api/compute/weights
   */
  async computeWeights(
    matrix: number[][], 
    projectId?: number, 
    matrixKey?: string
  ): Promise<WeightResult> {
    return await apiRequest('/compute/weights', {
      method: 'POST',
      body: JSON.stringify({
        matrix,
        project_id: projectId,
        matrix_key: matrixKey,
      }),
    });
  }

  /**
   * 4. 글로벌 가중치 계산
   * POST /api/compute/global
   */
  async computeGlobalWeights(data: GlobalWeightData): Promise<any> {
    return await apiRequest('/compute/global', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 5. 그룹 가중치 적용 및 최종 순위
   * POST /api/aggregate
   */
  async aggregateResults(
    projectId: number, 
    groupWeights: { [evaluatorId: string]: number }
  ): Promise<{ finalRanking: FinalRanking[] }> {
    return await apiRequest('/aggregate', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        groupWeights,
      }),
    });
  }

  /**
   * 6. Excel 내보내기
   * GET /api/export/excel/:projectId
   */
  async exportToExcel(projectId: number): Promise<Blob> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/export/excel/${projectId}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * CSV 내보내기 (추가 기능)
   * GET /api/export/csv/:projectId?type=ranking
   */
  async exportToCSV(
    projectId: number, 
    type: 'ranking' | 'comparisons' = 'ranking'
  ): Promise<string> {
    const response = await apiRequest(`/export/csv/${projectId}?type=${type}`);
    return response;
  }

  /**
   * 전체 워크플로우 실행 헬퍼
   */
  async executeFullWorkflow(projectId: number): Promise<{
    elements: ElementInfo[];
    weights: WeightResult;
    globalWeights: any;
    finalRanking: FinalRanking[];
  }> {
    try {
      // 1. 기준 조회
      const elements = await this.getMatrixElements(projectId, 'criteria', 1);
      
      // 2. 임시 비교 매트릭스 생성 (실제로는 사용자 입력)
      const n = elements.length;
      const matrix = Array(n).fill(null).map(() => Array(n).fill(1));
      
      // 샘플 비교값 입력 (실제로는 사용자가 입력)
      if (n >= 2) {
        matrix[0][1] = 3;
        matrix[1][0] = 1/3;
      }
      if (n >= 3) {
        matrix[0][2] = 2;
        matrix[2][0] = 1/2;
        matrix[1][2] = 1/2;
        matrix[2][1] = 2;
      }

      // 3. 가중치 계산
      const weights = await this.computeWeights(matrix, projectId, 'criteria:level1');

      // 4. 글로벌 가중치 계산 (간단한 예시)
      const criteriaWeights: { [key: string]: number } = {};
      elements.forEach((element, index) => {
        criteriaWeights[element.id] = weights.localWeights[index];
      });

      const globalWeights = await this.computeGlobalWeights({
        projectId,
        criteriaWeights,
        alternativeWeights: {}, // 실제로는 대안별 가중치 필요
      });

      // 5. 최종 집계 (단일 평가자 예시)
      const aggregationResult = await this.aggregateResults(projectId, {
        '1': 1.0, // 평가자 ID 1에게 100% 가중치
      });

      return {
        elements,
        weights,
        globalWeights,
        finalRanking: aggregationResult.finalRanking,
      };

    } catch (error) {
      console.error('Workflow execution failed:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 내보내기
export default new AHPApiService();