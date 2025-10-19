# 🎯 AHP 플랫폼 최종 정리된 구조

## 📁 최종 폴더 구조 (2025-09-29)

```
D:\ahp\                           # 🔹 메인 프로젝트 루트
├── 📂 src/                       # React 프론트엔드 소스코드
│   ├── components/               # React 컴포넌트들
│   ├── services/                 # API 서비스 레이어
│   ├── config/                   # 설정 파일들
│   ├── utils/                    # 유틸리티 함수들
│   └── styles/                   # CSS 스타일 파일들
│
├── 📂 public/                    # React public 리소스
│   ├── index.html               # 메인 HTML 템플릿
│   ├── favicon.ico              # 파비콘
│   └── manifest.json            # PWA 매니페스트
│
├── 📂 django_backend/            # Django 백엔드 소스코드
│   ├── ahp_backend/             # Django 프로젝트 설정
│   ├── apps/                    # Django 앱들
│   │   ├── accounts/            # 사용자 인증
│   │   ├── projects/            # 프로젝트 관리
│   │   ├── analysis/            # AHP 분석
│   │   ├── evaluations/         # 평가 시스템
│   │   └── common/              # 공통 기능
│   ├── manage.py                # Django 관리 스크립트
│   ├── requirements.txt         # Python 패키지 목록
│   └── render-build.sh          # 배포 스크립트
│
├── 📂 _documentation/            # 📚 모든 프로젝트 문서
│   ├── development_logs/        # 개발 일지들 (날짜별 정리)
│   │   └── 2025-09/            # 2025년 9월 개발 로그
│   ├── docs/                   # 기술 문서들
│   ├── docs_09/                # 최신 문서들
│   ├── BACKUP_STATUS_v1.0.0.md # 백업 상태 기록
│   ├── MODIFICATION_GUIDE.md    # 수정 가이드
│   └── CLAUDE.md               # 프로젝트 관리 규칙
│
├── 📂 _archive/                  # 🗃️ 아카이브 및 백업
│   ├── temp_files/             # 임시 파일들
│   ├── test_files/             # 테스트 파일들
│   ├── component_backups/      # 컴포넌트 백업들
│   └── _archive/               # 기타 아카이브
│
├── 📂 _backups/                  # 💾 시스템 백업
│   └── _archive/               # 백업 아카이브
│
├── 📂 node_modules/              # Node.js 의존성 (자동 생성)
│
├── 📄 package.json               # React 프로젝트 설정
├── 📄 package-lock.json          # 패키지 버전 잠금
├── 📄 tsconfig.json              # TypeScript 설정
├── 📄 tailwind.config.js         # Tailwind CSS 설정
├── 📄 postcss.config.js          # PostCSS 설정
├── 📄 FOLDER_STRUCTURE.md        # 폴더 구조 가이드 (이전 버전)
└── 📄 CLEAN_STRUCTURE_FINAL.md   # 최종 정리된 구조 가이드
```

## 🗂️ 정리된 파일들

### ✅ 아카이브된 임시 파일들
- **_archive/temp_files/**: `404.html`, `cache-bypass.html`, `nocache.html`, `copy-build.js`, `URGENT_DB_RESET.sql`, `VERSION-2.1.1.txt`, `asset-manifest.json`, `render.yaml`
- **_archive/test_files/**: `test_db_connection.js`, `test_project_creation.html`
- **_archive/component_backups/**: `SuperAdminDashboard*.bak`, `HomePage_backup.tsx`

### ✅ 체계화된 개발 문서
- **_documentation/development_logs/2025-09/**: 모든 개발일지 날짜별 정리
  - `개발일지_2025-09-20_로컬스토리지제거_및_평가자추가기능완전수정.md`
  - `개발일지_2025-09-28_CSS_컴파일_및_시스템_구축.md`
  - `개발일지_2025-09-28_전체_프로젝트_진행상황_점검.md`
  - `development_log_20250928_service_menu_redesign.md`
  - `development_log_3차개발.md`
  - `네트워크_에러_분석_및_API_통합_개발일지_2025-09-21.md`

### ✅ 백엔드 정리
- **django_backend/_archive/**: `BUILD_VERSION.txt`, `DEPLOY_NOW.txt`, `FORCE_DEPLOY_*.py`, `VERSION.txt`

## 🎯 Repository 연결

### 프론트엔드 (D:\ahp\)
- **Repository**: https://github.com/aebonlee/ahp_app
- **배포**: https://aebonlee.github.io/ahp_app/
- **백업 태그**: v1.0.0-stable

### 백엔드 (D:\ahp\django_backend\)
- **Repository**: https://github.com/aebonlee/ahp-django-service
- **배포**: https://ahp-django-backend.onrender.com
- **백업 태그**: v1.0.0-stable

## 🚀 작업 워크플로우

### 프론트엔드 개발
```bash
cd D:\ahp
npm start                    # 개발 서버 실행
npm run build               # 프로덕션 빌드
npm test                    # 테스트 실행
```

### 백엔드 개발
```bash
cd D:\ahp\django_backend
python manage.py runserver  # 로컬 개발 서버
python manage.py migrate    # 데이터베이스 마이그레이션
python manage.py test       # 테스트 실행
```

### Git 관리
```bash
# 프론트엔드
cd D:\ahp
git add . && git commit -m "feat: 기능 추가"
git push origin main

# 백엔드
cd D:\ahp\django_backend
git add . && git commit -m "feat: API 개선"
git push origin main
```

## 📝 페이지별 수정 요청 방법

**요청 형식:**
```
페이지: [컴포넌트 경로] (예: src/components/admin/PersonalServiceDashboard.tsx)
수정 내용: [구체적인 변경사항]
목적: [왜 필요한지]
우선순위: [긴급/높음/보통/낮음]
```

## 🔄 백업 복구 방법

```bash
# 안전한 백업 기점으로 복구
cd D:\ahp
git checkout v1.0.0-stable

cd D:\ahp\django_backend
git checkout v1.0.0-stable
```

## 📋 중요 설정 파일들

### 프론트엔드 핵심 설정
- **package.json**: React 의존성 및 스크립트
- **src/config/api.ts**: API 기본 설정
- **src/services/authService.ts**: 인증 서비스

### 백엔드 핵심 설정
- **django_backend/ahp_backend/settings.py**: Django 메인 설정
- **django_backend/requirements.txt**: Python 패키지 목록
- **django_backend/render-build.sh**: Render 배포 스크립트

---

**최종 정리 완료일**: 2025-09-29  
**정리 담당**: Claude Code Assistant  
**상태**: ✅ 완전 정리 완료, 수정 요청 대기 중