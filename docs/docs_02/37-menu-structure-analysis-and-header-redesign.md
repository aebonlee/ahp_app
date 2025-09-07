# 메뉴 구조 분석 및 헤더 재설계 계획

## 작업 일시
- 2025년 1월 1일

## 현재 메뉴 구조 분석

### 1. PersonalService (개인 서비스) 메뉴 - 15개 항목
```
📊 연구/개인 서비스 메뉴 구조
├── 🏠 내 대시보드 (personal-service)
├── 📚 사용자 가이드 (user-guide)
├── 📊 인구통계학적 설문조사 (demographic-survey)
├── 📂 내 프로젝트 (my-projects)
├── ➕ 새 프로젝트 (project-creation)
├── 🏗️ 모델 구축 (model-builder)
├── 🧪 평가 테스트 (evaluation-test)
├── 👥 평가자 관리 (evaluator-management)
├── 📈 진행률 모니터링 (progress-monitoring)
├── 📊 결과 분석 (results-analysis)
├── 📝 논문 작성 관리 (paper-management)
├── 📤 보고서 내보내기 (export-reports)
├── 🎯 워크숍 관리 (workshop-management)
├── 🧠 의사결정 지원 (decision-support-system)
└── ⚙️ 개인 설정 (personal-settings)
```

### 2. 페이지 연계성 매핑

#### A. 프로젝트 생성 및 관리 플로우
```
내 프로젝트 (my-projects)
    ↓
새 프로젝트 (project-creation)
    ↓
모델 구축 (model-builder)
    ├── CriteriaManagement (기준 관리)
    ├── AlternativeManagement (대안 관리)
    └── TreeModelConfiguration (계층 구조)
    ↓
평가자 관리 (evaluator-management)
    ├── EvaluatorAssignment (평가자 할당)
    └── SurveyLinkManager (설문 링크)
    ↓
진행률 모니터링 (progress-monitoring)
    ↓
결과 분석 (results-analysis)
    ├── SensitivityAnalysis (민감도 분석)
    └── GroupWeightAnalysis (그룹 가중치)
```

#### B. 평가 플로우
```
평가 테스트 (evaluation-test)
    ├── PairwiseComparison (쌍대비교)
    └── DirectInputEvaluation (직접입력)
```

#### C. 출력 및 보고서 플로우
```
결과 분석 (results-analysis)
    ↓
보고서 내보내기 (export-reports)
    ↓
논문 작성 관리 (paper-management)
```

#### D. 워크숍 및 의사결정
```
워크숍 관리 (workshop-management)
    ↓
의사결정 지원 (decision-support-system)
```

### 3. 컴포넌트 의존성

| 페이지 | 주요 컴포넌트 | 연계 컴포넌트 |
|--------|--------------|--------------|
| my-projects | MyProjects.tsx | ProjectCreationForm, TrashBin |
| project-creation | ProjectCreationForm.tsx | ModelBuilding |
| model-builder | ModelBuilding.tsx | CriteriaManagement, AlternativeManagement, TreeModelConfiguration |
| evaluator-management | EnhancedEvaluatorManagement.tsx | EvaluatorAssignment, SurveyLinkManager |
| results-analysis | ResultsAnalysis.tsx | SensitivityAnalysis, GroupWeightAnalysis |
| paper-management | PaperManagement.tsx | ExportManager |
| workshop-management | WorkshopManagement.tsx | DecisionSupportSystem |

## 헤더 재설계 계획

### 1. 로고 영역 수정
- 파비콘(SVG 아이콘) 제거
- 왼쪽 마진 50px → 20px로 변경
- 텍스트만 표시

### 2. 메뉴 양분 배열
```
[왼쪽 그룹] - 핵심 기능
- 내 대시보드
- 내 프로젝트
- 새 프로젝트
- 모델 구축

[오른쪽 그룹] - 부가 기능
- 사용자 가이드
- 결과 분석
- 설정
- 세션/로그아웃
```

### 3. 수정 범위

#### 직접 수정 파일
1. **src/components/layout/Header.tsx**
   - 로고 영역 재구성
   - 메뉴 재배열
   - 세션 UI 위치 조정

2. **src/components/layout/Layout.tsx**
   - 헤더 props 전달 확인

#### 영향받는 파일 (간접)
1. **src/App.tsx**
   - activeTab 상태 관리
   - onTabChange 핸들러

2. **src/components/admin/PersonalServiceDashboard.tsx**
   - 탭 전환 로직
   - 메뉴 상태 관리

3. **src/components/layout/Sidebar.tsx**
   - 사이드바 메뉴와 동기화 필요

### 4. CSS 변수 영향
```css
--header-height: 64px (변경 없음)
--sidebar-width: 280px (변경 없음)
--bg-secondary: 헤더 배경색
--border-light: 경계선 색상
--text-primary: 텍스트 색상
```

## 구현 우선순위

### Phase 1: 헤더 로고 수정
- [ ] 파비콘 제거
- [ ] 마진 조정 (20px)
- [ ] 텍스트 전용 로고

### Phase 2: 메뉴 재배열
- [ ] 좌측 그룹 구현
- [ ] 우측 그룹 구현
- [ ] 반응형 디자인

### Phase 3: 페이지별 수정
- [ ] my-projects 페이지 최적화
- [ ] project-creation 폼 개선
- [ ] model-builder 단계별 프로세스
- [ ] results-analysis 시각화 개선

### Phase 4: 연계 기능 테스트
- [ ] 프로젝트 생성 플로우
- [ ] 평가 플로우
- [ ] 보고서 생성 플로우

## 주의사항

1. **상태 관리**
   - activeTab 상태가 여러 컴포넌트에서 사용됨
   - 탭 변경 시 사이드바와 동기화 필요

2. **라우팅**
   - 로그인/비로그인 상태 구분
   - 권한별 메뉴 표시

3. **세션 관리**
   - 세션 UI는 항상 우측 상단 유지
   - 로그아웃 버튼과 함께 배치

4. **반응형**
   - 모바일에서 햄버거 메뉴로 전환
   - 태블릿에서 축약형 메뉴