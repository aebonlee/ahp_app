# AHP Decision System - 논문용 의사결정 분석 플랫폼

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0.0+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📊 프로젝트 소개

AHP(Analytic Hierarchy Process) 의사결정 분석 시스템은 복잡한 의사결정 문제를 체계적으로 분석하기 위한 웹 기반 플랫폼입니다. 학술 연구 및 실무에서 활용 가능한 전문적인 AHP 분석 도구를 제공합니다.

> 🎯 **최신 업데이트 (2025-08-29 v1.0)**: 평가 테스트 시스템 완전 구현!  
> 📋 [복구 기점 및 백업 정보](./RESTORE_POINTS.md) | [백업 시스템](./BACKUP_SYSTEM.md)
> 
> ✅ **신규 기능**: 평가 테스트 시스템 - 평가자 인터페이스 미리보기 및 시뮬레이션
> 🎨 **템플릿 통합**: 헤더/사이드바와 완전 통합된 레이아웃
> 🔧 **라우팅 최적화**: App.tsx 독립적 처리로 성능 향상
> 🚀 **안정성**: 프로덕션 빌드 331.93kB, TypeScript 오류 없음

### 🎯 주요 특징

#### 🏠 통합 대시보드 시스템
- **12개 전문 메뉴**: 대시보드, 프로젝트 관리, 모델 구축, 평가자 관리 등
- **프로젝트 현황 시각화**: 전체/진행중/완료 프로젝트 통계
- **빠른 작업 접근**: 원클릭으로 주요 기능 바로가기

#### 🆕 인구통계학적 설문조사 (NEW!)
- **Google Forms 스타일**: 직관적인 동적 설문 생성기
- **7가지 질문 유형**: 단답형, 선택형, 라디오, 체크박스, 장문형, 숫자, 날짜
- **인터랙티브 편집**: 드래그 앤 드롭 순서 변경, 실시간 미리보기

#### 🔧 AHP 분석 엔진
- **계층적 의사결정 구조**: 5단계까지 지원하는 유연한 계층 구조
- **쌍대비교 평가**: 직관적인 UI로 요소 간 상대적 중요도 평가
- **일관성 검증**: 실시간 CR(Consistency Ratio) 계산 및 경고
- **다중 평가자 지원**: 그룹 의사결정을 위한 평가자 관리

#### 📊 고급 분석 도구
- **결과 시각화**: 차트와 그래프를 통한 직관적인 결과 표현
- **5가지 내보내기 형식**: Excel, PDF, Word, CSV, JSON
- **워크숍 관리**: 협업 의사결정 세션 지원
- **의사결정 지원**: 5단계 체계적 프로세스 가이드

## 🚀 기술 스택

### Frontend
- **React 19.1.1** - 사용자 인터페이스
- **TypeScript 4.9.5** - 타입 안정성
- **TailwindCSS 3.4.17** - 스타일링
- **Recharts 3.1.2** - 데이터 시각화
- **Zustand 5.0.7** - 상태 관리

### Backend
- **Node.js + Express** - 서버 프레임워크
- **PostgreSQL** - 데이터베이스
- **JWT** - 인증/인가
- **bcryptjs** - 암호화

## 📋 시스템 요구사항

- Node.js 18.0.0 이상
- npm 8.0.0 이상
- PostgreSQL 15 이상 (백엔드 사용 시)
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)

## 🛠️ 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/aebonlee/AHP_forPaper.git
cd AHP_forPaper
```

### 2. 의존성 설치
```bash
# 프론트엔드와 백엔드 모두 설치
npm run install:all

# 또는 개별 설치
npm install              # 프론트엔드
cd backend && npm install # 백엔드
```

### 3. 환경 변수 설정
```bash
# 프론트엔드 (.env)
REACT_APP_API_URL=http://localhost:5000/api

# 백엔드 (backend/.env)
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/ahp_db
JWT_SECRET=your_secret_key
```

### 4. 데이터베이스 초기화
```bash
cd backend
npm run db:migrate
npm run db:seed  # 테스트 데이터 (선택사항)
```

### 5. 애플리케이션 실행
```bash
# 개발 모드 (프론트엔드 + 백엔드 동시 실행)
npm run dev:all

# 개별 실행
npm start            # 프론트엔드 (포트 3000)
npm run backend:dev  # 백엔드 (포트 5000)
```

## 📂 프로젝트 구조

```
AHP_forPaper/
├── src/                        # Frontend 소스 코드
│   ├── components/            # React 컴포넌트
│   │   ├── admin/            # 관리자 기능
│   │   ├── evaluation/       # 평가 기능
│   │   ├── results/          # 결과 표시
│   │   └── common/           # 공통 컴포넌트
│   ├── services/             # API 서비스
│   ├── stores/               # 상태 관리
│   ├── types/                # TypeScript 타입
│   └── utils/                # 유틸리티 함수
├── backend/                   # Backend 소스 코드
│   ├── src/
│   │   ├── routes/           # API 라우트
│   │   ├── services/         # 비즈니스 로직
│   │   ├── middleware/       # 미들웨어
│   │   └── database/         # DB 설정
│   └── dist/                 # 빌드 결과물
├── public/                    # 정적 파일
└── docs/                      # 문서
```

## 🔧 주요 기능

### 🏠 대시보드 & 프로젝트 관리
- **통합 대시보드**: 환영 메시지, 프로젝트 통계, 빠른 작업 버튼
- **프로젝트 생성**: 4가지 템플릿 (빈/비즈니스/기술/학술)
- **프로젝트 목록**: 카드/리스트 뷰, 상태별 필터링, 검색 기능
- **계층 구조 설계**: 워크플로우 기반 단계별 모델 구축

### 🆕 설문조사 시스템 (NEW!)
- **동적 설문 생성**: Google Forms 스타일 설문 빌더
- **7가지 질문 유형**: 모든 설문 요구사항 충족
- **실시간 편집**: 질문 추가/삭제/편집, 순서 변경
- **데이터 수집**: 인구통계학적 정보 체계적 수집

### 👥 협업 & 워크숍 관리
- **평가자 관리**: 초대, 권한 설정, 진행률 모니터링
- **설문 링크 관리**: QR 코드 생성, 응답 현황 추적
- **워크숍 세션**: 실시간 협업 의사결정 도구
- **회의록 생성**: 자동 의사결정 기록

### 🧠 의사결정 지원 시스템
- **5단계 프로세스**: 문제정의 → 구조화 → 평가 → 분석 → 검증
- **이해관계자 분석**: 영향력/관심도 매트릭스
- **위험요인 관리**: 확률/영향도 기반 리스크 평가
- **제약조건 식별**: 예산/시간/자원 제약사항 관리

### 📊 AHP 분석 엔진
- **쌍대비교 평가**: 직관적인 UI로 요소 간 상대적 중요도 평가
- **가중치 계산**: 고유벡터 방법 기반 정확한 계산
- **일관성 검증**: 실시간 CR(Consistency Ratio) 계산 및 경고
- **민감도 분석**: 가중치 변화에 따른 결과 민감도 분석

### 📤 결과 분석 & 내보내기
- **결과 시각화**: 차트, 그래프, 순위 테이블
- **5가지 내보내기**: Excel, PDF, Word, CSV, JSON 지원
- **맞춤형 보고서**: 차트/진행률/일관성/민감도 선택적 포함
- **회사 로고 삽입**: 브랜딩된 전문 보고서 생성

### 📄 논문 & 학술 지원
- **논문 관리**: 학술 논문 작성 지원 도구
- **연구 데이터 관리**: 체계적인 연구 자료 정리
- **인용 관리**: 참고문헌 자동 생성
- **템플릿 시스템**: 학술 논문 구조 템플릿

## 🌐 배포

### 현재 배포 URL
- **Frontend**: https://aebonlee.github.io/AHP_forPaper/
- **Backend API**: https://ahp-forpaper.onrender.com

### 배포 방법

#### GitHub Pages (Frontend)
```bash
npm run build
npm run deploy
```

#### Render.com (Backend)
1. Render 대시보드에서 Web Service 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 활성화

## 📝 API 문서

### 주요 엔드포인트

#### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/me` - 현재 사용자 정보

#### 프로젝트
- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 프로젝트 생성
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제

#### 평가
- `POST /api/comparisons` - 쌍대비교 저장
- `GET /api/results/:projectId` - 결과 조회
- `POST /api/export/:projectId` - Excel 내보내기

## 🧪 테스트

```bash
# 단위 테스트
npm test

# 테스트 커버리지
npm test -- --coverage

# E2E 테스트
npm run test:e2e
```

## 🤝 기여 방법

1. Fork 저장소
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 개발팀

- **개발자**: [@aebonlee](https://github.com/aebonlee)
- **프로젝트 링크**: [https://github.com/aebonlee/AHP_forPaper](https://github.com/aebonlee/AHP_forPaper)

## 📞 문의 및 지원

- **이슈 트래커**: [GitHub Issues](https://github.com/aebonlee/AHP_forPaper/issues)
- **이메일**: [프로젝트 관리자에게 문의]

## 🔄 버전 히스토리

### v2.5.0 (2025.08.25) - 🔧 인구통계학적 설문조사 내부 페이지 완전 해결
- **새 탭 문제 완전 해결**: 인구통계학적 설문조사가 내부 페이지로 정상 작동
- **렌더링 구조 개선**: External Tab → Internal Switch 패턴으로 완전 이전
- **사용자 경험 향상**: 끊김 없는 내부 페이지 전환 및 일관된 인터페이스
- **기술적 안정성**: TypeScript 0 오류, 성공적 빌드 및 배포 완료
- **문서화 완료**: 70번째 개발 보고서 추가, CHANGELOG 업데이트

### v2.4.0 (2025.08.25) - 🎯 FINAL RESTORATION
- **PersonalServiceDashboard 완전 복구**: Git 히스토리 분석(commit 5f7d45c)을 통한 완전 복구
- **인구통계학적 설문조사 통합**: Google Forms 스타일 동적 설문 생성기 구현
- **메인 페이지 컬러 템플릿 적용**: CSS 변수 시스템 기반 통일된 테마
- **13개 메뉴 100% 복구**: 모든 개인 서비스 기능 정상 작동 확인  
- **TypeScript 오류 완전 해결**: 18개 → 0개 달성 + 빌드 성공
- **사용자 경험 혁신**: 새창 문제 해결, 10시간 좌절감 해소

### v2.3.0 (2025.01.25) - 🚨 CRITICAL RECOVERY  
- **PersonalServiceDashboard 완전 복구**: Git 히스토리 분석을 통한 완전 복구
- **인구통계학적 설문조사 추가**: Google Forms 스타일 동적 설문 생성기
- **12개 메뉴 100% 복구**: 모든 기능 정상 작동 확인
- **TypeScript 오류 완전 해결**: 18개 → 0개 달성
- **사용자 경험 혁신**: 내부 페이지 호출로 새창 문제 해결

### v2.0.0 (2025.02)
- React 19로 업그레이드
- 보안 취약점 패치
- 배포 환경 구성 완료
- CI/CD 파이프라인 구축

### v1.0.0 (2024.08)
- 초기 릴리즈
- 핵심 AHP 기능 구현
- 기본 UI/UX 완성

## 🙏 감사의 말

이 프로젝트는 다양한 오픈소스 프로젝트의 도움을 받아 개발되었습니다. 모든 기여자분들께 감사드립니다.

---

*마지막 업데이트: 2025년 2월*