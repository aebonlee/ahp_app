import React from 'react';
import Card from '../common/Card';

interface AdminSelectPageProps {
  onAdminSelect: () => void;
  onUserSelect: () => void;
  onBackToLogin: () => void;
}

const AdminSelectPage: React.FC<AdminSelectPageProps> = ({ 
  onAdminSelect, 
  onUserSelect,
  onBackToLogin 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* 고급스러운 그라디언트 배경 */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom right, var(--bg-elevated), #10b981, #059669)'
      }}></div>
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top right, transparent, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.2))'
      }}></div>
      
      {/* 세련된 기하학적 패턴 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{
          backgroundColor: 'rgba(52, 211, 153, 0.2)'
        }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{
          backgroundColor: 'rgba(110, 231, 183, 0.1)'
        }}></div>
      </div>

      <div className="max-w-4xl w-full space-y-6 relative z-10">
        {/* 개선된 헤더 */}
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center hover:bg-gray-100 mb-4 border-0 transition-all duration-200 px-4 py-2 rounded-lg"
            style={{ 
              color: '#374151'
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            로그인으로 돌아가기
          </button>
          
          <h2 className="text-3xl font-bold mb-3" style={{
            color: '#1f2937'
          }}>
            계정 유형 선택
          </h2>
          
          <p className="mt-2 text-base font-normal" style={{
            color: '#4b5563'
          }}>
            관리자 권한 또는 일반 사용자로 접속하세요
            <br />
            <span className="text-sm" style={{ color: '#6b7280' }}>시스템에서 자동으로 권한을 확인합니다</span>
          </p>
        </div>
        
        {/* 관리자/사용자 선택 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto px-6">
          {/* 관리자 선택 카드 */}
          <Card 
            variant="glass" 
            hoverable={true} 
            className="bg-white/95 backdrop-blur-xl border-2 border-emerald-200/60 hover:border-emerald-300/80 transform hover:scale-102 cursor-pointer hover:bg-gray-50/95 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div 
              className="text-center p-6 sm:p-8"
              onClick={onAdminSelect}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{
                color: '#1f2937',
                fontWeight: '800'
              }}>
                관리자 계정
              </h3>
              
              <p className="mb-6 leading-normal font-medium text-base sm:text-lg" style={{
                color: '#4b5563',
                lineHeight: '1.4'
              }}>
                시스템 관리 및 모든 기능에 대한
                완전한 권한으로 접속
              </p>
              
              <div className="space-y-3 text-sm sm:text-base mb-6" style={{
                color: '#374151'
              }}>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#10b981' }}>✓</span>
                  <span className="font-medium">모든 프로젝트 관리</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#10b981' }}>✓</span>
                  <span className="font-medium">사용자 권한 관리</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#10b981' }}>✓</span>
                  <span className="font-medium">시스템 설정 변경</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#10b981' }}>✓</span>
                  <span className="font-medium">전체 데이터 접근</span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <button 
                  className="relative w-full py-4 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  onClick={onAdminSelect}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    관리자로 접속
                  </span>
                </button>
              </div>
            </div>
          </Card>

          {/* 일반 사용자 선택 카드 */}
          <Card 
            variant="glass" 
            hoverable={true} 
            className="bg-white/95 backdrop-blur-xl border-2 border-blue-200/60 hover:border-blue-300/80 transform hover:scale-102 cursor-pointer hover:bg-gray-50/95 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div 
              className="text-center p-6 sm:p-8"
              onClick={onUserSelect}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{
                color: '#1f2937',
                fontWeight: '800'
              }}>
                일반 사용자
              </h3>
              
              <p className="mb-6 leading-normal font-medium text-base sm:text-lg" style={{
                color: '#4b5563',
                lineHeight: '1.4'
              }}>
                기본 사용자 권한으로
                AHP 분석 서비스 이용
              </p>
              
              <div className="space-y-3 text-sm sm:text-base mb-6" style={{
                color: '#374151'
              }}>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#3b82f6' }}>✓</span>
                  <span className="font-medium">개인 프로젝트 생성</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#3b82f6' }}>✓</span>
                  <span className="font-medium">평가 및 분석 수행</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#3b82f6' }}>✓</span>
                  <span className="font-medium">결과 리포트 생성</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#3b82f6' }}>✓</span>
                  <span className="font-medium">개인 데이터 관리</span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <button 
                  className="relative w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  onClick={onUserSelect}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    일반 사용자로 접속
                  </span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* 하단 정보 */}
        <div className="text-center text-sm">
          <p className="font-normal" style={{
            color: '#6b7280'
          }}>
            권한은 로그인 후 자동으로 확인됩니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSelectPage;