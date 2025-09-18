// =============================================================================
// AHP Enterprise Platform - Toast Container Component (3차 개발)
// =============================================================================

import React from 'react';
import { createPortal } from 'react-dom';
import useUIStore from '@/store/uiStore';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'info':
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getToastClasses = (type: string) => {
    const baseClasses = "relative flex items-center w-full max-w-sm p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 border-l-4 transform transition-all duration-300 animate-slide-up";
    
    switch (type) {
      case 'success':
        return `${baseClasses} border-green-500`;
      case 'error':
        return `${baseClasses} border-red-500`;
      case 'warning':
        return `${baseClasses} border-yellow-500`;
      case 'info':
      default:
        return `${baseClasses} border-blue-500`;
    }
  };

  const removeToast = (id: string) => {
    useUIStore.setState((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  };

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={getToastClasses(toast.type)}>
          <div className="flex items-center">
            {getIcon(toast.type)}
            <div className="ml-3 text-sm font-normal">
              {toast.message}
            </div>
          </div>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => removeToast(toast.id)}
            aria-label="Close"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;