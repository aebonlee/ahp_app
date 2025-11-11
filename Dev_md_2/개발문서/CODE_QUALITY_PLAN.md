# AHP 프로젝트 코드 품질 개선 계획

## 📊 현재 상황 (2025-10-20)
- **ESLint 경고**: 297개
- **테스트 실패**: 44개 (총 230개 중)
- **테스트 스킵**: 21개
- **CI 상태**: 빌드만 통과 (ESLint/테스트 비활성화)

---

## 🎯 1단계: ESLint 경고 해결 (Week 1-4)

### Week 1-2: 빠른 승리 (Quick Wins)
**목표**: 297개 → 150개 경고로 감소

#### Day 1-3: 사용되지 않는 imports/variables 제거
- [ ] **admin 컴포넌트들** (20개 파일)
  ```bash
  # 우선순위 파일들
  - PersonalServiceDashboard.tsx (가장 많은 경고)
  - SystemManagement.tsx
  - TreeModelConfiguration.tsx
  ```

- [ ] **분석 도구 스크립트 생성**
  ```bash
  # eslint-analysis.js 생성
  npm run lint -- --format json > eslint-report.json
  ```

#### Day 4-7: React Hook 의존성 배열 수정
- [ ] **useEffect 의존성 배열 수정** (중요도 높음)
  ```typescript
  // Before
  useEffect(() => {
    fetchData();
  }, []); // ❌ fetchData 누락

  // After  
  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ 의존성 추가

  // 또는 useCallback 사용
  const fetchData = useCallback(() => {
    // 로직
  }, []);
  ```

#### Day 8-14: 코드 정리 및 검증
- [ ] **첫 번째 마일스톤 검증**
  ```bash
  npm run lint | grep "warning" | wc -l  # 목표: 150개 이하
  ```

### Week 3-4: 심화 정리
**목표**: 150개 → 50개 경고로 감소

#### Day 15-21: 컴포넌트별 집중 정리
- [ ] **AI 관련 컴포넌트** (10개 파일)
- [ ] **평가자 관련 컴포넌트** (8개 파일)  
- [ ] **분석 관련 컴포넌트** (12개 파일)

#### Day 22-28: ESLint 설정 최적화
- [ ] **ESLint 규칙 조정**
  ```json
  // .eslintrc.json 업데이트
  {
    "rules": {
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }]
    }
  }
  ```

---

## 🧪 2단계: 테스트 안정화 (Week 5-8)

### Week 5-6: 테스트 실패 원인 분석
**목표**: 44개 실패 → 분석 완료 및 카테고리화

#### Day 1-7: 실패 테스트 분류
- [ ] **테스트 실행 및 로그 분석**
  ```bash
  cd ahp_app
  npm test -- --verbose --no-coverage > test-analysis.log 2>&1
  ```

- [ ] **실패 유형별 분류**
  ```
  1. Import/Module 오류 (추정 60%)
  2. Mock 설정 오류 (추정 25%) 
  3. 컴포넌트 렌더링 오류 (추정 10%)
  4. API 호출 관련 오류 (추정 5%)
  ```

#### Day 8-14: 핵심 기능 테스트 우선 수정
- [ ] **AHP 계산 로직 테스트** (최우선)
  ```bash
  src/utils/ahpCalculator.test.ts
  src/utils/consistencyHelper.test.ts
  ```

- [ ] **기본 컴포넌트 테스트**
  ```bash
  src/components/common/Button.test.tsx
  src/components/common/Modal.test.tsx
  ```

### Week 7-8: 테스트 환경 정비
**목표**: 핵심 테스트 통과 + 테스트 환경 안정화

#### Day 15-21: Mock 및 Setup 개선
- [ ] **테스트 환경 설정 개선**
  ```typescript
  // src/setupTests.ts 업데이트
  import '@testing-library/jest-dom';
  
  // Mock global objects
  global.fetch = jest.fn();
  ```

- [ ] **API Mock 설정**
  ```typescript
  // src/__mocks__/apiService.ts 생성
  export const mockApiService = {
    fetchProjects: jest.fn(),
    createProject: jest.fn()
  };
  ```

#### Day 22-28: 통합 테스트 추가
- [ ] **E2E 테스트 시나리오 설계**
  ```
  1. 프로젝트 생성 → 기준 설정 → 평가 → 결과 확인
  2. 사용자 로그인 → 대시보드 접근 → 기본 기능 사용
  ```

---

## 🚀 3단계: CI 파이프라인 점진적 강화 (Week 9-12)

### Week 9-10: 품질 게이트 단계별 추가
**목표**: CI에 품질 검사 점진적 복원

#### Phase 1: ESLint 복원 (Week 9)
- [ ] **ESLint 경고 50개 이하 달성 후**
  ```yaml
  # .github/workflows/ci.yml
  - name: Run ESLint
    run: npm run lint
    # 50개 이하면 실패하지 않도록 설정
  ```

#### Phase 2: 핵심 테스트 복원 (Week 10)
- [ ] **핵심 테스트만 CI에 추가**
  ```yaml
  - name: Run Core Tests
    run: npm test -- --testPathPattern="(Button|Modal|ahpCalculator)" --coverage=false
  ```

### Week 11-12: 완전한 품질 파이프라인
**목표**: 전체 테스트 스위트 안정화

#### 최종 CI 파이프라인
```yaml
name: Complete Quality Pipeline
jobs:
  quality-check:
    steps:
    - name: Install dependencies
      run: npm ci
    - name: Run ESLint
      run: npm run lint
    - name: Run TypeScript check  
      run: npm run build
    - name: Run Unit Tests
      run: npm test -- --coverage --watchAll=false
    - name: Run E2E Tests
      run: npm run test:e2e
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
```

---

## 📈 성공 지표 및 마일스톤

### 🎯 주간 목표
| Week | ESLint 경고 | 테스트 통과율 | CI 상태 |
|------|-------------|---------------|---------|
| 1-2  | 297 → 150  | -             | 빌드만  |
| 3-4  | 150 → 50   | -             | 빌드만  |
| 5-6  | 50 → 30    | 실패 분석     | 빌드만  |
| 7-8  | 30 → 20    | 70% → 85%     | 빌드만  |
| 9-10 | 20 → 10    | 85% → 95%     | ESLint+ |
| 11-12| 10 → 0     | 95% → 98%     | 전체    |

### 🏆 최종 목표 (Week 12)
- **ESLint**: 0개 경고
- **테스트**: 98% 통과율  
- **Coverage**: 80% 이상
- **CI**: 완전한 품질 파이프라인 작동

---

## 🛠️ 실행 도구 및 스크립트

### 품질 분석 스크립트
```bash
# quality-check.sh
#!/bin/bash
echo "=== ESLint Analysis ==="
npm run lint | grep "warning" | wc -l

echo "=== Test Results ==="  
npm test -- --coverage --watchAll=false --silent | grep -E "(Tests:|Snapshots:)"

echo "=== Build Check ==="
npm run build > /dev/null 2>&1 && echo "✅ Build Success" || echo "❌ Build Failed"
```

### 진행상황 추적
```bash
# progress.md 템플릿
## Week N Progress
- ESLint: XXX warnings → YYY warnings (-ZZ)
- Tests: AA passed, BB failed  
- Blockers: [이슈 목록]
- Next: [다음 주 계획]
```

---

## 🤝 리뷰 및 협업 프로세스

### 매주 금요일: 품질 리뷰
1. **ESLint 진행상황 확인**
2. **테스트 결과 분석** 
3. **다음 주 우선순위 조정**
4. **블로커 이슈 해결방안 논의**

### Pull Request 품질 기준
```yaml
# PR 체크리스트
- [ ] ESLint 경고 증가하지 않음
- [ ] 새로운 테스트 실패 없음  
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트 (필요시)
```

이 계획을 통해 **체계적이고 측정 가능한 코드 품질 개선**을 달성할 수 있습니다! 🚀