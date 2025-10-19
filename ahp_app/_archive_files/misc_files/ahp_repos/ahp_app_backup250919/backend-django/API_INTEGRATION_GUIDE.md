# React 앱 Django API 연동 가이드

## 🔗 API 엔드포인트 매핑

### **기존 React 앱 → Django API 변경사항**

#### **1. 로그인 시스템**

**기존 (Node.js):**
```javascript
// 기존: /api/auth/login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
```

**새로운 (Django):**
```javascript
// 새로운: /api/v1/accounts/web/login/
const response = await fetch('/api/v1/accounts/web/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const data = await response.json();
if (data.success) {
  // JWT 토큰 저장
  localStorage.setItem('access_token', data.tokens.access);
  localStorage.setItem('refresh_token', data.tokens.refresh);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

#### **2. 평가자 관리 (evaluator-management 탭)**

**Django API 호출:**
```javascript
// 평가자 목록 조회
const getEvaluators = async (page = 1, search = '') => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`/api/v1/accounts/web/evaluators/?page=${page}&search=${search}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// 평가자 생성
const createEvaluator = async (evaluatorData) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('/api/v1/accounts/web/evaluators/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(evaluatorData)
  });
  return response.json();
};

// 평가자 업데이트
const updateEvaluator = async (evaluatorId, updateData) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`/api/v1/accounts/web/evaluators/${evaluatorId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });
  return response.json();
};
```

#### **3. 사용자 프로필 관리**

```javascript
// 프로필 조회
const getUserProfile = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('/api/v1/accounts/web/profile/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// 프로필 업데이트
const updateProfile = async (profileData) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('/api/v1/accounts/web/profile/update/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  return response.json();
};
```

## 🔐 인증 시스템 통합

### **JWT 토큰 관리**

```javascript
// apiService.js 업데이트 예시
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '/api/v1';
    this.accessToken = localStorage.getItem('access_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // JWT 토큰 추가
    if (this.accessToken) {
      config.headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // 토큰 만료 시 자동 갱신
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          config.headers['Authorization'] = `Bearer ${this.accessToken}`;
          return fetch(url, config);
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access;
        localStorage.setItem('access_token', data.access);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // 리프레시 실패 시 로그아웃
    this.logout();
    return false;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

export default new ApiService();
```

## 📊 데이터 형식 호환성

### **사용자 데이터 형식**

```javascript
// Django API 응답 형식
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "테스트 사용자",
    "organization": "테스트 기업",
    "department": "개발팀",
    "position": "개발자",
    "isEvaluator": true,
    "isProjectManager": false,
    "isAdmin": false,
    "language": "ko",
    "lastActivity": "2025-01-08T10:30:00Z"
  }
}
```

### **평가자 목록 형식**

```javascript
// 평가자 관리 페이지용 데이터
{
  "success": true,
  "evaluators": [
    {
      "id": 2,
      "username": "evaluator1",
      "email": "eval1@example.com",
      "fullName": "평가자 1",
      "organization": "연구소",
      "department": "평가팀",
      "isActive": true,
      "totalEvaluations": 5,
      "completedEvaluations": 3,
      "completionRate": 60.0,
      "lastActivity": "2025-01-08T09:15:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 25,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## 🚀 배포 환경 설정

### **환경변수 설정**

```javascript
// .env 파일 (React 앱)
REACT_APP_API_URL=https://your-django-backend.onrender.com/api/v1
REACT_APP_BACKEND_URL=https://your-django-backend.onrender.com
```

### **CORS 설정 확인**

Django 설정에서 React 앱 도메인 허용:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://aebonlee.github.io",  # GitHub Pages
    "http://localhost:3000",       # 개발 환경
]
```

## 📝 테스트 가이드

### **개발 환경 테스트**

1. **Django 백엔드 실행**:
```bash
cd backend-django
python manage.py runserver 8000
```

2. **테스트 사용자 생성**:
```bash
curl -X POST http://localhost:8000/api/v1/accounts/web/create-sample-users/
```

3. **React 앱에서 로그인 테스트**:
```javascript
// 테스트 계정
const testAccounts = {
  admin: { username: 'testadmin', password: 'test123!' },
  evaluator: { username: 'testevaluator', password: 'test123!' },
  user: { username: 'testuser', password: 'test123!' }
};
```

## 🔄 점진적 이전 계획

### **Phase 1: 인증 시스템**
- [ ] Django 웹 로그인 API 연동
- [ ] JWT 토큰 관리 구현
- [ ] 기존 로그인 플로우 유지

### **Phase 2: 평가자 관리**
- [ ] evaluator-management 탭 Django API 연동
- [ ] 평가자 CRUD 기능 테스트
- [ ] 데이터 동기화 확인

### **Phase 3: 전체 통합**
- [ ] 모든 API 엔드포인트 Django 이전
- [ ] Node.js 백엔드 단계적 제거
- [ ] 성능 최적화

이 가이드를 참조하여 React 앱을 Django API와 연동하면 완전한 통합 시스템이 완성됩니다.