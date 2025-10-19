# AHP Platform Backup Repository

이 리포지토리는 [ahp-platform](https://github.com/aebonlee/ahp-platform) 메인 리포지토리에서 이동된 백업 파일들과 문서들을 보관합니다.

## 이동된 파일들

### 📁 백업 폴더
- `conts/` - 프로젝트 체크포인트 및 백업 파일들
- `backup/` - 완전한 프로젝트 백업 아카이브
- `design/` - 디자인 시스템 문서 및 가이드

### 📁 문서 폴더
- `docs_03/` - 최신 개발 문서 및 보고서들

### ⚙️ 환경 설정 파일들
- `.env*` - 다양한 환경별 설정 파일들
- `.deployment-trigger` - 배포 트리거 파일
- `.nojekyll` - GitHub Pages 설정
- `nginx.conf` - 웹서버 설정

### 🗂️ 기타 백업 파일들
- `404.html` - 커스텀 404 페이지
- `BACKUP_SYSTEM.md` - 백업 시스템 문서
- `CHANGELOG.md` - 변경 이력
- `*_backup.tsx` - React 컴포넌트 백업 파일들
- `*.bak` - 기타 백업 파일들

## 이동 날짜
2025년 9월 3일

## 이동 이유
메인 리포지토리의 정리 및 프로덕션 배포 최적화를 위해 불필요한 백업 파일들과 문서들을 분리하여 보관합니다.

## 복원 방법
필요시 이 백업 리포지토리에서 파일들을 메인 리포지토리로 다시 복사할 수 있습니다.

```bash
# 특정 파일 복원 예시
cp ahp-platform_backup/conts/README.md ahp-platform/
```

## 주요 백업 내용
- 프로젝트 개발 히스토리 및 문서
- 컴포넌트 백업 파일들
- 배포 설정 파일들
- 디자인 시스템 문서
- 체크포인트 백업들

---
*이 백업은 프로젝트의 완전한 개발 히스토리를 보존하기 위해 생성되었습니다.*