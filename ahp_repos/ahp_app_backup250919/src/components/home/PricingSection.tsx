import React from 'react';

interface PricingSectionProps {
  onLoginClick: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onLoginClick }) => {
  const plans = [
    {
      name: 'Single Project Pack',
      price: '₩200,000',
      period: '',
      description: '단일 프로젝트용 (기본 연구자 모드)',
      subtitle: '개인 연구자를 위한 기본 플랜',
      popular: false,
      features: [
        '사용 기간: 1개월',
        '프로젝트 수: 1개',
        '평가자 인원: 30명',
        '대상: 대학원 논문, 단기 과제, 학술 발표 준비',
        '인공지능 활용 (옵션: +₩50,000)',
        '문헌정보 정리 (옵션: +₩50,000)',
        '평가자 10명 단위 추가 (옵션: +₩50,000)'
      ],
      buttonText: '기본 플랜 시작',
      buttonVariant: 'outline' as const
    },
    {
      name: 'Team Project Pack',
      price: '₩500,000',
      period: '',
      description: '소규모 연구팀 단기 이용 (프로 연구자)',
      subtitle: '전문 연구자를 위한 고급 플랜',
      popular: true,
      features: [
        '사용 기간: 1개월',
        '프로젝트 수: 3개',
        '평가자 인원: 50명',
        '대상: 기업·기관 연구과제, 단일 컨설팅 프로젝트',
        '인공지능 활용 (옵션: +₩50,000)',
        '문헌정보 정리 (옵션: +₩50,000)',
        '평가자 10명 단위 추가 (옵션: +₩50,000)'
      ],
      buttonText: '프로 플랜 시작',
      buttonVariant: 'primary' as const
    },
    {
      name: 'Institution Pack',
      price: '₩1,000,000',
      period: '',
      description: '기관 단위 단기 프로젝트',
      subtitle: '연구기관·대학교를 위한 엔터프라이즈',
      popular: false,
      features: [
        '사용 기간: 1개월',
        '프로젝트 수: 3개',
        '평가자 인원: 100명',
        '대상: 공공기관·대규모 연구 프로젝트 단위 사용',
        '인공지능 활용 (옵션: +₩50,000)',
        '문헌정보 정리 (옵션: +₩50,000)',
        '평가자 10명 단위 추가 (옵션: +₩50,000)'
      ],
      buttonText: '연구기관 문의',
      buttonVariant: 'secondary' as const
    }
  ];

  return (
    <section id="pricing" style={{
      padding: '5rem 0',
      backgroundColor: 'var(--bg-subtle)'
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 1.5rem'
      }}>
        {/* 헤더 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            연구 규모에 맞는 요금제
          </h2>
          <p style={{
            fontSize: '1.25rem',
            maxWidth: '48rem',
            margin: '0 auto',
            color: 'var(--text-secondary)'
          }}>
            개인 연구자부터 대형 연구기관까지, 모든 연구 환경에 최적화된 플랜을 제공합니다
          </p>
        </div>

        {/* 요금제 카드들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '80rem',
          margin: '0 auto'
        }}>
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                borderRadius: '1rem',
                border: '2px solid',
                backgroundColor: 'var(--bg-primary)',
                borderColor: plan.popular ? 'var(--accent-primary)' : 'var(--border-medium)',
                boxShadow: plan.popular 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                  : '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
                if (!plan.popular) {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                if (!plan.popular) {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-1rem',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}>
                  <span style={{
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: `linear-gradient(to right, var(--accent-primary), var(--accent-secondary))`
                  }}>
                    가장 인기
                  </span>
                </div>
              )}

              <div style={{ padding: '2rem' }}>
                {/* 플랜 이름 */}
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  {plan.name}
                </h3>
                
                {/* 설명 */}
                <p style={{
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)'
                }}>
                  {plan.description}
                </p>
                {'subtitle' in plan && plan.subtitle && (
                  <p style={{
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)'
                  }}>
                    {plan.subtitle}
                  </p>
                )}

                {/* 가격 */}
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)'
                  }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{
                      fontSize: '1.25rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {plan.period}
                    </span>
                  )}
                  {plan.name === 'Institution Pack' && (
                    <p style={{
                      fontSize: '0.875rem',
                      marginTop: '0.5rem',
                      color: 'var(--text-muted)'
                    }}>
                      * 사용자 수에 따라 할인 적용
                    </p>
                  )}
                </div>

                {/* 기능 목록 */}
                <ul style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}>
                      <svg
                        style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          marginTop: '0.125rem',
                          marginRight: '0.75rem',
                          flexShrink: 0,
                          color: 'var(--accent-primary)'
                        }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA 버튼 */}
                <button
                  onClick={onLoginClick}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    backgroundColor: plan.buttonVariant === 'outline' 
                      ? 'transparent' 
                      : 'var(--accent-primary)',
                    color: plan.buttonVariant === 'outline' 
                      ? 'var(--accent-primary)' 
                      : 'white',
                    border: plan.buttonVariant === 'outline' 
                      ? `2px solid var(--accent-primary)` 
                      : 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease, transform 0.1s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (plan.buttonVariant === 'outline') {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'white';
                    } else {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.buttonVariant === 'outline') {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)';
                    } else {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-primary)';
                    }
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 정보 */}
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <div style={{ 
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-primary)'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              추가 옵션 선택
            </h3>
            <p style={{ 
              marginBottom: '1.5rem',
              color: 'var(--text-secondary)'
            }}>
              모든 요금제에서 필요에 따라 추가 옵션을 선택하실 수 있습니다.
            </p>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem'
            }}>
              <div style={{ 
                textAlign: 'center',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ 
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  backgroundColor: 'var(--accent-light)'
                }}>
                  <svg style={{ 
                    width: '1.5rem',
                    height: '1.5rem',
                    color: 'var(--accent-primary)'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 style={{ 
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>인공지능 활용</h4>
                <p style={{ 
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)'
                }}>AI 기반 분석 및 추천</p>
                <p style={{ 
                  fontWeight: 'bold',
                  color: 'var(--accent-primary)'
                }}>+₩50,000</p>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ 
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  backgroundColor: 'var(--accent-light)'
                }}>
                  <svg style={{ 
                    width: '1.5rem',
                    height: '1.5rem',
                    color: 'var(--accent-primary)'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 style={{ 
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>문헌정보 정리</h4>
                <p style={{ 
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)'
                }}>체계적 문헌 관리</p>
                <p style={{ 
                  fontWeight: 'bold',
                  color: 'var(--accent-primary)'
                }}>+₩50,000</p>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ 
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  backgroundColor: 'var(--accent-light)'
                }}>
                  <svg style={{ 
                    width: '1.5rem',
                    height: '1.5rem',
                    color: 'var(--accent-primary)'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 style={{ 
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>평가자 추가</h4>
                <p style={{ 
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)'
                }}>10명 단위 추가</p>
                <p style={{ 
                  fontWeight: 'bold',
                  color: 'var(--accent-primary)'
                }}>+₩50,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ 섹션 */}
        <div style={{ marginTop: '4rem' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '2rem',
            color: 'var(--text-primary)'
          }}>
            자주 묻는 질문
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '64rem',
            margin: '0 auto'
          }}>
            <div style={{
              borderRadius: '0.75rem',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <h4 style={{
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)'
              }}>
                Q. 중도에 플랜을 변경할 수 있나요?
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                네, 언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 변경 시점부터 새로운 요금이 적용됩니다.
              </p>
            </div>
            <div style={{
              borderRadius: '0.75rem',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <h4 style={{
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)'
              }}>
                Q. 무료 체험 기간이 있나요?
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                모든 플랜에서 14일 무료 체험을 제공합니다. 체험 기간 중 언제든 취소 가능합니다.
              </p>
            </div>
            <div style={{
              borderRadius: '0.75rem',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <h4 style={{
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)'
              }}>
                Q. 연구기관 할인이 있나요?
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                대학교, 연구소 등 교육기관은 별도 문의를 통해 특별 할인 혜택을 받으실 수 있습니다.
              </p>
            </div>
            <div style={{
              borderRadius: '0.75rem',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <h4 style={{
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: 'var(--text-primary)'
              }}>
                Q. 데이터는 안전하게 보관되나요?
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                모든 데이터는 AWS 기반 클라우드에 암호화되어 저장되며, 정기 백업과 보안 모니터링을 실시합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;