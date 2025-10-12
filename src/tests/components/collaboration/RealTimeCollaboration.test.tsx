import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RealTimeCollaboration from '../../../components/collaboration/RealTimeCollaboration';
import { RealTimeSyncManager } from '../../../utils/realTimeSync';

// Mock the RealTimeSyncManager
jest.mock('../../../utils/realTimeSync');

const MockedRealTimeSyncManager = RealTimeSyncManager as jest.MockedClass<typeof RealTimeSyncManager>;

describe('RealTimeCollaboration', () => {
  const mockProps = {
    modelId: 'test-model-123',
    currentUser: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: '',
      color: '#3B82F6',
      isOnline: true,
      lastActivity: new Date().toISOString(),
      role: 'owner' as const,
      permissions: {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canManage: true
      }
    },
    onModelChange: jest.fn(),
    onUserPresenceChange: jest.fn()
  };

  let mockSyncManager: jest.Mocked<RealTimeSyncManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock sync manager instance
    mockSyncManager = {
      startSync: jest.fn().mockResolvedValue(undefined),
      stopSync: jest.fn(),
      sendEvent: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getSyncState: jest.fn().mockReturnValue({
        modelId: 'test-model-123',
        version: 1,
        lastSync: new Date().toISOString(),
        localChanges: [],
        remoteChanges: [],
        conflicts: []
      }),
      isConnected: jest.fn().mockReturnValue(true),
      getPendingChangesCount: jest.fn().mockReturnValue(0),
      getConflicts: jest.fn().mockReturnValue([])
    } as any;

    MockedRealTimeSyncManager.mockImplementation(() => mockSyncManager);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders collaboration interface correctly', async () => {
    render(<RealTimeCollaboration {...mockProps} />);
    
    // Wait for component to initialize
    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Check main UI elements
    expect(screen.getByText('연결된 사용자')).toBeInTheDocument();
    expect(screen.getByText('메시지')).toBeInTheDocument();
    expect(screen.getByText('버전 히스토리')).toBeInTheDocument();
  });

  test('initializes sync manager on mount', async () => {
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(MockedRealTimeSyncManager).toHaveBeenCalledWith('test-model-123', 'user-1');
    });
    
    await waitFor(() => {
      expect(mockSyncManager.startSync).toHaveBeenCalled();
    });
  });

  test('displays connection status correctly', async () => {
    mockSyncManager.isConnected.mockReturnValue(true);
    
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('온라인')).toBeInTheDocument();
    });
  });

  test('shows offline status when disconnected', async () => {
    mockSyncManager.isConnected.mockReturnValue(false);
    
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('오프라인')).toBeInTheDocument();
    });
  });

  test('displays pending changes count', async () => {
    mockSyncManager.getPendingChangesCount.mockReturnValue(3);
    
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('3개 변경사항 대기중')).toBeInTheDocument();
    });
  });

  test('handles chat message sending', async () => {
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Find chat input and send button
    const chatInput = screen.getByPlaceholderText('메시지를 입력하세요...');
    const sendButton = screen.getByRole('button', { name: /전송/i });

    // Type a message
    fireEvent.change(chatInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    // Verify sendEvent was called with chat message
    await waitFor(() => {
      expect(mockSyncManager.sendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'chat_message',
          data: expect.objectContaining({
            message: 'Test message'
          })
        })
      );
    });

    // Input should be cleared
    expect(chatInput).toHaveValue('');
  });

  test('handles conflict notifications', async () => {
    const mockConflict = {
      conflictId: 'conflict-1',
      type: 'merge' as const,
      resolution: 'auto' as const,
      conflictingEvents: []
    };

    mockSyncManager.getConflicts.mockReturnValue([mockConflict]);
    
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('충돌이 감지되었습니다')).toBeInTheDocument();
    });
  });

  test('toggles collaboration panel visibility', async () => {
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Find toggle button
    const toggleButton = screen.getByRole('button', { name: /협업 패널 토글/i });
    
    // Panel should be visible initially
    expect(screen.getByText('연결된 사용자')).toBeInTheDocument();
    
    // Click to hide
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.queryByText('연결된 사용자')).not.toBeInTheDocument();
    });
    
    // Click to show again
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('연결된 사용자')).toBeInTheDocument();
    });
  });

  test('shows offline queue when offline', async () => {
    mockSyncManager.isConnected.mockReturnValue(false);
    mockSyncManager.getPendingChangesCount.mockReturnValue(5);
    
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('오프라인 모드')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('5개 변경사항이 큐에 대기중입니다')).toBeInTheDocument();
    });
  });

  test('handles user cursor updates', async () => {
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(mockSyncManager.addEventListener).toHaveBeenCalledWith(
        'cursor_move',
        expect.any(Function)
      );
    });

    // Simulate cursor move event
    const cursorMoveHandler = mockSyncManager.addEventListener.mock.calls
      .find(call => call[0] === 'cursor_move')?.[1];
    
    if (cursorMoveHandler) {
      act(() => {
        cursorMoveHandler({
          id: 'event-1',
          type: 'cursor_move',
          userId: 'user-2',
          timestamp: new Date().toISOString(),
          data: {
            userId: 'user-2',
            userName: 'Other User',
            cursor: { x: 100, y: 200 }
          }
        });
      });
    }

    // Verify cursor is displayed (implementation specific)
    await waitFor(() => {
      // This would depend on how cursors are rendered in the UI
      expect(screen.getByTestId('user-cursor-user-2')).toBeInTheDocument();
    });
  });

  test('handles user join/leave events', async () => {
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(mockSyncManager.addEventListener).toHaveBeenCalledWith(
        'user_join',
        expect.any(Function)
      );
    });
    
    await waitFor(() => {
      expect(mockSyncManager.addEventListener).toHaveBeenCalledWith(
        'user_leave',
        expect.any(Function)
      );
    });

    // Simulate user join event
    const userJoinHandler = mockSyncManager.addEventListener.mock.calls
      .find(call => call[0] === 'user_join')?.[1];
    
    if (userJoinHandler) {
      act(() => {
        userJoinHandler({
          id: 'event-2',
          type: 'user_join',
          userId: 'user-3',
          timestamp: new Date().toISOString(),
          data: {
            user: {
              id: 'user-3',
              name: 'New User',
              email: 'new@example.com',
              color: '#EF4444',
              isOnline: true,
              lastActivity: new Date().toISOString(),
              role: 'editor',
              permissions: {
                canEdit: true,
                canDelete: false,
                canInvite: false,
                canManage: false
              }
            }
          }
        });
      });
    }

    // Verify user appears in connected users list
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });

    // Verify callback was called (onUserPresenceChange should be called)
    expect(mockProps.onUserPresenceChange).toHaveBeenCalled();
  });

  test('cleans up on unmount', async () => {
    const { unmount } = render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(mockSyncManager.startSync).toHaveBeenCalled();
    });

    unmount();

    expect(mockSyncManager.stopSync).toHaveBeenCalled();
  });

  test('handles permissions correctly', async () => {
    const limitedUser = {
      ...mockProps.currentUser,
      role: 'viewer' as const,
      permissions: {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManage: false
      }
    };

    render(<RealTimeCollaboration {...mockProps} currentUser={limitedUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Chat should still be available for viewers
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument();
    
    // But certain controls should be disabled or hidden
    expect(screen.queryByRole('button', { name: /사용자 초대/i })).not.toBeInTheDocument();
  });

  test('displays connection quality indicator', async () => {
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Should show connection quality (good by default when connected)
    expect(screen.getByTitle('연결 품질: 좋음')).toBeInTheDocument();
  });

  test('handles auto-save functionality', async () => {
    render(<RealTimeCollaboration {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('자동 저장 활성화')).toBeInTheDocument();
    });

    // Toggle auto-save
    const autoSaveToggle = screen.getByRole('checkbox', { name: /자동 저장/i });
    fireEvent.click(autoSaveToggle);

    await waitFor(() => {
      expect(screen.getByText('자동 저장 비활성화')).toBeInTheDocument();
    });
  });
});