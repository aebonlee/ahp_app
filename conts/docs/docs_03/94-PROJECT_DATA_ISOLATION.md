# 프로젝트 데이터 격리 구현

## 📅 작업 일시
**2024년 12월 18일**

## 🎯 문제 정의
모델 구축 시 타 프로젝트의 등록된 대안이 현재 프로젝트에서 보여지고, 프로젝트 대시보드 상태의 숫자가 전체 프로젝트 간 공유되는 문제

## 🐛 발견된 문제점

### 1. 대안 데이터 공유 문제
**증상**: 다른 프로젝트에서 생성한 대안이 현재 프로젝트의 대안 목록에 표시
**원인**: `AlternativeManagement` 컴포넌트에서 `DEMO_ALTERNATIVES` 전역 데이터 사용

### 2. 기준 데이터 공유 문제  
**증상**: 모든 프로젝트가 동일한 기준 데이터를 공유
**원인**: `CriteriaManagement` 컴포넌트에서 `DEMO_CRITERIA` 전역 데이터 사용

### 3. 대시보드 통계 공유 문제
**증상**: 프로젝트별 대시보드에 표시되는 기준/대안 개수가 모든 프로젝트에서 동일
**원인**: localStorage 키가 프로젝트별로 분리되지 않음

## 🔧 구현된 해결방안

### 1. 프로젝트별 데이터 저장 시스템

#### AlternativeManagement 수정 사항
```typescript
// 이전 (문제가 있던 코드)
useEffect(() => {
  setAlternatives(DEMO_ALTERNATIVES); // 전역 데이터 사용
}, []);

// 개선된 코드
useEffect(() => {
  const loadProjectAlternatives = () => {
    const storageKey = `ahp_alternatives_${projectId}`;
    const savedAlternatives = localStorage.getItem(storageKey);
    
    if (savedAlternatives) {
      try {
        const parsed = JSON.parse(savedAlternatives);
        setAlternatives(parsed);
        console.log(`Loaded ${parsed.length} alternatives for project ${projectId}`);
      } catch (error) {
        console.error('Failed to parse saved alternatives:', error);
        setAlternatives([]);
      }
    } else {
      // 새 프로젝트는 빈 배열로 시작
      setAlternatives([]);
      console.log(`New project ${projectId} - starting with empty alternatives`);
    }
  };

  if (projectId) {
    loadProjectAlternatives();
  }
}, [projectId]);
```

#### CriteriaManagement 수정 사항
```typescript
// 프로젝트별 기준 데이터 저장 함수 추가
const saveProjectCriteria = (criteriaData: Criterion[]) => {
  const storageKey = `ahp_criteria_${projectId}`;
  localStorage.setItem(storageKey, JSON.stringify(criteriaData));
  console.log(`Saved ${getAllCriteria(criteriaData).length} criteria for project ${projectId}`);
};

// 모든 추가/수정/삭제 작업에서 프로젝트별 저장 적용
const handleAddCriterion = () => {
  // ... 기준 추가 로직
  setCriteria(updatedCriteria);
  saveProjectCriteria(updatedCriteria); // 프로젝트별 저장
};
```

### 2. 저장소 키 체계 변경

#### 이전 저장소 키 (문제)
```
'ahp_alternatives' // 모든 프로젝트가 동일한 키 사용
'ahp_criteria'     // 모든 프로젝트가 동일한 키 사용
```

#### 개선된 저장소 키
```
`ahp_alternatives_${projectId}` // 프로젝트별 고유 키
`ahp_criteria_${projectId}`     // 프로젝트별 고유 키
```

### 3. 데이터 로딩 시스템 개선

#### 프로젝트별 초기화 로직
```typescript
// AlternativeManagement
useEffect(() => {
  const loadProjectAlternatives = () => {
    const storageKey = `ahp_alternatives_${projectId}`;
    const savedAlternatives = localStorage.getItem(storageKey);
    
    if (savedAlternatives) {
      const parsed = JSON.parse(savedAlternatives);
      setAlternatives(parsed);
    } else {
      setAlternatives([]); // 새 프로젝트는 빈 배열
    }
  };

  if (projectId) {
    loadProjectAlternatives();
  }
}, [projectId]);

// CriteriaManagement
useEffect(() => {
  const loadProjectCriteria = () => {
    const storageKey = `ahp_criteria_${projectId}`;
    const savedCriteria = localStorage.getItem(storageKey);
    
    if (savedCriteria) {
      const parsed = JSON.parse(savedCriteria);
      setCriteria(parsed);
    } else {
      setCriteria([]); // 새 프로젝트는 빈 배열
    }
  };

  if (projectId) {
    loadProjectCriteria();
  }
}, [projectId]);
```

## 📊 데이터 흐름 아키텍처

### 이전 아키텍처 (문제)
```
Project A → DEMO_ALTERNATIVES → AlternativeManagement → 공유 데이터
Project B → DEMO_ALTERNATIVES → AlternativeManagement → 공유 데이터
Project C → DEMO_ALTERNATIVES → AlternativeManagement → 공유 데이터
```

### 개선된 아키텍처
```
Project A → ahp_alternatives_project-a → AlternativeManagement → 독립 데이터
Project B → ahp_alternatives_project-b → AlternativeManagement → 독립 데이터  
Project C → ahp_alternatives_project-c → AlternativeManagement → 독립 데이터
```

## 🧪 테스트 시나리오

### 시나리오 1: 새 프로젝트 생성
1. **프로젝트 A 생성**: "AI 도구 비교"
2. **대안 추가**: ChatGPT, GitHub Copilot
3. **기준 추가**: 생산성, 정확도
4. **확인**: 대시보드에 대안 2개, 기준 2개 표시

### 시나리오 2: 별도 프로젝트 생성  
1. **프로젝트 B 생성**: "개발 언어 선택"
2. **대안 추가**: Python, JavaScript, TypeScript
3. **기준 추가**: 학습 난이도
4. **확인**: 대시보드에 대안 3개, 기준 1개 표시

### 시나리오 3: 프로젝트 간 격리 검증
1. **프로젝트 A로 전환**: 여전히 대안 2개, 기준 2개만 표시
2. **프로젝트 B로 전환**: 여전히 대안 3개, 기준 1개만 표시  
3. **데이터 격리 확인**: 각 프로젝트의 데이터가 완전히 독립적

## 🔍 코드 변경사항 요약

### 파일별 주요 변경점

#### AlternativeManagement.tsx
- ✅ `DEMO_ALTERNATIVES` 의존성 완전 제거
- ✅ `ahp_alternatives_${projectId}` 키로 프로젝트별 저장
- ✅ `saveProjectAlternatives` 함수 추가
- ✅ 모든 CRUD 작업에서 프로젝트별 저장 적용

#### CriteriaManagement.tsx  
- ✅ `saveProjectCriteria` 함수 추가
- ✅ `ahp_criteria_${projectId}` 키로 프로젝트별 저장
- ✅ 모든 기준 추가/삭제에서 프로젝트별 저장 적용

## 📈 개선 효과

### 데이터 무결성
- ✅ **완전한 프로젝트 격리**: 각 프로젝트의 독립적인 데이터 관리
- ✅ **데이터 일관성**: 프로젝트 전환 시에도 데이터 유지
- ✅ **충돌 방지**: 동일한 이름의 기준/대안도 프로젝트별로 독립 관리

### 사용자 경험
- ✅ **직관적 동작**: 사용자가 기대하는 대로 프로젝트별 데이터 관리
- ✅ **신뢰성**: 프로젝트 전환해도 데이터 손실 없음
- ✅ **정확성**: 대시보드 통계가 해당 프로젝트만 반영

### 시스템 안정성  
- ✅ **확장성**: 무제한 프로젝트 생성 지원
- ✅ **유지보수성**: 프로젝트별 데이터 관리로 디버깅 용이
- ✅ **백업**: localStorage 기반 클라이언트 측 데이터 보존

## 🚀 배포 준비 완료

모든 수정사항이 빌드 테스트를 통과했으며, 프로덕션 배포가 가능한 상태입니다.

---

**완료 일시**: 2024년 12월 18일  
**구현자**: Claude Code (AI Assistant)  
**상태**: ✅ 구현 완료, 빌드 테스트 통과  
**다음 단계**: GitHub 커밋 및 프로덕션 배포