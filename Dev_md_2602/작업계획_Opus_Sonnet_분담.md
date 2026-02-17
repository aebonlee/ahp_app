# 미구현 기능 개발 작업 계획 (Opus / Sonnet 분담)

**작성일**: 2026-02-18
**작성자**: Claude Sonnet 4.6 (탐색 에이전트 ae39a18 분석 기반)
**프로젝트**: Multi-Layer AHP Decision Support Platform

---

## 현황 요약

전체 코드베이스 점검 결과 미구현 / 부분구현 기능 목록:

| 기능 | 파일 | 구현율 | 복잡도 | 우선순위 |
|------|------|--------|--------|---------|
| 평가자 초대 시스템 | evaluation/assignment/*.tsx | ✅ **100%** (Phase 2a 완료) | - | - |
| 결제 시스템 | payment/PaymentSystem.tsx | 40% | 높음 | P0 |
| 워크숍 관리 | workshop/WorkshopManagement.tsx | 30% | 높음 | P1 |
| 프로젝트 내보내기 | export/ExportManager.tsx | 30% | 중간 | P1 |
| WebSocket 실시간 협업 | collaboration/RealTimeCollaboration.tsx | 70% | 높음 | P1 |
| 의사결정 지원 시스템 | decision/DecisionSupportSystem.tsx | 80% | 높음 | P2 |
| AI 챗봇 | ai-chatbot/AIChatbotAssistantPage.tsx | 50% | 높음 | P2 |
| 실시간 모니터링 | workshop/RealTimeMonitor.tsx | 60% | 중간 | P2 |
| 구독 관리 | payment/SubscriptionManagement.tsx | 85% | 낮음 | P3 |

---

## Phase 2: 핵심 비즈니스 기능 (현재 진행)

### Phase 2a: 평가자 초대 시스템 ✅ COMPLETE

**완료된 파일**:
- `src/hooks/useEvaluatorInvite.ts` — 전체 hook 구현
- `src/components/evaluation/assignment/invitationStatusConfig.ts`
- `src/components/evaluation/assignment/EvaluatorInvitationManager.tsx`
- `src/components/evaluation/EvaluatorInvitationHandler.tsx` — react-router 제거
- `src/components/evaluation/assignment/InviteEvaluators.tsx` — 신규 API 연동
- `src/components/evaluation/assignment/EvaluatorAssignmentDashboard.tsx` — 초대관리 탭 추가
- `src/config/api.ts` — INVITATIONS 엔드포인트 추가

---

### Phase 2b: 결제 시스템 (P0 - 최우선)

**담당**: Opus (설계) → Sonnet (구현)
**설계 문서**: `Dev_md_2602/설계문서_Opus/결제_시스템_설계.md` (Opus 작성 예정)

**현재 미구현 내용** (`payment/PaymentSystem.tsx` 기준):
```typescript
// Line 90-92: 구현 필요
const handlePayment = (planId: string) => {
  console.log('결제 시작:', planId);
  // TODO: PG사 연동
};
```

**Opus 설계 범위**:
- Stripe 또는 국내 PG(KakaoPay, Toss) 연동 아키텍처
- 결제 수단 저장 및 관리 방법
- 구독 자동갱신 로직 설계
- 취소/환불 처리 설계
- 세금 계산 및 청구서 발급 설계

**Sonnet 구현 범위**:
- `usePayment` hook 구현 (결제 생명주기 관리)
- `PaymentSystem.tsx` handlePayment 완성
- `SubscriptionManagement.tsx` 이벤트 핸들러 연결
- `src/config/api.ts` PAYMENT 엔드포인트 추가

---

### Phase 2c: 프로젝트 내보내기 (P1)

**담당**: Opus (설계) → Sonnet (구현)
**설계 문서**: `Dev_md_2602/설계문서_Opus/내보내기_시스템_설계.md` (Opus 작성 예정)

**현재 미구현 내용** (`export/ExportManager.tsx` 기준):
```typescript
// Line 81-82: 비활성화됨
// Excel 내보내기 - "보안상 이유로 임시로 비활성화"
// Line 93-120: UI만 있고 실제 적용 안됨
// includeCharts, includeProgress, includeRanking, includeConsistency 미사용
```

**Opus 설계 범위**:
- xlsx.js 또는 서버사이드 Excel 생성 방법
- PDF 생성 (chart 포함) 방법 — jsPDF / Puppeteer
- 조건부 섹션 구성 로직

**Sonnet 구현 범위**:
- ExportManager.tsx Excel/PDF 구현
- `useExport` hook 구현
- 차트 캡처 → PDF 포함 로직

---

## Phase 3: 실시간 기능 (진행 예정)

### Phase 3a: WebSocket 실시간 협업 (P1)

**담당**: Opus (설계) → Sonnet (구현)
**설계 문서**: `Dev_md_2602/설계문서_Opus/실시간협업_아키텍처.md` ← Opus 에이전트 a94eec8 작성 중

**현재 미구현 내용** (`collaboration/RealTimeCollaboration.tsx` 기준):
```typescript
// Line 99-105: 프로덕션 환경에서 실제 서버로 대체 필요
const server = MockCollaborationServer.getInstance();

// Line 785-787: 초대 API 호출 시뮬레이션 (데모용 성공 처리)
// Line 838: if (response.ok || true) - 실제 응답 무시
```

**Sonnet 구현 범위**:
- `useWebSocketCollaboration` hook 구현
- MockCollaborationServer → 실제 Django Channels WebSocket 연결
- `RealTimeMonitor.tsx` 실제 WebSocket 연결 (현재 setInterval 시뮬레이션)
- Django Channels consumer 연동

---

### Phase 3b: 워크숍 관리 (P1)

**담당**: Opus (설계) → Sonnet (구현)

**현재 미구현 내용** (`workshop/WorkshopManagement.tsx` 기준):
```typescript
// Line 76-87: API 호출 완전히 주석 처리
// const response = await fetch('https://ahp-platform.onrender.com/api/workshops');
setWorkshops([]); // 항상 빈 배열

// 워크숍 생성, 참가, 도구 모두 non-interactive
```

**Opus 설계 범위**:
- 워크숍 데이터 모델 설계
- 참가자 관리 API 설계
- 실시간 세션 관리 설계

**Sonnet 구현 범위**:
- `useWorkshop` hook 구현
- `WorkshopManagement.tsx` API 연동
- 워크숍 생성/참가/도구 기능 구현

---

## Phase 4: AI 기능 (선택)

### Phase 4a: AI 챗봇 (P2)

**담당**: Sonnet (단독 구현 가능)

**현재 미구현 내용** (`ai-chatbot/AIChatbotAssistantPage.tsx` 기준):
```typescript
// Line 191-192: generateAIResponse 미구현
const assistantResponse = await generateAIResponse(content);
// 함수 정의 자체가 없음
```

**Sonnet 구현 범위**:
- `generateAIResponse` 함수 구현 (기존 `aiService.ts` 연동)
- 대화 히스토리 관리
- 컨텍스트 유지 로직
- 세션 저장/복구

---

## Phase 5: 마무리

### Phase 5a: 의사결정 지원 시스템 완성 (P2)

**담당**: Sonnet (단독)

**미구현 내용**:
- `generateSampleEvaluation()` → 실제 AHP 데이터 연동
- 보고서 생성 (`alert` → 실제 PDF 생성)
- 이해관계자 공유 / 승인 워크플로우

---

## 작업 실행 순서 (권장)

```
Week 1: Phase 2b 결제 시스템 (Opus 설계 → Sonnet 구현)
Week 2: Phase 2c 내보내기 시스템 (Opus 설계 → Sonnet 구현)
Week 3: Phase 3a WebSocket 협업 (Opus 설계 완료 확인 → Sonnet 구현)
Week 4: Phase 3b 워크숍 관리 (Opus 설계 → Sonnet 구현)
Week 5: Phase 4a AI 챗봇 (Sonnet 단독)
Week 6: Phase 5a DSS 완성 + 전체 테스트
```

---

## 설계 문서 목록

| 문서 | 담당 | 상태 |
|------|------|------|
| `설계문서_Opus/평가초대_시스템_설계.md` | Opus | ✅ 완료 |
| `설계문서_Opus/실시간협업_아키텍처.md` | Opus | ⏳ 작성 중 (a94eec8) |
| `설계문서_Opus/결제_시스템_설계.md` | Opus | 🔜 미시작 |
| `설계문서_Opus/내보내기_시스템_설계.md` | Opus | 🔜 미시작 |
| `설계문서_Opus/워크숍_관리_설계.md` | Opus | 🔜 미시작 |
