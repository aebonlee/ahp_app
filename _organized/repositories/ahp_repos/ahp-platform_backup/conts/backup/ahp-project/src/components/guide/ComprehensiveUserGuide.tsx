import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface ComprehensiveUserGuideProps {
  onNavigateToService?: () => void;
  onNavigateToEvaluator?: () => void;
  userRole?: 'super_admin' | 'admin' | 'evaluator' | null;
  isLoggedIn?: boolean;
}

const ComprehensiveUserGuide: React.FC<ComprehensiveUserGuideProps> = ({ 
  onNavigateToService, 
  onNavigateToEvaluator,
  userRole,
  isLoggedIn = false
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'researcher' | 'evaluator' | 'demo'>('overview');

  const renderOverview = () => (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🎯 AHP Research Platform 완전 가이드
        </h1>
        <p className="text-xl max-w-4xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          전문적인 AHP(Analytic Hierarchy Process) 분석을 위한 완전한 연구 플랫폼입니다. 
          연구자와 평가자 모두를 위한 직관적이고 강력한 도구를 제공합니다.
        </p>
      </div>

      {/* 주요 기능 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 연구자 모드 */}
        <Card variant="gradient" className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">👨‍🔬</div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              연구자 모드
            </h3>
            <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
              프로젝트 생성, 모델 구축, 평가자 관리, 결과 분석까지
            </p>
            <div className="space-y-3 text-left mb-8">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🏗️</span>
                <span>계층구조 모델 설계</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">👥</span>
                <span>평가자 초대 및 관리</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <span>실시간 평가 모니터링</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📈</span>
                <span>상세 결과 분석</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📋</span>
                <span>설문조사 도구</span>
              </div>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setActiveSection('researcher')}
              className="w-full"
            >
              연구자 가이드 보기
            </Button>
          </div>
        </Card>

        {/* 평가자 모드 */}
        <Card variant="outlined" className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">👨‍💼</div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              평가자 모드
            </h3>
            <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
              직관적인 평가 인터페이스로 간편하고 정확한 평가
            </p>
            <div className="space-y-3 text-left mb-8">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                <span>쌍대비교 평가</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📝</span>
                <span>직접입력 평가</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚡</span>
                <span>실시간 진행률 확인</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">💾</span>
                <span>자동 저장 및 복구</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <span>설문조사 참여</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setActiveSection('evaluator')}
              className="w-full"
            >
              평가자 가이드 보기
            </Button>
          </div>
        </Card>
      </div>

      {/* 시작하기 섹션 */}
      <Card variant="elevated" className="p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            🚀 지금 시작하기
          </h3>
          
          {!isLoggedIn ? (
            <div className="space-y-4">
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                계정을 만들고 전문적인 AHP 분석을 시작하세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => setActiveSection('demo')}
                >
                  🎮 데모 체험하기
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onNavigateToService}
                >
                  📝 계정 만들기
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                환영합니다! 바로 프로젝트를 시작하거나 평가에 참여하세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(userRole === 'admin' || userRole === 'super_admin') && (
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={onNavigateToService}
                  >
                    🏗️ 연구 프로젝트 관리
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onNavigateToEvaluator}
                >
                  👨‍💼 평가자로 참여
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderResearcherGuide = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
          <span className="text-4xl mr-4">👨‍🔬</span>
          연구자 완전 가이드
        </h2>
        <Button variant="outline" onClick={() => setActiveSection('overview')}>
          ← 개요로 돌아가기
        </Button>
      </div>

      {/* 단계별 가이드 */}
      <div className="grid gap-6">
        {/* 1단계: 프로젝트 생성 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">1️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                프로젝트 생성 및 설정
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">📝 기본 설정</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 프로젝트 이름 및 설명 입력</li>
                    <li>• 연구 목적 및 배경 기술</li>
                    <li>• 평가 방법 선택 (쌍대비교/직접입력)</li>
                    <li>• 프로젝트 템플릿 선택</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 고급 옵션</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 일관성 비율(CR) 임계값 설정</li>
                    <li>• 평가 기간 설정</li>
                    <li>• 익명성 옵션</li>
                    <li>• 알림 설정</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 2단계: 모델 구축 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">2️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                AHP 계층구조 모델 구축
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">🏗️ 계층 설계</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 목표(Goal) 정의</li>
                    <li>• 평가기준(Criteria) 추가</li>
                    <li>• 대안(Alternatives) 설정</li>
                    <li>• 하위기준 생성 (필요시)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">✅ 모델 검증</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 계층구조 완전성 확인</li>
                    <li>• 기준 간 독립성 검토</li>
                    <li>• 측정 가능성 검증</li>
                    <li>• 전문가 검토</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 3단계: 평가자 관리 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">3️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                평가자 초대 및 관리
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">👥 평가자 선정</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 전문가 그룹 구성</li>
                    <li>• 이해관계자 포함</li>
                    <li>• 다양성 고려</li>
                    <li>• 적정 인원 산정</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📧 초대 및 관리</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 이메일 일괄 초대</li>
                    <li>• 개별 링크 생성</li>
                    <li>• 진행률 모니터링</li>
                    <li>• 리마인더 발송</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 4단계: 결과 분석 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">4️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                결과 분석 및 해석
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">📊 통계 분석</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 가중치 계산</li>
                    <li>• 일관성 검증 (CR)</li>
                    <li>• 민감도 분석</li>
                    <li>• 그룹 통합 결과</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📈 시각화</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 계층구조 다이어그램</li>
                    <li>• 가중치 바차트</li>
                    <li>• 민감도 그래프</li>
                    <li>• 비교 매트릭스</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 실습하기 버튼 */}
        <div className="text-center">
          <Button 
            variant="primary" 
            size="lg"
            onClick={onNavigateToService}
          >
            🚀 연구자 모드로 실습하기
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEvaluatorGuide = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
          <span className="text-4xl mr-4">👨‍💼</span>
          평가자 완전 가이드
        </h2>
        <Button variant="outline" onClick={() => setActiveSection('overview')}>
          ← 개요로 돌아가기
        </Button>
      </div>

      {/* 평가자 프로세스 */}
      <div className="grid gap-6">
        {/* 1단계: 초대 받기 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">1️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                프로젝트 참여 및 시작
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">📧 초대 받기</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 이메일 초대장 수신</li>
                    <li>• 프로젝트 개요 확인</li>
                    <li>• 평가 기간 확인</li>
                    <li>• 참여 동의</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🔐 로그인</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 평가자 계정 생성</li>
                    <li>• 안전한 로그인</li>
                    <li>• 프로필 설정</li>
                    <li>• 알림 설정</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 2단계: 쌍대비교 평가 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">2️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                쌍대비교 평가 수행
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">⚖️ 평가 방법</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 두 요소를 쌍으로 비교</li>
                    <li>• 9점 척도 사용</li>
                    <li>• 상대적 중요도 평가</li>
                    <li>• 논리적 근거 제시</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📝 평가 팁</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 일관성 유지</li>
                    <li>• 집중력 유지</li>
                    <li>• 중간 저장 활용</li>
                    <li>• 검토 후 제출</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 3단계: 직접입력 평가 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">3️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                직접입력 평가 (선택사항)
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">📊 가중치 입력</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 직접 가중치 할당</li>
                    <li>• 백분율 합계 100%</li>
                    <li>• 실시간 검증</li>
                    <li>• 즉시 피드백</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⚡ 장점</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 빠른 평가 완료</li>
                    <li>• 직관적 인터페이스</li>
                    <li>• 전문가 친화적</li>
                    <li>• 시간 효율성</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 4단계: 설문조사 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">4️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                인구통계학적 설문조사
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">📋 설문 내용</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 전문성 및 경험</li>
                    <li>• 배경 정보</li>
                    <li>• 관련 지식 수준</li>
                    <li>• 의견 및 피드백</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🔒 개인정보</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 익명 처리 보장</li>
                    <li>• 연구 목적만 사용</li>
                    <li>• 안전한 데이터 관리</li>
                    <li>• GDPR 준수</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 실습하기 버튼 */}
        <div className="text-center">
          <Button 
            variant="primary" 
            size="lg"
            onClick={onNavigateToEvaluator}
          >
            👨‍💼 평가자 모드로 실습하기
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDemo = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🎮 데모 체험하기
        </h2>
        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          실제 데이터로 AHP 분석 과정을 체험해보세요
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 연구자 데모 */}
        <Card variant="gradient" className="p-6 text-center">
          <div className="text-4xl mb-4">👨‍🔬</div>
          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            연구자 데모
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            "AI 활용 방안 선정" 프로젝트로 전체 연구 과정 체험
          </p>
          <div className="space-y-2 text-sm text-left mb-6">
            <div>✅ 완성된 AHP 모델</div>
            <div>✅ 실제 평가 데이터</div>
            <div>✅ 상세 분석 결과</div>
            <div>✅ 시각화 차트</div>
          </div>
          <Button 
            variant="primary" 
            onClick={onNavigateToService}
            className="w-full"
          >
            연구자 데모 시작
          </Button>
        </Card>

        {/* 평가자 데모 */}
        <Card variant="outlined" className="p-6 text-center">
          <div className="text-4xl mb-4">👨‍💼</div>
          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            평가자 데모
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            실제 평가 인터페이스로 쌍대비교 평가 체험
          </p>
          <div className="space-y-2 text-sm text-left mb-6">
            <div>✅ 쌍대비교 평가</div>
            <div>✅ 직접입력 평가</div>
            <div>✅ 일관성 검증</div>
            <div>✅ 설문조사</div>
          </div>
          <Button 
            variant="outline" 
            onClick={onNavigateToEvaluator}
            className="w-full"
          >
            평가자 데모 시작
          </Button>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={() => setActiveSection('overview')}>
          ← 개요로 돌아가기
        </Button>
      </div>
    </div>
  );

  // 메인 렌더링
  switch (activeSection) {
    case 'researcher':
      return renderResearcherGuide();
    case 'evaluator':
      return renderEvaluatorGuide();
    case 'demo':
      return renderDemo();
    default:
      return renderOverview();
  }
};

export default ComprehensiveUserGuide;