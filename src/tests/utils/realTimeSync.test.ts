import {
  RealTimeSyncManager,
  MockCollaborationServer,
  generateUserColor,
  checkUserPermission,
  type CollaborationUser,
  type CollaborationEvent,
  type ConflictResolution
} from '../../utils/realTimeSync';

// Mock EventSource for testing
class MockEventSource {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState: number = EventSource.CONNECTING;
  url: string;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = EventSource.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  close() {
    this.readyState = EventSource.CLOSED;
  }

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;
}

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock EventSource
(global as any).EventSource = MockEventSource;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
(global as any).localStorage = localStorageMock;

describe.skip('RealTimeSyncManager', () => {
  let syncManager: RealTimeSyncManager;
  const modelId = 'test-model-123';
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();

    syncManager = new RealTimeSyncManager(modelId, userId);
  });

  afterEach(() => {
    syncManager.stopSync();
  });

  describe('initialization', () => {
    test('initializes with correct model and user IDs', () => {
      const syncState = syncManager.getSyncState();
      expect(syncState.modelId).toBe(modelId);
      expect(syncState.version).toBe(0);
      expect(syncState.localChanges).toHaveLength(0);
      expect(syncState.remoteChanges).toHaveLength(0);
      expect(syncState.conflicts).toHaveLength(0);
    });

    test('starts in disconnected state', () => {
      expect(syncManager.isConnected()).toBe(false);
    });
  });

  describe('sync operations', () => {
    test('starts sync successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: 1 })
      });

      await syncManager.startSync();
      
      // Wait for EventSource to connect
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(syncManager.isConnected()).toBe(true);
    });

    test('handles sync start failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await syncManager.startSync();
      
      // Should handle failure without throwing
      expect(syncManager.isConnected()).toBe(false);
    });

    test('stops sync properly', async () => {
      await syncManager.startSync();
      await new Promise(resolve => setTimeout(resolve, 20));
      
      syncManager.stopSync();
      expect(syncManager.isConnected()).toBe(false);
    });
  });

  describe('event handling', () => {
    test('sends events to server', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: 2 })
      });

      await syncManager.sendEvent({
        type: 'node_update',
        data: { nodeId: 'node-1', name: 'Updated Node' }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/collaboration/${modelId}/events`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"type":"node_update"')
        })
      );
    });

    test('queues events when offline', async () => {
      // Simulate offline state
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await syncManager.sendEvent({
        type: 'node_update',
        data: { nodeId: 'node-1', name: 'Updated Node' }
      });

      // Should save to localStorage for offline queue
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `collaboration_offline_${modelId}`,
        expect.any(String)
      );
    });

    test('registers and calls event listeners', () => {
      const mockListener = jest.fn();
      
      syncManager.addEventListener('node_update', mockListener);
      
      // Simulate receiving an event
      const testEvent: CollaborationEvent = {
        id: 'event-1',
        type: 'node_update',
        userId: 'user-2',
        timestamp: new Date().toISOString(),
        data: { nodeId: 'node-1', name: 'Test Node' }
      };

      // Access private method for testing
      (syncManager as any).emitEvent(testEvent);
      
      expect(mockListener).toHaveBeenCalledWith(testEvent);
    });

    test('removes event listeners correctly', () => {
      const mockListener = jest.fn();
      
      syncManager.addEventListener('node_update', mockListener);
      syncManager.removeEventListener('node_update', mockListener);
      
      // Simulate receiving an event
      const testEvent: CollaborationEvent = {
        id: 'event-1',
        type: 'node_update',
        userId: 'user-2',
        timestamp: new Date().toISOString(),
        data: { nodeId: 'node-1', name: 'Test Node' }
      };

      (syncManager as any).emitEvent(testEvent);
      
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('conflict detection and resolution', () => {
    test('detects conflicts correctly', () => {
      const localEvent: CollaborationEvent = {
        id: 'local-1',
        type: 'node_update',
        userId: userId,
        timestamp: new Date().toISOString(),
        data: { nodeId: 'node-1', name: 'Local Update' }
      };

      const remoteEvent: CollaborationEvent = {
        id: 'remote-1',
        type: 'node_update',
        userId: 'user-2',
        timestamp: new Date().toISOString(),
        data: { nodeId: 'node-1', name: 'Remote Update' }
      };

      // Add local change
      (syncManager as any).syncState.localChanges.push(localEvent);

      // Test conflict detection
      const conflict = (syncManager as any).detectConflict(remoteEvent);
      
      expect(conflict).toBeTruthy();
      expect(conflict.type).toBe('merge');
      expect(conflict.conflictingEvents).toHaveLength(2);
    });

    test('resolves conflicts automatically', async () => {
      const conflict: ConflictResolution = {
        conflictId: 'conflict-1',
        type: 'merge',
        resolution: 'auto',
        conflictingEvents: [
          {
            id: 'event-1',
            type: 'node_update',
            userId: 'user-1',
            timestamp: '2023-01-01T10:00:00Z',
            data: { nodeId: 'node-1', name: 'Update 1' }
          },
          {
            id: 'event-2',
            type: 'node_update',
            userId: 'user-2',
            timestamp: '2023-01-01T10:00:01Z',
            data: { nodeId: 'node-1', name: 'Update 2' }
          }
        ]
      };

      // Test automatic conflict resolution
      await new Promise(resolve => {
        const mockListener = jest.fn(() => resolve(undefined));
        syncManager.addEventListener('*', mockListener);
        
        (syncManager as any).resolveConflictAutomatically(conflict);
      });

      const conflicts = syncManager.getConflicts();
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('offline support', () => {
    test('saves state to localStorage', () => {
      (syncManager as any).saveToLocalStorage();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `collaboration_state_${modelId}`,
        expect.any(String)
      );
    });

    test('loads offline changes from localStorage', () => {
      const offlineEvents = [
        {
          id: 'offline-1',
          type: 'node_update',
          userId: userId,
          timestamp: new Date().toISOString(),
          data: { nodeId: 'node-1', name: 'Offline Update' }
        }
      ];

      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(offlineEvents));
      
      const loadedEvents = (syncManager as any).loadFromLocalStorage();
      
      expect(loadedEvents).toEqual(offlineEvents);
    });

    test('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      const loadedEvents = (syncManager as any).loadFromLocalStorage();
      
      expect(loadedEvents).toEqual([]);
    });
  });

  describe('heartbeat and connection management', () => {
    test('sends heartbeat successfully', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await (syncManager as any).sendHeartbeat();
      
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/collaboration/${modelId}/heartbeat`,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(userId)
        })
      );
    });

    test('handles heartbeat failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect((syncManager as any).sendHeartbeat()).resolves.toBeUndefined();
    });
  });

  describe('state getters', () => {
    test('returns sync state correctly', () => {
      const state = syncManager.getSyncState();
      
      expect(state).toHaveProperty('modelId', modelId);
      expect(state).toHaveProperty('version');
      expect(state).toHaveProperty('lastSync');
      expect(state).toHaveProperty('localChanges');
      expect(state).toHaveProperty('remoteChanges');
      expect(state).toHaveProperty('conflicts');
    });

    test('returns pending changes count', () => {
      const count = syncManager.getPendingChangesCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('returns conflicts list', () => {
      const conflicts = syncManager.getConflicts();
      expect(Array.isArray(conflicts)).toBe(true);
    });
  });
});

describe('MockCollaborationServer', () => {
  let server: MockCollaborationServer;
  const modelId = 'test-model';

  beforeEach(() => {
    server = MockCollaborationServer.getInstance();
  });

  test('is singleton', () => {
    const server2 = MockCollaborationServer.getInstance();
    expect(server).toBe(server2);
  });

  test('sends and stores events', async () => {
    const event: CollaborationEvent = {
      id: 'event-1',
      type: 'node_update',
      userId: 'user-1',
      timestamp: new Date().toISOString(),
      data: { nodeId: 'node-1', name: 'Test Node' }
    };

    const result = await server.sendEvent(modelId, event);
    
    expect(result.success).toBe(true);
    expect(result.version).toBe(1);
    
    const events = server.getEvents(modelId);
    expect(events).toContain(event);
  });

  test('filters events by timestamp', () => {
    const oldEvent: CollaborationEvent = {
      id: 'old-event',
      type: 'node_update',
      userId: 'user-1',
      timestamp: '2023-01-01T00:00:00Z',
      data: {}
    };

    const newEvent: CollaborationEvent = {
      id: 'new-event',
      type: 'node_update',
      userId: 'user-1',
      timestamp: '2023-12-01T00:00:00Z',
      data: {}
    };

    server.sendEvent(modelId, oldEvent);
    server.sendEvent(modelId, newEvent);

    const recentEvents = server.getEvents(modelId, '2023-06-01T00:00:00Z');
    
    expect(recentEvents).toContain(newEvent);
    expect(recentEvents).not.toContain(oldEvent);
  });

  test('manages user presence', () => {
    const user: CollaborationUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      color: '#3B82F6',
      isOnline: true,
      lastActivity: new Date().toISOString(),
      role: 'editor',
      permissions: {
        canEdit: true,
        canDelete: false,
        canInvite: false,
        canManage: false
      }
    };

    server.updateUserPresence(modelId, user);
    
    const users = server.getUsers(modelId);
    expect(users).toContain(user);
  });

  test('updates existing user presence', () => {
    const user: CollaborationUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      color: '#3B82F6',
      isOnline: true,
      lastActivity: new Date().toISOString(),
      role: 'editor',
      permissions: {
        canEdit: true,
        canDelete: false,
        canInvite: false,
        canManage: false
      }
    };

    server.updateUserPresence(modelId, user);
    
    // Update the same user
    const updatedUser = { ...user, isOnline: false };
    server.updateUserPresence(modelId, updatedUser);
    
    const users = server.getUsers(modelId);
    expect(users).toHaveLength(1);
    expect(users[0].isOnline).toBe(false);
  });
});

describe('utility functions', () => {
  describe('generateUserColor', () => {
    test('generates consistent colors for same user ID', () => {
      const color1 = generateUserColor('user-123');
      const color2 = generateUserColor('user-123');
      
      expect(color1).toBe(color2);
    });

    test('generates different colors for different user IDs', () => {
      const color1 = generateUserColor('user-1');
      const color2 = generateUserColor('user-2');
      
      expect(color1).not.toBe(color2);
    });

    test('generates valid hex colors', () => {
      const color = generateUserColor('test-user');
      
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('checkUserPermission', () => {
    const sampleUser: CollaborationUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      color: '#3B82F6',
      isOnline: true,
      lastActivity: new Date().toISOString(),
      role: 'editor',
      permissions: {
        canEdit: true,
        canDelete: false,
        canInvite: false,
        canManage: false
      }
    };

    test('checks edit permission correctly', () => {
      expect(checkUserPermission(sampleUser, 'edit')).toBe(true);
    });

    test('checks delete permission correctly', () => {
      expect(checkUserPermission(sampleUser, 'delete')).toBe(false);
    });

    test('checks invite permission correctly', () => {
      expect(checkUserPermission(sampleUser, 'invite')).toBe(false);
    });

    test('checks manage permission correctly', () => {
      expect(checkUserPermission(sampleUser, 'manage')).toBe(false);
    });

    test('returns false for unknown permissions', () => {
      expect(checkUserPermission(sampleUser, 'unknown')).toBe(false);
    });
  });
});