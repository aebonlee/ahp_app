# 🔧 AHP 플랫폼 페이지별 수정 가이드

## 📋 현재 페이지/컴포넌트 목록

### 🎛️ 메인 대시보드
- `PersonalServiceDashboard.tsx` - 개인 서비스 대시보드
- `HomePage.tsx` - 홈페이지
- `Sidebar.tsx` - 사이드바 네비게이션

### 🔐 인증 관련
- `LoginPage.tsx` - 로그인 페이지
- `SignupPage.tsx` - 회원가입 페이지
- `PersonalSettings.tsx` - 개인 설정

### 📊 AHP 프로젝트 관리
- `AHPProjectManager.tsx` - AHP 프로젝트 매니저
- `MyProjects.tsx` - 내 프로젝트 목록
- `ProjectCreation.tsx` - 프로젝트 생성
- `TrashBin.tsx` - 휴지통

### 👥 평가자 관리
- `EvaluatorAssignment.tsx` - 평가자 배정
- `EvaluatorWorkflow.tsx` - 평가자 워크플로우
- `EvaluatorSurveyPage.tsx` - 평가자 설문

### 📝 설문 및 논문 관리
- `SurveyManagementSystem.tsx` - 설문 관리 시스템
- `PaperManagement.tsx` - 논문 관리

### 🛠️ 지원 및 기타
- `SupportPage.tsx` - 지원 페이지
- `NewsPage.tsx` - 뉴스 페이지

## 🎯 수정 요청 처리 프로세스

### 1단계: 수정 요청 접수
```markdown
**페이지**: [정확한 컴포넌트명]
**수정 내용**: [구체적인 요구사항]
**목적**: [왜 이 수정이 필요한지]
**우선순위**: [긴급/높음/보통/낮음]
```

### 2단계: 영향도 분석
- **단일 페이지**: 해당 페이지만 수정
- **연관 페이지**: 다른 페이지와 데이터 공유
- **전역 영향**: 전체 시스템에 영향

### 3단계: 백업 및 브랜치 생성
```bash
# 현재 상태 확인
git status

# 새 기능 브랜치 생성
git checkout -b feature/[페이지명]-[수정내용]
```

### 4단계: 수정 구현
- 해당 페이지/컴포넌트만 수정
- TypeScript 타입 확인
- 기존 기능 영향 최소화

### 5단계: 테스트 및 배포
```bash
# 빌드 테스트
npm run build

# 커밋 및 푸시
git add .
git commit -m "feat(페이지명): 수정내용"
git push origin feature/브랜치명
```

## 📝 수정 요청 예시

### 예시 1: UI 개선
```
페이지: PersonalServiceDashboard
수정 내용: 프로젝트 카드 디자인 개선, 그림자 효과 추가
목적: 사용자 경험 향상
우선순위: 보통
```

### 예시 2: 기능 추가  
```
페이지: MyProjects
수정 내용: 프로젝트 필터링 기능 추가 (상태별, 날짜별)
목적: 프로젝트 관리 효율성 증대
우선순위: 높음
```

### 예시 3: 버그 수정
```
페이지: EvaluatorWorkflow  
수정 내용: 평가 진행률 계산 오류 수정
목적: 정확한 진행률 표시
우선순위: 긴급
```

## 🔍 페이지별 주요 기능

### PersonalServiceDashboard.tsx
- 프로젝트 통계 표시
- 최근 활동 내역
- 퀵 액션 버튼

### MyProjects.tsx  
- 프로젝트 목록 표시
- 프로젝트 상태 관리
- CRUD 기능

### EvaluatorWorkflow.tsx
- 평가 진행 과정
- 쌍대비교 인터페이스
- 결과 저장

### SurveyManagementSystem.tsx
- 설문 생성/편집
- 응답 수집
- 분석 결과

## ⚠️ 주의사항

1. **기존 기능 보존**: 다른 페이지에 영향 주지 않기
2. **타입 안전성**: TypeScript 오류 없이 빌드 가능
3. **일관성 유지**: 기존 디자인 패턴 준수
4. **테스트**: 수정 후 반드시 동작 확인

## 🚀 긴급 복구 가이드

문제 발생 시 백업 기점으로 복구:
```bash
git checkout v1.0.0-stable
npm run build
git push origin main --force
```

---

**이 가이드를 참조하여 구체적인 수정 요청을 해주세요!**