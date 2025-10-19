# 🛠️ AHP 플랫폼 로컬 개발 가이드

**업데이트**: 2025-10-19  
**목적**: 개발자 편의성을 위한 로컬 환경 구성 가이드  

---

## 📁 로컬 폴더 구조 (개발 편의성 최적화)

### **🎯 핵심 개발 폴더**
```
D:\ahp\
├── 🚀 ahp_app/                 # 프론트엔드 메인 작업
├── ⚡ ahp-django-service-repo/  # 백엔드 메인 작업
├── 📚 Dev_md/                   # 개발일지 (현재 진행)
├── 📋 CLAUDE.md                 # 프로젝트 마스터 가이드
└── 📖 README.md                 # 프로젝트 루트 문서
```

### **🛠️ 개발 도구 폴더** (신규 생성)
```
D:\ahp\
├── 🔧 dev_tools/               # 빌드 스크립트들
│   ├── build.sh
│   ├── render-build.sh
│   └── start.sh
├── 🧪 test_scripts/            # 통합 테스트 파일들
│   ├── backend-test.js
│   ├── comprehensive_db_test.js
│   └── final_integration_test.js
└── 📖 documentation/           # 핵심 개발 문서
    ├── BACKEND_SETUP_GUIDE.md
    └── DEVELOPMENT.md
```

### **🗂️ 체계적 아카이브** (정리 완료)
```
D:\ahp\_organized\
├── 📦 repositories/            # 백업 리포지토리들
│   ├── ahp-django-security-backup/
│   ├── ahp_app_251014/
│   └── ahp_repos/
├── 📄 documentation/           # 과거 문서들
│   ├── DevDocs/
│   └── _documentation/
├── 🗃️ archives/               # 아카이브 파일들
│   ├── _archive/
│   └── _cleanup/
└── 💾 backups/                # 백업 파일들
```

---

## 🚀 빠른 시작 명령어

### **프론트엔드 개발**
```bash
# 프론트엔드 서버 시작
cd ahp_app
npm start                       # http://localhost:3000

# 빌드 및 배포
npm run build
npm run deploy                  # GitHub Pages 배포
```

### **백엔드 개발**
```bash
# 백엔드 서버 시작
cd ahp-django-service-repo
python manage.py runserver      # http://localhost:8000

# 데이터베이스 마이그레이션
python manage.py migrate
python manage.py createsuperuser
```

### **통합 테스트**
```bash
# API 연결 테스트
node test_scripts/backend-test.js

# 종합 테스트
node test_scripts/comprehensive_db_test.js

# 통합 테스트
node test_scripts/final_integration_test.js
```

---

## 🔗 시스템 연결 정보

### **🌐 운영 환경**
- **프론트엔드**: https://aebonlee.github.io/ahp_app/
- **백엔드**: https://ahp-django-backend.onrender.com
- **헬스체크**: https://ahp-django-backend.onrender.com/health/
- **관리자**: https://ahp-django-backend.onrender.com/admin/

### **💾 데이터베이스**
- **엔진**: PostgreSQL (Render 호스팅)
- **서비스 ID**: dpg-d2q8l5qdbo4c73bt3780-a
- **상태**: ✅ 연결 정상 (55개 테이블)

### **📱 GitHub 저장소**
- **프론트엔드**: https://github.com/aebonlee/ahp_app
- **백엔드**: https://github.com/aebonlee/ahp-django-service

---

## 🛠️ 개발 워크플로우

### **1. 일반적인 개발 사이클**
```bash
# 1단계: 최신 코드 동기화
cd ahp_app && git pull origin main
cd ../ahp-django-service-repo && git pull origin main

# 2단계: 개발 서버 시작
# Terminal 1: 백엔드
cd ahp-django-service-repo && python manage.py runserver

# Terminal 2: 프론트엔드
cd ahp_app && npm start

# 3단계: 개발 작업 수행
# 코드 수정, 테스트, 디버깅

# 4단계: 테스트 실행
node test_scripts/comprehensive_db_test.js

# 5단계: 커밋 및 배포
git add . && git commit -m "feature: 새로운 기능 추가"
git push origin feature-branch
```

### **2. 디버깅 및 문제 해결**
```bash
# 백엔드 로그 확인
cd ahp-django-service-repo
python manage.py shell

# 프론트엔드 빌드 문제
cd ahp_app
npm run lint:fix
npm run build

# 데이터베이스 상태 확인
curl https://ahp-django-backend.onrender.com/db-status/
```

---

## 📋 개발 환경 설정

### **필수 소프트웨어**
```
✅ Node.js 18+ (프론트엔드)
✅ Python 3.11+ (백엔드)
✅ Git (버전 관리)
✅ VSCode (권장 에디터)
```

### **권장 VSCode 확장**
```
✅ ES7+ React/Redux/React-Native snippets
✅ Python
✅ Django
✅ Tailwind CSS IntelliSense
✅ GitLens
✅ Thunder Client (API 테스트)
```

### **환경 변수 설정**
```bash
# 프론트엔드 (.env)
REACT_APP_API_URL=https://ahp-django-backend.onrender.com
REACT_APP_DATA_MODE=online

# 백엔드 (환경에 따라)
DEBUG=True  # 로컬 개발시
DATABASE_URL=postgresql://...  # Render 배포시
```

---

## 🔧 유용한 개발 스크립트

### **빠른 빌드 스크립트**
```bash
# dev_tools/quick_build.sh
cd ahp_app
npm run build
echo "✅ 프론트엔드 빌드 완료"

cd ../ahp-django-service-repo
python manage.py collectstatic --noinput
echo "✅ 백엔드 정적 파일 수집 완료"
```

### **전체 테스트 스크립트**
```bash
# test_scripts/full_test.sh
echo "🚀 AHP 플랫폼 전체 테스트 시작"

# 백엔드 테스트
node test_scripts/backend-test.js

# 통합 테스트
node test_scripts/comprehensive_db_test.js

# 프론트엔드 테스트
cd ahp_app && npm test -- --watchAll=false

echo "✅ 전체 테스트 완료"
```

---

## 📞 문제 해결 체크리스트

### **❌ 프론트엔드 문제**
```
1. npm install 재실행
2. node_modules 삭제 후 재설치
3. 브라우저 캐시 클리어
4. API URL 확인 (config/api.ts)
5. CORS 설정 확인
```

### **❌ 백엔드 문제**
```
1. pip install -r requirements.txt 재실행
2. python manage.py migrate 실행
3. DATABASE_URL 환경변수 확인
4. CORS 설정 확인 (settings.py)
5. Render 배포 로그 확인
```

### **❌ 연결 문제**
```
1. 헬스체크 확인: curl https://ahp-django-backend.onrender.com/health/
2. 네트워크 연결 확인
3. API 엔드포인트 확인
4. JWT 토큰 유효성 확인
5. 브라우저 개발자 도구 네트워크 탭 확인
```

---

## 🎯 개발 팁

### **효율적인 개발을 위한 팁**
1. **브랜치 전략**: feature/ 브랜치에서 개발 후 PR
2. **커밋 메시지**: feat:, fix:, chore: 등 컨벤션 준수
3. **테스트 자주 실행**: 변경사항 후 즉시 테스트
4. **로그 활용**: console.log보다 체계적 로깅
5. **백업 습관**: 중요 변경 전 브랜치 생성

### **성능 최적화 팁**
1. **React 컴포넌트**: memo, useMemo, useCallback 활용
2. **Django 쿼리**: select_related, prefetch_related 사용
3. **번들 크기**: 불필요한 의존성 제거
4. **이미지 최적화**: WebP 형식 사용
5. **캐싱 전략**: Redis 도입 검토

---

## 📈 향후 개발 계획

### **단기 목표 (1주일)**
- [ ] 백엔드 저장소 정리 (프론트엔드 방식 적용)
- [ ] API 문서화 완성 (Swagger UI)
- [ ] 테스트 자동화 스크립트 완성

### **중기 목표 (1개월)**
- [ ] CI/CD 파이프라인 고도화
- [ ] 모니터링 시스템 구축
- [ ] 성능 최적화 완료

### **장기 목표 (3개월)**
- [ ] 마이크로서비스 아키텍처 검토
- [ ] 모바일 앱 개발 시작
- [ ] 다국어 지원 구현

---

**💡 이 가이드를 통해 AHP 플랫폼 개발이 더욱 효율적이고 체계적으로 진행될 것입니다!**