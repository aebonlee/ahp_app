# AHP Decision System - 개발 문서

## 프로젝트 개요

AHP(Analytic Hierarchy Process) 의사결정 지원 시스템은 복잡한 의사결정 문제를 체계적으로 분석하기 위한 웹 기반 플랫폼입니다.

### 주요 특징
- **5단계 계층 구조 지원**: 목표 → 기준 → 세부기준 → 대안까지 체계적 분석
- **쌍대비교 방법론**: 요소 간 상대적 중요도 평가
- **실시간 일관성 검증**: CR(Consistency Ratio) 자동 계산
- **역할 기반 접근 제어**: 관리자/평가자 권한 분리
- **완전 한국어 인터페이스**: 국내 사용자 최적화

## 기술 스택

### Frontend
```json
{
  "core": {
    "React": "19.1.1",
    "TypeScript": "4.9.5",
    "React Scripts": "5.0.1"
  },
  "ui": {
    "TailwindCSS": "3.4.17",
    "Recharts": "3.1.2"
  },
  "state": {
    "Zustand": "5.0.7"
  },
  "utils": {
    "XLSX": "0.18.5"
  }
}
```

### Backend
```json
{
  "runtime": {
    "Node.js": ">=18.0.0",
    "Express": "4.21.2"
  },
  "database": {
    "PostgreSQL": "latest",
    "pg": "8.x"
  },
  "auth": {
    "jsonwebtoken": "9.x",
    "bcryptjs": "2.x"
  }
}
```

## 프로젝트 구조

```
AHP_forPaper/
├── src/                      # Frontend 소스 코드
│   ├── components/          # React 컴포넌트
│   │   ├── AdminDashboard/  # 관리자 대시보드
│   │   ├── Comparison/      # 쌍대비교 UI
│   │   ├── Matrix/          # 행렬 계산 컴포넌트
│   │   └── Results/         # 결과 시각화
│   ├── hooks/              # Custom React Hooks
│   ├── services/           # API 통신 서비스
│   ├── stores/             # Zustand 상태 관리
│   ├── types/              # TypeScript 타입 정의
│   └── utils/              # 유틸리티 함수
├── backend/                 # Backend 소스 코드
│   ├── src/
│   │   ├── routes/         # API 엔드포인트
│   │   ├── services/       # 비즈니스 로직
│   │   ├── middleware/     # Express 미들웨어
│   │   └── database/       # DB 연결 및 마이그레이션
│   └── dist/              # 빌드된 백엔드 코드
├── public/                 # 정적 파일
└── docs/                   # 문서
```

## 핵심 기능 구현

### 1. AHP 계산 엔진

```typescript
// backend/src/services/ahpCalculator.ts
class AHPCalculator {
  // 고유벡터 방법으로 가중치 계산
  calculateWeights(matrix: number[][]): number[]
  
  // 일관성 비율 계산
  calculateConsistencyRatio(matrix: number[][]): number
  
  // 최종 우선순위 계산
  calculateFinalPriorities(
    criteriaWeights: number[],
    alternativeScores: number[][]
  ): number[]
}
```

### 2. 실시간 평가 시스템

```typescript
// src/components/Comparison/ComparisonMatrix.tsx
interface ComparisonMatrixProps {
  criteria: Criterion[]
  onComparisonChange: (i: number, j: number, value: number) => void
  consistencyRatio: number
}

// 실시간 CR 계산 및 경고
useEffect(() => {
  const cr = calculateCR(matrix)
  if (cr > 0.1) {
    showWarning("일관성 비율이 0.1을 초과합니다")
  }
}, [matrix])
```

### 3. 역할 기반 접근 제어

```typescript
// backend/src/middleware/auth.ts
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: '권한이 없습니다' })
    }
    next()
  }
}

// 사용 예시
router.post('/projects', 
  authenticate, 
  authorize(['admin']), 
  createProject
)
```

## 개발 환경 설정

### 1. 초기 설정

```bash
# 저장소 클론
git clone https://github.com/aebonlee/AHP_forPaper.git
cd AHP_forPaper

# 의존성 설치
npm run install:all

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집
```

### 2. 데이터베이스 설정

```bash
# PostgreSQL 설치 후
cd backend
npm run db:migrate
npm run db:seed  # 테스트 데이터 생성
```

### 3. 개발 서버 실행

```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev:all

# 개별 실행
npm start           # Frontend (포트 3000)
npm run backend:dev # Backend (포트 5000)
```

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/me` - 현재 사용자 정보

### 프로젝트 관리
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제

### 평가
- `POST /api/comparisons` - 쌍대비교 저장
- `GET /api/results/:projectId` - 결과 조회
- `POST /api/export/:projectId` - 엑셀 내보내기

## 배포

### GitHub Pages (Frontend)
```bash
npm run build
npm run deploy
```

### Render.com (Backend)
1. Render 대시보드에서 Web Service 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 활성화

### 현재 배포 URL
- Frontend: https://aebonlee.github.io/AHP_forPaper/
- Backend API: https://ahp-forpaper.onrender.com

## 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 커버리지 리포트
npm run test:coverage
```

## 성능 최적화

### 1. 코드 분할
```typescript
// React.lazy로 컴포넌트 동적 로딩
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
```

### 2. 메모이제이션
```typescript
// 복잡한 계산 결과 캐싱
const weights = useMemo(() => 
  calculateWeights(comparisonMatrix), 
  [comparisonMatrix]
)
```

### 3. 데이터베이스 인덱싱
```sql
CREATE INDEX idx_comparisons_project_id ON comparisons(project_id);
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
```

## 보안 고려사항

1. **JWT 토큰 관리**
   - HttpOnly 쿠키 사용
   - Refresh Token 구현
   - 토큰 만료 시간 설정

2. **입력 검증**
   - SQL Injection 방지 (Parameterized Queries)
   - XSS 방지 (입력 데이터 sanitization)
   - CSRF 토큰 구현

3. **환경 변수 보호**
   - `.env` 파일 git 제외
   - 프로덕션 환경 변수 별도 관리

## 트러블슈팅

### 문제 1: npm 패키지 취약점
```bash
# 해결 방법
npm audit fix --force
# xlsx 라이브러리는 대체 필요
```

### 문제 2: CORS 오류
```javascript
// backend/src/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

### 문제 3: 빌드 크기 최적화
```javascript
// 불필요한 의존성 제거
npm prune --production
// Tree shaking 활성화
```

## 향후 개발 계획

### 단기 (1-2개월)
- [ ] 테스트 커버리지 80% 달성
- [ ] PWA 지원 추가
- [ ] 다국어 지원 (영어)

### 중기 (3-6개월)
- [ ] 실시간 협업 기능
- [ ] AI 기반 일관성 개선 제안
- [ ] 모바일 앱 개발

### 장기 (6개월+)
- [ ] 기업용 엔터프라이즈 버전
- [ ] 클라우드 SaaS 전환
- [ ] API 마켓플레이스

## 기여 가이드

1. Fork 저장소
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 라이선스

MIT License - 자세한 내용은 [LICENSE](../LICENSE) 파일 참조

## 연락처

- GitHub: [@aebonlee](https://github.com/aebonlee)
- 프로젝트 링크: [https://github.com/aebonlee/AHP_forPaper](https://github.com/aebonlee/AHP_forPaper)

---

*최종 업데이트: 2025년 2월*