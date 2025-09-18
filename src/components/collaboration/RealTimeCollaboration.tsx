/**
 * 실시간 협업 시스템
 * WebSocket 기반 실시간 모델 편집 및 협업 기능
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { HierarchyNode } from '../modeling/HierarchyTreeEditor';

// 사용자 정보
interface CollaborationUser {
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

// 실시간 편집 이벤트
interface CollaborationEvent {
  id: string;
  type: 'node_update' | 'node_create' | 'node_delete' | 'cursor_move' | 'selection_change' | 'user_join' | 'user_leave' | 'chat_message';
  userId: string;
  timestamp: string;
  data: any;
  acknowledged?: boolean;
}

// 채팅 메시지
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'file' | 'mention';
  attachments?: FileAttachment[];
  mentions?: string[];
}

// 파일 첨부
interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

// 충돌 해결
interface ConflictResolution {
  conflictId: string;
  type: 'merge' | 'overwrite' | 'skip';
  resolution: 'auto' | 'manual';
  mergedData?: any;
}

// 버전 관리
interface ModelVersion {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  description: string;
  changes: CollaborationEvent[];
  snapshot: HierarchyNode;
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

  // 참조
  const wsRef = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket 연결 초기화
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [modelId]);

  // 채팅 스크롤 자동 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    try {
      // 실제 환경에서는 적절한 WebSocket 서버 URL 사용
      const wsUrl = `ws://localhost:3001/collaboration/${modelId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket 연결됨');
        
        // 사용자 참여 이벤트 전송
        sendEvent({
          type: 'user_join',
          data: currentUser
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const collaborationEvent: CollaborationEvent = JSON.parse(event.data);
          handleIncomingEvent(collaborationEvent);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket 연결 종료');
        
        // 자동 재연결 시도
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      
      // 모의 데이터로 오프라인 모드 시뮬레이션
      simulateOfflineMode();
    }
  }, [modelId, currentUser]);

  // WebSocket 연결 해제
  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      sendEvent({
        type: 'user_leave',
        data: { userId: currentUser.id }
      });
      
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // 오프라인 모드 시뮬레이션 (개발용)
  const simulateOfflineMode = () => {
    setIsConnected(false);
    
    // 모의 사용자들 추가
    const mockUsers: CollaborationUser[] = [
      currentUser,
      {
        id: 'user-2',
        name: '김동료',
        email: 'colleague@example.com',
        color: '#10B981',
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
        id: 'user-3',
        name: '박분석가',
        email: 'analyst@example.com',
        color: '#F59E0B',
        isOnline: true,
        lastActivity: new Date(Date.now() - 300000).toISOString(),
        role: 'viewer',
        permissions: {
          canEdit: false,
          canDelete: false,
          canInvite: false,
          canManage: false
        }
      }
    ];
    
    setUsers(mockUsers);
    
    // 모의 채팅 메시지
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg-1',
        userId: 'user-2',
        userName: '김동료',
        message: '안녕하세요! 모델 검토 시작하겠습니다.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: 'text'
      },
      {
        id: 'msg-2',
        userId: 'system',
        userName: 'System',
        message: '김동료님이 참여했습니다.',
        timestamp: new Date(Date.now() - 590000).toISOString(),
        type: 'system'
      },
      {
        id: 'msg-3',
        userId: 'user-3',
        userName: '박분석가',
        message: '기준 가중치 부분에 대해 논의가 필요할 것 같습니다.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'text'
      }
    ];
    
    setChatMessages(mockMessages);
  };

  // 이벤트 전송
  const sendEvent = (event: Omit<CollaborationEvent, 'id' | 'userId' | 'timestamp'>) => {
    const fullEvent: CollaborationEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      ...event
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(fullEvent));
    }

    // 로컬 이벤트 저장
    setEvents(prev => [fullEvent, ...prev].slice(0, 100));
  };

  // 수신 이벤트 처리
  const handleIncomingEvent = (event: CollaborationEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 100));

    switch (event.type) {
      case 'user_join':
        handleUserJoin(event.data);
        break;
      case 'user_leave':
        handleUserLeave(event.data.userId);
        break;
      case 'node_update':
        handleNodeUpdate(event.data);
        break;
      case 'node_create':
        handleNodeCreate(event.data);
        break;
      case 'node_delete':
        handleNodeDelete(event.data);
        break;
      case 'cursor_move':
        handleCursorMove(event.userId, event.data);
        break;
      case 'selection_change':
        handleSelectionChange(event.userId, event.data);
        break;
      case 'chat_message':
        handleChatMessage(event.data);
        break;
      default:
        console.log('알 수 없는 이벤트 타입:', event.type);
    }
  };

  // 사용자 참여 처리
  const handleUserJoin = (userData: CollaborationUser) => {
    setUsers(prev => {
      const existingIndex = prev.findIndex(u => u.id === userData.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...userData, isOnline: true };
        return updated;
      }
      return [...prev, { ...userData, isOnline: true }];
    });

    // 시스템 메시지 추가
    addSystemMessage(`${userData.name}님이 참여했습니다.`);
  };

  // 사용자 떠남 처리
  const handleUserLeave = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isOnline: false } : user
    ));

    const user = users.find(u => u.id === userId);
    if (user) {
      addSystemMessage(`${user.name}님이 나갔습니다.`);
    }
  };

  // 노드 업데이트 처리
  const handleNodeUpdate = (nodeData: any) => {
    // 충돌 감지 및 해결
    const hasConflict = detectConflict(nodeData);
    if (hasConflict) {
      resolveConflict(nodeData);
    } else {
      if (onModelChange) {
        onModelChange(nodeData.hierarchy);
      }
    }
  };

  // 노드 생성 처리
  const handleNodeCreate = (nodeData: any) => {
    if (onModelChange) {
      onModelChange(nodeData.hierarchy);
    }
  };

  // 노드 삭제 처리
  const handleNodeDelete = (nodeData: any) => {
    if (onModelChange) {
      onModelChange(nodeData.hierarchy);
    }
  };

  // 커서 이동 처리
  const handleCursorMove = (userId: string, cursorData: { x: number; y: number }) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, cursor: cursorData } : user
    ));
  };

  // 선택 변경 처리
  const handleSelectionChange = (userId: string, selectionData: { nodeId: string }) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, currentNode: selectionData.nodeId } : user
    ));
  };

  // 채팅 메시지 처리
  const handleChatMessage = (messageData: ChatMessage) => {
    setChatMessages(prev => [...prev, messageData]);
  };

  // 충돌 감지
  const detectConflict = (nodeData: any): boolean => {
    // 단순화된 충돌 감지 로직
    return Math.random() < 0.1; // 10% 확률로 충돌 시뮬레이션
  };

  // 충돌 해결
  const resolveConflict = (nodeData: any) => {
    const conflict: ConflictResolution = {
      conflictId: `conflict-${Date.now()}`,
      type: 'merge',
      resolution: 'auto'
    };
    
    setConflicts(prev => [...prev, conflict]);
    
    // 자동 병합 시도
    setTimeout(() => {
      setConflicts(prev => prev.filter(c => c.conflictId !== conflict.conflictId));
      if (onModelChange) {
        onModelChange(nodeData.hierarchy);
      }
    }, 2000);
  };

  // 채팅 메시지 전송
  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    sendEvent({
      type: 'chat_message',
      data: message
    });

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // 시스템 메시지 추가
  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      userId: 'system',
      userName: 'System',
      message,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    setChatMessages(prev => [...prev, systemMessage]);
  };

  // 사용자 초대
  const inviteUser = () => {
    if (!inviteEmail.trim()) return;

    // 실제로는 서버에 초대 요청 전송
    console.log('사용자 초대:', inviteEmail);
    
    addSystemMessage(`${inviteEmail}에게 초대장을 보냈습니다.`);
    setInviteEmail('');
    setShowInviteDialog(false);
  };

  // 타이핑 상태 처리
  const handleTyping = () => {
    setIsTyping(prev => ({ ...prev, [currentUser.id]: true }));
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(prev => ({ ...prev, [currentUser.id]: false }));
    }, 2000);
  };

  // 권한 변경
  const changeUserPermissions = (userId: string, newRole: CollaborationUser['role']) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const permissions = {
          canEdit: newRole !== 'viewer',
          canDelete: newRole === 'owner',
          canInvite: newRole !== 'viewer',
          canManage: newRole === 'owner'
        };
        return { ...user, role: newRole, permissions };
      }
      return user;
    }));
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 연결 상태 표시 */}
      <Card>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              {isConnected ? '실시간 협업 활성화' : '오프라인 모드'}
            </span>
            <span className="text-sm text-gray-600">
              ({users.filter(u => u.isOnline).length}명 온라인)
            </span>
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
        
        {/* 충돌 알림 */}
        {conflicts.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-800 font-medium">
                편집 충돌 감지됨 ({conflicts.length}개)
              </span>
            </div>
            <div className="text-yellow-700 text-sm mt-1">
              자동으로 병합을 시도하고 있습니다...
            </div>
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
    </div>
  );
};

export default RealTimeCollaboration;