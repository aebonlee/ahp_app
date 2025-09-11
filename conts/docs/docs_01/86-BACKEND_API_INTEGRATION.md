# 백엔드 API 연동 구현

## 📅 작업 일시
**2024년 12월 18일**

## 🎯 연동 목표
프론트엔드와 백엔드 간의 완전한 데이터 동기화 및 실시간 상태 관리 구현

## 🏗️ 아키텍처 개요

### 배포 환경
- **프론트엔드**: GitHub Pages (https://aebonlee.github.io/AHP_forPaper/)
- **백엔드**: Render.com (https://ahp-forpaper.onrender.com)
- **데이터베이스**: PostgreSQL on Render.com

### API 기본 구조
```typescript
// API 베이스 URL 설정
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://ahp-forpaper.onrender.com';
```

## 📡 구현된 API 엔드포인트

### 1. 프로젝트 관리 API

#### GET /api/projects
**목적**: 사용자의 프로젝트 목록 조회
**인증**: Bearer Token 필요

```typescript
const loadProjects = async () => {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.projects;
  }
};
```

**응답 형식**:
```json
{
  "projects": [
    {
      "id": 1,
      "title": "AI 도구 선택 분석",
      "description": "개발팀의 AI 도구 선택을 위한 AHP 분석",
      "status": "active",
      "evaluation_mode": "practical",
      "workflow_stage": "evaluating",
      "created_at": "2024-12-18T00:00:00Z",
      "evaluator_count": 5,
      "admin_name": "홍길동"
    }
  ]
}
```

#### POST /api/projects
**목적**: 새 프로젝트 생성
**인증**: Bearer Token 필요

```typescript
const createProject = async (projectData) => {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: projectData.title,
      description: projectData.description,
      objective: projectData.objective,
      evaluationMode: projectData.evaluation_mode
    })
  });
};
```

#### PUT /api/projects/:id
**목적**: 프로젝트 정보 수정

#### DELETE /api/projects/:id
**목적**: 프로젝트 삭제

### 2. 평가자 관리 API

#### GET /api/evaluators
**목적**: 평가자 목록 조회

#### POST /api/evaluators
**목적**: 새 평가자 추가

#### POST /api/evaluators/invite
**목적**: 평가자 초대 이메일 발송

```typescript
const sendInvitation = async (evaluatorId, projectId, emailContent, shortLink) => {
  const response = await fetch(`${API_BASE_URL}/api/evaluators/invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      evaluatorId,
      projectId,
      emailContent,
      shortLink
    })
  });
};
```

## 🔐 인증 시스템

### JWT 토큰 기반 인증
```typescript
// 토큰 저장
localStorage.setItem('token', authToken);

// 토큰 사용
const token = localStorage.getItem('token');
if (!token) {
  // 로그인 페이지로 리다이렉트
  return;
}
```

### 토큰 검증
모든 API 요청에서 토큰 유효성 검사
```typescript
if (!token) {
  setError('로그인이 필요합니다.');
  return;
}
```

## 📊 데이터 동기화 전략

### 1. 실시간 동기화
메뉴 변경 시 자동 데이터 리로드
```typescript
useEffect(() => {
  if (activeMenu === 'projects' || activeMenu === 'dashboard') {
    loadProjects();
  }
}, [activeMenu]);
```

### 2. 이중 백업 시스템
#### 주 저장소: PostgreSQL
```sql
-- 프로젝트 테이블 구조
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
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

#### 보조 저장소: localStorage
```typescript
// 백업 저장
localStorage.setItem('ahp_projects_backup', JSON.stringify(projects));

// 복구 시 사용
const backupData = localStorage.getItem('ahp_projects_backup');
if (backupData) {
  const backupProjects = JSON.parse(backupData);
  setProjects(backupProjects);
}
```

## 🛡️ 오류 처리

### 네트워크 오류 처리
```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  // 백업 데이터 사용
  return loadFromBackup();
}
```

### HTTP 상태 코드 처리
- **200**: 성공
- **201**: 생성 성공
- **400**: 잘못된 요청
- **401**: 인증 실패
- **403**: 권한 없음
- **404**: 리소스 없음
- **500**: 서버 오류

## 🔄 상태 관리 패턴

### Loading 상태
```typescript
const [loading, setLoading] = useState(false);

const apiCall = async () => {
  setLoading(true);
  try {
    const result = await fetch(url);
    // 처리
  } finally {
    setLoading(false);
  }
};
```

### Error 상태
```typescript
const [error, setError] = useState(null);

// 오류 발생 시
setError('데이터 로딩 중 오류가 발생했습니다.');

// 성공 시 오류 초기화
setError(null);
```

## 📈 성능 최적화

### 1. 데이터 캐싱
localStorage를 활용한 클라이언트 사이드 캐싱
```typescript
// 캐시 확인 후 API 호출
const cachedData = localStorage.getItem('projects_cache');
const cacheTime = localStorage.getItem('projects_cache_time');

if (cachedData && cacheTime) {
  const age = Date.now() - parseInt(cacheTime);
  if (age < 5 * 60 * 1000) { // 5분 캐시
    return JSON.parse(cachedData);
  }
}
```

### 2. 요청 최적화
불필요한 API 호출 방지
```typescript
// 디바운싱으로 검색 요청 최적화
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchProjects(debouncedSearch);
  }
}, [debouncedSearch]);
```

## 🧪 API 테스트

### 개발 환경 테스트
```bash
# 로컬 백엔드 서버 실행
cd backend
npm run dev

# 프론트엔드 개발 서버 실행  
cd frontend
npm start
```

### 프로덕션 환경 테스트
- Render.com 배포 상태 확인
- PostgreSQL 연결 상태 확인
- API 응답 시간 모니터링

## 📋 API 문서화

### Swagger/OpenAPI
백엔드에서 자동 생성된 API 문서 제공 예정

### 요청/응답 예시
각 엔드포인트별 상세한 요청/응답 예시 문서화

## 🔮 향후 개선 계획

### 단기 계획
- GraphQL 도입 검토
- 실시간 WebSocket 연결
- API 응답 시간 최적화

### 중기 계획  
- 마이크로서비스 아키텍처 전환
- Redis 캐싱 레이어 추가
- API 버전 관리 시스템

### 장기 계획
- 서버리스 아키텍처 검토
- CDN 활용 최적화
- 글로벌 배포 전략

## 📊 모니터링 및 로깅

### 클라이언트 사이드 로깅
```typescript
console.log('Projects loaded successfully:', projects.length);
console.error('API Error:', error);
```

### 서버 사이드 모니터링
- Render.com 내장 모니터링
- PostgreSQL 성능 추적
- API 응답 시간 측정

---

**완료 일시**: 2024년 12월 18일  
**담당자**: Claude Code (AI Assistant)  
**상태**: ✅ 프로덕션 환경 배포 완료