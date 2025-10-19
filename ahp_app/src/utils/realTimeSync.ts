/**
 * 실시간 동기화 및 협업을 위한 유틸리티 함수들
 * WebSocket 대안으로 Server-Sent Events + REST API 조합 사용
 */

import { HierarchyNode } from '../components/modeling/HierarchyTreeEditor';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  cursor?: { x: number; y: number };
  currentNode?: string;
  lastActivity: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    canManage: boolean;
  };
}

export interface CollaborationEvent {
  id: string;
  type: 'node_update' | 'node_create' | 'node_delete' | 'cursor_move' | 'selection_change' | 'user_join' | 'user_leave' | 'chat_message';
  userId: string;
  timestamp: string;
  data: any;
  acknowledged?: boolean;
  version?: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'file' | 'mention';
  attachments?: FileAttachment[];
  mentions?: string[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface ConflictResolution {
  conflictId: string;
  type: 'merge' | 'overwrite' | 'skip';
  resolution: 'auto' | 'manual';
  mergedData?: any;
  conflictingEvents: CollaborationEvent[];
}

export interface ModelVersion {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  description: string;
  changes: CollaborationEvent[];
  snapshot: HierarchyNode;
  hash: string;
}

export interface SyncState {
  modelId: string;
  version: number;
  lastSync: string;
  localChanges: CollaborationEvent[];
  remoteChanges: CollaborationEvent[];
  conflicts: ConflictResolution[];
}

/**
 * 실시간 동기화 관리자 클래스
 */
export class RealTimeSyncManager {
  private modelId: string;
  private userId: string;
  private syncState: SyncState;
  private eventSource?: EventSource;
  private syncInterval?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;
  private eventListeners: { [eventType: string]: ((event: CollaborationEvent) => void)[] } = {};
  private isOnline: boolean = true;
  private lastHeartbeat: number = Date.now();

  constructor(modelId: string, userId: string) {
    this.modelId = modelId;
    this.userId = userId;
    this.syncState = {
      modelId,
      version: 0,
      lastSync: new Date().toISOString(),
      localChanges: [],
      remoteChanges: [],
      conflicts: []
    };

    // 온라인/오프라인 상태 감지
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
  }

  /**
   * 실시간 동기화 시작
   */
  async startSync(): Promise<void> {
    try {
      // Server-Sent Events로 실시간 업데이트 수신
      await this.initializeEventSource();
      
      // 주기적 동기화 (백업)
      this.syncInterval = setInterval(() => {
        this.performSync();
      }, 5000);

      // 하트비트
      this.heartbeatInterval = setInterval(() => {
        this.sendHeartbeat();
      }, 30000);

      console.log('실시간 동기화 시작됨');
    } catch (error) {
      console.error('동기화 시작 실패:', error);
      // 오프라인 모드로 전환
      this.handleOfflineMode();
    }
  }

  /**
   * 동기화 중지
   */
  stopSync(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }

    console.log('실시간 동기화 중지됨');
  }

  /**
   * Server-Sent Events 초기화
   */
  private async initializeEventSource(): Promise<void> {
    // 실제 환경에서는 서버 URL 사용
    const eventSourceUrl = `/api/collaboration/${this.modelId}/events?userId=${this.userId}`;
    
    try {
      this.eventSource = new EventSource(eventSourceUrl);

      this.eventSource.onopen = () => {
        console.log('EventSource 연결됨');
        this.isOnline = true;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const collaborationEvent: CollaborationEvent = JSON.parse(event.data);
          this.handleRemoteEvent(collaborationEvent);
        } catch (error) {
          console.error('이벤트 파싱 오류:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('EventSource 오류:', error);
        this.handleConnectionError();
      };

    } catch (error) {
      // EventSource를 사용할 수 없는 경우 폴백
      console.warn('EventSource 사용 불가, 폴링 모드로 전환');
      this.startPollingMode();
    }
  }

  /**
   * 폴링 모드 (EventSource 대안)
   */
  private startPollingMode(): void {
    const pollEvents = async () => {
      try {
        const response = await fetch(`/api/collaboration/${this.modelId}/events?since=${this.syncState.lastSync}&userId=${this.userId}`);
        if (response.ok) {
          const events: CollaborationEvent[] = await response.json();
          events.forEach(event => this.handleRemoteEvent(event));
        }
      } catch (error) {
        console.error('폴링 오류:', error);
      }
    };

    setInterval(pollEvents, 2000); // 2초마다 폴링
  }

  /**
   * 이벤트 전송
   */
  async sendEvent(event: Omit<CollaborationEvent, 'id' | 'userId' | 'timestamp' | 'version'>): Promise<void> {
    const fullEvent: CollaborationEvent = {
      id: this.generateEventId(),
      userId: this.userId,
      timestamp: new Date().toISOString(),
      version: this.syncState.version + 1,
      ...event
    };

    // 로컬에 즉시 적용
    this.syncState.localChanges.push(fullEvent);
    this.emitEvent(fullEvent);

    // 서버에 전송
    try {
      await this.sendEventToServer(fullEvent);
    } catch (error) {
      console.error('이벤트 전송 실패:', error);
      // 오프라인 큐에 저장
      this.queueOfflineEvent(fullEvent);
    }
  }

  /**
   * 서버로 이벤트 전송
   */
  private async sendEventToServer(event: CollaborationEvent): Promise<void> {
    if (!this.isOnline) {
      throw new Error('오프라인 상태');
    }

    try {
      const response = await fetch(`/api/collaboration/${this.modelId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      // 서버에서 확인된 버전 정보 업데이트
      const result = await response.json();
      if (result.version) {
        this.syncState.version = result.version;
      }
    } catch (error) {
      // 네트워크 오류 시 오프라인으로 간주
      this.isOnline = false;
      throw error;
    }
  }

  /**
   * 원격 이벤트 처리
   */
  private handleRemoteEvent(event: CollaborationEvent): void {
    // 자신의 이벤트는 무시
    if (event.userId === this.userId) {
      return;
    }

    // 중복 이벤트 체크
    if (this.syncState.remoteChanges.some(e => e.id === event.id)) {
      return;
    }

    // 충돌 감지
    const conflict = this.detectConflict(event);
    if (conflict) {
      this.handleConflict(conflict);
      return;
    }

    // 이벤트 적용
    this.syncState.remoteChanges.push(event);
    this.updateLastSync(event.timestamp);
    this.emitEvent(event);
  }

  /**
   * 충돌 감지
   */
  private detectConflict(incomingEvent: CollaborationEvent): ConflictResolution | null {
    // 동일한 노드에 대한 동시 편집 감지
    const conflictingLocalEvents = this.syncState.localChanges.filter(localEvent => {
      if (localEvent.type !== incomingEvent.type) return false;
      
      // 노드 관련 이벤트의 경우
      if (['node_update', 'node_create', 'node_delete'].includes(localEvent.type)) {
        return localEvent.data?.nodeId === incomingEvent.data?.nodeId;
      }
      
      return false;
    });

    if (conflictingLocalEvents.length > 0) {
      return {
        conflictId: this.generateEventId(),
        type: 'merge',
        resolution: 'auto',
        conflictingEvents: [incomingEvent, ...conflictingLocalEvents]
      };
    }

    return null;
  }

  /**
   * 충돌 해결
   */
  private handleConflict(conflict: ConflictResolution): void {
    this.syncState.conflicts.push(conflict);

    // 자동 병합 시도
    if (conflict.resolution === 'auto') {
      setTimeout(() => {
        this.resolveConflictAutomatically(conflict);
      }, 1000);
    }

    // 충돌 이벤트 발생
    this.emitEvent({
      id: this.generateEventId(),
      type: 'node_update', // 임시 타입
      userId: 'system',
      timestamp: new Date().toISOString(),
      data: { conflict, type: 'conflict_detected' }
    } as CollaborationEvent);
  }

  /**
   * 자동 충돌 해결
   */
  private resolveConflictAutomatically(conflict: ConflictResolution): void {
    try {
      // 단순한 병합 전략: 최신 타임스탬프 우선
      const sortedEvents = conflict.conflictingEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const winningEvent = sortedEvents[0];
      
      // 승리한 이벤트 적용
      this.emitEvent(winningEvent);

      // 충돌 목록에서 제거
      this.syncState.conflicts = this.syncState.conflicts.filter(c => c.conflictId !== conflict.conflictId);

      console.log('충돌 자동 해결됨:', conflict.conflictId);
    } catch (error) {
      console.error('충돌 해결 실패:', error);
    }
  }

  /**
   * 동기화 수행
   */
  private async performSync(): Promise<void> {
    if (!this.isOnline || this.syncState.localChanges.length === 0) {
      return;
    }

    try {
      // 로컬 변경사항을 서버에 전송
      for (const event of this.syncState.localChanges) {
        if (!event.acknowledged) {
          await this.sendEventToServer(event);
          event.acknowledged = true;
        }
      }

      // 확인된 변경사항 정리
      this.syncState.localChanges = this.syncState.localChanges.filter(e => !e.acknowledged);

    } catch (error) {
      console.error('동기화 실패:', error);
    }
  }

  /**
   * 하트비트 전송
   */
  private async sendHeartbeat(): Promise<void> {
    try {
      const response = await fetch(`/api/collaboration/${this.modelId}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        this.lastHeartbeat = Date.now();
      }
    } catch (error) {
      console.error('하트비트 실패:', error);
    }
  }

  /**
   * 온라인/오프라인 상태 처리
   */
  private handleOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;

    if (isOnline) {
      console.log('온라인 상태로 복구됨');
      // 오프라인 동안의 변경사항 동기화
      this.syncOfflineChanges();
    } else {
      console.log('오프라인 상태로 전환됨');
    }
  }

  /**
   * 오프라인 모드 처리
   */
  private handleOfflineMode(): void {
    console.log('오프라인 모드로 전환');
    // 로컬 스토리지에 변경사항 저장
    this.saveToLocalStorage();
  }

  /**
   * 연결 오류 처리
   */
  private handleConnectionError(): void {
    console.log('연결 오류 발생, 재연결 시도');
    
    setTimeout(() => {
      if (this.eventSource) {
        this.eventSource.close();
      }
      this.initializeEventSource();
    }, 3000);
  }

  /**
   * 오프라인 변경사항 동기화
   */
  private async syncOfflineChanges(): Promise<void> {
    const offlineChanges = this.loadFromLocalStorage();
    
    for (const event of offlineChanges) {
      try {
        await this.sendEventToServer(event);
      } catch (error) {
        console.error('오프라인 변경사항 동기화 실패:', error);
      }
    }

    this.clearLocalStorage();
  }

  /**
   * 오프라인 이벤트 큐잉
   */
  private queueOfflineEvent(event: CollaborationEvent): void {
    const offlineEvents = this.loadFromLocalStorage();
    offlineEvents.push(event);
    
    localStorage.setItem(`collaboration_offline_${this.modelId}`, JSON.stringify(offlineEvents));
  }

  /**
   * 로컬 스토리지에 저장
   */
  private saveToLocalStorage(): void {
    localStorage.setItem(`collaboration_state_${this.modelId}`, JSON.stringify(this.syncState));
  }

  /**
   * 로컬 스토리지에서 로드
   */
  private loadFromLocalStorage(): CollaborationEvent[] {
    try {
      const stored = localStorage.getItem(`collaboration_offline_${this.modelId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('로컬 스토리지 로드 실패:', error);
      return [];
    }
  }

  /**
   * 로컬 스토리지 정리
   */
  private clearLocalStorage(): void {
    localStorage.removeItem(`collaboration_offline_${this.modelId}`);
  }

  /**
   * 이벤트 리스너 등록
   */
  addEventListener(eventType: string, listener: (event: CollaborationEvent) => void): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(listener);
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListener(eventType: string, listener: (event: CollaborationEvent) => void): void {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType] = this.eventListeners[eventType].filter(l => l !== listener);
    }
  }

  /**
   * 이벤트 발생
   */
  private emitEvent(event: CollaborationEvent): void {
    const listeners = this.eventListeners[event.type] || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('이벤트 리스너 오류:', error);
      }
    });

    // 전체 이벤트 리스너
    const allListeners = this.eventListeners['*'] || [];
    allListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('전체 이벤트 리스너 오류:', error);
      }
    });
  }

  /**
   * 마지막 동기화 시간 업데이트
   */
  private updateLastSync(timestamp: string): void {
    this.syncState.lastSync = timestamp;
  }

  /**
   * 이벤트 ID 생성
   */
  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 현재 동기화 상태 반환
   */
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * 연결 상태 반환
   */
  isConnected(): boolean {
    return this.isOnline && this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * 대기 중인 변경사항 수 반환
   */
  getPendingChangesCount(): number {
    return this.syncState.localChanges.filter(e => !e.acknowledged).length;
  }

  /**
   * 충돌 목록 반환
   */
  getConflicts(): ConflictResolution[] {
    return [...this.syncState.conflicts];
  }
}

/**
 * 사용자 색상 생성기
 */
export const generateUserColor = (userId: string): string => {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
  ];
  
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * 사용자 권한 검증
 */
export const checkUserPermission = (user: CollaborationUser, action: string): boolean => {
  switch (action) {
    case 'edit':
      return user.permissions.canEdit;
    case 'delete':
      return user.permissions.canDelete;
    case 'invite':
      return user.permissions.canInvite;
    case 'manage':
      return user.permissions.canManage;
    default:
      return false;
  }
};

/**
 * 모의 서버 API (개발용)
 */
export class MockCollaborationServer {
  private static instance: MockCollaborationServer;
  private events: { [modelId: string]: CollaborationEvent[] } = {};
  private users: { [modelId: string]: CollaborationUser[] } = {};

  static getInstance(): MockCollaborationServer {
    if (!MockCollaborationServer.instance) {
      MockCollaborationServer.instance = new MockCollaborationServer();
    }
    return MockCollaborationServer.instance;
  }

  async sendEvent(modelId: string, event: CollaborationEvent): Promise<{ success: boolean; version: number }> {
    if (!this.events[modelId]) {
      this.events[modelId] = [];
    }

    this.events[modelId].push(event);
    
    // 다른 클라이언트들에게 브로드캐스트 시뮬레이션
    setTimeout(() => {
      this.broadcastEvent(modelId, event);
    }, 100);

    return { success: true, version: this.events[modelId].length };
  }

  private broadcastEvent(modelId: string, event: CollaborationEvent): void {
    // 실제로는 SSE나 WebSocket을 통해 브로드캐스트
    console.log('브로드캐스트:', event);
  }

  getEvents(modelId: string, since?: string): CollaborationEvent[] {
    const events = this.events[modelId] || [];
    
    if (since) {
      const sinceDate = new Date(since);
      return events.filter(e => new Date(e.timestamp) > sinceDate);
    }
    
    return events;
  }

  updateUserPresence(modelId: string, user: CollaborationUser): void {
    if (!this.users[modelId]) {
      this.users[modelId] = [];
    }

    const index = this.users[modelId].findIndex(u => u.id === user.id);
    if (index >= 0) {
      this.users[modelId][index] = user;
    } else {
      this.users[modelId].push(user);
    }
  }

  getUsers(modelId: string): CollaborationUser[] {
    return this.users[modelId] || [];
  }
}