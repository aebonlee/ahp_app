import {
  analyzeConsistency,
  isPairwiseJudgmentSuspicious,
  getRealtimeConsistencyFeedback
} from './consistencyHelper';

// Simple test for consistency helper utility
export {};

describe('consistencyHelper', () => {
  describe('analyzeConsistency', () => {
    it('should analyze consistency for a 3x3 matrix', () => {
      const matrix = [
        [1, 2, 3],
        [0.5, 1, 2],
        [0.33, 0.5, 1]
      ];
      const elementNames = ['A', 'B', 'C'];
      
      const result = analyzeConsistency(matrix, elementNames);
      
      expect(result).toBeDefined();
      expect(result.currentCR).toBeGreaterThanOrEqual(0);
      expect(result.targetCR).toBe(0.1);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.worstPairs)).toBe(true);
    });

    it('should handle small matrices', () => {
      const matrix = [
        [1, 2],
        [0.5, 1]
      ];
      const elementNames = ['A', 'B'];
      
      const result = analyzeConsistency(matrix, elementNames);
      
      expect(result.currentCR).toBe(0);
      expect(result.suggestions).toContain('일관성 검사는 3개 이상의 요소가 필요합니다.');
    });
  });

  describe('isPairwiseJudgmentSuspicious', () => {
    it('should detect suspicious judgments', () => {
      const result = isPairwiseJudgmentSuspicious(5, [2, 2.5, 1.8]);
      expect(typeof result).toBe('boolean');
    });

    it('should handle empty indirect paths', () => {
      const result = isPairwiseJudgmentSuspicious(5, []);
      expect(result).toBe(false);
    });
  });

  describe('getRealtimeConsistencyFeedback', () => {
    it('should provide real-time feedback', () => {
      const matrix = [
        [1, 2, 3],
        [0.5, 1, 2],
        [0.33, 0.5, 1]
      ];
      const elementNames = ['A', 'B', 'C'];
      
      const feedback = getRealtimeConsistencyFeedback(matrix, elementNames);
      
      expect(feedback).toBeDefined();
      expect(feedback.currentCR).toBeGreaterThanOrEqual(0);
      expect(['excellent', 'good', 'acceptable', 'poor']).toContain(feedback.status);
      expect(typeof feedback.message).toBe('string');
    });

    it('should include impact when recent changes provided', () => {
      const matrix = [
        [1, 2, 3],
        [0.5, 1, 2],
        [0.33, 0.5, 1]
      ];
      const elementNames = ['A', 'B', 'C'];
      const recentChange = { i: 0, j: 1, oldValue: 2, newValue: 3 };
      
      const feedback = getRealtimeConsistencyFeedback(matrix, elementNames, recentChange);
      
      expect(feedback.impact).toBeDefined();
      expect(feedback.impact).toContain('A');
      expect(feedback.impact).toContain('B');
    });
  });
});