/**
 * 퍼지 AHP 방법론 설명 페이지
 * AI 논문 지원 시스템의 일부로 Fuzzy AHP 기본 개념과 적용 방법을 설명
 */

import React, { useState } from 'react';

const FuzzyAHPMethodologyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: '개요', icon: '🌐' },
    { id: 'fuzzy-theory', title: '퍼지 이론', icon: '🔮' },
    { id: 'fuzzy-numbers', title: '퍼지 수', icon: '🔢' },
    { id: 'fuzzy-scales', title: '퍼지 척도', icon: '📏' },
    { id: 'fuzzy-operations', title: '퍼지 연산', icon: '🧮' },
    { id: 'defuzzification', title: '비퍼지화', icon: '📊' },
    { id: 'comparison', title: '기존 AHP 비교', icon: '⚖️' },
    { id: 'applications', title: '적용 사례', icon: '💼' },
    { id: 'advantages', title: '장단점', icon: '📈' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                퍼지 AHP (Fuzzy Analytic Hierarchy Process) 개요
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                퍼지 AHP는 전통적인 AHP에 <strong>퍼지 이론(Fuzzy Theory)</strong>을 결합한 고급 의사결정 기법입니다. 
                불확실성과 애매모호함이 있는 실세계의 복잡한 문제에서 더욱 현실적이고 유연한 의사결정을 가능하게 합니다.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎯 개발 배경</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 기존 AHP의 정확한 수치 요구사항 한계</li>
                    <li>• 실세계의 불확실성과 모호성 반영</li>
                    <li>• 언어적 표현의 수치화 필요성</li>
                    <li>• 집단 의사결정의 다양성 수용</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🔧 핵심 특징</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 퍼지 수를 이용한 쌍대비교</li>
                    <li>• 불확실성의 체계적 처리</li>
                    <li>• 언어적 변수의 활용</li>
                    <li>• 더 유연한 판단 허용</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-primary-pastel)', borderColor: 'var(--accent-primary)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>
                  💡 왜 퍼지 AHP인가?
                </h3>
                <p className="text-sm" style={{ color: 'var(--accent-primary-dark)' }}>
                  "A가 B보다 정확히 3배 중요하다"고 단정하기 어려운 현실에서, 
                  "A가 B보다 대략 2-4 정도 범위에서 중요하다"는 식의 
                  더 자연스럽고 현실적인 판단을 가능하게 합니다.
                </p>
              </div>
            </div>
          </div>
        );

      case 'fuzzy-theory':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                퍼지 이론 기초
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">📚</span> 퍼지 이론이란?
                  </h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    1965년 로트피 자데(Lotfi Zadeh)가 제안한 이론으로, 전통적인 이분법적 논리(0 또는 1)를 넘어서 
                    0과 1 사이의 연속적인 값으로 소속 정도를 표현하는 논리 체계입니다.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>기존 논리 (이분법)</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 키 180cm → "키가 크다" (1) 또는 "키가 작다" (0)</li>
                        <li>• 명확한 경계 구분</li>
                        <li>• 불확실성 표현 한계</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>퍼지 논리</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--accent-primary-dark)' }}>
                        <li>• 키 175cm → "키가 크다" (0.7)</li>
                        <li>• 연속적인 소속도</li>
                        <li>• 애매모호함의 자연스러운 표현</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🎭</span> 소속 함수 (Membership Function)
                  </h3>
                  
                  <div className="space-y-4">
                    <p style={{ color: 'var(--text-secondary)' }}>
                      퍼지 집합에서 각 원소가 해당 집합에 속하는 정도를 나타내는 함수입니다.
                    </p>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>수학적 정의</h4>
                      <code style={{ color: 'var(--text-primary)' }}>
                        μ_A(x): X → [0, 1]<br/>
                        여기서 μ_A(x)는 원소 x가 퍼지집합 A에 속하는 정도
                      </code>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                        <h5 className="font-semibold mb-1" style={{ color: 'var(--accent-primary-dark)' }}>삼각형 함수</h5>
                        <div className="text-2xl mb-1">📐</div>
                        <p className="text-xs" style={{ color: 'var(--accent-primary-dark)' }}>
                          가장 단순하고<br/>직관적인 형태
                        </p>
                      </div>
                      
                      <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
                        <h5 className="font-semibold mb-1" style={{ color: 'var(--accent-secondary-dark)' }}>사다리꼴 함수</h5>
                        <div className="text-2xl mb-1">📊</div>
                        <p className="text-xs" style={{ color: 'var(--accent-secondary-dark)' }}>
                          평탄한 최대값<br/>구간 존재
                        </p>
                      </div>
                      
                      <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--accent-tertiary-pastel)' }}>
                        <h5 className="font-semibold mb-1" style={{ color: 'var(--accent-tertiary-dark)' }}>가우시안 함수</h5>
                        <div className="text-2xl mb-1">🔔</div>
                        <p className="text-xs" style={{ color: 'var(--accent-tertiary-dark)' }}>
                          정규분포 형태의<br/>부드러운 곡선
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">💬</span> 언어적 변수 (Linguistic Variables)
                  </h3>
                  
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    인간의 자연스러운 언어 표현을 퍼지 수로 변환하여 처리하는 변수입니다.
                  </p>
                  
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-quaternary-pastel)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-quaternary-dark)' }}>예시: "중요도" 언어적 변수</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>매우 낮음</div>
                        <div style={{ color: 'var(--text-secondary)' }}>(1, 1, 3)</div>
                      </div>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>낮음</div>
                        <div style={{ color: 'var(--text-secondary)' }}>(1, 3, 5)</div>
                      </div>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>보통</div>
                        <div style={{ color: 'var(--text-secondary)' }}>(3, 5, 7)</div>
                      </div>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>높음</div>
                        <div style={{ color: 'var(--text-secondary)' }}>(5, 7, 9)</div>
                      </div>
                      <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>매우 높음</div>
                        <div style={{ color: 'var(--text-secondary)' }}>(7, 9, 9)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fuzzy-numbers':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                퍼지 수 (Fuzzy Numbers)
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🔢</span> 퍼지 수의 정의
                  </h3>
                  
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    퍼지 수는 불확실성이나 애매모호함을 포함하는 수치를 표현하는 방법입니다. 
                    하나의 정확한 값 대신 가능한 값들의 범위와 각 값의 가능성을 나타냅니다.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>일반 수 vs 퍼지 수</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li><strong>일반 수:</strong> "정확히 5"</li>
                        <li><strong>퍼지 수:</strong> "대략 5 (4~6 범위)"</li>
                        <li><strong>표현:</strong> (4, 5, 6) 삼각퍼지수</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>삼각퍼지수 (TFN)</h4>
                      <div style={{ color: 'var(--accent-primary-dark)' }}>
                        <code>Ã = (l, m, u)</code>
                        <ul className="text-sm mt-2 space-y-1">
                          <li>• l: 최소값 (lower)</li>
                          <li>• m: 최빈값 (most likely)</li>
                          <li>• u: 최대값 (upper)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">📐</span> 삼각퍼지수의 소속함수
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>수학적 정의</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        μ(x) = <br/>
                        &nbsp;&nbsp;0, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x &lt; l<br/>
                        &nbsp;&nbsp;(x-l)/(m-l), &nbsp;&nbsp;l ≤ x ≤ m<br/>
                        &nbsp;&nbsp;(u-x)/(u-m), &nbsp;&nbsp;m ≤ x ≤ u<br/>
                        &nbsp;&nbsp;0, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x &gt; u
                      </code>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary-dark)' }}>시각적 표현</h4>
                      <div className="text-center">
                        <div className="inline-block p-4" style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ color: 'var(--text-primary)' }}>
                            <pre className="text-xs">
{`    μ(x)
      ^
    1 |    /\\
      |   /  \\
      |  /    \\
    0 |_/______\\___> x
        l  m    u`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">📊</span> 다른 퍼지수 유형들
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>사다리꼴 퍼지수</h4>
                      <div style={{ color: 'var(--accent-primary-dark)' }}>
                        <code>Ã = (a, b, c, d)</code>
                        <p className="text-sm mt-2">평탄한 최대값 구간 [b, c]를 가지는 형태</p>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary-dark)' }}>가우시안 퍼지수</h4>
                      <div style={{ color: 'var(--accent-secondary-dark)' }}>
                        <code>μ(x) = e^(-½((x-c)/σ)²)</code>
                        <p className="text-sm mt-2">정규분포 형태의 부드러운 곡선</p>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-tertiary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>구간 퍼지수</h4>
                      <div style={{ color: 'var(--accent-tertiary-dark)' }}>
                        <code>Ã = [a, b]</code>
                        <p className="text-sm mt-2">구간 내에서 균등한 소속도 1을 가지는 형태</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-quaternary-pastel)', borderColor: 'var(--accent-quaternary)' }}>
                  <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-quaternary-dark)' }}>
                    <span className="mr-2">💡</span> 실제 예시: 프로젝트 비용 추정
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-quaternary-dark)' }}>기존 방식</h4>
                      <ul style={{ color: 'var(--accent-quaternary-dark)' }}>
                        <li>• "정확히 1억원"</li>
                        <li>• 불확실성 표현 불가</li>
                        <li>• 위험 요소 무시</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-quaternary-dark)' }}>퍼지 방식</h4>
                      <ul style={{ color: 'var(--accent-quaternary-dark)' }}>
                        <li>• "최소 8천만원, 예상 1억원, 최대 1.3억원"</li>
                        <li>• (0.8, 1.0, 1.3) 삼각퍼지수</li>
                        <li>• 불확실성과 위험 반영</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fuzzy-scales':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                퍼지 척도 (Fuzzy Scales)
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">📏</span> 퍼지 쌍대비교 척도
                  </h3>
                  
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    기존 Saaty의 9점 척도를 퍼지 수로 확장하여 불확실성과 애매모호함을 반영합니다.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>언어적 표현</th>
                          <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>삼각퍼지수 (TFN)</th>
                          <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>역수</th>
                          <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>의미</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>동등하게 중요</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(1, 1, 1)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(1, 1, 1)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>두 요소가 똑같이 중요함</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>약간 더 중요</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(2, 3, 4)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(1/4, 1/3, 1/2)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>한 요소가 약간 더 중요함</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>중요함</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(4, 5, 6)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(1/6, 1/5, 1/4)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>한 요소가 중요함</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>매우 중요함</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(6, 7, 8)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(1/8, 1/7, 1/6)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>한 요소가 매우 중요함</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>절대적으로 중요</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(9, 9, 9)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>(1/9, 1/9, 1/9)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>한 요소가 절대적으로 중요함</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                      <span className="mr-2">📊</span> 중간값 척도
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>중간 정도의 중요함</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div style={{ color: 'var(--text-secondary)' }}>
                            <strong>약간~중요 사이:</strong><br/>
                            (3, 4, 5)
                          </div>
                          <div style={{ color: 'var(--text-secondary)' }}>
                            <strong>중요~매우중요 사이:</strong><br/>
                            (5, 6, 7)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                      <span className="mr-2">🎯</span> 척도 선택 가이드
                    </h3>
                    
                    <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <li>• <strong>확신이 높을 때:</strong> 좁은 범위 (예: (5,5,5) 대신 (4,5,6))</li>
                      <li>• <strong>불확실할 때:</strong> 넓은 범위 (예: (2,5,8))</li>
                      <li>• <strong>전문가 의견:</strong> 좁은 범위</li>
                      <li>• <strong>일반인 의견:</strong> 넓은 범위</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🔄</span> 다양한 퍼지 척도 변형
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>Chang의 척도</h4>
                      <div className="text-sm" style={{ color: 'var(--accent-primary-dark)' }}>
                        • (1,1,1), (1,2,3)<br/>
                        • (2,3,4), (3,4,5)<br/>
                        • 등차수열 형태
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary-dark)' }}>Buckley의 척도</h4>
                      <div className="text-sm" style={{ color: 'var(--accent-secondary-dark)' }}>
                        • (1,1,3), (1,3,5)<br/>
                        • (3,5,7), (5,7,9)<br/>
                        • 겹치는 범위 허용
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-tertiary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>사용자 정의 척도</h4>
                      <div className="text-sm" style={{ color: 'var(--accent-tertiary-dark)' }}>
                        • 도메인 특성 반영<br/>
                        • 전문가 의견 기반<br/>
                        • 실험적 검증 필요
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-warning-pastel)', borderColor: 'var(--accent-warning)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-warning-dark)' }}>
                    ⚠️ 척도 설계 시 주의사항
                  </h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                    <li>• 척도 간 의미적 일관성 유지</li>
                    <li>• 역수 관계의 수학적 정확성</li>
                    <li>• 평가자의 인지적 부담 고려</li>
                    <li>• 도메인별 특성 반영</li>
                    <li>• 사전 테스트와 검증 필수</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fuzzy-operations':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                퍼지 연산 (Fuzzy Operations)
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">➕</span> 퍼지 수의 사칙연산
                  </h3>
                  
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    삼각퍼지수 Ã₁ = (l₁, m₁, u₁)과 Ã₂ = (l₂, m₂, u₂)에 대한 기본 연산들입니다.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>덧셈 (Addition)</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        Ã₁ ⊕ Ã₂ = (l₁+l₂, m₁+m₂, u₁+u₂)
                      </code>
                      <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        예: (1,2,3) ⊕ (2,3,4) = (3,5,7)
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>뺄셈 (Subtraction)</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        Ã₁ ⊖ Ã₂ = (l₁-u₂, m₁-m₂, u₁-l₂)
                      </code>
                      <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        예: (2,3,4) ⊖ (1,2,3) = (-1,1,3)
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>곱셈 (Multiplication)</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        Ã₁ ⊗ Ã₂ = (l₁×l₂, m₁×m₂, u₁×u₂)
                      </code>
                      <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        (양수인 경우)
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>나눗셈 (Division)</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        Ã₁ ⊘ Ã₂ = (l₁/u₂, m₁/m₂, u₁/l₂)
                      </code>
                      <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        (양수인 경우)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🔢</span> 스칼라와의 연산
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>스칼라 곱셈</h4>
                      <div style={{ color: 'var(--accent-primary-dark)' }}>
                        <code>k ⊗ Ã = (k×l, k×m, k×u)</code><br/>
                        <small>단, k &gt; 0인 경우</small>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary-dark)' }}>거듭제곱</h4>
                      <div style={{ color: 'var(--accent-secondary-dark)' }}>
                        <code>Ãⁿ = (lⁿ, mⁿ, uⁿ)</code><br/>
                        <small>단, l, m, u &gt; 0이고 n &gt; 0인 경우</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🎯</span> 퍼지 AHP에서의 주요 연산
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>1. 기하평균 (Geometric Mean)</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        r̃ᵢ = (∏ãᵢⱼ)^(1/n) = ((∏lᵢⱼ)^(1/n), (∏mᵢⱼ)^(1/n), (∏uᵢⱼ)^(1/n))
                      </code>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        각 행의 퍼지 가중치를 계산하는 데 사용
                      </p>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>2. 퍼지 가중치 정규화</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        w̃ᵢ = r̃ᵢ ⊘ (⊕r̃ᵢ) = (lᵢ/∑uⱼ, mᵢ/∑mⱼ, uᵢ/∑lⱼ)
                      </code>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        가중치의 합이 1이 되도록 정규화
                      </p>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>3. 퍼지 종합점수</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        S̃ᵢ = ⊕(w̃ⱼ ⊗ s̃ᵢⱼ)
                      </code>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        각 대안의 최종 퍼지 점수 계산
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-tertiary-pastel)', borderColor: 'var(--accent-tertiary)' }}>
                  <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-tertiary-dark)' }}>
                    <span className="mr-2">💡</span> 연산 예시: 퍼지 가중치 계산
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>입력 데이터</h4>
                      <div style={{ color: 'var(--accent-tertiary-dark)' }}>
                        쌍대비교 행 1: [(1,1,1), (2,3,4), (4,5,6)]<br/>
                        기하평균: ((1×2×4)^(1/3), (1×3×5)^(1/3), (1×4×6)^(1/3))<br/>
                        = (2.00, 2.47, 2.88)
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>정규화 결과</h4>
                      <div style={{ color: 'var(--accent-tertiary-dark)' }}>
                        전체 합계: (5.48, 6.84, 8.45)<br/>
                        정규화: (2.00/8.45, 2.47/6.84, 2.88/5.48)<br/>
                        = (0.237, 0.361, 0.526)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'defuzzification':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                비퍼지화 (Defuzzification)
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🎯</span> 비퍼지화란?
                  </h3>
                  
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    퍼지 수를 하나의 명확한 실수값으로 변환하는 과정입니다. 
                    최종적인 순위 결정이나 비교를 위해 필요한 중요한 단계입니다.
                  </p>
                  
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>
                      왜 비퍼지화가 필요한가?
                    </h4>
                    <ul className="text-sm space-y-1" style={{ color: 'var(--accent-primary-dark)' }}>
                      <li>• 퍼지 수 (2.3, 3.7, 5.1) vs (2.1, 3.9, 5.3) 직접 비교 어려움</li>
                      <li>• 명확한 순위 결정 필요</li>
                      <li>• 의사결정자의 이해도 향상</li>
                      <li>• 다른 방법론과의 결과 비교</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">📊</span> 주요 비퍼지화 방법들
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>1. 무게중심법 (COG)</h4>
                      <div style={{ color: 'var(--accent-primary-dark)' }}>
                        <code className="text-sm">
                          COG = (l + m + u) / 3
                        </code>
                        <p className="text-sm mt-2">가장 간단하고 직관적인 방법</p>
                        <p className="text-xs mt-1">예: (2,3,4) → (2+3+4)/3 = 3.0</p>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary-dark)' }}>2. 가중 평균법</h4>
                      <div style={{ color: 'var(--accent-secondary-dark)' }}>
                        <code className="text-sm">
                          WA = (α×l + β×m + γ×u) / (α+β+γ)
                        </code>
                        <p className="text-sm mt-2">각 점에 다른 가중치 부여</p>
                        <p className="text-xs mt-1">일반적으로 α=1, β=4, γ=1 사용</p>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-tertiary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>3. α-cut 방법</h4>
                      <div style={{ color: 'var(--accent-tertiary-dark)' }}>
                        <code className="text-sm">
                          α-cut = [l_α, u_α]에서 중점
                        </code>
                        <p className="text-sm mt-2">특정 신뢰수준에서의 구간 사용</p>
                        <p className="text-xs mt-1">α=0.5일 때 중간 신뢰도</p>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-quaternary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-quaternary-dark)' }}>4. 최대값 방법</h4>
                      <div style={{ color: 'var(--accent-quaternary-dark)' }}>
                        <code className="text-sm">
                          Max = m (최빈값 사용)
                        </code>
                        <p className="text-sm mt-2">가장 가능성이 높은 값 선택</p>
                        <p className="text-xs mt-1">보수적 접근 방식</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🔍</span> 고급 비퍼지화 방법들
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>거리 기반 방법</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div style={{ color: 'var(--text-secondary)' }}>
                          <strong>유클리드 거리:</strong><br/>
                          d(Ã, 0) = √[(l²+m²+u²)/3]
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          <strong>맨하탄 거리:</strong><br/>
                          d(Ã, 0) = (|l|+|m|+|u|)/3
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Chen & Hwang 방법</h4>
                      <code className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        CH = [(u-l) + (m-l)] / 3 + l
                      </code>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        불확실성의 정도를 고려한 가중평균
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">📈</span> 방법별 비교 및 선택 가이드
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <th className="p-2 text-left" style={{ color: 'var(--text-primary)' }}>방법</th>
                          <th className="p-2 text-left" style={{ color: 'var(--text-primary)' }}>장점</th>
                          <th className="p-2 text-left" style={{ color: 'var(--text-primary)' }}>단점</th>
                          <th className="p-2 text-left" style={{ color: 'var(--text-primary)' }}>적용 상황</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>무게중심법</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>단순, 직관적</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>모든 점 동일 가중치</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>일반적 용도</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>가중평균법</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>유연성, 정확성</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>가중치 설정 필요</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>정밀한 분석</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold" style={{ color: 'var(--accent-primary)' }}>최대값법</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>보수적, 안전</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>정보 손실</td>
                          <td className="p-2" style={{ color: 'var(--text-secondary)' }}>위험 회피</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-warning-pastel)', borderColor: 'var(--accent-warning)' }}>
                  <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-warning-dark)' }}>
                    <span className="mr-2">💡</span> 실제 적용 예시
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-warning-dark)' }}>퍼지 점수들</h4>
                      <ul style={{ color: 'var(--accent-warning-dark)' }}>
                        <li>대안 A: (0.2, 0.35, 0.5)</li>
                        <li>대안 B: (0.1, 0.4, 0.6)</li>
                        <li>대안 C: (0.3, 0.3, 0.4)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-warning-dark)' }}>무게중심법 결과</h4>
                      <ul style={{ color: 'var(--accent-warning-dark)' }}>
                        <li>대안 A: 0.35</li>
                        <li>대안 B: 0.37 (최고)</li>
                        <li>대안 C: 0.33</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                기존 AHP vs 퍼지 AHP 비교
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">⚖️</span> 방법론 비교 개요
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>구분</th>
                          <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>기존 AHP</th>
                          <th className="p-3 text-left" style={{ color: 'var(--text-primary)' }}>퍼지 AHP</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>입력값</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>정확한 실수 (예: 3, 5, 7)</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>퍼지 수 (예: (2,3,4), (4,5,6))</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>불확실성</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>반영 불가</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>체계적 반영</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>판단 표현</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>"정확히 3배 중요"</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>"대략 2-4배 중요"</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>계산 복잡도</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>상대적으로 단순</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>상대적으로 복잡</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>결과</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>정확한 실수값</td>
                          <td className="p-3" style={{ color: 'var(--text-secondary)' }}>퍼지 수 (비퍼지화 후 실수)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary-pastel)', border: '1px solid var(--accent-primary)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-primary-dark)' }}>
                      <span className="mr-2">📊</span> 기존 AHP의 특징
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--accent-primary-dark)' }}>✅ 장점</h4>
                        <ul className="space-y-1" style={{ color: 'var(--accent-primary-dark)' }}>
                          <li>• 수학적으로 정확하고 간단</li>
                          <li>• 계산이 상대적으로 쉬움</li>
                          <li>• 결과 해석이 직관적</li>
                          <li>• 이론적 기반이 견고</li>
                          <li>• 소프트웨어 구현 용이</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--accent-primary-dark)' }}>❌ 단점</h4>
                        <ul className="space-y-1" style={{ color: 'var(--accent-primary-dark)' }}>
                          <li>• 정확한 수치 요구로 부담</li>
                          <li>• 불확실성 표현 불가</li>
                          <li>• 애매한 상황에서 부적절</li>
                          <li>• 집단 의견 차이 반영 한계</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-secondary-pastel)', border: '1px solid var(--accent-secondary)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-secondary-dark)' }}>
                      <span className="mr-2">🌐</span> 퍼지 AHP의 특징
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--accent-secondary-dark)' }}>✅ 장점</h4>
                        <ul className="space-y-1" style={{ color: 'var(--accent-secondary-dark)' }}>
                          <li>• 불확실성과 애매함 반영</li>
                          <li>• 현실적이고 유연한 판단</li>
                          <li>• 집단 의견의 다양성 수용</li>
                          <li>• 언어적 표현 활용 가능</li>
                          <li>• 위험과 불확실성 고려</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--accent-secondary-dark)' }}>❌ 단점</h4>
                        <ul className="space-y-1" style={{ color: 'var(--accent-secondary-dark)' }}>
                          <li>• 계산 과정이 복잡</li>
                          <li>• 결과 해석의 어려움</li>
                          <li>• 소프트웨어 의존도 높음</li>
                          <li>• 학습 곡선이 가파름</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🎯</span> 적용 시나리오별 권장사항
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>기존 AHP 권장 상황</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 정확한 데이터 확보 가능</li>
                        <li>• 단일 전문가 의사결정</li>
                        <li>• 명확한 기준과 대안</li>
                        <li>• 빠른 결과 도출 필요</li>
                        <li>• 교육/학습 목적</li>
                        <li>• 일반적인 비즈니스 문제</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>퍼지 AHP 권장 상황</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 불확실한 환경</li>
                        <li>• 집단 의사결정</li>
                        <li>• 주관적 판단 위주</li>
                        <li>• 언어적 평가 필요</li>
                        <li>• 위험 요소 고려 필요</li>
                        <li>• 복잡한 전략적 문제</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-tertiary-pastel)', borderColor: 'var(--accent-tertiary)' }}>
                  <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-tertiary-dark)' }}>
                    <span className="mr-2">💡</span> 하이브리드 접근법
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>단계별 적용</h4>
                      <ul style={{ color: 'var(--accent-tertiary-dark)' }}>
                        <li>• 1단계: 퍼지 AHP로 초기 분석</li>
                        <li>• 2단계: 주요 요소 식별</li>
                        <li>• 3단계: 기존 AHP로 정밀 분석</li>
                        <li>• 4단계: 결과 비교 및 검증</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>병렬 분석</h4>
                      <ul style={{ color: 'var(--accent-tertiary-dark)' }}>
                        <li>• 동일 문제를 두 방법으로 분석</li>
                        <li>• 결과 차이 분석</li>
                        <li>• 민감도 분석 수행</li>
                        <li>• 통합적 결론 도출</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                퍼지 AHP 적용 사례
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-primary-pastel)', border: '1px solid var(--accent-primary)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-primary-dark)' }}>
                      <span className="mr-2">🏭</span> 공급업체 선정
                    </h3>
                    
                    <div className="space-y-3 text-sm" style={{ color: 'var(--accent-primary-dark)' }}>
                      <div>
                        <h4 className="font-semibold">평가 기준</h4>
                        <ul className="mt-1 space-y-1">
                          <li>• 품질 (가중치: 40%)</li>
                          <li>• 가격 (가중치: 30%)</li>
                          <li>• 납기 (가중치: 20%)</li>
                          <li>• 서비스 (가중치: 10%)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">퍼지 평가 예시</h4>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          품질: "매우 좋음" → (7,8,9)<br/>
                          가격: "보통" → (4,5,6)<br/>
                          납기: "좋음" → (6,7,8)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-secondary-pastel)', border: '1px solid var(--accent-secondary)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-secondary-dark)' }}>
                      <span className="mr-2">🏢</span> 신기술 투자 결정
                    </h3>
                    
                    <div className="space-y-3 text-sm" style={{ color: 'var(--accent-secondary-dark)' }}>
                      <div>
                        <h4 className="font-semibold">불확실성 요소</h4>
                        <ul className="mt-1 space-y-1">
                          <li>• 기술의 성숙도</li>
                          <li>• 시장 수용성</li>
                          <li>• 경쟁사 대응</li>
                          <li>• 규제 환경 변화</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">퍼지 접근법 활용</h4>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          ROI: "대략 15-25%" → (15,20,25)<br/>
                          위험도: "중간 정도" → (4,5,6)<br/>
                          실현시점: "2-4년" → (2,3,4)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-tertiary-pastel)', border: '1px solid var(--accent-tertiary)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-tertiary-dark)' }}>
                      <span className="mr-2">🏥</span> 의료 시설 위치 선정
                    </h3>
                    
                    <div className="space-y-3 text-sm" style={{ color: 'var(--accent-tertiary-dark)' }}>
                      <div>
                        <h4 className="font-semibold">평가 기준</h4>
                        <ul className="mt-1 space-y-1">
                          <li>• 접근성 (교통 편의)</li>
                          <li>• 인구 밀도</li>
                          <li>• 경쟁 병원과의 거리</li>
                          <li>• 부지 비용</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">언어적 평가 활용</h4>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          "교통이 매우 편리함"<br/>
                          "인구가 적당히 많음"<br/>
                          "경쟁이 거의 없음"
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-quaternary-pastel)', border: '1px solid var(--accent-quaternary)' }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-quaternary-dark)' }}>
                      <span className="mr-2">🌱</span> 환경 영향 평가
                    </h3>
                    
                    <div className="space-y-3 text-sm" style={{ color: 'var(--accent-quaternary-dark)' }}>
                      <div>
                        <h4 className="font-semibold">평가 영역</h4>
                        <ul className="mt-1 space-y-1">
                          <li>• 대기 질 영향</li>
                          <li>• 수질 오염도</li>
                          <li>• 생태계 파괴</li>
                          <li>• 소음 공해</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">불확실성 반영</h4>
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          장기 영향의 불확실성<br/>
                          측정 데이터의 오차<br/>
                          전문가 의견 차이
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">📚</span> 학술 연구 분야 적용
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>경영학</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 전략적 의사결정</li>
                        <li>• 성과 평가 모델</li>
                        <li>• 리스크 관리</li>
                        <li>• 브랜드 가치 평가</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>공학</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 시스템 설계 최적화</li>
                        <li>• 품질 관리</li>
                        <li>• 안전성 평가</li>
                        <li>• 기술 선택</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>사회과학</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 정책 우선순위</li>
                        <li>• 도시 계획</li>
                        <li>• 교육 정책</li>
                        <li>• 복지 시스템</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-warning-pastel)', borderColor: 'var(--accent-warning)' }}>
                  <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--accent-warning-dark)' }}>
                    <span className="mr-2">📊</span> 실제 연구 사례: 스마트폰 선택
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-warning-dark)' }}>연구 설계</h4>
                      <ul style={{ color: 'var(--accent-warning-dark)' }}>
                        <li>• 대상: 대학생 100명</li>
                        <li>• 기준: 성능, 디자인, 가격, 브랜드</li>
                        <li>• 대안: iPhone, Galaxy, Pixel</li>
                        <li>• 방법: 집단 퍼지 AHP</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-warning-dark)' }}>주요 발견</h4>
                      <ul style={{ color: 'var(--accent-warning-dark)' }}>
                        <li>• 개인차가 큰 선호도 반영</li>
                        <li>• 브랜드의 애매한 가치 표현</li>
                        <li>• 불확실한 미래 기술 고려</li>
                        <li>• 기존 AHP 대비 현실적 결과</li>
                      </ul>
                    </div>
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
                퍼지 AHP의 장단점 및 한계
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-tertiary-pastel)', border: '1px solid var(--accent-tertiary)' }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--accent-tertiary-dark)' }}>
                      <span className="mr-2">✅</span> 주요 장점들
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-tertiary-dark)' }}>현실적 판단 반영</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-tertiary-dark)' }}>
                            애매모호한 상황에서도 자연스러운 판단 표현 가능
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🤝</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-tertiary-dark)' }}>집단 의사결정 개선</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-tertiary-dark)' }}>
                            다양한 의견과 불확실성을 체계적으로 통합
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">💬</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-tertiary-dark)' }}>언어적 표현 활용</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-tertiary-dark)' }}>
                            "매우 중요", "대략 좋음" 등 자연스러운 표현 사용
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🛡️</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-tertiary-dark)' }}>위험 요소 고려</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-tertiary-dark)' }}>
                            불확실성과 리스크를 의사결정에 직접 반영
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🔄</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-tertiary-dark)' }}>유연한 적용</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-tertiary-dark)' }}>
                            다양한 분야와 상황에 맞춤형 적용 가능
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-warning-pastel)', border: '1px solid var(--accent-warning)' }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--accent-warning-dark)' }}>
                      <span className="mr-2">⚠️</span> 주요 단점들
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🧮</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-warning-dark)' }}>계산 복잡성</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                            퍼지 연산으로 인한 높은 계산 복잡도
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">📊</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-warning-dark)' }}>결과 해석 어려움</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                            퍼지 수 결과의 이해와 의사소통 어려움
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">⏱️</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-warning-dark)' }}>시간 소요</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                            척도 설정과 평가에 더 많은 시간 필요
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">🎓</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-warning-dark)' }}>학습 곡선</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                            퍼지 이론 이해를 위한 높은 학습 장벽
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">💻</span>
                        <div>
                          <h4 className="font-semibold" style={{ color: 'var(--accent-warning-dark)' }}>소프트웨어 의존</h4>
                          <p className="text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                            전용 소프트웨어나 고급 도구 필요
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">🚧</span> 주요 한계사항
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>이론적 한계</h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• 퍼지 연산의 정보 손실</li>
                          <li>• 일관성 검증 방법의 미성숙</li>
                          <li>• 척도 선택의 주관성</li>
                        </ul>
                      </div>
                      
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>실용적 한계</h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• 대규모 문제 적용의 어려움</li>
                          <li>• 실시간 의사결정에 부적합</li>
                          <li>• 비전문가 활용 장벽</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>비교 기준</h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• 기존 AHP 결과와의 차이</li>
                          <li>• 다른 MCDM 방법론과의 비교</li>
                          <li>• 검증 방법론의 부족</li>
                        </ul>
                      </div>
                      
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>기술적 한계</h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          <li>• 계산 자원 요구량</li>
                          <li>• 알고리즘 구현 복잡성</li>
                          <li>• 오차 누적 가능성</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <span className="mr-2">💡</span> 효과적 활용을 위한 권장사항
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-primary-dark)' }}>사전 준비</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--accent-primary-dark)' }}>
                        <li>• 퍼지 이론 기초 학습</li>
                        <li>• 적절한 소프트웨어 선택</li>
                        <li>• 도메인 전문가 참여</li>
                        <li>• 충분한 시간 확보</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-secondary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary-dark)' }}>설계 단계</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--accent-secondary-dark)' }}>
                        <li>• 적절한 퍼지 척도 선택</li>
                        <li>• 명확한 언어적 정의</li>
                        <li>• 파일럿 테스트 수행</li>
                        <li>• 일관성 검증 계획</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded" style={{ backgroundColor: 'var(--accent-tertiary-pastel)' }}>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-tertiary-dark)' }}>결과 활용</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--accent-tertiary-dark)' }}>
                        <li>• 민감도 분석 수행</li>
                        <li>• 다른 방법과 비교</li>
                        <li>• 결과 시각화</li>
                        <li>• 지속적 모니터링</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--accent-quaternary-pastel)', borderColor: 'var(--accent-quaternary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--accent-quaternary-dark)' }}>
                    🎯 결론: 언제 퍼지 AHP를 사용할 것인가?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-quaternary-dark)' }}>권장 상황</h4>
                      <ul style={{ color: 'var(--accent-quaternary-dark)' }}>
                        <li>• 높은 불확실성 환경</li>
                        <li>• 집단 의사결정</li>
                        <li>• 주관적 평가 위주</li>
                        <li>• 장기적 전략 결정</li>
                        <li>• 혁신적 기술/제품 평가</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-quaternary-dark)' }}>비권장 상황</h4>
                      <ul style={{ color: 'var(--accent-quaternary-dark)' }}>
                        <li>• 정확한 데이터 풍부</li>
                        <li>• 빠른 결정 필요</li>
                        <li>• 단순한 선택 문제</li>
                        <li>• 자원 제약이 큰 경우</li>
                        <li>• 결과 정확성이 최우선</li>
                      </ul>
                    </div>
                  </div>
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
               style={{ backgroundColor: 'var(--accent-secondary)', color: 'white' }}>
            🌐
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              퍼지 AHP 방법론 가이드
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Fuzzy Analytic Hierarchy Process 완전 분석 가이드
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
                    backgroundColor: activeSection === section.id ? 'var(--accent-secondary)' : 'var(--bg-primary)',
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

export default FuzzyAHPMethodologyPage;