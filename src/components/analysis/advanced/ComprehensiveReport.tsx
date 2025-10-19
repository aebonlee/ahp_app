import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import api from '../../../services/api';

interface ComprehensiveReportProps {
  projectId: number;
}

const ComprehensiveReport: React.FC<ComprehensiveReportProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analysis/advanced/${projectId}/comprehensive_report/`);
      setReport(response.data);
    } catch (error) {
      console.error('종합 보고서 생성 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [projectId]);

  const exportPDF = () => {
    // PDF 내보내기 로직 (추후 구현)
    alert('PDF 내보내기 기능은 준비 중입니다.');
  };

  const exportExcel = () => {
    // Excel 내보내기 로직 (추후 구현)
    alert('Excel 내보내기 기능은 준비 중입니다.');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">보고서를 생성할 수 없습니다.</p>
          <button onClick={generateReport} className="mt-4 btn btn-primary">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">종합 분석 보고서</h2>
            <p className="text-sm text-gray-500 mt-1">
              {report.project_title} - {new Date(report.generated_at).toLocaleString('ko-KR')}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportPDF} className="btn btn-secondary flex items-center gap-2">
              <ArrowDownTrayIcon className="h-5 w-5" />
              PDF
            </button>
            <button onClick={exportExcel} className="btn btn-secondary flex items-center gap-2">
              <ArrowDownTrayIcon className="h-5 w-5" />
              Excel
            </button>
            <button onClick={() => window.print()} className="btn btn-ghost">
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Summary */}
        {report.summary && (
          <div className="space-y-4">
            {/* Key Findings */}
            {report.summary.key_findings && report.summary.key_findings.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">주요 발견사항</h3>
                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                  {report.summary.key_findings.map((finding: string, index: number) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {report.summary.recommendations && report.summary.recommendations.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">권장사항</h3>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  {report.summary.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Assessment */}
            {report.summary.risk_assessment && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-semibold text-red-900 mb-2">위험 평가</h3>
                {report.summary.risk_assessment.high && report.summary.risk_assessment.high.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-red-700">높음:</span>
                    <ul className="list-disc list-inside text-sm text-red-700 ml-4">
                      {report.summary.risk_assessment.high.map((risk: string, index: number) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.summary.risk_assessment.medium && report.summary.risk_assessment.medium.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-orange-700">중간:</span>
                    <ul className="list-disc list-inside text-sm text-orange-700 ml-4">
                      {report.summary.risk_assessment.medium.map((risk: string, index: number) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Confidence Level */}
            <div className="p-4 bg-gradient-to-r from-primary/5 to-tertiary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">전체 신뢰도</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-tertiary"
                      style={{ width: `${(report.summary.confidence_level || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {((report.summary.confidence_level || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Results Sections */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="text-lg font-semibold mb-4">상세 분석 결과</h3>
        
        <div className="space-y-4">
          {/* Sensitivity Analysis Summary */}
          {report.detailed_results?.sensitivity && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">민감도 분석</h4>
              <p className="text-sm text-gray-600">
                분석된 기준 수: {report.detailed_results.sensitivity.length}개
              </p>
            </div>
          )}

          {/* Group Consensus Summary */}
          {report.detailed_results?.group_consensus && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">그룹 합의 분석</h4>
              <p className="text-sm text-gray-600">
                합의 수준: {(report.detailed_results.group_consensus.consensus_level * 100).toFixed(1)}%
              </p>
            </div>
          )}

          {/* Monte Carlo Summary */}
          {report.detailed_results?.monte_carlo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">몬테카를로 시뮬레이션</h4>
              <p className="text-sm text-gray-600">
                전체 안정성: {(report.detailed_results.monte_carlo.overall_stability * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveReport;