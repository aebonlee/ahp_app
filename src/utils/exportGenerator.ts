/**
 * 실제 파일 생성 및 내보내기 유틸리티
 * ExportManager에서 사용할 실제 파일 생성 로직
 */

import * as XLSX from 'xlsx';

// 내보내기 옵션 인터페이스
export interface ExportOptions {
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

// 프로젝트 데이터 인터페이스
export interface ProjectExportData {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  criteria: any[];
  alternatives: any[];
  evaluations: any[];
  results: any;
  consistency: any;
}

/**
 * Excel 파일 생성
 */
export const generateExcelFile = (data: ProjectExportData, options: ExportOptions): Blob => {
  const workbook = XLSX.utils.book_new();

  // 1. 프로젝트 개요 시트
  const overviewData = [
    ['프로젝트명', data.title],
    ['설명', data.description],
    ['상태', data.status],
    ['생성일', new Date(data.createdAt).toLocaleDateString('ko-KR')],
    ['수정일', new Date(data.updatedAt).toLocaleDateString('ko-KR')],
    ['', ''],
    ['기준 개수', data.criteria?.length || 0],
    ['대안 개수', data.alternatives?.length || 0],
    ['평가 완료율', `${Math.round(((data.evaluations?.length || 0) / Math.max(1, data.criteria?.length || 1)) * 100)}%`]
  ];
  
  const overviewWS = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewWS, '프로젝트 개요');

  // 2. 기준 목록 시트 (includeDetails가 true일 때)
  if (options.includeDetails && data.criteria?.length > 0) {
    const criteriaData = [
      ['ID', '기준명', '설명', '가중치', '부모 기준'],
      ...data.criteria.map(criterion => [
        criterion.id || '',
        criterion.name || '',
        criterion.description || '',
        criterion.weight || 0,
        criterion.parent_name || '최상위'
      ])
    ];
    
    const criteriaWS = XLSX.utils.aoa_to_sheet(criteriaData);
    XLSX.utils.book_append_sheet(workbook, criteriaWS, '평가 기준');
  }

  // 3. 대안 목록 시트
  if (data.alternatives?.length > 0) {
    const alternativesData = [
      ['ID', '대안명', '설명', '종합 점수'],
      ...data.alternatives.map(alternative => [
        alternative.id || '',
        alternative.name || '',
        alternative.description || '',
        alternative.total_score || 0
      ])
    ];
    
    const alternativesWS = XLSX.utils.aoa_to_sheet(alternativesData);
    XLSX.utils.book_append_sheet(workbook, alternativesWS, '대안 목록');
  }

  // 4. 순위 결과 시트 (includeRanking이 true일 때)
  if (options.includeRanking && data.results) {
    const rankingData = [
      ['순위', '대안명', '종합 점수', '정규화 점수'],
      ...(data.results.ranking || []).map((item: any, index: number) => [
        index + 1,
        item.name || '',
        item.score || 0,
        item.normalized_score || 0
      ])
    ];
    
    const rankingWS = XLSX.utils.aoa_to_sheet(rankingData);
    XLSX.utils.book_append_sheet(workbook, rankingWS, '최종 순위');
  }

  // 5. 일관성 분석 시트 (includeConsistency가 true일 때)
  if (options.includeConsistency && data.consistency) {
    const consistencyData = [
      ['기준', '일관성 비율 (CR)', '일관성 지수 (CI)', '상태'],
      ...(data.consistency.details || []).map((item: any) => [
        item.criterion_name || '',
        item.cr || 0,
        item.ci || 0,
        item.cr < 0.1 ? '양호' : '개선 필요'
      ])
    ];
    
    const consistencyWS = XLSX.utils.aoa_to_sheet(consistencyData);
    XLSX.utils.book_append_sheet(workbook, consistencyWS, '일관성 분석');
  }

  // 6. 평가 진행률 시트 (includeProgress가 true일 때)
  if (options.includeProgress && data.evaluations?.length > 0) {
    const progressData = [
      ['평가자', '완료 기준 수', '전체 기준 수', '진행률'],
      ...getEvaluationProgress(data.evaluations, data.criteria?.length || 0)
    ];
    
    const progressWS = XLSX.utils.aoa_to_sheet(progressData);
    XLSX.utils.book_append_sheet(workbook, progressWS, '평가 진행률');
  }

  // Excel 파일 생성
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * CSV 파일 생성
 */
export const generateCSVFile = (data: ProjectExportData, options: ExportOptions): Blob => {
  let csvContent = '';
  
  // 기본 프로젝트 정보
  csvContent += `프로젝트명,${data.title}\n`;
  csvContent += `설명,${data.description}\n`;
  csvContent += `상태,${data.status}\n`;
  csvContent += `생성일,${new Date(data.createdAt).toLocaleDateString('ko-KR')}\n\n`;

  // 순위 결과
  if (options.includeRanking && data.results?.ranking) {
    csvContent += '순위,대안명,종합점수\n';
    data.results.ranking.forEach((item: any, index: number) => {
      csvContent += `${index + 1},${item.name},${item.score}\n`;
    });
    csvContent += '\n';
  }

  // 기준 정보
  if (options.includeDetails && data.criteria?.length > 0) {
    csvContent += 'ID,기준명,가중치\n';
    data.criteria.forEach(criterion => {
      csvContent += `${criterion.id},${criterion.name},${criterion.weight || 0}\n`;
    });
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * PDF 파일 생성 (HTML 기반)
 */
export const generatePDFFile = (data: ProjectExportData, options: ExportOptions): Blob => {
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${options.customTitle}</title>
      <style>
        body { font-family: 'Malgun Gothic', Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; color: #333; }
        .section { margin: 20px 0; }
        .section h2 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .ranking { background-color: #fef3c7; }
        .consistency-good { color: #059669; }
        .consistency-bad { color: #dc2626; }
        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        ${options.logoUrl ? `<img src="${options.logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;">` : ''}
        <div class="title">${options.customTitle}</div>
        <div>생성일: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}</div>
      </div>
  `;

  // 프로젝트 개요
  htmlContent += `
    <div class="section">
      <h2>📊 프로젝트 개요</h2>
      <table>
        <tr><th>프로젝트명</th><td>${data.title}</td></tr>
        <tr><th>설명</th><td>${data.description}</td></tr>
        <tr><th>상태</th><td>${data.status}</td></tr>
        <tr><th>생성일</th><td>${new Date(data.createdAt).toLocaleDateString('ko-KR')}</td></tr>
        <tr><th>기준 개수</th><td>${data.criteria?.length || 0}개</td></tr>
        <tr><th>대안 개수</th><td>${data.alternatives?.length || 0}개</td></tr>
      </table>
    </div>
  `;

  // 최종 순위
  if (options.includeRanking && data.results?.ranking) {
    htmlContent += `
      <div class="section">
        <h2>🏆 최종 순위</h2>
        <table>
          <thead>
            <tr><th>순위</th><th>대안명</th><th>종합 점수</th></tr>
          </thead>
          <tbody>
    `;
    
    data.results.ranking.forEach((item: any, index: number) => {
      const rowClass = index === 0 ? 'ranking' : '';
      htmlContent += `<tr class="${rowClass}"><td>${index + 1}</td><td>${item.name}</td><td>${(item.score * 100).toFixed(2)}%</td></tr>`;
    });
    
    htmlContent += `</tbody></table></div>`;
  }

  // 일관성 분석
  if (options.includeConsistency && data.consistency) {
    htmlContent += `
      <div class="section">
        <h2>📈 일관성 분석</h2>
        <table>
          <thead>
            <tr><th>기준</th><th>일관성 비율 (CR)</th><th>상태</th></tr>
          </thead>
          <tbody>
    `;
    
    (data.consistency.details || []).forEach((item: any) => {
      const statusClass = item.cr < 0.1 ? 'consistency-good' : 'consistency-bad';
      const status = item.cr < 0.1 ? '✅ 양호' : '⚠️ 개선 필요';
      htmlContent += `<tr><td>${item.criterion_name}</td><td>${(item.cr * 100).toFixed(2)}%</td><td class="${statusClass}">${status}</td></tr>`;
    });
    
    htmlContent += `</tbody></table></div>`;
  }

  // 상세 기준 정보
  if (options.includeDetails && data.criteria?.length > 0) {
    htmlContent += `
      <div class="section">
        <h2>📋 평가 기준 상세</h2>
        <table>
          <thead>
            <tr><th>기준명</th><th>설명</th><th>가중치</th></tr>
          </thead>
          <tbody>
    `;
    
    data.criteria.forEach(criterion => {
      htmlContent += `<tr><td>${criterion.name}</td><td>${criterion.description || '-'}</td><td>${((criterion.weight || 0) * 100).toFixed(2)}%</td></tr>`;
    });
    
    htmlContent += `</tbody></table></div>`;
  }

  htmlContent += `
      <div class="footer">
        <p>본 보고서는 AHP (Analytic Hierarchy Process) 분석 결과를 포함합니다.</p>
        <p>AHP Research Platform에서 생성됨</p>
      </div>
    </body>
    </html>
  `;

  return new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
};

/**
 * Word 파일 생성 (HTML 기반 - Word에서 열 수 있는 형태)
 */
export const generateWordFile = (data: ProjectExportData, options: ExportOptions): Blob => {
  // Word에서 읽을 수 있는 HTML 형태로 생성
  const htmlContent = generatePDFFile(data, options);
  return new Blob([htmlContent], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
};

/**
 * 평가 진행률 계산
 */
const getEvaluationProgress = (evaluations: any[], totalCriteria: number) => {
  const evaluatorProgress: { [key: string]: number } = {};
  
  evaluations.forEach(evaluation => {
    const evaluatorId = evaluation.evaluator_id || 'unknown';
    evaluatorProgress[evaluatorId] = (evaluatorProgress[evaluatorId] || 0) + 1;
  });

  return Object.entries(evaluatorProgress).map(([evaluatorId, completed]) => [
    evaluatorId,
    completed,
    totalCriteria,
    `${Math.round((completed / totalCriteria) * 100)}%`
  ]);
};

/**
 * 파일 다운로드 트리거
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 파일명 생성
 */
export const generateFilename = (projectId: string, projectTitle: string, format: string): string => {
  const sanitizedTitle = projectTitle.replace(/[^a-zA-Z0-9가-힣\s]/g, '').substring(0, 30);
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  return `AHP_${sanitizedTitle}_${projectId}_${timestamp}.${format}`;
};