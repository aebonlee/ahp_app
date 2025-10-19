import React from 'react';

interface NewProjectModalProps {
  onClose: () => void;
  onProjectCreated: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onProjectCreated }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">새 프로젝트 생성</h2>
        <p className="text-gray-600 mb-6">
          새로운 AHP 프로젝트를 생성합니다.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={() => {
              onProjectCreated();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;