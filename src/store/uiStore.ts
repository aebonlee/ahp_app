// =============================================================================
// AHP Enterprise Platform - UI State Store (3차 개발)
// =============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UIState, Notification, LoadingState, ErrorState } from '@/types';

interface UIStore extends UIState {
  // Loading states
  loadingStates: Record<string, LoadingState>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Loading states
  setLoading: (key: string, loading: LoadingState) => void;
  clearLoading: (key: string) => void;
  
  // Modal/Dialog management
  openModal: (modalId: string, props?: any) => void;
  closeModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;
  
  // Toast notifications
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  
  // Internal state
  modals: Record<string, { isOpen: boolean; props?: any }>;
  toasts: Array<{ id: string; message: string; type: string; duration: number }>;
}

const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        theme: 'auto',
        sidebarCollapsed: false,
        notifications: [],
        loadingStates: {},
        modals: {},
        toasts: [],

        // Set Theme
        setTheme: (theme) => {
          set({ theme });
          
          // Apply theme to document
          const root = document.documentElement;
          if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
          } else {
            root.classList.toggle('dark', theme === 'dark');
          }
        },

        // Toggle Sidebar
        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
        },

        // Set Sidebar Collapsed
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed });
        },

        // Add Notification
        addNotification: (notificationData) => {
          const notification: Notification = {
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false,
            ...notificationData,
          };
          
          set((state) => ({
            notifications: [notification, ...state.notifications],
          }));
          
          // Auto-remove info notifications after 5 seconds
          if (notification.type === 'info') {
            setTimeout(() => {
              get().removeNotification(notification.id);
            }, 5000);
          }
        },

        // Remove Notification
        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }));
        },

        // Mark Notification Read
        markNotificationRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
            ),
          }));
        },

        // Clear All Notifications
        clearAllNotifications: () => {
          set({ notifications: [] });
        },

        // Set Loading
        setLoading: (key, loading) => {
          set((state) => ({
            loadingStates: {
              ...state.loadingStates,
              [key]: loading,
            },
          }));
        },

        // Clear Loading
        clearLoading: (key) => {
          set((state) => {
            const newLoadingStates = { ...state.loadingStates };
            delete newLoadingStates[key];
            return { loadingStates: newLoadingStates };
          });
        },

        // Open Modal
        openModal: (modalId, props) => {
          set((state) => ({
            modals: {
              ...state.modals,
              [modalId]: { isOpen: true, props },
            },
          }));
        },

        // Close Modal
        closeModal: (modalId) => {
          set((state) => ({
            modals: {
              ...state.modals,
              [modalId]: { isOpen: false, props: undefined },
            },
          }));
        },

        // Is Modal Open
        isModalOpen: (modalId) => {
          return get().modals[modalId]?.isOpen || false;
        },

        // Show Toast
        showToast: (message, type = 'info', duration = 3000) => {
          const toast = {
            id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message,
            type,
            duration,
          };
          
          set((state) => ({
            toasts: [...state.toasts, toast],
          }));
          
          // Auto-remove toast after duration
          setTimeout(() => {
            set((state) => ({
              toasts: state.toasts.filter(t => t.id !== toast.id),
            }));
          }, duration);
        },
      }),
      {
        name: 'ahp-ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    {
      name: 'UIStore',
    }
  )
);

// 테마 초기화 함수
export const initializeTheme = () => {
  const { theme } = useUIStore.getState();
  const root = document.documentElement;
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (useUIStore.getState().theme === 'auto') {
        root.classList.toggle('dark', e.matches);
      }
    });
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

// 헬퍼 함수들
export const useToast = () => {
  const showToast = useUIStore((state) => state.showToast);
  
  return {
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
  };
};

export const useLoading = (key: string) => {
  const setLoading = useUIStore((state) => state.setLoading);
  const clearLoading = useUIStore((state) => state.clearLoading);
  const loadingState = useUIStore((state) => state.loadingStates[key]);
  
  return {
    isLoading: loadingState?.isLoading || false,
    message: loadingState?.message,
    progress: loadingState?.progress,
    start: (message?: string, progress?: number) => 
      setLoading(key, { isLoading: true, message, progress }),
    stop: () => clearLoading(key),
    update: (message?: string, progress?: number) => {
      if (loadingState?.isLoading) {
        setLoading(key, { isLoading: true, message, progress });
      }
    },
  };
};

export default useUIStore;