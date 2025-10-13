# AHP Platform 저장소 관리 가이드

## 저장소 구조

### 1. 서비스용 저장소 (`ahp-platform`)
- **목적**: Production 배포용 깔끔한 코드베이스
- **포함 파일**: 핵심 소스코드, README, package.json, 설정 파일들
- **제외 파일**: 개발 로그, 백업 파일, 디자인 문서, 임시 파일

### 2. 백업용 저장소 (`ahp-platform_backup`)
- **목적**: 모든 개발 자료 보관 및 히스토리 관리
- **폴더 구조**:
  - `backup_files/`: 백업된 소스코드 및 임시 파일들
  - `design_backup/`: 디자인 시스템 문서들
  - `docs_05/`: 개발 문서 및 로그 (54번~70번 + DEVELOPMENT_LOG)
  - `tailwind.config.js`: 설정 백업

## 로컬 스토리지 최적화 전략

### 원칙
1. **GitHub First**: 모든 파일은 GitHub에 우선 저장
2. **로컬 최소화**: 현재 작업 중인 파일들만 로컬에 유지
3. **즉시 푸시**: 작업 완료 즉시 GitHub에 푸시
4. **정기 정리**: 주기적으로 로컬 저장소 정리

### 권장 워크플로우
1. 필요시에만 `git pull` 로 최신 상태 가져오기
2. 작업 완료 후 즉시 `git push`
3. 로컬 브랜치 정리: `git branch -d branch_name`
4. 불필요한 파일 정리: `git clean -fd`

## 파일 분류 기준

### 서비스용 저장소 포함
- `/src/` - 메인 소스코드
- `/backend/` - 백엔드 소스코드  
- `/public/` - 정적 파일
- `package.json`, `tsconfig.json` - 설정 파일
- `README.md` - 프로젝트 설명

### 백업용 저장소 포함  
- 모든 `.bak`, `_backup` 파일들
- 개발 문서 및 로그
- 디자인 시스템 문서
- 임시 파일 및 실험적 코드
- 설정 백업 파일들

---
최종 업데이트: 2025-09-04
관리자: aebonlee