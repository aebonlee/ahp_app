import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      {/* 헤더 섹션 */}
      <header className="home-header">
        <div className="container">
          <div className="logo-section">
            <h1 className="site-title">AHP System</h1>
            <p className="site-subtitle">Analytic Hierarchy Process</p>
          </div>
          <nav className="main-nav">
            <Link to="/login" className="nav-link">로그인</Link>
            <Link to="/dashboard" className="nav-link primary">시작하기</Link>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h2 className="hero-title">
              체계적인 의사결정을 위한<br />
              <span className="highlight">AHP 분석 도구</span>
            </h2>
            <p className="hero-description">
              복잡한 의사결정 문제를 구조화하고, 쌍대비교를 통해 
              객관적이고 논리적인 결정을 내릴 수 있도록 지원합니다.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-large">
                지금 시작하기
              </Link>
              <a href="#features" className="btn btn-secondary btn-large">
                기능 알아보기
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="decision-tree">
              <div className="tree-node main">목표</div>
              <div className="tree-level">
                <div className="tree-node">기준 1</div>
                <div className="tree-node">기준 2</div>
                <div className="tree-node">기준 3</div>
              </div>
              <div className="tree-level">
                <div className="tree-node">대안 A</div>
                <div className="tree-node">대안 B</div>
                <div className="tree-node">대안 C</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section id="features" className="features-section">
        <div className="container">
          <h3 className="section-title">주요 기능</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>계층 구조 분석</h4>
              <p>복잡한 의사결정 문제를 목표-기준-대안의 계층 구조로 체계화하여 분석합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚖️</div>
              <h4>쌍대비교</h4>
              <p>각 요소 간의 상대적 중요도를 쌍대비교를 통해 정확하게 측정합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>일관성 검사</h4>
              <p>입력된 판단의 일관성을 자동으로 검사하여 신뢰할 수 있는 결과를 제공합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h4>결과 분석</h4>
              <p>최종 우선순위와 함께 상세한 분석 결과를 시각적으로 제공합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h4>협업 기능</h4>
              <p>여러 평가자가 참여하는 그룹 의사결정을 효과적으로 관리합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h4>보고서 생성</h4>
              <p>분석 결과를 Excel, PDF 등 다양한 형태로 내보내어 활용할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 데모 계정 섹션 */}
      <section className="demo-section">
        <div className="container">
          <div className="demo-content">
            <h3>바로 체험해보세요</h3>
            <p>데모 계정으로 AHP System의 모든 기능을 무료로 체험할 수 있습니다.</p>
            <div className="demo-accounts">
              <div className="account-card">
                <h4>👨‍💼 관리자 계정</h4>
                <p><strong>ID:</strong> admin@ahp-system.com</p>
                <p><strong>PW:</strong> password123</p>
              </div>
              <div className="account-card">
                <h4>👤 사용자 계정</h4>
                <p><strong>ID:</strong> user@test.com</p>
                <p><strong>PW:</strong> password123</p>
              </div>
            </div>
            <div className="demo-actions">
              <Link to="/login" className="btn btn-primary">
                데모 체험하기
              </Link>
              <Link to="/personal-service" className="btn btn-outline">
                개인 서비스 바로가기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <h4>🏗️ AHP for Paper</h4>
              <p>한국직업능력개발센터</p>
              <p className="footer-tagline">연구 논문 작성을 위한 전문 AHP 분석 도구</p>
              <div className="business-info">
                <p>사업자등록번호: 601-45-20154</p>
                <p>경기도 수원시 팔달구 매산로 45, 419호</p>
                <p>대표이사: 이애본 | 통신판매신고: 제2024-수원팔달-0584호</p>
                <p>고객지원: aebon@naver.com | 전화: 010-3700-0629 (평일: 09:00 ~ 18:00)</p>
                <p>카카오톡 상담 - ID: aebon</p>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h5>🔗 바로가기</h5>
                <Link to="/login">로그인</Link>
                <Link to="/personal-service">개인 서비스</Link>
                <Link to="/dashboard">대시보드</Link>
              </div>
              <div className="footer-section">
                <h5>📚 정보</h5>
                <a href="https://github.com/aebonlee/ahp_app" target="_blank" rel="noopener noreferrer">
                  GitHub 저장소
                </a>
                <Link to="/user-guide">사용자 가이드</Link>
                <Link to="/pricing">요금 안내</Link>
              </div>
              <div className="footer-section">
                <h5>🎧 지원</h5>
                <Link to="/support">고객 지원</Link>
                <Link to="/news">소식 및 사례</Link>
                <a href="mailto:aebon@naver.com">문의하기</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="legal-links">
              <a href="#terms">이용약관</a>
              <a href="#privacy">개인정보처리방침</a>
              <a href="#refund">환불정책</a>
            </div>
            <p>&copy; 2024 AHP for Paper. All rights reserved.</p>
            <p>이 웹사이트의 모든 콘텐츠는 저작권법의 보호를 받습니다.</p>
            <p>Last updated: 2024.08.31</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;