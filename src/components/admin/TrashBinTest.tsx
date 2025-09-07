import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

interface TrashBinTestProps {
  onFetchTrashedProjects?: () => Promise<any[]>;
  onRestoreProject?: (projectId: string) => Promise<any>;
  onPermanentDeleteProject?: (projectId: string) => Promise<any>;
  onDeleteProject?: (projectId: string) => Promise<any>;
}

const TrashBinTest: React.FC<TrashBinTestProps> = ({
  onFetchTrashedProjects,
  onRestoreProject,
  onPermanentDeleteProject,
  onDeleteProject
}) => {
  const [trashedProjects, setTrashedProjects] = useState<any[]>([]);
  const [testProjects] = useState([
    { id: 'test-1', title: '테스트 프로젝트 1', description: '삭제 테스트용 프로젝트' },
    { id: 'test-2', title: '테스트 프로젝트 2', description: '휴지통 테스트용 프로젝트' }
  ]);

  const loadTrashedProjects = async () => {
    if (onFetchTrashedProjects) {
      try {
        const projects = await onFetchTrashedProjects();
        setTrashedProjects(projects);
        console.log('✅ 휴지통 프로젝트 로드됨:', projects);
      } catch (error) {
        console.error('❌ 휴지통 프로젝트 로드 실패:', error);
      }
    }
  };

  useEffect(() => {
    loadTrashedProjects();
  }, []);

  const handleTestDelete = async (projectId: string, title: string) => {
    try {
      if (onDeleteProject) {
        console.log('🗑️ 테스트 삭제 시작:', projectId);
        await onDeleteProject(projectId);
        console.log('✅ 테스트 삭제 완료:', projectId);
        await loadTrashedProjects(); // 휴지통 새로고침
      } else {
        alert('삭제 함수가 전달되지 않았습니다.');
      }
    } catch (error) {
      console.error('❌ 삭제 실패:', error);
      alert('삭제 실패: ' + (error as Error).message);
    }
  };

  const handleRestore = async (projectId: string, title: string) => {
    if (window.confirm(`"${title}" 프로젝트를 복원하시겠습니까?`)) {
      try {
        if (onRestoreProject) {
          await onRestoreProject(projectId);
          alert('복원 완료!');
          await loadTrashedProjects();
        }
      } catch (error) {
        console.error('복원 실패:', error);
        alert('복원 실패: ' + (error as Error).message);
      }
    }
  };

  const handlePermanentDelete = async (projectId: string, title: string) => {
    if (window.confirm(`"${title}"를 영구 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!`)) {
      if (window.confirm(`정말로 "${title}"를 완전히 삭제하시겠습니까?\n\n마지막 확인입니다.`)) {
        try {
          if (onPermanentDeleteProject) {
            await onPermanentDeleteProject(projectId);
            alert('영구 삭제 완료!');
            await loadTrashedProjects();
          }
        } catch (error) {
          console.error('영구 삭제 실패:', error);
          alert('영구 삭제 실패: ' + (error as Error).message);
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
          🗑️ 휴지통 테스트 페이지
        </h1>
        <p className="text-gray-600 mb-4">
          삭제/복원 기능이 제대로 작동하는지 테스트합니다.
        </p>
        
        <div className="flex space-x-4">
          <Button onClick={loadTrashedProjects}>
            🔄 휴지통 새로고침
          </Button>
          <span className="text-sm text-gray-500 flex items-center">
            현재 휴지통: {trashedProjects.length}개
          </span>
        </div>
      </div>

      {/* 테스트 프로젝트 삭제 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold mb-4">🧪 삭제 테스트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testProjects.map(project => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{project.description}</p>
              <Button 
                variant="error" 
                onClick={() => handleTestDelete(project.id, project.title)}
                className="w-full"
              >
                🗑️ 휴지통으로 이동
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 휴지통 내용 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold mb-4">🗑️ 휴지통 내용</h2>
        {trashedProjects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-gray-500">휴지통이 비어있습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trashedProjects.map((project: any) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    <div className="text-xs text-gray-500">
                      삭제일: {project.deleted_at ? new Date(project.deleted_at).toLocaleString('ko-KR') : '정보 없음'}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRestore(project.id, project.title)}
                    >
                      ↩️ 복원
                    </Button>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handlePermanentDelete(project.id, project.title)}
                    >
                      🗑️ 영구삭제
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API 연결 상태 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <h3 className="font-medium mb-2">🔧 API 연결 상태</h3>
        <ul className="space-y-1 text-gray-600">
          <li>• onFetchTrashedProjects: {onFetchTrashedProjects ? '✅ 연결됨' : '❌ 없음'}</li>
          <li>• onRestoreProject: {onRestoreProject ? '✅ 연결됨' : '❌ 없음'}</li>
          <li>• onPermanentDeleteProject: {onPermanentDeleteProject ? '✅ 연결됨' : '❌ 없음'}</li>
          <li>• onDeleteProject: {onDeleteProject ? '✅ 연결됨' : '❌ 없음'}</li>
        </ul>
      </div>
    </div>
  );
};

export default TrashBinTest;