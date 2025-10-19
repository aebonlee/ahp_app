import React, { useState, useEffect } from 'react';
import cleanDataService from '../services/dataService_clean';
import { ProjectData, CriteriaData } from '../services/api';

/**
 * 기준 설정 API 통합 테스트 페이지
 * 프론트엔드-백엔드 연동 완전 테스트
 */
const TestPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [criteria, setCriteria] = useState<CriteriaData[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 테스트 결과 추가
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 1. 프로젝트 목록 조회 테스트
  const testGetProjects = async () => {
    setLoading(true);
    try {
      addTestResult('🔍 프로젝트 목록 조회 시작...');
      const projectList = await cleanDataService.getProjects();
      setProjects(projectList);
      addTestResult(`✅ 프로젝트 조회 성공: ${projectList.length}개`);
      
      if (projectList.length > 0) {
        setSelectedProject(projectList[0]);
        addTestResult(`📋 첫 번째 프로젝트 선택: ${projectList[0].title}`);
      }
    } catch (error) {
      addTestResult(`❌ 프로젝트 조회 실패: ${error}`);
    }
    setLoading(false);
  };

  // 2. 기준 조회 테스트 (메타데이터 우선)
  const testGetCriteria = async () => {
    if (!selectedProject?.id) {
      addTestResult('❌ 프로젝트가 선택되지 않음');
      return;
    }

    setLoading(true);
    try {
      addTestResult('🔍 기준 조회 시작 (메타데이터 우선)...');
      const criteriaList = await cleanDataService.getCriteria(selectedProject.id);
      setCriteria(criteriaList);
      addTestResult(`✅ 기준 조회 성공: ${criteriaList.length}개`);
      
      criteriaList.forEach((c, i) => {
        addTestResult(`   ${i+1}. ${c.name}: ${c.description || '설명 없음'}`);
      });
    } catch (error) {
      addTestResult(`❌ 기준 조회 실패: ${error}`);
    }
    setLoading(false);
  };

  // 3. 새 프로젝트 생성 테스트
  const testCreateProject = async () => {
    setLoading(true);
    try {
      const newProjectData = {
        title: `테스트 프로젝트 ${Date.now()}`,
        description: '프론트엔드에서 생성한 테스트 프로젝트',
        objective: '기준 설정 API 완전 연동 테스트',
        evaluation_mode: 'practical' as const,
        status: 'draft' as const,
        workflow_stage: 'creating' as const
      };

      addTestResult('🔍 새 프로젝트 생성 시작...');
      const createdProject = await cleanDataService.createProject(newProjectData);
      
      if (createdProject) {
        addTestResult(`✅ 프로젝트 생성 성공: ${createdProject.title}`);
        setSelectedProject(createdProject);
        // 프로젝트 목록 새로고침
        await testGetProjects();
      } else {
        addTestResult('❌ 프로젝트 생성 실패');
      }
    } catch (error) {
      addTestResult(`❌ 프로젝트 생성 중 오류: ${error}`);
    }
    setLoading(false);
  };

  // 4. 기준 생성 테스트 (메타데이터 방식)
  const testCreateCriteria = async () => {
    if (!selectedProject?.id) {
      addTestResult('❌ 프로젝트가 선택되지 않음');
      return;
    }

    setLoading(true);
    try {
      const newCriteriaData = {
        project_id: selectedProject.id,
        name: `테스트 기준 ${Date.now()}`,
        description: '프론트엔드에서 생성한 테스트 기준',
        position: 1,
        level: 1,
        order: 1
      };

      addTestResult('🔍 새 기준 생성 시작...');
      const createdCriteria = await cleanDataService.createCriteria(newCriteriaData);
      
      if (createdCriteria) {
        addTestResult(`✅ 기준 생성 성공: ${createdCriteria.name}`);
        // 기준 목록 새로고침
        await testGetCriteria();
      } else {
        addTestResult('❌ 기준 생성 실패');
      }
    } catch (error) {
      addTestResult(`❌ 기준 생성 중 오류: ${error}`);
    }
    setLoading(false);
  };

  // 5. 전체 워크플로우 테스트
  const testCompleteWorkflow = async () => {
    setLoading(true);
    try {
      addTestResult('🚀 전체 워크플로우 테스트 시작...');
      
      // 1단계: 프로젝트 생성
      await testCreateProject();
      
      // 2단계: 기준 생성
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      await testCreateCriteria();
      
      // 3단계: 워크플로우 진행
      if (selectedProject?.id) {
        addTestResult('🔄 워크플로우 단계 업데이트...');
        const updatedProject = await cleanDataService.updateProject(selectedProject.id, {
          status: 'active',
          workflow_stage: 'waiting',
          description: selectedProject.description + ' - 기준 설정 완료'
        });
        
        if (updatedProject) {
          addTestResult(`✅ 워크플로우 업데이트 성공: ${updatedProject.workflow_stage}`);
          setSelectedProject(updatedProject);
        }
      }
      
      addTestResult('🎉 전체 워크플로우 테스트 완료!');
    } catch (error) {
      addTestResult(`❌ 워크플로우 테스트 실패: ${error}`);
    }
    setLoading(false);
  };

  // 페이지 로드 시 프로젝트 목록 조회
  useEffect(() => {
    testGetProjects();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 AHP 프로젝트 관리 통합 테스트</h1>
      <p>기준 설정 API 인증 문제 해결 후 프론트엔드-백엔드 완전 연동 테스트</p>

      {/* 테스트 버튼들 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testGetProjects} 
          disabled={loading}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          📋 프로젝트 조회
        </button>
        
        <button 
          onClick={testGetCriteria} 
          disabled={loading || !selectedProject}
          style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          🎯 기준 조회
        </button>
        
        <button 
          onClick={testCreateProject} 
          disabled={loading}
          style={{ padding: '10px 15px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px' }}
        >
          ➕ 프로젝트 생성
        </button>
        
        <button 
          onClick={testCreateCriteria} 
          disabled={loading || !selectedProject}
          style={{ padding: '10px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          🎯 기준 생성
        </button>
        
        <button 
          onClick={testCompleteWorkflow} 
          disabled={loading}
          style={{ padding: '10px 15px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          🚀 전체 워크플로우
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div style={{ padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px', marginBottom: '20px' }}>
          ⏳ 처리 중...
        </div>
      )}

      {/* 선택된 프로젝트 정보 */}
      {selectedProject && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '5px' }}>
          <h3>📋 선택된 프로젝트</h3>
          <p><strong>제목:</strong> {selectedProject.title}</p>
          <p><strong>설명:</strong> {selectedProject.description}</p>
          <p><strong>상태:</strong> {selectedProject.status} / {selectedProject.workflow_stage}</p>
          <p><strong>ID:</strong> {selectedProject.id}</p>
          {selectedProject.settings?.criteria && (
            <p><strong>메타데이터 기준:</strong> {selectedProject.settings.criteria.length}개</p>
          )}
        </div>
      )}

      {/* 프로젝트 목록 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📂 프로젝트 목록 ({projects.length}개)</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {projects.map((project, index) => (
            <div 
              key={project.id || index}
              onClick={() => setSelectedProject(project)}
              style={{ 
                padding: '5px 10px', 
                cursor: 'pointer',
                backgroundColor: selectedProject?.id === project.id ? '#007bff' : '#f8f9fa',
                color: selectedProject?.id === project.id ? 'white' : 'black',
                marginBottom: '5px',
                borderRadius: '3px'
              }}
            >
              <strong>{project.title}</strong> - {project.status} ({project.workflow_stage})
            </div>
          ))}
        </div>
      </div>

      {/* 기준 목록 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🎯 기준 목록 ({criteria.length}개)</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {criteria.map((criterion, index) => (
            <div key={criterion.id || index} style={{ padding: '5px 10px', marginBottom: '5px', backgroundColor: '#f8f9fa' }}>
              <strong>{criterion.name}</strong>
              {criterion.description && <span> - {criterion.description}</span>}
              <small style={{ color: '#666', display: 'block' }}>
                Level: {criterion.level || 'N/A'}, Order: {criterion.order || 'N/A'}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* 테스트 결과 로그 */}
      <div>
        <h3>📊 테스트 결과 로그</h3>
        <div style={{ 
          height: '300px', 
          overflowY: 'auto', 
          border: '1px solid #ccc', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;