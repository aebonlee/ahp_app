/**
 * PSDExportTab - 보고서 내보내기 탭 컴포넌트
 * PersonalServiceDashboard에서 분리됨
 */
import React, { useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import type { UserProject } from '../../types';

interface ProjectDataState {
  criteria: unknown[];
  alternatives: unknown[];
  results: unknown[];
}

interface PSDExportTabProps {
  selectedProjectId: string;
  projects: UserProject[];
  projectData: ProjectDataState | null;
  onTabChange: (tab: string) => void;
  showActionMessage: (type: 'success' | 'error' | 'info', text: string) => void;
}

const PSDExportTab: React.FC<PSDExportTabProps> = ({
  selectedProjectId,
  projects,
  projectData,
  onTabChange,
  showActionMessage,
}) => {
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  const generateCriteriaCSV = useCallback((_project: UserProject | undefined) => {
    interface CriterionRow { id: string; name: string; description?: string; weight?: number; parentId?: string; level?: number }
    const headers = ['ID', '기준명', '설명', '가중치', '상위기준', '계층레벨'];
    const rows = (projectData?.criteria || []) as CriterionRow[];

    let csv = headers.join(',') + '\n';
    rows.forEach((criterion) => {
      csv += [
        criterion.id,
        `"${criterion.name}"`,
        `"${criterion.description || ''}"`,
        criterion.weight || 0,
        criterion.parentId || '',
        criterion.level || 1
      ].join(',') + '\n';
    });

    return csv;
  }, [projectData]);

  const generateAlternativesCSV = useCallback((_project: UserProject | undefined) => {
    interface AlternativeRow { id: string; name: string; description?: string; created_at?: string; status?: string }
    const headers = ['ID', '대안명', '설명', '생성일', '상태'];
    const rows = (projectData?.alternatives || []) as AlternativeRow[];

    let csv = headers.join(',') + '\n';
    rows.forEach((alternative) => {
      csv += [
        alternative.id,
        `"${alternative.name}"`,
        `"${alternative.description || ''}"`,
        alternative.created_at || '',
        alternative.status || 'active'
      ].join(',') + '\n';
    });

    return csv;
  }, [projectData]);

  const generateResultsCSV = useCallback((_project: UserProject | undefined) => {
    const headers = ['대안명', '최종점수', '순위', '가중치점수'];

    let csv = headers.join(',') + '\n';
    csv += '"대안 A",0.456,1,45.6%\n';
    csv += '"대안 B",0.321,2,32.1%\n';
    csv += '"대안 C",0.223,3,22.3%\n';

    return csv;
  }, []);

  const generateExcelData = useCallback((type: string, project: UserProject | undefined) => {
    return {
      projectInfo: {
        title: project?.title,
        description: project?.description,
        created: project?.created_at,
        exportType: type,
        exportDate: new Date().toISOString()
      },
      data: type === 'criteria' ? projectData?.criteria :
            type === 'alternatives' ? projectData?.alternatives :
            { results: 'Sample results data' }
    };
  }, [projectData]);

  const generatePDFData = useCallback((type: string, project: UserProject | undefined) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${project?.title} - ${type} 보고서</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; border-bottom: 2px solid #007bff; }
          .info { background: #f8f9fa; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${project?.title} - ${type} 보고서</h1>
        <div class="info">
          <p><strong>프로젝트:</strong> ${project?.title}</p>
          <p><strong>설명:</strong> ${project?.description}</p>
          <p><strong>생성일:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <h2>데이터</h2>
        <p>여기에 ${type} 관련 상세 데이터가 표시됩니다.</p>
      </body>
      </html>
    `;
  }, []);

  const generatePPTData = useCallback((type: string, project: UserProject | undefined) => {
    return `
${project?.title} - ${type} 프레젠테이션

슬라이드 1: 제목
- 프로젝트: ${project?.title}
- 유형: ${type} 분석
- 날짜: ${new Date().toLocaleDateString()}

슬라이드 2: 개요
- 프로젝트 설명: ${project?.description}
- 분석 목적: AHP 의사결정 분석

슬라이드 3: 주요 결과
- 여기에 ${type} 관련 핵심 결과가 표시됩니다.

슬라이드 4: 결론 및 제안
- 분석 결과를 바탕으로 한 제안사항
    `;
  }, []);

  const generateJSONData = useCallback((type: string, project: UserProject | undefined) => {
    return {
      exportInfo: {
        projectId: selectedProjectId,
        projectTitle: project?.title,
        exportType: type,
        exportDate: new Date().toISOString(),
        version: '1.0'
      },
      projectData: {
        basic: {
          title: project?.title,
          description: project?.description,
          objective: project?.objective,
          method: project?.evaluation_method
        },
        criteria: projectData?.criteria || [],
        alternatives: projectData?.alternatives || [],
        results: type === 'results' ? {
          rankings: [
            { name: '대안 A', score: 0.456, rank: 1 },
            { name: '대안 B', score: 0.321, rank: 2 },
            { name: '대안 C', score: 0.223, rank: 3 }
          ],
          weights: {},
          consistency: 0.08
        } : null
      }
    };
  }, [selectedProjectId, projectData]);

  const handleCSVExport = useCallback(async (type: string, project: UserProject | undefined, timestamp: string) => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'criteria':
        csvContent = generateCriteriaCSV(project);
        filename = `${project?.title || 'project'}_criteria_${timestamp}.csv`;
        break;
      case 'alternatives':
        csvContent = generateAlternativesCSV(project);
        filename = `${project?.title || 'project'}_alternatives_${timestamp}.csv`;
        break;
      case 'results':
        csvContent = generateResultsCSV(project);
        filename = `${project?.title || 'project'}_results_${timestamp}.csv`;
        break;
    }

    downloadFile(csvContent, filename, 'text/csv');
  }, [generateCriteriaCSV, generateAlternativesCSV, generateResultsCSV, downloadFile]);

  const handleExcelExport = useCallback(async (type: string, project: UserProject | undefined, timestamp: string) => {
    const excelData = generateExcelData(type, project);
    const filename = `${project?.title || 'project'}_${type}_${timestamp}.xlsx`;

    downloadFile(JSON.stringify(excelData, null, 2), filename.replace('.xlsx', '.json'), 'application/json');
    showActionMessage('info', 'Excel 형식은 개발 중입니다. JSON 형태로 다운로드됩니다.');
  }, [generateExcelData, downloadFile, showActionMessage]);

  const handlePDFExport = useCallback(async (type: string, project: UserProject | undefined, timestamp: string) => {
    const pdfData = generatePDFData(type, project);
    const filename = `${project?.title || 'project'}_${type}_report_${timestamp}.pdf`;

    downloadFile(pdfData, filename.replace('.pdf', '.html'), 'text/html');
    showActionMessage('info', 'PDF 형식은 개발 중입니다. HTML 형태로 다운로드됩니다.');
  }, [generatePDFData, downloadFile, showActionMessage]);

  const handlePPTExport = useCallback(async (type: string, project: UserProject | undefined, timestamp: string) => {
    const pptData = generatePPTData(type, project);
    const filename = `${project?.title || 'project'}_${type}_presentation_${timestamp}.pptx`;

    downloadFile(pptData, filename.replace('.pptx', '.txt'), 'text/plain');
    showActionMessage('info', 'PowerPoint 형식은 개발 중입니다. 텍스트 형태로 다운로드됩니다.');
  }, [generatePPTData, downloadFile, showActionMessage]);

  const handleJSONExport = useCallback(async (type: string, project: UserProject | undefined, timestamp: string) => {
    const jsonData = generateJSONData(type, project);
    const filename = `${project?.title || 'project'}_${type}_${timestamp}.json`;

    downloadFile(JSON.stringify(jsonData, null, 2), filename, 'application/json');
  }, [generateJSONData, downloadFile]);

  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf' | 'ppt' | 'json', type: 'criteria' | 'alternatives' | 'results') => {
    if (!selectedProjectId || !projectData) {
      showActionMessage('error', '프로젝트를 선택해주세요.');
      return;
    }

    try {
      const project = projects.find(p => p.id === selectedProjectId);
      const timestamp = new Date().toISOString().slice(0, 10);

      switch (format) {
        case 'csv':
          await handleCSVExport(type, project, timestamp);
          break;
        case 'excel':
          await handleExcelExport(type, project, timestamp);
          break;
        case 'pdf':
          await handlePDFExport(type, project, timestamp);
          break;
        case 'ppt':
          await handlePPTExport(type, project, timestamp);
          break;
        case 'json':
          await handleJSONExport(type, project, timestamp);
          break;
      }
    } catch {
      showActionMessage('error', '내보내기 중 오류가 발생했습니다.');
    }
  }, [selectedProjectId, projectData, projects, showActionMessage, handleCSVExport, handleExcelExport, handlePDFExport, handlePPTExport, handleJSONExport]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">보고서 내보내기</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Excel 보고서">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              상세한 데이터와 계산 과정이 포함된 스프레드시트
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">원시 데이터</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">가중치 계산</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">일관성 지수</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">민감도 분석</span>
              </label>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => handleExport('excel', 'results')}
            >
              Excel 다운로드
            </Button>
          </div>
        </Card>

        <Card title="PDF 보고서">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              발표용 전문 보고서 형태
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">표지 및 요약</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">방법론 설명</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결과 차트</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">부록 데이터</span>
              </label>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => handleExport('pdf', 'results')}
            >
              PDF 다운로드
            </Button>
          </div>
        </Card>

        <Card title="PowerPoint 프레젠테이션">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              발표용 슬라이드
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">결과 요약</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="ml-2 text-sm">비교 차트</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="form-checkbox" />
                <span className="ml-2 text-sm">세부 데이터</span>
              </label>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => handleExport('ppt', 'results')}
            >
              PPT 다운로드
            </Button>
          </div>
        </Card>
      </div>

      {/* 추가 내보내기 옵션 */}
      <Card title="개별 데이터 내보내기">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="secondary"
            onClick={() => handleExport('csv', 'criteria')}
            className="w-full"
          >
            📋 평가 기준 (CSV)
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('csv', 'alternatives')}
            className="w-full"
          >
            📝 대안 (CSV)
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('csv', 'results')}
            className="w-full"
          >
            📊 평가 결과 (CSV)
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('json', 'results')}
            className="w-full"
          >
            💾 전체 데이터 (JSON)
          </Button>
        </div>
      </Card>

      {/* 고급 내보내기 옵션 */}
      <Card title="고급 옵션">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">날짜 범위 필터링</span>
            <input type="date" className="border border-gray-300 rounded px-3 py-1 text-sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">평가자별 분리</span>
            <input type="checkbox" className="form-checkbox" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">익명화 처리</span>
            <input type="checkbox" className="form-checkbox" defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(PSDExportTab);
