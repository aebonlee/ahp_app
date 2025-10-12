import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  DocumentDuplicateIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

interface CanvasNode {
  id: string;
  type: 'goal' | 'criteria' | 'sub_criteria' | 'sub_sub_criteria' | 'alternative';
  name: string;
  description?: string;
  parent_id?: string;
  children: string[];
  level: number;
  position: { x: number; y: number };
  order_index: number;
  weight?: number;
  color?: string;
}

interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  structure: {
    goal: number;
    main_criteria: number;
    sub_criteria_per_main: number;
    sub_sub_criteria_per_sub: number;
    alternatives: number;
  };
}

interface CanvasModelBuilderProps {
  projectId: string;
  projectTitle: string;
  onSave: (model: CanvasNode[]) => void;
  onCancel: () => void;
  initialModel?: CanvasNode[];
}

const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: 'basic_3x3',
    name: '기본 3×3 구조',
    description: '3개 주기준, 각각 3개 하위기준, 3개 대안',
    structure: { goal: 1, main_criteria: 3, sub_criteria_per_main: 3, sub_sub_criteria_per_sub: 0, alternatives: 3 }
  },
  {
    id: 'simple_4x2',
    name: '단순 4×2 구조',
    description: '4개 주기준, 각각 2개 하위기준, 4개 대안',
    structure: { goal: 1, main_criteria: 4, sub_criteria_per_main: 2, sub_sub_criteria_per_sub: 0, alternatives: 4 }
  },
  {
    id: 'complex_3x3x2',
    name: '복합 3×3×2 구조',
    description: '3개 주기준, 각각 3개 하위기준, 각각 2개 하하위기준, 5개 대안',
    structure: { goal: 1, main_criteria: 3, sub_criteria_per_main: 3, sub_sub_criteria_per_sub: 2, alternatives: 5 }
  },
  {
    id: 'research_5x3',
    name: '연구용 5×3 구조',
    description: '5개 주기준, 각각 3개 하위기준, 7개 대안',
    structure: { goal: 1, main_criteria: 5, sub_criteria_per_main: 3, sub_sub_criteria_per_sub: 0, alternatives: 7 }
  }
];

const CanvasModelBuilder: React.FC<CanvasModelBuilderProps> = ({
  projectId,
  projectTitle,
  onSave,
  onCancel,
  initialModel = []
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>(initialModel);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  
  // 편집 중인 노드 데이터
  const [editNodeData, setEditNodeData] = useState({
    name: '',
    description: ''
  });

  // 초기 3×3 구조 생성
  const generateBasic3x3Structure = useCallback(() => {
    const newNodes: CanvasNode[] = [];
    let nodeIdCounter = 1;

    // 목표 (Goal)
    const goalNode: CanvasNode = {
      id: `node_${nodeIdCounter++}`,
      type: 'goal',
      name: projectTitle || '프로젝트 목표',
      description: '이 프로젝트의 최종 목표입니다',
      children: [],
      level: 0,
      position: { x: 400, y: 50 },
      order_index: 0,
      color: '#3B82F6'
    };
    newNodes.push(goalNode);

    // 주기준 3개
    const mainCriteriaNodes: CanvasNode[] = [];
    for (let i = 0; i < 3; i++) {
      const criteriaNode: CanvasNode = {
        id: `node_${nodeIdCounter++}`,
        type: 'criteria',
        name: `주기준 ${i + 1}`,
        description: `주요 평가 기준 ${i + 1}`,
        parent_id: goalNode.id,
        children: [],
        level: 1,
        position: { x: 150 + (i * 300), y: 200 },
        order_index: i,
        color: '#10B981'
      };
      mainCriteriaNodes.push(criteriaNode);
      goalNode.children.push(criteriaNode.id);
    }
    newNodes.push(...mainCriteriaNodes);

    // 하위기준 각각 3개씩
    mainCriteriaNodes.forEach((mainCriteria, mainIndex) => {
      for (let i = 0; i < 3; i++) {
        const subCriteriaNode: CanvasNode = {
          id: `node_${nodeIdCounter++}`,
          type: 'sub_criteria',
          name: `하위기준 ${mainIndex + 1}.${i + 1}`,
          description: `${mainCriteria.name}의 세부 기준 ${i + 1}`,
          parent_id: mainCriteria.id,
          children: [],
          level: 2,
          position: { 
            x: mainCriteria.position.x - 100 + (i * 100), 
            y: 350 
          },
          order_index: i,
          color: '#F59E0B'
        };
        newNodes.push(subCriteriaNode);
        mainCriteria.children.push(subCriteriaNode.id);
      }
    });

    // 대안 3개
    for (let i = 0; i < 3; i++) {
      const alternativeNode: CanvasNode = {
        id: `node_${nodeIdCounter++}`,
        type: 'alternative',
        name: `대안 ${i + 1}`,
        description: `평가 대상 대안 ${i + 1}`,
        children: [],
        level: 3,
        position: { x: 200 + (i * 200), y: 500 },
        order_index: i,
        color: '#EF4444'
      };
      newNodes.push(alternativeNode);
    }

    setNodes(newNodes);
  }, [projectTitle]);

  // 템플릿으로 구조 생성
  const generateFromTemplate = (template: CanvasTemplate) => {
    const newNodes: CanvasNode[] = [];
    let nodeIdCounter = 1;

    // 목표 생성
    const goalNode: CanvasNode = {
      id: `node_${nodeIdCounter++}`,
      type: 'goal',
      name: projectTitle || '프로젝트 목표',
      description: '이 프로젝트의 최종 목표입니다',
      children: [],
      level: 0,
      position: { x: 400, y: 50 },
      order_index: 0,
      color: '#3B82F6'
    };
    newNodes.push(goalNode);

    // 주기준 생성
    const mainCriteriaNodes: CanvasNode[] = [];
    const criteriaSpacing = Math.min(800 / template.structure.main_criteria, 200);
    const startX = 400 - ((template.structure.main_criteria - 1) * criteriaSpacing) / 2;
    
    for (let i = 0; i < template.structure.main_criteria; i++) {
      const criteriaNode: CanvasNode = {
        id: `node_${nodeIdCounter++}`,
        type: 'criteria',
        name: `주기준 ${i + 1}`,
        description: `주요 평가 기준 ${i + 1}`,
        parent_id: goalNode.id,
        children: [],
        level: 1,
        position: { x: startX + (i * criteriaSpacing), y: 200 },
        order_index: i,
        color: '#10B981'
      };
      mainCriteriaNodes.push(criteriaNode);
      goalNode.children.push(criteriaNode.id);
    }
    newNodes.push(...mainCriteriaNodes);

    // 하위기준 생성
    mainCriteriaNodes.forEach((mainCriteria, mainIndex) => {
      const subSpacing = Math.min(criteriaSpacing / template.structure.sub_criteria_per_main, 80);
      const subStartX = mainCriteria.position.x - ((template.structure.sub_criteria_per_main - 1) * subSpacing) / 2;
      
      for (let i = 0; i < template.structure.sub_criteria_per_main; i++) {
        const subCriteriaNode: CanvasNode = {
          id: `node_${nodeIdCounter++}`,
          type: 'sub_criteria',
          name: `하위기준 ${mainIndex + 1}.${i + 1}`,
          description: `${mainCriteria.name}의 세부 기준 ${i + 1}`,
          parent_id: mainCriteria.id,
          children: [],
          level: 2,
          position: { 
            x: subStartX + (i * subSpacing),
            y: 350 
          },
          order_index: i,
          color: '#F59E0B'
        };
        newNodes.push(subCriteriaNode);
        mainCriteria.children.push(subCriteriaNode.id);

        // 하하위기준 생성 (있는 경우)
        if (template.structure.sub_sub_criteria_per_sub > 0) {
          for (let j = 0; j < template.structure.sub_sub_criteria_per_sub; j++) {
            const subSubCriteriaNode: CanvasNode = {
              id: `node_${nodeIdCounter++}`,
              type: 'sub_sub_criteria',
              name: `하하위기준 ${mainIndex + 1}.${i + 1}.${j + 1}`,
              description: `${subCriteriaNode.name}의 세세부 기준 ${j + 1}`,
              parent_id: subCriteriaNode.id,
              children: [],
              level: 3,
              position: { 
                x: subCriteriaNode.position.x + ((j - 0.5) * 60),
                y: 450 
              },
              order_index: j,
              color: '#8B5CF6'
            };
            newNodes.push(subSubCriteriaNode);
            subCriteriaNode.children.push(subSubCriteriaNode.id);
          }
        }
      }
    });

    // 대안 생성
    const altSpacing = Math.min(800 / template.structure.alternatives, 150);
    const altStartX = 400 - ((template.structure.alternatives - 1) * altSpacing) / 2;
    const alternativeY = template.structure.sub_sub_criteria_per_sub > 0 ? 550 : 500;
    
    for (let i = 0; i < template.structure.alternatives; i++) {
      const alternativeNode: CanvasNode = {
        id: `node_${nodeIdCounter++}`,
        type: 'alternative',
        name: `대안 ${i + 1}`,
        description: `평가 대상 대안 ${i + 1}`,
        children: [],
        level: template.structure.sub_sub_criteria_per_sub > 0 ? 4 : 3,
        position: { x: altStartX + (i * altSpacing), y: alternativeY },
        order_index: i,
        color: '#EF4444'
      };
      newNodes.push(alternativeNode);
    }

    setNodes(newNodes);
    setShowTemplateModal(false);
  };

  // 초기화 (첫 로드 시 기본 3×3 구조 생성)
  useEffect(() => {
    if (nodes.length === 0) {
      generateBasic3x3Structure();
    }
  }, [generateBasic3x3Structure, nodes.length]);

  // 노드 클릭 핸들러
  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  // 노드 더블클릭으로 편집 시작
  const handleNodeDoubleClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditNodeData({
        name: node.name,
        description: node.description || ''
      });
      setShowNodeEditor(true);
    }
  };

  // 노드 편집 저장
  const saveNodeEdit = () => {
    if (editingNode) {
      setNodes(prev => prev.map(node => 
        node.id === editingNode 
          ? { ...node, name: editNodeData.name, description: editNodeData.description }
          : node
      ));
      setEditingNode(null);
      setShowNodeEditor(false);
    }
  };

  // 노드 추가
  const addNode = (parentId: string, type: CanvasNode['type']) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      type,
      name: `새 ${getNodeTypeName(type)}`,
      description: '',
      parent_id: parentId,
      children: [],
      level: parent.level + 1,
      position: { 
        x: parent.position.x + (parent.children.length * 100), 
        y: parent.position.y + 150 
      },
      order_index: parent.children.length,
      color: getNodeColor(type)
    };

    setNodes(prev => [
      ...prev,
      newNode
    ]);

    // 부모 노드의 children에 추가
    setNodes(prev => prev.map(node => 
      node.id === parentId 
        ? { ...node, children: [...node.children, newNode.id] }
        : node
    ));
  };

  // 노드 삭제
  const deleteNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.type === 'goal') return; // 목표 노드는 삭제 불가

    // 자식 노드들도 모두 삭제
    const getAllChildrenIds = (parentId: string): string[] => {
      const parent = nodes.find(n => n.id === parentId);
      if (!parent) return [];
      
      let childrenIds = [...parent.children];
      parent.children.forEach(childId => {
        childrenIds = [...childrenIds, ...getAllChildrenIds(childId)];
      });
      return childrenIds;
    };

    const allNodeIdsToDelete = [nodeId, ...getAllChildrenIds(nodeId)];

    setNodes(prev => prev.filter(n => !allNodeIdsToDelete.includes(n.id)));

    // 부모 노드의 children에서 제거
    if (node.parent_id) {
      setNodes(prev => prev.map(n => 
        n.id === node.parent_id 
          ? { ...n, children: n.children.filter(id => id !== nodeId) }
          : n
      ));
    }

    setSelectedNode(null);
  };

  // 노드 드래그 핸들러
  const handleNodeDrag = (nodeId: string, newPosition: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ));
  };

  // 유틸리티 함수들
  const getNodeTypeName = (type: CanvasNode['type']): string => {
    const typeNames = {
      goal: '목표',
      criteria: '주기준',
      sub_criteria: '하위기준',
      sub_sub_criteria: '하하위기준',
      alternative: '대안'
    };
    return typeNames[type];
  };

  const getNodeColor = (type: CanvasNode['type']): string => {
    const colors = {
      goal: '#3B82F6',
      criteria: '#10B981',
      sub_criteria: '#F59E0B',
      sub_sub_criteria: '#8B5CF6',
      alternative: '#EF4444'
    };
    return colors[type];
  };

  // 캔버스 줌 조절
  const handleZoomIn = () => setCanvasScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setCanvasScale(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setCanvasScale(1);

  // 모델 저장
  const handleSave = () => {
    onSave(nodes);
  };

  // 연결선 렌더링 (SVG)
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    nodes.forEach(node => {
      if (node.parent_id) {
        const parent = nodes.find(n => n.id === node.parent_id);
        if (parent) {
          const x1 = parent.position.x + 75; // 노드 중앙
          const y1 = parent.position.y + 40; // 노드 하단
          const x2 = node.position.x + 75;   // 노드 중앙
          const y2 = node.position.y + 10;   // 노드 상단

          connections.push(
            <line
              key={`${parent.id}-${node.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#6B7280"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        }
      }
    });

    return connections;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 툴바 */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">모델 구축 캔버스</h2>
            <span className="text-sm text-gray-500">{projectTitle}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 템플릿 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center"
            >
              <Squares2X2Icon className="h-4 w-4 mr-1" />
              템플릿
            </Button>
            
            {/* 줌 컨트롤 */}
            <div className="flex items-center space-x-1 border rounded-lg">
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>-</Button>
              <span className="px-2 text-sm">{Math.round(canvasScale * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>+</Button>
              <Button variant="ghost" size="sm" onClick={handleZoomReset}>
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {/* 저장/취소 버튼 */}
            <Button variant="outline" onClick={onCancel}>취소</Button>
            <Button variant="primary" onClick={handleSave}>저장</Button>
          </div>
        </div>
      </div>

      {/* 캔버스 영역 */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={canvasRef}
          className="w-full h-full relative"
          style={{ 
            transform: `scale(${canvasScale})`,
            transformOrigin: 'top left'
          }}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
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
            {renderConnections()}
          </svg>

          {/* 노드들 */}
          <div className="relative" style={{ zIndex: 2 }}>
            {nodes.map(node => (
              <div
                key={node.id}
                className={`absolute bg-white rounded-lg shadow-md border-2 cursor-pointer transition-all duration-200 ${
                  selectedNode === node.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  width: 150,
                  minHeight: 80,
                  borderColor: selectedNode === node.id ? '#3B82F6' : node.color
                }}
                onClick={() => handleNodeClick(node.id)}
                onDoubleClick={() => handleNodeDoubleClick(node.id)}
                draggable
                onDragEnd={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    const newX = (e.clientX - rect.left) / canvasScale - 75;
                    const newY = (e.clientY - rect.top) / canvasScale - 40;
                    handleNodeDrag(node.id, { x: newX, y: newY });
                  }
                }}
              >
                {/* 노드 헤더 */}
                <div 
                  className="px-3 py-2 rounded-t-lg text-white text-sm font-medium"
                  style={{ backgroundColor: node.color }}
                >
                  {getNodeTypeName(node.type)}
                </div>
                
                {/* 노드 내용 */}
                <div className="p-3">
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {node.name}
                  </div>
                  {node.description && (
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {node.description}
                    </div>
                  )}
                </div>

                {/* 노드 액션 버튼들 (선택된 경우만 표시) */}
                {selectedNode === node.id && (
                  <div className="absolute -top-2 -right-2 flex space-x-1">
                    {node.type !== 'alternative' && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-6 h-6 p-0 rounded-full"
                        onClick={(e) => {
                          e?.stopPropagation();
                          const nextType = node.type === 'goal' ? 'criteria' :
                                         node.type === 'criteria' ? 'sub_criteria' :
                                         node.type === 'sub_criteria' ? 'sub_sub_criteria' : 'alternative';
                          addNode(node.id, nextType);
                        }}
                      >
                        <PlusIcon className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-6 h-6 p-0 rounded-full"
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleNodeDoubleClick(node.id);
                      }}
                    >
                      <PencilIcon className="h-3 w-3" />
                    </Button>
                    
                    {node.type !== 'goal' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-6 h-6 p-0 rounded-full text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e?.stopPropagation();
                          deleteNode(node.id);
                        }}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 템플릿 선택 모달 */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="템플릿 선택"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            프로젝트에 적합한 템플릿을 선택하세요. 기존 구조는 새 템플릿으로 대체됩니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CANVAS_TEMPLATES.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <div 
                  className="p-4"
                  onClick={() => generateFromTemplate(template)}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>주기준: {template.structure.main_criteria}개</div>
                    <div>하위기준: 각 {template.structure.sub_criteria_per_main}개</div>
                    {template.structure.sub_sub_criteria_per_sub > 0 && (
                      <div>하하위기준: 각 {template.structure.sub_sub_criteria_per_sub}개</div>
                    )}
                    <div>대안: {template.structure.alternatives}개</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>

      {/* 노드 편집 모달 */}
      <Modal
        isOpen={showNodeEditor}
        onClose={() => setShowNodeEditor(false)}
        title="노드 편집"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <Input
              value={editNodeData.name}
              onChange={(value: string) => setEditNodeData(prev => ({ ...prev, name: value }))}
              placeholder="노드 이름을 입력하세요"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={editNodeData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditNodeData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="노드 설명을 입력하세요"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowNodeEditor(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={saveNodeEdit}>
              <CheckIcon className="h-4 w-4 mr-1" />
              저장
            </Button>
          </div>
        </div>
      </Modal>

      {/* 상태바 */}
      <div className="bg-white border-t px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>노드 수: {nodes.length}</span>
            <span>목표: {nodes.filter(n => n.type === 'goal').length}</span>
            <span>주기준: {nodes.filter(n => n.type === 'criteria').length}</span>
            <span>하위기준: {nodes.filter(n => n.type === 'sub_criteria').length}</span>
            <span>대안: {nodes.filter(n => n.type === 'alternative').length}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>선택된 노드: {selectedNode ? nodes.find(n => n.id === selectedNode)?.name : '없음'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasModelBuilder;