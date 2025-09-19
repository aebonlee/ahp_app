import React from 'react';
import { Link } from 'react-router-dom';

const SimpleHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AHP Enterprise Platform</h1>
              <span className="ml-3 text-sm text-gray-500">v3.0.0</span>
            </div>
            <nav className="flex space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                로그인
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            체계적인 의사결정을 위한
            <span className="block text-blue-600">AHP 분석 도구</span>
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
            복잡한 의사결정 문제를 구조화하고, 쌍대비교를 통해 
            객관적이고 논리적인 결정을 내릴 수 있도록 지원합니다.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              지금 시작하기
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors">
              기능 알아보기
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">계층 구조 분석</h3>
            <p className="text-gray-600">
              복잡한 의사결정 문제를 목표-기준-대안의 계층 구조로 체계화하여 분석합니다.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">쌍대비교</h3>
            <p className="text-gray-600">
              각 요소 간의 상대적 중요도를 쌍대비교를 통해 정확하게 측정합니다.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">일관성 검사</h3>
            <p className="text-gray-600">
              입력된 판단의 일관성을 자동으로 검사하여 신뢰할 수 있는 결과를 제공합니다.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">결과 시각화</h3>
            <p className="text-gray-600">
              최종 우선순위와 함께 상세한 분석 결과를 다양한 차트로 시각화합니다.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Core AHP 엔진</h3>
            <p className="text-gray-600">
              고유벡터 계산, 일관성 비율 검증 등 AHP 핵심 알고리즘을 내장하고 있습니다.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">☁️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">클라우드 기반</h3>
            <p className="text-gray-600">
              GitHub Pages에 배포되어 언제 어디서나 접근 가능한 웹 기반 플랫폼입니다.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">바로 체험해보세요</h3>
            <p className="text-gray-600 mb-8">
              데모 계정으로 AHP Enterprise Platform의 모든 기능을 무료로 체험할 수 있습니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">👨‍💼 관리자 계정</h4>
                <p className="text-sm text-gray-600"><strong>ID:</strong> admin@ahp-system.com</p>
                <p className="text-sm text-gray-600"><strong>PW:</strong> password123</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">👤 사용자 계정</h4>
                <p className="text-sm text-gray-600"><strong>ID:</strong> user@test.com</p>
                <p className="text-sm text-gray-600"><strong>PW:</strong> password123</p>
              </div>
            </div>
            
            <Link
              to="/login"
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
            >
              데모 체험하기
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">🏗️ AHP for Paper</h4>
              <p className="text-gray-300 mb-2">한국직업능력개발센터</p>
              <p className="text-gray-400 text-sm">
                연구 논문 작성을 위한 전문 AHP 분석 도구
              </p>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-4">🔗 바로가기</h5>
              <div className="space-y-2">
                <Link to="/login" className="block text-gray-300 hover:text-white">로그인</Link>
                <Link to="/dashboard" className="block text-gray-300 hover:text-white">대시보드</Link>
              </div>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-4">📞 연락처</h5>
              <div className="text-gray-300 text-sm space-y-1">
                <p>이메일: aebon@naver.com</p>
                <p>전화: 010-3700-0629</p>
                <p>카카오톡: aebon</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 AHP Enterprise Platform v3.0.0. All rights reserved.</p>
            <p className="mt-1">Powered by React + TypeScript + Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleHomePage;