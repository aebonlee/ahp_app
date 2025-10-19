import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface ComprehensiveUserGuideProps {
  onNavigateToService?: () => void;
  onNavigateToEvaluator?: () => void;
  userRole?: 'super_admin' | 'admin' | 'service_tester' | 'evaluator' | null;
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
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 연구자 모드 */}
          <Card variant="gradient" className="p-6">
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
          <Card variant="outlined" className="p-6">
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
      </div>

      {/* 시작하기 섹션 */}
      <div className="max-w-4xl mx-auto">
        <Card variant="elevated" className="p-6">
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

      {/* 완전한 연구자 워크플로우 */}
      <Card variant="gradient" className="p-6 mb-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            🎯 완전한 AHP 연구 프로세스
          </h3>
          <div className="flex justify-center items-center space-x-4 text-sm font-medium">
            <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">프로젝트 생성</div>
            <span>→</span>
            <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">모델 구축</div>
            <span>→</span>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">평가자 관리</div>
            <span>→</span>
            <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">결과 분석</div>
            <span>→</span>
            <div className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">논문 작성</div>
          </div>
        </div>
      </Card>

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
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 메뉴 위치: 내 대시보드 → 새 프로젝트</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  개인 서비스 대시보드에서 "새 프로젝트" 버튼을 클릭하여 시작합니다.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">📝 기본 정보</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>프로젝트 명</strong>: 연구 주제 명시</li>
                    <li>• <strong>설명</strong>: 연구 목적 및 배경</li>
                    <li>• <strong>카테고리</strong>: 연구 분야 선택</li>
                    <li>• <strong>키워드</strong>: 검색 태그 설정</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⚙️ 평가 설정</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>평가 방법</strong>: 쌍대비교/직접입력</li>
                    <li>• <strong>CR 임계값</strong>: 0.1 (기본값)</li>
                    <li>• <strong>평가 기간</strong>: 시작일~종료일</li>
                    <li>• <strong>알림 설정</strong>: 이메일/SMS</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🔒 보안 및 접근</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>프로젝트 공개성</strong>: 비공개/공개</li>
                    <li>• <strong>평가자 익명성</strong>: 활성화/비활성화</li>
                    <li>• <strong>접근 권한</strong>: 초대자만/링크 공유</li>
                    <li>• <strong>데이터 백업</strong>: 자동 활성화</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  💡 <strong>프로 팁</strong>: 프로젝트명은 나중에 변경할 수 있지만, 평가가 시작된 후에는 핵심 설정 변경이 제한됩니다.
                </p>
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
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 메뉴 위치: 모델 구축 → 계층구조 설계</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  드래그 앤 드롭 인터페이스로 직관적인 계층구조를 설계할 수 있습니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">🎯 1레벨: 목표 설정</h4>
                  <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="font-medium text-blue-600">연구 목표</div>
                      <div className="text-sm text-gray-500">예: AI 활용 방안 선정</div>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 명확하고 측정 가능한 목표</li>
                    <li>• 의사결정 상황과 일치</li>
                    <li>• 이해관계자 모두가 이해</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">⚖️ 2레벨: 평가기준</h4>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-800 border border-yellow-300 p-2 rounded text-sm text-center">
                      <span className="text-yellow-600">📊 비용효율성</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-yellow-300 p-2 rounded text-sm text-center">
                      <span className="text-yellow-600">⚡ 기술적 실현성</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-yellow-300 p-2 rounded text-sm text-center">
                      <span className="text-yellow-600">👥 사용자 수용성</span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 3~7개 기준 권장</li>
                    <li>• 상호 독립적</li>
                    <li>• 완전성 확보</li>
                  </ul>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">🎲 3레벨: 대안 설정</h4>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-800 border border-green-300 p-2 rounded text-sm text-center">
                      <span className="text-green-600">🤖 ChatGPT 활용</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-green-300 p-2 rounded text-sm text-center">
                      <span className="text-green-600">🧠 자체 AI 개발</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-green-300 p-2 rounded text-sm text-center">
                      <span className="text-green-600">🔗 AI 서비스 연동</span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 실현 가능한 선택지</li>
                    <li>• 각 기준에 대해 평가 가능</li>
                    <li>• 비교 가능한 수준</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">🛠️ 고급 기능</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>일괄 입력</strong>: Excel/CSV 가져오기</li>
                    <li>• <strong>템플릿</strong>: 업종별 기본 모델</li>
                    <li>• <strong>시각화</strong>: 실시간 트리 구조</li>
                    <li>• <strong>검증</strong>: 완전성 자동 체크</li>
                    <li>• <strong>공유</strong>: 전문가 검토 링크</li>
                    <li>• <strong>버전 관리</strong>: 모델 변경 이력</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✅ <strong>모델 완성 체크</strong>: 목표 1개 + 기준 3~7개 + 대안 3~9개 + 계층구조 검증 완료
                </p>
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
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 메뉴 위치: 평가자 관리 → 평가자 초대</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  이메일 일괄 초대, 개별 링크 생성, 실시간 진행률 모니터링이 가능합니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">🎯 평가자 선정 전략</h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>전문가 그룹</strong>: 해당 분야 전문가</li>
                    <li>• <strong>이해관계자</strong>: 결과 영향 받는 그룹</li>
                    <li>• <strong>의사결정자</strong>: 최종 결정 참여자</li>
                    <li>• <strong>외부 전문가</strong>: 객관적 시각</li>
                    <li>• <strong>사용자 대표</strong>: 엔드유저 관점</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📧 초대 시스템</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                      <p className="font-medium text-sm">1. 이메일 일괄 초대</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">CSV 파일로 에메일 리스트 업로드</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded">
                      <p className="font-medium text-sm">2. 개별 링크 생성</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">각 평가자별 고유 접속 링크</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded">
                      <p className="font-medium text-sm">3. 자동 리마인더</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">설정 기간에 따른 알림 발송</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📊 실시간 모니터링</h4>
                  <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>초대된 평가자</span>
                        <span className="font-mono text-blue-600">15명</span>
                      </div>
                      <div className="flex justify-between">
                        <span>평가 완료</span>
                        <span className="font-mono text-green-600">8명</span>
                      </div>
                      <div className="flex justify-between">
                        <span>평가 진행 중</span>
                        <span className="font-mono text-yellow-600">4명</span>
                      </div>
                      <div className="flex justify-between">
                        <span>미참여</span>
                        <span className="font-mono text-red-600">3명</span>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '53%'}}></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-600 dark:text-gray-300">전체 진행률 53%</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">🔔 자동 알림 설정</h5>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 시작 24시간 전: 참여 안내</li>
                    <li>• 시작 2일 후: 1차 리마인더</li>
                    <li>• 마감 3일 전: 2차 리마인더</li>
                    <li>• 마감 1일 전: 최종 리마인더</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2 text-green-800 dark:text-green-200">🔄 평가자 관리 도구</h5>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>개별 메시지</strong>: 특정 평가자에게 전송</li>
                    <li>• <strong>일괄 메시지</strong>: 전체 그룹에게 전송</li>
                    <li>• <strong>평가자 교체</strong>: 미참여자 대체</li>
                    <li>• <strong>데이터 내보내기</strong>: Excel/CSV 형식</li>
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
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 메뉴 위치: 결과 분석 → 상세 결과 보기</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  실시간 대시보드, 상세 통계, 시각화 차트, 논문 작성 도구를 제공합니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">🏆 최종 순위 결과</h4>
                  <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🥇</span>
                          <span className="font-medium">ChatGPT 활용</span>
                        </div>
                        <span className="font-bold text-lg text-yellow-600">45.2%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🥈</span>
                          <span className="font-medium">자체 AI 개발</span>
                        </div>
                        <span className="font-bold text-lg text-gray-600">32.8%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-orange-100 dark:bg-orange-900/30 rounded">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🥉</span>
                          <span className="font-medium">AI 서비스 연동</span>
                        </div>
                        <span className="font-bold text-lg text-orange-600">22.0%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📈 기준별 중요도</h4>
                  <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">비용효율성</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '52%'}}></div>
                          </div>
                          <span className="text-sm font-mono">52.1%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">기술적 실현성</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '31%'}}></div>
                          </div>
                          <span className="text-sm font-mono">31.4%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">사용자 수용성</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: '16%'}}></div>
                          </div>
                          <span className="text-sm font-mono">16.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">🔍 일관성 분석</h4>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">평균 CR:</span>
                        <span className="font-mono text-green-600 font-bold">0.08</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">허용 범위:</span>
                        <span className="font-mono text-gray-600">&lt; 0.10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">일관성:</span>
                        <span className="font-bold text-green-600">✓ 양호</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">🎯 민감도 분석</h4>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-sm space-y-2">
                      <p><strong>범위 테스트:</strong></p>
                      <p>• 비용효율성 ±30% 시</p>
                      <p className="ml-4">1순위 유지 확률: <span className="font-bold text-green-600">87%</span></p>
                      <p>• 기술성 ±20% 시</p>
                      <p className="ml-4">1순위 유지 확률: <span className="font-bold text-yellow-600">62%</span></p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📊 그룹 통계</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>참여자 수:</span>
                        <span className="font-bold">15명</span>
                      </div>
                      <div className="flex justify-between">
                        <span>유효 응답:</span>
                        <span className="font-bold text-green-600">13명</span>
                      </div>
                      <div className="flex justify-between">
                        <span>표준편차:</span>
                        <span className="font-mono">0.12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>컨센서스:</span>
                        <span className="font-bold text-blue-600">73%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 5단계: 논문 작성 지원 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">5️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                논문 작성 및 보고서 작성
              </h3>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 메뉴 위치: 논문 작성 관리 → 자동 작성 도구</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  AHP 결과를 기반으로 한 자동 논문 초안 생성 및 보고서 작성 도구를 제공합니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">📝 자동 논문 생성</h4>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-2">서론 (Introduction)</div>
                      <p className="text-gray-600 dark:text-gray-300">• 연구 배경 및 목적 자동 생성</p>
                      <p className="text-gray-600 dark:text-gray-300">• AHP 방법론 소개</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-green-300 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-2">방법론 (Methodology)</div>
                      <p className="text-gray-600 dark:text-gray-300">• 계층구조 설명</p>
                      <p className="text-gray-600 dark:text-gray-300">• 평가 프로세스 기술</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-yellow-300 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-2">결과 (Results)</div>
                      <p className="text-gray-600 dark:text-gray-300">• 가중치 및 순위 결과</p>
                      <p className="text-gray-600 dark:text-gray-300">• 일관성 분석 자동 작성</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-purple-300 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-2">고찰 (Discussion)</div>
                      <p className="text-gray-600 dark:text-gray-300">• 결과 해석 및 시사점</p>
                      <p className="text-gray-600 dark:text-gray-300">• 연구 한계 및 향후 연구</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📄 내보내기 옵션</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">📄</span>
                        <span className="font-medium">Word 문서</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">• 편집 가능한 .docx 형식</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">• 이미지 및 표 포함</p>
                    </div>
                    
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">📊</span>
                        <span className="font-medium">PDF 보고서</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">• 공식 보고서 형식</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">• 고품질 차트 및 그래프</p>
                    </div>
                    
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">💹</span>
                        <span className="font-medium">Excel 데이터</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">• 원천 데이터 및 계산식</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">• 추가 분석용</p>
                    </div>
                    
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">🌐</span>
                        <span className="font-medium">HTML 대시보드</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">• 인터랙티브 웹 보고서</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">• 링크 공유 가능</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <h5 className="font-semibold mb-2">🤖 AI 지원 기능</h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">✨ 지능형 초안 생성</p>
                    <p style={{ color: 'var(--text-secondary)' }}>• 연구 목적에 맞는 논문 구조 제안</p>
                    <p style={{ color: 'var(--text-secondary)' }}>• 결과 해석 및 시사점 도출</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">🔍 문헌 검색 지원</p>
                    <p style={{ color: 'var(--text-secondary)' }}>• 관련 연구 사례 자동 검색</p>
                    <p style={{ color: 'var(--text-secondary)' }}>• 참고문헌 형식 자동 생성</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* 실습하기 버튼 */}
        <div className="text-center">
          <div className="space-y-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={onNavigateToService}
              className="mr-4"
            >
              🚀 연구자 모드로 실습하기
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setActiveSection('demo')}
            >
              🎮 연구자 데모 체험
            </Button>
          </div>
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

      {/* 평가자 워크플로우 */}
      <Card variant="gradient" className="p-6 mb-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            🎯 평가자 참여 프로세스
          </h3>
          <div className="flex justify-center items-center space-x-4 text-sm font-medium flex-wrap">
            <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-2">초대 수락</div>
            <span>→</span>
            <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full mb-2">로그인 및 설정</div>
            <span>→</span>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full mb-2">평가 수행</div>
            <span>→</span>
            <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full mb-2">설문조사</div>
            <span>→</span>
            <div className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full mb-2">완료</div>
          </div>
        </div>
      </Card>

      {/* 평가자 프로세스 */}
      <div className="grid gap-6">
        {/* 1단계: 초대 받기 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">1️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                프로젝트 초대 및 시작
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 접속 방법: 이메일 링크 또는 평가자 대시보드</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  이메일로 받은 초대 링크를 클릭하거나 평가자 대시보드에 직접 접속할 수 있습니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">📧 이메일 초대장 확인</h4>
                  <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 p-4 rounded-lg mb-4">
                    <div className="text-sm space-y-2">
                      <div className="font-medium text-blue-600">📧 [AHP Research] 평가 참여 요청</div>
                      <div className="border-t pt-2">
                        <p><strong>프로젝트</strong>: AI 활용 방안 선정</p>
                        <p><strong>연구자</strong>: 김연구 박사</p>
                        <p><strong>평가기간</strong>: 2025.08.30 ~ 2025.09.15</p>
                        <p><strong>예상시간</strong>: 15~20분</p>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded mt-2">
                        <button className="text-blue-600 font-medium">➤ 평가 시작하기</button>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>프로젝트 개요</strong>: 연구 배경 및 목적</li>
                    <li>• <strong>평가 방법</strong>: 쌍대비교 또는 직접입력</li>
                    <li>• <strong>예상 소요시간</strong>: 15~30분</li>
                    <li>• <strong>진행 언어</strong>: 한국어</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">🔐 로그인 및 계정 설정</h4>
                  <div className="space-y-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-1">🔑 간편 로그인</div>
                      <p>• 이메일 + 인증코드</p>
                      <p>• Google/Kakao 소셜 로그인</p>
                      <p>• 일회성 링크 접속</p>
                    </div>
                    
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-1">📝 필수 정보</div>
                      <p>• 이름 및 직책/소속</p>
                      <p>• 전문성 수준 선택</p>
                      <p>• 알림 수신 동의</p>
                    </div>
                    
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-1">⚙️ 평가 환경 설정</div>
                      <p>• 언어: 한국어/영어</p>
                      <p>• 화면 크기: 자동 조절</p>
                      <p>• 진행률 표시: 활성화</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  🔔 <strong>시작 전 체크리스트</strong>: 이메일 확인 → 로그인 → 프로필 설정 → 평가 안내 읽기 완료
                </p>
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 평가 인터페이스: 쌍대비교 평가 페이지</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  두 요소를 직접 비교하는 직관적인 인터페이스로 9점 척도를 사용합니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">⚖️ 9점 척도 사용법</h4>
                  <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
                        <span>9: 극도로 중요</span>
                        <span className="text-red-600 font-bold">A 극우 중요</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-orange-100 dark:bg-orange-900/30 rounded">
                        <span>7: 매우 중요</span>
                        <span className="text-orange-600 font-bold">A 매우 중요</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                        <span>5: 중요</span>
                        <span className="text-yellow-600 font-bold">A 중요</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-100 dark:bg-green-900/30 rounded">
                        <span>3: 약간 중요</span>
                        <span className="text-green-600 font-bold">A 약간 중요</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-600 rounded">
                        <span>1: 동등한 중요도</span>
                        <span className="text-gray-600 font-bold">A = B</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📊 실제 평가 예시</h4>
                  <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 p-4 rounded-lg">
                    <div className="text-center mb-3">
                      <p className="font-medium text-blue-600">비용효율성 vs 기술적 실현성</p>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">비용효율성</span>
                      <div className="flex space-x-1">
                        <button className="w-8 h-8 bg-yellow-200 hover:bg-yellow-300 rounded text-sm font-bold">5</button>
                      </div>
                      <span className="text-sm bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">기술적 실현성</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 text-center">
                      "비용효율성이 기술적 실현성보다 중요하다"
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span>15개 쌍대비교 완료</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span>8개 쌍대비교 진행중</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                      <span>2개 쌍대비교 대기중</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">🧠 평가 전략</h5>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 각 기준의 정의 명확히 이해</li>
                    <li>• 전문 지식과 경험 활용</li>
                    <li>• 일관성 있는 판단 기준</li>
                    <li>• 급하게 결정하지 말고 신중하게</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">⚠️ 주의사항</h5>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 극단적 평가(9점) 신중하게 사용</li>
                    <li>• 중간에 저장 버튼 활용</li>
                    <li>• 사전 도움말 및 안내서 참고</li>
                    <li>• 시간 여유를 가지고 신중하게</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2 text-green-800 dark:text-green-200">✅ 품질 체크</h5>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>CR &lt; 0.10</strong>: 일관성 양호</li>
                    <li>• 자동 저장 및 백업</li>
                    <li>• 실시간 결과 미리보기</li>
                    <li>• 다른 평가자와 비교 가능</li>
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
                직접입력 평가 (선택적)
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 평가 인터페이스: 직접입력 평가 페이지</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  전문가들이 자신의 경험과 지식을 바탕으로 직접 가중치를 입력하는 방식입니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">📊 직접 가중치 입력</h4>
                  <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-green-300 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="text-center mb-3">
                        <p className="font-medium text-green-600">평가기준 가중치 설정</p>
                        <p className="text-xs text-gray-500">합계 100%가 되도록 입력하세요</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">비용효율성</span>
                          <div className="flex items-center">
                            <input className="w-16 p-1 border rounded text-center text-sm" value="50" disabled />
                            <span className="ml-2 text-sm">%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">기술적 실현성</span>
                          <div className="flex items-center">
                            <input className="w-16 p-1 border rounded text-center text-sm" value="30" disabled />
                            <span className="ml-2 text-sm">%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">사용자 수용성</span>
                          <div className="flex items-center">
                            <input className="w-16 p-1 border rounded text-center text-sm" value="20" disabled />
                            <span className="ml-2 text-sm">%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>합계:</span>
                          <span className="text-green-600">100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">⚡ 직접입력의 장단점</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      <div className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-1">✅ 장점</div>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 빠른 평가 완료 (5~10분)</li>
                        <li>• 직관적이고 이해하기 쉬움</li>
                        <li>• 전문가의 경험적 판단 반영</li>
                        <li>• 실시간 검증 및 피드백</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                      <div className="font-medium text-sm text-yellow-800 dark:text-yellow-200 mb-1">⚠️ 주의점</div>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 상대적 비교 없이 절대적 판단</li>
                        <li>• 평가자 간 비교 분석 제한적</li>
                        <li>• 일관성 체크 부재</li>
                        <li>• 백분율 합계 100% 필수</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-sm">
                  <div className="font-medium mb-2">🎯 사용 방법</div>
                  <p>• 각 기준의 상대적 중요도를 백분율로 표현</p>
                  <p>• 실시간으로 합계 100% 검증</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-sm">
                  <div className="font-medium mb-2">🕰️ 소요시간</div>
                  <p>• 기준 3개: 약 5분</p>
                  <p>• 기준 5개: 약 10분</p>
                  <p>• 쌍대비교의 1/3 수준</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-sm">
                  <div className="font-medium mb-2">🎯 추천 대상</div>
                  <p>• 시간이 제한적인 전문가</p>
                  <p>• 이미 명확한 선호도가 있는 경우</p>
                  <p>• 예비 평가나 대규모 설문</p>
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
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 수행 위치: 인구통계학적 설문조사 페이지</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  평가 결과의 신뢰성과 해석을 위한 평가자 배경 정보 수집 설문입니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">📋 설문 구성 요소</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-2">🏭 기본 정보</div>
                      <ul className="space-y-1 text-xs">
                        <li>• 소속 기관/회사</li>
                        <li>• 직책/직급</li>
                        <li>• 경력 (년수)</li>
                        <li>• 담당 업무 분야</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-2">🎓 전문성 수준</div>
                      <ul className="space-y-1 text-xs">
                        <li>• 해당 분야 지식 수준 (1~5점)</li>
                        <li>• 연구 주제 관련 경험</li>
                        <li>• AHP 방법론 이해도</li>
                        <li>• 의사결정 참여 경험</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-2">💬 의견 및 피드백</div>
                      <ul className="space-y-1 text-xs">
                        <li>• 평가 프로세스에 대한 의견</li>
                        <li>• 인터페이스 사용성 평가</li>
                        <li>• 추가 고려사항 제안</li>
                        <li>• 향후 참여 의사</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📄 실제 설문 예시</h4>
                  <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-purple-300 p-4 rounded-lg">
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Q1. 귀하의 소속 기관은?</p>
                        <div className="space-y-1 text-xs">
                          <label className="flex items-center"><input type="radio" className="mr-2" disabled /> 대학/연구기관</label>
                          <label className="flex items-center"><input type="radio" className="mr-2" disabled checked /> IT 기업</label>
                          <label className="flex items-center"><input type="radio" className="mr-2" disabled /> 일반 기업</label>
                          <label className="flex items-center"><input type="radio" className="mr-2" disabled /> 정부/공공기관</label>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2">Q2. AI 기술 분야 전문성 수준은?</p>
                        <div className="flex space-x-2 text-xs">
                          <button className="px-2 py-1 bg-gray-200 rounded" disabled>1</button>
                          <button className="px-2 py-1 bg-gray-200 rounded" disabled>2</button>
                          <button className="px-2 py-1 bg-gray-200 rounded" disabled>3</button>
                          <button className="px-2 py-1 bg-blue-500 text-white rounded" disabled>4</button>
                          <button className="px-2 py-1 bg-gray-200 rounded" disabled>5</button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">초보(1) ~ 전문가(5)</p>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2">Q3. 추가 의견이 있으시면 자유롭게 작성해주세요.</p>
                        <textarea className="w-full h-16 p-2 border rounded text-xs" disabled placeholder="평가 프로세스가 직관적이고 이해하기 쉬움..."></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2 text-green-800 dark:text-green-200">🔒 데이터 보안 및 윤리</h5>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>완전 익명화</strong>: 개인 식별 불가</li>
                    <li>• <strong>연구 목적</strong>: 연구 이외 사용 금지</li>
                    <li>• <strong>암호화 저장</strong>: 높은 보안 수준</li>
                    <li>• <strong>GDPR 준수</strong>: 국제 기준 따름</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">📈 데이터 활용 방안</h5>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <li>• <strong>그룹 분석</strong>: 전문성별 결과 비교</li>
                    <li>• <strong>신뢰성 검증</strong>: 배경지식과 결과 상관관계</li>
                    <li>• <strong>연구 품질</strong>: 학술적 엄밀성 제고</li>
                    <li>• <strong>정책 제안</strong>: 실무적 시사점 도출</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 5단계: 평가 완료 */}
        <Card variant="default" className="p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">5️⃣</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                평가 완료 및 결과 확인
              </h3>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-4">
                <p className="font-medium mb-2">📍 완료 후: 자동 감사 메시지 및 결과 대기</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  모든 평가를 완료하면 감사 메시지와 함께 결과 대기 상태가 됩니다.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-3">🎉 평가 완료 후 화면</h4>
                  <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-green-300 p-4 rounded-lg">
                    <div className="text-center space-y-3">
                      <div className="text-4xl text-green-600">✓</div>
                      <div className="font-bold text-green-600">Evaluation Complete!</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        평가가 성공적으로 완료되었습니다.
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-xs">
                        <div className="font-medium mb-2">📈 내 평가 요약</div>
                        <div className="space-y-1 text-left">
                          <div>• 쌍대비교: 15개 완료</div>
                          <div>• 일관성 비율: 0.08 (양호)</div>
                          <div>• 설문조사: 완료</div>
                          <div>• 소요시간: 18분</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        연구자가 결과를 공개하면<br/>
                        이메일로 알림을 보내드립니다.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">💬 평가자 후속 서비스</h4>
                  <div className="space-y-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-1 text-purple-800 dark:text-purple-200">📧 결과 알림</div>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 연구자가 결과 공개 시 이메일 전송</li>
                        <li>• 내 평가 기여도 및 순위 정보</li>
                        <li>• 전체 결과 요약 보고서 링크</li>
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-1 text-yellow-800 dark:text-yellow-200">🏆 학술적 기여</div>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 공동 연구 참여 인증서 발급</li>
                        <li>• 논문 공저자 등재 (연구자 요청 시)</li>
                        <li>• 연구 결과 활용 권한 부여</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-sm">
                      <div className="font-medium mb-1 text-green-800 dark:text-green-200">🔄 추가 참여</div>
                      <ul className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 동일 연구자의 후속 연구 우선 초대</li>
                        <li>• 평가자 풀 등록으로 지속적 참여</li>
                        <li>• 전문성 매칭 서비스</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <h5 className="font-semibold mb-3 text-center">📋 평가자 활동 요약</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                  <div>
                    <div className="text-2xl text-blue-600 font-bold">18</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">분 (평균 소요시간)</div>
                  </div>
                  <div>
                    <div className="text-2xl text-green-600 font-bold">15</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">개 (쌍대비교)</div>
                  </div>
                  <div>
                    <div className="text-2xl text-yellow-600 font-bold">0.08</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">CR (일관성)</div>
                  </div>
                  <div>
                    <div className="text-2xl text-purple-600 font-bold">100%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">완료률</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* 실습하기 버튼 */}
        <div className="text-center">
          <div className="space-y-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={onNavigateToEvaluator}
              className="mr-4"
            >
              👨‍💼 평가자 모드로 실습하기
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setActiveSection('demo')}
            >
              🎮 평가자 데모 체험
            </Button>
          </div>
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