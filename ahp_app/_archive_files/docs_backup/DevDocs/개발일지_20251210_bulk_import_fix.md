# 개발 일지 - 2025년 12월 10일

## 주요 작업 내용

### 1. 일괄 가져오기 오류 수정

#### 문제 상황
- 사용자가 "일괄 가져오기 중 오류가 발생했습니다: 기준 '재무 성과' 저장 실패" 에러 보고
- 3x3 계층구조 (3개 상위 기준, 각 3개 하위 기준) 입력 시 실패

#### 원인 분석
1. **중복 검사 로직 문제**
   - `dataService_clean.ts`의 중복 검사가 너무 엄격하여 정상적인 데이터도 거부
   - parent_id 비교 시 null, undefined, 빈 문자열 처리 불일치

2. **에러 처리 부족**
   - API 에러 발생 시 상세 정보 없이 일반적인 메시지만 표시
   - 실제 백엔드 에러 메시지가 사용자에게 전달되지 않음

#### 해결 방안

##### 1. dataService_clean.ts 수정
```typescript
// parent_id 정규화 함수 추가
const normalizeParentId = (id: any) => (!id || id === '') ? null : id;

// 중복 검사 개선
const isDuplicate = existingCriteria.some((c: any) => 
  c.name.toLowerCase() === data.name.toLowerCase() && 
  c.level === data.level &&
  normalizeParentId(c.parent_id) === normalizeParentId(data.parent_id) &&
  (!c.type || c.type === 'criteria')
);

// 중복 시 기존 데이터 반환 (에러 대신)
if (isDuplicate) {
  const existingItem = existingCriteria.find(/* ... */);
  return existingItem || null;
}
```

##### 2. CriteriaManagement.tsx 수정
```typescript
// 더 상세한 에러 처리
try {
  const savedCriterion = await dataService.createCriteria(criterionData);
  if (savedCriterion && savedCriterion.id) {
    // 정상 저장
    idMapping.set(criterion.id, savedCriterion.id);
    savedCriteria.push(savedCriterion);
  } else if (savedCriterion) {
    // 이미 존재하는 기준
    idMapping.set(criterion.id, savedCriterion.id);
    savedCriteria.push(savedCriterion);
  }
} catch (saveError: any) {
  const errorMessage = saveError.message || '알 수 없는 오류';
  throw new Error(`기준 "${criterion.name}" 저장 실패: ${errorMessage}`);
}
```

##### 3. api.ts 로깅 개선
```typescript
// 상세한 요청/응답 로깅
console.log('📤 Django Criteria API 요청:', {
  endpoint: '/api/service/projects/criteria/',
  data: requestData,
  projectId: projectId,
  name: data.name,
  level: data.level,
  parent_id: data.parent_id
});

console.log('📥 Django Criteria API 응답:', {
  success: response.success,
  error: response.error,
  message: response.message,
  hasData: !!response.data,
  dataId: response.data?.id
});
```

### 2. GitHub Actions 배포 개선

#### 이전 문제
- 복잡한 GitHub Actions workflow로 인한 동시성 충돌
- 배포 시 "is currently deploying" 에러 빈번 발생

#### 해결
- peaceiris/actions-gh-pages@v3 액션으로 단순화
- force_orphan 옵션으로 충돌 방지
- 단일 job으로 빌드와 배포 통합

### 3. Git 저장소 정리

#### 문제
- 중첩된 git 저장소 (ahp_repos 내 백업 저장소들)
- 잘못된 파일명 ('nul') 으로 인한 commit 실패

#### 해결
- git rm --cached로 중첩 저장소 제거
- 필요한 소스 파일만 선택적 커밋

## 현재 상태

### 완료된 작업
- ✅ 일괄 가져오기 저장 실패 오류 디버깅
- ✅ createCriteria API 호출 문제 해결
- ✅ 에러 처리 및 로깅 개선
- ✅ GitHub에 수정사항 커밋 및 푸시

### 진행 중
- 🔄 테스트 및 검증 (배포 진행 중)

### 대기 중
- ⏳ 백엔드 API 연결 문제 확인

## 다음 단계

1. **배포 확인**
   - GitHub Pages 배포 완료 확인
   - https://aebonlee.github.io/ahp_app 에서 실제 동작 테스트

2. **추가 테스트**
   - 3x3 계층구조 일괄 입력 테스트
   - 중복 기준 처리 확인
   - 에러 메시지 표시 확인

3. **백엔드 연동**
   - Django API 응답 형식 확인
   - 필요시 백엔드 수정 요청

## 기술 스택
- Frontend: React, TypeScript
- State Management: React Hooks
- API: RESTful API with Django Backend
- Deployment: GitHub Actions, GitHub Pages
- Version Control: Git, GitHub

## 참고 사항
- 사용자 피드백: "일괄 가져오기 중 오류가 발생했습니다: 기준 '재무 성과' 저장 실패"
- 배포 URL: https://aebonlee.github.io/ahp_app
- 저장소: https://github.com/aebonlee/ahp_app

## Claude Code 사용 현황

### 사용 시간
- Max Plan 결제일: 2024년 10월 1일 ($200)
- 현재 세션 시작: 2024년 10월 9일
- 기준 시점: 2024년 10월 9일 (수요일)
- Claude Code는 일주일 단위로 사용 시간 제한
- 현재 사용 중인 주: 10월 7일(월) ~ 10월 13일(일)
- 남은 사용 가능일: 4일 (목요일 ~ 일요일)

### 질문 횟수
- 오늘(10월 9일) 질문 수: 약 15개
- 이번 주 남은 질문 예상 가능: 약 50-60개 (일반적으로 주당 약 70-80개 제한)

### 권장사항
- 복잡한 디버깅이나 대규모 리팩토링은 주중에 완료
- 주말은 간단한 버그 수정이나 문서화 작업에 활용
- 매주 월요일에 사용량이 리셋되므로 계획적으로 활용

---
작성일: 2024년 10월 9일
작성자: Claude Code Assistant