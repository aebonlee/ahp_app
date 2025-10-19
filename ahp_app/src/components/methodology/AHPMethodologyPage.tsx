/**
 * AHP 방법론 설명 페이지
 * AI 논문 지원 시스템의 일부로 AHP 기본 개념과 적용 방법을 설명
 */

import React, { useState } from 'react';

const AHPMethodologyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: '개요', icon: '📋' },
    { id: 'principles', title: '기본 원리', icon: '⚖️' },
    { id: 'hierarchy', title: '계층 구조', icon: '🏗️' },
    { id: 'pairwise', title: '쌍대비교', icon: '🔄' },
    { id: 'consistency', title: '일관성 검증', icon: '✅' },
    { id: 'calculation', title: '가중치 계산', icon: '🧮' },
    { id: 'application', title: '적용 사례', icon: '💼' },
    { id: 'advantages', title: '장단점', icon: '📊' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                AHP (Analytic Hierarchy Process) 개요
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                AHP는 1970년대 토마스 사티(Thomas Saaty)에 의해 개발된 <strong>다기준 의사결정 기법</strong>입니다. 
                복잡한 문제를 계층적으로 분해하고, 각 요소들을 쌍대비교를 통해 정량적으로 평가하여 
                최적의 대안을 선택하는 체계적인 방법론입니다.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎯 주요 목적</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 복잡한 의사결정 문제의 체계적 해결</li>
                    <li>• 주관적 판단의 객관화</li>
                    <li>• 다수 의견의 집단적 합의</li>
                    <li>• 일관성 있는 의사결정</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🔧 핵심 특징</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 계층적 구조화</li>
                    <li>• 쌍대비교 방식</li>
                    <li>• 일관성 검증</li>
                    <li>• 수학적 정확성</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'principles':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                AHP의 기본 원리
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">1️⃣</span> 분해(Decomposition)
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    복잡한 문제를 목표, 기준, 하위기준, 대안 등의 계층구조로 분해합니다.
                  </p>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <code style={{ color: 'var(--text-primary)' }}>
                      목표 → 주기준 → 세부기준 → 대안
                    </code>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">2️⃣</span> 비교판단(Comparative Judgment)
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    동일 계층의 요소들을 쌍대비교하여 상대적 중요도를 평가합니다.
                  </p>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <code style={{ color: 'var(--text-primary)' }}>
                      A 기준이 B 기준보다 얼마나 더 중요한가?
                    </code>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">3️⃣</span> 우선순위 종합(Synthesis)
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    각 계층별 가중치를 종합하여 최종 우선순위를 도출합니다.
                  </p>
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <code style={{ color: 'var(--text-primary)' }}>
                      최종점수 = Σ(기준가중치 × 대안점수)
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'hierarchy':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                계층 구조 설계
              </h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-block p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '2px solid var(--accent-primary)' }}>
                    <div className="space-y-4">
                      {/* 목표 */}
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                        <strong>목표 (Goal)</strong><br/>
                        최고의 자동차 선택
                      </div>
                      
                      {/* 화살표 */}
                      <div className="text-2xl" style={{ color: 'var(--text-muted)' }}>↓</div>
                      
                      {/* 기준 */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--accent-secondary)', color: 'white' }}>
                          <small><strong>기준 1</strong><br/>경제성</small>
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--accent-secondary)', color: 'white' }}>
                          <small><strong>기준 2</strong><br/>안전성</small>
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--accent-secondary)', color: 'white' }}>
                          <small><strong>기준 3</strong><br/>편의성</small>
                        </div>
                      </div>
                      
                      {/* 화살표 */}
                      <div className="text-2xl" style={{ color: 'var(--text-muted)' }}>↓</div>
                      
                      {/* 대안 */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--accent-tertiary)', color: 'white' }}>
                          <small><strong>대안 A</strong><br/>소형차</small>
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--accent-tertiary)', color: 'white' }}>
                          <small><strong>대안 B</strong><br/>중형차</small>
                        </div>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--accent-tertiary)', color: 'white' }}>
                          <small><strong>대안 C</strong><br/>대형차</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>📐 설계 원칙</h3>
                    <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>명확한 목표 정의:</strong> 구체적이고 측정 가능한 목표</li>
                      <li>• <strong>상호 독립성:</strong> 각 기준은 서로 독립적이어야 함</li>
                      <li>• <strong>완전성:</strong> 모든 중요한 기준 포함</li>
                      <li>• <strong>적절한 세분화:</strong> 7±2 원칙 (최대 9개 요소)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>🏗️ 구조화 단계</h3>
                    <ol className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <li><strong>1단계:</strong> 문제 정의 및 목표 설정</li>
                      <li><strong>2단계:</strong> 주요 기준 식별</li>
                      <li><strong>3단계:</strong> 세부 기준 분해</li>
                      <li><strong>4단계:</strong> 대안 도출</li>
                      <li><strong>5단계:</strong> 계층 구조 검증</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pairwise':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                쌍대비교 방법론
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎯 Saaty 9점 척도
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <th className="p-2 text-left" style={{ color: 'var(--text-primary)' }}>척도</th>
                          <th className="p-2 text-left" style={{ color: 'var(--text-primary)' }}>정의</th>
                          <th className="p-2 text-left" style={{ color: 'var(--text-primary)' }}>설명</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>1</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>동등한 중요도</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>두 요소가 똑같이 중요함</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>3</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>약간 더 중요</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>한 요소가 다른 요소보다 약간 중요함</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>5</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>중요함</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>한 요소가 다른 요소보다 중요함</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>7</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>매우 중요함</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>한 요소가 다른 요소보다 매우 중요함</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>9</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>절대적으로 중요</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>한 요소가 다른 요소보다 절대적으로 중요함</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-warning)' }}>2,4,6,8</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>중간값</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>위 판단들의 중간값</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>💡 비교 예시</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>질문:</strong><br/>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          "경제성"이 "안전성"에 비해 얼마나 더 중요합니까?
                        </span>
                      </div>
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                        <strong style={{ color: 'var(--accent-primary-dark)' }}>답변:</strong><br/>
                        <span style={{ color: 'var(--accent-primary-dark)' }}>
                          척도 3 → 경제성이 안전성보다 약간 더 중요
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>🔄 상호비율성</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>원리:</strong><br/>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          A가 B보다 3배 중요하면, B는 A보다 1/3배 중요
                        </span>
                      </div>
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
                        <strong style={{ color: 'var(--accent-secondary-dark)' }}>수식:</strong><br/>
                        <code style={{ color: 'var(--accent-secondary-dark)' }}>
                          a<sub>ji</sub> = 1/a<sub>ij</sub>
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'consistency':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                일관성 검증
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🧮 일관성 비율 (Consistency Ratio, CR)
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    쌍대비교의 논리적 일관성을 측정하는 지표입니다. CR 값이 0.1 이하이면 일관성이 있다고 판단합니다.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>계산 공식</h4>
                      <code style={{ color: 'var(--text-primary)' }}>
                        CR = CI / RI<br/>
                        CI = (λmax - n) / (n - 1)<br/>
                        λmax: 최대고유값<br/>
                        n: 행렬의 크기
                      </code>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>판단 기준</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• CR ≤ 0.1: 일관성 있음 ✅</li>
                        <li>• 0.1 &lt; CR ≤ 0.2: 주의 필요 ⚠️</li>
                        <li>• CR &gt; 0.2: 재평가 필요 ❌</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📋 임의지수 (Random Index, RI)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <th className="p-2" style={{ color: 'var(--text-primary)' }}>n</th>
                          <th className="p-2" style={{ color: 'var(--text-primary)' }}>3</th>
                          <th className="p-2" style={{ color: 'var(--text-primary)' }}>4</th>
                          <th className="p-2" style={{ color: 'var(--text-primary)' }}>5</th>
                          <th className="p-2" style={{ color: 'var(--text-primary)' }}>6</th>
                          <th className="p-2" style={{ color: 'var(--text-primary)' }}>7</th>
                          <th className="p-2" style={{ color: 'var(--text-primary)' }}>8</th>
                          <th className="p-2" style={{ color: 'var(--text-primary)' }}>9</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-semibold" style={{ color: 'var(--text-primary)' }}>RI</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>0.58</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>0.90</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>1.12</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>1.24</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>1.32</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>1.41</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>1.45</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-warning-pastel)', borderColor: 'var(--accent-warning)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-warning-dark)' }}>
                    ⚠️ 일관성 개선 방법
                  </h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                    <li>• 가장 일관성이 낮은 비교항목 식별</li>
                    <li>• 해당 쌍대비교 값 재검토 및 수정</li>
                    <li>• 전체적인 판단 논리 재점검</li>
                    <li>• 필요시 계층구조 재설계</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'calculation':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                가중치 계산 방법
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🔢 고유벡터법 (Eigenvector Method)
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    쌍대비교 행렬의 주고유벡터를 구하여 가중치를 계산하는 가장 정확한 방법입니다.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>계산 단계</h4>
                      <ol className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>1. 쌍대비교 행렬 A 구성</li>
                        <li>2. Aw = λmax·w 방정식 해결</li>
                        <li>3. 주고유벡터 w 정규화</li>
                        <li>4. 가중치 벡터 획득</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    ⚡ 근사 계산법들
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>1. 기하평균법</h4>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        각 행의 기하평균을 구하여 정규화
                      </p>
                      <code className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        wi = (∏aij)^(1/n) / Σ(∏aij)^(1/n)
                      </code>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>2. 정규화법</h4>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        각 열을 정규화한 후 행 평균
                      </p>
                      <code className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        wi = (1/n)Σ(aij/Σaij)
                      </code>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📊 최종 점수 계산
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>종합점수 공식</h4>
                      <code style={{ color: 'var(--accent-primary-dark)' }}>
                        Si = Σ(wj × sij)<br/>
                        Si: 대안 i의 종합점수<br/>
                        wj: 기준 j의 가중치<br/>
                        sij: 기준 j에 대한 대안 i의 점수
                      </code>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>예시 계산</h4>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <p>기준 가중치: 경제성(0.5), 안전성(0.3), 편의성(0.2)</p>
                        <p>대안 A 점수: 0.5×0.6 + 0.3×0.2 + 0.2×0.8 = 0.52</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'application':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                AHP 적용 사례
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🏢</span> 비즈니스 분야
                  </h3>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>전략 기획:</strong> 사업 포트폴리오 선택</li>
                    <li>• <strong>공급업체 선정:</strong> 다기준 벤더 평가</li>
                    <li>• <strong>투자 결정:</strong> 프로젝트 우선순위</li>
                    <li>• <strong>마케팅:</strong> 시장 세분화 전략</li>
                    <li>• <strong>품질 관리:</strong> 개선 항목 우선순위</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🏛️</span> 공공 분야
                  </h3>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>정책 수립:</strong> 공공정책 우선순위</li>
                    <li>• <strong>도시 계획:</strong> 개발 지역 선정</li>
                    <li>• <strong>환경 관리:</strong> 환경영향 평가</li>
                    <li>• <strong>교통 계획:</strong> 교통수단 투자 우선순위</li>
                    <li>• <strong>의료 시스템:</strong> 병원 입지 선정</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🔬</span> 연구 분야
                  </h3>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>기술 평가:</strong> R&D 프로젝트 선정</li>
                    <li>• <strong>논문 연구:</strong> 연구 주제 우선순위</li>
                    <li>• <strong>제품 개발:</strong> 신제품 컨셉 평가</li>
                    <li>• <strong>시스템 설계:</strong> 설계 대안 비교</li>
                    <li>• <strong>성과 평가:</strong> 다차원 평가 모델</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">👤</span> 개인 의사결정
                  </h3>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>진로 선택:</strong> 직업/전공 결정</li>
                    <li>• <strong>구매 결정:</strong> 자동차, 주택 선택</li>
                    <li>• <strong>여행 계획:</strong> 여행지 선정</li>
                    <li>• <strong>교육 선택:</strong> 학교/과정 선택</li>
                    <li>• <strong>라이프스타일:</strong> 생활 우선순위</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-tertiary-pastel)', border: '1px solid var(--accent-tertiary)' }}>
                <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-tertiary-dark)' }}>
                  <span className="mr-2">🎯</span> 실제 적용 사례: 대학 선택
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>기준 (가중치)</h4>
                    <ul style={{ color: 'var(--accent-tertiary-dark)' }}>
                      <li>• 학업 환경 (40%)</li>
                      <li>• 등록금 (30%)</li>
                      <li>• 위치 (20%)</li>
                      <li>• 취업률 (10%)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>결과</h4>
                    <ul style={{ color: 'var(--accent-tertiary-dark)' }}>
                      <li>• A대학: 0.45 (1순위)</li>
                      <li>• B대학: 0.35 (2순위)</li>
                      <li>• C대학: 0.20 (3순위)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advantages':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                AHP의 장단점
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-tertiary-pastel)', border: '1px solid var(--accent-tertiary)' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--accent-tertiary-dark)' }}>
                    <span className="mr-2">✅</span> 장점
                  </h3>
                  <ul className="space-y-3 text-sm" style={{ color: 'var(--accent-tertiary-dark)' }}>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">🎯</span>
                      <div>
                        <strong>체계적 접근:</strong><br/>
                        복잡한 문제를 단계적으로 분해하여 해결
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">🔢</span>
                      <div>
                        <strong>정량적 분석:</strong><br/>
                        주관적 판단을 수치화하여 객관성 확보
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">✅</span>
                      <div>
                        <strong>일관성 검증:</strong><br/>
                        논리적 일관성을 수학적으로 검증 가능
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">👥</span>
                      <div>
                        <strong>집단 의사결정:</strong><br/>
                        다수의 의견을 체계적으로 통합
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">🔄</span>
                      <div>
                        <strong>유연성:</strong><br/>
                        다양한 문제에 적용 가능한 범용성
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-warning-pastel)', border: '1px solid var(--accent-warning)' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--accent-warning-dark)' }}>
                    <span className="mr-2">⚠️</span> 단점 및 한계
                  </h3>
                  <ul className="space-y-3 text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">⏱️</span>
                      <div>
                        <strong>시간 소요:</strong><br/>
                        많은 쌍대비교로 인한 시간과 노력 필요
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">🧠</span>
                      <div>
                        <strong>인지적 부담:</strong><br/>
                        평가자의 인지 능력에 따른 결과 차이
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">📏</span>
                      <div>
                        <strong>척도의 제약:</strong><br/>
                        9점 척도의 세밀함 한계
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">🔄</span>
                      <div>
                        <strong>순위 역전:</strong><br/>
                        대안 추가 시 기존 순위 변경 가능성
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">👤</span>
                      <div>
                        <strong>주관성:</strong><br/>
                        개인적 편견과 선입견의 영향
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  💡 효과적 활용을 위한 권장사항
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>적절한 계층 설계:</strong> 7±2 원칙 준수</li>
                    <li>• <strong>명확한 정의:</strong> 기준과 대안의 구체적 정의</li>
                    <li>• <strong>전문가 활용:</strong> 도메인 전문가 참여</li>
                    <li>• <strong>충분한 토론:</strong> 평가 전 충분한 논의</li>
                  </ul>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>일관성 관리:</strong> CR 값 지속적 모니터링</li>
                    <li>• <strong>민감도 분석:</strong> 가중치 변화에 따른 영향 분석</li>
                    <li>• <strong>검증 과정:</strong> 결과의 논리적 타당성 확인</li>
                    <li>• <strong>지속적 개선:</strong> 피드백을 통한 모델 개선</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>섹션을 선택해주세요.</div>;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 헤더 */}
      <div className="p-6 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
               style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
            📖
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              AHP 방법론 가이드
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Analytic Hierarchy Process 완전 분석 가이드
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 사이드 네비게이션 */}
        <div className="w-80 border-r" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              목차
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

export default AHPMethodologyPage;