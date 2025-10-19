# AHP 핵심 알고리즘 구현 분석

## 일시
- **일시**: 2025년 8월 17일 09:45:00

## 📊 요구사항 vs 현재 구현 상세 비교

### 3.1 쌍대비교 행렬 → 가중치 산출

#### ✅ 잘 구현된 부분

**행렬 구성 로직 (95% 완료)**
```typescript
// 현재 구현 - buildComparisonMatrix 함수
export function buildComparisonMatrix(
  elements: Array<{ id: string; name: string }>,
  comparisons: ComparisonInput[]
): number[][] {
  const n = elements.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1)); // ✅ 대각선 1
  
  comparisons.forEach(comp => {
    const i = elementIndex[comp.element1_id];
    const j = elementIndex[comp.element2_id];
    
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = comp.value;        // ✅ a_ij 값 설정
      matrix[j][i] = 1 / comp.value;    // ✅ a_ji = 1/a_ij 역수 처리
    }
  });
}
```

**기하평균법 (100% 완료) ✅**
```typescript
// 현재 구현이 요구사항과 완전 일치
export function calculateEigenVector(matrix: number[][]): number[] {
  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      product *= matrix[i][j];          // ∏(j=1 to n) a_ij
    }
    eigenVector[i] = Math.pow(product, 1 / n);  // (∏a_ij)^(1/n)
  }
  
  // 정규화: w_i = 분자 / Σ분자
  const sum = eigenVector.reduce((acc, val) => acc + val, 0);
  return eigenVector.map(val => val / sum);
}
```

**일관성 검증 (100% 완료) ✅**
```typescript
// CI 계산: (λmax - n) / (n - 1)
export function calculateConsistencyRatio(lambdaMax: number, n: number): number {
  if (n <= 2) return 0;
  const CI = (lambdaMax - n) / (n - 1);    // ✅ 공식 정확
  const RI = RANDOM_INDEX[n] || 1.59;      // ✅ 표준 RI 값
  return CI / RI;                          // ✅ CR = CI/RI
}

// RI 표준값 완벽 구현
const RANDOM_INDEX = {
  1: 0.0, 2: 0.0, 3: 0.58, 4: 0.90, 5: 1.12,
  6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49  // ✅ 표준값 정확
};
```

#### ⚠️ 미구현 또는 개선 필요

**고유벡터법 (방법 B) - 0% 구현**
- 현재는 기하평균법만 구현
- 최대 고유값의 고유벡터 계산 없음
- 대안 구현 필요 (학술적 정확성)

### 3.2 직접입력(정량) 처리

#### ❌ 완전 미구현 (0%)

**현재 상황:**
- 직접입력 처리 함수 없음
- Benefit/Cost 구분 로직 없음
- 정규화 함수 없음

**필요한 구현:**
```typescript
// 미구현 - 즉시 구현 필요
interface DirectInput {
  value: number;
  isBenefit: boolean;  // true: 높을수록 좋음, false: 낮을수록 좋음
}

function processDirectInput(inputs: DirectInput[]): number[] {
  // Cost형 처리: x'_i = 1/x_i
  const processedValues = inputs.map(input => 
    input.isBenefit ? input.value : 1 / input.value
  );
  
  // 정규화: w_i = x_i / Σx
  const sum = processedValues.reduce((acc, val) => acc + val, 0);
  return processedValues.map(val => val / sum);
}
```

### 3.3 계층 종합

#### 🔄 부분 구현 (60%)

**현재 구현된 부분:**
```typescript
// calculateHierarchicalAHP 함수에서 기본 계층 통합
export function calculateHierarchicalAHP(input: HierarchicalAHPInput) {
  alternatives.forEach(alternative => {
    let totalScore = 0;
    Object.entries(criteriaWeights).forEach(([criterionId, weight]) => {
      const alternativeScore = alternativeScores[criterionId]?.[alternative.id] || 0;
      totalScore += weight * alternativeScore;  // ✅ 가중합 계산
    });
    finalScores[alternative.id] = totalScore;
  });
}
```

**미구현 부분:**
- 다단계 계층 처리 (현재 2레벨만)
- 글로벌 가중치 전파 로직
- 상위→하위 가중치 곱셈 체인

**필요한 개선:**
```typescript
// 미구현 - 다단계 계층 처리
function calculateGlobalWeights(hierarchy: CriteriaHierarchy): GlobalWeights {
  // Level 1: 최상위 기준들
  // Level 2: 하위 기준 = 상위 가중치 × 로컬 가중치
  // Level 3: 더 하위 = Level 2 가중치 × 로컬 가중치
  // ...최대 4레벨까지
}
```

### 3.4 평가자 통합

#### ❌ 미구현 (0%)

**필요한 구현:**
```typescript
// 미구현 - 그룹 의사결정
interface EvaluatorResult {
  evaluatorId: string;
  weights: number[];
  evaluatorWeight: number;  // rater_group_weight
}

function aggregateEvaluatorResults(
  results: EvaluatorResult[],
  method: 'arithmetic' | 'geometric' = 'arithmetic'
): number[] {
  if (method === 'arithmetic') {
    // 가중 산술평균
    return calculateWeightedArithmeticMean(results);
  } else {
    // 가중 기하평균
    return calculateWeightedGeometricMean(results);
  }
}
```

### 3.5 판단 도우미(비일관성 개선 제안)

#### ❌ 완전 미구현 (0%)

**필요한 구현:**
```typescript
// 미구현 - 비일관성 개선 제안
export interface InconsistencyAdvice {
  cellRow: number;
  cellCol: number;
  currentValue: number;
  suggestedValue: number;
  errorMagnitude: number;
  rank: number;  // 1, 2, 3 우선순위
}

export function detectInconsistencies(
  matrix: number[][],
  weights: number[]
): InconsistencyAdvice[] {
  // 1. 일관 행렬 A^ 구성: a^_ij = w_i / w_j
  const consistentMatrix = buildConsistentMatrix(weights);
  
  // 2. 오차 계산: E_ij = log(a_ij) - log(a^_ij)
  const errors: Array<{row: number, col: number, error: number}> = [];
  
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix.length; j++) {  // 상삼각만
      const error = Math.log(matrix[i][j]) - Math.log(consistentMatrix[i][j]);
      errors.push({
        row: i,
        col: j,
        error: Math.abs(error)
      });
    }
  }
  
  // 3. |E_ij| 상위 k개(3개) 선별
  return errors
    .sort((a, b) => b.error - a.error)
    .slice(0, 3)
    .map((item, index) => ({
      cellRow: item.row,
      cellCol: item.col,
      currentValue: matrix[item.row][item.col],
      suggestedValue: findNearestSaatyValue(consistentMatrix[item.row][item.col]),
      errorMagnitude: item.error,
      rank: index + 1
    }));
}

function findNearestSaatyValue(target: number): number {
  const saatyValues = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return saatyValues.reduce((prev, curr) => 
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  );
}
```

## 📊 구현 완성도 평가

### 전체 AHP 알고리즘 완성도: **45%**

| 기능 영역 | 완성도 | 상태 | 우선순위 |
|-----------|--------|------|----------|
| **3.1 쌍대비교→가중치** | 85% | 🔄 기하평균법 완료, 고유벡터법 미구현 | 🔶 중간 |
| **3.2 직접입력 처리** | 0% | ❌ 완전 미구현 | 🔥 높음 |
| **3.3 계층 종합** | 60% | 🔄 2레벨만, 다단계 미완 | 🔥 높음 |
| **3.4 평가자 통합** | 0% | ❌ 그룹 의사결정 없음 | 🔶 중간 |
| **3.5 판단 도우미** | 0% | ❌ 비일관성 제안 없음 | 🔹 낮음 |

### ✅ 강점
1. **기하평균법 완벽 구현** - 수학적으로 정확
2. **일관성 검증 완료** - CR 계산, RI 표준값 정확
3. **행렬 구성 로직** - 역수 처리, 대각선 처리 완벽
4. **기본 계층 통합** - 2레벨 가중합 동작

### ⚠️ 중요한 누락사항
1. **직접입력 알고리즘** - Benefit/Cost 정규화 전무
2. **다단계 계층 처리** - 4레벨 계층 지원 부족
3. **그룹 의사결정** - 평가자 통합 로직 없음
4. **개선 제안 시스템** - 비일관성 해결 도구 없음

## 🚀 즉시 구현 권장사항

### Phase 1: 핵심 누락 기능 (2주)
```typescript
// 1. 직접입력 처리 구현
export function processDirectInputs(inputs: DirectInput[]): number[];

// 2. 다단계 계층 처리
export function calculateMultiLevelHierarchy(hierarchy: CriteriaTree): GlobalWeights;

// 3. 고유벡터법 대안 구현 (학술적 완성도)
export function calculateEigenVectorMethod(matrix: number[][]): number[];
```

### Phase 2: 고급 기능 (3주)
```typescript
// 4. 평가자 통합
export function aggregateGroupDecisions(evaluatorResults: EvaluatorResult[]): AggregatedResult;

// 5. 판단 도우미
export function suggestInconsistencyImprovements(matrix: number[][]): InconsistencyAdvice[];
```

## 🔧 코드 품질 개선사항

### 수학적 정확성
- ✅ 기하평균법 공식 정확
- ✅ CR 계산 표준 준수
- ⚠️ 수치 안정성 검증 필요 (0 나누기, NaN 처리)

### 성능 최적화
```typescript
// 대용량 매트릭스 처리 개선 필요
// 현재: O(n²) 시간복잡도 → 캐싱, 지연계산 도입
export class AHPCalculator {
  private cache = new Map<string, AHPResult>();
  
  calculateWithCache(matrix: number[][]): AHPResult {
    const key = matrixToString(matrix);
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const result = this.calculate(matrix);
    this.cache.set(key, result);
    return result;
  }
}
```

### 오류 처리
```typescript
// 현재 누락 - 추가 필요
export function validateMatrix(matrix: number[][]): ValidationResult {
  // 1. 정방행렬 검증
  // 2. 양수값 검증  
  // 3. 역수 관계 검증
  // 4. 대각선 1 검증
  return { isValid: boolean, errors: string[] };
}
```

## 📈 결론

현재 AHP 알고리즘은 **핵심 쌍대비교 처리는 우수**하나, **직접입력과 다단계 계층 처리**가 완전히 누락되어 있습니다. 

**즉시 구현 필요:**
1. 직접입력 정량 처리 (Benefit/Cost)
2. 4레벨 계층 글로벌 가중치 전파
3. 그룹 의사결정 통합

이들을 구현하면 **실용적인 AHP 시스템**으로 완성됩니다.