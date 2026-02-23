# 라우팅/대시보드/프로젝트 생성 수정 계획

## 근본 원인 분석

### 문제 1: useNavigation의 탭 복원 useEffect 충돌
`useNavigation.ts` 라인 220-239에서 `user` 변경 시 무조건 탭을 초기화:
- super_admin → `super-admin`
- evaluator → `evaluator-dashboard`
- 그 외 → `personal-service`

**이 effect가 사용자가 다른 탭으로 이동해도 되돌려버림** (selectedProjectId가 deps에 있어서 프로젝트 선택할 때마다 리셋)

### 문제 2: 리디렉션 루프
- AppContent 라인 250-267: `home`/`register`/`welcome` → `personal-service` 리디렉트 (setState during render)
- PSD 라인 315-320: super_admin + super_mode → `super-admin-dashboard` 리디렉트 (useEffect 내)
- PSD 라인 2952-2957: renderMenuContent에서 또 리디렉트 (render 중)
- 3곳에서 중복 리디렉트 → 충돌 가능

### 문제 3: 관리자/연구자 대시보드 혼동
- `personal-service` 탭이 PSD를 렌더링하는데, PSD 내부에서:
  - `service_user` → PersonalUserDashboard (연구자 대시보드)
  - `service_admin`/`super_admin` → renderOverview() (관리자 대시보드)
- 하지만 사이드바의 "시스템 대시보드" 클릭은 `super-admin-dashboard`로 가야 하는데 `dashboard`로 보내서 RoleBasedDashboard 경유
- super_admin이 일반모드에서도 PSD의 renderOverview()를 보게 됨 (연구자용이 아님)

### 문제 4: 프로젝트 생성 탭이 VALID_TABS에는 있으나 탭 복원 effect가 덮어씀

## 수정 계획

### Step 1: useNavigation.ts - 탭 복원 로직 정리
- 라인 220-239의 "사용자 상태에 따른 탭 복원" effect에서 selectedProjectId를 deps에서 제거
- 이미 URL에 유효한 tab이 있으면 그것을 유지 (현재는 URL 확인 후에도 role 기반 초기화 실행)
- URL 복원 effect(라인 242-257)와 중복 제거

### Step 2: AppContent.tsx - 리디렉션 정리
- `home`/`register`/`welcome` case에서 render 중 setState 제거 → useEffect로 이동
- admin 판별 로직을 Context에서 직접 가져오게 개선 (localStorage 직접 접근 제거)
- 관리자가 연구자 대시보드에 직접 접근하도록 `personal-service`는 항상 PSD → 연구자 뷰
- super-admin 전용 뷰는 `super-admin-dashboard`만 사용

### Step 3: PSD 리디렉트 제거
- PSD 라인 300-321의 super_admin 리디렉트 useEffect 제거
- PSD 라인 2952-2957의 renderMenuContent 내 리디렉트 제거
- PSD는 항상 연구자 대시보드로 동작 (관리자도 "연구자 모드"로 사용 가능)

### Step 4: Sidebar 대시보드 클릭 정리
- super_admin + 시스템 관리 모드: `super-admin-dashboard` 유지
- super_admin + 연구 플랫폼 모드: `personal-service` (연구자 대시보드)
- service_admin/service_user: `personal-service`
- evaluator: `evaluator-dashboard`

### Step 5: VALID_TABS 확장
- `project-wizard`, `demographic-setup`, `evaluator-invitation` 등 누락된 탭 추가
- `super-admin-dashboard`, `super-admin` 탭 추가
