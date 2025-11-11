# 긴급 개발 TODO LIST
**작성일**: 2025-11-11  
**프로젝트**: AHP 플랫폼  
**현재 완성도**: 72%  
**목표**: 핵심 기능 완성

---

## 🔴 P0 - 긴급 (1주 내 필수)

### 1. 계층적 평가 시스템 구현 ⚠️ **최우선**

#### 문제점
- 상위/하위 기준 구분 평가 불가능
- 단일 레벨 평가만 작동
- 가중치 집계 미구현

#### 해결 방안
```typescript
// 새로 만들어야 할 컴포넌트
// src/components/evaluation/HierarchicalEvaluationOrchestrator.tsx

interface HierarchicalEvaluationOrchestratorProps {
  project: Project;
  evaluator: Evaluator;
  onComplete: (results: EvaluationResults) => void;
}

const HierarchicalEvaluationOrchestrator = () => {
  // Step 1: 상위 기준 평가
  // Step 2: 각 상위별 하위 기준 평가
  // Step 3: 각 최하위별 대안 평가
  // Step 4: 가중치 집계 및 결과 계산
};
```

#### 작업 목록
- [ ] 평가 오케스트레이터 컴포넌트 생성
- [ ] 단계별 평가 플로우 구현
- [ ] 가중치 전파 로직 구현
- [ ] 결과 자동 집계 시스템

**담당**: Opus (설계) → Sonnet (구현)  
**예상 시간**: 3일

---

### 2. ModelBuilder 컴포넌트 완성 ❌ **빈 상태**

#### 현재 상태
```typescript
// 현재: src/components/modals/ModelBuilder.tsx
// 거의 빈 플레이스홀더 상태
```

#### 구현 필요 기능
- [ ] CriteriaManagement 기능 통합
- [ ] 계층 구조 빌더 UI
- [ ] 실시간 미리보기
- [ ] 저장/불러오기 기능

**담당**: Sonnet  
**예상 시간**: 2일

---

### 3. 평가자 링크 연결 🔗 **미연결**

#### 문제점
- 초대 코드 입력 후 평가로 이동 안 됨
- QR 코드 스캔 후 처리 미구현

#### 수정 필요 파일
```typescript
// src/components/evaluator/EvaluatorOnlyDashboard.tsx
const handleInvitationSubmit = (e) => {
  // TODO: 실제 프로젝트 조회 및 이동
  // 현재는 console.log만 있음
};

// src/App.tsx
// 라우팅 추가 필요
<Route path="/evaluate/:token" element={<EvaluationFlow />} />
```

**담당**: Sonnet  
**예상 시간**: 1일

---

## 🟠 P1 - 높음 (2주 내)

### 4. 평가자 이메일 시스템 📧

#### 구현 필요
- [ ] SendGrid/Nodemailer 통합
- [ ] 이메일 템플릿 작성
- [ ] 대량 발송 Queue 시스템
- [ ] 발송 상태 추적

**담당**: Opus (아키텍처) → Sonnet (구현)  
**예상 시간**: 4일

---

### 5. TypeScript 타입 정리 🔧

#### 수정 필요
```typescript
// 통일 필요
parent_id → parentId
level → hierarchyLevel
children? → children (필수로)

// any 타입 제거
총 40개 any 타입 발견
```

**담당**: Sonnet  
**예상 시간**: 2일

---

### 6. 모바일 반응형 개선 📱

#### 개선 필요 컴포넌트
- [ ] EvaluationTest.tsx
- [ ] PairwiseComparison.tsx
- [ ] ResultsDashboard.tsx
- [ ] 네비게이션 메뉴

**담당**: Sonnet  
**예상 시간**: 3일

---

## 🟡 P2 - 보통 (1개월 내)

### 7. 민감도 분석 구현 📊
- [ ] 알고리즘 설계 (Opus)
- [ ] UI 구현 (Sonnet)
- [ ] 차트 시각화

### 8. 실시간 모니터링 대시보드 📡
- [ ] WebSocket 연결
- [ ] 실시간 진행률
- [ ] 알림 시스템

### 9. 테스트 커버리지 증대 🧪
- [ ] 현재 15% → 목표 70%
- [ ] 핵심 컴포넌트 우선
- [ ] E2E 테스트 추가

### 10. 성능 최적화 ⚡
- [ ] 번들 크기 감소 (1.2MB → 500KB)
- [ ] 코드 스플리팅
- [ ] 이미지 최적화

---

## 📋 즉시 실행 가능 명령어

### Sonnet이 바로 시작할 수 있는 작업

```bash
# 1. ESLint 경고 확인 및 수정
cd ahp_app
npm run lint
npm run lint:fix

# 2. TypeScript 타입 체크
npx tsc --noEmit

# 3. 번들 크기 분석
npm run build
npx source-map-explorer 'build/static/js/*.js'

# 4. 테스트 실행
npm test
npm test -- --coverage

# 5. 개발 서버 시작
npm start
```

---

## 🗓️ 주간 개발 일정

### Week 1 (11/11 - 11/17)
```
월(11/11): 프로젝트 분석 ✅
화(11/12): ModelBuilder 구현
수(11/13): 평가자 링크 연결
목(11/14): [Opus] 계층 평가 설계
금(11/15): 계층 평가 구현 시작
토(11/16): 계층 평가 구현 계속
일(11/17): 테스트 및 디버깅
```

### Week 2 (11/18 - 11/24)
```
월: TypeScript 타입 정리
화: 모바일 반응형 개선
수: 평가자 이메일 시스템 설계
목: [Opus] 고급 분석 설계
금: 이메일 시스템 구현
토: 민감도 분석 UI
일: 통합 테스트
```

---

## ✅ 체크리스트

### 오늘 완료 가능 (Sonnet)
- [ ] ESLint 경고 10개 수정
- [ ] ModelBuilder.tsx 기본 구조 작성
- [ ] any 타입 5개 구체화
- [ ] 테스트 1개 작성

### 이번 주 목표
- [ ] ModelBuilder 완성
- [ ] 평가 링크 연결
- [ ] 타입 정리 50%
- [ ] 모바일 뷰 개선 시작

### 이번 달 목표
- [ ] 계층 평가 시스템 완성
- [ ] 평가자 시스템 완성
- [ ] 테스트 커버리지 50%
- [ ] MVP 준비 완료

---

## 🚨 차단 이슈

### 현재 차단 요소
1. **백엔드 API 미구현**
   - /api/hierarchy/* 엔드포인트 없음
   - /api/evaluators/invite 미구현

2. **환경 변수 미설정**
   - REACT_APP_SENDGRID_API_KEY
   - REACT_APP_CLAUDE_API_KEY

3. **의존성 미설치**
   - socket.io-client
   - @sendgrid/mail

### 해결 방안
```bash
# 의존성 설치
npm install socket.io-client @sendgrid/mail

# 환경 변수 설정
echo "REACT_APP_SENDGRID_API_KEY=your_key" >> .env
echo "REACT_APP_CLAUDE_API_KEY=your_key" >> .env
```

---

## 📞 지원 필요 사항

### Opus에게 물어볼 사항 (목요일)
1. 계층 가중치 집계 알고리즘
2. 평가자 권한 관리 체계
3. 실시간 동기화 아키텍처
4. 캐싱 전략

### 외부 지원 필요
1. SendGrid API 키 발급
2. 백엔드 배포 서버 점검
3. PostgreSQL 스키마 업데이트

---

## 🎯 성공 지표

### 1주차 성공 기준
- ModelBuilder 작동 ✅
- 평가 링크 연결 ✅
- ESLint 경고 < 20개 ✅

### 2주차 성공 기준
- 계층 평가 작동 ✅
- 타입 정리 완료 ✅
- 모바일 사용 가능 ✅

### 1개월 성공 기준
- 전체 기능 작동 ✅
- 테스트 커버리지 50% ✅
- 성능 지표 달성 ✅

---

**작성자**: Claude Opus 4.1  
**마지막 업데이트**: 2025-11-11  
**다음 리뷰**: 2025-11-14 (목요일)