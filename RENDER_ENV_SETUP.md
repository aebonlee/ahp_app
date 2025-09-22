# Render.com PostgreSQL 환경변수 설정 가이드

## 🎯 목표
PostgreSQL 환경변수를 설정하여 데이터베이스를 연결하고 재배포 시 데이터가 삭제되지 않도록 합니다.

## 📍 환경변수 설정 정확한 위치

### 1단계: Render.com 로그인
```
https://dashboard.render.com
→ GitHub 계정 또는 이메일로 로그인
```

### 2단계: 서비스 찾기
```
Dashboard → Services 탭
→ "ahp-django-backend" 서비스 클릭
```

### 3단계: 환경변수 페이지
```
ahp-django-backend 서비스 페이지
→ Settings 탭 클릭
→ Environment Variables 섹션
→ "Add Environment Variable" 버튼 클릭
```

## 📋 필수 환경변수 목록

### 1. PostgreSQL 데이터베이스 연결 정보 (dpg-d2vgtg3uibrs738jk4i0-a)

```bash
# 옵션 1: DATABASE_URL 사용 (권장)
DATABASE_URL=postgresql://[USER]:[PASSWORD]@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com:5432/[DATABASE]

# 데이터베이스 페이지에서 External Database URL 복사하여 입력
```

### 2. 개별 환경변수 설정 (DATABASE_URL 대신 사용 가능)

```bash
POSTGRES_DB=ahp_db
POSTGRES_USER=ahp_user  
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=dpg-xxxxx.oregon-postgres.render.com
POSTGRES_PORT=5432
```

### 3. Django 보안 설정

```bash
SECRET_KEY=django-insecure-generate-a-secure-key-here
DEBUG=False
```

### 4. CORS 설정 (프론트엔드 연동)

```bash
CORS_ALLOWED_ORIGINS=https://aebonlee.github.io
```

## 🚀 Render.com 설정 방법

### Step 1: Render.com 대시보드 접속
1. https://dashboard.render.com 로그인
2. `ahp-django-backend` 서비스 선택

### Step 2: Environment 탭에서 환경변수 추가
1. 서비스 대시보드에서 `Environment` 탭 클릭
2. `Add Environment Variable` 버튼 클릭
3. 위의 환경변수들을 하나씩 추가

### Step 3: PostgreSQL 데이터베이스 생성 (없는 경우)
1. Render 대시보드에서 `New +` → `PostgreSQL` 클릭
2. 데이터베이스 이름: `ahp-database`
3. Region: Oregon (US West)
4. Plan: Free tier 선택
5. 생성 후 `Internal Database URL` 복사

### Step 4: 서비스 재배포
1. 환경변수 설정 완료 후
2. `Manual Deploy` → `Deploy latest commit` 클릭
3. 배포 로그 확인

## 🔍 환경변수 확인 방법

### 1. Render Shell에서 확인
```bash
# Render.com Shell 탭에서
echo $DATABASE_URL
echo $POSTGRES_DB
python manage.py dbshell
```

### 2. Django 설정 테스트
```bash
python manage.py showmigrations
python manage.py migrate --check
```

## ⚠️ 주의사항

1. **보안**: 비밀번호에는 특수문자 사용 주의 (URL 인코딩 필요)
2. **SSL**: PostgreSQL 연결 시 SSL 모드 `require` 설정 필수
3. **백업**: 프로덕션 데이터는 정기적으로 백업
4. **모니터링**: 데이터베이스 연결 상태 주기적 확인

## 📊 데이터베이스 초기화 명령어

환경변수 설정 후 다음 명령어로 데이터베이스 초기화:

```bash
# Render.com Shell에서 실행
python setup_database.py

# 또는 개별 명령 실행
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 🔗 관련 리소스

- [Render PostgreSQL 문서](https://render.com/docs/databases)
- [Django PostgreSQL 설정](https://docs.djangoproject.com/en/4.2/ref/databases/#postgresql)
- [환경변수 관리 베스트 프랙티스](https://render.com/docs/environment-variables)

---

**작성일**: 2025-09-22
**프로젝트**: AHP Platform
**담당자**: Development Team