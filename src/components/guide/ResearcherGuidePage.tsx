/**
 * 연구자 가이드 페이지
 * AHP 연구방법론을 위한 완전한 연구자 가이드
 */

import React, { useState } from 'react';

const ResearcherGuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: 'AHP 연구방법론 개요', icon: '🎯' },
    { id: 'methodology', title: '방법론 이론적 배경', icon: '📚' },
    { id: 'research-design', title: '연구 설계 프로세스', icon: '🔬' },
    { id: 'hierarchy-design', title: '계층구조 설계', icon: '🌲' },
    { id: 'data-collection', title: '데이터 수집 방법', icon: '📊' },
    { id: 'analysis-methods', title: '분석 방법 및 도구', icon: '📈' },
    { id: 'validation', title: '타당성 및 신뢰성 검증', icon: '✅' },
    { id: 'reporting', title: '연구 보고서 작성', icon: '📋' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 AHP 연구방법론 완전 가이드
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                이 연구자 가이드는 <strong>Analytic Hierarchy Process (AHP)</strong>를 활용한 학술 연구 및 
                전문 의사결정 분석을 수행하고자 하는 연구자들을 위한 완전한 방법론 매뉴얼입니다.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🔬 연구 목표</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 체계적 의사결정 연구 설계</li>
                    <li>• 정량적 평가체계 구축</li>
                    <li>• 다기준 의사결정 분석</li>
                    <li>• 학술적 신뢰성 확보</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>📚 이론적 기반</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Thomas L. Saaty의 AHP 이론</li>
                    <li>• 계층적 의사결정 모델</li>
                    <li>• 쌍대비교 매트릭스 분석</li>
                    <li>• 일관성 비율 검증</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎓 적용 분야</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 정책 우선순위 결정</li>
                    <li>• 기술 대안 평가</li>
                    <li>• 투자 의사결정 분석</li>
                    <li>• 공급업체 선정 연구</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'methodology':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📚 AHP 방법론의 이론적 배경
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">1️⃣</span> AHP의 이론적 기초
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    AHP는 인간의 의사결정 과정을 수학적으로 모델링한 다기준 의사결정 기법입니다.
                  </p>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
                      <li>• <strong>계층적 분해:</strong> 복잡한 문제를 단계별로 분해</li>
                      <li>• <strong>쌍대비교:</strong> 두 요소씩 비교하여 중요도 측정</li>
                      <li>• <strong>고유벡터:</strong> 가중치 도출을 위한 수학적 기법</li>
                      <li>• <strong>일관성 검증:</strong> 판단의 논리적 일관성 확인</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">2️⃣</span> 학술적 타당성
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    AHP는 수많은 학술 연구에서 검증된 신뢰할 수 있는 연구방법론입니다.
                  </p>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
                      <li>• <strong>수학적 근거:</strong> 고유벡터와 행렬 이론 기반</li>
                      <li>• <strong>심리학적 근거:</strong> 인간의 인지 능력 고려</li>
                      <li>• <strong>실증적 검증:</strong> 다양한 분야에서 검증됨</li>
                      <li>• <strong>국제적 인정:</strong> OR, MS 분야 표준 기법</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'research-design':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🔬 AHP 연구 설계 프로세스
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📋 연구 설계 단계
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>1단계: 연구 문제 정의</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 연구 목적 명확화</li>
                        <li>• 의사결정 문제 구체화</li>
                        <li>• 연구 범위 설정</li>
                        <li>• 기대 성과 정의</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>2단계: 문헌 조사</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 관련 연구 분석</li>
                        <li>• 이론적 배경 구축</li>
                        <li>• 연구 가설 설정</li>
                        <li>• 평가 기준 도출</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎯 연구 설계 고려사항
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">👥</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>참여자 선정</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>전문가 그룹 구성</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>표본 크기</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>통계적 유의성</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">⏰</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>연구 일정</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>단계별 계획</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'hierarchy-design':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🌲 계층구조 설계 방법론
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📐 계층구조 설계 원칙
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>기본 원칙</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 상호 배타성: 기준 간 중복 없음</li>
                        <li>• 완전성: 모든 중요 요소 포함</li>
                        <li>• 동질성: 동일 계층 내 유사성</li>
                        <li>• 독립성: 기준 간 상호 독립</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>구조적 요구사항</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 계층 수: 3-5단계 권장</li>
                        <li>• 기준 수: 계층당 5-9개 권장</li>
                        <li>• 균형성: 계층별 균등 분포</li>
                        <li>• 명확성: 기준 정의 구체화</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🏗️ 계층구조 개발 프로세스
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-blue-600">1단계</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>목표 설정</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>연구의 최종 목표를 명확히 정의</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-green-600">2단계</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>주기준 도출</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>문헌조사 및 전문가 의견을 통한 주요 기준 식별</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-purple-600">3단계</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>세부기준 개발</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>주기준을 구체적인 세부 기준으로 분해</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-orange-600">4단계</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>대안 정의</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>평가할 대안들을 구체적으로 정의</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data-collection':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📊 AHP 데이터 수집 방법론
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    👥 전문가 패널 구성
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>선정 기준</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 해당 분야 전문성 (5년 이상)</li>
                        <li>• 의사결정 경험 보유</li>
                        <li>• 객관적 판단 능력</li>
                        <li>• 연구 참여 의지</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>패널 구성</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 규모: 10-20명 권장</li>
                        <li>• 다양성: 배경의 다원화</li>
                        <li>• 균형: 이해관계 균형</li>
                        <li>• 대표성: 모집단 반영</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📝 설문 설계 및 수행
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📋</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>설문지 설계</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>명확한 질문 구성</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>파일럿 테스트</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>사전 검증</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📬</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>데이터 수집</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>체계적 수행</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analysis-methods':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📈 AHP 분석 방법 및 도구
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🧮 수학적 분석 방법
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>개별 분석</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 쌍대비교 매트릭스 구성</li>
                        <li>• 고유벡터 계산</li>
                        <li>• 가중치 도출</li>
                        <li>• 일관성 비율 검증</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>집단 분석</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 기하평균법 적용</li>
                        <li>• 집단 일관성 검증</li>
                        <li>• 합의도 측정</li>
                        <li>• 민감도 분석</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🛠️ 분석 도구 및 소프트웨어
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">🌐</div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>AHP Platform</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>웹기반 도구</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Expert Choice</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>전문 소프트웨어</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📈</div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>SPSS/R</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>통계 패키지</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📋</div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Excel</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>기본 분석</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'validation':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ✅ 타당성 및 신뢰성 검증
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎯 내적 타당성 검증
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">✅</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>일관성 비율</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>CR &lt; 0.1</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>내용 타당성</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>전문가 검토</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">🔄</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>구성 타당성</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>요인 분석</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🔄 신뢰성 검증 방법
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-blue-600">1</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>재검사 신뢰성</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>동일 응답자에게 시간 간격을 두고 재측정</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-green-600">2</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>내적 일관성</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cronbach's α 계수 활용</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-purple-600">3</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>평가자 간 신뢰성</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>ICC(Intraclass Correlation) 계산</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reporting':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📋 AHP 연구 보고서 작성 가이드
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📝 논문 구성 요소
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>필수 섹션</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 서론: 연구 배경 및 목적</li>
                        <li>• 문헌고찰: 이론적 배경</li>
                        <li>• 연구방법: AHP 적용 과정</li>
                        <li>• 결과: 분석 결과 제시</li>
                        <li>• 결론: 시사점 및 한계</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>AHP 특화 내용</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 계층구조 모델 제시</li>
                        <li>• 전문가 패널 구성</li>
                        <li>• 일관성 검증 결과</li>
                        <li>• 민감도 분석</li>
                        <li>• 정책 제언</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📊 결과 제시 방법
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📈</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>가중치 표</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>수치 결과</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">🌲</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>계층구조도</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>시각적 표현</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>민감도 그래프</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>안정성 검증</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎯 학술적 기여 강조점
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>이론적 기여</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>기존 이론의 확장 또는 새로운 관점 제시</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>방법론적 기여</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AHP 적용의 새로운 접근법 또는 개선점</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>실무적 기여</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>정책 또는 경영 의사결정에 대한 실질적 제언</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                섹션을 선택해주세요
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                왼쪽 목차에서 관심 있는 섹션을 선택하여 자세한 내용을 확인하세요.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 헤더 */}
      <div className="p-6 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
               style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
            🎓
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              AHP 연구방법론 완전 가이드
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              학술 연구와 전문 의사결정 분석을 위한 체계적 방법론 가이드
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 사이드 네비게이션 */}
        <div className="w-80 border-r" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔬 목차
            </h3>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all hover:scale-105 ${
                    activeSection === section.id ? 'shadow-md' : ''
                  }`}
                  style={{
                    backgroundColor: activeSection === section.id ? 'var(--accent-primary)' : 'var(--bg-primary)',
                    color: activeSection === section.id ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border-light)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ResearcherGuidePage;