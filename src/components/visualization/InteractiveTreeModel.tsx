import React, { useState, useEffect, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface TreeNode {
  id: string;
  name: string;
  type: 'goal' | 'criterion' | 'subcriteria' | 'alternative';
  level: number;
  parent?: string;
  children: string[];
  priority?: number;
  position: { x: number; y: number };
  isCollapsed?: boolean;
}

interface TreeConnection {
  from: string;
  to: string;
}

interface InteractiveTreeModelProps {
  projectId: string;
  onNodeSelect?: (nodeId: string) => void;
  onStructureChange?: (nodes: TreeNode[]) => void;
}

const InteractiveTreeModel: React.FC<InteractiveTreeModelProps> = ({ 
  projectId, 
  onNodeSelect, 
  onStructureChange 
}) => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [connections, setConnections] = useState<TreeConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('vertical');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 가상 트리 데이터 생성
  useEffect(() => {
    generateMockTreeData();
  }, [projectId]);

  const generateMockTreeData = () => {
    const mockNodes: TreeNode[] = [
      {
        id: 'goal',
        name: '소프트웨어 개발자의 AI 활용 방안 중요도 분석',
        type: 'goal',
        level: 0,
        children: ['c1', 'c2', 'c3'],
        position: { x: 400, y: 50 }
      },
      // 1차 기준
      {
        id: 'c1',
        name: '개발 프로세스 효율화',
        type: 'criterion',
        level: 1,
        parent: 'goal',
        children: ['sc1', 'sc2', 'sc3'],
        priority: 0.35,
        position: { x: 200, y: 150 }
      },
      {
        id: 'c2',
        name: '코딩 실무 품질 적합화',
        type: 'criterion',
        level: 1,
        parent: 'goal',
        children: ['sc4', 'sc5', 'sc6'],
        priority: 0.40,
        position: { x: 400, y: 150 }
      },
      {
        id: 'c3',
        name: '개발 프로세스 자동화',
        type: 'criterion',
        level: 1,
        parent: 'goal',
        children: ['sc7', 'sc8', 'sc9'],
        priority: 0.25,
        position: { x: 600, y: 150 }
      },
      // 2차 기준 (하위 기준)
      {
        id: 'sc1',
        name: '코딩 작성 속도 향상',
        type: 'subcriteria',
        level: 2,
        parent: 'c1',
        children: [],
        priority: 0.45,
        position: { x: 100, y: 250 }
      },
      {
        id: 'sc2',
        name: '디버깅 시간 단축',
        type: 'subcriteria',
        level: 2,
        parent: 'c1',
        children: [],
        priority: 0.30,
        position: { x: 200, y: 250 }
      },
      {
        id: 'sc3',
        name: '반복 작업 최소화',
        type: 'subcriteria',
        level: 2,
        parent: 'c1',
        children: [],
        priority: 0.25,
        position: { x: 300, y: 250 }
      },
      {
        id: 'sc4',
        name: '코드 품질 개선 및 최적화',
        type: 'subcriteria',
        level: 2,
        parent: 'c2',
        children: [],
        priority: 0.40,
        position: { x: 350, y: 250 }
      },
      {
        id: 'sc5',
        name: 'AI생성 코딩의 신뢰성',
        type: 'subcriteria',
        level: 2,
        parent: 'c2',
        children: [],
        priority: 0.35,
        position: { x: 400, y: 250 }
      },
      {
        id: 'sc6',
        name: '신규 기술/언어 학습지원',
        type: 'subcriteria',
        level: 2,
        parent: 'c2',
        children: [],
        priority: 0.25,
        position: { x: 450, y: 250 }
      },
      {
        id: 'sc7',
        name: '테스트 케이스 자동 생성',
        type: 'subcriteria',
        level: 2,
        parent: 'c3',
        children: [],
        priority: 0.40,
        position: { x: 550, y: 250 }
      },
      {
        id: 'sc8',
        name: '기술 문서/주석 자동화',
        type: 'subcriteria',
        level: 2,
        parent: 'c3',
        children: [],
        priority: 0.35,
        position: { x: 600, y: 250 }
      },
      {
        id: 'sc9',
        name: '형상관리 및 배포 지원',
        type: 'subcriteria',
        level: 2,
        parent: 'c3',
        children: [],
        priority: 0.25,
        position: { x: 650, y: 250 }
      },
      // 대안들
      {
        id: 'a1',
        name: 'Claude Code',
        type: 'alternative',
        level: 3,
        children: [],
        priority: 0.32,
        position: { x: 150, y: 350 }
      },
      {
        id: 'a2',
        name: 'GitHub Copilot',
        type: 'alternative',
        level: 3,
        children: [],
        priority: 0.28,
        position: { x: 250, y: 350 }
      },
      {
        id: 'a3',
        name: 'Cursor AI',
        type: 'alternative',
        level: 3,
        children: [],
        priority: 0.18,
        position: { x: 350, y: 350 }
      },
      {
        id: 'a4',
        name: 'Tabnine',
        type: 'alternative',
        level: 3,
        children: [],
        priority: 0.12,
        position: { x: 450, y: 350 }
      },
      {
        id: 'a5',
        name: 'Amazon CodeWhisperer',
        type: 'alternative',
        level: 3,
        children: [],
        priority: 0.10,
        position: { x: 550, y: 350 }
      }
    ];

    // 연결선 생성
    const mockConnections: TreeConnection[] = [];
    mockNodes.forEach(node => {
      if (node.parent) {
        mockConnections.push({ from: node.parent, to: node.id });
      }
    });

    setNodes(mockNodes);
    setConnections(mockConnections);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'goal': return '#4F46E5'; // Indigo
      case 'criterion': return '#059669'; // Emerald
      case 'subcriteria': return '#DC2626'; // Red
      case 'alternative': return '#7C3AED'; // Violet
      default: return '#6B7280'; // Gray
    }
  };

  const getNodeWidth = (node: TreeNode) => {
    return Math.max(150, node.name.length * 8);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    onNodeSelect?.(nodeId);
  };

  const handleNodeDragStart = (nodeId: string, event: React.MouseEvent) => {
    setDraggedNode(nodeId);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleNodeDrag = (event: React.MouseEvent) => {
    if (!draggedNode) return;

    const deltaX = (event.clientX - lastMousePos.x) / zoomLevel;
    const deltaY = (event.clientY - lastMousePos.y) / zoomLevel;

    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === draggedNode 
          ? { ...node, position: { x: node.position.x + deltaX, y: node.position.y + deltaY } }
          : node
      )
    );

    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleNodeDragEnd = () => {
    if (draggedNode) {
      setDraggedNode(null);
      onStructureChange?.(nodes);
    }
  };

  const handleCanvasDragStart = (event: React.MouseEvent) => {
    if (!draggedNode) {
      setIsDragging(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleCanvasDrag = (event: React.MouseEvent) => {
    if (isDragging && !draggedNode) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;

      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastMousePos({ x: event.clientX, y: event.clientY });
    } else if (draggedNode) {
      handleNodeDrag(event);
    }
  };

  const handleCanvasDragEnd = () => {
    setIsDragging(false);
    handleNodeDragEnd();
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(2, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    // 뷰 모드 변경 시 노드 위치 재계산
    if (viewMode === 'vertical') {
      // 수평 모드로 전환
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          position: { x: node.level * 200 + 100, y: node.position.x / 2 }
        }))
      );
    } else {
      // 수직 모드로 전환 (원래 위치로)
      generateMockTreeData();
    }
  };

  const toggleNodeCollapse = (nodeId: string) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId
          ? { ...node, isCollapsed: !node.isCollapsed }
          : node
      )
    );
  };

  return (
    <Card title="AHP 모델 구조">
      {/* 컨트롤 패널 */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleZoom(0.1)} size="sm">
            <span className="text-lg">+</span>
          </Button>
          <span className="text-sm font-medium w-16 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button onClick={() => handleZoom(-0.1)} size="sm">
            <span className="text-lg">-</span>
          </Button>
        </div>

        <Button onClick={resetView} variant="secondary" size="sm">
          초기화
        </Button>

        <Button onClick={toggleViewMode} variant="secondary" size="sm">
          {viewMode === 'vertical' ? '수평 보기' : '수직 보기'}
        </Button>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('goal') }}></div>
            <span>목표</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('criterion') }}></div>
            <span>기준</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('subcriteria') }}></div>
            <span>하위기준</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getNodeColor('alternative') }}></div>
            <span>대안</span>
          </div>
        </div>
      </div>

      {/* 트리 시각화 영역 */}
      <div 
        ref={containerRef}
        className="relative w-full h-96 border border-gray-300 rounded-lg overflow-hidden bg-white cursor-move"
        onMouseDown={handleCanvasDragStart}
        onMouseMove={handleCanvasDrag}
        onMouseUp={handleCanvasDragEnd}
        onMouseLeave={handleCanvasDragEnd}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
          }}
        >
          {/* 연결선 그리기 */}
          {connections.map((connection, index) => {
            const fromNode = nodes.find(n => n.id === connection.from);
            const toNode = nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={index}
                x1={fromNode.position.x + getNodeWidth(fromNode) / 2}
                y1={fromNode.position.y + 40}
                x2={toNode.position.x + getNodeWidth(toNode) / 2}
                y2={toNode.position.y}
                stroke="#6B7280"
                strokeWidth="2"
              />
            );
          })}

          {/* 노드 그리기 */}
          {nodes.map((node) => {
            const nodeWidth = getNodeWidth(node);
            const isSelected = selectedNode === node.id;

            return (
              <g key={node.id}>
                {/* 노드 배경 */}
                <rect
                  x={node.position.x}
                  y={node.position.y}
                  width={nodeWidth}
                  height="40"
                  fill={getNodeColor(node.type)}
                  stroke={isSelected ? "#F59E0B" : "transparent"}
                  strokeWidth="3"
                  rx="8"
                  className="cursor-pointer"
                  onMouseDown={(e) => handleNodeDragStart(node.id, e as any)}
                  onClick={() => handleNodeClick(node.id)}
                />

                {/* 노드 텍스트 */}
                <text
                  x={node.position.x + nodeWidth / 2}
                  y={node.position.y + 25}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {node.name.length > 20 ? node.name.substring(0, 17) + '...' : node.name}
                </text>

                {/* 우선순위 표시 */}
                {node.priority && (
                  <text
                    x={node.position.x + nodeWidth - 5}
                    y={node.position.y - 5}
                    textAnchor="end"
                    fill="#374151"
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {(node.priority * 100).toFixed(1)}%
                  </text>
                )}

                {/* 접기/펼치기 버튼 */}
                {node.children.length > 0 && (
                  <circle
                    cx={node.position.x + nodeWidth - 15}
                    cy={node.position.y + 20}
                    r="8"
                    fill="white"
                    stroke={getNodeColor(node.type)}
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => toggleNodeCollapse(node.id)}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* 선택된 노드 정보 */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border max-w-xs">
            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return null;

              return (
                <div>
                  <h4 className="font-bold text-sm mb-2">{node.name}</h4>
                  <div className="text-xs space-y-1">
                    <div>타입: {node.type}</div>
                    <div>레벨: {node.level}</div>
                    {node.priority && (
                      <div>우선순위: {(node.priority * 100).toFixed(1)}%</div>
                    )}
                    {node.children.length > 0 && (
                      <div>하위 요소: {node.children.length}개</div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 사용법 안내 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>사용법:</strong> 노드를 클릭하여 선택하거나 드래그하여 이동할 수 있습니다. 
          캔버스를 드래그하여 전체 뷰를 이동하고, +/- 버튼으로 확대/축소가 가능합니다.
        </p>
      </div>
    </Card>
  );
};

export default InteractiveTreeModel;