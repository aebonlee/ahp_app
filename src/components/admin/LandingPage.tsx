import React, { useState } from 'react';
import Button from '../common/Button';
import ExampleGuide from '../home/ExampleGuide';
import type { User } from '../../types';

interface LandingPageProps {
  user: User;
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ user, onGetStarted }) => {
  const [activeView, setActiveView] = useState<'intro' | 'guide' | 'example'>('intro');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* 히어로 섹션 - Blocksy 스타일 */}
      <div className="relative overflow-hidden">
        {/* 배경 그라데이션 및 패턴 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/20 to-cyan-400/30"></div>
        
        {/* 기하학적 패턴 배경 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-cyan-200 rounded-full blur-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200 rounded-full blur-lg"></div>
          <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-indigo-200 rounded-full blur-md"></div>
        </div>

        <div className="relative z-10 px-4 py-20 sm:py-28 lg:py-32">
          <div className="max-w-7xl mx-auto text-center">
            {/* 메인 헤더 */}
            <div className="space-y-6 mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="block">AHP for Paper</span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-blue-100 mt-2">
                  과학적 의사결정을 위한 계층적 분석 플랫폼
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                복잡한 의사결정 문제를 체계적으로 분해하고, 정량적으로 평가하여 
                최적의 선택을 도출하는 전문 분석 도구입니다.
              </p>
            </div>

            {/* 네비게이션 버튼들 - Blocksy 스타일 */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setActiveView('intro')}
                className={`${
                  activeView === 'intro' 
                    ? 'bg-white text-blue-700 shadow-xl border-0' 
                    : 'bg-white/90 hover:bg-white text-blue-700 border-0 hover:shadow-lg'
                } backdrop-blur-sm transition-all duration-300 transform hover:scale-105 font-medium px-6 py-3`}
              >
                <span className="mr-2">🏠</span>
                서비스 소개
              </Button>
              
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setActiveView('guide')}
                className={`${
                  activeView === 'guide' 
                    ? 'bg-white text-blue-700 shadow-xl border-0' 
                    : 'bg-white/90 hover:bg-white text-blue-700 border-0 hover:shadow-lg'
                } backdrop-blur-sm transition-all duration-300 transform hover:scale-105 font-medium px-6 py-3`}
              >
                <span className="mr-2">📖</span>
                이용 가이드
              </Button>
              
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setActiveView('example')}
                className={`${
                  activeView === 'example' 
                    ? 'bg-white text-blue-700 shadow-xl border-0' 
                    : 'bg-white/90 hover:bg-white text-blue-700 border-0 hover:shadow-lg'
                } backdrop-blur-sm transition-all duration-300 transform hover:scale-105 font-medium px-6 py-3`}
              >
                <span className="mr-2">📚</span>
                분석 예시
              </Button>
              
              <Button 
                variant="primary" 
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold px-8 py-3"
              >
                <span className="mr-2">🚀</span>
                지금 시작하기
              </Button>
            </div>

            {/* 특징 미리보기 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-white/90 text-sm font-medium">빠른 설정</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-white/90 text-sm font-medium">정확한 분석</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-white/90 text-sm font-medium">최적 결과</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 컨텐츠 섹션 - Blocksy 스타일 */}
      <div className="bg-white">
        {activeView === 'example' ? (
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 mb-12">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  📚 실제 분석 예시
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  AI 개발 도구 선택을 위한 AHP 분석 과정을 단계별로 살펴보세요
                </p>
              </div>
            </div>
            <div className="bg-gray-50">
              <ExampleGuide />
            </div>
          </div>
        ) : activeView === 'guide' ? (
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              {/* 서비스 이용 가이드 */}
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  📖 서비스 이용 가이드
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  AHP for Paper를 처음 사용하시는 분들을 위한 단계별 가이드
                </p>
              </div>

              {/* 이용 단계 가이드 - Blocksy 스타일 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                  <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div className="text-4xl mb-6 text-center">👋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">회원가입 & 로그인</h3>
                  <ul className="text-gray-600 space-y-3 text-sm leading-relaxed">
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
                      7일 무료 체험 제공
                    </li>
                  </ul>
                </div>

                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                  <div className="absolute -top-4 left-8 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div className="text-4xl mb-6 text-center">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">프로젝트 생성</h3>
                  <ul className="text-gray-600 space-y-3 text-sm leading-relaxed">
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

                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                  <div className="absolute -top-4 left-8 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div className="text-4xl mb-6 text-center">⚖️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">평가 수행</h3>
                  <ul className="text-gray-600 space-y-3 text-sm leading-relaxed">
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

                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
                  <div className="absolute -top-4 left-8 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <div className="text-4xl mb-6 text-center">📊</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">결과 분석</h3>
                  <ul className="text-gray-600 space-y-3 text-sm leading-relaxed">
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

              {/* 주요 기능 소개 - Blocksy 스타일 */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12 mb-12">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">✨ 주요 기능</h3>
                  <p className="text-lg text-gray-600">전문적인 의사결정 지원을 위한 핵심 기능들</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mr-4">⚖️</div>
                      <h4 className="text-xl font-bold text-gray-900">쌍대비교 평가</h4>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">두 요소를 직접 비교하여 중요도를 평가하는 AHP의 핵심 방법론</p>
                    <ul className="text-sm text-gray-500 space-y-2">
                      <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>9점 척도 평가 시스템</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>실시간 일관성 검증</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>직관적인 비교 인터페이스</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mr-4">👥</div>
                      <h4 className="text-xl font-bold text-gray-900">협업 평가</h4>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">여러 평가자가 함께 참여하는 집단 의사결정 지원</p>
                    <ul className="text-sm text-gray-500 space-y-2">
                      <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>평가자별 가중치 조정</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>실시간 진행률 모니터링</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>익명 평가 옵션</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mr-4">📊</div>
                      <h4 className="text-xl font-bold text-gray-900">고급 분석</h4>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">정확하고 신뢰할 수 있는 분석 결과 제공</p>
                    <ul className="text-sm text-gray-500 space-y-2">
                      <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>민감도 분석</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>일관성 지수 계산</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>다양한 시각화 차트</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mr-4">📄</div>
                      <h4 className="text-xl font-bold text-gray-900">보고서 생성</h4>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">전문적인 분석 보고서를 자동으로 생성</p>
                    <ul className="text-sm text-gray-500 space-y-2">
                      <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>PDF/Excel 내보내기</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>커스텀 템플릿</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>학술 논문 형식 지원</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI 개발 도구 예시 안내 - Blocksy 스타일 */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-3xl font-bold mb-6">
                    🤖 실제 분석 사례로 학습하기
                  </h3>
                  <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                    실제 AI 개발 도구(Claude Code, GitHub Copilot, Cursor AI, Tabnine) 중에서 
                    최적의 도구를 선택하는 AHP 분석 과정을 단계별로 확인해보세요.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => setActiveView('example')}
                      className="bg-white hover:bg-gray-100 text-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
                    >
                      📚 분석 예시 보기
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={onGetStarted}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
                    >
                      🚀 직접 시작하기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              {/* 주요 특징 */}
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  AHP 시스템의 핵심 기능
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  의사결정의 모든 단계를 지원하는 통합 플랫폼
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-200 transition-colors">📋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">프로젝트 관리</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">새로운 AHP 분석 프로젝트를 생성하고 관리합니다.</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>프로젝트 생성 및 설정</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>목표 및 설명 정의</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>프로젝트 상태 관리</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-green-200 transition-colors">🏗️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">모델 구축</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">계층구조와 평가 기준을 설정합니다.</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>기준 계층 구조 설계</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>대안 정의 및 관리</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>평가자 배정</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-purple-200 transition-colors">⚖️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">평가 수행</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">쌍대비교를 통한 가중치 도출을 진행합니다.</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>쌍대비교 평가</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>일관성 검증</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>진행률 모니터링</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-orange-200 transition-colors">📊</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">결과 분석</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">종합 분석 결과를 확인하고 활용합니다.</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>가중치 도출 결과</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>민감도 분석</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>결과 내보내기</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-200 transition-colors">👥</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">사용자 관리</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">평가자와 관리자 계정을 관리합니다.</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>사용자 등록 및 권한</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>접근키 관리</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>평가자 배정</li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-cyan-200 transition-colors">📈</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">진행 모니터링</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">프로젝트 진행 상황을 실시간으로 추적합니다.</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center"><span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>단계별 완료율</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>평가자별 진행률</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>프로젝트 상태</li>
                  </ul>
                </div>
              </div>

              {/* 활용 사례 - Blocksy 스타일 */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">🌟 활용 분야</h3>
                  <p className="text-lg text-gray-600">다양한 분야에서 검증된 AHP 의사결정 지원</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-blue-200 transition-colors">🏢</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">경영 전략</h4>
                    <p className="text-gray-600 text-sm">투자 우선순위, 사업 선정</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-green-200 transition-colors">🔬</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">R&D</h4>
                    <p className="text-gray-600 text-sm">기술 평가, 연구 과제 선정</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-purple-200 transition-colors">🏛️</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">공공 정책</h4>
                    <p className="text-gray-600 text-sm">정책 우선순위, 예산 배분</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-orange-200 transition-colors">💼</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">인사 관리</h4>
                    <p className="text-gray-600 text-sm">인재 선발, 성과 평가</p>
                  </div>
                </div>
              </div>

              {/* CTA 섹션 - Blocksy 스타일 */}
              <div className="mt-20">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
                  <div className="max-w-3xl mx-auto">
                    <h3 className="text-3xl font-bold mb-4">
                      🚀 {user.first_name} {user.last_name}님, 준비가 완료되었습니다!
                    </h3>
                    <p className="text-blue-100 mb-8 text-lg">
                      관리자 권한으로 AHP 의사결정 프로젝트를 시작하세요.
                    </p>
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={onGetStarted}
                      className="bg-white hover:bg-gray-100 text-blue-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-12 py-4 text-lg font-semibold"
                    >
                      지금 시작하기
                    </Button>
                    
                    <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <p className="text-blue-100 text-sm">
                        <strong>로그인 세션:</strong> 관리자 권한 확인됨 ✓
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;