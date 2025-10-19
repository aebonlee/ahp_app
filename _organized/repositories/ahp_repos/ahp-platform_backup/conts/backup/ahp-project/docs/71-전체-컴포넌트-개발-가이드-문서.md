# AHP Research Platform - 컴포넌트 개발 가이드
> 프로젝트 전체 컴포넌트 구조 및 개발 내역 문서

## 📋 프로젝트 개요

**프로젝트명**: AHP Research Platform  
**버전**: v2.5.0  
**최종 업데이트**: 2025-08-25  
**목적**: 의사결정 지원을 위한 계층분석법(AHP) 웹 플랫폼  
**기술스택**: React + TypeScript + Node.js + PostgreSQL  

---

## 🏗️ 시스템 아키텍처

### Frontend 기술스택
- **Framework**: React 19.1.1
- **Language**: TypeScript 4.9.5
- **Styling**: TailwindCSS 3.4.17
- **State**: Zustand 5.0.7
- **Charts**: Recharts 3.1.2
- **HTTP**: Axios 1.8.1

### Backend 기술스택
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL
- **Auth**: JWT
- **API**: RESTful

### 배포환경
- **Frontend**: GitHub Pages
- **Backend**: Render.com
- **CI/CD**: GitHub Actions

---

## 📁 컴포넌트 구조 및 설명

### 1. 관리자 컴포넌트 (`src/components/admin/`)

#### PersonalServiceDashboard.tsx
- **목적**: 개인 서비스 메인 대시보드
- **기능**: 13개 서비스 메뉴 제공, 프로젝트 생성/관리, 평가자 초대
- **주요 메서드**:
  - `handleTabChange()`: 탭 네비게이션 처리
  - `createProject()`: 새 프로젝트 생성
  - `loadProjects()`: 프로젝트 목록 로드

#### EnhancedSuperAdminDashboard.tsx
- **목적**: 슈퍼 관리자 전용 제어판
- **기능**: 사용자 관리, 시스템 설정, 구독 서비스 관리
- **권한**: super_admin 역할만 접근 가능

#### ModelBuilding.tsx
- **목적**: AHP 모델 구축 인터페이스
- **기능**: 
  - 계층 구조 생성 (최대 5단계)
  - 기준 및 하위기준 관리
  - 드래그앤드롭 인터페이스
  - 시각적 계층 표현

#### ProjectCreation.tsx
- **목적**: 프로젝트 생성 마법사
- **기능**: 
  - 4가지 템플릿 제공 (빈 프로젝트, 비즈니스, 기술, 학술)
  - 단계별 프로젝트 설정
  - 프로젝트 메타데이터 입력

#### EvaluationResults.tsx
- **목적**: 평가 결과 시각화
- **기능**:
  - 종합 순위 표시
  - 가중치 계산 결과
  - 일관성 비율(CR) 표시
  - 차트 및 그래프 생성

#### CriteriaManagement.tsx
- **목적**: 평가 기준 관리
- **기능**:
  - 기준 추가/수정/삭제
  - 계층 구조 편집
  - 가중치 설정
  - 기준 설명 관리

#### AlternativeManagement.tsx
- **목적**: 대안 옵션 관리
- **기능**:
  - 대안 추가/편집/삭제
  - 비용 정보 입력
  - 대안 설명 관리
  - 대안별 속성 설정

#### SurveyLinkManager.tsx
- **목적**: 설문 링크 생성 및 배포
- **기능**:
  - 평가자별 고유 링크 생성
  - 접근 키 관리
  - 링크 복사 및 공유
  - 만료 시간 설정

### 2. 인증 컴포넌트 (`src/components/auth/`)

#### LoginForm.tsx
- **목적**: 기본 로그인 폼
- **기능**:
  - 이메일/비밀번호 인증
  - 역할 기반 리다이렉션
  - 로그인 상태 유지
  - 오류 처리

#### SecureLoginForm.tsx
- **목적**: 보안 강화 로그인
- **기능**:
  - 2단계 인증
  - 보안 토큰 검증
  - 비정상 접근 감지

#### AccessKeyLogin.tsx
- **목적**: 평가자 접근 키 로그인
- **기능**:
  - 접근 키 기반 인증
  - 프로젝트별 접근 제어
  - 임시 세션 생성

### 3. 평가 컴포넌트 (`src/components/evaluation/`)

#### PairwiseComparison.tsx
- **목적**: 핵심 AHP 쌍대비교
- **기능**:
  - 1-9 Saaty 척도 사용
  - 실시간 일관성 검사
  - 비교 매트릭스 생성
  - 진행률 표시

#### DirectInputEvaluation.tsx
- **목적**: 직접 가중치 입력
- **기능**:
  - 수치 직접 입력
  - 정규화 자동 계산
  - 유효성 검증
  - 빠른 평가 모드

#### ConsistencyPanel.tsx
- **목적**: 일관성 검사 패널
- **기능**:
  - CR 실시간 계산
  - 일관성 경고 표시
  - 재평가 권고
  - 일관성 히스토리

#### MultiModeEvaluation.tsx
- **목적**: 하이브리드 평가 모드
- **기능**:
  - 다양한 평가 방식 선택
  - 모드 전환 기능
  - 혼합 평가 지원

### 4. 공통 컴포넌트 (`src/components/common/`)

#### Button.tsx
- **목적**: 재사용 가능한 버튼
- **Props**: 
  - `variant`: primary | secondary | danger
  - `size`: sm | md | lg
  - `disabled`: boolean
  - `onClick`: () => void

#### Card.tsx
- **목적**: 콘텐츠 컨테이너
- **Props**:
  - `title`: string
  - `className`: string
  - `children`: React.ReactNode

#### Modal.tsx
- **목적**: 모달 다이얼로그
- **Props**:
  - `isOpen`: boolean
  - `onClose`: () => void
  - `title`: string
  - `size`: sm | md | lg | xl

#### LoadingSpinner.tsx
- **목적**: 로딩 인디케이터
- **Props**:
  - `size`: small | medium | large
  - `color`: string
  - `message`: string

#### ErrorBoundary.tsx
- **목적**: 에러 처리 래퍼
- **기능**:
  - 컴포넌트 에러 캐치
  - 폴백 UI 표시
  - 에러 로깅

#### ColorThemeSelector.tsx
- **목적**: 동적 테마 선택기
- **기능**:
  - 라이트/다크 모드
  - 커스텀 컬러 팔레트
  - 테마 저장

### 5. 설문 컴포넌트 (`src/components/survey/`)

#### DemographicSurvey.tsx
- **목적**: 인구통계학적 설문조사
- **기능**:
  - Google Forms 스타일 UI
  - 7가지 질문 유형 지원
  - 조건부 질문 로직
  - 응답 검증

#### SurveyFormBuilder.tsx
- **목적**: 동적 폼 빌더
- **기능**:
  - 드래그앤드롭 질문 순서
  - 실시간 미리보기
  - 질문 유형: 텍스트, 선택, 라디오, 체크박스, 문단, 숫자, 날짜

### 6. 결과 및 분석 컴포넌트 (`src/components/results/`, `analysis/`)

#### ResultsDashboard.tsx
- **목적**: 종합 결과 대시보드
- **기능**:
  - 최종 순위 표시
  - 대안별 점수
  - 평가자별 결과
  - 통계 요약

#### AdvancedResultsAnalysis.tsx
- **목적**: 고급 통계 분석
- **기능**:
  - 민감도 분석
  - 신뢰구간 계산
  - 그룹 일치도
  - 이상치 탐지

#### SensitivityAnalysis.tsx
- **목적**: 민감도 테스트
- **기능**:
  - 가중치 변화 시뮬레이션
  - 순위 변동 분석
  - What-if 시나리오
  - 안정성 지표

### 7. 시각화 컴포넌트 (`src/components/visualization/`)

#### InteractiveCharts.tsx
- **목적**: 동적 차트 생성
- **기능**:
  - 막대/원형/라인 차트
  - 실시간 데이터 업데이트
  - 인터랙티브 툴팁
  - 차트 다운로드

#### InteractiveTreeModel.tsx
- **목적**: 계층 구조 시각화
- **기능**:
  - 트리 다이어그램
  - 확대/축소 기능
  - 노드 클릭 이벤트
  - 경로 하이라이팅

### 8. 워크샵 및 협업 컴포넌트 (`src/components/workshop/`, `collaboration/`)

#### WorkshopManagement.tsx
- **목적**: 그룹 의사결정 세션
- **기능**:
  - 참가자 관리
  - 실시간 투표
  - 결과 집계
  - 세션 기록

#### RealTimeCollaboration.tsx
- **목적**: 실시간 협업 기능
- **기능**:
  - WebSocket 연결
  - 동시 편집
  - 참가자 커서 표시
  - 채팅 기능

#### ParticipantManager.tsx
- **목적**: 워크샵 참가자 관리
- **기능**:
  - 참가자 초대
  - 권한 설정
  - 진행 상황 모니터링
  - 참여도 통계

---

## 🔧 서비스 레이어 (`src/services/`)

### apiService.ts
- **목적**: 백엔드 API 통신
- **주요 메서드**:
  - `get()`: GET 요청
  - `post()`: POST 요청
  - `put()`: PUT 요청
  - `delete()`: DELETE 요청

### ahpApiService.ts
- **목적**: AHP 특화 API 호출
- **주요 메서드**:
  - `calculateWeights()`: 가중치 계산
  - `checkConsistency()`: 일관성 검사
  - `aggregateResults()`: 결과 집계

### dataService.ts
- **목적**: 데이터 영속성 관리
- **주요 메서드**:
  - `saveProject()`: 프로젝트 저장
  - `loadProject()`: 프로젝트 로드
  - `syncData()`: 데이터 동기화

### sessionService.ts
- **목적**: 세션 관리
- **주요 메서드**:
  - `createSession()`: 세션 생성
  - `validateSession()`: 세션 검증
  - `refreshToken()`: 토큰 갱신

---

## 🛠️ 유틸리티 함수 (`src/utils/`)

### ahpCalculator.ts
- **목적**: AHP 수학적 연산
- **주요 함수**:
  - `calculateEigenvector()`: 고유벡터 계산
  - `calculateCR()`: 일관성 비율 계산
  - `normalizeWeights()`: 가중치 정규화

### consistencyHelper.ts
- **목적**: 일관성 검증 헬퍼
- **주요 함수**:
  - `getRI()`: Random Index 반환
  - `calculateCI()`: 일관성 지수 계산
  - `validateConsistency()`: 일관성 유효성 검증

### excelExporter.ts
- **목적**: Excel 보고서 생성
- **주요 함수**:
  - `exportResults()`: 결과 내보내기
  - `formatData()`: 데이터 포매팅
  - `generateReport()`: 보고서 생성

---

## 🔐 백엔드 API 구조 (`backend/src/`)

### Routes
- `/api/auth` - 인증 관련
- `/api/projects` - 프로젝트 CRUD
- `/api/criteria` - 기준 관리
- `/api/alternatives` - 대안 관리
- `/api/comparisons` - 비교 데이터
- `/api/results` - 결과 조회
- `/api/users` - 사용자 관리
- `/api/evaluators` - 평가자 관리

### 데이터베이스 스키마

#### users 테이블
```sql
- id: UUID
- email: VARCHAR(255)
- password: VARCHAR(255)
- role: ENUM('super_admin', 'admin', 'evaluator')
- created_at: TIMESTAMP
```

#### projects 테이블
```sql
- id: UUID
- name: VARCHAR(255)
- description: TEXT
- owner_id: UUID (FK -> users)
- status: ENUM('creating', 'waiting', 'evaluating', 'completed')
- created_at: TIMESTAMP
```

#### criteria 테이블
```sql
- id: UUID
- project_id: UUID (FK -> projects)
- parent_id: UUID (FK -> criteria)
- name: VARCHAR(255)
- description: TEXT
- level: INTEGER
- weight: DECIMAL
```

#### alternatives 테이블
```sql
- id: UUID
- project_id: UUID (FK -> projects)
- name: VARCHAR(255)
- description: TEXT
- cost: DECIMAL
```

#### pairwise_comparisons 테이블
```sql
- id: UUID
- project_id: UUID (FK -> projects)
- evaluator_id: UUID (FK -> users)
- criteria_id: UUID (FK -> criteria)
- item1_id: UUID
- item2_id: UUID
- value: DECIMAL
```

---

## 🎨 UI/UX 디자인 시스템

### 컬러 팔레트
- **Primary**: #FFD700 (Gold)
- **Secondary**: #4B5563 (Gray-600)
- **Background**: #111827 (Gray-900)
- **Text**: #F9FAFB (Gray-50)
- **Error**: #EF4444 (Red-500)
- **Success**: #10B981 (Green-500)

### Typography
- **Font Family**: Inter, system-ui
- **Headings**: 
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)

### 반응형 브레이크포인트
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🚀 개발 및 배포

### 개발 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트
npm run test
```

### 배포 프로세스
1. GitHub에 코드 푸시
2. GitHub Actions 자동 빌드
3. Frontend는 GitHub Pages로 배포
4. Backend는 Render.com으로 배포

### 환경 변수
```env
REACT_APP_API_URL=https://ahp-backend.onrender.com
REACT_APP_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

## 📊 성능 지표

### Frontend
- **Bundle Size**: 279.6kB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 92/100

### Backend
- **Response Time**: < 200ms (평균)
- **Database Query**: < 50ms
- **Concurrent Users**: 1000+
- **Uptime**: 99.9%

---

## 🔄 버전 히스토리

### v2.5.0 (2025-08-25)
- 설문조사 빌더 추가
- UI/UX 전면 개선
- 성능 최적화

### v2.0.0 (2025-08-20)
- 워크샵 모드 구현
- 실시간 협업 기능
- 민감도 분석 강화

### v1.5.0 (2025-08-15)
- 다국어 지원
- 모바일 반응형 개선
- 오프라인 모드 추가

### v1.0.0 (2025-08-01)
- 초기 릴리즈
- 기본 AHP 기능 구현
- 사용자 인증 시스템

---

## 📝 개발 가이드라인

### 코드 스타일
- ESLint + Prettier 사용
- TypeScript strict mode
- 함수형 컴포넌트 우선
- Custom Hooks 활용

### 커밋 메시지 규칙
- feat: 새 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포매팅
- refactor: 코드 리팩토링
- test: 테스트 추가
- chore: 기타 변경사항

### 브랜치 전략
- main: 프로덕션 브랜치
- develop: 개발 브랜치
- feature/*: 기능 개발
- hotfix/*: 긴급 수정

---

## 🤝 기여 방법

1. Fork 저장소
2. Feature 브랜치 생성
3. 변경사항 커밋
4. Pull Request 제출
5. 코드 리뷰
6. Merge

---

## 📞 연락처

- **개발자**: 이애본
- **이메일**: aebon@naver.com
- **GitHub**: https://github.com/your-repo
- **문서**: https://ahp-platform.github.io

---

## 📄 라이선스

MIT License - 자유롭게 사용 가능

---

*이 문서는 AHP Research Platform의 전체 컴포넌트 구조와 개발 내역을 정리한 공식 가이드입니다.*

*최종 업데이트: 2025년 8월 28일*