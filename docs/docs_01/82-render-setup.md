# Render.com 백엔드 배포 가이드

## 문제 상황
- 기존 Render 서비스가 잘못된 설정으로 고정됨
- `render.yaml` 파일이 무시되고 수동 설정이 우선됨
- 경로 설정 오류로 Express 모듈을 찾지 못함

## 해결 방법: 새 서비스 생성

### 1. 기존 서비스 삭제
1. Render 대시보드 (https://dashboard.render.com) 접속
2. 기존 `ahp-forpaper` 서비스 선택
3. Settings → Danger Zone → Delete Service

### 2. 새 Web Service 생성
1. "New+" 버튼 클릭 → Web Service 선택
2. GitHub 연결 → `aebonlee/AHP_forPaper` 선택
3. 다음 설정 적용:

```
Name: ahp-backend-new
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### 3. 환경 변수 설정
```
NODE_VERSION=18
NODE_ENV=production
PORT=10000
DATABASE_URL=[기존 DB URL 복사]
JWT_SECRET=[기존 시크릿 복사]
```

### 4. 고급 설정
- Auto-Deploy: Yes
- Branch: main
- Health Check Path: /api/health

## 올바른 폴더 구조
```
/opt/render/project/backend/
├── package.json          ← Render가 읽을 파일
├── dist/
│   └── index.js          ← 실행할 파일
└── node_modules/
    └── express/          ← 의존성 위치
```

## 기대 결과
- Express 모듈 정상 인식
- 백엔드 서버 정상 시작
- API 엔드포인트 작동
- 새 URL: https://ahp-backend-new.onrender.com

## 프론트엔드 API URL 업데이트 필요
배포 성공 후 프론트엔드에서 새 API URL로 변경 필요