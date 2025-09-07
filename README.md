# AHP System v2.0

AHP (Analytic Hierarchy Process) 의사결정 지원 시스템의 새로운 버전입니다.

## 🚀 특징

- **프로덕션 우선 설계**: localhost 의존성 완전 제거
- **세션 기반 인증**: localStorage 대신 쿠키/세션 사용
- **GitHub Pages 배포**: aebonlee.github.io/ahp_app/
- **기존 백엔드 연동**: https://ahp-platform.onrender.com
- **PostgreSQL 데이터베이스**: dpg-d2q8l5qdbo4c73bt3780-a

## 🛠️ 기술 스택

### 프론트엔드
- React 19.1.1
- TypeScript 4.9.5
- Zustand (상태 관리)
- React Router DOM 7.8.2
- Axios (HTTP 클라이언트)
- Recharts (차트)

### 백엔드 (기존)
- Node.js + Express
- PostgreSQL
- 쿠키 기반 세션 관리

## 📋 개발 환경 설정

### 1. 저장소 클론
```bash
git clone https://github.com/aebonlee/ahp_app.git
cd ahp_app
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일이 이미 설정되어 있습니다.

### 4. 개발 서버 실행
```bash
npm start
```

### 5. 빌드 및 배포
```bash
npm run build
npm run deploy
```

## 🌐 배포 URL

- **프론트엔드**: https://aebonlee.github.io/ahp_app/
- **백엔드 API**: https://ahp-platform.onrender.com

## 🔐 데모 계정

- **관리자**: admin@ahp-system.com / password123
- **사용자**: user@test.com / password123

## 📚 주요 개선사항

1. **localStorage 의존성 제거**
2. **프로덕션 환경 최적화**
3. **GitHub Pages SPA 라우팅 해결**
4. **쿠키 기반 세션 인증**
5. **TypeScript 완전 지원**

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
├── pages/              # 페이지 컴포넌트
├── store/              # Zustand 스토어
├── services/           # API 서비스
├── types/              # TypeScript 타입
├── config/             # 설정 파일
└── utils/              # 유틸리티 함수
```

## 🗄️ 데이터베이스 확인 방법

PostgreSQL 데이터베이스 확인을 위한 옵션:

1. **DBeaver** (추천)
2. **pgAdmin** 
3. **API 엔드포인트**를 통한 쿼리 실행
4. **백엔드 로그** 확인

## 🔄 개발 워크플로우

1. 기능 개발
2. 로컬 테스트
3. 빌드 확인
4. GitHub에 푸시
5. 자동 배포 확인

## 📞 지원

문의사항이나 버그 리포트는 GitHub Issues를 이용해주세요.
