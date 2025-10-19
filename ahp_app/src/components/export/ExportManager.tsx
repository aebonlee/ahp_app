import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface ExportOptions {
  format: 'csv';
  includeCharts?: boolean;
  includeProgress?: boolean;
  includeRanking?: boolean;
  includeConsistency?: boolean;
}

interface ProjectExportData {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ExportManagerProps {
  projectId: string;
  projectTitle: string;
  onClose?: () => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({ projectId, projectTitle, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeCharts: true,
    includeProgress: true,
    includeRanking: true,
    includeConsistency: true
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simple CSV export
      const csvContent = [
        '프로젝트 정보',
        `프로젝트 ID,${projectId}`,
        `프로젝트 제목,${projectTitle}`,
        `내보내기 날짜,${new Date().toLocaleDateString('ko-KR')}`
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle}_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      if (onClose) onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">프로젝트 내보내기</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              내보내기 형식
            </label>
            <select
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value as 'csv' })}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled
            >
              <option value="csv">CSV (현재 지원)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              보안상 이유로 Excel 내보내기는 임시로 비활성화되었습니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              포함할 데이터
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeProgress}
                  onChange={(e) => setOptions({ ...options, includeProgress: e.target.checked })}
                  className="mr-2"
                />
                진행 상황
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeRanking}
                  onChange={(e) => setOptions({ ...options, includeRanking: e.target.checked })}
                  className="mr-2"
                />
                순위 결과
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeConsistency}
                  onChange={(e) => setOptions({ ...options, includeConsistency: e.target.checked })}
                  className="mr-2"
                />
                일관성 분석
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? '내보내는 중...' : '내보내기'}
          </Button>
          {onClose && (
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isExporting}
            >
              취소
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ExportManager;