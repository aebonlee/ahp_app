# 🚨 수동 배포 긴급 지침서

## 현재 상황
- **GitHub 자동 배포**: 완전 중단 (7일 경과)
- **마지막 배포**: 2025-09-16 21:58 (a63b478)
- **현재 커밋**: 6bdb089 (26개 커밋 누락)
- **백엔드 상태**: 구버전 실행 중

## 🎯 수동 배포 단계별 실행 방법

### 1단계: Render.com 접속
```
URL: https://dashboard.render.com
계정: 해당 계정으로 로그인
```

### 2단계: 서비스 선택
```
서비스명: ahp-django-backend
URL: https://ahp-django-backend.onrender.com
```

### 3단계: Manual Deploy 실행
```
1. 서비스 페이지에서 "Manual Deploy" 버튼 클릭
2. Branch: main 선택
3. "Deploy Latest Commit" 클릭
4. 배포 시작 확인
```

### 4단계: 배포 로그 모니터링
다음 메시지들을 확인하세요:
```
🚨🚨🚨 CRITICAL DEPLOYMENT - 23 COMMITS PENDING 🚨🚨🚨
📅 Last Deploy: 2025-09-16 21:58 (7 days ago)
🔄 Commits to Deploy: 23
⚡ Latest Commit: a9b3211
```

### 5단계: 성공 확인 지표
```
✅ "🎉 BUILD COMPLETED SUCCESSFULLY" 메시지
✅ PostgreSQL migrations completed
✅ Tables created and verified
✅ Backend ready for API requests
```

## 🔧 배포 실패 시 대체 방법

### 방법 1: GitHub Webhook 재연결
```
1. Render.com → Settings → Build & Deploy
2. Auto-Deploy 끄기/켜기
3. GitHub 연결 재설정
```

### 방법 2: 강제 코드 변경
```
git commit --allow-empty -m "force deploy trigger"
git push origin main
```

### 방법 3: 환경변수 변경
```
Render.com → Environment → Add Variable
Key: FORCE_DEPLOY
Value: $(date +%s)
```

## 📊 배포 성공 확인 방법

### API 테스트
```bash
# 1. 기본 상태 확인
curl https://ahp-django-backend.onrender.com/

# 2. 프로젝트 API 확인
curl https://ahp-django-backend.onrender.com/api/service/projects/

# 3. Admin 접속 확인
curl https://ahp-django-backend.onrender.com/admin/
```

### 예상 응답
- ❌ 실패: "no such table: simple_projects"
- ✅ 성공: JSON 데이터 또는 빈 배열 []

## ⚡ 긴급 연락처
- **GitHub Repository**: https://github.com/aebonlee/ahp_app
- **Render Backend**: https://ahp-django-backend.onrender.com
- **프론트엔드**: https://aebonlee.github.io/ahp_app/

---
**작성일**: 2025-09-23 15:35  
**상태**: 긴급 - 즉시 실행 필요