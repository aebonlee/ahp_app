# GitHub Pages 배포 설정 가이드

## 🔧 GitHub 설정 변경 필요

### 1. GitHub 저장소 Settings로 이동
- https://github.com/aebonlee/ahp_app/settings/pages

### 2. Source 설정 변경
- **Source**: `Deploy from a branch` 선택
- **Branch**: `gh-pages` 선택 (없으면 첫 배포 후 생성됨)
- **Folder**: `/ (root)` 선택

### 3. 저장
- Save 버튼 클릭

## 📝 변경 사항

### 이전 방식 (복잡함)
- GitHub Actions 워크플로우 사용
- actions/deploy-pages@v4 액션 사용
- 복잡한 concurrency 설정
- 배포 충돌 문제 발생

### 새로운 방식 (단순함)
- peaceiris/actions-gh-pages@v3 사용
- gh-pages 브랜치에 직접 푸시
- force_orphan으로 충돌 방지
- 단일 작업으로 빌드와 배포 통합

## 🚀 장점
- ✅ 배포 충돌 없음
- ✅ 더 빠른 배포
- ✅ 간단한 디버깅
- ✅ 안정적인 배포

## 🔍 배포 확인
1. Actions 탭에서 "Simple Deploy" 워크플로우 확인
2. gh-pages 브랜치 생성 확인
3. https://aebonlee.github.io/ahp_app 에서 배포 확인

## ⚠️ 주의사항
- 첫 배포 시 gh-pages 브랜치가 자동 생성됩니다
- Settings > Pages에서 Source를 gh-pages로 변경해야 합니다
- 변경 후 몇 분 정도 기다려야 반영됩니다