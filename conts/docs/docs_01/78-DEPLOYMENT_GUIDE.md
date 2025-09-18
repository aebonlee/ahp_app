# AHP_forPaper 배포 가이드

## 📅 최종 업데이트
2025년 2월

## 🌐 현재 배포 상태

### 프론트엔드 (GitHub Pages)
- **URL**: https://aebonlee.github.io/AHP_forPaper/
- **상태**: ✅ 정상 운영
- **빌드**: React 19.1.1 + TypeScript 4.9.5
- **자동 배포**: GitHub Actions 활성화

### 백엔드 (Render.com)
- **URL**: https://ahp-forpaper.onrender.com
- **상태**: ✅ 정상 운영
- **Health Check**: https://ahp-forpaper.onrender.com/api/health
- **Runtime**: Node.js 18.x + Express 4.21.2

## 🚀 프론트엔드 배포

### GitHub Pages 자동 배포

#### 설정 파일
```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build:frontend
      
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build
      
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

#### 수동 배포
```bash
# 로컬에서 빌드 및 배포
npm run build:frontend
npm run deploy

# 또는 개별 명령어
npm run predeploy  # 빌드 실행
gh-pages -d build  # GitHub Pages에 배포
```

#### package.json 설정
```json
{
  "homepage": "https://aebonlee.github.io/AHP_forPaper/",
  "scripts": {
    "build:frontend": "react-scripts build",
    "predeploy": "npm run build:frontend", 
    "deploy": "gh-pages -d build"
  }
}
```

### 환경 변수 설정
```env
# 프로덕션 환경
REACT_APP_API_URL=https://ahp-forpaper.onrender.com
PUBLIC_URL=https://aebonlee.github.io/AHP_forPaper/

# 개발 환경  
REACT_APP_API_URL=http://localhost:5000
PUBLIC_URL=/
```

## 🔧 백엔드 배포

### Render.com 현재 설정

#### 서비스 정보
```yaml
Name: ahp-forpaper
Type: Web Service
Region: Oregon (US West)
Instance Type: Free Tier
```

#### 빌드 설정
```yaml
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

#### 환경 변수
```env
NODE_ENV=production
NODE_VERSION=18
PORT=10000
DATABASE_URL=[PostgreSQL 연결 문자열]
JWT_SECRET=[JWT 서명 키]
CORS_ORIGIN=https://aebonlee.github.io
```

#### Auto-Deploy 설정
```yaml
Branch: main
Auto-Deploy: Yes
Health Check Path: /api/health
```

### Render 배포 문제 해결

#### 일반적인 문제들
1. **Express 모듈을 찾을 수 없음**
   ```
   Error: Cannot find module 'express'
   ```
   **해결**: Root Directory를 `backend`로 설정

2. **포트 설정 오류**
   ```
   Error: listen EADDRINUSE :::3000
   ```
   **해결**: `process.env.PORT || 10000` 사용

3. **빌드 실패**
   ```
   Error: npm ERR! missing script: build
   ```
   **해결**: backend/package.json에 빌드 스크립트 추가

#### 새 서비스 생성 가이드
문제가 지속될 경우 [render-setup.md](./render-setup.md) 참조

### 데이터베이스 설정

#### PostgreSQL (Render 내장)
```env
DATABASE_URL=postgresql://username:password@hostname:5432/database
```

#### 연결 설정
```javascript
// backend/src/database/connection.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

#### 마이그레이션
```bash
# 로컬에서 마이그레이션 실행
cd backend
npm run migrate

# 또는 Render 콘솔에서
npm run migrate:prod
```

## 🔄 CI/CD 파이프라인

### GitHub Actions 워크플로우

#### 1. 테스트 실행 (.github/workflows/ci.yml)
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false
      - run: npm run build:frontend
```

#### 2. 배포 워크플로우 (.github/workflows/pages.yml)
- main 브랜치 push 시 자동 실행
- 빌드 → 테스트 → GitHub Pages 배포

#### 3. 백엔드 배포 (Render 자동)
- main 브랜치 push 시 Render에서 자동 감지
- 자동 빌드 → 배포 → 헬스체크

### 배포 상태 모니터링

#### GitHub Pages 상태
```bash
# 배포 상태 확인
curl -I https://aebonlee.github.io/AHP_forPaper/

# 응답 예시
HTTP/2 200
content-type: text/html; charset=utf-8
```

#### Render 백엔드 상태  
```bash
# 헬스체크
curl https://ahp-forpaper.onrender.com/api/health

# 응답 예시
{
  "status": "ok",
  "timestamp": "2025-02-XX:XX:XX.XXX",
  "uptime": "XX hours"
}
```

## 🔐 보안 설정

### HTTPS 강제
```javascript
// 프로덕션에서 HTTPS 리다이렉트
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### CORS 설정
```javascript
const corsOptions = {
  origin: [
    'https://aebonlee.github.io',
    'http://localhost:3000'  // 개발용
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};

app.use(cors(corsOptions));
```

### Content Security Policy
```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' https://ahp-forpaper.onrender.com"
  );
  next();
});
```

## 📊 성능 최적화

### 프론트엔드 최적화
```javascript
// 코드 분할
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

// 번들 크기 분석
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### 백엔드 최적화
```javascript
// 압축 미들웨어
const compression = require('compression');
app.use(compression());

// 정적 파일 캐싱
app.use(express.static('public', {
  maxAge: '1y',
  etag: false
}));
```

### 데이터베이스 최적화
```sql
-- 인덱스 생성
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_evaluations_project_id ON evaluations(project_id);

-- 연결 풀 설정
const pool = new Pool({
  max: 20,
  min: 5,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000
});
```

## 🚨 장애 대응

### 모니터링 도구
1. **Render 대시보드**
   - CPU/Memory 사용량
   - 응답 시간
   - 오류 로그

2. **GitHub Actions**
   - 빌드 성공/실패 알림
   - 배포 상태 추적

3. **외부 모니터링**
   - Uptime Robot (선택사항)
   - StatusPage (선택사항)

### 장애 시나리오별 대응

#### 1. 프론트엔드 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build:frontend

# 오류 확인 후 수정
npm run deploy  # 수동 배포
```

#### 2. 백엔드 서버 다운
```bash
# Render 콘솔에서 재시작
# 또는 새 커밋으로 재배포 트리거

# 로그 확인
render logs --service=ahp-forpaper
```

#### 3. 데이터베이스 연결 실패
```bash
# 연결 문자열 확인
echo $DATABASE_URL

# 수동 연결 테스트
psql $DATABASE_URL
```

## 🔄 롤백 전략

### 프론트엔드 롤백
```bash
# 이전 커밋으로 롤백
git revert <commit-hash>
git push origin main

# 또는 특정 브랜치에서 배포
git checkout <stable-branch>
npm run deploy
```

### 백엔드 롤백
```bash
# Render 대시보드에서 이전 배포 버전 선택
# 또는 안정 버전 브랜치로 푸시
git push origin <stable-branch>:main --force
```

### 데이터베이스 백업/복구
```sql
-- 백업
pg_dump $DATABASE_URL > backup.sql

-- 복구
psql $DATABASE_URL < backup.sql
```

## 📝 체크리스트

### 배포 전 확인사항
- [ ] 로컬 테스트 통과
- [ ] 빌드 오류 없음
- [ ] 환경 변수 설정 확인
- [ ] API 연결 테스트
- [ ] 보안 설정 검토
- [ ] 데이터베이스 마이그레이션

### 배포 후 확인사항
- [ ] 프론트엔드 접속 확인
- [ ] 백엔드 헬스체크 통과
- [ ] 로그인/회원가입 기능 테스트
- [ ] AHP 계산 기능 테스트
- [ ] HTTPS 리다이렉트 확인
- [ ] CORS 설정 동작 확인

## 🆘 긴급 연락처

### 서비스 문의
- **GitHub Issues**: https://github.com/aebonlee/AHP_forPaper/issues
- **Render 지원**: https://render.com/docs/support

### 참고 문서
- [React 배포 가이드](https://create-react-app.dev/docs/deployment/)
- [Render 배포 문서](https://render.com/docs/web-services)
- [GitHub Pages 문서](https://docs.github.com/en/pages)

---

**최종 업데이트**: 2025년 2월  
**작성자**: Claude Code Assistant  
**검토 상태**: ✅ 배포 완료