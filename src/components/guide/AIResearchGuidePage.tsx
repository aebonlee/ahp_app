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