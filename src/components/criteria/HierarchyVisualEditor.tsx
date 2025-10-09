import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface CriterionNode {
  id: string;
  name: string;
  description?: string;
  level: number;
  parent_id?: string | null;
  children?: CriterionNode[];
}

interface HierarchyVisualEditorProps {
  initialData?: CriterionNode[];
  onUpdate: (data: CriterionNode[]) => void;
  onClose: () => void;
  templateType?: '3x3' | '4x3' | '5x3' | 'custom';
}

const HierarchyVisualEditor: React.FC<HierarchyVisualEditorProps> = ({
  initialData = [],
  onUpdate,
  onClose,
  templateType = '3x3'
}) => {
  const [criteria, setCriteria] = useState<CriterionNode[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(templateType);

  // 템플릿 생성 함수
  const generateTemplate = (type: string): CriterionNode[] => {
    const templates: { [key: string]: CriterionNode[] } = {
      '3x3': [
        {
          id: 'c1',
          name: '첫 번째 주요 기준',
          level: 1,
          children: [
            { id: 'c1-1', name: '하위 기준 1-1', level: 2, parent_id: 'c1' },
            { id: 'c1-2', name: '하위 기준 1-2', level: 2, parent_id: 'c1' },
            { id: 'c1-3', name: '하위 기준 1-3', level: 2, parent_id: 'c1' }
          ]
        },
        {
          id: 'c2',
          name: '두 번째 주요 기준',
          level: 1,
          children: [
            { id: 'c2-1', name: '하위 기준 2-1', level: 2, parent_id: 'c2' },
            { id: 'c2-2', name: '하위 기준 2-2', level: 2, parent_id: 'c2' },
            { id: 'c2-3', name: '하위 기준 2-3', level: 2, parent_id: 'c2' }
          ]
        },
        {
          id: 'c3',
          name: '세 번째 주요 기준',
          level: 1,
          children: [
            { id: 'c3-1', name: '하위 기준 3-1', level: 2, parent_id: 'c3' },
            { id: 'c3-2', name: '하위 기준 3-2', level: 2, parent_id: 'c3' },
            { id: 'c3-3', name: '하위 기준 3-3', level: 2, parent_id: 'c3' }
          ]
        }
      ],
      '4x3': [
        {
          id: 'c1',
          name: '첫 번째 주요 기준',
          level: 1,
          children: [
            { id: 'c1-1', name: '하위 기준 1-1', level: 2, parent_id: 'c1' },
            { id: 'c1-2', name: '하위 기준 1-2', level: 2, parent_id: 'c1' },
            { id: 'c1-3', name: '하위 기준 1-3', level: 2, parent_id: 'c1' }
          ]
        },
        {
          id: 'c2',
          name: '두 번째 주요 기준',
          level: 1,
          children: [
            { id: 'c2-1', name: '하위 기준 2-1', level: 2, parent_id: 'c2' },
            { id: 'c2-2', name: '하위 기준 2-2', level: 2, parent_id: 'c2' },
            { id: 'c2-3', name: '하위 기준 2-3', level: 2, parent_id: 'c2' }
          ]
        },
        {
          id: 'c3',
          name: '세 번째 주요 기준',
          level: 1,
          children: [
            { id: 'c3-1', name: '하위 기준 3-1', level: 2, parent_id: 'c3' },
            { id: 'c3-2', name: '하위 기준 3-2', level: 2, parent_id: 'c3' },
            { id: 'c3-3', name: '하위 기준 3-3', level: 2, parent_id: 'c3' }
          ]
        },
        {
          id: 'c4',
          name: '네 번째 주요 기준',
          level: 1,
          children: [
            { id: 'c4-1', name: '하위 기준 4-1', level: 2, parent_id: 'c4' },
            { id: 'c4-2', name: '하위 기준 4-2', level: 2, parent_id: 'c4' },
            { id: 'c4-3', name: '하위 기준 4-3', level: 2, parent_id: 'c4' }
          ]
        }
      ],
      '3level': [
        {
          id: 'c1',
          name: '최상위 기준',
          level: 1,
          children: [
            {
              id: 'c1-1',
              name: '중간 기준 1',
              level: 2,
              parent_id: 'c1',
              children: [
                { id: 'c1-1-1', name: '하위 기준 1-1-1', level: 3, parent_id: 'c1-1' },
                { id: 'c1-1-2', name: '하위 기준 1-1-2', level: 3, parent_id: 'c1-1' }
              ]
            },
            {
              id: 'c1-2',
              name: '중간 기준 2',
              level: 2,
              parent_id: 'c1',
              children: [
                { id: 'c1-2-1', name: '하위 기준 1-2-1', level: 3, parent_id: 'c1-2' },
                { id: 'c1-2-2', name: '하위 기준 1-2-2', level: 3, parent_id: 'c1-2' }
              ]
            }
          ]
        }
      ]
    };

    return templates[type] || templates['3x3'];
  };

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setCriteria(initialData);
    } else {
      setCriteria(generateTemplate(selectedTemplate));
    }
  }, [initialData, selectedTemplate]);

  // 노드 편집 시작
  const handleEditStart = (id: string, name: string) => {
    setEditingId(id);
    setEditText(name);
  };

  // 노드 편집 저장
  const handleEditSave = () => {
    if (editingId && editText.trim()) {
      const updateNode = (nodes: CriterionNode[]): CriterionNode[] => {
        return nodes.map(node => {
          if (node.id === editingId) {
            return { ...node, name: editText.trim() };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      
      setCriteria(updateNode(criteria));
      setEditingId(null);
      setEditText('');
    }
  };

  // 노드 추가
  const handleAddNode = (parentId: string | null, level: number) => {
    const newId = `criterion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: CriterionNode = {
      id: newId,
      name: '새 기준',
      level: level,
      parent_id: parentId
    };

    if (!parentId) {
      // 루트 레벨에 추가
      setCriteria([...criteria, { ...newNode, children: [] }]);
    } else {
      // 특정 부모 아래에 추가
      const addToParent = (nodes: CriterionNode[]): CriterionNode[] => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newNode]
            };
          }
          if (node.children) {
            return { ...node, children: addToParent(node.children) };
          }
          return node;
        });
      };
      setCriteria(addToParent(criteria));
    }
  };

  // 노드 삭제
  const handleDeleteNode = (id: string) => {
    const deleteFromTree = (nodes: CriterionNode[]): CriterionNode[] => {
      return nodes.filter(node => {
        if (node.id === id) return false;
        if (node.children) {
          node.children = deleteFromTree(node.children);
        }
        return true;
      });
    };
    setCriteria(deleteFromTree(criteria));
  };

  // 노드 렌더링
  const renderNode = (node: CriterionNode, depth: number = 0) => {
    const isEditing = editingId === node.id;
    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-purple-50 border-purple-200',
      'bg-orange-50 border-orange-200',
      'bg-pink-50 border-pink-200'
    ];
    const colorClass = colors[depth % colors.length];

    return (
      <div key={node.id} className="mb-2">
        <div className={`p-3 rounded-lg border ${colorClass} transition-all hover:shadow-md`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-xs font-medium text-gray-500">
                레벨 {node.level}
              </span>
              {isEditing ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEditSave()}
                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleEditSave}
                    className="text-green-600 hover:text-green-700"
                    title="저장"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText('');
                    }}
                    className="text-red-600 hover:text-red-700"
                    title="취소"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleEditStart(node.id, node.name)}
                  className="flex-1 cursor-pointer hover:text-blue-600"
                >
                  <span className="font-medium">{node.name}</span>
                  {node.description && (
                    <span className="ml-2 text-sm text-gray-600">
                      - {node.description}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {node.level < 5 && (
                <button
                  onClick={() => handleAddNode(node.id, node.level + 1)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                  title="하위 항목 추가"
                >
                  ➕
                </button>
              )}
              <button
                onClick={() => handleDeleteNode(node.id)}
                className="text-red-600 hover:text-red-700 text-sm"
                title="삭제"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="ml-6 mt-2 border-l-2 border-gray-200 pl-4">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 평면 배열로 변환
  const flattenHierarchy = (nodes: CriterionNode[]): CriterionNode[] => {
    const result: CriterionNode[] = [];
    const traverse = (node: CriterionNode) => {
      const { children, ...nodeWithoutChildren } = node;
      result.push(nodeWithoutChildren);
      if (children) {
        children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return result;
  };

  // 저장 및 적용
  const handleApply = () => {
    const flatData = flattenHierarchy(criteria);
    onUpdate(flatData);
  };

  // 통계 정보
  const getStatistics = () => {
    const flat = flattenHierarchy(criteria);
    const levelCounts: { [key: number]: number } = {};
    flat.forEach(item => {
      levelCounts[item.level] = (levelCounts[item.level] || 0) + 1;
    });
    return { total: flat.length, levelCounts };
  };

  const stats = getStatistics();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        <Card title="📊 계층구조 시각적 편집기">
          <div className="flex flex-col h-full">
            {/* 헤더 - 템플릿 선택 */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">템플릿:</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as any)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="3x3">3×3 구조 (상위 3개, 각 하위 3개)</option>
                  <option value="4x3">4×3 구조 (상위 4개, 각 하위 3개)</option>
                  <option value="3level">3단계 구조</option>
                  <option value="custom">사용자 정의</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCriteria(generateTemplate(selectedTemplate))}
                >
                  템플릿 적용
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  총 {stats.total}개 항목
                </span>
                {Object.entries(stats.levelCounts).map(([level, count]) => (
                  <span key={level} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    레벨{level}: {count}개
                  </span>
                ))}
              </div>
            </div>

            {/* 본문 - 계층구조 편집 영역 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">계층 구조</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddNode(null, 1)}
                  >
                    + 최상위 기준 추가
                  </Button>
                </div>
                
                {criteria.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>기준이 없습니다.</p>
                    <p className="mt-2">템플릿을 선택하거나 '최상위 기준 추가' 버튼을 클릭하세요.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {criteria.map(node => renderNode(node, 0))}
                  </div>
                )}
              </div>

              {/* 사용법 안내 */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 사용법</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 기준명을 클릭하여 직접 편집할 수 있습니다</li>
                  <li>• ➕ 버튼으로 하위 기준을 추가할 수 있습니다 (최대 5단계)</li>
                  <li>• 🗑️ 버튼으로 기준을 삭제할 수 있습니다</li>
                  <li>• 템플릿을 선택하여 기본 구조를 빠르게 생성할 수 있습니다</li>
                  <li>• Saaty의 AHP 이론에 따라 일관성 있는 계층구조를 구성하세요</li>
                </ul>
              </div>
            </div>

            {/* 푸터 - 액션 버튼 */}
            <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
              <Button variant="secondary" onClick={onClose}>
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleApply}
                disabled={stats.total === 0}
              >
                적용하기 ({stats.total}개 기준)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HierarchyVisualEditor;