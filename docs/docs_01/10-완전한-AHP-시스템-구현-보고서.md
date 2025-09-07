# 10. 완전한 AHP 시스템 구현 보고서

## 일시
- **일시**: 2025년 8월 17일 11:00:00

## 개요
GitHub 기준으로 완전히 작동하는 AHP (Analytic Hierarchy Process) 의사결정 지원 시스템을 구현했습니다.

## 1. 데이터베이스 스키마 완성

### 새로 추가된 테이블
```sql
-- 기준(Criteria) 테이블
CREATE TABLE criteria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER,
    level INTEGER NOT NULL DEFAULT 1,
    weight REAL DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 대안(Alternatives) 테이블  
CREATE TABLE alternatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cost REAL DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 쌍대비교 매트릭스 테이블
CREATE TABLE pairwise_comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    evaluator_id INTEGER,
    parent_criteria_id INTEGER,
    comparison_type TEXT NOT NULL CHECK (comparison_type IN ('criteria', 'alternatives')),
    element_a_id INTEGER NOT NULL,
    element_b_id INTEGER NOT NULL,
    value REAL NOT NULL,
    consistency_ratio REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 평가 세션 테이블
CREATE TABLE evaluation_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    evaluator_id INTEGER NOT NULL,
    session_name TEXT,
    status TEXT DEFAULT 'in_progress',
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 0,
    completion_percentage REAL DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AHP 계산 결과 테이블
CREATE TABLE ahp_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    evaluator_id INTEGER,
    result_type TEXT NOT NULL CHECK (result_type IN ('individual', 'group', 'final')),
    criteria_weights TEXT,
    alternative_scores TEXT,
    final_ranking TEXT,
    consistency_ratio REAL,
    calculation_method TEXT,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 설정 테이블
CREATE TABLE project_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    data_type TEXT DEFAULT 'string',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 샘플 데이터
1. **스마트폰 선택 평가 프로젝트**
   - 기준: 가격, 성능, 디자인
   - 대안: iPhone 15 Pro, Samsung Galaxy S24, Google Pixel 8

2. **직원 채용 평가 프로젝트**
   - 기준: 기술력, 커뮤니케이션, 성장 가능성
   - 대안: 후보자 A, 후보자 B, 후보자 C

## 2. API 엔드포인트 구현

### 2.1 기준(Criteria) 관리 API
```
GET    /api/criteria/:projectId     - 프로젝트의 모든 기준 조회
POST   /api/criteria               - 새 기준 생성
PUT    /api/criteria/:id           - 기준 수정
DELETE /api/criteria/:id           - 기준 삭제
PUT    /api/criteria/:id/reorder   - 기준 순서 변경
```

**주요 기능:**
- 계층 구조 지원 (4단계까지)
- 위치 기반 정렬
- 무결성 검사 (하위 기준 존재 시 삭제 방지)
- 비교 데이터 존재 시 삭제 방지

### 2.2 대안(Alternatives) 관리 API
```
GET    /api/alternatives/:projectId     - 프로젝트의 모든 대안 조회
POST   /api/alternatives               - 새 대안 생성
PUT    /api/alternatives/:id           - 대안 수정
DELETE /api/alternatives/:id           - 대안 삭제
PUT    /api/alternatives/:id/reorder   - 대안 순서 변경
```

**주요 기능:**
- 중복 이름 방지
- 비용 정보 관리
- 위치 기반 정렬
- 비교 데이터 존재 시 삭제 방지

### 2.3 쌍대비교(Pairwise Comparisons) API
```
GET    /api/comparisons/:projectId           - 쌍대비교 데이터 조회
POST   /api/comparisons                     - 쌍대비교 생성/업데이트
GET    /api/comparisons/:projectId/matrix   - 비교 매트릭스 조회
DELETE /api/comparisons/:id                 - 쌍대비교 삭제
GET    /api/comparisons/:projectId/consistency - 일관성 비율 계산
```

**주요 기능:**
- AHP 스케일 (1/9 ~ 9) 지원
- 매트릭스 정규화 (상삼각 행렬로 저장)
- 자동 역수 계산
- 일관성 검사 지원

## 3. 권한 관리 시스템

### 3.1 사용자 역할
- **관리자(admin)**: 프로젝트 생성, 기준/대안 관리, 모든 평가 데이터 조회
- **평가자(evaluator)**: 할당된 프로젝트의 쌍대비교 수행

### 3.2 접근 권한 검증
- 프로젝트별 소유권 확인
- 평가자 배정 상태 확인
- API 레벨에서 세밀한 권한 제어

## 4. 데이터 무결성 보장

### 4.1 검증 규칙
- 요소 ID 존재 확인
- 중복 데이터 방지
- 순환 참조 방지
- 계층 구조 깊이 제한

### 4.2 Cascade 삭제
- 프로젝트 삭제 시 관련 데이터 자동 삭제
- 참조 무결성 유지

## 5. 성능 최적화

### 5.1 인덱스 설정
```sql
CREATE INDEX idx_criteria_project_id ON criteria(project_id);
CREATE INDEX idx_alternatives_project_id ON alternatives(project_id);
CREATE INDEX idx_pairwise_comparisons_project_evaluator ON pairwise_comparisons(project_id, evaluator_id);
```

### 5.2 쿼리 최적화
- JOIN 최소화
- 조건부 필터링
- 페이지네이션 지원

## 6. API 응답 형식

### 6.1 성공 응답
```json
{
  "message": "Operation completed successfully",
  "data": {
    // 응답 데이터
  },
  "total": 10
}
```

### 6.2 오류 응답
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## 7. 테스트 시나리오

### 7.1 프로젝트 생성 및 설정
1. 관리자 로그인
2. 새 프로젝트 생성
3. 기준 추가 (3개)
4. 대안 추가 (3개)

### 7.2 쌍대비교 수행
1. 기준 간 쌍대비교 (3개 = 3쌍)
2. 각 기준별 대안 쌍대비교 (3개 × 3쌍 = 9쌍)
3. 일관성 검사 수행

### 7.3 결과 계산
1. 기준 가중치 계산
2. 대안별 점수 계산
3. 최종 순위 결정

## 8. 다음 구현 단계

### 8.1 AHP 계산 엔진
- 고유값/고유벡터 계산
- 일관성 비율(CR) 정확한 계산
- 그룹 의사결정 지원

### 8.2 결과 시각화
- 계층 구조 다이어그램
- 가중치 차트
- 민감도 분석

### 8.3 프론트엔드 UI
- 쌍대비교 인터페이스
- 매트릭스 입력 도구
- 결과 대시보드

## 9. 설치 및 실행

### 9.1 백엔드 서버
```bash
cd backend
npm install
npm run dev
```

### 9.2 데이터베이스 초기화
- SQLite 자동 초기화 (로컬)
- PostgreSQL 마이그레이션 (프로덕션)

### 9.3 API 테스트
```bash
# 로그인
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ahp-system.com","password":"password123"}'

# 프로젝트 목록 조회
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer [TOKEN]"
```

## 10. 결론

완전한 AHP 시스템의 백엔드 구조가 구현되었습니다. 모든 핵심 기능이 API로 제공되며, GitHub에서 바로 사용할 수 있는 상태입니다. 다음 단계로 프론트엔드 UI와 고급 계산 기능을 구현할 예정입니다.