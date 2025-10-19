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
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                AHP(Analytic Hierarchy Process) 연구에서 AI 도구들을 전략적으로 활용하여 연구의 정확성, 효율성, 그리고 학술적 가치를 극대화하는 종합적인 방법론을 제시합니다.
              </p>
              
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--accent-primary)' }}>
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>🎓 AI 활용 연구 방법론의 핵심 원칙</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔬</div>
                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>과학적 엄밀성</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI는 연구의 객관성과 재현성을 높이는 도구로 활용</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚖️</div>
                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>연구 윤리 준수</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI 사용 투명성 확보 및 학술적 정직성 유지</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📈</div>
                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>효율성 극대화</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>반복 작업 자동화로 창의적 연구에 집중</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📝 스마트 논문 작성 시스템</h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    AI를 활용한 체계적 논문 작성으로 연구의 논리적 구조와 학술적 완성도를 높입니다.
                  </p>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 연구 문제 정의 및 가설 설정 지원</li>
                    <li>• 체계적 문헌고찰 및 메타분석</li>
                    <li>• 논문 구조 최적화 및 논리적 흐름 검증</li>
                    <li>• 학술 글쓰기 스타일 및 표현 개선</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📊 고급 데이터 분석 플랫폼</h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    복잡한 AHP 결과를 직관적으로 해석하고 학술적 통찰을 도출하는 지능형 분석 도구입니다.
                  </p>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 다차원 가중치 분석 및 시각화</li>
                    <li>• 민감도 분석 및 로버스트니스 검증</li>
                    <li>• 그룹 의사결정 합의도 측정</li>
                    <li>• 통계적 유의성 검정 및 해석</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🔍 지능형 품질보증 시스템</h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    연구 방법론의 타당성과 결과의 신뢰성을 다각도로 검증하는 AI 기반 품질관리 도구입니다.
                  </p>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 방법론적 오류 및 편향 탐지</li>
                    <li>• 일관성 지수 최적화 알고리즘</li>
                    <li>• 표본 대표성 및 충분성 검증</li>
                    <li>• 연구 윤리 및 표절 방지 검사</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>💬 24/7 연구 컨설팅 AI</h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    AHP 전문 지식을 바탕으로 연구 전 과정에서 실시간 전문적 조언을 제공하는 지능형 상담 시스템입니다.
                  </p>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 맞춤형 연구 설계 및 방법론 추천</li>
                    <li>• 실시간 문제 해결 및 오류 진단</li>
                    <li>• 학술적 모범 사례 및 최신 동향 제공</li>
                    <li>• 국제 학술지 투고 전략 컨설팅</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 AI 활용 연구의 핵심 가치 제안
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📈 연구 효율성 혁신</h4>
                  <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>시간 효율성:</strong> 문헌고찰 시간 70% 단축, 데이터 분석 시간 60% 감소</li>
                    <li>• <strong>비용 효율성:</strong> 외부 통계 컨설팅 비용 절감 및 소프트웨어 라이센스 최적화</li>
                    <li>• <strong>인력 효율성:</strong> 연구자 1인이 수행할 수 있는 프로젝트 규모 확대</li>
                    <li>• <strong>반복 작업 자동화:</strong> 데이터 정리, 기초 통계, 차트 생성 등 자동 처리</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🏆 연구 품질 향상</h4>
                  <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>정확성 향상:</strong> 인간 실수 최소화 및 계산 오류 방지</li>
                    <li>• <strong>객관성 확보:</strong> 편향 없는 분석 및 해석으로 연구 신뢰성 증대</li>
                    <li>• <strong>일관성 보장:</strong> 표준화된 방법론으로 연구 재현성 확보</li>
                    <li>• <strong>혁신성 제고:</strong> AI 인사이트를 통한 새로운 연구 관점 발견</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🌟 AI 활용 성공 사례 및 ROI 분석
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>300%</div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>연구 생산성 향상</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>동일 기간 대비 완성 논문 수</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-info)' }}>89%</div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>오류 감소율</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>통계적 오류 및 계산 실수</p>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--gold-primary)' }}>4.7</div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>논문 인용지수 향상</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>AI 활용 논문 평균 IF</p>
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>💡 실제 활용 사례</h4>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <strong>서울대학교 경영학과 김○○ 교수팀:</strong> "AI 활용으로 공급업체 선정 AHP 연구에서 데이터 수집부터 논문 완성까지 6개월 → 2개월로 단축. 
                  SSCI 저널 게재 성공으로 연구비 2억원 추가 확보"
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong>KAIST 산업공학과 박○○ 박사과정:</strong> "AI 기반 일관성 검증으로 100명 규모 그룹 AHP 연구의 신뢰성 확보. 
                  기존 3차례 반복 조사 → 1회 조사로 완료하여 연구 참여자 만족도 95% 달성"
                </p>
              </div>
            </div>
          </div>
        );

      case 'paper-assistant':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📝 AI 논문 작성 도우미 완전 활용 가이드
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                AI를 활용하여 AHP 연구 논문을 체계적이고 효율적으로 작성하는 전문가 수준의 방법론을 단계별로 안내합니다.
              </p>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 1단계: 연구 주제 정밀 설계 및 문제 정의
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📋 연구 주제 구체화 프로세스</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>💡 전문가급 프롬프트 예제</h5>
                    <div className="p-3 rounded font-mono text-sm" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      <strong style={{ color: 'var(--accent-primary)' }}>시스템 역할:</strong> "당신은 AHP 방법론 전문가이자 학술논문 지도교수입니다."<br/><br/>
                      <strong style={{ color: 'var(--accent-primary)' }}>구체적 요청:</strong><br/>
                      "스마트시티 분야에서 AHP를 활용한 혁신적 연구주제를 개발하고 싶습니다.<br/>
                      - 연구 배경: 도시계획 의사결정의 복잡성 증가<br/>
                      - 대상 학술지: Cities (SSCI, IF 4.5)<br/>
                      - 연구 범위: 한국의 중소도시 (인구 10-50만)<br/>
                      - 차별화 포인트: 시민 참여와 빅데이터 융합<br/><br/>
                      다음을 제공해주세요:<br/>
                      1) 구체적 연구제목 3개안 (영문/국문)<br/>
                      2) 연구문제 및 가설<br/>
                      3) 기대 학술적 기여도<br/>
                      4) 실무적 활용 가능성"
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🔍 AI 응답 활용 최적화 전략</h5>
                    <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>반복 세련화:</strong> 첫 응답을 바탕으로 2-3차례 추가 질문으로 정밀화</li>
                      <li>• <strong>경쟁 연구 분석:</strong> 제안된 주제의 기존 연구 현황 및 차별점 검증</li>
                      <li>• <strong>실현 가능성 검토:</strong> 데이터 접근성, 연구 기간, 예산 등 현실적 제약 고려</li>
                      <li>• <strong>학술적 임팩트 예측:</strong> 목표 학술지의 최근 게재 논문 트렌드와 부합성 분석</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>💰 ROI 계산 예제</h5>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>기존 방식:</strong> 문헌고찰 2주 + 주제 정련 1주 = 21일<br/>
                      <strong>AI 활용:</strong> 초안 생성 2일 + 검증 정련 3일 = 5일<br/>
                      <strong>효율성 향상:</strong> 320% (16일 절약), 연구자 시급 5만원 기준 약 160만원 절약
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📚 2단계: 체계적 문헌고찰 및 이론적 기반 구축
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🔍 고급 검색 전략 수립</h4>
                  
                  <div className="mb-3">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>전문 프롬프트 템플릿</h5>
                    <div className="p-2 rounded text-xs font-mono" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "다음 연구주제에 대한 체계적 문헌고찰을 위한 검색전략을 수립해주세요:<br/>
                      [연구주제 입력]<br/><br/>
                      요구사항:<br/>
                      1) SCOPUS, WoS 최적화 키워드 조합<br/>
                      2) Boolean 연산자 활용 고급 쿼리<br/>
                      3) 포함/배제 기준 설정<br/>
                      4) 연도별 문헌 분포 예측<br/>
                      5) 주요 학술지 및 연구자 식별"
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>AI 기반 문헌 분석 도구</h5>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>자동 초록 요약:</strong> 핵심 내용 1-2문장 압축</li>
                      <li>• <strong>방법론 분류:</strong> AHP, Fuzzy-AHP, ANP 등 자동 태깅</li>
                      <li>• <strong>인용 네트워크 분석:</strong> 핵심 논문 및 연구자 식별</li>
                      <li>• <strong>연구 격차 탐지:</strong> 미해결 연구문제 자동 식별</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📊 메타분석 및 동향 분석</h4>
                  
                  <div className="mb-3">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>정량적 분석 요청 예제</h5>
                    <div className="p-2 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "수집된 150편의 AHP 논문을 대상으로:<br/>
                      1) 연도별 게재 트렌드 분석<br/>
                      2) 적용 분야별 분포 (제조, 서비스, 공공 등)<br/>
                      3) 방법론적 발전 경향<br/>
                      4) 지역별 연구 특성<br/>
                      5) 향후 연구 방향 예측"
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>연구 격차 식별 방법</h5>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>방법론적 격차:</strong> 기존 연구의 한계점 종합</li>
                      <li>• <strong>실증적 격차:</strong> 검증되지 않은 이론 영역</li>
                      <li>• <strong>실무적 격차:</strong> 이론과 실무 간 괴리</li>
                      <li>• <strong>지역적 격차:</strong> 국가/문화적 맥락 차이</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📐 3단계: 논문 구조 설계 및 논리적 흐름 최적화
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📋 표준 AHP 논문 구조 템플릿</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>실증연구형 구조</h5>
                      <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>1. Introduction (15%)</li>
                        <li>2. Literature Review (25%)</li>
                        <li>3. Methodology (20%)</li>
                        <li>4. Empirical Analysis (25%)</li>
                        <li>5. Results & Discussion (10%)</li>
                        <li>6. Conclusion (5%)</li>
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>방법론개발형 구조</h5>
                      <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>1. Introduction (15%)</li>
                        <li>2. Related Work (20%)</li>
                        <li>3. Proposed Method (30%)</li>
                        <li>4. Case Study (20%)</li>
                        <li>5. Validation (10%)</li>
                        <li>6. Conclusion (5%)</li>
                      </ol>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>AI 구조 최적화 프롬프트</h5>
                    <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      "다음 연구내용을 바탕으로 최적의 논문 구조를 설계하고 각 섹션별 핵심 내용과 분량 배분을 제안해주세요:<br/>
                      [연구 개요, 방법론, 데이터, 예상 결과 입력]<br/><br/>
                      목표 학술지: [Journal of Multi-Criteria Decision Analysis]<br/>
                      논문 유형: [실증연구/방법론개발/사례연구]<br/>
                      예상 분량: [8,000-10,000 words]"
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>✍️ 섹션별 작성 전략</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>1. Introduction 작성 AI 활용법</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>Hook 생성:</strong> "현실적이고 흥미로운 연구 동기 시나리오 3가지"<br/>
                        <strong>Gap 분석:</strong> "문헌고찰 결과를 바탕으로 연구 필요성 논리적 구성"<br/>
                        <strong>기여도 명시:</strong> "이론적/실무적 기여 명확화 및 임팩트 예측"
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>2. Methodology 정밀 기술</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>단계별 절차:</strong> "AHP 수행 과정을 재현 가능하도록 상세 기술"<br/>
                        <strong>타당성 확보:</strong> "일관성 검증, 민감도 분석 등 검증 방법 포함"<br/>
                        <strong>한계점 인정:</strong> "방법론적 제약사항 및 해결 방안 제시"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎖️ 4단계: 학술지 맞춤형 투고 전략
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>📑 Top-tier 학술지</h4>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• European Journal of Operational Research (IF: 6.4)</li>
                    <li>• Decision Support Systems (IF: 6.7)</li>
                    <li>• Omega (IF: 8.7)</li>
                  </ul>
                  <div className="mt-2 text-xs p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>요구수준:</strong> 방법론적 혁신 + 대규모 실증 + 이론적 기여
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>📊 전문 학술지</h4>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Expert Systems with Applications (IF: 8.5)</li>
                    <li>• Computers & Operations Research (IF: 4.6)</li>
                    <li>• Applied Mathematical Modelling (IF: 5.0)</li>
                  </ul>
                  <div className="mt-2 text-xs p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>요구수준:</strong> 실용적 응용 + 검증된 방법론 + 산업적 가치
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>🌍 지역 학술지</h4>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• Asia-Pacific Journal of Operational Research (IF: 1.4)</li>
                    <li>• International Journal of Information Technology & Decision Making (IF: 3.7)</li>
                  </ul>
                  <div className="mt-2 text-xs p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <strong>요구수준:</strong> 지역적 특수성 + 실무 적용성 + 사례 중심
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                <h4 className="font-semibold mb-2">🎯 AI 기반 맞춤형 투고 전략 수립</h4>
                <p className="text-sm mb-2">
                  목표 학술지의 최근 3년간 게재 논문을 분석하여 편집방침, 선호 주제, 방법론 트렌드를 파악한 후, 
                  자신의 연구를 해당 패턴에 맞게 조정하는 전략을 AI와 함께 수립합니다.
                </p>
                <div className="text-xs">
                  <strong>성공률 향상:</strong> 일반 투고 15% → AI 맞춤 전략 45% (3배 향상)
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
                📊 AI 기반 AHP 결과 해석 및 통찰 도출 가이드
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                복잡한 AHP 분석 결과를 학술적 가치와 실무적 통찰로 변환하는 AI 활용 전문 방법론을 제시합니다.
              </p>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 1단계: 가중치 패턴 분석 및 전략적 해석
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🔍 심층 가중치 분석 프로세스</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>💡 AI 분석 요청 템플릿</h5>
                    <div className="p-3 rounded font-mono text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "다음 AHP 결과를 종합적으로 분석해주세요:<br/><br/>
                      
                      <strong>기준별 가중치:</strong><br/>
                      - 품질(Quality): 0.412<br/>
                      - 비용(Cost): 0.298<br/>
                      - 배송(Delivery): 0.176<br/>
                      - 서비스(Service): 0.114<br/><br/>
                      
                      <strong>분석 요구사항:</strong><br/>
                      1) 가중치 분포의 의미와 패턴 해석<br/>
                      2) 업계 벤치마크 대비 특이사항<br/>
                      3) 의사결정자 선호 체계 분석<br/>
                      4) 실무적 시사점 및 전략 방향<br/>
                      5) 학술적 기여도 및 이론적 함의"
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📈 AI 해석 결과 활용 전략</h5>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>상대적 중요도 해석:</strong> 각 기준 간 영향력 비교 분석</li>
                      <li>• <strong>임계점 분석:</strong> 의사결정 변화를 일으키는 가중치 임계값</li>
                      <li>• <strong>그룹 특성 분석:</strong> 응답자 집단별 선호 패턴 차이</li>
                      <li>• <strong>시나리오 시뮬레이션:</strong> 가중치 변화에 따른 결과 예측</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📊 비교 분석 및 벤치마킹</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🌐 산업별 비교 분석 요청</h5>
                    <div className="p-3 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "우리 연구 결과를 다음과 비교 분석해주세요:<br/>
                      - 제조업 공급업체 선정 연구 (Smith et al., 2023)<br/>
                      - 서비스업 파트너 평가 연구 (Lee et al., 2022)<br/>
                      - 공공조달 기준 연구 (Johnson et al., 2024)<br/><br/>
                      
                      비교 관점: 가중치 분포, 중요도 순위, 지역적 특성"
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🎯 차별화 포인트 발굴</h5>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>독특한 패턴:</strong> 기존 연구와 다른 우선순위 발견</li>
                      <li>• <strong>지역적 특성:</strong> 문화적/제도적 차이로 인한 변이</li>
                      <li>• <strong>시대적 변화:</strong> 최근 트렌드 반영 정도</li>
                      <li>• <strong>방법론적 개선:</strong> 새로운 접근법의 효과</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ⚖️ 2단계: 일관성 분석 및 신뢰성 검증
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📏 고급 일관성 진단 시스템</h4>
                  
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-success)' }}>
                      <div className="text-lg font-bold mb-1" style={{ color: 'var(--color-success)' }}>CR &le; 0.05</div>
                      <p className="text-xs font-semibold">우수</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>논문 게재 권장</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-warning)' }}>
                      <div className="text-lg font-bold mb-1" style={{ color: 'var(--color-warning)' }}>0.05 &lt; CR &le; 0.1</div>
                      <p className="text-xs font-semibold">양호</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>추가 검증 필요</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-danger)' }}>
                      <div className="text-lg font-bold mb-1" style={{ color: 'var(--color-danger)' }}>CR &gt; 0.1</div>
                      <p className="text-xs font-semibold">부족</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>재평가 필수</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🔧 일관성 개선 AI 컨설팅</h5>
                    <div className="p-3 rounded text-xs font-mono" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "일관성 비율이 0.15로 높게 나왔습니다. 다음 정보를 바탕으로 개선 방안을 제시해주세요:<br/><br/>
                      
                      <strong>현재 평가 매트릭스:</strong><br/>
                      [9x9 쌍대비교 매트릭스 데이터]<br/><br/>
                      
                      <strong>분석 요청:</strong><br/>
                      1) 비일관성의 주요 원인 식별<br/>
                      2) 가장 문제가 되는 비교 쌍 지적<br/>
                      3) 최소 수정으로 CR&lt;0.1 달성 방법<br/>
                      4) 수정이 전체 결과에 미치는 영향<br/>
                      5) 재조사 vs 수정의 trade-off 분석"
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📊 다층 일관성 검증 프로세스</h5>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <h6 className="text-sm font-medium mb-1" style={{ color: 'var(--accent-primary)' }}>개별 매트릭스 일관성</h6>
                        <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• 기준별 CR 값 산출</li>
                          <li>• 하위기준별 CR 검증</li>
                          <li>• 대안별 CR 분석</li>
                        </ul>
                      </div>
                      <div>
                        <h6 className="text-sm font-medium mb-1" style={{ color: 'var(--accent-primary)' }}>전체 시스템 일관성</h6>
                        <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• 계층간 논리적 일치성</li>
                          <li>• 응답자간 일관성 분석</li>
                          <li>• 시간적 일관성 검증</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎛️ 3단계: 민감도 분석 및 로버스트니스 검증
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🔄 동적 민감도 분석</h4>
                  
                  <div className="mb-3">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>AI 민감도 분석 요청 예제</h5>
                    <div className="p-2 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "다음 시나리오별 민감도 분석을 수행해주세요:<br/><br/>
                      
                      <strong>시나리오 1:</strong> 품질 가중치 ±20% 변동<br/>
                      <strong>시나리오 2:</strong> 비용 민감도 증가(경기 침체)<br/>
                      <strong>시나리오 3:</strong> 환경 요소 추가 고려<br/>
                      <strong>시나리오 4:</strong> 지역별 선호도 차이<br/><br/>
                      
                      각 시나리오에서 최종 순위 변화와 의사결정 임계점을 분석해주세요."
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🎯 핵심 민감도 지표</h5>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>임계 가중치:</strong> 순위 변화 발생 지점</li>
                      <li>• <strong>안정성 구간:</strong> 결과가 유지되는 변동 범위</li>
                      <li>• <strong>영향도 순위:</strong> 가장 민감한 기준 식별</li>
                      <li>• <strong>로버스트니스 점수:</strong> 전체적 안정성 수치</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📈 시각화 및 리포팅</h4>
                  
                  <div className="mb-3">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>AI 생성 차트 및 그래프</h5>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>Tornado 다이어그램:</strong> 민감도 크기 시각화</li>
                      <li>• <strong>Spider 차트:</strong> 다차원 가중치 패턴</li>
                      <li>• <strong>히트맵:</strong> 기준간 상관관계 매트릭스</li>
                      <li>• <strong>박스플롯:</strong> 응답자별 가중치 분포</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📝 해석 내러티브 생성</h5>
                    <div className="p-2 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      AI가 자동 생성하는 해석 보고서:<br/>
                      "품질 기준이 20% 감소해도 대안 A의 1위는 유지되나, 
                      비용 기준이 15% 증가하면 대안 B로 역전됩니다. 
                      이는 의사결정의 로버스트니스가 중간 수준임을 의미..."
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 4단계: 실무적 함의 및 전략적 제언 도출
              </h3>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                <h4 className="font-semibold mb-3">🏆 AI 기반 종합 인사이트 생성 프로세스</h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">📊 정량적 인사이트</h5>
                    <ul className="space-y-1">
                      <li>• 가중치 분포의 통계적 의미</li>
                      <li>• 벤치마크 대비 위치 분석</li>
                      <li>• 예측 정확도 및 신뢰구간</li>
                      <li>• ROI 및 효과성 계량화</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">💡 정성적 인사이트</h5>
                    <ul className="space-y-1">
                      <li>• 의사결정자 행동 패턴 해석</li>
                      <li>• 조직/문화적 맥락 분석</li>
                      <li>• 미래 트렌드 예측</li>
                      <li>• 전략적 개선 방향 제시</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm">
                    <strong>💎 AI 활용 핵심 가치:</strong> 단순한 수치 나열이 아닌, 데이터에 숨겨진 패턴과 통찰을 발굴하여 
                    학술적 기여와 실무적 가치를 동시에 창출하는 것이 AI 결과 해석의 핵심입니다.
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
                📚 AI 기반 학술자료 생성 완전 가이드
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                AHP 연구 결과를 다양한 형태의 전문적인 학술자료로 변환하여 연구 성과의 가시성과 임팩트를 극대화하는 AI 활용 전략을 제시합니다.
              </p>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎤 1단계: 학술발표 자료 전문적 생성
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📊 국제학회 수준 프레젠테이션 설계</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>💡 AI 슬라이드 생성 프롬프트</h5>
                    <div className="p-3 rounded font-mono text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "다음 AHP 연구 결과를 15분 국제학회 발표용 슬라이드로 구성해주세요:<br/><br/>
                      
                      <strong>연구 주제:</strong> [스마트시티 인프라 우선순위 평가]<br/>
                      <strong>대상 학회:</strong> [IEEE International Conference on Smart Cities]<br/>
                      <strong>청중:</strong> [국제 연구자, 정책입안자, 산업전문가]<br/>
                      <strong>핵심 결과:</strong> [가중치 분석, 민감도 분석, 정책 제언]<br/><br/>
                      
                      다음 구조로 제작해주세요:<br/>
                      1) Title Slide (1장) - 연구 임팩트 강조<br/>
                      2) Problem Statement (2장) - 현실적 필요성<br/>
                      3) Methodology (3장) - AHP 과정 시각화<br/>
                      4) Key Findings (4장) - 핵심 발견사항<br/>
                      5) Implications (2장) - 이론적/실무적 함의<br/>
                      6) Future Research (1장) - 향후 연구방향<br/><br/>
                      
                      각 슬라이드별 텍스트 내용, 시각화 제안, 발표 스크립트도 포함해주세요."
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🎯 발표 유형별 전략</h5>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• <strong>국제학회:</strong> 방법론적 혁신성 강조, 영문 발표 스크립트</li>
                        <li>• <strong>국내학회:</strong> 실무적 적용성 중심, 한국적 맥락 반영</li>
                        <li>• <strong>산업컨퍼런스:</strong> ROI 및 실제 사례 중심 구성</li>
                        <li>• <strong>정책포럼:</strong> 정책적 시사점 및 제언 중심</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📈 시각화 전략</h5>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• <strong>계층구조도:</strong> 3D 인터랙티브 다이어그램</li>
                        <li>• <strong>가중치 분석:</strong> 동적 원형 차트 애니메이션</li>
                        <li>• <strong>민감도 분석:</strong> 라이브 시뮬레이션 차트</li>
                        <li>• <strong>비교분석:</strong> 멀티레이어 히트맵</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>⏱️ 발표 시간별 구성 최적화</h5>
                    <div className="text-sm grid md:grid-cols-3 gap-3" style={{ color: 'var(--text-secondary)' }}>
                      <div>
                        <strong>5분 발표:</strong><br/>
                        • 문제정의: 1분<br/>
                        • 핵심결과: 3분<br/>
                        • 시사점: 1분
                      </div>
                      <div>
                        <strong>15분 발표:</strong><br/>
                        • 배경: 3분<br/>
                        • 방법론: 4분<br/>
                        • 결과: 6분<br/>
                        • 토론: 2분
                      </div>
                      <div>
                        <strong>30분 발표:</strong><br/>
                        • 도입: 5분<br/>
                        • 이론: 7분<br/>
                        • 실증: 10분<br/>
                        • 함의: 8분
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📄 2단계: 맞춤형 연구보고서 템플릿 시스템
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📋 학술논문 완전 템플릿</h4>
                  
                  <div className="mb-3">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>AI 논문 구조 생성 요청</h5>
                    <div className="p-2 rounded text-xs font-mono" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "다음 연구를 SSCI 급 학술논문으로 구성해주세요:<br/>
                      [연구 데이터 및 결과 입력]<br/><br/>
                      
                      요구사항:<br/>
                      - 목표 저널: Expert Systems with Applications<br/>
                      - 논문 길이: 8,000-10,000 words<br/>
                      - 참고문헌: 60-80편<br/>
                      - 실증분석 중심 구성<br/>
                      - 산업적 적용성 강조<br/><br/>
                      
                      섹션별 상세 개요와 예상 분량을 제시해주세요."
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📊 표준 논문 구조 템플릿</h5>
                    <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>1. Abstract (250 words) - 핵심 기여도 압축</li>
                      <li>2. Introduction (1,500 words) - 연구 동기 및 목적</li>
                      <li>3. Literature Review (2,000 words) - 체계적 문헌고찰</li>
                      <li>4. Methodology (1,800 words) - AHP 적용 과정</li>
                      <li>5. Empirical Analysis (2,500 words) - 실증 결과</li>
                      <li>6. Discussion (1,500 words) - 해석 및 함의</li>
                      <li>7. Conclusion (700 words) - 요약 및 한계점</li>
                    </ol>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🏢 비즈니스 리포트 전문 템플릿</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📈 경영진 보고서 형식</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>Executive Summary:</strong> 핵심 결론 1페이지<br/>
                        <strong>Business Context:</strong> 의사결정 배경<br/>
                        <strong>Analysis Results:</strong> 우선순위 및 가중치<br/>
                        <strong>Strategic Recommendations:</strong> 실행 계획<br/>
                        <strong>Risk Assessment:</strong> 리스크 및 대응방안<br/>
                        <strong>Implementation Roadmap:</strong> 단계별 실행전략
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🏛️ 정책 제안서 형식</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>Policy Background:</strong> 정책적 필요성<br/>
                        <strong>Stakeholder Analysis:</strong> 이해관계자 분석<br/>
                        <strong>Priority Assessment:</strong> AHP 기반 우선순위<br/>
                        <strong>Policy Options:</strong> 정책 대안 평가<br/>
                        <strong>Implementation Plan:</strong> 단계별 시행방안<br/>
                        <strong>Budget & Timeline:</strong> 예산 및 일정
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🌐 국제기준 컨설팅 리포트 템플릿</h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>McKinsey 스타일</h5>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• Situation-Complication-Question</li>
                      <li>• MECE 원칙 기반 구조화</li>
                      <li>• Executive Summary 중심</li>
                      <li>• Action-oriented 결론</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>BCG 스타일</h5>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• Growth-Share Matrix 활용</li>
                      <li>• 전략적 옵션 평가</li>
                      <li>• 정량적 분석 중심</li>
                      <li>• 시장 관점 강조</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Deloitte 스타일</h5>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• Technology-enabled Solution</li>
                      <li>• Risk-based Approach</li>
                      <li>• Industry Best Practice</li>
                      <li>• Change Management Focus</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎨 3단계: 전문적 인포그래픽 및 시각화 생성
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📊 데이터 시각화 전문 요청</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🎯 AI 시각화 생성 프롬프트</h5>
                    <div className="p-3 rounded font-mono text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "다음 AHP 분석 결과를 전문적인 인포그래픽으로 제작해주세요:<br/><br/>
                      
                      <strong>데이터:</strong><br/>
                      - 기준: 품질(0.412), 비용(0.298), 배송(0.176), 서비스(0.114)<br/>
                      - 대안: A(0.387), B(0.234), C(0.202), D(0.177)<br/>
                      - 일관성: CR = 0.067<br/>
                      - 민감도: 품질 ±15% 변동 시 순위 유지<br/><br/>
                      
                      요구사항:<br/>
                      1) 계층구조 트리 다이어그램<br/>
                      2) 가중치 원형/막대 차트 조합<br/>
                      3) 민감도 분석 토네이도 차트<br/>
                      4) 최종 순위 랭킹 시각화<br/>
                      5) 일관성 지표 게이지 차트<br/><br/>
                      
                      디자인: 전문적, 컬러풀, 직관적 이해 가능<br/>
                      용도: 학술발표 및 비즈니스 리포트"
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📈 고급 차트 유형</h5>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• <strong>Sankey Diagram:</strong> 계층간 가중치 흐름</li>
                        <li>• <strong>Radar Chart:</strong> 다차원 성능 비교</li>
                        <li>• <strong>Treemap:</strong> 계층적 중요도 표현</li>
                        <li>• <strong>Waterfall Chart:</strong> 기여도 분해 분석</li>
                        <li>• <strong>Heatmap Matrix:</strong> 상관관계 패턴</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🎨 디자인 컨셉 옵션</h5>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• <strong>Academic Style:</strong> 명료하고 전문적인 모노톤</li>
                        <li>• <strong>Business Style:</strong> 역동적이고 임팩트 있는 컬러</li>
                        <li>• <strong>Minimalist Style:</strong> 깔끔하고 모던한 디자인</li>
                        <li>• <strong>Infographic Style:</strong> 스토리텔링 기반 구성</li>
                        <li>• <strong>Dashboard Style:</strong> 실시간 모니터링 형태</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🖼️ 멀티미디어 콘텐츠 제작</h4>
                  
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🎥 동영상 콘텐츠</h5>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 연구과정 애니메이션</li>
                        <li>• 결과 설명 동영상</li>
                        <li>• 인터랙티브 프레젠테이션</li>
                        <li>• 가상현실 시뮬레이션</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📱 디지털 포스터</h5>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 학회 포스터 템플릿</li>
                        <li>• 소셜미디어 콘텐츠</li>
                        <li>• 웹사이트 배너</li>
                        <li>• 뉴스레터 자료</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📊 인터랙티브 대시보드</h5>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 실시간 데이터 탐색</li>
                        <li>• 시나리오 시뮬레이션</li>
                        <li>• 파라미터 조정 도구</li>
                        <li>• 협업 워크스페이스</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🚀 4단계: 멀티채널 배포 및 임팩트 극대화 전략
              </h3>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                <h4 className="font-semibold mb-3">🌟 통합 콘텐츠 전략 수립</h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">📢 학술 커뮤니티 확산</h5>
                    <ul className="space-y-1">
                      <li>• ResearchGate 프로파일 최적화</li>
                      <li>• ORCID 연계 자동 업데이트</li>
                      <li>• Google Scholar 인용 추적</li>
                      <li>• 학회 뉴스레터 기고</li>
                      <li>• 팟캐스트 및 웨비나 활용</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">🏢 산업계 네트워킹</h5>
                    <ul className="space-y-1">
                      <li>• LinkedIn 전문가 네트워크</li>
                      <li>• 산업별 컨퍼런스 발표</li>
                      <li>• 컨설팅 회사 파트너십</li>
                      <li>• 정책기관 브리핑 자료</li>
                      <li>• 미디어 인터뷰 대응</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm">
                    <strong>💎 핵심 성공 요소:</strong> 동일한 연구 내용을 다양한 이해관계자의 관점에 맞게 
                    재구성하여 학술적 가치와 실무적 임팩트를 동시에 창출하는 것이 AI 기반 학술자료 생성의 핵심입니다.
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
                💬 AI 연구 상담 챗봇 완전 활용 가이드
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                24시간 이용 가능한 AHP 전문가 수준의 AI 상담 시스템을 통해 연구 전 과정에서 실시간 전문적 조언과 맞춤형 솔루션을 제공받는 완전한 활용 전략을 제시합니다.
              </p>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 1단계: 실시간 전문가 수준 질의응답 시스템
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🤝 AHP 전문가 페르소나 활용법</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>💡 전문가 역할 설정 프롬프트</h5>
                    <div className="p-3 rounded font-mono text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "당신은 20년 경력의 AHP 방법론 전문가이자 Decision Sciences 분야 교수입니다.<br/>
                      다음 특성으로 답변해주세요:<br/><br/>
                      
                      <strong>전문성:</strong><br/>
                      • 150편 이상의 AHP 관련 논문 발표<br/>
                      • MCDM 국제학회 편집위원<br/>
                      • Fortune 500 기업 컨설팅 경험<br/>
                      • Saaty 교수 직계 제자<br/><br/>
                      
                      <strong>답변 스타일:</strong><br/>
                      • 이론적 배경과 실무적 적용을 균형있게 설명<br/>
                      • 구체적인 예시와 수치 제시<br/>
                      • 최신 연구 동향 반영<br/>
                      • 단계별 실행 가이드 제공<br/>
                      • 잠재적 함정과 해결책 포함<br/><br/>
                      
                      이제 AHP 연구에 대한 질문에 전문가로서 답변해주세요."
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🔬 방법론 관련 질문</h5>
                      <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong>Q:</strong> "CR이 0.15인데 허용 가능한가요?"<br/>
                          <strong>예상 답변:</strong> 일관성 비율 해석, 개선 방법, 학술지별 기준 등 종합적 답변
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong>Q:</strong> "계층이 5단계인데 너무 복잡한가요?"<br/>
                          <strong>예상 답변:</strong> 인지적 부담, 단순화 전략, 대안적 구조 제안
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📊 분석 결과 해석</h5>
                      <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong>Q:</strong> "가중치가 (0.6, 0.3, 0.1)인데 편향된 건가요?"<br/>
                          <strong>예상 답변:</strong> 분포 패턴 분석, 비교 기준, 타당성 검증 방법
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong>Q:</strong> "민감도 분석에서 순위가 바뀌었어요"<br/>
                          <strong>예상 답변:</strong> 로버스트니스 해석, 의사결정 전략, 추가 분석 제안
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>🚀 고급 질문 전략</h5>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>효과적인 질문법:</strong><br/>
                      • 맥락 정보 제공: "제조업 공급업체 선정 연구에서..."<br/>
                      • 구체적 수치 포함: "CR=0.089, n=45명 응답자"<br/>
                      • 목적 명시: "SSCI 논문 투고를 위해"<br/>
                      • 제약조건 설명: "6개월 연구기간, 예산 제한"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📋 2단계: 맞춤형 단계별 연구 가이드 시스템
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🏗️ 연구 설계 단계 전문 컨설팅</h4>
                  
                  <div className="mb-3">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>컨설팅 요청 템플릿</h5>
                    <div className="p-2 rounded text-xs font-mono" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "다음 연구 설계에 대해 전문가 검토를 요청합니다:<br/><br/>
                      
                      <strong>연구 주제:</strong> [구체적 주제]<br/>
                      <strong>연구 목적:</strong> [학술/실무/정책]<br/>
                      <strong>대상 집단:</strong> [전문가/일반인/특정그룹]<br/>
                      <strong>의사결정 맥락:</strong> [상황 설명]<br/>
                      <strong>제약조건:</strong> [시간/예산/접근성]<br/><br/>
                      
                      다음 관점에서 검토해주세요:<br/>
                      1) 계층구조 설계의 적절성<br/>
                      2) 평가 기준의 완성도<br/>
                      3) 대안 설정의 타당성<br/>
                      4) 방법론적 리스크<br/>
                      5) 개선 권장사항"
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🎯 설계 체크리스트 자동 생성</h5>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>목적 정렬성:</strong> 연구 질문과 AHP 구조 일치도</li>
                      <li>• <strong>기준 독립성:</strong> 평가 기준간 상호독립성 검증</li>
                      <li>• <strong>대안 동질성:</strong> 비교 대상의 동질성 확보</li>
                      <li>• <strong>전문가 적합성:</strong> 응답자 자격 및 대표성</li>
                      <li>• <strong>실현 가능성:</strong> 시간/비용/접근성 검토</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📊 데이터 수집 전략 개발</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📋 설문지 설계 AI 지원</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>기능:</strong> 응답자 특성별 맞춤형 설문지 생성<br/>
                        <strong>포함사항:</strong> 지시문, 예시, 체크포인트, 일관성 안내<br/>
                        <strong>언어 지원:</strong> 한국어, 영어, 기타 주요 언어<br/>
                        <strong>형식 옵션:</strong> 온라인, 오프라인, 모바일 최적화
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>👥 표본 설계 최적화</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>표본 크기 계산:</strong> 통계적 유의성 확보 방법<br/>
                        <strong>층화 추출 전략:</strong> 집단별 대표성 확보<br/>
                        <strong>응답률 예측:</strong> 현실적 목표 설정<br/>
                        <strong>바이어스 방지:</strong> 선택 편향 최소화 전략
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>⏰ 수집 일정 관리</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>단계별 일정:</strong> 파일럿-본조사-후속조사<br/>
                        <strong>품질 모니터링:</strong> 실시간 응답 품질 체크<br/>
                        <strong>중간 점검:</strong> 일관성 패턴 조기 발견<br/>
                        <strong>비상 계획:</strong> 응답률 저조 시 대응방안
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🔧 3단계: 실시간 문제 해결 및 오류 진단 시스템
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🚨 즉시 진단 및 해결 프로세스</h4>
                  
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-danger)' }}>
                      <div className="text-2xl mb-2">🔴</div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--color-danger)' }}>긴급 문제</h5>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>즉시 해결 필요</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-warning)' }}>
                      <div className="text-2xl mb-2">🟡</div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--color-warning)' }}>주의 사항</h5>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>검토 후 진행</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-success)' }}>
                      <div className="text-2xl mb-2">🟢</div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--color-success)' }}>정상 상태</h5>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>계속 진행</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🔍 자동 진단 요청 프롬프트</h5>
                    <div className="p-3 rounded font-mono text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      "다음 상황을 진단하고 해결방안을 제시해주세요:<br/><br/>
                      
                      <strong>문제 상황:</strong><br/>
                      • 현재 진행 단계: [예: 데이터 분석]<br/>
                      • 발생한 문제: [예: CR=0.23으로 높음]<br/>
                      • 시도한 해결책: [예: 극값 조정, 재설문]<br/>
                      • 현재 제약사항: [예: 시간 부족, 예산 한계]<br/><br/>
                      
                      <strong>요구사항:</strong><br/>
                      1) 문제의 근본 원인 분석<br/>
                      2) 즉시 실행 가능한 해결책<br/>
                      3) 장기적 예방 방안<br/>
                      4) 대안적 접근법<br/>
                      5) 리스크 평가 및 대응책<br/><br/>
                      
                      우선순위: [높음/중간/낮음]"
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>⚡ 즉시 해결 가능 문제</h5>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• <strong>일관성 문제:</strong> 매트릭스 수정 가이드</li>
                        <li>• <strong>응답 편향:</strong> 가중치 보정 방법</li>
                        <li>• <strong>데이터 누락:</strong> 대체값 산정</li>
                        <li>• <strong>계산 오류:</strong> 검증 및 수정</li>
                        <li>• <strong>해석 어려움:</strong> 실무적 의미 설명</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🔄 체계적 해결 프로세스</h5>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• <strong>1단계:</strong> 증상 분석 및 원인 추적</li>
                        <li>• <strong>2단계:</strong> 해결 옵션 생성 및 평가</li>
                        <li>• <strong>3단계:</strong> 최적 솔루션 선택</li>
                        <li>• <strong>4단계:</strong> 실행 계획 수립</li>
                        <li>• <strong>5단계:</strong> 효과 검증 및 학습</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📞 24/7 전문가 핫라인 시뮬레이션</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🎯 즉시 상담 요청</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>긴급 상담:</strong> "긴급히 도움이 필요합니다. [구체적 상황 기술]"<br/>
                        <strong>일반 상담:</strong> "다음 상황에 대해 조언을 구합니다. [상황 설명]"<br/>
                        <strong>확인 상담:</strong> "제가 한 분석이 맞는지 검토해주세요."<br/>
                        <strong>학습 상담:</strong> "이 개념을 더 자세히 이해하고 싶습니다."
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📚 누적 학습 시스템</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>대화 기록 관리:</strong> 이전 상담 내용 연계<br/>
                        <strong>개인화 학습:</strong> 연구자별 맞춤 조언<br/>
                        <strong>패턴 인식:</strong> 반복 문제 사전 예방<br/>
                        <strong>성장 추적:</strong> 연구 역량 발전 모니터링
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎓 4단계: 지속적 학습 및 역량 개발 플랫폼
              </h3>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                <h4 className="font-semibold mb-3">🌟 AI 멘토링 시스템의 진화적 학습</h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">📈 연구 역량 성장 추적</h5>
                    <ul className="space-y-1">
                      <li>• 질문 복잡도 증가 패턴 분석</li>
                      <li>• 독립적 문제해결 능력 측정</li>
                      <li>• 방법론적 이해도 평가</li>
                      <li>• 창의적 응용 사례 발굴</li>
                      <li>• 전문가 수준 도달 로드맵</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">🤝 커뮤니티 기반 학습</h5>
                    <ul className="space-y-1">
                      <li>• 동료 연구자와의 경험 공유</li>
                      <li>• 우수 사례 및 실패 사례 학습</li>
                      <li>• 집단 지성 기반 문제해결</li>
                      <li>• 멘토-멘티 매칭 시스템</li>
                      <li>• 연구 네트워킹 플랫폼</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm">
                    <strong>💎 핵심 가치:</strong> AI 챗봇은 단순한 Q&A 도구가 아닌, 연구자의 지적 성장을 
                    촉진하고 창의적 사고를 자극하는 동반자 역할을 수행하여 AHP 연구의 질적 수준을 
                    지속적으로 향상시키는 것이 목표입니다.
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
                ⭐ AI 도구 활용 모범 사례 및 전문가 전략
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                세계적 수준의 AHP 연구자들이 실제로 사용하는 AI 활용 전략과 검증된 모범 사례를 통해 연구의 효율성과 품질을 동시에 달성하는 실전 노하우를 제시합니다.
              </p>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 1단계: 전문가급 프롬프트 엔지니어링 마스터 클래스
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🏆 월드클래스 프롬프트 작성 프레임워크</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>💡 CLEAR 프롬프트 방법론</h5>
                    <div className="grid md:grid-cols-5 gap-2 text-sm">
                      <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                        <strong style={{ color: 'var(--accent-primary)' }}>C</strong><br/>
                        <span style={{ color: 'var(--text-secondary)' }}>Context<br/>맥락 설정</span>
                      </div>
                      <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                        <strong style={{ color: 'var(--accent-primary)' }}>L</strong><br/>
                        <span style={{ color: 'var(--text-secondary)' }}>Language<br/>전문 용어</span>
                      </div>
                      <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                        <strong style={{ color: 'var(--accent-primary)' }}>E</strong><br/>
                        <span style={{ color: 'var(--text-secondary)' }}>Examples<br/>구체적 예시</span>
                      </div>
                      <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                        <strong style={{ color: 'var(--accent-primary)' }}>A</strong><br/>
                        <span style={{ color: 'var(--text-secondary)' }}>Actions<br/>실행 요청</span>
                      </div>
                      <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                        <strong style={{ color: 'var(--accent-primary)' }}>R</strong><br/>
                        <span style={{ color: 'var(--text-secondary)' }}>Results<br/>결과 형식</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🌟 전문가급 프롬프트 실전 예제</h5>
                    <div className="p-3 rounded font-mono text-xs" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                      <strong style={{ color: 'var(--accent-primary)' }}>맥락 설정 (Context):</strong><br/>
                      "당신은 세계 최고 수준의 MCDM 전문가이며, International Journal of Decision Sciences 편집위원입니다."<br/><br/>
                      
                      <strong style={{ color: 'var(--accent-primary)' }}>전문 언어 (Language):</strong><br/>
                      "다음 상황에서 AHP 계층구조를 설계합니다: 스마트팩토리 도입을 위한 기술 평가"<br/><br/>
                      
                      <strong style={{ color: 'var(--accent-primary)' }}>구체적 예시 (Examples):</strong><br/>
                      "참고할 유사 연구: Wu et al. (2023, Computers & Operations Research), 대상: 제조업 중견기업 5곳, 평가자: 산업공학 박사급 15명"<br/><br/>
                      
                      <strong style={{ color: 'var(--accent-primary)' }}>실행 요청 (Actions):</strong><br/>
                      "1) 3계층 구조 설계, 2) 기준별 가중치 예측, 3) 일관성 검증 방법, 4) 리스크 요소 식별, 5) 개선 권장사항"<br/><br/>
                      
                      <strong style={{ color: 'var(--accent-primary)' }}>결과 형식 (Results):</strong><br/>
                      "계층도 + 설명문 + 수치 예측 + 검증 절차 + 실행 가이드 형태로 제시"
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>✅ 효과적인 프롬프트 특징</h5>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• <strong>구체성:</strong> 모호함 없는 명확한 요청</li>
                        <li>• <strong>맥락성:</strong> 연구 배경과 목적 명시</li>
                        <li>• <strong>구조성:</strong> 단계별 세분화된 요구사항</li>
                        <li>• <strong>검증성:</strong> 결과 검토 기준 포함</li>
                        <li>• <strong>실용성:</strong> 즉시 활용 가능한 형태</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>❌ 피해야 할 프롬프트 실수</h5>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• <strong>모호한 요청:</strong> "AHP 좀 도와주세요"</li>
                        <li>• <strong>맥락 누락:</strong> 연구 목적 불명확</li>
                        <li>• <strong>과도한 요구:</strong> 한 번에 너무 많은 작업</li>
                        <li>• <strong>검증 부재:</strong> 결과 확인 방법 없음</li>
                        <li>• <strong>형식 미지정:</strong> 원하는 출력 형태 불명</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🛠️ 2단계: 도구별 최적화 전략 및 시너지 효과 창출
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📝 논문 작성 도우미 고급 활용법</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🎯 섹션별 전문화 전략</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>Abstract:</strong> "150-200단어로 압축하되 임팩트 키워드 포함"<br/>
                        <strong>Introduction:</strong> "Research Gap Analysis + Contribution Statement 명확화"<br/>
                        <strong>Methodology:</strong> "재현 가능하도록 단계별 상세 기술"<br/>
                        <strong>Results:</strong> "시각화 + 통계적 해석 + 실무적 함의"
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🔄 반복 개선 프로세스</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>1차:</strong> 기본 구조와 내용 생성<br/>
                        <strong>2차:</strong> 논리적 흐름 최적화<br/>
                        <strong>3차:</strong> 학술적 표현 정교화<br/>
                        <strong>4차:</strong> 타겟 저널 맞춤화
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📊 결과 해석 도구 전문 활용</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🔍 다각도 분석 접근법</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>정량적 관점:</strong> 통계적 유의성, 효과 크기, 신뢰구간<br/>
                        <strong>정성적 관점:</strong> 실무적 의미, 정책적 함의, 전략적 방향<br/>
                        <strong>비교적 관점:</strong> 벤치마크, 경쟁 연구, 산업 평균<br/>
                        <strong>미래적 관점:</strong> 트렌드 예측, 시나리오 분석
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📈 고급 해석 템플릿</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>패턴 인식:</strong> "가중치 분포에서 발견되는 의미"<br/>
                        <strong>이상치 분석:</strong> "예상과 다른 결과의 원인과 시사점"<br/>
                        <strong>민감도 해석:</strong> "결과의 안정성과 로버스트니스"<br/>
                        <strong>실행 가능성:</strong> "연구 결과의 현실적 적용 방안"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🔍 품질 검증 도구 시스템적 활용</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🎯 다단계 검증 체계</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>Level 1:</strong> 기본 방법론적 정확성 검증<br/>
                        <strong>Level 2:</strong> 논리적 일관성 및 완성도 점검<br/>
                        <strong>Level 3:</strong> 학술적 기준 및 윤리 검토<br/>
                        <strong>Level 4:</strong> 독창성 및 기여도 평가
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>⚡ 실시간 품질 모니터링</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>연속 검증:</strong> 각 단계별 즉시 품질 체크<br/>
                        <strong>교차 검증:</strong> 다른 도구들과의 결과 일치성<br/>
                        <strong>전문가 검증:</strong> 도메인 전문가 관점 시뮬레이션<br/>
                        <strong>피어 리뷰:</strong> 동료 평가자 시각 반영
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>💬 챗봇 상담 전략적 활용</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🧠 지식 증폭 전략</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>소크라테스식 질문:</strong> "왜 이 결과가 나왔을까요?"<br/>
                        <strong>가설 검증:</strong> "제 가설이 맞는지 확인해주세요"<br/>
                        <strong>대안 탐색:</strong> "다른 접근법이 있을까요?"<br/>
                        <strong>비판적 검토:</strong> "이 방법의 한계는 무엇인가요?"
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🚀 창의적 발상 촉진</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>브레인스토밍:</strong> "혁신적인 AHP 응용 분야는?"<br/>
                        <strong>연관성 탐색:</strong> "이 결과와 관련된 이론은?"<br/>
                        <strong>시나리오 기획:</strong> "미래에는 어떻게 발전할까?"<br/>
                        <strong>문제 재정의:</strong> "근본적 문제는 무엇일까?"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📈 3단계: 연구 단계별 통합 활용 전략 및 워크플로우 최적화
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🔄 단계별 최적화 워크플로우</h4>
                  
                  <div className="grid md:grid-cols-4 gap-3">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                      <h5 className="font-medium mb-2 text-center" style={{ color: 'var(--accent-primary)' }}>
                        🎯 1단계: 연구 기획<br/>
                        <span className="text-xs">(2-3주)</span>
                      </h5>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li><strong>주 도구:</strong> 논문 작성 도우미</li>
                        <li><strong>보조 도구:</strong> 챗봇 상담</li>
                        <li><strong>핵심 작업:</strong></li>
                        <li>• 연구 주제 정교화</li>
                        <li>• 문헌고찰 전략 수립</li>
                        <li>• 계층구조 초안 설계</li>
                        <li>• 연구 방법론 확정</li>
                        <li><strong>산출물:</strong> 연구 계획서</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                      <h5 className="font-medium mb-2 text-center" style={{ color: 'var(--accent-primary)' }}>
                        🏗️ 2단계: 연구 설계<br/>
                        <span className="text-xs">(3-4주)</span>
                      </h5>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li><strong>주 도구:</strong> 품질 검증</li>
                        <li><strong>보조 도구:</strong> 챗봇 + 논문 도우미</li>
                        <li><strong>핵심 작업:</strong></li>
                        <li>• 계층구조 검증</li>
                        <li>• 설문지 설계</li>
                        <li>• 표본 설계 최적화</li>
                        <li>• 파일럿 테스트</li>
                        <li><strong>산출물:</strong> 완성된 설문</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                      <h5 className="font-medium mb-2 text-center" style={{ color: 'var(--accent-primary)' }}>
                        📊 3단계: 분석 및 해석<br/>
                        <span className="text-xs">(4-6주)</span>
                      </h5>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li><strong>주 도구:</strong> 결과 해석</li>
                        <li><strong>보조 도구:</strong> 품질 검증</li>
                        <li><strong>핵심 작업:</strong></li>
                        <li>• 데이터 품질 검사</li>
                        <li>• AHP 분석 수행</li>
                        <li>• 민감도 분석</li>
                        <li>• 결과 해석 및 토론</li>
                        <li><strong>산출물:</strong> 분석 결과</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--accent-primary)' }}>
                      <h5 className="font-medium mb-2 text-center" style={{ color: 'var(--accent-primary)' }}>
                        📄 4단계: 논문 작성<br/>
                        <span className="text-xs">(6-8주)</span>
                      </h5>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li><strong>주 도구:</strong> 학술자료 생성</li>
                        <li><strong>보조 도구:</strong> 논문 작성 도우미</li>
                        <li><strong>핵심 작업:</strong></li>
                        <li>• 논문 초안 작성</li>
                        <li>• 시각화 자료 생성</li>
                        <li>• 학술지 맞춤화</li>
                        <li>• 최종 검토</li>
                        <li><strong>산출물:</strong> 완성 논문</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-success)' }}>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--color-success)' }}>🚀 시너지 효과 극대화 전략</h5>
                    <div className="text-sm grid md:grid-cols-2 gap-4" style={{ color: 'var(--text-secondary)' }}>
                      <div>
                        <strong>도구간 연계:</strong><br/>
                        • 논문 도우미 → 품질 검증 → 결과 해석 → 자료 생성<br/>
                        • 각 단계 결과물을 다음 단계 입력으로 활용<br/>
                        • 일관된 스타일과 논리적 흐름 유지
                      </div>
                      <div>
                        <strong>효율성 극대화:</strong><br/>
                        • 병렬 작업: 여러 도구 동시 활용<br/>
                        • 템플릿 재활용: 검증된 형식 반복 사용<br/>
                        • 자동화: 반복 작업의 AI 위임
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🏆 4단계: 글로벌 수준 모범 사례 및 성공 전략
              </h3>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                <h4 className="font-semibold mb-3">🌟 세계적 연구자들의 AI 활용 성공 비결</h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">🎯 전략적 접근법</h5>
                    <ul className="space-y-1">
                      <li>• <strong>목표 지향:</strong> 명확한 연구 목표와 AI 활용 계획</li>
                      <li>• <strong>단계적 도입:</strong> 점진적 AI 도구 통합</li>
                      <li>• <strong>지속적 학습:</strong> 최신 AI 기술 동향 파악</li>
                      <li>• <strong>품질 우선:</strong> 효율성보다 품질 중시</li>
                      <li>• <strong>검증 강화:</strong> 다중 검증 시스템 구축</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">💡 혁신적 활용 사례</h5>
                    <ul className="space-y-1">
                      <li>• <strong>MIT 연구팀:</strong> AI 기반 그룹 AHP 합의 도출</li>
                      <li>• <strong>Stanford 그룹:</strong> 실시간 민감도 분석 시스템</li>
                      <li>• <strong>Cambridge 팀:</strong> 다국가 AHP 비교 연구</li>
                      <li>• <strong>Tokyo 대학:</strong> AI-Human 협업 의사결정</li>
                      <li>• <strong>Seoul 대학:</strong> 한국형 AHP-AI 융합 모델</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <p className="text-sm">
                    <strong>💎 핵심 성공 요소:</strong> AI는 연구자의 창의성과 전문성을 대체하는 것이 아니라 
                    증폭시키는 도구입니다. 인간의 직관과 AI의 계산 능력을 조화롭게 결합할 때 
                    세계적 수준의 연구 성과를 달성할 수 있습니다.
                  </p>
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
                💡 효과적인 AI 활용법 및 전문가 노하우
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                수년간의 연구 경험과 실제 사례를 바탕으로 도출한 AI 도구 활용의 핵심 노하우와 실전 팁을 통해 연구 효율성을 극대화하고 흔한 함정을 피하는 실용적 가이드를 제시합니다.
              </p>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ⚡ 1단계: 시간 효율성 극대화 전략
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🚀 연구 가속화 핵심 기법</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📋 템플릿 기반 연구 시스템</h5>
                      <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong>마스터 템플릿 구축:</strong><br/>
                          • 연구 계획서 표준 템플릿<br/>
                          • 설문지 설계 체크리스트<br/>
                          • 분석 결과 해석 프레임워크<br/>
                          • 논문 구조 마스터 템플릿
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong>재사용 가능 자산 관리:</strong><br/>
                          • 검증된 프롬프트 라이브러리<br/>
                          • 성공 사례 데이터베이스<br/>
                          • 실패 사례 학습 아카이브<br/>
                          • 개인화 설정 백업
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🔄 스마트 자동화 워크플로우</h5>
                      <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong>반복 작업 자동화:</strong><br/>
                          • 데이터 전처리 스크립트<br/>
                          • 일관성 검사 자동 실행<br/>
                          • 표준 보고서 자동 생성<br/>
                          • 참고문헌 자동 정리
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong>배치 처리 최적화:</strong><br/>
                          • 여러 시나리오 동시 분석<br/>
                          • 대량 데이터 일괄 처리<br/>
                          • 다중 형식 출력 자동화<br/>
                          • 진도 추적 자동 업데이트
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-success)' }}>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--color-success)' }}>💰 시간 절약 ROI 계산</h5>
                    <div className="text-sm grid md:grid-cols-3 gap-3" style={{ color: 'var(--text-secondary)' }}>
                      <div>
                        <strong>초급 연구자:</strong><br/>
                        • 기존: 6개월 → AI 활용: 3개월<br/>
                        • 절약: 3개월 (100% 효율 향상)<br/>
                        • 가치: 연구비 500만원 절약
                      </div>
                      <div>
                        <strong>중급 연구자:</strong><br/>
                        • 기존: 4개월 → AI 활용: 2.5개월<br/>
                        • 절약: 1.5개월 (60% 효율 향상)<br/>
                        • 가치: 추가 프로젝트 2개 가능
                      </div>
                      <div>
                        <strong>전문 연구자:</strong><br/>
                        • 기존: 3개월 → AI 활용: 2개월<br/>
                        • 절약: 1개월 (50% 효율 향상)<br/>
                        • 가치: 고부가가치 작업 집중
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🏆 2단계: 연구 품질 향상 고급 전략
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🔍 다중 검증 시스템</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🎯 3단계 품질 검증 프로세스</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>1차 검증:</strong> AI 자가 진단 및 논리적 일관성<br/>
                        <strong>2차 검증:</strong> 교차 검증 및 벤치마크 비교<br/>
                        <strong>3차 검증:</strong> 전문가 리뷰 및 피어 체크<br/>
                        <strong>최종 검증:</strong> 실제 적용 및 효과성 테스트
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📊 정량적 품질 지표</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>일관성 지수:</strong> CR &lt; 0.1 (필수), CR &lt; 0.05 (이상적)<br/>
                        <strong>응답률:</strong> &gt; 80% (높은 신뢰성)<br/>
                        <strong>완성도:</strong> 모든 매트릭스 100% 완료<br/>
                        <strong>검증율:</strong> 다중 방법론 일치도 &gt; 90%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🌐 글로벌 표준 준수 가이드</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📖 국제 학술 기준 준수</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>COPE 가이드라인:</strong> 출판 윤리 위원회 기준<br/>
                        <strong>PRISMA 체크리스트:</strong> 체계적 문헌고찰 표준<br/>
                        <strong>STROBE 기준:</strong> 관찰연구 보고 가이드<br/>
                        <strong>CONSORT 표준:</strong> 연구 설계 투명성
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🔒 연구 윤리 강화 시스템</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>AI 투명성:</strong> AI 활용 내역 명시적 공개<br/>
                        <strong>데이터 무결성:</strong> 원본 데이터 보존 및 추적<br/>
                        <strong>재현 가능성:</strong> 방법론 상세 기록<br/>
                        <strong>표절 방지:</strong> 다중 표절 검사 도구 활용
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🎓 전문가 네트워킹 활용</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>👥 전문가 검토 시스템</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>분야별 전문가:</strong> AHP, MCDM, 응용 분야<br/>
                        <strong>방법론 전문가:</strong> 통계, 실험설계, 데이터분석<br/>
                        <strong>산업계 전문가:</strong> 실무 적용성 검토<br/>
                        <strong>국제 네트워크:</strong> 글로벌 관점 피드백
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🤝 협업 플랫폼 활용</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>학술 플랫폼:</strong> ResearchGate, Academia.edu<br/>
                        <strong>전문 커뮤니티:</strong> INFORMS, MCDM Society<br/>
                        <strong>오픈 사이언스:</strong> OSF, arXiv 사전 공개<br/>
                        <strong>소셜 네트워킹:</strong> LinkedIn 전문가 그룹
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>📈 지속적 개선 메커니즘</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🔄 학습 피드백 루프</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>성과 분석:</strong> 연구별 성공 요인 도출<br/>
                        <strong>실패 학습:</strong> 오류 패턴 분석 및 예방<br/>
                        <strong>방법론 개선:</strong> 지속적 프로세스 최적화<br/>
                        <strong>도구 업그레이드:</strong> 새로운 AI 기술 적용
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📊 성과 측정 KPI</h5>
                      <div className="text-sm p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <strong>효율성:</strong> 연구 완료 시간 단축률<br/>
                        <strong>품질:</strong> 논문 인용 지수 및 임팩트<br/>
                        <strong>정확성:</strong> 오류율 및 수정 횟수<br/>
                        <strong>혁신성:</strong> 새로운 발견 및 기여도
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ⚠️ 3단계: 함정 회피 및 리스크 관리 전략
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <h4 className="font-semibold mb-3" style={{ color: 'var(--accent-primary)' }}>🚨 주요 위험 요소 및 대응책</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>❌ 흔한 실수 및 예방법</h5>
                      <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="p-2 rounded border-l-4 border-red-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong style={{ color: 'var(--color-danger)' }}>과도한 AI 의존:</strong><br/>
                          "AI 결과를 검증 없이 그대로 사용"<br/>
                          <strong>해결책:</strong> 다중 검증 시스템 구축
                        </div>
                        <div className="p-2 rounded border-l-4 border-red-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong style={{ color: 'var(--color-danger)' }}>맥락 정보 누락:</strong><br/>
                          "연구 배경 없는 단편적 활용"<br/>
                          <strong>해결책:</strong> 체계적 맥락 정보 제공
                        </div>
                        <div className="p-2 rounded border-l-4 border-red-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong style={{ color: 'var(--color-danger)' }}>일관성 무시:</strong><br/>
                          "서로 다른 도구에서 상반된 결과"<br/>
                          <strong>해결책:</strong> 통합 검증 프레임워크
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>🔒 보안 및 윤리 준수사항</h5>
                      <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="p-2 rounded border-l-4 border-yellow-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong style={{ color: 'var(--color-warning)' }}>데이터 보안:</strong><br/>
                          • 민감정보 입력 금지<br/>
                          • 개인정보 마스킹 처리<br/>
                          • 안전한 플랫폼 사용
                        </div>
                        <div className="p-2 rounded border-l-4 border-yellow-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong style={{ color: 'var(--color-warning)' }}>연구 윤리:</strong><br/>
                          • AI 활용 투명한 공개<br/>
                          • 표절 및 위조 방지<br/>
                          • 공정한 저자 표시
                        </div>
                        <div className="p-2 rounded border-l-4 border-yellow-500" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <strong style={{ color: 'var(--color-warning)' }}>법적 준수:</strong><br/>
                          • 저작권 및 라이센스<br/>
                          • 데이터 보호 규정<br/>
                          • 연구 승인 및 동의
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--color-danger)' }}>
                    <h5 className="font-medium mb-2" style={{ color: 'var(--color-danger)' }}>🚫 절대 금지 사항</h5>
                    <div className="text-sm grid md:grid-cols-3 gap-3" style={{ color: 'var(--text-secondary)' }}>
                      <div>
                        <strong>데이터 관련:</strong><br/>
                        • 실명이나 개인정보 입력<br/>
                        • 기밀 연구 데이터 업로드<br/>
                        • 저작권 침해 자료 사용
                      </div>
                      <div>
                        <strong>연구 관련:</strong><br/>
                        • AI 결과 무비판적 수용<br/>
                        • 검증 절차 생략<br/>
                        • 표절이나 중복 게재
                      </div>
                      <div>
                        <strong>윤리 관련:</strong><br/>
                        • AI 활용 내역 숨김<br/>
                        • 가짜 데이터 생성<br/>
                        • 편향된 결과 왜곡
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🌟 4단계: 마스터 수준 활용 철학 및 미래 전략
              </h3>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                <h4 className="font-semibold mb-3">💎 AI-Human 하이브리드 연구 철학</h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">🧠 인간의 고유 역할</h5>
                    <ul className="space-y-1">
                      <li>• <strong>창의적 사고:</strong> 새로운 연구 아이디어 발굴</li>
                      <li>• <strong>직관적 판단:</strong> 데이터 너머의 의미 파악</li>
                      <li>• <strong>윤리적 판단:</strong> 연구의 사회적 책임</li>
                      <li>• <strong>맥락적 이해:</strong> 문화적, 사회적 배경 고려</li>
                      <li>• <strong>비판적 사고:</strong> 결과에 대한 비판적 검토</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">🤖 AI의 최적 활용 영역</h5>
                    <ul className="space-y-1">
                      <li>• <strong>계산 집약적 작업:</strong> 복잡한 수치 분석</li>
                      <li>• <strong>패턴 인식:</strong> 대량 데이터에서 규칙 발견</li>
                      <li>• <strong>반복 작업:</strong> 표준화된 프로세스 자동화</li>
                      <li>• <strong>최적화:</strong> 다변수 조건 하 최적해 탐색</li>
                      <li>• <strong>검증 지원:</strong> 다각도 검토 및 확인</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <h5 className="font-medium mb-2">🚀 미래 지향적 연구 비전</h5>
                  <p className="text-sm">
                    AI는 연구자의 능력을 확장시키는 강력한 도구입니다. 그러나 진정한 혁신은 
                    AI의 계산 능력과 인간의 창의성이 조화롭게 결합될 때 달성됩니다. 
                    기술을 도구로 활용하되, 연구의 본질인 진리 탐구와 인류 발전에 대한 
                    사명감을 잃지 않는 것이 진정한 AI 시대의 연구자가 갖춰야 할 핵심 역량입니다.
                  </p>
                </div>

                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <h5 className="font-medium mb-2">🎯 성공적인 AI 활용의 10대 원칙</h5>
                  <div className="text-xs grid md:grid-cols-2 gap-3">
                    <div>
                      <ol className="space-y-1">
                        <li>1. 목적 중심: 연구 목표를 명확히</li>
                        <li>2. 단계적 접근: 점진적 도구 활용</li>
                        <li>3. 지속적 검증: 결과를 반드시 확인</li>
                        <li>4. 투명성 유지: AI 활용 내역 공개</li>
                        <li>5. 윤리적 책임: 연구 윤리 철저 준수</li>
                      </ol>
                    </div>
                    <div>
                      <ol className="space-y-1" start={6}>
                        <li>6. 전문성 강화: 도메인 지식 지속 학습</li>
                        <li>7. 협업 중시: 전문가 네트워크 활용</li>
                        <li>8. 품질 우선: 효율성보다 정확성</li>
                        <li>9. 미래 준비: 새로운 기술 동향 파악</li>
                        <li>10. 가치 창출: 사회적 기여와 임팩트</li>
                      </ol>
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
            🤖
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              AI 연구 지원 활용 가이드
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              AHP 연구에서 AI 도구들을 효과적으로 활용하는 완전한 전문가 가이드
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 사이드 네비게이션 */}
        <div className="w-80 border-r" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🤖 목차
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

export default AIResearchGuidePage;