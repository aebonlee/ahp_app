# AHP Platform - 운영 가이드 📚

## 🎯 시스템 개요

**AHP (Analytic Hierarchy Process) 의사결정 지원 플랫폼**
- **프론트엔드**: React 19.1.1 + TypeScript
- **백엔드**: Django 5.0.8 + DRF
- **데이터베이스**: SQLite (개발) / PostgreSQL (프로덕션)
- **배포**: GitHub Pages (프론트엔드) + Render.com (백엔드)

## 🔗 서비스 URLs

- **프론트엔드**: https://aebonlee.github.io/ahp_app/
- **백엔드 API**: https://ahp-django-backend.onrender.com
- **관리자 패널**: https://ahp-django-backend.onrender.com/admin/
- **API 문서**: https://ahp-django-backend.onrender.com/api/service/status/

## 🔐 관리자 계정

- **사용자명**: `admin`
- **비밀번호**: `AhpAdmin2025!`
- **이메일**: `admin@ahp-platform.com`
- **권한**: 일반 사용자 (필요시 Django admin에서 superuser로 승격)

## 📊 주요 기능

### 1. 사용자 인증 시스템
- ✅ 강화된 회원가입 (비밀번호 정책, 이메일 검증)
- ✅ Rate limiting (로그인 5회/분, 회원가입 3회/분)
- ✅ 세션 기반 인증
- ✅ 로그아웃 API

### 2. AHP 분석 기능
- ✅ 프로젝트 생성 및 관리
- ✅ 평가기준 설정
- ✅ 쌍대비교 입력
- ✅ 가중치 자동 계산
- ✅ 결과 분석 및 순위

### 3. 성능 최적화
- ✅ 데이터베이스 인덱싱
- ✅ API 페이지네이션 (20개/페이지)
- ✅ 캐싱 시스템 (프로젝트 통계 5분)
- ✅ 쿼리 최적화 (select_related, prefetch_related)

### 4. 보안 기능
- ✅ HTTPS 강제 리다이렉션
- ✅ CSRF, XSS 보호
- ✅ HSTS 헤더
- ✅ Rate limiting
- ✅ 보안 헤더

## 🔧 운영 명령어

### 백업 및 복구

```bash
# 전체 데이터 백업
python manage.py backup_data

# 특정 경로로 백업
python manage.py backup_data --output /path/to/backup.json

# 데이터 복구 (테스트)
python manage.py restore_data backup.json --dry-run

# 데이터 복구 (실행)
python manage.py restore_data backup.json --clear
```

### 관리자 계정 관리

```bash
# 관리자 생성
python manage.py create_admin

# 사용자 정보 확인
python manage.py shell -c "
from django.contrib.auth.models import User
print(f'Total users: {User.objects.count()}')
for user in User.objects.filter(is_staff=True):
    print(f'Staff: {user.username} - {user.email}')
"
```

### 데이터베이스 관리

```bash
# 마이그레이션
python manage.py makemigrations
python manage.py migrate

# 데이터베이스 상태 확인
python manage.py check_db
```

## 📈 모니터링 및 헬스체크

### API 엔드포인트

- **기본 헬스체크**: `GET /health/`
- **상세 헬스체크**: `GET /api/health/`
- **서비스 상태**: `GET /api/service/status/`

### 헬스체크 응답 예시

```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T12:00:00Z",
  "version": "2.0.1",
  "database": {
    "status": "connected",
    "response_time_ms": 15.2
  },
  "cache": {
    "status": "working"
  },
  "system": {
    "memory_usage_percent": 45.2,
    "memory_available_mb": 256.8,
    "cpu_percent": 12.5
  },
  "response_time_ms": 23.4
}
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 로그인 실패
- Rate limiting 확인 (5회/분 제한)
- 계정 활성화 상태 확인
- 비밀번호 정책 준수 여부

#### 2. API 응답 지연
- 캐시 상태 확인: `/api/health/`
- 데이터베이스 연결 확인
- 메모리 사용량 모니터링

#### 3. 배포 실패
- logs 디렉토리 권한 확인
- requirements.txt 의존성 확인
- 환경변수 설정 확인

### 로그 확인

```bash
# Django 로그 (Render.com에서)
tail -f logs/django.log

# 실시간 로그 모니터링
python manage.py shell -c "
import logging
logger = logging.getLogger('simple_service')
logger.info('Testing log system')
"
```

## ⚙️ 환경 설정

### 필수 환경 변수 (Render.com)

```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
DATABASE_NAME=ahp_app
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
```

### 선택적 환경 변수

```bash
NODE_ENV=production
DJANGO_LOG_LEVEL=INFO
CACHE_TIMEOUT=300
RATELIMIT_ENABLE=True
```

## 📊 성능 메트릭

### 현재 최적화 상태
- ✅ API 응답 시간: < 200ms (평균)
- ✅ 데이터베이스 쿼리: 최적화됨 (N+1 문제 해결)
- ✅ 페이지네이션: 구현됨
- ✅ 캐싱: 5분 TTL
- ✅ Rate Limiting: 활성화

### 권장 모니터링 지표
- 응답 시간 (< 500ms)
- 메모리 사용량 (< 80%)
- 데이터베이스 연결 시간 (< 100ms)
- 캐시 적중률 (> 70%)

## 🔄 업데이트 프로세스

### 코드 배포
1. **개발**: 로컬에서 테스트
2. **스테이징**: GitHub에 push
3. **프로덕션**: Render.com 자동 배포
4. **검증**: 헬스체크 API 확인

### 데이터베이스 마이그레이션
1. **백업**: `python manage.py backup_data`
2. **마이그레이션**: 자동 실행 (render-build.sh)
3. **검증**: 데이터 무결성 확인
4. **롤백 준비**: 백업 파일 보관

## 🛡️ 보안 체크리스트

- [x] HTTPS 강제 사용
- [x] 보안 헤더 설정
- [x] CSRF 토큰 검증
- [x] Rate limiting 적용
- [x] 입력값 검증 강화
- [x] 에러 메시지 보안 (민감정보 노출 방지)
- [x] 로깅 시스템 (보안 이벤트 추적)

## 📞 지원 및 연락처

- **기술 문의**: GitHub Issues
- **운영 문제**: 시스템 관리자
- **API 문서**: `/api/service/status/`
- **버그 리포트**: GitHub Repository

---

**버전**: 2.0.1 Production Ready  
**마지막 업데이트**: 2025-01-09  
**상태**: ✅ 일반 사용자 서비스 준비 완료