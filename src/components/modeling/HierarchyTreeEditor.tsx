/**
 * 고급 AHP 계층구조 트리 편집기
 * 드래그앤드롭 기능과 시각적 편집을 지원하는 대화형 계층구조 편집기
 */

import React, { useState, useEffect, useCallback, useRef, ReactElement } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

// 계층구조 노드 인터페이스
export interface HierarchyNode {
  id: string;
  name: string;
  type: 'goal' | 'criterion' | 'subcriteria' | 'alternative';
  level: number;
  weight?: number;
  children: HierarchyNode[];
  parentId?: string;
  position: { x: number; y: number };
  isExpanded?: boolean;
  isSelected?: boolean;
  description?: string;
  color?: string;
}

// 연결선 정보
interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePoint: { x: number; y: number };
  targetPoint: { x: number; y: number };
}

// 편집 모드
type EditMode = 'view' | 'edit' | 'add' | 'delete' | 'connect';

// 노드 스타일 상수
const NODE_STYLES = {
  goal: {
    width: 180,
    height: 60,
    color: '#3B82F6',
    borderRadius: 8
  },
  criterion: {
    width: 150,
    height: 50,
    color: '#10B981',
    borderRadius: 6
  },
  subcriteria: {
    width: 130,
    height: 45,
    color: '#F59E0B',
    borderRadius: 6
  },
  alternative: {
    width: 120,
    height: 40,
    color: '#8B5CF6',
    borderRadius: 4
  }
};

// 레벨별 Y 좌표
const LEVEL_Y_POSITIONS: { [key: number]: number } = {
  0: 50,    // Goal
  1: 200,   // Criteria
  2: 350,   // Subcriteria
  3: 500    // Alternatives
};

interface HierarchyTreeEditorProps {
  initialHierarchy?: HierarchyNode;
  onHierarchyChange?: (hierarchy: HierarchyNode) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  className?: string;
  readOnly?: boolean;
}

const HierarchyTreeEditor: React.FC<HierarchyTreeEditorProps> = ({
  initialHierarchy,
  onHierarchyChange,
  onValidationChange,
  className = '',
  readOnly = false
}) => {
  // 상태 관리
  const [hierarchy, setHierarchy] = useState<HierarchyNode | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('view');
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<HierarchyNode | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showProperties, setShowProperties] = useState(false);
  
  // 참조
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // 초기 계층구조 설정
  useEffect(() => {
    if (initialHierarchy) {
      setHierarchy(initialHierarchy);
    } else {
      // 기본 샘플 계층구조 생성
      setHierarchy(createSampleHierarchy());
    }
  }, [initialHierarchy]);

  // 계층구조 변경 시 콜백 호출
  useEffect(() => {
    if (hierarchy && onHierarchyChange) {
      onHierarchyChange(hierarchy);
    }
    validateHierarchy();
  }, [hierarchy, onHierarchyChange]);

  // 기본 샘플 계층구조 생성
  const createSampleHierarchy = (): HierarchyNode => {
    return {
      id: 'goal-1',
      name: '신기술 도입 우선순위',
      type: 'goal',
      level: 0,
      position: { x: 400, y: 50 },
      isExpanded: true,
      color: NODE_STYLES.goal.color,
      children: [
        {
          id: 'criterion-1',
          name: '비용 효율성',
          type: 'criterion',
          level: 1,
          position: { x: 200, y: 200 },
          parentId: 'goal-1',
          weight: 0.35,
          isExpanded: true,
          color: NODE_STYLES.criterion.color,
          children: [
            {
              id: 'alt-1-1',
              name: 'AI/머신러닝',
              type: 'alternative',
              level: 3,
              position: { x: 100, y: 500 },
              parentId: 'criterion-1',
              children: [],
              color: NODE_STYLES.alternative.color
            },
            {
              id: 'alt-1-2',
              name: '클라우드 컴퓨팅',
              type: 'alternative',
              level: 3,
              position: { x: 250, y: 500 },
              parentId: 'criterion-1',
              children: [],
              color: NODE_STYLES.alternative.color
            }
          ]
        },
        {
          id: 'criterion-2',
          name: '기술 성숙도',
          type: 'criterion',
          level: 1,
          position: { x: 400, y: 200 },
          parentId: 'goal-1',
          weight: 0.28,
          isExpanded: true,
          color: NODE_STYLES.criterion.color,
          children: [
            {
              id: 'alt-2-1',
              name: 'IoT 시스템',
              type: 'alternative',
              level: 3,
              position: { x: 400, y: 500 },
              parentId: 'criterion-2',
              children: [],
              color: NODE_STYLES.alternative.color
            }
          ]
        },
        {
          id: 'criterion-3',
          name: '전략적 중요성',
          type: 'criterion',
          level: 1,
          position: { x: 600, y: 200 },
          parentId: 'goal-1',
          weight: 0.22,
          isExpanded: true,
          color: NODE_STYLES.criterion.color,
          children: [
            {
              id: 'alt-3-1',
              name: '블록체인',
              type: 'alternative',
              level: 3,
              position: { x: 600, y: 500 },
              parentId: 'criterion-3',
              children: [],
              color: NODE_STYLES.alternative.color
            }
          ]
        }
      ]
    };
  };

  // 계층구조 유효성 검사
  const validateHierarchy = useCallback(() => {
    if (!hierarchy) return;

    const errors: string[] = [];

    // 1. 목표 노드 존재 확인
    if (hierarchy.type !== 'goal') {
      errors.push('최상위 노드는 목표(Goal) 타입이어야 합니다.');
    }

    // 2. 각 레벨에 최소 노드 수 확인
    const levelCounts = countNodesByLevel(hierarchy);
    if (levelCounts[1] < 2) {
      errors.push('최소 2개 이상의 평가 기준이 필요합니다.');
    }
    if (levelCounts[3] < 2) {
      errors.push('최소 2개 이상의 대안이 필요합니다.');
    }

    // 3. 가중치 합계 확인 (기준 레벨)
    const criteriaNodes = getAllNodesAtLevel(hierarchy, 1);
    const weightSum = criteriaNodes.reduce((sum, node) => sum + (node.weight || 0), 0);
    if (Math.abs(weightSum - 1) > 0.01) {
      errors.push(`기준 가중치의 합이 1이 아닙니다. (현재: ${weightSum.toFixed(3)})`);
    }

    // 4. 각 기준에 대안 연결 확인
    criteriaNodes.forEach(criterion => {
      const alternatives = getAllAlternatives(hierarchy);
      if (alternatives.length === 0) {
        errors.push(`기준 '${criterion.name}'에 연결된 대안이 없습니다.`);
      }
    });

    setValidationErrors(errors);
    
    if (onValidationChange) {
      onValidationChange(errors.length === 0, errors);
    }
  }, [hierarchy, onValidationChange]);

  // 레벨별 노드 수 계산
  const countNodesByLevel = (node: HierarchyNode): { [level: number]: number } => {
    const counts: { [level: number]: number } = {};
    
    const countRecursive = (n: HierarchyNode) => {
      counts[n.level] = (counts[n.level] || 0) + 1;
      n.children.forEach(countRecursive);
    };
    
    countRecursive(node);
    return counts;
  };

  // 특정 레벨의 모든 노드 가져오기
  const getAllNodesAtLevel = (node: HierarchyNode, targetLevel: number): HierarchyNode[] => {
    const nodes: HierarchyNode[] = [];
    
    const searchRecursive = (n: HierarchyNode) => {
      if (n.level === targetLevel) {
        nodes.push(n);
      }
      n.children.forEach(searchRecursive);
    };
    
    searchRecursive(node);
    return nodes;
  };

  // 모든 대안 노드 가져오기
  const getAllAlternatives = (node: HierarchyNode): HierarchyNode[] => {
    return getAllNodesAtLevel(node, 3);
  };

  // 노드 추가
  const addNode = (parentId: string, nodeType: HierarchyNode['type']) => {
    if (!hierarchy || readOnly) return;

    const newNode: HierarchyNode = {
      id: `${nodeType}-${Date.now()}`,
      name: `새 ${getNodeTypeName(nodeType)}`,
      type: nodeType,
      level: getNodeLevel(nodeType),
      position: calculateNewNodePosition(parentId, nodeType),
      parentId,
      children: [],
      weight: nodeType === 'criterion' ? 0.1 : undefined,
      color: NODE_STYLES[nodeType].color,
      isExpanded: true
    };

    const updatedHierarchy = addNodeToHierarchy(hierarchy, parentId, newNode);
    setHierarchy(updatedHierarchy);
    setSelectedNode(newNode);
    setEditMode('edit');
  };

  // 계층구조에 노드 추가
  const addNodeToHierarchy = (root: HierarchyNode, parentId: string, newNode: HierarchyNode): HierarchyNode => {
    if (root.id === parentId) {
      return {
        ...root,
        children: [...root.children, newNode]
      };
    }

    return {
      ...root,
      children: root.children.map(child => addNodeToHierarchy(child, parentId, newNode))
    };
  };

  // 새 노드 위치 계산
  const calculateNewNodePosition = (parentId: string, nodeType: HierarchyNode['type']): { x: number; y: number } => {
    if (!hierarchy) return { x: 100, y: 100 };

    const parentNode = findNodeById(hierarchy, parentId);
    if (!parentNode) return { x: 100, y: 100 };

    const level = getNodeLevel(nodeType);
    const siblingsCount = parentNode.children.length;
    
    return {
      x: parentNode.position.x + (siblingsCount * 150) - (siblingsCount * 75),
      y: LEVEL_Y_POSITIONS[level] || (parentNode.position.y + 150)
    };
  };

  // ID로 노드 찾기
  const findNodeById = (root: HierarchyNode, targetId: string): HierarchyNode | null => {
    if (root.id === targetId) return root;
    
    for (const child of root.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
    
    return null;
  };

  // 노드 타입 이름 가져오기
  const getNodeTypeName = (type: HierarchyNode['type']): string => {
    const names = {
      goal: '목표',
      criterion: '기준',
      subcriteria: '하위기준',
      alternative: '대안'
    };
    return names[type];
  };

  // 노드 레벨 가져오기
  const getNodeLevel = (type: HierarchyNode['type']): number => {
    const levels = {
      goal: 0,
      criterion: 1,
      subcriteria: 2,
      alternative: 3
    };
    return levels[type];
  };

  // 노드 삭제
  const deleteNode = (nodeId: string) => {
    if (!hierarchy || readOnly) return;

    const updatedHierarchy = deleteNodeFromHierarchy(hierarchy, nodeId);
    setHierarchy(updatedHierarchy);
    setSelectedNode(null);
  };

  // 계층구조에서 노드 삭제
  const deleteNodeFromHierarchy = (root: HierarchyNode, targetId: string): HierarchyNode => {
    return {
      ...root,
      children: root.children
        .filter(child => child.id !== targetId)
        .map(child => deleteNodeFromHierarchy(child, targetId))
    };
  };

  // 노드 업데이트
  const updateNode = (nodeId: string, updates: Partial<HierarchyNode>) => {
    if (!hierarchy || readOnly) return;

    const updatedHierarchy = updateNodeInHierarchy(hierarchy, nodeId, updates);
    setHierarchy(updatedHierarchy);
  };

  // 계층구조에서 노드 업데이트
  const updateNodeInHierarchy = (root: HierarchyNode, targetId: string, updates: Partial<HierarchyNode>): HierarchyNode => {
    if (root.id === targetId) {
      return { ...root, ...updates };
    }

    return {
      ...root,
      children: root.children.map(child => updateNodeInHierarchy(child, targetId, updates))
    };
  };

  // 자동 레이아웃
  const autoLayout = () => {
    if (!hierarchy) return;

    const layoutHierarchy = autoLayoutHierarchy(hierarchy);
    setHierarchy(layoutHierarchy);
  };

  // 자동 레이아웃 계산
  const autoLayoutHierarchy = (root: HierarchyNode): HierarchyNode => {
    const layoutNode = (node: HierarchyNode, parentX: number = 400, siblingIndex: number = 0, totalSiblings: number = 1): HierarchyNode => {
      const levelY = LEVEL_Y_POSITIONS[node.level] || 100;
      const spacing = 200;
      const startX = parentX - ((totalSiblings - 1) * spacing) / 2;
      const nodeX = startX + (siblingIndex * spacing);

      const layoutChildren = node.children.map((child, index) => 
        layoutNode(child, nodeX, index, node.children.length)
      );

      return {
        ...node,
        position: { x: nodeX, y: levelY },
        children: layoutChildren
      };
    };

    return layoutNode(root);
  };

  // 노드 렌더링
  const renderNode = (node: HierarchyNode) => {
    const style = NODE_STYLES[node.type];
    const isSelected = selectedNode?.id === node.id;
    
    return (
      <div
        key={node.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'shadow-lg ring-2 ring-blue-400' : 'shadow-md'
        }`}
        style={{
          left: node.position.x - style.width / 2,
          top: node.position.y - style.height / 2,
          width: style.width,
          height: style.height,
          backgroundColor: node.color || style.color,
          borderRadius: style.borderRadius,
          transform: `scale(${zoomLevel})`
        }}
        onClick={() => setSelectedNode(node)}
        onDoubleClick={() => !readOnly && setEditMode('edit')}
        draggable={!readOnly}
        onDragStart={(e) => {
          setDraggedNode(node);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => setDraggedNode(null)}
      >
        <div className="p-2 h-full flex flex-col justify-center items-center text-white text-sm font-medium">
          <div className="text-center line-clamp-2">{node.name}</div>
          {node.weight && (
            <div className="text-xs opacity-80">
              {(node.weight * 100).toFixed(1)}%
            </div>
          )}
        </div>
        
        {/* 노드 조작 버튼 */}
        {!readOnly && isSelected && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProperties(true);
              }}
              className="w-6 h-6 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              title="속성 편집"
            >
              ✏️
            </button>
            {node.type !== 'goal' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                title="삭제"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // 연결선 계산
  const calculateConnections = (node: HierarchyNode): Connection[] => {
    const connections: Connection[] = [];
    
    const calculateNodeConnections = (n: HierarchyNode) => {
      n.children.forEach(child => {
        connections.push({
          id: `${n.id}-${child.id}`,
          sourceId: n.id,
          targetId: child.id,
          sourcePoint: {
            x: n.position.x,
            y: n.position.y + NODE_STYLES[n.type].height / 2
          },
          targetPoint: {
            x: child.position.x,
            y: child.position.y - NODE_STYLES[child.type].height / 2
          }
        });
        calculateNodeConnections(child);
      });
    };
    
    calculateNodeConnections(node);
    return connections;
  };

  // 연결선 렌더링
  const renderConnections = () => {
    if (!hierarchy) return null;

    const connections = calculateConnections(hierarchy);
    
    return (
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {connections.map(connection => (
          <line
            key={connection.id}
            x1={connection.sourcePoint.x}
            y1={connection.sourcePoint.y}
            x2={connection.targetPoint.x}
            y2={connection.targetPoint.y}
            stroke="#6B7280"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        ))}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6B7280"
            />
          </marker>
        </defs>
      </svg>
    );
  };

  // 그리드 렌더링
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSize = 50;
    const canvasWidth = 1200;
    const canvasHeight = 800;

    return (
      <div className="absolute inset-0 opacity-20" style={{ zIndex: 0 }}>
        <svg width={canvasWidth} height={canvasHeight}>
          <defs>
            <pattern
              id="grid"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    );
  };

  // 노드 속성 편집 패널
  const renderPropertyPanel = () => {
    if (!showProperties || !selectedNode) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">노드 속성 편집</h3>
            <button
              onClick={() => setShowProperties(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">노드 이름</label>
              <input
                type="text"
                value={selectedNode.name}
                onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            {selectedNode.type === 'criterion' && (
              <div>
                <label className="block text-sm font-medium mb-1">가중치</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedNode.weight || 0}
                  onChange={(e) => updateNode(selectedNode.id, { weight: parseFloat(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">설명</label>
              <textarea
                value={selectedNode.description || ''}
                onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="노드에 대한 설명을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">색상</label>
              <input
                type="color"
                value={selectedNode.color || NODE_STYLES[selectedNode.type].color}
                onChange={(e) => updateNode(selectedNode.id, { color: e.target.value })}
                className="w-full border rounded px-3 py-2 h-10"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="secondary" onClick={() => setShowProperties(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={() => setShowProperties(false)}>
              확인
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!hierarchy) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 도구 모음 */}
      <Card title="계층구조 편집기">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {!readOnly && (
              <>
                <Button
                  variant={editMode === 'add' ? 'primary' : 'secondary'}
                  onClick={() => setEditMode(editMode === 'add' ? 'view' : 'add')}
                >
                  ➕ 노드 추가
                </Button>
                <Button variant="secondary" onClick={autoLayout}>
                  🔄 자동 정렬
                </Button>
              </>
            )}
            <Button
              variant={showGrid ? 'primary' : 'secondary'}
              onClick={() => setShowGrid(!showGrid)}
            >
              📏 격자 {showGrid ? '숨김' : '표시'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">확대/축소:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-12">{Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>
        </div>

        {/* 유효성 검사 결과 */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="text-red-800 font-medium mb-2">유효성 검사 오류:</h4>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 선택된 노드 정보 */}
        {selectedNode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">선택된 노드:</span>
                <span className="ml-2">{selectedNode.name}</span>
                <span className="ml-2 text-gray-600">({getNodeTypeName(selectedNode.type)})</span>
              </div>
              {!readOnly && editMode === 'add' && (
                <div className="flex space-x-2">
                  {selectedNode.type === 'goal' && (
                    <Button
                      variant="primary"
                      onClick={() => addNode(selectedNode.id, 'criterion')}
                      className="text-xs"
                    >
                      + 기준 추가
                    </Button>
                  )}
                  {selectedNode.type === 'criterion' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => addNode(selectedNode.id, 'subcriteria')}
                        className="text-xs"
                      >
                        + 하위기준 추가
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => addNode(selectedNode.id, 'alternative')}
                        className="text-xs"
                      >
                        + 대안 추가
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 캔버스 영역 */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div
            ref={canvasRef}
            className="relative"
            style={{
              width: '100%',
              height: '600px',
              backgroundColor: '#FAFAFA'
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedNode) {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  updateNode(draggedNode.id, { position: { x, y } });
                }
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* 그리드 */}
            {renderGrid()}
            
            {/* 연결선 */}
            {renderConnections()}
            
            {/* 노드들 */}
            <div style={{ zIndex: 2 }}>
              {hierarchy && renderNode(hierarchy)}
              {hierarchy?.children.map(child => (
                <div key={child.id}>
                  {renderNode(child)}
                  {child.children.map(grandChild => renderNode(grandChild))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 속성 편집 패널 */}
      {renderPropertyPanel()}
    </div>
  );
};

export default HierarchyTreeEditor;