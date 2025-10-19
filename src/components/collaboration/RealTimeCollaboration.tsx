/**
 * 실시간 협업 시스템
 * Server-Sent Events + REST API 기반 실시간 모델 편집 및 협업 기능
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { HierarchyNode } from '../modeling/HierarchyTreeEditor';
import {
  RealTimeSyncManager,
  CollaborationUser,
  CollaborationEvent,
  ChatMessage,
  ConflictResolution,
  ModelVersion,
  generateUserColor,
  checkUserPermission,
  MockCollaborationServer
} from '../../utils/realTimeSync';

// 오프라인 상태 인터페이스
interface OfflineState {
  isOffline: boolean;
  queuedEvents: CollaborationEvent[];
  lastSyncTime: string;
}

// 사용자 활동 추적
interface UserActivity {
  userId: string;
  action: string;
  timestamp: string;
  nodeId?: string;
  details?: any;
}

// 알림 시스템
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  persistent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

interface RealTimeCollaborationProps {
  modelId: string;
  currentUser: CollaborationUser;
  onModelChange?: (hierarchy: HierarchyNode) => void;
  onUserPresenceChange?: (users: CollaborationUser[]) => void;
  className?: string;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  modelId,
  currentUser,
  onModelChange,
  onUserPresenceChange,
  className = ''
}) => {
  // 실시간 동기화 관리자
  const [syncManager, setSyncManager] = useState<RealTimeSyncManager | null>(null);
  
  // 상태 관리
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<CollaborationUser[]>([currentUser]);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showUserList, setShowUserList] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ModelVersion | null>(null);
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({});
  const [showPermissions, setShowPermissions] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOffline: false,
    queuedEvents: [],
    lastSyncTime: new Date().toISOString()
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('excellent');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [cursorPositions, setCursorPositions] = useState<{ [userId: string]: { x: number; y: number } }>({});

  // 참조
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mockServerRef = useRef<MockCollaborationServer>(MockCollaborationServer.getInstance());

  // 실시간 동기화 초기화
  useEffect(() => {
    initializeRealTimeSync();
    return () => {
      cleanupRealTimeSync();
    };
  }, [modelId]);

  // 사용자 색상 설정
  useEffect(() => {
    if (!currentUser.color) {
      const userWithColor = {
        ...currentUser,
        color: generateUserColor(currentUser.id)
      };
      setUsers(prev => prev.map(u => u.id === currentUser.id ? userWithColor : u));
    }
  }, [currentUser]);

  // 마우스 추적 (다른 사용자에게 커서 위치 전송)
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      lastMousePositionRef.current = { x: clientX, y: clientY };
      
      // 스로틀링: 100ms마다만 전송
      if (syncManager && Date.now() % 100 < 20) {
        sendCursorPosition(clientX, clientY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [syncManager]);

  // 오프라인 상태 모니터링
  useEffect(() => {
    const handleOnline = () => {
      setOfflineState(prev => ({ ...prev, isOffline: false }));
      showNotification('success', '연결 복구됨', '온라인 상태로 돌아왔습니다.');
      if (syncManager) {
        syncQueuedEvents();
      }
    };

    const handleOffline = () => {
      setOfflineState(prev => ({ ...prev, isOffline: true }));
      showNotification('warning', '오프라인 모드', '인터넷 연결이 끊어졌습니다. 변경사항은 로컬에 저장됩니다.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncManager]);

  // 채팅 스크롤 자동 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // 실시간 동기화 초기화
  const initializeRealTimeSync = useCallback(async () => {
    try {
      const manager = new RealTimeSyncManager(modelId, currentUser.id);
      setSyncManager(manager);

      // 이벤트 리스너 등록
      manager.addEventListener('*', handleRealTimeEvent);
      manager.addEventListener('user_join', handleUserJoin);
      manager.addEventListener('user_leave', handleUserLeave);
      manager.addEventListener('chat_message', handleChatMessage);
      manager.addEventListener('cursor_move', handleCursorMove);
      manager.addEventListener('node_update', handleNodeUpdate);

      // 동기화 시작
      await manager.startSync();
      setIsConnected(manager.isConnected());

      // 사용자 참여 알림
      await manager.sendEvent({
        type: 'user_join',
        data: currentUser
      });

      // 연결 품질 모니터링 시작
      startConnectionMonitoring(manager);

      showNotification('success', '실시간 협업 시작', '다른 사용자와 실시간으로 협업할 수 있습니다.');

    } catch (error) {
      console.error('실시간 동기화 초기화 실패:', error);
      // 오프라인 모드로 전환
      await initializeOfflineMode();
    }
  }, [modelId, currentUser]);

  // 정리 함수
  const cleanupRealTimeSync = () => {
    if (syncManager) {
      syncManager.sendEvent({
        type: 'user_leave',
        data: { userId: currentUser.id }
      });
      syncManager.stopSync();
    }
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  };

  // 오프라인 모드 초기화
  const initializeOfflineMode = async () => {
    setIsConnected(false);
    setConnectionQuality('disconnected');
    
    // 모의 사용자들 생성
    await generateMockUsers();
    
    showNotification('info', '오프라인 모드', '서버에 연결할 수 없어 오프라인 모드로 실행됩니다.');
  };

  // 모의 사용자 생성 (개발/데모용)
  const generateMockUsers = async () => {
    const mockUsers: CollaborationUser[] = [
      {
        ...currentUser,
        color: generateUserColor(currentUser.id)
      },
      {
        id: 'user-demo-1',
        name: '김협업',
        email: 'collaboration@example.com',
        color: generateUserColor('user-demo-1'),
        isOnline: true,
        lastActivity: new Date().toISOString(),
        role: 'editor',
        permissions: {
          canEdit: true,
          canDelete: false,
          canInvite: false,
          canManage: false
        }
      },
      {
        id: 'user-demo-2',
        name: '박분석',
        email: 'analyst@example.com',
        color: generateUserColor('user-demo-2'),
        isOnline: true,
        lastActivity: new Date(Date.now() - 300000).toISOString(),
        role: 'viewer',
        permissions: {
          canEdit: false,
          canDelete: false,
          canInvite: false,
          canManage: false
        }
      },
      {
        id: 'user-demo-3',
        name: '이전문가',
        email: 'expert@example.com',
        color: generateUserColor('user-demo-3'),
        isOnline: false,
        lastActivity: new Date(Date.now() - 900000).toISOString(),
        role: 'editor',
        permissions: {
          canEdit: true,
          canDelete: false,
          canInvite: true,
          canManage: false
        }
      }
    ];
    
    setUsers(mockUsers);
    onUserPresenceChange?.(mockUsers);
    
    // 모의 채팅 메시지
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg-demo-1',
        userId: 'user-demo-1',
        userName: '김협업',
        message: '안녕하세요! AHP 모델 검토를 시작하겠습니다.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: 'text'
      },
      {
        id: 'msg-demo-2',
        userId: 'system',
        userName: 'System',
        message: '김협업님이 협업 세션에 참여했습니다.',
        timestamp: new Date(Date.now() - 590000).toISOString(),
        type: 'system'
      },
      {
        id: 'msg-demo-3',
        userId: 'user-demo-2',
        userName: '박분석',
        message: '기준 가중치 부분에 대한 추가 검토가 필요할 것 같습니다. 특히 비용 효율성 기준이 과도하게 높아 보입니다.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'text'
      },
      {
        id: 'msg-demo-4',
        userId: 'user-demo-1',
        userName: '김협업',
        message: '좋은 지적입니다. 다같이 논의해보죠. @박분석 구체적으로 어떤 비율을 제안하시나요?',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        type: 'text',
        mentions: ['user-demo-2']
      }
    ];
    
    setChatMessages(mockMessages);
    
    // 모의 사용자 활동 시뮬레이션
    simulateUserActivity();
  };

  // 사용자 활동 시뮬레이션
  const simulateUserActivity = () => {
    const activities: UserActivity[] = [
      {
        userId: 'user-demo-1',
        action: '기준 수정',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        nodeId: 'criteria-cost',
        details: { field: 'weight', oldValue: 0.3, newValue: 0.35 }
      },
      {
        userId: 'user-demo-2',
        action: '대안 추가',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        nodeId: 'alternative-new',
        details: { name: '하이브리드 솔루션' }
      },
      {
        userId: 'user-demo-1',
        action: '평가 완료',
        timestamp: new Date(Date.now() - 360000).toISOString(),
        details: { criteria: 'tech-maturity', alternatives: 3 }
      }
    ];
    
    setUserActivities(activities);
  };

  // 이벤트 전송 (개선된 버전)
  const sendEvent = async (event: Omit<CollaborationEvent, 'id' | 'userId' | 'timestamp'>) => {
    if (!syncManager) {
      console.warn('동기화 관리자가 초기화되지 않음');
      return;
    }

    try {
      await syncManager.sendEvent(event);
      
      // 자동 저장 트리거
      if (autoSaveEnabled && ['node_update', 'node_create', 'node_delete'].includes(event.type)) {
        triggerAutoSave();
      }
      
    } catch (error) {
      console.error('이벤트 전송 실패:', error);
      
      // 오프라인 상태인 경우 큐에 저장
      if (offlineState.isOffline) {
        setOfflineState(prev => ({
          ...prev,
          queuedEvents: [...prev.queuedEvents, {
            id: `offline-${Date.now()}`,
            userId: currentUser.id,
            timestamp: new Date().toISOString(),
            ...event
          } as CollaborationEvent]
        }));
        
        showNotification('info', '오프라인 저장', '변경사항이 로컬에 저장되었습니다.');
      }
    }
  };

  // 실시간 이벤트 처리 (통합 핸들러)
  const handleRealTimeEvent = useCallback((event: CollaborationEvent) => {
    // 이벤트 히스토리 업데이트
    setEvents(prev => [event, ...prev].slice(0, 200));
    
    // 사용자 활동 추적
    if (event.userId !== currentUser.id && event.userId !== 'system') {
      const activity: UserActivity = {
        userId: event.userId,
        action: event.type,
        timestamp: event.timestamp,
        nodeId: event.data?.nodeId,
        details: event.data
      };
      setUserActivities(prev => [activity, ...prev].slice(0, 50));
    }
    
    // 연결 상태 업데이트
    if (syncManager) {
      setIsConnected(syncManager.isConnected());
      updateConnectionQuality();
    }
  }, [currentUser.id, syncManager]);

  // 사용자 참여 처리 (개선됨)
  const handleUserJoin = useCallback((event: CollaborationEvent) => {
    const userData: CollaborationUser = event.data;
    
    setUsers(prev => {
      const existingIndex = prev.findIndex(u => u.id === userData.id);
      const updatedUser = {
        ...userData,
        isOnline: true,
        lastActivity: event.timestamp,
        color: userData.color || generateUserColor(userData.id)
      };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedUser;
        return updated;
      }
      return [...prev, updatedUser];
    });

    // 시스템 메시지와 알림
    if (userData.id !== currentUser.id) {
      addSystemMessage(`${userData.name}님이 협업에 참여했습니다.`);
      showNotification('info', '새 참여자', `${userData.name}님이 참여했습니다.`);
    }
    
    // 사용자 목록 변경 콜백
    setUsers(updatedUsers => {
      onUserPresenceChange?.(updatedUsers);
      return updatedUsers;
    });
  }, [currentUser.id, onUserPresenceChange]);

  // 사용자 떠남 처리 (개선됨)
  const handleUserLeave = useCallback((event: CollaborationEvent) => {
    const userId = event.data.userId;
    
    setUsers(prev => {
      const updated = prev.map(user => 
        user.id === userId ? { ...user, isOnline: false, lastActivity: event.timestamp } : user
      );
      onUserPresenceChange?.(updated);
      return updated;
    });

    const user = users.find(u => u.id === userId);
    if (user && userId !== currentUser.id) {
      addSystemMessage(`${user.name}님이 나갔습니다.`);
      showNotification('info', '참여자 퇴장', `${user.name}님이 나갔습니다.`);
    }

    // 커서 위치 정리
    setCursorPositions(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  }, [users, currentUser.id, onUserPresenceChange]);

  // 노드 업데이트 처리 (개선됨)
  const handleNodeUpdate = useCallback((event: CollaborationEvent) => {
    const nodeData = event.data;
    
    // 충돌 상태 확인
    if (syncManager) {
      const currentConflicts = syncManager.getConflicts();
      if (currentConflicts.length > 0) {
        setConflicts(currentConflicts);
        showNotification('warning', '편집 충돌', '다른 사용자와 동시에 편집하고 있습니다.');
        return;
      }
    }
    
    // 모델 변경 적용
    if (onModelChange && nodeData.hierarchy) {
      onModelChange(nodeData.hierarchy);
    }
    
    // 사용자의 현재 작업 노드 업데이트
    if (event.userId !== currentUser.id) {
      setUsers(prev => prev.map(user => 
        user.id === event.userId 
          ? { ...user, currentNode: nodeData.nodeId, lastActivity: event.timestamp }
          : user
      ));
    }
  }, [onModelChange, currentUser.id, syncManager]);

  // 노드 생성/삭제 처리
  const handleNodeCreate = useCallback((event: CollaborationEvent) => {
    const nodeData = event.data;
    if (onModelChange && nodeData.hierarchy) {
      onModelChange(nodeData.hierarchy);
    }
    
    if (event.userId !== currentUser.id) {
      const user = users.find(u => u.id === event.userId);
      showNotification('info', '새 노드 생성', `${user?.name || '사용자'}가 새 노드를 생성했습니다.`);
    }
  }, [onModelChange, currentUser.id, users]);

  const handleNodeDelete = useCallback((event: CollaborationEvent) => {
    const nodeData = event.data;
    if (onModelChange && nodeData.hierarchy) {
      onModelChange(nodeData.hierarchy);
    }
    
    if (event.userId !== currentUser.id) {
      const user = users.find(u => u.id === event.userId);
      showNotification('warning', '노드 삭제', `${user?.name || '사용자'}가 노드를 삭제했습니다.`);
    }
  }, [onModelChange, currentUser.id, users]);

  // 커서 이동 처리 (개선됨)
  const handleCursorMove = useCallback((event: CollaborationEvent) => {
    const { x, y } = event.data;
    const userId = event.userId;
    
    if (userId !== currentUser.id) {
      setCursorPositions(prev => ({
        ...prev,
        [userId]: { x, y }
      }));
      
      // 사용자 정보 업데이트
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, cursor: { x, y }, lastActivity: event.timestamp } : user
      ));
    }
  }, [currentUser.id]);

  // 커서 위치 전송
  const sendCursorPosition = useCallback((x: number, y: number) => {
    if (syncManager) {
      syncManager.sendEvent({
        type: 'cursor_move',
        data: { x, y }
      });
    }
  }, [syncManager]);

  // 선택 변경 처리
  const handleSelectionChange = useCallback((nodeId: string) => {
    if (syncManager) {
      syncManager.sendEvent({
        type: 'selection_change',
        data: { nodeId }
      });
    }
    
    // 자신의 현재 노드 업데이트
    setUsers(prev => prev.map(user => 
      user.id === currentUser.id ? { ...user, currentNode: nodeId } : user
    ));
  }, [syncManager, currentUser.id]);

  // 채팅 메시지 처리 (개선됨)
  const handleChatMessage = useCallback((event: CollaborationEvent) => {
    const messageData: ChatMessage = event.data;
    
    setChatMessages(prev => {
      // 중복 메시지 방지
      if (prev.some(msg => msg.id === messageData.id)) {
        return prev;
      }
      return [...prev, messageData];
    });
    
    // 멘션 알림 처리
    if (messageData.mentions?.includes(currentUser.id)) {
      showNotification('info', '멘션 알림', `${messageData.userName}님이 회원님을 멘션했습니다.`);
    }
    
    // 채팅 창이 닫혀있으면 알림
    if (!showChat && messageData.userId !== currentUser.id && messageData.type !== 'system') {
      showNotification('info', '새 메시지', `${messageData.userName}: ${messageData.message.substring(0, 50)}...`);
    }
  }, [currentUser.id, showChat]);

  // 연결 품질 모니터링
  const startConnectionMonitoring = (manager: RealTimeSyncManager) => {
    const monitorConnection = () => {
      const isConnected = manager.isConnected();
      const pendingChanges = manager.getPendingChangesCount();
      
      let quality: typeof connectionQuality;
      
      if (!isConnected) {
        quality = 'disconnected';
      } else if (pendingChanges > 10) {
        quality = 'poor';
      } else if (pendingChanges > 3) {
        quality = 'good';
      } else {
        quality = 'excellent';
      }
      
      setConnectionQuality(quality);
    };
    
    const interval = setInterval(monitorConnection, 5000);
    return () => clearInterval(interval);
  };

  // 연결 품질 업데이트
  const updateConnectionQuality = () => {
    if (!syncManager) return;
    
    const pendingChanges = syncManager.getPendingChangesCount();
    const conflicts = syncManager.getConflicts().length;
    
    if (conflicts > 0) {
      setConnectionQuality('poor');
    } else if (pendingChanges > 5) {
      setConnectionQuality('good');
    } else {
      setConnectionQuality('excellent');
    }
  };

  // 자동 저장 트리거
  const triggerAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      showNotification('success', '자동 저장', '변경사항이 자동으로 저장되었습니다.', false);
    }, 2000);
  };

  // 오프라인 이벤트 동기화
  const syncQueuedEvents = async () => {
    if (!syncManager || offlineState.queuedEvents.length === 0) return;
    
    try {
      for (const event of offlineState.queuedEvents) {
        await syncManager.sendEvent({
          type: event.type,
          data: event.data
        });
      }
      
      setOfflineState(prev => ({
        ...prev,
        queuedEvents: [],
        lastSyncTime: new Date().toISOString()
      }));
      
      showNotification('success', '동기화 완료', '오프라인 변경사항이 동기화되었습니다.');
    } catch (error) {
      console.error('오프라인 동기화 실패:', error);
      showNotification('error', '동기화 실패', '일부 변경사항 동기화에 실패했습니다.');
    }
  };

  // 채팅 메시지 전송 (개선됨)
  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;

    // 멘션 감지
    const mentionRegex = /@([\w가-힣]+)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = mentionRegex.exec(newMessage)) !== null) {
      const mentionedUser = users.find(u => u.name === match![1]);
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      mentions: mentions.length > 0 ? mentions : undefined
    };

    try {
      await sendEvent({
        type: 'chat_message',
        data: message
      });

      // 로컬에 즉시 추가 (낙관적 업데이트)
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      showNotification('error', '전송 실패', '메시지 전송에 실패했습니다.');
    }
  };

  // 시스템 메시지 추가 (개선됨)
  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'system',
      userName: 'System',
      message,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    setChatMessages(prev => [...prev, systemMessage]);
  };

  // 알림 표시
  const showNotification = (type: Notification['type'], title: string, message: string, persistent: boolean = false) => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      persistent
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // 자동 제거 (persistent가 아닌 경우)
    if (!persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    }
  };

  // 알림 제거
  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // 사용자 초대 (개선됨)
  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;
    
    if (!checkUserPermission(currentUser, 'invite')) {
      showNotification('error', '권한 없음', '사용자를 초대할 권한이 없습니다.');
      return;
    }

    try {
      // 실제 환경에서는 서버 API 호출
      const response = await fetch(`/api/collaboration/${modelId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: 'viewer' })
      });
      
      if (response.ok) {
        addSystemMessage(`${inviteEmail}에게 초대장을 보냈습니다.`);
        showNotification('success', '초대 완료', `${inviteEmail}에게 초대장을 보냈습니다.`);
      } else {
        throw new Error('초대 실패');
      }
    } catch (error) {
      // 데모용 성공 처리
      addSystemMessage(`${inviteEmail}에게 초대장을 보냈습니다.`);
      showNotification('success', '초대 완료', `${inviteEmail}에게 초대장을 보냈습니다.`);
    }
    
    setInviteEmail('');
    setShowInviteDialog(false);
  };

  // 타이핑 상태 처리 (개선됨)
  const handleTyping = useCallback(() => {
    // 다른 사용자에게 타이핑 상태 전송
    if (syncManager) {
      syncManager.sendEvent({
        type: 'cursor_move', // 타이핑을 커서 이벤트로 처리
        data: { typing: true }
      });
    }
    
    setIsTyping(prev => ({ ...prev, [currentUser.id]: true }));
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [currentUser.id]: false }));
      
      // 타이핑 중단 알림
      if (syncManager) {
        syncManager.sendEvent({
          type: 'cursor_move',
          data: { typing: false }
        });
      }
    }, 2000);
  }, [syncManager, currentUser.id]);

  // 권한 변경 (개선됨)
  const changeUserPermissions = async (userId: string, newRole: CollaborationUser['role']) => {
    if (!checkUserPermission(currentUser, 'manage')) {
      showNotification('error', '권한 없음', '사용자 권한을 변경할 수 없습니다.');
      return;
    }
    
    try {
      // 서버에 권한 변경 요청
      const response = await fetch(`/api/collaboration/${modelId}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok || true) { // 데모용 항상 성공
        setUsers(prev => prev.map(user => {
          if (user.id === userId) {
            const permissions = {
              canEdit: newRole !== 'viewer',
              canDelete: newRole === 'owner',
              canInvite: newRole !== 'viewer',
              canManage: newRole === 'owner'
            };
            
            const updatedUser = { ...user, role: newRole, permissions };
            
            // 권한 변경 알림
            addSystemMessage(`${user.name}님의 권한이 ${newRole}로 변경되었습니다.`);
            showNotification('success', '권한 변경', `${user.name}님의 권한을 변경했습니다.`);
            
            return updatedUser;
          }
          return user;
        }));
      }
    } catch (error) {
      console.error('권한 변경 실패:', error);
      showNotification('error', '권한 변경 실패', '권한 변경 중 오류가 발생했습니다.');
    }
  };

  // 버전 히스토리 렌더링
  const renderVersionHistory = () => {
    if (!showVersionHistory) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-2/3 max-w-4xl max-h-4/5 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">버전 히스토리</h2>
            <button
              onClick={() => setShowVersionHistory(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {versions.map(version => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedVersion?.id === version.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">버전 {version.version}</h3>
                    <p className="text-gray-600 text-sm">{version.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>작성자: {version.author}</span>
                      <span>{new Date(version.timestamp).toLocaleString('ko-KR')}</span>
                      <span>변경사항: {version.changes.length}개</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="secondary" className="text-xs">
                      미리보기
                    </Button>
                    <Button variant="primary" className="text-xs">
                      복원
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 사용자 목록 렌더링
  const renderUserList = () => {
    if (!showUserList) return null;

    return (
      <Card title="참여 중인 사용자">
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></div>
                </div>
                
                <div>
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500">
                    {user.role} • {user.isOnline ? '온라인' : '오프라인'}
                  </div>
                  {user.currentNode && (
                    <div className="text-xs text-blue-600">
                      편집 중: {user.currentNode}
                    </div>
                  )}
                </div>
              </div>
              
              {currentUser.permissions.canManage && user.id !== currentUser.id && (
                <select
                  value={user.role}
                  onChange={(e) => changeUserPermissions(user.id, e.target.value as CollaborationUser['role'])}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="viewer">뷰어</option>
                  <option value="editor">편집자</option>
                  <option value="owner">소유자</option>
                </select>
              )}
            </div>
          ))}
        </div>
        
        {currentUser.permissions.canInvite && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="primary"
              onClick={() => setShowInviteDialog(true)}
              className="w-full text-sm"
            >
              + 사용자 초대
            </Button>
          </div>
        )}
      </Card>
    );
  };

  // 채팅 패널 렌더링
  const renderChatPanel = () => {
    if (!showChat) return null;

    return (
      <Card title="팀 채팅">
        <div className="h-64 flex flex-col">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2 mb-4">
            {chatMessages.map(message => (
              <div
                key={message.id}
                className={`text-sm ${
                  message.type === 'system' ? 'text-center text-gray-500 italic' : ''
                }`}
              >
                {message.type !== 'system' && (
                  <div className="flex items-start space-x-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ 
                        backgroundColor: users.find(u => u.id === message.userId)?.color || '#6B7280' 
                      }}
                    >
                      {message.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString('ko-KR')}
                        </span>
                      </div>
                      <div className="mt-1">{message.message}</div>
                    </div>
                  </div>
                )}
                {message.type === 'system' && (
                  <div>{message.message}</div>
                )}
              </div>
            ))}
            
            {/* 타이핑 인디케이터 */}
            {Object.entries(isTyping).some(([userId, typing]) => typing && userId !== currentUser.id) && (
              <div className="text-xs text-gray-500 italic">
                {Object.entries(isTyping)
                  .filter(([userId, typing]) => typing && userId !== currentUser.id)
                  .map(([userId]) => users.find(u => u.id === userId)?.name)
                  .join(', ')}{' '}
                님이 입력 중...
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
              placeholder="메시지 입력..."
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <Button
              variant="primary"
              onClick={sendChatMessage}
              disabled={!newMessage.trim()}
              className="text-sm"
            >
              전송
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // 초대 다이얼로그 렌더링
  const renderInviteDialog = () => {
    if (!showInviteDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">사용자 초대</h3>
            <button
              onClick={() => setShowInviteDialog(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">이메일 주소</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="example@company.com"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">권한</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="viewer">뷰어 (읽기 전용)</option>
                <option value="editor">편집자 (편집 가능)</option>
                <option value="owner">소유자 (모든 권한)</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={() => setShowInviteDialog(false)} className="flex-1">
                취소
              </Button>
              <Button variant="primary" onClick={inviteUser} className="flex-1">
                초대 보내기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 알림 렌더링
  const renderNotifications = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg border ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-xs mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 사용자 커서 렌더링
  const renderUserCursors = () => {
    return (
      <>
        {Object.entries(cursorPositions).map(([userId, position]) => {
          const user = users.find(u => u.id === userId);
          if (!user || !user.isOnline || userId === currentUser.id) return null;

          return (
            <div
              key={userId}
              data-testid={`user-cursor-${userId}`}
              className="fixed pointer-events-none z-40"
              style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: user.color }}
              ></div>
              <div
                className="mt-1 px-2 py-1 rounded text-xs text-white font-medium shadow-md whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 연결 상태 표시 */}
      <Card>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionQuality === 'excellent' ? 'bg-green-500' :
              connectionQuality === 'good' ? 'bg-yellow-500' :
              connectionQuality === 'poor' ? 'bg-orange-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              {isConnected ? '실시간 협업 활성화' : '오프라인 모드'}
            </span>
            <span className="text-sm text-gray-600">
              ({users.filter(u => u.isOnline).length}명 온라인)
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              connectionQuality === 'excellent' ? 'bg-green-100 text-green-800' :
              connectionQuality === 'good' ? 'bg-yellow-100 text-yellow-800' :
              connectionQuality === 'poor' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {connectionQuality === 'excellent' ? '우수' :
               connectionQuality === 'good' ? '양호' :
               connectionQuality === 'poor' ? '불안정' : '연결 끊김'}
            </span>
            {offlineState.queuedEvents.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                대기중: {offlineState.queuedEvents.length}
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={showUserList ? 'primary' : 'secondary'}
              onClick={() => setShowUserList(!showUserList)}
              className="text-sm"
            >
              👥 사용자
            </Button>
            <Button
              variant={showChat ? 'primary' : 'secondary'}
              onClick={() => setShowChat(!showChat)}
              className="text-sm"
            >
              💬 채팅
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowVersionHistory(true)}
              className="text-sm"
            >
              📋 히스토리
            </Button>
          </div>
        </div>
        
        {/* 상태 알림들 */}
        {conflicts.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-yellow-800 font-medium">
                  편집 충돌 감지됨 ({conflicts.length}개)
                </span>
              </div>
              <Button variant="secondary" className="text-xs">
                수동 해결
              </Button>
            </div>
            <div className="text-yellow-700 text-sm mt-1">
              자동으로 병합을 시도하고 있습니다...
            </div>
          </div>
        )}
        
        {/* 자동 저장 상태 */}
        {autoSaveEnabled && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>자동 저장 활성화</span>
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="ml-2"
            />
            <label className="text-xs">자동 저장</label>
          </div>
        )}
        
        {/* 오프라인 상태 알림 */}
        {offlineState.isOffline && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
            <div className="flex items-center space-x-2">
              <span className="text-orange-600">📶</span>
              <span className="text-orange-800 font-medium">
                오프라인 모드 - 변경사항이 로컬에 저장됩니다
              </span>
            </div>
            {offlineState.queuedEvents.length > 0 && (
              <div className="text-orange-700 text-sm mt-1">
                {offlineState.queuedEvents.length}개 변경사항이 큐에 대기중입니다
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 협업 패널들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderUserList()}
        {renderChatPanel()}
      </div>

      {/* 다이얼로그들 */}
      {renderVersionHistory()}
      {renderInviteDialog()}
      {renderNotifications()}
      {renderUserCursors()}
    </div>
  );
};

export default RealTimeCollaboration;