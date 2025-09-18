import React from 'react';
import { ProjectData } from '../../services/dataService';

type ModelStep = 'overview' | 'details' | 'criteria' | 'alternatives' | 'evaluators' | 'complete';

interface ModelBuilderProps {
  project: ProjectData;
  currentStep: ModelStep;
  onStepChange: (step: ModelStep) => void;
  onClose: () => void;
}

const ModelBuilder: React.FC<ModelBuilderProps> = ({ project, currentStep, onStepChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">모델 구축 - {project.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span>단계: {currentStep}</span>
            <span>프로젝트: {project.title}</span>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-600">모델 구축 기능이 여기에 구현됩니다.</p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelBuilder;