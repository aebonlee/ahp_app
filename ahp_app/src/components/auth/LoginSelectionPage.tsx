import React from 'react';
import Card from '../common/Card';

interface LoginSelectionPageProps {
  onRegisterSelect: () => void;
  onServiceSelect: () => void;
}

const LoginSelectionPage: React.FC<LoginSelectionPageProps> = ({ 
  onRegisterSelect, 
  onServiceSelect 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* 고급스러운 그라디언트 배경 */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom right, var(--bg-elevated), var(--accent-primary), var(--accent-secondary))'
      }}></div>
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top right, transparent, rgba(var(--accent-rgb), 0.1), rgba(var(--accent-rgb), 0.2))'
      }}></div>
      
      {/* 세련된 기하학적 패턴 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl w-full space-y-6 relative z-10">
        {/* 개선된 헤더 디자인 - 더욱 세련된 스타일 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <div className="relative inline-block">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              AHP for Paper
            </h1>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>
          
          <p className="text-base sm:text-lg font-semibold mt-4 mb-2" style={{
            color: '#374151'
          }}>
            전문가급 의사결정 지원 시스템
          </p>
          <p className="text-sm font-medium tracking-wide" style={{
            color: '#6b7280'
          }}>
            Analytic Hierarchy Process Decision Support System
          </p>
        </div>

        {/* 개선된 서비스 선택 카드 - 2가지 옵션 (회원가입, 서비스 이용) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto px-6 sm:px-8">
          {/* 회원가입 카드 (첫 번째) */}
          <Card 
            variant="glass" 
            hoverable={true} 
            className="bg-gray-50/95 backdrop-blur-xl border-2 border-purple-200/60 hover:border-purple-300/80 transform hover:scale-102 cursor-pointer hover:bg-gray-100/95 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div 
              className="text-center p-6 sm:p-8 lg:p-10"
              onClick={onRegisterSelect}
            >
              
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6" style={{
                color: '#1f2937',
                fontWeight: '800'
              }}>
                회원가입
              </h3>
              
              <p className="mb-6 lg:mb-8 leading-normal font-medium text-base sm:text-lg lg:text-xl" style={{
                color: '#4b5563',
                lineHeight: '1.4'
              }}>
                연구용 계정을 생성하여
                전문 AHP 분석을 시작하세요
              </p>
              
              <div className="space-y-3 lg:space-y-4 text-sm sm:text-base lg:text-lg mb-6 lg:mb-8" style={{
                color: '#374151'
              }}>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg lg:text-xl font-bold" style={{ color: '#8b5cf6' }}>✓</span>
                  <span className="font-medium">연구 프로젝트 전용 계정</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg lg:text-xl font-bold" style={{ color: '#8b5cf6' }}>✓</span>
                  <span className="font-medium">학술 연구 완벽 지원</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg lg:text-xl font-bold" style={{ color: '#8b5cf6' }}>✓</span>
                  <span className="font-medium">가이드 학습 프로그램</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg lg:text-xl font-bold" style={{ color: '#8b5cf6' }}>✓</span>
                  <span className="font-medium">실제 연구 즉시 적용</span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <button 
                  className="relative w-full py-4 lg:py-5 px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  onClick={onRegisterSelect}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    회원가입 시작하기
                  </span>
                </button>
              </div>
            </div>
          </Card>

          {/* 서비스 이용 카드 (두 번째) */}
          <Card 
            variant="glass" 
            hoverable={true} 
            className="bg-gray-50/95 backdrop-blur-xl border-2 border-blue-200/60 hover:border-blue-300/80 transform hover:scale-102 cursor-pointer hover:bg-gray-100/95 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div 
              className="text-center p-6 sm:p-8 lg:p-10"
              onClick={onServiceSelect}
            >
              
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6" style={{
                color: '#1f2937',
                fontWeight: '800'
              }}>
                서비스 이용
              </h3>
              
              <p className="mb-6 lg:mb-8 leading-normal font-medium text-base sm:text-lg lg:text-xl" style={{
                color: '#4b5563',
                lineHeight: '1.4'
              }}>
                AHP 의사결정 분석 플랫폼
                개인/관리자 서비스 이용
              </p>
              
              <div className="space-y-3 lg:space-y-4 text-sm sm:text-base lg:text-lg mb-6 lg:mb-8" style={{
                color: '#374151'
              }}>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg lg:text-xl font-bold" style={{ color: '#3b82f6' }}>✓</span>
                  <span className="font-medium">프로젝트 생성 및 관리</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg lg:text-xl font-bold" style={{ color: '#3b82f6' }}>✓</span>
                  <span className="font-medium">평가자 초대 및 설문 진행</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg lg:text-xl font-bold" style={{ color: '#3b82f6' }}>✓</span>
                  <span className="font-medium">실시간 결과 분석</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg lg:text-xl font-bold" style={{ color: '#3b82f6' }}>✓</span>
                  <span className="font-medium">관리자 권한 자동 인식</span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <button 
                  className="relative w-full py-4 lg:py-5 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  onClick={onServiceSelect}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    서비스 로그인
                  </span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* 개선된 하단 정보 */}
        <div className="text-center text-sm">
          <p className="font-normal" style={{
            color: '#6b7280'
          }}>Powered by Advanced Analytics & Decision Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelectionPage;