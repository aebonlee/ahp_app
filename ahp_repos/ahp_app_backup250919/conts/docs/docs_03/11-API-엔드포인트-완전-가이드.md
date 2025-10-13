# 11. API 엔드포인트 완전 가이드

## 일시
- **일시**: 2025년 8월 17일 11:15:00

## 개요
AHP 시스템의 모든 API 엔드포인트와 사용법을 상세히 설명합니다.

## 1. 인증 API

### 1.1 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@ahp-system.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@ahp-system.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.2 사용자 등록
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "evaluator"
}
```

## 2. 프로젝트 관리 API

### 2.1 프로젝트 목록 조회
```http
GET /api/projects
Authorization: Bearer [TOKEN]
```

**응답:**
```json
{
  "projects": [
    {
      "id": 1,
      "title": "스마트폰 선택 평가",
      "description": "새로운 스마트폰 구매를 위한 다기준 의사결정",
      "objective": "가격, 성능, 디자인을 고려한 최적의 스마트폰 선택",
      "admin_id": 1,
      "status": "active",
      "created_at": "2025-08-14T...",
      "updated_at": "2025-08-14T..."
    }
  ]
}
```

### 2.2 프로젝트 생성
```http
POST /api/projects
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "title": "새 AHP 프로젝트",
  "description": "프로젝트 설명",
  "objective": "의사결정 목표"
}
```

### 2.3 프로젝트 상세 조회
```http
GET /api/projects/1
Authorization: Bearer [TOKEN]
```

### 2.4 프로젝트 수정
```http
PUT /api/projects/1
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "status": "completed"
}
```

### 2.5 프로젝트 삭제
```http
DELETE /api/projects/1
Authorization: Bearer [TOKEN]
```

## 3. 기준(Criteria) 관리 API

### 3.1 기준 목록 조회
```http
GET /api/criteria/1
Authorization: Bearer [TOKEN]
```

**응답:**
```json
{
  "criteria": [
    {
      "id": 1,
      "project_id": 1,
      "name": "가격",
      "description": "구매 비용 및 가성비",
      "parent_id": null,
      "level": 1,
      "weight": 0.0,
      "position": 1,
      "created_at": "2025-08-14T...",
      "updated_at": "2025-08-14T..."
    },
    {
      "id": 2,
      "project_id": 1,
      "name": "성능",
      "description": "처리 속도 및 기능",
      "parent_id": null,
      "level": 1,
      "weight": 0.0,
      "position": 2,
      "created_at": "2025-08-14T...",
      "updated_at": "2025-08-14T..."
    }
  ],
  "total": 2
}
```

### 3.2 기준 생성
```http
POST /api/criteria
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "project_id": 1,
  "name": "디자인",
  "description": "외관 및 사용성",
  "level": 1,
  "position": 3
}
```

### 3.3 기준 수정
```http
PUT /api/criteria/1
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "name": "수정된 기준명",
  "description": "수정된 설명",
  "weight": 0.3
}
```

### 3.4 기준 삭제
```http
DELETE /api/criteria/1
Authorization: Bearer [TOKEN]
```

### 3.5 기준 순서 변경
```http
PUT /api/criteria/1/reorder
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "new_position": 2
}
```

## 4. 대안(Alternatives) 관리 API

### 4.1 대안 목록 조회
```http
GET /api/alternatives/1
Authorization: Bearer [TOKEN]
```

**응답:**
```json
{
  "alternatives": [
    {
      "id": 1,
      "project_id": 1,
      "name": "iPhone 15 Pro",
      "description": "애플의 최신 프리미엄 스마트폰",
      "cost": 1200000.0,
      "position": 1,
      "created_at": "2025-08-14T...",
      "updated_at": "2025-08-14T..."
    },
    {
      "id": 2,
      "project_id": 1,
      "name": "Samsung Galaxy S24",
      "description": "삼성의 플래그십 모델",
      "cost": 1100000.0,
      "position": 2,
      "created_at": "2025-08-14T...",
      "updated_at": "2025-08-14T..."
    }
  ],
  "total": 2
}
```

### 4.2 대안 생성
```http
POST /api/alternatives
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "project_id": 1,
  "name": "Google Pixel 8",
  "description": "구글의 AI 기반 스마트폰",
  "cost": 800000,
  "position": 3
}
```

### 4.3 대안 수정
```http
PUT /api/alternatives/1
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "name": "수정된 대안명",
  "description": "수정된 설명",
  "cost": 1300000
}
```

### 4.4 대안 삭제
```http
DELETE /api/alternatives/1
Authorization: Bearer [TOKEN]
```

### 4.5 대안 순서 변경
```http
PUT /api/alternatives/1/reorder
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "new_position": 2
}
```

## 5. 쌍대비교(Pairwise Comparisons) API

### 5.1 쌍대비교 데이터 조회
```http
GET /api/comparisons/1?comparison_type=criteria&parent_criteria_id=1
Authorization: Bearer [TOKEN]
```

**응답:**
```json
{
  "comparisons": [
    {
      "id": 1,
      "project_id": 1,
      "evaluator_id": 1,
      "parent_criteria_id": null,
      "comparison_type": "criteria",
      "element_a_id": 1,
      "element_b_id": 2,
      "value": 3.0,
      "consistency_ratio": null,
      "created_at": "2025-08-14T...",
      "updated_at": "2025-08-14T...",
      "evaluator_name": "Admin User"
    }
  ],
  "total": 1
}
```

### 5.2 쌍대비교 생성/업데이트
```http
POST /api/comparisons
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "project_id": 1,
  "comparison_type": "criteria",
  "element_a_id": 1,
  "element_b_id": 2,
  "value": 3.0,
  "parent_criteria_id": null
}
```

**설명:**
- `comparison_type`: "criteria" 또는 "alternatives"
- `element_a_id`, `element_b_id`: 비교할 요소의 ID
- `value`: 비교 값 (1/9 ~ 9 사이)
- `parent_criteria_id`: 대안 비교 시 기준 ID (기준 비교 시 null)

### 5.3 비교 매트릭스 조회
```http
GET /api/comparisons/1/matrix?comparison_type=criteria&evaluator_id=1
Authorization: Bearer [TOKEN]
```

**응답:**
```json
{
  "elements": [
    {"id": 1, "name": "가격"},
    {"id": 2, "name": "성능"},
    {"id": 3, "name": "디자인"}
  ],
  "matrix": [
    [1, 3, 2],
    [0.333, 1, 0.5],
    [0.5, 2, 1]
  ],
  "comparison_type": "criteria",
  "parent_criteria_id": null,
  "evaluator_id": 1,
  "total_comparisons": 3,
  "required_comparisons": 3
}
```

### 5.4 쌍대비교 삭제
```http
DELETE /api/comparisons/1
Authorization: Bearer [TOKEN]
```

### 5.5 일관성 비율 계산
```http
GET /api/comparisons/1/consistency?comparison_type=criteria
Authorization: Bearer [TOKEN]
```

**응답:**
```json
{
  "consistency_ratio": 0.05,
  "is_consistent": true,
  "max_eigenvalue": 3.037,
  "consistency_index": 0.0185,
  "message": "Consistency calculation completed"
}
```

## 6. 오류 처리

### 6.1 인증 오류
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### 6.2 권한 오류
```json
{
  "error": "Access denied",
  "code": "ACCESS_DENIED"
}
```

### 6.3 유효성 검증 오류
```json
{
  "error": "Validation failed",
  "details": [
    {
      "type": "field",
      "msg": "Name is required",
      "path": "name",
      "location": "body"
    }
  ]
}
```

### 6.4 리소스 없음 오류
```json
{
  "error": "Project not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

## 7. AHP 스케일 가이드

### 7.1 Saaty의 9점 척도
| 값 | 의미 | 설명 |
|---|------|------|
| 1 | 동등하게 중요 | 두 요소가 동일한 중요도 |
| 3 | 약간 더 중요 | 경험과 판단에 의해 한 요소가 다른 요소보다 약간 선호됨 |
| 5 | 강하게 더 중요 | 경험과 판단에 의해 한 요소가 다른 요소보다 강하게 선호됨 |
| 7 | 매우 강하게 더 중요 | 한 요소가 다른 요소보다 매우 강하게 선호됨 |
| 9 | 극단적으로 더 중요 | 한 요소가 다른 요소보다 극단적으로 선호됨 |
| 2,4,6,8 | 중간값 | 인접한 판단들 사이의 중간값 |
| 1/3, 1/5, 1/7, 1/9 | 역수 | 요소 j가 요소 i보다 중요할 때 |

### 7.2 일관성 비율(CR) 기준
- CR < 0.1: 일관성 있음 (허용)
- CR ≥ 0.1: 일관성 부족 (재평가 필요)

## 8. 사용 예시

### 8.1 완전한 AHP 평가 과정
```bash
# 1. 로그인
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ahp-system.com","password":"password123"}' \
  | jq -r '.token')

# 2. 프로젝트 조회
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN"

# 3. 기준 조회
curl -X GET http://localhost:5000/api/criteria/1 \
  -H "Authorization: Bearer $TOKEN"

# 4. 대안 조회
curl -X GET http://localhost:5000/api/alternatives/1 \
  -H "Authorization: Bearer $TOKEN"

# 5. 기준 간 쌍대비교
curl -X POST http://localhost:5000/api/comparisons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "comparison_type": "criteria",
    "element_a_id": 1,
    "element_b_id": 2,
    "value": 3.0
  }'

# 6. 매트릭스 조회
curl -X GET "http://localhost:5000/api/comparisons/1/matrix?comparison_type=criteria" \
  -H "Authorization: Bearer $TOKEN"
```

이 가이드를 따라 모든 AHP 기능을 완전히 활용할 수 있습니다.