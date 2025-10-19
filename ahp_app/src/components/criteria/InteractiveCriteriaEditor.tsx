import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  order?: number;
  children?: Criterion[];
  weight?: number;
  type?: 'criteria';
  isEditing?: boolean;
  isExpanded?: boolean;
}

interface InteractiveCriteriaEditorProps {
  criteria: Criterion[];
  onUpdate: (criteria: Criterion[]) => void;
  allowEdit?: boolean;
  layoutMode?: 'vertical' | 'horizontal';
}

const InteractiveCriteriaEditor: React.FC<InteractiveCriteriaEditorProps> = ({
  criteria: initialCriteria,
  onUpdate,
  allowEdit = true,
  layoutMode = 'vertical'
}) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeDescription, setNewNodeDescription] = useState('');
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Click outside handler to close dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAddMenu && !(event.target as Element).closest('.relative')) {
        setShowAddMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);

  // 계층구조 구성
  const buildHierarchy = (flatCriteria: Criterion[]): Criterion[] => {
    const criteriaMap = new Map<string, Criterion>();
    const rootCriteria: Criterion[] = [];

    // 모든 기준을 맵에 저장
    flatCriteria.forEach(criterion => {
      criteriaMap.set(criterion.id, { ...criterion, children: [], isExpanded: true });
    });

    // 계층 구조 구성
    flatCriteria.forEach(criterion => {
      const criterionObj = criteriaMap.get(criterion.id)!;
      
      if (criterion.parent_id && criteriaMap.has(criterion.parent_id)) {
        const parent = criteriaMap.get(criterion.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(criterionObj);
        }
      } else {
        rootCriteria.push(criterionObj);
      }
    });

    return rootCriteria;
  };

  // 노드 찾기
  const findNode = (nodes: Criterion[], id: string): Criterion | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 노드 추가 (이름과 설명 선택 가능)
  const addNode = (parentId: string | null, name: string = '새 기준', description: string = '') => {
    const newNode: Criterion = {
      id: `criterion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      description: description,
      parent_id: parentId,
      level: parentId ? (findNode(criteria, parentId)?.level || 0) + 1 : 1,
      order: 0,
      children: [],
      isExpanded: true,
      isEditing: name === '새 기준'
    };

    const addToHierarchy = (nodes: Criterion[]): Criterion[] => {
      if (!parentId) {
        return [...nodes, newNode];
      }
      
      return nodes.map(node => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newNode],
            isExpanded: true
          };
        }
        if (node.children) {
          return {
            ...node,
            children: addToHierarchy(node.children)
          };
        }
        return node;
      });
    };

    const updated = addToHierarchy(criteria);
    setCriteria(updated);
    onUpdate(updated);
    if (name === '새 기준') {
      setEditingNodeId(newNode.id);
      setNewNodeName(name);
    }
    setShowAddMenu(null);
  };

  // 노드 삭제
  const deleteNode = (id: string) => {
    if (!window.confirm('이 기준과 모든 하위 기준이 삭제됩니다. 계속하시겠습니까?')) {
      return;
    }

    const removeFromHierarchy = (nodes: Criterion[]): Criterion[] => {
      return nodes.filter(node => {
        if (node.id === id) return false;
        if (node.children) {
          node.children = removeFromHierarchy(node.children);
        }
        return true;
      });
    };

    const updated = removeFromHierarchy(criteria);
    setCriteria(updated);
    onUpdate(updated);
    setSelectedNodeId(null);
  };

  // 노드 편집 시작
  const startEdit = (node: Criterion) => {
    setEditingNodeId(node.id);
    setNewNodeName(node.name);
    setNewNodeDescription(node.description || '');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // 노드 편집 저장
  const saveEdit = () => {
    if (!editingNodeId || !newNodeName.trim()) return;

    const updateInHierarchy = (nodes: Criterion[]): Criterion[] => {
      return nodes.map(node => {
        if (node.id === editingNodeId) {
          return {
            ...node,
            name: newNodeName.trim(),
            description: newNodeDescription.trim(),
            isEditing: false
          };
        }
        if (node.children) {
          return {
            ...node,
            children: updateInHierarchy(node.children)
          };
        }
        return node;
      });
    };

    const updated = updateInHierarchy(criteria);
    setCriteria(updated);
    onUpdate(updated);
    setEditingNodeId(null);
  };

  // 노드 편집 취소
  const cancelEdit = () => {
    setEditingNodeId(null);
    setNewNodeName('');
    setNewNodeDescription('');
  };

  // 노드 확장/축소
  const toggleExpanded = (id: string) => {
    const updateExpanded = (nodes: Criterion[]): Criterion[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return {
            ...node,
            children: updateExpanded(node.children)
          };
        }
        return node;
      });
    };

    const updated = updateExpanded(criteria);
    setCriteria(updated);
  };

  // 레벨 변경 (상위/하위로 이동)
  const changeLevel = (nodeId: string, direction: 'up' | 'down') => {
    const node = findNode(criteria, nodeId);
    if (!node) return;

    // 구현 복잡도가 높아 간단한 알림만 표시
    alert(`레벨 ${direction === 'up' ? '상위로' : '하위로'} 이동 기능은 준비 중입니다.`);
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

    // 드래그 앤 드롭으로 재정렬 (간단한 구현)
    alert('드래그 앤 드롭으로 순서 변경 기능은 준비 중입니다.');
    setDraggedNodeId(null);
  };

  // 노드 렌더링
  const renderNode = (node: Criterion, depth: number = 0): React.ReactNode => {
    const isEditing = editingNodeId === node.id;
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    
    const nodeColor = depth === 0 ? 'blue' : depth === 1 ? 'green' : depth === 2 ? 'purple' : 'yellow';

    return (
      <div key={node.id} className="mb-2">
        <div
          className={`
            relative group rounded-lg border-2 p-3 transition-all cursor-pointer
            ${isSelected ? `border-${nodeColor}-500 bg-${nodeColor}-50` : `border-gray-200 hover:border-${nodeColor}-300 bg-white`}
            ${draggedNodeId === node.id ? 'opacity-50' : ''}
          `}
          onClick={() => !isEditing && setSelectedNodeId(node.id)}
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node.id)}
          draggable={allowEdit && !isEditing}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="기준 이름"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <input
                    type="text"
                    value={newNodeDescription}
                    onChange={(e) => setNewNodeDescription(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="설명 (선택사항)"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" variant="primary" onClick={saveEdit}>
                      저장
                    </Button>
                    <Button size="sm" variant="secondary" onClick={cancelEdit}>
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
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
                    <span className="font-medium">{node.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (레벨 {node.level})
                    </span>
                  </div>
                  {node.description && (
                    <p className="text-sm text-gray-600 mt-1">{node.description}</p>
                  )}
                </div>
              )}
            </div>

            {allowEdit && !isEditing && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(node);
                  }}
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  title="편집"
                >
                  ✏️
                </button>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddMenu(showAddMenu === node.id ? null : node.id);
                    }}
                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                    title="하위 기준 추가"
                  >
                    ➕
                  </button>
                  {showAddMenu === node.id && (
                    <div className="absolute top-8 left-0 z-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addNode(node.id);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                        >
                          📝 빈 항목 추가
                        </button>
                        <div className="border-t my-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addNode(node.id, '재무적 요소', '비용, 수익성 등 재무 관련 지표');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          💰 재무적 요소
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addNode(node.id, '기술적 요소', '기술 수준, 호환성 등 기술 관련 지표');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          🔧 기술적 요소
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addNode(node.id, '운영적 요소', '효율성, 생산성 등 운영 관련 지표');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          ⚙️ 운영적 요소
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addNode(node.id, '전략적 요소', '시장 위치, 경쟁력 등 전략 관련 지표');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          📊 전략적 요소
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  title="삭제"
                >
                  🗑️
                </button>
                <div className="border-l mx-1 h-4" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLevel(node.id, 'up');
                  }}
                  className="p-1 text-purple-500 hover:bg-purple-50 rounded"
                  title="상위 레벨로"
                >
                  ⬆️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLevel(node.id, 'down');
                  }}
                  className="p-1 text-purple-500 hover:bg-purple-50 rounded"
                  title="하위 레벨로"
                >
                  ⬇️
                </button>
              </div>
            )}
          </div>
        </div>

        {hasChildren && node.isExpanded && (
          <div className="mt-2">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const hierarchicalCriteria = buildHierarchy(criteria);

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(showAddMenu === 'root' ? null : 'root')}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ➕ 상위 기준 추가 ▼
            </button>
            {showAddMenu === 'root' && (
              <div className="absolute top-8 left-0 z-10 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => addNode(null)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  >
                    📝 빈 항목 추가
                  </button>
                  <div className="border-t my-1" />
                  <p className="px-3 py-1 text-xs text-gray-500 font-semibold">일반 템플릿</p>
                  <button
                    onClick={() => addNode(null, '재무 성과', '수익성, 안정성, 성장성 등')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                  >
                    💰 재무 성과
                  </button>
                  <button
                    onClick={() => addNode(null, '운영 효율성', '생산성, 품질, 혁신 등')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                  >
                    ⚙️ 운영 효율성
                  </button>
                  <button
                    onClick={() => addNode(null, '지속가능성', '환경, 사회, 거버넌스 등')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                  >
                    🌱 지속가능성
                  </button>
                  <button
                    onClick={() => addNode(null, '기술적 역량', '기술 수준, 인프라, 보안 등')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                  >
                    🔧 기술적 역량
                  </button>
                  <button
                    onClick={() => addNode(null, '시장 경쟁력', '시장 점유율, 브랜드 가치 등')}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                  >
                    📊 시장 경쟁력
                  </button>
                </div>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">
            | 항목을 클릭하여 선택하고 편집할 수 있습니다
          </span>
        </div>
        <div className="text-sm text-gray-500">
          드래그하여 순서 변경 (준비 중)
        </div>
      </div>

      {/* 계층구조 표시 */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        {hierarchicalCriteria.length > 0 ? (
          hierarchicalCriteria.map(node => renderNode(node))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-3xl mb-2">🌳</div>
            <p>계층구조가 비어있습니다</p>
            <div className="relative inline-block mt-4">
              <button
                onClick={() => setShowAddMenu(showAddMenu === 'empty' ? null : 'empty')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                첫 번째 기준 추가 ▼
              </button>
              {showAddMenu === 'empty' && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2">
                    <button
                      onClick={() => addNode(null)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                    >
                      📝 빈 항목으로 시작
                    </button>
                    <div className="border-t my-1" />
                    <p className="px-3 py-1 text-xs text-gray-500 font-semibold">추천 템플릿</p>
                    <button
                      onClick={() => {
                        addNode(null, '평가 목표', '최상위 평가 목표 정의');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      🎯 평가 목표로 시작
                    </button>
                    <button
                      onClick={() => {
                        addNode(null, '프로젝트 성공', '프로젝트 성공 기준 정의');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      🚀 프로젝트 평가로 시작
                    </button>
                    <button
                      onClick={() => {
                        addNode(null, '제품 선택', '최적의 제품 선택 기준');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      📦 제품 선택으로 시작
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          💡 <strong>사용 방법:</strong> 
          ✏️ 편집, ➕ 하위 추가, 🗑️ 삭제, ⬆️⬇️ 레벨 이동
        </p>
      </div>
    </div>
  );
};

export default InteractiveCriteriaEditor;