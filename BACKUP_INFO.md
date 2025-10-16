# AHP App 백업 정보 (2025-10-14)

## 📁 백업 개요
- **백업 날짜**: 2025년 10월 14일
- **백업 소스**: https://github.com/aebonlee/ahp_app
- **백업 목적**: 복구 시 참고용 완전한 백업
- **백업 위치**: `D:\ahp\ahp_app_251014\`

## 🔄 백업 내용

### 복원된 상태 (최종 안정 버전)
이 백업은 다음 모든 수정사항이 완료된 상태입니다:

1. **Header 메뉴 수정**: "가이드" → "AHP 가이드"
2. **Sidebar 메뉴 구조**: "연구 논문을 위한 AHP분석" 하위 메뉴 복원
   - 연구자 가이드
   - 평가자 가이드  
   - AHP 방법론
   - 퍼지 AHP
3. **사용자 가이드 복구**: ResearcherGuidePage 및 EvaluatorGuidePage 컴포넌트 연결
4. **Export-Reports 수정**: ExportManager 컴포넌트 올바른 연결
5. **EvaluationTest 복구**: 데이터베이스 연동된 원본 버전 복원

### 주요 컴포넌트 상태
- ✅ ComprehensiveUserGuide.tsx - 기존 컴포넌트 import하여 사용
- ✅ ExportManager.tsx - 올바른 라우팅 연결
- ✅ EvaluationTest.tsx - DB 연동 4단계 워크플로우 (select → demographic → evaluation → result)

## 🛠 복구 시 참고사항

### 1. 중요한 파일 경로
```
src/components/layout/Header.tsx:364 - "AHP 가이드" 텍스트
src/components/layout/Sidebar.tsx - 메뉴 구조
src/components/guide/ComprehensiveUserGuide.tsx - 가이드 컴포넌트 연결
src/App.tsx - ExportManager 라우팅
src/components/evaluation/EvaluationTest.tsx - DB 연동 평가 테스트
```

### 2. 핵심 수정사항
- 새로 생성하지 말고 기존 잘 개발된 컴포넌트 재사용
- DB 연동 확인 (dataService_clean 사용)
- TypeScript 인터페이스 일치성 확인

### 3. 빌드 확인사항
- npm run build 성공 (경고만 있고 오류 없음)
- GitHub Pages 배포 가능 상태

## 🔍 복구 절차 (필요시)

1. 현재 폴더 백업
2. 이 백업 폴더 내용을 대상 폴더로 복사
3. npm install (의존성 설치)
4. npm run build (빌드 테스트)
5. git 설정 확인 및 배포

## ⚠️ 주의사항
- 이 백업은 완전히 검증된 안정 버전입니다
- 복구 시 이 버전을 기준으로 해주세요
- 새로운 컴포넌트 생성보다는 기존 컴포넌트 활용을 권장합니다

---
**백업 생성자**: Claude Code Assistant  
**백업 완료 시간**: 2025-10-14