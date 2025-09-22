# Render.com 환경변수 설정 완전 가이드

## 🎯 목표: PostgreSQL 환경변수 설정으로 데이터베이스 연결

## 📍 **정확한 설정 단계**

### 1단계: Render.com 대시보드 접속
```
https://dashboard.render.com 
→ 로그인 (GitHub 계정 또는 이메일)
```

### 2단계: PostgreSQL 데이터베이스 정보 확인
```
Dashboard 메인 페이지
→ "Databases" 섹션 클릭
→ "dpg-d2vgtg3uibrs738jk4i0-a" 데이터베이스 클릭
→ "Info" 탭 클릭
→ "External Database URL" 복사
```

**예시 URL 형태:**
```
postgresql://username:password@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com:5432/database_name
```

### 3단계: 백엔드 서비스 환경변수 설정
```
Dashboard 메인 페이지
→ "Services" 섹션 클릭  
→ "ahp-django-backend" 서비스 클릭
→ "Settings" 탭 클릭
→ "Environment" 섹션으로 스크롤
→ "Add Environment Variable" 클릭
```

### 4단계: 환경변수 추가
```
Key: DATABASE_URL
Value: [2단계에서 복사한 PostgreSQL URL]

예시:
Key: DATABASE_URL  
Value: postgresql://username:password@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com:5432/database_name
```

### 5단계: 추가 환경변수 설정
```
Key: SECRET_KEY
Value: your-super-secret-django-key-min-50-characters

Key: DEBUG  
Value: False

Key: CORS_ALLOW_ALL_ORIGINS
Value: False
```

### 6단계: 수동 재배포
```
"Settings" 탭에서
→ "Manual Deploy" 섹션
→ "Deploy Latest Commit" 클릭
→ 빌드 로그에서 "✅ PostgreSQL connected" 확인
```

## 🔧 **환경변수 직접 확인 방법**

PostgreSQL 정보를 직접 확인하려면:

### 방법 1: Render.com CLI 사용
```bash
# Render CLI 설치
npm install -g @render/cli

# 로그인
render login

# 데이터베이스 정보 확인
render databases list
render databases info dpg-d2vgtg3uibrs738jk4i0-a
```

### 방법 2: 웹 브라우저에서 직접 확인
```
1. https://dashboard.render.com 접속
2. 좌측 메뉴에서 "Databases" 클릭
3. dpg-d2vgtg3uibrs738jk4i0-a 클릭
4. "Info" 탭에서 연결 정보 확인:
   - Database Name
   - Username  
   - Password
   - Host
   - Port
   - External Database URL (전체 연결 문자열)
```

## 🚨 **문제 해결**

### 문제 1: PostgreSQL 데이터베이스가 보이지 않음
**해결책:**
- Render.com 계정에 데이터베이스 접근 권한 확인
- 다른 계정으로 생성된 데이터베이스인지 확인
- 새 PostgreSQL 데이터베이스 생성

### 문제 2: 환경변수 설정 후에도 연결 실패
**해결책:**
```bash
# 빌드 로그에서 확인할 메시지
✅ PostgreSQL connected via DATABASE_URL
🐘 Database: postgresql (database_name)
📊 PostgreSQL tables: X개
```

### 문제 3: 데이터베이스 비밀번호 모름
**해결책:**
- Render.com Dashboard → Database Info에서 확인
- 또는 새 사용자/비밀번호 생성

## ⚡ **즉시 테스트 방법**

환경변수 설정 완료 후:

### 1. 배포 완료 확인
```
https://ahp-django-backend.onrender.com/
→ "SUCCESSFUL" 메시지 확인
```

### 2. 데이터베이스 상태 확인  
```
https://ahp-django-backend.onrender.com/db-status/
→ PostgreSQL 테이블 목록 확인
```

### 3. API 테스트
```
test_api_integration.html 실행
→ CORS 에러 없이 API 호출 성공
→ 프로젝트 생성/기준 추가 테스트
```

## 📞 **추가 지원**

환경변수 설정에 어려움이 있다면:
1. Render.com 대시보드 스크린샷 공유
2. 현재 보이는 서비스/데이터베이스 목록 확인
3. 계정 권한 상태 점검

---
**🎯 목표**: PostgreSQL 환경변수 설정으로 완전한 클라우드 테스트 환경 구축