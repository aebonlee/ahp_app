import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface TrashBinProps {
  onFetchTrashedProjects?: () => Promise<any[]>;
  onRestoreProject?: (projectId: string) => Promise<any>;
  onPermanentDeleteProject?: (projectId: string) => Promise<any>;
  onBack?: () => void;
}

interface TrashedProject {
  id: string;
  title: string;
  description: string;
  created_at: string;
  deleted_at: string;
  admin_name?: string;
}

const TrashBin: React.FC<TrashBinProps> = ({
  onFetchTrashedProjects,
  onRestoreProject,
  onPermanentDeleteProject,
  onBack
}) => {
  const [trashedProjects, setTrashedProjects] = useState<TrashedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    loadTrashedProjects();
  }, []);

  const loadTrashedProjects = async () => {
    const debugLog = [];
    
    if (!onFetchTrashedProjects) {
      const msg = '❌ onFetchTrashedProjects 함수가 전달되지 않았습니다';
      console.log(msg);
      debugLog.push(msg);
      setDebugInfo(debugLog.join('\n'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const startMsg = '🔄 휴지통 프로젝트 로드 시작...';
      console.log(startMsg);
      debugLog.push(startMsg);
      
      const projects = await onFetchTrashedProjects();
      const resultMsg = `📊 휴지통 프로젝트 로드 결과: ${projects?.length || 0}개`;
      console.log(resultMsg, projects);
      debugLog.push(resultMsg);
      
      if (projects && projects.length > 0) {
        debugLog.push(`✅ 휴지통 데이터 있음: ${JSON.stringify(projects[0], null, 2)}`);
      } else {
        debugLog.push('⚠️ 휴지통이 비어있습니다');
      }
      
      setTrashedProjects(projects || []);
      setDebugInfo(debugLog.join('\n'));
    } catch (error) {
      const errorMsg = `❌ 휴지통 프로젝트 로드 실패: ${error}`;
      console.error(errorMsg);
      debugLog.push(errorMsg);
      setDebugInfo(debugLog.join('\n'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (projectId: string, projectTitle: string) => {
    if (!onRestoreProject) return;
    
    if (!window.confirm(`"${projectTitle}" 프로젝트를 복원하시겠습니까?`)) {
      return;
    }

    try {
      setActionLoading(projectId);
      await onRestoreProject(projectId);
      
      // 목록에서 제거
      setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
      
      alert('프로젝트가 성공적으로 복원되었습니다.');
    } catch (error) {
      console.error('Failed to restore project:', error);
      alert('프로젝트 복원에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (projectId: string, projectTitle: string) => {
    if (!onPermanentDeleteProject) return;
    
    if (!window.confirm(`"${projectTitle}" 프로젝트를 영구 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다!\n- 모든 평가 데이터\n- 기준 및 대안\n- 평가자 배정 정보\n\n모든 데이터가 완전히 삭제됩니다.`)) {
      return;
    }

    // 한 번 더 확인
    if (!window.confirm(`정말로 "${projectTitle}"를 영구 삭제하시겠습니까?\n\n마지막 확인입니다.`)) {
      return;
    }

    try {
      setActionLoading(projectId);
      await onPermanentDeleteProject(projectId);
      
      // 목록에서 제거
      setTrashedProjects(prev => prev.filter(p => p.id !== projectId));
      
      alert('프로젝트가 영구 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to permanently delete project:', error);
      alert('영구 삭제에 실패했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '1일 전';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            🗑️ 휴지통
          </h1>
          <p className="text-gray-600">
            삭제된 프로젝트를 복원하거나 영구 삭제할 수 있습니다.
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            ← 돌아가기
          </Button>
        )}
      </div>

      {/* 안내 메시지 */}
      <Card variant="outlined" className="bg-amber-50 border-amber-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-medium text-amber-800 mb-2">휴지통 사용 안내</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• <strong>복원</strong>: 프로젝트를 원래 상태로 되돌립니다</li>
              <li>• <strong>영구 삭제</strong>: 모든 데이터를 완전히 삭제합니다 (복구 불가)</li>
              <li>• 30일 후 자동으로 영구 삭제됩니다</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 디버그 정보 표시 */}
      {debugInfo && (
        <Card variant="outlined" className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">휴지통 디버그 정보</h3>
              <pre className="text-xs text-blue-700 whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          </div>
        </Card>
      )}

      {/* 프로젝트 목록 */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">휴지통 로딩 중...</h3>
            <p className="text-gray-500">삭제된 프로젝트를 불러오고 있습니다.</p>
          </div>
        ) : trashedProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">휴지통이 비어있습니다</h3>
            <p className="text-gray-500">삭제된 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-medium">삭제된 프로젝트 ({trashedProjects.length}개)</h2>
            </div>

            <div className="space-y-4">
              {trashedProjects.map((project) => (
                <div 
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {project.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>생성: {formatDate(project.created_at)}</span>
                        <span>•</span>
                        <span>삭제: {formatDate(project.deleted_at)} ({getTimeAgo(project.deleted_at)})</span>
                        {project.admin_name && (
                          <>
                            <span>•</span>
                            <span>생성자: {project.admin_name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRestore(project.id, project.title)}
                        disabled={actionLoading === project.id}
                        loading={actionLoading === project.id}
                      >
                        ↩️ 복원
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => handlePermanentDelete(project.id, project.title)}
                        disabled={actionLoading === project.id}
                      >
                        🗑️ 영구삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TrashBin;