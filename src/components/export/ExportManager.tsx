/**
 * ExportManager - 프로젝트 내보내기 (Phase 2c 업데이트)
 * - CSV: 로컬 생성 (즉시, 체크박스 옵션 적용)
 * - Excel/PDF: Django 백엔드 API 연동
 * - 형식별 조건부 데이터 섹션 지원
 */

import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import authService from '../../services/authService';
import { generateCSVFile, downloadFile } from '../../utils/exportGenerator';

type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  includeProgress: boolean;
  includeRanking: boolean;
  includeConsistency: boolean;
  includeCharts: boolean;
}

interface ExportManagerProps {
  projectId: string;
  projectTitle: string;
  onClose?: () => void;
}

const FORMAT_INFO: Record<ExportFormat, { label: string; desc: string; local: boolean }> = {
  csv: {
    label: 'CSV',
    desc: '스프레드시트에서 열 수 있는 범용 형식',
    local: true,
  },
  excel: {
    label: 'Excel (.xlsx)',
    desc: '서식이 포함된 Excel 보고서 (서버 생성)',
    local: false,
  },
  pdf: {
    label: 'PDF',
    desc: '인쇄용 PDF 보고서 (서버 생성)',
    local: false,
  },
};

const ExportManager: React.FC<ExportManagerProps> = ({ projectId, projectTitle, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeProgress: true,
    includeRanking: true,
    includeConsistency: true,
    includeCharts: false,
  });

  // ── CSV 로컬 생성 ──────────────────────────────────────────────────────────

  const handleCSVExport = () => {
    // 기본 프로젝트 데이터로 CSV 생성 (실제 데이터 API 필요 시 확장 가능)
    const now = new Date().toISOString();
    const exportData = {
      id: projectId,
      title: projectTitle,
      description: '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    let csvContent = `프로젝트 내보내기 보고서\n`;
    csvContent += `생성일시,${new Date().toLocaleString('ko-KR')}\n`;
    csvContent += `프로젝트 ID,${projectId}\n`;
    csvContent += `프로젝트명,"${projectTitle}"\n\n`;

    if (options.includeProgress) {
      csvContent += `진행 현황\n`;
      csvContent += `항목,값\n`;
      csvContent += `총 평가자,0\n수락됨,0\n대기중,0\n완료율,0%\n\n`;
    }

    if (options.includeRanking) {
      csvContent += `순위 결과\n`;
      csvContent += `순위,대안명,최종 가중치,일관성 비율\n`;
      csvContent += `(평가 데이터가 없습니다)\n\n`;
    }

    if (options.includeConsistency) {
      csvContent += `일관성 분석\n`;
      csvContent += `평가자,일관성 비율,상태\n`;
      csvContent += `(평가 데이터가 없습니다)\n\n`;
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `${projectTitle.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(blob, filename, 'text/csv');
  };

  // ── 서버 API 내보내기 (Excel / PDF) ───────────────────────────────────────

  const handleServerExport = async () => {
    const endpointFn = options.format === 'excel'
      ? API_ENDPOINTS.EXPORT.EXCEL
      : API_ENDPOINTS.EXPORT.PDF;

    const url = `${API_BASE_URL}${endpointFn(projectId)}`;

    const token = authService.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.detail || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const ext = options.format === 'excel' ? 'xlsx' : 'pdf';
    const filename = `${projectTitle.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().split('T')[0]}.${ext}`;
    downloadFile(blob, filename, blob.type);
  };

  // ── 통합 핸들러 ───────────────────────────────────────────────────────────

  const handleExport = async () => {
    setIsExporting(true);
    setExportError('');

    try {
      if (options.format === 'csv' || FORMAT_INFO[options.format].local) {
        handleCSVExport();
      } else {
        await handleServerExport();
      }
      if (onClose) onClose();
    } catch (error: any) {
      setExportError(error.message || '내보내기에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOpt = (key: keyof Omit<ExportOptions, 'format'>) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">프로젝트 내보내기</h2>
        <p className="text-sm text-gray-500 mb-6">{projectTitle}</p>

        <div className="space-y-5">
          {/* 형식 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내보내기 형식</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(FORMAT_INFO) as [ExportFormat, typeof FORMAT_INFO[ExportFormat]][]).map(([fmt, info]) => (
                <button
                  key={fmt}
                  onClick={() => setOptions(prev => ({ ...prev, format: fmt }))}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    options.format === fmt
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">{info.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{info.desc}</div>
                  {!info.local && (
                    <div className="text-xs text-blue-600 mt-1">🌐 서버 생성</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 포함할 데이터 (CSV일 때만 적용) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              포함할 데이터
              {options.format !== 'csv' && (
                <span className="text-xs text-gray-400 font-normal ml-2">(서버 생성 시 자동 포함)</span>
              )}
            </label>
            <div className="space-y-2">
              {([
                { key: 'includeProgress', label: '진행 현황', desc: '평가자별 완료율' },
                { key: 'includeRanking', label: '순위 결과', desc: '최종 가중치 및 대안 순위' },
                { key: 'includeConsistency', label: '일관성 분석', desc: '평가자별 CR 값' },
                { key: 'includeCharts', label: '차트 포함', desc: 'PDF/Excel만 지원' },
              ] as const).map(({ key, label, desc }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                    key === 'includeCharts' && options.format === 'csv' ? 'opacity-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={() => toggleOpt(key)}
                    disabled={key === 'includeCharts' && options.format === 'csv'}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">{label}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 오류 메시지 */}
          {exportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {exportError}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                내보내는 중...
              </span>
            ) : (
              `${FORMAT_INFO[options.format].label}로 내보내기`
            )}
          </Button>
          {onClose && (
            <Button variant="secondary" onClick={onClose} disabled={isExporting}>
              취소
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          {options.format === 'csv'
            ? 'CSV는 Excel, Google Sheets 등에서 열 수 있습니다.'
            : '서버 생성 방식은 Django 백엔드 연결이 필요합니다.'}
        </p>
      </div>
    </Card>
  );
};

export default ExportManager;
