import React, { useState, useEffect } from 'react';
import ThemeModeToggle from '../common/ThemeModeToggle';
import ColorThemeButton from '../common/ColorThemeButton';
import ParticleBackground from '../common/ParticleBackground';
import PricingSection from './PricingSection';
import SupportPage from '../support/SupportPage';
import NewsPage from '../support/NewsPage';

interface HomePageProps {
  onLoginClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSupportPage, setShowSupportPage] = useState(false);
  const [showNewsPage, setShowNewsPage] = useState(false);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setShowScrollTop(currentScrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 마우스 이동 효과
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 애니메이션 효과 비활성화 (안정성 확보)

  // 테마 변경 감지
  useEffect(() => {
    const detectTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setCurrentTheme(theme === 'dark' || (!theme && systemPrefersDark) ? 'dark' : 'light');
    };

    // 초기 테마 설정
    detectTheme();

    // 테마 변경 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          detectTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => detectTheme();
    mediaQuery.addListener(handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeListener(handleMediaChange);
    };
  }, []);

  // 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 부드러운 스크롤 함수
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 고객지원 페이지 표시
  if (showSupportPage) {
    return <SupportPage onBackClick={() => setShowSupportPage(false)} />;
  }

  // 뉴스 페이지 표시
  if (showNewsPage) {
    return <NewsPage onBackClick={() => setShowNewsPage(false)} />;
  }

  return (
    <div className="min-h-screen" style={{
      backgroundColor: 'var(--bg-primary, #ffffff)',
      color: 'var(--text-primary, #1f2937)'
    }}>
      {/* 헤더 - 잔디 스타일 */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 10 ? 'backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`} style={{
        backgroundColor: scrollY > 10 ? 'var(--bg-primary)95' : 'transparent'
      }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{
                backgroundImage: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))'
              }}>
                AHP for Paper
              </h1>
            </div>

            {/* 네비게이션 - 데스크톱 */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="transition-colors" 
                style={{
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }} 
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
              >
                기능 및 이용방법
              </button>
              <button 
                onClick={() => scrollToSection('guide')}
                className="transition-colors" 
                style={{
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }} 
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
              >
                사용 가이드
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="transition-colors" 
                style={{
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }} 
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
              >
                요금제
              </button>
              <button 
                onClick={() => setShowNewsPage(true)}
                className="transition-colors" 
                style={{
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }} 
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
              >
                소식 및 사례
              </button>
              <button 
                onClick={() => setShowSupportPage(true)}
                className="transition-colors" 
                style={{
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }} 
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
              >
                고객지원
              </button>
            </nav>

            {/* CTA 버튼들 및 테마 컨트롤 */}
            <div className="hidden md:flex items-center gap-4">
              {/* 테마 컨트롤 */}
              <div className="flex items-center gap-2">
                <ThemeModeToggle />
                <ColorThemeButton />
              </div>
              
              <div className="w-px h-6" style={{ backgroundColor: 'var(--border-light)' }}></div>
              
              <button
                onClick={onLoginClick}
                className="px-5 py-2 transition-colors font-medium"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'}
              >
                로그인
              </button>
              <button
                onClick={onLoginClick}
                className="px-6 py-2.5 text-white rounded-lg transition-all transform hover:scale-105 font-medium shadow-sm"
                style={{ backgroundColor: 'var(--accent-primary)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)'}
              >
                시작하기
              </button>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden border-t" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="px-6 py-4 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block py-2 w-full text-left" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none' }}>기능 및 이용방법</button>
              <button onClick={() => scrollToSection('guide')} className="block py-2 w-full text-left" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none' }}>사용 가이드</button>
              <button onClick={() => scrollToSection('pricing')} className="block py-2 w-full text-left" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none' }}>요금제</button>
              <button onClick={() => { setShowNewsPage(true); setIsMenuOpen(false); }} className="block py-2 w-full text-left" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none' }}>소식 및 사례</button>
              <button onClick={() => { setShowSupportPage(true); setIsMenuOpen(false); }} className="block py-2 w-full text-left" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none' }}>고객지원</button>
              
              {/* 모바일 테마 컨트롤 */}
              <div className="flex items-center gap-3 py-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>테마:</span>
                <ThemeModeToggle />
                <ColorThemeButton />
              </div>
              
              <button 
                onClick={onLoginClick} 
                className="w-full py-3 mt-4 text-white rounded-lg"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                시작하기
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 히어로 섹션 - 풀스크린 세련된 디자인 */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
        background: `linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-subtle) 50%, var(--bg-secondary) 100%)`
      }}>
        {/* 동적 배경 효과 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 마우스 따라가는 그라디언트 */}
          <div 
            className="absolute w-96 h-96 rounded-full opacity-20 transition-all duration-1000 ease-out"
            style={{
              background: `radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)`,
              left: `${mousePosition.x - 192}px`,
              top: `${mousePosition.y - 192}px`,
              filter: 'blur(40px)'
            }}
          ></div>
        </div>
        
        {/* 플로팅 기하학적 요소들 - 실시간 JavaScript 애니메이션 */}
        <div 
          className="absolute floating-element" 
          style={{
            top: '15%',
            left: '10%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))`,
            opacity: 0.1
          }}
        ></div>
        <div 
          className="absolute floating-element" 
          style={{
            top: '25%',
            right: '15%',
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            background: `linear-gradient(45deg, var(--accent-light), var(--accent-secondary))`,
            opacity: 0.15
          }}
        ></div>
        <div 
          className="absolute floating-element" 
          style={{
            bottom: '30%',
            left: '15%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `linear-gradient(45deg, var(--accent-light), var(--accent-primary))`,
            opacity: 0.1
          }}
        ></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="space-y-8">
            {/* 세련된 배지 */}
            <div className="inline-flex items-center px-6 py-2 text-sm font-semibold rounded-full backdrop-blur-sm border" style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--accent-primary)',
              borderColor: 'var(--border-light)'
            }}>
              <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: 'var(--accent-primary)' }}></span>
              AHP 전문 연구 분석 플랫폼
            </div>

            {/* 메인 타이틀 - 적당한 크기와 세련된 타이포그래피 */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{ 
              color: 'var(--text-primary)',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              논문 연구를 위한
              <br />
              <span style={{ color: 'var(--accent-primary)' }}>
                AHP 분석 도구
              </span>
            </h1>

            {/* 세련된 서브 타이틀 */}
            <p className="text-xl md:text-2xl font-light max-w-4xl mx-auto" style={{ 
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '3rem'
            }}>
              체계적인 의사결정 분석으로 연구의 신뢰성을 높이고
              <br className="hidden md:block" />
              논문에 바로 활용할 수 있는 결과를 얻으세요
            </p>

            {/* 세련된 CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button
                onClick={onLoginClick}
                className="group px-12 py-4 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-2xl"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  boxShadow: '0 10px 25px rgba(var(--accent-primary-rgb), 0.3)'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)'}
              >
                <span className="flex items-center justify-center">
                  연구 시작하기
                  <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button
                className="px-12 py-4 rounded-xl font-semibold text-lg border-2 transition-all transform hover:scale-105 backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-medium)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                }}
              >
                사용 가이드
              </button>
            </div>

            {/* 신뢰도 지표 - 2개만 */}
            <div className="grid grid-cols-2 gap-16 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-4xl font-black mb-2" style={{ 
                  color: 'var(--accent-primary)'
                }}>1,000+</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>논문 활용</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black mb-2" style={{ 
                  color: 'var(--accent-primary)'
                }}>98%</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>연구자 만족도</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CSS 애니메이션 정의 */}
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }
        `}</style>
      </section>

      {/* 주요 기능 섹션 - AURI 스타일 그리드 */}
      <section id="features" className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
              color: '#222',
              fontWeight: '700'
            }}>
              주요 기능
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666' }}>
              연구에 필요한 모든 도구를 하나의 플랫폼에서 제공합니다
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* 기능 아이템 1 - AURI 스타일 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#e3f2fd'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#0066cc" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>계층 구조 설계</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                  목표-기준-대안의 체계적 구조화
                </p>
              </div>

              {/* 기능 아이템 2 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#e8f5e8'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#22c55e" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>쌍대 비교 분석</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                  1:1 비교를 통한 정량적 평가
                </p>
              </div>

              {/* 기능 아이템 3 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#fef3e2'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>결과 시각화</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                  차트와 표로 명확한 결과 제시
                </p>
              </div>

              {/* 기능 아이템 4 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#f3e8ff'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>협업 연구</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                  다중 평가자 의견 수집 및 통합
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 이용 방법 섹션 - AURI 스타일 심플 */}
      <section id="how-it-works" className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
              color: 'var(--text-primary)',
              fontWeight: '700'
            }}>
              이용 방법
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              3단계 간단한 프로세스로 전문적인 AHP 분석을 완성하세요
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              
              {/* 단계 1 - AURI 스타일 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto" style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)'
                }}>
                  1
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  계층 구조 설계
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  연구 목표와 평가 기준, 대안을 체계적으로 구성합니다
                </p>
              </div>

              {/* 단계 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto" style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)'
                }}>
                  2
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  쌍대 비교
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  각 요소들을 1:1로 비교하여 상대적 중요도를 평가합니다
                </p>
              </div>

              {/* 단계 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto" style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)'
                }}>
                  3
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  결과 분석
                </h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  우선순위와 일관성 비율을 확인하고 최적 대안을 도출합니다
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 사용 가이드 섹션 - AURI 스타일 */}
      <section id="guide" className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
              color: '#222',
              fontWeight: '700'
            }}>
              사용 가이드
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666' }}>
              수준별 맞춤 가이드로 AHP 분석을 완벽하게 마스터하세요
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              
              {/* 초보자 가이드 - AURI 스타일 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#e3f2fd'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#0066cc" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-bold mb-3" style={{ color: '#222' }}>초보자 가이드</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: '#666' }}>
                  AHP 기초부터 첫 프로젝트 완성까지
                </p>
                <div className="text-xs space-y-1" style={{ color: '#888' }}>
                  <div>→ AHP 방법론 이해</div>
                  <div>→ 프로젝트 생성</div>
                  <div>→ 기준과 대안 설정</div>
                  <div>→ 쌍대비교 수행</div>
                  <div>→ 결과 해석</div>
                </div>
              </div>

              {/* 실무 가이드 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#e8f5e8'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#22c55e" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-3" style={{ color: '#222' }}>실무 활용 가이드</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: '#666' }}>
                  연구 프로젝트 고급 기능 활용법
                </p>
                <div className="text-xs space-y-1" style={{ color: '#888' }}>
                  <div>→ 다중 평가자 관리</div>
                  <div>→ 복잡한 계층구조</div>
                  <div>→ 일관성 향상 기법</div>
                  <div>→ 민감도 분석</div>
                  <div>→ 보고서 작성</div>
                </div>
              </div>

              {/* 논문 가이드 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#fef3e2'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-3" style={{ color: '#222' }}>논문 작성 가이드</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: '#666' }}>
                  학술 논문에서의 AHP 활용법
                </p>
                <div className="text-xs space-y-1" style={{ color: '#888' }}>
                  <div>→ 연구방법론 서술</div>
                  <div>→ 일관성 비율 보고</div>
                  <div>→ 표와 그래프 작성</div>
                  <div>→ 결과 해석 방법</div>
                  <div>→ 참고문헌 인용</div>
                </div>
              </div>

            </div>

            {/* 역할별 서비스 이용 버튼 */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-8" style={{ color: '#222' }}>
                역할에 맞는 서비스 이용하기
              </h3>
              <div className="flex flex-col md:flex-row gap-6 justify-center max-w-2xl mx-auto">
                
                {/* 연구자 모드 버튼 */}
                <button
                  onClick={onLoginClick}
                  className="flex-1 bg-white rounded-xl p-8 border-2 hover:shadow-lg transition-all transform hover:scale-105"
                  style={{ borderColor: 'var(--accent-primary)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                    backgroundColor: 'var(--accent-light)'
                  }}>
                    <svg className="w-8 h-8" fill="none" stroke="var(--accent-primary)" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-3">연구자 모드</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    프로젝트 생성, 기준 설정, 평가자 관리 등 연구 전체를 책임지는 관리자 역할
                  </p>
                </button>

                {/* 평가자 모드 버튼 */}
                <button
                  onClick={onLoginClick}
                  className="flex-1 bg-white rounded-xl p-8 border-2 hover:shadow-lg transition-all transform hover:scale-105"
                  style={{ borderColor: 'var(--accent-secondary)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-secondary)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                    backgroundColor: 'var(--secondary-light, #e8f5e8)'
                  }}>
                    <svg className="w-8 h-8" fill="none" stroke="var(--accent-secondary)" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-3">평가자 모드</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    배정받은 프로젝트의 쌍대비교를 수행하고 평가 데이터를 제공하는 역할
                  </p>
                </button>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AHP NEWS 섹션 - AURI 스타일 */}
      <section id="news" className="py-20" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
              color: 'var(--text-primary)',
              fontWeight: '700'
            }}>
              AHP NEWS
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              최신 연구 동향과 플랫폼 업데이트 소식을 확인하세요
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              
              {/* 뉴스 아이템 1 */}
              <div className="group bg-white rounded-lg p-6 border transition-all hover:shadow-md hover:border-blue-200" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full mr-3" style={{
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent-primary)'
                      }}>
                        플랫폼 업데이트
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>2024.08.31</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      AURI 스타일 UI/UX 개편 완료 - 더욱 직관적인 사용자 경험 제공
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      사용자 피드백을 반영하여 전면적인 디자인 개선을 완료했습니다. 미니멀하고 깔끔한 인터페이스로 연구 효율성을 높였습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 뉴스 아이템 2 */}
              <div className="group bg-white rounded-lg p-6 border transition-all hover:shadow-md hover:border-blue-200" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full mr-3" style={{
                        backgroundColor: '#e8f5e8',
                        color: '#22c55e'
                      }}>
                        연구 성과
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>2024.08.25</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      국내 주요 대학 1,000+ 논문에서 AHP 분석 도구 활용 검증
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      서울대, 연세대, 고려대 등 주요 대학의 논문 연구에서 우리 플랫폼을 활용한 AHP 분석 결과가 높은 신뢰도를 보였습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 뉴스 아이템 3 */}
              <div className="group bg-white rounded-lg p-6 border transition-all hover:shadow-md hover:border-blue-200" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full mr-3" style={{
                        backgroundColor: '#fef3e2',
                        color: '#f59e0b'
                      }}>
                        기능 개선
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>2024.08.20</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      다중 평가자 협업 기능 강화 - 실시간 동기화 및 진행률 추적
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      여러 연구자가 동시에 작업할 수 있는 협업 환경을 개선하고, 실시간 진행률 추적 기능을 추가했습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 뉴스 아이템 4 */}
              <div className="group bg-white rounded-lg p-6 border transition-all hover:shadow-md hover:border-blue-200" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full mr-3" style={{
                        backgroundColor: '#f3e8ff',
                        color: '#8b5cf6'
                      }}>
                        연구 논문
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>2024.08.15</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      AHP 방법론의 신뢰성 향상을 위한 일관성 검증 알고리즘 개발
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      더욱 정확한 의사결정을 위한 새로운 일관성 검증 알고리즘을 개발하여 연구의 신뢰성을 한층 높였습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 뉴스 아이템 5 */}
              <div className="group bg-white rounded-lg p-6 border transition-all hover:shadow-md hover:border-blue-200" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full mr-3" style={{
                        backgroundColor: '#ecfdf5',
                        color: '#10b981'
                      }}>
                        파트너십
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>2024.08.10</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      한국연구재단과의 연구 지원 프로그램 협약 체결
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      국가 R&D 과제에서 AHP 분석 도구 활용을 지원하는 공식 파트너십을 체결했습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 뉴스 아이템 6 */}
              <div className="group bg-white rounded-lg p-6 border transition-all hover:shadow-md hover:border-blue-200" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full mr-3" style={{
                        backgroundColor: '#fef2f2',
                        color: '#ef4444'
                      }}>
                        보안 강화
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>2024.08.05</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      데이터 보안 및 개인정보 보호 시스템 강화 완료
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      연구 데이터의 안전한 보관과 개인정보 보호를 위한 보안 시스템을 한층 강화했습니다.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* 더보기 버튼 */}
            <div className="text-center mt-12">
              <button 
                onClick={() => setShowNewsPage(true)}
                className="px-8 py-3 rounded-lg border-2 font-medium transition-all hover:scale-105" style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-medium)'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-inverse)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)';
              }}>
                더 많은 소식 보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 연구 사례 섹션 - AURI 스타일 */}
      <section id="research" className="py-20" style={{ backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ 
              color: '#222',
              fontWeight: '700'
            }}>
              연구 사례
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#666' }}>
              다양한 분야에서 검증된 AHP 분석 성공 사례를 확인하세요
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* 사례 1 - 경영전략 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#e3f2fd'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#0066cc" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>경영전략 우선순위</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#666' }}>
                  신규 사업 진출 전략의 우선순위 결정
                </p>
                <div className="text-xs p-2 rounded" style={{ 
                  backgroundColor: '#f8f9fa',
                  color: '#888'
                }}>
                  기준 3개 • 대안 5개 • 평가자 7명
                </div>
              </div>

              {/* 사례 2 - IT 도구 선택 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#e8f5e8'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#22c55e" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>개발 도구 선택</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#666' }}>
                  프로젝트 최적 개발 프레임워크 선정
                </p>
                <div className="text-xs p-2 rounded" style={{ 
                  backgroundColor: '#f8f9fa',
                  color: '#888'
                }}>
                  기준 4개 • 대안 7개 • 개발팀 5명
                </div>
              </div>

              {/* 사례 3 - 의료정책 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#fef3e2'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>의료서비스 투자</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#666' }}>
                  병원 진료과별 투자 우선순위 결정
                </p>
                <div className="text-xs p-2 rounded" style={{ 
                  backgroundColor: '#f8f9fa',
                  color: '#888'
                }}>
                  기준 3개 • 대안 6개 • 전문의 12명
                </div>
              </div>

              {/* 사례 4 - 교육정책 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#f3e8ff'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>교육과정 개선</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#666' }}>
                  대학 교육과정 개선방안 우선순위
                </p>
                <div className="text-xs p-2 rounded" style={{ 
                  backgroundColor: '#f8f9fa',
                  color: '#888'
                }}>
                  기준 4개 • 대안 8개 • 교수진 15명
                </div>
              </div>

              {/* 사례 5 - 환경정책 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#ecfdf5'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#10b981" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>환경정책 평가</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#666' }}>
                  지자체 환경정책 투자 우선순위
                </p>
                <div className="text-xs p-2 rounded" style={{ 
                  backgroundColor: '#f8f9fa',
                  color: '#888'
                }}>
                  기준 3개 • 대안 9개 • 공무원 8명
                </div>
              </div>

              {/* 사례 6 - 사회복지 */}
              <div className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{
                  backgroundColor: '#fdf2f8'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#ec4899" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#222' }}>사회복지 정책</h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#666' }}>
                  복지서비스 개선방안 우선순위
                </p>
                <div className="text-xs p-2 rounded" style={{ 
                  backgroundColor: '#f8f9fa',
                  color: '#888'
                }}>
                  기준 4개 • 대안 7개 • 전문가 10명
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 요금제 섹션 */}
      <PricingSection onLoginClick={onLoginClick} />

      {/* CTA 섹션 */}
      <section className="py-20" style={{
        background: `linear-gradient(to right, var(--accent-primary), var(--accent-secondary))`
      }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            지금 바로 연구를 시작하세요
          </h2>
          <p className="text-xl mb-8" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            전문적인 AHP 분석으로 연구의 품질을 높이세요
          </p>
          <button
            onClick={() => scrollToSection('guide')}
            className="px-10 py-4 text-white rounded-xl transition-all transform hover:scale-105 font-semibold text-lg shadow-xl"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'}
          >
            가이드 안내
          </button>
        </div>
      </section>


      {/* Footer - AURI 스타일 */}
      <footer className="border-t py-12" style={{ 
        backgroundColor: '#f8f9fa',
        borderColor: '#e5e7eb'
      }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* 회사 정보 */}
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{
                  backgroundColor: '#0066cc'
                }}>
                  <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <span className="text-lg font-bold" style={{ color: '#222' }}>
                  AHP for Paper
                </span>
              </div>
              <p className="text-sm mb-2" style={{ color: '#666' }}>
                한국직업능력개발센터
              </p>
              <p className="text-sm mb-2" style={{ color: '#666' }}>
                사업자등록번호: 601-45-20154
              </p>
              <p className="text-sm mb-2" style={{ color: '#666' }}>
                경기도 수원시 팔달구 매산로 45, 419호
              </p>
              <p className="text-sm" style={{ color: '#666' }}>
                대표이사: 이애본 | 통신판매신고: 제2024-수원팔달-0584호
              </p>
            </div>

            {/* 저작권 및 연락처 */}
            <div className="text-right">
              <div className="mb-4">
                <p className="text-sm mb-1" style={{ color: '#666' }}>
                  고객지원: aebon@naver.com
                </p>
                <p className="text-sm mb-1" style={{ color: '#666' }}>
                  전화: 010-3700-0629 (평일: 09:00 ~ 18:00)
                </p>
                <p className="text-sm" style={{ color: '#666' }}>
                  카카오톡 상담 - ID: aebon
                </p>
              </div>
              <div className="text-sm" style={{ color: '#888' }}>
                <p>© 2024 AHP for Paper. All rights reserved.</p>
                <p className="mt-1">
                  이 웹사이트의 모든 콘텐츠는 저작권법의 보호를 받습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 하단 구분선 및 간단 링크 */}
          <div className="border-t mt-8 pt-6" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mb-4 md:mb-0">
                <button className="text-sm transition-colors" style={{ 
                  color: '#666',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#0066cc'}
                   onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#666'}>
                  이용약관
                </button>
                <button className="text-sm transition-colors" style={{ 
                  color: '#666',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#0066cc'}
                   onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#666'}>
                  개인정보처리방침
                </button>
                <button className="text-sm transition-colors" style={{ 
                  color: '#666',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }} onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#0066cc'}
                   onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#666'}>
                  환불정책
                </button>
              </div>
              <div className="text-xs" style={{ color: '#999' }}>
                Last updated: 2024.08.31
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--text-inverse)',
        }}
        aria-label="상단으로 스크롤"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default HomePage;