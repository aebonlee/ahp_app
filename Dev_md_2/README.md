# 📁 개발 문서 및 리소스 백업 저장소

## 폴더 구조 (2024-11-12 정리 완료)

```
Dev_md_2/
├── README.md               # 현재 파일
├── 개발현황_20241111.md   # 전체 개발 현황 보고서
│
├── 개발계획/              # 개발 일정 및 TODO
│   └── todolist_251111.md # MVP 3주 개발 계획
│
├── 개발문서/              # 프로젝트 개발 문서 (백업)
│   ├── CODE_QUALITY_PLAN.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── LOCAL_DEV_GUIDE.md
│   ├── eslint-analysis.md
│   ├── eslint-report.txt
│   ├── quality-improvement-progress.md
│   ├── repository-cleanup-summary.md
│   ├── 세션_요약_20251019.md
│   └── 워크플로우_점검_보고서_20251019.md
│
├── 백엔드정보/            # 백엔드 서버 정보
│   └── 백엔드_서비스_정보.md
│
├── 백업파일/              # 백업 문서
│   ├── CLAUDE_backup_20241111.md
│   ├── README_backup_20241111.md
│   └── VERSION-2.1.1.txt
│
├── 빌드관련/              # 빌드 설정 백업
│   ├── .lighthouserc.json
│   ├── asset-manifest.json
│   └── cache-bypass.html
│
├── 테스트도구/            # HTML 테스트 도구
│   ├── clear_all_criteria.html
│   ├── test_api_connection.html
│   ├── test_backend_connection.html
│   ├── test_backend_status.html
│   ├── test_criteria_save.html
│   └── [기타 테스트 HTML 파일들]
│
├── 테스트스크립트/        # JS/Python 테스트 스크립트 (백업)
│   ├── test_db_connection.py
│   ├── test-db-connection.js
│   ├── test-parser.js
│   ├── test-postgresql-direct.js
│   ├── test-render-backend.js
│   └── super_admin_fix.js
│
└── 프로젝트문서/          # 핵심 프로젝트 문서
    └── CLAUDE.md          # Claude AI 협업 가이드
```

## 📝 중요 사항

### 백업 정책
- **루트 파일은 유지**: 실제 서비스 운영에 필요한 파일들은 루트에 그대로 유지
- **Dev_md_2는 백업 용도**: 문서와 스크립트의 백업 복사본을 Dev_md_2에 보관
- **중복 보관**: 안전을 위해 중요 파일들은 루트와 Dev_md_2 양쪽에 보관

### 루트 디렉토리 파일 현황
```
ahp_app_clone/             # 프로젝트 루트
├── 필수 설정 파일 (유지)
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.development
│   ├── .env.production
│   ├── .gitignore
│   └── .gitmodules
│
├── 문서 파일 (유지 + Dev_md_2 백업)
│   ├── README.md
│   ├── CODE_QUALITY_PLAN.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── LOCAL_DEV_GUIDE.md
│   └── [기타 문서들]
│
├── 테스트 스크립트 (유지 + Dev_md_2 백업)
│   ├── test-*.js
│   ├── test_*.py
│   └── super_admin_fix.js
│
├── 빌드 관련 (유지 + Dev_md_2 백업)
│   ├── .lighthouserc.json
│   ├── asset-manifest.json
│   └── cache-bypass.html
│
└── 주요 폴더
    ├── public/            # 정적 파일
    ├── src/               # 소스 코드
    ├── build/             # 빌드 출력
    └── Dev_md_2/          # 개발 문서 백업
```

## 각 폴더 용도

### 📅 개발계획
- TODO 리스트 및 일정 관리
- MVP 개발 계획 (3주)
- Opus/Sonnet 역할 분담

### 📊 개발문서 (백업)
- 코드 품질 관리 문서
- 배포 가이드
- 로컬 개발 가이드
- ESLint 분석 및 개선 계획
- 루트에 있는 문서들의 백업 복사본

### 🔧 백엔드정보
- Render.com 서비스 설정 (Starter 유료 플랜)
- API 엔드포인트 문서
- 데이터베이스 정보

### 💾 백업파일
- 주요 문서의 이전 버전
- 변경 이력 보존
- 버전 정보

### 🏗️ 빌드관련 (백업)
- 빌드 설정 파일 백업
- 빌드 아티팩트
- Lighthouse 설정

### 🧪 테스트도구
- 브라우저에서 실행 가능한 HTML 테스트 페이지
- API 연결 테스트
- DB 초기화 도구
- 실제 사용 가능한 테스트 도구

### 🔬 테스트스크립트 (백업)
- Node.js 테스트 스크립트 백업
- Python 테스트 스크립트 백업
- 백엔드 연결 테스트
- 루트에 있는 스크립트들의 백업 복사본

### 📚 프로젝트문서
- Claude AI 협업 가이드
- 아키텍처 문서
- 개발 컨벤션

## 파일 관리 원칙

### ✅ 유지 정책
1. **루트 파일은 삭제하지 않음**
2. **Dev_md_2에 백업 복사본 보관**
3. **중요 파일은 이중으로 보관**

### 📦 백업된 파일 목록
- 개발 문서: 9개 파일
- 테스트 스크립트: 6개 파일  
- 빌드 관련: 3개 파일
- 백업 파일: 3개 파일

### 🗑️ 삭제된 파일 (불필요)
- nul (잘못 생성된 파일)
- 연결 (잘못 생성된 파일)

## 접근 방법

### 개발 문서 확인
```bash
# 개발 현황 확인
cat Dev_md_2/개발현황_20241111.md

# TODO 리스트 확인
cat Dev_md_2/개발계획/todolist_251111.md

# 백업된 문서 확인
ls Dev_md_2/개발문서/
```

### 테스트 도구 실행
```bash
# 브라우저에서 테스트 도구 실행
open Dev_md_2/테스트도구/test_backend_status.html

# Node.js 스크립트 실행 (루트 또는 백업 폴더에서)
node test-render-backend.js
# 또는
node Dev_md_2/테스트스크립트/test-render-backend.js
```

---

**정리 완료일**: 2024-11-12 00:10 KST
**목적**: 루트 파일 유지 + Dev_md_2 백업 구조화
**정책**: 삭제 없이 백업 복사본 생성