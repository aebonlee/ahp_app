# AHP Platform 테스트 환경 안내서 🧪

## 🎯 테스트 개요

이 가이드는 AHP Platform을 테스트하고 검증하는 방법을 안내합니다.  
개발자, QA 엔지니어, 최종 사용자 모두 활용할 수 있습니다.

---

## 🌐 테스트 환경 접속 정보

### 📍 서비스 URLs
| 서비스 | URL | 용도 |
|--------|-----|------|
| **프론트엔드** | https://aebonlee.github.io/ahp_app/ | 사용자 인터페이스 테스트 |
| **백엔드 API** | https://ahp-django-backend.onrender.com | API 직접 테스트 |
| **관리자 패널** | https://ahp-django-backend.onrender.com/admin/ | 관리 기능 테스트 |
| **API 상태** | https://ahp-django-backend.onrender.com/api/service/status/ | 서비스 상태 확인 |
| **헬스체크** | https://ahp-django-backend.onrender.com/api/health/ | 시스템 모니터링 |

### 🔐 테스트 계정 정보
```
사용자명: admin
비밀번호: AhpAdmin2025!
이메일: admin@ahp-platform.com
권한: 일반 사용자 (필요시 관리자 권한 승격 가능)
```

---

## 🧪 테스트 시나리오

### 1. 기본 기능 테스트 ✅

#### 1.1 사용자 인증 테스트
```bash
# 1. 회원가입 테스트
curl -X POST "https://ahp-django-backend.onrender.com/api/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# 2. 로그인 테스트
curl -X POST "https://ahp-django-backend.onrender.com/api/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AhpAdmin2025!"
  }'

# 3. 사용자 정보 조회
curl -X GET "https://ahp-django-backend.onrender.com/api/user/" \
  -H "Cookie: sessionid=YOUR_SESSION_ID"
```

#### 1.2 프로젝트 관리 테스트
```bash
# 1. 프로젝트 목록 조회
curl -X GET "https://ahp-django-backend.onrender.com/api/service/projects/"

# 2. 프로젝트 생성
curl -X POST "https://ahp-django-backend.onrender.com/api/service/projects/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 프로젝트",
    "description": "API 테스트용 프로젝트",
    "status": "draft"
  }'

# 3. 프로젝트 검색
curl -X GET "https://ahp-django-backend.onrender.com/api/service/projects/?search=테스트"
```

### 2. 성능 테스트 🚀

#### 2.1 API 응답시간 측정
```bash
# 응답시간 측정 (200ms 이하 목표)
time curl -X GET "https://ahp-django-backend.onrender.com/api/service/status/"

# 페이지네이션 성능 테스트
curl -X GET "https://ahp-django-backend.onrender.com/api/service/projects/?page=1&page_size=20"
```

#### 2.2 동시접속 테스트
```bash
# Apache Bench로 동시접속 테스트 (옵션)
ab -n 100 -c 10 https://ahp-django-backend.onrender.com/api/service/status/
```

### 3. 보안 테스트 🛡️

#### 3.1 Rate Limiting 테스트
```bash
# 로그인 시도 5회 초과시 차단 확인
for i in {1..6}; do
  echo "시도 $i:"
  curl -X POST "https://ahp-django-backend.onrender.com/api/login/" \
    -H "Content-Type: application/json" \
    -d '{"username": "wrong", "password": "wrong"}'
done
```

#### 3.2 입력값 검증 테스트
```bash
# SQL Injection 시도 (차단되어야 함)
curl -X POST "https://ahp-django-backend.onrender.com/api/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'; DROP TABLE users; --",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# XSS 시도 (차단되어야 함)
curl -X POST "https://ahp-django-backend.onrender.com/api/service/projects/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert(\"XSS\")</script>",
    "description": "XSS 테스트"
  }'
```

### 4. 시스템 모니터링 테스트 📊

#### 4.1 헬스체크 테스트
```bash
# 기본 헬스체크
curl -X GET "https://ahp-django-backend.onrender.com/health/"

# 상세 헬스체크
curl -X GET "https://ahp-django-backend.onrender.com/api/health/"

# 서비스 상태 확인
curl -X GET "https://ahp-django-backend.onrender.com/api/service/status/"
```

---

## 🖥️ 로컬 개발 환경 테스트

### 전제조건
```bash
# 필수 소프트웨어
- Python 3.9+
- Node.js 18+
- Git
```

### 백엔드 로컬 테스트
```bash
# 1. 저장소 클론
git clone https://github.com/aebonlee/ahp_app.git
cd ahp_app/backend-django

# 2. 가상환경 생성 및 활성화
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 3. 의존성 설치
pip install -r requirements.txt

# 4. 데이터베이스 마이그레이션
python manage.py migrate

# 5. 관리자 계정 생성
python manage.py create_admin

# 6. 서버 실행
python manage.py runserver

# 7. 테스트 실행
python run_tests.py
```

### 프론트엔드 로컬 테스트
```bash
# 1. 프론트엔드 디렉토리로 이동
cd ahp_app/

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm start

# 4. 빌드 테스트
npm run build
```

---

## 🔧 Django 관리 명령어 테스트

### 백업/복구 테스트
```bash
# 데이터 백업
python manage.py backup_data --output test_backup.json

# 백업 파일 검증
python manage.py restore_data test_backup.json --dry-run

# 데이터 복구 (주의: 기존 데이터 삭제)
python manage.py restore_data test_backup.json --clear
```

### 관리자 계정 관리
```bash
# 관리자 계정 생성
python manage.py create_admin

# 데이터베이스 상태 확인
python manage.py check_db

# Django 셸에서 사용자 확인
python manage.py shell -c "
from django.contrib.auth.models import User
print(f'Total users: {User.objects.count()}')
for user in User.objects.all():
    print(f'User: {user.username} - Staff: {user.is_staff} - Super: {user.is_superuser}')
"
```

---

## 📱 브라우저 테스트 시나리오

### 사용자 여정 테스트
1. **회원가입/로그인**
   - https://aebonlee.github.io/ahp_app/ 접속
   - 회원가입 또는 기존 계정으로 로그인
   - 대시보드 접근 확인

2. **프로젝트 생성**
   - 새 프로젝트 생성
   - 프로젝트 정보 입력 및 저장
   - 프로젝트 목록에서 확인

3. **AHP 분석 수행**
   - 평가기준 입력 (3-5개 권장)
   - 대안 입력 (3-5개 권장)
   - 쌍대비교 수행
   - 결과 확인 및 해석

4. **결과 관리**
   - 결과 저장
   - 결과 내보내기
   - 프로젝트 공유 (향후 기능)

---

## ⚠️ 알려진 제한사항

### 현재 알려진 이슈
1. **배포 환경**
   - Render.com 무료 플랜으로 인한 cold start 지연 (30초)
   - psutil 패키지 미설치로 인한 시스템 메트릭 제한

2. **기능적 제한**
   - 파일 업로드 기능 없음
   - 실시간 협업 기능 없음
   - 모바일 최적화 부분적

3. **성능 제한**
   - SQLite 사용으로 인한 동시접속 제한
   - 캐시 시스템 기본 설정 (Redis 미사용)

---

## 🐛 버그 신고 및 피드백

### 버그 신고 시 포함할 정보
1. **환경 정보**
   - 브라우저 및 버전
   - 운영체제
   - 접속 시간

2. **재현 단계**
   - 상세한 단계별 설명
   - 스크린샷 (가능시)
   - 에러 메시지

3. **기대 결과 vs 실제 결과**

### 피드백 채널
- GitHub Issues: https://github.com/aebonlee/ahp_app/issues
- 이메일: admin@ahp-platform.com (테스트용)

---

## 📊 테스트 체크리스트

### ✅ 필수 테스트 항목
- [ ] 회원가입/로그인 정상 작동
- [ ] 프로젝트 생성/수정/삭제 가능
- [ ] API 응답시간 200ms 이하
- [ ] Rate limiting 정상 작동 (5회 제한)
- [ ] 헬스체크 API 정상 응답
- [ ] 보안 헤더 적용 확인
- [ ] 모바일 브라우저 기본 작동

### 🔍 고급 테스트 항목
- [ ] 동시접속 100+ 사용자 처리
- [ ] 데이터베이스 백업/복구 성공
- [ ] AHP 계산 정확성 검증
- [ ] 다양한 브라우저 호환성
- [ ] 네트워크 지연 환경 테스트

---

## 🎉 테스트 완료 후

테스트를 완료하신 후에는:
1. **결과 정리**: 발견된 이슈와 개선사항 정리
2. **성능 측정**: 응답시간, 처리량 등 수치화
3. **사용성 평가**: 사용자 경험 관점에서 피드백
4. **보고서 작성**: 테스트 결과 및 권장사항

---

**💡 이 테스트 가이드를 통해 AHP Platform의 안정성과 성능을 철저히 검증할 수 있습니다!**

---

*테스트 가이드 작성일: 2025-01-09*  
*버전: v2.0.1 Production*