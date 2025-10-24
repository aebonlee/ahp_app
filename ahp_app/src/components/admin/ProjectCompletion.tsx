import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import dataService from '../../services/dataService_clean';
import { projectApi } from '../../services/api';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  level: number;
  parent_id?: string | null;
  children?: Criterion[];
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
}

interface Evaluator {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active' | 'completed';
  progress?: number;
}

interface ProjectCompletionProps {
  projectId: string;
  projectTitle: string;
  onBack: () => void;
  onProjectStatusChange: (status: 'terminated' | 'completed') => void;
  criteriaCount?: number;
  alternativesCount?: number;
  evaluatorsCount?: number;
}

const ProjectCompletion: React.FC<ProjectCompletionProps> = ({ 
  projectId, 
  projectTitle, 
  onBack,
  onProjectStatusChange,
  criteriaCount = 0,
  alternativesCount = 0,
  evaluatorsCount = 0
}) => {
  const [selectedAction, setSelectedAction] = useState<'terminate' | 'complete' | 'lock' | 'export' | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'both'>('both');
  const [projectSummary, setProjectSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [criteriaData, setCriteriaData] = useState<Criterion[]>([]);
  const [alternativesData, setAlternativesData] = useState<Alternative[]>([]);
  const [evaluatorsData, setEvaluatorsData] = useState<Evaluator[]>([]);

  useEffect(() => {
    loadProjectSummary();
  }, [projectId]);

  const loadProjectSummary = async () => {
    try {
      setLoading(true);
      console.log('📊 프로젝트 완료 페이지 - 데이터 로드 시작:', projectId);
      
      // 프로젝트 데이터 로드
      const [criteria, alternatives, evaluators] = await Promise.all([
        dataService.getCriteria(projectId),
        dataService.getAlternatives(projectId),
        dataService.getEvaluators(projectId)
      ]);

      console.log('✅ 로드된 데이터:', {
        criteria: criteria.length,
        alternatives: alternatives.length,
        evaluators: evaluators.length
      });

      // 상세 데이터 저장
      setCriteriaData(criteria);
      setAlternativesData(alternatives);
      setEvaluatorsData(evaluators);

      const completedEvaluators = evaluators.filter((e: any) => e.status === 'completed');
      const completionRate = evaluators.length > 0 
        ? Math.round((completedEvaluators.length / evaluators.length) * 100)
        : 0;

      setProjectSummary({
        totalCriteria: criteria.length,
        totalAlternatives: alternatives.length,
        totalEvaluators: evaluators.length,
        completedEvaluators: completedEvaluators.length,
        completionRate,
        pendingEvaluators: evaluators.filter((e: any) => e.status === 'pending').length,
        activeEvaluators: evaluators.filter((e: any) => e.status === 'active').length,
        consistencyRatio: 0.08, // TODO: 실제 CR 계산 필요
        createdDate: new Date().toLocaleDateString('ko-KR'),
        lastModified: new Date().toLocaleDateString('ko-KR')
      });
    } catch (error) {
      console.error('프로젝트 요약 로드 실패:', error);
      // 기본값 설정
      setProjectSummary({
        totalCriteria: criteriaCount,
        totalAlternatives: alternativesCount,
        totalEvaluators: evaluatorsCount,
        completedEvaluators: 0,
        completionRate: 0,
        pendingEvaluators: evaluatorsCount,
        activeEvaluators: 0,
        consistencyRatio: 0,
        createdDate: new Date().toLocaleDateString('ko-KR'),
        lastModified: new Date().toLocaleDateString('ko-KR')
      });
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      id: 'test',
      label: '평가 테스트',
      icon: '🧪',
      color: 'purple',
      description: '연구자가 평가 화면을 미리 테스트해볼 수 있습니다.',
      warning: '테스트 데이터는 저장되지 않습니다.'
    },
    {
      id: 'sendEmail',
      label: '평가 요청 발송',
      icon: '📧',
      color: 'indigo',
      description: '평가자에게 이메일로 평가 요청을 발송합니다.',
      warning: '대기 상태의 평가자에게만 발송됩니다.'
    },
    {
      id: 'terminate',
      label: '프로젝트 중단',
      icon: '⏹️',
      color: 'red',
      description: '프로젝트를 중단하고 모든 평가를 종료합니다.',
      warning: '중단된 프로젝트는 복구할 수 없습니다.'
    },
    {
      id: 'complete',
      label: '프로젝트 완료',
      icon: '✅',
      color: 'green',
      description: '프로젝트를 성공적으로 완료 처리합니다.',
      warning: '완료된 프로젝트는 더 이상 수정할 수 없습니다.'
    },
    {
      id: 'lock',
      label: '결과 잠금',
      icon: '🔒',
      color: 'blue',
      description: '현재 결과를 잠금 처리하여 변경을 방지합니다.',
      warning: '잠금된 결과는 관리자만 해제할 수 있습니다.'
    },
    {
      id: 'export',
      label: '결과 내보내기',
      icon: '📤',
      color: 'purple',
      description: '프로젝트 결과를 다양한 형식으로 내보냅니다.',
      warning: '내보내기 후에도 프로젝트는 계속 진행할 수 있습니다.'
    }
  ];

  const handleActionSelect = (actionId: 'test' | 'sendEmail' | 'terminate' | 'complete' | 'lock' | 'export') => {
    setSelectedAction(actionId);
    setIsConfirming(false);
  };

  const handleConfirm = () => {
    if (!selectedAction) return;

    setIsConfirming(true);
  };

  const handleTestEvaluation = () => {
    if (evaluatorsData.length > 0) {
      // 첫 번째 평가자의 평가 링크로 테스트
      const testEvaluator = evaluatorsData[0];
      const testLink = `${window.location.origin}/evaluator?project=${projectId}&key=${testEvaluator.access_key || 'TEST_KEY'}&test=true`;
      window.open(testLink, '_blank');
      alert('테스트 모드로 평가 화면을 열었습니다.\n테스트 데이터는 저장되지 않습니다.');
    } else {
      // 평가자가 없을 때 테스트 모드
      const testLink = `${window.location.origin}/evaluator?project=${projectId}&test=true`;
      window.open(testLink, '_blank');
      alert('테스트 모드로 평가 화면을 열었습니다.');
    }
  };

  // 이메일 발송 핸들러
  const handleSendEmails = async () => {
    const pendingEvaluators = evaluatorsData.filter(e => e.status === 'pending');
    
    if (pendingEvaluators.length === 0) {
      alert('이메일을 발송할 평가자가 없습니다.\n모든 평가자가 이미 초대되었거나 평가를 진행 중입니다.');
      return;
    }

    try {
      // TODO: 실제 이메일 발송 API 호출
      console.log('📧 이메일 발송 시작:', pendingEvaluators);
      
      // 임시: 로컬에서 이메일 내용 표시
      const emailContent = pendingEvaluators.map(evaluator => {
        const evaluationLink = `${window.location.origin}/evaluator?project=${projectId}&evaluator=${evaluator.id}&key=${evaluator.access_key || 'KEY'}`;
        const surveyLink = `${window.location.origin}/demographic-survey?project=${projectId}&evaluator=${evaluator.id}`;
        
        return `
========================================
📧 발송 대상: ${evaluator.name} (${evaluator.email})
----------------------------------------
안녕하세요, ${evaluator.name}님.

AHP 평가에 초대되었습니다.

프로젝트: ${projectTitle}

1️⃣ 먼저 인구통계학적 설문에 참여해 주세요:
${surveyLink}

2️⃣ 설문 완료 후 평가를 진행해 주세요:
${evaluationLink}

감사합니다.
========================================`;
      }).join('\n');
      
      console.log(emailContent);
      
      alert(`${pendingEvaluators.length}명의 평가자에게 이메일을 발송했습니다.\n\n⚠️ 현재는 데모 모드입니다. 실제 이메일은 발송되지 않았습니다.\n콘솔에서 이메일 내용을 확인하세요.`);
      
      // 상태 업데이트 (데모)
      const updatedEvaluators = evaluatorsData.map(e => {
        if (pendingEvaluators.find(p => p.id === e.id)) {
          return { ...e, status: 'active' as const };
        }
        return e;
      });
      setEvaluatorsData(updatedEvaluators);
      
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      alert('이메일 발송 중 오류가 발생했습니다.');
    }
  };

  const handleExecute = async () => {
    if (!selectedAction) return;

    switch (selectedAction) {
      case 'test':
        handleTestEvaluation();
        break;
      case 'sendEmail':
        await handleSendEmails();
        break;
      case 'terminate':
        await updateProjectStatus('terminated');
        onProjectStatusChange('terminated');
        break;
      case 'complete':
        await updateProjectStatus('completed');
        onProjectStatusChange('completed');
        break;
      case 'lock':
        // Handle result locking
        alert('결과가 잠금 처리되었습니다.');
        break;
      case 'export':
        // Handle export
        handleExport();
        break;
    }

    setSelectedAction(null);
    setIsConfirming(false);
  };

  const updateProjectStatus = async (status: string) => {
    try {
      // TODO: 프로젝트 상태 업데이트 API 호출
      console.log(`프로젝트 ${projectId} 상태를 ${status}로 변경`);
      // await projectApi.updateProject(projectId, { status });
    } catch (error) {
      console.error('프로젝트 상태 업데이트 실패:', error);
    }
  };

  const handleExport = () => {
    const formats = exportFormat === 'both' ? ['Excel', 'PDF'] : [exportFormat.toUpperCase()];
    alert(`${formats.join(', ')} 형식으로 내보내기를 시작합니다.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">프로젝트 정보 로딩 중...</div>
      </div>
    );
  }

  if (!projectSummary) {
    return (
      <div className="text-center py-8 text-red-600">
        프로젝트 정보를 로드할 수 없습니다.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              단계 4 — 프로젝트 중단/완료
            </h1>
            <p className="text-gray-600">
              프로젝트: <span className="font-medium">{projectTitle}</span>
            </p>
          </div>
          <Button variant="secondary" onClick={onBack}>
            이전 단계로
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Detailed Project Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 평가 기준 카드 */}
          <Card title="📋 평가 기준 구조">
            <div className="space-y-2">
              {criteriaData.length > 0 ? (
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    총 {criteriaData.length}개의 평가 기준
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {criteriaData.map((criterion, index) => (
                      <div 
                        key={criterion.id} 
                        className="py-1 text-sm"
                        style={{ paddingLeft: `${(criterion.level - 1) * 16}px` }}
                      >
                        <span className="text-gray-700">
                          {criterion.level === 1 && '📁'}
                          {criterion.level === 2 && '📂'}
                          {criterion.level === 3 && '📄'}
                          {criterion.level >= 4 && '•'}
                        </span>
                        <span className="ml-1 font-medium">{criterion.name}</span>
                        {criterion.description && (
                          <span className="ml-1 text-gray-500 text-xs">({criterion.description})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  평가 기준이 설정되지 않았습니다.
                </div>
              )}
            </div>
          </Card>

          {/* 대안 카드 */}
          <Card title="🎯 평가 대안">
            <div className="space-y-2">
              {alternativesData.length > 0 ? (
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    총 {alternativesData.length}개의 대안
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {alternativesData.map((alternative, index) => (
                      <div key={alternative.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="text-blue-600 font-medium text-sm">
                            대안 {index + 1}
                          </span>
                          <span className="ml-2 text-gray-700 text-sm">
                            {alternative.name}
                          </span>
                        </div>
                        {alternative.description && (
                          <span className="text-gray-500 text-xs">
                            {alternative.description}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  대안이 설정되지 않았습니다.
                </div>
              )}
            </div>
          </Card>

          {/* 평가자 카드 */}
          <Card title="👥 평가자 현황">
            <div className="space-y-2">
              {evaluatorsData.length > 0 ? (
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    총 {evaluatorsData.length}명의 평가자
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {evaluatorsData.map((evaluator) => (
                      <div key={evaluator.id} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700 text-sm font-medium">
                            {evaluator.name}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {evaluator.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {evaluator.status === 'completed' && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">완료</span>
                          )}
                          {evaluator.status === 'active' && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              진행 {evaluator.progress || 0}%
                            </span>
                          )}
                          {evaluator.status === 'pending' && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">대기</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  평가자가 배정되지 않았습니다.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Project Summary */}
        <Card title="📊 프로젝트 요약 현황">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{projectSummary.totalCriteria}</div>
              <div className="text-sm text-blue-700">평가 기준</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{projectSummary.totalAlternatives}</div>
              <div className="text-sm text-green-700">대안 수</div>
            </div>
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{projectSummary.totalEvaluators}</div>
              <div className="text-sm text-purple-700">총 평가자</div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{projectSummary.completionRate}%</div>
              <div className="text-sm text-orange-700">진행률</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-900">{projectSummary.pendingEvaluators}</div>
              <div className="text-sm text-yellow-700">대기 중</div>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
              <div className="text-xl font-bold text-indigo-900">{projectSummary.activeEvaluators}</div>
              <div className="text-sm text-indigo-700">진행 중</div>
            </div>
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-center">
              <div className="text-xl font-bold text-teal-900">{projectSummary.completedEvaluators}</div>
              <div className="text-sm text-teal-700">완료</div>
            </div>
          </div>

          {projectSummary.consistencyRatio > 0 && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">일관성 비율 (CR)</h4>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold">
                  {projectSummary.consistencyRatio.toFixed(3)}
                </div>
                <div className="text-sm">
                  {projectSummary.consistencyRatio <= 0.1 ? (
                    <span className="text-green-600">✅ 적합 (CR ≤ 0.1)</span>
                  ) : (
                    <span className="text-red-600">⚠️ 재검토 필요 (CR &gt; 0.1)</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Action Selection */}
        <Card title="🎯 작업 선택">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionSelect(action.id as any)}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  selectedAction === action.id
                    ? `border-${action.color}-500 bg-${action.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{action.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    {selectedAction === action.id && (
                      <p className="text-xs text-orange-600 mt-2">⚠️ {action.warning}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Action Configuration */}
        {selectedAction === 'sendEmail' && evaluatorsData.length > 0 && (
          <Card title="📧 이메일 발송 확인">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">발송 대상</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {evaluatorsData.filter(e => e.status === 'pending').map(evaluator => (
                    <li key={evaluator.id}>• {evaluator.name} ({evaluator.email})</li>
                  ))}
                </ul>
                {evaluatorsData.filter(e => e.status === 'pending').length === 0 && (
                  <p className="text-sm text-gray-600">모든 평가자가 이미 초대되었습니다.</p>
                )}
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ 주의사항</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 현재 데모 모드로 실제 이메일은 발송되지 않습니다.</li>
                  <li>• SendGrid/Nodemailer 설정이 필요합니다.</li>
                  <li>• 콘솔에서 이메일 내용을 확인할 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
        
        {selectedAction === 'export' && (
          <Card title="📤 내보내기 설정">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                내보내기 형식 선택
              </label>
              <div className="space-y-2">
                {[
                  { value: 'excel', label: 'Excel 파일 (.xlsx)', description: '분석 데이터와 차트 포함' },
                  { value: 'pdf', label: 'PDF 문서 (.pdf)', description: '최종 보고서 형태' },
                  { value: 'both', label: '두 형식 모두', description: 'Excel과 PDF 파일 모두 생성' }
                ].map((format) => (
                  <label key={format.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      value={format.value}
                      checked={exportFormat === format.value}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-sm text-gray-600">{format.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Confirmation */}
        {selectedAction && !isConfirming && (
          <div className="text-center">
            <Button onClick={handleConfirm} variant="primary" size="lg">
              {actions.find(a => a.id === selectedAction)?.label} 진행
            </Button>
          </div>
        )}

        {isConfirming && (
          <Card title="🚨 최종 확인">
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">
                  {actions.find(a => a.id === selectedAction)?.label}을(를) 실행하시겠습니까?
                </h4>
                <p className="text-sm text-red-700">
                  {actions.find(a => a.id === selectedAction)?.warning}
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleExecute}
                  variant="error"
                  size="lg"
                >
                  확인하고 실행
                </Button>
                <Button
                  onClick={() => setIsConfirming(false)}
                  variant="secondary"
                  size="lg"
                >
                  취소
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Project Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">📋 프로젝트 정보</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>생성일: {projectSummary.createdDate}</div>
            <div>최종 수정: {projectSummary.lastModified}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-white p-2 rounded text-center">
                <span className="font-medium">기준: </span>{projectSummary.totalCriteria}개
              </div>
              <div className="bg-white p-2 rounded text-center">
                <span className="font-medium">대안: </span>{projectSummary.totalAlternatives}개
              </div>
              <div className="bg-white p-2 rounded text-center">
                <span className="font-medium">평가자: </span>{projectSummary.totalEvaluators}명
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCompletion;