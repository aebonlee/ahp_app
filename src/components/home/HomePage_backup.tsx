import React, { useState, useEffect, useRef } from 'react';
import ExampleGuide from './ExampleGuide';
import ThemeModeToggle from '../common/ThemeModeToggle';
import ColorThemeButton from '../common/ColorThemeButton';

interface HomePageProps {
  onLoginClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  const [activeView, setActiveView] = useState<'intro' | 'guide' | 'example'>('intro');
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

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

  // 동적 배경 파티클 애니메이션
  useEffect(() => {
    const particles = particlesRef.current;
    if (!particles) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full opacity-20 animate-pulse';
      particle.style.width = Math.random() * 6 + 2 + 'px';
      particle.style.height = particle.style.width;
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.backgroundColor = 'var(--accent-primary)';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      particle.style.animationDelay = Math.random() * 2 + 's';
      
      particles.appendChild(particle);
      
      // 10초 후 제거
      setTimeout(() => {
        if (particles.contains(particle)) {
          particles.removeChild(particle);
        }
      }, 10000);
    };

    // 초기 파티클 생성
    for (let i = 0; i < 15; i++) {
      setTimeout(createParticle, i * 200);
    }

    // 3초마다 새 파티클 추가
    const intervalId = setInterval(createParticle, 3000);

    return () => {
      clearInterval(intervalId);
      if (particles) {
        particles.innerHTML = '';
      }
    };
  }, []);

  // 상단으로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 패럴랙스 효과를 위한 인라인 스타일
  const parallaxStyle = {
    transform: `translateY(${scrollY * 0.5}px)`,
    transition: 'transform 0.1s ease-out'
  };

  return (
    <div className="min-h-screen" style={{
      backgroundColor: 'var(--bg-primary, #ffffff)',
      color: 'var(--text-primary, #1f2937)'
    }}>
      {/* Theme Controls */}
      <div className="fixed top-4 right-4 z-40 flex gap-3">
        <ThemeModeToggle />
        <ColorThemeButton />
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--text-inverse)',
          border: 'none'
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
        aria-label="상단으로 스크롤"
        title="상단으로 이동"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
      {/* 히어로 섹션 - 동적 배경 효과 */}
      <div ref={heroRef} className="relative overflow-hidden" 
           style={{
             background: 'linear-gradient(to bottom, var(--bg-elevated), var(--bg-primary), var(--bg-primary))',
             minHeight: '100vh'
           }}>
        {/* 동적 파티클 배경 */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none" style={parallaxStyle}>
          {/* 파티클들이 자바스크립트로 동적 생성됨 */}
        </div>

        {/* 움직이는 기하학적 도형들 */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              backgroundColor: 'var(--accent-primary)',
              top: '10%',
              left: '10%',
              transform: `translateY(${scrollY * 0.3}px)`,
              animationDuration: '4s'
            }}
          ></div>
          <div 
            className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse"
            style={{
              backgroundColor: 'var(--accent-secondary)',
              top: '30%',
              right: '15%',
              transform: `translateY(${-scrollY * 0.2}px)`,
              animationDuration: '6s',
              animationDelay: '1s'
            }}
          ></div>
          <div 
            className="absolute w-64 h-64 rounded-full blur-2xl opacity-25"
            style={{
              backgroundColor: 'var(--accent-light)',
              bottom: '20%',
              left: '20%',
              transform: `translateY(${scrollY * 0.4}px) rotate(${scrollY * 0.1}deg)`,
              animation: 'float 8s ease-in-out infinite'
            }}
          ></div>
        </div>

        {/* 서브틀한 패턴 배경 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--border-light) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: `translateX(${scrollY * 0.1}px)`
          }}></div>
        </div>

        <div className="relative z-10 px-4 py-16 sm:py-20 lg:py-24 flex items-center min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* 상단 배지 */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                   style={{
                     backgroundColor: 'var(--accent-light, #86efac)',
                     color: 'var(--accent-primary, #10b981)'
                   }}>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                논문 작성을 위한 전문 AHP 분석 도구
              </div>
            </div>
            
            {/* 메인 헤더 - 동적 애니메이션 효과 */}
            <div className="text-center mb-12"
                 style={{
                   transform: `translateY(${scrollY * 0.1}px)`,
                   transition: 'transform 0.1s ease-out'
                 }}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up"
                  style={{ 
                    color: 'var(--text-primary)',
                    animation: 'fadeInUp 1s ease-out'
                  }}>
                복잡한 의사결정을
                <span className="block" 
                      style={{ 
                        color: 'var(--accent-primary, #10b981)',
                        animation: 'fadeInUp 1s ease-out 0.3s both'
                      }}>체계적으로 분석하세요</span>
              </h1>
              
              <p className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed"
                 style={{ 
                   color: 'var(--text-secondary)',
                   animation: 'fadeInUp 1s ease-out 0.6s both'
                 }}>
                AHP(Analytic Hierarchy Process) 방법론을 활용한
                <br className="hidden sm:block" />
                과학적 의사결정 지원 플랫폼
              </p>
            </div>

            {/* CTA 버튼들 - 동적 애니메이션 효과 */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
                 style={{
                   animation: 'fadeInUp 1s ease-out 0.9s both'
                 }}>
              <button 
                onClick={onLoginClick}
                className="text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl inline-flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--accent-primary, #10b981)'
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover, #047857)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary, #10b981)'}
              >
                연구용 서비스 이용
                <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button
                onClick={() => setActiveView('guide')}
                className="border-2 shadow-sm hover:shadow-md transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl inline-flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-medium)'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary, #10b981)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary, #10b981)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                }}
              >
                <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                사용 가이드 보기
              </button>
            </div>

            {/* 네비게이션 탭 - 심플한 디자인 */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg p-1" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <button
                  onClick={() => setActiveView('intro')}
                  className="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: activeView === 'intro' ? 'var(--bg-secondary)' : 'transparent',
                    boxShadow: activeView === 'intro' ? 'var(--shadow-sm)' : 'none',
                    color: activeView === 'intro' ? 'var(--accent-primary, #10b981)' : 'var(--text-muted)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeView !== 'intro') {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary, #10b981)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeView !== 'intro') {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  서비스 소개
                </button>
                <button
                  onClick={() => setActiveView('guide')}
                  className="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: activeView === 'guide' ? 'var(--bg-secondary)' : 'transparent',
                    boxShadow: activeView === 'guide' ? 'var(--shadow-sm)' : 'none',
                    color: activeView === 'guide' ? 'var(--accent-primary, #10b981)' : 'var(--text-muted)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeView !== 'guide') {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary, #10b981)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeView !== 'guide') {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  이용 가이드
                </button>
                <button
                  onClick={() => setActiveView('example')}
                  className="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: activeView === 'example' ? 'var(--bg-secondary)' : 'transparent',
                    boxShadow: activeView === 'example' ? 'var(--shadow-sm)' : 'none',
                    color: activeView === 'example' ? 'var(--accent-primary, #10b981)' : 'var(--text-muted)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeView !== 'example') {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary, #10b981)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeView !== 'example') {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  분석 예시
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 주요 특징 섹션 - 깔끔한 카드 디자인 */}
      <div className="py-16" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              왜 AHP for Paper를 선택해야 할까요?
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              연구자와 의사결정자를 위한 최적화된 기능
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
                 style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>가이드 학습</h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                AHP 방법론과 활용법을 단계별로 학습할 수 있습니다. 연구 방법 이해부터 시작하세요.
              </p>
            </div>
            
            <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
                 style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>실제 연구 적용</h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                학습한 내용을 실제 연구 프로젝트에 적용하여 신뢰성 있는 결과를 도출할 수 있습니다.
              </p>
            </div>
            
            <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
                 style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>전문성 확보</h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                학술 연구에 필요한 엄격한 방법론과 검증된 알고리즘을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 섹션 */}
      {activeView === 'example' ? (
        <div style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                실제 분석 예시 - AI 개발 도구 비교
              </h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                AI 개발 도구 선택을 위한 AHP 분석 과정을 단계별로 살펴보세요
              </p>
            </div>
          </div>
          <ExampleGuide />
        </div>
      ) : activeView === 'guide' ? (
        <div style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-6xl mx-auto px-4 py-16">
            {/* 서비스 이용 가이드 */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                서비스 이용 가이드
              </h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                AHP for Paper를 처음 사용하시는 분들을 위한 단계별 가이드
              </p>
            </div>

            {/* 이용 단계 가이드 - 깔끔한 카드 스타일 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              <div className="relative rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>회원가입 & 로그인</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    이메일로 간편 회원가입
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    관리자/평가자 권한 설정
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    연구 전용 계정 제공
                  </li>
                </ul>
              </div>

              <div className="relative rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="absolute -top-4 left-8 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>프로젝트 생성</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    의사결정 목표 정의
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    평가 기준 설정
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    대안 항목 입력
                  </li>
                </ul>
              </div>

              <div className="relative rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="absolute -top-4 left-8 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>평가 수행</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">•</span>
                    쌍대비교 평가 진행
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">•</span>
                    일관성 검증 확인
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">•</span>
                    평가자 협업 관리
                  </li>
                </ul>
              </div>

              <div className="relative rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="absolute -top-4 left-8 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v7m3-2h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>결과 분석</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-1">•</span>
                    우선순위 결과 확인
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-1">•</span>
                    민감도 분석 수행
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-1">•</span>
                    보고서 내보내기
                  </li>
                </ul>
              </div>
            </div>

            {/* 주요 기능 소개 - 깔끔한 그리드 */}
            <div className="rounded-3xl p-12 mb-12" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>주요 기능</h3>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>전문적인 의사결정 지원을 위한 핵심 기능들</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>쌍대비교 평가</h4>
                  </div>
                  <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>두 요소를 직접 비교하여 중요도를 평가하는 AHP의 핵심 방법론</p>
                  <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>9점 척도 평가 시스템</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>실시간 일관성 검증</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>직관적인 비교 인터페이스</li>
                  </ul>
                </div>

                <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>협업 평가</h4>
                  </div>
                  <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>여러 평가자가 함께 참여하는 집단 의사결정 지원</p>
                  <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>평가자별 가중치 조정</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>실시간 진행률 모니터링</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>익명 평가 옵션</li>
                  </ul>
                </div>

                <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>고급 분석</h4>
                  </div>
                  <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>정확하고 신뢰할 수 있는 분석 결과 제공</p>
                  <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>민감도 분석</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>일관성 지수 계산</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>다양한 시각화 차트</li>
                  </ul>
                </div>

                <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>보고서 생성</h4>
                  </div>
                  <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>전문적인 분석 보고서를 자동으로 생성</p>
                  <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                    <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>PDF/Excel 내보내기</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>커스텀 템플릿</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>학술 논문 형식 지원</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AI 개발 도구 예시 안내 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-3xl font-bold mb-6">
                  실제 분석 사례로 학습하기
                </h3>
                <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                  실제 AI 개발 도구(Claude Code, GitHub Copilot, Cursor AI, Tabnine) 중에서 
                  최적의 도구를 선택하는 AHP 분석 과정을 단계별로 확인해보세요.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => setActiveView('example')}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 font-semibold rounded-xl inline-flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-primary, #10b981)' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'}
                  >
                    분석 예시 보기
                    <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <button 
                    onClick={onLoginClick}
                    className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 font-semibold rounded-xl inline-flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-secondary)', color: 'var(--accent-primary, #10b981)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-elevated)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-secondary)';
                    }}
                  >
                    직접 시작하기
                    <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-6xl mx-auto px-4 py-16">
            {/* 서비스 소개 */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                AHP 시스템의 핵심 기능
              </h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                의사결정의 모든 단계를 지원하는 통합 플랫폼
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>프로젝트 관리</h3>
                <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>새로운 AHP 분석 프로젝트를 생성하고 관리합니다.</p>
                <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                  <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>프로젝트 생성 및 설정</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>목표 및 설명 정의</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>프로젝트 상태 관리</li>
                </ul>
              </div>

              <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>모델 구축</h3>
                <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>계층구조와 평가 기준을 설정합니다.</p>
                <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>기준 계층 구조 설계</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>대안 정의 및 관리</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>평가자 배정</li>
                </ul>
              </div>

              <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>평가 수행</h3>
                <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>쌍대비교를 통한 가중치 도출을 진행합니다.</p>
                <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                  <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>쌍대비교 평가</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>일관성 검증</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>진행률 모니터링</li>
                </ul>
              </div>

              <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>결과 분석</h3>
                <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>종합 분석 결과를 확인하고 활용합니다.</p>
                <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                  <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>가중치 도출 결과</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>민감도 분석</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>결과 내보내기</li>
                </ul>
              </div>

              <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>사용자 관리</h3>
                <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>평가자와 관리자 계정을 관리합니다.</p>
                <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                  <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>사용자 등록 및 권한</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>접근키 관리</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>평가자 배정</li>
                </ul>
              </div>

              <div className="rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>진행 모니터링</h3>
                <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>프로젝트 진행 상황을 실시간으로 추적합니다.</p>
                <ul className="text-sm space-y-2" style={{ color: 'var(--text-tertiary)' }}>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>단계별 완료율</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>평가자별 진행률</li>
                  <li className="flex items-center"><span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>프로젝트 상태</li>
                </ul>
              </div>
            </div>

            {/* 활용 사례 */}
            <div className="mt-20 rounded-3xl p-12" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>활용 분야</h3>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>다양한 분야에서 검증된 AHP 의사결정 지원</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>경영 전략</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>투자 우선순위, 사업 선정</p>
                </div>
                
                <div className="rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>R&D</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>기술 평가, 연구 과제 선정</p>
                </div>
                
                <div className="rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>공공 정책</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>정책 우선순위, 예산 배분</p>
                </div>
                
                <div className="rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>인사 관리</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>인재 선발, 성과 평가</p>
                </div>
              </div>
            </div>

            {/* CTA 섹션 */}
            <div className="mt-20">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-3xl font-bold mb-4">
                    지금 바로 시작해보세요!
                  </h3>
                  <p className="text-blue-100 mb-8 text-lg">
                    과학적 의사결정을 위한 AHP 분석을 경험해보세요
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button 
                      onClick={onLoginClick}
                      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold rounded-xl inline-flex items-center justify-center"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-primary, #10b981)' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-elevated)'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'}
                    >
                      서비스 시작하기
                      <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setActiveView('guide')}
                      className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-4 text-lg font-semibold rounded-xl inline-flex items-center justify-center"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-secondary)', color: 'var(--accent-primary, #10b981)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-elevated)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bg-secondary)';
                      }}
                    >
                      이용 가이드 보기
                      <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 정보 */}
      <div className="text-white py-12" style={{ backgroundColor: 'var(--footer-bg, #111827)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">AHP for Paper</h4>
              <p className="text-sm" style={{ color: 'var(--footer-text, #9ca3af)' }}>
                과학적 의사결정을 위한<br />
                전문 AHP 분석 플랫폼
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--footer-text, #9ca3af)' }}>
                <li><button onClick={() => setActiveView('intro')} className="hover:text-white transition text-left">서비스 소개</button></li>
                <li><button onClick={() => setActiveView('guide')} className="hover:text-white transition text-left">이용 가이드</button></li>
                <li><button onClick={() => setActiveView('example')} className="hover:text-white transition text-left">분석 예시</button></li>
                <li><button onClick={onLoginClick} className="hover:text-white transition text-left">요금제</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <p className="text-sm" style={{ color: 'var(--footer-text, #9ca3af)' }}>
                support@ahpforpaper.com<br />
                평일 09:00 - 18:00
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm" style={{ borderColor: 'var(--footer-border, #374151)', color: 'var(--footer-text, #9ca3af)' }}>
            <p>© 2025 AHP for Paper. Powered by Advanced Analytics & Decision Intelligence</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;