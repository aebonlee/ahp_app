import React from 'react';

interface CriteriaWeight {
  id: string;
  name: string;
  weight: number;
}

interface AlternativeScore {
  id: string;
  name: string;
  scores: { [criteriaId: string]: number };
  totalScore: number;
}

interface AHPResult {
  criteriaWeights: CriteriaWeight[];
  alternativeScores: AlternativeScore[];
  consistencyRatio: number;
  isConsistent: boolean;
}

export class AHPCalculationEngine {
  static calculateEigenVector(matrix: number[][]): number[] {
    const n = matrix.length;
    const sumColumns = new Array(n).fill(0);
    
    // Sum each column
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        sumColumns[j] += matrix[i][j];
      }
    }
    
    // Normalize matrix
    const normalizedMatrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      normalizedMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        normalizedMatrix[i][j] = matrix[i][j] / sumColumns[j];
      }
    }
    
    // Calculate row averages (priority vector)
    const priorityVector: number[] = [];
    for (let i = 0; i < n; i++) {
      const rowSum = normalizedMatrix[i].reduce((sum, val) => sum + val, 0);
      priorityVector[i] = rowSum / n;
    }
    
    return priorityVector;
  }
  
  static calculateConsistencyRatio(matrix: number[][], priorityVector: number[]): number {
    const n = matrix.length;
    const weightedSum: number[] = new Array(n).fill(0);
    
    // Calculate weighted sum vector
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        weightedSum[i] += matrix[i][j] * priorityVector[j];
      }
    }
    
    // Calculate consistency vector
    const consistencyVector: number[] = [];
    for (let i = 0; i < n; i++) {
      consistencyVector[i] = weightedSum[i] / priorityVector[i];
    }
    
    // Calculate lambda max
    const lambdaMax = consistencyVector.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate Consistency Index (CI)
    const ci = (lambdaMax - n) / (n - 1);
    
    // Random Index (RI) values for matrices of different sizes
    const riValues: { [key: number]: number } = {
      1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12,
      6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
    };
    
    const ri = riValues[n] || 1.49;
    
    // Calculate Consistency Ratio (CR)
    const cr = ri === 0 ? 0 : ci / ri;
    
    return cr;
  }
  
  static calculateAHPResults(
    criteriaMatrix: number[][],
    alternativeMatrices: { [criteriaId: string]: number[][] },
    criteriaNames: string[],
    alternativeNames: string[]
  ): AHPResult {
    // Calculate criteria weights
    const criteriaWeights = this.calculateEigenVector(criteriaMatrix);
    const criteriaConsistency = this.calculateConsistencyRatio(criteriaMatrix, criteriaWeights);
    
    // Calculate alternative scores for each criterion
    const alternativeScoresByCriteria: { [criteriaId: string]: number[] } = {};
    
    Object.keys(alternativeMatrices).forEach(criteriaId => {
      const matrix = alternativeMatrices[criteriaId];
      alternativeScoresByCriteria[criteriaId] = this.calculateEigenVector(matrix);
    });
    
    // Calculate final scores
    const finalScores: AlternativeScore[] = alternativeNames.map((name, altIndex) => {
      let totalScore = 0;
      const scores: { [criteriaId: string]: number } = {};
      
      criteriaNames.forEach((criteriaName, criteriaIndex) => {
        const criteriaId = criteriaIndex.toString();
        const scoreForCriteria = alternativeScoresByCriteria[criteriaId]?.[altIndex] || 0;
        scores[criteriaId] = scoreForCriteria;
        totalScore += scoreForCriteria * criteriaWeights[criteriaIndex];
      });
      
      return {
        id: altIndex.toString(),
        name,
        scores,
        totalScore
      };
    });
    
    // Sort by total score (descending)
    finalScores.sort((a, b) => b.totalScore - a.totalScore);
    
    return {
      criteriaWeights: criteriaNames.map((name, index) => ({
        id: index.toString(),
        name,
        weight: criteriaWeights[index]
      })),
      alternativeScores: finalScores,
      consistencyRatio: criteriaConsistency,
      isConsistent: criteriaConsistency <= 0.1
    };
  }
}

interface AHPCalculationEngineProps {
  result?: AHPResult;
  onCalculate?: (result: AHPResult) => void;
}

const AHPCalculationEngineComponent: React.FC<AHPCalculationEngineProps> = ({ 
  result, 
  onCalculate 
}) => {
  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">AHP 계산 엔진</h3>
        <p className="text-gray-600">계산 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AHP 계산 결과</h3>
        <div className={`px-3 py-1 rounded-full text-sm ${
          result.isConsistent 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          CR: {result.consistencyRatio.toFixed(3)} 
          {result.isConsistent ? ' (일관성 있음)' : ' (일관성 부족)'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">기준 가중치</h4>
          <div className="space-y-2">
            {result.criteriaWeights.map(criteria => (
              <div key={criteria.id} className="flex justify-between items-center">
                <span className="text-sm">{criteria.name}</span>
                <span className="font-mono text-sm">
                  {(criteria.weight * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">대안 점수</h4>
          <div className="space-y-2">
            {result.alternativeScores.map((alternative, index) => (
              <div key={alternative.id} className="flex justify-between items-center">
                <span className="text-sm flex items-center">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center mr-2 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </span>
                  {alternative.name}
                </span>
                <span className="font-mono text-sm font-semibold">
                  {(alternative.totalScore * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AHPCalculationEngineComponent;