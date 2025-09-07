import React from 'react';
import Card from '../common/Card';

interface LoginSelectionPageProps {
  onRegisterSelect: () => void;
  onServiceSelect: () => void;
}

const LoginSelectionPage: React.FC<LoginSelectionPageProps> = ({ 
  onRegisterSelect, 
  onServiceSelect 
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* 고급스러운 그라디언트 배경 */}
      <div style={{
        position: 'absolute',
        inset: '0',
        background: 'linear-gradient(to bottom right, var(--bg-elevated), var(--accent-primary), var(--accent-secondary))'
      }}></div>
      <div style={{
        position: 'absolute',
        inset: '0',
        background: 'linear-gradient(to top right, transparent, rgba(var(--accent-rgb), 0.1), rgba(var(--accent-rgb), 0.2))'
      }}></div>
      
      {/* 세련된 기하학적 패턴 */}
      <div style={{ position: 'absolute', inset: '0' }}>
        <div style={{
          position: 'absolute',
          top: '5rem',
          left: '5rem',
          width: '24rem',
          height: '24rem',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          right: '5rem',
          width: '20rem',
          height: '20rem',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderRadius: '50%',
          filter: 'blur(48px)',
          animation: 'pulse 2s infinite',
          animationDelay: '1s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '24rem',
          height: '24rem',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)'
        }}></div>
      </div>

      <div style={{
        maxWidth: '80rem',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        padding: '0 1.5rem'
      }}>
        {/* 개선된 헤더 디자인 - 더욱 세련된 스타일 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '5rem',
            height: '5rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(to bottom right, #2563eb, #9333ea, #4338ca)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: 'rotate(3deg)',
            transition: 'all 0.3s ease-in-out'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(3deg)'}>
            <svg style={{
              width: '2.5rem',
              height: '2.5rem',
              color: 'white'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
            <h1 style={{
              fontSize: 'clamp(1.875rem, 4vw, 3rem)',
              fontWeight: '900',
              marginBottom: '0.5rem',
              background: 'linear-gradient(to right, #111827, #1f2937, #374151)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              AHP for Paper
            </h1>
            <div style={{
              position: 'absolute',
              bottom: '-0.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6rem',
              height: '0.25rem',
              background: 'linear-gradient(to right, #3b82f6, #9333ea)',
              borderRadius: '9999px'
            }}></div>
          </div>
          
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            fontWeight: '600',
            marginTop: '1rem',
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            전문가급 의사결정 지원 시스템
          </p>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            letterSpacing: '0.025em',
            color: '#6b7280'
          }}>
            Analytic Hierarchy Process Decision Support System
          </p>
        </div>

        {/* 개선된 서비스 선택 카드 - 2가지 옵션 (회원가입, 서비스 이용) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(1.5rem, 3vw, 2rem)',
          maxWidth: '88rem',
          margin: '0 auto',
          padding: '0 clamp(1.5rem, 4vw, 2rem)',
          marginTop: '1.5rem'
        }}>
          {/* 회원가입 카드 (첫 번째) */}
          <Card 
            variant="glass" 
            hoverable={true}
            style={{
              backgroundColor: 'rgba(249, 250, 251, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(196, 181, 253, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(196, 181, 253, 0.8)';
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.backgroundColor = 'rgba(243, 244, 246, 0.95)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(196, 181, 253, 0.6)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.95)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div 
              style={{
                textAlign: 'center',
                padding: 'clamp(1.5rem, 4vw, 2.5rem)'
              }}
              onClick={onRegisterSelect}
            >
              <div style={{
                width: 'clamp(5rem, 8vw, 7rem)',
                height: 'clamp(5rem, 8vw, 7rem)',
                margin: '0 auto',
                marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                background: 'linear-gradient(to bottom right, #8b5cf6, #7c3aed)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                <svg style={{
                  width: 'clamp(2.5rem, 4vw, 3.5rem)',
                  height: 'clamp(2.5rem, 4vw, 3.5rem)',
                  color: 'white'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              
              <h3 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: '800',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
                color: '#1f2937'
              }}>
                회원가입
              </h3>
              
              <p style={{
                marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                lineHeight: '1.4',
                fontWeight: '500',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                color: '#4b5563'
              }}>
                연구용 계정을 생성하여
                전문 AHP 분석을 시작하세요
              </p>
              
              <div style={{
                marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                color: '#374151'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#8b5cf6'
                  }}>✓</span>
                  <span style={{ fontWeight: '500' }}>연구 프로젝트 전용 계정</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#8b5cf6'
                  }}>✓</span>
                  <span style={{ fontWeight: '500' }}>학술 연구 완벽 지원</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#8b5cf6'
                  }}>✓</span>
                  <span style={{ fontWeight: '500' }}>가이드 학습 프로그램</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#8b5cf6'
                  }}>✓</span>
                  <span style={{ fontWeight: '500' }}>실제 연구 즉시 적용</span>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-0.25rem',
                  background: 'linear-gradient(to right, #9333ea, #6b21a8)',
                  borderRadius: '1rem',
                  filter: 'blur(4px)',
                  opacity: 0.25,
                  transition: 'opacity 0.3s ease-in-out'
                }}></div>
                <button 
                  style={{
                    position: 'relative',
                    width: '100%',
                    padding: 'clamp(1rem, 2vw, 1.25rem) 2rem',
                    background: 'linear-gradient(to right, #9333ea, #7c3aed)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.125rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #6b21a8)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                    if (prevElement) prevElement.style.opacity = '0.4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #9333ea, #7c3aed)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                    if (prevElement) prevElement.style.opacity = '0.25';
                  }}
                  onClick={onRegisterSelect}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      marginRight: '0.5rem'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    회원가입 시작하기
                  </span>
                </button>
              </div>
            </div>
          </Card>

          {/* 서비스 이용 카드 (두 번째) */}
          <Card 
            variant="glass" 
            hoverable={true}
            style={{
              backgroundColor: 'rgba(249, 250, 251, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '2px solid rgba(191, 219, 254, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.8)';
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.backgroundColor = 'rgba(243, 244, 246, 0.95)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(191, 219, 254, 0.6)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.95)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div 
              style={{
                textAlign: 'center',
                padding: 'clamp(1.5rem, 4vw, 2.5rem)'
              }}
              onClick={onServiceSelect}
            >
              <div style={{
                width: 'clamp(5rem, 8vw, 7rem)',
                height: 'clamp(5rem, 8vw, 7rem)',
                margin: '0 auto',
                marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                background: 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)',
                borderRadius: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                <svg style={{
                  width: 'clamp(2.5rem, 4vw, 3.5rem)',
                  height: 'clamp(2.5rem, 4vw, 3.5rem)',
                  color: 'white'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              
              <h3 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: '800',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
                color: '#1f2937'
              }}>
                서비스 이용
              </h3>
              
              <p style={{
                marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                lineHeight: '1.4',
                fontWeight: '500',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                color: '#4b5563'
              }}>
                AHP 의사결정 분석 플랫폼
                개인/관리자 서비스 이용
              </p>
              
              <div style={{
                marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                color: '#374151'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#3b82f6'
                  }}>✓</span>
                  <span style={{ fontWeight: '500' }}>프로젝트 생성 및 관리</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#3b82f6'
                  }}>✓</span>
                  <span style={{ fontWeight: '500' }}>평가자 초대 및 설문 진행</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#3b82f6'
                  }}>✓</span>
                  <span style={{ fontWeight: '500' }}>실시간 결과 분석</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    marginRight: '0.75rem',
                    fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                    fontWeight: '700',
                    color: '#3b82f6'
                  }}>✓</span>
                  <span style={{ fontWeight: '500' }}>관리자 권한 자동 인식</span>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-0.25rem',
                  background: 'linear-gradient(to right, #2563eb, #1e40af)',
                  borderRadius: '1rem',
                  filter: 'blur(4px)',
                  opacity: 0.25,
                  transition: 'opacity 0.3s ease-in-out'
                }}></div>
                <button 
                  style={{
                    position: 'relative',
                    width: '100%',
                    padding: 'clamp(1rem, 2vw, 1.25rem) 2rem',
                    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.125rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #1e40af)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                    const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                    if (prevElement) prevElement.style.opacity = '0.4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
                    if (prevElement) prevElement.style.opacity = '0.25';
                  }}
                  onClick={onServiceSelect}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      marginRight: '0.5rem'
                    }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    서비스 로그인
                  </span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* 개선된 하단 정보 */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          marginTop: '2rem'
        }}>
          <p style={{
            fontWeight: '400',
            color: '#6b7280'
          }}>Powered by Advanced Analytics & Decision Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelectionPage;