/**
 * 평가자 가이드 페이지
 * AHP 평가 참여자를 위한 완전한 실용적 가이드
 */

import React, { useState } from 'react';

const EvaluatorGuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: '평가자 가이드 개요', icon: '👤' },
    { id: 'getting-started', title: '평가 시작하기', icon: '🚀' },
    { id: 'understanding-ahp', title: 'AHP 이해하기', icon: '💡' },
    { id: 'pairwise-comparison', title: '쌍대비교 수행 방법', icon: '⚖️' },
    { id: 'consistency-check', title: '일관성 검토 및 수정', icon: '🎯' },
    { id: 'evaluation-tips', title: '효과적 평가 요령', icon: '💫' },
    { id: 'common-issues', title: '문제 해결 가이드', icon: '🔧' },
    { id: 'completion', title: '평가 완료 및 결과', icon: '🏁' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                👤 AHP 평가자 완전 가이드
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                이 평가자 가이드는 <strong>AHP 의사결정 프로세스에 참여하는 평가자</strong>들을 위한 
                실용적이고 직관적인 평가 수행 매뉴얼입니다. 정확하고 일관성 있는 평가를 통해 
                신뢰할 수 있는 의사결정에 기여해보세요.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎯 평가 목표</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 정확한 쌍대비교 평가 수행</li>
                    <li>• 일관성 있는 판단 유지</li>
                    <li>• 객관적 기준 적용</li>
                    <li>• 신뢰할 수 있는 결과 기여</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>⏱️ 평가 과정</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 평가 방법 이해: 5-10분</li>
                    <li>• 실제 평가 수행: 15-30분</li>
                    <li>• 일관성 검토: 5분</li>
                    <li>• 결과 확인: 3분</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>💡 평가 요령</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 직관적 판단보다 논리적 사고</li>
                    <li>• 상대적 중요도에 집중</li>
                    <li>• 일관된 기준 적용</li>
                    <li>• 불확실하면 재평가</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'getting-started':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🚀 평가 시작하기
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">1️⃣</span> 평가 초대 확인
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    연구자로부터 받은 평가 초대 링크를 통해 플랫폼에 접속합니다.
                  </p>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
                      <li>• <strong>이메일 확인:</strong> 초대 메일의 링크 클릭</li>
                      <li>• <strong>접속 확인:</strong> 브라우저에서 정상 로딩 확인</li>
                      <li>• <strong>프로젝트 정보:</strong> 평가할 프로젝트명 확인</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">2️⃣</span> 평가 환경 준비
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    정확한 평가를 위해 적절한 환경을 준비합니다.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>환경 조건</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 조용한 공간 확보</li>
                        <li>• 충분한 시간 확보 (30분)</li>
                        <li>• 집중할 수 있는 상태</li>
                        <li>• 안정적인 인터넷 연결</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>준비 자료</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 프로젝트 배경 자료</li>
                        <li>• 평가 기준 설명서</li>
                        <li>• 대안별 상세 정보</li>
                        <li>• 메모장 (필요시)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'understanding-ahp':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                💡 AHP 이해하기
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🤔 AHP란 무엇인가요?
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    AHP(Analytic Hierarchy Process)는 복잡한 의사결정 문제를 체계적으로 해결하는 방법입니다.
                  </p>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
                      <li>• <strong>목적:</strong> 최적의 대안을 객관적으로 선택</li>
                      <li>• <strong>방법:</strong> 기준들을 두 개씩 비교하여 중요도 측정</li>
                      <li>• <strong>결과:</strong> 각 대안의 우선순위 도출</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🏗️ 계층구조 이해하기
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    AHP는 문제를 계층적으로 구조화하여 단계별로 평가합니다.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>목표 (Goal)</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>달성하고자 하는 최종 목표</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl">📏</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>기준 (Criteria)</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>목표 달성을 위한 평가 기준들</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl">🔀</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>대안 (Alternatives)</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>선택 가능한 옵션들</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pairwise-comparison':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ⚖️ 쌍대비교 수행 방법
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📊 9점 척도 이해하기
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    AHP에서는 두 요소를 비교할 때 1~9점 척도를 사용합니다.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>척도 의미</h4>
                      <div className="space-y-2">
                        {[
                          { score: 9, desc: "극히 중요함", color: "text-red-600" },
                          { score: 7, desc: "매우 중요함", color: "text-orange-600" },
                          { score: 5, desc: "중요함", color: "text-yellow-600" },
                          { score: 3, desc: "조금 중요함", color: "text-green-600" },
                          { score: 1, desc: "같음", color: "text-blue-600" }
                        ].map(item => (
                          <div key={item.score} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                            <span className={`font-bold ${item.color}`}>{item.score}</span>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>평가 예시</h4>
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          <strong>질문:</strong> "가격"과 "품질" 중 어느 것이 더 중요한가?
                        </p>
                        <div className="space-y-1 text-sm">
                          <p style={{ color: 'var(--text-secondary)' }}>
                            → 품질이 조금 더 중요하다면: <span className="font-bold text-green-600">3점</span>
                          </p>
                          <p style={{ color: 'var(--text-secondary)' }}>
                            → 품질이 매우 중요하다면: <span className="font-bold text-orange-600">7점</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎯 효과적인 비교 방법
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-blue-600">1</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>질문을 정확히 이해하기</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>"A가 B보다 얼마나 더 중요한가?"를 생각해보세요</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-green-600">2</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>구체적 상황 떠올리기</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>실제 상황을 구체적으로 상상하며 판단하세요</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-bold text-purple-600">3</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>일관성 있게 판단하기</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>비슷한 질문에는 비슷한 기준으로 답변하세요</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'consistency-check':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 일관성 검토 및 수정
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🤔 일관성이란?
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    일관성은 여러분의 판단이 논리적으로 모순되지 않는지를 확인하는 지표입니다.
                  </p>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <div className="text-sm space-y-2" style={{ color: 'var(--text-primary)' }}>
                      <p><strong>예시:</strong></p>
                      <p>• A가 B보다 3배 중요하고</p>
                      <p>• B가 C보다 2배 중요하다면</p>
                      <p>• A가 C보다 약 6배 중요해야 논리적으로 일관됨</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📊 일관성 지표 해석
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">✅</div>
                      <p className="font-bold text-green-600">CR &lt; 0.1</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>일관성 우수</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>그대로 진행</p>
                    </div>
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">⚠️</div>
                      <p className="font-bold text-yellow-600">CR &lt; 0.2</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>일관성 양호</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>검토 권장</p>
                    </div>
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">❌</div>
                      <p className="font-bold text-red-600">CR &ge; 0.2</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>일관성 부족</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>재평가 필요</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🔧 일관성 개선 방법
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>1단계: 문제 판단 찾기</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>시스템이 표시하는 비일관적 판단을 확인하세요</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>2단계: 다시 생각해보기</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>해당 비교를 다시 신중하게 검토하세요</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>3단계: 점진적 조정</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>극단적 값보다는 중간 값으로 조정해보세요</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'evaluation-tips':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                💫 효과적인 평가 요령
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎯 평가 전 준비사항
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>정신적 준비</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 충분한 휴식 후 평가</li>
                        <li>• 편견 없는 객관적 자세</li>
                        <li>• 꼼꼼한 검토 의지</li>
                        <li>• 충분한 시간 확보</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>자료 숙지</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 프로젝트 목적 이해</li>
                        <li>• 각 기준의 정의 파악</li>
                        <li>• 대안들의 특성 학습</li>
                        <li>• 평가 맥락 고려</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    💡 평가 중 주의사항
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>집중력 유지</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>각 질문을 신중하게 읽고 충분히 생각한 후 답변</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl">🤔</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>직관보다 논리</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>감정적 판단보다는 합리적 근거를 바탕으로 평가</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl">🔄</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>지속적 검토</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>이전 답변과 일관성이 있는지 수시로 확인</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🌟 고품질 평가를 위한 팁
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>✅ 좋은 평가</p>
                        <ul className="text-xs space-y-1 mt-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• 논리적 일관성 유지</li>
                          <li>• 충분한 고민 후 판단</li>
                          <li>• 극단적 값 자제</li>
                          <li>• 맥락 고려한 평가</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>❌ 피할 점</p>
                        <ul className="text-xs space-y-1 mt-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• 성급한 판단</li>
                          <li>• 개인적 편견</li>
                          <li>• 무분별한 극값 사용</li>
                          <li>• 일관성 무시</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'common-issues':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🔧 문제 해결 가이드
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🤔 자주 묻는 질문
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Q: 두 기준이 비슷하게 중요할 때는?</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A: 1점(동등하게 중요)을 선택하거나, 아주 작은 차이라면 2점을 선택하세요.</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Q: 잘 모르는 기준이 나올 때는?</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A: 제공된 설명을 다시 읽어보시고, 그래도 모르겠다면 연구자에게 문의하세요.</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Q: 일관성이 계속 낮게 나올 때는?</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A: 처음부터 다시 평가하는 것을 고려해보세요. 너무 극단적인 값을 피하고 중간 값을 활용하세요.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    ⚠️ 기술적 문제 해결
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>접속 문제</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 브라우저 새로고침</li>
                        <li>• 다른 브라우저 시도</li>
                        <li>• 인터넷 연결 확인</li>
                        <li>• 방화벽 설정 확인</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>저장 문제</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 자주 중간 저장</li>
                        <li>• 브라우저 쿠키 허용</li>
                        <li>• 팝업 차단 해제</li>
                        <li>• 세션 시간 확인</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📞 도움 요청하기
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>연구자에게 연락</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>기술적 문제나 평가 관련 질문이 있을 때는 주저하지 마시고 연구자에게 연락하세요.</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>시스템 지원팀</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>플랫폼 관련 기술적 문제는 시스템 지원팀에 문의할 수 있습니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'completion':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🏁 평가 완료 및 결과 확인
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    ✅ 평가 완료 확인사항
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>모든 비교 완료</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>시스템이 요구하는 모든 쌍대비교를 완료했는지 확인</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>일관성 기준 충족</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>일관성 비율(CR)이 0.2 이하인지 확인</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-green-600 text-xl">✓</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>최종 저장</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>평가 결과가 시스템에 정상적으로 저장되었는지 확인</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📊 결과 해석하기
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>개인 결과</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 기준별 가중치 확인</li>
                        <li>• 대안별 우선순위 확인</li>
                        <li>• 일관성 지표 검토</li>
                        <li>• 결과의 합리성 판단</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>집단 결과</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 전체 참여자 평균 결과</li>
                        <li>• 의견 일치도 확인</li>
                        <li>• 최종 의사결정 결과</li>
                        <li>• 자신의 기여도 이해</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎉 참여 완료 후
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>피드백 제공</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>평가 과정에서 어려웠던 점이나 개선 제안이 있다면 연구자에게 알려주세요.</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>결과 공유</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>연구자가 최종 결과를 공유하면, 전체적인 의사결정 과정을 이해해보세요.</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>지속적 학습</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AHP 경험을 통해 체계적 의사결정 능력을 향상시켜보세요.</p>
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
            👤
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              AHP 평가자 완전 가이드
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              정확하고 일관성 있는 AHP 평가를 위한 실용적 완전 가이드
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 사이드 네비게이션 */}
        <div className="w-80 border-r" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              👤 목차
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

export default EvaluatorGuidePage;