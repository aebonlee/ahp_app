# 📁 AHP 프로젝트 폴더 구조 정리

**정리 날짜**: 2025-10-19  
**정리 목적**: 루트 폴더 복잡도 해소 및 체계적 관리  

---

## 🎯 정리 후 폴더 구조

```
D:\ahp\
├── 📂 _organized\           # 🆕 정리된 파일들
│   ├── repositories\        # 모든 리포지토리 폴더들
│   ├── backups\            # 백업 파일들
│   ├── documentation\      # 문서들
│   ├── archives\           # 아카이브 파일들
│   ├── scripts\            # 스크립트 파일들
│   └── temp_files\         # 임시 파일들
├── 📂 ahp_app\             # 🔴 메인 프론트엔드 (유지)
├── 📂 ahp-django-service-repo\ # 🔴 메인 백엔드 (유지)
├── 📂 Dev_md\              # 🔴 개발 일지 (유지)
├── 📄 CLAUDE.md            # 🔴 마스터 가이드 (유지)
├── 📄 README.md            # 🔴 프로젝트 루트 (유지)
└── 📄 DEPLOYMENT_GUIDE.md  # 🔴 배포 가이드 (유지)
```

---

## 📦 정리 분류 기준

### 🔴 루트에 남겨둘 것들 (필수 유지)
- **ahp_app**: 메인 프론트엔드 리포지토리
- **ahp-django-service-repo**: 메인 백엔드 리포지토리  
- **Dev_md**: 개발 일지 폴더
- **CLAUDE.md**: 프로젝트 마스터 가이드
- **README.md**: 프로젝트 루트 문서
- **DEPLOYMENT_GUIDE.md**: 배포 가이드

### 📂 _organized/repositories (리포지토리들)
- **ahp-django-security-backup**: 백엔드 보안 백업
- **ahp_app_251014**: 10월 14일 프론트엔드 백업
- **ahp_repos**: 기타 리포지토리 백업들

### 📂 _organized/backups (백업들)
- **_backups**: 기존 백업 폴더
- **_archive**: 아카이브 파일들

### 📂 _organized/documentation (문서들)
- **_documentation**: 기존 문서 폴더
- **DevDocs**: 개발 문서들

### 📂 _organized/archives (아카이브들)
- **_cleanup**: 정리용 파일들
- 각종 임시 아카이브 폴더들

### 📂 _organized/scripts (스크립트들)
- **cleanup_github.py**: GitHub 정리 스크립트
- **github_cleanup_status.md**: 정리 상태 문서
- 기타 스크립트 파일들

### 📂 _organized/temp_files (임시 파일들)
- 각종 임시 파일들
- 테스트 파일들
- 임시 설정 파일들

---

## ✅ 정리 후 효과

1. **루트 폴더 간소화**: 복잡한 폴더들을 체계적으로 분류
2. **접근성 향상**: 필요한 파일들을 쉽게 찾을 수 있음
3. **관리 효율성**: 백업, 문서, 스크립트 등이 분류되어 관리 용이
4. **협업 개선**: 새로운 개발자가 프로젝트 구조를 쉽게 이해
5. **버전 관리**: Git에서 필요한 파일들만 추적 가능

---

## 🚀 다음 단계

1. ✅ 폴더 구조 설계 완료
2. 🔄 파일 이동 및 분류 진행 중
3. 📝 README 업데이트 예정
4. 🧹 불필요한 중복 파일 정리 예정

**이 정리를 통해 AHP 프로젝트의 관리 효율성이 크게 향상될 것입니다.**