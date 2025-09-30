# 📁 AHP 플랫폼 정리된 폴더 구조

## 🎯 메인 작업 디렉토리

```
D:\ahp\                           # 🔹 메인 프로젝트 루트
├── 📂 src/                       # React 프론트엔드 소스
├── 📂 public/                    # React public 파일들
├── 📂 django_backend/            # Django 백엔드 소스
├── 📂 _documentation/            # 📚 모든 문서들
├── 📂 _backups/                  # 💾 백업 파일들
├── 📂 _archive/                  # 🗃️ 아카이브
├── 📂 node_modules/              # Node.js 의존성
├── package.json                  # React 패키지 설정
├── tsconfig.json                 # TypeScript 설정
└── tailwind.config.js            # Tailwind CSS 설정
```

## 🔹 주요 디렉토리 상세

### 1. **프론트엔드** (`D:\ahp\`)
- **Repository**: https://github.com/aebonlee/ahp_app
- **배포**: https://aebonlee.github.io/ahp_app/
- **메인 파일**: `src/App.tsx`, `package.json`

### 2. **백엔드** (`D:\ahp\django_backend\`)
- **Repository**: https://github.com/aebonlee/ahp-django-service
- **배포**: https://ahp-django-backend.onrender.com
- **메인 파일**: `manage.py`, `ahp_backend/settings.py`

### 3. **문서** (`D:\ahp\_documentation\`)
- **BACKUP_STATUS_v1.0.0.md** - 백업 상태 기록
- **MODIFICATION_GUIDE.md** - 수정 가이드
- **CLAUDE.md** - 프로젝트 관리 규칙
- **docs/** - 개발 문서들
- **docs_09/** - 최신 개발 일지

## 🚀 작업 워크플로우

### 프론트엔드 작업
```bash
cd D:\ahp
npm start                    # 개발 서버 실행
npm run build               # 프로덕션 빌드
git add . && git commit     # 변경사항 커밋
git push origin main        # GitHub Pages 배포
```

### 백엔드 작업
```bash
cd D:\ahp\django_backend
python manage.py runserver  # 로컬 테스트
git add . && git commit     # 변경사항 커밋
git push origin main        # Render 자동 배포
```

## 🧹 제거된 불필요한 폴더들

- ❌ `ahp_django_service_updated/` (중복)
- ❌ `ahp_frontend_public/` (빌드 결과물)
- ❌ `build/` (빌드 결과물)
- ❌ `static/` (빌드 결과물)
- ❌ `conts/` (임시 파일들)

## 📝 중요한 파일들

### 루트 레벨
- **package.json** - React 의존성 및 스크립트
- **tsconfig.json** - TypeScript 설정
- **tailwind.config.js** - CSS 프레임워크 설정

### 프론트엔드 핵심
- **src/App.tsx** - 메인 React 앱
- **src/services/authService.ts** - 인증 서비스
- **src/config/api.ts** - API 설정

### 백엔드 핵심
- **django_backend/manage.py** - Django 관리 스크립트
- **django_backend/ahp_backend/settings.py** - Django 설정
- **django_backend/render-build.sh** - 배포 스크립트

## 🔄 백업 복구 방법

```bash
# v1.0.0-stable 태그로 복구 (프론트엔드)
cd D:\ahp
git checkout v1.0.0-stable

# v1.0.0-stable 태그로 복구 (백엔드)
cd D:\ahp\django_backend
git checkout v1.0.0-stable
```

---

**정리 완료일**: 2025-09-29  
**정리 담당**: Claude Code Assistant  
**다음 작업**: 페이지별 수정 요청 처리