/**
 * 고급 AHP 모델 시각화 컴포넌트
 * 다양한 시각화 모드와 대화형 기능을 제공
 */

import React, { useState, useEffect, useRef, useCallback, ReactElement } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { HierarchyNode } from './HierarchyTreeEditor';

// 시각화 모드
type VisualizationMode = 'tree' | 'network' | 'hierarchy' | 'matrix' | 'sunburst' | 'treemap';

// 노드 상태
interface NodeVisualizationState {
  id: string;
  visible: boolean;
  highlighted: boolean;
  opacity: number;
  scale: number;
  color: string;
}

// 애니메이션 설정
interface AnimationSettings {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay: number;
}

// 레이아웃 설정
interface LayoutSettings {
  spacing: number;
  padding: number;
  nodeSize: number;
  showLabels: boolean;
  showWeights: boolean;
  showConnections: boolean;
  compactMode: boolean;
}

// 필터 설정
interface FilterSettings {
  minWeight: number;
  maxWeight: number;
  showOnlyType: HierarchyNode['type'] | 'all';
  hideEmptyNodes: boolean;
}

interface ModelVisualizationProps {
  hierarchy: HierarchyNode;
  mode?: VisualizationMode;
  onNodeClick?: (node: HierarchyNode) => void;
  onNodeHover?: (node: HierarchyNode | null) => void;
  className?: string;
  showControls?: boolean;
  interactive?: boolean;
}

const ModelVisualization: React.FC<ModelVisualizationProps> = ({
  hierarchy,
  mode = 'tree',
  onNodeClick,
  onNodeHover,
  className = '',
  showControls = true,
  interactive = true
}) => {
  // 상태 관리
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(mode);
  const [nodeStates, setNodeStates] = useState<Map<string, NodeVisualizationState>>(new Map());
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>({
    enabled: true,
    duration: 500,
    easing: 'ease-in-out',
    delay: 0
  });
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    spacing: 150,
    padding: 50,
    nodeSize: 80,
    showLabels: true,
    showWeights: true,
    showConnections: true,
    compactMode: false
  });
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    minWeight: 0,
    maxWeight: 1,
    showOnlyType: 'all',
    hideEmptyNodes: false
  });
  const [hoveredNode, setHoveredNode] = useState<HierarchyNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);

  // 참조
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 초기화
  useEffect(() => {
    initializeNodeStates();
  }, [hierarchy]);

  // 노드 상태 초기화
  const initializeNodeStates = () => {
    const states = new Map<string, NodeVisualizationState>();
    
    const initializeNode = (node: HierarchyNode) => {
      states.set(node.id, {
        id: node.id,
        visible: true,
        highlighted: false,
        opacity: 1,
        scale: 1,
        color: node.color || getDefaultNodeColor(node.type)
      });
      
      node.children.forEach(initializeNode);
    };
    
    initializeNode(hierarchy);
    setNodeStates(states);
  };

  // 기본 노드 색상 가져오기
  const getDefaultNodeColor = (type: HierarchyNode['type']): string => {
    const colors = {
      goal: '#3B82F6',
      criterion: '#10B981',
      subcriteria: '#F59E0B',
      alternative: '#8B5CF6'
    };
    return colors[type];
  };

  // 트리 뷰 렌더링
  const renderTreeView = () => {
    const treeData = convertToTreeData(hierarchy);
    
    return (
      <div className="p-4">
        <svg
          ref={svgRef}
          width="100%"
          height="500"
          viewBox="0 0 1000 500"
          className="border rounded"
        >
          {renderTreeNode(hierarchy, 500, 50, 0, [])}
        </svg>
      </div>
    );
  };

  // 트리 노드 렌더링
  const renderTreeNode = (
    node: HierarchyNode,
    x: number,
    y: number,
    level: number,
    siblings: HierarchyNode[]
  ): ReactElement[] => {
    const elements: ReactElement[] = [];
    const nodeState = nodeStates.get(node.id);
    
    if (!nodeState?.visible || !passesFilter(node)) return elements;

    // 노드 크기 계산
    const nodeWidth = layoutSettings.nodeSize;
    const nodeHeight = layoutSettings.nodeSize * 0.6;
    
    // 자식 노드들의 위치 계산
    const childCount = node.children.length;
    const totalWidth = childCount * layoutSettings.spacing;
    const startX = x - totalWidth / 2 + layoutSettings.spacing / 2;
    
    // 연결선 그리기
    if (layoutSettings.showConnections && level > 0) {
      const parentY = y - 100;
      elements.push(
        <line
          key={`connection-${node.id}`}
          x1={x}
          y1={parentY + nodeHeight / 2}
          x2={x}
          y2={y - nodeHeight / 2}
          stroke="#6B7280"
          strokeWidth="2"
          opacity={nodeState.opacity}
          className={`transition-opacity duration-${animationSettings.duration}`}
        />
      );
    }

    // 노드 그리기
    elements.push(
      <g
        key={`node-${node.id}`}
        transform={`translate(${x - nodeWidth / 2}, ${y - nodeHeight / 2}) scale(${nodeState.scale})`}
        onClick={() => handleNodeClick(node)}
        onMouseEnter={() => handleNodeHover(node)}
        onMouseLeave={() => handleNodeHover(null)}
        className={`cursor-pointer transition-transform duration-${animationSettings.duration} ${
          interactive ? 'hover:scale-110' : ''
        }`}
      >
        {/* 노드 배경 */}
        <rect
          width={nodeWidth}
          height={nodeHeight}
          rx="8"
          fill={nodeState.highlighted ? '#FEF3C7' : nodeState.color}
          stroke={selectedNode?.id === node.id ? '#3B82F6' : 'transparent'}
          strokeWidth="3"
          opacity={nodeState.opacity}
          filter={hoveredNode?.id === node.id ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : 'none'}
        />
        
        {/* 노드 텍스트 */}
        {layoutSettings.showLabels && (
          <text
            x={nodeWidth / 2}
            y={nodeHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="600"
            className="pointer-events-none"
          >
            <tspan x={nodeWidth / 2} dy="-0.3em">
              {truncateText(node.name, 12)}
            </tspan>
            {layoutSettings.showWeights && node.weight && (
              <tspan x={nodeWidth / 2} dy="1.2em" fontSize="10">
                {(node.weight * 100).toFixed(1)}%
              </tspan>
            )}
          </text>
        )}
        
        {/* 노드 타입 아이콘 */}
        <text
          x={nodeWidth - 15}
          y={15}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="white"
          className="pointer-events-none"
        >
          {getNodeTypeIcon(node.type)}
        </text>
      </g>
    );

    // 자식 노드들 렌더링
    node.children.forEach((child, index) => {
      const childX = startX + index * layoutSettings.spacing;
      const childY = y + 100;
      elements.push(...renderTreeNode(child, childX, childY, level + 1, node.children));
    });

    return elements;
  };

  // 네트워크 뷰 렌더링
  const renderNetworkView = () => {
    const nodes = getAllNodes(hierarchy);
    const links = getAllLinks(hierarchy);
    
    return (
      <div className="p-4">
        <svg
          ref={svgRef}
          width="100%"
          height="500"
          viewBox="0 0 1000 500"
          className="border rounded"
        >
          {/* 링크 렌더링 */}
          {links.map(link => (
            <line
              key={`link-${link.source}-${link.target}`}
              x1={link.sourcePos.x}
              y1={link.sourcePos.y}
              x2={link.targetPos.x}
              y2={link.targetPos.y}
              stroke="#6B7280"
              strokeWidth="2"
              opacity="0.6"
            />
          ))}
          
          {/* 노드 렌더링 */}
          {nodes.map(node => {
            const nodeState = nodeStates.get(node.id);
            if (!nodeState?.visible || !passesFilter(node)) return null;
            
            return (
              <g
                key={`network-node-${node.id}`}
                transform={`translate(${node.position.x}, ${node.position.y})`}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => handleNodeHover(node)}
                onMouseLeave={() => handleNodeHover(null)}
                className="cursor-pointer"
              >
                <circle
                  r={30}
                  fill={nodeState.color}
                  stroke={selectedNode?.id === node.id ? '#3B82F6' : 'transparent'}
                  strokeWidth="3"
                  opacity={nodeState.opacity}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="600"
                >
                  {truncateText(node.name, 8)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // 매트릭스 뷰 렌더링
  const renderMatrixView = () => {
    const criteria = getAllNodesAtLevel(hierarchy, 1);
    const alternatives = getAllNodesAtLevel(hierarchy, 3);
    
    return (
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">대안 / 기준</th>
                {criteria.map(criterion => (
                  <th
                    key={criterion.id}
                    className="border border-gray-300 px-4 py-2 text-center cursor-pointer hover:bg-gray-100"
                    onClick={() => handleNodeClick(criterion)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{criterion.name}</span>
                      {criterion.weight && (
                        <span className="text-xs text-gray-500">
                          {(criterion.weight * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 text-center">총점</th>
              </tr>
            </thead>
            <tbody>
              {alternatives.map(alternative => {
                const scores = criteria.map(criterion => Math.random() * 0.5 + 0.25); // 임시 점수
                const totalScore = scores.reduce((sum, score, index) => 
                  sum + score * (criteria[index].weight || 0), 0);
                
                return (
                  <tr
                    key={alternative.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleNodeClick(alternative)}
                  >
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {alternative.name}
                    </td>
                    {scores.map((score, index) => (
                      <td
                        key={index}
                        className="border border-gray-300 px-4 py-2 text-center"
                      >
                        <div
                          className="w-full h-6 flex items-center justify-center rounded"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${score})`,
                            color: score > 0.5 ? 'white' : 'black'
                          }}
                        >
                          {score.toFixed(3)}
                        </div>
                      </td>
                    ))}
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {totalScore.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 선버스트 차트 렌더링
  const renderSunburstView = () => {
    const centerX = 250;
    const centerY = 250;
    const maxRadius = 200;
    
    return (
      <div className="p-4 flex justify-center">
        <svg width="500" height="500" viewBox="0 0 500 500" className="border rounded">
          {renderSunburstNode(hierarchy, centerX, centerY, 0, maxRadius, 0, 360)}
        </svg>
      </div>
    );
  };

  // 선버스트 노드 렌더링
  const renderSunburstNode = (
    node: HierarchyNode,
    centerX: number,
    centerY: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ): ReactElement[] => {
    const elements: ReactElement[] = [];
    const nodeState = nodeStates.get(node.id);
    
    if (!nodeState?.visible || !passesFilter(node)) return elements;

    // 현재 노드의 섹터 그리기
    if (innerRadius > 0) {
      const path = describeSector(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle);
      
      elements.push(
        <path
          key={`sunburst-${node.id}`}
          d={path}
          fill={nodeState.color}
          stroke="white"
          strokeWidth="2"
          opacity={nodeState.opacity}
          onClick={() => handleNodeClick(node)}
          onMouseEnter={() => handleNodeHover(node)}
          onMouseLeave={() => handleNodeHover(null)}
          className="cursor-pointer hover:opacity-80"
        />
      );
      
      // 텍스트 라벨
      const midAngle = (startAngle + endAngle) / 2;
      const labelRadius = (innerRadius + outerRadius) / 2;
      const labelX = centerX + labelRadius * Math.cos(midAngle * Math.PI / 180);
      const labelY = centerY + labelRadius * Math.sin(midAngle * Math.PI / 180);
      
      elements.push(
        <text
          key={`sunburst-text-${node.id}`}
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="10"
          fontWeight="600"
          className="pointer-events-none"
        >
          {truncateText(node.name, 8)}
        </text>
      );
    }

    // 자식 노드들 렌더링
    if (node.children.length > 0) {
      const anglePerChild = (endAngle - startAngle) / node.children.length;
      const radiusStep = (outerRadius - innerRadius) / 4; // 레벨당 두께
      
      node.children.forEach((child, index) => {
        const childStartAngle = startAngle + index * anglePerChild;
        const childEndAngle = childStartAngle + anglePerChild;
        const childInnerRadius = outerRadius;
        const childOuterRadius = outerRadius + radiusStep;
        
        elements.push(...renderSunburstNode(
          child,
          centerX,
          centerY,
          childInnerRadius,
          childOuterRadius,
          childStartAngle,
          childEndAngle
        ));
      });
    }

    return elements;
  };

  // 트리맵 뷰 렌더링
  const renderTreemapView = () => {
    const treemapData = convertToTreemapData(hierarchy);
    
    return (
      <div className="p-4">
        <div className="w-full h-96 border rounded relative overflow-hidden">
          {renderTreemapNode(treemapData, 0, 0, 800, 384)}
        </div>
      </div>
    );
  };

  // 트리맵 노드 렌더링
  const renderTreemapNode = (node: any, x: number, y: number, width: number, height: number): ReactElement => {
    const nodeState = nodeStates.get(node.id);
    
    if (!nodeState?.visible || !passesFilter(node)) {
      return <div key={node.id}></div>;
    }

    return (
      <div
        key={`treemap-${node.id}`}
        className="absolute border-2 border-white cursor-pointer hover:opacity-80 flex items-center justify-center transition-opacity"
        style={{
          left: x,
          top: y,
          width,
          height,
          backgroundColor: nodeState.color,
          opacity: nodeState.opacity
        }}
        onClick={() => handleNodeClick(node)}
        onMouseEnter={() => handleNodeHover(node)}
        onMouseLeave={() => handleNodeHover(null)}
      >
        <div className="text-center text-white font-medium text-sm">
          <div>{truncateText(node.name, 12)}</div>
          {node.weight && (
            <div className="text-xs opacity-80">
              {(node.weight * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  // 유틸리티 함수들
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getNodeTypeIcon = (type: HierarchyNode['type']): string => {
    const icons = {
      goal: '🎯',
      criterion: '📊',
      subcriteria: '📈',
      alternative: '⭐'
    };
    return icons[type];
  };

  const getAllNodes = (node: HierarchyNode): HierarchyNode[] => {
    const nodes = [node];
    node.children.forEach(child => {
      nodes.push(...getAllNodes(child));
    });
    return nodes;
  };

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

  const getAllLinks = (node: HierarchyNode): any[] => {
    const links: any[] = [];
    
    const addLinks = (n: HierarchyNode) => {
      n.children.forEach(child => {
        links.push({
          source: n.id,
          target: child.id,
          sourcePos: n.position,
          targetPos: child.position
        });
        addLinks(child);
      });
    };
    
    addLinks(node);
    return links;
  };

  const convertToTreeData = (node: HierarchyNode): any => {
    return {
      ...node,
      children: node.children.map(convertToTreeData)
    };
  };

  const convertToTreemapData = (node: HierarchyNode): any => {
    return {
      ...node,
      value: node.weight || 0.25,
      children: node.children.map(convertToTreemapData)
    };
  };

  const describeSector = (
    centerX: number,
    centerY: number,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number
  ): string => {
    const startAngleRad = startAngle * Math.PI / 180;
    const endAngleRad = endAngle * Math.PI / 180;
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);
    
    return [
      "M", x1, y1,
      "L", x2, y2,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 1, x3, y3,
      "L", x4, y4,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x1, y1,
      "Z"
    ].join(" ");
  };

  const passesFilter = (node: HierarchyNode): boolean => {
    // 가중치 필터
    if (node.weight !== undefined) {
      if (node.weight < filterSettings.minWeight || node.weight > filterSettings.maxWeight) {
        return false;
      }
    }
    
    // 타입 필터
    if (filterSettings.showOnlyType !== 'all' && node.type !== filterSettings.showOnlyType) {
      return false;
    }
    
    // 빈 노드 필터
    if (filterSettings.hideEmptyNodes && node.children.length === 0 && node.type !== 'alternative') {
      return false;
    }
    
    // 검색 필터
    if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  };

  const handleNodeClick = (node: HierarchyNode) => {
    if (!interactive) return;
    
    setSelectedNode(node);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const handleNodeHover = (node: HierarchyNode | null) => {
    if (!interactive) return;
    
    setHoveredNode(node);
    if (onNodeHover) {
      onNodeHover(node);
    }
  };

  const highlightPath = (nodeId: string) => {
    const newStates = new Map(nodeStates);
    
    // 모든 노드 하이라이트 해제
    newStates.forEach(state => {
      state.highlighted = false;
      state.opacity = 0.3;
    });
    
    // 선택된 노드와 경로 하이라이트
    const highlightNodePath = (node: HierarchyNode): boolean => {
      const state = newStates.get(node.id);
      if (!state) return false;
      
      if (node.id === nodeId) {
        state.highlighted = true;
        state.opacity = 1;
        return true;
      }
      
      for (const child of node.children) {
        if (highlightNodePath(child)) {
          state.highlighted = true;
          state.opacity = 1;
          return true;
        }
      }
      
      return false;
    };
    
    highlightNodePath(hierarchy);
    setNodeStates(newStates);
  };

  const resetHighlight = () => {
    const newStates = new Map(nodeStates);
    newStates.forEach(state => {
      state.highlighted = false;
      state.opacity = 1;
    });
    setNodeStates(newStates);
  };

  const renderVisualization = () => {
    switch (visualizationMode) {
      case 'tree':
        return renderTreeView();
      case 'network':
        return renderNetworkView();
      case 'matrix':
        return renderMatrixView();
      case 'sunburst':
        return renderSunburstView();
      case 'treemap':
        return renderTreemapView();
      case 'hierarchy':
        return renderTreeView(); // 기본적으로 트리 뷰와 동일
      default:
        return renderTreeView();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 컨트롤 패널 */}
      {showControls && (
        <Card title="시각화 설정">
          <div className="space-y-4">
            {/* 시각화 모드 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">시각화 모드</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'tree', label: '🌳 트리', description: '계층적 트리 구조' },
                  { value: 'network', label: '🕸️ 네트워크', description: '네트워크 그래프' },
                  { value: 'matrix', label: '📊 매트릭스', description: '평가 매트릭스' },
                  { value: 'sunburst', label: '☀️ 선버스트', description: '방사형 차트' },
                  { value: 'treemap', label: '🗺️ 트리맵', description: '면적 기반 시각화' }
                ].map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => setVisualizationMode(mode.value as VisualizationMode)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      visualizationMode === mode.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={mode.description}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">노드 검색</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="노드명으로 검색..."
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">노드 타입 필터</label>
                <select
                  value={filterSettings.showOnlyType}
                  onChange={(e) => setFilterSettings({
                    ...filterSettings,
                    showOnlyType: e.target.value as any
                  })}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">전체 보기</option>
                  <option value="goal">목표만</option>
                  <option value="criterion">기준만</option>
                  <option value="subcriteria">하위기준만</option>
                  <option value="alternative">대안만</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">가중치 범위</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={filterSettings.minWeight}
                    onChange={(e) => setFilterSettings({
                      ...filterSettings,
                      minWeight: parseFloat(e.target.value)
                    })}
                    className="w-full border rounded px-2 py-2 text-sm"
                    placeholder="최소"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={filterSettings.maxWeight}
                    onChange={(e) => setFilterSettings({
                      ...filterSettings,
                      maxWeight: parseFloat(e.target.value)
                    })}
                    className="w-full border rounded px-2 py-2 text-sm"
                    placeholder="최대"
                  />
                </div>
              </div>
            </div>

            {/* 표시 옵션 */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layoutSettings.showLabels}
                  onChange={(e) => setLayoutSettings({
                    ...layoutSettings,
                    showLabels: e.target.checked
                  })}
                />
                <span className="text-sm">라벨 표시</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layoutSettings.showWeights}
                  onChange={(e) => setLayoutSettings({
                    ...layoutSettings,
                    showWeights: e.target.checked
                  })}
                />
                <span className="text-sm">가중치 표시</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layoutSettings.showConnections}
                  onChange={(e) => setLayoutSettings({
                    ...layoutSettings,
                    showConnections: e.target.checked
                  })}
                />
                <span className="text-sm">연결선 표시</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={animationSettings.enabled}
                  onChange={(e) => setAnimationSettings({
                    ...animationSettings,
                    enabled: e.target.checked
                  })}
                />
                <span className="text-sm">애니메이션</span>
              </label>
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={resetHighlight}>
                하이라이트 초기화
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowStatistics(!showStatistics)}
              >
                {showStatistics ? '통계 숨김' : '통계 표시'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 선택된 노드 정보 */}
      {selectedNode && (
        <Card title="선택된 노드 정보">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">이름:</span>
              <div className="font-medium">{selectedNode.name}</div>
            </div>
            <div>
              <span className="text-gray-600">타입:</span>
              <div className="font-medium">{getNodeTypeName(selectedNode.type)}</div>
            </div>
            <div>
              <span className="text-gray-600">레벨:</span>
              <div className="font-medium">{selectedNode.level}</div>
            </div>
            {selectedNode.weight && (
              <div>
                <span className="text-gray-600">가중치:</span>
                <div className="font-medium">{(selectedNode.weight * 100).toFixed(1)}%</div>
              </div>
            )}
          </div>
          <div className="mt-4 flex space-x-2">
            <Button
              variant="primary"
              onClick={() => highlightPath(selectedNode.id)}
              className="text-sm"
            >
              경로 하이라이트
            </Button>
          </div>
        </Card>
      )}

      {/* 시각화 영역 */}
      <Card title={`모델 시각화 - ${getVisualizationModeName(visualizationMode)}`}>
        <div ref={containerRef} className="w-full">
          {renderVisualization()}
        </div>
      </Card>
    </div>
  );

  // 헬퍼 함수
  function getNodeTypeName(type: HierarchyNode['type']): string {
    const names = {
      goal: '목표',
      criterion: '기준',
      subcriteria: '하위기준',
      alternative: '대안'
    };
    return names[type];
  }

  function getVisualizationModeName(mode: VisualizationMode): string {
    const names = {
      tree: '트리 구조',
      network: '네트워크 그래프',
      matrix: '평가 매트릭스',
      sunburst: '선버스트 차트',
      treemap: '트리맵',
      hierarchy: '계층구조'
    };
    return names[mode];
  }
};

export default ModelVisualization;