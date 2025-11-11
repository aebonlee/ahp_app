# 🎯 AHP 플랫폼 개발 TODO LIST
## 작성일: 2024-11-11
## 목표: 2024년 11월 말까지 평가자 배포 가능한 MVP 완성

---

## 📊 현재 상황 분석

### 완성된 기능 (75%)
- ✅ 프로젝트 생성/관리
- ✅ DB 초기화 도구
- ✅ 관리자 대시보드
- ✅ 백엔드 API 연동

### 미완성 핵심 기능 (25%) - **서비스 불가 상태**
- ❌ 계층적 기준 구조 (상위/하위)
- ❌ 대안 입력 및 관리
- ❌ 평가자 등록/초대
- ❌ 실제 평가 수행
- ❌ 결과 분석 및 리포트

---

## 🚨 긴급 개발 필요 항목 (MVP 필수)

### 1주차 (11/11-11/17) - 기본 구조 완성

#### 🔴 Day 1-2 (11/11-12) - Sonnet 담당
```markdown
[ ] 1. 계층적 기준 구조 UI 구현
    - 상위 기준 입력 폼
    - 하위 기준 연결 UI
    - 트리 구조 시각화
    - 드래그&드롭 순서 변경
    파일: src/components/criteria/HierarchicalCriteria.tsx

[ ] 2. 대안 관리 컴포넌트
    - 대안 추가/수정/삭제
    - 대안 설명 입력
    - 대안 순서 관리
    - 일괄 입력 기능
    파일: src/components/alternatives/AlternativeManager.tsx
```

#### 🔵 Day 3-4 (11/13-14) - Opus 담당
```markdown
[ ] 3. 평가자 시스템 설계
    - 데이터베이스 스키마 설계
    - API 엔드포인트 설계
    - 인증 토큰 시스템 설계
    - 이메일 발송 아키텍처
    문서: Dev_md_2/평가자_시스템_설계.md

[ ] 4. 평가 프로세스 아키텍처
    - 평가 세션 관리
    - 쌍대비교 로직
    - 일관성 검증 알고리즘
    - 가중치 계산 로직
    문서: Dev_md_2/평가_프로세스_설계.md
```

#### 🔴 Day 5-7 (11/15-17) - Sonnet 담당
```markdown
[ ] 5. 평가자 등록 UI
    - 평가자 정보 입력 폼
    - 이메일 일괄 입력
    - 초대 메일 발송 UI
    - 평가자 상태 관리
    파일: src/components/evaluators/EvaluatorRegistration.tsx

[ ] 6. 백엔드 API 연동
    - 계층 구조 저장 API
    - 대안 CRUD API
    - 평가자 등록 API
    - 평가 세션 API
    파일: src/services/evaluationService.ts
```

---

### 2주차 (11/18-11/24) - 평가 시스템 구현

#### 🔵 Day 8-9 (11/18-19) - Opus 담당
```markdown
[ ] 7. 평가 수행 로직 설계
    - AHP 매트릭스 계산
    - 고유값 계산 알고리즘
    - CR(일관성 비율) 검증
    - 그룹 평가 통합 로직
    문서: Dev_md_2/AHP_계산_엔진.md

[ ] 8. 결과 분석 시스템 설계
    - 민감도 분석
    - 가중치 분포 분석
    - 순위 도출 알고리즘
    - 리포트 생성 로직
    문서: Dev_md_2/분석_시스템_설계.md
```

#### 🔴 Day 10-14 (11/20-24) - Sonnet 담당
```markdown
[ ] 9. 평가 수행 UI
    - 쌍대비교 매트릭스 UI
    - 9점 척도 슬라이더
    - 진행률 표시
    - 임시 저장 기능
    파일: src/components/evaluation/PairwiseComparison.tsx

[ ] 10. 결과 대시보드
    - 가중치 차트 (막대, 파이)
    - 순위 테이블
    - 일관성 지표 표시
    - PDF 다운로드
    파일: src/components/results/ResultsDashboard.tsx
```

---

### 3주차 (11/25-11/30) - 통합 테스트 및 배포

#### 🔴🔵 Day 15-21 (11/25-30) - 공동 작업
```markdown
[ ] 11. 통합 테스트
    - E2E 테스트 시나리오
    - 부하 테스트
    - 보안 점검
    - 버그 수정

[ ] 12. 배포 준비
    - 프로덕션 환경 설정
    - 도메인 연결
    - SSL 인증서
    - 모니터링 설정

[ ] 13. 실제 평가자 테스트
    - 베타 테스터 모집
    - 피드백 수집
    - 긴급 수정
    - 최종 검증
```

---

## 📋 역할별 세부 태스크

### 🧠 Opus 4.1 전담 (복잡한 설계)

```typescript
// 1. 평가자 인증 시스템
interface EvaluatorAuth {
  generateToken(): string;
  verifyToken(token: string): boolean;
  sendInvitation(email: string): Promise<void>;
  trackProgress(evaluatorId: string): Progress;
}

// 2. AHP 계산 엔진
interface AHPEngine {
  calculatePriorities(matrix: number[][]): number[];
  checkConsistency(matrix: number[][]): number;
  aggregateGroupEvaluations(evaluations: Evaluation[]): Result;
  performSensitivityAnalysis(weights: number[]): Analysis;
}

// 3. 데이터베이스 스키마
interface DatabaseSchema {
  evaluators: EvaluatorModel;
  evaluations: EvaluationModel;
  comparisons: ComparisonModel;
  results: ResultModel;
}
```

### ⚡ Sonnet 4 전담 (UI/UX 구현)

```typescript
// 1. 컴포넌트 구현 목록
const components = [
  'HierarchicalCriteria.tsx',    // 계층 구조 UI
  'AlternativeManager.tsx',       // 대안 관리
  'EvaluatorRegistration.tsx',    // 평가자 등록
  'PairwiseComparison.tsx',       // 쌍대비교
  'ResultsDashboard.tsx',         // 결과 대시보드
  'EmailInvitation.tsx',          // 초대 메일
  'ProgressTracker.tsx',          // 진행률 추적
  'ExportReport.tsx'              // 리포트 생성
];

// 2. API 서비스 구현
const services = [
  'criteriaService.ts',           // 기준 관리
  'alternativeService.ts',        // 대안 관리
  'evaluatorService.ts',          // 평가자 관리
  'evaluationService.ts',         // 평가 수행
  'resultService.ts'              // 결과 조회
];
```

---

## 📊 진행 상황 추적

### Week 1 (11/11-11/17)
```
월 [S] 계층 구조 UI        [ ] □□□□□ 0%
화 [S] 대안 관리           [ ] □□□□□ 0%
수 [O] 평가자 설계         [ ] □□□□□ 0%
목 [O] 평가 프로세스       [ ] □□□□□ 0%
금 [S] 평가자 등록 UI      [ ] □□□□□ 0%
토 [S] API 연동            [ ] □□□□□ 0%
일 [S] 테스트 및 디버깅    [ ] □□□□□ 0%
```

### Week 2 (11/18-11/24)
```
월 [O] AHP 계산 엔진       [ ] □□□□□ 0%
화 [O] 결과 분석 설계      [ ] □□□□□ 0%
수 [S] 평가 수행 UI        [ ] □□□□□ 0%
목 [S] 평가 수행 UI        [ ] □□□□□ 0%
금 [S] 결과 대시보드       [ ] □□□□□ 0%
토 [S] 결과 대시보드       [ ] □□□□□ 0%
일 [S] 통합 테스트         [ ] □□□□□ 0%
```

### Week 3 (11/25-11/30)
```
월 [공동] E2E 테스트       [ ] □□□□□ 0%
화 [공동] 부하 테스트      [ ] □□□□□ 0%
수 [공동] 버그 수정        [ ] □□□□□ 0%
목 [공동] 배포 준비        [ ] □□□□□ 0%
금 [공동] 베타 테스트      [ ] □□□□□ 0%
토 [공동] 피드백 반영      [ ] □□□□□ 0%
일 [공동] 최종 검증        [ ] □□□□□ 0%
```

---

## 🎯 성공 기준

### MVP 필수 기능 (11월 30일까지)
1. ✅ 프로젝트 생성 가능
2. ⏳ **계층적 기준 설정 가능**
3. ⏳ **대안 입력 가능**
4. ⏳ **평가자 초대 가능**
5. ⏳ **실제 평가 수행 가능**
6. ⏳ **결과 확인 가능**

### 품질 기준
- 응답 시간 < 2초
- 에러율 < 1%
- 모바일 지원
- 5명 이상 동시 평가 가능

---

## 📝 일일 체크리스트

### Sonnet 일일 작업
```markdown
□ Git pull 최신 코드
□ 오늘의 태스크 확인
□ 구현 및 테스트
□ Git commit & push
□ 진행 상황 업데이트
```

### Opus 일일 작업
```markdown
□ 복잡한 문제 분석
□ 설계 문서 작성
□ 알고리즘 의사코드
□ 구현 가이드 작성
□ 코드 리뷰
```

---

## 🚀 즉시 시작 가능한 작업

### 오늘 (11/11) Sonnet이 바로 시작할 작업
1. **HierarchicalCriteria.tsx 생성**
   ```bash
   cd ahp_app_clone/src/components
   mkdir criteria
   # HierarchicalCriteria.tsx 컴포넌트 생성
   ```

2. **AlternativeManager.tsx 생성**
   ```bash
   mkdir alternatives
   # AlternativeManager.tsx 컴포넌트 생성
   ```

3. **API 서비스 파일 생성**
   ```bash
   cd ../services
   # criteriaService.ts 생성
   # alternativeService.ts 생성
   ```

---

## 📞 긴급 연락 및 이슈

### 블로킹 이슈
- 없음

### 리스크
- 이메일 발송 서비스 선정 필요
- 대용량 평가자 처리 방안 필요
- 실시간 동기화 구현 복잡도

### 의사결정 필요
- [ ] 이메일 서비스: SendGrid vs Nodemailer
- [ ] 실시간 통신: WebSocket vs Polling
- [ ] 결제 시스템: Stripe vs PayPal

---

**마지막 업데이트**: 2024-11-11 21:30 KST
**다음 리뷰**: 2024-11-12 09:00 KST
**목표 완성일**: 2024-11-30 (MVP)

---

> ⚠️ **중요**: 현재 평가자 배포가 불가능한 상태입니다.
> 계층 구조, 대안 관리, 평가자 시스템이 우선 구현되어야 합니다.
> Sonnet은 UI 구현을, Opus는 복잡한 로직 설계를 담당합니다.