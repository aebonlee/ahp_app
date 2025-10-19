import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface ProjectCompletionProps {
  projectId: string;
  projectTitle: string;
  onBack: () => void;
  onProjectStatusChange: (status: 'terminated' | 'completed') => void;
}

const ProjectCompletion: React.FC<ProjectCompletionProps> = ({ 
  projectId, 
  projectTitle, 
  onBack,
  onProjectStatusChange 
}) => {
  const [selectedAction, setSelectedAction] = useState<'terminate' | 'complete' | 'lock' | 'export' | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'both'>('both');

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

  const handleExecute = () => {
    if (!selectedAction) return;

    switch (selectedAction) {
      case 'terminate':
        onProjectStatusChange('terminated');
        break;
      case 'complete':
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

  const handleExport = () => {
    const formats = exportFormat === 'both' ? ['Excel', 'PDF'] : [exportFormat.toUpperCase()];
    alert(`${formats.join(', ')} 형식으로 내보내기를 시작합니다.`);
  };

  const getProjectSummary = () => {
    return {
      totalEvaluators: 4,
      completedEvaluators: 3,
      completionRate: 75,
      consistencyRatio: 0.08,
      finalRanking: ['대안 A', '대안 B', '대안 C'],
      createdDate: '2024-01-15',
      lastModified: '2024-01-20'
    };
  };

  const summary = getProjectSummary();

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
              <div className="text-2xl font-bold text-blue-900">{summary.totalEvaluators}</div>
              <div className="text-sm text-blue-700">총 평가자</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{summary.completedEvaluators}</div>
              <div className="text-sm text-green-700">완료 평가자</div>
            </div>
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{summary.completionRate}%</div>
              <div className="text-sm text-purple-700">진행률</div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{summary.consistencyRatio}</div>
              <div className="text-sm text-orange-700">일관성 비율</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">최종 순위</h4>
            <div className="flex items-center space-x-6">
              {summary.finalRanking.map((alternative, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-medium">{alternative}</span>
                </div>
              ))}
            </div>
          </div>
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
                  { value: 'excel', label: 'JSON 파일 (.json)', description: '분석 데이터 포함 (보안상 JSON 형태)' },
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
            <div>생성일: {summary.createdDate}</div>
            <div>최종 수정: {summary.lastModified}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCompletion;