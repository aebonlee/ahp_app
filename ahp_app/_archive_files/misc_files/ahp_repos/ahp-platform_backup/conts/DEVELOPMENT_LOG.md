# AHP Research Platform 개발 문서

## 2025년 8월 24일 - 요금제 시스템 전면 개편

### 📋 개발 요구사항
클라이언트의 요청에 따라 기존 월 구독제 방식에서 프로젝트 단위 요금제로 전면 개편

### 🎯 변경된 요금제 구조

#### 1. Single Project Pack - ₩200,000
- **사용 기간**: 1개월
- **프로젝트 수**: 1개
- **평가자 인원**: 30명
- **대상**: 대학원 논문, 단기 과제, 학술 발표 준비

#### 2. Team Project Pack - ₩500,000
- **사용 기간**: 1개월
- **프로젝트 수**: 3개
- **평가자 인원**: 50명
- **대상**: 기업·기관 연구과제, 단일 컨설팅 프로젝트

#### 3. Institution Pack - ₩1,000,000
- **사용 기간**: 1개월
- **프로젝트 수**: 3개
- **평가자 인원**: 100명
- **대상**: 공공기관·대규모 연구 프로젝트 단위 사용

#### 추가 옵션 (각 ₩50,000)
- 인공지능 활용
- 문헌정보 정리
- 평가자 10명 단위 추가

### 📝 수정된 파일 목록

#### 1. `/src/components/home/PricingSection.tsx`
**변경 내용**:
- 기존 월 구독제 (₩29,000/₩59,000/₩159,000) 제거
- 새로운 프로젝트 단위 요금제 추가
- `period` 필드 제거 (월 단위 표시 삭제)
- `subtitle` 필드 추가로 부제목 표시
- 추가 옵션 섹션 UI 개선

**주요 코드 변경**:
```typescript
// 기존
{
  name: '기본 연구자',
  price: '₩29,000',
  period: '/월',
  ...
}

// 변경 후
{
  name: 'Single Project Pack',
  price: '₩200,000',
  period: '',
  description: '단일 프로젝트용 (기본 연구자 모드)',
  subtitle: '개인 연구자를 위한 기본 플랜',
  ...
}
```

#### 2. `/src/components/admin/PersonalServiceDashboard.tsx`
**변경 내용**:
- 대시보드에서 요금제 정보 섹션 완전 제거
- Pro Plan 관련 UI 요소 삭제
- 사용량 현황 정보만 표시
- Settings 탭에 새로운 기능 추가

**제거된 섹션**:
- Pro Plan 🔵 표시
- $99/월 가격 정보
- 플랜 혜택 목록
- Next Renewal 정보

#### 3. `/src/components/admin/PersonalServiceDashboard.tsx` - Settings 탭
**신규 추가 기능**:
- **개인 정보 확인**: 사용자 이름, 이메일 표시
- **현재 요금제 정보**: 현재 이용 중인 플랜 상태 표시
- **요금제 업그레이드**: 3가지 요금제 선택 UI
- **추가 옵션 선택**: 체크박스로 옵션 선택 가능

### 🔧 기술적 구현 사항

#### 1. TypeScript 인터페이스 수정
```typescript
interface PlanFeature {
  features: string[];
  subtitle?: string; // 새로 추가된 필드
  period: string; // 빈 문자열 허용
}
```

#### 2. 조건부 렌더링 추가
```typescript
// subtitle이 있는 경우만 표시
{'subtitle' in plan && plan.subtitle && (
  <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
    {plan.subtitle}
  </p>
)}

// period가 있는 경우만 표시
{plan.period && (
  <span className="text-xl" style={{ color: 'var(--text-secondary)' }}>
    {plan.period}
  </span>
)}
```

#### 3. Settings 탭 라우팅 구현
```typescript
case 'settings':
  return (
    <div className="space-y-8">
      {/* 개인 정보 섹션 */}
      {/* 현재 요금제 정보 */}
      {/* 요금제 업그레이드 */}
    </div>
  );
```

### 🎨 UI/UX 개선사항

1. **메인페이지 요금제 카드**
   - 월 단위 표시 제거로 깔끔한 디자인
   - 부제목 추가로 명확한 타겟 고객 표시
   - 추가 옵션을 별도 섹션으로 분리

2. **개인 대시보드**
   - 불필요한 요금제 정보 제거로 간소화
   - 사용량 정보에 집중된 대시보드

3. **설정 페이지**
   - 개인 정보와 요금제를 한 곳에서 관리
   - 명확한 요금제 비교 UI
   - 직관적인 옵션 선택 인터페이스

### 📊 영향 범위

- **사용자 경험**: 프로젝트 단위로 더 유연한 요금제 선택 가능
- **비즈니스 모델**: 월 구독에서 프로젝트 단위 판매로 전환
- **관리 편의성**: 설정 페이지에서 통합 관리 가능

### ✅ 테스트 체크리스트

- [x] 메인페이지 요금제 카드 표시 확인
- [x] 개인 대시보드 요금제 정보 제거 확인
- [x] Settings 탭 접근 및 표시 확인
- [x] 요금제 선택 버튼 호버 효과 확인
- [x] 추가 옵션 체크박스 동작 확인

### 🚀 배포 준비사항

1. 백엔드 API 업데이트 필요 (요금제 구조 변경)
2. 결제 시스템 연동 수정 필요
3. 기존 사용자 마이그레이션 계획 수립
4. 요금제 변경 안내 이메일 발송

### 📌 추가 개발 필요사항

1. 요금제 선택 시 실제 결제 프로세스 연동
2. 추가 옵션 선택 시 가격 자동 계산
3. 요금제 변경 이력 관리 기능
4. 관리자 페이지에서 요금제 관리 기능

---

## Git Commit 정보

**Commit Hash**: b66256b
**Date**: 2025-08-24
**Author**: Claude AI Assistant
**Message**: 요금제 시스템 전면 개편 및 개인 정보 관리 기능 추가

### 변경된 파일
- src/components/home/PricingSection.tsx
- src/components/admin/PersonalServiceDashboard.tsx
- src/components/modals/ModelBuilder.tsx (신규)
- src/components/modals/NewProjectModal.tsx (신규)
- src/hooks/useAuth.tsx (신규)