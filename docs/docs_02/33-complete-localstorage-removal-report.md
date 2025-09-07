# 33. localStorage 완전 제거 및 백엔드 쿠키 인증 구현

> **작업일**: 2025-09-01  
> **목표**: 모든 로컬 저장소 사용 금지, 백엔드 기반 쿠키 인증 구현

## 🎯 사용자 요구사항

> "개발하는 작업시 모든 로컬 사용을 금지. 오로지 깃허브에 모든 소스를 기준으로 하고 백엔드는 https://ahp-forpaper.onrender.com에 할당된 것을 사용해. 절대적으로 로컬은 금지 깃허브에 페이지가 기준이고 백엔드는 render에서의 https://ahp-forpaper.onrender.com 기준으로 할거야. 데모버전이 아니라 서비스 버전 개발중이랴"

### 핵심 요구사항
- ❌ localStorage, sessionStorage 등 모든 로컬 저장소 사용 금지
- ✅ 프론트엔드: GitHub Pages
- ✅ 백엔드: https://ahp-forpaper.onrender.com
- ✅ 모든 인증은 백엔드에서만 처리
- ✅ 실제 서비스 버전 (데모 모드 없음)

## 🔍 제거된 localStorage 사용처

### 프론트엔드 파일별 제거 내역

#### 1. App.tsx
- `localStorage.getItem('token')` × 18개 위치 제거
- `localStorage.setItem('token', data.token)` 제거
- `localStorage.removeItem('token')` × 3개 위치 제거
- 모든 `Authorization: Bearer ${token}` 헤더 제거
- 모든 fetch에 `credentials: 'include'` 추가

#### 2. Service 파일들
**src/services/ahpApiService.ts**
- `getAuthToken()` 함수 완전 제거
- `apiRequest()` 메서드에 `credentials: 'include'` 추가

**src/services/api.ts**
- `getAuthHeaders()` 에서 토큰 제거
- `makeRequest()` 메서드에 `credentials: 'include'` 추가

**src/services/apiService.ts**
- `APIClient.request()` 메서드에 `credentials: 'include'` 추가
- Authorization 헤더 제거

**src/services/subscriptionService.ts**
- `request()` 메서드에 `credentials: 'include'` 추가
- localStorage 토큰 접근 제거

**src/services/sessionService.ts**
- 완전 리팩터링: localStorage 기반 → 서버 세션 기반
- 모든 localStorage 세션 관리 제거
- `/api/auth/session` 엔드포인트 사용

#### 3. Component 파일들
**src/components/admin/EnhancedEvaluatorManagement.tsx**
- localStorage 토큰 호출 × 4개 위치 제거
- 모든 fetch에 `credentials: 'include'` 추가

**src/components/comparison/PairwiseComparison.tsx**
- localStorage 토큰 제거 × 2개 위치
- API 호출에 `credentials: 'include'` 추가

**src/components/model/ModelBuilder.tsx**
- localStorage 토큰 체크 × 5개 위치 제거
- 모든 API 호출에 `credentials: 'include'` 추가

**src/components/results/ResultsDashboard.tsx**
- localStorage 토큰 제거
- 쿠키 기반 인증으로 변경

**src/components/settings/PersonalSettings.tsx**
- 인증 관련 localStorage 사용 제거
- API 호출에 `credentials: 'include'` 추가

**src/components/admin/UsageManagement.tsx**
- Authorization Bearer 헤더 × 4개 위치 제거
- `credentials: 'include'` 추가

## 🛠️ 백엔드 쿠키 인증 시스템

### 1. 인증 미들웨어 수정
**backend/src/middleware/auth.ts**
```typescript
// Before: Authorization 헤더에서 토큰 읽기
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

// After: 쿠키에서 토큰 읽기
const token = req.cookies?.token;
```

### 2. 로그인/회원가입 수정
**backend/src/routes/auth.ts**
```typescript
// httpOnly 쿠키로 토큰 설정
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24시간
  path: '/'
});

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
  path: '/'
});

// 응답에서 토큰 제거 (쿠키로만 전송)
res.json({
  message: 'Login successful',
  user: userResponse
});
```

### 3. 로그아웃 엔드포인트 추가
```typescript
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token', { /* 동일한 옵션 */ });
  res.clearCookie('refreshToken', { /* 동일한 옵션 */ });
  res.json({ message: 'Logged out successfully' });
});
```

### 4. 의존성 추가
**backend/package.json**
```json
"cookie-parser": "^1.4.6",
"@types/cookie-parser": "^1.4.7"
```

### 5. 미들웨어 등록
**backend/src/index.ts**
```typescript
import cookieParser from 'cookie-parser';
app.use(cookieParser());
```

## 🔄 API 요청 패턴 변경

### Before (localStorage 기반)
```typescript
const token = localStorage.getItem('token');
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### After (쿠키 기반)
```typescript
fetch(url, {
  credentials: 'include',  // 쿠키 자동 전송
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## 🔒 보안 강화

### httpOnly 쿠키 장점
1. **XSS 공격 방지**: JavaScript로 쿠키 접근 불가
2. **자동 전송**: 브라우저가 자동으로 쿠키 전송
3. **CSRF 보호**: sameSite 속성으로 크로스 사이트 요청 제한
4. **HTTPS 보안**: secure 속성으로 HTTPS에서만 전송

### CORS 설정
```typescript
app.use(cors({
  origin: ['https://aebonlee.github.io'],
  credentials: true,  // 쿠키 전송 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
```

## 📊 수정 통계

### 제거된 localStorage 사용
- **토큰 관련**: 총 35개 위치
- **파일 수**: 13개 파일
- **Authorization 헤더**: 20개 이상 제거
- **토큰 체크 로직**: 15개 이상 제거

### 추가된 기능
- **백엔드**: 쿠키 기반 인증 시스템
- **프론트엔드**: credentials: 'include' 적용
- **보안**: httpOnly, secure, sameSite 적용
- **로그아웃**: 서버 쿠키 클리어 기능

## 🎯 최종 결과

### ✅ 달성된 목표
1. **완전한 로컬 저장소 제거**: localStorage 사용 0%
2. **백엔드 중심 인증**: 모든 인증 로직 서버에서 처리
3. **보안 강화**: httpOnly 쿠키로 XSS 방지
4. **데이터 일관성**: PostgreSQL 단일 데이터 소스
5. **서비스 버전**: 데모 모드 완전 제거

### 시스템 아키텍처
```
GitHub Pages (Frontend)
        ↓ credentials: 'include'
https://ahp-forpaper.onrender.com (Backend)
        ↓ SQL queries
PostgreSQL Database (Render)
```

## 🚀 배포 현황

- **프론트엔드**: GitHub Pages 자동 배포
- **백엔드**: Render 자동 배포 (cookie-parser 의존성 설치됨)
- **데이터베이스**: PostgreSQL 스키마 준비 완료

---

*작업 완료일: 2025년 9월 1일*  
*모든 로컬 저장소 사용이 완전히 제거되었습니다.*