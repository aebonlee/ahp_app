/**
 * AI연구 지원 활용 가이드 페이지
 * AHP 연구에서 AI 도구들을 효과적으로 활용하는 방법을 안내
 */

import React, { useState } from 'react';

const AIResearchGuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: 'AI 연구 지원 개요', icon: '🤖' },
    { id: 'paper-assistant', title: 'AI 논문 작성 도우미', icon: '📝' },
    { id: 'results-interpretation', title: '결과 해석 지원', icon: '📊' },
    { id: 'quality-validation', title: '연구 품질 검증', icon: '🔍' },
    { id: 'materials-generation', title: '학술자료 생성', icon: '📚' },
    { id: 'chatbot-assistant', title: '연구 상담 챗봇', icon: '💬' },
    { id: 'best-practices', title: '활용 모범 사례', icon: '⭐' },
    { id: 'tips-tricks', title: '효과적인 사용법', icon: '💡' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🤖 AI 연구 지원 도구 활용 가이드
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                AHP 연구에서 AI 도구들을 효과적으로 활용하여 연구 품질을 높이고 효율성을 개선하는 방법을 안내합니다.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>📝 논문 작성 지원</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>AI가 AHP 연구 논문의 구조화, 문헌고찰, 결과 해석을 도와드립니다.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>📊 데이터 분석 지원</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>복잡한 AHP 결과를 쉽게 이해할 수 있도록 해석하고 시각화합니다.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>🔍 품질 검증</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>연구 방법론과 결과의 타당성을 자동으로 검토하고 개선점을 제안합니다.</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>💬 실시간 상담</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>연구 과정 중 궁금한 점을 AI 챗봇에게 즉시 문의할 수 있습니다.</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                🎯 AI 도구 활용의 장점
              </h3>
              <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li>• <strong>시간 절약:</strong> 반복적인 작업을 자동화하여 연구 시간을 단축</li>
                <li>• <strong>품질 향상:</strong> 객관적인 검토와 개선 제안으로 연구 품질 향상</li>
                <li>• <strong>일관성 확보:</strong> 표준화된 프로세스로 연구의 일관성 유지</li>
                <li>• <strong>접근성 개선:</strong> 복잡한 AHP 방법론을 쉽게 이해하고 적용</li>
                <li>• <strong>실시간 지원:</strong> 24/7 연구 지원으로 언제든 도움 받기 가능</li>
              </ul>
            </div>
          </div>
        );

      case 'paper-assistant':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📝 AI 논문 작성 도우미 활용법
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>1. 연구 주제 구체화</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    막연한 연구 아이디어를 구체적인 AHP 연구 주제로 발전시킬 수 있도록 도와드립니다.
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>예시 프롬프트:</strong><br/>
                    "교육 분야에서 AHP를 활용한 연구 주제를 제안해주세요"
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>2. 문헌고찰 지원</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    관련 선행연구를 정리하고 연구 gap을 찾는데 도움을 받을 수 있습니다.
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>활용 방법:</strong><br/>
                    • 키워드 추천 및 검색 전략 제안<br/>
                    • 문헌 요약 및 분류<br/>
                    • 연구 gap 분석
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>3. 논문 구조 설계</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    AHP 연구 논문의 표준적인 구조와 각 섹션별 내용을 제안받을 수 있습니다.
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>제공 내용:</strong><br/>
                    • 논문 개요 및 구조<br/>
                    • 각 챕터별 세부 내용<br/>
                    • 학술지별 투고 가이드라인
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'results-interpretation':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📊 결과 해석 지원 활용법
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>가중치 분석 해석</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    AHP 분석 결과로 도출된 가중치들의 의미와 실무적 시사점을 해석해드립니다.
                  </p>
                  <ul className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 각 기준별 중요도 순위의 의미</li>
                    <li>• 가중치 차이의 실질적 영향</li>
                    <li>• 의사결정에 미치는 영향 분석</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>일관성 비율 분석</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    일관성 비율(CR) 결과를 해석하고 개선 방안을 제시해드립니다.
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>해석 기준:</strong><br/>
                    • CR &le; 0.1: 일관성 양호<br/>
                    • 0.1 &lt; CR &le; 0.2: 주의 필요<br/>
                    • CR &gt; 0.2: 재평가 권장
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>민감도 분석</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    주요 기준의 가중치 변화가 최종 결과에 미치는 영향을 분석해드립니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quality-validation':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🔍 연구 품질 검증 도구
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>방법론 검증</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    AHP 방법론이 올바르게 적용되었는지 자동으로 검증합니다.
                  </p>
                  <ul className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 계층구조의 적절성 검토</li>
                    <li>• 평가 기준의 독립성 확인</li>
                    <li>• 평가 척도 사용의 적절성</li>
                    <li>• 표본 크기의 적정성</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>데이터 품질 검사</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    수집된 평가 데이터의 품질을 종합적으로 검토합니다.
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>검사 항목:</strong><br/>
                    • 응답 완성도<br/>
                    • 이상치 탐지<br/>
                    • 일관성 패턴 분석<br/>
                    • 편향성 검토
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>개선점 제안</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    발견된 문제점에 대한 구체적인 개선 방안을 제시합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'materials-generation':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📚 학술자료 생성 도구
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>발표 자료 생성</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    연구 결과를 효과적으로 발표할 수 있는 프레젠테이션 자료를 생성합니다.
                  </p>
                  <ul className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 연구 개요 슬라이드</li>
                    <li>• 방법론 설명 다이어그램</li>
                    <li>• 결과 시각화 차트</li>
                    <li>• 결론 및 시사점 정리</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>보고서 템플릿</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    다양한 용도의 연구 보고서 템플릿을 제공합니다.
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>제공 템플릿:</strong><br/>
                    • 학술논문 형식<br/>
                    • 연구보고서 형식<br/>
                    • 정책제안서 형식<br/>
                    • 컨설팅 보고서 형식
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>인포그래픽 생성</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    복잡한 AHP 결과를 이해하기 쉬운 인포그래픽으로 변환합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'chatbot-assistant':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                💬 연구 상담 챗봇 활용법
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>실시간 질의응답</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    연구 과정 중 궁금한 점을 언제든지 물어보고 즉시 답변을 받을 수 있습니다.
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>질문 예시:</strong><br/>
                    • "AHP에서 9점 척도를 사용하는 이유는?"<br/>
                    • "일관성 비율이 0.15가 나왔는데 어떻게 해야 하나요?"<br/>
                    • "계층구조를 어떻게 설계해야 하나요?"
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>단계별 가이드</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    연구 진행 단계에 맞는 구체적인 가이드를 제공받을 수 있습니다.
                  </p>
                  <ul className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 연구 설계 단계별 체크리스트</li>
                    <li>• 데이터 수집 방법 가이드</li>
                    <li>• 분석 결과 해석 도움</li>
                    <li>• 논문 작성 팁</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>문제 해결 지원</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    연구 과정에서 발생하는 문제들에 대한 해결책을 제안받을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'best-practices':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ⭐ AI 도구 활용 모범 사례
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>효과적인 프롬프트 작성법</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    AI 도구로부터 최적의 결과를 얻기 위한 프롬프트 작성 방법
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>좋은 프롬프트 예시:</strong><br/>
                    "교육 분야 AHP 연구에서 교사 만족도를 평가하기 위한 계층구조를 설계해주세요. 
                    주요 평가 기준 3-4개와 각 기준별 세부 요소들을 포함해서 제안해주세요."
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>도구별 활용 전략</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    각 AI 도구의 특성을 고려한 효과적인 활용 전략
                  </p>
                  <ul className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>논문 작성 도우미:</strong> 구체적인 섹션별 요청</li>
                    <li>• <strong>결과 해석:</strong> 데이터와 함께 맥락 정보 제공</li>
                    <li>• <strong>품질 검증:</strong> 단계별 검토 요청</li>
                    <li>• <strong>챗봇:</strong> 명확하고 구체적인 질문</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>연구 단계별 활용법</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    연구 진행 단계에 따른 AI 도구의 전략적 활용
                  </p>
                  <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>1단계 (기획):</strong> 논문 작성 도우미 + 챗봇<br/>
                    <strong>2단계 (설계):</strong> 품질 검증 + 챗봇<br/>
                    <strong>3단계 (분석):</strong> 결과 해석 + 품질 검증<br/>
                    <strong>4단계 (작성):</strong> 학술자료 생성 + 논문 작성 도우미
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tips-tricks':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                💡 효과적인 사용법 및 팁
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>시간 절약 팁</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 템플릿을 먼저 생성하고 내용을 채워나가세요</li>
                    <li>• 반복적인 작업은 AI 도구로 자동화하세요</li>
                    <li>• 이전 결과를 재활용하여 일관성을 유지하세요</li>
                    <li>• 단계별로 검증하며 진행하세요</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>품질 향상 팁</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• AI 결과를 맹신하지 말고 항상 검토하세요</li>
                    <li>• 여러 도구를 조합하여 교차 검증하세요</li>
                    <li>• 도메인 전문가의 검토를 받으세요</li>
                    <li>• 최신 연구 동향을 반영하세요</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>주의사항</h3>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <p className="mb-2"><strong>⚠️ 다음 사항들을 주의하세요:</strong></p>
                    <ul className="space-y-1">
                      <li>• AI 생성 내용의 정확성을 항상 확인</li>
                      <li>• 인용 및 참고문헌의 정확성 검증 필요</li>
                      <li>• 연구윤리 및 표절 방지 철저히 준수</li>
                      <li>• 개인정보 및 민감정보 입력 금지</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                  <h3 className="font-semibold mb-2">🎯 성공적인 AI 활용을 위한 핵심 원칙</h3>
                  <p className="text-sm">
                    AI는 도구일 뿐입니다. 연구자의 전문성과 판단력이 가장 중요하며, 
                    AI는 이를 보완하고 향상시키는 역할을 한다는 점을 항상 기억하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>콘텐츠를 찾을 수 없습니다.</div>;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            🤖 AI연구 지원 활용 가이드
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            AHP 연구에서 AI 도구들을 효과적으로 활용하는 방법을 단계별로 안내합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  📚 가이드 목차
                </h2>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        activeSection === section.id
                          ? 'font-semibold'
                          : 'hover:bg-opacity-50'
                      }`}
                      style={{
                        backgroundColor: activeSection === section.id ? 'var(--accent-primary)' : 'transparent',
                        color: activeSection === section.id ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      <span>{section.icon}</span>
                      <span className="text-sm">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResearchGuidePage;