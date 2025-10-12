import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RealTimeCollaboration from '../../components/collaboration/RealTimeCollaboration';
import { RealTimeSyncManager, MockCollaborationServer } from '../../utils/realTimeSync';

/**
 * Integration tests for RealTimeCollaboration system
 * Tests the full workflow of real-time collaboration features
 */
describe('RealTimeCollaboration Integration Tests', () => {
  let mockServer: MockCollaborationServer;
  const testModelId = 'integration-test-model';
  
  const user1 = {
    id: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
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
  };

  const user2 = {
    id: 'user-2',
    name: 'Bob',
    email: 'bob@example.com',
    color: '#EF4444',
    isOnline: true,
    lastActivity: new Date().toISOString(),
    role: 'editor' as const,
    permissions: {
      canEdit: true,
      canDelete: false,
      canInvite: false,
      canManage: false
    }
  };

  beforeEach(() => {
    mockServer = MockCollaborationServer.getInstance();
    jest.clearAllMocks();
  });

  test('multi-user collaboration workflow', async () => {
    const onModelUpdate1 = jest.fn();
    const onModelUpdate2 = jest.fn();
    const onUserJoin1 = jest.fn();
    const onUserJoin2 = jest.fn();

    // Render two collaboration instances (simulating two users)
    const { rerender: rerender1 } = render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={onModelUpdate1}
        onUserPresenceChange={onUserJoin1}
      />
    );

    // Wait for first user to initialize
    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Render second user's collaboration
    render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user2}
        onModelChange={onModelUpdate2}
        onUserPresenceChange={onUserJoin2}
      />
    );

    // Wait for both users to be connected
    await waitFor(() => {
      expect(screen.getAllByText('실시간 협업')).toHaveLength(2);
    });

    // Simulate user joining
    act(() => {
      mockServer.updateUserPresence(testModelId, user1);
      mockServer.updateUserPresence(testModelId, user2);
    });

    // Both users should see each other
    await waitFor(() => {
      expect(onUserJoin1).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(onUserJoin2).toHaveBeenCalled();
    });
  });

  test('real-time message exchange', async () => {
    const { container } = render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={jest.fn()}
        onUserPresenceChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Send a chat message
    const chatInput = screen.getByPlaceholderText('메시지를 입력하세요...');
    const sendButton = screen.getByRole('button', { name: /전송/i });

    fireEvent.change(chatInput, { target: { value: 'Hello from integration test!' } });
    fireEvent.click(sendButton);

    // Verify message appears in chat history
    await waitFor(() => {
      expect(screen.getByText('Hello from integration test!')).toBeInTheDocument();
    });

    // Verify message was sent to server
    const events = mockServer.getEvents(testModelId);
    const chatEvent = events.find(e => e.type === 'chat_message');
    expect(chatEvent).toBeDefined();
    expect(chatEvent!.data.message).toBe('Hello from integration test!');
  });

  test('concurrent model updates and conflict resolution', async () => {
    const syncManager1 = new RealTimeSyncManager(testModelId, user1.id);
    const syncManager2 = new RealTimeSyncManager(testModelId, user2.id);

    await syncManager1.startSync();
    await syncManager2.startSync();

    // Simulate concurrent updates to the same node
    const nodeUpdate1 = {
      type: 'node_update' as const,
      data: {
        nodeId: 'node-1',
        name: 'Updated by Alice',
        timestamp: '2023-01-01T10:00:00Z'
      }
    };

    const nodeUpdate2 = {
      type: 'node_update' as const,
      data: {
        nodeId: 'node-1',
        name: 'Updated by Bob',
        timestamp: '2023-01-01T10:00:01Z'
      }
    };

    // Send updates simultaneously
    await Promise.all([
      syncManager1.sendEvent(nodeUpdate1),
      syncManager2.sendEvent(nodeUpdate2)
    ]);

    // Wait for conflict detection and resolution
    await waitFor(() => {
      const conflicts1 = syncManager1.getConflicts();
      const conflicts2 = syncManager2.getConflicts();
      
      // At least one should detect the conflict
      expect(conflicts1.length + conflicts2.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 3000 });

    syncManager1.stopSync();
    syncManager2.stopSync();
  });

  test('offline mode and synchronization recovery', async () => {
    const syncManager = new RealTimeSyncManager(testModelId, user1.id);
    
    render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={jest.fn()}
        onUserPresenceChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Start sync
    await syncManager.startSync();
    expect(syncManager.isConnected()).toBe(true);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    window.dispatchEvent(new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText('오프라인 모드')).toBeInTheDocument();
    });

    // Make changes while offline
    await syncManager.sendEvent({
      type: 'node_update',
      data: { nodeId: 'node-offline', name: 'Offline Update' }
    });

    // Should show pending changes
    expect(syncManager.getPendingChangesCount()).toBeGreaterThan(0);

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.getByText('온라인')).toBeInTheDocument();
    }, { timeout: 5000 });

    syncManager.stopSync();
  });

  test('user cursor tracking and presence', async () => {
    const syncManager1 = new RealTimeSyncManager(testModelId, user1.id);
    const syncManager2 = new RealTimeSyncManager(testModelId, user2.id);

    const { container } = render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={jest.fn()}
        onUserPresenceChange={jest.fn()}
      />
    );

    await syncManager1.startSync();
    await syncManager2.startSync();

    // Simulate cursor movement from user2
    await syncManager2.sendEvent({
      type: 'cursor_move',
      data: {
        userId: user2.id,
        userName: user2.name,
        cursor: { x: 150, y: 250 },
        color: user2.color
      }
    });

    // Wait for cursor to appear in UI
    await waitFor(() => {
      const cursor = screen.getByTestId(`user-cursor-${user2.id}`);
      expect(cursor).toBeInTheDocument();
    }, { timeout: 3000 });

    syncManager1.stopSync();
    syncManager2.stopSync();
  });

  test('permission-based collaboration features', async () => {
    const viewerUser = {
      ...user2,
      role: 'viewer' as const,
      permissions: {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManage: false
      }
    };

    const { rerender } = render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={jest.fn()}
        onUserPresenceChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Owner should see management controls
    expect(screen.getByRole('button', { name: /사용자 초대/i })).toBeInTheDocument();

    // Switch to viewer
    rerender(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={viewerUser}
        onModelChange={jest.fn()}
        onUserPresenceChange={jest.fn()}
      />
    );

    await waitFor(() => {
      // Viewer should not see management controls
      expect(screen.queryByRole('button', { name: /사용자 초대/i })).not.toBeInTheDocument();
    });

    // But should still see chat
    expect(screen.getByPlaceholderText('메시지를 입력하세요...')).toBeInTheDocument();
  });

  test('version history and model snapshots', async () => {
    const syncManager = new RealTimeSyncManager(testModelId, user1.id);
    
    render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={jest.fn()}
        onUserPresenceChange={jest.fn()}
      />
    );

    await syncManager.startSync();

    // Create multiple model updates
    const updates = [
      { nodeId: 'node-1', name: 'Version 1', action: 'create' },
      { nodeId: 'node-1', name: 'Version 2', action: 'update' },
      { nodeId: 'node-2', name: 'Node 2', action: 'create' }
    ];

    for (let index = 0; index < updates.length; index++) {
      const update = updates[index];
      await syncManager.sendEvent({
        type: 'node_update',
        data: {
          ...update,
          timestamp: new Date(Date.now() + index * 1000).toISOString()
        }
      });
      
      // Wait between updates
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verify version history is tracked
    await waitFor(() => {
      expect(screen.getByText('버전 히스토리')).toBeInTheDocument();
    });

    // Should show recent activity
    const events = mockServer.getEvents(testModelId);
    expect(events.length).toBeGreaterThanOrEqual(3);

    syncManager.stopSync();
  });

  test('auto-save functionality', async () => {
    const onModelUpdate = jest.fn();
    
    render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={onModelUpdate}
        onUserPresenceChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('자동 저장 활성화')).toBeInTheDocument();
    });

    // Auto-save should be enabled by default
    const autoSaveToggle = screen.getByRole('checkbox', { name: /자동 저장/i });
    expect(autoSaveToggle).toBeChecked();

    // Disable auto-save
    fireEvent.click(autoSaveToggle);
    
    await waitFor(() => {
      expect(screen.getByText('자동 저장 비활성화')).toBeInTheDocument();
    });

    expect(autoSaveToggle).not.toBeChecked();
  });

  test('notification system for collaboration events', async () => {
    const { container } = render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={jest.fn()}
        onUserPresenceChange={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    // Simulate receiving a notification about another user's action
    const syncManager = new RealTimeSyncManager(testModelId, user1.id);
    await syncManager.startSync();

    // Simulate another user making a change
    await syncManager.sendEvent({
      type: 'node_update',
      data: {
        nodeId: 'node-1',
        name: 'Updated by Bob',
        userId: user2.id,
        userName: user2.name
      }
    });

    // Should show notification
    await waitFor(() => {
      const notifications = screen.getAllByTestId('collaboration-notification');
      expect(notifications.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    syncManager.stopSync();
  });

  test('performance under high collaboration load', async () => {
    const syncManager = new RealTimeSyncManager(testModelId, user1.id);
    
    render(
      <RealTimeCollaboration
        modelId={testModelId}
        currentUser={user1}
        onModelChange={jest.fn()}
        onUserPresenceChange={jest.fn()}
      />
    );

    await syncManager.startSync();

    const startTime = performance.now();

    // Send many rapid updates
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(
        syncManager.sendEvent({
          type: 'cursor_move',
          data: {
            userId: user1.id,
            cursor: { x: i * 10, y: i * 5 }
          }
        })
      );
    }

    await Promise.all(promises);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Performance should be reasonable (less than 2 seconds for 50 events)
    expect(duration).toBeLessThan(2000);

    // Component should still be responsive
    await waitFor(() => {
      expect(screen.getByText('실시간 협업')).toBeInTheDocument();
    });

    syncManager.stopSync();
  });
});