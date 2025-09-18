import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeModeToggle from '../common/ThemeModeToggle';
import ColorThemeButton from '../common/ColorThemeButton';
import PricingSection from './PricingSection';
import { BaseUser } from '../../types/userTypes';

interface HomePageProps {
  currentUser?: BaseUser | null;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ currentUser, onLoginClick, onRegisterClick, onNavigate, onLogout }) => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  // 로그인 버튼 클릭 - 항상 로그인 페이지로
  const handleLoginClick = () => {
    navigate('/login');
  };

  // 시작하기 버튼 클릭 - 로그인 상태에 따라 다른 동작
  const handleStartClick = () => {
    console.log('🚀 시작하기 버튼 클릭 - 현재 사용자:', currentUser?.username || '없음');
    
    if (currentUser) {
      // 로그인한 사용자는 바로 개인서비스 대시보드로 이동
      console.log('✅ 로그인 상태 - 개인서비스 대시보드로 이동');
      navigate('/personal');
    } else {
      // 로그인하지 않은 사용자는 로그인 페이지로 이동
      console.log('❌ 비로그인 상태 - 로그인 페이지로 이동');
      navigate('/login');
    }
  };

  // 스크롤 이벤트 및 화면 크기 처리
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setShowScrollTop(currentScrollY > 300);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 화면 크기 설정
    handleResize();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary, #ffffff)',
      color: 'var(--text-primary, #1f2937)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 헤더 - 완전한 네비게이션 */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.3s ease',
        backgroundColor: scrollY > 10 ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: scrollY > 10 ? 'blur(10px)' : 'none',
        boxShadow: scrollY > 10 ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4rem'
          }}>
            {/* 로고 */}
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                margin: 0
              }}>
                AHP for Paper
              </h1>
            </div>

            {/* 네비게이션 - 데스크톱 */}
            <nav style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              <a href="#features" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                 onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                주요 기능
              </a>
              <a href="#how-it-works" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                 onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                이용 방법
              </a>
              <a href="#pricing" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                 onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                요금제
              </a>
              <Link 
                to="/support"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }} 
                onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                고객 지원
              </Link>
              <Link 
                to="/news"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }} 
                onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                소식 및 사례
              </Link>
            </nav>

            {/* CTA 버튼들 및 테마 컨트롤 */}
            <div style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {/* 테마 컨트롤 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ThemeModeToggle />
                <ColorThemeButton />
              </div>
              
              <div style={{
                width: '1px',
                height: '1.5rem',
                backgroundColor: 'var(--border-light)'
              }}></div>
              
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {currentUser.username}님
                  </span>
                  <button
                    onClick={onLogout}
                    style={{
                      padding: '0.5rem 1.25rem',
                      color: 'var(--text-secondary)',
                      fontWeight: '500',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  style={{
                    padding: '0.5rem 1.25rem',
                    color: 'var(--text-secondary)',
                    fontWeight: '500',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
                >
                  로그인
                </button>
              )}
              <button
                onClick={handleStartClick}
                style={{
                  padding: '0.625rem 1.5rem',
                  color: 'white',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease, transform 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                시작하기
              </button>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                display: isMobile ? 'block' : 'none',
                padding: '0.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)'
              }}
            >
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div style={{
            display: isMobile ? 'block' : 'none',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <div style={{
              padding: '1rem 1.5rem'
            }}>
              <a href="#features" style={{
                display: 'block',
                padding: '0.5rem 0',
                color: 'var(--text-secondary)',
                textDecoration: 'none'
              }} onClick={() => setIsMenuOpen(false)}>주요 기능</a>
              <a href="#how-it-works" style={{
                display: 'block',
                padding: '0.5rem 0',
                color: 'var(--text-secondary)',
                textDecoration: 'none'
              }} onClick={() => setIsMenuOpen(false)}>이용 방법</a>
              <a href="#pricing" style={{
                display: 'block',
                padding: '0.5rem 0',
                color: 'var(--text-secondary)',
                textDecoration: 'none'
              }} onClick={() => setIsMenuOpen(false)}>요금제</a>
              <Link to="/support" style={{
                display: 'block',
                padding: '0.5rem 0',
                color: 'var(--text-secondary)',
                textDecoration: 'none'
              }} onClick={() => setIsMenuOpen(false)}>고객 지원</Link>
              <Link to="/news" style={{
                display: 'block',
                padding: '0.5rem 0',
                color: 'var(--text-secondary)',
                textDecoration: 'none'
              }} onClick={() => setIsMenuOpen(false)}>소식 및 사례</Link>
              
              {/* 모바일 테마 컨트롤 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0',
                borderTop: '1px solid var(--border-light)',
                marginTop: '0.75rem'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)'
                }}>테마:</span>
                <ThemeModeToggle />
                <ColorThemeButton />
              </div>
              
              {/* 모바일 로그인/로그아웃 버튼 */}
              {currentUser ? (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    {currentUser.username}님
                  </div>
                  <button
                    onClick={onLogout}
                    style={{
                      padding: '0.5rem 1rem',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginTop: '1rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  로그인
                </button>
              )}
              
              <button 
                onClick={handleStartClick} 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                  color: 'white',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                시작하기
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 히어로 섹션 */}
      <section style={{
        position: 'relative',
        paddingTop: '6rem',
        paddingBottom: '5rem',
        overflow: 'hidden'
      }}>
        {/* 배경 그라디언트 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, var(--bg-subtle), var(--bg-primary), var(--bg-elevated))`
        }}></div>
        
        <div style={{
          position: 'relative',
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            {/* 배지 */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '1.5rem',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)'
            }}>
              <svg style={{
                width: '1rem',
                height: '1rem',
                marginRight: '0.5rem'
              }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              논문 작성을 위한 전문 분석 도구
            </div>

            {/* 메인 타이틀 */}
            <h1 style={{
              fontSize: isMobile ? '3rem' : '4rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              lineHeight: '1.2',
              color: 'var(--text-primary)'
            }}>
              복잡한 의사결정을
              <br />
              <span style={{
                background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                체계적으로 분석하세요
              </span>
            </h1>

            {/* 서브 타이틀 */}
            <p style={{
              fontSize: '1.25rem',
              marginBottom: '2.5rem',
              maxWidth: '48rem',
              margin: '0 auto 2.5rem auto',
              color: 'var(--text-secondary)',
              lineHeight: '1.6'
            }}>
              AHP(Analytic Hierarchy Process) 방법론을 활용하여
              연구의 신뢰성을 높이고 명확한 결론을 도출하세요
            </p>

            {/* CTA 버튼들 */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button
                onClick={handleStartClick}
                style={{
                  padding: '1rem 2rem',
                  color: 'white',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease, transform 0.1s ease',
                  minWidth: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                연구 시작하기
                <svg style={{
                  display: 'inline-block',
                  width: '1.25rem',
                  height: '1.25rem',
                  marginLeft: '0.5rem',
                  verticalAlign: 'middle'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  border: '2px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'}
              >
                가이드 보기
                <svg style={{
                  display: 'inline-block',
                  width: '1.25rem',
                  height: '1.25rem',
                  marginLeft: '0.5rem',
                  verticalAlign: 'middle'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>

            {/* 신뢰 지표 */}
            <div style={{
              marginTop: '3rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'var(--accent-primary)'
                }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>검증된 방법론</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'var(--accent-primary)'
                }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>실시간 분석</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'var(--accent-primary)'
                }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>전문가 지원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section id="features" style={{
        padding: '5rem 0',
        backgroundColor: 'var(--bg-subtle)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              연구에 필요한 모든 기능
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)'
            }}>
              복잡한 의사결정 문제를 체계적으로 해결하세요
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '2rem'
          }}>
            {/* 기능 카드 1 */}
            <div style={{
              borderRadius: '1rem',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}
               onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                backgroundColor: 'var(--accent-light)'
              }}>
                <svg style={{
                  width: '2rem',
                  height: '2rem',
                  color: 'var(--accent-primary)'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)'
              }}>체계적 계층 구조</h3>
              <p style={{
                lineHeight: '1.75',
                color: 'var(--text-secondary)'
              }}>
                목표, 기준, 대안을 체계적으로 구조화하여 복잡한 문제를 명확하게 정리합니다
              </p>
            </div>

            {/* 기능 카드 2 */}
            <div style={{
              borderRadius: '1rem',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}
               onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                backgroundColor: 'var(--accent-light)'
              }}>
                <svg style={{
                  width: '2rem',
                  height: '2rem',
                  color: 'var(--accent-primary)'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)'
              }}>정량적 분석</h3>
              <p style={{
                lineHeight: '1.75',
                color: 'var(--text-secondary)'
              }}>
                쌍대비교를 통해 주관적 판단을 객관적 수치로 변환하고 일관성을 검증합니다
              </p>
            </div>

            {/* 기능 카드 3 */}
            <div style={{
              borderRadius: '1rem',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}
               onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                backgroundColor: 'var(--accent-light)'
              }}>
                <svg style={{
                  width: '2rem',
                  height: '2rem',
                  color: 'var(--accent-primary)'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)'
              }}>협업 연구</h3>
              <p style={{
                lineHeight: '1.75',
                color: 'var(--text-secondary)'
              }}>
                여러 전문가의 의견을 수집하고 통합하여 집단 의사결정을 지원합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 사용 방법 섹션 */}
      <section id="how-it-works" style={{
        padding: '5rem 0',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              간단한 3단계 프로세스
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)'
            }}>
              가이드를 따라 쉽게 연구를 진행하세요
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '2rem'
          }}>
            {/* 단계 1 */}
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  backgroundColor: 'var(--accent-primary)'
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)'
                }}>계층 구조 설계</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  연구 목표와 평가 기준, 대안을 체계적으로 구성합니다
                </p>
              </div>
            </div>

            {/* 단계 2 */}
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  backgroundColor: 'var(--accent-primary)'
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)'
                }}>쌍대 비교</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  각 요소들을 1:1로 비교하여 상대적 중요도를 평가합니다
                </p>
              </div>
            </div>

            {/* 단계 3 */}
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  backgroundColor: 'var(--accent-primary)'
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)'
                }}>결과 분석</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  우선순위와 일관성 비율을 확인하고 최적 대안을 도출합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 요금제 섹션 */}
      <section id="pricing">
        <PricingSection onLoginClick={handleStartClick} />
      </section>

      {/* CTA 섹션 */}
      <section style={{
        padding: '5rem 0',
        background: `linear-gradient(to right, var(--accent-primary), var(--accent-secondary))`
      }}>
        <div style={{
          maxWidth: '64rem',
          margin: '0 auto',
          padding: '0 1.5rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem'
          }}>
            지금 바로 연구를 시작하세요
          </h2>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            전문적인 AHP 분석으로 연구의 품질을 높이세요
          </p>
          <button
            onClick={handleStartClick}
            style={{
              padding: '1rem 2.5rem',
              color: 'var(--accent-primary)',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.3s ease, transform 0.1s ease'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            14일 무료 체험 시작
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-light)',
        padding: '3rem 0 1rem 0'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* 회사 정보 */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                🏗️ AHP for Paper
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                lineHeight: '1.6',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                한국직업능력개발센터
              </p>
              <div style={{
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                <p style={{ margin: '0.25rem 0' }}>사업자등록번호: 601-45-20154</p>
                <p style={{ margin: '0.25rem 0' }}>경기도 수원시 팔달구 매산로 45, 419호</p>
                <p style={{ margin: '0.25rem 0' }}>대표이사: 이애본</p>
                <p style={{ margin: '0.25rem 0' }}>통신판매신고: 제2024-수원팔달-0584호</p>
              </div>
            </div>

            {/* 바로가기 */}
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                🔗 바로가기
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={handleLoginClick}
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                    fontSize: '0.875rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
                >
                  로그인
                </button>
                <a href="#features" style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                   onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                  주요 기능
                </a>
                <a href="#pricing" style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                   onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                  요금 안내
                </a>
                <a href="#how-it-works" style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                   onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                  사용자 가이드
                </a>
              </div>
            </div>

            {/* 고객 지원 */}
            <div id="support">
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                🎧 고객 지원
              </h4>
              <div style={{ marginBottom: '0.75rem' }}>
                <button
                  onClick={() => onNavigate && onNavigate('support')}
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                    fontSize: '0.875rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
                >
                  고객지원 센터 바로가기
                </button>
              </div>
              <div style={{
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <a 
                    href="mailto:aebon@naver.com"
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
                  >
                    📧 aebon@naver.com
                  </a>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <a 
                    href="tel:010-3700-0629"
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
                  >
                    📞 010-3700-0629
                  </a>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    (평일: 09:00 ~ 18:00)
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>💬 카카오톡 상담</span>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    ID: aebon
                  </div>
                </div>
              </div>
            </div>

            {/* 정보 및 링크 */}
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                📚 정보
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a 
                  href="https://github.com/aebonlee/ahp_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
                >
                  GitHub 저장소
                </a>
                <button
                  onClick={() => onNavigate && onNavigate('news')}
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                    fontSize: '0.875rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
                >
                  소식 및 사례
                </button>
                <a href="#features" style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'color 0.3s ease'
                }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                   onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                  기술 문서
                </a>
              </div>
            </div>
          </div>

          {/* 법적 정보 및 링크 */}
          <div style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: isMobile ? '0.5rem' : '2rem',
              marginBottom: '1.5rem'
            }}>
              <a 
                href="/terms"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
              >
                이용약관
              </a>
              <a 
                href="/privacy"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
              >
                개인정보처리방침
              </a>
              <a 
                href="/refund"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
              >
                환불정책
              </a>
            </div>
          </div>

          {/* 최하단 저작권 정보 */}
          <div style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: 0,
                fontWeight: '500'
              }}>
                © 2024 AHP for Paper. All rights reserved.
              </p>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                margin: 0,
                lineHeight: '1.5'
              }}>
                이 웹사이트의 모든 콘텐츠는 저작권법의 보호를 받습니다.
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: 0
              }}>
                Last updated: 2024.08.31
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 40,
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'translateY(0)' : 'translateY(1rem)',
          pointerEvents: showScrollTop ? 'auto' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="상단으로 스크롤"
      >
        <svg style={{
          width: '1.5rem',
          height: '1.5rem'
        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default HomePage;