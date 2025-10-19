# Django Admin 누락 모델 리스트

## 📊 현재 상태
- **총 DB 테이블 수**: 43개
- **Admin 등록됨**: 약 20개
- **미등록**: 약 23개

## ❌ Django Admin에 등록 필요한 모델들

### 1. Projects 앱 (누락)
```python
# 이 모델들은 DB에 있지만 Admin에 없음:
- project_members (프로젝트 멤버)
- comparison_matrices (비교 행렬)
- sensitivity_analyses (민감도 분석)
- report_templates (보고서 템플릿)
```

### 2. Common/System 앱 (누락)
```python
# 시스템 관리에 중요한 모델들:
- activity_logs (활동 로그)
- notifications (알림)
- system_settings (시스템 설정)
- api_keys (API 키)
- file_uploads (파일 업로드)
```

### 3. Django 기본 테이블 (선택적)
```python
# 필요시 추가 가능:
- django_admin_log (관리자 로그)
- django_migrations (마이그레이션)
- django_session (세션)
- django_content_type (컨텐츠 타입)
- django_site (사이트)
```

### 4. 사용자 권한 관련 (누락)
```python
- users_groups (사용자 그룹)
- users_user_permissions (사용자 권한)
- auth_permission (권한)
- auth_group_permissions (그룹 권한)
```

## ✅ 이미 등록된 모델들
- ✅ Users
- ✅ User profiles
- ✅ Projects (ahp_projects)
- ✅ Criterias
- ✅ Project templates
- ✅ Evaluations
- ✅ Evaluation invitations
- ✅ Evaluation sessions
- ✅ Pairwise comparisons
- ✅ Demographic surveys
- ✅ Analysis results
- ✅ Consensus metrics
- ✅ Weight vectors
- ✅ Social accounts
- ✅ Tokens

## 🔧 수정 필요 파일
1. `django_backend/apps/projects/admin.py`
2. `django_backend/apps/common/admin.py` (생성 필요)
3. `django_backend/apps/accounts/admin.py`

## 📝 추가 코드 예시
```python
# apps/projects/admin.py에 추가
from .models import ProjectMember, ComparisonMatrix, SensitivityAnalysis, ReportTemplate

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'joined_at']
    list_filter = ['role', 'joined_at']
    search_fields = ['project__title', 'user__email']

@admin.register(ComparisonMatrix)
class ComparisonMatrixAdmin(admin.ModelAdmin):
    list_display = ['project', 'evaluator', 'created_at']
    list_filter = ['created_at']

# apps/common/admin.py (새로 생성)
from django.contrib import admin
from .models import ActivityLog, Notification, SystemSetting, APIKey, FileUpload

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'timestamp', 'ip_address']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__email', 'action']
    readonly_fields = ['timestamp']

@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'updated_at']
    search_fields = ['key']
```