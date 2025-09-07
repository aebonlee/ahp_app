/**
 * AHP 계층구조 빌더 컴포넌트
 * 네이티브 HTML5 드래그&드롭으로 기준과 대안의 계층 구조를 시각적으로 편집
 */

import React, { useState, useEffect, useCallback } from 'react';

interface HierarchyNode {
  id: string;
  name: string;
  description?: string;
  type: 'criterion' | 'alternative';
  level: number;
  parentId: string | null;
  children: HierarchyNode[];
  order: number;
  evalMethod?: 'pairwise' | 'direct';
  isEditing?: boolean;
}

interface HierarchyBuilderProps {
  initialHierarchy?: HierarchyNode[];
  onHierarchyChange: (hierarchy: HierarchyNode[]) => void;
  maxLevels?: number;
  allowAlternatives?: boolean;
  readonly?: boolean;
}

const HierarchyBuilder: React.FC<HierarchyBuilderProps> = ({
  initialHierarchy = [],
  onHierarchyChange,
  maxLevels = 4,
  allowAlternatives = true,
  readonly = false
}) => {
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>(initialHierarchy);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [newNodeDialog, setNewNodeDialog] = useState<{
    isOpen: boolean;
    parentId: string | null;
    type: 'criterion' | 'alternative';
  }>({
    isOpen: false,
    parentId: null,
    type: 'criterion'
  });

  useEffect(() => {
    setHierarchy(initialHierarchy);
    // 초기에 모든 노드를 확장
    const allNodeIds = new Set(getAllNodeIds(initialHierarchy));
    setExpandedNodes(allNodeIds);
  }, [initialHierarchy]);

  const getAllNodeIds = (nodes: HierarchyNode[]): string[] => {
    const ids: string[] = [];
    const traverse = (nodeList: HierarchyNode[]) => {
      nodeList.forEach(node => {
        ids.push(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return ids;
  };

  const updateHierarchy = useCallback((newHierarchy: HierarchyNode[]) => {
    setHierarchy(newHierarchy);
    onHierarchyChange(newHierarchy);
  }, [onHierarchyChange]);

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    if (readonly) return;
    setDraggedNode(nodeId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    if (readonly || !draggedNode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget(targetId);
  };

  // 드래그 리브
  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  // 드롭
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (readonly || !draggedNode) return;
    e.preventDefault();
    
    if (draggedNode !== targetId) {
      // 새로운 계층구조 생성
      const newHierarchy = moveNode(hierarchy, draggedNode, targetId);
      updateHierarchy(newHierarchy);
    }
    
    setDraggedNode(null);
    setDragOverTarget(null);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedNode(null);
    setDragOverTarget(null);
  };

  const moveNode = (
    nodes: HierarchyNode[],
    nodeId: string,
    newParentId: string
  ): HierarchyNode[] => {
    const clonedHierarchy = JSON.parse(JSON.stringify(nodes));
    
    // 이동할 노드 찾기 및 제거
    const movedNode = removeNodeFromHierarchy(clonedHierarchy, nodeId);
    if (!movedNode) return nodes;

    // 새 위치에 삽입
    const targetParentId = newParentId === 'root' ? null : newParentId;
    insertNodeAtPosition(clonedHierarchy, movedNode, targetParentId);

    // 레벨 업데이트
    updateNodeLevels(clonedHierarchy);
    
    return clonedHierarchy;
  };

  const removeNodeFromHierarchy = (nodes: HierarchyNode[], nodeId: string): HierarchyNode | null => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === nodeId) {
        return nodes.splice(i, 1)[0];
      }
      if (nodes[i].children.length > 0) {
        const found = removeNodeFromHierarchy(nodes[i].children, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  const insertNodeAtPosition = (
    nodes: HierarchyNode[],
    node: HierarchyNode,
    parentId: string | null
  ) => {
    if (parentId === null) {
      // 루트 레벨에 삽입
      node.parentId = null;
      node.level = 1;
      nodes.push(node);
    } else {
      // 특정 부모 노드의 자식으로 삽입
      const parent = findNodeById(nodes, parentId);
      if (parent) {
        node.parentId = parentId;
        node.level = parent.level + 1;
        parent.children.push(node);
      }
    }
  };

  const findNodeById = (nodes: HierarchyNode[], id: string): HierarchyNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateNodeLevels = (nodes: HierarchyNode[], level: number = 1) => {
    nodes.forEach((node, index) => {
      node.level = level;
      node.order = index;
      if (node.children.length > 0) {
        updateNodeLevels(node.children, level + 1);
      }
    });
  };

  const addNode = (name: string, description: string, evalMethod: 'pairwise' | 'direct') => {
    const newNode: HierarchyNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      type: newNodeDialog.type,
      level: newNodeDialog.parentId === null ? 1 : (findNodeById(hierarchy, newNodeDialog.parentId!)?.level || 0) + 1,
      parentId: newNodeDialog.parentId,
      children: [],
      order: 0,
      evalMethod: newNodeDialog.type === 'criterion' ? evalMethod : undefined
    };

    const newHierarchy = [...hierarchy];
    
    if (newNodeDialog.parentId === null) {
      newHierarchy.push(newNode);
    } else {
      const parent = findNodeById(newHierarchy, newNodeDialog.parentId);
      if (parent) {
        parent.children.push(newNode);
      }
    }

    updateNodeLevels(newHierarchy);
    updateHierarchy(newHierarchy);
    setNewNodeDialog({ isOpen: false, parentId: null, type: 'criterion' });
  };

  const deleteNode = (nodeId: string) => {
    if (readonly) return;
    
    const newHierarchy = [...hierarchy];
    removeNodeFromHierarchy(newHierarchy, nodeId);
    updateHierarchy(newHierarchy);
  };

  const updateNode = (nodeId: string, updates: Partial<HierarchyNode>) => {
    if (readonly) return;
    
    const newHierarchy = [...hierarchy];
    const node = findNodeById(newHierarchy, nodeId);
    if (node) {
      Object.assign(node, updates);
      updateHierarchy(newHierarchy);
    }
  };

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: HierarchyNode, index: number, parentId: string | null = null) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const canAddChildren = node.level < maxLevels && node.type === 'criterion';
    const isSelected = selectedNode === node.id;
    const isDraggedOver = dragOverTarget === node.id;
    const isDragging = draggedNode === node.id;

    const getNodeIcon = () => {
      if (node.type === 'alternative') return '🎯';
      if (hasChildren) return isExpanded ? '📁' : '📂';
      return '📋';
    };

    const getNodeColor = () => {
      if (isDraggedOver) return 'border-blue-500 bg-blue-100';
      if (node.type === 'alternative') return 'border-green-300 bg-green-50';
      if (node.level === 1) return 'border-blue-300 bg-blue-50';
      if (node.level === 2) return 'border-purple-300 bg-purple-50';
      return 'border-gray-300 bg-gray-50';
    };

    return (
      <div
        key={node.id}
        className={`mb-2 ${node.level > 1 ? 'ml-8' : ''} ${isDragging ? 'opacity-50' : ''}`}
        onDragOver={(e) => handleDragOver(e, node.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, node.id)}
      >
        {/* 노드 카드 */}
        <div
          draggable={!readonly}
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragEnd={handleDragEnd}
          className={`border-2 rounded-lg p-3 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isSelected
              ? 'shadow-md border-blue-500'
              : 'hover:shadow-sm'
          } ${getNodeColor()}`}
          onClick={() => setSelectedNode(isSelected ? null : node.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* 드래그 핸들 */}
              <div
                className={`p-1 rounded hover:bg-white hover:bg-opacity-50 ${
                  readonly ? 'opacity-50 cursor-not-allowed' : 'cursor-grab'
                }`}
              >
                ⋮⋮
              </div>

              {/* 확장/축소 버튼 */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(node.id);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-50"
                >
                  {isExpanded ? '−' : '+'}
                </button>
              )}

              {/* 노드 정보 */}
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-lg">{getNodeIcon()}</span>
                <div>
                  {node.isEditing ? (
                    <input
                      type="text"
                      value={node.name}
                      onChange={(e) => updateNode(node.id, { name: e.target.value })}
                      onBlur={() => updateNode(node.id, { isEditing: false })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateNode(node.id, { isEditing: false });
                        }
                      }}
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                  ) : (
                    <div>
                      <div className="font-medium text-gray-800">{node.name}</div>
                      {node.description && (
                        <div className="text-xs text-gray-600">{node.description}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 레벨 및 평가방법 표시 */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-1 bg-white bg-opacity-70 rounded">
                  L{node.level}
                </span>
                {node.evalMethod && (
                  <span className={`px-2 py-1 rounded ${
                    node.evalMethod === 'pairwise' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'
                  }`}>
                    {node.evalMethod === 'pairwise' ? '쌍대비교' : '직접입력'}
                  </span>
                )}
                {node.type === 'alternative' && (
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded">
                    대안
                  </span>
                )}
              </div>
            </div>

            {/* 노드 액션 버튼들 */}
            {!readonly && (
              <div className="flex items-center space-x-1 ml-2">
                {canAddChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewNodeDialog({
                        isOpen: true,
                        parentId: node.id,
                        type: 'criterion'
                      });
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="하위 기준 추가"
                  >
                    ➕
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateNode(node.id, { isEditing: true });
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                  title="편집"
                >
                  ✏️
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`"${node.name}"을(를) 삭제하시겠습니까?`)) {
                      deleteNode(node.id);
                    }
                  }}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 자식 노드들 */}
        {hasChildren && isExpanded && (
          <div className="mt-2 ml-4">
            {node.children.map((child, childIndex) =>
              renderNode(child, childIndex, node.id)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">계층 구조 편집기</h3>
          <p className="text-sm text-gray-600">드래그&드롭으로 계층구조를 편집하세요</p>
        </div>
        
        {!readonly && (
          <div className="flex space-x-2">
            <button
              onClick={() => setNewNodeDialog({
                isOpen: true,
                parentId: null,
                type: 'criterion'
              })}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              📋 기준 추가
            </button>
            
            {allowAlternatives && (
              <button
                onClick={() => setNewNodeDialog({
                  isOpen: true,
                  parentId: null,
                  type: 'alternative'
                })}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                🎯 대안 추가
              </button>
            )}
          </div>
        )}
      </div>

      {/* 계층구조 트리 */}
      <div
        className="min-h-[200px] p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
        onDragOver={(e) => handleDragOver(e, 'root')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'root')}
      >
        {hierarchy.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>계층구조가 비어있습니다.</p>
            <p className="text-sm">위의 버튼으로 기준이나 대안을 추가하세요.</p>
          </div>
        ) : (
          hierarchy.map((node, index) => renderNode(node, index))
        )}
      </div>

      {/* 새 노드 추가 다이얼로그 */}
      {newNodeDialog.isOpen && (
        <NewNodeDialog
          type={newNodeDialog.type}
          onAdd={addNode}
          onCancel={() => setNewNodeDialog({ isOpen: false, parentId: null, type: 'criterion' })}
        />
      )}

      {/* 범례 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">📋 사용법</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span>⋮⋮</span>
            <span>드래그 핸들</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📋</span>
            <span>기준 (잎 노드)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📁</span>
            <span>기준 (부모 노드)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🎯</span>
            <span>대안</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 새 노드 추가 다이얼로그 컴포넌트
interface NewNodeDialogProps {
  type: 'criterion' | 'alternative';
  onAdd: (name: string, description: string, evalMethod: 'pairwise' | 'direct') => void;
  onCancel: () => void;
}

const NewNodeDialog: React.FC<NewNodeDialogProps> = ({ type, onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [evalMethod, setEvalMethod] = useState<'pairwise' | 'direct'>('pairwise');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), description.trim(), evalMethod);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">
          {type === 'criterion' ? '📋 새 기준 추가' : '🎯 새 대안 추가'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`${type === 'criterion' ? '기준' : '대안'} 이름을 입력하세요`}
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="상세 설명 (선택사항)"
            />
          </div>
          
          {type === 'criterion' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                평가 방법
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pairwise"
                    checked={evalMethod === 'pairwise'}
                    onChange={(e) => setEvalMethod(e.target.value as 'pairwise' | 'direct')}
                    className="mr-2"
                  />
                  <span>쌍대비교 (정성적 평가)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="direct"
                    checked={evalMethod === 'direct'}
                    onChange={(e) => setEvalMethod(e.target.value as 'pairwise' | 'direct')}
                    className="mr-2"
                  />
                  <span>직접입력 (정량적 데이터)</span>
                </label>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HierarchyBuilder;