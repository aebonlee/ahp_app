import React, { useCallback, useMemo, useState, useEffect } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Container, Engine, ISourceOptions } from 'tsparticles-engine';

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

    // Intersection Observer로 뷰포트 내에서만 실행
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('particle-background');
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // 성능 최적화: 필요시에만 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('Particles loaded:', container);
    }
  }, []);

  const particlesOptions: ISourceOptions = useMemo(() => {
    // 디바이스 성능에 따른 설정 조정
    const getPerformanceAdjustedSettings = () => {
      const actualIntensity = devicePerformance === 'low' ? 'low' : 
                              devicePerformance === 'high' ? intensity : 'medium';
      
      const particleCount = {
        low: { base: 20, mobile: 10, small: 8 },
        medium: { base: 50, mobile: 25, small: 15 },
        high: { base: 80, mobile: 40, small: 25 }
      };

      const speed = {
        low: 0.5,
        medium: 1.5,
        high: 2.5
      };

      return {
        intensity: actualIntensity as 'low' | 'medium' | 'high',
        particleCount: particleCount[actualIntensity],
        speed: speed[actualIntensity]
      };
    };

    const settings = getPerformanceAdjustedSettings();

    const baseConfig: ISourceOptions = {
      background: {
        color: {
          value: 'transparent'
        }
      },
      fpsLimit: devicePerformance === 'low' ? 30 : devicePerformance === 'medium' ? 60 : 120,
      pauseOnBlur: true, // 탭이 비활성화되면 일시정지
      pauseOnOutsideViewport: true, // 뷰포트 밖에서 일시정지
      interactivity: {
        detectsOn: 'window',
        events: {
          onClick: {
            enable: interactive && devicePerformance !== 'low',
            mode: 'push'
          },
          onHover: {
            enable: interactive && devicePerformance !== 'low',
            mode: 'grab' // repulse보다 성능이 좋음
          },
          resize: true
        },
        modes: {
          push: {
            quantity: devicePerformance === 'high' ? 4 : 2
          },
          grab: {
            distance: devicePerformance === 'high' ? 140 : 100,
            links: {
              opacity: 0.3
            }
          }
        }
      },
      particles: {
        color: {
          value: theme === 'dark' ? '#C8A968' : '#848484' // 글로벌 테마 색상 사용
        },
        links: {
          color: theme === 'dark' ? '#C8A968' : '#848484',
          distance: devicePerformance === 'high' ? 150 : devicePerformance === 'medium' ? 120 : 100,
          enable: true,
          opacity: theme === 'dark' ? 0.3 : 0.15,
          width: devicePerformance === 'low' ? 0.5 : 1
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce'
          },
          random: devicePerformance === 'high',
          speed: settings.speed,
          straight: false
        },
        number: {
          density: {
            enable: true,
            area: devicePerformance === 'low' ? 1200 : 800
          },
          value: settings.particleCount.base
        },
        opacity: {
          value: theme === 'dark' ? 0.5 : 0.3,
          animation: {
            enable: devicePerformance === 'high',
            speed: 0.5,
            minimumValue: 0.1,
            sync: false
          }
        },
        shape: {
          type: 'circle'
        },
        size: {
          value: { min: 1, max: devicePerformance === 'high' ? 4 : 3 },
          animation: {
            enable: devicePerformance === 'high',
            speed: 2,
            minimumValue: 1,
            sync: false
          }
        }
      },
      detectRetina: true,
      responsive: [
        {
          maxWidth: 768,
          options: {
            particles: {
              number: {
                value: settings.particleCount.mobile
              },
              links: {
                distance: 100
              },
              move: {
                speed: settings.speed * 0.7 // 모바일에서 속도 감소
              }
            },
            interactivity: {
              events: {
                onHover: {
                  enable: false // 모바일에서 호버 비활성화
                },
                onClick: {
                  enable: devicePerformance !== 'low'
                }
              }
            }
          }
        },
        {
          maxWidth: 480,
          options: {
            particles: {
              number: {
                value: settings.particleCount.small
              },
              links: {
                distance: 80,
                width: 0.5
              },
              move: {
                speed: settings.speed * 0.5
              }
            },
            interactivity: {
              events: {
                onHover: {
                  enable: false
                },
                onClick: {
                  enable: false // 작은 화면에서 인터랙션 완전 비활성화
                }
              }
            },
            fpsLimit: 30 // 작은 화면에서 FPS 제한
          }
        }
      ]
    };

    return baseConfig;
  }, [theme, intensity, interactive, devicePerformance]);

  // 성능이 너무 낮거나 배터리가 부족하거나 화면 밖에 있으면 렌더링하지 않음
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

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Particles
        id="particle-background"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particlesOptions}
        className="absolute inset-0 w-full h-full"
        style={{ 
          zIndex: -1,
          willChange: 'transform', // GPU 가속 힌트
        }}
      />
    </div>
  );
};

export default ParticleBackground;