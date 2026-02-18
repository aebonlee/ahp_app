import React, { useState } from 'react';
import Button from './Button';

interface TrashOverflowModalProps {
  trashedProjects: any[];
  projectToDelete: string;
  onPermanentDelete: (projectId: string) => Promise<void>;
  onCancel: () => void;
  onDeleteAfterCleanup: (projectToDelete: string) => Promise<void>;
}

const TrashOverflowModal: React.FC<TrashOverflowModalProps> = ({
  trashedProjects,
  projectToDelete,
  onPermanentDelete,
  onCancel,
  onDeleteAfterCleanup
}) => {
  const [selectedForDeletion, setSelectedForDeletion] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({type, text});
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handlePermanentDelete = async () => {
    if (!selectedForDeletion) {
      showActionMessage('error', '영구 삭제할 프로젝트를 선택해주세요.');
      return;
    }

    const projectToDeletePermanently = trashedProjects.find(p => p.id === selectedForDeletion);
    if (!projectToDeletePermanently) return;

    if (!window.confirm(`"${projectToDeletePermanently.title}" 프로젝트를 영구 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`)) {
      return;
    }

    // 한 번 더 확인
    if (!window.confirm(`정말로 "${projectToDeletePermanently.title}"를 영구 삭제하시겠습니까?\n\n마지막 확인입니다.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      // 선택된 프로젝트를 영구 삭제
      await onPermanentDelete(selectedForDeletion);
      
      // 원래 삭제하려던 프로젝트를 휴지통으로 이동
      await onDeleteAfterCleanup(projectToDelete);
      
      showActionMessage('success', '프로젝트가 영구 삭제되고 새 프로젝트가 휴지통으로 이동되었습니다.');
    } catch (error) {
      console.error('영구 삭제 처리 실패:', error);
      showActionMessage('error', '영구 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b bg-orange-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🗑️</span>
            <div>
              <h3 className="text-lg font-bold text-orange-800">휴지통이 가득 참</h3>
              <p className="text-sm text-orange-700">휴지통은 최대 3개까지만 보관 가능합니다.</p>
            </div>
          </div>
        </div>

        {/* 내용 */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">⚠️ 휴지통 공간 부족</h4>
            <p className="text-sm text-red-700">
              새 프로젝트를 휴지통으로 보내려면 기존 프로젝트 중 하나를 영구 삭제해야 합니다.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">영구 삭제할 프로젝트를 선택하세요:</h4>
            <div className="space-y-3">
              {trashedProjects.map((project) => (
                <label
                  key={project.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedForDeletion === project.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="projectToDelete"
                    value={project.id}
                    checked={selectedForDeletion === project.id}
                    onChange={(e) => setSelectedForDeletion(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">{project.title}</h5>
                      <span className="text-xs text-gray-500">
                        삭제됨: {formatDate(project.deleted_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">💡 참고사항</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 영구 삭제된 프로젝트는 복구할 수 없습니다</li>
              <li>• 모든 관련 데이터(기준, 대안, 평가 결과)가 함께 삭제됩니다</li>
              <li>• 삭제 후 새 프로젝트가 자동으로 휴지통으로 이동됩니다</li>
            </ul>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="error"
            onClick={handlePermanentDelete}
            disabled={!selectedForDeletion || isDeleting}
            loading={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '영구 삭제 후 진행'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrashOverflowModal;