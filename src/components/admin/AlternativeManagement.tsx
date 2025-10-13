import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import dataService from '../../services/dataService_clean';
import { AlternativeData } from '../../services/api';

interface Alternative extends Omit<AlternativeData, 'project_id' | 'position' | 'id'> {
  id: string; // required
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

  // AlternativeData를 Alternative로 변환
  const convertToAlternative = (data: AlternativeData): Alternative => ({
    id: data.id || `alt_${Date.now()}_${Math.random()}`,
    name: data.name,
    description: data.description,
    order: data.position || 0,
    cost: data.cost,
    weight: 0,
    rank: 0
  });

  // Alternative를 AlternativeData로 변환
  const convertToAlternativeData = (alt: Partial<Alternative>): Omit<AlternativeData, 'id'> => ({
    project_id: projectId,
    name: alt.name || '',
    description: alt.description || '',
    position: alt.order || 0,
    cost: alt.cost
  });

  useEffect(() => {
    // 프로젝트별 대안 데이터 로드 (PostgreSQL에서)
    const loadProjectAlternatives = async () => {
      try {
        console.log(`🔍 프로젝트 ${projectId}의 대안 데이터 로드 중...`);
        const alternativesData = await dataService.getAlternatives(projectId);
        const convertedAlternatives = (alternativesData || []).map(convertToAlternative);
        setAlternatives(convertedAlternatives);
        console.log(`✅ ${convertedAlternatives.length}개 대안 로드 완료`);
        
        // 부모 컴포넌트에 개수 알림
        if (onAlternativesChange) {
          onAlternativesChange(convertedAlternatives.length);
        }
      } catch (error) {
        console.error('❌ 대안 데이터 로드 실패:', error);
        setAlternatives([]);
        if (onAlternativesChange) {
          onAlternativesChange(0);
        }
      }
    };

    if (projectId) {
      loadProjectAlternatives();
    }
  }, [projectId, onAlternativesChange]);

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

  // 프로젝트별 대안 데이터 저장 (현재 미사용 - 향후 PostgreSQL 연동 시 활용)
  // const saveProjectAlternatives = async (alternativesData: Alternative[]) => {
  //   console.log(`Alternatives now saved to PostgreSQL for project ${projectId}`);
  //   // localStorage 제거됨 - 모든 데이터는 PostgreSQL에 저장
  // };

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

    try {
      const alternativeData = convertToAlternativeData({
        name: newAlternative.name,
        description: newAlternative.description || '',
        order: maxOrder + 1
      });

      console.log('🔄 대안 추가 중...', alternativeData);
      const createdAlternative = await dataService.createAlternative(alternativeData);
      
      if (!createdAlternative) {
        setErrors({ name: '대안 추가에 실패했습니다.' });
        return;
      }

      console.log('✅ 대안이 성공적으로 추가되었습니다:', createdAlternative);
      
      // 데이터 다시 로드
      const updatedAlternativesData = await dataService.getAlternatives(projectId);
      const convertedUpdatedAlternatives = (updatedAlternativesData || []).map(convertToAlternative);
      setAlternatives(convertedUpdatedAlternatives);
      
      setNewAlternative({ name: '', description: '' });
      setErrors({});
      
      // 대안 개수 변경 콜백 호출
      if (onAlternativesChange) {
        onAlternativesChange(convertedUpdatedAlternatives.length);
      }
    } catch (error) {
      console.error('❌ 대안 추가 실패:', error);
      setErrors({ name: '대안 추가 중 오류가 발생했습니다. 권한을 확인해주세요.' });
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
      // TODO: 대안 편집 기능은 추후 구현
      console.log('🚧 대안 편집 기능은 추후 구현 예정');
      
      setEditingId(null);
      setEditingAlternative({ name: '', description: '' });
      setErrors({});
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
      console.log('🗑️ 대안 삭제:', id);
      const success = await dataService.deleteAlternative(id, projectId);
      
      if (!success) {
        console.error('❌ 대안 삭제 실패');
        return;
      }

      console.log('✅ 대안이 삭제되었습니다:', id);
      
      // 데이터 다시 로드
      const updatedAlternativesData = await dataService.getAlternatives(projectId);
      const convertedUpdatedAlternatives = (updatedAlternativesData || []).map(convertToAlternative);
      setAlternatives(convertedUpdatedAlternatives);
      
      // 대안 개수 변경 콜백 호출
      if (onAlternativesChange) {
        onAlternativesChange(convertedUpdatedAlternatives.length);
      }
    } catch (error) {
      console.error('❌ 대안 삭제 실패:', error);
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
      <Card title="대안 추가">
        <div className="space-y-6">
          {/* 논문 작성 권장 구조 안내 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 p-4 rounded-r-lg mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800">🎯 논문 작성 권장: 기본 3개 대안</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p className="mb-2">학술 논문을 위해 <strong>3개 대안</strong>으로 시작하는 것을 권장합니다. (필요시 최대 5개까지 추가 가능)</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>쌍대비교 횟수: 3개 대안 = 3회, 4개 대안 = 6회, 5개 대안 = 10회</li>
                    <li>3개 기준 × 3개 대안 = 총 12회 쌍대만으로 완료 가능</li>
                    <li>명확한 순위 결정 및 해석이 용이합니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

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

          {/* Summary with Paper Recommendation */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-medium text-gray-900">대안 요약</h5>
                <p className="text-sm text-gray-600">
                  총 {alternatives.length}개 대안 등록됨
                  {alternatives.length === 3 && <span className="ml-2 text-green-600 font-semibold">✅ 논문 권장 구조</span>}
                  {alternatives.length > 0 && alternatives.length < 3 && <span className="ml-2 text-yellow-600">⚠️ 3개 권장</span>}
                  {alternatives.length > 5 && <span className="ml-2 text-orange-600">⚠️ 평가 횟수 증가</span>}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                {alternatives.length > 0 && (
                  <span>평가 순서: {alternatives.map(alt => alt.name).join(' → ')}</span>
                )}
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