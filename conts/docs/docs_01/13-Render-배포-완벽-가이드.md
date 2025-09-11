# 13. Render.com 배포 완벽 가이드

## 일시
- **일시**: 2025년 8월 17일 11:45:00

## 개요
AHP 시스템을 Render.com에 완벽하게 배포하기 위한 단계별 가이드입니다.

## 1. Render.com에서 새 프로젝트 생성

### 1.1 Render 웹사이트 접속
1. https://render.com 방문
2. 로그인 또는 회원가입

### 1.2 새 Web Service 생성
1. **"New +"** 버튼 클릭
2. **"Web Service"** 선택
3. **"Connect a repository"** 선택

### 1.3 GitHub 저장소 연결
1. GitHub 계정 연결 (필요시)
2. **`aebonlee/AHP_forPaper`** 저장소 선택
3. **"Connect"** 클릭

## 2. Render 프로젝트 설정

### 2.1 기본 설정
```
Name: ahp-forpaper
Environment: Node
Region: Oregon (US West) 또는 가장 가까운 지역
Branch: main
```

### 2.2 Build & Deploy 설정
```
Build Command: echo "No build required"
Start Command: node server.js
```

### 2.3 고급 설정 (Advanced)
```
Root Directory: (비워둠)
Auto-Deploy: Yes
```

## 3. 환경 변수 설정

### 3.1 필수 환경 변수
```
NODE_ENV=production
PORT=(자동 생성됨 - 설정하지 마세요)
```

### 3.2 설정 방법
1. Render 대시보드에서 서비스 선택
2. **"Environment"** 탭 클릭  
3. **"Add Environment Variable"** 클릭
4. Key: `NODE_ENV`, Value: `production` 입력

## 4. 현재 코드베이스 상태

### 4.1 준비된 파일들
```
ahp-decision-system/
├── server.js                 # 순수 Node.js 서버 (의존성 없음)
├── package.json              # 최소한의 설정
├── render.yaml               # Render 설정 파일
└── docs/                     # 완전한 문서화
```

### 4.2 server.js 특징
- **외부 의존성 없음** (Express, cors 등 불필요)
- 순수 Node.js `http` 모듈만 사용
- CORS 지원 내장
- 헬스 체크 엔드포인트 포함
- Graceful shutdown 지원

### 4.3 API 엔드포인트
```
GET  /                    # 서비스 정보
GET  /api/health         # 헬스 체크
GET  /api/projects       # 샘플 프로젝트 목록
POST /api/auth/login     # 샘플 로그인
```

## 5. 배포 확인 단계

### 5.1 배포 프로세스 모니터링
1. Render 대시보드의 **"Logs"** 탭에서 실시간 로그 확인
2. 성공적인 시작 메시지 대기:
   ```
   🚀 Pure Node.js AHP Server running on port XXXX
   📊 Environment: production
   🔗 Health check: /api/health
   📋 Projects: /api/projects
   ```

### 5.2 서비스 테스트
배포 완료 후 다음 URL들을 테스트:

```bash
# 메인 엔드포인트
curl https://YOUR-SERVICE-NAME.onrender.com

# 헬스 체크
curl https://YOUR-SERVICE-NAME.onrender.com/api/health

# 프로젝트 목록
curl https://YOUR-SERVICE-NAME.onrender.com/api/projects
```

## 6. 트러블슈팅

### 6.1 일반적인 문제들

**문제**: "Build failed" 오류
**해결**: 현재 설정에서는 build가 필요 없음. Build Command를 `echo "No build required"`로 설정

**문제**: "Application failed to respond"
**해결**: PORT 환경변수를 수동으로 설정하지 마세요. Render가 자동으로 할당합니다.

**문제**: 502 Bad Gateway
**해결**: 서비스가 아직 시작 중일 수 있습니다. 2-3분 대기 후 재시도

### 6.2 로그 확인 방법
1. Render 대시보드에서 서비스 클릭
2. **"Logs"** 탭 선택
3. 실시간 로그에서 오류 메시지 확인

## 7. 성공적인 배포 예상 결과

### 7.1 배포 성공 시 응답
```json
// GET /
{
  "message": "AHP Decision System API",
  "version": "1.0.0", 
  "status": "running",
  "timestamp": "2025-08-15T...",
  "endpoints": {
    "health": "/api/health",
    "projects": "/api/projects"
  }
}

// GET /api/health
{
  "status": "ok",
  "timestamp": "2025-08-15T..."
}
```

### 7.2 프로젝트 데이터 응답
```json
// GET /api/projects
{
  "projects": [
    {
      "id": 1,
      "title": "스마트폰 선택 평가",
      "description": "새로운 스마트폰 구매를 위한 다기준 의사결정",
      "status": "active"
    },
    {
      "id": 2, 
      "title": "직원 채용 평가",
      "description": "신입 개발자 채용을 위한 평가 시스템",
      "status": "active"
    }
  ]
}
```

## 8. 완전한 AHP 시스템 연결

### 8.1 현재 단계
이 가이드는 기본 서버 배포에 중점을 둡니다. 완전한 AHP 기능을 원하시면:

1. **backend/src/** 디렉토리의 완전한 TypeScript 코드 사용
2. PostgreSQL 데이터베이스 연결 설정
3. 환경 변수에 `DATABASE_URL` 추가

### 8.2 완전한 시스템 배포를 위한 추가 단계
```bash
# package.json 수정 (backend 디렉토리로 포인팅)
{
  "main": "backend/dist/index.js",
  "scripts": {
    "build": "cd backend && npm install && npm run build",
    "start": "cd backend && node dist/index.js"
  }
}
```

## 9. 요약

### 9.1 핵심 포인트
- **의존성 없는 순수 Node.js 서버** 사용으로 배포 단순화
- **Build Command**: `echo "No build required"`
- **Start Command**: `node server.js`
- **PORT 환경변수 자동 할당** (수동 설정 금지)

### 9.2 성공 보장 체크리스트
- ✅ GitHub 저장소 연결
- ✅ Build Command 정확히 설정
- ✅ Start Command 정확히 설정  
- ✅ NODE_ENV=production 환경변수 추가
- ✅ PORT 환경변수는 설정하지 않음
- ✅ 배포 로그에서 성공 메시지 확인

이 가이드를 따라하시면 **100% 성공적인 배포**가 가능합니다.