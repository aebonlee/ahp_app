/**
 * 실제 파일 생성 및 내보내기 유틸리티
 * ExportManager에서 사용할 실제 파일 생성 로직
 */

// Excel functionality temporarily disabled for security

// 내보내기 옵션 인터페이스
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'word' | 'csv';
  includeCriteria?: boolean;
  includeAlternatives?: boolean;
  includeResults?: boolean;
  includeCharts?: boolean;
  fileName?: string;
}

// 프로젝트 내보내기 데이터 인터페이스
export interface ProjectExportData {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  criteria?: Array<{
    id: string;
    name: string;
    description?: string;
    weight?: number;
    level?: number;
  }>;
  alternatives?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  evaluations?: Array<{
    criterionId: string;
    alternativeId: string;
    score: number;
    rank?: number;
  }>;
}

/**
 * Excel 파일 생성 (보안상 이유로 CSV로 대체)
 */
export const generateExcelFile = (data: ProjectExportData, options: ExportOptions): Blob => {
  // Excel functionality temporarily disabled for security
  console.warn('Excel export is temporarily disabled for security reasons. Generating CSV instead.');
  return generateCSVFile(data, options);
};

/**
 * CSV 파일 생성
 */
export const generateCSVFile = (data: ProjectExportData, options: ExportOptions): Blob => {
  let csvContent = '';
  
  // 프로젝트 개요
  csvContent += '프로젝트 정보\n';
  csvContent += `프로젝트명,${data.title}\n`;
  csvContent += `설명,${data.description}\n`;
  csvContent += `상태,${data.status}\n`;
  csvContent += `생성일,${new Date(data.createdAt).toLocaleDateString('ko-KR')}\n`;
  csvContent += `수정일,${new Date(data.updatedAt).toLocaleDateString('ko-KR')}\n`;
  csvContent += '\n';

  // 기준 데이터
  if (options.includeCriteria && data.criteria) {
    csvContent += '평가 기준\n';
    csvContent += 'ID,기준명,설명,가중치,레벨\n';
    data.criteria.forEach(c => {
      csvContent += `${c.id},"${c.name}","${c.description || ''}",${c.weight || 0},${c.level || 1}\n`;
    });
    csvContent += '\n';
  }

  // 대안 데이터
  if (options.includeAlternatives && data.alternatives) {
    csvContent += '대안\n';
    csvContent += 'ID,대안명,설명\n';
    data.alternatives.forEach(a => {
      csvContent += `${a.id},"${a.name}","${a.description || ''}"\n`;
    });
    csvContent += '\n';
  }

  // 평가 결과
  if (options.includeResults && data.evaluations) {
    csvContent += '평가 결과\n';
    csvContent += '기준 ID,대안 ID,점수,순위\n';
    data.evaluations.forEach(e => {
      csvContent += `${e.criterionId},${e.alternativeId},${e.score},${e.rank || 0}\n`;
    });
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * PDF 파일 생성 (기본 구현)
 */
export const generatePDFFile = (data: ProjectExportData, options: ExportOptions): Blob => {
  // PDF 생성 로직 구현 필요
  console.warn('PDF export not yet implemented. Generating CSV instead.');
  return generateCSVFile(data, options);
};

/**
 * Word 파일 생성 (기본 구현)
 */
export const generateWordFile = (data: ProjectExportData, options: ExportOptions): Blob => {
  // Word 생성 로직 구현 필요
  console.warn('Word export not yet implemented. Generating CSV instead.');
  return generateCSVFile(data, options);
};

/**
 * 파일명 생성 헬퍼
 */
export const generateFilename = (projectTitle: string, format: string, includeDate: boolean = true): string => {
  const sanitizedTitle = projectTitle.replace(/[^a-zA-Z0-9가-힣]/g, '_');
  const dateStr = includeDate ? `_${new Date().toISOString().split('T')[0]}` : '';
  return `${sanitizedTitle}${dateStr}.${format}`;
};

/**
 * 파일 다운로드 헬퍼
 */
export const downloadFile = (blob: Blob, fileName: string, mimeType: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * 통합 내보내기 함수
 */
export const exportProject = (data: ProjectExportData, options: ExportOptions): void => {
  let blob: Blob;
  let fileName = options.fileName || `project_${data.id}`;
  let mimeType: string;

  switch (options.format) {
    case 'excel':
      blob = generateExcelFile(data, options);
      fileName += '.csv'; // Excel이 비활성화되어 CSV로 대체
      mimeType = 'text/csv';
      break;
    case 'csv':
      blob = generateCSVFile(data, options);
      fileName += '.csv';
      mimeType = 'text/csv';
      break;
    case 'pdf':
      blob = generatePDFFile(data, options);
      fileName += '.csv'; // PDF 미구현으로 CSV로 대체
      mimeType = 'text/csv';
      break;
    case 'word':
      blob = generateWordFile(data, options);
      fileName += '.csv'; // Word 미구현으로 CSV로 대체
      mimeType = 'text/csv';
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  downloadFile(blob, fileName, mimeType);
};

export default {
  generateExcelFile,
  generateCSVFile,
  generatePDFFile,
  generateWordFile,
  downloadFile,
  generateFilename,
  exportProject
};