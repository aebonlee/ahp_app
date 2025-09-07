import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import ThemeModeToggle from '../common/ThemeModeToggle';
import ColorThemeButton from '../common/ColorThemeButton';
import PricingSection from './PricingSection';

interface HomePageProps {
  onLoginClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setShowScrollTop(currentScrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <header className={`${styles.header} ${scrollY > 10 ? styles.headerScrolled : styles.headerTransparent}`}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            {/* Logo */}
            <div className={styles.logo}>
              AHP for Paper
            </div>

            {/* Desktop Navigation */}
            <nav className={styles.nav}>
              <a href="#features" className={styles.navLink}>주요 기능</a>
              <a href="#how-it-works" className={styles.navLink}>이용 방법</a>
              <a href="#pricing" className={styles.navLink}>요금제</a>
              <a href="#research" className={styles.navLink}>연구 사례</a>
            </nav>

            {/* Desktop Buttons */}
            <div className={styles.headerButtons}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ThemeModeToggle />
                <ColorThemeButton />
              </div>
              <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>
              <button onClick={onLoginClick} className={styles.loginButton}>
                로그인
              </button>
              <button onClick={onLoginClick} className={styles.ctaButton}>
                시작하기
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={styles.mobileMenuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <a href="#features" className={styles.mobileNavLink}>주요 기능</a>
            <a href="#how-it-works" className={styles.mobileNavLink}>이용 방법</a>
            <a href="#pricing" className={styles.mobileNavLink}>요금제</a>
            <a href="#research" className={styles.mobileNavLink}>연구 사례</a>
            <div style={{ padding: '1rem 0', borderTop: '1px solid #e5e7eb', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>테마:</span>
                <ThemeModeToggle />
                <ColorThemeButton />
              </div>
              <button 
                onClick={onLoginClick} 
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#C8A968',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                시작하기
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ marginRight: '0.5rem' }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            논문 작성을 위한 전문 분석 도구
          </div>

          <h1 className={styles.heroTitle}>
            복잡한 의사결정을
            <br />
            <span className={styles.heroHighlight}>체계적으로 분석하세요</span>
          </h1>

          <p className={styles.heroSubtitle}>
            AHP(Analytic Hierarchy Process) 방법론을 활용하여
            연구의 신뢰성을 높이고 명확한 결론을 도출하세요
          </p>

          <div className={styles.heroButtons}>
            <button onClick={onLoginClick} className={styles.primaryButton}>
              연구 시작하기
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className={styles.secondaryButton}>
              가이드 보기
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>연구에 필요한 모든 기능</h2>
            <p className={styles.sectionSubtitle}>복잡한 의사결정 문제를 체계적으로 해결하세요</p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>체계적 계층 구조</h3>
              <p className={styles.featureDescription}>
                목표, 기준, 대안을 체계적으로 구조화하여 복잡한 문제를 명확하게 정리합니다
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>정량적 분석</h3>
              <p className={styles.featureDescription}>
                쌍대비교를 통해 주관적 판단을 객관적 수치로 변환하고 일관성을 검증합니다
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>협업 연구</h3>
              <p className={styles.featureDescription}>
                여러 전문가의 의견을 수집하고 통합하여 집단 의사결정을 지원합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className={styles.processSection}>
        <div className={styles.processContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>간단한 3단계 프로세스</h2>
            <p className={styles.sectionSubtitle}>가이드를 따라 쉽게 연구를 진행하세요</p>
          </div>

          <div className={styles.processGrid}>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>계층 구조 설계</h3>
              <p className={styles.stepDescription}>
                연구 목표와 평가 기준, 대안을 체계적으로 구성합니다
              </p>
            </div>

            <div className={styles.processStep}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>쌍대 비교</h3>
              <p className={styles.stepDescription}>
                각 요소들을 1:1로 비교하여 상대적 중요도를 평가합니다
              </p>
            </div>

            <div className={styles.processStep}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>결과 분석</h3>
              <p className={styles.stepDescription}>
                우선순위와 일관성 비율을 확인하고 최적 대안을 도출합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection onLoginClick={onLoginClick} />

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>지금 바로 연구를 시작하세요</h2>
          <p className={styles.ctaSubtitle}>
            전문적인 AHP 분석으로 연구의 품질을 높이세요
          </p>
          <button onClick={onLoginClick} className={styles.ctaButtonWhite}>
            14일 무료 체험 시작
          </button>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`${styles.scrollToTop} ${!showScrollTop ? styles.hidden : ''}`}
        aria-label="상단으로 스크롤"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default HomePage;