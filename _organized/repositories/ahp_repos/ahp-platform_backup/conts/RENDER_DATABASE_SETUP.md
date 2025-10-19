# Render.com Database Setup Guide

## 🔧 현재 상황
- ✅ 서비스 배포 성공: https://ahp-forpaper.onrender.com
- ⚠️ 데이터베이스 연결 필요

## 📝 데이터베이스 설정 방법

### 1. Render Dashboard에서 PostgreSQL 생성

1. [Render Dashboard](https://dashboard.render.com) 로그인
2. "New +" 클릭 → "PostgreSQL" 선택
3. 설정 입력:
   - **Name**: `ahp-database`
   - **Database**: `ahp_production`
   - **User**: `ahp_admin`
   - **Region**: Oregon (US West)
   - **Plan**: Free (나중에 Team Plan으로 업그레이드 가능)
4. "Create Database" 클릭

### 2. DATABASE_URL 환경변수 설정

1. Database 생성 완료 후, Database 대시보드에서:
   - "Connect" 섹션에서 "Internal Database URL" 복사
   - 형식: `postgresql://ahp_admin:password@dpg-xxxxx.oregon-postgres.render.com/ahp_production`

2. Web Service 환경변수 설정:
   - ahp-research-platform 서비스 → Environment 탭
   - "Add Environment Variable" 클릭
   - **Key**: `DATABASE_URL`
   - **Value**: 위에서 복사한 Internal Database URL 붙여넣기
   - "Save Changes" 클릭

### 3. 추가 환경변수 설정 (필수)

다음 환경변수들도 추가:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-secret-key-here-change-this
CORS_ORIGIN=https://ahp-forpaper.onrender.com
ADMIN_EMAIL=aebon@naver.com
SUPPORT_EMAIL=aebon@naver.com
SUPPORT_PHONE=010-3700-0629
```

### 4. 서비스 재배포

환경변수 설정 후:
1. "Manual Deploy" → "Clear build cache & deploy" 클릭
2. 배포 완료까지 2-3분 대기

## 🎯 확인 사항

### 성공적으로 연결되면:
```
Connecting to PostgreSQL: Remote Render.com database
Connected to PostgreSQL database
Initializing PostgreSQL database...
PostgreSQL database initialized successfully
```

### 현재 상태 (DATABASE_URL 없음):
```
⚠️ DATABASE_URL not set. Database features will be disabled.
Running without database connection
```

## 💡 팁

### Free Plan 제한사항
- Database는 90일 후 삭제됨 (활동이 없으면)
- 256MB RAM
- 1GB 스토리지

### Team Plan 업그레이드 시
- Database 영구 보존
- 4GB RAM
- 100GB 스토리지
- 자동 백업
- Point-in-time 복구

## 🚀 Blueprint를 통한 자동 설정

render.yaml에 이미 설정되어 있음:
```yaml
databases:
  - name: ahp-database
    plan: free
    postgresMajorVersion: 15
```

Blueprint Sync 시 자동으로 Database 생성됨

## 📞 문제 발생 시

1. Render Dashboard → Logs 확인
2. 이메일: aebon@naver.com
3. 전화: 010-3700-0629

## ✅ 체크리스트

- [ ] PostgreSQL Database 생성
- [ ] DATABASE_URL 환경변수 설정
- [ ] 기타 필수 환경변수 설정
- [ ] 서비스 재배포
- [ ] 로그에서 연결 확인
- [ ] 홈페이지 접속 테스트