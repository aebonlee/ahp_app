# Opus & Sonnet 업무 구분 가이드
**작성일**: 2025-11-11  
**프로젝트**: AHP 플랫폼  
**목적**: 효율적인 AI 협업 체계 구축

---

## 🎯 업무 구분 원칙

### 핵심 원칙
- **Opus**: 복잡한 설계, 알고리즘, 아키텍처 (주 1회, 목요일)
- **Sonnet**: 구현, 디버깅, UI/UX, 일상 작업 (매일)

### 결정 기준
```
복잡도 높음 + 설계 필요 → Opus
구현 위주 + 반복 작업 → Sonnet
```

---

## 🧠 Opus 4.1 전담 업무

### 1. 계층적 평가 시스템 설계 (최우선)

#### 설계 범위
```typescript
// Opus가 설계해야 할 핵심 아키텍처
interface HierarchicalEvaluationSystem {
  // 평가 플로우 오케스트레이션
  evaluationOrchestrator: {
    steps: EvaluationStep[];
    navigation: StepNavigation;
    validation: StepValidation;
  };
  
  // 계층별 비교 매트릭스 관리
  comparisonMatrixManager: {
    upperLevelMatrix: Matrix;
    lowerLevelMatrices: Map<string, Matrix>;
    alternativeMatrices: Map<string, Matrix>;
  };
  
  // 가중치 계산 및 집계
  weightAggregator: {
    calculateLocalWeights(): Weights;
    calculateGlobalWeights(): Weights;
    propagateWeights(): void;
  };
  
  // 일관성 검증 체계
  consistencyValidator: {
    validateLevel(level: number): ConsistencyResult;
    validateHierarchy(): HierarchyConsistency;
    suggestAdjustments(): Adjustment[];
  };
}
```

#### 구체적 작업
- [ ] 평가 단계별 상태 머신 설계
- [ ] 계층 간 가중치 전파 알고리즘
- [ ] 다중 평가자 통합 메커니즘
- [ ] 일관성 검증 및 자동 조정 로직

### 2. 평가자 배정 시스템 아키텍처

#### 시스템 구성
```javascript
// Opus 설계 영역
const EvaluatorAssignmentArchitecture = {
  // 이메일 발송 시스템
  emailService: {
    provider: 'SendGrid',  // or Nodemailer
    templates: EmailTemplates,
    queue: BullMQ,
    rateLimiting: RateLimiter
  },
  
  // 토큰 관리
  tokenManagement: {
    generation: JWT,
    validation: TokenValidator,
    expiration: ExpirationPolicy,
    revocation: RevocationList
  },
  
  // 진행률 추적
  progressTracking: {
    realtime: WebSocket,
    storage: Redis,
    aggregation: ProgressAggregator,
    notifications: NotificationEngine
  },
  
  // 대량 초대 처리
  bulkInvitation: {
    batchSize: 100,
    parallelism: 10,
    retryPolicy: ExponentialBackoff,
    errorHandling: ErrorQueue
  }
};
```

### 3. 고급 분석 엔진 설계

#### 분석 알고리즘
```python
# Opus가 설계할 알고리즘
class AdvancedAnalysisEngine:
    def sensitivity_analysis(self):
        """민감도 분석 알고리즘"""
        # 가중치 변동에 따른 순위 변화 계산
        # 임계점 식별
        # 안정성 지표 산출
        
    def monte_carlo_simulation(self):
        """몬테카를로 시뮬레이션"""
        # 불확실성 모델링
        # 확률 분포 생성
        # 시나리오 생성 및 평가
        
    def group_decision_integration(self):
        """그룹 의사결정 통합"""
        # 가중 기하평균
        # 합의 지표 계산
        # 이상치 처리
```

### 4. 결제 시스템 설계

#### 보안 및 비즈니스 로직
```typescript
// Opus 설계 필수
interface PaymentSystemArchitecture {
  // 결제 게이트웨이 통합
  gateway: {
    stripe: StripeIntegration;
    paypal: PayPalIntegration;
    webhooks: WebhookHandler;
  };
  
  // 구독 관리
  subscription: {
    plans: SubscriptionPlan[];
    billing: BillingCycle;
    upgrades: UpgradeLogic;
    cancellation: CancellationPolicy;
  };
  
  // 보안
  security: {
    pciCompliance: PCIRequirements;
    encryption: EncryptionStrategy;
    fraudDetection: FraudDetector;
    auditLog: AuditLogger;
  };
}
```

---

## ⚡ Sonnet 4 전담 업무

### 1. UI 컴포넌트 구현

#### 즉시 시작 가능한 작업
```bash
# 1. ESLint 경고 해결
cd ahp_app
npm run lint
# 40개 경고를 하나씩 수정

# 2. TypeScript 개선
# any 타입을 구체적 타입으로 변경
# 예: any → Project | Criterion | Alternative

# 3. 반응형 디자인
# Tailwind 클래스 추가
# sm:, md:, lg:, xl: 브레이크포인트 활용
```

#### 구현할 컴포넌트
```typescript
// Sonnet이 구현할 UI 컴포넌트들

// 1. 로딩 상태 컴포넌트
const LoadingSkeleton: React.FC = () => {
  // 스켈레톤 UI 구현
};

// 2. 진행률 표시
const ProgressIndicator: React.FC<{progress: number}> = () => {
  // 시각적 진행률 표시
};

// 3. 애니메이션 효과
const PageTransition: React.FC = () => {
  // 페이지 전환 애니메이션
};

// 4. 모바일 최적화 뷰
const MobileEvaluationView: React.FC = () => {
  // 모바일 전용 평가 화면
};
```

### 2. 버그 수정 및 개선

#### 현재 발견된 버그 목록
1. **ModelBuilder.tsx 빈 컴포넌트**
   - CriteriaManagement 기능 통합
   - 모달 내부 구현

2. **평가 링크 연결 안 됨**
   - 초대 코드 → 실제 평가 연결
   - 라우팅 수정

3. **TypeScript 타입 불일치**
   - parent_id vs parentId 통일
   - 선택적 타입 정리

### 3. 테스트 코드 작성

#### 우선순위 테스트
```typescript
// Sonnet이 작성할 테스트

// 1. 컴포넌트 테스트
describe('CriteriaManagement', () => {
  test('계층 구조 생성', () => {});
  test('부모-자식 관계 설정', () => {});
});

// 2. 유틸 함수 테스트
describe('ahpCalculator', () => {
  test('고유벡터 계산', () => {});
  test('일관성 비율 계산', () => {});
});

// 3. API 서비스 테스트
describe('apiService', () => {
  test('에러 처리', () => {});
  test('재시도 로직', () => {});
});
```

### 4. 문서화 작업

#### 작성할 문서
1. **컴포넌트 사용 가이드**
2. **API 엔드포인트 문서**
3. **설치 및 실행 가이드**
4. **트러블슈팅 가이드**

---

## 🤝 협업 워크플로우

### Opus → Sonnet 핸드오프

#### 1단계: Opus 설계 (목요일)
```
Opus 작업:
1. 아키텍처 다이어그램 작성
2. 인터페이스 정의
3. 알고리즘 의사코드
4. 구현 가이드라인
```

#### 2단계: Sonnet 구현 (금-수)
```
Sonnet 작업:
1. 설계 문서 리뷰
2. 컴포넌트 구현
3. 테스트 작성
4. 문서화
```

#### 3단계: 검증 및 개선
```
공동 작업:
1. 코드 리뷰
2. 성능 테스트
3. 버그 수정
4. 배포 준비
```

---

## 📅 주간 스케줄

### 목요일 (Opus Day)
```
09:00-12:00: 복잡한 문제 분석 및 설계
12:00-13:00: 휴식
13:00-16:00: 아키텍처 문서 작성
16:00-18:00: 구현 가이드 작성
18:00-19:00: Sonnet 인수인계 문서
```

### 금-수요일 (Sonnet Days)
```
금요일: Opus 설계 리뷰 및 구현 시작
토요일: 핵심 기능 구현
일요일: 테스트 및 디버깅
월요일: UI/UX 개선
화요일: 성능 최적화
수요일: 문서화 및 Opus 준비
```

---

## 📊 작업 복잡도 매트릭스

| 작업 유형 | 복잡도 | 담당 | 예시 |
|----------|--------|------|------|
| 알고리즘 설계 | ⭐⭐⭐⭐⭐ | Opus | 계층 가중치 집계 |
| 시스템 아키텍처 | ⭐⭐⭐⭐⭐ | Opus | 평가자 시스템 |
| 보안 설계 | ⭐⭐⭐⭐⭐ | Opus | 결제 시스템 |
| API 통합 | ⭐⭐⭐⭐ | Opus/Sonnet | 외부 서비스 연동 |
| 컴포넌트 구현 | ⭐⭐⭐ | Sonnet | React 컴포넌트 |
| UI/UX 개선 | ⭐⭐⭐ | Sonnet | 반응형 디자인 |
| 버그 수정 | ⭐⭐ | Sonnet | 일반 버그 |
| 테스트 작성 | ⭐⭐ | Sonnet | 단위 테스트 |
| 문서화 | ⭐ | Sonnet | 가이드 작성 |

---

## 🚨 중요 주의사항

### Opus 세션 시
1. **준비 필수**: 복잡한 문제 목록 미리 정리
2. **집중 시간**: 목요일 전체를 설계에 할당
3. **산출물**: 명확한 설계 문서와 구현 가이드

### Sonnet 세션 시
1. **일일 목표**: 구체적인 작업 목표 설정
2. **진행 상황**: 매일 진행 상황 기록
3. **질문 정리**: Opus에게 물어볼 사항 정리

---

## 📈 성과 지표

### Opus 성과
- 설계 문서 품질
- 알고리즘 효율성
- 아키텍처 확장성
- 보안 수준

### Sonnet 성과
- 구현 속도
- 코드 품질
- 테스트 커버리지
- 버그 해결률

---

## 🎯 최종 목표

### 2주 내 목표
- 계층적 평가 시스템 완성
- 평가자 배정 시스템 구현
- 기본 버그 모두 해결

### 1개월 내 목표
- MVP 완성
- 테스트 커버리지 70%
- 성능 최적화 완료

### 2개월 내 목표
- 정식 출시 준비
- 결제 시스템 통합
- 전체 문서화 완료

---

**작성자**: Claude Opus 4.1  
**최종 업데이트**: 2025-11-11  
**다음 Opus 세션**: 2025-11-14 (목요일)