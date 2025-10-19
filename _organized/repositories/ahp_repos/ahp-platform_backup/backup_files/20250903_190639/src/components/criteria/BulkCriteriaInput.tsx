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
      
      // 기존 기준과의 중복 검사
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

    // 파싱된 기준을 실제 Criterion 객체로 변환
    const convertedCriteria = convertParsedCriteria(parseResult.criteria);
    onImport(convertedCriteria);
  };

  const convertParsedCriteria = (parsedCriteria: any[]): Criterion[] => {
    const criteria: Criterion[] = [];
    const idMap = new Map<string, string>(); // level-index를 실제 ID로 매핑

    // 레벨별로 정렬
    parsedCriteria.sort((a, b) => a.level - b.level);

    parsedCriteria.forEach((parsed, index) => {
      const id = `criterion-${Date.now()}-${index}`;
      const levelKey = `${parsed.level}-${criteria.filter(c => c.level === parsed.level).length}`;
      idMap.set(levelKey, id);

      // 부모 ID 찾기
      let parent_id: string | null = null;
      if (parsed.level > 1) {
        // 이전 레벨에서 마지막으로 추가된 기준을 부모로 설정
        const parentCriteria = criteria.filter(c => c.level === parsed.level - 1);
        if (parentCriteria.length > 0) {
          parent_id = parentCriteria[parentCriteria.length - 1].id;
        }
      }

      const criterion: Criterion = {
        id,
        name: parsed.name,
        description: parsed.description,
        parent_id,
        level: parsed.level,
        children: [],
        weight: 1
      };

      criteria.push(criterion);
    });

    // 계층구조 구성
    return buildHierarchy(criteria);
  };

  const buildHierarchy = (flatCriteria: Criterion[]): Criterion[] => {
    const criteriaMap = new Map<string, Criterion>();
    const rootCriteria: Criterion[] = [];

    // 모든 기준을 맵에 저장
    flatCriteria.forEach(criterion => {
      criteriaMap.set(criterion.id, { ...criterion, children: [] });
    });

    // 계층구조 구성
    flatCriteria.forEach(criterion => {
      const criterionObj = criteriaMap.get(criterion.id)!;
      
      if (criterion.parent_id) {
        const parent = criteriaMap.get(criterion.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(criterionObj);
        }
      } else {
        rootCriteria.push(criterionObj);
      }
    });

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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <Card title="🗂️ 계층구조 일괄 입력">
          <div className="space-y-6">
            {/* 탭 메뉴 */}
            <div className="flex border-b">
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

            {activeTab === 'input' && (
              <div className="space-y-4">
                {/* 안내 메시지 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📋 지원하는 입력 형식</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>마크다운 리스트:</strong> - 또는 * 로 시작, 들여쓰기로 레벨 구분</li>
                    <li>• <strong>번호 매기기:</strong> 1., 1.1., 1-1. 등의 형식</li>
                    <li>• <strong>들여쓰기:</strong> 탭 또는 공백으로 계층 구분</li>
                    <li>• <strong>설명 추가:</strong> "기준명 - 설명", "기준명: 설명", "기준명 (설명)" 형식</li>
                    <li>• <strong>Excel 복사:</strong> 셀에서 복사한 내용을 그대로 붙여넣기 가능</li>
                  </ul>
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
- 기술적 요소
  - 성능 - 시스템의 처리 속도
  - 안정성 - 오류 발생률과 복구 능력
- 경제적 요소
  - 초기 비용
  - 운영 비용"
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
                        <h4 className="font-medium text-green-900 mb-2">
                          ✅ 분석 완료 ({parseResult.criteria.length}개 기준)
                        </h4>
                        <div className="text-sm text-green-700 space-y-1">
                          {parseResult.criteria.map((criterion: any, index: number) => (
                            <div key={index} className="flex items-center">
                              <span className="mr-2">
                                {'  '.repeat(criterion.level - 1)}
                                {criterion.level === 1 ? '📁' : 
                                 criterion.level === 2 ? '📂' : 
                                 criterion.level === 3 ? '📄' : 
                                 criterion.level === 4 ? '📝' : '🔹'}
                              </span>
                              <span className="font-medium">{criterion.name}</span>
                              {criterion.description && (
                                <span className="ml-2 text-green-600">- {criterion.description}</span>
                              )}
                            </div>
                          ))}
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
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">입력 형식 예제</h3>
                  <p className="text-gray-600 text-sm">
                    아래 예제를 클릭하면 입력창에 자동으로 복사됩니다.
                  </p>
                </div>

                <div className="grid gap-4">
                  {Object.entries(exampleTexts).map(([key, text]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {key === 'markdown' && '📝 마크다운 리스트 형식'}
                          {key === 'numbered' && '🔢 번호 매기기 형식'}
                          {key === 'indented' && '📐 들여쓰기 형식'}
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => insertExample(key)}
                        >
                          사용하기
                        </Button>
                      </div>
                      <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                        {text}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
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