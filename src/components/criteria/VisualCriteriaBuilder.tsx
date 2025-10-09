import React, { useState } from 'react';
import Button from '../common/Button';

interface CriteriaNode {
  id: string;
  name: string;
  description?: string;
  level: number;
  parent_id: string | null;
  children: CriteriaNode[];
  isEditing?: boolean;
  isExpanded?: boolean;
}

interface VisualCriteriaBuilderProps {
  initialCriteria?: CriteriaNode[];
  onSave: (criteria: CriteriaNode[]) => void;
  onClose?: () => void;
  isInline?: boolean; // 인라인 모드 여부
}

const VisualCriteriaBuilder: React.FC<VisualCriteriaBuilderProps> = ({
  initialCriteria = [],
  onSave,
  onClose,
  isInline = true // 기본값을 인라인으로 설정
}) => {
  const [criteria, setCriteria] = useState<CriteriaNode[]>(() => {
    if (initialCriteria.length > 0) {
      return initialCriteria.map(c => ({ ...c, isExpanded: true }));
    }
    // 기본 루트 노드 생성
    return [{
      id: `node_${Date.now()}`,
      name: '평가 목표',
      description: '최상위 평가 목표',
      level: 1,
      parent_id: null,
      children: [],
      isExpanded: true
    }];
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // 노드 찾기
  const findNode = (nodes: CriteriaNode[], id: string): CriteriaNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNode(node.children, id);
      if (found) return found;
    }
    return null;
  };

  // 노드 업데이트
  const updateNode = (nodes: CriteriaNode[], id: string, updates: Partial<CriteriaNode>): CriteriaNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      return {
        ...node,
        children: updateNode(node.children, id, updates)
      };
    });
  };

  // 노드 추가
  const addNode = (parentId: string | null) => {
    const newNode: CriteriaNode = {
      id: `node_${Date.now()}_${Math.random()}`,
      name: '새 기준',
      description: '',
      level: parentId ? (findNode(criteria, parentId)?.level || 0) + 1 : 1,
      parent_id: parentId,
      children: [],
      isEditing: true,
      isExpanded: true
    };

    if (parentId) {
      // 부모 노드에 자식으로 추가
      setCriteria(prev => {
        const addChildToParent = (nodes: CriteriaNode[]): CriteriaNode[] => {
          return nodes.map(node => {
            if (node.id === parentId) {
              return {
                ...node,
                children: [...node.children, newNode],
                isExpanded: true
              };
            }
            return {
              ...node,
              children: addChildToParent(node.children)
            };
          });
        };
        return addChildToParent(prev);
      });
    } else {
      // 루트 레벨에 추가
      setCriteria(prev => [...prev, newNode]);
    }
    
    setSelectedNodeId(newNode.id);
  };

  // 노드 삭제
  const deleteNode = (id: string) => {
    if (!window.confirm('이 기준과 모든 하위 기준이 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }

    const removeNode = (nodes: CriteriaNode[]): CriteriaNode[] => {
      return nodes.filter(node => {
        if (node.id === id) return false;
        node.children = removeNode(node.children);
        return true;
      });
    };

    setCriteria(prev => removeNode(prev));
    setSelectedNodeId(null);
  };

  // 노드 편집 모드 토글
  const toggleEditMode = (id: string) => {
    setCriteria(prev => updateNode(prev, id, { isEditing: !findNode(prev, id)?.isEditing }));
  };

  // 노드 확장/축소 토글
  const toggleExpanded = (id: string) => {
    setCriteria(prev => updateNode(prev, id, { isExpanded: !findNode(prev, id)?.isExpanded }));
  };

  // 노드 이름 변경
  const updateNodeName = (id: string, name: string) => {
    setCriteria(prev => updateNode(prev, id, { name }));
  };

  // 노드 설명 변경
  const updateNodeDescription = (id: string, description: string) => {
    setCriteria(prev => updateNode(prev, id, { description }));
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDraggedNodeId(nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedNodeId || draggedNodeId === targetId) return;

    // TODO: 노드 이동 로직 구현
    console.log(`Moving ${draggedNodeId} to ${targetId}`);
    setDraggedNodeId(null);
  };

  // 노드 렌더링
  const renderNode = (node: CriteriaNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNodeId === node.id;

    return (
      <div key={node.id} className="mb-2">
        <div
          className={`
            flex items-center p-2 rounded-lg border transition-all
            ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            ${depth > 0 ? 'ml-8' : ''}
          `}
          onClick={() => setSelectedNodeId(node.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node.id)}
        >
          {/* 확장/축소 버튼 */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {node.isExpanded ? '▼' : '▶'}
            </button>
          )}

          {/* 레벨 표시 */}
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2
            ${depth === 0 ? 'bg-purple-500 text-white' : 
              depth === 1 ? 'bg-blue-500 text-white' : 
              depth === 2 ? 'bg-green-500 text-white' : 
              'bg-gray-500 text-white'}
          `}>
            {node.level}
          </div>

          {/* 노드 내용 */}
          <div className="flex-1">
            {node.isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <input
                  value={node.name}
                  onChange={(e) => updateNodeName(node.id, e.target.value)}
                  placeholder="기준 이름"
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <input
                  value={node.description || ''}
                  onChange={(e) => updateNodeDescription(node.id, e.target.value)}
                  placeholder="설명 (선택사항)"
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
                />
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => toggleEditMode(node.id)}
                  >
                    확인
                  </button>
                  <button
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={() => {
                      toggleEditMode(node.id);
                      // 원래 값으로 되돌리기
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="cursor-pointer"
                onDoubleClick={() => toggleEditMode(node.id)}
              >
                <div className="font-medium text-gray-900">{node.name}</div>
                {node.description && (
                  <div className="text-xs text-gray-500">{node.description}</div>
                )}
                <div className="text-xs text-blue-500 mt-1">더블클릭으로 편집</div>
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          {!node.isEditing && (
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addNode(node.id);
                }}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
                title="하위 기준 추가"
              >
                ➕
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEditMode(node.id);
                }}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                title="편집"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="삭제"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* 자식 노드들 */}
        {node.isExpanded && hasChildren && (
          <div className="mt-1">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 평면 구조로 변환 (저장용)
  const flattenCriteria = (nodes: CriteriaNode[], parentId: string | null = null): any[] => {
    const result: any[] = [];
    nodes.forEach((node, index) => {
      result.push({
        id: node.id,
        name: node.name,
        description: node.description,
        level: node.level,
        parent_id: parentId,
        order: index + 1
      });
      if (node.children && node.children.length > 0) {
        result.push(...flattenCriteria(node.children, node.id));
      }
    });
    return result;
  };

  // 통계 계산
  const getStats = () => {
    const flatten = flattenCriteria(criteria);
    const levels = flatten.reduce((acc, c) => {
      acc[c.level] = (acc[c.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return {
      total: flatten.length,
      levels
    };
  };

  const stats = getStats();

  // 인라인 모드일 때 렌더링
  if (isInline) {
    return (
      <div className="w-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">시각적 계층구조 빌더</h3>
            <p className="text-sm text-gray-600 mt-1">
              드래그 앤 드롭으로 구조를 조정하고, 더블클릭하여 편집하세요
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              전체 기준: <span className="font-semibold">{stats.total}개</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode(null)}
            >
              ➕ 최상위 기준 추가
            </Button>
          </div>
        </div>

        {/* 트리 편집 영역 */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white max-h-[500px] overflow-y-auto">
          <div className="space-y-2">
            {criteria.map(node => renderNode(node))}
          </div>

          {criteria.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              위 버튼을 클릭하여 첫 번째 기준을 추가하세요
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end mt-4 space-x-2">
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={() => onSave(criteria)}
            disabled={stats.total === 0}
          >
            적용하기
          </Button>
        </div>

        {/* 도움말 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <strong>💡 사용 팁:</strong> 
          ➕ 하위 기준 추가 | ✏️ 이름과 설명 편집 | 🗑️ 삭제 (하위 포함) | 
          더블클릭으로 직접 편집 | ▼/▶ 접기/펼치기
        </div>
      </div>
    );
  }

  // 팝업 모드일 때 렌더링 (이전 코드)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                시각적 계층구조 빌더
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                드래그 앤 드롭으로 구조를 조정하고, 클릭하여 편집하세요
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 왼쪽: 트리 편집 영역 */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => addNode(null)}
                className="w-full"
              >
                ➕ 최상위 기준 추가
              </Button>
            </div>

            <div className="space-y-2">
              {criteria.map(node => renderNode(node))}
            </div>

            {criteria.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                위 버튼을 클릭하여 첫 번째 기준을 추가하세요
              </div>
            )}
          </div>

          {/* 오른쪽: 통계 및 미리보기 */}
          <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">구조 요약</h3>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">전체 기준</span>
                  <span className="font-semibold">{stats.total}개</span>
                </div>
                {Object.entries(stats.levels).map(([level, count]) => (
                  <div key={level} className="flex justify-between text-sm">
                    <span className="text-gray-500">레벨 {level}</span>
                    <span>{String(count)}개</span>
                  </div>
                ))}
              </div>
            </div>

            <h4 className="font-medium text-gray-700 mb-2">계층구조 미리보기</h4>
            <div className="bg-white rounded-lg p-3 text-sm">
              {flattenCriteria(criteria).map((item, idx) => (
                <div 
                  key={idx} 
                  className="py-1"
                  style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                >
                  <span className="text-gray-700">
                    {item.level > 1 && '└ '}
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <h5 className="font-medium mb-1">도움말</h5>
              <ul className="space-y-1">
                <li>• ➕ 버튼으로 하위 기준 추가</li>
                <li>• ✏️ 버튼으로 이름과 설명 편집</li>
                <li>• 🗑️ 버튼으로 삭제 (하위 포함)</li>
                <li>• 드래그로 순서 변경 (개발중)</li>
                <li>• ▼/▶ 버튼으로 접기/펼치기</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {stats.total}개 기준 구성됨
            </div>
            <div className="flex space-x-2">
              {onClose && (
                <Button variant="secondary" onClick={onClose}>
                  취소
                </Button>
              )}
              <Button 
                variant="primary" 
                onClick={() => onSave(criteria)}
                disabled={stats.total === 0}
              >
                저장하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualCriteriaBuilder;