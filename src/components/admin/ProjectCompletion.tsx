import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import dataService from '../../services/dataService_clean';
import { projectApi } from '../../services/api';

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

  useEffect(() => {
    loadProjectSummary();
  }, [projectId]);

  const loadProjectSummary = async () => {
    try {
      setLoading(true);
      
      // 프로젝트 데이터 로드
      const [criteria, alternatives, evaluators] = await Promise.all([
        dataService.getCriteria(projectId),
        dataService.getAlternatives(projectId),
        dataService.getEvaluators(projectId)
      ]);

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

  const handleActionSelect = (actionId: 'terminate' | 'complete' | 'lock' | 'export') => {
    setSelectedAction(actionId);
    setIsConfirming(false);
  };

  const handleConfirm = () => {
    if (!selectedAction) return;

    setIsConfirming(true);
  };

  const handleExecute = async () => {
    if (!selectedAction) return;

    switch (selectedAction) {
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
        <div className="text-gray-500">프로젝트 정보 로듩 중...</div>
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
        {/* Project Summary */}
        <Card title="📊 프로젝트 현황">
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