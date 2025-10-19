import React from 'react';

interface TreeNode {
  id: string;
  name: string;
  description?: string;
  level: number;
  children?: TreeNode[];
  weight?: number;
  parent_id?: string | null;
}

interface HierarchyTreeVisualizationProps {
  nodes: TreeNode[];
  title?: string;
  showWeights?: boolean;
  interactive?: boolean;
  onNodeClick?: (node: TreeNode) => void;
  onNodeDelete?: (node: TreeNode) => void;
  layout?: 'vertical' | 'horizontal';
  onLayoutChange?: (layout: 'vertical' | 'horizontal') => void;
  allowDelete?: boolean;
}

const HierarchyTreeVisualization: React.FC<HierarchyTreeVisualizationProps> = ({
  nodes,
  title = "계층구조",
  showWeights = false,
  interactive = false,
  onNodeClick,
  onNodeDelete,
  layout = 'vertical',
  onLayoutChange,
  allowDelete = false
}) => {
  // 노드를 계층구조로 변환
  const buildHierarchy = (flatNodes: TreeNode[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // 먼저 모든 노드를 맵에 저장
    flatNodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // 부모-자식 관계 설정
    flatNodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)!;
      if (node.parent_id && nodeMap.has(node.parent_id)) {
        const parent = nodeMap.get(node.parent_id)!;
        if (!parent.children) parent.children = [];
        parent.children.push(nodeWithChildren);
      } else {
        rootNodes.push(nodeWithChildren);
      }
    });

    return rootNodes;
  };

  const hierarchy = buildHierarchy(nodes);

  const getNodeIcon = (node: TreeNode) => {
    switch (node.level) {
      case 1: return '🎯'; // 목표(Goal)
      case 2: return '📋'; // 기준(Criteria)
      case 3: return '🎪'; // 대안(Alternatives)
      case 4: return '📝'; // 하위기준(Sub-criteria)
      case 5: return '🔹'; // 세부기준(Detailed criteria)
      default: return '📄';
    }
  };

  const getNodeColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 border-blue-300 text-blue-800';
      case 2: return 'bg-green-100 border-green-300 text-green-800';
      case 3: return 'bg-purple-100 border-purple-300 text-purple-800';
      case 4: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 5: return 'bg-pink-100 border-pink-300 text-pink-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const renderVerticalNode = (node: TreeNode, index: number, isLast: boolean[] = []): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isClickable = interactive && onNodeClick;

    return (
      <div key={node.id} className="relative">
        {/* 연결선 그리기 */}
        {node.level > 1 && (
          <>
            {/* 수직선 */}
            <div 
              className="absolute w-px bg-gray-300 -left-6 top-0"
              style={{ height: '24px' }}
            />
            {/* 수평선 */}
            <div 
              className="absolute h-px bg-gray-300 -left-6 top-6"
              style={{ width: '24px' }}
            />
          </>
        )}

        {/* 노드 박스 */}
        <div 
          className={`
            mb-3 p-3 rounded-lg border-2 transition-all duration-200 
            ${getNodeColor(node.level)}
            ${isClickable ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
            ${hasChildren ? 'font-medium' : ''}
          `}
          onClick={() => isClickable && onNodeClick!(node)}
          style={{ marginLeft: `${(node.level - 1) * 32}px` }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getNodeIcon(node)}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{node.name}</div>
                  {node.description && (
                    <div className="text-xs opacity-75 mt-1">{node.description}</div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {showWeights && node.weight && (
                    <div className="text-xs font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                      {(node.weight * 100).toFixed(1)}%
                    </div>
                  )}
                  {allowDelete && onNodeDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`"${node.name}" 기준을 삭제하시겠습니까?\n\n⚠️ 하위 기준들도 함께 삭제됩니다.`)) {
                          onNodeDelete(node);
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors duration-200"
                      title={`${node.name} 삭제`}
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            {hasChildren && (
              <span className="text-xs text-gray-600">
                ({node.children!.length}개 하위)
              </span>
            )}
          </div>
        </div>

        {/* 하위 노드들 렌더링 */}
        {hasChildren && (
          <div className="relative">
            {node.children!.map((child, childIndex) => {
              const childIsLast = [...isLast, childIndex === node.children!.length - 1];
              return renderVerticalNode(child, childIndex, childIsLast);
            })}
          </div>
        )}
      </div>
    );
  };

  const renderHorizontalNode = (node: TreeNode): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isClickable = interactive && onNodeClick;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* 노드 박스 */}
        <div 
          className={`
            relative p-3 rounded-lg border-2 transition-all duration-200 min-w-[120px] text-center
            ${getNodeColor(node.level)}
            ${isClickable ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
            ${hasChildren ? 'font-medium' : ''}
          `}
          onClick={() => isClickable && onNodeClick!(node)}
        >
          {allowDelete && onNodeDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`"${node.name}" 기준을 삭제하시겠습니까?\n\n⚠️ 하위 기준들도 함께 삭제됩니다.`)) {
                  onNodeDelete(node);
                }
              }}
              className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors duration-200"
              title={`${node.name} 삭제`}
            >
              <span className="text-xs">🗑️</span>
            </button>
          )}
          
          <div className="flex flex-col items-center space-y-1">
            <span className="text-lg">{getNodeIcon(node)}</span>
            <div className="font-medium text-sm">{node.name}</div>
            {node.description && (
              <div className="text-xs opacity-75">{node.description}</div>
            )}
            {showWeights && node.weight && (
              <div className="text-xs font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                {(node.weight * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        {/* 하위 노드들 렌더링 */}
        {hasChildren && (
          <div className="relative mt-8">
            {/* 부모에서 자식들로의 연결선 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              {/* 세로 연결선 */}
              <div className="w-px h-4 bg-gray-300 -mt-8"></div>
            </div>
            
            {/* 자식 노드가 여러 개일 때 가로 연결선 */}
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-0 right-0 flex justify-center -mt-4">
                <div 
                  className="h-px bg-gray-300" 
                  style={{
                    width: `${(node.children!.length - 1) * 150}px`,
                    marginLeft: '75px',
                    marginRight: '75px'
                  }}
                />
              </div>
            )}
            
            {/* 각 자식 노드로의 세로 연결선 */}
            <div className="flex space-x-6 justify-center">
              {node.children!.map((child, index) => (
                <div key={child.id} className="relative">
                  {/* 가로선에서 각 자식으로의 세로 연결선 */}
                  {node.children!.length > 1 && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-4 bg-gray-300 -mt-4"></div>
                  )}
                  {renderHorizontalNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (hierarchy.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🌳</div>
        <p className="text-lg">계층구조가 비어있습니다</p>
        <p className="text-sm">기준을 추가하여 계층구조를 만들어보세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">🌳</span>
          {title}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            총 {nodes.length}개 노드
          </div>
          {onLayoutChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">레이아웃:</span>
              <button
                onClick={() => onLayoutChange('vertical')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  layout === 'vertical' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📋 세로형
              </button>
              <button
                onClick={() => onLayoutChange('horizontal')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  layout === 'horizontal' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📊 가로형
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 계층구조 렌더링 */}
      <div className={layout === 'horizontal' ? 'overflow-x-auto pb-8' : 'space-y-2'}>
        {layout === 'vertical' ? (
          <div className="space-y-2">
            {hierarchy.map((node, index) => renderVerticalNode(node, index))}
          </div>
        ) : (
          <div className="flex justify-center min-w-max py-8">
            <div className="inline-block">
              {/* 루트 노드가 하나인 경우와 여러 개인 경우를 구분 */}
              {hierarchy.length === 1 ? (
                renderHorizontalNode(hierarchy[0])
              ) : (
                <div className="flex space-x-8">
                  {hierarchy.map((node) => renderHorizontalNode(node))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">범례</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎯</span>
            <span>목표 (L1)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📋</span>
            <span>기준 (L2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎪</span>
            <span>대안 (L3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📝</span>
            <span>하위기준 (L4)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔹</span>
            <span>세부기준 (L5)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchyTreeVisualization;