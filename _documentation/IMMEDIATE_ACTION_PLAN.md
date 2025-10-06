# 🚨 즉시 실행 계획 - AHP 플랫폼 개발

**작성일**: 2025-09-30  
**우선순위**: 긴급 → 높음 → 중간 순서

## 🔥 긴급 (이번 주 내)

### 1. 설문조사 응답 수집 기능 구현
**현재 상태**: 설문 생성만 가능, 응답 수집 불가  
**목표**: 평가자가 설문에 응답하고 데이터 저장

#### 필요 작업:
```typescript
// 1. EvaluatorSurveyPage 컴포넌트 완성
- 설문 응답 폼 구현
- 진행률 표시
- 응답 데이터 검증

// 2. Backend API 확장
- POST /api/surveys/{id}/responses/ 
- GET /api/surveys/{id}/responses/
- 응답 데이터 저장 로직

// 3. 데이터베이스 연동
- survey_responses 테이블 활용
- 응답 완료 상태 관리
- 중복 응답 방지
```

### 2. ESLint 경고 해결 (크리티컬만)
**현재 상태**: 빌드 시 수많은 경고 발생  
**목표**: 주요 경고 50% 이상 해결

#### 우선 해결 항목:
```bash
# 1. Unused imports 제거
- LoginForm, EvaluatorSurveyPage 등 미사용 import
- SurveyManagementSystem 등 import했지만 미사용

# 2. Missing dependencies in useEffect
- fetchProjects, loadProjectSummary 등
- 의존성 배열 수정

# 3. TypeScript 타입 오류
- any 타입 제거
- 적절한 인터페이스 정의
```

### 3. 성능 최적화 (빠른 승리)
**현재 상태**: 번들 크기 380KB, 로딩 느림  
**목표**: 초기 로딩 속도 30% 개선

#### 즉시 적용 가능:
```javascript
// 1. 코드 분할
const SurveyFormBuilder = React.lazy(() => import('./SurveyFormBuilder'));
const PersonalServiceDashboard = React.lazy(() => import('./PersonalServiceDashboard'));

// 2. 이미지 최적화
- favicon.svg 최적화
- logo 파일들 WebP 변환

// 3. 불필요한 의존성 제거
- 사용하지 않는 npm 패키지 제거
- bundle-analyzer로 크기 분석
```

## ⚡ 높은 우선순위 (다음 주)

### 4. 설문 분석 대시보드
**목표**: 수집된 응답 데이터 시각화

```typescript
// 구현할 컴포넌트
interface SurveyAnalyticsDashboard {
  - 응답률 통계
  - 인구통계학적 분포 차트
  - 응답 데이터 테이블
  - CSV 내보내기
}
```

### 5. 모바일 반응형 개선
**현재 이슈**: 작은 화면에서 레이아웃 깨짐

```css
/* 우선 수정 영역 */
.survey-form-builder {
  /* 모바일에서 가로 스크롤 발생 */
}

.pairwise-comparison-matrix {
  /* 테이블이 화면을 벗어남 */
}

.personal-service-dashboard {
  /* 사이드바가 모바일에서 접근 불가 */
}
```

### 6. API 연동 안정화
**현재 이슈**: 일부 API 호출에서 에러 발생

```javascript
// 확인 필요한 엔드포인트
- /api/service/projects/${projectId}/surveys/
- /api/service/evaluations/demographic-surveys/
- CORS 설정 확인
- 인증 토큰 갱신 로직
```

## 🔧 중간 우선순위 (이번 달 내)

### 7. 사용자 경험 개선
- 로딩 스피너 일관성
- 에러 메시지 한국어화
- 성공/실패 알림 개선
- 도움말 툴팁 추가

### 8. 코드 품질 개선
- TypeScript strict 모드 적용
- 컴포넌트 재사용성 증대
- 상태 관리 최적화
- 테스트 커버리지 확대

### 9. 보안 강화
- XSS 방지 강화
- CSRF 토큰 검증
- 입력 데이터 검증
- 민감 정보 로깅 방지

## 📋 실행 체크리스트

### Week 1 (2025-09-30 ~ 10-06)
- [ ] **Day 1-2**: 설문 응답 수집 API 구현
- [ ] **Day 3-4**: EvaluatorSurveyPage 완성
- [ ] **Day 5**: ESLint 경고 해결 (우선순위 높은 것)
- [ ] **Weekend**: 성능 최적화 및 테스트

### Week 2 (2025-10-07 ~ 10-13)
- [ ] **Day 1-2**: 설문 분석 대시보드 구현
- [ ] **Day 3-4**: 모바일 반응형 수정
- [ ] **Day 5**: API 연동 안정화
- [ ] **Weekend**: 사용자 테스트 및 피드백 수집

## 🎯 성공 지표

### 기술적 지표
- **번들 크기**: 380KB → 280KB (25% 감소)
- **로딩 시간**: 현재 → 30% 단축
- **ESLint 경고**: 현재 100+ → 50개 미만
- **모바일 점수**: Lighthouse 모바일 점수 80+ 달성

### 기능적 지표
- **설문 응답**: 완전한 응답 수집 플로우 구현
- **데이터 시각화**: 기본적인 통계 차트 제공
- **사용성**: 모바일에서 모든 핵심 기능 사용 가능

### 비즈니스 지표
- **사용자 피드백**: 5명 이상 테스터 피드백 수집
- **오류율**: 사용자 보고 오류 50% 감소
- **완료율**: 설문 생성에서 응답 수집까지 플로우 완료

## 🚀 빠른 시작 가이드

### 1. 개발 환경 설정
```bash
# 1. 최신 코드 받기
git pull origin main

# 2. 의존성 설치
npm install

# 3. 개발 서버 시작
npm start

# 4. 백엔드 확인
cd django_backend
python manage.py runserver
```

### 2. 첫 번째 작업 시작
```bash
# 1. 새 기능 브랜치 생성
git checkout -b feature/survey-response-collection

# 2. 작업할 파일들
src/components/survey/EvaluatorSurveyPage.tsx
django_backend/apps/evaluations/views.py
django_backend/apps/evaluations/serializers.py

# 3. 테스트 실행
npm test
python manage.py test
```

### 3. 진행상황 추적
- **일일 스탠드업**: 매일 오전 진행상황 체크
- **주간 리뷰**: 매주 금요일 완료사항 정리
- **이슈 추적**: GitHub Issues로 버그 및 개선사항 관리

---

**이 계획은 현실적이고 실행 가능한 단계로 구성되었습니다. 우선순위에 따라 차례대로 진행하시기 바랍니다.**