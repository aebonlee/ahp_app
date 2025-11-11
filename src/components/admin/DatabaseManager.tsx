import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { criteriaApi, projectApi } from '../../services/api';

interface Project {
  id: string;
  title: string;
  criteria_count: number;
}

interface Criterion {
  id: string;
  name: string;
  project_id: string;
}

const DatabaseManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' | 'warning' }>({ text: '', type: 'info' });
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCriteria: 0,
    deletedCriteria: 0
  });
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // 메시지 표시 함수
  const showMessage = (text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setMessage({ text: `[${timestamp}] ${text}`, type });
  };

  // 프로젝트 및 기준 정보 로드
  const loadStatus = async () => {
    try {
      setIsLoading(true);
      showMessage('프로젝트 및 기준 정보를 조회하는 중...', 'info');

      const response = await projectApi.getProjects();
      if (response.success && response.data) {
        const projectList = response.data;
        setProjects(projectList);

        let totalCriteriaCount = 0;
        let statusReport = '📊 현재 데이터베이스 상태:\n\n';

        for (const project of projectList) {
          try {
            const criteriaResponse = await criteriaApi.getCriteria(project.id);
            if (criteriaResponse.success && criteriaResponse.data) {
              const criteriaCount = criteriaResponse.data.length;
              totalCriteriaCount += criteriaCount;
              
              statusReport += `📁 ${project.title}\n`;
              statusReport += `   ID: ${project.id}\n`;
              statusReport += `   기준: ${criteriaCount}개\n`;
              
              if (criteriaCount > 0) {
                const criteriaNames = criteriaResponse.data.slice(0, 5).map((c: any) => c.name).join(', ');
                statusReport += `   기준 목록: ${criteriaNames}`;
                if (criteriaCount > 5) {
                  statusReport += ` 외 ${criteriaCount - 5}개`;
                }
                statusReport += '\n';
              }
              statusReport += '\n';
            }
          } catch (error) {
            console.error(`프로젝트 ${project.id} 기준 조회 실패:`, error);
          }
        }

        statusReport += `\n총 ${projectList.length}개 프로젝트, ${totalCriteriaCount}개 기준`;
        
        setStats({
          totalProjects: projectList.length,
          totalCriteria: totalCriteriaCount,
          deletedCriteria: 0
        });
        
        showMessage(statusReport, 'info');
      }
    } catch (error) {
      console.error('상태 조회 실패:', error);
      showMessage('상태 조회 실패', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 프로젝트의 모든 기준 삭제
  const clearProjectCriteria = async (projectId: string, projectTitle: string) => {
    try {
      showMessage(`🔄 "${projectTitle}" 프로젝트 처리 중...`, 'info');
      
      const criteriaResponse = await criteriaApi.getCriteria(projectId);
      if (!criteriaResponse.success || !criteriaResponse.data) {
        showMessage(`"${projectTitle}": 기준 조회 실패`, 'error');
        return 0;
      }

      const criteria = criteriaResponse.data;
      if (criteria.length === 0) {
        showMessage(`"${projectTitle}": 삭제할 기준이 없습니다.`, 'info');
        return 0;
      }

      let projectDeletedCount = 0;
      const deleteErrors: string[] = [];

      // 각 기준 삭제
      for (const criterion of criteria) {
        try {
          const deleteResponse = await criteriaApi.deleteCriteria(criterion.id, projectId);
          if (deleteResponse.success) {
            projectDeletedCount++;
            console.log(`✅ 삭제됨: ${criterion.name} (ID: ${criterion.id})`);
          } else {
            deleteErrors.push(`${criterion.name}: ${deleteResponse.error || '알 수 없는 오류'}`);
            console.error(`❌ 삭제 실패: ${criterion.name}`, deleteResponse.error);
          }
        } catch (error) {
          deleteErrors.push(`${criterion.name}: ${error}`);
          console.error(`❌ 삭제 오류: ${criterion.name}`, error);
        }
      }

      // 삭제 확인을 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // 삭제 확인
      const checkResponse = await criteriaApi.getCriteria(projectId);
      const remainingCount = checkResponse.success && checkResponse.data ? checkResponse.data.length : 0;

      let resultMessage = `"${projectTitle}": ${projectDeletedCount}/${criteria.length}개 삭제 완료`;
      if (remainingCount > 0) {
        resultMessage += ` (⚠️ ${remainingCount}개 남음)`;
      }
      if (deleteErrors.length > 0) {
        resultMessage += `\n삭제 실패: ${deleteErrors.join(', ')}`;
      }

      showMessage(resultMessage, remainingCount === 0 ? 'success' : 'warning');
      return projectDeletedCount;
      
    } catch (error) {
      console.error(`"${projectTitle}" 처리 실패:`, error);
      showMessage(`"${projectTitle}" 처리 실패`, 'error');
      return 0;
    }
  };

  // 선택한 프로젝트만 초기화
  const clearSelectedProject = async () => {
    if (!selectedProjectId) {
      showMessage('프로젝트를 선택해주세요.', 'warning');
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;

    if (!window.confirm(`정말 "${project.title}" 프로젝트의 모든 기준을 삭제하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    setStats(prev => ({ ...prev, deletedCriteria: 0 }));
    
    const deletedCount = await clearProjectCriteria(project.id, project.title);
    
    setStats(prev => ({ ...prev, deletedCriteria: deletedCount }));
    setIsLoading(false);
    
    // 상태 다시 로드
    setTimeout(loadStatus, 1000);
  };

  // 모든 프로젝트 초기화
  const clearAllCriteria = async () => {
    if (!window.confirm('⚠️ 정말 모든 프로젝트의 기준을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!')) {
      return;
    }

    if (!window.confirm('⚠️⚠️ 마지막 확인: 정말로 모든 데이터를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsLoading(true);
      showMessage('모든 프로젝트 초기화를 시작합니다...', 'warning');
      setStats(prev => ({ ...prev, deletedCriteria: 0 }));
      
      let totalDeleted = 0;
      setProgress({ current: 0, total: projects.length });

      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        setProgress({ current: i + 1, total: projects.length });
        const deletedCount = await clearProjectCriteria(project.id, project.title);
        totalDeleted += deletedCount;
        setStats(prev => ({ ...prev, deletedCriteria: totalDeleted }));
      }

      showMessage(`✅ 초기화 완료! 총 ${totalDeleted}개의 기준이 삭제되었습니다.`, 'success');
      
      // 상태 다시 로드
      setTimeout(loadStatus, 1000);
    } catch (error) {
      console.error('초기화 실패:', error);
      showMessage('초기화 실패', 'error');
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  // 컴포넌트 마운트 시 상태 로드
  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="mb-6">
        <h1 className="text-2xl font-bold mb-4">🗑️ 데이터베이스 관리</h1>
        <p className="text-gray-600 mb-6">
          프로젝트의 기준(Criteria) 데이터를 관리합니다. 삭제 작업은 되돌릴 수 없으니 신중하게 진행하세요.
        </p>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center p-4 bg-blue-50">
            <div className="text-3xl font-bold text-blue-600">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600 mt-1">전체 프로젝트</div>
          </Card>
          <Card className="text-center p-4 bg-green-50">
            <div className="text-3xl font-bold text-green-600">{stats.totalCriteria}</div>
            <div className="text-sm text-gray-600 mt-1">전체 기준</div>
          </Card>
          <Card className="text-center p-4 bg-red-50">
            <div className="text-3xl font-bold text-red-600">{stats.deletedCriteria}</div>
            <div className="text-sm text-gray-600 mt-1">삭제된 기준</div>
          </Card>
        </div>

        {/* 진행률 표시 */}
        {progress.total > 0 && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div 
                className="bg-blue-600 h-full flex items-center justify-center text-white font-semibold transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              >
                {Math.round((progress.current / progress.total) * 100)}% ({progress.current}/{progress.total})
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            variant="primary" 
            onClick={loadStatus}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            📊 현재 상태 조회
          </Button>
          <Button 
            variant="secondary" 
            onClick={clearSelectedProject}
            disabled={isLoading || !selectedProjectId}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            🧹 선택한 프로젝트만 초기화
          </Button>
          <Button 
            variant="danger" 
            onClick={clearAllCriteria}
            disabled={isLoading || projects.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ⚠️ 모든 프로젝트 초기화
          </Button>
        </div>

        {/* 프로젝트 선택 */}
        <div className="mb-6">
          <label htmlFor="projectSelect" className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 선택:
          </label>
          <select 
            id="projectSelect"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">프로젝트를 선택하세요...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title} (기준: {project.criteria_count || 0}개)
              </option>
            ))}
          </select>
        </div>

        {/* 결과 메시지 */}
        {message.text && (
          <Card className={`p-4 ${
            message.type === 'error' ? 'bg-red-50 border-red-300 text-red-800' :
            message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' :
            message.type === 'warning' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' :
            'bg-blue-50 border-blue-300 text-blue-800'
          }`}>
            <pre className="whitespace-pre-wrap font-mono text-sm">{message.text}</pre>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default DatabaseManager;