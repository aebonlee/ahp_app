# PostgreSQL 데이터베이스 설정 가이드

## 🚀 빠른 시작

### 1. 로컬에서 데이터베이스 설정 테스트
```bash
cd D:\ahp\ahp_django_service_updated
python setup_database.py
```

### 2. Render.com 환경변수 설정

Render.com 대시보드에서 다음 환경변수를 설정하세요:

```
POSTGRES_DB=ahp_db
POSTGRES_USER=ahp_user
POSTGRES_PASSWORD=<secure_password>
POSTGRES_HOST=<render_postgres_host>
POSTGRES_PORT=5432

# 또는 DATABASE_URL로 한 번에 설정
DATABASE_URL=postgresql://ahp_user:<password>@<host>:5432/ahp_db
```

### 3. 프로덕션 배포용 build.sh 수정
```bash
#!/usr/bin/env bash
# build.sh - Render.com 빌드 스크립트

# Python 의존성 설치
pip install --upgrade pip
pip install -r requirements.txt

# 데이터베이스 설정 및 마이그레이션
python setup_database.py

# Static 파일 수집 (필요 시)
python manage.py collectstatic --noinput
```

## 📊 테이블 구조

### 1. simple_projects (프로젝트)
- id: UUID (Primary Key)
- title: 프로젝트 제목
- description: 설명
- objective: 목표
- owner_id: 소유자 (Foreign Key)
- status: 상태 (draft/active/completed)
- created_at: 생성일
- updated_at: 수정일

### 2. evaluations_criteria (기준/대안)
- id: UUID (Primary Key)
- project_id: 프로젝트 (Foreign Key)
- name: 이름
- description: 설명
- is_alternative: 대안 여부
- weight: 가중치
- parent_id: 부모 기준 (계층구조)

### 3. evaluations_comparison (쌍대비교)
- id: UUID (Primary Key)
- project_id: 프로젝트 (Foreign Key)
- evaluator_id: 평가자 (Foreign Key)
- criteria_1_id: 비교 기준 1
- criteria_2_id: 비교 기준 2
- value: 비교값 (1-9 스케일)
- created_at: 평가일시

### 4. evaluations_result (결과)
- id: UUID (Primary Key)
- project_id: 프로젝트 (Foreign Key)
- alternative_id: 대안 (Foreign Key)
- final_weight: 최종 가중치
- rank: 순위
- consistency_ratio: 일관성 비율

## 🔧 트러블슈팅

### 문제: "no such table: simple_projects" 오류
**해결방법:**
1. 마이그레이션 실행: `python manage.py migrate`
2. 테이블 생성 확인: `python setup_database.py`

### 문제: PostgreSQL 연결 실패
**해결방법:**
1. 환경변수 확인
2. 네트워크 연결 확인
3. SSL 설정 확인 (sslmode=require)

### 문제: 권한 오류
**해결방법:**
1. 데이터베이스 사용자 권한 확인
2. CREATE, ALTER, DROP 권한 필요

## 📝 관리 명령어

### 마이그레이션 생성
```bash
python manage.py makemigrations
```

### 마이그레이션 적용
```bash
python manage.py migrate
```

### 데이터베이스 초기화
```bash
python manage.py flush
```

### 관리자 계정 생성
```bash
python manage.py createsuperuser
```

## 🔗 관련 파일
- `ahp_backend/settings.py` - 데이터베이스 설정
- `apps/projects/models.py` - 프로젝트 모델
- `apps/evaluations/models.py` - 평가 모델
- `setup_database.py` - 자동 설정 스크립트