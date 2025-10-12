/**
 * ExportManager 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportManager from '../components/export/ExportManager';

// Mock 데이터
const mockProjectData = {
  id: 'test-project-1',
  title: '테스트 프로젝트',
  description: '테스트용 AHP 프로젝트입니다',
  status: 'active',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  criteria: [
    { id: '1', name: '비용', description: '비용 효율성', weight: 0.4 },
    { id: '2', name: '품질', description: '제품 품질', weight: 0.6 }
  ],
  alternatives: [
    { id: '1', name: '대안 A', description: '첫 번째 대안', total_score: 0.7 },
    { id: '2', name: '대안 B', description: '두 번째 대안', total_score: 0.3 }
  ],
  evaluations: [
    { id: '1', evaluator_id: 'eval1', criterion_id: '1', completed: true },
    { id: '2', evaluator_id: 'eval1', criterion_id: '2', completed: true }
  ],
  results: {
    ranking: [
      { name: '대안 A', score: 0.7, normalized_score: 0.7 },
      { name: '대안 B', score: 0.3, normalized_score: 0.3 }
    ]
  },
  consistency: {
    details: [
      { criterion_name: '비용', cr: 0.05, ci: 0.03 },
      { criterion_name: '품질', cr: 0.08, ci: 0.05 }
    ]
  }
};

// Mock useAPI hook
jest.mock('../../hooks/useAPI', () => ({
  useAPI: () => ({
    post: jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) })
  })
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock XLSX library
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({})),
    aoa_to_sheet: jest.fn(() => ({})),
    book_append_sheet: jest.fn()
  },
  write: jest.fn(() => new ArrayBuffer(8))
}));

describe('ExportManager 컴포넌트', () => {
  const defaultProps = {
    projectId: 'test-project-1',
    projectData: mockProjectData,
    onExportComplete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('컴포넌트가 정상적으로 렌더링된다', () => {
    render(<ExportManager {...defaultProps} />);
    
    expect(screen.getByText('내보내기 형식 선택')).toBeInTheDocument();
    expect(screen.getByText('내보내기 옵션')).toBeInTheDocument();
    expect(screen.getByText('미리보기')).toBeInTheDocument();
    expect(screen.getByText('내보내기')).toBeInTheDocument();
  });

  test('모든 파일 형식 옵션이 표시된다', () => {
    render(<ExportManager {...defaultProps} />);
    
    expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByText('PDF (.pdf)')).toBeInTheDocument();
    expect(screen.getByText('Word (.docx)')).toBeInTheDocument();
    expect(screen.getByText('CSV (.csv)')).toBeInTheDocument();
  });

  test('파일 형식을 선택할 수 있다', () => {
    render(<ExportManager {...defaultProps} />);
    
    const pdfOption = screen.getByText('PDF (.pdf)').closest('div');
    fireEvent.click(pdfOption!);
    
    expect(pdfOption).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  test('내보내기 옵션을 설정할 수 있다', () => {
    render(<ExportManager {...defaultProps} />);
    
    // 제목 변경
    const titleInput = screen.getByDisplayValue('AHP 분석 결과 보고서');
    fireEvent.change(titleInput, { target: { value: '새로운 보고서 제목' } });
    expect(titleInput).toHaveValue('새로운 보고서 제목');
    
    // 체크박스 옵션 변경
    const progressCheckbox = screen.getByRole('checkbox', { name: /평가 진행 상황/ });
    expect(progressCheckbox).toBeChecked(); // 기본값은 체크됨
    
    fireEvent.click(progressCheckbox);
    expect(progressCheckbox).not.toBeChecked();
  });

  test('프로젝트 데이터가 없으면 버튼이 비활성화된다', () => {
    render(<ExportManager {...defaultProps} projectData={null} />);
    
    const previewButton = screen.getByText('데이터 없음');
    const exportButton = screen.getByText('데이터 필요');
    
    expect(previewButton).toBeDisabled();
    expect(exportButton).toBeDisabled();
  });

  test('제목이 비어있으면 내보내기 버튼이 비활성화된다', () => {
    render(<ExportManager {...defaultProps} />);
    
    const titleInput = screen.getByDisplayValue('AHP 분석 결과 보고서');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    const exportButton = screen.getByText('제목 입력 필요');
    expect(exportButton).toBeDisabled();
  });

  test('미리보기 기능이 작동한다', () => {
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<ExportManager {...defaultProps} />);
    
    const previewButton = screen.getByText('미리보기');
    fireEvent.click(previewButton);
    
    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  test('Excel 파일 내보내기가 작동한다', async () => {
    render(<ExportManager {...defaultProps} />);
    
    // Excel 형식 선택
    const excelOption = screen.getByText('Excel (.xlsx)').closest('div');
    fireEvent.click(excelOption!);
    
    const exportButton = screen.getByText('내보내기');
    fireEvent.click(exportButton);
    
    // 진행률 표시 확인
    await waitFor(() => {
      expect(screen.getByText(/내보내기 진행률/)).toBeInTheDocument();
    });
    
    // 완료될 때까지 대기
    await waitFor(() => {
      expect(defaultProps.onExportComplete).toHaveBeenCalledWith({
        success: true,
        downloadUrl: expect.stringContaining('AHP_')
      });
    }, { timeout: 3000 });
  });

  test('빠른 내보내기 버튼들이 작동한다', async () => {
    render(<ExportManager {...defaultProps} />);
    
    const quickExcelButton = screen.getByTitle('Excel로 빠른 내보내기');
    fireEvent.click(quickExcelButton);
    
    await waitFor(() => {
      expect(defaultProps.onExportComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('도움말 텍스트가 표시된다', () => {
    render(<ExportManager {...defaultProps} />);
    
    expect(screen.getByText(/Excel:/)).toBeInTheDocument();
    expect(screen.getByText(/PDF:/)).toBeInTheDocument();
    expect(screen.getByText(/Word:/)).toBeInTheDocument();
    expect(screen.getByText(/CSV:/)).toBeInTheDocument();
    expect(screen.getByText(/중요한 자료는 안전한 곳에 보관하세요/)).toBeInTheDocument();
  });
});