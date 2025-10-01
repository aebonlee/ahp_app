import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';

interface TreeNode {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  children: TreeNode[];
  type: 'goal' | 'criteria' | 'subcriteria';
  order: number;
}

interface HierarchyTreeBuilderProps {
  projectId: string;
  projectTitle: string;
  onComplete: (hierarchy: TreeNode) => void;
}

const HierarchyTreeBuilder: React.FC<HierarchyTreeBuilderProps> = ({
  projectId,
  projectTitle,
  onComplete
}) => {
  const [hierarchy, setHierarchy] = useState<TreeNode>({
    id: 'root',
    name: projectTitle,
    level: 0,
    parentId: null,
    children: [],
    type: 'goal',
    order: 0
  });

  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showBatchInput, setShowBatchInput] = useState(false);

  // 일괄 입력 기능 - 3x3 구조 생성
  const handleBatchInput = () => {
    const mainCriteria = ['기준 1', '기준 2', '기준 3'];
    const subCriteria = ['하위기준 1', '하위기준 2', '하위기준 3'];
    const timestamp = Date.now();

    const newChildren: TreeNode[] = mainCriteria.map((main, mainIndex) => {
      const criteriaId = `criteria-${timestamp}-${mainIndex}`;
      
      return {
        id: criteriaId,
        name: main,
        level: 1,
        parentId: 'root',
        type: 'criteria',
        order: mainIndex,
        children: subCriteria.map((sub, subIndex) => ({
          id: `subcriteria-${timestamp}-${mainIndex}-${subIndex}`,
          name: `${sub}`,  // 하위 기준 이름만 표시
          level: 2,
          parentId: criteriaId,  // 올바른 부모 ID 참조
          type: 'subcriteria',
          order: subIndex,
          children: []
        }))
      };
    });

    setHierarchy({
      ...hierarchy,
      children: newChildren
    });
    setShowBatchInput(false);
  };

  // 노드 추가
  const addNode = (parentNode: TreeNode, nodeName: string) => {
    const newNode: TreeNode = {
      id: `node-${Date.now()}`,
      name: nodeName,
      level: parentNode.level + 1,
      parentId: parentNode.id,
      type: parentNode.level === 0 ? 'criteria' : 'subcriteria',
      order: parentNode.children.length,
      children: []
    };

    const updateTree = (node: TreeNode): TreeNode => {
      if (node.id === parentNode.id) {
        return {
          ...node,
          children: [...node.children, newNode]
        };
      }
      return {
        ...node,
        children: node.children.map(updateTree)
      };
    };

    setHierarchy(updateTree(hierarchy));
  };

  // 노드 삭제
  const deleteNode = (nodeId: string) => {
    const removeNode = (node: TreeNode): TreeNode => {
      return {
        ...node,
        children: node.children
          .filter(child => child.id !== nodeId)
          .map(removeNode)
      };
    };

    setHierarchy(removeNode(hierarchy));
    setSelectedNode(null);
  };

  // 노드 레벨 이동 (상위/하위 전환)
  const moveNodeLevel = (nodeId: string, direction: 'up' | 'down') => {
    const findNodeAndParent = (
      tree: TreeNode, 
      targetId: string, 
      parent: TreeNode | null = null
    ): { node: TreeNode | null; parent: TreeNode | null } => {
      if (tree.id === targetId) {
        return { node: tree, parent };
      }
      for (const child of tree.children) {
        const result = findNodeAndParent(child, targetId, tree);
        if (result.node) return result;
      }
      return { node: null, parent: null };
    };

    const { node, parent } = findNodeAndParent(hierarchy, nodeId);
    
    if (!node || !parent) return;

    if (direction === 'up' && parent.parentId) {
      // 상위 레벨로 이동
      const grandParent = findNodeAndParent(hierarchy, parent.parentId).node;
      if (grandParent) {
        const updateTree = (tree: TreeNode): TreeNode => {
          // 현재 위치에서 노드 제거
          if (tree.id === parent.id) {
            return {
              ...tree,
              children: tree.children.filter(child => child.id !== nodeId)
            };
          }
          // 상위 레벨에 노드 추가
          if (tree.id === grandParent.id) {
            const updatedNode = {
              ...node,
              level: node.level - 1,
              parentId: grandParent.id,
              type: node.level - 1 === 1 ? 'criteria' : 'subcriteria' as 'criteria' | 'subcriteria'
            };
            return {
              ...tree,
              children: [...tree.children, updatedNode]
            };
          }
          return {
            ...tree,
            children: tree.children.map(updateTree)
          };
        };
        setHierarchy(updateTree(hierarchy));
      }
    } else if (direction === 'down' && parent.children.length > 0) {
      // 하위 레벨로 이동 (첫 번째 형제 노드의 자식으로)
      const siblingNode = parent.children.find(child => child.id !== nodeId);
      if (siblingNode) {
        const updateTree = (tree: TreeNode): TreeNode => {
          // 현재 위치에서 노드 제거
          if (tree.id === parent.id) {
            return {
              ...tree,
              children: tree.children.filter(child => child.id !== nodeId)
            };
          }
          // 형제 노드의 자식으로 추가
          if (tree.id === siblingNode.id) {
            const updatedNode = {
              ...node,
              level: node.level + 1,
              parentId: siblingNode.id,
              type: 'subcriteria' as 'subcriteria'
            };
            return {
              ...tree,
              children: [...tree.children, updatedNode]
            };
          }
          return {
            ...tree,
            children: tree.children.map(updateTree)
          };
        };
        setHierarchy(updateTree(hierarchy));
      }
    }
  };

  // 노드 이름 편집
  const editNodeName = (nodeId: string, newName: string) => {
    const updateNodeName = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, name: newName };
      }
      return {
        ...node,
        children: node.children.map(updateNodeName)
      };
    };

    setHierarchy(updateNodeName(hierarchy));
    setEditingNode(null);
    setEditValue('');
  };

  // 트리 노드 렌더링
  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isEditing = editingNode === node.id;
    const isSelected = selectedNode?.id === node.id;

    // 레벨에 따른 배경색 설정
    const getLevelColor = () => {
      switch (node.level) {
        case 0: return 'bg-blue-50 border-blue-300';
        case 1: return 'bg-green-50 border-green-300';
        case 2: return 'bg-yellow-50 border-yellow-300';
        default: return 'bg-gray-50 border-gray-300';
      }
    };

    return (
      <div key={node.id} className="relative">
        {/* 연결선 (루트 노드가 아닌 경우) */}
        {depth > 0 && (
          <div 
            className="absolute border-l-2 border-gray-300" 
            style={{ 
              left: `${(depth - 1) * 30 + 15}px`, 
              top: '-8px', 
              height: '16px' 
            }}
          />
        )}
        
        <div style={{ marginLeft: `${depth * 30}px` }} className="mb-2">
          <div 
            className={`flex items-center gap-2 p-2 rounded border-2 cursor-pointer transition-all
              ${getLevelColor()}
              ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
            onClick={() => setSelectedNode(node)}
          >
            {/* 노드 타입 아이콘 */}
            <span className="text-xl">
              {node.type === 'goal' ? '🎯' : node.type === 'criteria' ? '📋' : '📌'}
            </span>
          
          {/* 노드 이름 */}
          {isEditing ? (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => editNodeName(node.id, editValue)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editNodeName(node.id, editValue);
                }
              }}
              className="px-2 py-1 border rounded"
              autoFocus
            />
          ) : (
            <span 
              className="flex-1 font-medium"
              onDoubleClick={() => {
                setEditingNode(node.id);
                setEditValue(node.name);
              }}
            >
              {node.name}
            </span>
          )}

          {/* 액션 버튼 */}
          {node.id !== 'root' && (
            <div className="flex gap-1">
              {node.level > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveNodeLevel(node.id, 'up');
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="상위로 이동"
                >
                  ↑
                </button>
              )}
              {node.level < 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveNodeLevel(node.id, 'down');
                  }}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  title="하위로 이동"
                >
                  ↓
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                title="삭제"
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        {/* 자식 노드들 */}
        {node.children.length > 0 && (
          <div className="mt-2 relative">
            {/* 자식들을 연결하는 세로선 */}
            {node.children.length > 1 && (
              <div 
                className="absolute border-l-2 border-gray-300" 
                style={{ 
                  left: `${depth * 30 + 15}px`, 
                  top: '0', 
                  height: `calc(100% - 20px)` 
                }}
              />
            )}
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">계층 구조 모델 구축</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowBatchInput(true)}
            variant="outline"
          >
            일괄 입력 (3x3)
          </Button>
          <Button
            onClick={() => onComplete(hierarchy)}
            variant="primary"
          >
            모델 저장
          </Button>
        </div>
      </div>

      {/* 일괄 입력 모달 */}
      {showBatchInput && (
        <Card className="p-4 bg-blue-50 border-blue-300">
          <h3 className="text-lg font-semibold mb-2">일괄 입력</h3>
          <p className="mb-4">3개의 주요 기준과 각각 3개의 하위 기준을 자동으로 생성합니다.</p>
          <div className="flex gap-2">
            <Button onClick={handleBatchInput} variant="primary">
              생성
            </Button>
            <Button onClick={() => setShowBatchInput(false)} variant="outline">
              취소
            </Button>
          </div>
        </Card>
      )}

      {/* 트리 시각화 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">계층 구조</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          {renderTreeNode(hierarchy)}
        </div>
        
        {/* 선택된 노드 정보 */}
        {selectedNode && selectedNode.id !== 'root' && (
          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <h4 className="font-semibold">선택된 노드</h4>
            <p>이름: {selectedNode.name}</p>
            <p>레벨: {selectedNode.level}</p>
            <p>타입: {selectedNode.type}</p>
            <p className="text-sm text-gray-600 mt-2">
              더블클릭으로 이름 편집, 버튼으로 레벨 이동 또는 삭제
            </p>
          </div>
        )}
      </Card>

      {/* 도움말 */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">사용 방법</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• "일괄 입력"으로 3x3 기본 구조를 빠르게 생성할 수 있습니다</li>
          <li>• 노드를 더블클릭하여 이름을 편집할 수 있습니다</li>
          <li>• ↑↓ 버튼으로 노드를 상위/하위 레벨로 이동할 수 있습니다</li>
          <li>• × 버튼으로 노드를 삭제할 수 있습니다</li>
          <li>• 드래그 앤 드롭으로 순서를 변경할 수 있습니다 (추가 예정)</li>
        </ul>
      </Card>
    </div>
  );
};

export default HierarchyTreeBuilder;