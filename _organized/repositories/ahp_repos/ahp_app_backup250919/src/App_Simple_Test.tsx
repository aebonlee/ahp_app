import React from 'react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
          🎉 AHP App Test - React가 정상 작동중!
        </h1>
        <p>현재 시간: {new Date().toLocaleString()}</p>
        <div style={{ marginTop: '20px' }}>
          <a 
            href="/#/login" 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px' 
            }}
          >
            로그인 페이지로 이동
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;