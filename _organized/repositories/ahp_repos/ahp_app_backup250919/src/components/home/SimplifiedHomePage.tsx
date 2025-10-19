import React from 'react';

const SimplifiedHomePage: React.FC = () => {
  const handleNavigate = (path: string) => {
    window.location.hash = `#${path}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 헤더 */}
      <header style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#C8A968',
            margin: 0
          }}>
            AHP for Paper
          </h1>
          <button
            onClick={() => handleNavigate('/login')}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#C8A968',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            시작하기
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          복잡한 의사결정을
          <br />
          <span style={{ color: '#C8A968' }}>
            체계적으로 분석하세요
          </span>
        </h2>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          AHP(Analytic Hierarchy Process) 방법론을 활용하여
          연구의 신뢰성을 높이고 명확한 결론을 도출하세요
        </p>

        <button
          onClick={() => handleNavigate('/login')}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#C8A968',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          연구 시작하기 →
        </button>
      </main>

      {/* 푸터 */}
      <footer style={{
        borderTop: '1px solid #e5e7eb',
        padding: '2rem 1rem',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        © 2024 AHP for Paper. All rights reserved.
      </footer>
    </div>
  );
};

export default SimplifiedHomePage;