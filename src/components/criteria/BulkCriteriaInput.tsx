import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import TextParser from '../../utils/textParser';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  children?: Criterion[];
  weight?: number;
  order?: number;
}

interface BulkCriteriaInputProps {
  onImport: (criteria: Criterion[]) => void;
  onCancel: () => void;
  existingCriteria: Criterion[];
}

const BulkCriteriaInput: React.FC<BulkCriteriaInputProps> = ({
  onImport,
  onCancel,
  existingCriteria
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'input' | 'examples'>('input');
  const [parseResult, setParseResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = () => {
    if (!inputText.trim()) {
      setParseResult({
        success: false,
        criteria: [],
        errors: ['입력된 텍스트가 없습니다.']
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = TextParser.parseText(inputText);
      
      // 파싱 결과 디버깅
      console.log('📝 파싱 결과:', {
        total: result.criteria.length,
        byLevel: result.criteria.reduce((acc, c) => {
          acc[c.level] = (acc[c.level] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        details: result.criteria.map(c => ({
          name: c.name,
          level: c.level,
          description: c.description
        }))
      });
      
      // 기존 기준과의 중복 검사 (기존 기준이 있을 때만)
      if (existingCriteria && existingCriteria.length > 0) {
        const existingNames = getAllCriteria(existingCriteria).map(c => c.name.toLowerCase());
        const duplicates = result.criteria.filter(c => 
          existingNames.includes(c.name.toLowerCase())
        );
        
        if (duplicates.length > 0) {
          result.errors.push(
            `기존 기준과 중복: ${duplicates.map(d => d.name).join(', ')}`
          );
          result.success = false;
        }
      }
      
      setParseResult(result);
    } catch (error) {
      setParseResult({
        success: false,
        criteria: [],
        errors: [`파싱 중 오류가 발생했습니다: ${error}`]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (!parseResult || !parseResult.success) return;

    // 파싱된 기준을 실제 Criterion 객체로 변환 (평면 구조로)
    const convertedCriteria = convertParsedCriteriaFlat(parseResult.criteria);
    
    console.log('✅ 변환된 기준:', {
      total: convertedCriteria.length,
      flatList: convertedCriteria
    });
    
    // 평면 구조의 전체 기준 리스트를 import
    onImport(convertedCriteria);
  };

  // 평면 구조로 변환 (CriteriaManagement에서 기대하는 형식)
  const convertParsedCriteriaFlat = (parsedCriteria: any[]): Criterion[] => {
    const allCriteria: Criterion[] = [];
    const levelParentMap: Map<number, Criterion> = new Map();
    
    // 원본 순서대로 처리
    parsedCriteria.forEach((parsed, index) => {
      const id = `criterion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 부모 찾기: 현재 레벨보다 1 낮은 레벨의 마지막 노드
      let parent_id: string | null = null;
      if (parsed.level > 1) {
        const parentLevel = parsed.level - 1;
        const parentNode = levelParentMap.get(parentLevel);
        if (parentNode) {
          parent_id = parentNode.id;
        }
      }
      
      const criterion: Criterion = {
        id,
        name: parsed.name,
        description: parsed.description,
        parent_id,
        level: parsed.level,
        children: undefined, // 평면 구조이므로 children 없음
        weight: 1,
        order: index + 1
      };
      
      allCriteria.push(criterion);
      
      // 현재 레벨의 마지막 노드로 업데이트 (다음 같은/낮은 레벨의 부모가 될 수 있음)
      levelParentMap.set(parsed.level, criterion);
      
      // 더 높은 레벨들은 제거 (더 이상 부모가 될 수 없음)
      for (let level = parsed.level + 1; level <= 5; level++) {
        levelParentMap.delete(level);
      }
    });
    
    // 평면 구조 그대로 반환
    return allCriteria;
  };

  // 계층구조로 변환 (미리보기용)
  const convertParsedCriteria = (parsedCriteria: any[]): Criterion[] => {
    const flatCriteria = convertParsedCriteriaFlat(parsedCriteria);
    return buildHierarchy(flatCriteria);
  };

  const buildHierarchy = (flatCriteria: Criterion[]): Criterion[] => {
    const criteriaMap = new Map<string, Criterion>();
    const rootCriteria: Criterion[] = [];

    // 모든 기준을 맵에 저장 (children 배열 초기화)
    flatCriteria.forEach(criterion => {
      criteriaMap.set(criterion.id, { 
        ...criterion, 
        children: [] 
      });
    });

    // 계층구조 구성
    flatCriteria.forEach(criterion => {
      const criterionObj = criteriaMap.get(criterion.id)!;
      
      if (criterion.parent_id && criteriaMap.has(criterion.parent_id)) {
        // 부모가 있는 경우 부모의 children에 추가
        const parent = criteriaMap.get(criterion.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(criterionObj);
        }
      } else {
        // 부모가 없거나 레벨 1인 경우 루트로 처리
        rootCriteria.push(criterionObj);
      }
    });

    // 정렬
    const sortByOrder = (items: Criterion[]) => {
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortByOrder(item.children);
        }
      });
    };
    
    sortByOrder(rootCriteria);
    return rootCriteria;
  };

  const getAllCriteria = (criteriaList: Criterion[]): Criterion[] => {
    const all: Criterion[] = [];
    const traverse = (items: Criterion[]) => {
      items.forEach(item => {
        all.push(item);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(criteriaList);
    return all;
  };

  const exampleTexts = TextParser.getExampleTexts();

  const insertExample = (exampleKey: string) => {
    setInputText(exampleTexts[exampleKey]);
    setActiveTab('input');
    setParseResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <Card title="🗂️ 계층구조 일괄 입력">
          <div className="flex flex-col h-full max-h-[80vh]">
            {/* 탭 메뉴 - 고정 */}
            <div className="flex border-b flex-shrink-0">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'input'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('input')}
              >
                텍스트 입력
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'examples'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('examples')}
              >
                입력 예제
              </button>
            </div>

            {/* 스크롤 가능한 콘텐츠 영역 */}
            <div className="flex-1 overflow-y-scroll p-6 space-y-6 pb-20">

            {activeTab === 'input' && (
              <div className="space-y-4">
                {/* 안내 메시지 - 더 자세하게 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">📋 계층구조 입력 가이드</h4>
                  <div className="text-sm text-blue-700 space-y-3">
                    <div>
                      <strong>📝 마크다운 리스트 형식</strong>
                      <div className="ml-4 mt-1 font-mono text-xs bg-white p-2 rounded">
                        - 상위기준<br/>
                        &nbsp;&nbsp;- 하위기준 (2칸 들여쓰기)<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;- 세부기준 (4칸 들여쓰기)
                      </div>
                    </div>
                    <div>
                      <strong>🔢 번호 매기기 형식</strong>
                      <div className="ml-4 mt-1 font-mono text-xs bg-white p-2 rounded">
                        1. 상위기준<br/>
                        &nbsp;&nbsp;1.1. 하위기준<br/>
                        &nbsp;&nbsp;1.2. 하위기준
                      </div>
                    </div>
                    <div>
                      <strong>📐 들여쓰기 형식</strong>
                      <div className="ml-4 mt-1 font-mono text-xs bg-white p-2 rounded">
                        상위기준<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;하위기준 (4칸 들여쓰기)<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;세부기준 (8칸 들여쓰기)
                      </div>
                    </div>
                    <div className="text-yellow-700 bg-yellow-50 p-2 rounded">
                      💡 <strong>중요:</strong> 들여쓰기는 정확한 공백 수가 중요합니다!<br/>
                      • 마크다운: 2칸씩 증가<br/>
                      • 들여쓰기: 4칸씩 증가
                    </div>
                  </div>
                </div>

                {/* 텍스트 입력 영역 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    계층구조 텍스트 입력
                  </label>
                  <textarea
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="여기에 계층구조를 입력하세요...

예시:
- 기술 품질
  - 성능 - 시스템 처리 속도와 응답 시간
  - 안정성 - 오류 발생률과 복구 능력
  - 확장성 - 향후 기능 추가 및 규모 확대 가능성
- 경제성
  - 초기 비용 - 도입 및 구축에 필요한 투자 비용
  - 운영 비용 - 월별 유지보수 및 관리 비용"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>

                {/* 파싱 버튼 */}
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    onClick={handleParse}
                    disabled={!inputText.trim() || isProcessing}
                  >
                    {isProcessing ? '분석 중...' : '📊 구조 분석'}
                  </Button>
                </div>

                {/* 파싱 결과 */}
                {parseResult && (
                  <div className="space-y-4">
                    {parseResult.success ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-3">
                          ✅ 분석 완료 ({parseResult.criteria.length}개 기준)
                        </h4>
                        <div className="space-y-2">
                          {/* 레벨별 요약 */}
                          <div className="text-sm text-green-700 mb-3">
                            {(() => {
                              const levelCounts = parseResult.criteria.reduce((acc: any, c: any) => {
                                acc[c.level] = (acc[c.level] || 0) + 1;
                                return acc;
                              }, {});
                              return Object.entries(levelCounts).map(([level, count]) => (
                                <span key={level} className="inline-block mr-4">
                                  {`레벨 ${level}: ${count}개`}
                                </span>
                              ));
                            })()}
                          </div>
                          {/* 계층구조 표시 */}
                          <div className="bg-white rounded p-3 text-sm">
                            {parseResult.criteria.map((criterion: any, index: number) => (
                              <div key={index} className="py-1">
                                <span style={{ paddingLeft: `${(criterion.level - 1) * 20}px` }}>
                                  {criterion.level === 1 && '📁 '}
                                  {criterion.level === 2 && '📂 '}
                                  {criterion.level === 3 && '📄 '}
                                  {criterion.level === 4 && '📝 '}
                                  {criterion.level >= 5 && '🔹 '}
                                  <span className="font-medium">{criterion.name}</span>
                                  {criterion.description && (
                                    <span className="ml-2 text-gray-600">- {criterion.description}</span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">❌ 분석 실패</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {parseResult.errors.map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="space-y-6 pb-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">입력 형식 예제</h3>
                  <p className="text-gray-600 text-sm">
                    아래 예제를 클릭하면 입력창에 자동으로 복사됩니다.
                  </p>
                </div>

                <div className="grid gap-4 mb-8">
                  {Object.entries(exampleTexts).map(([key, text]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {key === 'markdown' && '📝 마크다운 리스트 형식 (2칸씩 들여쓰기)'}
                          {key === 'numbered' && '🔢 번호 매기기 형식'}
                          {key === 'indented' && '📐 들여쓰기 형식 (4칸씩 들여쓰기)'}
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => insertExample(key)}
                        >
                          사용하기
                        </Button>
                      </div>
                      <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre">
                        {text}
                      </pre>
                    </div>
                  ))}
                </div>
                
                {/* 하단 여백 확보를 위한 추가 공간 */}
                <div className="h-16"></div>
              </div>
            )}
            </div>

            {/* 액션 버튼 - 고정 영역 */}
            <div className="flex justify-end space-x-3 pt-4 px-6 pb-6 border-t flex-shrink-0 bg-white">
              <Button variant="secondary" onClick={onCancel}>
                취소
              </Button>
              {parseResult && parseResult.success && (
                <Button variant="primary" onClick={handleImport}>
                  ✨ {parseResult.criteria.length}개 기준 추가
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BulkCriteriaInput;