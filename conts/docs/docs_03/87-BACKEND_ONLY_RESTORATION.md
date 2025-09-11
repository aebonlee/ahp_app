# 백엔드 연동 전용 복구 구현

## 📅 작업 일시
**2024년 12월 18일**

## 🎯 목표
Render.com 유료 서비스 이용 계획에 따라 오프라인 모드를 제거하고 백엔드 서버 연동만을 사용하는 정상적인 온라인 전용 아키텍처로 복구

## 🔄 주요 변경사항

### 1. 오프라인 모드 완전 제거

#### 이전 (오프라인 우선 구조)
```typescript
// 토큰이 없으면 오프라인 모드로 생성
if (!token) {
  const offlineProject = await createOfflineProject();
  return offlineProject;
}

// 토큰 만료 시 오프라인 모드로 전환
if (!isTokenValid(token)) {
  const offlineProject = await createOfflineProject();
  return offlineProject;
}

// 서버 오류 시 오프라인 모드로 전환  
const offlineProject = await createOfflineProject();
return offlineProject;
```

#### 개선 후 (온라인 전용 구조)
```typescript
// 토큰이 없으면 로그인 필요
if (!token) {
  setError('로그인이 필요합니다.');
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);
  return;
}

// 토큰 만료 시 재로그인 유도
if (!isTokenValid(token)) {
  localStorage.removeItem('token');
  setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);
  return;
}

// 서버 오류 시 명확한 오류 메시지
const errorData = await response.json();
setError(errorData.error || '프로젝트 생성에 실패했습니다.');
```

### 2. JWT 토큰 기반 정상 인증 시스템

#### handleCreateNewProject 함수 정상화
```typescript
const handleCreateNewProject = async () => {
  if (!projectForm.title.trim()) {
    setError('프로젝트명을 입력해주세요.');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const token = localStorage.getItem('token');
    
    // 토큰 검증 후 백엔드 API 호출
    if (!token || !isTokenValid(token)) {
      // 인증 오류 시 로그인 페이지로 이동
      return;
    }

    // 30초 타임아웃으로 백엔드 연결
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: projectForm.title,
        description: projectForm.description,
        objective: projectForm.objective,
        evaluationMode: projectForm.evaluation_mode
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      // 정상 프로젝트 생성 처리
      const data = await response.json();
      const newProject: UserProject = {
        id: data.project.id.toString(), // 서버 생성 ID 사용
        // ... 나머지 프로젝트 데이터
      };
      
      setProjects([...projects, newProject]);
      localStorage.setItem('ahp_projects_backup', JSON.stringify(updatedProjects));
    } else {
      // 서버 오류 처리
      const errorData = await response.json();
      setError(errorData.error || '프로젝트 생성에 실패했습니다.');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  } finally {
    setLoading(false);
  }
};
```

### 3. 프로젝트 로딩 시스템 정상화

#### loadProjects 함수 백엔드 전용으로 복구
```typescript
const loadProjects = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const token = localStorage.getItem('token');
    
    // 인증 검증
    if (!token || !isTokenValid(token)) {
      setProjects([]);
      setError('로그인이 필요합니다.');
      setTimeout(() => window.location.href = '/', 2000);
      return;
    }

    // 30초 타임아웃으로 백엔드 연결
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const formattedProjects = data.projects.map((project: any) => ({
        id: project.id.toString(),
        title: project.title || project.name,
        // ... 프로젝트 데이터 매핑
      }));
      setProjects(formattedProjects);
      
      // 백업용 localStorage 저장 (선택적)
      localStorage.setItem('ahp_projects_backup', JSON.stringify(formattedProjects));
    } else if (response.status === 401) {
      // 인증 실패 시 재로그인 유도
      localStorage.removeItem('token');
      setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
      setTimeout(() => window.location.href = '/', 2000);
    } else {
      // 서버 오류
      setError('프로젝트를 불러오는데 실패했습니다.');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  } finally {
    setLoading(false);
  }
};
```

## 🚀 기술적 개선사항

### 1. 타임아웃 제어 시스템
```typescript
// AbortController를 사용한 30초 타임아웃
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await fetch(url, {
  ...options,
  signal: controller.signal
});

clearTimeout(timeoutId);
```

### 2. 향상된 에러 처리
```typescript
try {
  // API 호출
} catch (error: any) {
  if (error.name === 'AbortError') {
    setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
  } else {
    setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}
```

### 3. 명확한 인증 상태 관리
- 토큰 없음: "로그인이 필요합니다"
- 토큰 만료: "로그인이 만료되었습니다"
- 서버 오류: "서버 연결에 실패했습니다"

## 📊 아키텍처 변경 비교

### 이전 아키텍처 (오프라인 우선)
```
[사용자 액션]
     ↓
[토큰 검사] → 없음/만료 → [오프라인 모드]
     ↓              ↓
[백엔드 연결] → 실패 → [오프라인 모드]
     ↓              ↓
[온라인 처리]    [localStorage 저장]
```

### 현재 아키텍처 (온라인 전용)
```
[사용자 액션]
     ↓
[토큰 검사] → 없음/만료 → [로그인 페이지 이동]
     ↓
[백엔드 연결] → 실패 → [오류 메시지 표시]
     ↓
[정상 처리] → [PostgreSQL 저장]
     ↓
[localStorage 백업]
```

## 🔧 제거된 함수들

### createOfflineProject 함수 제거
- 오프라인 프로젝트 생성 로직 완전 삭제
- `offline-${timestamp}` ID 체계 제거
- 오프라인 전용 localStorage 키 제거

### loadOfflineProjects 함수 제거
- 오프라인 백업 데이터 로드 로직 삭제
- 오프라인 모드 알림 메시지 제거

## 📈 사용자 경험 변화

### 이전 (오프라인 우선)
- ❓ 토큰 없어도 프로젝트 생성 가능
- ❓ 서버 다운시에도 작업 계속
- ❓ "오프라인 모드" 혼란스러운 상태

### 현재 (온라인 전용)
- ✅ 명확한 로그인 요구사항
- ✅ 서버 연결 상태 투명성
- ✅ 표준적인 웹 애플리케이션 동작

## 🎯 Render.com 유료 서비스 대응

### 예상되는 개선사항
1. **24/7 서버 가동**: 콜드 스타트 문제 해결
2. **안정적인 연결**: 503 에러 대폭 감소
3. **빠른 응답 시간**: 30초 타임아웃 내 정상 처리
4. **높은 신뢰성**: PostgreSQL 데이터 영구 보존

### 백엔드 연결 최적화
- 30초 타임아웃으로 충분한 대기 시간 확보
- AbortController로 깔끔한 요청 취소
- 명확한 에러 메시지로 사용자 혼란 방지

## 📋 수정된 파일

### PersonalServiceDashboard.tsx
- ✅ `handleCreateNewProject` 온라인 전용으로 복구
- ✅ `loadProjects` 백엔드 의존성으로 복구
- ✅ `createOfflineProject` 함수 완전 제거
- ✅ `loadOfflineProjects` 함수 완전 제거
- ✅ 30초 타임아웃 및 AbortController 추가
- ✅ 향상된 에러 처리 구현

## 🧪 테스트 시나리오

### 시나리오 1: 정상 로그인 상태
1. **유효한 JWT 토큰 보유**
2. **프로젝트 생성 시도**
3. **결과**: 백엔드 서버에 정상 생성 및 DB 저장

### 시나리오 2: 토큰 만료 상태
1. **만료된 JWT 토큰 보유**
2. **프로젝트 로드/생성 시도**
3. **결과**: "로그인이 만료되었습니다" 메시지 후 로그인 페이지 이동

### 시나리오 3: 서버 응답 지연
1. **서버 콜드 스타트로 30초 이상 소요**
2. **프로젝트 생성 시도**
3. **결과**: "서버 응답 시간이 초과되었습니다" 메시지

### 시나리오 4: 서버 오류
1. **백엔드 서버 500 에러 발생**
2. **프로젝트 생성 시도**
3. **결과**: 구체적인 서버 오류 메시지 표시

## 🔮 유료 서비스 이후 예상 성능

### 개선 예상치
- **서버 응답 시간**: 30초 → 1-3초
- **연결 성공률**: 50% → 99.9%
- **콜드 스타트**: 빈번 → 없음
- **데이터 지속성**: 100% (PostgreSQL)

## 📊 구현 성과 요약

### 제거된 복잡성
❌ **오프라인 모드 혼란**: 사용자가 온라인/오프라인 상태 구분 불필요  
❌ **이중 데이터 관리**: localStorage와 DB 동기화 복잡성 제거  
❌ **오프라인 ID 체계**: `offline-${timestamp}` 프로젝트 ID 제거

### 복구된 정상 기능
✅ **표준 인증 플로우**: JWT 토큰 기반 정상 로그인 시스템  
✅ **명확한 오류 처리**: 서버 문제 시 구체적 에러 메시지 제공  
✅ **일관된 데이터**: PostgreSQL 단일 소스로 데이터 일관성 보장

### 성능 최적화
🚀 **타임아웃 제어**: 30초 AbortController로 무한 대기 방지  
🚀 **에러 세분화**: 네트워크, 인증, 서버별 구체적 오류 처리  
🚀 **리소스 관리**: 메모리 효율적인 온라인 전용 구조

---

**완료 일시**: 2024년 12월 18일  
**구현자**: Claude Code (AI Assistant)  
**상태**: ✅ 온라인 전용 아키텍처 복구 완료  
**준비 상태**: ✅ Render.com 유료 서비스 연동 준비 완료