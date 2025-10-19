# 📂 conts 폴더 - 컨텐츠 아카이브

이 폴더는 메인 프로젝트 트리에서 분리된 파일들을 보관하는 공간입니다.

## 📁 폴더 구조

### 백업 및 아카이브
- **backup/**: 2025-08-30 전체 시스템 백업
- **ahp-project/**: 이전 프로젝트 버전 아카이브
- **documentation/**: Git 히스토리 및 개발 상태 문서
- **source-archives/**: 소스코드 압축 아카이브
- **stable-versions/**: 안정 버전 백업
- **v2.3.2-complete-20250901/**: 특정 버전 완전 백업

### 개발 히스토리
- **docs/**: 118개 개발 보고서 (00-118번)
- **build/**: 빌드 결과물 보관
- **static/**: 정적 파일 캐시

### 배포 및 스크립트
- **deploy-manual.bat/sh**: 수동 배포 스크립트
- **docker-compose.yml**: Docker 컨테이너 설정
- **render*.yaml**: Render 배포 설정 파일들
- **scaling.yaml**: 스케일링 설정

### 백업된 컴포넌트
- **PersonalServiceDashboard_original.tsx**: 원본 대시보드
- **PersonalServiceDashboard_v2.7.0_stable_backup.tsx**: 안정 버전
- **PersonalServiceDashboard_v2.7.x_stable_backup.tsx**: 레거시 버전

### 임시 파일들
- **cleanup-phantom-projects.js**: 프로젝트 정리 스크립트
- **direct-cleanup.js**: 직접 정리 스크립트
- **reset-project-104.js**: 특정 프로젝트 리셋
- **sample-data.sql**: 샘플 데이터 SQL

### 시스템 파일들
- **server-integrated.js**: 통합 서버 스크립트
- **server.js**: 기본 서버 설정
- **cache-bypass.html**: 캐시 우회 페이지
- **asset-manifest.json**: 에셋 매니페스트

## 🗂️ 문서 보관 목록

### 개발 단계별 보고서 (docs/)
1. **00-09**: 전체 개발 개요 및 초기 분석
2. **10-29**: AHP 시스템 핵심 구현
3. **30-49**: UI/UX 개선 및 브랜딩
4. **50-69**: 테마 시스템 및 디자인
5. **70-99**: 고급 기능 및 최적화
6. **100-118**: 최종 완성 및 특수 기능

### 주요 히스토리 문서
- **CHECKPOINT_2025_09_01.md**: 9월 1일 체크포인트
- **DEVELOPMENT_LOG.md**: 전체 개발 로그
- **ENHANCEMENT_PLAN.md**: 개선 계획서
- **INSPECTION_REPORT_2025-08-30.md**: 8월 30일 점검 보고서
- **RESTORE_POINTS.md**: 복구 지점들

## 🔧 사용 가이드

### 백업 파일 복구시
```bash
# 특정 컴포넌트 복구
cp conts/PersonalServiceDashboard_v2.7.0_stable_backup.tsx src/components/admin/PersonalServiceDashboard.tsx

# 전체 프로젝트 복구 (주의!)
tar -xzf conts/backup/ahp-platform-v2.2.0-20250830-0127.tar.gz
```

### 개발 히스토리 참조시
- 특정 기능의 개발 과정은 docs/ 폴더의 번호순 보고서 참조
- 각 보고서는 개발 날짜, 변경사항, 결과가 상세히 기록됨

### 배포 설정 재사용시
```bash
# Render 배포 설정 복구
cp conts/render.yaml ./
cp conts/render-simplified.yaml ./

# Docker 설정 복구  
cp conts/docker-compose.yml ./
```

## ⚠️ 주의사항

1. **메인 프로젝트에 직접 영향 없음**: conts 폴더 내용은 현재 서비스에 영향을 주지 않음
2. **용량 주의**: 전체 백업 파일들이 포함되어 있어 용량이 큼
3. **버전 호환성**: 복구시 현재 버전과의 호환성 확인 필요
4. **Git 이력**: 이 폴더의 변경은 별도 관리 권장

## 📊 통계

- **총 문서**: 150+ 개
- **백업 파일**: 3개 주요 버전
- **스크립트**: 12개 
- **설정 파일**: 8개
- **아카이브**: 5개 폴더

---

**생성일**: 2025-09-02  
**목적**: 메인 트리 정리 및 히스토리 보존  
**관리자**: AHP Platform Team