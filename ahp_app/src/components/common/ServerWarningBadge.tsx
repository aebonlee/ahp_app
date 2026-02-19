import React from 'react';
import { MESSAGES } from '../../constants/messages';

interface ServerWarningBadgeProps {
  message?: string;
  showExcelSave?: boolean;
  showCapture?: boolean;
  onExcelSave?: () => void;
  onCapture?: () => void;
  variant?: 'compact' | 'full';
  position?: 'top' | 'inline';
}

const ServerWarningBadge: React.FC<ServerWarningBadgeProps> = ({
  message = MESSAGES.RESULTS_NOT_SAVED,
  showExcelSave = true,
  showCapture = true,
  onExcelSave,
  onCapture,
  variant = 'full',
  position = 'top'
}) => {
  const handleExcelSave = () => {
    if (onExcelSave) {
      onExcelSave();
    }
  };

  const handleCapture = () => {
    if (onCapture) {
      onCapture();
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${
        position === 'top' ? 'mb-4' : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-yellow-500 mr-2">⚠️</div>
            <span className="text-sm text-yellow-800 font-medium">
              {MESSAGES.CAPTURE_RECOMMENDED}
            </span>
          </div>
          <div className="flex space-x-2">
            {showCapture && (
              <button
                onClick={handleCapture}
                className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
              >
                캡처
              </button>
            )}
            {showExcelSave && (
              <button
                onClick={handleExcelSave}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                Excel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${
      position === 'top' ? 'mb-6' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-red-500 text-lg">⚠️</span>
          <div>
            <h5 className="font-medium text-red-900 mb-1">중요 안내</h5>
            <p className="text-sm text-red-700">
              {message}
            </p>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          {showCapture && (
            <button
              onClick={handleCapture}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              📷 캡처
            </button>
          )}
          {showExcelSave && (
            <button
              onClick={handleExcelSave}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              📊 Excel 저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerWarningBadge;