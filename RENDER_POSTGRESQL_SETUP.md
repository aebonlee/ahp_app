# Render.com PostgreSQL 연결 설정

## 📋 확인된 PostgreSQL 배정
- **Database ID**: `dpg-d2vgtg3uibrs738jk4i0-a`
- **Host**: `dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Status**: ✅ 할당 완료

## 🔧 Render.com 환경변수 설정 필요

**Render.com 서비스 → Settings → Environment**에서 다음 변수들을 설정:

### 방법 1: DATABASE_URL 사용 (권장)
```bash
DATABASE_URL=postgresql://username:password@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com:5432/database_name
```

### 방법 2: 개별 변수 설정
```bash
POSTGRES_DB=ahp_platform_db
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com
POSTGRES_PORT=5432
```

### 기타 필수 환경변수
```bash
SECRET_KEY=your-django-secret-key-min-50-characters
DEBUG=False
ALLOWED_HOSTS=ahp-django-backend.onrender.com
```

## 🔍 PostgreSQL 정보 확인 방법

Render.com Dashboard에서:
1. **Database** 섹션으로 이동
2. `dpg-d2vgtg3uibrs738jk4i0-a` 클릭
3. **Info** 탭에서 연결 정보 확인:
   - **Database Name**
   - **Username** 
   - **Password**
   - **External Database URL** (전체 연결 문자열)

## ⚡ 즉시 실행 단계

### 1. PostgreSQL 연결 정보 확인
```bash
# Render.com Dashboard → Databases → dpg-d2vgtg3uibrs738jk4i0-a
# External Database URL 복사
```

### 2. 환경변수 설정
```bash
# Render.com Dashboard → Services → ahp-django-backend → Settings → Environment
# DATABASE_URL = 복사한 연결 문자열
```

### 3. 수동 재배포
```bash
# Render.com Dashboard → Services → ahp-django-backend → Settings
# "Manual Deploy" → "Deploy Latest Commit"
```

### 4. 배포 로그 확인
빌드 로그에서 다음 메시지 확인:
```
✓ Using DATABASE_URL for database connection
✓ simple_projects table exists
Superuser created: admin / AHP2025!Admin
```

### 5. 데이터베이스 연결 테스트
```bash
curl https://ahp-django-backend.onrender.com/db-status/
```

## 🚨 현재 상태 진단

**문제**: 환경변수 미설정으로 SQLite 사용
**결과**: 재배포 시마다 테이블 삭제
**해결**: PostgreSQL 환경변수 설정 → 영구 테이블 보존

---
**⏰ 예상 소요시간**: 환경변수 설정 5분 + 재배포 3분 = 총 8분