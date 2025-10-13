import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface ExportOptions {
  format: 'excel' | 'pdf' | 'word' | 'csv' | 'json';
  includeCharts: boolean;
  includeProgress: boolean;
  includeRanking: boolean;
  includeConsistency: boolean;
  includeDetails: boolean;
  includeSensitivity: boolean;
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

const ExportManager: React.FC<ExportManagerProps> = ({ 
  projectId, 
  projectData, 
  onExportComplete 
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeCharts: true,
    includeProgress: true,
    includeRanking: true,
    includeConsistency: true,
    includeDetails: true,
    includeSensitivity: false,
    customTitle: 'AHP 분석 결과 보고서',
    logoUrl: ''
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const formatOptions = [
    { value: 'excel', label: 'Excel (.json)', icon: '📊', description: '스프레드시트 형태로 데이터 내보내기 (보안상 JSON 형태)' },
    { value: 'pdf', label: 'PDF (.pdf)', icon: '📄', description: '인쇄 가능한 PDF 보고서' },
    { value: 'word', label: 'Word (.docx)', icon: '📝', description: '편집 가능한 Word 문서' },
    { value: 'csv', label: 'CSV (.csv)', icon: '🗂️', description: '데이터만 CSV 형태로' },
    { value: 'json', label: 'JSON (.json)', icon: '🔧', description: '구조화된 데이터 형태' }
  ];

  const updateExportOption = <K extends keyof ExportOptions>(
    key: K, 
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const generatePreview = () => {
    setPreviewMode(true);
    // 미리보기 로직 구현
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // 진행률 업데이트 시뮬레이션
      const progressSteps = [
        { step: 1, message: '데이터 수집 중...', progress: 20 },
        { step: 2, message: '차트 생성 중...', progress: 40 },
        { step: 3, message: '문서 생성 중...', progress: 60 },
        { step: 4, message: '포맷 변환 중...', progress: 80 },
        { step: 5, message: '파일 생성 완료', progress: 100 }
      ];

      for (const { message, progress } of progressSteps) {
        setExportProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // 실제 내보내기 로직 구현
      const exportData = prepareExportData();
      const result = await performExport(exportData);

      onExportComplete?.(result);

    } catch (error) {
      console.error('Export failed:', error);
      onExportComplete?.({ 
        success: false, 
        error: error instanceof Error ? error.message : '내보내기 실패' 
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const prepareExportData = (): ExportData => {
    // 실제로는 props에서 받은 데이터를 가공
    return {
      projectInfo: {
        id: projectId,
        title: exportOptions.customTitle,
        generatedAt: new Date().toISOString(),
        format: exportOptions.format
      },
      evaluationProgress: [],
      rankings: [],
      consistencyData: [],
      treeModel: {},
      sensitivityResults: exportOptions.includeSensitivity ? [] : undefined
    };
  };

  const performExport = async (data: ExportData) => {
    // 실제 내보내기 API 호출
    switch (exportOptions.format) {
      case 'excel':
        return await exportToExcel(data);
      case 'pdf':
        return await exportToPDF(data);
      case 'word':
        return await exportToWord(data);
      case 'csv':
        return await exportToCSV(data);
      case 'json':
        return await exportToJSON(data);
      default:
        throw new Error('지원하지 않는 형식입니다.');
    }
  };

  const exportToExcel = async (data: ExportData) => {
    // Excel 내보내기 로직
    console.log('Exporting to Excel:', data);
    
    // 가상의 Excel 생성 로직
    const blob = new Blob(['Excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    // 다운로드 트리거
    const a = document.createElement('a');
    a.href = url;
    a.download = `AHP_Analysis_${projectId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, downloadUrl: url };
  };

  const exportToPDF = async (data: ExportData) => {
    // PDF 내보내기 로직
    console.log('Exporting to PDF:', data);
    
    // 인쇄 기능으로 PDF 생성
    if (typeof window !== 'undefined') {
      window.print();
    }

    return { success: true };
  };

  const exportToWord = async (data: ExportData) => {
    // Word 내보내기 로직
    console.log('Exporting to Word:', data);
    
    // HTML을 Word 형식으로 변환
    const htmlContent = generateWordHTML(data);
    const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `AHP_Analysis_${projectId}_${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, downloadUrl: url };
  };

  const exportToCSV = async (data: ExportData) => {
    // CSV 내보내기 로직
    console.log('Exporting to CSV:', data);
    
    const csvContent = generateCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `AHP_Analysis_${projectId}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, downloadUrl: url };
  };

  const exportToJSON = async (data: ExportData) => {
    // JSON 내보내기 로직
    console.log('Exporting to JSON:', data);
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `AHP_Analysis_${projectId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, downloadUrl: url };
  };

  const generateWordHTML = (data: ExportData) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.projectInfo.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
          h2 { color: #1f2937; margin-top: 30px; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>${data.projectInfo.title}</h1>
        <p>생성일: ${new Date(data.projectInfo.generatedAt).toLocaleString('ko-KR')}</p>
        <p>이 문서는 AHP for Paper 시스템에서 자동 생성되었습니다.</p>
        <!-- 여기에 실제 데이터가 들어갑니다 -->
      </body>
      </html>
    `;
  };

  const generateCSV = (data: ExportData) => {
    let csv = '구분,이름,값,순위\\n';
    
    // 예시 데이터 추가
    csv += '기준,개발 프로세스 효율화,0.35,1\\n';
    csv += '기준,코딩 실무 품질 적합화,0.40,2\\n';
    csv += '기준,개발 프로세스 자동화,0.25,3\\n';
    csv += '대안,Claude Code,0.325,1\\n';
    csv += '대안,GitHub Copilot,0.285,2\\n';
    csv += '대안,Cursor AI,0.185,3\\n';
    
    return csv;
  };

  return (
    <div className="w-full space-y-6">
      {/* 내보내기 형식 선택 */}
      <div className="w-full">
        <Card title="내보내기 형식 선택">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formatOptions.map((option) => (
            <div
              key={option.value}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                exportOptions.format === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateExportOption('format', option.value as any)}
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
      </div>

      {/* 내보내기 옵션 */}
      <div className="w-full">
        <Card title="내보내기 옵션">
        <div className="space-y-4">
          {/* 제목 설정 */}
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

          {/* 포함할 내용 선택 */}
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
                { key: 'includeSensitivity', label: '민감도 분석 (선택)' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions[key as keyof ExportOptions] as boolean}
                    onChange={(e) => updateExportOption(key as keyof ExportOptions, e.target.checked as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 로고 URL (선택사항) */}
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
      </div>

      {/* 액션 버튼들 */}
      <div className="w-full flex flex-wrap gap-4">
        <Button
          onClick={generatePreview}
          variant="secondary"
          disabled={isExporting}
        >
          미리보기
        </Button>

        <Button
          onClick={handleExport}
          variant="primary"
          disabled={isExporting}
          className="min-w-32"
        >
          {isExporting ? '내보내는 중...' : '내보내기'}
        </Button>

        {exportOptions.format === 'pdf' && (
          <Button
            onClick={() => window.print()}
            variant="secondary"
          >
            화면 인쇄
          </Button>
        )}
      </div>

      {/* 진행률 표시 */}
      {isExporting && (
        <Card title="내보내기 진행률">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>진행률</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
          </div>
        </Card>
      )}

      {/* 안내사항 */}
      <Card title="내보내기 안내사항">
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Excel:</strong> 데이터 분석 및 추가 가공에 적합합니다.</p>
          <p>• <strong>PDF:</strong> 인쇄 및 공유용 최종 보고서로 적합합니다.</p>
          <p>• <strong>Word:</strong> 보고서 편집 및 추가 작성에 적합합니다.</p>
          <p>• <strong>CSV:</strong> 다른 시스템으로 데이터 이전 시 사용합니다.</p>
          <p>• <strong>JSON:</strong> 개발자를 위한 구조화된 데이터 형태입니다.</p>
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