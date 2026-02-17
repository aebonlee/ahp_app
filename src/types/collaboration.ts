/**
 * 실시간 협업 WebSocket 타입 정의 (Phase 2b)
 * 설계 문서: Dev_md_2602/설계문서_Opus/실시간협업_아키텍처.md
 */

// ─── 이벤트 타입 열거 ─────────────────────────────────────────────────────────

export type CollaborationEventType =
  // 모델 변경 이벤트
  | 'criteria_update'
  | 'criteria_create'
  | 'criteria_delete'
  | 'alternative_update'
  | 'alternative_create'
  | 'alternative_delete'
  // 평가 이벤트
  | 'evaluation_submit'
  | 'evaluation_reset'
  // 프레즌스 이벤트
  | 'cursor_move'
  | 'selection_change'
  | 'user_join'
  | 'user_leave'
  // 채팅 이벤트
  | 'chat_message'
  // 잠금 이벤트
  | 'model_lock'
  | 'model_unlock'
  | 'lock_request'
  // 시스템 이벤트
  | 'heartbeat'
  | 'heartbeat_ack'
  | 'error'
  | 'presence_sync';

// ─── 페이로드 타입 ─────────────────────────────────────────────────────────────

export interface CriteriaUpdatePayload {
  criteria_id: string;
  field: 'name' | 'description' | 'weight' | 'parent_id';
  value: string | number | null;
  previous_value?: string | number | null;
}

export interface EvaluationSubmitPayload {
  comparison_id: string;
  criteria_id: string;
  item1_id: string;
  item2_id: string;
  value: number;
}

export interface ChatMessagePayload {
  message: string;
  message_id: string;
  mentions?: string[];
}

export interface CursorMovePayload {
  x: number;
  y: number;
}

export interface SelectionChangePayload {
  node_id: string | null;
  node_type?: 'criteria' | 'alternative';
}

export interface LockRequestPayload {
  node_id: string;
  node_type: 'criteria' | 'alternative';
}

export interface ErrorPayload {
  message: string;
  code: string;
}

export interface HeartbeatAckPayload {
  server_version: number;
  online_count: number;
}

export interface AckPayload {
  client_id: string;
  version?: number;
  status: 'ok' | 'conflict' | 'rejected';
  conflict_data?: Record<string, unknown>;
}

// ─── 메시지 구조 ───────────────────────────────────────────────────────────────

export interface ClientMessage {
  type: CollaborationEventType;
  data: Record<string, unknown>;
  version?: number;
  client_id: string;
}

export interface ServerMessage {
  type: CollaborationEventType | 'ack';
  data: Record<string, unknown>;
  user_id?: string;
  user_name?: string;
  timestamp: string;
  version?: number;
  client_id?: string;
}

// ─── 사용자 프레즌스 ───────────────────────────────────────────────────────────

export interface OnlineUser {
  user_id: string;
  user_name: string;
  user_email: string;
  role: 'owner' | 'admin' | 'evaluator' | 'viewer';
  connected_at: string;
  current_node: string | null;
}

// ─── 연결 상태 ─────────────────────────────────────────────────────────────────

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected';

// ─── 훅 인터페이스 ─────────────────────────────────────────────────────────────

export interface UseCollaborationOptions {
  projectId: string;
  autoConnect?: boolean;
  heartbeatInterval?: number;
  maxReconnectAttempts?: number;
  ackTimeout?: number;
  onEvent?: (event: ServerMessage) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: ErrorPayload) => void;
}

export interface UseCollaborationReturn {
  status: ConnectionStatus;
  onlineUsers: OnlineUser[];
  serverVersion: number;
  pendingCount: number;
  sendEvent: (
    type: CollaborationEventType,
    data: Record<string, unknown>,
    options?: { persist?: boolean }
  ) => string;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}
