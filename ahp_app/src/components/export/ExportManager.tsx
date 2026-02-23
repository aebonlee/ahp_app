import React, { useState, useEffect, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { criteriaApi, alternativeApi, evaluationApi } from '../../services/api';

interface ExportOptions {
  format: 'csv';
  includeProgress?: boolean;
  includeRanking?: boolean;
  includeConsistency?: boolean;
}

interface ExportManagerProps {
  projectId: string;
  projectTitle: string;
  onClose?: () => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({ projectId, projectTitle, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);
  const actionMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    if (actionMessageTimerRef.current) clearTimeout(actionMessageTimerRef.current);
    setActionMessage({type, text});
    actionMessageTimerRef.current = setTimeout(() => setActionMessage(null), 3000);
  };

  useEffect(() => {
    return () => { if (actionMessageTimerRef.current) clearTimeout(actionMessageTimerRef.current); };
  }, []);

  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeProgress: true,
    includeRanking: true,
    includeConsistency: true,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const rows: string[] = [
        '## 프로젝트 정보',
        `프로젝트 ID,${projectId}`,
        `프로젝트 제목,"${projectTitle}"`,
        `내보내기 날짜,${new Date().toLocaleDateString('ko-KR')}`,
        '',
      ];

      // 평가 기준 fetch
      const criteriaResp = await criteriaApi.getCriteria(projectId);
      const criteria = criteriaResp.success && criteriaResp.data ? criteriaResp.data : [];
      if (criteria.length > 0) {
        rows.push('## 평가 기준');
        rows.push('기준명,설명,가중치,수준');
        criteria.forEach(c => {
          rows.push(`"${c.name}","${c.description || ''}",${c.weight ?? ''},${c.level ?? 0}`);
        });
        rows.push('');
      }

      // 대안 fetch
      const altResp = await alternativeApi.getAlternatives(projectId);
      const alternatives = altResp.success && altResp.data ? altResp.data : [];
      if (alternatives.length > 0) {
        rows.push('## 대안');
        rows.push('대안명,설명,비용');
        alternatives.forEach(a => {
          rows.push(`"${a.name}","${a.description || ''}",${a.cost ?? ''}`);
        });
        rows.push('');
      }

      // 쌍대비교 데이터 fetch (옵션 선택 시)
      if (options.includeConsistency) {
        const compResp = await evaluationApi.getPairwiseComparisons(projectId);
        const comparisons = compResp.success && compResp.data ? compResp.data : [];
        if (comparisons.length > 0) {
          rows.push('## 쌍대비교 데이터');
          rows.push('비교유형,항목A ID,항목B ID,비교값,일관성 비율');
          comparisons.forEach(c => {
            rows.push(`${c.comparison_type},${c.element_a_id},${c.element_b_id},${c.value},${c.consistency_ratio ?? ''}`);
          });
          rows.push('');
        }
      }

      // BOM 포함 UTF-8 CSV 생성 (한글 Excel 호환)
      const csvContent = rows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectTitle}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showActionMessage('success', '내보내기가 완료되었습니다.');
      if (onClose) onClose();
    } catch (error) {
      showActionMessage('error', '내보내기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}
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
              <option value="csv">CSV (한글 Excel 호환)</option>
            </select>
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
                평가 기준 및 대안
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
                쌍대비교 데이터 및 일관성 분석
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
