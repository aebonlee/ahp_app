# 기술 아키텍처 문서

## 📅 문서 작성일
**2024년 12월 18일**

## 🏗️ 시스템 아키텍처 개요

### 전체 구조
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│  (GitHub Pages) │◄──►│   (Render.com)  │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ React + TypeScript│   │ Node.js + Express│   │ Render.com DB   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 기술 스택

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 4.9.5
- **Build Tool**: Create React App
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Pages
- **Package Manager**: npm

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **CORS**: cors middleware
- **Deployment**: Render.com

### Database
- **DBMS**: PostgreSQL 15+
- **ORM**: Native SQL queries (pg library)
- **Hosting**: Render.com Managed PostgreSQL
- **Connection Pooling**: pg.Pool

### DevOps & Deployment
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (자동 배포)
- **Frontend Hosting**: GitHub Pages
- **Backend Hosting**: Render.com
- **Domain**: Custom subdomain

## 📁 프로젝트 구조

### Frontend Structure
```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/          # 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── admin/           # 관리자 컴포넌트
│   │   │   ├── PersonalServiceDashboard.tsx
│   │   │   ├── EnhancedEvaluatorManagement.tsx
│   │   │   └── SurveyLinkManager.tsx
│   │   ├── auth/            # 인증 관련
│   │   ├── evaluation/      # 평가 관련
│   │   └── subscription/    # 구독 관련
│   ├── config/
│   │   └── api.ts          # API 설정
│   ├── types/              # TypeScript 타입 정의
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

### Backend Structure
```
backend/
├── src/
│   ├── routes/             # API 라우터
│   │   ├── projects.ts
│   │   ├── evaluators.ts
│   │   └── auth.ts
│   ├── middleware/         # 미들웨어
│   │   └── auth.ts
│   ├── database/           # 데이터베이스
│   │   └── connection.ts
│   ├── types/              # 타입 정의
│   └── server.ts
├── package.json
└── tsconfig.json
```

## 🗄️ 데이터베이스 설계

### 핵심 테이블 구조

#### users 테이블
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK(role IN ('admin', 'evaluator')) NOT NULL DEFAULT 'evaluator',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### projects 테이블
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  objective TEXT,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  evaluation_mode VARCHAR(20) DEFAULT 'practical',
  workflow_stage VARCHAR(20) DEFAULT 'creating',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 관계형 모델링
- **1:N 관계**: User → Projects (한 사용자가 여러 프로젝트 소유)
- **N:M 관계**: Projects ↔ Evaluators (다대다 관계)
- **계층 구조**: Criteria (부모-자식 관계)

### 인덱스 최적화
```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_projects_admin_id ON projects(admin_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_evaluators_project_id ON project_evaluators(project_id);
```

## 🔐 보안 아키텍처

### 인증 & 인가
- **JWT 토큰**: Stateless 인증
- **Role-based Access Control**: admin/evaluator 역할 구분
- **토큰 만료**: 보안을 위한 시간 제한

### API 보안
```typescript
// 인증 미들웨어
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

### 데이터 보호
- **CORS 설정**: 허용된 도메인만 접근
- **Input Validation**: express-validator로 입력 검증
- **SQL Injection 방지**: Parameterized queries
- **XSS 방지**: React의 자동 escaping

## 📡 API 설계 원칙

### RESTful API
- **Resource-based URLs**: `/api/projects`, `/api/evaluators`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 적절한 HTTP 상태 코드 사용
- **JSON Format**: 일관된 응답 형식

### API 응답 형식
```typescript
// 성공 응답
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}

// 오류 응답
{
  "success": false,
  "error": "Error message",
  "details": [...] // 상세 오류 정보
}
```

### 버전 관리
- URL 기반 버전 관리: `/api/v1/projects`
- 하위 호환성 유지

## 🚀 배포 아키텍처

### Frontend (GitHub Pages)
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/build
```

### Backend (Render.com)
- **Auto-deploy**: GitHub 연동으로 자동 배포
- **Environment Variables**: 환경 변수 관리
- **Health Checks**: 서비스 상태 모니터링

### Database (Render.com PostgreSQL)
- **Managed Service**: 자동 백업 및 관리
- **Connection Pooling**: 성능 최적화
- **SSL Connection**: 보안 연결

## 📊 상태 관리 아키텍처

### Frontend State Management
```typescript
// React Hook 기반 상태 관리
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// 이중 백업 시스템
useEffect(() => {
  loadProjects().catch(() => {
    // 백엔드 실패 시 localStorage에서 복구
    const backup = localStorage.getItem('projects_backup');
    if (backup) setProjects(JSON.parse(backup));
  });
}, []);
```

### 데이터 동기화
- **실시간 동기화**: 메뉴 변경 시 자동 리로드
- **Optimistic Updates**: 즉시 UI 업데이트
- **Error Recovery**: 실패 시 이전 상태 복구

## 🔧 개발 도구 및 환경

### 개발 환경 설정
```bash
# 프론트엔드 개발 서버
cd frontend
npm start  # http://localhost:3000

# 백엔드 개발 서버  
cd backend
npm run dev  # http://localhost:5000
```

### 코드 품질 관리
- **ESLint**: 코드 스타일 검사
- **TypeScript**: 타입 안전성
- **Prettier**: 코드 포맷팅

### 빌드 최적화
```javascript
// webpack.config.js (Create React App 내장)
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  performance: {
    maxAssetSize: 500000,
    maxEntrypointSize: 500000,
  },
};
```

## 📈 성능 최적화 전략

### Frontend 최적화
- **Code Splitting**: React.lazy()로 동적 로딩
- **Memoization**: React.memo()로 불필요한 렌더링 방지
- **Bundle Size**: 번들 크기 최적화

### Backend 최적화
- **Connection Pooling**: 데이터베이스 연결 풀링
- **Query Optimization**: 효율적인 SQL 쿼리
- **Caching**: 메모리 캐싱 전략

### Database 최적화
- **Indexing**: 적절한 인덱스 설계
- **Query Plan**: 실행 계획 분석
- **Connection Management**: 연결 관리 최적화

## 🔄 데이터 플로우

### 프로젝트 생성 플로우
```
User Input → Form Validation → API Request → Database Insert → Response → UI Update → localStorage Backup
```

### 인증 플로우
```
Login Form → Credentials → JWT Token → localStorage → API Headers → Backend Verification
```

### 오류 처리 플로우
```
API Error → Error Handling → User Notification → Fallback Data → Recovery Strategy
```

## 🔮 확장성 고려사항

### 수평 확장
- **Stateless Backend**: 서버 인스턴스 확장 가능
- **Database Scaling**: 읽기 전용 복제본 활용
- **CDN**: 정적 자원 분산

### 수직 확장
- **Resource Optimization**: 메모리 및 CPU 최적화
- **Query Performance**: 데이터베이스 성능 튜닝
- **Caching Strategy**: 다계층 캐싱

### 미래 기술 도입
- **GraphQL**: REST API 대체 검토
- **Microservices**: 서비스 분할 고려
- **Container**: Docker 컨테이너화
- **Serverless**: 서버리스 아키텍처 검토

---

**문서 작성일**: 2024년 12월 18일  
**작성자**: Claude Code (AI Assistant)  
**버전**: 1.0  
**상태**: ✅ 현재 운영 중인 아키텍처