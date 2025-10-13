import React from 'react';


function App() {
  console.log('🚀 React App 시작');

  // 개인서비스 페이지로 직접 리다이렉트
  React.useEffect(() => {
    console.log('✅ React App 로드됨 - personal-service.html로 리다이렉트');
    window.location.href = '/ahp_app/personal-service.html';
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#C8A968', marginBottom: '1rem' }}>
          🎯 AHP System 로딩중...
        </h1>
        <p style={{ color: '#6b7280' }}>
          개인서비스 대시보드로 이동합니다...
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a 
            href="/ahp_app/personal-service.html" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#C8A968',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500'
            }}
          >
            개인서비스 대시보드로 바로가기
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;