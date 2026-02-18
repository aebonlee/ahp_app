// 계층 구조 트리 시각화 컴포넌트
// Opus 4.1 설계 문서 기반

import React, { useState, useCallback } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import Card from '../../common/Card';
import type { HierarchyNode, EvaluationProgress } from '../../../types/hierarchy';

interface HierarchyTreeVisualizationProps {
  hierarchyNodes: HierarchyNode[];
  evaluationProgress?: EvaluationProgress;
  onNodeSelect?: (node: HierarchyNode) => void;
  selectedNodeId?: string;
  showWeights?: boolean;
  showProgress?: boolean;
  className?: string;
}

interface TreeNodeProps {
  node: HierarchyNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isCompleted: boolean;
  hasIssues: boolean;
  onToggleExpand: (nodeId: string) => void;
  onNodeSelect?: (node: HierarchyNode) => void;
  showWeights: boolean;
  showProgress: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  isExpanded,
  isSelected,
  isCompleted,
  hasIssues,
  onToggleExpand,
  onNodeSelect,
  showWeights,
  showProgress
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 24;

  // 노드 타입별 아이콘 색상
  const getNodeColor = () => {
    switch (node.nodeType) {
      case 'goal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'criterion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'subcriterion':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'alternative':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 노드 상태 아이콘
  const renderStatusIcon = () => {
    if (hasIssues) {
      return <ExclamationCircleIcon className="w-4 h-4 text-red-500" />;
    }
    if (isCompleted) {
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    }
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div>
      {/* 노드 자체 */}
      <div
        className={`
          flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50
          ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
        `}
        style={{ marginLeft: `${indent}px` }}
        onClick={() => onNodeSelect?.(node)}
      >
        {/* 확장/축소 버튼 */}
        <div className="mr-2 w-5 h-5 flex items-center justify-center">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-0.5 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* 상태 아이콘 */}
        {showProgress && (
          <div className="mr-3">
            {renderStatusIcon()}
          </div>
        )}

        {/* 노드 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className={`
              px-2 py-1 rounded-md text-xs font-medium border
              ${getNodeColor()}
            `}>
              {node.nodeType === 'goal' && '목표'}
              {node.nodeType === 'criterion' && '기준'}
              {node.nodeType === 'subcriterion' && '하위기준'}
              {node.nodeType === 'alternative' && '대안'}
            </div>
            
            {node.code && (
              <span className="text-xs text-gray-500 font-mono">
                {node.code}
              </span>
            )}
          </div>
          
          <div className="font-medium text-gray-900 truncate">
            {node.name}
          </div>
          
          {node.description && (
            <div className="text-sm text-gray-500 truncate">
              {node.description}
            </div>
          )}
          
          {hasChildren && (
            <div className="text-xs text-gray-400 mt-1">
              {node.children?.length}개 하위 항목
            </div>
          )}
        </div>

        {/* 가중치 표시 */}
        {showWeights && (
          <div className="ml-4 text-right">
            {node.localWeight !== undefined && (
              <div className="text-sm text-gray-600">
                <span className="text-xs text-gray-500">로컬:</span>
                <span className="ml-1 font-medium">
                  {(node.localWeight * 100).toFixed(1)}%
                </span>
              </div>
            )}
            {node.globalWeight !== undefined && (
              <div className="text-sm text-gray-900">
                <span className="text-xs text-gray-500">글로벌:</span>
                <span className="ml-1 font-medium">
                  {(node.globalWeight * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* 추가 정보 아이콘 */}
        <div className="ml-2">
          <InformationCircleIcon className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 자식 노드들 */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children?.map((child) => (
            <TreeNodeContainer
              key={child.id}
              node={child}
              level={level + 1}
              onNodeSelect={onNodeSelect}
              selectedNodeId={isSelected ? node.id : undefined}
              showWeights={showWeights}
              showProgress={showProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// TreeNode의 상태 관리를 위한 컨테이너 컴포넌트
const TreeNodeContainer: React.FC<{
  node: HierarchyNode;
  level: number;
  onNodeSelect?: (node: HierarchyNode) => void;
  selectedNodeId?: string;
  showWeights: boolean;
  showProgress: boolean;
}> = ({ node, level, onNodeSelect, selectedNodeId, showWeights, showProgress }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([node.id]));

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // 로컬 가중치 존재 여부로 완료 상태 판단
  const isCompleted = typeof node.localWeight === 'number' && node.localWeight > 0;

  return (
    <TreeNode
      node={node}
      level={level}
      isExpanded={expandedNodes.has(node.id)}
      isSelected={selectedNodeId === node.id}
      isCompleted={isCompleted}
      hasIssues={false}
      onToggleExpand={handleToggleExpand}
      onNodeSelect={onNodeSelect}
      showWeights={showWeights}
      showProgress={showProgress}
    />
  );
};

const HierarchyTreeVisualization: React.FC<HierarchyTreeVisualizationProps> = ({
  hierarchyNodes,
  evaluationProgress,
  onNodeSelect,
  selectedNodeId,
  showWeights = false,
  showProgress = false,
  className = ''
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [localShowWeights, setLocalShowWeights] = useState(showWeights);
  const [localShowProgress, setLocalShowProgress] = useState(showProgress);

  // 계층 구조 트리 구성
  const buildTree = useCallback((nodes: HierarchyNode[]): HierarchyNode[] => {
    const nodeMap = new Map<string, HierarchyNode>();
    const rootNodes: HierarchyNode[] = [];

    // 노드 맵 생성
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // 계층 구조 구성
    nodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)!;
      
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(nodeWithChildren);
          parent.children.sort((a, b) => a.position - b.position);
        }
      } else {
        rootNodes.push(nodeWithChildren);
      }
    });

    return rootNodes.sort((a, b) => a.position - b.position);
  }, []);

  const treeData = buildTree(hierarchyNodes);

  // 전체 확장/축소
  const handleExpandAll = () => {
    const allNodeIds = new Set(hierarchyNodes.map(node => node.id));
    setExpandedNodes(allNodeIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // 노드 상태 확인 함수들
  const isNodeCompleted = (nodeId: string): boolean => {
    const node = hierarchyNodes.find(n => n.id === nodeId);
    // 로컬 가중치가 계산되었으면 완료된 것으로 간주
    return !!(node && typeof node.localWeight === 'number' && node.localWeight > 0);
  };

  const hasNodeIssues = (nodeId: string): boolean => {
    if (!evaluationProgress) return false;
    // 현재 평가 중인 노드이고 평균 일관성 비율이 0.1을 초과하면 문제 있음
    if (evaluationProgress.currentStep?.nodeId === nodeId) {
      return evaluationProgress.averageConsistency > 0.1;
    }
    return false;
  };

  // 통계 계산
  const stats = {
    total: hierarchyNodes.length,
    goals: hierarchyNodes.filter(n => n.nodeType === 'goal').length,
    criteria: hierarchyNodes.filter(n => n.nodeType === 'criterion').length,
    subcriteria: hierarchyNodes.filter(n => n.nodeType === 'subcriterion').length,
    alternatives: hierarchyNodes.filter(n => n.nodeType === 'alternative').length,
  };

  return (
    <Card className={className}>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              계층 구조
            </h3>
            <p className="text-sm text-gray-600">
              총 {stats.total}개 노드 (목표 {stats.goals}, 기준 {stats.criteria}, 
              하위기준 {stats.subcriteria}, 대안 {stats.alternatives})
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 보기 옵션 */}
            <div className="flex items-center space-x-2 text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localShowWeights}
                  onChange={(e) => setLocalShowWeights(e.target.checked)}
                  className="mr-1"
                />
                가중치 표시
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localShowProgress}
                  onChange={(e) => setLocalShowProgress(e.target.checked)}
                  className="mr-1"
                />
                진행률 표시
              </label>
            </div>
            
            {/* 확장/축소 버튼 */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleExpandAll}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                전체 확장
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                전체 축소
              </button>
            </div>
          </div>
        </div>

        {/* 진행률 요약 (옵션) */}
        {localShowProgress && evaluationProgress && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-900 font-medium">
                평가 진행률: {evaluationProgress.progressPercentage.toFixed(1)}%
              </span>
              <span className="text-blue-700">
                {evaluationProgress.completedNodes}/{evaluationProgress.totalNodes} 노드 완료
              </span>
            </div>
          </div>
        )}

        {/* 트리 렌더링 */}
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {treeData.length > 0 ? (
            treeData.map((rootNode) => (
              <TreeNode
                key={rootNode.id}
                node={rootNode}
                level={0}
                isExpanded={expandedNodes.has(rootNode.id)}
                isSelected={selectedNodeId === rootNode.id}
                isCompleted={isNodeCompleted(rootNode.id)}
                hasIssues={hasNodeIssues(rootNode.id)}
                onToggleExpand={handleToggleExpand}
                onNodeSelect={onNodeSelect}
                showWeights={localShowWeights}
                showProgress={localShowProgress}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              계층 구조 데이터가 없습니다.
            </div>
          )}
        </div>

        {/* 범례 */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600 mb-2">범례:</div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded" />
              <span>목표</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded" />
              <span>기준</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded" />
              <span>하위기준</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded" />
              <span>대안</span>
            </div>
            {localShowProgress && (
              <>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-3 h-3 text-green-500" />
                  <span>완료</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ExclamationCircleIcon className="w-3 h-3 text-red-500" />
                  <span>문제 발생</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HierarchyTreeVisualization;