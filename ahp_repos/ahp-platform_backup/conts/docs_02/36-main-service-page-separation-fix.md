# 메인페이지와 서비스 페이지 분리 구현 보고서

## 작업 일시
- 2025년 1월 1일

## 문제 상황
- 웹 메인페이지와 로그인 후 서비스 페이지가 서로 겹쳐보이는 문제 발생
- 로그인 상태와 비로그인 상태의 라우팅이 명확하게 분리되지 않음
- 세션 관련 기능이 헤더에서 표시되지 않는 문제

## 수정 내용

### 1. App.tsx - 라우팅 로직 개선
```typescript
// 변경 전: 모든 탭을 하나의 switch 문으로 처리
const renderContent = () => {
  switch (activeTab) {
    case 'home':
      return <HomePage onLoginClick={handleLoginClick} />;
    // ...
  }
}

// 변경 후: 로그인 상태에 따라 분리 처리
const renderContent = () => {
  // 로그인하지 않은 상태에서는 메인페이지와 관련 페이지만 렌더링
  if (!user) {
    switch (activeTab) {
      case 'home':
        return <HomePage onLoginClick={handleLoginClick} />;
      case 'login':
        return <LoginForm ... />;
      case 'register':
        return <RegisterForm ... />;
      default:
        // 다른 페이지 접근 시 홈으로 리다이렉트
        return <HomePage onLoginClick={handleLoginClick} />;
    }
  }
  
  // 로그인한 상태에서의 라우팅
  switch (activeTab) {
    case 'home':
      // 로그인한 상태에서 홈 접근 시 서비스 대시보드로 리다이렉트
      setActiveTab('personal-service');
      return null;
    // ... 서비스 관련 페이지들
  }
}
```

### 2. Layout 조건부 렌더링 수정
```typescript
// 변경 전: 복잡한 조건으로 Layout 표시 여부 결정
const needsLayout = (user && protectedTabs.includes(activeTab)) || 
  activeTab === 'evaluation-test' || 
  (backendStatus === 'unavailable' && ['home', 'landing', 'personal-service'].includes(activeTab));

// 변경 후: 단순하게 로그인 여부로만 판단
if (user) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout user={user} ...>
        {renderContent()}
      </Layout>
    </div>
  );
}

// 로그인하지 않은 사용자는 Layout 없이 렌더링
return (
  <div className="min-h-screen bg-gray-50">
    {renderContent()}
  </div>
);
```

### 3. 세션 관리 기능 복구

#### Header.tsx 수정
```typescript
// 세션 상태 업데이트 로직 개선
useEffect(() => {
  const updateSessionStatus = async () => {
    // 사용자가 로그인 상태면 세션 활성화로 간주
    if (user) {
      setIsLoggedIn(true);
      
      // 세션 시간 계산 (기본 30분)
      const loginTime = localStorage.getItem('login_time');
      if (loginTime) {
        const elapsed = Math.floor((Date.now() - parseInt(loginTime)) / 60000);
        const remaining = Math.max(0, 30 - elapsed);
        setRemainingTime(remaining);
      } else {
        localStorage.setItem('login_time', Date.now().toString());
        setRemainingTime(30);
      }
      
      localStorage.setItem('last_activity', Date.now().toString());
    }
  };
  
  if (user) {
    updateSessionStatus();
    const interval = setInterval(updateSessionStatus, 60000); // 1분마다 업데이트
    return () => clearInterval(interval);
  }
}, [user]);
```

#### sessionService.ts 수정
```typescript
// 서버 기반에서 클라이언트 기반으로 변경
public async isSessionValid(): Promise<boolean> {
  const loginTime = localStorage.getItem('login_time');
  if (!loginTime) return false;
  
  const elapsed = Date.now() - parseInt(loginTime);
  return elapsed < this.SESSION_DURATION;
}

public async getRemainingTime(): Promise<number> {
  const loginTime = localStorage.getItem('login_time');
  if (!loginTime) return 0;
  
  const elapsed = Date.now() - parseInt(loginTime);
  const remaining = Math.max(0, this.SESSION_DURATION - elapsed);
  return Math.floor(remaining / 60000); // 분 단위로 반환
}

public extendSession(): void {
  // 로그인 시간 갱신
  localStorage.setItem('login_time', Date.now().toString());
  localStorage.setItem('last_activity', Date.now().toString());
  
  this.startSessionTimer();
  this.hideSessionWarning();
  console.log('세션이 30분 연장되었습니다.');
}
```

### 4. 로그인/로그아웃 시 세션 처리
```typescript
// 로그인 성공 시
if (response.ok) {
  // ... 사용자 정보 설정
  
  // 로그인 시간 저장 (세션 관리를 위해)
  localStorage.setItem('login_time', Date.now().toString());
  localStorage.setItem('last_activity', Date.now().toString());
  
  setUser(userWithAdminType);
  setActiveTab('personal-service');
}

// 로그아웃 시
const handleLogout = async () => {
  // 세션 정보 삭제
  localStorage.removeItem('login_time');
  localStorage.removeItem('last_activity');
  
  // ... 로그아웃 처리
}
```

## 주요 개선 사항

### 1. 페이지 분리
- **비로그인 사용자**: 홈페이지, 로그인, 회원가입 페이지만 접근 가능
- **로그인 사용자**: 서비스 대시보드 및 관련 기능 페이지 접근 가능
- 로그인 상태에서 홈페이지 접근 시 자동으로 서비스 페이지로 리다이렉트

### 2. UI/UX 개선
- Layout(헤더, 사이드바)은 로그인한 사용자에게만 표시
- 세션 상태가 헤더에 시각적으로 표시 (초록/노랑/빨강)
- 세션 연장 기능 제공

### 3. 코드 구조 개선
- 라우팅 로직을 로그인 상태에 따라 명확하게 분리
- 불필요한 조건문과 중복 코드 제거
- 세션 관리를 클라이언트 사이드로 단순화

## 테스트 결과
- 빌드 성공 (경고 메시지만 존재, 오류 없음)
- 메인페이지와 서비스 페이지가 완전히 분리되어 동작
- 세션 관리 기능이 정상적으로 작동

## 향후 개선 사항
- 서버 기반 세션 관리로 전환 고려
- 세션 만료 시 자동 로그아웃 구현
- 페이지 전환 시 트랜지션 효과 추가