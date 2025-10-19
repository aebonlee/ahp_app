import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import HelpModal from '../common/HelpModal';
import { ProjectStatus, ProjectFormData } from './ProjectCreationForm';

interface Project extends ProjectFormData {
  id: string;
  evaluatorCount?: number;
  completionRate?: number;
  lastActivity?: string;
}

interface TreeNode {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  order: number;
  type: 'goal' | 'criterion' | 'alternative';
  isExpanded?: boolean;
  children?: TreeNode[];
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
  order: number;
}

interface TreeModelConfigurationProps {
  project: Project;
  onBack: () => void;
  onSave: (treeModel: TreeNode[], alternatives: Alternative[]) => void;
}

const TreeModelConfiguration: React.FC<TreeModelConfigurationProps> = ({
  project,
  onBack,
  onSave
}) => {
  const [treeModel, setTreeModel] = useState<TreeNode[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [activeTab, setActiveTab] = useState<'tree' | 'alternatives'>('tree');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<'project-status' | 'model-building'>('model-building');
  
  // Form states
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [showAlternativeForm, setShowAlternativeForm] = useState(false);
  const [editingNode, setEditingNode] = useState<TreeNode | null>(null);
  const [editingAlternative, setEditingAlternative] = useState<Alternative | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const [nodeForm, setNodeForm] = useState({
    name: '',
    description: '',
    parentId: ''
  });

  const [alternativeForm, setAlternativeForm] = useState({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<any>({});

  // 초기 트리 모델 및 대안 설정
  useEffect(() => {
    const initialTree: TreeNode[] = [
      {
        id: 'goal',
        name: project.name || '의사결정 목표',
        description: project.description || '',
        level: 0,
        order: 0,
        type: 'goal',
        isExpanded: true,
        children: [
          {
            id: 'c1',
            name: '상품 요인',
            description: '상품의 다양성, 희소성, 개인화',
            parentId: 'goal',
            level: 1,
            order: 1,
            type: 'criterion',
            isExpanded: true,
            children: [
              {
                id: 'c1_1',
                name: '상품의 다양성',
                description: '다양한 상품군 및 선택의 폭',
                parentId: 'c1',
                level: 2,
                order: 1,
                type: 'criterion',
                isExpanded: false,
                children: []
              },
              {
                id: 'c1_2',
                name: '상품의 희소성',
                description: '독점적이고 특별한 상품',
                parentId: 'c1',
                level: 2,
                order: 2,
                type: 'criterion',
                isExpanded: false,
                children: []
              },
              {
                id: 'c1_3',
                name: '상품의 개인화',
                description: '개인 맞춤형 상품 추천',
                parentId: 'c1',
                level: 2,
                order: 3,
                type: 'criterion',
                isExpanded: false,
                children: []
              }
            ]
          },
          {
            id: 'c2',
            name: '서비스 요인',
            description: '서비스 접근성, 사후 서비스, 고객 서비스',
            parentId: 'goal',
            level: 1,
            order: 2,
            type: 'criterion',
            isExpanded: false,
            children: [
              {
                id: 'c2_1',
                name: '서비스 접근성',
                description: '편리한 접근 및 이용',
                parentId: 'c2',
                level: 2,
                order: 1,
                type: 'criterion',
                isExpanded: false,
                children: []
              },
              {
                id: 'c2_2',
                name: '사후 서비스',
                description: '구매 후 지원 서비스',
                parentId: 'c2',
                level: 2,
                order: 2,
                type: 'criterion',
                isExpanded: false,
                children: []
              },
              {
                id: 'c2_3',
                name: '고객 서비스',
                description: '고객 상담 및 지원',
                parentId: 'c2',
                level: 2,
                order: 3,
                type: 'criterion',
                isExpanded: false,
                children: []
              }
            ]
          },
          {
            id: 'c3',
            name: '정보 요인',
            description: '정보의 최신성, 유용성, 오락성',
            parentId: 'goal',
            level: 1,
            order: 3,
            type: 'criterion',
            isExpanded: false,
            children: [
              {
                id: 'c3_1',
                name: '정보의 최신성',
                description: '최신 트렌드 및 정보',
                parentId: 'c3',
                level: 2,
                order: 1,
                type: 'criterion',
                isExpanded: false,
                children: []
              },
              {
                id: 'c3_2',
                name: '정보의 유용성',
                description: '실용적이고 도움되는 정보',
                parentId: 'c3',
                level: 2,
                order: 2,
                type: 'criterion',
                isExpanded: false,
                children: []
              },
              {
                id: 'c3_3',
                name: '정보의 오락성',
                description: '재미있고 흥미로운 정보',
                parentId: 'c3',
                level: 2,
                order: 3,
                type: 'criterion',
                isExpanded: false,
                children: []
              }
            ]
          },
          {
            id: 'c4',
            name: '신뢰 요인',
            description: '상품, 플랫폼, 사회자의 신뢰성',
            parentId: 'goal',
            level: 1,
            order: 4,
            type: 'criterion',
            isExpanded: false,
            children: [
              {
                id: 'c4_1',
                name: '상품의 신뢰성',
                description: '상품 품질 및 신뢰도',
                parentId: 'c4',
                level: 2,
                order: 1,
                type: 'criterion',
                isExpanded: false,
                children: []
              },
              {
                id: 'c4_2',
                name: '플랫폼의 신뢰성',
                description: '플랫폼 보안 및 안정성',
                parentId: 'c4',
                level: 2,
                order: 2,
                type: 'criterion',
                isExpanded: false,
                children: []
              },
              {
                id: 'c4_3',
                name: '사회자의 신뢰성',
                description: '진행자 전문성 및 신뢰도',
                parentId: 'c4',
                level: 2,
                order: 3,
                type: 'criterion',
                isExpanded: false,
                children: []
              }
            ]
          }
        ]
      }
    ];

    const initialAlternatives: Alternative[] = [
      { id: 'a1', name: '라이브커머스', description: '실시간 라이브 쇼핑', order: 1 },
      { id: 'a2', name: 'TV홈쇼핑', description: '전통적인 텔레비전 쇼핑', order: 2 },
      { id: 'a3', name: '인터넷쇼핑', description: '온라인 쇼핑몰', order: 3 }
    ];

    setTreeModel(initialTree);
    setAlternatives(initialAlternatives);
  }, [project]);

  const canEdit = (project.status === 'creating' || project.status === 'waiting') && project.status !== undefined;

  const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 20;

    return (
      <div key={node.id} className="tree-node">
        <div 
          className={`flex items-center p-3 rounded-lg border mb-2 transition-all hover:shadow-sm ${
            node.type === 'goal' ? 'bg-blue-50 border-blue-200' : 
            level === 1 ? 'bg-purple-50 border-purple-200' :
            'bg-gray-50 border-gray-200'
          }`}
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="flex items-center flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleNodeExpansion(node.id)}
                className="mr-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {node.isExpanded ? '📂' : '📁'}
              </button>
            )}
            {!hasChildren && level > 0 && (
              <span className="mr-3 text-gray-400">📄</span>
            )}
            
            <div className="flex-1">
              <div className="flex items-center">
                <span className={`font-medium ${
                  node.type === 'goal' ? 'text-blue-900 text-lg' : 
                  level === 1 ? 'text-purple-800' :
                  'text-gray-900'
                }`}>
                  {node.name}
                </span>
                {node.type !== 'goal' && (
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    level === 1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    Level {node.level}
                  </span>
                )}
              </div>
              {node.description && (
                <p className="text-sm text-gray-600 mt-1">{node.description}</p>
              )}
            </div>
          </div>

          {canEdit && node.type !== 'goal' && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => {
                  setEditingNode(node);
                  setNodeForm({
                    name: node.name,
                    description: node.description || '',
                    parentId: node.parentId || ''
                  });
                  setShowNodeForm(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
              >
                수정
              </button>
              <button
                onClick={() => handleDeleteNode(node.id)}
                className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
              >
                삭제
              </button>
              <button
                onClick={() => {
                  setSelectedParentId(node.id);
                  setShowNodeForm(true);
                  setEditingNode(null);
                  setNodeForm({ name: '', description: '', parentId: node.id });
                }}
                className="text-sm text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50"
              >
                + 하위기준
              </button>
            </div>
          )}
        </div>

        {node.isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const toggleExpansion = (tree: TreeNode[]): TreeNode[] => {
      return tree.map(node => {
        if (node.id === nodeId) {
          return { ...node, isExpanded: !node.isExpanded };
        } else if (node.children) {
          return { ...node, children: toggleExpansion(node.children) };
        }
        return node;
      });
    };

    setTreeModel(toggleExpansion(treeModel));
  };

  const handleDeleteNode = (nodeId: string) => {
    if (window.confirm('기준을 삭제하시겠습니까? 하위 기준과 연관된 평가 데이터도 함께 삭제됩니다.')) {
      // Implementation for delete node - simplified for this demo
      console.log('Deleting node:', nodeId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={onBack}>
              ← 뒤로
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">🌳 계층적 모델 구성</h2>
            <Button
              variant="secondary"
              onClick={() => {
                setHelpType('model-building');
                setShowHelpModal(true);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ❓ 도움말
            </Button>
          </div>
          <div className="mt-2">
            <p className="text-lg font-medium text-gray-700">{project.name}</p>
            <p className="text-sm text-gray-600">{project.description}</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => onSave(treeModel, alternatives)}
          disabled={!canEdit}
        >
          모델 저장
        </Button>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">계층적 모델 구축 진행도</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
                <span className="ml-2 text-sm">계층 구조 설정 완료</span>
              </div>
              <div className="flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  alternatives.length >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  ✓
                </span>
                <span className="ml-2 text-sm">대안 설정 ({alternatives.length}/2+)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tree')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tree'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🌳 계층 구조
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alternatives'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚖️ 대안 ({alternatives.length})
          </button>
        </nav>
      </div>

      {activeTab === 'tree' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">계층적 기준 구조</h3>
              <p className="text-sm text-gray-600">의사결정 목표를 중심으로 계층적 기준 구조를 구성합니다. 📁/📂 아이콘을 클릭하여 계층을 접거나 펼칠 수 있습니다.</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {treeModel.map(node => renderTreeNode(node, 0))}
          </div>
        </Card>
      )}

      {activeTab === 'alternatives' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">대안</h3>
              <p className="text-sm text-gray-600">비교하고 선택할 대안들을 정의합니다. 모든 기준에 대해 평가됩니다.</p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {alternatives.map((alternative, index) => (
              <div
                key={alternative.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">{alternative.name}</h4>
                    {alternative.description && (
                      <p className="text-sm text-gray-600">{alternative.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tree Guidelines */}
      <Card className="bg-purple-50 border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-2">🏗️ I MAKE IT 계층구조 설계 가이드라인</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• <strong>목표 → 주기준 → 부기준</strong> 순으로 계층을 구성합니다</li>
          <li>• 각 계층별로 <strong>3~7개</strong>의 요소를 두는 것이 적당합니다 (인간의 인지 한계 고려)</li>
          <li>• 같은 계층의 기준들은 서로 <strong>독립적</strong>이어야 합니다</li>
          <li>• <strong>구체적이고 측정 가능한</strong> 기준으로 설정하세요</li>
          <li>• 평가 방법: <strong>{project.evaluationMethod === 'pairwise-practical' ? '쌍대비교-실용' : project.evaluationMethod === 'direct-input' ? '직접입력' : '쌍대비교-이론'}</strong></li>
        </ul>
      </Card>

      {showHelpModal && (
        <HelpModal
          isVisible={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          helpType={helpType}
        />
      )}
    </div>
  );
};

export default TreeModelConfiguration;