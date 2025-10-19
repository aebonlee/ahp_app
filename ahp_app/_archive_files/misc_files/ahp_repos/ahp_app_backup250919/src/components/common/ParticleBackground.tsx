import React, { useState, useEffect } from 'react';

interface ParticleBackgroundProps {
  className?: string;
  theme?: 'light' | 'dark';
  intensity?: 'low' | 'medium' | 'high';
  interactive?: boolean;
}

// 성능 감지 헬퍼 함수
const getDevicePerformanceLevel = (): 'low' | 'medium' | 'high' => {
  // 하드웨어 동시성 레벨 체크
  const cores = navigator.hardwareConcurrency || 4;
  
  // 메모리 정보 (사용 가능한 경우)
  const memory = (navigator as any).deviceMemory || 4;
  
  // GPU 웹GL 컨텍스트 체크 (기본적인 성능 지표)
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const hasWebGL = !!gl;
  
  // 성능 등급 결정
  if (cores >= 8 && memory >= 8 && hasWebGL) return 'high';
  if (cores >= 4 && memory >= 4 && hasWebGL) return 'medium';
  return 'low';
};

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className = '',
  theme = 'light',
  intensity = 'medium',
  interactive = true
}) => {
  const [devicePerformance, setDevicePerformance] = useState<'low' | 'medium' | 'high'>('medium');
  const [isVisible, setIsVisible] = useState(true);

  // 디바이스 성능 감지 및 배터리 상태 모니터링
  useEffect(() => {
    const performanceLevel = getDevicePerformanceLevel();
    setDevicePerformance(performanceLevel);

    // 배터리 API 체크 (지원하는 브라우저에서)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryStatus = () => {
          // 배터리 부족 시 particles 비활성화
          if (battery.level < 0.2 && !battery.charging) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
        };

        updateBatteryStatus();
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);
      });
    }
  }, []);

  // 성능이 너무 낮거나 배터리가 부족하면 간단한 그라데이션만
  if (!isVisible || devicePerformance === 'low') {
    return (
      <div 
        className={`absolute inset-0 ${className}`}
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle at 50% 50%, rgba(200, 169, 104, 0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(132, 132, 132, 0.03) 0%, transparent 70%)'
        }}
      />
    );
  }

  const particleCount = intensity === 'high' ? 12 : intensity === 'medium' ? 8 : 4;

  // 간단한 CSS 기반 파티클 효과 (react-particles 없이)
  return (
    <>
      <div 
        id="particle-background"
        className={`absolute inset-0 ${className}`}
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle at 50% 50%, rgba(200, 169, 104, 0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(132, 132, 132, 0.03) 0%, transparent 70%)',
          zIndex: -1,
          overflow: 'hidden'
        }}
      >
        {/* CSS 애니메이션 도형들 */}
        {Array.from({ length: particleCount }).map((_, i) => (
          <div
            key={i}
            className={`particle-${i}`}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: theme === 'dark' ? '#C8A968' : '#848484',
              borderRadius: '50%',
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float${i} ${Math.random() * 10 + 15}s infinite ease-in-out ${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      <style>{`
        ${Array.from({ length: particleCount }).map(
          (_, i) => `
          @keyframes float${i} {
            0%, 100% { 
              transform: translateY(0px) translateX(0px) rotate(0deg); 
            }
            25% { 
              transform: translateY(-${Math.random() * 30 + 20}px) translateX(${Math.random() * 20 - 10}px) rotate(90deg); 
            }
            50% { 
              transform: translateY(-${Math.random() * 20 + 10}px) translateX(-${Math.random() * 25 + 15}px) rotate(180deg); 
            }
            75% { 
              transform: translateY(-${Math.random() * 35 + 25}px) translateX(${Math.random() * 15 - 5}px) rotate(270deg); 
            }
          }`
        ).join('\n')}
      `}</style>
    </>
  );
};

export default ParticleBackground;