import {
  buildComparisonMatrix,
  calculateEigenVector,
  calculateEigenVectorPowerMethod,
  calculateLambdaMax,
  calculateConsistencyRatio,
  calculateAHP,
  calculateHierarchicalAHP,
  getConsistencyLevel,
  getConsistencyColor,
  aggregateMatricesGeometric,
  calculateGroupAHP,
  type ComparisonInput,
  type HierarchicalAHPInput
} from './ahpCalculator';

describe('AHP Calculator', () => {
  
  describe('buildComparisonMatrix', () => {
    it('should build a valid comparison matrix from elements and comparisons', () => {
      const elements = [
        { id: '1', name: 'Criteria A' },
        { id: '2', name: 'Criteria B' },
        { id: '3', name: 'Criteria C' }
      ];
      
      const comparisons: ComparisonInput[] = [
        { element1_id: '1', element2_id: '2', value: 3 },
        { element1_id: '1', element2_id: '3', value: 5 },
        { element1_id: '2', element2_id: '3', value: 2 }
      ];
      
      const matrix = buildComparisonMatrix(elements, comparisons);
      
      expect(matrix).toHaveLength(3);
      expect(matrix[0][1]).toBe(3);
      expect(matrix[1][0]).toBe(1/3);
      expect(matrix[0][2]).toBe(5);
      expect(matrix[2][0]).toBe(1/5);
      expect(matrix[1][2]).toBe(2);
      expect(matrix[2][1]).toBe(1/2);
      expect(matrix[0][0]).toBe(1);
      expect(matrix[1][1]).toBe(1);
      expect(matrix[2][2]).toBe(1);
    });
    
    it('should handle empty comparisons', () => {
      const elements = [
        { id: '1', name: 'Criteria A' },
        { id: '2', name: 'Criteria B' }
      ];
      
      const matrix = buildComparisonMatrix(elements, []);
      
      expect(matrix).toEqual([[1, 1], [1, 1]]);
    });
  });
  
  describe('calculateEigenVector', () => {
    it('should calculate eigenvector using geometric mean method', () => {
      const matrix = [
        [1, 3, 5],
        [1/3, 1, 2],
        [1/5, 1/2, 1]
      ];
      
      const eigenVector = calculateEigenVector(matrix);
      
      expect(eigenVector).toHaveLength(3);
      expect(eigenVector.reduce((sum, val) => sum + val, 0)).toBeCloseTo(1, 5);
      expect(eigenVector[0]).toBeGreaterThan(eigenVector[1]);
      expect(eigenVector[1]).toBeGreaterThan(eigenVector[2]);
    });
  });
  
  describe('calculateEigenVectorPowerMethod', () => {
    it('should calculate eigenvector using power method', () => {
      const matrix = [
        [1, 3, 5],
        [1/3, 1, 2],
        [1/5, 1/2, 1]
      ];
      
      const eigenVector = calculateEigenVectorPowerMethod(matrix);
      
      expect(eigenVector).toHaveLength(3);
      expect(eigenVector.reduce((sum, val) => sum + val, 0)).toBeCloseTo(1, 5);
      expect(eigenVector[0]).toBeGreaterThan(eigenVector[1]);
      expect(eigenVector[1]).toBeGreaterThan(eigenVector[2]);
    });
  });
  
  describe('calculateLambdaMax', () => {
    it('should calculate lambda max correctly', () => {
      const matrix = [
        [1, 3],
        [1/3, 1]
      ];
      const eigenVector = [0.75, 0.25];
      
      const lambdaMax = calculateLambdaMax(matrix, eigenVector);
      
      expect(lambdaMax).toBeCloseTo(2, 5);
    });
  });
  
  describe('calculateConsistencyRatio', () => {
    it('should return 0 for matrices with n <= 2', () => {
      expect(calculateConsistencyRatio(2, 2)).toBe(0);
      expect(calculateConsistencyRatio(1, 1)).toBe(0);
    });
    
    it('should calculate CR correctly for n > 2', () => {
      const lambdaMax = 3.1;
      const n = 3;
      
      const cr = calculateConsistencyRatio(lambdaMax, n);
      
      expect(cr).toBeCloseTo(0.086, 3);
    });
  });
  
  describe('calculateAHP', () => {
    it('should perform complete AHP calculation', () => {
      const matrix = [
        [1, 3, 5],
        [1/3, 1, 2],
        [1/5, 1/2, 1]
      ];
      
      const result = calculateAHP(matrix);
      
      expect(result.priorities).toHaveLength(3);
      expect(result.priorities.reduce((sum, val) => sum + val, 0)).toBeCloseTo(1, 5);
      expect(result.consistencyRatio).toBeGreaterThanOrEqual(0);
      expect(result.lambdaMax).toBeGreaterThanOrEqual(3);
      expect(typeof result.isConsistent).toBe('boolean');
      expect(result.eigenVector).toEqual(result.priorities);
    });
    
    it('should mark consistent matrices as consistent', () => {
      const consistentMatrix = [
        [1, 2],
        [1/2, 1]
      ];
      
      const result = calculateAHP(consistentMatrix);
      
      expect(result.isConsistent).toBe(true);
      expect(result.consistencyRatio).toBeLessThanOrEqual(0.1);
    });
  });
  
  describe('calculateHierarchicalAHP', () => {
    it('should calculate hierarchical AHP correctly', () => {
      const input: HierarchicalAHPInput = {
        criteriaWeights: {
          'criteria1': 0.6,
          'criteria2': 0.4
        },
        alternativeScores: {
          'criteria1': {
            'alt1': 0.7,
            'alt2': 0.3
          },
          'criteria2': {
            'alt1': 0.4,
            'alt2': 0.6
          }
        },
        alternatives: [
          { id: 'alt1', name: 'Alternative 1' },
          { id: 'alt2', name: 'Alternative 2' }
        ]
      };
      
      const result = calculateHierarchicalAHP(input);
      
      expect(result.ranking).toHaveLength(2);
      expect(result.ranking[0].rank).toBe(1);
      expect(result.ranking[1].rank).toBe(2);
      expect(result.ranking[0].score).toBeCloseTo(0.58, 2); // 0.6*0.7 + 0.4*0.4
      expect(result.ranking[1].score).toBeCloseTo(0.42, 2); // 0.6*0.3 + 0.4*0.6
    });
  });
  
  describe('getConsistencyLevel', () => {
    it('should return correct consistency levels', () => {
      expect(getConsistencyLevel(0.03)).toBe('Excellent');
      expect(getConsistencyLevel(0.07)).toBe('Good');
      expect(getConsistencyLevel(0.09)).toBe('Acceptable');
      expect(getConsistencyLevel(0.15)).toBe('Poor');
    });
  });
  
  describe('getConsistencyColor', () => {
    it('should return correct colors for consistency levels', () => {
      expect(getConsistencyColor(0.03)).toBe('green');
      expect(getConsistencyColor(0.07)).toBe('blue');
      expect(getConsistencyColor(0.09)).toBe('yellow');
      expect(getConsistencyColor(0.15)).toBe('red');
    });
  });
  
  describe('aggregateMatricesGeometric', () => {
    it('should aggregate matrices using geometric mean', () => {
      const matrices = [
        [[1, 2], [0.5, 1]],
        [[1, 4], [0.25, 1]],
        [[1, 3], [0.33, 1]]
      ];
      
      const aggregated = aggregateMatricesGeometric(matrices);
      
      expect(aggregated[0][1]).toBeCloseTo(Math.pow(2*4*3, 1/3), 2);
      expect(aggregated[1][0]).toBeCloseTo(1/Math.pow(2*4*3, 1/3), 2);
    });
    
    it('should throw error for empty matrices array', () => {
      expect(() => aggregateMatricesGeometric([])).toThrow('No matrices provided');
    });
  });
  
  describe('calculateGroupAHP', () => {
    it('should calculate group AHP with geometric aggregation', () => {
      const matrices = [
        [[1, 2], [0.5, 1]],
        [[1, 4], [0.25, 1]]
      ];
      
      const result = calculateGroupAHP({ matrices });
      
      expect(result.individualResults).toHaveLength(2);
      expect(result.priorities).toHaveLength(2);
      expect(result.consensusIndex).toBeGreaterThan(0);
      expect(result.consensusIndex).toBeLessThanOrEqual(1);
      expect(result.aggregationMethod).toBe('Geometric Mean');
    });
    
    it('should throw error for empty matrices', () => {
      expect(() => calculateGroupAHP({ matrices: [] })).toThrow('No matrices provided');
    });
  });
});