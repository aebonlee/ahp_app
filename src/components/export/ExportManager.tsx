import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useAPI } from '../../hooks/useAPI';
import {
  generateExcelFile,
  generateCSVFile,
  generatePDFFile,
  generateWordFile,
  downloadFile,
  generateFilename,
  type ProjectExportData
} from '../../utils/exportGenerator';

interface ExportOptions {
  format: 'excel' | 'pdf' | 'word' | 'csv';
  includeCharts?: boolean;
  includeProgress?: boolean;
  includeRanking?: boolean;
  includeConsistency?: boolean;
  includeDetails?: boolean;
  includeSensitivity?: boolean;
  customTitle: string;
  logoUrl?: string;
}

interface ExportData {
  projectInfo: any;
  evaluationProgress: any[];
  rankings: any[];
  consistencyData: any[];
  treeModel: any;
  sensitivityResults?: any[];
}

interface ExportManagerProps {
  projectId: string;
  projectData: any;
  onExportComplete?: (result: { success: boolean; downloadUrl?: string; error?: string }) => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({ projectId, projectData, onExportComplete }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeCharts: true,
    includeProgress: true,
    includeRanking: true,
    includeConsistency: true,
    includeDetails: true,
    includeSensitivity: false,
    customTitle: 'AHP 분석 결과 보고서'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const api = useAPI();

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: '📊', description: '스프레드시트 형태로 내보내기' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: '📄', description: '인쇄 가능한 PDF 보고서' },
    { value: 'word', label: 'Word (.docx)', icon: '📝', description: '편집 가능한 Word 문서' },
    { value: 'csv', label: 'CSV (.csv)', icon: '🗂️', description: '데이터만 CSV 형태로' }
  ];

  const updateExportOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const generatePreview = () => {
    if (!projectData) {
      alert('프로젝트 데이터가 없습니다.');
      return;
    }

    // 미리보기 모달 또는 새 창에서 프리뷰 표시
    const previewData = {
      projectTitle: projectData.title || '제목 없음',
      criteriaCount: projectData.criteria?.length || 0,
      alternativesCount: projectData.alternatives?.length || 0,
      format: exportOptions.format,
      options: exportOptions
    };

    const previewText = `
📊 내보내기 미리보기

프로젝트: ${previewData.projectTitle}
형식: ${formatOptions.find(f => f.value === exportOptions.format)?.label}
기준 수: ${previewData.criteriaCount}개
대안 수: ${previewData.alternativesCount}개

포함 내용:
${exportOptions.includeProgress ? '✅ 평가 진행 상황\n' : ''}
${exportOptions.includeRanking ? '✅ 순위 및 결과\n' : ''}
${exportOptions.includeConsistency ? '✅ 일관성 분석\n' : ''}
${exportOptions.includeDetails ? '✅ 세부 분석 내용\n' : ''}
${exportOptions.includeCharts ? '✅ 차트 및 그래프\n' : ''}
${exportOptions.includeSensitivity ? '✅ 민감도 분석\n' : ''}

이 내용으로 파일을 생성하시겠습니까?
    `;

    if (confirm(previewText.trim())) {
      handleExport();
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(10);

      // 1단계: 데이터 준비
      await new Promise(resolve => setTimeout(resolve, 300));
      setExportProgress(30);

      const exportData: ProjectExportData = {
        id: projectId,
        title: projectData?.title || '제목 없음',
        description: projectData?.description || '',
        status: projectData?.status || 'active',
        createdAt: projectData?.createdAt || new Date().toISOString(),
        updatedAt: projectData?.updatedAt || new Date().toISOString(),
        criteria: projectData?.criteria || [],
        alternatives: projectData?.alternatives || [],
        evaluations: projectData?.evaluations || [],
        results: projectData?.results || {},
        consistency: projectData?.consistency || {}
      };

      // 2단계: 파일 생성
      await new Promise(resolve => setTimeout(resolve, 500));
      setExportProgress(60);

      let fileBlob: Blob;
      let fileExtension: string;

      switch (exportOptions.format) {
        case 'excel':
          fileBlob = generateExcelFile(exportData, exportOptions);
          fileExtension = 'xlsx';
          break;
        case 'csv':
          fileBlob = generateCSVFile(exportData, exportOptions);
          fileExtension = 'csv';
          break;
        case 'pdf':
          fileBlob = generatePDFFile(exportData, exportOptions);
          fileExtension = 'html'; // PDF 변환은 별도 라이브러리 필요
          break;
        case 'word':
          fileBlob = generateWordFile(exportData, exportOptions);
          fileExtension = 'doc';
          break;
        default:
          throw new Error(`지원하지 않는 형식: ${exportOptions.format}`);
      }

      // 3단계: 다운로드
      await new Promise(resolve => setTimeout(resolve, 300));
      setExportProgress(90);

      const filename = generateFilename(projectId, exportData.title, fileExtension);
      downloadFile(fileBlob, filename);

      // 완료
      setExportProgress(100);
      await new Promise(resolve => setTimeout(resolve, 200));

      onExportComplete?.({ 
        success: true, 
        downloadUrl: filename
      });

    } catch (error) {
      console.error('Export error:', error);
      onExportComplete?.({ 
        success: false, 
        error: error instanceof Error ? error.message : '내보내기 실패'
      });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Export format selection */}
      <Card title="내보내기 형식 선택">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {formatOptions.map(option => (
            <div
              key={option.value}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                exportOptions.format === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateExportOption('format', option.value)}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
              </div>
              <p className="text-sm text-gray-600">{option.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Export options */}
      <Card title="내보내기 옵션">
        <div className="space-y-4">
          {/* Title setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              보고서 제목
            </label>
            <input
              type="text"
              value={exportOptions.customTitle}
              onChange={(e) => updateExportOption('customTitle', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="보고서 제목을 입력하세요"
            />
          </div>

          {/* Content selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              포함할 내용
            </label>
            <div className="space-y-2">
              {[
                { key: 'includeProgress', label: '평가 진행 상황' },
                { key: 'includeRanking', label: '순위 및 결과' },
                { key: 'includeConsistency', label: '일관성 분석' },
                { key: 'includeDetails', label: '세부 분석 내용' },
                { key: 'includeCharts', label: '차트 및 그래프' },
                { key: 'includeSensitivity', label: '민감도 분석' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Boolean(exportOptions[key as keyof ExportOptions])}
                    onChange={(e) => updateExportOption(key as keyof ExportOptions, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Logo URL (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회사 로고 URL (선택사항)
            </label>
            <input
              type="url"
              value={exportOptions.logoUrl || ''}
              onChange={(e) => updateExportOption('logoUrl', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={generatePreview}
          variant="secondary"
          disabled={isExporting || !projectData}
        >
          {!projectData ? '데이터 없음' : '미리보기'}
        </Button>

        <Button
          onClick={handleExport}
          variant="primary"
          disabled={isExporting || !projectData || !exportOptions.customTitle.trim()}
        >
          {isExporting ? 
            `내보내는 중... (${exportProgress}%)` : 
            !projectData ? '데이터 필요' :
            !exportOptions.customTitle.trim() ? '제목 입력 필요' :
            '내보내기'
          }
        </Button>
        
        {/* 빠른 내보내기 버튼들 */}
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => { updateExportOption('format', 'excel'); setTimeout(handleExport, 100); }}
            disabled={isExporting || !projectData}
            className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Excel로 빠른 내보내기"
          >
            📊 Excel
          </button>
          <button
            onClick={() => { updateExportOption('format', 'csv'); setTimeout(handleExport, 100); }}
            disabled={isExporting || !projectData}
            className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="CSV로 빠른 내보내기"
          >
            🗂️ CSV
          </button>
        </div>
      </div>

      {/* Progress display */}
      {isExporting && (
        <Card title="내보내기 진행률">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {exportProgress < 30 ? '데이터 준비 중...' :
                 exportProgress < 60 ? '파일 생성 중...' :
                 exportProgress < 90 ? '다운로드 준비 중...' : '완료!'}
              </span>
              <span className="font-bold text-blue-600">{exportProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 text-center">
              파일 형식: {formatOptions.find(f => f.value === exportOptions.format)?.label}
            </div>
          </div>
        </Card>
      )}

      {/* Help text */}
      <Card title="내보내기 안내사항">
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Excel:</strong> 데이터 분석 및 추가 가공에 적합합니다.</p>
          <p>• <strong>PDF:</strong> 인쇄 및 공유용 최종 보고서로 적합합니다.</p>
          <p>• <strong>Word:</strong> 보고서 편집 및 추가 작성에 적합합니다.</p>
          <p>• <strong>CSV:</strong> 다른 시스템으로 데이터 이전 시 사용합니다.</p>
          <p className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <strong>참고:</strong> 내보낸 파일은 개인 디바이스에 저장되며, 
            서버에는 저장되지 않습니다. 중요한 자료는 안전한 곳에 보관하세요.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ExportManager;