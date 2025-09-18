# AHP Enterprise Platform - 엔터프라이즈 의사결정 지원 시스템

**🎯 전문 연구 및 기업용 AHP(Analytic Hierarchy Process) 통합 플랫폼**  
**🌐 라이브 서비스**: https://aebonlee.github.io/ahp_app/  
**📊 버전**: 3.0.0 (3차 개발 진행중)  
**🗓️ 진행 상황**: 2025-09-19 현재 - 프로덕션 전용 최적화 중

---

## 📖 개요

AHP Enterprise Platform은 학술 연구자와 기업 의사결정자를 위한 엔터프라이즈급 통합 플랫폼입니다. 복잡한 다기준 의사결정 문제를 체계적으로 분석하고, 논문 작성 및 비즈니스 의사결정에 필요한 정확한 결과를 제공합니다.

### 🔄 개발 이력
- **1차 개발 (v1.x)**: React + Node.js + PostgreSQL 기반 초기 구축
- **2차 개발 (v2.x)**: HTML/CSS/JS + Django + PostgreSQL 전환  
- **3차 개발 (v3.x)**: 엔터프라이즈 기능 강화 및 프로덕션 최적화 ⚡ **현재 진행중**

### 🚧 3차 개발 현황 (2025-09-19 기준)
- ✅ **새 리포지토리 생성**: 기존 1,387개 workflow 정리 후 새 시작
- ✅ **프로젝트 구조 재설계**: 프로덕션 전용 Django + 정적 HTML/CSS/JS
- 🔄 **클라우드 환경 최적화**: Render.com DB 자동 연결 설정 중
- ⏳ **DB 연결 안정화**: PostgreSQL on Render 최적화 진행
- ⏳ **프론트엔드 최적화**: 정적 호스팅용 HTML/CSS/JS 구조 개선

## 🚀 주요 특징

### 🎯 핵심 기능
- **완전한 AHP 분석 엔진**: 기준 설정부터 최종 결과까지 전 과정 지원
- **쌍대비교 시스템**: 직관적인 비교 인터페이스와 일관성 검증
- **다중 평가자 지원**: 그룹 의사결정 및 평가자 관리
- **실시간 결과 계산**: 즉시 가중치 계산 및 순위 결정
- **상세 분석 리포트**: 민감도 분석 및 시각적 차트 제공

### 🎨 사용자 경험
- **직관적 인터페이스**: 전문가가 아니어도 쉽게 사용 가능
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 모든 기기 지원
- **다크 모드 지원**: 사용자 선호에 맞는 테마 선택
- **접근성 고려**: WCAG 2.1 가이드라인 준수

### 📊 데이터 관리
- **안전한 클라우드 저장**: PostgreSQL 기반 데이터베이스
- **실시간 동기화**: 언제 어디서든 작업 이어가기
- **데이터 내보내기**: Excel, PDF 형식으로 결과 내보내기
- **백업 및 복원**: 프로젝트 데이터 안전 보장

## 🏗️ 기술 스택

### 프론트엔드 (3차 개발)
```
정적 HTML + CSS + JavaScript
반응형 디자인 (모바일/태블릿/데스크톱)
jQuery 3.6+ (DOM 조작)
Chart.js (데이터 시각화)
Bootstrap 5 (UI 프레임워크)
서버 사이드 렌더링 지원
```

### 백엔드 (3차 개발 강화)
```
Django 5.0.8 + Django REST Framework 3.14
PostgreSQL (프로덕션 전용 설정)
JWT 인증 (djangorestframework-simplejwt 5.5.1)
Gunicorn 23.0.0 (WSGI 서버)
dj-database-url (자동 DB 연결)
Render.com 자동 배포
모듈형 앱 구조 (8개 전문 앱)
```

### 배포 및 인프라 (3차 개발 최적화)
```
GitHub Pages (프론트엔드) - 정적 호스팅
Render.com (백엔드 API) - 자동 스케일링
PostgreSQL on Render - 관리형 DB
GitHub Actions CI/CD - 자동 배포
환경변수 자동 관리 (클라우드 전용)
```

## 🎓 사용 방법

### 1. 빠른 시작
1. **접속**: https://aebonlee.github.io/ahp_app/
2. **회원가입**: 이메일과 비밀번호로 계정 생성
3. **프로젝트 생성**: "새 프로젝트" 버튼 클릭
4. **AHP 분석 진행**: 단계별 가이드를 따라 분석 수행

### 2. 테스트 계정
**슈퍼관리자 계정**
- 이메일: `admin@ahp-platform.com`
- 비밀번호: `ahp2025admin`

**일반 관리자 계정**
- 이메일: `test@ahp.com`
- 비밀번호: `test123`

**평가자 계정**
- 이메일: `evaluator@example.com`
- 비밀번호: `Test123!`

### 3. AHP 분석 단계
1. **목표 설정**: 의사결정 목표 정의
2. **기준 설정**: 평가 기준들 입력
3. **대안 설정**: 선택 가능한 대안들 입력
4. **쌍대비교**: 기준 간, 대안 간 중요도 비교
5. **일관성 검증**: CR(Consistency Ratio) 확인
6. **결과 분석**: 최종 순위 및 가중치 확인

## 📁 프로젝트 구조

```
ahp_app/
├── src/                    # 프론트엔드 소스
│   ├── components/         # React 컴포넌트
│   │   ├── admin/         # 관리자 대시보드
│   │   ├── auth/          # 인증 관련
│   │   ├── common/        # 공통 컴포넌트
│   │   ├── evaluation/    # AHP 평가 기능
│   │   ├── home/          # 메인 페이지
│   │   └── ...
│   ├── services/          # API 서비스
│   ├── utils/             # AHP 계산 로직
│   ├── config/            # 설정 파일
│   └── store/             # 상태 관리
├── backend/               # 백엔드 소스
│   ├── src/
│   │   ├── routes/        # API 라우터
│   │   ├── services/      # 비즈니스 로직
│   │   ├── database/      # 데이터베이스 설정
│   │   ├── middleware/    # 미들웨어
│   │   └── utils/         # 유틸리티
│   └── migrations/        # 데이터베이스 마이그레이션
├── public/                # 정적 파일
└── docs/                  # 개발 문서
```

## 🔧 개발 환경 설정

### 프론트엔드 설정
```bash
# 저장소 클론
git clone https://github.com/aebonlee/ahp_app.git
cd ahp_app

# 패키지 설치
npm install

# 개발 서버 실행
npm start

# 빌드 및 배포
npm run build
npm run deploy
```

### 백엔드 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# DATABASE_URL, JWT_SECRET 등 설정

# 개발 서버 실행
npm run dev
```

## 📚 API 문서

### 기본 정보 ✨ **새로운 Django API**
- **Base URL**: https://ahp-app-vuzk.onrender.com/api/v1
- **인증**: JWT 토큰 (Bearer Token)
- **완전 재구축**: Django REST Framework 기반

### 인증 엔드포인트 ✨ **Django JWT**
- `POST /accounts/web/register/` - 회원가입
- `POST /accounts/web/login/` - 로그인
- `POST /accounts/web/logout/` - 로그아웃
- `GET /accounts/web/profile/` - 사용자 프로필 조회

### 프로젝트 관리
- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 새 프로젝트 생성
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제

### AHP 분석
- `POST /api/criteria` - 기준 생성
- `POST /api/alternatives` - 대안 생성
- `POST /api/comparisons` - 쌍대비교 데이터 저장
- `GET /api/results/:projectId` - 분석 결과 조회

## 🧪 테스트

### 단위 테스트 실행
```bash
npm test
```

### 통합 테스트
```bash
npm run test:integration
```

### E2E 테스트
```bash
npm run test:e2e
```

## 📈 성능 지표

- **빌드 크기**: 325.7 kB (gzip)
- **로딩 속도**: < 3초
- **API 응답**: < 500ms
- **Lighthouse 점수**: 95+ (Performance, Accessibility, SEO)

## 🛡️ 보안 기능

### 인증 및 권한
- JWT 기반 토큰 인증
- httpOnly 쿠키 사용
- HTTPS 강제 적용
- CORS 정책 적용

### 데이터 보호
- bcrypt 비밀번호 해싱
- SQL 인젝션 방지
- XSS 공격 차단
- 세션 타임아웃 (30분)

## 🌐 배포 정보

### 프로덕션 URL ✨ **새로운 Django 서버**
- **메인 사이트**: https://aebonlee.github.io/ahp_app/
- **Django API**: https://ahp-app-vuzk.onrender.com/
- **관리자 페이지**: https://ahp-app-vuzk.onrender.com/admin/

### 배포 환경
- **프론트엔드**: GitHub Pages
- **백엔드**: Render.com
- **데이터베이스**: PostgreSQL on Render

### CI/CD 파이프라인
- GitHub Actions 자동 배포
- 코드 푸시 시 자동 빌드
- 테스트 통과 후 배포

## 🤝 기여 가이드

1. Fork this repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원 및 문의

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **GitHub Discussions**: 일반적인 질문 및 토론
- **이메일**: aebon@hs.ac.kr
- **리포지토리**: https://github.com/aebonlee/ahp_app 

## 🙏 감사의 말

AHP Enterprise Platform은 다음 기술들과 라이브러리의 도움으로 만들어졌습니다:
- Django 팀의 강력한 웹 프레임워크
- PostgreSQL의 엔터프라이즈급 데이터베이스
- Render.com의 자동 스케일링 호스팅
- GitHub Actions의 CI/CD 파이프라인
- 모든 오픈소스 기여자들

---

## 🎯 버전 정보

**현재 버전**: v3.0.0 🎆 **Enterprise Edition**  
**개발 시작**: 2025년 9월 19일  
**상태**: 🔨 3차 개발 진행 중 - 프로덕션 환경 최적화 및 클라우드 DB 연결 안정화

### 주요 개발 내용 (v3.0.0) 🎆 **3차 개발**
- 🔄 **새로운 리포지토리**: 기존 1,387개 workflow 정리 후 새 시작
- 🔧 **DB 연결 문제 해결**: Render DATABASE_URL 자동 사용
- 📦 **의존성 업데이트**: 모든 패키지 최신 버전으로
- 🚫 **로컬 환경 제거**: 100% 클라우드 프로덕션 전용 설정
- 🕹️ **엔터프라이즈 기능**: 대규모 조직용 기능 추가
- 📋 **테스트 자동화**: GitHub Actions CI/CD 최적화
- 🔒 **보안 강화**: 환경변수 자동 관리
- ⚡ **성능 개선**: 정적 파일 서빙 최적화

### 개발 이력
- **1차 개발 (v1.x)**: React + Node.js + PostgreSQL
  - 리포지토리: ahp-platform_0908
  - 문제점: DB 연결 불안정
  
- **2차 개발 (v2.x)**: HTML/CSS/JS + Django + PostgreSQL
  - 리포지토리: ahp_app_backup250919
  - 문제점: DB 연결 및 성능 이슈
  
- **3차 개발 (v3.x)**: 엔터프라이즈 최적화 🎆
  - 리포지토리: https://github.com/aebonlee/ahp_app (새로운 시작)
  - 목표: 안정적인 DB 연결 및 엔터프라이즈 기능

---

## 🏆 주요 성취

### 🎯 기술적 성취 (3차 개발)
- 프로덕션 전용 환경 구축 완료
- 클라우드 네이티브 아키텍처 구현
- DB 연결 자동화 구현 (Render DATABASE_URL)
- GitHub Actions CI/CD 최적화
- Dependabot 자동 업데이트 설정
- 제로 로컬 의존성 달성

### 🚀 서비스적 성취  
- 학술 연구용 전문 도구 완성
- 사용자 친화적 인터페이스 제공
- 실시간 협업 기능 지원
- 안정적인 클라우드 서비스
- 논문 작성 직접 지원

**🌟 Developed with Claude Code Assistance**  
**🚀 Enterprise-Ready Decision Support Platform**

---

**📱 지금 바로 시작하세요**: https://aebonlee.github.io/ahp_app/

> 복잡한 기업 의사결정을 체계적으로, AHP Enterprise Platform과 함께하세요!

## 📅 업데이트 내역
- 2025-09-19: 3차 개발 시작 - 새 리포지토리로 이전
- 2025-09-14: 2차 개발 완료 - Django 기반 전환
- 2025-09-08: 1차 개발 완료 - React 기반 초기 버전
