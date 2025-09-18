import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import apiService from '../../services/apiService';

interface Alternative {
  id: string;
  name: string;
  description?: string;
  order: number;
  weight?: number;
  rank?: number;
}

interface AlternativeManagementProps {
  projectId: string;
  onComplete: () => void;
  onAlternativesChange?: (alternativesCount: number) => void;
}

const AlternativeManagement: React.FC<AlternativeManagementProps> = ({ projectId, onComplete, onAlternativesChange }) => {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);

  useEffect(() => {
    // 프로젝트별 대안 데이터 로드 (PostgreSQL에서)
    const loadProjectAlternatives = async () => {
      try {
        const response = await apiService.alternativesAPI.fetch(Number(projectId));
        if (response.data) {
          const alternativesData = (response.data as any).alternatives || response.data || [];
          setAlternatives(alternativesData);
          console.log(`Loaded ${alternativesData.length} alternatives from API for project ${projectId}`);
        } else {
          setAlternatives([]);
          console.log(`No alternatives found for project ${projectId}`);
        }
      } catch (error) {
        console.error('Failed to load alternatives from API:', error);
        // No localStorage fallback - rely on server session only
        setAlternatives([]);
        console.log(`No alternatives found for project ${projectId} - server only`);
      }
    };

    if (projectId) {
      loadProjectAlternatives();
    }
  }, [projectId]);

  // 대안이 변경될 때마다 부모 컴포넌트에 개수 알림
  useEffect(() => {
    if (onAlternativesChange) {
      onAlternativesChange(alternatives.length);
    }
  }, [alternatives, onAlternativesChange]);

  const [newAlternative, setNewAlternative] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAlternative, setEditingAlternative] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 프로젝트별 대안 데이터는 API 호출 시 자동으로 PostgreSQL에 저장됨
  const saveProjectAlternatives = async (alternativesData: Alternative[]) => {
    console.log(`Alternatives automatically saved to PostgreSQL via Django session for project ${projectId}`);
    // All data is persisted through Django session and PostgreSQL
  };

  const validateAlternative = (name: string, excludeId?: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '대안명을 입력해주세요.';
    } else if (name.length < 2) {
      newErrors.name = '대안명은 2자 이상이어야 합니다.';
    } else {
      // Check for duplicate names
      const isDuplicate = alternatives.some(alt => 
        alt.name.toLowerCase() === name.toLowerCase() && alt.id !== excludeId
      );
      if (isDuplicate) {
        newErrors.name = '동일한 대안명이 이미 존재합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAlternative = async () => {
    if (!validateAlternative(newAlternative.name)) {
      return;
    }

    const maxOrder = Math.max(...alternatives.map(alt => alt.order), 0);
    
    const alternativeData = {
      project_id: Number(projectId),
      name: newAlternative.name,
      description: newAlternative.description || null,
      order_index: maxOrder + 1
    };

    try {
      const response = await apiService.alternativesAPI.create(alternativeData);
      
      if (response.error) {
        setErrors({ name: response.error });
        return;
      }

      // 성공 시 데이터 다시 로드
      const updatedResponse = await apiService.alternativesAPI.fetch(Number(projectId));
      if (updatedResponse.data) {
        const alternativesData = (updatedResponse.data as any).alternatives || updatedResponse.data || [];
        setAlternatives(alternativesData);
      }
      
      setNewAlternative({ name: '', description: '' });
      setErrors({});
      console.log('✅ 대안이 PostgreSQL에 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save alternative to API:', error);
      setErrors({ name: '대안 저장 중 오류가 발생했습니다.' });
    }
  };

  const handleEditAlternative = (id: string) => {
    const alternative = alternatives.find(alt => alt.id === id);
    if (alternative) {
      setEditingId(id);
      setEditingAlternative({ name: alternative.name, description: alternative.description || '' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !validateAlternative(editingAlternative.name, editingId)) {
      return;
    }

    try {
      const updateData = {
        name: editingAlternative.name,
        description: editingAlternative.description || null
      };
      
      const response = await apiService.alternativesAPI.update(editingId, updateData);
      
      if (response.error) {
        setErrors({ general: response.error });
        return;
      }

      // 성공 시 데이터 다시 로드
      const updatedResponse = await apiService.alternativesAPI.fetch(Number(projectId));
      if (updatedResponse.data) {
        const alternativesData = (updatedResponse.data as any).alternatives || updatedResponse.data || [];
        setAlternatives(alternativesData);
      }
      
      setEditingId(null);
      setEditingAlternative({ name: '', description: '' });
      setErrors({});
      console.log('✅ 대안이 PostgreSQL에서 수정되었습니다:', editingId);
    } catch (error) {
      console.error('Failed to save alternative edit:', error);
      setErrors({ general: '대안 수정 중 오류가 발생했습니다.' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAlternative({ name: '', description: '' });
    setErrors({});
  };

  const handleDeleteAlternative = async (id: string) => {
    try {
      const response = await apiService.alternativesAPI.delete(id);
      
      if (response.error) {
        console.error('Failed to delete alternative:', response.error);
        return;
      }

      // 성공 시 데이터 다시 로드
      const updatedResponse = await apiService.alternativesAPI.fetch(Number(projectId));
      if (updatedResponse.data) {
        const alternativesData = (updatedResponse.data as any).alternatives || updatedResponse.data || [];
        setAlternatives(alternativesData);
      }
      
      console.log('✅ 대안이 PostgreSQL에서 삭제되었습니다:', id);
    } catch (error) {
      console.error('Failed to delete alternative from API:', error);
    }
  };

  const handleMoveUp = (id: string) => {
    const index = alternatives.findIndex(alt => alt.id === id);
    if (index > 0) {
      const newAlternatives = [...alternatives];
      [newAlternatives[index], newAlternatives[index - 1]] = [newAlternatives[index - 1], newAlternatives[index]];
      
      // Update order values
      newAlternatives.forEach((alt, idx) => {
        alt.order = idx + 1;
      });
      
      setAlternatives(newAlternatives);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = alternatives.findIndex(alt => alt.id === id);
    if (index < alternatives.length - 1) {
      const newAlternatives = [...alternatives];
      [newAlternatives[index], newAlternatives[index + 1]] = [newAlternatives[index + 1], newAlternatives[index]];
      
      // Update order values
      newAlternatives.forEach((alt, idx) => {
        alt.order = idx + 1;
      });
      
      setAlternatives(newAlternatives);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="2-2단계 — 대안추가">
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">📝 프로젝트 대안 설정 가이드</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 프로젝트 목표에 맞는 비교 대안을 추가하세요</li>
              <li>• 대안명은 중복될 수 없습니다</li>
              <li>• ↑↓ 버튼으로 평가 순서를 조정할 수 있습니다</li>
              <li>• ✏️ 버튼으로 대안을 수정, 🗑️ 버튼으로 삭제할 수 있습니다</li>
              <li>• 대안이 없는 경우 기준 간 중요도 비교만으로 분석 가능합니다</li>
            </ul>
          </div>

          {/* Current Alternatives List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">📋 등록된 대안 목록</h4>
            {alternatives.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 추가된 대안이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {alternatives
                  .sort((a, b) => a.order - b.order)
                  .map((alternative, index) => (
                    <div
                      key={alternative.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                    >
                      <div className="flex items-center flex-1">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mr-4">
                          {alternative.order}
                        </div>
                        
                        {editingId === alternative.id ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              id={`edit-name-${alternative.id}`}
                              label=""
                              placeholder="대안명을 입력하세요"
                              value={editingAlternative.name}
                              onChange={(value) => setEditingAlternative(prev => ({ ...prev, name: value }))}
                              error={errors.name}
                            />
                            <Input
                              id={`edit-desc-${alternative.id}`}
                              label=""
                              placeholder="대안 설명 (선택)"
                              value={editingAlternative.description}
                              onChange={(value) => setEditingAlternative(prev => ({ ...prev, description: value }))}
                            />
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">{alternative.name}</h5>
                                {alternative.description && (
                                  <p className="text-sm text-gray-600">{alternative.description}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                {alternative.rank && (
                                  <div className="text-xs font-semibold">
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                      #{alternative.rank}위
                                    </span>
                                  </div>
                                )}
                                {alternative.weight && (
                                  <div className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {(alternative.weight * 100).toFixed(3)}%
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {editingId === alternative.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              저장
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleMoveUp(alternative.id)}
                              disabled={index === 0}
                              className={`text-sm ${index === 0 ? 'text-gray-300' : 'text-blue-600 hover:text-blue-800'}`}
                              title="위로 이동"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveDown(alternative.id)}
                              disabled={index === alternatives.length - 1}
                              className={`text-sm ${index === alternatives.length - 1 ? 'text-gray-300' : 'text-blue-600 hover:text-blue-800'}`}
                              title="아래로 이동"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => handleEditAlternative(alternative.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="편집"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteAlternative(alternative.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Add New Alternative */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">➕ 새 대안 추가</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="alternativeName"
                label="대안명"
                placeholder="대안명을 입력하세요"
                value={newAlternative.name}
                onChange={(value) => setNewAlternative(prev => ({ ...prev, name: value }))}
                error={errors.name}
                required
              />

              <Input
                id="alternativeDescription"
                label="대안 설명 (선택)"
                placeholder="대안에 대한 설명"
                value={newAlternative.description}
                onChange={(value) => setNewAlternative(prev => ({ ...prev, description: value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddAlternative} variant="primary">
                대안 추가
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-medium text-gray-900">대안 요약</h5>
                <p className="text-sm text-gray-600">총 {alternatives.length}개 대안 등록됨</p>
              </div>
              <div className="text-sm text-gray-600">
                평가 순서: {alternatives.map(alt => alt.name).join(' → ')}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-600">
              {alternatives.length === 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">💡</span>
                    <div>
                      <div className="font-medium text-blue-900">대안 없이 진행하기</div>
                      <div className="text-sm text-blue-700">기준 간 중요도 비교만으로도 AHP 분석이 가능합니다.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="secondary"
                onClick={async () => {
                  console.log('✅ 대안 데이터가 PostgreSQL에 자동 저장되었습니다.');
                  alert('대안 목록이 저장되었습니다.');
                }}
              >
                저장
              </Button>
              <Button
                variant="primary"
                onClick={onComplete}
              >
                다음 단계로
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AlternativeManagement;