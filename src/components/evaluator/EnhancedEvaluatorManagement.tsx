/**
 * 개선된 평가자 관리 시스템
 * 연구자 워크플로우에 최적화된 통합 평가자 관리 페이지
 */

import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { API_BASE_URL } from '../../config/api';
import QRCode from 'qrcode';

interface Evaluator {
  id: string;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  position?: string;
  experience?: string;
  invitationStatus: 'pending' | 'sent' | 'started' | 'completed';
  demographicCompleted: boolean;
  evaluationCompleted: boolean;
  invitedAt?: string;
  startedAt?: string;
  completedAt?: string;
  consistencyRatio?: number;
  evaluationProgress: number; // 0-100
  lastActivity?: string;
}

interface ProjectInfo {
  id: string;
  title: string;
  description: string;
  criteriaCount: number;
  alternativesCount: number;
  evaluationMethod: 'pairwise' | 'direct' | 'mixed';
  expectedTime: string;
}

interface EnhancedEvaluatorManagementProps {
  projectId?: string;
  projectName?: string;
  onClose?: () => void;
}

const EnhancedEvaluatorManagement: React.FC<EnhancedEvaluatorManagementProps> = ({
  projectId,
  projectName,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<'overview' | 'invite' | 'monitor' | 'analyze'>('overview');
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [evaluationLink, setEvaluationLink] = useState<string>('');
  const [invitationForm, setInvitationForm] = useState({
    subject: '',
    message: '',
    includeQR: true,
    includeDemographic: true
  });

  // 프로젝트 정보 및 평가자 데이터 로드
  useEffect(() => {
    if (projectId) {
      loadProjectInfo();
      loadEvaluators();
      generateEvaluationLink();
    }
  }, [projectId]);

  const loadProjectInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProjectInfo({
          id: data.id,
          title: data.title,
          description: data.description,
          criteriaCount: data.criteria_count || 0,
          alternativesCount: data.alternatives_count || 0,
          evaluationMethod: data.evaluation_method || 'pairwise',
          expectedTime: calculateExpectedTime(data.criteria_count, data.alternatives_count, data.evaluation_method)
        });
      }
    } catch (error) {
      console.error('프로젝트 정보 로드 실패:', error);
    }
  };

  const loadEvaluators = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluators/?project=${projectId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEvaluators(data.evaluators || []);
      }
    } catch (error) {
      console.error('평가자 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEvaluationLink = useCallback(async () => {
    if (!projectId) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const evaluationUrl = `${baseUrl}?eval=1&project=${projectId}&step=demographic`;
    
    setEvaluationLink(evaluationUrl);

    try {
      const qrDataUrl = await QRCode.toDataURL(evaluationUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('QR 코드 생성 실패:', error);
    }
  }, [projectId]);

  const calculateExpectedTime = (criteriaCount: number, alternativesCount: number, method: string): string => {
    const baseTime = method === 'pairwise' ? 2 : 1; // 분/비교
    const comparisons = criteriaCount * (criteriaCount - 1) / 2 + 
                       alternativesCount * (alternativesCount - 1) / 2 * criteriaCount;
    const totalMinutes = Math.ceil(comparisons * baseTime + 10); // +10분 for demographic survey
    return `약 ${totalMinutes}분`;
  };

  const getProgressStats = () => {
    const total = evaluators.length;
    const started = evaluators.filter(e => e.evaluationProgress > 0).length;
    const completed = evaluators.filter(e => e.evaluationCompleted).length;
    const avgProgress = total > 0 ? Math.round(evaluators.reduce((sum, e) => sum + e.evaluationProgress, 0) / total) : 0;
    const avgConsistency = evaluators
      .filter(e => e.consistencyRatio !== undefined)
      .reduce((sum, e, _, arr) => sum + (e.consistencyRatio || 0), 0) / 
      evaluators.filter(e => e.consistencyRatio !== undefined).length || 0;

    return { total, started, completed, avgProgress, avgConsistency };
  };

  const renderOverview = () => {
    const stats = getProgressStats();

    return (
      <div className="space-y-6">
        {/* 프로젝트 개요 */}
        {projectInfo && (
          <Card title="📊 평가 프로젝트 개요">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">프로젝트 정보</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">제목:</span> {projectInfo.title}</p>
                  <p><span className="font-medium">평가 방법:</span> {
                    projectInfo.evaluationMethod === 'pairwise' ? '쌍대비교' : 
                    projectInfo.evaluationMethod === 'direct' ? '직접입력' : '혼합'
                  }</p>
                  <p><span className="font-medium">예상 소요시간:</span> {projectInfo.expectedTime}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">평가 구조</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">평가 기준:</span> {projectInfo.criteriaCount}개</p>
                  <p><span className="font-medium">대안:</span> {projectInfo.alternativesCount}개</p>
                  <p><span className="font-medium">총 비교 횟수:</span> {
                    Math.ceil((projectInfo.criteriaCount * (projectInfo.criteriaCount - 1)) / 2 +
                    (projectInfo.alternativesCount * (projectInfo.alternativesCount - 1)) / 2 * projectInfo.criteriaCount)
                  }회</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">진행 현황</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">총 평가자:</span> {stats.total}명</p>
                  <p><span className="font-medium">진행 중:</span> {stats.started}명</p>
                  <p><span className="font-medium">완료:</span> {stats.completed}명</p>
                  <p><span className="font-medium">평균 진행률:</span> {stats.avgProgress}%</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 워크플로우 단계 */}
        <Card title="🎯 연구자 워크플로우 가이드">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-medium text-green-800">1. 모델 구축 완료</h3>
              <p className="text-xs text-green-600 mt-1">계층구조 설계 완료</p>
            </div>
            
            <div className={`text-center p-4 rounded-lg border ${
              stats.total > 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="text-2xl mb-2">{stats.total > 0 ? '✅' : '🎯'}</div>
              <h3 className={`font-medium ${stats.total > 0 ? 'text-green-800' : 'text-blue-800'}`}>
                2. 평가자 초대
              </h3>
              <p className={`text-xs mt-1 ${stats.total > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                QR코드 및 링크 배포
              </p>
            </div>

            <div className={`text-center p-4 rounded-lg border ${
              stats.started > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-2xl mb-2">{stats.started > 0 ? '✅' : '⏳'}</div>
              <h3 className={`font-medium ${stats.started > 0 ? 'text-green-800' : 'text-gray-600'}`}>
                3. 데이터 수집
              </h3>
              <p className={`text-xs mt-1 ${stats.started > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                실시간 모니터링
              </p>
            </div>

            <div className={`text-center p-4 rounded-lg border ${
              stats.completed >= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-2xl mb-2">{stats.completed >= 3 ? '✅' : '📊'}</div>
              <h3 className={`font-medium ${stats.completed >= 3 ? 'text-green-800' : 'text-gray-600'}`}>
                4. 결과 분석
              </h3>
              <p className={`text-xs mt-1 ${stats.completed >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
                논문 작성 지원
              </p>
            </div>
          </div>
        </Card>

        {/* 다음 단계 액션 */}
        <Card title="🚀 다음 단계">
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              variant="primary" 
              className="flex-1"
              onClick={() => setCurrentStep('invite')}
            >
              👥 평가자 초대하기
            </Button>
            
            {stats.total > 0 && (
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => setCurrentStep('monitor')}
              >
                📈 진행률 모니터링
              </Button>
            )}

            {stats.completed >= 3 && (
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => setCurrentStep('analyze')}
              >
                📊 결과 분석
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderInviteStep = () => (
    <div className="space-y-6">
      {/* QR 코드 및 링크 생성 */}
      <Card title="📱 평가 링크 및 QR 코드">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">통합 평가 링크</h4>
            <div className="bg-gray-50 p-3 rounded border text-sm font-mono break-all">
              {evaluationLink}
            </div>
            <div className="mt-3 flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigator.clipboard.writeText(evaluationLink)}
              >
                📋 링크 복사
              </Button>
              <Button 
                variant="secondary"
                onClick={() => window.open(evaluationLink, '_blank')}
              >
                🔗 링크 테스트
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">📋 포함된 기능</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ 인구통계학적 설문조사</li>
                <li>✅ AHP 평가 (쌍대비교 또는 직접입력)</li>
                <li>✅ 일관성 검증 및 피드백</li>
                <li>✅ 결과 자동 저장 및 전송</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">QR 코드</h4>
            <div className="text-center">
              {qrCodeDataUrl && (
                <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="평가 QR 코드" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              )}
              <div className="mt-3">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `AHP_평가_QR코드_${projectName}.png`;
                    link.href = qrCodeDataUrl;
                    link.click();
                  }}
                >
                  💾 QR코드 다운로드
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 이메일 초대 */}
      <Card title="📧 이메일 초대 보내기">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">수신자 이메일 (쉼표로 구분)</label>
            <textarea
              className="w-full p-3 border rounded-lg h-24"
              placeholder="evaluator1@email.com, evaluator2@email.com, ..."
              value={invitationForm.subject}
              onChange={(e) => setInvitationForm({...invitationForm, subject: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">초대 메시지</label>
            <textarea
              className="w-full p-3 border rounded-lg h-32"
              placeholder="안녕하세요. AHP 평가에 참여해 주셔서 감사합니다..."
              value={invitationForm.message}
              onChange={(e) => setInvitationForm({...invitationForm, message: e.target.value})}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={invitationForm.includeQR}
                onChange={(e) => setInvitationForm({...invitationForm, includeQR: e.target.checked})}
                className="mr-2"
              />
              QR 코드 첨부
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={invitationForm.includeDemographic}
                onChange={(e) => setInvitationForm({...invitationForm, includeDemographic: e.target.checked})}
                className="mr-2"
              />
              인구통계학적 설문 포함
            </label>
          </div>

          <Button variant="primary" className="w-full">
            📤 초대 메일 발송
          </Button>
        </div>
      </Card>

      {/* 수동 평가자 추가 */}
      <Card title="👤 평가자 수동 추가">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="이름"
            placeholder="홍길동"
            value=""
            onChange={() => {}}
          />
          <Input
            label="이메일"
            placeholder="evaluator@email.com"
            value=""
            onChange={() => {}}
          />
          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              ➕ 평가자 추가
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderMonitorStep = () => {
    const stats = getProgressStats();

    return (
      <div className="space-y-6">
        {/* 실시간 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="👥 총 평가자">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </Card>
          <Card title="🚀 진행 중">
            <div className="text-3xl font-bold text-orange-600">{stats.started}</div>
          </Card>
          <Card title="✅ 완료">
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </Card>
          <Card title="📊 평균 진행률">
            <div className="text-3xl font-bold text-purple-600">{stats.avgProgress}%</div>
          </Card>
        </div>

        {/* 평가자별 진행 현황 */}
        <Card title="📋 평가자별 진행 현황">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">평가자</th>
                  <th className="text-left p-3">상태</th>
                  <th className="text-left p-3">진행률</th>
                  <th className="text-left p-3">일관성</th>
                  <th className="text-left p-3">최근 활동</th>
                </tr>
              </thead>
              <tbody>
                {evaluators.map(evaluator => (
                  <tr key={evaluator.id} className="border-b">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{evaluator.name}</div>
                        <div className="text-sm text-gray-500">{evaluator.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        evaluator.invitationStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        evaluator.invitationStatus === 'started' ? 'bg-orange-100 text-orange-800' :
                        evaluator.invitationStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {
                          evaluator.invitationStatus === 'completed' ? '완료' :
                          evaluator.invitationStatus === 'started' ? '진행중' :
                          evaluator.invitationStatus === 'sent' ? '발송됨' :
                          '대기중'
                        }
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${evaluator.evaluationProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{evaluator.evaluationProgress}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {evaluator.consistencyRatio !== undefined ? (
                        <span className={`text-sm ${
                          evaluator.consistencyRatio <= 0.1 ? 'text-green-600' : 
                          evaluator.consistencyRatio <= 0.2 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {evaluator.consistencyRatio.toFixed(3)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-500">
                        {evaluator.lastActivity || '없음'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderAnalyzeStep = () => (
    <div className="space-y-6">
      <Card title="📊 분석 준비 중">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔬</div>
          <h3 className="text-lg font-semibold mb-2">고급 분석 기능</h3>
          <p className="text-gray-600 mb-6">
            충분한 데이터가 수집되면 고급 분석 및 논문 작성 지원 기능을 제공합니다.
          </p>
          <Button variant="primary">
            📊 결과 분석 페이지로 이동
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                  >
                    ←
                  </button>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">👥</span>
                    평가자 관리 시스템
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {projectName} - 통합 평가자 관리 및 실시간 모니터링
                  </p>
                </div>
              </div>

              {/* 단계 네비게이션 */}
              <div className="flex space-x-2">
                {[
                  { key: 'overview', label: '개요', icon: '📊' },
                  { key: 'invite', label: '초대', icon: '📧' },
                  { key: 'monitor', label: '모니터링', icon: '📈' },
                  { key: 'analyze', label: '분석', icon: '🔬' }
                ].map((step) => (
                  <button
                    key={step.key}
                    onClick={() => setCurrentStep(step.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentStep === step.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {step.icon} {step.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p>데이터를 로드하고 있습니다...</p>
          </div>
        ) : (
          <>
            {currentStep === 'overview' && renderOverview()}
            {currentStep === 'invite' && renderInviteStep()}
            {currentStep === 'monitor' && renderMonitorStep()}
            {currentStep === 'analyze' && renderAnalyzeStep()}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedEvaluatorManagement;