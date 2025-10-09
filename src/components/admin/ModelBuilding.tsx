import React, { useState } from 'react';
// import Card from '../common/Card';
import Button from '../common/Button';
import CriteriaManagement from './CriteriaManagement';
import AlternativeManagement from './AlternativeManagement';
import EvaluatorAssignment from './EvaluatorAssignment';
import ModelFinalization from './ModelFinalization';
import QRCodeEvaluatorAssignment from '../evaluation/QRCodeEvaluatorAssignment';

interface ModelBuildingProps {
  projectId: string;
  projectTitle: string;
  onModelFinalized: () => void;
  onBack: () => void;
  maxEvaluators?: number;
  currentPlan?: string;
}

const ModelBuilding: React.FC<ModelBuildingProps> = ({ 
  projectId, 
  projectTitle, 
  onModelFinalized,
  onBack,
  maxEvaluators = 50,
  currentPlan = 'Standard Plan'
}) => {
  const [activeStep, setActiveStep] = useState<'criteria' | 'alternatives' | 'evaluators' | 'qrcode' | 'finalize'>('criteria');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [evaluationMethod, setEvaluationMethod] = useState<'traditional' | 'qrcode'>('qrcode');

  const steps = [
    {
      id: 'criteria',
      label: '1️⃣ 기준 정의',
      title: '1단계 — 평가 기준 정의',
      icon: '🎯',
      description: '계층구조와 평가기준을 설정합니다'
    },
    {
      id: 'alternatives',
      label: '2️⃣ 대안 설정',
      title: '2단계 — 대안 설정',
      icon: '📝',
      description: '평가할 대안들을 정의합니다'
    },
    {
      id: 'evaluators',
      label: '3️⃣ 평가자 배정',
      title: '3단계 — 평가자 배정',
      icon: '👥',
      description: '평가에 참여할 사용자를 배정합니다',
      optional: evaluationMethod === 'qrcode'
    },
    {
      id: 'qrcode',
      label: '4️⃣ QR코드 생성',
      title: '4단계 — QR코드 평가 설정',
      icon: '📱',
      description: 'QR코드로 즉시 평가를 시작합니다',
      show: evaluationMethod === 'qrcode'
    },
    {
      id: 'finalize',
      label: '5️⃣ 모델 구축',
      title: '5단계 — 모델 구축 완료',
      icon: '🏗️',
      description: '모델을 확정하고 평가를 시작합니다'
    }
  ].filter(step => step.show !== false);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...Array.from(prev), stepId]));
    
    // Auto-advance to next step
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setActiveStep(nextStep.id as typeof activeStep);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'criteria':
        return (
          <CriteriaManagement
            projectId={projectId}
            projectTitle={projectTitle}
            onCriteriaChange={() => {}}
            onComplete={() => handleStepComplete('criteria')}
          />
        );
      case 'alternatives':
        return (
          <AlternativeManagement
            projectId={projectId}
            onComplete={() => handleStepComplete('alternatives')}
          />
        );
      case 'evaluators':
        return (
          <>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">평가 방식 선택</h4>
                  <p className="text-sm text-blue-700 mt-1">원하는 평가 방식을 선택하세요</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={evaluationMethod === 'traditional' ? 'primary' : 'secondary'}
                    onClick={() => setEvaluationMethod('traditional')}
                  >
                    📧 이메일 초대
                  </Button>
                  <Button
                    variant={evaluationMethod === 'qrcode' ? 'primary' : 'secondary'}
                    onClick={() => {
                      setEvaluationMethod('qrcode');
                      setActiveStep('qrcode');
                      handleStepComplete('evaluators');
                    }}
                  >
                    📱 QR코드 평가
                  </Button>
                </div>
              </div>
            </div>
            {evaluationMethod === 'traditional' && (
              <EvaluatorAssignment
                projectId={projectId}
                onComplete={() => handleStepComplete('evaluators')}
                maxEvaluators={maxEvaluators}
                currentPlan={currentPlan}
              />
            )}
          </>
        );
      case 'qrcode':
        return (
          <QRCodeEvaluatorAssignment
            projectId={projectId}
            onComplete={() => handleStepComplete('qrcode')}
          />
        );
      case 'finalize':
        return (
          <ModelFinalization
            projectId={projectId}
            onFinalize={onModelFinalized}
            isReadyToFinalize={completedSteps.size >= 3}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              단계 2: 모델구축
            </h1>
            <p className="text-gray-600">
              프로젝트: <span className="font-medium">{projectTitle}</span>
            </p>
          </div>
          <Button variant="secondary" onClick={onBack}>
            이전 단계로
          </Button>
        </div>

        {/* Step Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id as typeof activeStep)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeStep === step.id
                    ? 'bg-blue-500 text-white'
                    : completedSteps.has(step.id)
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{step.icon}</span>
                <span>{step.label}</span>
                {completedSteps.has(step.id) && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm text-gray-600">
              {completedSteps.size} / {steps.length} 단계 완료
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div>
        {renderStepContent()}
      </div>
    </div>
  );
};

export default ModelBuilding;