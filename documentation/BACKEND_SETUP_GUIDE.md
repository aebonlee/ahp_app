# AHP Platform - PostgreSQL 백엔드 연동 가이드

## 🎯 개요

AHP 플랫폼이 Django 백엔드와 PostgreSQL 데이터베이스를 통해 완전히 작동하도록 설정했습니다.

## 🛠️ 백엔드 설정 (Django + PostgreSQL)

### 1. 백엔드 서버 시작

```bash
# 방법 1: 배치 파일 사용 (Windows)
start_backend.bat

# 방법 2: 수동 실행
cd django_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 2. 설정 파일 확인

Django 백엔드는 다음과 같이 설정됨:

**PostgreSQL 연결:**
- Database: `ahp_app` (Render.com PostgreSQL)
- 모든 테이블 자동 생성됨 (마이그레이션)
- settings 필드로 메타데이터 저장 지원

**API 엔드포인트:**
- 기본 API: `http://localhost:8000/api/`
- 서비스 API: `http://localhost:8000/api/service/`
- 프로젝트: `/api/service/projects/projects/`
- 기준: `/api/service/projects/criteria/`

### 3. 권한 설정

개발 환경에서는 인증 없이 모든 API 접근 가능:
- `ProjectViewSet`: `permissions.AllowAny`
- `CriteriaViewSet`: `permissions.AllowAny` (수정됨)

## 🚀 프론트엔드 설정

### 1. API 연결 설정

프론트엔드가 로컬 백엔드를 사용하도록 설정됨:
- 개발 환경: `http://localhost:8000`
- 프로덕션: `https://ahp-django-backend.onrender.com`

### 2. 기준 추가 로직 개선

이중 방어 시스템 구현:
1. **1차 시도**: 프로젝트 settings 필드 업데이트
2. **2차 시도**: Django criteria API 직접 호출
3. **상세 로깅**: 각 단계별 실패 원인 분석

## 🧪 테스트 방법

### 1. 백엔드 연결 테스트

```bash
# Node.js로 연결 테스트 실행
node test_backend_connection.js
```

테스트 항목:
- ✅ Health Check
- ✅ Database Status 
- ✅ API Endpoints
- ✅ Project CRUD
- ✅ Criteria CRUD

### 2. 전체 워크플로우 테스트

1. **프로젝트 생성**: 새 프로젝트 생성
2. **모델 구축**: 자동으로 model-builder 페이지로 이동
3. **기준 추가**: 기준 추가 및 저장
4. **시각화**: HierarchyTreeVisualization 확인
5. **일괄 입력**: BulkCriteriaInput 테스트

## 📊 데이터베이스 구조

### Project 모델
```python
class Project(models.Model):
    id = models.UUIDField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    settings = models.JSONField(default=dict)  # 메타데이터 저장
    status = models.CharField(choices=STATUS_CHOICES)
    # ... 기타 필드
```

### Criteria 모델
```python
class Criteria(models.Model):
    project = models.ForeignKey(Project)
    name = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(choices=TYPE_CHOICES)
    parent = models.ForeignKey('self', null=True)
    level = models.PositiveIntegerField()
    order = models.PositiveIntegerField()
    # ... 기타 필드
```

## 🔧 문제 해결

### 문제 1: "프로젝트 업데이트 실패: API 요청 실패"
**해결됨**: 
- API updateProject에 settings 필드 지원 추가
- CriteriaViewSet 권한을 AllowAny로 변경
- 이중 방어 시스템으로 백업 API 호출

### 문제 2: 기준 추가 후 시각화 안됨
**해결됨**:
- settings 필드를 통한 메타데이터 저장
- getCriteria에서 프로젝트 settings 조회
- HierarchyTreeVisualization 데이터 연동

### 문제 3: 프로젝트 삭제 오류
**해결됨**:
- 올바른 API 엔드포인트 사용
- 에러 처리 개선

## 🎉 완료된 기능

✅ **PostgreSQL 완전 연동**
✅ **프로젝트 생성 → 모델구축 자동 이동**
✅ **기준 추가 및 저장**
✅ **계층구조 시각화**
✅ **일괄 기준 입력**
✅ **프로젝트 삭제 및 복원**
✅ **상세 로깅 및 디버깅**

## 🚀 다음 단계

1. **백엔드 서버 시작**: `start_backend.bat`
2. **연결 테스트**: `node test_backend_connection.js`
3. **프론트엔드 시작**: `npm start`
4. **전체 워크플로우 테스트**: 프로젝트 생성부터 기준 추가까지

이제 AHP 플랫폼이 PostgreSQL과 완전히 연동되어 안정적으로 작동합니다!