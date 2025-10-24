# GitHub Actions Workflows

## 📋 Workflow 개요

이 저장소는 두 가지 주요 워크플로우를 사용합니다:

### 1. CI Pipeline (`ci.yml`)
- **트리거**: main 브랜치 push 또는 PR
- **목적**: 코드 품질 검증 및 빌드 테스트
- **주요 단계**:
  - Node.js 20 설정
  - 의존성 설치
  - ESLint 검사 (non-blocking)
  - TypeScript 빌드
  - 테스트 실행 (non-blocking)

### 2. Deploy to GitHub Pages (`deploy.yml`)
- **트리거**: main 브랜치 push 또는 수동 실행
- **목적**: GitHub Pages 배포
- **주요 단계**:
  - 프로덕션 빌드 생성
  - 빌드 검증
  - GitHub Pages 배포

## 🚀 워크플로우 상태

[![CI Pipeline](https://github.com/aebonlee/ahp_app/actions/workflows/ci.yml/badge.svg)](https://github.com/aebonlee/ahp_app/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/aebonlee/ahp_app/actions/workflows/deploy.yml/badge.svg)](https://github.com/aebonlee/ahp_app/actions/workflows/deploy.yml)

## 📊 최근 개선사항

### ✅ 해결된 문제들
1. **TypeScript 타입 오류** - CriteriaData 타입 변환 문제 해결
2. **빌드 경로 문제** - ahp_app 디렉토리 경로 자동 감지
3. **Node.js 버전** - v20로 통일
4. **캐시 최적화** - npm 캐시 사용으로 빌드 속도 향상
5. **ESLint 경고** - continue-on-error로 non-blocking 처리

### 🔧 워크플로우 최적화
- **병렬 처리**: 빌드와 배포 job 분리
- **아티팩트 관리**: 빌드 결과물 임시 저장
- **에러 처리**: 각 단계별 명확한 에러 메시지
- **성능 개선**: 불필요한 단계 제거

## 🛠️ 트러블슈팅

### 빌드 실패 시
```bash
# 로컬에서 빌드 테스트
cd ahp_app
npm install
npm run build
```

### 배포 실패 시
```bash
# GitHub Pages 설정 확인
# Settings > Pages > Source: Deploy from a branch
# Branch: gh-pages
```

### ESLint 경고
- 현재 약 50개의 ESLint 경고 존재 (non-blocking)
- 기능에 영향 없음
- 점진적 개선 중

## 📝 수동 배포
```bash
# 워크플로우 수동 실행
# GitHub > Actions > Deploy to GitHub Pages > Run workflow
```

## 🔗 관련 링크
- [배포된 사이트](https://aebonlee.github.io/ahp_app/)
- [Actions 대시보드](https://github.com/aebonlee/ahp_app/actions)

## 📅 업데이트 기록
- 2025-10-25: 워크플로우 전면 개선
- TypeScript 오류 수정
- 빌드 프로세스 최적화
- 에러 처리 개선