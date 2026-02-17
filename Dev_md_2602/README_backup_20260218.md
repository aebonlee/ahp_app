# 🎯 AHP Decision Support Platform


연구자를 위한 합리적 의사결정 플랫폼

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178c6.svg)](https://www.typescriptlang.org/)
[![Django](https://img.shields.io/badge/Django-5.0-092e20.svg)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.0-336791.svg)](https://www.postgresql.org/)
[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://aebonlee.github.io/ahp_app/)

## 📖 소개

**Analytic Hierarchy Process Decision Support System**

전문가급 의사결정 지원을 위한 현대적이고 확장 가능한 웹 애플리케이션

**시스템 상태**: ✅ **완전 가동 중** | **완성도**: 75%  
**최근 업데이트**: 2024-11-11 - DB 관리 도구 및 중복 처리 시스템 구현

### 🌟 주요 특징

- **계층적 의사결정 모델링**: 복잡한 문제를 계층 구조로 분해
- **쌍대비교 평가**: 직관적인 1:1 비교를 통한 가중치 도출
- **일관성 검증**: CR(Consistency Ratio) 자동 계산
- **실시간 협업**: 다수 평가자의 동시 참여 지원
- **시각화 대시보드**: 결과를 차트와 그래프로 즉시 확인
- **모바일 최적화**: 반응형 디자인으로 모든 기기 지원

## 🚀 시작하기

### 온라인 접속
- **프론트엔드**: https://aebonlee.github.io/ahp_app
- **백엔드 API**: https://ahp-django-backend.onrender.com

### 로컬 개발 환경

#### 필수 요구사항
- Node.js 18.0 이상
- Python 3.10 이상
- PostgreSQL 14.0 이상

#### 프론트엔드 설치

```bash
# 저장소 클론
git clone https://github.com/aebonlee/ahp_app.git
cd ahp_app

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

#### 백엔드 설치

```bash
# 백엔드 저장소 클론
git clone https://github.com/aebonlee/ahp-django-service.git
cd ahp-django-service

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python manage.py migrate

# 서버 실행
python manage.py runserver
```

## 🏗️ 기술 스택

### Frontend
- **React** 18.2.0 - UI 라이브러리
- **TypeScript** 4.9.5 - 타입 안정성
- **Tailwind CSS** 3.x - 스타일링
- **Recharts** 2.x - 데이터 시각화
- **Axios** 1.x - HTTP 클라이언트

### Backend
- **Django** 5.0 - 웹 프레임워크
- **Django REST Framework** 3.x - RESTful API
- **PostgreSQL** 17.0 - 데이터베이스
- **Gunicorn** - WSGI 서버

### DevOps
- **GitHub Actions** - CI/CD
- **GitHub Pages** - 프론트엔드 호스팅
- **Render.com (Starter)** - 백엔드 호스팅 (유료 플랜)

## 📱 주요 기능

### 1. 프로젝트 관리
- 프로젝트 생성/수정/삭제
- 워크플로우 관리 (생성 → 평가 → 완료)
- 다중 프로젝트 동시 진행

### 2. 기준 설정
- 계층적 기준 구조 생성
- 템플릿 제공 (비즈니스, 기술, 인사 등)
- 시각적 트리 편집기
- 일괄 입력 지원
- **NEW**: 중복 기준명 자동 처리

### 3. 평가 프로세스
- 쌍대비교 매트릭스
- 9점 척도 평가
- 일관성 비율(CR) 실시간 검증
- 그룹 평가 통합

### 4. 결과 분석
- 가중치 자동 계산
- 우선순위 도출
- 민감도 분석
- PDF/Excel 보고서 생성

### 5. 관리자 기능
- 사용자 관리
- 시스템 모니터링
- **NEW**: 데이터베이스 관리 도구
- 사용량 추적

## 🧪 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:coverage

# ESLint 검사
npm run lint
```

## 📦 빌드 및 배포

### 프론트엔드 빌드

```bash
# 프로덕션 빌드
npm run build

# GitHub Pages 배포
npm run deploy
```

### 백엔드 배포

```bash
# 정적 파일 수집
python manage.py collectstatic

# Gunicorn으로 실행
gunicorn config.wsgi:application
```

## 📊 프로젝트 현황

### 완성도: 75%

#### ✅ 완료된 기능
- 프로젝트 관리 시스템 (100%)
- 기준(Criteria) 관리 (95%)
- 대안(Alternative) 관리 (90%)
- 평가 시스템 (85%)
- 인증 및 권한 (95%)
- UI/UX (90%)
- 관리자 대시보드 (90%)

#### 🚧 개발 중
- 평가자 초대 시스템 (40%)
- 고급 분석 기능 (30%)
- 결제 시스템 (0%)
- 실시간 협업 (35%)

## 📚 문서

- [개발 가이드](./CLAUDE.md) - AI 협업 개발 가이드
- [개발 현황](./Dev_md_2/개발현황_20241111.md) - 최신 개발 상태
- [API 문서](./docs/API.md)
- [사용자 매뉴얼](./docs/USER_GUIDE.md)

## 🛠️ 개발 도구

### 테스트 도구
- `test_criteria_save.html` - 기준 저장 테스트
- `clear_all_criteria.html` - DB 초기화 도구
- `test_api_connection.html` - API 연결 테스트

### 관리자 도구
- DB 관리 페이지 - 관리자 대시보드 > DB 관리
- 시스템 모니터링 - 실시간 상태 확인
- 사용자 관리 - 권한 및 구독 관리

## 🤝 기여하기

프로젝트 기여를 환영합니다! 다음 절차를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 커밋 규칙
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 포맷팅
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가
- `chore:` 기타 변경

## 📈 성능 지표

- **Lighthouse 점수**: 92/100
- **페이지 로드**: < 1.5초
- **API 응답**: < 200ms
- **번들 크기**: 485KB

## 🔄 업데이트 내역

### v2.1.1 (2024-11-11)
- ✨ DB 관리 도구 추가
- 🐛 중복 기준명 처리 개선
- 🔧 초기화 기능 강화
- 📝 문서 업데이트

### v2.1.0 (2024-10-19)
- 🚀 CI/CD 파이프라인 구축
- 📱 모바일 최적화
- 🎨 UI/UX 개선
- 🗑️ 저장소 정리

### v2.0.0 (2024-10-01)
- 🎉 정식 버전 출시
- 🔐 인증 시스템 구현
- 📊 실시간 분석 기능

## 🐛 알려진 이슈

- 대용량 프로젝트 (기준 100개 이상) 성능 저하
- Safari 브라우저 일부 애니메이션 버그

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 글

- Claude AI (Anthropic) - 개발 지원
- React 커뮤니티
- Django 커뮤니티
- 모든 기여자들

## 📞 연락처

- **GitHub Issues**: [프로젝트 이슈](https://github.com/aebonlee/ahp_app/issues)
- **Email**: support@ahp-platform.com

---

<p align="center">
  Made with ❤️ by AHP Platform Team | Powered by Claude AI
</p>