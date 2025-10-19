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
        '대상: 대학원 논문, 단기 과제, 학술 발표 준비'
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
        '대상: 기업·기관 연구과제, 단일 컨설팅 프로젝트'
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
        '대상: 공공기관·대규모 연구 프로젝트 단위 사용'
      ],
      buttonText: '연구기관 문의',
      buttonVariant: 'secondary' as const
    }
  ];

  return (
    <section id="pricing" className="py-20" style={{ backgroundColor: 'var(--bg-subtle)' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            연구 규모에 맞는 요금제
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            개인 연구자부터 대형 연구기관까지, 모든 연구 환경에 최적화된 플랜을 제공합니다
          </p>
        </div>

        {/* 요금제 카드들 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'shadow-xl'
                  : 'shadow-sm hover:shadow-lg'
              }`}
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: plan.popular ? 'var(--accent-primary)' : 'var(--border-medium)'
              }}
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="text-white px-6 py-2 rounded-full text-sm font-semibold" style={{
                    background: `linear-gradient(to right, var(--accent-primary), var(--accent-secondary))`
                  }}>
                    가장 인기
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* 플랜 이름 */}
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {plan.name}
                </h3>
                
                {/* 설명 */}
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {plan.description}
                </p>
                {'subtitle' in plan && plan.subtitle && (
                  <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {plan.subtitle}
                  </p>
                )}

                {/* 가격 */}
                <div className="mb-8">
                  <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                      {plan.period}
                    </span>
                  )}
                  {plan.name === '연구기관' && (
                    <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                      * 사용자 수에 따라 할인 적용
                    </p>
                  )}
                </div>

                {/* 기능 목록 */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: 'var(--accent-primary)' }}
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
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                  style={{
                    backgroundColor: plan.buttonVariant === 'outline' 
                      ? 'transparent' 
                      : 'var(--accent-primary)',
                    color: plan.buttonVariant === 'outline' 
                      ? 'var(--accent-primary)' 
                      : 'white',
                    border: plan.buttonVariant === 'outline' 
                      ? `2px solid var(--accent-primary)` 
                      : 'none'
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
        <div className="mt-16 text-center">
          <div className="rounded-2xl p-8 shadow-sm border" style={{ 
            backgroundColor: 'var(--bg-primary)', 
            borderColor: 'var(--border-light)' 
          }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              추가 옵션 선택
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              모든 요금제에서 필요에 따라 추가 옵션을 선택하실 수 있습니다.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>인공지능 활용</h4>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>AI 기반 분석 및 추천</p>
                <p className="font-bold" style={{ color: 'var(--accent-primary)' }}>+₩50,000</p>
              </div>
              <div className="text-center p-4 rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>문헌정보 정리</h4>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>체계적 문헌 관리</p>
                <p className="font-bold" style={{ color: 'var(--accent-primary)' }}>+₩50,000</p>
              </div>
              <div className="text-center p-4 rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>평가자 추가</h4>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>10명 단위 추가</p>
                <p className="font-bold" style={{ color: 'var(--accent-primary)' }}>+₩50,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ 섹션 */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            자주 묻는 질문
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-xl p-6 shadow-sm border" style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-light)' 
            }}>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Q. 중도에 플랜을 변경할 수 있나요?
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                네, 언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 변경 시점부터 새로운 요금이 적용됩니다.
              </p>
            </div>
            <div className="rounded-xl p-6 shadow-sm border" style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-light)' 
            }}>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Q. 무료 체험 기간이 있나요?
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                모든 플랜에서 14일 무료 체험을 제공합니다. 체험 기간 중 언제든 취소 가능합니다.
              </p>
            </div>
            <div className="rounded-xl p-6 shadow-sm border" style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-light)' 
            }}>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Q. 연구기관 할인이 있나요?
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                대학교, 연구소 등 교육기관은 별도 문의를 통해 특별 할인 혜택을 받으실 수 있습니다.
              </p>
            </div>
            <div className="rounded-xl p-6 shadow-sm border" style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-light)' 
            }}>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
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