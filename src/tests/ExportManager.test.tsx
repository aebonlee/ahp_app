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

// XLSX library is no longer used - removed for security

describe('ExportManager 컴포넌트', () => {
  const defaultProps = {
    projectId: 'test-project-1',
    projectTitle: '테스트 프로젝트',
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('컴포넌트가 정상적으로 렌더링된다', () => {
    render(<ExportManager {...defaultProps} />);
    
    expect(screen.getByText('프로젝트 내보내기')).toBeInTheDocument();
    expect(screen.getByText('내보내기 형식')).toBeInTheDocument();
    expect(screen.getByText('포함할 데이터')).toBeInTheDocument();
    expect(screen.getByText('내보내기')).toBeInTheDocument();
  });

  test('CSV 형식 옵션이 표시된다', () => {
    render(<ExportManager {...defaultProps} />);
    
    expect(screen.getByText('CSV (현재 지원)')).toBeInTheDocument();
    expect(screen.getByText('보안상 이유로 Excel 내보내기는 임시로 비활성화되었습니다.')).toBeInTheDocument();
  });

  test('포함할 데이터 옵션을 설정할 수 있다', () => {
    render(<ExportManager {...defaultProps} />);
    
    const progressCheckbox = screen.getByLabelText('진행 상황');
    expect(progressCheckbox).toBeChecked();
    
    fireEvent.click(progressCheckbox);
    expect(progressCheckbox).not.toBeChecked();
  });

  test('내보내기 기능이 작동한다', async () => {
    render(<ExportManager {...defaultProps} />);
    
    const exportButton = screen.getByText('내보내기');
    fireEvent.click(exportButton);
    
    // 내보내는 중 텍스트 확인
    expect(screen.getByText('내보내는 중...')).toBeInTheDocument();
  });

  test('취소 버튼이 onClose를 호출한다', () => {
    render(<ExportManager {...defaultProps} />);
    
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('내보내기 중에는 버튼이 비활성화된다', async () => {
    render(<ExportManager {...defaultProps} />);
    
    const exportButton = screen.getByText('내보내기');
    fireEvent.click(exportButton);
    
    // 내보내는 중일 때 버튼 비활성화 확인
    expect(screen.getByText('내보내는 중...')).toBeDisabled();
    expect(screen.getByText('취소')).toBeDisabled();
  });
});