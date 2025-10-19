# AHP 플랫폼 개발 보고서
**날짜**: 2025-09-26  
**버전**: 4차 개발  
**개발자**: Claude AI + 사용자  

---

## 📋 개요

이 보고서는 2025년 9월 26일에 완료된 AHP (Analytic Hierarchy Process) 플랫폼의 4차 개발 내용을 정리한 문서입니다. 이번 개발에서는 **완전한 회원 관리 시스템 구축**, **JWT 기반 인증**, **모드 전환 기능** 등 핵심 기능들을 완성했습니다.

---

## 🎯 개발 목표

### 1차 목표: 회원 관리 시스템 구축
- ✅ Custom User 모델 생성
- ✅ 역할 기반 권한 시스템 (RBAC)
- ✅ JWT 인증 시스템

### 2차 목표: 프론트엔드-백엔드 완전 통합
- ✅ TypeScript 타입 정의
- ✅ authService 생성
- ✅ 토큰 기반 인증 통합

### 3차 목표: 사용자 경험 개선
- ✅ 모드 전환 기능 (서비스 모드 ↔ 평가자 모드)
- ✅ 자동 토큰 갱신
- ✅ 프로젝트 폴더 정리

---

## 🏗️ 시스템 아키텍처

### 전체 구조
```
┌─────────────────────────────────────────────────────┐
│                   GitHub Pages                       │
│              (프론트엔드 호스팅)                      │
│         https://aebonlee.github.io/ahp_app          │
└────────────────┬────────────────────────────────────┘
                 │ HTTP/HTTPS
                 │ JWT Token
                 ▼
┌─────────────────────────────────────────────────────┐
│                  Render.com                          │
│              (Django 백엔드)                          │
│      https://ahp-django-backend.onrender.com        │
└────────────────┬────────────────────────────────────┘
                 │ PostgreSQL
                 ▼
┌─────────────────────────────────────────────────────┐
│            PostgreSQL Database                       │
│              (데이터 저장)                            │
└─────────────────────────────────────────────────────┘
```

### 백엔드 구조
```
ahp_django_service_updated/
├── accounts/              # 회원 관리 앱 (NEW)
│   ├── models.py         # User, UserProfile, UserActivityLog
│   ├── serializers.py    # 사용자 직렬화
│   ├── views.py          # 인증 API (register, login, logout)
│   ├── permissions.py    # 권한 클래스
│   └── urls.py           # /api/auth/* 엔드포인트
├── projects/             # 프로젝트 관리 앱
│   ├── models.py         # Project, Criteria, Alternative, etc.
│   ├── serializers.py    # 데이터 직렬화
│   ├── views.py          # 프로젝트 API
│   └── urls.py           # /api/v1/* 엔드포인트
├── ahp_backend/          # Django 설정
│   ├── settings.py       # JWT, CORS, 데이터베이스 설정
│   └── urls.py           # URL 라우팅
└── requirements.txt      # Python 패키지
```

### 프론트엔드 구조
```
ahp_frontend_src/
├── components/           # React 컴포넌트
│   ├── auth/            # 로그인, 회원가입
│   ├── admin/           # 관리자 대시보드
│   ├── evaluator/       # 평가자 대시보드
│   └── layout/          # Layout, Header, Sidebar
├── services/            # API 서비스
│   ├── authService.ts   # 인증 서비스 (NEW)
│   └── sessionService.ts
├── types/               # TypeScript 타입 정의
│   └── index.ts         # User, Project, Criteria, etc. (NEW)
├── config/
│   └── api.ts           # API 엔드포인트 설정
└── App.tsx              # 메인 앱 컴포넌트
```

---

## 🔐 회원 관리 시스템

### User 모델 설계

#### 역할 (Role) 구조
```python
ROLE_CHOICES = [
    ('super_admin', '슈퍼 관리자'),      # 시스템 전체 관리
    ('service_admin', '서비스 관리자'),  # 서비스 관리 + 평가자 모드 가능
    ('service_user', '서비스 사용자'),   # 프로젝트 생성 + 평가자 모드 가능
    ('evaluator', '평가자'),            # 평가만 가능
]
```

#### User 모델 필드
```python
class User(AbstractUser):
    # 기본 정보
    username            # 사용자명 (로그인 ID)
    email               # 이메일
    first_name          # 이름
    last_name           # 성
    
    # 역할 및 권한
    role                # 역할 (super_admin, service_admin, etc.)
    is_verified         # 이메일 인증 여부
    can_create_projects # 프로젝트 생성 권한
    max_projects        # 최대 프로젝트 수 (기본 5개)
    
    # 조직 정보
    organization        # 조직명
    department          # 부서
    position            # 직급
    phone               # 전화번호
    
    # 프로필
    profile_image       # 프로필 이미지
    bio                 # 자기소개
    
    # 메타데이터
    last_login_ip       # 마지막 로그인 IP
    created_at          # 가입일
    updated_at          # 수정일
```

#### UserProfile 모델
```python
class UserProfile(models.Model):
    user                        # User와 1:1 관계
    
    # 알림 설정
    email_notifications         # 이메일 알림
    evaluation_reminders        # 평가 알림
    project_updates             # 프로젝트 업데이트 알림
    
    # 환경 설정
    language                    # 언어 (ko/en)
    timezone                    # 시간대
    
    # 통계
    total_evaluations           # 총 평가 수
    total_projects_owned        # 소유 프로젝트 수
    total_projects_participated # 참여 프로젝트 수
```

#### UserActivityLog 모델
```python
class UserActivityLog(models.Model):
    user                # 사용자
    action              # 행동 (login, logout, project_create, etc.)
    description         # 설명
    ip_address          # IP 주소
    user_agent          # 브라우저 정보
    metadata            # 추가 메타데이터 (JSON)
    created_at          # 생성일
```

### 권한 시스템

#### 권한 클래스 (accounts/permissions.py)
```python
# 슈퍼 관리자 권한
class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'super_admin'

# 서비스 관리자 권한
class IsServiceAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['super_admin', 'service_admin']

# 서비스 사용자 권한
class IsServiceUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['super_admin', 'service_admin', 'service_user']

# 프로젝트 소유자 권한
class IsProjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

# 프로젝트 생성 권한
class CanCreateProject(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.can_create_new_project()
```

#### 권한 적용 예시
```python
class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, CanCreateProject]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['super_admin', 'service_admin']:
            return Project.objects.all()  # 관리자는 전체 조회
        return Project.objects.filter(owner=user)  # 일반 사용자는 자신 것만
```

---

## 🔑 JWT 인증 시스템

### JWT 설정 (settings.py)
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),      # 액세스 토큰: 1시간
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),      # 리프레시 토큰: 7일
    'ROTATE_REFRESH_TOKENS': True,                    # 토큰 갱신 시 새로운 리프레시 토큰 발급
    'BLACKLIST_AFTER_ROTATION': True,                 # 기존 리프레시 토큰 블랙리스트 처리
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### 인증 API 엔드포인트

#### 회원가입 (`POST /api/auth/register/`)
```json
// Request
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "password2": "SecurePassword123!",
  "first_name": "홍",
  "last_name": "길동",
  "phone": "010-1234-5678",
  "organization": "ABC 대학교",
  "role": "service_user"
}

// Response
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "홍",
    "last_name": "길동",
    "role": "service_user",
    "can_create_projects": true,
    "max_projects": 5
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### 로그인 (`POST /api/auth/login/`)
```json
// Request
{
  "username": "testuser",
  "password": "SecurePassword123!"
}

// Response
{
  "user": { /* 사용자 정보 */ },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### 로그아웃 (`POST /api/auth/logout/`)
```json
// Request
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

// Response
{
  "message": "로그아웃되었습니다."
}
```

#### 토큰 갱신 (`POST /api/auth/token/refresh/`)
```json
// Request
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

// Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."  // 새로운 리프레시 토큰
}
```

#### 현재 사용자 정보 (`GET /api/auth/users/me/`)
```json
// Request Header
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

// Response
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "first_name": "홍",
  "last_name": "길동",
  "role": "service_user",
  "profile": {
    "email_notifications": true,
    "language": "ko",
    "timezone": "Asia/Seoul"
  }
}
```

---

## 💻 프론트엔드 인증 통합

### authService 구조

```typescript
// services/authService.ts
class AuthService {
  // 토큰 관리
  setTokens(tokens: AuthTokens): void
  getAccessToken(): string | null
  getRefreshToken(): string | null
  clearTokens(): void
  
  // 인증 API
  register(data: RegisterData): Promise<LoginResponse>
  login(username: string, password: string): Promise<LoginResponse>
  logout(): Promise<void>
  
  // 토큰 갱신
  refreshAccessToken(): Promise<string>
  
  // 사용자 정보
  getCurrentUser(): Promise<User>
  
  // 인증된 요청 (자동 토큰 갱신 포함)
  authenticatedFetch(url: string, options?: RequestInit): Promise<Response>
  
  // 상태 확인
  isAuthenticated(): boolean
}
```

### 자동 토큰 갱신 로직

```typescript
async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = this.getAccessToken();
  
  // 첫 번째 시도
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  // 401 에러이고 refresh token이 있으면 토큰 갱신 시도
  if (response.status === 401 && this.getRefreshToken()) {
    try {
      const newAccessToken = await this.refreshAccessToken();
      
      // 새 토큰으로 재시도
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`,
        },
      });
    } catch (error) {
      // 토큰 갱신 실패 시 로그아웃
      this.clearTokens();
      throw new Error('Authentication failed. Please login again.');
    }
  }
  
  return response;
}
```

### App.tsx 인증 통합

```typescript
// 페이지 로드 시 자동 로그인
useEffect(() => {
  const autoLogin = async () => {
    if (user) return;
    
    if (authService.isAuthenticated()) {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        sessionService.startSession();
      } catch (error) {
        authService.clearTokens();
      }
    }
  };
  
  if (isNavigationReady) {
    autoLogin();
  }
}, [isNavigationReady, user]);

// 로그인 핸들러
const handleLogin = async (username: string, password: string) => {
  try {
    const result = await authService.login(username, password);
    setUser(result.user);
    sessionService.startSession();
    
    // 역할에 따라 적절한 페이지로 이동
    const targetTab = result.user.role === 'evaluator' 
      ? 'evaluator-dashboard' 
      : 'personal-service';
    setActiveTab(targetTab);
    
    await fetchProjects();
  } catch (error) {
    setLoginError(error.message);
  }
};

// 로그아웃 핸들러
const handleLogout = async () => {
  await sessionService.logout();
  await authService.logout();
  
  setUser(null);
  setActiveTab('home');
  // ... 상태 초기화
};
```

---

## 🔄 모드 전환 기능

### 개념
`service_admin`과 `service_user`는 두 가지 모드를 전환할 수 있습니다:
- **서비스 모드**: 프로젝트 생성, 모델 구축, 평가자 관리, 결과 분석
- **평가자 모드**: 평가 대시보드, 쌍대비교 평가, 직접입력 평가

### 구현

#### App.tsx
```typescript
const [viewMode, setViewMode] = useState<'service' | 'evaluator'>('service');

const handleModeSwitch = (targetMode: 'service' | 'evaluator') => {
  if (!user) return;
  
  // service_admin과 service_user만 모드 전환 가능
  if (user.role === 'service_admin' || user.role === 'service_user') {
    setViewMode(targetMode);
    
    if (targetMode === 'evaluator') {
      setActiveTab('evaluator-mode');
    } else {
      setActiveTab('personal-service');
    }
    
    console.log(`🔄 모드 전환: ${targetMode}`);
  }
};
```

#### Sidebar.tsx
```typescript
const getMenuItems = () => {
  if (userRole === 'super_admin') {
    return superAdminMenuItems;
  } else if (userRole === 'service_admin' || userRole === 'service_user') {
    // viewMode에 따라 메뉴 전환
    if (viewMode === 'evaluator') {
      return evaluatorMenuItems;
    }
    return serviceAdminMenuItems;
  } else if (userRole === 'evaluator') {
    return evaluatorMenuItems;
  }
  return serviceAdminMenuItems;
};

// 모드 전환 버튼
const serviceAdminMenuItems = [
  // ... 기존 메뉴
  ...(canSwitchModes ? [
    { id: 'mode-switch-to-evaluator', label: '평가자 모드로 전환', icon: '⚖️' }
  ] : [])
];

const evaluatorMenuItems = [
  // ... 기존 메뉴
  ...(canSwitchModes ? [
    { id: 'mode-switch-to-service', label: '서비스 모드로 전환', icon: '🏠' }
  ] : [])
];
```

#### 메뉴 구조

**서비스 모드 메뉴:**
- 내 대시보드
- 사용자 가이드
- 내 프로젝트
- 새 프로젝트
- 모델 구축
- 평가자 관리
- 진행률 모니터링
- 결과 분석
- 보고서 내보내기
- ⚖️ **평가자 모드로 전환**

**평가자 모드 메뉴:**
- 평가자 홈
- 할당된 프로젝트
- 쌍대비교 평가
- 직접입력 평가
- 내 평가 현황
- 평가 이력
- 일관성 검증
- 평가 가이드
- 🏠 **서비스 모드로 전환**

---

## 📁 프로젝트 구조 정리

### 정리 전 구조 문제점
- 루트 디렉토리에 26개 이상의 배포 관련 문서
- 여러 백업 폴더들 (ahp-platform, ahp-platform_0908, backupdata)
- 이전 버전 Django 폴더들 (ahp_backend, ahp_build, etc.)
- 임시 스크립트 파일들 (.txt, .py)

### 정리 후 구조
```
D:\ahp\
├── CLAUDE.md                        # 프로젝트 관리 규칙
├── ahp_django_service_updated/      # 현재 Django 백엔드
├── ahp_frontend_src/                # 프론트엔드 소스
├── ahp_frontend_public/             # 프론트엔드 빌드 결과
├── ahp_app/                         # 배포된 앱
├── ahp_package.json                 # 패키지 설정
├── docs_09/                         # 최신 개발 문서
├── conts/                           # 이전 버전 및 백업 (NEW)
│   ├── ahp-platform/               # 이전 개발 버전
│   ├── ahp-platform_0908/          # 백업
│   ├── backupdata/                 # 백업 데이터
│   ├── ahp_backend/                # 이전 Django 설정
│   ├── ahp_build/                  # 이전 빌드
│   ├── apps/                       # 이전 앱 구조
│   ├── RENDER_*.md                 # 배포 관련 문서들
│   ├── POSTGRESQL_*.md             # DB 설정 문서들
│   └── *.txt, *.py                 # 임시 스크립트들
├── manage.py                        # Django 관리 명령
├── requirements.txt                 # Python 패키지
└── test_api_integration.html        # API 테스트 파일
```

### 정리 효과
- ✅ 루트 디렉토리 깔끔하게 정리
- ✅ 현재 개발 중인 파일만 노출
- ✅ GitHub 저장소 가독성 향상
- ✅ 이전 버전들은 `conts` 폴더에 보관
- ✅ 필요 시 이전 버전 참조 가능

---

## 🔧 기술 스택

### 백엔드
- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **인증**: djangorestframework-simplejwt 5.3.0
- **데이터베이스**: PostgreSQL 17 (Render.com)
- **ORM**: Django ORM
- **CORS**: django-cors-headers 4.3.1
- **이미지 처리**: Pillow 10.1.0

### 프론트엔드
- **Framework**: React 18
- **언어**: TypeScript
- **상태 관리**: React Hooks (useState, useEffect, useCallback)
- **HTTP 클라이언트**: Fetch API
- **스타일링**: CSS Modules + Tailwind (일부)
- **빌드**: Create React App

### 배포
- **프론트엔드**: GitHub Pages (https://aebonlee.github.io/ahp_app)
- **백엔드**: Render.com (https://ahp-django-backend.onrender.com)
- **데이터베이스**: Render.com PostgreSQL
- **CI/CD**: GitHub Actions (프론트엔드 자동 배포)

---

## 📊 데이터 모델

### ERD (Entity Relationship Diagram)
```
┌─────────────────┐
│      User       │
│  (accounts앱)   │
├─────────────────┤
│ PK: id          │
│    username     │
│    email        │
│    role         │
│    ...          │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────┴────────┐      N        ┌─────────────────┐
│    Project      │◄───────────────┤   Evaluator     │
├─────────────────┤                ├─────────────────┤
│ PK: id          │                │ PK: id          │
│ FK: owner       │                │ FK: project     │
│    title        │                │ FK: user        │
│    status       │                │    name         │
│    ...          │                │    email        │
└────────┬────────┘                │    access_key   │
         │ 1                       │    ...          │
         │                         └─────────────────┘
         │ N
┌────────┴────────┐
│    Criteria     │
├─────────────────┤
│ PK: id          │
│ FK: project     │
│ FK: parent      │
│    name         │
│    level        │
│    weight       │
│    ...          │
└─────────────────┘

┌─────────────────┐
│   Alternative   │
├─────────────────┤
│ PK: id          │
│ FK: project     │
│    name         │
│    description  │
│    ...          │
└─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│   Comparison    │      │ComparisonMatrix │
├─────────────────┤      ├─────────────────┤
│ PK: id          │      │ PK: id          │
│ FK: project     │      │ FK: project     │
│ FK: evaluator   │      │ FK: evaluator   │
│ FK: criteria    │      │ FK: criteria    │
│    item1        │      │    matrix_data  │
│    item2        │      │    ...          │
│    value        │      └─────────────────┘
│    ...          │
└─────────────────┘

┌─────────────────┐
│     Result      │
├─────────────────┤
│ PK: id          │
│ FK: project     │
│ FK: evaluator   │
│    weights      │
│    rankings     │
│    cr          │
│    ...          │
└─────────────────┘
```

---

## 🧪 테스트 가이드

### 백엔드 API 테스트

#### 1. 회원가입 테스트
```bash
curl -X POST https://ahp-django-backend.onrender.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#",
    "password2": "Test123!@#",
    "first_name": "테스트",
    "last_name": "사용자",
    "role": "service_user"
  }'
```

#### 2. 로그인 테스트
```bash
curl -X POST https://ahp-django-backend.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

#### 3. 프로젝트 목록 조회 (인증 필요)
```bash
curl -X GET https://ahp-django-backend.onrender.com/api/v1/projects/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. 토큰 갱신
```bash
curl -X POST https://ahp-django-backend.onrender.com/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

### 프론트엔드 테스트

#### 1. 로그인 테스트
1. https://aebonlee.github.io/ahp_app 접속
2. 로그인 버튼 클릭
3. 사용자명과 비밀번호 입력
4. 로그인 성공 시 대시보드로 이동 확인

#### 2. 모드 전환 테스트
1. `service_admin` 또는 `service_user`로 로그인
2. 사이드바 하단의 "평가자 모드로 전환" 클릭
3. 메뉴가 평가자 메뉴로 변경되는지 확인
4. "서비스 모드로 전환" 클릭하여 다시 전환

#### 3. 자동 토큰 갱신 테스트
1. 로그인 후 1시간 대기 (또는 액세스 토큰 수동 만료)
2. API 요청 시도
3. 자동으로 토큰이 갱신되는지 확인
4. Network 탭에서 `/api/auth/token/refresh/` 호출 확인

---

## 🚀 배포 가이드

### 백엔드 배포 (Render.com)

#### 1. 환경 변수 설정
```
SECRET_KEY=your-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://user:password@host:port/database
CORS_ALLOW_ALL_ORIGINS=False
```

#### 2. 빌드 명령
```bash
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

#### 3. 시작 명령
```bash
gunicorn ahp_backend.wsgi:application
```

### 프론트엔드 배포 (GitHub Pages)

#### 1. GitHub Actions 워크플로우
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build:frontend
        env:
          REACT_APP_API_URL: https://ahp-django-backend.onrender.com
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./ahp_app
```

#### 2. 수동 배포
```bash
# 빌드
npm run build:frontend

# Git에 커밋
git add ahp_frontend_src/ ahp_frontend_public/ ahp_package.json
git commit -m "feat: 인증 시스템 통합"
git push origin main
```

---

## 📈 성능 최적화

### 백엔드 최적화
- ✅ JWT 토큰 기반 인증 (세션 저장소 불필요)
- ✅ 데이터베이스 인덱싱 (User.username, User.email)
- ✅ 권한 기반 쿼리 필터링 (불필요한 데이터 조회 방지)
- 🔄 Redis 캐싱 (향후 도입 예정)
- 🔄 쿼리 최적화 (select_related, prefetch_related)

### 프론트엔드 최적화
- ✅ 컴포넌트 메모이제이션 (useCallback, useMemo)
- ✅ 토큰 localStorage 저장 (페이지 새로고침 시 재로그인 불필요)
- ✅ 자동 토큰 갱신 (사용자 경험 개선)
- 🔄 Code splitting (React.lazy, Suspense)
- 🔄 이미지 최적화

---

## 🐛 알려진 이슈

### 높은 우선순위
1. **LoginForm/RegisterForm 컴포넌트 업데이트 필요**
   - 현재: email 기반 로그인
   - 변경 필요: username 기반 로그인

2. **API 엔드포인트 불일치**
   - 프론트엔드 일부: `/api/service/auth/`
   - 백엔드: `/api/auth/`
   - 해결: config/api.ts 업데이트 필요

3. **기존 User 데이터 마이그레이션**
   - 백엔드 배포 시 기존 사용자 데이터 마이그레이션 계획 필요

### 중간 우선순위
1. **토큰 만료 시 UX 개선**
   - 현재: 자동 갱신 실패 시 로그아웃
   - 개선: 로그인 페이지로 리다이렉트 + 안내 메시지

2. **모드 전환 시 URL 파라미터 처리**
   - 현재: 탭 전환만 처리
   - 개선: URL에 모드 정보 포함

### 낮은 우선순위
1. 코드 주석 정리
2. console.log 제거
3. TypeScript strict 모드 설정

---

## 📚 향후 개발 계획

### Phase 1: 기본 기능 완성 (1-2주)
- 프로젝트 CRUD 완전 구현
- 기준 계층 구조 편집
- 대안 관리
- 평가자 초대 시스템

### Phase 2: 평가 시스템 (2-3주)
- 쌍대비교 평가 개선
- 일관성 검증
- 그룹 의사결정
- 비교 행렬 시각화

### Phase 3: 결과 분석 (2주)
- 결과 대시보드
- 민감도 분석
- 데이터 시각화
- 보고서 생성 (PDF, Excel)

### Phase 4: 고급 기능 (3-4주)
- 실시간 협업 (WebSocket)
- 이메일 알림 시스템
- 대시보드 개인화
- 데이터 백업/복원

### Phase 5: 시스템 관리 (2주)
- 슈퍼 관리자 기능
- 모니터링 및 로깅
- 보안 강화 (2FA)

---

## 🎓 학습 내용

### Django REST Framework
- Custom User 모델 생성 및 마이그레이션
- JWT 인증 시스템 구현
- 권한 클래스 작성
- 시그널을 이용한 자동 프로필 생성
- 역할 기반 접근 제어 (RBAC)

### React + TypeScript
- TypeScript 인터페이스 및 타입 정의
- 서비스 계층 패턴
- JWT 토큰 자동 갱신 로직
- localStorage를 이용한 토큰 관리
- 컴포넌트 props 타입 안정성

### 아키텍처 패턴
- 프론트엔드-백엔드 분리 아키텍처
- RESTful API 설계
- 토큰 기반 인증 (Stateless Authentication)
- 권한 기반 데이터 필터링

---

## 🙏 감사의 말

이 프로젝트는 사용자와 Claude AI의 협업으로 완성되었습니다. 사용자의 명확한 요구사항과 피드백, 그리고 Claude의 기술적 구현이 결합하여 체계적인 AHP 플랫폼을 만들어냈습니다.

특히 이번 4차 개발에서는:
- ✅ "제대로 된 회원 DB 구축"이라는 명확한 목표
- ✅ "모드 전환" 기능에 대한 구체적인 요구사항
- ✅ 프로젝트 정리에 대한 실용적인 접근

이러한 요소들이 성공적인 개발을 이끌었습니다.

---

## 📞 문의 및 지원

### GitHub 저장소
- Frontend: https://github.com/aebonlee/ahp_app
- Issues: https://github.com/aebonlee/ahp_app/issues

### 배포 URL
- Frontend: https://aebonlee.github.io/ahp_app
- Backend: https://ahp-django-backend.onrender.com
- API Docs: https://ahp-django-backend.onrender.com/api/

---

**작성일**: 2025-09-26  
**버전**: 4.0.0  
**상태**: 개발 진행 중  
**다음 마일스톤**: 백엔드 배포 및 통합 테스트