import React from 'react';

function TestApp() {
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f3f4f6', 
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          color: '#1f2937', 
          fontSize: '2rem', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🚀 AHP Enterprise Platform v3.0.0
        </h1>
        
        <div style={{ 
          backgroundColor: '#dbeafe', 
          padding: '1rem', 
          borderRadius: '6px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#1e40af', margin: 0 }}>
            ✅ JavaScript가 정상적으로 로드되었습니다!
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#374151', fontSize: '1.5rem', marginBottom: '1rem' }}>
            📊 AHP 분석 도구
          </h2>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            체계적인 의사결정을 위한 계층분석법(AHP) 플랫폼입니다. 
            복잡한 문제를 구조화하고 객관적인 우선순위를 도출할 수 있습니다.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1.5rem', 
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#111827', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              🎯 계층 구조 분석
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              목표-기준-대안의 계층 구조로 문제를 체계화
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1.5rem', 
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#111827', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              ⚖️ 쌍대비교
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              9점 척도를 사용한 정확한 중요도 측정
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1.5rem', 
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#111827', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              📊 일관성 검사
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              CR 값 자동 계산으로 판단 신뢰성 확보
            </p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#ecfdf5', 
          border: '1px solid #a7f3d0', 
          padding: '1rem', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#065f46', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
            🎉 배포 성공!
          </p>
          <p style={{ color: '#047857', margin: 0 }}>
            GitHub Pages에서 React + TypeScript + Tailwind CSS 앱이 정상 작동 중입니다.
          </p>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.875rem'
        }}>
          <p>Powered by React 18 + TypeScript + Tailwind CSS</p>
          <p>Last updated: {new Date().toISOString().split('T')[0]}</p>
        </div>
      </div>
    </div>
  );
}

export default TestApp;