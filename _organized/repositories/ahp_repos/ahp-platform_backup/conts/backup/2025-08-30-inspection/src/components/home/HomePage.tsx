import React, { useState, useEffect } from 'react';
import ThemeModeToggle from '../common/ThemeModeToggle';
import ColorThemeButton from '../common/ColorThemeButton';
import ParticleBackground from '../common/ParticleBackground';
import PricingSection from './PricingSection';

interface HomePageProps {
  onLoginClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

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
              <a href="#features" className="transition-colors" style={{
                color: 'var(--text-secondary)'
              }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                 onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                주요 기능
              </a>
              <a href="#how-it-works" className="transition-colors" style={{
                color: 'var(--text-secondary)'
              }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                 onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                이용 방법
              </a>
              <a href="#pricing" className="transition-colors" style={{
                color: 'var(--text-secondary)'
              }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                 onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                요금제
              </a>
              <a href="#research" className="transition-colors" style={{
                color: 'var(--text-secondary)'
              }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-primary)'}
                 onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>
                연구 사례
              </a>
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
              <a href="#features" className="block py-2" style={{ color: 'var(--text-secondary)' }}>주요 기능</a>
              <a href="#how-it-works" className="block py-2" style={{ color: 'var(--text-secondary)' }}>이용 방법</a>
              <a href="#pricing" className="block py-2" style={{ color: 'var(--text-secondary)' }}>요금제</a>
              <a href="#research" className="block py-2" style={{ color: 'var(--text-secondary)' }}>연구 사례</a>
              
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

      {/* 히어로 섹션 - Particles.js 배경 */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Particles.js 배경 */}
        <ParticleBackground 
          className="absolute inset-0"
          theme={currentTheme}
          intensity="medium"
          interactive={true}
        />
        
        {/* 배경 그라디언트 - 더 투명하게 조정 */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to bottom right, var(--bg-subtle)60, var(--bg-primary)40, var(--bg-elevated)60)`
        }}></div>
        
        {/* 애니메이션 도형들 - 투명도 낮춤 */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{
          backgroundColor: 'var(--accent-primary)'
        }}></div>
        <div className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-8 animate-pulse" style={{
          backgroundColor: 'var(--accent-secondary)',
          animationDelay: '2s'
        }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse" style={{
          backgroundColor: 'var(--accent-light)',
          animationDelay: '4s'
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            {/* 배지 */}
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6" style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-primary)'
            }}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              논문 작성을 위한 전문 분석 도구
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
              복잡한 의사결정을
              <br />
              <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{
                backgroundImage: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))'
              }}>
                체계적으로 분석하세요
              </span>
            </h1>

            {/* 서브 타이틀 */}
            <p className="text-xl mb-10 max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              AHP(Analytic Hierarchy Process) 방법론을 활용하여
              연구의 신뢰성을 높이고 명확한 결론을 도출하세요
            </p>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onLoginClick}
                className="px-8 py-4 text-white rounded-xl transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
                style={{ backgroundColor: 'var(--accent-primary)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)'}
              >
                연구 시작하기
                <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                className="px-8 py-4 rounded-xl transition-all font-semibold text-lg border-2"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-medium)'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'}
              >
                가이드 보기
                <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>

            {/* 신뢰 지표 */}
            <div className="mt-12 flex flex-wrap justify-center gap-8" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--accent-primary)' }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>검증된 방법론</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--accent-primary)' }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>실시간 분석</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--accent-primary)' }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>전문가 지원</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section id="features" className="py-20" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              연구에 필요한 모든 기능
            </h2>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              복잡한 의사결정 문제를 체계적으로 해결하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 기능 카드 1 */}
            <div className="rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border" style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{
                backgroundColor: 'var(--accent-light)'
              }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                  color: 'var(--accent-primary)'
                }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>체계적 계층 구조</h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                목표, 기준, 대안을 체계적으로 구조화하여 복잡한 문제를 명확하게 정리합니다
              </p>
            </div>

            {/* 기능 카드 2 */}
            <div className="rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border" style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{
                backgroundColor: 'var(--accent-light)'
              }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                  color: 'var(--accent-primary)'
                }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>정량적 분석</h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                쌍대비교를 통해 주관적 판단을 객관적 수치로 변환하고 일관성을 검증합니다
              </p>
            </div>

            {/* 기능 카드 3 */}
            <div className="rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border" style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{
                backgroundColor: 'var(--accent-light)'
              }}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                  color: 'var(--accent-primary)'
                }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>협업 연구</h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                여러 전문가의 의견을 수집하고 통합하여 집단 의사결정을 지원합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 사용 방법 섹션 */}
      <section id="how-it-works" className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              간단한 3단계 프로세스
            </h2>
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              가이드를 따라 쉽게 연구를 진행하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 단계 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4" style={{
                  backgroundColor: 'var(--accent-primary)'
                }}>
                  1
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>계층 구조 설계</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  연구 목표와 평가 기준, 대안을 체계적으로 구성합니다
                </p>
              </div>
              {/* 연결선 */}
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5" style={{ backgroundColor: 'var(--border-medium)' }}></div>
            </div>

            {/* 단계 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4" style={{
                  backgroundColor: 'var(--accent-primary)'
                }}>
                  2
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>쌍대 비교</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  각 요소들을 1:1로 비교하여 상대적 중요도를 평가합니다
                </p>
              </div>
              {/* 연결선 */}
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5" style={{ backgroundColor: 'var(--border-medium)' }}></div>
            </div>

            {/* 단계 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4" style={{
                  backgroundColor: 'var(--accent-primary)'
                }}>
                  3
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>결과 분석</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  우선순위와 일관성 비율을 확인하고 최적 대안을 도출합니다
                </p>
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
            onClick={onLoginClick}
            className="px-10 py-4 text-white rounded-xl transition-all transform hover:scale-105 font-semibold text-lg shadow-xl"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-primary)'}
          >
            14일 무료 체험 시작
          </button>
        </div>
      </section>


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