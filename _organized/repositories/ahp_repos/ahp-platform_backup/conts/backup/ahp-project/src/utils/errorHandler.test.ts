import AHPErrorHandler from './errorHandler';

// Simple test for error handler utility
export {};

describe('AHPErrorHandler', () => {
  describe('validatePairwiseInput', () => {
    it('should validate matrix size mismatch', () => {
      const matrix = [[1, 2], [0.5, 1]];
      const elements = ['A', 'B', 'C']; // Mismatched size
      
      const errors = AHPErrorHandler.validatePairwiseInput(matrix, elements);
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find(e => e.code === 'MATRIX_SIZE_MISMATCH');
      expect(sizeError).toBeDefined();
    });

    it('should validate too many elements', () => {
      const elements = new Array(10).fill(0).map((_, i) => `Element${i}`);
      const matrix = elements.map(() => elements.map(() => 1));
      
      const errors = AHPErrorHandler.validatePairwiseInput(matrix, elements);
      
      const tooManyError = errors.find(e => e.code === 'TOO_MANY_ELEMENTS');
      expect(tooManyError).toBeDefined();
    });

    it('should validate too few elements', () => {
      const matrix = [[1]];
      const elements = ['A'];
      
      const errors = AHPErrorHandler.validatePairwiseInput(matrix, elements);
      
      const tooFewError = errors.find(e => e.code === 'TOO_FEW_ELEMENTS');
      expect(tooFewError).toBeDefined();
    });

    it('should pass valid input', () => {
      const matrix = [[1, 2], [0.5, 1]];
      const elements = ['A', 'B'];
      
      const errors = AHPErrorHandler.validatePairwiseInput(matrix, elements);
      
      expect(errors.length).toBe(0);
    });
  });

  describe('validateDirectInput', () => {
    it('should validate empty values', () => {
      const values = [
        { alternativeId: 'A', value: 5 },
        { alternativeId: 'B', value: null as any },
      ] as Array<{alternativeId: string, value: number}>;
      
      const errors = AHPErrorHandler.validateDirectInput(values);
      
      const emptyError = errors.find(e => e.code === 'EMPTY_VALUES');
      expect(emptyError).toBeDefined();
    });

    it('should validate non-positive values', () => {
      const values = [
        { alternativeId: 'A', value: 5 },
        { alternativeId: 'B', value: -1 },
      ];
      
      const errors = AHPErrorHandler.validateDirectInput(values);
      
      const nonPositiveError = errors.find(e => e.code === 'NON_POSITIVE_DIRECT_VALUE');
      expect(nonPositiveError).toBeDefined();
    });

    it('should pass valid input', () => {
      const values = [
        { alternativeId: 'A', value: 5 },
        { alternativeId: 'B', value: 3 },
      ];
      
      const errors = AHPErrorHandler.validateDirectInput(values);
      
      expect(errors.length).toBe(0);
    });
  });

  describe('handleNetworkError', () => {
    it('should handle server errors', () => {
      const serverError = { status: 500, message: 'Internal server error' };
      
      const result = AHPErrorHandler.handleNetworkError(serverError);
      
      expect(result.type).toBe('network');
      expect(result.code).toBe('SERVER_ERROR');
      expect(result.message).toContain('서버 오류');
    });

    it('should handle timeout errors', () => {
      const timeoutError = { status: 408, message: 'Timeout' };
      
      const result = AHPErrorHandler.handleNetworkError(timeoutError);
      
      expect(result.type).toBe('network');
      expect(result.code).toBe('TIMEOUT');
      expect(result.message).toContain('시간이 초과');
    });
  });

  describe('processErrors', () => {
    it('should process errors correctly', () => {
      const errors = [
        { type: 'validation' as const, code: 'TEST', message: 'Test error', suggestions: ['Fix this'] },
        { type: 'network' as const, code: 'NET', message: 'Network error', suggestions: ['Check connection'] }
      ];
      
      const result = AHPErrorHandler.processErrors(errors);
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('criticalErrors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });
});