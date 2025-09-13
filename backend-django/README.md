# AHP Django Backend

완전한 AHP (Analytic Hierarchy Process) 의사결정 지원 시스템의 Django 백엔드

## 🚀 주요 기능

### 핵심 AHP 기능
- ✅ **계층적 의사결정 구조**: 다단계 평가기준 및 대안 관리
- ✅ **쌍대비교 매트릭스**: Saaty 9점 척도 기반 평가
- ✅ **일관성 비율 계산**: 고유값 방법을 통한 자동 검증
- ✅ **가중치 계산**: 기하평균, 고유벡터 등 다양한 방법 지원

### 다중 평가자 지원
- ✅ **워크샵 세션**: 최대 30명 동시 평가 지원
- ✅ **실시간 진행 모니터링**: 참가자별 진행상황 추적
- ✅ **그룹 합의도 분석**: Kendall's W, Spearman 상관계수
- ✅ **이상치 탐지**: 비일관적 평가자 식별

### 고급 분석 기능
- ✅ **민감도 분석**: 파라미터 변화에 따른 순위 변동 분석
- ✅ **토네이도 차트**: 민감도 시각화
- ✅ **파레토 분석**: 80/20 규칙 기반 핵심 요소 식별
- ✅ **예산 최적화**: 비용-효과 분석

### 데이터 수집 및 설문
- ✅ **동적 설문 빌더**: Google Forms 스타일 인터페이스
- ✅ **7가지 질문 유형**: 객관식, 척도, 주관식 등
- ✅ **인구통계 데이터**: 참가자 정보 수집

### 내보내기 및 보고서
- ✅ **다양한 형식**: Excel, PDF, Word, CSV, JSON
- ✅ **맞춤형 템플릿**: 경영진 요약, 상세 분석 등
- ✅ **브랜딩 옵션**: 로고 및 스타일 커스터마이징

## 📦 기술 스택

- **Backend**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Analysis**: NumPy, SciPy, Pandas
- **Export**: openpyxl, reportlab
- **Deployment**: Gunicorn + WhiteNoise

## 🔧 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/aebonlee/ahp-django-backend.git
cd ahp-django-backend
```

### 2. 가상환경 설정
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 3. 패키지 설치
```bash
pip install -r requirements.txt
```

### 4. 환경변수 설정
`.env` 파일 생성:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost/ahp_db
```

### 5. 데이터베이스 마이그레이션
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 6. 서버 실행
```bash
python manage.py runserver
```

## 🌐 API 엔드포인트

### 인증
- `POST /api/v1/auth/token/` - 로그인
- `POST /api/v1/auth/token/refresh/` - 토큰 갱신
- `POST /api/v1/accounts/register/` - 회원가입

### 프로젝트 관리
- `GET /api/v1/projects/` - 프로젝트 목록
- `POST /api/v1/projects/` - 프로젝트 생성
- `PUT /api/v1/projects/{id}/` - 프로젝트 수정
- `DELETE /api/v1/projects/{id}/` - 프로젝트 삭제

### 평가
- `GET /api/v1/evaluations/` - 평가 목록
- `POST /api/v1/evaluations/` - 평가 시작
- `PATCH /api/v1/evaluations/{id}/update_progress/` - 진행상황 업데이트
- `POST /api/v1/evaluations/{id}/complete/` - 평가 완료

### 분석
- `POST /api/v1/analysis/{project_id}/calculate_weights/` - 가중치 계산
- `POST /api/v1/analysis/{project_id}/sensitivity_analysis/` - 민감도 분석
- `GET /api/v1/analysis/{project_id}/consensus_metrics/` - 합의도 분석

### 워크샵
- `POST /api/v1/workshops/` - 워크샵 세션 생성
- `POST /api/v1/workshops/{id}/join/` - 워크샵 참가
- `GET /api/v1/workshops/{id}/progress/` - 실시간 진행상황

## 🚀 Render.com 배포

### 1. Render.com 설정
1. [Render.com](https://render.com) 대시보드 접속
2. "New +" → "Web Service" 클릭
3. GitHub 리포지토리 연결

### 2. 서비스 설정
```yaml
Name: ahp-django-backend
Environment: Python
Build Command: sh render-build.sh
Start Command: gunicorn ahp_backend.wsgi:application
```

### 3. 환경변수 설정
```
DATABASE_URL=postgresql://...
SECRET_KEY=...
DEBUG=False
```

## 📊 데이터베이스 스키마

### 주요 모델
- **User**: 사용자 관리 (관리자, 평가자)
- **Project**: AHP 프로젝트
- **Criteria**: 평가기준 (계층적 구조)
- **Evaluation**: 평가 세션
- **PairwiseComparison**: 쌍대비교 데이터
- **WorkshopSession**: 다중 평가자 워크샵
- **AnalysisResult**: 분석 결과

## 🔒 보안

- JWT 기반 인증
- CORS 설정
- Rate limiting
- SQL injection 방지
- XSS 보호

## 📝 라이선스

MIT License

## 👥 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

## 📞 문의

- Email: aebonlee@example.com
- GitHub: [@aebonlee](https://github.com/aebonlee)