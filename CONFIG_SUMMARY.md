# AHP Research Platform - 설정 및 구조 정리

## 📋 프로젝트 개요
- **이름**: AHP Research Platform
- **백엔드**: Django REST Framework (https://ahp-django-backend.onrender.com)
- **프론트엔드**: React TypeScript
- **데이터베이스**: PostgreSQL (Render.com)
- **배포**: GitHub Pages (https://aebonlee.github.io/ahp_app/)

## 🔧 주요 설정

### 1. API 엔드포인트
```
BASE_URL: https://ahp-django-backend.onrender.com
주요 API:
- /api/service/projects/projects/ - 프로젝트 CRUD
- /api/auth/token/ - JWT 토큰 인증
- /api/auth/refresh/ - 토큰 갱신
- /health/ - 헬스체크
- /db-status/ - DB 상태
```

### 2. 인증 및 권한
- **방식**: JWT 토큰 기반 인증
- **저장**: sessionStorage (localStorage 완전 금지)
- **토큰 만료**: 30분
- **자동 갱신**: 만료 5분 전
- **권한 처리**: 403 오류는 경고만 표시 (일부 API는 인증 없이 작동)

### 3. 데이터 관리
- **프로젝트 상태**: draft, active, completed, deleted
- **워크플로우 단계**: creating, defining, comparing, analyzing, completed
- **기준 저장**: 메타데이터 방식 (project.settings.criteria)
- **삭제 방식**: Soft Delete (deleted_at 필드)

## 🗂️ 폴더 구조
```
src/
├── components/
│   ├── admin/          # 관리자 대시보드
│   │   ├── MyProjects.tsx
│   │   ├── PersonalServiceDashboard.tsx
│   │   └── ProjectCreation.tsx
│   ├── evaluator/      # 평가자 관련
│   ├── survey/         # 설문 관리
│   └── common/         # 공통 컴포넌트
├── services/
│   ├── api.ts          # API 통신 레이어
│   ├── dataService_clean.ts  # 데이터 서비스
│   ├── authService.ts  # 인증 서비스
│   └── sessionService.ts # 세션 관리
└── types/              # TypeScript 타입 정의
```

## ✅ 해결된 문제들

### 1. 권한 오류 (403 Forbidden)
- **문제**: CriteriaViewSet 등 일부 API에서 403 오류 발생
- **해결**: 
  - 403 오류를 경고로만 처리하고 진행
  - 메타데이터 방식으로 우회 (settings.criteria 사용)

### 2. 세션 유지 문제
- **문제**: Ctrl+Shift+R 새로고침 시 로그인 상태 손실
- **해결**: 
  - sessionStorage 사용으로 페이지 새로고침 대응
  - JWT 토큰 자동 갱신 구현

### 3. 프로젝트 액션 버튼
- **문제**: 편집, 삭제, 모델구축, 결과분석 버튼 작동 안함
- **해결**: 
  - handleDeleteProject: dataService 직접 호출
  - handleEditProject: ProjectData 타입 지원 추가
  - 올바른 탭 라우팅 설정

### 4. 워크플로우 관리
- **문제**: Django API에서 일부 workflow_stage 업데이트 제한
- **해결**: 
  - 기본 워크플로우: creating ↔ completed만 사용
  - 세부 상태: settings.workflow_progress로 관리

## ⚠️ 알려진 제약사항

### 1. API 제약
- workflow_stage 복잡한 업데이트 시 400 오류
- 휴지통 전용 API 미구현 (일반 목록과 동일)
- 복원/영구삭제 API 미구현

### 2. 기능 제한
- 그룹 AHP 미구현
- 실시간 협업 미구현
- 고급 분석 기능 일부 제한

## 🚀 빠른 시작

### 개발 환경 실행
```bash
npm install
npm start
```

### 빌드 및 배포
```bash
npm run build
git add -A
git commit -m "커밋 메시지"
git push origin main
# GitHub Actions가 자동으로 배포
```

### 테스트
```bash
# 프로젝트 CRUD 테스트
node test_project_crud_complete.js

# 세션 유지 테스트
node test_session_persistence.js

# 워크플로우 테스트
node test_workflow_simplified.js
```

## 📝 주요 컴포넌트 사용법

### MyProjects 컴포넌트
```tsx
<MyProjects
  onCreateNew={() => handleTabChange('creation')}
  onEditProject={(project) => handleEditProject(project)}
  onDeleteProject={(id) => handleDeleteProject(id)}
  onModelBuilder={(project) => handleModelBuilder(project)}
  onAnalysis={(project) => handleAnalysis(project)}
  refreshTrigger={projectRefreshTrigger}
/>
```

### PersonalServiceDashboard
- 외부 탭 전환: onTabChange prop 사용
- 내부 메뉴: activeMenu state 사용
- 프로젝트 관리: dataService 직접 호출

## 🔐 보안 정책
1. **localStorage 완전 금지** - 사용자 명시적 요구사항
2. **sessionStorage만 사용** - 탭 세션 동안만 유지
3. **JWT 토큰** - HttpOnly 쿠키 대신 헤더 방식
4. **HTTPS 전용** - 모든 API 통신 암호화

## 📅 업데이트 이력
- 2025-09-29: 권한 오류 처리 개선
- 2025-09-29: 프로젝트 액션 버튼 수정
- 2025-09-29: 세션 유지 문제 해결
- 2025-09-29: 워크플로우 시스템 구축

## 💡 추가 개선 필요 사항
1. 휴지통 전용 API 구현
2. 프로젝트 복원/영구삭제 API
3. 워크플로우 단계 제약 완화
4. 그룹 AHP 기능 구현
5. 실시간 협업 기능 추가