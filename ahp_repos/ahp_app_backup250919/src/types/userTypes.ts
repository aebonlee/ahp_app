/**
 * AHP 시스템 회원 분류 체계
 * 3가지 주요 회원 유형: 관리자, 개인서비스이용자, 평가자
 */

// ============================================================================
// 기본 회원 유형 정의
// ============================================================================

export type UserType = 'admin' | 'personal_service_user' | 'evaluator';

export interface BaseUser {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  date_joined?: string; // Django 표준 필드
  last_login?: string;
}

// ============================================================================
// 1. 관리자 (Admin) - 시스템 운영 및 관리
// ============================================================================

export type AdminRole = 'super_admin' | 'system_admin' | 'content_admin';

export interface AdminUser extends BaseUser {
  user_type: 'admin';
  admin_role: AdminRole;
  permissions: AdminPermission[];
  managed_users?: string[]; // 관리하는 사용자 ID 목록
  is_superuser: boolean;
  is_staff: boolean;
}

export interface AdminPermission {
  id: string;
  name: string;
  codename: string;
  description: string;
  resource: 'users' | 'projects' | 'system' | 'content' | 'subscription';
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

// AEBON 전용 특별 권한 (최고 관리자)
export const AEBON_EXCLUSIVE_PERMISSIONS = [
  'SYSTEM_ADMIN',
  'USER_MANAGEMENT_FULL',
  'ROLE_ASSIGNMENT_ANY',
  'PROJECT_OVERRIDE_ALL',
  'DATA_EXPORT_ALL',
  'AUDIT_LOGS_FULL',
  'SYSTEM_SETTINGS_MODIFY',
  'DATABASE_ACCESS_DIRECT',
  'BACKUP_RESTORE_SYSTEM',
  'SUBSCRIPTION_MANAGEMENT_ALL',
  'BILLING_ACCESS_FULL',
  'ANALYTICS_UNRESTRICTED'
] as const;

// ============================================================================
// 2. 개인서비스이용자 (Personal Service User) - 유료 서비스 이용
// ============================================================================

export type ServiceTier = 'free' | 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'suspended';

export interface PersonalServiceUser extends BaseUser {
  user_type: 'personal_service_user';
  subscription: UserSubscription;
  service_tier: ServiceTier;
  projects: PersonalProject[];
  evaluators_managed: EvaluatorUser[];
  usage_stats: ServiceUsageStats;
  billing_info?: BillingInformation;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  service_tier: ServiceTier;
  tier: ServiceTier; // 추가: PersonalServiceDashboard에서 사용
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  trial_end_date?: string;
  trial_ends_at?: string; // 추가: PersonalServiceDashboard에서 사용
  days_remaining?: number; // 추가: PersonalServiceDashboard에서 사용
  storage_limit: number; // 추가: PersonalServiceDashboard에서 사용
  features: string[]; // 추가: PersonalServiceDashboard에서 사용
  limits: SubscriptionLimits;
  current_usage: ServiceUsageStats;
}

export interface SubscriptionLimits {
  max_projects: number;
  projects: number; // 추가: PersonalServiceDashboard에서 사용 (max_projects의 별칭)
  max_evaluators_per_project: number;
  evaluators_per_project: number; // 추가: PersonalServiceDashboard에서 사용
  max_criteria_per_project: number;
  max_alternatives_per_project: number;
  max_surveys_per_project: number;
  storage_limit_gb: number;
  support_level: 'email' | 'priority' | 'dedicated';
  advanced_analytics: boolean;
  api_access: boolean;
  custom_branding: boolean;
}

export interface ServiceUsageStats {
  projects_created: number;
  evaluators_invited: number;
  surveys_conducted: number;
  storage_used_gb: number;
  api_calls_this_month: number;
  last_activity: string;
}

export interface PersonalProject {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  assigned_evaluators: string[];
  created_at: string;
  updated_at: string;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  is_public: boolean;
  allow_anonymous_evaluation: boolean;
  evaluation_deadline?: string;
  notification_settings: NotificationSettings;
  advanced_options: AdvancedProjectOptions;
}

export interface NotificationSettings {
  email_reminders: boolean;
  progress_updates: boolean;
  completion_alerts: boolean;
  weekly_summaries: boolean;
}

export interface AdvancedProjectOptions {
  group_decision_making: boolean;
  sensitivity_analysis: boolean;
  inconsistency_monitoring: boolean;
  real_time_collaboration: boolean;
  custom_evaluation_scales: boolean;
}

// ============================================================================
// 3. 평가자 (Evaluator) - 설문 평가 참여
// ============================================================================

export type EvaluatorStatus = 'invited' | 'active' | 'completed' | 'inactive';
export type InvitationMethod = 'email' | 'link' | 'access_key' | 'qr_code';

export interface EvaluatorUser extends BaseUser {
  user_type: 'evaluator';
  evaluator_profile: EvaluatorProfile;
  profile: EvaluatorProfile; // 추가: EvaluatorDashboard에서 사용 (evaluator_profile의 별칭)
  assigned_projects: EvaluatorProjectAssignment[];
  evaluation_history: EvaluationSession[];
  preferences: EvaluatorPreferences;
}

export interface EvaluatorProfile {
  display_name?: string;
  organization?: string;
  department?: string;
  expertise_areas?: string[];
  bio?: string;
  avatar_url?: string;
  contact_preferences: ContactPreferences;
}

export interface ContactPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  reminder_frequency: 'never' | 'daily' | 'weekly' | 'before_deadline';
  language_preference: 'ko' | 'en';
}

export interface EvaluatorProjectAssignment {
  project_id: string;
  project_title: string;
  assigned_by: string; // PersonalServiceUser ID
  assigned_at: string;
  status: EvaluatorStatus;
  invitation_method: InvitationMethod;
  access_key?: string;
  deadline?: string;
  instructions?: string;
  evaluation_progress: EvaluationProgress;
}

export interface EvaluationProgress {
  total_comparisons: number;
  completed_comparisons: number;
  consistency_ratio?: number;
  time_spent_minutes: number;
  last_activity: string;
  completion_percentage: number;
}

export interface EvaluationSession {
  id: string;
  project_id: string;
  evaluator_id: string;
  started_at: string;
  completed_at?: string;
  comparisons: PairwiseComparison[];
  session_data: SessionMetadata;
  final_results?: EvaluationResults;
}

export interface PairwiseComparison {
  id: string;
  criterion_id?: string;
  alternative_a_id: string;
  alternative_b_id: string;
  comparison_value: number; // 1/9 to 9 scale
  confidence_level?: number; // 1-5 scale
  comment?: string;
  timestamp: string;
}

export interface SessionMetadata {
  browser_info: string;
  ip_address: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  session_duration_minutes: number;
  breaks_taken: number;
  help_accessed: boolean;
}

export interface EvaluationResults {
  final_rankings: AlternativeRanking[];
  consistency_ratio: number;
  decision_confidence: number;
  evaluation_quality_score: number;
  recommendations?: string[];
}

export interface AlternativeRanking {
  alternative_id: string;
  alternative_name: string;
  final_score: number;
  rank: number;
  confidence_interval?: [number, number];
}

export interface EvaluatorPreferences {
  tutorial_completed: boolean;
  preferred_comparison_method: 'slider' | 'radio' | 'dropdown';
  show_consistency_warnings: boolean;
  auto_save_frequency: number; // minutes
  dashboard_layout: 'compact' | 'detailed' | 'minimal';
}

// ============================================================================
// 회원가입 및 인증 관련 타입
// ============================================================================

export interface RegistrationRequest {
  user_type: UserType;
  basic_info: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  };
  admin_request?: AdminRegistrationData;
  service_request?: ServiceRegistrationData;
  evaluator_request?: EvaluatorRegistrationData;
}

export interface AdminRegistrationData {
  requested_role: AdminRole;
  organization: string;
  purpose: string;
  reference_contact?: string;
  special_permissions_requested?: string[];
}

export interface ServiceRegistrationData {
  organization?: string;
  expected_usage: {
    estimated_projects: number;
    estimated_evaluators: number;
    use_case_description: string;
  };
  trial_request: boolean;
  preferred_tier: ServiceTier;
  payment_ready: boolean;
}

export interface EvaluatorRegistrationData {
  invitation_code?: string;
  access_key?: string;
  project_id?: string;
  invited_by?: string;
  profile_info?: Partial<EvaluatorProfile>;
}

// ============================================================================
// 권한 및 접근 제어
// ============================================================================

export interface AccessControl {
  user_type: UserType;
  allowed_routes: string[];
  allowed_actions: string[];
  restricted_features: string[];
  data_access_scope: DataAccessScope;
}

export interface DataAccessScope {
  own_data: boolean;
  managed_users_data: boolean;
  all_users_data: boolean;
  system_data: boolean;
  project_data: 'own' | 'assigned' | 'managed' | 'all';
  evaluation_data: 'own' | 'assigned' | 'all';
}

// ============================================================================
// 유틸리티 타입 및 가드 함수
// ============================================================================

export const isAdminUser = (user: BaseUser): user is AdminUser => {
  return user.user_type === 'admin';
};

export const isPersonalServiceUser = (user: BaseUser): user is PersonalServiceUser => {
  return user.user_type === 'personal_service_user';
};

export const isEvaluatorUser = (user: BaseUser): user is EvaluatorUser => {
  return user.user_type === 'evaluator';
};

// AEBON 전용 체크
export const isAebonUser = (user: BaseUser): boolean => {
  return user.username?.toLowerCase() === 'aebon';
};

export const hasAebonPrivileges = (user: BaseUser): boolean => {
  return isAebonUser(user) && isAdminUser(user) && user.admin_role === 'super_admin';
};

// 권한 체크 유틸리티
export const canManageUserType = (admin: AdminUser, targetUserType: UserType): boolean => {
  if (isAebonUser(admin)) return true;
  
  switch (admin.admin_role) {
    case 'super_admin':
      return true;
    case 'system_admin':
      return targetUserType !== 'admin';
    case 'content_admin':
      return targetUserType === 'evaluator';
    default:
      return false;
  }
};

// 구독 상태 체크
export const hasActiveSubscription = (user: PersonalServiceUser): boolean => {
  return user.subscription.status === 'active' || user.subscription.status === 'trial';
};

export const canCreateProject = (user: PersonalServiceUser): boolean => {
  if (!hasActiveSubscription(user)) return false;
  return user.usage_stats.projects_created < user.subscription.limits.max_projects;
};

export const canInviteEvaluator = (user: PersonalServiceUser, projectId: string): boolean => {
  if (!hasActiveSubscription(user)) return false;
  
  const project = user.projects.find(p => p.id === projectId);
  if (!project) return false;
  
  return project.assigned_evaluators.length < user.subscription.limits.max_evaluators_per_project;
};

// BillingInformation 인터페이스 정의
export interface BillingInformation {
  payment_method: 'credit_card' | 'bank_transfer' | 'paypal' | 'other';
  billing_address: {
    country: string;
    city: string;
    address: string;
    postal_code: string;
  };
  tax_id?: string;
  company_name?: string;
  last_payment_date?: string;
  next_billing_date?: string;
}

// 기본 내보내기 제거 - 모든 내보내기는 named export로 처리됨