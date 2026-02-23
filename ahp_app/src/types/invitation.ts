/**
 * Invitation System Types
 * JWT-based evaluator invitation with 9-state lifecycle
 */

export type InvitationStatus =
  | 'pending'      // Created, not yet sent
  | 'sent'         // Email dispatched
  | 'failed'       // Email delivery failed
  | 'bounced'      // Email bounced back
  | 'opened'       // Evaluator opened the link
  | 'in_progress'  // Evaluator started evaluation
  | 'completed'    // Evaluation finished
  | 'expired'      // Token expired
  | 'cancelled';   // Admin cancelled

export type EvaluatorPermission =
  | 'pairwise_compare'
  | 'direct_input'
  | 'survey'
  | 'fuzzy_evaluate'
  | 'view_results';

export interface Invitation {
  id: string;               // UUID
  project_id: number;
  evaluator_email: string;
  evaluator_name?: string;
  status: InvitationStatus;
  token: string;            // JWT invitation token
  access_key: string;       // KEY_XXXXXXXX fallback
  pin_code?: string;        // Optional PIN for extra security
  custom_message?: string;
  permissions: EvaluatorPermission[];
  expiry_date: string;      // ISO 8601
  created_at: string;
  updated_at: string;
  sent_at?: string;
  opened_at?: string;
  completed_at?: string;
  reminder_count: number;
  max_reminders: number;
}

export interface InvitationBatch {
  id: string;
  project_id: number;
  total_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  invitations: Invitation[];
}

export interface InvitationAuditLog {
  id: string;
  invitation_id: string;
  from_status: InvitationStatus;
  to_status: InvitationStatus;
  actor: string;            // user email or 'system'
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  created_at: string;
}

export interface CreateInvitationRequest {
  project_id: number;
  evaluators: Array<{
    email: string;
    name?: string;
  }>;
  custom_message?: string;
  expiry_days: number;
  permissions: EvaluatorPermission[];
  pin_required: boolean;
}

export interface TokenVerifyResponse {
  valid: boolean;
  invitation_id?: string;
  project_id?: number;
  project_title?: string;
  evaluator_email?: string;
  permissions?: EvaluatorPermission[];
  requires_pin?: boolean;
  error?: string;
}

export interface InvitationStats {
  total: number;
  pending: number;
  sent: number;
  opened: number;
  in_progress: number;
  completed: number;
  expired: number;
  cancelled: number;
  failed: number;
  response_rate: number;    // (completed / sent) * 100
}

export interface ReminderConfig {
  invitation_id: string;
  schedule: 'once' | 'daily' | 'weekly';
  max_reminders: number;
  custom_message?: string;
}
