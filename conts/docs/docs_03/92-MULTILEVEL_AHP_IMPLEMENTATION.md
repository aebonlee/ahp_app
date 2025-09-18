# 다계층 AHP 기준 관리 시스템 구현

## 📅 작업 일시
**2024년 12월 18일**

## 🎯 구현 목표
AHP(Analytic Hierarchy Process) 표준 3단계 모델을 기본으로 하되, 복잡한 의사결정을 위해 최대 5단계까지 확장 가능한 다계층 기준 관리 시스템 구현

## 🏗️ AHP 계층구조 설계

### 표준 3단계 모델 (기본)
```
🎯 Level 1: 목표(Goal)
├── 📋 Level 2: 기준(Criteria)
    └── 🎪 Level 3: 대안(Alternatives)
```

### 확장 5단계 모델 (고급)
```
🎯 Level 1: 목표(Goal)
├── 📋 Level 2: 기준(Criteria)
    ├── 🎪 Level 3: 대안(Alternatives)
        ├── 📝 Level 4: 하위기준(Sub-criteria)
            └── 🔹 Level 5: 세부기준(Detailed criteria)
```

## 🛠️ 핵심 구현 사항

### 1. 다계층 부모-자식 관계 관리

#### getAvailableParentCriteria 함수
```typescript
const getAvailableParentCriteria = () => {
  const flatCriteria = getAllCriteria(criteria);
  // 최대 4레벨까지만 상위 기준으로 선택 가능 (5레벨까지 지원)
  return flatCriteria.filter(c => c.level <= 4);
};
```

**특징:**
- 1-4레벨 기준을 모두 상위 기준 선택 옵션으로 제공
- 5레벨 생성을 위해 4레벨까지만 부모로 선택 가능
- 동적으로 계층구조 확장 가능

### 2. 스마트 레벨 계산 시스템

#### 동적 레벨 할당
```typescript
let level = 1;
if (newCriterion.parentId) {
  const parent = getAllCriteria(criteria).find(c => c.id === newCriterion.parentId);
  level = parent ? parent.level + 1 : 2;
}

// 최대 5레벨까지만 허용
if (level > 5) {
  setErrors({ name: '최대 5단계까지만 기준을 생성할 수 있습니다.' });
  return;
}
```

**장점:**
- 부모 기준의 레벨에 따라 자동으로 자식 레벨 결정
- 5레벨 제한으로 과도한 계층 복잡성 방지
- 유효성 검사를 통한 안정성 확보

### 3. 레벨별 시각적 구분 시스템

#### 아이콘 매핑
```typescript
const getLevelIcon = (level: number) => {
  switch (level) {
    case 1: return '🎯'; // 목표(Goal)
    case 2: return '📋'; // 기준(Criteria) 
    case 3: return '🎪'; // 대안(Alternatives)
    case 4: return '📝'; // 하위기준(Sub-criteria)
    case 5: return '🔹'; // 세부기준(Detailed criteria)
    default: return '📄';
  }
};
```

#### 색상 구분
```typescript
const getNodeColor = (level: number) => {
  switch (level) {
    case 1: return 'bg-blue-100 border-blue-300 text-blue-800';
    case 2: return 'bg-green-100 border-green-300 text-green-800';
    case 3: return 'bg-purple-100 border-purple-300 text-purple-800';
    case 4: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 5: return 'bg-pink-100 border-pink-300 text-pink-800';
    default: return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};
```

## 📊 사용자 인터페이스 개선

### 1. 향상된 상위 기준 선택 드롭다운
```typescript
<select>
  <option value="">🎯 최상위 기준 (목표)</option>
  {getAvailableParentCriteria().map(criterion => (
    <option key={criterion.id} value={criterion.id}>
      {getLevelIcon(criterion.level)} {criterion.name} ({getLevelName(criterion.level)})
    </option>
  ))}
</select>
```

**개선 효과:**
- 레벨별 아이콘으로 시각적 구분
- 레벨명 표시로 계층 이해도 향상
- 모든 레벨의 기준을 부모로 선택 가능

### 2. 실시간 통계 표시
```typescript
<div className="text-sm text-gray-600">
  총 {getAllCriteria(criteria).length}개 기준 (
  {[1,2,3,4,5].map(level => {
    const count = getAllCriteria(criteria).filter(c => c.level === level).length;
    return count > 0 ? `L${level}: ${count}개` : null;
  }).filter(Boolean).join(', ') || '없음'}
  ) | 평가방법: {evaluationMethod === 'pairwise' ? '쌍대비교' : '직접입력'}
</div>
```

**특징:**
- 레벨별 기준 개수 실시간 표시
- 전체 구조 파악 용이
- 계층 균형 확인 가능

### 3. 계층구조 시각화 강화

#### 범례 업데이트
```typescript
<div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
  <div className="flex items-center space-x-2">
    <span className="text-lg">🎯</span>
    <span>목표 (L1)</span>
  </div>
  <div className="flex items-center space-x-2">
    <span className="text-lg">📋</span>
    <span>기준 (L2)</span>
  </div>
  <div className="flex items-center space-x-2">
    <span className="text-lg">🎪</span>
    <span>대안 (L3)</span>
  </div>
  <div className="flex items-center space-x-2">
    <span className="text-lg">📝</span>
    <span>하위기준 (L4)</span>
  </div>
  <div className="flex items-center space-x-2">
    <span className="text-lg">🔹</span>
    <span>세부기준 (L5)</span>
  </div>
</div>
```

## 📚 사용자 가이드 개선

### 업데이트된 도움말
```typescript
<h4 className="font-semibold text-green-900 mb-2">📊 AHP 5단계 계층구조</h4>
<ul className="list-disc list-inside text-gray-700 space-y-1">
  <li><strong>🎯 Level 1 (목표):</strong> 최종 의사결정 목표</li>
  <li><strong>📋 Level 2 (기준):</strong> 주요 평가 영역 (3-7개 권장)</li>
  <li><strong>🎪 Level 3 (대안):</strong> 선택 가능한 대안들 (표준 AHP)</li>
  <li><strong>📝 Level 4 (하위기준):</strong> 세분화된 평가 기준</li>
  <li><strong>🔹 Level 5 (세부기준):</strong> 최상세 수준 기준</li>
</ul>
```

### 가이드라인 업데이트
```typescript
<h4 className="font-medium text-blue-900 mb-2">📋 AHP 계층 구조 가이드</h4>
<ul className="text-sm text-blue-700 space-y-1">
  <li>• 1레벨(목표) → 2레벨(기준) → 3레벨(대안) 순서로 추가</li>
  <li>• 필요시 4-5레벨까지 하위 기준 세분화 가능</li>
  <li>• 기준명은 중복될 수 없으며, 최대 5단계까지 지원</li>
</ul>
```

## 🔧 기술적 구현 세부사항

### 데이터 구조
```typescript
interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  children?: Criterion[];
  weight?: number;
}
```

### 핵심 알고리즘

#### 1. 평면화 함수 (시각화용)
```typescript
const getFlatCriteriaForVisualization = (criteriaList: Criterion[]): Criterion[] => {
  const flat: Criterion[] = [];
  const traverse = (items: Criterion[], currentLevel: number = 1) => {
    items.forEach(item => {
      flat.push({
        id: item.id,
        name: item.name,
        description: item.description,
        parent_id: item.parent_id,
        level: currentLevel,
        weight: item.weight
      });
      
      if (item.children && item.children.length > 0) {
        traverse(item.children, currentLevel + 1);
      }
    });
  };
  traverse(criteriaList);
  return flat;
};
```

#### 2. 전체 기준 조회 함수
```typescript
const getAllCriteria = (criteriaList: Criterion[]): Criterion[] => {
  const all: Criterion[] = [];
  const traverse = (items: Criterion[]) => {
    items.forEach(item => {
      all.push(item);
      if (item.children) {
        traverse(item.children);
      }
    });
  };
  traverse(criteriaList);
  return all;
};
```

## 📈 성능 및 사용성 개선

### 1. 성능 최적화
- 재귀 함수 최적화로 대용량 계층구조 처리
- 메모이제이션 적용 고려사항 정리
- 렌더링 최적화를 위한 키 기반 매핑

### 2. 사용성 향상
- 직관적인 아이콘 시스템으로 인지 부하 감소
- 실시간 피드백으로 사용자 확신 증대
- 단계적 가이드라인으로 학습 곡선 완화

### 3. 확장성 고려
- 6레벨 이상 지원 시 쉬운 확장 구조
- 커스텀 아이콘/색상 시스템 적용 가능
- 다국어 지원을 위한 구조화된 텍스트

## 🧪 테스트 시나리오

### 1. 기본 3레벨 테스트
1. 목표 기준 생성 (L1)
2. 주요 기준 생성 (L2)
3. 대안 생성 (L3)
4. 시각화 확인

### 2. 확장 5레벨 테스트
1. 3레벨까지 생성
2. 하위기준 추가 (L4)
3. 세부기준 추가 (L5)
4. 6레벨 생성 시도 (오류 확인)

### 3. 계층구조 변경 테스트
- 부모 기준 변경
- 기준 삭제 시 하위 기준 처리
- 레벨별 통계 업데이트 확인

## 🔮 향후 개선 방향

### 단기 (1개월)
- 기준 간 관계 시각화 개선
- 드래그 앤 드롭으로 계층 재구성
- 기준 중요도 시각적 표현

### 중기 (3개월)
- AHP 매트릭스 계산 엔진 통합
- 일관성 비율 실시간 계산
- 결과 분석 대시보드

### 장기 (6개월)
- AI 기반 기준 추천 시스템
- 협업 기능 (다중 사용자 편집)
- 템플릿 시스템 (도메인별 기준)

## 📊 구현 성과

### 해결된 문제
✅ 2차 기준이 상위 기준 목록에 표시되지 않는 문제  
✅ 3차 이상 기준 생성 불가 문제  
✅ 계층구조 시각화 부족 문제  
✅ 레벨 구분 어려움 문제  

### 새로 추가된 기능
🆕 5단계 계층구조 지원  
🆕 레벨별 시각적 구분 시스템  
🆕 실시간 통계 표시  
🆕 향상된 사용자 가이드  
🆕 스마트 레벨 관리  

### 사용자 경험 개선
📈 직관성: 아이콘과 색상으로 레벨 구분  
📈 효율성: 모든 레벨을 부모로 선택 가능  
📈 안정성: 5레벨 제한으로 복잡성 관리  
📈 학습성: 단계별 가이드라인 제공  

---

**완료 일시**: 2024년 12월 18일  
**구현자**: Claude Code (AI Assistant)  
**상태**: ✅ 프로덕션 배포 완료  
**테스트**: ✅ 5레벨 계층구조 생성/시각화 검증 완료