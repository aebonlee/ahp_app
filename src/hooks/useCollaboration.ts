/**
 * useCollaboration - WebSocket 실시간 협업 훅 (Phase 2b)
 * 설계: Claude Opus 4.6 (Dev_md_2602/설계문서_Opus/실시간협업_아키텍처.md)
 * 구현: Claude Sonnet 4.6
 *
 * 주요 기능:
 * - JWT 인증 기반 WebSocket 연결 (Django Channels)
 * - Exponential Backoff 재연결 (최대 10회, 최대 30초)
 * - 하트비트 관리 (기본 30초 간격)
 * - ACK 시스템 (5초 타임아웃, 미수신 시 로그)
 * - 프레즌스 추적 (온라인 사용자 목록)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import authService from '../services/authService';
import type {
  CollaborationEventType,
  ServerMessage,
  ClientMessage,
  OnlineUser,
  ConnectionStatus,
  ErrorPayload,
  AckPayload,
  HeartbeatAckPayload,
  UseCollaborationOptions,
  UseCollaborationReturn,
} from '../types/collaboration';

// ─── WebSocket URL 생성 ────────────────────────────────────────────────────────

function buildWebSocketUrl(projectId: string, token: string): string {
  const wsBase = API_BASE_URL
    .replace('https://', 'wss://')
    .replace('http://', 'ws://');
  return `${wsBase}/ws/project/${projectId}/?token=${encodeURIComponent(token)}`;
}

// ─── 훅 구현 ───────────────────────────────────────────────────────────────────

export function useCollaboration(options: UseCollaborationOptions): UseCollaborationReturn {
  const {
    projectId,
    autoConnect = true,
    heartbeatInterval = 30000,
    maxReconnectAttempts = 10,
    ackTimeout = 5000,
    onEvent,
    onStatusChange,
    onError,
  } = options;

  // ── 상태 ──────────────────────────────────────────────────────────────────

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [serverVersion, setServerVersion] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // ── Refs ───────────────────────────────────────────────────────────────────

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const pendingAcksRef = useRef<
    Map<string, { timer: ReturnType<typeof setTimeout>; resolve: () => void; reject: (err: Error) => void }>
  >(new Map());
  const isManualDisconnectRef = useRef<boolean>(false);
  const serverVersionRef = useRef<number>(0);
  const onEventRef = useRef(onEvent);
  const onStatusChangeRef = useRef(onStatusChange);
  const onErrorRef = useRef(onError);

  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // ── 상태 업데이트 헬퍼 ────────────────────────────────────────────────────

  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onStatusChangeRef.current?.(newStatus);
  }, []);

  // ── 하트비트 관리 ─────────────────────────────────────────────────────────

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'heartbeat',
          data: {},
          client_id: crypto.randomUUID(),
        } satisfies ClientMessage));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, stopHeartbeat]);

  // ── 보류 ACK 정리 ─────────────────────────────────────────────────────────

  const clearPendingAcks = useCallback(() => {
    pendingAcksRef.current.forEach(({ timer, reject }) => {
      clearTimeout(timer);
      reject(new Error('Connection closed'));
    });
    pendingAcksRef.current.clear();
    setPendingCount(0);
  }, []);

  // ── 재연결 (Exponential Backoff) ──────────────────────────────────────────

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    const token = authService.getAccessToken();
    if (!token) {
      console.warn('[useCollaboration] 인증 토큰 없음, WebSocket 연결 보류');
      updateStatus('disconnected');
      return;
    }

    const url = buildWebSocketUrl(projectId, token);
    updateStatus('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        updateStatus('connected');
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        handleMessage(event.data);
      };

      ws.onclose = (event) => {
        stopHeartbeat();
        clearPendingAcks();

        // 인증 실패(4001) / 권한 없음(4003) → 재연결 안 함
        if (event.code === 4001 || event.code === 4003) {
          const msg = event.code === 4001
            ? '인증에 실패했습니다. 다시 로그인해주세요.'
            : '프로젝트 접근 권한이 없습니다.';
          updateStatus('disconnected');
          onErrorRef.current?.({ message: msg, code: event.code === 4001 ? 'AUTH_FAILED' : 'ACCESS_DENIED' });
          return;
        }

        if (!isManualDisconnectRef.current) {
          scheduleReconnect();
        } else {
          updateStatus('disconnected');
        }
      };

      ws.onerror = () => {
        // onclose에서 처리하므로 로그만
        console.error('[useCollaboration] WebSocket 에러 발생');
      };
    } catch (error) {
      console.error('[useCollaboration] WebSocket 생성 실패:', error);
      scheduleReconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, updateStatus, startHeartbeat, stopHeartbeat, clearPendingAcks]);

  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnectRef.current) return;
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      updateStatus('disconnected');
      return;
    }

    updateStatus('reconnecting');

    const baseDelay = 1000;
    const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), 30000);
    const jitter = Math.random() * 500;

    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connectWebSocket();
    }, delay + jitter);
  }, [maxReconnectAttempts, updateStatus, connectWebSocket]);

  // ── WebSocket 메시지 처리 ──────────────────────────────────────────────────

  const handleMessage = useCallback((rawData: string) => {
    let message: ServerMessage & { client_id?: string; users?: OnlineUser[] };
    try {
      message = JSON.parse(rawData);
    } catch {
      console.error('[useCollaboration] JSON 파싱 실패');
      return;
    }

    const msgType = message.type as string;

    // ACK 처리
    if (msgType === 'ack') {
      const ack = message.data as unknown as AckPayload;
      const pending = pendingAcksRef.current.get(ack.client_id);
      if (pending) {
        clearTimeout(pending.timer);
        pending.resolve();
        pendingAcksRef.current.delete(ack.client_id);
        setPendingCount(pendingAcksRef.current.size);
      }
      if (ack.version) {
        serverVersionRef.current = ack.version;
        setServerVersion(ack.version);
      }
      return;
    }

    // 하트비트 ACK
    if (msgType === 'heartbeat_ack') {
      const hbData = message.data as unknown as HeartbeatAckPayload;
      if (hbData?.server_version) {
        serverVersionRef.current = hbData.server_version;
        setServerVersion(hbData.server_version);
      }
      return;
    }

    // 프레즌스 동기화 (연결 직후)
    if (msgType === 'presence_sync' && message.users) {
      setOnlineUsers(message.users);
      return;
    }

    // 서버 에러
    if (msgType === 'error') {
      const errorData = message.data as unknown as ErrorPayload;
      onErrorRef.current?.(errorData);
      return;
    }

    // 사용자 참여/이탈
    if (msgType === 'user_join' && message.user_id) {
      setOnlineUsers(prev => {
        if (prev.some(u => u.user_id === message.user_id)) return prev;
        return [...prev, {
          user_id: message.user_id!,
          user_name: message.user_name || '',
          user_email: '',
          role: 'viewer' as const,
          connected_at: message.timestamp,
          current_node: null,
        }];
      });
    }

    if (msgType === 'user_leave' && message.user_id) {
      setOnlineUsers(prev => prev.filter(u => u.user_id !== message.user_id));
    }

    // 커서/선택 변경 → 사용자 상태 업데이트
    if (msgType === 'selection_change' && message.user_id) {
      setOnlineUsers(prev =>
        prev.map(u =>
          u.user_id === message.user_id
            ? { ...u, current_node: message.data?.node_id as string ?? null }
            : u
        )
      );
    }

    // 서버 버전 업데이트
    if (message.version) {
      serverVersionRef.current = message.version;
      setServerVersion(message.version);
    }

    // 이벤트 콜백 호출
    onEventRef.current?.(message);
  }, []);

  // ── 이벤트 전송 ───────────────────────────────────────────────────────────

  const sendEvent = useCallback((
    type: CollaborationEventType,
    data: Record<string, unknown>,
    sendOptions?: { persist?: boolean }
  ): string => {
    const clientId = crypto.randomUUID();

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[useCollaboration] WebSocket 미연결, 이벤트 전송 불가');
      return clientId;
    }

    const message: ClientMessage = {
      type,
      data: sendOptions?.persist ? { ...data, persist: true } : data,
      version: serverVersionRef.current,
      client_id: clientId,
    };

    wsRef.current.send(JSON.stringify(message));

    // 경량 이벤트는 ACK 대기 생략
    const noAckEvents: CollaborationEventType[] = ['cursor_move', 'selection_change', 'heartbeat'];
    if (!noAckEvents.includes(type)) {
      const ackPromise = new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          pendingAcksRef.current.delete(clientId);
          setPendingCount(pendingAcksRef.current.size);
          reject(new Error(`ACK timeout: ${clientId}`));
        }, ackTimeout);

        pendingAcksRef.current.set(clientId, { timer, resolve, reject });
        setPendingCount(pendingAcksRef.current.size);
      });

      ackPromise.catch((err) => {
        console.warn('[useCollaboration] ACK 타임아웃:', err.message);
        onErrorRef.current?.({ message: '서버 응답 시간 초과', code: 'ACK_TIMEOUT' });
      });
    }

    return clientId;
  }, [ackTimeout]);

  // ── 공개 메서드 ───────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    isManualDisconnectRef.current = false;
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    stopHeartbeat();
    clearPendingAcks();
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    updateStatus('disconnected');
  }, [stopHeartbeat, clearPendingAcks, updateStatus]);

  const reconnect = useCallback(() => {
    isManualDisconnectRef.current = false;
    reconnectAttemptsRef.current = 0;
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    connectWebSocket();
  }, [connectWebSocket]);

  // ── 수명주기 ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (autoConnect && projectId) {
      connect();
    }

    return () => {
      isManualDisconnectRef.current = true;
      stopHeartbeat();
      clearPendingAcks();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close(1000, 'Component unmount');
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, autoConnect]);

  // 토큰 만료 이벤트 감지
  useEffect(() => {
    const handleTokenExpired = () => {
      disconnect();
    };
    window.addEventListener('auth:tokenExpired', handleTokenExpired);
    return () => {
      window.removeEventListener('auth:tokenExpired', handleTokenExpired);
    };
  }, [disconnect]);

  return {
    status,
    onlineUsers,
    serverVersion,
    pendingCount,
    sendEvent,
    connect,
    disconnect,
    reconnect,
  };
}

export default useCollaboration;
