/**
 * 에러 핸들링 및 엣지 케이스 처리 유틸리티
 */

export interface AHPError {
  type: 'validation' | 'calculation' | 'network' | 'permission' | 'data' | 'consistency';
  code: string;
  message: string;
  details?: any;
  suggestions?: string[];
}

export class AHPErrorHandler {
  
  /**
   * 입력 데이터 검증
   */
  static validatePairwiseInput(matrix: number[][], elements: any[]): AHPError[] {
    const errors: AHPError[] = [];
    
    // 1. 매트릭스 크기 검증
    if (matrix.length !== elements.length) {
      errors.push({
        type: 'validation',
        code: 'MATRIX_SIZE_MISMATCH',
        message: '매트릭스 크기와 요소 개수가 일치하지 않습니다.',
        details: { matrixSize: matrix.length, elementCount: elements.length },
        suggestions: ['요소 개수를 확인하고 다시 시도하세요.']
      });
    }

    // 2. 요소 개수 제한 검증 (최대 9개)
    if (elements.length > 9) {
      errors.push({
        type: 'validation',
        code: 'TOO_MANY_ELEMENTS',
        message: 'AHP는 최대 9개까지의 요소만 비교할 수 있습니다.',
        details: { elementCount: elements.length, maxAllowed: 9 },
        suggestions: [
          '요소를 계층화하여 단계별로 비교하세요.',
          '중요도가 낮은 요소를 제거하거나 그룹화하세요.'
        ]
      });
    }

    // 3. 최소 요소 개수 검증
    if (elements.length < 2) {
      errors.push({
        type: 'validation',
        code: 'TOO_FEW_ELEMENTS',
        message: '비교하려면 최소 2개 이상의 요소가 필요합니다.',
        details: { elementCount: elements.length, minRequired: 2 },
        suggestions: ['비교할 요소를 추가하세요.']
      });
    }

    // 4. 매트릭스 값 검증
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        const value = matrix[i][j];
        
        // 대각선 요소는 1이어야 함
        if (i === j && Math.abs(value - 1) > 0.001) {
          errors.push({
            type: 'validation',
            code: 'INVALID_DIAGONAL',
            message: `대각선 요소 (${i+1}, ${j+1})는 1이어야 합니다.`,
            details: { position: [i, j], value, expected: 1 },
            suggestions: ['매트릭스 대각선 값을 1로 설정하세요.']
          });
        }

        // 상삼각-하삼각 역수 관계 검증
        if (i !== j) {
          const expectedValue = 1 / matrix[j][i];
          if (Math.abs(value - expectedValue) > 0.001) {
            errors.push({
              type: 'validation',
              code: 'RECIPROCAL_MISMATCH',
              message: `요소 (${i+1}, ${j+1})와 (${j+1}, ${i+1})가 역수 관계가 아닙니다.`,
              details: { 
                position: [i, j], 
                value, 
                reciprocalPosition: [j, i], 
                reciprocalValue: matrix[j][i],
                expectedValue 
              },
              suggestions: ['매트릭스의 역수 관계를 확인하고 수정하세요.']
            });
          }
        }

        // Saaty 척도 범위 검증 (1/9 ~ 9)
        if (value < 1/9 || value > 9) {
          errors.push({
            type: 'validation',
            code: 'OUT_OF_SAATY_RANGE',
            message: `값 ${value}가 Saaty 척도 범위(1/9 ~ 9)를 벗어났습니다.`,
            details: { position: [i, j], value, minAllowed: 1/9, maxAllowed: 9 },
            suggestions: [
              'Saaty 척도(1/9, 1/8, ..., 1, ..., 8, 9)를 사용하세요.',
              '극단적인 값은 피하고 적절한 비교 척도를 선택하세요.'
            ]
          });
        }

        // 0 또는 음수 값 검증
        if (value <= 0) {
          errors.push({
            type: 'validation',
            code: 'NON_POSITIVE_VALUE',
            message: `매트릭스 값은 양수여야 합니다. 위치 (${i+1}, ${j+1}): ${value}`,
            details: { position: [i, j], value },
            suggestions: ['모든 비교값을 양수로 입력하세요.']
          });
        }
      }
    }

    return errors;
  }

  /**
   * 직접입력 데이터 검증
   */
  static validateDirectInput(values: Array<{alternativeId: string, value: number}>): AHPError[] {
    const errors: AHPError[] = [];

    // 1. 빈 값 검증
    const emptyValues = values.filter(v => v.value === null || v.value === undefined);
    if (emptyValues.length > 0) {
      errors.push({
        type: 'validation',
        code: 'EMPTY_VALUES',
        message: '모든 대안에 대해 값을 입력해야 합니다.',
        details: { emptyCount: emptyValues.length, emptyItems: emptyValues },
        suggestions: ['누락된 값들을 입력하세요.']
      });
    }

    // 2. 0 또는 음수 값 검증
    const invalidValues = values.filter(v => v.value <= 0);
    if (invalidValues.length > 0) {
      errors.push({
        type: 'validation',
        code: 'NON_POSITIVE_DIRECT_VALUE',
        message: '직접입력 값은 0보다 커야 합니다.',
        details: { invalidCount: invalidValues.length, invalidItems: invalidValues },
        suggestions: ['모든 값을 양수로 입력하세요.']
      });
    }

    // 3. 동일 값 검증
    const uniqueValues = new Set(values.map(v => v.value));
    if (uniqueValues.size === 1 && values.length > 1) {
      errors.push({
        type: 'validation',
        code: 'ALL_EQUAL_VALUES',
        message: '모든 대안의 값이 동일합니다. 차별화된 값을 입력하세요.',
        details: { value: values[0].value, count: values.length },
        suggestions: [
          '대안별로 서로 다른 값을 입력하세요.',
          '실제 데이터를 기반으로 정확한 값을 입력하세요.'
        ]
      });
    }

    // 4. 극단적 차이 검증
    const vals = values.map(v => v.value).filter(v => v > 0);
    if (vals.length > 1) {
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      const ratio = max / min;
      
      if (ratio > 10000) {
        errors.push({
          type: 'validation',
          code: 'EXTREME_VALUE_DIFFERENCE',
          message: '값들 간의 차이가 너무 큽니다. 정규화에 문제가 발생할 수 있습니다.',
          details: { max, min, ratio },
          suggestions: [
            '값의 범위를 줄여서 입력하세요.',
            '적절한 단위로 변환하여 입력하세요.'
          ]
        });
      }
    }

    return errors;
  }

  /**
   * 일관성 비율 검증
   */
  static validateConsistency(cr: number, matrixSize: number): AHPError[] {
    const errors: AHPError[] = [];

    // 1. 일관성 비율 범위 검증
    if (cr < 0) {
      errors.push({
        type: 'calculation',
        code: 'NEGATIVE_CR',
        message: '일관성 비율이 음수입니다. 계산 오류가 발생했을 수 있습니다.',
        details: { cr, matrixSize },
        suggestions: ['입력 데이터를 확인하고 다시 계산하세요.']
      });
    }

    // 2. 일관성 허용 기준 검증
    const threshold = matrixSize <= 2 ? 0 : 0.1;
    if (cr > threshold) {
      const severity = cr > 0.2 ? 'critical' : 'warning';
      errors.push({
        type: 'consistency',
        code: 'HIGH_INCONSISTENCY',
        message: `일관성 비율(${cr.toFixed(3)})이 허용 기준(${threshold})을 초과했습니다.`,
        details: { cr, threshold, matrixSize, severity },
        suggestions: [
          '판단 도우미를 사용하여 비일관적인 비교를 수정하세요.',
          '극단적인 비교값을 다시 검토하세요.',
          '비교 기준을 명확히 하고 일관된 판단을 하세요.'
        ]
      });
    }

    return errors;
  }

  /**
   * 네트워크 에러 처리
   */
  static handleNetworkError(error: any): AHPError {
    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return {
        type: 'network',
        code: 'OFFLINE',
        message: '네트워크 연결을 확인해주세요.',
        details: { error: error.message },
        suggestions: [
          '인터넷 연결을 확인하세요.',
          '잠시 후 다시 시도하세요.',
          '로컬 저장된 데이터를 확인하세요.'
        ]
      };
    }

    if (error.status === 408 || error.code === 'TIMEOUT') {
      return {
        type: 'network',
        code: 'TIMEOUT',
        message: '요청 시간이 초과되었습니다.',
        details: { error: error.message },
        suggestions: [
          '잠시 후 다시 시도하세요.',
          '데이터 크기를 줄여보세요.'
        ]
      };
    }

    if (error.status >= 500) {
      return {
        type: 'network',
        code: 'SERVER_ERROR',
        message: '서버 오류가 발생했습니다.',
        details: { status: error.status, error: error.message },
        suggestions: [
          '잠시 후 다시 시도하세요.',
          '문제가 지속되면 관리자에게 문의하세요.'
        ]
      };
    }

    return {
      type: 'network',
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 네트워크 오류가 발생했습니다.',
      details: { error: error.message },
      suggestions: ['페이지를 새로고침하고 다시 시도하세요.']
    };
  }

  /**
   * 권한 에러 처리
   */
  static handlePermissionError(error: any): AHPError {
    if (error.status === 401) {
      return {
        type: 'permission',
        code: 'UNAUTHORIZED',
        message: '인증이 필요합니다. 다시 로그인해주세요.',
        details: { error: error.message },
        suggestions: [
          '로그아웃 후 다시 로그인하세요.',
          '접속키를 확인하세요.'
        ]
      };
    }

    if (error.status === 403) {
      return {
        type: 'permission',
        code: 'FORBIDDEN',
        message: '이 작업을 수행할 권한이 없습니다.',
        details: { error: error.message },
        suggestions: [
          '관리자에게 권한 요청을 하세요.',
          '올바른 접속키를 사용하고 있는지 확인하세요.'
        ]
      };
    }

    return {
      type: 'permission',
      code: 'ACCESS_DENIED',
      message: '접근이 거부되었습니다.',
      details: { error: error.message },
      suggestions: ['관리자에게 문의하세요.']
    };
  }

  /**
   * 모바일 특화 검증
   */
  static validateMobileInput(isMobile: boolean, action: string): AHPError[] {
    const errors: AHPError[] = [];

    if (isMobile) {
      if (action === 'pairwise_comparison' && window.innerWidth < 480) {
        errors.push({
          type: 'validation',
          code: 'MOBILE_SCREEN_TOO_SMALL',
          message: '화면이 너무 작아 쌍대비교를 수행하기 어렵습니다.',
          details: { screenWidth: window.innerWidth, minRecommended: 480 },
          suggestions: [
            '화면을 가로로 회전하세요.',
            '태블릿이나 PC에서 사용하세요.',
            '브라우저를 전체화면으로 설정하세요.'
          ]
        });
      }

      // 터치 이벤트 지원 확인
      if (!('ontouchstart' in window)) {
        errors.push({
          type: 'validation',
          code: 'TOUCH_NOT_SUPPORTED',
          message: '터치 이벤트가 지원되지 않습니다.',
          details: { userAgent: navigator.userAgent },
          suggestions: ['터치 지원 브라우저를 사용하세요.']
        });
      }
    }

    return errors;
  }

  /**
   * 다국어 지원 검증
   */
  static validateInternationalization(text: string, language: string): AHPError[] {
    const errors: AHPError[] = [];

    // 한글 외 문자 검증 (한국어 우선 시스템)
    if (language === 'ko' && !/^[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\w\s\-_.()]+$/.test(text)) {
      errors.push({
        type: 'validation',
        code: 'UNSUPPORTED_CHARACTERS',
        message: '지원되지 않는 문자가 포함되어 있습니다.',
        details: { text, language },
        suggestions: [
          '한글, 영문, 숫자, 기본 기호만 사용하세요.',
          '특수문자 사용을 피하세요.'
        ]
      });
    }

    // 텍스트 길이 검증
    if (text.length > 100) {
      errors.push({
        type: 'validation',
        code: 'TEXT_TOO_LONG',
        message: '텍스트가 너무 깁니다. (최대 100자)',
        details: { length: text.length, maxLength: 100 },
        suggestions: ['텍스트를 줄여서 입력하세요.']
      });
    }

    return errors;
  }

  /**
   * 종합 에러 처리
   */
  static processErrors(errors: AHPError[]): {
    isValid: boolean;
    criticalErrors: AHPError[];
    warnings: AHPError[];
    suggestions: string[];
  } {
    const criticalTypes = ['validation', 'permission', 'calculation'];
    const criticalErrors = errors.filter(e => criticalTypes.includes(e.type));
    const warnings = errors.filter(e => !criticalTypes.includes(e.type));
    
    const allSuggestions = errors
      .flatMap(e => e.suggestions || [])
      .filter((suggestion, index, arr) => arr.indexOf(suggestion) === index); // 중복 제거

    return {
      isValid: criticalErrors.length === 0,
      criticalErrors,
      warnings,
      suggestions: allSuggestions
    };
  }
}

export default AHPErrorHandler;