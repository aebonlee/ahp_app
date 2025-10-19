import React, { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, className = '' }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: 'landscape',
    touchSupported: 'ontouchstart' in window
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait',
        touchSupported: 'ontouchstart' in window
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  const getLayoutClasses = () => {
    const baseClasses = 'transition-all duration-300';
    
    if (deviceInfo.isMobile) {
      return `${baseClasses} px-2 py-2 text-sm`;
    } else if (deviceInfo.isTablet) {
      return `${baseClasses} px-4 py-3 text-base`;
    } else {
      return `${baseClasses} px-6 py-4 text-base`;
    }
  };

  return (
    <div className={`${getLayoutClasses()} ${className}`} data-device-type={
      deviceInfo.isMobile ? 'mobile' : deviceInfo.isTablet ? 'tablet' : 'desktop'
    }>
      {/* 디바이스 정보를 Context로 제공 */}
      <DeviceContext.Provider value={deviceInfo}>
        {children}
      </DeviceContext.Provider>
      
      {/* 모바일에서만 표시되는 하단 네비게이션 힌트 */}
      {deviceInfo.isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white text-center py-2 text-xs">
          📱 모바일 최적화 버전으로 표시됩니다
        </div>
      )}
    </div>
  );
};

// Device Context 생성
export const DeviceContext = React.createContext<DeviceInfo>({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  screenWidth: 1024,
  screenHeight: 768,
  orientation: 'landscape',
  touchSupported: false
});

// Custom Hook for Device Info
export const useDeviceInfo = () => {
  const context = React.useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceInfo must be used within a ResponsiveLayout');
  }
  return context;
};

export default ResponsiveLayout;