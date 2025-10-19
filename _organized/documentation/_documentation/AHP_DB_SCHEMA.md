# AHP 플랫폼 데이터베이스 스키마 문서

## 📋 목차
1. [데이터베이스 개요](#데이터베이스-개요)
2. [E-R 다이어그램](#e-r-다이어그램)
3. [테이블 상세 구조](#테이블-상세-구조)
4. [테이블 관계도](#테이블-관계도)

---

## 데이터베이스 개요

### 시스템 구성
- **DBMS**: PostgreSQL (Render.com 호스팅)
- **ORM**: Django ORM
- **총 테이블 수**: 28개
- **앱 구성**: 7개 Django 앱 (accounts, projects, evaluations, analysis, common, workshops, exports)

### 핵심 기능
- **사용자 관리**: Custom User 모델 (AbstractUser 확장)
- **프로젝트 관리**: AHP 프로젝트, 계층 구조, 템플릿
- **평가 시스템**: 쌍대비교, 일관성 검증, 평가자 초대
- **분석 엔진**: 가중치 계산, 민감도 분석, 합의도 분석
- **워크샵**: 실시간 다중 평가자 세션
- **리포팅**: 다양한 형식의 보고서 생성

---

## E-R 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AHP Platform ERD                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│      USERS       │ (accounts.User)
├──────────────────┤
│ PK id            │
│    username      │───┐
│    email         │   │
│    full_name     │   │ owns
│    organization  │   │
│    role          │   ├──────────────────────┐
│    is_evaluator  │   │                      │
│    created_at    │   │                      ▼
└──────────────────┘   │              ┌──────────────────┐
        │              │              │    PROJECTS      │ (projects.Project)
        │ 1:1          │              ├──────────────────┤
        ▼              │              │ PK id (UUID)     │
┌──────────────────┐   │              │ FK owner_id      │◄──────┐
│  USER_PROFILES   │   │              │    title         │       │
├──────────────────┤   │              │    description   │       │
│ PK id            │   │              │    status        │       │ has
│ FK user_id       │   │              │    visibility    │       │
│    avatar        │   │              │    created_at    │       │
│    bio           │   │              │    deadline      │       │
│    expertise     │   │              └──────────────────┘       │
└──────────────────┘   │                      │                  │
                       │                      │ 1:N              │
                       │                      ▼                  │
┌──────────────────┐   │              ┌──────────────────┐       │
│ PROJECT_MEMBERS  │   │              │     CRITERIA     │       │
├──────────────────┤   │              ├──────────────────┤       │
│ PK id            │   │              │ PK id            │       │
│ FK project_id    │◄──┼──────────────┤ FK project_id    │       │
│ FK user_id       │◄──┘              │ FK parent_id     │──┐    │
│    role          │                  │    name          │  │    │
│    can_edit      │                  │    type          │  │    │
│    joined_at     │                  │    level         │  │    │
└──────────────────┘                  │    order         │  │    │
                                      │    weight        │  │    │
                                      └──────────────────┘  │    │
                                              │             │    │
                                              └─────────────┘    │
                                                 self-ref        │
                                                 (hierarchy)     │
┌─────────────────────────────────────────────────────────────────┐
│                       EVALUATION SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌───────────────────────┐
│   EVALUATIONS    │         │ EVALUATION_INVITATIONS│
├──────────────────┤         ├───────────────────────┤
│ PK id (UUID)     │         │ PK id                 │
│ FK project_id    │◄────────┤ FK project_id         │
│ FK evaluator_id  │◄────────┤ FK evaluator_id       │
│    status        │         │ FK invited_by_id      │
│    progress      │         │    token (UUID)       │
│    started_at    │         │    status             │
│    completed_at  │         │    sent_at            │
│    consistency_  │         │    expires_at         │
│      ratio       │         └───────────────────────┘
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────────┐        ┌──────────────────────┐
│  PAIRWISE_COMPARISONS    │        │  DEMOGRAPHIC_SURVEYS │
├──────────────────────────┤        ├──────────────────────┤
│ PK id                    │        │ PK id (UUID)         │
│ FK evaluation_id         │        │ FK evaluator_id      │
│ FK criteria_a_id         │        │ FK project_id        │
│ FK criteria_b_id         │        │    age               │
│    value (1/9 ~ 9)       │        │    gender            │
│    comment               │        │    education         │
│    confidence            │        │    experience        │
│    time_spent            │        │    decision_role     │
└──────────────────────────┘        │    is_completed      │
        │                            └──────────────────────┘
        │ 1:N
        ▼
┌──────────────────────────┐
│   EVALUATION_SESSIONS    │
├──────────────────────────┤
│ PK id                    │
│ FK evaluation_id         │
│    started_at            │
│    ended_at              │
│    page_views (JSON)     │
│    interactions (JSON)   │
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       ANALYSIS SYSTEM                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│   ANALYSIS_RESULTS   │        │    WEIGHT_VECTORS    │
├──────────────────────┤        ├──────────────────────┤
│ PK id (UUID)         │        │ PK id                │
│ FK project_id        │◄───────┤ FK project_id        │
│ FK created_by_id     │        │ FK criteria_id       │
│    type              │        │ FK evaluation_id     │
│    status            │        │    weight            │
│    results (JSON)    │        │    normalized_weight │
│    parameters (JSON) │        │    rank              │
│    created_at        │        │    method            │
└──────────────────────┘        └──────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│  CONSENSUS_METRICS   │        │ SENSITIVITY_ANALYSIS │
├──────────────────────┤        ├──────────────────────┤
│ PK id                │        │ PK id                │
│ FK project_id        │        │ FK project_id        │
│    kendall_w         │        │ FK criteria_id       │
│    spearman_rho      │        │    perturbation_range│
│    consensus_index   │        │    sensitivity_coeff │
│    consensus_level   │        │    rank_reversals    │
└──────────────────────┘        │    chart_data (JSON) │
                                └──────────────────────┘

┌──────────────────────────┐
│   COMPARISON_MATRICES    │
├──────────────────────────┤
│ PK id                    │
│ FK evaluation_id         │
│ FK parent_criteria_id    │
│    matrix_data (JSON)    │
│    consistency_ratio     │
│    eigenvalue_max        │
│    priority_vector       │
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       WORKSHOP SYSTEM                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  WORKSHOP_SESSIONS   │
├──────────────────────┤
│ PK id (UUID)         │
│ FK project_id        │◄──────────┐
│ FK facilitator_id    │           │
│    title             │           │ for
│    workshop_code     │           │
│    scheduled_at      │           │
│    status            │           │
│    max_participants  │           │
└──────────────────────┘           │
        │                          │
        │ 1:N                      │
        ▼                          │
┌──────────────────────────┐       │
│  WORKSHOP_PARTICIPANTS   │       │
├──────────────────────────┤       │
│ PK id                    │       │
│ FK workshop_id           │───────┘
│ FK user_id               │
│    email                 │
│    name                  │
│    role                  │
│    status                │
│    completion_rate       │
│    access_token (UUID)   │
└──────────────────────────┘
        │
        │ 1:1
        ▼
┌──────────────────────────┐       ┌──────────────────────────┐
│   REALTIME_PROGRESS      │       │ GROUP_CONSENSUS_RESULTS  │
├──────────────────────────┤       ├──────────────────────────┤
│ PK id                    │       │ PK id                    │
│ FK workshop_id           │       │ FK workshop_id (1:1)     │
│ FK participant_id        │       │    kendalls_w            │
│    current_comparison    │       │    consensus_indicator   │
│    comparisons_completed │       │    aggregated_weights    │
│    is_active             │       │    outlier_participants  │
└──────────────────────────┘       └──────────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│   SURVEY_TEMPLATES   │        │   SURVEY_RESPONSES   │
├──────────────────────┤        ├──────────────────────┤
│ PK id                │        │ PK id                │
│ FK created_by_id     │        │ FK workshop_id       │
│    name              │◄───────┤ FK participant_id    │
│    type              │        │ FK template_id       │
│    questions (JSON)  │        │    responses (JSON)  │
└──────────────────────┘        └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       COMMON SYSTEM                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│    ACTIVITY_LOGS     │        │  SYSTEM_SETTINGS     │
├──────────────────────┤        ├──────────────────────┤
│ PK id                │        │ PK id                │
│ FK user_id           │        │    key (unique)      │
│    action            │        │    value             │
│    message           │        │    value_type        │
│    ip_address        │        │    category          │
│    timestamp         │        │    is_public         │
└──────────────────────┘        └──────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│    NOTIFICATIONS     │        │     FILE_UPLOADS     │
├──────────────────────┤        ├──────────────────────┤
│ PK id                │        │ PK id (UUID)         │
│ FK recipient_id      │        │ FK uploaded_by_id    │
│    title             │        │    original_name     │
│    message           │        │    file_path         │
│    type              │        │    file_size         │
│    is_read           │        │    mime_type         │
│    created_at        │        │    status            │
└──────────────────────┘        └──────────────────────┘

┌──────────────────────┐
│      API_KEYS        │
├──────────────────────┤
│ PK id (UUID)         │
│ FK user_id           │
│    name              │
│    key (unique)      │
│    permissions       │
│    rate_limit        │
│    is_active         │
└──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       EXPORT SYSTEM                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐
│   EXPORT_TEMPLATES   │        │   EXPORT_HISTORY     │
├──────────────────────┤        ├──────────────────────┤
│ PK id                │        │ PK id (UUID)         │
│ FK created_by_id     │◄───────┤ FK project_id        │
│    name              │        │ FK template_id       │
│    format            │        │ FK exported_by_id    │
│    template_type     │        │    file_name         │
│    include_sections  │        │    file_path         │
└──────────────────────┘        │    status            │
                                │    download_count    │
                                └──────────────────────┘

┌──────────────────────┐
│   REPORT_SCHEDULES   │
├──────────────────────┤
│ PK id                │
│ FK project_id        │
│ FK template_id       │
│ FK created_by_id     │
│    frequency         │
│    next_run          │
│    recipients (JSON) │
└──────────────────────┘
```

---

## 테이블 상세 구조

### 1. accounts 앱 (사용자 관리)

#### 1.1 users (사용자)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    
    -- 프로필 필드
    full_name VARCHAR(100),
    organization VARCHAR(200),
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    
    -- 시스템 필드
    is_evaluator BOOLEAN DEFAULT FALSE,
    is_project_manager BOOLEAN DEFAULT FALSE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- 설정
    language VARCHAR(10) DEFAULT 'ko',
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul'
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization);
CREATE INDEX idx_users_is_evaluator ON users(is_evaluator);
```

**주요 관계**:
- → user_profiles (1:1)
- → owned_projects (1:N)
- → evaluations (1:N)
- → project_members (M:N via ProjectMember)

**비즈니스 로직**:
- Custom User 모델 (Django AbstractUser 확장)
- 역할: evaluator, project_manager, staff, superuser
- 마지막 활동 시간 추적

---

#### 1.2 user_profiles (사용자 프로필)
```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 미디어
    avatar VARCHAR(100),  -- 파일 경로
    bio TEXT,
    
    -- 연구 정보
    expertise_areas JSONB DEFAULT '[]',
    research_interests TEXT,
    publications TEXT,
    
    -- 알림 설정
    email_notifications BOOLEAN DEFAULT TRUE,
    project_updates BOOLEAN DEFAULT TRUE,
    evaluation_reminders BOOLEAN DEFAULT TRUE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**주요 관계**:
- ← users (1:1)

**비즈니스 로직**:
- 사용자 추가 정보 저장
- 알림 설정 관리
- expertise_areas는 JSON 배열로 다중 전문 분야 저장

---

### 2. projects 앱 (프로젝트 관리)

#### 2.1 simple_projects (프로젝트)
```sql
CREATE TABLE simple_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    objective TEXT,
    
    -- 소유자 및 협력자
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 상태
    status VARCHAR(20) DEFAULT 'draft',  -- draft, active, evaluation, completed, archived
    visibility VARCHAR(20) DEFAULT 'private',  -- private, team, public
    
    -- AHP 설정
    consistency_ratio_threshold FLOAT DEFAULT 0.1,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE,
    
    -- 메타데이터
    tags JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}'
);

-- 인덱스
CREATE INDEX idx_projects_owner ON simple_projects(owner_id);
CREATE INDEX idx_projects_status ON simple_projects(status);
CREATE INDEX idx_projects_created_at ON simple_projects(created_at);
```

**주요 관계**:
- ← users (owner) (N:1)
- → project_members (1:N)
- → criteria (1:N)
- → evaluations (1:N)
- → workshops (1:N)

**비즈니스 로직**:
- AHP 분석 프로젝트의 메인 엔티티
- UUID 기반 ID (보안 및 분산 시스템 지원)
- consistency_ratio_threshold: 일관성 비율 임계값 (기본 0.1)

---

#### 2.2 project_members (프로젝트 멤버)
```sql
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 역할
    role VARCHAR(20) NOT NULL,  -- owner, manager, evaluator, viewer
    
    -- 권한
    can_edit_structure BOOLEAN DEFAULT FALSE,
    can_manage_evaluators BOOLEAN DEFAULT FALSE,
    can_view_results BOOLEAN DEFAULT TRUE,
    
    -- 타임스탬프
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT unique_project_user UNIQUE (project_id, user_id)
);

-- 인덱스
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← users (N:1)

**비즈니스 로직**:
- 프로젝트와 사용자의 M:N 관계 중간 테이블
- 역할 기반 접근 제어 (RBAC)
- 세분화된 권한 관리

---

#### 2.3 criteria (평가기준/대안)
```sql
CREATE TABLE criteria (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    
    -- 기본 정보
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,  -- criteria, alternative
    
    -- 계층 구조
    parent_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    
    -- 가중치
    weight FLOAT DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_project_criteria_name UNIQUE (project_id, name)
);

-- 인덱스
CREATE INDEX idx_criteria_project ON criteria(project_id);
CREATE INDEX idx_criteria_parent ON criteria(parent_id);
CREATE INDEX idx_criteria_level_order ON criteria(level, "order");
```

**주요 관계**:
- ← simple_projects (N:1)
- ← criteria (parent) (N:1, self-referencing)
- → criteria (children) (1:N, self-referencing)
- → pairwise_comparisons (1:N)

**비즈니스 로직**:
- AHP 계층 구조의 노드
- 자기 참조 관계로 계층 표현
- level: 계층 깊이 (0=최상위)
- order: 같은 level 내 정렬 순서
- type: criteria(평가기준) 또는 alternative(대안)

---

#### 2.4 project_templates (프로젝트 템플릿)
```sql
CREATE TABLE project_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    
    -- 템플릿 데이터
    structure JSONB NOT NULL,  -- 계층 구조 정의
    default_settings JSONB DEFAULT '{}',
    
    -- 메타
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**주요 관계**:
- ← users (N:1)

**비즈니스 로직**:
- 프로젝트 생성 시 재사용 가능한 템플릿
- structure: JSON으로 계층 구조 정의
- usage_count: 템플릿 사용 횟수 추적

---

### 3. evaluations 앱 (평가 시스템)

#### 3.1 evaluations (평가 세션)
```sql
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 평가 정보
    title VARCHAR(200),
    instructions TEXT,
    
    -- 상태
    status VARCHAR(20) DEFAULT 'pending',  -- pending, in_progress, completed, expired
    progress FLOAT DEFAULT 0.0 CHECK (progress >= 0 AND progress <= 100),
    
    -- 타이밍
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 결과
    consistency_ratio FLOAT,
    is_consistent BOOLEAN DEFAULT FALSE,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT unique_project_evaluator UNIQUE (project_id, evaluator_id)
);

-- 인덱스
CREATE INDEX idx_evaluations_project ON evaluations(project_id);
CREATE INDEX idx_evaluations_evaluator ON evaluations(evaluator_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← users (evaluator) (N:1)
- → pairwise_comparisons (1:N)
- → evaluation_sessions (1:N)

**비즈니스 로직**:
- 평가자의 평가 진행 상태 추적
- consistency_ratio: 일관성 비율 (CR < 0.1 권장)
- progress: 0~100 범위의 진행률

---

#### 3.2 pairwise_comparisons (쌍대비교)
```sql
CREATE TABLE pairwise_comparisons (
    id SERIAL PRIMARY KEY,
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    criteria_a_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    criteria_b_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    
    -- 비교 값 (Saaty의 1/9 ~ 9 척도)
    value FLOAT NOT NULL CHECK (value >= 1.0/9.0 AND value <= 9.0),
    
    -- 추가 컨텍스트
    comment TEXT,
    confidence INTEGER DEFAULT 5 CHECK (confidence >= 1 AND confidence <= 10),
    
    -- 타이밍
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent FLOAT DEFAULT 0.0,  -- 초 단위
    
    CONSTRAINT unique_eval_criteria_pair UNIQUE (evaluation_id, criteria_a_id, criteria_b_id),
    CONSTRAINT check_different_criteria CHECK (criteria_a_id != criteria_b_id)
);

-- 인덱스
CREATE INDEX idx_pairwise_evaluation ON pairwise_comparisons(evaluation_id);
CREATE INDEX idx_pairwise_criteria_a ON pairwise_comparisons(criteria_a_id);
CREATE INDEX idx_pairwise_criteria_b ON pairwise_comparisons(criteria_b_id);
```

**주요 관계**:
- ← evaluations (N:1)
- ← criteria (criteria_a) (N:1)
- ← criteria (criteria_b) (N:1)

**비즈니스 로직**:
- AHP 쌍대비교 데이터 저장
- Saaty 척도: 1/9, 1/8, ..., 1, ..., 8, 9
- value = 1: 동일 중요도
- value > 1: criteria_a가 더 중요
- value < 1: criteria_b가 더 중요
- confidence: 평가자의 확신도 (1~10)

---

#### 3.3 evaluation_sessions (평가 세션)
```sql
CREATE TABLE evaluation_sessions (
    id SERIAL PRIMARY KEY,
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    
    -- 세션 정보
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration FLOAT DEFAULT 0.0,  -- 초 단위
    
    -- 사용자 활동
    page_views JSONB DEFAULT '[]',
    interactions JSONB DEFAULT '[]',
    
    -- 브라우저/장치 정보
    user_agent TEXT,
    ip_address INET
);

-- 인덱스
CREATE INDEX idx_evaluation_sessions_evaluation ON evaluation_sessions(evaluation_id);
CREATE INDEX idx_evaluation_sessions_started_at ON evaluation_sessions(started_at);
```

**주요 관계**:
- ← evaluations (N:1)

**비즈니스 로직**:
- 평가 세션별 사용자 활동 추적
- UX 분석 및 사용성 개선 데이터
- page_views, interactions: JSON 배열로 이벤트 로그 저장

---

#### 3.4 evaluation_invitations (평가 초대)
```sql
CREATE TABLE evaluation_invitations (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 초대 상세
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, accepted, declined, expired
    
    -- 타이밍
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 보안 토큰
    token UUID UNIQUE DEFAULT gen_random_uuid(),
    
    CONSTRAINT unique_project_evaluator_invitation UNIQUE (project_id, evaluator_id)
);

-- 인덱스
CREATE INDEX idx_invitations_project ON evaluation_invitations(project_id);
CREATE INDEX idx_invitations_evaluator ON evaluation_invitations(evaluator_id);
CREATE INDEX idx_invitations_token ON evaluation_invitations(token);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← users (evaluator) (N:1)
- ← users (invited_by) (N:1)

**비즈니스 로직**:
- 평가자 초대 관리
- token: 이메일 링크를 통한 안전한 접근
- 초대 수락 시 evaluation 레코드 생성

---

#### 3.5 demographic_surveys (인구통계 설문)
```sql
CREATE TABLE demographic_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES simple_projects(id) ON DELETE CASCADE,
    
    -- 인구통계 정보
    age VARCHAR(10),  -- 20s, 30s, 40s, 50s, 60s
    gender VARCHAR(15),  -- male, female, other, prefer-not
    education VARCHAR(20),  -- high-school, bachelor, master, phd, other
    occupation VARCHAR(100),
    
    -- 전문 정보
    experience VARCHAR(10),  -- less-1, 1-3, 3-5, 5-10, more-10
    department VARCHAR(100),
    position VARCHAR(100),
    project_experience VARCHAR(10),  -- none, 1-2, 3-5, more-5
    
    -- 의사결정 역할
    decision_role VARCHAR(20),  -- decision-maker, advisor, analyst, evaluator, observer
    additional_info TEXT,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT FALSE,
    completion_timestamp TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_evaluator_project_survey UNIQUE (evaluator_id, project_id)
);

-- 인덱스
CREATE INDEX idx_demographic_evaluator ON demographic_surveys(evaluator_id);
CREATE INDEX idx_demographic_project ON demographic_surveys(project_id);
```

**주요 관계**:
- ← users (evaluator) (N:1)
- ← simple_projects (N:1, optional)

**비즈니스 로직**:
- 평가자 배경 정보 수집
- 분석 시 그룹별 비교에 사용
- project_id NULL 가능 (일반 설문)

---

### 4. analysis 앱 (분석 엔진)

#### 4.1 analysis_results (분석 결과)
```sql
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 분석 타입
    type VARCHAR(20) NOT NULL,  -- individual, group, sensitivity, consensus
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- 파라미터 및 결과
    parameters JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    summary TEXT,
    
    -- 상태
    status VARCHAR(20) DEFAULT 'processing',  -- processing, completed, failed
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_analysis_results_project ON analysis_results(project_id);
CREATE INDEX idx_analysis_results_type ON analysis_results(type);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← users (created_by) (N:1)

**비즈니스 로직**:
- 다양한 분석 유형의 결과 저장
- parameters, results: JSON으로 유연한 데이터 구조

---

#### 4.2 weight_vectors (가중치 벡터)
```sql
CREATE TABLE weight_vectors (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
    
    -- 가중치 데이터
    weight FLOAT NOT NULL,
    normalized_weight FLOAT NOT NULL,
    rank INTEGER NOT NULL,
    
    -- 계산 방법
    method VARCHAR(50) DEFAULT 'eigenvector',  -- eigenvector, geometric_mean
    
    -- 메타데이터
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_final BOOLEAN DEFAULT FALSE
);

-- 인덱스
CREATE INDEX idx_weight_vectors_project ON weight_vectors(project_id);
CREATE INDEX idx_weight_vectors_criteria ON weight_vectors(criteria_id);
CREATE INDEX idx_weight_vectors_rank ON weight_vectors(rank);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← criteria (N:1)
- ← evaluations (N:1, optional)

**비즈니스 로직**:
- 계산된 가중치 저장
- evaluation_id NULL: 그룹 통합 가중치
- evaluation_id 있음: 개별 평가자 가중치

---

#### 4.3 consensus_metrics (합의도 지표)
```sql
CREATE TABLE consensus_metrics (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    
    -- 합의도 측정값
    kendall_w FLOAT,  -- Kendall's W coefficient (0~1)
    spearman_rho FLOAT,  -- Average Spearman's rho
    consensus_index FLOAT,
    
    -- 그룹 통계
    total_evaluators INTEGER NOT NULL,
    completed_evaluations INTEGER NOT NULL,
    average_consistency FLOAT,
    
    -- 불일치 분석
    high_disagreement_criteria JSONB DEFAULT '[]',
    outlier_evaluators JSONB DEFAULT '[]',
    
    -- 결과
    consensus_level VARCHAR(20),  -- high, medium, low
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_consensus_metrics_project ON consensus_metrics(project_id);
```

**주요 관계**:
- ← simple_projects (N:1)

**비즈니스 로직**:
- 그룹 평가의 합의 정도 측정
- kendall_w: 평가자 간 순위 일치도
- outlier_evaluators: 다수 의견과 다른 평가자 식별

---

#### 4.4 sensitivity_analyses (민감도 분석)
```sql
CREATE TABLE sensitivity_analyses (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    
    -- 분석 파라미터
    perturbation_range FLOAT DEFAULT 0.1,  -- ±10%
    steps INTEGER DEFAULT 20,
    
    -- 결과
    sensitivity_coefficient FLOAT NOT NULL,
    rank_reversals JSONB DEFAULT '[]',
    critical_values JSONB DEFAULT '{}',
    
    -- 시각화 데이터
    chart_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_sensitivity_project ON sensitivity_analyses(project_id);
CREATE INDEX idx_sensitivity_criteria ON sensitivity_analyses(criteria_id);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← criteria (N:1)

**비즈니스 로직**:
- 가중치 변화에 따른 결과 민감도 분석
- rank_reversals: 순위 역전이 발생하는 임계값
- perturbation_range: 가중치 변동 범위

---

#### 4.5 comparison_matrices (비교 행렬)
```sql
CREATE TABLE comparison_matrices (
    id SERIAL PRIMARY KEY,
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    parent_criteria_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    
    -- 행렬 데이터
    matrix_data JSONB NOT NULL,  -- 2D array
    criteria_order JSONB NOT NULL,  -- Criteria ID order
    
    -- 행렬 속성
    dimension INTEGER NOT NULL,
    consistency_ratio FLOAT NOT NULL,
    eigenvalue_max FLOAT NOT NULL,
    
    -- 도출된 가중치
    priority_vector JSONB NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_comparison_matrices_evaluation ON comparison_matrices(evaluation_id);
```

**주요 관계**:
- ← evaluations (N:1)
- ← criteria (parent) (N:1, optional)

**비즈니스 로직**:
- 쌍대비교 행렬 저장 및 계산 결과
- parent_criteria_id NULL: 최상위 기준 비교
- 고유벡터법으로 priority_vector 계산

---

#### 4.6 report_templates (보고서 템플릿)
```sql
CREATE TABLE report_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- 템플릿 설정
    template_type VARCHAR(50) NOT NULL,  -- executive_summary, detailed_analysis, etc.
    template_content JSONB NOT NULL,
    
    -- 설정
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**주요 관계**:
- ← users (N:1)

**비즈니스 로직**:
- 분석 보고서 생성 템플릿
- template_content: 섹션, 차트, 표 구성 정의

---

### 5. workshops 앱 (워크샵 시스템)

#### 5.1 workshop_sessions (워크샵 세션)
```sql
CREATE TABLE workshop_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    facilitator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 워크샵 정보
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    workshop_code VARCHAR(10) UNIQUE NOT NULL,
    max_participants INTEGER DEFAULT 30,
    
    -- 타이밍
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 120,
    
    -- 상태
    status VARCHAR(20) DEFAULT 'preparation',  -- preparation, in_progress, analyzing, completed, cancelled
    is_anonymous BOOLEAN DEFAULT FALSE,
    allow_late_join BOOLEAN DEFAULT TRUE,
    
    -- 결과
    consensus_method VARCHAR(50) DEFAULT 'geometric_mean',
    consensus_achieved BOOLEAN DEFAULT FALSE,
    
    -- 문서화
    meeting_minutes TEXT,
    recording_url VARCHAR(200),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_workshop_sessions_project ON workshop_sessions(project_id);
CREATE INDEX idx_workshop_sessions_facilitator ON workshop_sessions(facilitator_id);
CREATE INDEX idx_workshop_sessions_code ON workshop_sessions(workshop_code);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← users (facilitator) (N:1)
- → workshop_participants (1:N)

**비즈니스 로직**:
- 실시간 다중 평가자 세션
- workshop_code: 참가자 접속용 6자리 코드
- is_anonymous: 익명 평가 여부

---

#### 5.2 workshop_participants (워크샵 참가자)
```sql
CREATE TABLE workshop_participants (
    id SERIAL PRIMARY KEY,
    workshop_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- 참가자 정보
    email VARCHAR(254) NOT NULL,
    name VARCHAR(100) NOT NULL,
    organization VARCHAR(200),
    department VARCHAR(100),
    
    -- 역할
    role VARCHAR(20) DEFAULT 'evaluator',  -- evaluator, observer, facilitator
    
    -- 상태
    status VARCHAR(20) DEFAULT 'invited',  -- invited, registered, active, completed, absent
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    
    -- 진행 상황
    completion_rate FLOAT DEFAULT 0.0,
    last_activity TIMESTAMP WITH TIME ZONE,
    
    -- 접근 제어
    access_token UUID UNIQUE DEFAULT gen_random_uuid(),
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_workshop_email UNIQUE (workshop_id, email)
);

-- 인덱스
CREATE INDEX idx_workshop_participants_workshop ON workshop_participants(workshop_id);
CREATE INDEX idx_workshop_participants_user ON workshop_participants(user_id);
CREATE INDEX idx_workshop_participants_token ON workshop_participants(access_token);
```

**주요 관계**:
- ← workshop_sessions (N:1)
- ← users (N:1, optional)

**비즈니스 로직**:
- 워크샵 참가자 관리
- user_id NULL 가능 (비회원 참가)
- access_token: 워크샵 접속 인증

---

#### 5.3 realtime_progress (실시간 진행 상황)
```sql
CREATE TABLE realtime_progress (
    id SERIAL PRIMARY KEY,
    workshop_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    participant_id INTEGER NOT NULL REFERENCES workshop_participants(id) ON DELETE CASCADE,
    
    -- 진행 상황
    current_comparison VARCHAR(200),
    comparisons_completed INTEGER DEFAULT 0,
    total_comparisons INTEGER NOT NULL,
    
    -- 타이밍
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- 상태
    is_active BOOLEAN DEFAULT TRUE,
    is_stuck BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT unique_workshop_participant_progress UNIQUE (workshop_id, participant_id)
);

-- 인덱스
CREATE INDEX idx_realtime_progress_workshop ON realtime_progress(workshop_id);
```

**주요 관계**:
- ← workshop_sessions (N:1)
- ← workshop_participants (N:1)

**비즈니스 로직**:
- 실시간 진행 모니터링
- is_stuck: 일정 시간 진행 없을 시 표시
- WebSocket/SSE로 대시보드 업데이트

---

#### 5.4 group_consensus_results (그룹 합의 결과)
```sql
CREATE TABLE group_consensus_results (
    id SERIAL PRIMARY KEY,
    workshop_id UUID UNIQUE NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    
    -- 합의도 측정
    kendalls_w FLOAT,
    consensus_indicator FLOAT,
    disagreement_index FLOAT,
    
    -- 통합 가중치
    aggregated_weights JSONB NOT NULL,
    individual_weights JSONB NOT NULL,
    
    -- 통계 분석
    mean_weights JSONB NOT NULL,
    std_deviation JSONB NOT NULL,
    confidence_intervals JSONB NOT NULL,
    
    -- 이상치 분석
    outlier_participants JSONB DEFAULT '[]',
    consensus_clusters JSONB DEFAULT '{}',
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**주요 관계**:
- ← workshop_sessions (1:1)

**비즈니스 로직**:
- 워크샵 종료 후 그룹 합의 분석
- aggregated_weights: 기하평균 등으로 통합된 가중치
- consensus_clusters: 유사한 의견 그룹 식별

---

#### 5.5 survey_templates (설문 템플릿)
```sql
CREATE TABLE survey_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,  -- demographic, pre_evaluation, post_evaluation, custom
    
    -- 설문 구조
    questions JSONB NOT NULL,
    settings JSONB DEFAULT '{}',
    
    -- 사용 현황
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**주요 관계**:
- ← users (N:1)

**비즈니스 로직**:
- 워크샵 사전/사후 설문 템플릿
- questions: JSON 배열로 질문 정의

---

#### 5.6 survey_responses (설문 응답)
```sql
CREATE TABLE survey_responses (
    id SERIAL PRIMARY KEY,
    workshop_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
    participant_id INTEGER NOT NULL REFERENCES workshop_participants(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES survey_templates(id) ON DELETE CASCADE,
    
    -- 응답 데이터
    responses JSONB NOT NULL,
    
    -- 메타데이터
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    CONSTRAINT unique_workshop_participant_template UNIQUE (workshop_id, participant_id, template_id)
);

-- 인덱스
CREATE INDEX idx_survey_responses_workshop ON survey_responses(workshop_id);
CREATE INDEX idx_survey_responses_template ON survey_responses(template_id);
```

**주요 관계**:
- ← workshop_sessions (N:1)
- ← workshop_participants (N:1)
- ← survey_templates (N:1)

**비즈니스 로직**:
- 참가자별 설문 응답 저장
- responses: JSON으로 질문별 답변 저장

---

### 6. common 앱 (공통 시스템)

#### 6.1 activity_logs (활동 로그)
```sql
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- 활동 정보
    action VARCHAR(20) NOT NULL,  -- create, update, delete, view, export, import, login, logout
    level VARCHAR(10) DEFAULT 'info',  -- info, warning, error, debug
    
    -- 대상 객체 (Generic Foreign Key)
    content_type_id INTEGER REFERENCES django_content_type(id) ON DELETE CASCADE,
    object_id VARCHAR(255),
    
    -- 상세 정보
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    
    -- 요청 컨텍스트
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_activity_logs_user_timestamp ON activity_logs(user_id, timestamp);
CREATE INDEX idx_activity_logs_action_timestamp ON activity_logs(action, timestamp);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
```

**주요 관계**:
- ← users (N:1, optional)

**비즈니스 로직**:
- 시스템 전체 활동 추적
- 감사(Audit) 및 보안 모니터링
- details: JSON으로 추가 메타데이터 저장

---

#### 6.2 system_settings (시스템 설정)
```sql
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(20) NOT NULL,  -- general, security, email, analytics, ui
    
    -- 값 및 타입
    value TEXT NOT NULL,
    value_type VARCHAR(10) DEFAULT 'string',  -- string, integer, float, boolean, json
    
    -- 메타데이터
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_editable BOOLEAN DEFAULT TRUE,
    
    -- 검증
    validation_rules JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
```

**주요 관계**:
- ← users (updated_by) (N:1, optional)

**비즈니스 로직**:
- 시스템 전역 설정 관리
- 타입 기반 값 변환 (get_typed_value 메서드)
- validation_rules: JSON으로 검증 규칙 정의

---

#### 6.3 file_uploads (파일 업로드)
```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 파일 정보
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- 업로드 컨텍스트
    upload_type VARCHAR(50) NOT NULL,  -- project_import, data_export, user_avatar, document
    status VARCHAR(20) DEFAULT 'uploading',  -- uploading, completed, failed
    
    -- 처리 결과
    processing_results JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- 메타데이터
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_file_uploads_user ON file_uploads(uploaded_by_id);
CREATE INDEX idx_file_uploads_type ON file_uploads(upload_type);
```

**주요 관계**:
- ← users (N:1)

**비즈니스 로직**:
- 파일 업로드 추적 및 관리
- processing_results: 파일 처리 결과 (예: 임포트 통계)

---

#### 6.4 notifications (알림)
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 알림 내용
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(10) DEFAULT 'info',  -- info, success, warning, error
    
    -- 상태
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    
    -- 선택적 액션
    action_url VARCHAR(200),
    action_label VARCHAR(50),
    
    -- 관련 객체 (Generic Foreign Key)
    content_type_id INTEGER REFERENCES django_content_type(id) ON DELETE CASCADE,
    object_id VARCHAR(255),
    
    -- 타이밍
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_notifications_recipient_is_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

**주요 관계**:
- ← users (recipient) (N:1)

**비즈니스 로직**:
- 사용자별 알림 관리
- action_url: 알림 클릭 시 이동할 URL
- 자동 만료 (expires_at)

---

#### 6.5 api_keys (API 키)
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 키 정보
    name VARCHAR(100) NOT NULL,
    key VARCHAR(64) UNIQUE NOT NULL,
    
    -- 권한
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,  -- requests per hour
    
    -- 상태
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- 타이밍
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);
```

**주요 관계**:
- ← users (N:1)

**비즈니스 로직**:
- 외부 통합을 위한 API 키 관리
- rate_limit: 시간당 요청 제한
- usage_count: 사용 통계 추적

---

### 7. exports 앱 (리포팅 시스템)

#### 7.1 export_templates (내보내기 템플릿)
```sql
CREATE TABLE export_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    format VARCHAR(10) NOT NULL,  -- excel, pdf, word, csv, json
    template_type VARCHAR(30) NOT NULL,  -- executive_summary, detailed_analysis, etc.
    
    -- 템플릿 설정
    include_sections JSONB DEFAULT '{}',
    styling_options JSONB DEFAULT '{}',
    
    -- 브랜딩
    logo_url VARCHAR(200),
    header_text VARCHAR(200),
    footer_text VARCHAR(200),
    
    -- 설정
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**주요 관계**:
- ← users (N:1)

**비즈니스 로직**:
- 다양한 형식의 보고서 템플릿
- include_sections: 포함할 섹션 설정
- 조직별 브랜딩 지원

---

#### 7.2 export_history (내보내기 이력)
```sql
CREATE TABLE export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES export_templates(id) ON DELETE SET NULL,
    exported_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 파일 정보
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    format VARCHAR(10) NOT NULL,
    
    -- 상태
    status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, failed
    error_message TEXT,
    
    -- 타이밍
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- 다운로드 추적
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_export_history_project ON export_history(project_id);
CREATE INDEX idx_export_history_user ON export_history(exported_by_id);
CREATE INDEX idx_export_history_created_at ON export_history(created_at);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← export_templates (N:1, optional)
- ← users (N:1)

**비즈니스 로직**:
- 내보내기 작업 이력 관리
- 다운로드 횟수 추적
- 임시 파일 자동 삭제 (expires_at)

---

#### 7.3 report_schedules (보고서 스케줄)
```sql
CREATE TABLE report_schedules (
    id SERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES simple_projects(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES export_templates(id) ON DELETE CASCADE,
    created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 스케줄 설정
    frequency VARCHAR(10) NOT NULL,  -- once, daily, weekly, monthly
    next_run TIMESTAMP WITH TIME ZONE NOT NULL,
    last_run TIMESTAMP WITH TIME ZONE,
    
    -- 수신자
    recipients JSONB DEFAULT '[]',  -- Array of email addresses
    
    -- 상태
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_report_schedules_project ON report_schedules(project_id);
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run);
```

**주요 관계**:
- ← simple_projects (N:1)
- ← export_templates (N:1)
- ← users (N:1)

**비즈니스 로직**:
- 자동 보고서 생성 스케줄링
- recipients: JSON 배열로 이메일 목록 저장
- Celery/크론잡으로 실행

---

## 테이블 관계도

### 핵심 관계 요약

```
USER (1) ──owns──> (N) PROJECT
USER (N) ──evaluates──> (N) PROJECT [via EVALUATION]
USER (N) ──member_of──> (N) PROJECT [via PROJECT_MEMBER]

PROJECT (1) ──has──> (N) CRITERIA
PROJECT (1) ──has──> (N) EVALUATION
PROJECT (1) ──has──> (N) WORKSHOP_SESSION

CRITERIA (1) ──parent_of──> (N) CRITERIA [self-referencing hierarchy]

EVALUATION (1) ──contains──> (N) PAIRWISE_COMPARISON
PAIRWISE_COMPARISON (N) ──compares──> (2) CRITERIA

WORKSHOP_SESSION (1) ──includes──> (N) WORKSHOP_PARTICIPANT
WORKSHOP_SESSION (1) ──produces──> (1) GROUP_CONSENSUS_RESULT

PROJECT (1) ──analyzed_in──> (N) ANALYSIS_RESULT
PROJECT (1) ──exported_as──> (N) EXPORT_HISTORY
```

### 외래 키 제약조건 정책

- **ON DELETE CASCADE**: 부모 삭제 시 자식도 삭제
  - 예: Project 삭제 → 모든 Evaluation 삭제
- **ON DELETE SET NULL**: 부모 삭제 시 FK NULL로 변경
  - 예: User 삭제 → ActivityLog.user_id = NULL
- **ON DELETE PROTECT** (앱 레벨): 자식 존재 시 삭제 차단
  - Django 모델에서 필요 시 구현

---

## DB 초기화 방법

### Render.com 완전 초기화

#### 1단계: 환경변수 설정
```bash
# Render.com Dashboard → Environment 탭
FLUSH_DB=true
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=your_password
DJANGO_SUPERUSER_EMAIL=admin@example.com
```

#### 2단계: 재배포
- Manual Deploy → Clear build cache & deploy

#### 3단계: 정상화
- 성공 후 **FLUSH_DB 환경변수 삭제**

### 로컬 개발 초기화

```bash
cd D:\ahp\ahp_django_service_updated

# 1. 기존 마이그레이션 파일 삭제 (선택적)
find apps -path "*/migrations/*.py" -not -name "__init__.py" -delete

# 2. DB 플러시
python manage.py flush --noinput

# 3. 마이그레이션 생성 및 적용
python manage.py makemigrations
python manage.py migrate

# 4. 슈퍼유저 생성
python manage.py createsuperuser
```

---

## 성능 최적화 권장사항

### 인덱스 전략
- 외래 키 모두 인덱싱 완료
- 자주 필터링/정렬하는 컬럼 인덱싱
- 복합 인덱스: (user_id, timestamp) 등

### 쿼리 최적화
- `select_related()`: 1:1, N:1 관계
- `prefetch_related()`: 1:N, M:N 관계
- 불필요한 필드 제외: `only()`, `defer()`

### 데이터 파티셔닝 (대용량 시)
- activity_logs, evaluation_sessions 등 시간 기반 파티셔닝 고려

---

## 보안 고려사항

### 민감 데이터
- 비밀번호: Django PBKDF2 해싱
- API 키: 암호화 저장 권장
- 개인정보: GDPR 준수

### 접근 제어
- 행 레벨 보안: Django ORM 필터
- API 권한: DRF permissions
- rate_limit: API 키별 제한

---

*작성일: 2025-09-27*
*백엔드: Django 4.2.7 + PostgreSQL*
*배포: Render.com*