# 🎨 AHP 플랫폼 버튼 디자인 가이드

## 📋 버튼 기능별 색상 및 아이콘 정의

### 1. 계층 레벨 변경 버튼 (Hierarchy Level)
| 버튼 | 기능 | 색상 | 설명 |
|------|------|------|------|
| ⏫ | 상위 레벨로 승격 | 🟢 녹색 (Green) | 현재 항목을 상위 계층으로 이동 (예: 하위기준 → 기준) |
| ⏬ | 하위 레벨로 강등 | 🟠 주황색 (Orange) | 현재 항목을 하위 계층으로 이동 (예: 기준 → 하위기준) |

### 2. 순서 이동 버튼 (Order)
| 버튼 | 기능 | 색상 | 설명 |
|------|------|------|------|
| ⬆️ | 위로 이동 | 🔵 파란색 (Blue) | 같은 레벨 내에서 순서를 위로 이동 |
| ⬇️ | 아래로 이동 | 🔵 파란색 (Blue) | 같은 레벨 내에서 순서를 아래로 이동 |

### 3. 삭제 버튼
| 버튼 | 기능 | 색상 | 설명 |
|------|------|------|------|
| 🗑️ | 삭제 | 🔴 빨간색 (Red) | 선택한 항목 및 하위 항목 모두 삭제 |

## 🎯 구현 코드 예시

### React/TypeScript 컴포넌트
```tsx
// 계층 레벨 변경 버튼
<button
  onClick={() => onNodeLevelChange(node, 'promote')}
  className="px-2 py-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors duration-200"
  title="상위 기준으로 변경 (예: 하위기준 → 기준)"
>
  ⏫
</button>

<button
  onClick={() => onNodeLevelChange(node, 'demote')}
  className="px-2 py-1 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-md transition-colors duration-200"
  title="하위 기준으로 변경 (예: 기준 → 하위기준)"
>
  ⏬
</button>

// 순서 이동 버튼
<button
  onClick={() => onNodeMove(node, 'up')}
  className="px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-colors duration-200"
  title="위로 이동 (같은 레벨 내에서)"
>
  ⬆️
</button>

<button
  onClick={() => onNodeMove(node, 'down')}
  className="px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-colors duration-200"
  title="아래로 이동 (같은 레벨 내에서)"
>
  ⬇️
</button>

// 삭제 버튼
<button
  onClick={() => onNodeDelete(node)}
  className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors duration-200"
  title="삭제 (하위 항목 포함)"
>
  🗑️
</button>
```

## 🔧 Tailwind CSS 색상 클래스

### 레벨 변경 (Hierarchy)
- **상위 승격 (⏫)**: `text-green-600 hover:bg-green-100`
- **하위 강등 (⏬)**: `text-orange-600 hover:bg-orange-100`

### 순서 이동 (Order)
- **위/아래 (⬆️⬇️)**: `text-blue-600 hover:bg-blue-100`

### 삭제
- **삭제 (🗑️)**: `text-red-600 hover:bg-red-100`

## 💡 사용자 경험(UX) 가이드라인

1. **툴팁 필수**: 모든 버튼에 명확한 툴팁 제공
   - 현재 동작을 구체적으로 설명
   - 예시 포함 (예: "하위기준 → 기준")

2. **시각적 피드백**:
   - hover 시 배경색 변경
   - 클릭 시 즉각적인 반응
   - 트랜지션 효과 (200ms)

3. **접근성**:
   - 키보드 네비게이션 지원
   - ARIA 레이블 제공
   - 충분한 클릭 영역 확보 (최소 32x32px)

4. **일관성**:
   - 같은 기능은 항상 같은 색상
   - 아이콘과 색상의 의미 일관성 유지
   - 전체 애플리케이션에서 동일하게 적용

## 📊 기능별 그룹화

### 구조 변경 그룹
- ⏫⏬ : 계층 레벨 변경 (녹색/주황색)

### 위치 변경 그룹  
- ⬆️⬇️ : 순서 이동 (파란색)

### 삭제 그룹
- 🗑️ : 삭제 (빨간색)

## ⚠️ 주의사항

1. **색맹 사용자 고려**:
   - 색상뿐만 아니라 아이콘 모양도 다르게 사용
   - 툴팁과 텍스트 레이블 병행

2. **모바일 대응**:
   - 터치 타겟 최소 44x44px
   - 버튼 간격 충분히 확보

3. **피드백 제공**:
   - 작업 완료 시 토스트 메시지
   - 실패 시 명확한 에러 메시지
   - 로딩 상태 표시

---

*최종 업데이트: 2024-10-04*