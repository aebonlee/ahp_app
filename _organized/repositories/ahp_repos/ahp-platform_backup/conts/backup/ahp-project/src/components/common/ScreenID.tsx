import React from 'react';

interface ScreenIDProps {
  id: string;
  position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
  visible?: boolean;
}

const ScreenID: React.FC<ScreenIDProps> = ({ 
  id, 
  position = 'bottom-right',
  visible = true 
}) => {
  if (!visible) return null;

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'top-right': 'fixed top-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-left': 'fixed top-4 left-4'
  };

  return (
    <div className={`${positionClasses[position]} z-50 pointer-events-none`}>
      <div className="bg-gray-800 bg-opacity-90 text-white px-3 py-1 rounded-lg text-xs font-mono border border-gray-600 shadow-lg">
        <span className="text-gray-300">ID:</span>
        <span className="ml-1 font-semibold">{id}</span>
      </div>
    </div>
  );
};

export default ScreenID;