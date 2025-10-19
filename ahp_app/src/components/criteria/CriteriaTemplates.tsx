import React from 'react';
import Button from '../common/Button';

export interface CriteriaTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  structure: {
    name: string;
    description?: string;
    children?: any[];
  }[];
}

export const CRITERIA_TEMPLATES: CriteriaTemplate[] = [
  {
    id: '3x3',
    name: '3x3 기본 구조',
    description: '3개 기준, 각 3개 하위기준',
    icon: '📊',
    structure: [
      {
        name: '기준 1',
        description: '첫 번째 평가 기준',
        children: [
          { name: '하위기준 1-1', description: '상세 평가 항목' },
          { name: '하위기준 1-2', description: '상세 평가 항목' },
          { name: '하위기준 1-3', description: '상세 평가 항목' }
        ]
      },
      {
        name: '기준 2',
        description: '두 번째 평가 기준',
        children: [
          { name: '하위기준 2-1', description: '상세 평가 항목' },
          { name: '하위기준 2-2', description: '상세 평가 항목' },
          { name: '하위기준 2-3', description: '상세 평가 항목' }
        ]
      },
      {
        name: '기준 3',
        description: '세 번째 평가 기준',
        children: [
          { name: '하위기준 3-1', description: '상세 평가 항목' },
          { name: '하위기준 3-2', description: '상세 평가 항목' },
          { name: '하위기준 3-3', description: '상세 평가 항목' }
        ]
      }
    ]
  },
  {
    id: '4x2',
    name: '4x2 구조',
    description: '4개 기준, 각 2개 하위기준',
    icon: '📈',
    structure: [
      {
        name: '품질',
        description: '제품/서비스 품질 평가',
        children: [
          { name: '기능성', description: '핵심 기능 수행 능력' },
          { name: '신뢰성', description: '안정성과 일관성' }
        ]
      },
      {
        name: '비용',
        description: '경제성 평가',
        children: [
          { name: '초기비용', description: '도입 및 구축 비용' },
          { name: '운영비용', description: '유지보수 및 관리 비용' }
        ]
      },
      {
        name: '기술',
        description: '기술적 우수성 평가',
        children: [
          { name: '혁신성', description: '최신 기술 적용 수준' },
          { name: '확장성', description: '향후 발전 가능성' }
        ]
      },
      {
        name: '지원',
        description: '지원 체계 평가',
        children: [
          { name: '기술지원', description: '기술 지원 서비스 품질' },
          { name: '교육훈련', description: '사용자 교육 프로그램' }
        ]
      }
    ]
  },
  {
    id: '2x4',
    name: '2x4 심화 구조',
    description: '2개 기준, 각 4개 하위기준',
    icon: '🎯',
    structure: [
      {
        name: '정량적 평가',
        description: '측정 가능한 지표',
        children: [
          { name: '성과 지표', description: 'KPI 달성도' },
          { name: '효율성', description: '자원 활용 효율' },
          { name: '생산성', description: '산출물 대비 투입' },
          { name: '수익성', description: '재무적 성과' }
        ]
      },
      {
        name: '정성적 평가',
        description: '주관적 평가 요소',
        children: [
          { name: '만족도', description: '사용자 만족 수준' },
          { name: '혁신성', description: '창의성과 독창성' },
          { name: '협업', description: '팀워크와 소통' },
          { name: '지속가능성', description: '장기적 발전 가능성' }
        ]
      }
    ]
  },
  {
    id: 'simple3',
    name: '단순 3단계',
    description: '3개 기준만 (하위기준 없음)',
    icon: '⚡',
    structure: [
      { name: '효과성', description: '목표 달성 정도' },
      { name: '효율성', description: '자원 활용 정도' },
      { name: '만족도', description: '이해관계자 만족 수준' }
    ]
  },
  {
    id: 'complex',
    name: '복합 계층구조',
    description: '다층 구조 (3단계)',
    icon: '🏗️',
    structure: [
      {
        name: '전략적 적합성',
        description: '조직 전략과의 정렬',
        children: [
          {
            name: '비전 정합성',
            description: '조직 비전과의 일치',
            children: [
              { name: '장기 목표', description: '장기 목표 기여도' },
              { name: '핵심 가치', description: '핵심 가치 부합도' }
            ]
          },
          {
            name: '시장 경쟁력',
            description: '시장에서의 위치',
            children: [
              { name: '차별화', description: '경쟁사 대비 차별점' },
              { name: '시장 점유율', description: '시장 지배력' }
            ]
          }
        ]
      },
      {
        name: '운영 우수성',
        description: '운영 효율성과 품질',
        children: [
          {
            name: '프로세스',
            description: '업무 프로세스 최적화',
            children: [
              { name: '표준화', description: '프로세스 표준화 수준' },
              { name: '자동화', description: '자동화 적용 범위' }
            ]
          },
          {
            name: '품질 관리',
            description: '품질 보증 체계',
            children: [
              { name: '품질 기준', description: '품질 기준 충족도' },
              { name: '개선 활동', description: '지속적 개선 노력' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'it_project',
    name: 'IT 프로젝트 평가',
    description: 'SW/시스템 도입 평가 (3×3 구조)',
    icon: '💻',
    structure: [
      {
        name: '기술적 요구사항',
        description: '기술 스펙 충족도',
        children: [
          { name: '성능', description: '처리 속도와 용량' },
          { name: '보안', description: '보안 요구사항 충족' },
          { name: '호환성', description: '기존 시스템과의 연동' }
        ]
      },
      {
        name: '비즈니스 가치',
        description: '사업적 효과',
        children: [
          { name: 'ROI', description: '투자 대비 수익' },
          { name: '프로세스 개선', description: '업무 효율 향상도' },
          { name: '사용자 경험', description: 'UX/UI 품질' }
        ]
      },
      {
        name: '벤더 역량',
        description: '공급사 평가',
        children: [
          { name: '기술력', description: '기술 전문성과 경험' },
          { name: '지원 체계', description: '유지보수 및 지원' },
          { name: '안정성', description: '기업 신뢰도와 지속성' }
        ]
      }
    ]
  }
];

interface CriteriaTemplatesProps {
  onSelectTemplate: (template: CriteriaTemplate) => void;
  onClose: () => void;
}

const CriteriaTemplates: React.FC<CriteriaTemplatesProps> = ({ 
  onSelectTemplate, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              기본 템플릿 선택
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            프로젝트에 맞는 기준 구조를 선택하세요. 선택 후 수정 가능합니다.
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRITERIA_TEMPLATES.map(template => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {template.description}
                    </p>
                    
                    {/* 구조 미리보기 */}
                    <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                      {template.structure.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="text-gray-700">
                          <span className="font-medium">• {item.name}</span>
                          {item.children && (
                            <span className="text-gray-500 ml-2">
                              ({item.children.length}개 하위)
                            </span>
                          )}
                        </div>
                      ))}
                      {template.structure.length > 3 && (
                        <div className="text-gray-500">
                          ... 외 {template.structure.length - 3}개
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriteriaTemplates;